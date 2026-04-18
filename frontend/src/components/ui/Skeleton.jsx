import React from "react";

export default function Skeleton({ height = 12, width = "100%", style }) {
  return (
    <div
      style={{
        height,
        width,
        borderRadius: 12,
        background:
          "linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.12) 37%, rgba(255,255,255,0.06) 63%)",
        backgroundSize: "400% 100%",
        animation: "skeletonShimmer 1.2s ease-in-out infinite",
        ...style,
      }}
    />
  );
}

/**
 * Inject keyframes once.
 * If you already have a global CSS/animation system, move this there.
 */
if (typeof document !== "undefined" && !document.getElementById("skeleton-keyframes")) {
  const style = document.createElement("style");
  style.id = "skeleton-keyframes";
  style.textContent = `
@keyframes skeletonShimmer {
  0% { background-position: 100% 0; }
  100% { background-position: 0 0; }
}`;
  document.head.appendChild(style);
}