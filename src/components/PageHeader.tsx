import React from "react";

export default function PageHeader(props: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <div className="page-intro">
      <div>
        <h1 className="page-title">{props.title}</h1>
        {props.subtitle && (
          <p className="lead" style={{ marginTop: "var(--space-xs)", marginBottom: 0 }}>
            {props.subtitle}
          </p>
        )}
      </div>
      <div className="spacer" />
      {props.right}
    </div>
  );
}
