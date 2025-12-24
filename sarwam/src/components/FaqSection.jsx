import React, { useState } from "react";
import styles from "../styles/FAQSection.module.css";

export default function FAQSection() {
  const faqs = [
    {
      question: "How is coupon blocking automated?",
      answer:
        "Coupon blocking is automated using our backend logic which tracks leave count and disables coupon usage once the limit is reached.",
    },
    {
      question: "How does leave approval work?",
      answer:
        "Leave requests are automatically routed to the contractor/admin for approval. Once approved, the attendance calendar is updated.",
    },
    {
      question: "Can contractor change a mistake entry?",
      answer:
        "Yes, contractors can edit mistake entries, but all changes are logged for audit purposes.",
    },
    {
      question: "How is student privacy handled?",
      answer:
        "Student data is encrypted and access is restricted only to authorized personnel to ensure privacy.",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    if (activeIndex === index) {
      setActiveIndex(null);
    } else {
      setActiveIndex(index);
    }
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Frequently Asked Questions</h2>

      <div className={styles.container}>
        {faqs.map((faq, idx) => (
          <div
            className={`${styles.card} ${
              activeIndex === idx ? styles.active : ""
            }`}
            key={idx}
            onClick={() => toggleFAQ(idx)}
          >
            <div className={styles.question}>
              <span>{faq.question}</span>
              <span className={styles.icon}>
                {activeIndex === idx ? "−" : "+"}
              </span>
            </div>
            {activeIndex === idx && <p className={styles.answer}>{faq.answer}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
