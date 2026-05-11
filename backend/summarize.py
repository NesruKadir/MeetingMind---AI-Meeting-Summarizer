import os
import json
import anthropic
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = """You are an expert meeting analyst. Given a meeting transcript, extract structured information and return it as valid JSON only — no markdown, no explanation, just the JSON object.

The JSON must follow this exact schema:
{
  "summary": "2-4 sentence overview of the entire meeting",
  "decisions": ["decision 1", "decision 2"],
  "action_items": [
    {"person": "Name", "task": "what they need to do", "deadline": "by when or null"}
  ],
  "topics": ["topic 1", "topic 2"]
}

Rules:
- Only include action items where a specific person is responsible
- Decisions are concrete conclusions the group agreed on
- If a name is unclear, use their role (e.g., "Engineering Lead")
- deadline should be a string like "by Friday" or "next sprint" or null if not mentioned"""


async def summarize_transcript(transcript: str) -> dict:
    """Send transcript to Claude and return structured summary."""
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2048,
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": f"Here is the meeting transcript:\n\n{transcript}",
            }
        ],
    )

    raw = message.content[0].text.strip()

    # Strip markdown code fences if Claude adds them
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    return json.loads(raw)