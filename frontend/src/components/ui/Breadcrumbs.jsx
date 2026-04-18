import React from "react";
import { Link } from "react-router-dom";

/**
 * Minimal breadcrumbs for practical navigation.
 * items: [{ label, to? }]
 */
export default function Breadcrumbs({ items = [] }) {
  if (!items.length) return null;

  return (
    <div style={styles.wrap} aria-label="breadcrumbs">
      {items.map((it, idx) => {
        const last = idx === items.length - 1;
        return (
          <span key={`${it.label}-${idx}`} style={styles.item}>
            {it.to && !last ? (
              <Link to={it.to} style={styles.link}>
                {it.label}
              </Link>
            ) : (
              <span style={last ? styles.current : styles.text}>{it.label}</span>
            )}
            {!last ? <span style={styles.sep}>/</span> : null}
          </span>
        );
      })}
    </div>
  );
}

const styles = {
  wrap: { color: "#7f90b4", fontWeight: 900, fontSize: 12, display: "flex", flexWrap: "wrap", gap: 6 },
  item: { display: "inline-flex", alignItems: "center", gap: 6 },
  sep: { opacity: 0.6 },
  link: { color: "#cfe3ff", textDecoration: "none" },
  text: { color: "#7f90b4" },
  current: { color: "#a9b7d5" },
};