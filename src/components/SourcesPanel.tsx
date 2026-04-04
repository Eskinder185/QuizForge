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
    <div className="sources-panel">
      <div className="flex items-center gap-2 mb-2">
        <div className="font-semibold">Sources</div>
        {q &&
          (() => {
            const tf = computeTrustFactors(q, list);
            const s = trustScore(tf);
            const tier = s < 50 ? "trust-pill--low" : s < 80 ? "trust-pill--mid" : "trust-pill--high";
            return (
              <span className={`trust-pill ${tier}`} title="Heuristic trust score for attached sources">
                Trust {s}
              </span>
            );
          })()}
      </div>
      <div className="sources-panel-fields">
        <input aria-label="Source URL" placeholder="https://example.com/article" className="input" value={url} onChange={e=>setUrl(e.target.value)} />
        <textarea aria-label="Source snippet" placeholder="Relevant snippet..." className="input" rows={3} value={snippet} onChange={e=>setSnippet(e.target.value)} />
        <input aria-label="Source note" placeholder="Notes" className="input" value={note} onChange={e=>setNote(e.target.value)} />
        <button type="button" aria-label="Add source" onClick={addRef} className="btn secondary sm">Add</button>
      </div>
      <div className="sources-panel-list">
        {list.map((s, i) => (
          <div key={i} className="sources-panel-item">
            <div className="text-sm break-words">{s.url || "(no url)"}</div>
            {s.snippet && <div className="text-xs text-muted mt-1">{s.snippet}</div>}
            {s.note && <div className="text-xs text-muted mt-1">{s.note}</div>}
            <div className="mt-2">
              <button type="button" aria-label="Delete source" onClick={() => dispatch({ type: "removeSourceRef", questionId, index: i })} className="btn danger sm">Delete</button>
            </div>
          </div>
        ))}
        {list.length === 0 && <div className="text-sm text-muted">No sources yet.</div>}
      </div>
    </div>
  );
}
