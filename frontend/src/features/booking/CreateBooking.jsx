import React, { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useToast } from "../../components/ui/ToastProvider.jsx";

import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import PageHeader from "../../components/ui/PageHeader.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import { SelectInput, TextInput } from "../../components/ui/Input.jsx";

import { createBooking } from "./bookingService.js";
import { getAllFacilities } from "../facility/facilityService.js";

/**
 * Create booking request (ROLE_USER or ROLE_ADMIN can create).
 *
 * Sends LocalDateTime strings to backend:
 *  - input type="datetime-local" returns "YYYY-MM-DDTHH:mm"
 * which Jackson can parse into LocalDateTime by default.
 */
export default function CreateBooking() {
  const navigate = useNavigate();
  const toast = useToast();
  const { token, loading, logout } = useAuth();

  const [facilities, setFacilities] = useState([]);
  const [facLoading, setFacLoading] = useState(true);
  const [facError, setFacError] = useState("");

  const [facilityId, setFacilityId] = useState("");
  const [startTime, setStartTime] = useState(""); // "YYYY-MM-DDTHH:mm"
  const [endTime, setEndTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  const loadFacilities = async () => {
    if (!token) return;
    setFacLoading(true);
    setFacError("");
    try {
      const data = await getAllFacilities(token);
      setFacilities(Array.isArray(data) ? data : []);
    } catch (e) {
      if (e?.status === 401) {
        toast.push({ variant: "error", title: "Session expired", message: "Please sign in again." });
        logout();
        return;
      }
      setFacError(e?.message || "Failed to load facilities.");
    } finally {
      setFacLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && token) loadFacilities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, token]);

  // choose a default facility if list loads and nothing selected
  useEffect(() => {
    if (!facilityId && facilities.length > 0) {
      const first = facilities[0];
      if (first?.id) setFacilityId(String(first.id));
    }
  }, [facilities, facilityId]);

  const errors = useMemo(() => {
    const e = {};
    if (!facilityId) e.facilityId = "Facility is required.";
    if (!startTime) e.startTime = "Start time is required.";
    if (!endTime) e.endTime = "End time is required.";
    if (startTime && endTime && startTime >= endTime) e.time = "Start time must be before end time.";
    return e;
  }, [facilityId, startTime, endTime]);

  const isValid = Object.keys(errors).length === 0;

  const submit = async (ev) => {
    ev.preventDefault();
    setTouched(true);
    if (!isValid) return;

    setSubmitting(true);
    try {
      await createBooking(token, { facilityId, startTime, endTime });
      toast.push({ variant: "success", title: "Requested", message: "Booking request submitted (PENDING)." });
      navigate("/bookings/my", { replace: true });
    } catch (e) {
      if (e?.status === 401) {
        toast.push({ variant: "error", title: "Session expired", message: "Please sign in again." });
        logout();
        return;
      }
      if (e?.status === 409) {
        toast.push({
          variant: "error",
          title: "Time conflict",
          message: e?.message || "This facility is already booked for the selected time range.",
        });
        return;
      }
      toast.push({ variant: "error", title: "Request failed", message: e?.message || "Unable to create booking." });
    } finally {
      setSubmitting(false);
    }
  };

  if (!loading && !token) return <Navigate to="/landing" replace />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <PageHeader
        kicker="Bookings"
        title="Request Booking"
        subtitle="Submit a booking request. The system prevents overlapping bookings for the same facility."
        right={
          <>
            <Button as={Link} to="/bookings/my" variant="secondary">
              My bookings
            </Button>
          </>
        }
      />

      {facError ? (
        <Card style={{ borderColor: "rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.10)" }}>
          <EmptyState title="Couldn’t load facilities" description={facError} actionLabel="Retry" onAction={loadFacilities} />
        </Card>
      ) : (
        <Card style={{ padding: 16 }}>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
              <SelectInput
                label="Facility"
                value={facilityId}
                onChange={(e) => setFacilityId(e.target.value)}
                disabled={facLoading || facilities.length === 0}
                error={touched ? errors.facilityId : ""}
              >
                {facLoading ? <option value="">Loading…</option> : null}
                {!facLoading && facilities.length === 0 ? <option value="">No facilities available</option> : null}
                {facilities.map((f) => (
                  <option key={f.id} value={String(f.id)}>
                    {f?.name ? `${f.name} (${f.id})` : String(f.id)}
                  </option>
                ))}
              </SelectInput>

              <TextInput
                label="Start time"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                error={touched ? errors.startTime : ""}
              />

              <TextInput
                label="End time"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                error={touched ? errors.endTime : ""}
              />
            </div>

            {touched && errors.time ? (
              <div style={{ color: "#ffd5d5", fontWeight: 900, fontSize: 12 }}>{errors.time}</div>
            ) : null}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
              <Button type="button" variant="secondary" onClick={() => navigate(-1)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={submitting} disabled={submitting || facLoading}>
                Submit request
              </Button>
            </div>

            <div style={{ marginTop: 6, color: "#a9b7d5", fontWeight: 800, fontSize: 12, lineHeight: 1.6 }}>
              Notes:
              <ul style={{ margin: "6px 0 0 18px" }}>
                <li>Bookings are created as <strong>PENDING</strong> by default.</li>
                <li>Admins can approve or reject bookings.</li>
                <li>Time conflicts are blocked: (startA &lt; endB) AND (endA &gt; startB).</li>
              </ul>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}