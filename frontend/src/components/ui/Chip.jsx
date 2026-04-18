import React from "react";

/**
 * Small pill-style component (used for status tags, filters, etc).
 */
export default function Chip({ children, variant = "neutral", style }) {
  const v = VARIANTS[variant] || VARIANTS.neutral;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 10px",
        borderRadius: 999,
        fontWeight: 900,
        fontSize: 12,
        ...v,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

const VARIANTS = {
  neutral: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#e8eefc",
  },
  info: {
    background: "rgba(59,130,246,0.14)",
    border: "1px solid rgba(59,130,246,0.30)",
    color: "#cfe3ff",
  },
  warning: {
    background: "rgba(245,158,11,0.14)",
    border: "1px solid rgba(245,158,11,0.30)",
    color: "#ffe6bd",
  },
  success: {
    background: "rgba(34,197,94,0.14)",
    border: "1px solid rgba(34,197,94,0.30)",
    color: "#d4ffe5",
  },
  danger: {
    background: "rgba(239,68,68,0.14)",
    border: "1px solid rgba(239,68,68,0.30)",
    color: "#ffd5d5",
  },
};