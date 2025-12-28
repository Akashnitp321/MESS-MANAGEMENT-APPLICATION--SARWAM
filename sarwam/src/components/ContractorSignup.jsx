import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import styles from "../styles/Signup.module.css";

export default function ContractorSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    contractorId: "",
    fullName: "",
    email: "",
    password: "",
    companyName: "",
    phoneNumber: "",
    hostel: "Aryabhatta Hostel",
  });
  const [loading, setLoading] = useState(false);

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

  const handleSignup = async (e) => {
    e.preventDefault();

    // Basic client-side validation
    if (!formData.contractorId.trim() || !formData.email.trim() || !formData.password.trim() || !formData.hostel) {
      toast.error("Contractor ID, Email, Password and Hostel are required");
      return;
    }

    // Simple email regex
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Phone number validation (basic)
    const phoneRe = /^\d{10}$/;
    if (formData.phoneNumber && !phoneRe.test(formData.phoneNumber.replace(/\D/g, ''))) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    try {
      const signupUrl = "http://localhost:3000/api/auth/contractor-signup";
      const res = await fetch(signupUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractorId: formData.contractorId.trim(),
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          password: formData.password,
          companyName: formData.companyName.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          hostelName: formData.hostel,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.error || (data.details ? JSON.stringify(data.details) : "Signup failed");
        toast.error(msg);
        return;
      }

      toast.success("Signup successful! Please login.");

      // Navigate to contractor login after successful signup
      setTimeout(() => navigate("/contractor-login"), 3000);
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Network error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageBackground}>
      <Toaster position="top-right" />
      <div className={styles.signupContainer}>
        <h2 className={styles.title}>Contractor Signup</h2>
        <form onSubmit={handleSignup} className={styles.form}>
          <input
            type="text"
            name="contractorId"
            placeholder="Contractor ID"
            value={formData.contractorId}
            onChange={handleChange}
            className={styles.inputField}
            required
          />
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            className={styles.inputField}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
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
          <input
            type="text"
            name="companyName"
            placeholder="Company Name"
            value={formData.companyName}
            onChange={handleChange}
            className={styles.inputField}
            required
          />
          <input
            type="tel"
            name="phoneNumber"
            placeholder="Phone Number"
            value={formData.phoneNumber}
            onChange={handleChange}
            className={styles.inputField}
            required
          />
          <select
            name="hostel"
            value={formData.hostel}
            onChange={handleChange}
            className={styles.inputField}
            required
          >
            {hostels.map((hostel, index) => (
              <option key={index} value={hostel}>
                {hostel}
              </option>
            ))}
          </select>
          <button type="submit" className={styles.signupBtn} disabled={loading}>
            {loading ? (
              <div className={styles.loader}>
                <div className={styles.spinner}></div>
                Signing up...
              </div>
            ) : (
              "Signup"
            )}
          </button>
          <p className={styles.loginRedirect}>
            Already have an account?{" "}
            <span onClick={() => navigate("/contractor-login")}>Login</span>
          </p>
        </form>
      </div>
    </div>
  );
}