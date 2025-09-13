import React from "react";
export default function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(1, ...data.map(d=>d.value));
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {data.map(d => (
        <div key={d.label}>
          <div style={{ fontSize: 12, color: "#a1a1aa" }}>{d.label} — {d.value}%</div>
          <div style={{ height: 8, background: "rgba(255,255,255,.1)", borderRadius: 999 }}>
            <div style={{ width: `${(d.value/max)*100}%`, height: "100%", background: "white", borderRadius: 999 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

