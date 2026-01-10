import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/hero.module.css";
import heroImage from "../assets/image (2).png";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className={styles.hero}>
      <div className={styles.aurora}></div>
      <div className={styles.auroraSoft}></div>

      <div className={styles.gridContainer}>
        {/* Right Side - Hero Image (Top on mobile) */}
        <div className={styles.imageContainer}>
          <div className={styles.imageWrapper}>
            <img 
              src={heroImage} 
              alt="Mess Management Dashboard" 
              className={styles.heroImage}
            />
            <div className={styles.imageGlow}></div>
          </div>
        </div>

        {/* Left Side - Text Content */}
        <div className={styles.container}>
          <div className={styles.content}>
            <h1 className={styles.title}>SARWAM</h1>
            <p className={styles.subtitle}>Smart Mess Management System</p>
            <p className={styles.description}>Streamline meal planning, payments, and operations with our modern platform</p>
            
            <div className={styles.buttons}>
              <button className={styles.primary} onClick={() => navigate("/login")}>
                Student Login
              </button>
              <button className={styles.secondary} onClick={() => navigate("/contractor-login")}>
                Contractor Login
              </button>
            </div>

            <button className={styles.signup} onClick={() => navigate("/signup")}>
              New here? Sign up
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
