# MeetingMind — AI Meeting Summarizer

Upload any meeting recording. Get back a structured summary, key decisions, action items by person, and personalized email digests sent to each attendee automatically.

**Stack:** Python + FastAPI · OpenAI Whisper · Claude API · PostgreSQL · React + Vite + Tailwind · SendGrid

---

## Project Structure

```
meeting-summarizer/
├── backend/
│   ├── main.py           # FastAPI app, routes
│   ├── transcribe.py     # Whisper audio → transcript
│   ├── summarize.py      # Claude transcript → structured summary
│   ├── email_digest.py   # SendGrid personalized emails
│   ├── database.py       # SQLAlchemy models + DB setup
│   ├── requirements.txt
│   └── .env.example      # Copy to .env and fill in keys
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Upload.jsx        # Upload page
    │   │   ├── Dashboard.jsx     # Past meetings list
    │   │   └── MeetingDetail.jsx # Summary / decisions / action items
    │   ├── App.jsx
    │   ├── api.js
    │   └── main.jsx
    └── package.json
```

---

## Setup (Step by Step)

### 1. Get your API keys

| Service | What it's for | Free tier |
|---|---|---|
| [OpenAI](https://platform.openai.com/api-keys) | Whisper transcription | Pay-per-use (~$0.006/min) |
| [Anthropic](https://console.anthropic.com/) | Claude summarization | Pay-per-use |
| [SendGrid](https://app.sendgrid.com/settings/api_keys) | Email digests | 100 emails/day free |

You also need **PostgreSQL** running locally. Install it from [postgresql.org](https://www.postgresql.org/download/) and create a database:
```sql
CREATE DATABASE meeting_summarizer;
```

---

### 2. Backend setup

```bash
cd meeting-summarizer/backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Set up your environment variables
copy .env.example .env
# Open .env and fill in your API keys

# Start the server
uvicorn main:app --reload
```

The API will be running at **http://localhost:8000**
Interactive docs at **http://localhost:8000/docs**

---

### 3. Frontend setup

Open a second terminal:

```bash
cd meeting-summarizer/frontend

npm install
npm run dev
```

The app will be running at **http://localhost:3000**

---

## How It Works

1. **Upload** — You drop in a `.mp3`, `.mp4`, `.m4a`, `.wav`, or `.webm` file with a title and attendee list (`Name:email` pairs)
2. **Transcribe** — The audio is sent to OpenAI Whisper and converted to text
3. **Summarize** — The transcript is sent to Claude with a structured prompt that extracts:
   - Overall meeting summary
   - Key decisions (things the group agreed on)
   - Action items tagged by person name + deadline
   - Topics discussed
4. **Store** — Everything is saved to PostgreSQL
5. **Email** — Each attendee gets a personalized digest showing only their action items + the full summary

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/meetings/upload` | Upload audio, transcribe, summarize, send emails |
| `GET` | `/meetings` | List all past meetings |
| `GET` | `/meetings/{id}` | Get full detail for one meeting |

---

## Deploying

- **Frontend** → [Vercel](https://vercel.com) (connect GitHub repo, select `frontend/` as root)
- **Backend** → [Railway](https://railway.app) (add Python service + PostgreSQL plugin)
- Update `BASE` in `frontend/src/api.js` to your Railway backend URL before deploying
