import React from "react";
import { useApp } from "../store/app";
import { analyzePerformance, buildMicroDrill } from "../utils/analytics";
import { useNavigate } from "react-router-dom";
import ChatDock from "../components/ChatDock";
import PageHeader from "../components/PageHeader";
import Empty from "../components/Empty";
import { humanTime } from "../utils/exam";

type BreakdownRow = { topic: string; correct: number; total: number };

export default function Results() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [showChat, setShowChat] = React.useState(false);
  
  const attempts = [...state.examAttempts, ...state.practiceAttempts].sort((a:any,b:any)=> (b.finishedAt||b.startedAt) - (a.finishedAt||a.startedAt));
  const last = attempts[0];
  const totalQ = last?.answers?.length || 0;
  const correct = last?.answers?.filter((a:any)=>a.correct).length || 0;
  const timeSec = Math.round(((last?.finishedAt||0) - (last?.startedAt||0)) / 1000);
  const accuracy = totalQ ? Math.round((correct/totalQ)*100) : 0;
  
  // Get the quiz for the last attempt
  const lastQuiz = last?.quizId ? state.quizzes.find(q => q.id === last.quizId) : null;
  
  // Analyze performance if we have a recent attempt
  const analysis = React.useMemo(() => {
    if (!last || !last.quizId) return { topWeaknesses: [], topStrengths: [] };
    const quiz = state.quizzes.find(q => q.id === last.quizId);
    if (!quiz) return { topWeaknesses: [], topStrengths: [] };
    return analyzePerformance(quiz, attempts);
  }, [last, state.quizzes, attempts]);

  const handlePracticeWeakness = (weakness: any) => {
    if (!last?.quizId) return;
    const quiz = state.quizzes.find(q => q.id === last.quizId);
    if (!quiz) return;
    
    const microDrillQuestions = buildMicroDrill(quiz, [weakness], 8);
    const questionIds = microDrillQuestions.map(q => q.id);
    
    dispatch({
      type: "createMicroDrill",
      quizId: last.quizId,
      questionIds
    });
    navigate("/study");
  };

  const getCoachMessage = () => {
    const weaknessTags = analysis.topWeaknesses.map(w => w.tag);
    if (weaknessTags.length === 0) return "I just finished an exam. Give me study tips for improvement.";
    return `I'm weak on ${weaknessTags.join(", ")}. Explain the main misconceptions and give a 6-step plan for the next week.`;
  };

  const rows: BreakdownRow[] = [
    { topic: "math", correct: 3, total: 4 },
    { topic: "science", correct: 2, total: 3 },
    { topic: "history", correct: 2, total: 3 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <div className="card" style={{ textAlign: "center", padding: "20px" }}>
          <div style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "8px" }}>Questions Reviewed</div>
          <div style={{ fontSize: "var(--font-size-2xl)", fontWeight: 700, color: "var(--accent)" }}>{totalQ}</div>
        </div>
        <div className="card" style={{ textAlign: "center", padding: "20px" }}>
          <div style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "8px" }}>Accuracy</div>
          <div style={{ fontSize: "var(--font-size-2xl)", fontWeight: 700, color: accuracy >= 80 ? "var(--success)" : accuracy >= 60 ? "var(--warning)" : "var(--danger)" }}>{accuracy}%</div>
        </div>
        <div className="card" style={{ textAlign: "center", padding: "20px" }}>
          <div style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "8px" }}>Time</div>
          <div style={{ fontSize: "var(--font-size-2xl)", fontWeight: 700, color: "var(--text)" }}>{Math.floor(timeSec/60)}:{String(timeSec%60).padStart(2,'0')}</div>
        </div>
      </div>

      {/* Strengths & Weaknesses Section */}
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "var(--font-size-xl)", fontWeight: 600, margin: 0 }}>Strengths & Weaknesses</h2>
          <button 
            onClick={() => setShowChat(true)}
            className="btn secondary"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            🧠 Ask Coach
          </button>
        </div>

        {/* Top Weaknesses */}
        {analysis.topWeaknesses.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, marginBottom: "12px", color: "var(--danger)" }}>Top Weaknesses</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {analysis.topWeaknesses.map((weakness, index) => (
                <div key={index} className="panel" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(244, 63, 94, 0.1)", border: "1px solid rgba(244, 63, 94, 0.2)" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>{weakness.tag}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
                      Error rate: {Math.round(weakness.errRate * 100)}% • 
                      Avg time: {Math.round(weakness.avgTimeMs / 1000)}s
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{weakness.note}</div>
                  </div>
                  <button 
                    onClick={() => handlePracticeWeakness(weakness)}
                    className="btn danger"
                    style={{ fontSize: "12px", padding: "8px 16px" }}
                    aria-label={`Practice ${weakness.tag}`}
                  >
                    Practice this
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Strengths */}
        {analysis.topStrengths.length > 0 && (
          <div>
            <h3 style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, marginBottom: "12px", color: "var(--success)" }}>Top Strengths</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {analysis.topStrengths.map((strength, index) => (
                <div key={index} className="panel" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>{strength.tag}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      Accuracy: {Math.round(strength.accRate * 100)}% • 
                      Avg time: {Math.round(strength.avgTimeMs / 1000)}s
                    </div>
                  </div>
                  <div style={{ padding: "8px 16px", background: "var(--success)", color: "white", fontSize: "12px", fontWeight: 500, borderRadius: "8px" }}>
                    Strong
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {analysis.topWeaknesses.length === 0 && analysis.topStrengths.length === 0 && (
          <div className="text-center text-zinc-400 py-8">
            Complete more questions to see your strengths and weaknesses analysis.
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
        <div className="font-semibold mb-2">Accuracy by tag (placeholder)</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-zinc-300">
              <tr><th>Tag</th><th>Correct</th><th>Total</th><th>%</th></tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.topic} className="border-t border-white/10">
                  <td>{r.topic}</td>
                  <td>{r.correct}</td>
                  <td>{r.total}</td>
                  <td>{Math.round((r.correct/r.total)*100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
        <div className="font-semibold mb-2">Recent Attempts</div>
        <ul className="text-sm">
          {attempts.slice(0,10).map((a:any)=> (
            <li key={a.id} className="border-t border-white/10 py-2">{new Date(a.startedAt).toLocaleString()} — {a.quizId} — {a.answers?.filter((x:any)=>x.correct).length || 0}/{a.answers?.length || 0}</li>
          ))}
          {attempts.length===0 && <li>No attempts yet.</li>}
        </ul>
      </div>

      {showChat && (
        <ChatDock
          mode="study"
          onClose={() => setShowChat(false)}
          initialMessage={getCoachMessage()}
        />
      )}
    </div>
  );
}
