import React from "react";

/**
 * Consistent input styles (text, select, textarea).
 * Use across forms to avoid messy inline styles.
 */
export function TextInput({ label, error, style, ...rest }) {
  return (
    <div style={{ ...styles.field, ...style }}>
      {label ? <div style={styles.label}>{label}</div> : null}
      <input {...rest} style={styles.input} />
      {error ? <div style={styles.error}>{error}</div> : null}
    </div>
  );
}

export function SelectInput({ label, error, children, style, ...rest }) {
  return (
    <div style={{ ...styles.field, ...style }}>
      {label ? <div style={styles.label}>{label}</div> : null}
      <select {...rest} style={styles.input}>
        {children}
      </select>
      {error ? <div style={styles.error}>{error}</div> : null}
    </div>
  );
}

export function TextArea({ label, error, style, ...rest }) {
  return (
    <div style={{ ...styles.field, ...style }}>
      {label ? <div style={styles.label}>{label}</div> : null}
      <textarea {...rest} style={styles.textarea} />
      {error ? <div style={styles.error}>{error}</div> : null}
    </div>
  );
}

const styles = {
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { color: "#7f90b4", fontWeight: 900, fontSize: 12 },
  input: {
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.18)",
    color: "#e8eefc",
    borderRadius: 12,
    padding: "10px 12px",
    outline: "none",
    fontWeight: 800,
  },
  textarea: {
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.18)",
    color: "#e8eefc",
    borderRadius: 12,
    padding: "10px 12px",
    outline: "none",
    fontWeight: 800,
    resize: "vertical",
  },
  error: { color: "#ffd5d5", fontWeight: 900, fontSize: 12 },
};