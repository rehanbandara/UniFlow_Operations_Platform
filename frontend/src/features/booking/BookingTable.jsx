import React, { useMemo } from "react";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import { formatLocalDateTime } from "../../lib/datetime.js";

function statusColor(status) {
  const s = String(status || "").toUpperCase();
  if (s === "APPROVED") return "#d4ffe5";
  if (s === "PENDING") return "#ffe6bd";
  if (s === "REJECTED") return "#ffd5d5";
  if (s === "CANCELLED") return "#a9b7d5";
  return "#e8eefc";
}

export default function BookingTable({
  bookings = [],
  facilityById = null, // { [facilityId]: facility }
  onApprove,
  onReject,
  busyId = null,
}) {
  const columns = useMemo(
    () => [
      {
        key: "facilityId",
        header: "Facility",
        render: (r) => {
          const id = r?.facilityId ? String(r.facilityId) : "";
          const name = facilityById && id ? facilityById[id]?.name : null;
          const label = name ? `${name} (${id})` : (id || "-");
          return (
            <span style={{ fontWeight: 900 }} title={label}>
              {label}
            </span>
          );
        },
      },
      { key: "userId", header: "User", render: (r) => <span style={{ color: "#a9b7d5", fontWeight: 900 }}>{r?.userId || "-"}</span> },
      { key: "startTime", header: "Start", render: (r) => formatLocalDateTime(r?.startTime) },
      { key: "endTime", header: "End", render: (r) => formatLocalDateTime(r?.endTime) },
      {
        key: "status",
        header: "Status",
        render: (r) => (
          <span style={{ fontWeight: 900, color: statusColor(r?.status) }}>
            {String(r?.status || "-").toUpperCase()}
          </span>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        align: "right",
        render: (r) => {
          const s = String(r?.status || "").toUpperCase();
          const canAct = s === "PENDING";
          return (
            <div style={{ display: "inline-flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onApprove?.(r)}
                disabled={!canAct || busyId === r?.id}
                loading={busyId === r?.id}
                title={!canAct ? "Only PENDING bookings can be approved." : "Approve booking"}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => onReject?.(r)}
                disabled={!canAct || busyId === r?.id}
                title={!canAct ? "Only PENDING bookings can be rejected." : "Reject booking"}
              >
                Reject
              </Button>
            </div>
          );
        },
      },
    ],
    [onApprove, onReject, busyId, facilityById]
  );

  return (
    <Card style={{ padding: 0 }}>
      <DataTable columns={columns} rows={bookings} emptyText="No bookings found" />
    </Card>
  );
}