import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (toast) => {
      const id = crypto?.randomUUID?.() || String(Date.now() + Math.random());
      const t = {
        id,
        title: toast?.title || "Notice",
        message: toast?.message || "",
        variant: toast?.variant || "info", // info | success | error
        timeoutMs: typeof toast?.timeoutMs === "number" ? toast.timeoutMs : 3200,
      };

      setToasts((prev) => [t, ...prev]);

      if (t.timeoutMs > 0) {
        window.setTimeout(() => remove(id), t.timeoutMs);
      }
    },
    [remove]
  );

  const value = useMemo(() => ({ push, remove }), [push, remove]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div style={styles.stack} aria-live="polite" aria-relevant="additions">
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              ...styles.toast,
              ...(t.variant === "success"
                ? styles.success
                : t.variant === "error"
                  ? styles.error
                  : styles.info),
            }}
            onClick={() => remove(t.id)}
            role="status"
            title="Click to dismiss"
          >
            <div style={styles.toastTitle}>{t.title}</div>
            {t.message ? <div style={styles.toastMsg}>{t.message}</div> : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

const styles = {
  stack: {
    position: "fixed",
    top: 12,
    right: 12,
    zIndex: 200,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    width: "min(360px, calc(100vw - 24px))",
  },
  toast: {
    cursor: "pointer",
    borderRadius: 16,
    padding: "12px 12px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(15, 27, 51, 0.98)",
    boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
  },
  toastTitle: { fontWeight: 900, color: "#e8eefc", marginBottom: 4 },
  toastMsg: { color: "#a9b7d5", fontSize: 13, lineHeight: 1.4 },

  info: {
    borderColor: "rgba(59,130,246,0.35)",
  },
  success: {
    borderColor: "rgba(34,197,94,0.35)",
  },
  error: {
    borderColor: "rgba(239,68,68,0.35)",
  },
};