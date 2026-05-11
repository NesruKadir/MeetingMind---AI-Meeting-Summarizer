import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getMeeting } from "../api";

function Badge({ text }) {
  return (
    <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
      {text}
    </span>
  );
}

export default function MeetingDetail() {
  const { id } = useParams();
  const [meeting, setMeeting] = useState(null);
  const [tab, setTab] = useState("overview");
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    getMeeting(id).then(setMeeting);
  }, [id]);

  if (!meeting) return <p className="text-center mt-20 text-gray-400">Loading…</p>;

  const tabs = ["overview", "decisions", "action items"];

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4 pb-20">
      <Link to="/" className="text-sm text-blue-500 hover:underline">← All meetings</Link>

      <h1 className="text-2xl font-bold mt-4 mb-1">{meeting.title}</h1>
      <p className="text-xs text-gray-400 mb-6">
        {new Date(meeting.created_at).toLocaleDateString("en-US", {
          weekday: "long", year: "numeric", month: "long", day: "numeric"
        })}
      </p>

      {/* Tabs */}
      <div className="flex gap-2 border-b mb-6">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 px-1 text-sm font-medium capitalize transition border-b-2 ${
              tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-700 mb-2">Summary</h2>
            <p className="text-gray-600 leading-relaxed">{meeting.summary}</p>
          </div>

          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="text-sm text-blue-500 hover:underline"
          >
            {showTranscript ? "Hide transcript" : "Show full transcript"}
          </button>
          {showTranscript && (
            <pre className="bg-gray-50 rounded-xl p-4 text-xs text-gray-600 whitespace-pre-wrap border border-gray-200 max-h-96 overflow-y-auto">
              {meeting.transcript}
            </pre>
          )}
        </div>
      )}

      {tab === "decisions" && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-700 mb-3">Key Decisions</h2>
          {meeting.decisions?.length ? (
            <ul className="space-y-2">
              {meeting.decisions.map((d, i) => (
                <li key={i} className="flex gap-3 items-start text-gray-600 text-sm">
                  <span className="text-blue-500 font-bold mt-0.5">✓</span>
                  {d}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">No decisions extracted.</p>
          )}
        </div>
      )}

      {tab === "action items" && (
        <div className="space-y-3">
          {meeting.action_items?.length ? (
            meeting.action_items.map((ai, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge text={ai.person} />
                    {ai.deadline && (
                      <span className="text-xs text-gray-400">{ai.deadline}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700">{ai.task}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-sm">No action items extracted.</p>
          )}
        </div>
      )}
    </div>
  );
}
