import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import styles from "../styles/Signup.module.css";

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    rollNo: "",
    institute: "",
    hostel: "Aryabhatta Hostel",
    password: "",
    passportPhotoLink: "",
    idCardPhotoLink: "",
    email: "",
  });

  const hostels = [
    "Aryabhatta Hostel",
    "Kadambini Hostel",
    "Brahmaputra Hostel",
    "Ganga Hostel",
    "Kautilya Hostel",
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSignup = async (e) => {
    e.preventDefault();

    // Trim inputs and prepare payload
    const payload = {
      rollNo: formData.rollNo.trim(),
      fullName: formData.name.trim(),
      instituteName: formData.institute.trim(),
      password: formData.password,
      hostelName: formData.hostel,
      passportPhotoLink: formData.passportPhotoLink.trim(),
      idCardPhotoLink: formData.idCardPhotoLink.trim(),
      email: formData.email.trim(),
    };

    // Basic client-side validation
    if (!payload.email || !payload.rollNo || !payload.password) {
      toast.error("Email, Roll No and Password are required");
      return;
    }
    // simple email regex
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(payload.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      // 1️⃣ Signup API
      const signupUrl = "http://localhost:3000/api/auth/student-signup".replace(
        /\s/g,
        ""
      );
      const res = await fetch(signupUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        // show specific server feedback if available
        const msg = data.error || (data.details ? JSON.stringify(data.details) : "Signup failed");
        toast.error(msg);
        return; // stop if signup failed
      }

      toast.success("Signup successful!");

      // 2️⃣ Send OTP
      const otpUrl = "http://localhost:3000/api/otp/send-otp".replace(/\s/g, '');
      const otpRes = await fetch(otpUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: payload.email }),
      });

      const otpData = await otpRes.json();

      if (!otpRes.ok) {
        toast.error(otpData.error || "Failed to send OTP");
        return;
      }

      toast.success("OTP sent successfully!");
      navigate("/verify-otp", { state: { email: payload.email } });
    } catch (err) {
      toast.error("Network error: " + err.message);
    }
  };

  const isStepCompleted = (s) => {
    if (s === 1)
      return (
        formData.name &&
        formData.rollNo &&
        formData.institute &&
        formData.password &&
        formData.email
      );
    if (s === 2) return formData.passportPhotoLink && formData.idCardPhotoLink;
    return false;
  };

  return (
    <div className={styles.pageBackground}>
      <Toaster position="top-right" reverseOrder={false} />
      <div className={styles.signupContainer}>
        <h2 className={styles.title}>Student Signup</h2>

        <form className={styles.form} onSubmit={handleSignup}>
          <div className={styles.steps}>
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`${styles.stepCircle} ${
                  step === s ? styles.activeStep : ""
                } ${isStepCompleted(s) ? styles.completedStep : ""}`}
              >
                {isStepCompleted(s) ? "✓" : s}
              </div>
            ))}
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <div className={styles.step}>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className={styles.inputField}
                required
              />
              <input
                type="text"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className={styles.inputField}
                required
              />
              <input
                type="text"
                name="rollNo"
                placeholder="Roll Number"
                value={formData.rollNo}
                onChange={handleChange}
                className={styles.inputField}
                required
              />
              <input
                type="text"
                name="institute"
                placeholder="Institute Name"
                value={formData.institute}
                onChange={handleChange}
                className={styles.inputField}
                required
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={styles.inputField}
                required
              />
              <select
                name="hostel"
                value={formData.hostel}
                onChange={handleChange}
                className={styles.inputField}
              >
                {hostels.map((h, idx) => (
                  <option key={idx} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className={styles.step}>
              <input
                type="url"
                name="passportPhotoLink"
                placeholder="Passport Photo Drive Link"
                value={formData.passportPhotoLink}
                onChange={handleChange}
                className={styles.inputField}
                required
              />
              <input
                type="url"
                name="idCardPhotoLink"
                placeholder="ID Card Photo Drive Link"
                value={formData.idCardPhotoLink}
                onChange={handleChange}
                className={styles.inputField}
                required
              />
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className={styles.step}>
              <h3 className={styles.reviewTitle}>Review Your Details</h3>
              <div className={styles.reviewCard}>
                <p>
                  <strong>Name:</strong> {formData.name}
                </p>
                <p>
                  <strong>Roll No:</strong> {formData.rollNo}
                </p>
                <p>
                  <strong>Institute:</strong> {formData.institute}
                </p>
                <p>
                  <strong>Email:</strong> {formData.email}
                </p>
                <p>
                  <strong>Hostel:</strong> {formData.hostel}
                </p>
                <p>
                  <strong>Password:</strong> ******
                </p>
                <p>
                  <strong>Passport Photo:</strong> {formData.passportPhotoLink}
                </p>
                <p>
                  <strong>ID Card:</strong> {formData.idCardPhotoLink}
                </p>
              </div>
            </div>
          )}

          {/* BUTTONS */}
          <div className={styles.buttons}>
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className={styles.prevBtn}
              >
                Back
              </button>
            )}
            {step < 3 && (
              <button
                type="button"
                onClick={nextStep}
                className={styles.nextBtn}
              >
                Next
              </button>
            )}
            {step === 3 && (
              <button type="submit" className={styles.submitBtn}>
                Submit
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
