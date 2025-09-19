import React from "react";
import { useApp } from "../store/app";
import type { Question } from "../types/quiz";
import { whyNow } from "../utils/fsrs";
import { calibrationBins } from "../utils/exam";
import { analyzePerformance } from "../utils/analytics";
import PageHeader from "../components/PageHeader";
import Empty from "../components/Empty";
import ChatDock from "../components/ChatDock";

type Mode = "review" | "practice";

export default function Study() {
  const { state, dispatch } = useApp();
  const quizzes = state.quizzes ?? [];

  const [mode, setMode] = React.useState<Mode>("review");
  const [tag, setTag] = React.useState<string>("All tags");
  const [level, setLevel] = React.useState<string>("All levels");
  const [showChat, setShowChat] = React.useState(false);

  // Get calibration data from recent attempts
  const calibration = React.useMemo(() => {
    const attempts = [...state.examAttempts, ...state.practiceAttempts];
    return calibrationBins(attempts);
  }, [state.examAttempts, state.practiceAttempts]);

  const handleStartMicroDrill = () => {
    if (state.microDrill) {
      // Start practice with micro-drill questions
      dispatch({
        type: "startPracticeAttempt",
        attempt: {
          id: crypto.randomUUID(),
          quizId: state.microDrill.quizId,
          mode: "learn",
          startedAt: Date.now(),
          answers: []
        }
      });
    }
  };

  // Generate weakness summary for Study Coach
  const getWeaknessSummary = React.useMemo(() => {
    const attempts = [...state.examAttempts, ...state.practiceAttempts];
    if (attempts.length === 0) return "";

    const lastAttempt = attempts[0];
    const quiz = state.quizzes.find(q => q.id === lastAttempt.quizId);
    if (!quiz) return "";

    const analysis = analyzePerformance(quiz, attempts);
    const weaknessTags = analysis.topWeaknesses.map(w => w.tag);
    
    if (weaknessTags.length === 0) return "";
    
    return `I'm weak on ${weaknessTags.join(", ")}. Explain the main misconceptions and give a 6-step plan for the next week.`;
  }, [state.examAttempts, state.practiceAttempts, state.quizzes]);

    return (
      <div className="container">
        <PageHeader 
          title="Study" 
          subtitle="Adaptive review and focused reps." 
          right={
            <div className="row">
              <button 
                className="btn"
                onClick={() => setShowChat(true)}
              >
                🧠 Study Coach
              </button>
              <button className="btn primary">Start Session</button>
            </div>
          } 
        />
        
        {/* Micro-drill CTA */}
        {state.microDrill && (
          <div className="rounded-2xl bg-blue-600/20 border border-blue-500/30 p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-blue-200">Micro-Drill Ready</div>
                <div className="text-sm text-blue-300 mt-1">
                  {state.microDrill.questionIds.length} questions from your weak areas
                </div>
              </div>
              <button 
                onClick={handleStartMicroDrill}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Start Micro-Drill
              </button>
            </div>
          </div>
        )}

        {/* Calibration Widget */}
        <div className="card" style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, marginBottom: "8px" }}>Confidence Calibration</div>
          <div style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "16px" }}>Honest confidence = smarter spacing</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px" }}>
            {Object.entries(calibration).map(([confidence, bin]) => (
              <div key={confidence} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px", fontWeight: 500 }}>{confidence}</div>
                <div style={{ width: "100%", background: "rgba(255, 255, 255, 0.1)", borderRadius: "8px", height: "8px", marginBottom: "4px", overflow: "hidden" }}>
                  <div 
                    style={{ 
                      background: "var(--accent)", 
                      height: "100%", 
                      borderRadius: "8px", 
                      transition: "all 300ms ease",
                      width: `${bin.accuracy * 100}%` 
                    }}
                  />
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  {Math.round(bin.accuracy * 100)}% ({bin.count} attempts)
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel row">
          <select className="input" style={{ maxWidth: 160 }} value={mode} onChange={e => setMode(e.target.value as Mode)}>
            <option value="review">Review</option><option value="practice">Practice</option>
          </select>
          <select className="input" style={{ maxWidth: 160 }} value={tag} onChange={e => setTag(e.target.value)}>
            <option>All tags</option>
            {quizzes.flatMap(q => q.questions.flatMap(qq => qq.tags || [])).filter((v, i, a) => a.indexOf(v) === i).map(t => <option key={t}>{t}</option>)}
          </select>
          <select className="input" style={{ maxWidth: 160 }} value={level} onChange={e => setLevel(e.target.value)}>
            <option>All levels</option><option>easy</option><option>medium</option><option>hard</option>
          </select>
          <div className="spacer" />
          <button className="btn">Start Session</button>
        </div>

        {quizzes.length === 0 && (
          <div style={{ marginTop: 16 }}>
            <Empty title="No content to study" body="Create a quiz on the Build page." cta="Build a quiz" to="/build" />
          </div>
        )}

        {showChat && (
          <ChatDock
            mode="study"
            onClose={() => setShowChat(false)}
            initialMessage={getWeaknessSummary}
          />
        )}
      </div>
    );
  }


