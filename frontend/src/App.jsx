import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import MeetingDetail from "./pages/MeetingDetail";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b px-6 py-4 flex items-center gap-3 shadow-sm">
          <span className="text-lg font-bold text-blue-600">MeetingMind</span>
          <span className="text-gray-300">|</span>
          <span className="text-sm text-gray-400">AI Meeting Summarizer</span>
        </nav>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/meeting/:id" element={<MeetingDetail />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
