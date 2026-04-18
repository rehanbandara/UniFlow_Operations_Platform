import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import { useAuth } from "../auth/AuthContext.jsx";

function hasRole(user, roleName) {
  const roles = user?.roles;
  if (!Array.isArray(roles)) return false;
  return roles.some((r) => r?.name === roleName);
}

export default function Home() {
  const { user } = useAuth();
  const isAdmin = useMemo(() => hasRole(user, "ROLE_ADMIN"), [user]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <PageHeader
        kicker="Portal"
        title={`Welcome${user?.name ? `, ${user.name}` : ""}`}
        subtitle="University operations hub — quick access to modules."
        right={<Button as={Link} to="/facilities" variant="primary">Open Facilities</Button>}
      />

      <div style={styles.grid}>
        <Card>
          <div style={styles.cardTitle}>Facilities Directory</div>
          <div style={styles.cardText}>Browse labs/rooms and view capacity and location details.</div>
          <div style={styles.actions}>
            <Button as={Link} to="/facilities" variant="primary">
              View Facilities
            </Button>
          </div>
        </Card>

        {isAdmin ? (
          <>
            <Card>
              <div style={styles.cardTitle}>Admin Dashboard</div>
              <div style={styles.cardText}>Administration shortcuts and overview.</div>
              <div style={styles.actions}>
                <Button as={Link} to="/dashboard" variant="secondary">
                  Open Dashboard
                </Button>
              </div>
            </Card>

            <Card>
              <div style={styles.cardTitle}>User Management</div>
              <div style={styles.cardText}>Assign roles and manage access permissions.</div>
              <div style={styles.actions}>
                <Button as={Link} to="/admin" variant="secondary">
                  Manage Users
                </Button>
              </div>
            </Card>
          </>
        ) : (
          <Card>
            <div style={styles.cardTitle}>Your Access</div>
            <div style={styles.cardText}>
              You have read-only access. Contact an administrator if you need management permissions.
            </div>
          </Card>
        )}
      </div>

      <Card>
        <div style={styles.cardTitle}>Profile</div>
        <div style={{ color: "#a9b7d5", fontWeight: 900, fontSize: 13, lineHeight: 1.8 }}>
          <div>
            <span style={styles.label}>Email:</span> {user?.email || "-"}
          </div>
          <div>
            <span style={styles.label}>Role:</span> {isAdmin ? "ROLE_ADMIN" : "ROLE_USER"}
          </div>
        </div>
      </Card>
    </div>
  );
}

const styles = {
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 },
  cardTitle: { fontWeight: 900, fontSize: 15, marginBottom: 6 },
  cardText: { color: "#a9b7d5", fontSize: 13, lineHeight: 1.6 },
  actions: { marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" },
  label: { color: "#7f90b4" },
};