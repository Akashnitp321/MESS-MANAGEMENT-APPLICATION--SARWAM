import React from "react";
import styles from "../styles/DualRoleSection.module.css";

export default function DualRoleSection() {
  const studentsFeatures = [
    "Track monthly/yearly expenses",
    "View coupon usage",
    "Apply for leave",
    "Get instant approval updates",
    "Chat with mess community",
  ];

  const contractorFeatures = [
    "Monitor leave and block coupons",
    "Track trending food items monthly",
    "View students' attendance",
    "Approve or reject leave",
    "Manage chat groups",
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* Left Side: Students */}
        <div className={`${styles.card} ${styles.leftCard}`}>
          <h3>Students</h3>
          <ul className={styles.list}>
            {studentsFeatures.map((feature, idx) => (
              <li key={idx} className={styles.listItem}>{feature}</li>
            ))}
          </ul>
          <button className={styles.studentBtn}>Student Login →</button>
        </div>

        {/* Right Side: Contractor */}
        <div className={`${styles.card} ${styles.rightCard}`}>
          <h3>Contractor</h3>
          <ul className={styles.list}>
            {contractorFeatures.map((feature, idx) => (
              <li key={idx} className={styles.listItem}>{feature}</li>
            ))}
          </ul>
          <button className={styles.contractorBtn}>Contractor Login →</button>
        </div>
      </div>
    </section>
  );
}
