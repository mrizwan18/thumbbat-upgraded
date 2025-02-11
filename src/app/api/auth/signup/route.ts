import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import crypto from "crypto";
import User from "@/server/models/User";
import { NextResponse } from "next/server";
import { withDb } from "@/src/utils/withDb";

const FRONTEND_URL =
  process.env.NODE_ENV === "production"
    ? process.env.PROD_FRONTEND_URL
    : process.env.DEV_FRONTEND_URL;

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const POST = withDb(async (request: Request) => {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check for existing user
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 }
      );
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return NextResponse.json(
        { error: "Email already taken" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const confirmationToken = crypto.randomBytes(20).toString("hex");

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      confirmationToken,
    });

    // Send confirmation email
    const confirmationUrl = `${FRONTEND_URL}/confirm?token=${confirmationToken}`;
    await sendConfirmationEmail(username, email, confirmationUrl);
    await newUser.save();

    return NextResponse.json({
      message: "User created! Please check your email to confirm your account.",
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});

async function sendConfirmationEmail(
  username: string,
  email: string,
  confirmationUrl: string
) {
  const emailHtml = `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          <h2 style="color: #333333; text-align: center;">Welcome to ThumbBat!</h2>
          <p style="color: #555555; font-size: 16px; line-height: 1.5;">
            Hello <strong>${username}</strong>,
          </p>
          <p style="color: #555555; font-size: 16px; line-height: 1.5;">
            Thank you for signing up! Please confirm your account by clicking the button below:
          </p>
          <table role="presentation" cellspacing="0" cellpadding="0" style="margin-top: 20px;">
            <tr>
              <td style="background-color: #4CAF50; border-radius: 5px;">
                <a href="${confirmationUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; font-size: 16px; border-radius: 5px; text-align: center;">
                  Confirm My Account
                </a>
              </td>
            </tr>
          </table>
          <p style="color: #555555; font-size: 16px; line-height: 1.5;">
            If the button above does not work, please copy and paste the following URL into your browser:
          </p>
          <p style="color: #555555; font-size: 16px; line-height: 1.5;">
            ${confirmationUrl}
          </p>
          <p style="color: #555555; font-size: 16px; line-height: 1.5;">
            If you did not sign up for this account, please ignore this email.
          </p>
          <p style="color: #888888; font-size: 14px; text-align: center; margin-top: 30px;">
            &copy; ${new Date().getFullYear()} ThumbBat. All rights reserved.
          </p>
        </div>
      </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "ThumbBat Account Confirmation",
    html: emailHtml,
  };

  await transporter.sendMail(mailOptions);
}
