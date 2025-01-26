import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/game"); // ✅ Redirect if logged in
    }
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">🔥 Multiplayer Game</h1>
      <p className="text-lg mb-6">Sign up and compete with friends!</p>
      <Link to="/login">
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md text-lg font-semibold">
          Get Started
        </button>
      </Link>
    </div>
  );
};

export default Home;