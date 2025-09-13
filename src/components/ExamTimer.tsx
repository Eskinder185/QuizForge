import React from "react";
export default function ExamTimer(props: { totalMs: number; startAtMs: number; onExpire: () => void }) {
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);
  const remain = Math.max(0, props.totalMs - (now - props.startAtMs));
  React.useEffect(() => { if (remain === 0) props.onExpire(); }, [remain]);
  const m = Math.floor(remain / 60000);
  const s = String(Math.floor((remain % 60000) / 1000)).padStart(2, "0");
  return <div style={{ fontWeight: 600 }}>⏱ {m}:{s}</div>;
}

