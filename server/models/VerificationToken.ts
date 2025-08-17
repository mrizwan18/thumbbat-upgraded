// server/models/VerificationToken.ts
import mongoose, { Schema, Types } from "mongoose";

const VerificationTokenSchema = new Schema({
  userId:   { type: Schema.Types.ObjectId, ref: "User", required: true },
  email:    { type: String, required: true },
  tokenHash:{ type: String, required: true, unique: true },
  expiresAt:{ type: Date, required: true }, // TTL index
  usedAt:   { type: Date, default: null },
});

// TTL based on the 'expiresAt' field:
VerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.VerificationToken
  || mongoose.model("VerificationToken", VerificationTokenSchema);