import React, { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useToast } from "../../components/ui/ToastProvider.jsx";

import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import PageHeader from "../../components/ui/PageHeader.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";
import { TextInput } from "../../components/ui/Input.jsx";

import BookingTable from "./BookingTable.jsx";
import { approveBooking, getAllBookings, rejectBooking } from "./bookingService.js";
import { getAllFacilities } from "../facility/facilityService.js";
import { isAdmin as isAdminRole } from "../../lib/authz.js";

export default function AdminBookings() {
  const { token, user, loading, logout } = useAuth();
  const toast = useToast();

  const isAdmin = useMemo(() => isAdminRole(user), [user]);

  const [rows, setRows] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const [facilities, setFacilities] = useState([]);
  const [facLoading, setFacLoading] = useState(true);

  const facilityById = useMemo(() => {
    const map = {};
    for (const f of facilities) {
      if (f?.id != null) map[String(f.id)] = f;
    }
    return map;
  }, [facilities]);

  const [busyId, setBusyId] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toReject, setToReject] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const loadFacilities = async () => {
    if (!token) return;
    setFacLoading(true);
    try {
      const data = await getAllFacilities(token);
      setFacilities(Array.isArray(data) ? data : []);
    } catch {
      // ok: admin can still manage bookings with facilityId fallback
    } finally {
      setFacLoading(false);
    }
  };

  const loadBookings = async () => {
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

  const loadAll = async () => {
    await Promise.all([loadFacilities(), loadBookings()]);
  };

  useEffect(() => {
    if (!loading && token && isAdmin) loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, token, isAdmin]);

  const doApprove = async (booking) => {
    if (!booking?.id) return;
    setBusyId(booking.id);
    try {
      await approveBooking(token, booking.id);
      toast.push({ variant: "success", title: "Approved", message: "Booking approved." });
      await loadBookings();
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
    setRejectReason("");
    setConfirmOpen(true);
  };

  const doReject = async () => {
    if (!toReject?.id) return;
    setRejecting(true);
    try {
      await rejectBooking(token, toReject.id, rejectReason);
      toast.push({ variant: "success", title: "Rejected", message: "Booking rejected." });
      setConfirmOpen(false);
      setToReject(null);
      setRejectReason("");
      await loadBookings();
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
        subtitle="Approve or reject booking requests. Conflicts are blocked by the backend."
        right={
          <Button variant="secondary" onClick={loadAll} loading={fetching || facLoading}>
            Refresh
          </Button>
        }
      />

      {error ? (
        <Card style={{ borderColor: "rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.10)" }}>
          <EmptyState title="Couldn’t load bookings" description={error} actionLabel="Retry" onAction={loadBookings} />
        </Card>
      ) : fetching ? (
        <Card>Loading bookings…</Card>
      ) : (
        <BookingTable
          bookings={rows}
          facilityById={facilityById}
          onApprove={doApprove}
          onReject={askReject}
          busyId={busyId}
        />
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Reject booking?"
        message={
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              Reject booking for facility <strong>{toReject?.facilityId || "-"}</strong> (user{" "}
              <strong>{toReject?.userId || "-"}</strong>)?
            </div>
            <TextInput
              label="Reason (optional)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Maintenance / not available / invalid timing"
            />
          </div>
        }
        confirmText="Reject"
        cancelText="Cancel"
        danger
        loading={rejecting}
        onCancel={() => {
          if (!rejecting) {
            setConfirmOpen(false);
            setToReject(null);
            setRejectReason("");
          }
        }}
        onConfirm={doReject}
      />
    </div>
  );
}