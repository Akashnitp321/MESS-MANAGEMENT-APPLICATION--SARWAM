import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import styles from "../styles/OTPPage.module.css";

export default function OTPPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialEmail = location?.state?.email || "";
  const [email, setEmail] = useState(initialEmail);

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < otp.length - 1) {
        const next = document.getElementById(`otp-${index + 1}`);
        if (next) next.focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("").trim();
    if (!email) {
      toast.error("Please provide your email");
      return;
    }
    if (!enteredOtp || enteredOtp.length < 1) {
      toast.error("Please enter the OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/otp/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: enteredOtp }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("OTP verified. Redirecting to login...");
        setTimeout(() => navigate("/login"), 1000);
        return;
      }

      // verification failed
      toast.error(data.error || "OTP verification failed. Redirecting to home...");
      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      toast.error("Network error: " + err.message);
      setTimeout(() => navigate("/"), 1200);
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    if (!email) {
      toast.error("Please provide your email to resend OTP");
      return;
    }
    setResending(true);
    try {
      const res = await fetch("http://localhost:3000/api/otp/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("OTP resent");
        setTimer(60);
      } else {
        toast.error(data.error || "Failed to resend OTP");
      }
    } catch (err) {
      toast.error("Network error: " + err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className={styles.pageBackground}>
      <Toaster position="top-right" />
      <div className={styles.otpContainer}>
        <h2 className={styles.title}>Enter OTP</h2>
        <p className={styles.subtitle}>We sent an OTP to your registered email</p>

        <form onSubmit={handleSubmit} className={styles.otpForm}>
          {/* email input only shown if not provided via state */}
          {!initialEmail && (
            <div style={{ marginBottom: 12, width: "100%" }}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.inputField}
                required
                style={{ width: "100%", padding: 8, marginBottom: 8 }}
              />
            </div>
          )}

          <div className={styles.otpInputs}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-${idx}`}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e, idx)}
                className={styles.otpInput}
                autoComplete="one-time-code"
              />
            ))}
          </div>

          <button type="submit" className={styles.verifyBtn} disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div className={styles.resendSection}>
          {timer > 0 ? (
            <p>Resend OTP in {timer}s</p>
          ) : (
            <button onClick={resendOTP} className={styles.resendBtn} disabled={resending}>
              {resending ? "Resending..." : "Resend OTP"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
