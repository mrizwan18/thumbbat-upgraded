import { NextResponse } from "next/server";
import crypto from "crypto";
import { withDb } from "@/src/utils/withDb";
import User from "@/server/models/User";
import VerificationToken from "@/server/models/VerificationToken";

// ---- CORS helpers (unchanged) ----
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

// ---- util: hash the incoming token exactly as we stored it ----
function sha256b64url(input: string) {
  return crypto.createHash("sha256").update(input).digest("base64url");
}

export const GET = withDb(async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Look up hashed token
    const tokenHash = sha256b64url(token);
    const vt = await VerificationToken.findOne({ tokenHash });

    if (!vt) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400, headers: corsHeaders() }
      );
    }
    if (vt.usedAt) {
      return NextResponse.json(
        { error: "Token already used" },
        { status: 400, headers: corsHeaders() }
      );
    }
    if (vt.expiresAt.getTime() < Date.now()) {
      return NextResponse.json(
        { error: "Token expired" },
        { status: 400, headers: corsHeaders() }
      );
    }

    await User.updateOne(
      { _id: vt.userId },
      { $set: { emailVerifiedAt: new Date(), isConfirmed: true } }
    );

    // Consume token
    vt.usedAt = new Date();
    await vt.save();

    return NextResponse.json(
      { ok: true, message: "Account confirmed successfully!" },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Error confirming account (GET):", error);
    return NextResponse.json(
      { error: "Error confirming account" },
      { status: 500, headers: corsHeaders() }
    );
  }
});

export const POST = withDb(async (request: Request) => {
  try {
    const { token } = await request.json().catch(() => ({} as { token?: string }));
    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const tokenHash = sha256b64url(token);
    const vt = await VerificationToken.findOne({ tokenHash });

    if (!vt) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400, headers: corsHeaders() }
      );
    }
    if (vt.usedAt) {
      return NextResponse.json(
        { error: "Token already used" },
        { status: 400, headers: corsHeaders() }
      );
    }
    if (vt.expiresAt.getTime() < Date.now()) {
      return NextResponse.json(
        { error: "Token expired" },
        { status: 400, headers: corsHeaders() }
      );
    }

    await User.updateOne(
      { _id: vt.userId },
      { $set: { emailVerifiedAt: new Date() } }
    );

    vt.usedAt = new Date();
    await vt.save();

    return NextResponse.json(
      { ok: true, message: "Account confirmed successfully!" },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Error confirming account (POST):", error);
    return NextResponse.json(
      { error: "Error confirming account" },
      { status: 500, headers: corsHeaders() }
    );
  }
});