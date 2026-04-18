import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

export default function Layout() {
  return (
    <div style={styles.shell}>
      <Navbar />
      <main style={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

const styles = {
  shell: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #0b1220 0%, #0f1b33 40%, #0b1220 100%)",
  },
  main: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "18px",
    fontFamily: "Arial, sans-serif",
    color: "#e8eefc",
  },
};