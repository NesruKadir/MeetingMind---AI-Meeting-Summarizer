import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listMeetings } from "../api";

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function Dashboard() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listMeetings()
      .then(setMeetings)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center mt-20 text-gray-400">Loading…</p>;

  return (
    <div className="max-w-2xl mx-auto mt-12 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Past Meetings</h1>
        <Link
          to="/upload"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
        >
          + New Meeting
        </Link>
      </div>

      {meetings.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">No meetings yet.</p>
          <Link to="/upload" className="text-blue-500 underline text-sm mt-2 block">
            Upload your first recording
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {meetings.map((m) => (
            <Link
              key={m.id}
              to={`/meeting/${m.id}`}
              className="block bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition border border-gray-100"
            >
              <div className="flex justify-between items-start">
                <h2 className="font-semibold text-gray-900">{m.title}</h2>
                <span className="text-xs text-gray-400 ml-4 shrink-0">{timeAgo(m.created_at)}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{m.summary}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
