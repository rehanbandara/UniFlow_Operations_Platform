import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import { useAuth } from "../../auth/AuthContext.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

export default function Signup() {
  const navigate = useNavigate();
  const { token, loading } = useAuth();

  useEffect(() => {
    if (!loading && token) navigate("/home", { replace: true });
  }, [loading, token, navigate]);

  const handleGoogleSignup = () => {
    // Same OAuth flow; backend creates a new user on first login.
    window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
  };

  return (
    <div style={styles.page}>
      <Card style={styles.card}>
        <div style={styles.brandRow}>
          <div style={styles.brandMark}>SC</div>
          <div>
            <div style={styles.brandTitle}>SmartCampus</div>
            <div style={styles.brandSub}>Create account</div>
          </div>
        </div>

        <h2 style={styles.title}>Create your account</h2>
        <p style={styles.subtitle}>
          Use your university Google account to create a SmartCampus profile. If you already have an account,
          sign in instead.
        </p>

        <Button variant="primary" size="lg" onClick={handleGoogleSignup} style={{ width: "100%" }}>
          Sign up with Google
        </Button>

        <div style={styles.linksRow}>
          <Link to="/login" style={styles.link}>
            Already have an account? Sign in
          </Link>
          <Link to="/landing" style={styles.link}>
            Back to Landing
          </Link>
        </div>
      </Card>
    </div>
  );
}

const styles = {
  page: { width: "min(560px, 100%)" },
  card: { padding: 20 },
  brandRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 10 },
  brandMark: {
    width: 44,
    height: 44,
    borderRadius: 16,
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    background: "linear-gradient(135deg, rgba(59,130,246,0.35), rgba(168,85,247,0.25))",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "#e8eefc",
  },
  brandTitle: { fontWeight: 900, letterSpacing: 0.2 },
  brandSub: { color: "#a9b7d5", fontWeight: 900, fontSize: 12, marginTop: 2 },
  title: { margin: "10px 0 6px 0", fontSize: 20, fontWeight: 900 },
  subtitle: { margin: 0, color: "#a9b7d5", lineHeight: 1.6, fontSize: 13 },
  linksRow: { marginTop: 12, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  link: { color: "#cfe3ff", textDecoration: "none", fontWeight: 900, fontSize: 13 },
};