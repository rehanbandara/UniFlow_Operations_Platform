import React, { useMemo, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

function hasRole(user, roleName) {
  const roles = user?.roles;
  if (!Array.isArray(roles)) return false;
  return roles.some((r) => r?.name === roleName);
}

export default function Navbar() {
  const navigate = useNavigate();
  const { token, user, loading, logout } = useAuth();

  const isLoggedIn = !!token;
  const isAdmin = useMemo(() => hasRole(user, "ROLE_ADMIN"), [user]);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    closeMenu();
    logout();
    navigate("/landing", { replace: true });
  };

  const initials = useMemo(() => {
    const name = (user?.name || user?.email || "U").trim();
    const parts = name.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] || "U";
    const second = parts.length > 1 ? parts[1]?.[0] : "";
    return (first + second).toUpperCase();
  }, [user]);

  return (
    <header style={styles.header}>
      <div style={styles.inner}>
        <Link to={isLoggedIn ? "/" : "/landing"} style={styles.brand}>
          SmartCampus
        </Link>

        <nav style={styles.nav}>
          <NavLink to={isLoggedIn ? "/" : "/landing"} style={({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}>
            {isLoggedIn ? "Home" : "Landing"}
          </NavLink>

          {isLoggedIn && (
            <NavLink to="/facilities" style={({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}>
              Facilities
            </NavLink>
          )}

          {isLoggedIn && isAdmin && (
            <NavLink to="/dashboard" style={({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}>
              Dashboard
            </NavLink>
          )}
        </nav>

        <div style={styles.right}>
          {loading ? (
            <div style={styles.skeleton} aria-label="loading-user" />
          ) : isLoggedIn ? (
            <div style={styles.profileWrap} ref={menuRef}>
              <button
                type="button"
                style={styles.profileBtn}
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Profile menu"
                title={user?.email || "Profile"}
              >
                <div style={styles.avatar}>{initials}</div>
                <div style={styles.profileMeta}>
                  <div style={styles.profileName}>{user?.name || "User"}</div>
                  <div style={styles.profileRole}>{isAdmin ? "ADMIN" : "USER"}</div>
                </div>
                <div style={styles.chev}>{menuOpen ? "▴" : "▾"}</div>
              </button>

              {menuOpen && (
                <div style={styles.menu} onMouseLeave={closeMenu}>
                  <div style={styles.menuHeader}>
                    <div style={styles.menuEmail}>{user?.email || "-"}</div>
                    <div style={styles.menuRole}>{isAdmin ? "ROLE_ADMIN" : "ROLE_USER"}</div>
                  </div>

                  <div style={styles.menuDivider} />

                  <button type="button" style={styles.menuItem} onClick={() => { closeMenu(); navigate(isAdmin ? "/dashboard" : "/"); }}>
                    {isAdmin ? "Go to Dashboard" : "Go to Home"}
                  </button>

                  <button type="button" style={styles.menuItem} onClick={() => { closeMenu(); navigate("/facilities"); }}>
                    Facilities
                  </button>

                  <div style={styles.menuDivider} />

                  <button type="button" style={{ ...styles.menuItem, ...styles.menuDanger }} onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", gap: 10 }}>
              <Link to="/login" style={styles.secondaryBtn}>
                Login
              </Link>
              <Link to="/login" style={styles.primaryBtn} title="Sign up with Google">
                Create account
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Click-away backdrop (simple) */}
      {menuOpen && <div style={styles.backdrop} onMouseDown={closeMenu} />}
    </header>
  );
}

const styles = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    background: "rgba(11, 18, 32, 0.78)",
    borderBottom: "1px solid rgba(255,255,255,0.10)",
    backdropFilter: "blur(12px)",
  },
  inner: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "14px 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  brand: {
    color: "#e8eefc",
    fontWeight: 900,
    letterSpacing: 0.3,
    textDecoration: "none",
    fontSize: 18,
  },
  nav: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },
  navLink: {
    textDecoration: "none",
    color: "#a9b7d5",
    fontWeight: 800,
    padding: "8px 10px",
    borderRadius: 10,
  },
  navLinkActive: {
    textDecoration: "none",
    color: "#e8eefc",
    fontWeight: 900,
    padding: "8px 10px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
  },
  right: { display: "flex", alignItems: "center", gap: 10 },

  profileWrap: { position: "relative" },
  profileBtn: {
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "#e8eefc",
    padding: "8px 10px",
    borderRadius: 14,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, rgba(59,130,246,0.35), rgba(168,85,247,0.25))",
    border: "1px solid rgba(255,255,255,0.14)",
    fontWeight: 900,
    letterSpacing: 0.4,
  },
  profileMeta: { textAlign: "left", lineHeight: 1.1, maxWidth: 200 },
  profileName: {
    fontWeight: 900,
    fontSize: 13,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  profileRole: { marginTop: 3, fontWeight: 900, fontSize: 11, color: "#a9b7d5" },
  chev: { marginLeft: 2, color: "#a9b7d5", fontWeight: 900 },

  menu: {
    position: "absolute",
    top: 48,
    right: 0,
    width: 260,
    background: "rgba(15, 27, 51, 0.98)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 16,
    boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
    overflow: "hidden",
    zIndex: 60,
  },
  menuHeader: { padding: 12 },
  menuEmail: { fontWeight: 900, fontSize: 12, color: "#e8eefc", wordBreak: "break-word" },
  menuRole: {
    marginTop: 6,
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 999,
    fontWeight: 900,
    fontSize: 11,
    background: "rgba(59,130,246,0.14)",
    border: "1px solid rgba(59,130,246,0.30)",
    color: "#cfe3ff",
  },
  menuDivider: { height: 1, background: "rgba(255,255,255,0.10)" },
  menuItem: {
    width: "100%",
    textAlign: "left",
    border: "none",
    background: "transparent",
    color: "#e8eefc",
    padding: "10px 12px",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 13,
  },
  menuDanger: {
    color: "#ffd5d5",
    background: "rgba(239,68,68,0.12)",
  },

  primaryBtn: {
    textDecoration: "none",
    display: "inline-block",
    border: "1px solid rgba(255,255,255,0.18)",
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    color: "#fff",
    padding: "10px 12px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 900,
  },
  secondaryBtn: {
    textDecoration: "none",
    display: "inline-block",
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.06)",
    color: "#e8eefc",
    padding: "10px 12px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 900,
  },
  skeleton: {
    width: 170,
    height: 38,
    borderRadius: 12,
    background: "linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.12), rgba(255,255,255,0.06))",
    backgroundSize: "200% 100%",
    animation: "shine 1.2s ease-in-out infinite",
  },
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "transparent",
    zIndex: 40,
  },
};