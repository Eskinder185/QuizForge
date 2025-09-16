import React from "react";

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export default function Panel({
  children,
  className = "",
  header,
  footer
}: PanelProps) {
  const baseClasses = "panel";
  const classes = [
    baseClasses,
    className
  ].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      {header && (
        <div className="panel-header" style={{ marginBottom: "var(--space-lg)" }}>
          {header}
        </div>
      )}
      <div className="panel-content">
        {children}
      </div>
      {footer && (
        <div className="panel-footer" style={{ marginTop: "var(--space-lg)" }}>
          {footer}
        </div>
      )}
    </div>
  );
}

