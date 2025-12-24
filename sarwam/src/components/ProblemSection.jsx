import React from "react";
import styles from "../styles/problem.module.css";

import student1 from "../assets/icons/student1.png";
import contractor1 from "../assets/icons/contractor1.png";
import admin1 from "../assets/icons/admin1.png";

export default function ProblemSection() {
  const sections = [
    {
      title: "Students",
      points: [
        "Hard to track monthly mess expenses",
        "No transparency on coupon usage",
        "Leave system is outdated"
      ],
      icon: student1,
    },
    {
      title: "Contractor",
      points: [
        "Manual coupon tracking is messy",
        "Cannot identify food demand trends",
        "Hard to monitor attendance"
      ],
      icon: contractor1,
    },
    {
      title: "Mess Administration",
      points: [
        "No analytics",
        "Inefficient approval cycles",
        "Manual tracking & reporting"
      ],
      icon: admin1,
    },
  ];

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Why SARWAM?</h2>

      <div className={styles.grid}>
        {sections.map((sec, idx) => (
          <div className={styles.card} key={idx}>
            <img src={sec.icon} className={styles.iconMain} />
            <h3 className={styles.cardTitle}>{sec.title}</h3>

            <ul className={styles.list}>
              {sec.points.map((p, i) => (
                <li key={i} className={styles.listItem}>
                  <span className={styles.bullet}></span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
