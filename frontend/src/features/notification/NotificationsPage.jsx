import React, { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useToast } from "../../components/ui/ToastProvider.jsx";

import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import PageHeader from "../../components/ui/PageHeader.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import { formatLocalDateTime } from "../../lib/datetime.js";

import { getNotifications, markAsRead } from "./notificationService.js";

function badgeStyle(unread) {
  return unread
    ? { background: "rgba(59,130,246,0.16)", border: "1px solid rgba(59,130,246,0.30)", color: "#cfe3ff" }
    : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#a9b7d5" };
}

export default function NotificationsPage() {
  const { token, loading, logout } = useAuth();
  const toast = useToast();

  const [notifications, setNotifications] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const unreadCount = useMemo(
    () => notifications.filter((n) => n && n.read === false).length,
    [notifications]
  );

  const load = async () => {
    if (!token) return;
    setFetching(true);
    setError("");
    try {
      const data = await getNotifications(token);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (e) {
      if (e?.status === 401) {
        toast.push({ variant: "error", title: "Session expired", message: "Please sign in again." });
        logout();
        return;
      }
      setError(e?.message || "Failed to load notifications.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (!loading && token) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, token]);

  const doMarkRead = async (n) => {
    if (!n?.id) return;
    setBusyId(n.id);

    // optimistic update
    setNotifications((prev) => prev.map((x) => (x?.id === n.id ? { ...x, read: true } : x)));

    try {
      await markAsRead(token, n.id);
    } catch (e) {
      // rollback
      setNotifications((prev) => prev.map((x) => (x?.id === n.id ? { ...x, read: false } : x)));

      if (e?.status === 401) {
        toast.push({ variant: "error", title: "Session expired", message: "Please sign in again." });
        logout();
        return;
      }
      toast.push({ variant: "error", title: "Update failed", message: e?.message || "Unable to mark as read." });
    } finally {
      setBusyId(null);
    }
  };

  if (!loading && !token) return <Navigate to="/landing" replace />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <PageHeader
        kicker="Account"
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : "You’re all caught up."}
        right={
          <Button variant="secondary" onClick={load} loading={fetching}>
            Refresh
          </Button>
        }
      />

      {error ? (
        <Card style={{ borderColor: "rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.10)" }}>
          <EmptyState title="Couldn’t load notifications" description={error} actionLabel="Retry" onAction={load} />
        </Card>
      ) : fetching ? (
        <Card>Loading notifications…</Card>
      ) : notifications.length === 0 ? (
        <Card>
          <EmptyState title="No notifications" description="You have no notifications yet." actionLabel="Refresh" onAction={load} />
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {notifications.map((n) => {
            const unread = n?.read === false;
            return (
              <Card key={n.id} style={{ padding: 14 }}>
                <div style={styles.rowTop}>
                  <div style={styles.message}>{n?.message || "-"}</div>
                  <div style={{ ...styles.badge, ...badgeStyle(unread) }}>{unread ? "UNREAD" : "READ"}</div>
                </div>

                <div style={styles.meta}>
                  <span style={styles.label}>Time:</span> {formatLocalDateTime(n?.createdAt)}
                </div>

                {unread ? (
                  <div style={styles.actions}>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => doMarkRead(n)}
                      loading={busyId === n.id}
                      disabled={busyId === n.id}
                    >
                      Mark as read
                    </Button>
                  </div>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  rowTop: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, flexWrap: "wrap" },
  message: { fontWeight: 900, fontSize: 13, lineHeight: 1.4, whiteSpace: "pre-wrap" },
  badge: { fontWeight: 900, fontSize: 11, padding: "4px 8px", borderRadius: 999, whiteSpace: "nowrap" },
  meta: { marginTop: 8, color: "#a9b7d5", fontWeight: 800, fontSize: 12, lineHeight: 1.6 },
  label: { color: "#7f90b4", fontWeight: 900 },
  actions: { marginTop: 10, display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" },
};