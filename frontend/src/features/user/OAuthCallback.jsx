import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Card from "../../components/ui/Card.jsx";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useToast } from "../../components/ui/ToastProvider.jsx";

function hasRole(user, roleName) {
  const roles = user?.roles;
  if (!Array.isArray(roles)) return false;
  return roles.some((r) => r?.name === roleName);
}

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const toast = useToast();
  const { setToken, refreshMe, logout } = useAuth();

  useEffect(() => {
    const token = params.get("token");

    if (!token) {
      toast.push({ variant: "error", title: "Login failed", message: "Missing token." });
      navigate("/landing", { replace: true });
      return;
    }

    (async () => {
      try {
        setToken(token);
        const me = await refreshMe();

        if (hasRole(me, "ROLE_ADMIN")) {
          toast.push({ variant: "success", title: "Welcome", message: "Signed in as admin." });
          navigate("/dashboard", { replace: true });
        } else {
          toast.push({ variant: "success", title: "Welcome", message: "Signed in successfully." });
          navigate("/home", { replace: true });
        }
      } catch (e) {
        logout();
        toast.push({
          variant: "error",
          title: "Session error",
          message: "Could not complete sign-in. Please try again.",
        });
        navigate("/landing", { replace: true });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card style={styles.card}>
      <div style={styles.spinner} aria-label="loading" />
      <div style={styles.title}>Completing sign-in…</div>
      <div style={styles.subtitle}>Loading your profile and redirecting to the correct page.</div>
    </Card>
  );
}

const styles = {
  card: {
    width: "min(520px, 100%)",
    textAlign: "center",
    padding: 18,
  },
  title: { fontSize: 14, fontWeight: 900, marginTop: 10 },
  subtitle: { marginTop: 6, color: "#a9b7d5", fontSize: 13, lineHeight: 1.5 },
  spinner: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    border: "4px solid rgba(255,255,255,0.18)",
    borderTopColor: "rgba(59,130,246,0.9)",
    animation: "spin 1s linear infinite",
    margin: "0 auto",
  },
};