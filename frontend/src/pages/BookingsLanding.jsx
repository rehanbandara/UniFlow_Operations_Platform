import React, { useMemo } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";

function hasRole(user, roleName) {
  const roles = user?.roles;
  if (!Array.isArray(roles)) return false;
  return roles.some((r) => r?.name === roleName);
}

/**
 * Optional convenience landing page for bookings.
 * You can route "/bookings" here.
 */
export default function BookingsLanding() {
  const { user, token, loading } = useAuth();
  const isAdmin = useMemo(() => hasRole(user, "ROLE_ADMIN"), [user]);

  if (!loading && !token) return <Navigate to="/landing" replace />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <PageHeader
        kicker="Bookings"
        title="Bookings"
        subtitle="Request and manage facility bookings."
      />

      <div style={styles.grid}>
        <Card>
          <div style={styles.title}>Request booking</div>
          <div style={styles.text}>Create a booking request for a facility (lab/room) and choose a time window.</div>
          <div style={styles.actions}>
            <Button as={Link} to="/bookings/create" variant="primary">
              Create booking
            </Button>
          </div>
        </Card>

        <Card>
          <div style={styles.title}>My bookings</div>
          <div style={styles.text}>View your requests and cancel pending/approved bookings.</div>
          <div style={styles.actions}>
            <Button as={Link} to="/bookings/my" variant="secondary">
              View my bookings
            </Button>
          </div>
        </Card>

        {isAdmin ? (
          <Card>
            <div style={styles.title}>Admin: Manage bookings</div>
            <div style={styles.text}>Approve/reject booking requests. Conflicts are blocked by the backend.</div>
            <div style={styles.actions}>
              <Button as={Link} to="/bookings/admin" variant="secondary">
                Admin bookings
              </Button>
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

const styles = {
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 },
  title: { fontWeight: 900, fontSize: 15, marginBottom: 6 },
  text: { color: "#a9b7d5", fontSize: 13, lineHeight: 1.6, fontWeight: 800 },
  actions: { marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" },
};