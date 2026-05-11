import os
import httpx
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


async def transcribe_audio(file_path: str) -> str:
    url = "https://api.openai.com/v1/audio/transcriptions"

    file_size = os.path.getsize(file_path)
    if file_size > 25 * 1024 * 1024:
        raise ValueError("File too large. Whisper limit is 25MB.")

    async with httpx.AsyncClient(timeout=300.0) as client:
        with open(file_path, "rb") as f:
            response = await client.post(
                url,
                headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
                data={"model": "whisper-1"},
                files={"file": (os.path.basename(file_path), f, "audio/mp4")},
            )
            if response.status_code != 200:
                raise Exception(f"Whisper error: {response.text}")
            return response.json()["text"]