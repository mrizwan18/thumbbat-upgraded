// server/models/VerificationToken.ts
/**
 * @deprecated Only used by the deprecated email/password signup +
 * confirmation flow (src/app/api/auth/{signup,confirm}) — ThumbBat now
 * only supports Google sign-in. Left in place rather than deleted.
 */
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