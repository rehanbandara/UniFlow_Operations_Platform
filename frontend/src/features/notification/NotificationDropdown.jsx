import React from "react";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import { formatLocalDateTime } from "../../lib/datetime.js";

export default function NotificationDropdown({
  open,
  notifications = [],
  loading = false,
  error = "",
  onRefresh,
  onMarkRead,
  onClose,
}) {
  if (!open) return null;

  return (
    <div style={styles.wrap}>
      <Card style={styles.card}>
        <div style={styles.header}>
          <div style={styles.title}>Notifications</div>
          <div style={styles.headerActions}>
            {onRefresh ? (
              <Button variant="secondary" size="sm" onClick={onRefresh} disabled={loading}>
                Refresh
              </Button>
            ) : null}
            {onClose ? (
              <Button variant="secondary" size="sm" onClick={onClose}>
                Close
              </Button>
            ) : null}
          </div>
        </div>

        {error ? (
          <div style={{ padding: 12 }}>
            <EmptyState title="Couldn’t load notifications" description={error} actionLabel="Retry" onAction={onRefresh} />
          </div>
        ) : loading ? (
          <div style={styles.loading}>Loading…</div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: 12 }}>
            <EmptyState title="No notifications" description="You’re all caught up." />
          </div>
        ) : (
          <div style={styles.list}>
            {notifications.map((n) => {
              const unread = !n?.read;
              return (
                <button
                  key={n.id}
                  type="button"
                  style={{ ...styles.item, ...(unread ? styles.unreadItem : null) }}
                  onClick={() => {
                    if (unread) onMarkRead?.(n);
                  }}
                  title={unread ? "Click to mark as read" : "Read"}
                >
                  <div style={styles.itemTop}>
                    <div style={{ ...styles.message, ...(unread ? styles.unreadText : null) }}>
                      {n?.message || "-"}
                    </div>
                    <div style={{ ...styles.badge, ...(unread ? styles.badgeUnread : styles.badgeRead) }}>
                      {unread ? "UNREAD" : "READ"}
                    </div>
                  </div>

                  <div style={styles.metaRow}>
                    <div style={styles.time}>{formatLocalDateTime(n?.createdAt)}</div>

                    {unread ? (
                      <span style={styles.hint}>Click to mark read</span>
                    ) : (
                      <span style={styles.hint}> </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

const styles = {
  wrap: {
    position: "absolute",
    top: "calc(100% + 10px)",
    right: 0,
    width: "min(420px, 92vw)",
    zIndex: 50,
  },
  card: {
    padding: 0,
    overflow: "hidden",
  },
  header: {
    padding: "12px 12px 10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.02)",
  },
  title: { fontWeight: 900, fontSize: 13 },
  headerActions: { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" },

  loading: { padding: 12, color: "#a9b7d5", fontWeight: 800, fontSize: 13 },

  list: { maxHeight: "min(420px, 60vh)", overflowY: "auto" },
  item: {
    width: "100%",
    textAlign: "left",
    padding: 12,
    border: "none",
    background: "transparent",
    color: "inherit",
    cursor: "pointer",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  unreadItem: {
    background: "rgba(59,130,246,0.08)",
  },
  itemTop: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 },
  message: { fontWeight: 800, fontSize: 13, lineHeight: 1.35 },
  unreadText: { color: "#e8eefc" },

  badge: { fontWeight: 900, fontSize: 11, padding: "4px 8px", borderRadius: 999, whiteSpace: "nowrap" },
  badgeUnread: { background: "rgba(59,130,246,0.16)", border: "1px solid rgba(59,130,246,0.30)", color: "#cfe3ff" },
  badgeRead: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#a9b7d5" },

  metaRow: { marginTop: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 },
  time: { color: "#a9b7d5", fontWeight: 800, fontSize: 12 },
  hint: { color: "#7f90b4", fontWeight: 900, fontSize: 11 },
};