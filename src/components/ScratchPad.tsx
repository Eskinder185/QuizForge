import React from "react";
export default function ScratchPad({ attemptId }: { attemptId: string }) {
  const key = "scratch_" + attemptId;
  const [v, setV] = React.useState<string>(() => localStorage.getItem(key) || "");
  React.useEffect(() => { localStorage.setItem(key, v); }, [v, key]);
  return (
    <div style={{ padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.05)" }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Scratch Pad</div>
      <textarea value={v} onChange={(e)=>setV(e.target.value)} rows={8} style={{ width: "100%", background: "transparent", color: "inherit" }} />
    </div>
  );
}

