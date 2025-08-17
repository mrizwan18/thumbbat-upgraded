import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Resend } from "resend";

import User from "@/server/models/User";
import VerificationToken from "@/server/models/VerificationToken";
import dbConnect from "@/server/config/db";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM_EMAIL = process.env.EMAIL_FROM || "cs@thumbbat.fun";
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function sha256b64url(input: string) {
  return crypto.createHash("sha256").update(input).digest("base64url");
}

function getBaseUrl(req: Request) {
  const envUrl = process.env.PUBLIC_FRONTEND_URL
    || process.env.PROD_FRONTEND_URL
    || process.env.DEV_FRONTEND_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");

  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host  = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  return `${proto}://${host}`;
}

export const POST = async (request: Request) => {
  await dbConnect();

  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Uniqueness checks
    const [byName, byEmail] = await Promise.all([
      User.findOne({ username }),
      User.findOne({ email }),
    ]);
    if (byName)  return NextResponse.json({ error: "Username already taken" }, { status: 400 });
    if (byEmail) return NextResponse.json({ error: "Email already taken" }, { status: 400 });

    // Create user (unverified)
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: passwordHash,
      emailVerifiedAt: null, // add this field in your User model
    });

    // Invalidate any prior un-used tokens for this user (optional guard)
    await VerificationToken.deleteMany({ userId: user._id, usedAt: null });

    // One-time token (plain sent via email; hash stored in DB)
    const tokenPlain = crypto.randomBytes(32).toString("base64url");
    const tokenHash  = sha256b64url(tokenPlain);
    const expiresAt  = new Date(Date.now() + TOKEN_TTL_MS);

    await VerificationToken.create({
      userId: user._id,
      email,
      tokenHash,
      expiresAt,
    });

    const baseUrl = getBaseUrl(request);
    const confirmationUrl = `${baseUrl}/confirm?token=${tokenPlain}`;

    // Send email (Resend)
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Confirm your ThumbBat account",
      html: `
        <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto;">
          <h2>Welcome to ThumbBat, ${username}!</h2>
          <p>Confirm your email to finish setting up your account.</p>
          <p>
            <a href="${confirmationUrl}"
               style="display:inline-block;background:#16a34a;color:#fff;padding:12px 16px;border-radius:8px;text-decoration:none">
              Confirm my account
            </a>
          </p>
          <p>If the button doesn’t work, paste this URL:</p>
          <p style="word-break:break-all">${confirmationUrl}</p>
          <p>This link expires in 24 hours.</p>
        </div>
      `,
    });

    return NextResponse.json({
      message: "User created. Please check your email to confirm.",
    });
  } catch (err: any) {
    console.error("Signup error:", err);

    // Best-effort cleanup if we created a user just now and failed to send email
    // (Safe to no-op if nothing was created)
    try {
      const body = await request.clone().json().catch(() => null);
      if (body?.email) {
        const u = await User.findOne({ email: body.email, emailVerifiedAt: null });
        if (u) {
          await VerificationToken.deleteMany({ userId: u._id, usedAt: null });
          await User.deleteOne({ _id: u._id });
        }
      }
    } catch {}

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};