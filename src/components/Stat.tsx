import React from "react";
export default function Stat({ label, value, hint }:{ label:string; value:React.ReactNode; hint?:string }) {
  return (
    <div className="card" style={{ padding: 14 }}>
      <div style={{ fontSize:12, color:"var(--muted)" }}>{label}</div>
      <div style={{ fontWeight:800, fontSize:18, marginTop:4 }}>{value}</div>
      {hint && <div className="lead" style={{ marginTop:6 }}>{hint}</div>}
    </div>
  );
}
