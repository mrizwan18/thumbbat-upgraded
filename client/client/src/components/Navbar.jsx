import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-gray-800 text-white shadow-md">
      <div className="max-w-screen-xl mx-auto px-6 py-4 flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-wide">ThumbBat</h2>

        {/* Hamburger Menu Button */}
        <button
          className="lg:hidden text-white focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </button>

        {/* Desktop Menu */}
        <div className={`hidden lg:flex space-x-8 items-center`}>
          <Link to="/" className="text-lg hover:text-blue-400 transition-colors duration-200">
            Home
          </Link>
          <Link to="/game" className="text-lg hover:text-blue-400 transition-colors duration-200">
            Play
          </Link>
          <Link to="/leaderboard" className="text-lg hover:text-blue-400 transition-colors duration-200">
            Leaderboard
          </Link>

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="bg-red-500 px-4 py-2 rounded-lg text-lg hover:bg-red-600 transition duration-200"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="bg-blue-500 px-4 py-2 rounded-lg text-lg hover:bg-blue-600 transition duration-200"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden transition-all duration-300 ${
            isMenuOpen ? "block" : "hidden"
          } absolute top-20 left-0 w-full bg-gray-800 p-6 space-y-4`}
        >
          <Link
            to="/"
            className="block text-lg hover:text-blue-400 transition-colors duration-200 mb-4"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/game"
            className="block text-lg hover:text-blue-400 transition-colors duration-200 mb-4"
            onClick={() => setIsMenuOpen(false)}
          >
            Play
          </Link>
          <Link
            to="/leaderboard"
            className="block text-lg hover:text-blue-400 transition-colors duration-200 mb-4"
            onClick={() => setIsMenuOpen(false)}
          >
            Leaderboard
          </Link>

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="bg-red-500 px-4 py-2 rounded-lg text-lg hover:bg-red-600 transition duration-200 w-full mb-4"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="bg-blue-500 px-4 py-2 rounded-lg text-lg hover:bg-blue-600 transition duration-200 w-full mb-4"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;