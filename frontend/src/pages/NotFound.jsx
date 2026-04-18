import React from "react";
import { Link } from "react-router-dom";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";

export default function NotFound() {
  return (
    <div style={styles.page}>
      <Card style={styles.card}>
        <div style={styles.code}>404</div>
        <div style={styles.title}>Page not found</div>
        <div style={styles.text}>
          The page you requested doesn’t exist. Use the buttons below to get back to the system.
        </div>

        <div style={styles.actions}>
          <Button as={Link} to="/home" variant="primary">
            Go to Home
          </Button>
          <Button as={Link} to="/facilities" variant="secondary">
            Facilities
          </Button>
          <Button as={Link} to="/landing" variant="ghost">
            Landing
          </Button>
        </div>
      </Card>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 18,
    fontFamily: "Arial, sans-serif",
    color: "#e8eefc",
    background: "linear-gradient(180deg, #0b1220 0%, #0f1b33 40%, #0b1220 100%)",
  },
  card: { width: "min(560px, 100%)", textAlign: "center", padding: 20 },
  code: { fontSize: 48, fontWeight: 900, letterSpacing: 1 },
  title: { marginTop: 8, fontSize: 18, fontWeight: 900 },
  text: { marginTop: 10, color: "#a9b7d5", lineHeight: 1.6, fontSize: 13 },
  actions: { marginTop: 14, display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" },
};