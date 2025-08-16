import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/landingPage";
import MeetingPage from "./pages/meeting";

import GuestNameEntry from "./components/GuestNameEntry";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/meeting" element={<MeetingPage />} />
        <Route path="/guest/name" element={<GuestNameEntry />} />
      </Routes>
    </Router>
  );
}

export default App;
