import React from "react";
export default function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="stat-tile">
      <div className="stat-tile__label">{label}</div>
      <div className="stat-tile__value">{value}</div>
      {hint ? (
        <p className="lead" style={{ marginTop: "var(--space-sm)", marginBottom: 0 }}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
