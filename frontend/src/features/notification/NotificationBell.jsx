import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useToast } from "../../components/ui/ToastProvider.jsx";

import Button from "../../components/ui/Button.jsx";
import NotificationDropdown from "./NotificationDropdown.jsx";
import { getNotifications, markAsRead } from "./notificationService.js";

function BellIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2Z" fill="currentColor" />
      <path
        d="M18 16v-5a6 6 0 0 0-5-5.91V4a1 1 0 1 0-2 0v1.09A6 6 0 0 0 6 11v5l-2 2v1h20v-1l-2-2Z"
        fill="currentColor"
        opacity="0.9"
      />
    </svg>
  );
}

export default function NotificationBell({ pollIntervalMs = 30000 }) {
  const { token, loading, logout } = useAuth();
  const toast = useToast();

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");

  const rootRef = useRef(null);

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

  const handleMarkRead = async (n) => {
    if (!n?.id) return;

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
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!token) return;

    load();
    const t = setInterval(() => {
      if (!open) load();
    }, pollIntervalMs);

    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, token, pollIntervalMs, open]);

  useEffect(() => {
    if (!open) return;

    const onDocClick = (ev) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(ev.target)) setOpen(false);
    };

    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  if (!token) return null;

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next) load();
        }}
        title="Notifications"
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span style={{ position: "relative", display: "inline-flex" }}>
            <BellIcon size={18} />
            {unreadCount > 0 ? (
              <span style={styles.badge} aria-label={`${unreadCount} unread notifications`}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            ) : null}
          </span>
          <span style={{ fontWeight: 900 }}>Notifications</span>
        </span>
      </Button>

      <NotificationDropdown
        open={open}
        notifications={notifications}
        loading={fetching}
        error={error}
        onRefresh={load}
        onMarkRead={handleMarkRead}
        onClose={() => setOpen(false)}
      />

      {open ? (
        <div style={styles.viewAllRow}>
          <Link to="/notifications" style={styles.viewAllLink} onClick={() => setOpen(false)}>
            View all
          </Link>
        </div>
      ) : null}
    </div>
  );
}

const styles = {
  badge: {
    position: "absolute",
    top: -6,
    right: -8,
    minWidth: 18,
    height: 18,
    padding: "0 6px",
    borderRadius: 999,
    background: "rgba(239,68,68,0.95)",
    color: "#0b1020",
    fontSize: 11,
    fontWeight: 900,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(255,255,255,0.18)",
  },
  viewAllRow: {
    position: "absolute",
    right: 0,
    top: "calc(100% + 6px)",
    width: "min(420px, 92vw)",
    paddingTop: 6,
    textAlign: "right",
    pointerEvents: "none",
  },
  viewAllLink: {
    pointerEvents: "auto",
    color: "#cfe3ff",
    fontWeight: 900,
    fontSize: 12,
    textDecoration: "none",
  },
};