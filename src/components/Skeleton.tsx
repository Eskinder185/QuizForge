import React from "react";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  lines?: number;
}

export default function Skeleton({
  width = "100%",
  height = "20px",
  className = "",
  lines = 1
}: SkeletonProps) {
  const skeletonStyle: React.CSSProperties = {
    background: "linear-gradient(90deg, var(--surface) 25%, var(--surface-2) 50%, var(--surface) 75%)",
    backgroundSize: "200% 100%",
    animation: "skeleton-loading 1.5s infinite",
    borderRadius: "var(--radius-sm)",
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height
  };

  if (lines > 1) {
    return (
      <div className={`skeleton-multi ${className}`}>
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className="skeleton-line"
            style={{
              ...skeletonStyle,
              marginBottom: i < lines - 1 ? "var(--space-sm)" : 0,
              width: i === lines - 1 ? "75%" : "100%" // Last line is shorter
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`skeleton ${className}`}
      style={skeletonStyle}
    />
  );
}

// Add the skeleton animation to the CSS
const skeletonCSS = `
@keyframes skeleton-loading {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton, .skeleton-line {
    animation: none !important;
    background: var(--surface) !important;
  }
}
`;

// Inject the CSS
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = skeletonCSS;
  document.head.appendChild(style);
}

