import React from "react";
import styles from "../styles/TestimonialsSection.module.css";

export default function TestimonialsSection() {
  const reviews = [
    {
      text: "Finally I can track my monthly mess expenses.",
      author: "– B.Tech Student",
    },
    {
      text: "Coupon blocking automation saved hours!",
      author: "– Mess Contractor",
    },
    {
      text: "Smart leave management makes my life easier.",
      author: "– Student",
    },
  ];

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>What People Say</h2>
      <div className={styles.grid}>
        {reviews.map((review, idx) => (
          <div className={styles.card} key={idx}>
            <p className={styles.text}>"{review.text}"</p>
            <p className={styles.author}>{review.author}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
