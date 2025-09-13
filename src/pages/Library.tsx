import React from "react";
import { useApp } from "../store/app";
import { importCSV, exportJSON, exportCSV, fileDownload } from "../utils/io";

export default function Library() {
  const { state, dispatch } = useApp();
  const [q, setQ] = React.useState("");
  const [selected, setSelected] = React.useState<string | undefined>(undefined);
  const list = state.quizzes.filter(x => x.title.toLowerCase().includes(q.toLowerCase()) || x.topic.toLowerCase().includes(q.toLowerCase()) || x.questions.some(qq => (qq.tags||[]).some(t => t.toLowerCase().includes(q.toLowerCase()))));

  function onImportCsv(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const txt = String(reader.result || "");
      const quiz = importCSV(txt);
      dispatch({ type: "addQuiz", quiz });
    };
    reader.readAsText(file);
  }

  const active = list.find(x => x.id === selected);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-center gap-3">
        <input className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10" placeholder="Search quizzes..." value={q} onChange={e=>setQ(e.target.value)} />
        <label className="px-3 py-2 rounded-lg bg-white/10 border border-white/10 cursor-pointer text-sm">
          Import CSV
          <input aria-label="Import CSV" type="file" accept=".csv,text/csv" className="hidden" onChange={onImportCsv} />
        </label>
        <button aria-label="Export JSON" disabled={!active} onClick={()=> { if (!active) return; const data = exportJSON(active); fileDownload(`${active.title.replace(/\s+/g,'-')}-${active.id}.json`, data, 'application/json'); }} className="px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-sm disabled:opacity-50">Export JSON</button>
        <button aria-label="Export CSV" disabled={!active} onClick={()=> { if (!active) return; const data = exportCSV(active); fileDownload(`${active.title.replace(/\s+/g,'-')}-${active.id}.csv`, data, 'text/csv'); }} className="px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-sm disabled:opacity-50">Export CSV</button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map(card => (
          <button key={card.id} onClick={()=>setSelected(card.id)} className={`text-left rounded-2xl bg-white/5 border p-4 ${selected===card.id?"border-white/40":"border-white/10"}`}>
            <div className="font-semibold">{card.title}</div>
            <div className="mt-1 text-sm text-zinc-400">{(card.questions[0]?.tags||[]).slice(0,4).map(t=> (
              <span key={t} className="mr-1 px-2 py-0.5 rounded bg-white/10">#{t}</span>
            ))}</div>
            <div className="mt-2 text-xs text-zinc-400">{card.questions.length} questions</div>
          </button>
        ))}
        {list.length === 0 && <div className="text-sm text-zinc-400">No quizzes yet.</div>}
      </div>
    </div>
  );
}
