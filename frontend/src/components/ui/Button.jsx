import React from "react";

const VARIANTS = {
  primary: {
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    borderColor: "rgba(255,255,255,0.18)",
    color: "#fff",
  },
  secondary: {
    background: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.18)",
    color: "#e8eefc",
  },
  danger: {
    background: "rgba(239,68,68,0.14)",
    borderColor: "rgba(239,68,68,0.35)",
    color: "#ffd5d5",
  },
  ghost: {
    background: "transparent",
    borderColor: "rgba(255,255,255,0.12)",
    color: "#e8eefc",
  },
};

const SIZES = {
  sm: { padding: "8px 10px", fontSize: 12, borderRadius: 12 },
  md: { padding: "10px 12px", fontSize: 13, borderRadius: 12 },
  lg: { padding: "12px 14px", fontSize: 14, borderRadius: 14 },
};

export default function Button({
  as: As = "button",
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  style,
  children,
  ...rest
}) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;

  const isDisabled = disabled || loading;

  return (
    <As
      {...rest}
      disabled={As === "button" ? isDisabled : undefined}
      aria-disabled={As !== "button" ? isDisabled : undefined}
      style={{
        border: "1px solid",
        cursor: isDisabled ? "not-allowed" : "pointer",
        fontWeight: 900,
        letterSpacing: 0.2,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        textDecoration: "none",
        opacity: isDisabled ? 0.75 : 1,
        ...s,
        ...v,
        ...style,
      }}
    >
      {loading && <span style={styles.spinner} />}
      {children}
    </As>
  );
}

const styles = {
  spinner: {
    width: 14,
    height: 14,
    borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.35)",
    borderTopColor: "rgba(255,255,255,0.95)",
    animation: "spin 1s linear infinite",
  },
};