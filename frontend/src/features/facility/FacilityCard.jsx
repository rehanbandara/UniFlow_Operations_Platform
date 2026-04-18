import React, { useMemo } from "react";

function badgeColor(type) {
  const t = (type || "").toUpperCase();
  if (t === "LAB") return { bg: "rgba(59,130,246,0.18)", border: "rgba(59,130,246,0.45)", text: "#cfe3ff" };
  if (t === "ROOM") return { bg: "rgba(168,85,247,0.18)", border: "rgba(168,85,247,0.45)", text: "#f0d7ff" };
  return { bg: "rgba(255,255,255,0.10)", border: "rgba(255,255,255,0.20)", text: "#e8eefc" };
}

export default function FacilityCard({ facility, isAdmin, onEdit, onDelete, deleting = false }) {
  const type = facility?.type || "UNKNOWN";
  const colors = useMemo(() => badgeColor(type), [type]);

  return (
    <div style={styles.card}>
      <div style={styles.topRow}>
        <div style={styles.nameWrap}>
          <div style={styles.name}>{facility?.name || "Unnamed Facility"}</div>
          <div
            style={{
              ...styles.badge,
              background: colors.bg,
              borderColor: colors.border,
              color: colors.text,
            }}
            title="Facility type"
          >
            {type}
          </div>
        </div>

        {isAdmin && (
          <div style={styles.actions}>
            <button style={styles.actionBtn} onClick={onEdit} disabled={deleting} title="Edit facility">
              Edit
            </button>
            <button
              style={{ ...styles.actionBtn, ...styles.dangerBtn }}
              onClick={onDelete}
              disabled={deleting}
              title="Delete facility"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </div>

      <div style={styles.metaGrid}>
        <div style={styles.metaItem}>
          <div style={styles.metaLabel}>Capacity</div>
          <div style={styles.metaValue}>{Number.isFinite(facility?.capacity) ? facility.capacity : "-"}</div>
        </div>

        <div style={styles.metaItem}>
          <div style={styles.metaLabel}>Location</div>
          <div style={styles.metaValue}>{facility?.location || "-"}</div>
        </div>
      </div>

      {facility?.description ? (
        <div style={styles.desc} title={facility.description}>
          {facility.description}
        </div>
      ) : (
        <div style={styles.descEmpty}>No description</div>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: 14,
    boxShadow: "0 18px 60px rgba(0,0,0,0.25)",
    transition: "transform 120ms ease, border-color 120ms ease",
  },
  topRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  nameWrap: { display: "flex", flexDirection: "column", gap: 8, minWidth: 0 },
  name: {
    fontSize: 16,
    fontWeight: 900,
    color: "#e8eefc",
    lineHeight: 1.2,
    wordBreak: "break-word",
  },
  badge: {
    alignSelf: "flex-start",
    border: "1px solid",
    borderRadius: 999,
    padding: "4px 10px",
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 0.3,
  },
  actions: { display: "flex", gap: 8, flexShrink: 0 },
  actionBtn: {
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.06)",
    color: "#e8eefc",
    padding: "8px 10px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 12,
  },
  dangerBtn: {
    borderColor: "rgba(239,68,68,0.45)",
    background: "rgba(239,68,68,0.14)",
    color: "#ffd5d5",
  },
  metaGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginTop: 12,
  },
  metaItem: {
    background: "rgba(0,0,0,0.18)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 14,
    padding: 10,
    minWidth: 0,
  },
  metaLabel: { fontSize: 12, color: "#a9b7d5", fontWeight: 800, marginBottom: 4 },
  metaValue: { fontSize: 13, color: "#e8eefc", fontWeight: 800, wordBreak: "break-word" },
  desc: {
    marginTop: 10,
    color: "#c9d6f2",
    fontSize: 13,
    lineHeight: 1.35,
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  descEmpty: {
    marginTop: 10,
    color: "#7f90b4",
    fontSize: 13,
    fontStyle: "italic",
  },
};