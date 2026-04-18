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
import BookingListSkeleton from "./BookingListSkeleton.jsx";
import { cancelBooking, getMyBookings } from "./bookingService.js";
import { getAllFacilities } from "../facility/facilityService.js";

export default function MyBookings() {
  const { token, loading, logout } = useAuth();
  const toast = useToast();

  const [rows, setRows] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const [facilities, setFacilities] = useState([]);
  const [facLoading, setFacLoading] = useState(true);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toCancel, setToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const facilityById = useMemo(() => {
    const map = {};
    for (const f of facilities) {
      if (f?.id != null) map[String(f.id)] = f;
    }
    return map;
  }, [facilities]);

  const loadFacilities = async () => {
    if (!token) return;
    setFacLoading(true);
    try {
      const data = await getAllFacilities(token);
      setFacilities(Array.isArray(data) ? data : []);
    } catch {
      // If facilities can't load, we still show bookings with facilityId fallback.
    } finally {
      setFacLoading(false);
    }
  };

  const loadBookings = async () => {
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

  const loadAll = async () => {
    await Promise.all([loadFacilities(), loadBookings()]);
  };

  useEffect(() => {
    if (!loading && token) loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, token]);

  const sorted = useMemo(() => [...rows], [rows]);

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
      await loadBookings();
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

  const showSkeleton = fetching || facLoading;

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
            <Button variant="secondary" onClick={loadAll} loading={showSkeleton}>
              Refresh
            </Button>
          </>
        }
      />

      {error ? (
        <Card style={{ borderColor: "rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.10)" }}>
          <EmptyState title="Couldn’t load bookings" description={error} actionLabel="Retry" onAction={loadBookings} />
        </Card>
      ) : showSkeleton ? (
        <BookingListSkeleton count={6} />
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
          {sorted.map((b) => {
            const fid = b?.facilityId != null ? String(b.facilityId) : "";
            const f = fid ? facilityById[fid] : null;
            const facilityName = f?.name ? `${f.name} (${fid})` : null;

            return (
              <BookingCard
                key={b.id}
                booking={b}
                facilityName={facilityName}
                onCancel={askCancel}
                cancelLoading={cancelling && toCancel?.id === b.id}
              />
            );
          })}
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