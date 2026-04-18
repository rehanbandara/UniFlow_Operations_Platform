import React, { useMemo } from "react";
import Card from "../components/ui/Card.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import { useAuth } from "../auth/AuthContext.jsx";

function hasRole(user, roleName) {
  const roles = user?.roles;
  if (!Array.isArray(roles)) return false;
  return roles.some((r) => r?.name === roleName);
}

export default function Profile() {
  const { user } = useAuth();
  const isAdmin = useMemo(() => hasRole(user, "ROLE_ADMIN"), [user]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <PageHeader kicker="Account" title="Profile" subtitle="View your account information and access level." />

      <Card>
        <div style={styles.row}>
          <div style={styles.label}>Name</div>
          <div style={styles.value}>{user?.name || "—"}</div>
        </div>
        <div style={styles.row}>
          <div style={styles.label}>Email</div>
          <div style={styles.value}>{user?.email || "—"}</div>
        </div>
        <div style={styles.row}>
          <div style={styles.label}>Role</div>
          <div style={{ ...styles.badge, ...(isAdmin ? styles.admin : styles.user) }}>
            {isAdmin ? "ROLE_ADMIN" : "ROLE_USER"}
          </div>
        </div>
      </Card>

      <Card>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>Security</div>
        <div style={styles.muted}>
          Sign-in is handled through Google OAuth. If you believe your access level is incorrect, contact a system
          administrator.
        </div>
      </Card>
    </div>
  );
}

const styles = {
  row: { display: "grid", gridTemplateColumns: "140px 1fr", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  label: { color: "#7f90b4", fontWeight: 900, fontSize: 12, paddingTop: 2 },
  value: { fontWeight: 900 },
  muted: { color: "#a9b7d5", fontWeight: 800, fontSize: 13, lineHeight: 1.7 },
  badge: { display: "inline-block", padding: "6px 10px", borderRadius: 999, fontWeight: 900, fontSize: 12, width: "fit-content" },
  admin: { background: "rgba(34,197,94,0.14)", border: "1px solid rgba(34,197,94,0.30)", color: "#d4ffe5" },
  user: { background: "rgba(59,130,246,0.14)", border: "1px solid rgba(59,130,246,0.30)", color: "#cfe3ff" },
};