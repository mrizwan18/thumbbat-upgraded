"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const Leaderboard = () => {
  const [players, setPlayers] = useState<
    {
      username: string;
      highScore: number;
      winPercentage: number;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch leaderboard data
    axios
      .get("/api/leaderboard")
      .then((res) => {
        const leaderboardData = Array.isArray(res.data.data)
          ? res.data.data
          : [];
        setPlayers(leaderboardData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching leaderboard data", err);
        setLoading(false);
        setPlayers([]); // Set empty array on error
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
        className="text-4xl font-semibold text-white mb-6"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        🏆 Leaderboard
      </motion.h2>

      <motion.div
        className="w-full max-w-4xl bg-gray-700 p-8 rounded-lg shadow-md overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{ maxHeight: "70vh" }} // Limit height for scrollable area
      >
        <table className="w-full table-auto">
          <thead>
            <tr className="text-lg text-white font-bold">
              <th className="p-3 text-left">Rank</th>
              <th className="p-3 text-left">Username</th>
              <th className="p-3 text-left">High Score</th>
              <th className="p-3 text-left">Win Percentage</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(players) &&
              players.slice(0, 10).map((player, index) => {
                let bannerClass = "";
                if (index === 0)
                  bannerClass =
                    "bg-gradient-to-r from-yellow-400 to-yellow-600";
                else if (index === 1)
                  bannerClass = "bg-gradient-to-r from-gray-400 to-gray-600";
                else if (index === 2)
                  bannerClass =
                    "bg-gradient-to-r from-orange-400 to-orange-600";

                return (
                  <motion.tr
                    key={index}
                    className={`${
                      index < 3
                        ? "bg-gray-800 text-white"
                        : "bg-gray-700 text-gray-300"
                    } border-b hover:bg-gray-600`}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <td className="p-4">
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-semibold text-xl ${bannerClass}`}
                      >
                        {index + 1}
                      </div>
                    </td>
                    <td className="p-4">{player.username}</td>
                    <td className="p-4 text-center">{player.highScore}</td>
                    <td className="p-4 text-center">{player.winPercentage}%</td>
                  </motion.tr>
                );
              })}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};

export default Leaderboard;
