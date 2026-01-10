import React, { useState } from "react";
import styles from "../styles/Login.module.css";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { API_BASE_URL } from "../config";

export default function ContractorLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    contractorId: "",
    password: "",
    hostel: "Aryabhatta Hostel",
    remember: false,
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
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { contractorId, password } = formData;
    if (!contractorId.trim() || !password.trim()) {
      toast.error("Contractor ID and Password are required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/contractor-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractorId: contractorId.trim(),
          password: password,
          hostel: formData.hostel,
        }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        toast.success("Login successful!");
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", "contractor");
        localStorage.setItem("hostel", formData.hostel);
        setTimeout(() => navigate("/contractor-dashboard"), 3000);
      } else {
        toast.error(data.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Network error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageBackground}>
      <Toaster position="top-right" />
      <div className={styles.loginContainer}>
        <h2 className={styles.title}>Contractor Login</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            name="contractorId"
            placeholder="Contractor ID"
            value={formData.contractorId}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <select
            name="hostel"
            value={formData.hostel}
            onChange={handleChange}
            required
          >
            {hostels.map((hostel, index) => (
              <option key={index} value={hostel}>
                {hostel}
              </option>
            ))}
          </select>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="remember"
              checked={formData.remember}
              onChange={handleChange}
            />
            Remember Me
          </label>
          <button type="submit" className={styles.loginBtn} disabled={loading}>
            {loading ? (
              <div className={styles.loader}>
                <div className={styles.spinner}></div>
                Logging in...
              </div>
            ) : (
              "Login"
            )}
          </button>
          <p className={styles.signupRedirect}>
            Don't have an account?{" "}
            <span onClick={() => navigate("/contractor-signup")}>Signup</span>
          </p>
          <p className={styles.signupRedirect}>
            Forgot Password?{" "}
            <span onClick={() => navigate("/forgot-password")}>Click Here</span>
          </p>
        </form>
      </div>
    </div>
  );
}