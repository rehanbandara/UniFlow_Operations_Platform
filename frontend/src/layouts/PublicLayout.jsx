import React from "react";
import { Outlet } from "react-router-dom";

/**
 * Public pages are centered and clean — no sidebar.
 * Landing/Login/Signup/OAuthCallback render here.
 */
export default function PublicLayout() {
  return (
    <div style={styles.shell}>
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

const styles = {
  shell: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #0b1220 0%, #0f1b33 40%, #0b1220 100%)",
    color: "#e8eefc",
    fontFamily: "Arial, sans-serif",
  },
  main: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
};