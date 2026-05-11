const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function uploadMeeting(formData) {
  const res = await fetch(`${BASE}/meetings/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function listMeetings() {
  const res = await fetch(`${BASE}/meetings`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getMeeting(id) {
  const res = await fetch(`${BASE}/meetings/${id}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
