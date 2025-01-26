import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const Leaderboard = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch leaderboard data
    axios
      .get("https://thumbbat-upgraded.onrender.com/api/leaderboard")
      .then((res) => {
        setPlayers(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching leaderboard data", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="loader">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white px-6 py-12">
      <motion.h2
        className="text-3xl md:text-4xl font-semibold text-white mb-6"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        🏆 Leaderboard
      </motion.h2>

      <motion.ul
        className="w-full max-w-3xl bg-gray-700 p-8 rounded-lg shadow-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {players.map((player, index) => (
          <motion.li
            key={index}
            className={`flex items-center justify-between p-4 mb-4 rounded-md border ${
              index < 3
                ? "border-yellow-400 bg-gray-800 text-white"
                : "border-gray-600 bg-gray-700 text-gray-300"
            }`}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center space-x-4">
              <div
                className={`w-8 h-8 rounded-full ${
                  index < 3 ? "bg-yellow-400" : "bg-gray-600"
                } flex items-center justify-center`}
              >
                <span className="font-semibold text-xl">{index + 1}</span>
              </div>
              <span className="text-lg font-medium">{player.username}</span>
            </div>
            <span className="text-xl font-semibold">{player.highScore}</span>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
};

export default Leaderboard;