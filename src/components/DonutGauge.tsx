import React from "react";
export default function DonutGauge({ percent }: { percent: number }) {
  const p = Math.max(0, Math.min(100, percent));
  const r = 28, c = Math.PI * 2 * r, off = c * (1 - p / 100);
  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={r} stroke="rgba(255,255,255,.1)" strokeWidth="8" fill="none" />
      <circle cx="36" cy="36" r={r} stroke="white" strokeWidth="8" fill="none"
              strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 36 36)"/>
      <text x="36" y="40" textAnchor="middle" fontSize="12" fill="white">{p}%</text>
    </svg>
  );
}

