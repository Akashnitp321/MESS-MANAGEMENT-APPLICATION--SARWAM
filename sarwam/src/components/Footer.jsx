import React from "react";
import styles from "../styles/Footer.module.css";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Logo & About */}
        <div className={styles.about}>
          <span className={styles.logo}>SARWAM</span>
          <p>Smart Mess Management System for Students & Contractors. Track expenses, manage leaves, and communicate effortlessly.</p>
        </div>

        {/* Quick Links */}
        <div className={styles.links}>
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#student">Student Login</a></li>
            <li><a href="#contractor">Contractor Login</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>

        {/* Contact / Social */}
        <div className={styles.contact}>
          <h4>Connect</h4>
          <div className={styles.icons}>
            <a href="mailto:info@sarwam.com" target="_blank"><FaEnvelope /></a>
            <a href="https://github.com" target="_blank"><FaGithub /></a>
            <a href="https://linkedin.com" target="_blank"><FaLinkedin /></a>
          </div>
          <p>© {new Date().getFullYear()} SARWAM. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
