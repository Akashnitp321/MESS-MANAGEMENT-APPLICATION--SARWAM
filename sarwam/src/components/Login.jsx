import React, { useState } from "react";
import styles from "../styles/Login.module.css";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    rollNo: "",
    password: "",
    role: "Student",
    remember: false,
  });
  const [loading, setLoading] = useState(false);

  const onSignupClick = () => {
    navigate("/signup");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 

    const { rollNo, password } = formData;
    if (!rollNo.trim() || !password.trim()) {
      toast.error("Roll Number and Password are required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/auth/student-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rollNo: rollNo.trim(),
          password: password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        toast.success("Login successful!");
        localStorage.setItem("token", data.token);
        setTimeout(() => navigate("/student-dashboard"), 3000);
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
        <h2 className={styles.title}>Student Login</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            name="rollNo"
            placeholder="Roll Number"
            value={formData.rollNo}
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
            {loading ? "Logging in..." : "Login"}
          </button>
          <p className={styles.signupRedirect}>
            Don't have an account?{" "}
            <span onClick={onSignupClick}>Signup</span>
          </p>
          <p className={styles.signupRedirect}>
            Forgot Password?{" "}
            <span onClick={onSignupClick}>Click Here</span>
          </p>
        </form>
      </div>
    </div>
  );
}
