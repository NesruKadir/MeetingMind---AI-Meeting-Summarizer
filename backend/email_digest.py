import os
import httpx
from dotenv import load_dotenv

load_dotenv()

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
FROM_EMAIL = os.getenv("FROM_EMAIL", "summaries@yourapp.com")


def build_personal_digest(person: str, action_items: list, summary: str, decisions: list) -> str:
    my_items = [ai for ai in action_items if ai["person"].lower() == person.lower()]

    if my_items:
        rows = "".join(
            f"<li><strong>{ai['task']}</strong>"
            + (f" — <em>{ai['deadline']}</em>" if ai.get("deadline") else "")
            + "</li>"
            for ai in my_items
        )
        items_html = f"<h3>Your Action Items</h3><ul>{rows}</ul>"
    else:
        items_html = "<p><em>No action items assigned to you in this meeting.</em></p>"

    decisions_html = "".join(f"<li>{d}</li>" for d in decisions)

    return f"""
    <html><body style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px;">
      <h2>Meeting Summary</h2>
      <p>{summary}</p>
      {items_html}
      <h3>Key Decisions</h3>
      <ul>{decisions_html}</ul>
      <hr>
      <p style="color: #888; font-size: 12px;">Sent by MeetingMind</p>
    </body></html>
    """


async def send_digest(to_email: str, person_name: str, meeting_title: str, action_items: list, summary: str, decisions: list):
    html = build_personal_digest(person_name, action_items, summary, decisions)

    payload = {
        "personalizations": [{"to": [{"email": to_email}]}],
        "from": {"email": FROM_EMAIL},
        "subject": f"Meeting Summary: {meeting_title}",
        "content": [{"type": "text/html", "value": html}],
    }

    print(f"Sending email to {to_email} from {FROM_EMAIL}")
    print(f"API Key present: {bool(SENDGRID_API_KEY)}")

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.sendgrid.com/v3/mail/send",
            headers={"Authorization": f"Bearer {SENDGRID_API_KEY}", "Content-Type": "application/json"},
            json=payload,
        )
        print(f"SendGrid response: {response.status_code} {response.text}")
        response.raise_for_status()