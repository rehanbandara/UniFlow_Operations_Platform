import React, { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useToast } from "../../components/ui/ToastProvider.jsx";

import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import PageHeader from "../../components/ui/PageHeader.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";

import BookingCard from "./BookingCard.jsx";
import { cancelBooking, getMyBookings } from "./bookingService.js";

export default function MyBookings() {
  const { token, loading, logout } = useAuth();
  const toast = useToast();

  const [rows, setRows] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toCancel, setToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const load = async () => {
    if (!token) return;
    setFetching(true);
    setError("");
    try {
      const data = await getMyBookings(token);
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      if (e?.status === 401) {
        toast.push({ variant: "error", title: "Session expired", message: "Please sign in again." });
        logout();
        return;
      }
      setError(e?.message || "Failed to load bookings.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (!loading && token) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, token]);

  const sorted = useMemo(() => {
    // service already returns desc, but keep stable
    return [...rows];
  }, [rows]);

  const askCancel = (booking) => {
    setToCancel(booking);
    setConfirmOpen(true);
  };

  const doCancel = async () => {
    if (!toCancel?.id) return;
    setCancelling(true);
    try {
      await cancelBooking(token, toCancel.id);
      toast.push({ variant: "success", title: "Cancelled", message: "Booking cancelled successfully." });
      setConfirmOpen(false);
      setToCancel(null);
      await load();
    } catch (e) {
      if (e?.status === 401) {
        toast.push({ variant: "error", title: "Session expired", message: "Please sign in again." });
        logout();
        return;
      }
      toast.push({ variant: "error", title: "Cancel failed", message: e?.message || "Unable to cancel booking." });
    } finally {
      setCancelling(false);
    }
  };

  if (!loading && !token) return <Navigate to="/landing" replace />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <PageHeader
        kicker="Bookings"
        title="My Bookings"
        subtitle="Your booking requests and their current status."
        right={
          <>
            <Button as={Link} to="/bookings/create" variant="primary">
              + Request booking
            </Button>
            <Button variant="secondary" onClick={load} loading={fetching}>
              Refresh
            </Button>
          </>
        }
      />

      {error ? (
        <Card style={{ borderColor: "rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.10)" }}>
          <EmptyState title="Couldn’t load bookings" description={error} actionLabel="Retry" onAction={load} />
        </Card>
      ) : fetching ? (
        <Card>Loading bookings…</Card>
      ) : sorted.length === 0 ? (
        <Card>
          <EmptyState
            title="No bookings yet"
            description="Create your first booking request."
            actionLabel="Request booking"
            onAction={() => (window.location.href = "/bookings/create")}
          />
        </Card>
      ) : (
        <div style={styles.grid}>
          {sorted.map((b) => (
            <BookingCard key={b.id} booking={b} onCancel={askCancel} cancelLoading={cancelling && toCancel?.id === b.id} />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Cancel booking?"
        message={`Cancel booking for facility "${toCancel?.facilityId || "-"}"?`}
        confirmText="Cancel booking"
        cancelText="Back"
        danger
        loading={cancelling}
        onCancel={() => {
          if (!cancelling) {
            setConfirmOpen(false);
            setToCancel(null);
          }
        }}
        onConfirm={doCancel}
      />
    </div>
  );
}

const styles = {
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 12 },
};