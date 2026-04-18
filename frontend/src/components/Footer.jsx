import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.inner}>
        <div style={styles.left}>
          <div style={styles.brand}>SmartCampus</div>
          <div style={styles.text}>SmartCampus Operations Hub</div>
        </div>

        <div style={styles.right}>
          <Link to="/landing" style={styles.link}>
            Landing
          </Link>
          <Link to="/" style={styles.link}>
            Home
          </Link>
          <div style={styles.text}>© {new Date().getFullYear()}</div>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    borderTop: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(11, 18, 32, 0.78)",
    backdropFilter: "blur(10px)",
    marginTop: 24,
  },
  inner: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "18px 18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    color: "#a9b7d5",
    fontFamily: "Arial, sans-serif",
    flexWrap: "wrap",
  },
  brand: { color: "#e8eefc", fontWeight: 900, letterSpacing: 0.2 },
  left: { display: "flex", flexDirection: "column", gap: 4 },
  right: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
  text: { fontSize: 12 },
  link: { color: "#cfe3ff", textDecoration: "none", fontWeight: 900, fontSize: 12 },
};