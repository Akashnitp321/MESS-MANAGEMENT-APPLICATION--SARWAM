import React from "react";
import styles from "../styles/SolutionsSection.module.css";

const SolutionsSection = () => {
  return (
    <section className={styles.solutionsWrapper}>
      <h2 className={styles.heading}>What We Offer</h2>
      <p className={styles.subHeading}>Smart tools for students, contractors & administration</p>

      <div className={styles.grid}>
        
        <div className={`${styles.card} ${styles.greenCard}`}>
          <h3>📊 Expense Analytics</h3>
          <p>Track your monthly & yearly mess spending with interactive graphs.</p>
        </div>

        <div className={`${styles.card} ${styles.greenCard}`}>
          <h3>🔔 Coupon Auto-Blocking</h3>
          <p>When leave count reaches 12, coupon auto-blocks automatically.</p>
        </div>

        <div className={`${styles.card} ${styles.greenCard}`}>
          <h3>📝 Smart Leave System</h3>
          <p>Apply for leave, track approval, and get auto-verified attendance updates.</p>
        </div>

        <div className={`${styles.card} ${styles.blueCard}`}>
          <h3>👨‍🍳 Contractor Dashboard</h3>
          <p>View food item sales trends and demand analytics visually.</p>
        </div>

        <div className={`${styles.card} ${styles.blueCard}`}>
          <h3>📅 Attendance Calendar</h3>
          <p>Automatically marks students absent during approved leave dates.</p>
        </div>

        <div className={`${styles.card} ${styles.blueCard}`}>
          <h3>💬 Community Chat</h3>
          <p>Real-time communication between students and mess staff.</p>
        </div>

      </div>
    </section>
  );
};

export default SolutionsSection;
