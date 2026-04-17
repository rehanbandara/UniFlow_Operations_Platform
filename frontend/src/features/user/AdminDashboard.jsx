import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";

const API_BASE_URL = "http://localhost:8081";

async function apiFetch(path, token, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401 || res.status === 403) {
    const text = await res.text().catch(() => "");
    const err = new Error(text || "Unauthorized");
    err.status = res.status;
    throw err;
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  // /api/admin/users returns JSON; /roles/assign returns JSON User
  return res.json();
}

function hasRole(user, roleName) {
  const roles = user?.roles;
  if (!Array.isArray(roles)) return false;
  return roles.some((r) => r?.name === roleName);
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { token, user, refreshMe, logout } = useAuth();

  const isAdmin = useMemo(() => hasRole(user, "ROLE_ADMIN"), [user]);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyUserId, setBusyUserId] = useState(null);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      const data = await apiFetch("/api/admin/users", token, { method: "GET" });
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      // If unauthorized, redirect away (token invalid or not admin)
      if (e?.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }
      if (e?.status === 403) {
        navigate("/unauthorized", { replace: true });
        return;
      }
      setError(e?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Ensure we have latest user roles before trying admin calls (useful after role changes)
    (async () => {
      try {
        await refreshMe();
      } catch (_) {
        // refreshMe already clears auth on invalid token
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // If user is loaded and not admin, block immediately
    if (!loading && user && !isAdmin) {
      navigate("/unauthorized", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAdmin]);

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleMakeAdmin = async (userId) => {
    if (!token) return;

    setBusyUserId(userId);
    setError("");

    try {
      await apiFetch("/api/admin/roles/assign", token, {
        method: "POST",
        body: JSON.stringify({ userId, role: "ROLE_ADMIN" }),
      });

      // Refresh user list after assignment
      await loadUsers();

      // If you assigned admin to yourself, refresh /me so ProtectedRoute/admin routing works immediately
      await refreshMe();
    } catch (e) {
      if (e?.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }
      if (e?.status === 403) {
        navigate("/unauthorized", { replace: true });
        return;
      }
      setError(e?.message || "Failed to assign role.");
    } finally {
      setBusyUserId(null);
    }
  };

  if (!token) {
    // Should normally be handled by ProtectedRoute, but keep safe
    navigate("/login", { replace: true });
    return null;
  }

  return (
    <div style={{ padding: 24, fontFamily: "Arial, sans-serif" }}>
      <h2>Admin Dashboard</h2>
      <p>Manage users and assign roles.</p>

      {error && (
        <div style={{ background: "#ffe6e6", padding: 12, marginBottom: 12 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: 12,
            }}
          >
            <thead>
              <tr>
                <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: 8 }}>Name</th>
                <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: 8 }}>Email</th>
                <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: 8 }}>Roles</th>
                <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: 8 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const rolesText = Array.isArray(u.roles) ? u.roles.map((r) => r?.name).filter(Boolean).join(", ") : "";
                const userIsAdmin = Array.isArray(u.roles) && u.roles.some((r) => r?.name === "ROLE_ADMIN");

                return (
                  <tr key={u.id}>
                    <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>{u.name}</td>
                    <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>{u.email}</td>
                    <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>{rolesText || "-"}</td>
                    <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                      <button
                        onClick={() => handleMakeAdmin(u.id)}
                        disabled={busyUserId === u.id || userIsAdmin}
                        title={userIsAdmin ? "User already has ROLE_ADMIN" : "Assign ROLE_ADMIN"}
                      >
                        {userIsAdmin ? "Already Admin" : busyUserId === u.id ? "Assigning..." : "Make Admin"}
                      </button>
                    </td>
                  </tr>
                );
              })}

              {users.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: 12 }}>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
      </div>
    </div>
  );
}