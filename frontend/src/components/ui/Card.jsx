import React from "react";

export default function Card({ children, style, ...rest }) {
  return (
    <div
      {...rest}
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 18,
        padding: 16,
        boxShadow: "0 20px 70px rgba(0,0,0,0.22)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}