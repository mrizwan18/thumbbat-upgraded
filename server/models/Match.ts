import mongoose, { Schema, Types } from "mongoose";

const matchSchema = new Schema(
  {
    roomId: { type: String, index: true },

    players: [
      {
        user: { type: Types.ObjectId, ref: "User", default: null },
        username: { type: String, required: true },
        socketId: { type: String, required: true },
      },
    ],

    // final numbers
    aScore: { type: Number, required: true, default: 0 },
    bScore: { type: Number, required: true, default: 0 },
    target: { type: Number, default: null },

    // winner/loser
    winner: {
      user: { type: Types.ObjectId, ref: "User", default: null },
      username: { type: String },
    },
    loser: {
      user: { type: Types.ObjectId, ref: "User", default: null },
      username: { type: String },
    },

    // 'chaseComplete' | 'wicketSecondInnings' | 'walkover' | 'timeout' | 'manual'
    reason: { type: String, default: "chaseComplete" },

    firstInningScore: { type: Number, default: null },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Match || mongoose.model("Match", matchSchema);