const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const User = require("../models/User");

const FRONTEND_URL = process.env.CLIENT_URL;

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Signup
router.post("/signup", async (req, res) => {
  const { username, password, email } = req.body;

  const existingUser = await User.findOne({ username });
  if (existingUser)
    return res.status(400).json({ error: "Username already taken" });

  const existingEmail = await User.findOne({ email });
  if (existingEmail)
    return res.status(400).json({ error: "Email already taken" });

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
      <!-- Updated Button with Inline Styles and extra fallback -->
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

  // Mail options with HTML body
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "ThumbBat Account Confirmation",
    html: emailHtml, // Send HTML formatted email
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error sending email" });
    }
    newUser.save();
    res.json({
      message: "User created! Please check your email to confirm your account.",
    });
  });
});

// Confirmation route
router.get("/confirm", async (req, res) => {
  const { token } = req.query;

  const user = await User.findOne({ confirmationToken: token });
  if (!user) return res.status(400).json({ error: "Invalid token" });

  user.isConfirmed = true;
  user.confirmationToken = undefined; // Clear the confirmation token

  await user.save();
  res.json({ message: "Account confirmed successfully!" });
});

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ error: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

  if (!user.isConfirmed) {
    return res
      .status(400)
      .json({
        error:
          "Confirmation Pending! Please click on the confirmation link in the email sent to you.",
      });
  }
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  res.json({ token, username: user.username, highScore: user.highScore });
});

module.exports = router;
