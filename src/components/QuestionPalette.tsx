import React from "react";
export default function QuestionPalette(props: {
  total: number; currentIndex: number; statuses: ("flagged"|"answered"|"unanswered")[]; onJump: (i:number)=>void;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(10, minmax(0, 1fr))", gap: 6 }}>
      {Array.from({ length: props.total }).map((_, i) => {
        const st = props.statuses[i];
        const bg = st === "flagged" ? "rgba(251,191,36,.3)" : st === "answered" ? "rgba(34,197,94,.3)" : "rgba(255,255,255,.08)";
        const ring = i === props.currentIndex ? "0 0 0 2px white inset" : "none";
        return (
          <button key={i} onClick={() => props.onJump(i)}
            style={{ padding: "6px 0", borderRadius: 8, border: "1px solid rgba(255,255,255,.1)", background: bg, boxShadow: ring }}>
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}

