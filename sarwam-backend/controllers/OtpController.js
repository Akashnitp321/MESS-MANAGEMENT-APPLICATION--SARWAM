import Otp from "../models/otp.js";
import transporter from "../utils/mailer.js";
import express from "express";

const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

// Send OTP
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    await Otp.create({ email, otp, expiresAt });

    try {
      console.log(`Sending OTP email to ${email}...`);
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP Code",
        html: `<p>Your OTP is <b>${otp}</b>. Expires in 5 minutes.</p>`
      });
      console.log(`✓ OTP email sent successfully to ${email}`);
    } catch (mailErr) {
      console.error("❌ Email send failed:", mailErr.message);
      throw mailErr;
    }

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("Send OTP error:", err.message);
    res.status(500).json({ error: err.message || "Server error" });
  }
};

// Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: "Email and OTP required" });

    const otpDoc = await Otp.findOne({ email, otp, used: false });
    if (!otpDoc) return res.status(400).json({ error: "Invalid OTP" });
    if (otpDoc.expiresAt < new Date()) return res.status(400).json({ error: "OTP expired" });

    otpDoc.used = true;
    await otpDoc.save();

    res.json({ success: true, message: "OTP verified successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
};
