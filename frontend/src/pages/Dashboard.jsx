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

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = useMemo(() => hasRole(user, "ROLE_ADMIN"), [user]);

  const kpi = [
    { label: "Module", value: "Operations Hub" },
    { label: "Access", value: isAdmin ? "ADMIN" : "USER" },
    { label: "Status", value: "Online" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <PageHeader
        kicker="Admin"
        title="Dashboard"
        subtitle="Manage the university system modules."
        right={
          <>
            <Button as={Link} to="/facilities" variant="primary">
              Facilities
            </Button>
            <Button as={Link} to="/admin" variant="secondary">
              Users
            </Button>
          </>
        }
      />

      <div style={styles.kpiGrid}>
        {kpi.map((x) => (
          <Card key={x.label}>
            <div style={styles.kpiLabel}>{x.label}</div>
            <div style={styles.kpiValue}>{x.value}</div>
          </Card>
        ))}
      </div>

      <div style={styles.grid}>
        <Card>
          <div style={styles.cardTitle}>Facilities Management</div>
          <div style={styles.cardText}>Create, update, delete facilities and keep the directory up-to-date.</div>
          <div style={styles.actions}>
            <Button as={Link} to="/facilities" variant="primary">
              Manage Facilities
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

        <Card>
          <div style={styles.cardTitle}>Reports (future)</div>
          <div style={styles.cardText}>Usage analytics, capacity planning, audit logs.</div>
          <div style={styles.actions}>
            <Button variant="ghost" disabled>
              Coming soon
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

const styles = {
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 },
  kpiLabel: { color: "#7f90b4", fontWeight: 900, fontSize: 12, marginBottom: 6 },
  kpiValue: { fontWeight: 900, fontSize: 18 },

  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 },
  cardTitle: { fontWeight: 900, fontSize: 15, marginBottom: 6 },
  cardText: { color: "#a9b7d5", fontSize: 13, lineHeight: 1.6 },
  actions: { marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" },
};