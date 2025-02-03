const express = require("express");
const Score = require("../models/Score");
const User = require("../models/User");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const leaderboard = await User.find({ highScore: { $gt: 0 } })
                                  .sort({ highScore: -1 })
                                  .limit(50)
                                  .select('username highScore winPercentage');

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong while fetching the leaderboard." });
  }
});

module.exports = router;