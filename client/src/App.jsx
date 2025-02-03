import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Confirm from "./pages/Confirm";
import Game from "./pages/Game";
import Leaderboard from "./pages/Leaderboard";

function App() {
  return (
    <Router>
      <div className="bg-gray-900 text-white min-h-screen">
        {/* ✅ Navbar is now globally included */}
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/confirm" element={<Confirm />} />
          <Route path="/login" element={<Login />} />
          <Route path="/game" element={<Game />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;