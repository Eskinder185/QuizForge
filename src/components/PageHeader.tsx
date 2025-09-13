import React from "react";
export default function PageHeader(props: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <div className="panel row" style={{ marginBottom: 12 }}>
      <div>
        <div style={{ fontWeight: 800, fontSize: 18 }}>{props.title}</div>
        {props.subtitle && <div className="lead" style={{ marginTop: 2 }}>{props.subtitle}</div>}
      </div>
      <div className="spacer" />
      {props.right}
    </div>
  );
}
