import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/landingPage";
import MeetingPage from "./pages/meeting";

import GuestNameEntry from "./components/GuestNameEntry";
import VideoMeet from "./components/VideoMeet/VideoMeet";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/meeting" element={<MeetingPage />} />
        <Route path="/guest/name" element={<GuestNameEntry />} />
        <Route path="/meeting/:meetingId" element={<VideoMeet />} />
      </Routes>
    </Router>
  );
}

export default App;
