import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  onClick?: () => void;
  hover?: boolean;
}

export default function Card({
  children,
  className = "",
  header,
  footer,
  onClick,
  hover = true
}: CardProps) {
  const baseClasses = "card";
  const classes = [
    baseClasses,
    !hover && "no-hover",
    className
  ].filter(Boolean).join(" ");

  const CardContent = (
    <>
      {header && (
        <div className="card-header" style={{ marginBottom: "var(--space-md)" }}>
          {header}
        </div>
      )}
      <div className="card-content">
        {children}
      </div>
      {footer && (
        <div className="card-footer" style={{ marginTop: "var(--space-md)" }}>
          {footer}
        </div>
      )}
    </>
  );

  if (onClick) {
    return (
      <div
        className={classes}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
        aria-label="Clickable card"
      >
        {CardContent}
      </div>
    );
  }

  return (
    <div className={classes}>
      {CardContent}
    </div>
  );
}

