import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/hero.module.css";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className={styles.hero}>
      <div className={styles.aurora}></div>
      <div className={styles.auroraSoft}></div>

      <div className={styles.grid}>
        <div className={styles.copy}> 
          <span className={styles.tag}>Campus-ready • 2026</span>
          <h1 className={styles.title}>
            Modern mess management with a command-center experience.
          </h1>
          <p className={styles.subtitle}>
            Automate check-ins, payments, and contractor ops in one clean interface. Built for fast mornings and zero admin drag.
          </p>

          <div className={styles.chips}>
            <span className={styles.chip}>Live occupancy</span>
            <span className={styles.chip}>Instant billing</span>
            <span className={styles.chip}>Contractor insights</span>
          </div>

          <div className={styles.actions}>
            <button className={styles.primary} onClick={() => navigate("/login")}>
              Student login
            </button>
            <button className={styles.secondary} onClick={() => navigate("/contractor-login")}>
              Contractor login
            </button>
          </div>
          <button className={styles.linkBtn} onClick={() => navigate("/signup")}>New student? Create account</button>
        </div>

        <div className={styles.panel}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <p className={styles.cardLabel}>Live control</p>
                <h3 className={styles.cardTitle}>Mess status</h3>
              </div>
              <span className={styles.pulse}>●</span>
            </div>

            <div className={styles.metrics}>
              <div>
                <p className={styles.metricLabel}>Meals served today</p>
                <p className={styles.metricValue}>1,240</p>
              </div>
              <div>
                <p className={styles.metricLabel}>On-time payments</p>
                <p className={styles.metricValue}>98%</p>
              </div>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.quickActions}>
              <button className={styles.tile} onClick={() => navigate("/login")}>
                Student portal
                <span className={styles.arrow}>→</span>
              </button>
              <button className={styles.tile} onClick={() => navigate("/contractor-login")}>
                Contractor portal
                <span className={styles.arrow}>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
