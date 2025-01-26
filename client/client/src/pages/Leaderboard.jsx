import React, { useEffect, useState } from "react";
import axios from "axios";

const Leaderboard = () => {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/leaderboard").then((res) => {
      setPlayers(res.data);
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h2 className="text-4xl font-bold mb-6">🏆 Leaderboard</h2>
      <ul className="bg-gray-800 p-6 rounded-lg shadow-lg">
        {players.map((p, index) => (
          <li key={index} className="text-lg">
            {index + 1}. {p.username}: <span className="text-yellow-400">{p.highScore}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;