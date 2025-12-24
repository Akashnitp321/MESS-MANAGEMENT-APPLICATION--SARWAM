import React from "react";
import styles from "../styles/hero.module.css";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
    const navigate = useNavigate();


  useEffect(() => {
    
    document.body.style.overflowX = "hidden";

    // remove any margin/padding from body/html
    document.documentElement.style.margin = "0";
    document.documentElement.style.padding = "0";
    document.body.style.margin = "0";
    document.body.style.padding = "0";

    // prevent components from going outside
    document.documentElement.style.width = "100%";
    document.body.style.width = "100%";

    // cleanup when unmounts
    return () => {
      document.body.style.overflowX = "";
      document.documentElement.style.margin = "";
      document.documentElement.style.padding = "";
      document.body.style.margin = "";
      document.body.style.padding = "";
      document.documentElement.style.width = "";
      document.body.style.width = "";
    };
  }, []);

  return (
    <div className={styles.hero}>
      <div className={styles.left}>
        <h1 className={styles.title}>SARWAM</h1>
        <p className={styles.subtitle}>
          Smart Mess Management System for Students & Contractors
        </p>

        <div className={styles.buttonsRow}>
          <button className={styles.studentBtn} onClick={() => navigate("/login")}>Login as Student</button>
          <button className={styles.contractorBtn}>Login as Contractor</button>
        </div>

        <button className={styles.exploreBtn}>Explore Features</button>
      </div>

      <div className={styles.right}>
        <img
          src="/f.jpg"
          alt="Sarwam Dashboard"
          className={styles.heroImage}
        />
      </div>
    </div>
  );
}
