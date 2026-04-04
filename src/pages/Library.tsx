import React from "react";
import { useApp } from "../store/app";
import { importCSV, exportJSON, exportCSV, fileDownload } from "../utils/io";
import PageHeader from "../components/PageHeader";
import { PageShell, Toolbar } from "../components/ui";

export default function Library() {
  const { state, dispatch } = useApp();
  const [q, setQ] = React.useState("");
  const [selected, setSelected] = React.useState<string | undefined>(undefined);
  const list = state.quizzes.filter(
    (x) =>
      x.title.toLowerCase().includes(q.toLowerCase()) ||
      x.topic.toLowerCase().includes(q.toLowerCase()) ||
      x.questions.some((qq) => (qq.tags || []).some((t) => t.toLowerCase().includes(q.toLowerCase())))
  );

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

  const active = list.find((x) => x.id === selected);

  return (
    <PageShell variant="workspace">
      <PageHeader
        title="Library"
        subtitle="Search, select, and export quizzes stored in this browser."
      />
      <Toolbar>
        <input
          className="input flex-1 min-w-[12rem]"
          placeholder="Search quizzes..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search quizzes"
        />
        <label className="btn secondary cursor-pointer shrink-0">
          Import CSV
          <input
            aria-label="Import CSV"
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={onImportCsv}
          />
        </label>
        <button
          aria-label="Export JSON"
          disabled={!active}
          type="button"
          className="btn secondary shrink-0"
          onClick={() => {
            if (!active) return;
            const data = exportJSON(active);
            fileDownload(`${active.title.replace(/\s+/g, "-")}-${active.id}.json`, data, "application/json");
          }}
        >
          Export JSON
        </button>
        <button
          aria-label="Export CSV"
          disabled={!active}
          type="button"
          className="btn secondary shrink-0"
          onClick={() => {
            if (!active) return;
            const data = exportCSV(active);
            fileDownload(`${active.title.replace(/\s+/g, "-")}-${active.id}.csv`, data, "text/csv");
          }}
        >
          Export CSV
        </button>
      </Toolbar>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => setSelected(card.id)}
            className={`card text-left${selected === card.id ? " is-selected" : ""}`}
            style={{ marginBottom: 0 }}
          >
            <div className="font-semibold">{card.title}</div>
            <div className="mt-1 text-sm text-muted">
              {(card.questions[0]?.tags || []).slice(0, 4).map((t) => (
                <span key={t} className="tag-chip">
                  #{t}
                </span>
              ))}
            </div>
            <div className="mt-2 text-xs text-muted">{card.questions.length} questions</div>
          </button>
        ))}
        {list.length === 0 && <div className="text-sm text-muted">No quizzes yet.</div>}
      </div>
    </PageShell>
  );
}
