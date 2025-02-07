import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  score: Number,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Score || mongoose.model("Score", scoreSchema);
