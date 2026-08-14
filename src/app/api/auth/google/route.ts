import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "@/src/models/User";
import { withDb } from "@/src/utils/withDb";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string;

async function makeUniqueUsername(seed: string) {
  const base =
    seed
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 15) || "player";

  let username = base;
  let suffix = 0;
  // eslint-disable-next-line no-await-in-loop
  while (await User.findOne({ username })) {
    suffix += 1;
    username = `${base}${suffix}`;
  }
  return username;
}

export const POST = withDb(async (request: Request) => {
  try {
    const { accessToken } = await request.json();
    if (!accessToken) {
      return NextResponse.json({ error: "Missing Google access token" }, { status: 400 });
    }

    // Confirm this token was actually issued to OUR OAuth client, not some
    // other app's token being replayed against this endpoint.
    const tokenInfoRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(accessToken)}`
    );
    if (!tokenInfoRes.ok) {
      return NextResponse.json({ error: "Invalid or expired Google token" }, { status: 401 });
    }
    const tokenInfo = await tokenInfoRes.json();
    if (tokenInfo.aud !== GOOGLE_CLIENT_ID) {
      return NextResponse.json({ error: "Token was not issued for this app" }, { status: 401 });
    }

    const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!profileRes.ok) {
      return NextResponse.json({ error: "Could not fetch Google profile" }, { status: 401 });
    }
    const profile = (await profileRes.json()) as {
      email?: string;
      email_verified?: boolean;
      name?: string;
    };

    if (!profile.email || !profile.email_verified) {
      return NextResponse.json(
        { error: "This Google account has no verified email" },
        { status: 400 }
      );
    }

    let user = await User.findOne({ email: profile.email });

    if (!user) {
      const username = await makeUniqueUsername(profile.name || profile.email.split("@")[0]);
      const randomPassword = crypto.randomBytes(32).toString("hex");
      const passwordHash = await bcrypt.hash(randomPassword, 10);

      user = await User.create({
        username,
        email: profile.email,
        password: passwordHash,
        isConfirmed: true,
        emailVerifiedAt: new Date(),
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: "1d",
    });

    return NextResponse.json({
      token,
      username: user.username,
      userId: user._id,
      highScore: user.highScore,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Google auth error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
