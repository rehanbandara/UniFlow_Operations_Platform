import React, { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useToast } from "../../components/ui/ToastProvider.jsx";

import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import PageHeader from "../../components/ui/PageHeader.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";

import BookingTable from "./BookingTable.jsx";
import { approveBooking, getAllBookings, rejectBooking } from "./bookingService.js";

function hasRole(user, roleName) {
  const roles = user?.roles;
  if (!Array.isArray(roles)) return false;
  return roles.some((r) => r?.name === roleName);
}

export default function AdminBookings() {
  const { token, user, loading, logout } = useAuth();
  const toast = useToast();

  const isAdmin = useMemo(() => hasRole(user, "ROLE_ADMIN"), [user]);

  const [rows, setRows] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const [busyId, setBusyId] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toReject, setToReject] = useState(null);
  const [rejecting, setRejecting] = useState(false);

  const load = async () => {
    if (!token) return;
    setFetching(true);
    setError("");
    try {
      const data = await getAllBookings(token);
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
    if (!loading && token && isAdmin) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, token, isAdmin]);

  const doApprove = async (booking) => {
    if (!booking?.id) return;
    setBusyId(booking.id);
    try {
      await approveBooking(token, booking.id);
      toast.push({ variant: "success", title: "Approved", message: "Booking approved." });
      await load();
    } catch (e) {
      if (e?.status === 401) {
        toast.push({ variant: "error", title: "Session expired", message: "Please sign in again." });
        logout();
        return;
      }
      if (e?.status === 409) {
        toast.push({ variant: "error", title: "Conflict", message: e?.message || "Time conflict during approval." });
        return;
      }
      toast.push({ variant: "error", title: "Approve failed", message: e?.message || "Unable to approve booking." });
    } finally {
      setBusyId(null);
    }
  };

  const askReject = (booking) => {
    setToReject(booking);
    setConfirmOpen(true);
  };

  const doReject = async () => {
    if (!toReject?.id) return;
    setRejecting(true);
    try {
      await rejectBooking(token, toReject.id);
      toast.push({ variant: "success", title: "Rejected", message: "Booking rejected." });
      setConfirmOpen(false);
      setToReject(null);
      await load();
    } catch (e) {
      if (e?.status === 401) {
        toast.push({ variant: "error", title: "Session expired", message: "Please sign in again." });
        logout();
        return;
      }
      toast.push({ variant: "error", title: "Reject failed", message: e?.message || "Unable to reject booking." });
    } finally {
      setRejecting(false);
    }
  };

  if (!loading && !token) return <Navigate to="/landing" replace />;
  if (!loading && token && !isAdmin) return <Navigate to="/unauthorized" replace />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <PageHeader
        kicker="Admin"
        title="Booking Management"
        subtitle="Approve or reject booking requests. Conflicts are prevented by backend."
        right={
          <Button variant="secondary" onClick={load} loading={fetching}>
            Refresh
          </Button>
        }
      />

      {error ? (
        <Card style={{ borderColor: "rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.10)" }}>
          <EmptyState title="Couldn’t load bookings" description={error} actionLabel="Retry" onAction={load} />
        </Card>
      ) : fetching ? (
        <Card>Loading bookings…</Card>
      ) : (
        <BookingTable bookings={rows} onApprove={doApprove} onReject={askReject} busyId={busyId} />
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Reject booking?"
        message={`Reject booking for facility "${toReject?.facilityId || "-"}" (user "${toReject?.userId || "-"}")?`}
        confirmText="Reject"
        cancelText="Cancel"
        danger
        loading={rejecting}
        onCancel={() => {
          if (!rejecting) {
            setConfirmOpen(false);
            setToReject(null);
          }
        }}
        onConfirm={doReject}
      />
    </div>
  );
}