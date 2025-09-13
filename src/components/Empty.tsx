import React from "react";
import { Link } from "react-router-dom";
export default function Empty({ title, body, cta, to }:{ title:string; body:string; cta?:string; to?:string }) {
  return (
    <div className="card" style={{ textAlign:"center", padding: 24 }}>
      <div style={{ fontWeight:800, fontSize:18 }}>{title}</div>
      <div className="lead" style={{ marginTop:6 }}>{body}</div>
      {cta && to && <Link to={to} className="btn primary" style={{ marginTop:12 }}>{cta}</Link>}
    </div>
  );
}
