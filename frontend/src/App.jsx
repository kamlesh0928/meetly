import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/landingPage";
import MeetingPage from "./pages/meeting";
import VideoMeet from "./pages/videoMeet";
import History from "./pages/history";

import GuestNameEnter from "./components/GuestNameEnter";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/meeting" element={<MeetingPage />} />
        <Route path="/guest/name" element={<GuestNameEnter />} />
        <Route path="/meeting/:meetingId" element={<VideoMeet />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </Router>
  );
}

export default App;
