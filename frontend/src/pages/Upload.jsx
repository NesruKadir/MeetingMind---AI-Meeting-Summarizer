import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadMeeting } from "../api";

export default function Upload() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [attendees, setAttendees] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file || !title) return;

    setLoading(true);
    setError("");

    const fd = new FormData();
    fd.append("title", title);
    fd.append("attendees", attendees);
    fd.append("file", file);

    try {
      const result = await uploadMeeting(fd);
      navigate(`/meeting/${result.id}`);
    } catch (err) {
      setError("Something went wrong. Check your API keys and try again.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-16 p-8 bg-white rounded-2xl shadow">
      <h1 className="text-2xl font-bold mb-2">Upload a Meeting Recording</h1>
      <p className="text-gray-500 mb-6 text-sm">
        Supports .mp3, .mp4, .m4a, .wav, .webm — max 25 MB (Whisper limit)
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Meeting Title</label>
          <input
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Q2 Planning Sync"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Attendees{" "}
            <span className="text-gray-400 font-normal">
              (Name:email, comma-separated)
            </span>
          </label>
          <input
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Alice:alice@co.com, Bob:bob@co.com"
            value={attendees}
            onChange={(e) => setAttendees(e.target.value)}
          />
          <p className="text-xs text-gray-400 mt-1">
            Each person gets a personalized digest with only their action items.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Audio / Video File</label>
          <input
            type="file"
            accept=".mp3,.mp4,.m4a,.wav,.webm,.ogg"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? "Processing… this takes 1-2 minutes" : "Upload & Summarize"}
        </button>
      </form>
    </div>
  );
}
