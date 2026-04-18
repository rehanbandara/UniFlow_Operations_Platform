import React, { useMemo } from "react";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import { formatLocalDateTime } from "../../lib/datetime.js";

function statusStyles(status) {
  const s = String(status || "").toUpperCase();
  if (s === "APPROVED") return { background: "rgba(34,197,94,0.14)", border: "1px solid rgba(34,197,94,0.30)", color: "#d4ffe5" };
  if (s === "PENDING") return { background: "rgba(245,158,11,0.14)", border: "1px solid rgba(245,158,11,0.30)", color: "#ffe6bd" };
  if (s === "REJECTED") return { background: "rgba(239,68,68,0.14)", border: "1px solid rgba(239,68,68,0.30)", color: "#ffd5d5" };
  if (s === "CANCELLED") return { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#a9b7d5" };
  return { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#e8eefc" };
}

export default function BookingCard({ booking, facilityName, onCancel, cancelLoading = false }) {
  const canCancel = useMemo(() => {
    const s = String(booking?.status || "").toUpperCase();
    return s === "PENDING" || s === "APPROVED";
  }, [booking?.status]);

  const statusStyle = useMemo(() => statusStyles(booking?.status), [booking?.status]);

  const facilityLabel = facilityName || booking?.facilityId || "-";

  const isRejected = String(booking?.status || "").toUpperCase() === "REJECTED";
  const rejectReason = booking?.rejectReason || "";

  return (
    <Card style={{ padding: 14 }}>
      <div style={styles.topRow}>
        <div style={{ minWidth: 0 }}>
          <div style={styles.facility} title={facilityLabel}>
            Facility: <span style={{ color: "#cfe3ff" }}>{facilityLabel}</span>
          </div>
          <div style={styles.time}>
            {formatLocalDateTime(booking?.startTime)} → {formatLocalDateTime(booking?.endTime)}
          </div>
        </div>

        <div style={{ ...styles.status, ...statusStyle }}>{String(booking?.status || "-").toUpperCase()}</div>
      </div>

      <div style={styles.meta}>
        <div>
          <span style={styles.label}>Booking ID:</span> {booking?.id || "-"}
        </div>

        {isRejected && rejectReason ? (
          <div style={{ marginTop: 6 }}>
            <span style={styles.label}>Reason:</span> {rejectReason}
          </div>
        ) : null}
      </div>

      {canCancel ? (
        <div style={styles.actions}>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onCancel?.(booking)}
            disabled={cancelLoading}
            loading={cancelLoading}
          >
            Cancel
          </Button>
        </div>
      ) : null}
    </Card>
  );
}

const styles = {
  topRow: { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" },
  facility: { fontWeight: 900, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  time: { marginTop: 6, color: "#a9b7d5", fontWeight: 800, fontSize: 13 },
  status: { padding: "6px 10px", borderRadius: 999, fontWeight: 900, fontSize: 12, whiteSpace: "nowrap" },
  meta: { marginTop: 10, color: "#a9b7d5", fontWeight: 800, fontSize: 12, lineHeight: 1.6 },
  label: { color: "#7f90b4", fontWeight: 900 },
  actions: { marginTop: 12, display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" },
};