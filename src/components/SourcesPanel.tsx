import React from "react";
import { useApp } from "../store/app";
import type { SourceRef, Question } from "../types/quiz";
import { computeTrustFactors, trustScore } from "../utils/trust";

export default function SourcesPanel({ quizId, questionId }: { quizId: string; questionId: string }) {
  const { state, dispatch } = useApp();
  const quiz = state.quizzes.find(q => q.id === quizId);
  const list = quiz?.sources[questionId] || [];
  const q: Question | undefined = quiz?.questions.find(x=>x.id===questionId);

  const [url, setUrl] = React.useState("");
  const [snippet, setSnippet] = React.useState("");
  const [note, setNote] = React.useState("");

  function addRef() {
    const ref: SourceRef = { url: url.trim() || undefined, snippet: snippet.trim() || undefined, note: note.trim() || undefined };
    if (!ref.url && !ref.snippet && !ref.note) return;
    dispatch({ type: "addSourceRef", questionId, ref });
    setUrl(""); setSnippet(""); setNote("");
  }

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="font-semibold">Sources</div>
        {q && (
          (()=>{
            const tf = computeTrustFactors(q, list);
            const s = trustScore(tf);
            const color = s<50?"bg-red-500/20 text-red-300 border-red-500/30":s<80?"bg-amber-500/20 text-amber-300 border-amber-500/30":"bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
            return <span className={`text-xs px-2 py-1 rounded border ${color}`}>Trust {s}</span>;
          })()
        )}
      </div>
      <div className="space-y-2">
        <input aria-label="Source URL" placeholder="https://example.com/article" className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10" value={url} onChange={e=>setUrl(e.target.value)} />
        <textarea aria-label="Source snippet" placeholder="Relevant snippet..." className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10" value={snippet} onChange={e=>setSnippet(e.target.value)} />
        <input aria-label="Source note" placeholder="Notes" className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10" value={note} onChange={e=>setNote(e.target.value)} />
        <button aria-label="Add source" onClick={addRef} className="px-3 py-2 rounded-lg bg-white/10 border border-white/10">Add</button>
      </div>
      <div className="mt-4 space-y-2">
        {list.map((s, i) => (
          <div key={i} className="rounded-lg bg-black/30 border border-white/10 p-3">
            <div className="text-sm break-words">{s.url || "(no url)"}</div>
            {s.snippet && <div className="text-xs text-zinc-300 mt-1">{s.snippet}</div>}
            {s.note && <div className="text-xs text-zinc-400 mt-1">{s.note}</div>}
            <div className="mt-2">
              <button aria-label="Delete source" onClick={() => dispatch({ type: "removeSourceRef", questionId, index: i })} className="px-2 py-1 rounded bg-red-500/20 border border-red-500/30 text-sm">Delete</button>
            </div>
          </div>
        ))}
        {list.length === 0 && <div className="text-sm text-zinc-400">No sources yet.</div>}
      </div>
    </div>
  );
}
