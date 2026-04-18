import React, { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import Button from "../components/ui/Button.jsx";

function hasRole(user, roleName) {
  const roles = user?.roles;
  if (!Array.isArray(roles)) return false;
  return roles.some((r) => r?.name === roleName);
}

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const isAdmin = useMemo(() => hasRole(user, "ROLE_ADMIN"), [user]);
  const [collapsed, setCollapsed] = useState(false);

  const initials = useMemo(() => {
    const name = (user?.name || user?.email || "U").trim();
    const parts = name.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] || "U";
    const second = parts.length > 1 ? parts[1]?.[0] : "";
    return (first + second).toUpperCase();
  }, [user]);

  const doLogout = () => {
    logout();
    navigate("/landing", { replace: true });
  };

  const pageTitle = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith("/facilities/")) return "Facility Details";
    if (path.startsWith("/facilities")) return "Facilities";

    if (path.startsWith("/bookings/admin")) return "Booking Management";
    if (path.startsWith("/bookings/create")) return "Request Booking";
    if (path.startsWith("/bookings/my")) return "My Bookings";
    if (path.startsWith("/bookings")) return "Bookings";

    if (path.startsWith("/dashboard")) return "Admin Dashboard";
    if (path.startsWith("/admin")) return "User Management";
    if (path.startsWith("/profile")) return "Profile";
    if (path.startsWith("/help")) return "Help & Contact";
    if (path.startsWith("/home")) return "Home";
    return "SmartCampus";
  }, [location.pathname]);

  return (
    <div style={styles.shell}>
      <aside style={{ ...styles.sidebar, width: collapsed ? 78 : 270 }}>
        <div style={styles.brandRow}>
          <div style={styles.brandMark}>SC</div>
          {!collapsed && <div style={styles.brandText}>SmartCampus</div>}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed((v) => !v)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            style={{ marginLeft: "auto", width: 42 }}
          >
            {collapsed ? "»" : "«"}
          </Button>
        </div>

        <nav style={styles.nav}>
          <NavLink to="/home" style={({ isActive }) => (isActive ? styles.linkActive : styles.link)}>
            <span style={styles.icon}>⌂</span>
            {!collapsed && <span>Home</span>}
          </NavLink>

          <NavLink to="/facilities" style={({ isActive }) => (isActive ? styles.linkActive : styles.link)}>
            <span style={styles.icon}>🏛</span>
            {!collapsed && <span>Facilities</span>}
          </NavLink>

          <NavLink to="/bookings/my" style={({ isActive }) => (isActive ? styles.linkActive : styles.link)}>
            <span style={styles.icon}>🗓</span>
            {!collapsed && <span>My Bookings</span>}
          </NavLink>

          <NavLink to="/bookings/create" style={({ isActive }) => (isActive ? styles.linkActive : styles.link)}>
            <span style={styles.icon}>＋</span>
            {!collapsed && <span>Request Booking</span>}
          </NavLink>

          <NavLink to="/profile" style={({ isActive }) => (isActive ? styles.linkActive : styles.link)}>
            <span style={styles.icon}>👤</span>
            {!collapsed && <span>Profile</span>}
          </NavLink>

          <NavLink to="/help" style={({ isActive }) => (isActive ? styles.linkActive : styles.link)}>
            <span style={styles.icon}>?</span>
            {!collapsed && <span>Help</span>}
          </NavLink>

          {isAdmin && (
            <>
              <div style={styles.sectionLabel}>{collapsed ? "ADM" : "ADMIN"}</div>

              <NavLink to="/dashboard" style={({ isActive }) => (isActive ? styles.linkActive : styles.link)}>
                <span style={styles.icon}>▦</span>
                {!collapsed && <span>Dashboard</span>}
              </NavLink>

              <NavLink to="/admin" style={({ isActive }) => (isActive ? styles.linkActive : styles.link)}>
                <span style={styles.icon}>👥</span>
                {!collapsed && <span>Users</span>}
              </NavLink>

              <NavLink to="/bookings/admin" style={({ isActive }) => (isActive ? styles.linkActive : styles.link)}>
                <span style={styles.icon}>✅</span>
                {!collapsed && <span>Manage Bookings</span>}
              </NavLink>
            </>
          )}
        </nav>

        <div style={styles.sidebarBottom}>
          <div style={styles.userBox} title={user?.email || ""}>
            <div style={styles.avatar}>{initials}</div>
            {!collapsed && (
              <div style={{ minWidth: 0 }}>
                <div style={styles.userName}>{user?.name || "User"}</div>
                <div style={styles.userRole}>{isAdmin ? "ADMIN" : "USER"}</div>
              </div>
            )}
          </div>

          <Button variant="danger" size="sm" onClick={doLogout} style={{ width: "100%" }}>
            Logout
          </Button>
        </div>
      </aside>

      <div style={styles.right}>
        <header style={styles.topbar}>
          <div style={styles.pageTitle}>{pageTitle}</div>
          <div style={styles.topbarRight}>
            <div style={styles.email} title={user?.email || ""}>
              {user?.email || ""}
            </div>
          </div>
        </header>

        <main style={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const styles = {
  shell: {
    height: "100vh",
    display: "flex",
    background: "linear-gradient(180deg, #0b1220 0%, #0f1b33 40%, #0b1220 100%)",
    color: "#e8eefc",
    fontFamily: "Arial, sans-serif",
    overflow: "hidden",
  },
  sidebar: {
    height: "100vh",
    background: "rgba(11, 18, 32, 0.94)",
    borderRight: "1px solid rgba(255,255,255,0.10)",
    backdropFilter: "blur(10px)",
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  brandRow: { display: "flex", alignItems: "center", gap: 10 },
  brandMark: {
    width: 40,
    height: 40,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    background: "linear-gradient(135deg, rgba(59,130,246,0.35), rgba(168,85,247,0.25))",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "#e8eefc",
  },
  brandText: { fontWeight: 900, color: "#e8eefc", whiteSpace: "nowrap" },

  nav: { display: "flex", flexDirection: "column", gap: 8, marginTop: 6 },
  link: {
    textDecoration: "none",
    color: "#a9b7d5",
    fontWeight: 900,
    padding: "10px 10px",
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    gap: 10,
    border: "1px solid transparent",
  },
  linkActive: {
    textDecoration: "none",
    color: "#e8eefc",
    fontWeight: 900,
    padding: "10px 10px",
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
  },
  icon: { width: 22, display: "inline-block", textAlign: "center" },
  sectionLabel: { color: "#7f90b4", fontWeight: 900, fontSize: 11, marginTop: 10, marginBottom: 2, paddingLeft: 10 },

  sidebarBottom: { marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 },
  userBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 14,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    color: "#e8eefc",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
  },
  userName: { fontWeight: 900, color: "#e8eefc", fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  userRole: { color: "#a9b7d5", fontWeight: 900, fontSize: 11, marginTop: 3 },

  right: { flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" },
  topbar: {
    height: 58,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 16px",
    borderBottom: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(11, 18, 32, 0.55)",
    backdropFilter: "blur(10px)",
  },
  pageTitle: { fontWeight: 900, fontSize: 14, letterSpacing: 0.2 },
  topbarRight: { display: "flex", alignItems: "center", gap: 10 },
  email: { color: "#a9b7d5", fontWeight: 900, fontSize: 12, maxWidth: 360, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },

  main: { flex: 1, overflow: "auto", padding: 16 },
};