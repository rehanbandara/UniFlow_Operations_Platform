import React, { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useToast } from "../../components/ui/ToastProvider.jsx";

import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import PageHeader from "../../components/ui/PageHeader.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Breadcrumbs from "../../components/ui/Breadcrumbs.jsx";
import Modal from "../../components/ui/Modal.jsx";

import { getFacilityById } from "./facilityService.js";
import BookingRequestForm from "../booking/BookingRequestForm.jsx";
import { createBookingRequest } from "../booking/bookingService.js";

function hasRole(user, roleName) {
  const roles = user?.roles;
  if (!Array.isArray(roles)) return false;
  return roles.some((r) => r?.name === roleName);
}

export default function FacilityDetails() {
  const { id } = useParams();
  const { token, user, loading, logout } = useAuth();
  const toast = useToast();

  const isAdmin = useMemo(() => hasRole(user, "ROLE_ADMIN"), [user]);

  const [facility, setFacility] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingSaving, setBookingSaving] = useState(false);

  const load = async () => {
    if (!token) return;
    setFetching(true);
    setError("");
    try {
      const data = await getFacilityById(token, id);
      setFacility(data);
    } catch (e) {
      if (e?.status === 401) {
        toast.push({ variant: "error", title: "Session expired", message: "Please sign in again." });
        logout();
        return;
      }
      setError(e?.message || "Failed to load facility.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (!loading && token) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, token, id]);

  const submitBooking = async (payload) => {
    setBookingSaving(true);
    try {
      await createBookingRequest(token, payload);
      toast.push({ variant: "success", title: "Submitted", message: "Booking request submitted." });
      setBookingOpen(false);
    } catch (e) {
      if (e?.status === 401) {
        toast.push({ variant: "error", title: "Session expired", message: "Please sign in again." });
        logout();
        return;
      }
      toast.push({ variant: "error", title: "Request failed", message: e?.message || "Unable to submit request." });
    } finally {
      setBookingSaving(false);
    }
  };

  if (!loading && !token) return <Navigate to="/landing" replace />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Breadcrumbs
        items={[
          { label: "Home", to: "/home" },
          { label: "Facilities", to: "/facilities" },
          { label: facility?.name || "Details" },
        ]}
      />

      <PageHeader
        kicker="Facility"
        title={facility?.name || "Facility Details"}
        subtitle={facility?.location || "View facility information."}
        right={
          <>
            <Button as={Link} to="/facilities" variant="secondary">
              Back
            </Button>
            <Button variant="secondary" onClick={load} loading={fetching}>
              Refresh
            </Button>
            <Button variant="primary" onClick={() => setBookingOpen(true)} disabled={fetching || !facility}>
              Request booking
            </Button>
            {isAdmin ? (
              <Button as={Link} to="/facilities" variant="ghost" title="Edit from the facilities table">
                Admin manage
              </Button>
            ) : null}
          </>
        }
      />

      {error ? (
        <Card style={{ borderColor: "rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.10)" }}>
          <EmptyState title="Couldn’t load facility" description={error} actionLabel="Retry" onAction={load} />
        </Card>
      ) : fetching ? (
        <Card>Loading facility…</Card>
      ) : !facility ? (
        <Card>
          <EmptyState
            title="Facility not found"
            description="This facility may have been removed."
            actionLabel="Back to Facilities"
            onAction={() => (window.location.href = "/facilities")}
          />
        </Card>
      ) : (
        <>
          <div style={styles.grid}>
            <Card>
              <div style={styles.label}>Type</div>
              <div style={styles.value}>{String(facility?.type || "-").toUpperCase()}</div>
            </Card>

            <Card>
              <div style={styles.label}>Capacity</div>
              <div style={styles.value}>
                {Number.isFinite(Number(facility?.capacity)) ? facility.capacity : "-"}
              </div>
            </Card>

            <Card>
              <div style={styles.label}>Location</div>
              <div style={styles.value}>{facility?.location || "-"}</div>
            </Card>
          </div>

          <Card>
            <div style={styles.sectionTitle}>Description</div>
            <div style={styles.desc}>{facility?.description || "—"}</div>
          </Card>
        </>
      )}

      <Modal
        open={bookingOpen}
        title="Request a booking"
        subtitle="Submit a booking request for this facility. Admin approval may be required."
        onClose={bookingSaving ? undefined : () => setBookingOpen(false)}
      >
        <BookingRequestForm
          facilityId={facility?.id}
          facilityName={facility?.name}
          loading={bookingSaving}
          onCancel={() => setBookingOpen(false)}
          onSubmit={submitBooking}
        />
      </Modal>
    </div>
  );
}

const styles = {
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 },
  label: { color: "#7f90b4", fontWeight: 900, fontSize: 12, marginBottom: 6 },
  value: { fontWeight: 900, fontSize: 16 },
  sectionTitle: { fontWeight: 900, fontSize: 14, marginBottom: 8 },
  desc: { color: "#a9b7d5", fontWeight: 800, fontSize: 13, lineHeight: 1.7 },
};