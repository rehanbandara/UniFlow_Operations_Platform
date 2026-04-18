import React, { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useToast } from "../../components/ui/ToastProvider.jsx";

import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import PageHeader from "../../components/ui/PageHeader.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import { TextInput } from "../../components/ui/Input.jsx";

import { isAdmin as isAdminRole } from "../../lib/authz.js";
import { formatLocalDateTime } from "../../lib/datetime.js";
import {
  assignTicket,
  closeTicket,
  createTicket,
  getAllTickets,
  getMyTickets,
  resolveTicket,
} from "./ticketService.js";

function statusBadgeStyle(status) {
  const s = String(status || "").toUpperCase();
  if (s === "OPEN") return { background: "rgba(245,158,11,0.14)", border: "1px solid rgba(245,158,11,0.30)", color: "#ffe6bd" };
  if (s === "IN_PROGRESS") return { background: "rgba(59,130,246,0.14)", border: "1px solid rgba(59,130,246,0.30)", color: "#cfe3ff" };
  if (s === "RESOLVED") return { background: "rgba(34,197,94,0.14)", border: "1px solid rgba(34,197,94,0.30)", color: "#d4ffe5" };
  if (s === "CLOSED") return { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#a9b7d5" };
  return { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#e8eefc" };
}

function canResolve(status) {
  const s = String(status || "").toUpperCase();
  return s !== "CLOSED" && s !== "RESOLVED";
}

function canClose(status) {
  const s = String(status || "").toUpperCase();
  return s !== "CLOSED";
}

export default function IncidentManager() {
  const { token, user, loading, logout } = useAuth();
  const toast = useToast();

  const isAdmin = useMemo(() => isAdminRole(user), [user]);

  // Create form (USER)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Ticket list
  const [tickets, setTickets] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  // Admin actions
  const [busyId, setBusyId] = useState(null);
  const [assignInputs, setAssignInputs] = useState({}); // { [ticketId]: userId }

  const errors = useMemo(() => {
    const e = {};
    if (!title.trim()) e.title = "Title is required.";
    if (title.trim() && title.trim().length < 3) e.title = "Title must be at least 3 characters.";
    if (title.trim() && title.trim().length > 120) e.title = "Title must be 120 characters or less.";

    if (!description.trim()) e.description = "Description is required.";
    if (description.trim() && description.trim().length < 10) e.description = "Description must be at least 10 characters.";
    if (description.trim() && description.trim().length > 2000) e.description = "Description must be 2000 characters or less.";

    return e;
  }, [title, description]);

  const isValid = Object.keys(errors).length === 0;

  const loadTickets = async () => {
    if (!token) return;
    setFetching(true);
    setError("");
    try {
      const data = isAdmin ? await getAllTickets(token) : await getMyTickets(token);
      const list = Array.isArray(data) ? data : [];
      setTickets(list);

      // initialize assign inputs for admin view
      if (isAdmin) {
        const next = {};
        for (const t of list) {
          if (t?.id) next[t.id] = t.assignedTo || "";
        }
        setAssignInputs(next);
      }
    } catch (e) {
      if (e?.status === 401) {
        toast.push({ variant: "error", title: "Session expired", message: "Please sign in again." });
        logout();
        return;
      }
      setError(e?.message || "Failed to load tickets.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (!loading && token) loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, token, isAdmin]);

  const submit = async (ev) => {
    ev.preventDefault();
    setTouched(true);
    if (!isValid) return;

    setSubmitting(true);
    try {
      await createTicket(token, { title: title.trim(), description: description.trim() });
      toast.push({ variant: "success", title: "Ticket created", message: "Your incident was reported successfully." });
      setTitle("");
      setDescription("");
      setTouched(false);
      await loadTickets();
    } catch (e) {
      if (e?.status === 401) {
        toast.push({ variant: "error", title: "Session expired", message: "Please sign in again." });
        logout();
        return;
      }
      toast.push({ variant: "error", title: "Create failed", message: e?.message || "Unable to create ticket." });
    } finally {
      setSubmitting(false);
    }
  };

  const doAssign = async (ticket) => {
    if (!ticket?.id) return;
    const value = (assignInputs[ticket.id] || "").trim();
    if (!value) {
      toast.push({ variant: "error", title: "Missing user", message: "Please enter a userId to assign." });
      return;
    }

    setBusyId(ticket.id);
    try {
      await assignTicket(token, ticket.id, value);
      toast.push({ variant: "success", title: "Assigned", message: "Ticket assigned and marked IN_PROGRESS." });
      await loadTickets();
    } catch (e) {
      if (e?.status === 401) {
        toast.push({ variant: "error", title: "Session expired", message: "Please sign in again." });
        logout();
        return;
      }
      toast.push({ variant: "error", title: "Assign failed", message: e?.message || "Unable to assign ticket." });
    } finally {
      setBusyId(null);
    }
  };

  const doResolve = async (ticket) => {
    if (!ticket?.id) return;
    setBusyId(ticket.id);
    try {
      await resolveTicket(token, ticket.id);
      toast.push({ variant: "success", title: "Resolved", message: "Ticket marked RESOLVED." });
      await loadTickets();
    } catch (e) {
      if (e?.status === 401) {
        toast.push({ variant: "error", title: "Session expired", message: "Please sign in again." });
        logout();
        return;
      }
      toast.push({ variant: "error", title: "Resolve failed", message: e?.message || "Unable to resolve ticket." });
    } finally {
      setBusyId(null);
    }
  };

  const doClose = async (ticket) => {
    if (!ticket?.id) return;
    setBusyId(ticket.id);
    try {
      await closeTicket(token, ticket.id);
      toast.push({ variant: "success", title: "Closed", message: "Ticket marked CLOSED." });
      await loadTickets();
    } catch (e) {
      if (e?.status === 401) {
        toast.push({ variant: "error", title: "Session expired", message: "Please sign in again." });
        logout();
        return;
      }
      toast.push({ variant: "error", title: "Close failed", message: e?.message || "Unable to close ticket." });
    } finally {
      setBusyId(null);
    }
  };

  if (!loading && !token) return <Navigate to="/landing" replace />;

  const headerSubtitle = isAdmin
    ? "Manage all maintenance tickets: assign, resolve, and close."
    : "Report an issue and track your maintenance tickets.";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <PageHeader
        kicker="Maintenance"
        title="Incident Manager"
        subtitle={headerSubtitle}
        right={
          <Button variant="secondary" onClick={loadTickets} loading={fetching}>
            Refresh
          </Button>
        }
      />

      {!isAdmin ? (
        <Card style={{ padding: 16 }}>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
              <TextInput
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Projector not working"
                error={touched ? errors.title : ""}
              />
              <div />
              <TextInput
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue with enough detail (location, time, impact)…"
                error={touched ? errors.description : ""}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
              <Button type="submit" variant="primary" loading={submitting} disabled={submitting || fetching}>
                Submit ticket
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {error ? (
        <Card style={{ borderColor: "rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.10)" }}>
          <EmptyState title="Couldn’t load tickets" description={error} actionLabel="Retry" onAction={loadTickets} />
        </Card>
      ) : fetching ? (
        <Card>Loading tickets…</Card>
      ) : tickets.length === 0 ? (
        <Card>
          <EmptyState
            title={isAdmin ? "No tickets found" : "No tickets yet"}
            description={isAdmin ? "There are currently no reported incidents." : "Create your first maintenance ticket using the form above."}
            actionLabel="Refresh"
            onAction={loadTickets}
          />
        </Card>
      ) : (
        <div style={styles.grid}>
          {tickets.map((t) => {
            const statusStyle = statusBadgeStyle(t?.status);
            const assigned = t?.assignedTo ? t.assignedTo : "Unassigned";
            const createdAt = t?.createdAt ? formatLocalDateTime(t.createdAt) : "-";

            return (
              <Card key={t.id} style={{ padding: 14 }}>
                <div style={styles.topRow}>
                  <div style={{ minWidth: 0 }}>
                    <div style={styles.titleRow}>
                      <div style={styles.ticketTitle} title={t?.title || ""}>
                        {t?.title || "-"}
                      </div>
                      <div style={{ ...styles.status, ...statusStyle }}>
                        {String(t?.status || "-").toUpperCase()}
                      </div>
                    </div>
                    <div style={styles.meta}>
                      <div>
                        <span style={styles.label}>Created:</span> {createdAt}
                      </div>
                      <div>
                        <span style={styles.label}>Assigned:</span> {assigned}
                      </div>
                      {isAdmin ? (
                        <div>
                          <span style={styles.label}>Created by:</span> {t?.createdBy || "-"}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div style={styles.desc}>{t?.description || "-"}</div>

                {isAdmin ? (
                  <div style={styles.actions}>
                    <div style={{ flex: 1, minWidth: 220 }}>
                      <TextInput
                        label="Assign to (userId)"
                        value={assignInputs[t.id] ?? ""}
                        onChange={(e) => setAssignInputs((prev) => ({ ...prev, [t.id]: e.target.value }))}
                        placeholder="e.g. technician123"
                      />
                    </div>

                    <div style={styles.actionButtons}>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => doAssign(t)}
                        disabled={busyId === t.id || String(t?.status || "").toUpperCase() === "CLOSED"}
                        loading={busyId === t.id}
                        title="Assign and mark IN_PROGRESS"
                      >
                        Assign
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => doResolve(t)}
                        disabled={busyId === t.id || !canResolve(t?.status)}
                        title="Mark RESOLVED"
                      >
                        Resolve
                      </Button>

                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => doClose(t)}
                        disabled={busyId === t.id || !canClose(t?.status)}
                        title="Mark CLOSED"
                      >
                        Close
                      </Button>
                    </div>
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
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 12 },
  topRow: { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" },
  titleRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 },
  ticketTitle: { fontWeight: 900, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  status: { padding: "6px 10px", borderRadius: 999, fontWeight: 900, fontSize: 12, whiteSpace: "nowrap" },
  meta: { marginTop: 8, color: "#a9b7d5", fontWeight: 800, fontSize: 12, lineHeight: 1.6 },
  label: { color: "#7f90b4", fontWeight: 900 },
  desc: { marginTop: 10, color: "#e8eefc", fontWeight: 800, fontSize: 13, lineHeight: 1.5, whiteSpace: "pre-wrap" },
  actions: { marginTop: 12, display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" },
  actionButtons: { display: "inline-flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" },
};