import React from "react";

const VARIANTS = {
  info: {
    background: "rgba(59,130,246,0.14)",
    border: "1px solid rgba(59,130,246,0.30)",
    color: "#cfe3ff",
  },
  success: {
    background: "rgba(34,197,94,0.14)",
    border: "1px solid rgba(34,197,94,0.30)",
    color: "#d4ffe5",
  },
  warning: {
    background: "rgba(245,158,11,0.14)",
    border: "1px solid rgba(245,158,11,0.30)",
    color: "#ffe6bd",
  },
  danger: {
    background: "rgba(239,68,68,0.14)",
    border: "1px solid rgba(239,68,68,0.30)",
    color: "#ffd5d5",
  },
  neutral: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#e8eefc",
  },
};

export default function Badge({ variant = "neutral", children, style }) {
  const v = VARIANTS[variant] || VARIANTS.neutral;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
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