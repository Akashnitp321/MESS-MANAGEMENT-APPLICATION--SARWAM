import express from 'express';
import transporter from '../utils/mailer.js';
const router = express.Router();

// simple in-memory OTP store: email -> { otp, expires }
const otpStore = new Map();

// POST /send-otp
router.post('/send-otp', async (req, res) => {
  try {
    console.log('POST /api/otp/send-otp', req.body);
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) return res.status(400).json({ error: 'Invalid email' });

    // generate a 4-digit OTP (1000-9999)
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresMs = 5 * 60 * 1000; // 5 minutes
    otpStore.set(email, { otp, expires: Date.now() + expiresMs });
    console.log(`Generated 4-digit OTP for ${email}: ${otp}`);

    // Send OTP via email with detailed logging
    try {
      console.log(`Attempting to send email to ${email}...`);
      const info = await transporter.sendMail({
        from: process.env.EMAIL_USER || 'noreply@sarwam.com',
        to: email,
        subject: 'Your Sarwam 4-digit OTP Code',
        html: `<h2>Your 4-digit OTP is: <strong>${otp}</strong></h2><p>Valid for 5 minutes.</p>`,
      });
      console.log(`✓ Email sent successfully. Message ID: ${info.messageId}`);
      return res.status(200).json({ message: 'OTP sent to your email', success: true });
    } catch (mailErr) {
      console.error('❌ Email send failed:', mailErr.message);
      console.error('Full error:', mailErr);
      return res.status(500).json({ error: `Email failed: ${mailErr.message}` });
    }
  } catch (err) {
    console.error('OTP send error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
});

// POST /verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    console.log('POST /api/otp/verify-otp', req.body);
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

    const record = otpStore.get(email);
    if (!record) return res.status(400).json({ error: 'No OTP requested for this email or OTP expired' });

    if (record.expires < Date.now()) {
      otpStore.delete(email);
      return res.status(400).json({ error: 'OTP expired' });
    }

    if (record.otp !== String(otp).trim()) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // successful verification; remove OTP
    otpStore.delete(email);
    return res.status(200).json({ message: 'OTP verified', success: true });
  } catch (err) {
    console.error('OTP verify error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
