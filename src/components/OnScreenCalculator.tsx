import React from "react";
export default function OnScreenCalculator() {
  const [expr, setExpr] = React.useState("");
  const [out, setOut] = React.useState<string>("");
  return (
    <div style={{ padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.05)" }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Calculator</div>
      <input value={expr} onChange={(e)=>setExpr(e.target.value)} placeholder="e.g., (2+3)*4" style={{ width: "100%" }} />
      <button onClick={() => { try { const v = Function(`"use strict";return (${expr})`)(); setOut(String(v)); } catch (e:any) { setOut(e.message); } }}>=</button>
      <div style={{ marginTop: 8, fontFamily: "ui-monospace, monospace" }}>{out}</div>
    </div>
  );
}

