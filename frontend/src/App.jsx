import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/landingPage";
import EnterName from "./components/enterName";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/name" element={<EnterName />} />
      </Routes>
    </Router>
  );
}

export default App;
