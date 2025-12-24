import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.error("❗ Missing EMAIL_USER or EMAIL_PASSWORD in .env");
  
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, 
  },
  
  tls: {
    rejectUnauthorized: false,
  },
});

// verify connection and show clear guidance on failure
transporter.verify((err, success) => {
  if (err) {
    console.error("❌ Gmail transporter verify failed:", err.message);
    console.log("Check:");
    console.log("- EMAIL_USER and EMAIL_PASSWORD in .env");
    console.log("- EMAIL_PASSWORD should be a Gmail App Password (https://support.google.com/accounts/answer/185833)");
    console.log("- Network/firewall allows outbound SMTP (ports 465 or 587)");
  } else {
    console.log("✓ Gmail transporter verified (using Gmail SMTP)");
  }
});

export default transporter;
