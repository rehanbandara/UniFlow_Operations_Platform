import React, { useEffect } from "react";
import Button from "./Button.jsx";

export default function Modal({ open, title, subtitle, children, onClose, footer }) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div style={styles.overlay} role="dialog" aria-modal="true" onMouseDown={onClose}>
      <div style={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={{ minWidth: 0 }}>
            <div style={styles.title}>{title}</div>
            {subtitle ? <div style={styles.subtitle}>{subtitle}</div> : null}
          </div>

          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close dialog">
            ✕
          </Button>
        </div>

        <div style={styles.body}>{children}</div>

        {footer ? <div style={styles.footer}>{footer}</div> : null}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.58)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    zIndex: 999,
  },
  modal: {
    width: "min(760px, 100%)",
    maxHeight: "min(86vh, 920px)",
    overflow: "auto",
    background: "rgba(15, 27, 51, 0.98)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 18,
    boxShadow: "0 24px 90px rgba(0,0,0,0.50)",
  },
  header: {
    padding: 14,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    borderBottom: "1px solid rgba(255,255,255,0.10)",
  },
  title: { fontWeight: 900, fontSize: 16, color: "#e8eefc" },
  subtitle: { marginTop: 4, color: "#a9b7d5", fontSize: 13, lineHeight: 1.4 },
  body: { padding: 14 },
  footer: {
    padding: 14,
    borderTop: "1px solid rgba(255,255,255,0.10)",
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    flexWrap: "wrap",
  },
};