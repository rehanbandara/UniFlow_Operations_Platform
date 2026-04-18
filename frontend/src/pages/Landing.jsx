import React from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";

export default function Landing() {
  const { token, loading } = useAuth();
  if (!loading && token) return <Navigate to="/home" replace />;

  return (
    <div style={styles.shell}>
      <div style={styles.wrap}>
        <div style={styles.hero}>
          <div style={styles.kicker}>SmartCampus Operations Hub</div>
          <h1 style={styles.h1}>University operations, made usable.</h1>
          <p style={styles.p}>
            Browse facilities, view details, and manage data securely. Sign in with Google to access your account.
          </p>

          <div style={styles.actions}>
            <Button as={Link} to="/login" variant="primary" size="lg">
              Sign in with Google
            </Button>
            <Button as={Link} to="/signup" variant="secondary" size="lg">
              Create account
            </Button>
          </div>

          <div style={styles.small}>
            Students and staff are redirected based on role (ROLE_USER / ROLE_ADMIN).
          </div>
        </div>

        <div style={styles.panel}>
          <Card style={styles.card}>
            <div style={styles.cardTitle}>Facility Directory</div>
            <div style={styles.cardText}>Search and view labs/rooms with capacity, location and details.</div>
          </Card>
          <Card style={styles.card}>
            <div style={styles.cardTitle}>Admin Controls</div>
            <div style={styles.cardText}>Admins manage facilities and users with role-based security.</div>
          </Card>
          <Card style={styles.card}>
            <div style={styles.cardTitle}>Operational Ready</div>
            <div style={styles.cardText}>Structured pages, full-screen app shell, and practical UX states.</div>
          </Card>
        </div>
      </div>
    </div>
  );
}

const styles = {
  shell: {
    width: "min(1100px, 100%)",
  },
  wrap: {
    display: "grid",
    gridTemplateColumns: "1.35fr 1fr",
    gap: 16,
    alignItems: "start",
  },
  hero: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 20,
    padding: 22,
    boxShadow: "0 28px 90px rgba(0,0,0,0.35)",
  },
  kicker: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(59,130,246,0.16)",
    border: "1px solid rgba(59,130,246,0.30)",
    color: "#cfe3ff",
    fontWeight: 900,
    fontSize: 12,
    letterSpacing: 0.3,
  },
  h1: { margin: "14px 0 8px 0", fontSize: 34, letterSpacing: 0.2, lineHeight: 1.05 },
  p: { margin: 0, color: "#a9b7d5", lineHeight: 1.7, fontSize: 14, maxWidth: 720 },
  actions: { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 18 },
  small: { marginTop: 12, color: "#7f90b4", fontSize: 12, lineHeight: 1.6 },

  panel: { display: "flex", flexDirection: "column", gap: 12 },
  card: { padding: 16 },
  cardTitle: { fontWeight: 900, marginBottom: 6, fontSize: 14 },
  cardText: { color: "#a9b7d5", fontSize: 13, lineHeight: 1.6 },
};