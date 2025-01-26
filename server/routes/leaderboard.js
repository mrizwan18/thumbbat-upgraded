const express = require("express");
const Score = require("../models/Score");
const User = require("../models/User");

const router = express.Router();

router.get("/", async (req, res) => {
  const leaderboard = await User.find().sort({ highScore: -1 }).limit(10);
  res.json(leaderboard);
});

module.exports = router;