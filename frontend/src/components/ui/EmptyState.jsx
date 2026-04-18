import React from "react";
import Button from "./Button.jsx";

/**
 * Reusable empty/loading/error state component.
 */
export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
}) {
  return (
    <div style={styles.wrap}>
      <div style={styles.title}>{title}</div>
      {description ? <div style={styles.desc}>{description}</div> : null}
      {(actionLabel || secondaryLabel) && (
        <div style={styles.actions}>
          {secondaryLabel ? (
            <Button variant="secondary" onClick={onSecondary}>
              {secondaryLabel}
            </Button>
          ) : null}
          {actionLabel ? (
            <Button variant="primary" onClick={onAction}>
              {actionLabel}
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}

const styles = {
  wrap: {
    padding: 18,
    borderRadius: 18,
    border: "1px dashed rgba(255,255,255,0.18)",
    background: "rgba(0,0,0,0.14)",
  },
  title: { fontWeight: 900, fontSize: 15 },
  desc: { marginTop: 6, color: "#a9b7d5", fontSize: 13, lineHeight: 1.6 },
  actions: { marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" },
};