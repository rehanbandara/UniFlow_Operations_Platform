import React, { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";
import { SelectInput, TextInput } from "../../components/ui/Input.jsx";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useToast } from "../../components/ui/ToastProvider.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

function hasRole(user, roleName) {
  const roles = user?.roles;
  if (!Array.isArray(roles)) return false;
  return roles.some((r) => r?.name === roleName);
}

/**
 * NOTE:
 * This assumes backend endpoints:
 * - GET  /api/admin/users
 * - PUT  /api/admin/users/{id}/role  body: { role: "ROLE_ADMIN" | "ROLE_USER" }
 *
 * If your backend differs, tell me your endpoints and I’ll align it.
 */
export default function AdminDashboard() {
  const { token, user, loading, logout } = useAuth();
  const toast = useToast();

  const isAdmin = useMemo(() => hasRole(user, "ROLE_ADMIN"), [user]);

  const [users, setUsers] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL"); // ALL | ROLE_ADMIN | ROLE_USER

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [target, setTarget] = useState(null);
  const [nextRole, setNextRole] = useState("ROLE_USER");

  const loadUsers = async () => {
    if (!token) return;
    setPageLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        toast.push({ variant: "error", title: "Session expired", message: "Please sign in again." });
        logout();
        return;
      }

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || `Failed to load users (status ${res.status})`);
      }

      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "Failed to load users.");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && token) loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, token]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const roles = Array.isArray(u?.roles) ? u.roles.map((r) => r?.name).filter(Boolean) : [];
      const matchesRole =
        roleFilter === "ALL" ? true : roles.includes(roleFilter);

      if (!matchesRole) return false;
      if (!q) return true;

      const hay = `${u?.name || ""} ${u?.email || ""} ${roles.join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [users, search, roleFilter]);

  const askChangeRole = (u, roleName) => {
    setTarget(u);
    setNextRole(roleName);
    setConfirmOpen(true);
  };

  const changeRole = async () => {
    if (!target?.id) return;
    setConfirmBusy(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/users/${encodeURIComponent(target.id)}/role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: nextRole }),
        }
      );

      if (res.status === 401) {
        toast.push({ variant: "error", title: "Session expired", message: "Please sign in again." });
        logout();
        return;
      }

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || `Role update failed (status ${res.status})`);
      }

      toast.push({ variant: "success", title: "Updated", message: `Role set to ${nextRole}.` });
      setConfirmOpen(false);
      setTarget(null);
      await loadUsers();
    } catch (e) {
      toast.push({ variant: "error", title: "Update failed", message: e?.message || "Unable to update role." });
    } finally {
      setConfirmBusy(false);
    }
  };

  if (!loading && !token) return <Navigate to="/landing" replace />;
  if (!loading && token && !isAdmin) return <Navigate to="/unauthorized" replace />;

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <div>
          <div style={styles.kicker}>Admin</div>
          <h2 style={styles.title}>User Management</h2>
          <div style={styles.subtitle}>Search users and assign roles for system access.</div>
        </div>
        <div style={styles.headerActions}>
          <Button variant="secondary" onClick={loadUsers} loading={pageLoading}>
            Refresh
          </Button>
        </div>
      </div>

      <Card style={styles.filtersCard}>
        <div style={styles.filters}>
          <TextInput
            label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, role…"
          />
          <SelectInput label="Role filter" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="ALL">All</option>
            <option value="ROLE_USER">ROLE_USER</option>
            <option value="ROLE_ADMIN">ROLE_ADMIN</option>
          </SelectInput>
        </div>
      </Card>

      {error ? (
        <Card style={styles.errorCard}>
          <EmptyState title="Couldn’t load users" description={error} actionLabel="Retry" onAction={loadUsers} />
        </Card>
      ) : pageLoading ? (
        <Card>Loading users…</Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState title="No users found" description="Try changing your search or filter." />
        </Card>
      ) : (
        <Card style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Roles</th>
                <th style={styles.thRight}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const roles = Array.isArray(u?.roles) ? u.roles.map((r) => r?.name).filter(Boolean) : [];
                const rolesText = roles.join(", ") || "-";
                const isSelf = u?.email && user?.email && u.email === user.email;

                return (
                  <tr key={u.id}>
                    <td style={styles.tdStrong}>{u?.name || "-"}</td>
                    <td style={styles.td}>{u?.email || "-"}</td>
                    <td style={styles.tdMuted}>{rolesText}</td>
                    <td style={styles.tdRight}>
                      <div style={styles.rowActions}>
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={isSelf}
                          onClick={() => askChangeRole(u, "ROLE_USER")}
                          title={isSelf ? "You cannot change your own role." : "Set as ROLE_USER"}
                        >
                          Make USER
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={isSelf}
                          onClick={() => askChangeRole(u, "ROLE_ADMIN")}
                          title={isSelf ? "You cannot change your own role." : "Set as ROLE_ADMIN"}
                        >
                          Make ADMIN
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={styles.note}>
            If “Make USER / Make ADMIN” doesn’t work, your backend admin endpoints differ. Share your endpoints and
            I’ll adjust this file exactly.
          </div>
        </Card>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Confirm role change"
        message={`Change role for "${target?.email || "this user"}" to ${nextRole}?`}
        confirmText="Confirm"
        cancelText="Cancel"
        danger={false}
        loading={confirmBusy}
        onCancel={() => {
          if (!confirmBusy) {
            setConfirmOpen(false);
            setTarget(null);
          }
        }}
        onConfirm={changeRole}
      />
    </div>
  );
}

const styles = {
  page: { display: "flex", flexDirection: "column", gap: 12 },

  headerRow: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  kicker: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(34,197,94,0.14)",
    border: "1px solid rgba(34,197,94,0.30)",
    color: "#d4ffe5",
    fontWeight: 900,
    fontSize: 12,
    letterSpacing: 0.3,
  },
  title: { margin: "8px 0 0 0", fontSize: 26, letterSpacing: 0.2 },
  subtitle: { marginTop: 6, color: "#a9b7d5", fontSize: 13, lineHeight: 1.5 },
  headerActions: { display: "flex", gap: 10, flexWrap: "wrap" },

  filtersCard: { padding: 14 },
  filters: { display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 12, alignItems: "end" },

  errorCard: { borderColor: "rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.10)" },

  tableCard: { padding: 0, overflowX: "auto" },
  table: { width: "100%", borderCollapse: "separate", borderSpacing: 0 },
  th: {
    textAlign: "left",
    padding: "12px 12px",
    color: "#a9b7d5",
    fontSize: 12,
    fontWeight: 900,
    borderBottom: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.12)",
    position: "sticky",
    top: 0,
  },
  thRight: {
    textAlign: "right",
    padding: "12px 12px",
    color: "#a9b7d5",
    fontSize: 12,
    fontWeight: 900,
    borderBottom: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.12)",
    position: "sticky",
    top: 0,
  },
  td: { padding: "12px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontWeight: 800, fontSize: 13 },
  tdStrong: { padding: "12px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontWeight: 900, fontSize: 13 },
  tdMuted: { padding: "12px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontWeight: 800, fontSize: 13, color: "#a9b7d5" },
  tdRight: { padding: "12px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", textAlign: "right" },
  rowActions: { display: "inline-flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" },
  note: { padding: 12, color: "#a9b7d5", fontSize: 12, lineHeight: 1.6 },
};