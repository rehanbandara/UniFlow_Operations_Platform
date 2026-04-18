import React from "react";
import { Link } from "react-router-dom";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";

export default function Unauthorized() {
  return (
    <div style={styles.page}>
      <Card style={styles.card}>
        <div style={styles.title}>Unauthorized</div>
        <div style={styles.text}>You do not have permission to access this page.</div>
        <div style={styles.actions}>
          <Button as={Link} to="/home" variant="primary">
            Go to Home
          </Button>
          <Button as={Link} to="/landing" variant="secondary">
            Landing
          </Button>
        </div>
      </Card>
    </div>
  );
}

const styles = {
  page: { width: "min(560px, 100%)" },
  card: { padding: 20, textAlign: "center" },
  title: { fontWeight: 900, fontSize: 18, marginBottom: 8 },
  text: { color: "#a9b7d5", fontWeight: 800, fontSize: 13, lineHeight: 1.6 },
  actions: { marginTop: 14, display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" },
};