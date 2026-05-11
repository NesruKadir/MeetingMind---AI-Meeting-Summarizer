import os
import shutil
import tempfile
from fastapi import FastAPI, File, Form, UploadFile, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db, init_db, Meeting
from transcribe import transcribe_audio
from summarize import summarize_transcript
from email_digest import send_digest

app = FastAPI(title="Meeting Summarizer API")

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    init_db()


@app.post("/meetings/upload")
async def upload_meeting(
    title: str = Form(...),
    attendees: str = Form(""),          # comma-separated "Name:email" pairs
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Accept an audio file, transcribe it, summarize it, send digests, and store the result."""

    # Parse attendees: "Alice:alice@co.com,Bob:bob@co.com"
    attendee_list = []
    if attendees.strip():
        for entry in attendees.split(","):
            parts = entry.strip().split(":")
            if len(parts) == 2:
                attendee_list.append({"name": parts[0].strip(), "email": parts[1].strip()})

    # Save upload to a temp file
    suffix = os.path.splitext(file.filename)[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        transcript = await transcribe_audio(tmp_path)
        result = await summarize_transcript(transcript)
    finally:
        os.unlink(tmp_path)

    meeting = Meeting(
        title=title,
        filename=file.filename,
        transcript=transcript,
        summary=result.get("summary"),
        decisions=result.get("decisions", []),
        action_items=result.get("action_items", []),
        attendees=[a["email"] for a in attendee_list],
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)

    # Send personalized digests
    for attendee in attendee_list:
        try:
            await send_digest(
                to_email=attendee["email"],
                person_name=attendee["name"],
                meeting_title=title,
                action_items=result.get("action_items", []),
                summary=result.get("summary", ""),
                decisions=result.get("decisions", []),
            )
        except Exception:
            pass  # Don't fail the request if one email bounces

    return {
        "id": meeting.id,
        "summary": meeting.summary,
        "decisions": meeting.decisions,
        "action_items": meeting.action_items,
        "topics": result.get("topics", []),
    }


@app.get("/meetings")
def list_meetings(db: Session = Depends(get_db)):
    meetings = db.query(Meeting).order_by(Meeting.created_at.desc()).all()
    return [
        {
            "id": m.id,
            "title": m.title,
            "summary": m.summary,
            "created_at": m.created_at.isoformat(),
        }
        for m in meetings
    ]


@app.get("/meetings/{meeting_id}")
def get_meeting(meeting_id: int, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return {
        "id": meeting.id,
        "title": meeting.title,
        "filename": meeting.filename,
        "summary": meeting.summary,
        "decisions": meeting.decisions,
        "action_items": meeting.action_items,
        "attendees": meeting.attendees,
        "transcript": meeting.transcript,
        "created_at": meeting.created_at.isoformat(),
    }
