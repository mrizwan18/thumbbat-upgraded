import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <nav className="flex justify-between items-center px-6 py-3 bg-gray-800 text-white">
      <h2 className="text-xl font-bold">ThumbBat</h2>
      <div>
        <Link to="/" className="mr-4 hover:text-blue-400">Home</Link>
        <Link to="/game" className="mr-4 hover:text-blue-400">Play</Link>
        <Link to="/leaderboard" className="mr-4 hover:text-blue-400">Leaderboard</Link>

        {isLoggedIn ? (
          <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded hover:bg-red-600">
            Logout
          </button>
        ) : (
          <Link to="/login" className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;