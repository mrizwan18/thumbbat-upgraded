"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const checkLoginStatus = () => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  };

  useEffect(() => {
    // Check initially
    checkLoginStatus();

    // Add event listener for storage changes
    window.addEventListener("storage", checkLoginStatus);

    // Add custom event listener for login
    const handleLoginEvent = () => checkLoginStatus();
    window.addEventListener("login-success", handleLoginEvent);

    return () => {
      window.removeEventListener("storage", checkLoginStatus);
      window.removeEventListener("login-success", handleLoginEvent);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");

    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";

    router.push("/login");
    setIsLoggedIn(false);
  };

  return (
    <div className="fixed w-full top-0 z-50">
      <div className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto flex justify-between items-center px-6 py-4">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-extrabold text-white hover:text-blue-400 transition-colors"
          >
            ThumbBat
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-300 hover:text-white transition-colors relative group py-2"
            >
              <span>Home</span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform"></span>
            </Link>
            <Link
              href="/game"
              className="text-gray-300 hover:text-white transition-colors relative group py-2"
            >
              <span>Play</span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform"></span>
            </Link>
            <Link
              href="/leaderboard"
              className="text-gray-300 hover:text-white transition-colors relative group py-2"
            >
              <span>Leaderboard</span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform"></span>
            </Link>

            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-white hover:text-blue-400 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed inset-x-0 top-[73px] bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 shadow-lg transition-all duration-300 ease-in-out ${
          isMenuOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div className="flex flex-col items-center py-6 space-y-6">
          <Link
            href="/"
            className="text-white text-lg hover:text-blue-400 transition-colors w-full text-center"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/game"
            className="text-white text-lg hover:text-blue-400 transition-colors w-full text-center"
            onClick={() => setIsMenuOpen(false)}
          >
            Play
          </Link>
          <Link
            href="/leaderboard"
            className="text-white text-lg hover:text-blue-400 transition-colors w-full text-center"
            onClick={() => setIsMenuOpen(false)}
          >
            Leaderboard
          </Link>

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="px-8 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
