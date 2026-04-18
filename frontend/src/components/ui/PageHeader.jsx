import React from "react";

/**
 * Consistent page header used across app pages.
 */
export default function PageHeader({ kicker, title, subtitle, right }) {
  return (
    <div style={styles.wrap}>
      <div>
        {kicker ? <div style={styles.kicker}>{kicker}</div> : null}
        <h2 style={styles.title}>{title}</h2>
        {subtitle ? <div style={styles.subtitle}>{subtitle}</div> : null}
      </div>
      {right ? <div style={styles.right}>{right}</div> : null}
    </div>
  );
}

const styles = {
  wrap: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  kicker: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(59,130,246,0.16)",
    border: "1px solid rgba(59,130,246,0.30)",
    color: "#cfe3ff",
    fontWeight: 900,
    fontSize: 12,
    letterSpacing: 0.3,
  },
  title: { margin: "8px 0 0 0", fontSize: 26, letterSpacing: 0.2 },
  subtitle: { marginTop: 6, color: "#a9b7d5", fontSize: 13, lineHeight: 1.5 },
  right: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" },
};