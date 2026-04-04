import React from "react";
import { useApp } from "../store/app";
import { calibrationBins } from "../utils/exam";
import { analyzePerformance } from "../utils/analytics";
import PageHeader from "../components/PageHeader";
import Empty from "../components/Empty";
import ChatDock from "../components/ChatDock";
import { PageShell, Toolbar } from "../components/ui";

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

  if (quizzes.length === 0) {
    return (
      <PageShell>
        <PageHeader
          title="Study"
          subtitle="Review and practice open up after you have at least one saved quiz."
        />
        <Empty
          flowStep="study"
          title="No quizzes to study yet"
          body="Study reads from the quizzes you create on Build. Without a quiz, there is no deck to review or practice."
          hint="Flow: Build your first questions → come back here for adaptive review → use Exam for timed runs → check Results after a session."
          cta="Go to Build"
          to="/build"
        />
      </PageShell>
    );
  }

  return (
    <PageShell variant="workspace">
        <PageHeader 
          title="Study" 
          subtitle="Adaptive review and focused reps—using the quizzes you built." 
          right={
            <div className="row">
              <button 
                type="button"
                className="btn secondary"
                onClick={() => setShowChat(true)}
              >
                Study Coach
              </button>
              <button type="button" className="btn primary">
                Start session
              </button>
            </div>
          } 
        />
        
        {/* Micro-drill CTA */}
        {state.microDrill && (
          <div className="callout-accent">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-semibold text-base" style={{ color: "var(--text)" }}>
                  Micro-Drill Ready
                </div>
                <div className="text-sm text-muted mt-1">
                  {state.microDrill.questionIds.length} questions from your weak areas
                </div>
              </div>
              <button type="button" onClick={handleStartMicroDrill} className="btn primary">
                Start Micro-Drill
              </button>
            </div>
          </div>
        )}

        {/* Calibration Widget */}
        <div className="content-section" style={{ paddingTop: 0 }}>
          <div className="section-title" style={{ marginBottom: "var(--space-sm)" }}>
            Confidence Calibration
          </div>
          <p className="lead" style={{ marginBottom: "var(--space-lg)" }}>
            Honest confidence = smarter spacing
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "var(--space-md)" }}>
            {Object.entries(calibration).map(([confidence, bin]) => (
              <div key={confidence} style={{ textAlign: "center" }}>
                <div className="text-xs font-medium text-muted" style={{ marginBottom: "var(--space-sm)" }}>
                  {confidence}
                </div>
                <div
                  style={{
                    width: "100%",
                    background: "var(--surface-2)",
                    borderRadius: "var(--radius-sm)",
                    height: "6px",
                    marginBottom: "var(--space-xs)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      background: "var(--accent)",
                      height: "100%",
                      borderRadius: "var(--radius-sm)",
                      transition: "width var(--transition-slow)",
                      width: `${bin.accuracy * 100}%`,
                    }}
                  />
                </div>
                <div className="text-xs text-muted">
                  {Math.round(bin.accuracy * 100)}% ({bin.count} attempts)
                </div>
              </div>
            ))}
          </div>
        </div>

        <Toolbar>
          <select
            className="input"
            style={{ maxWidth: 160 }}
            value={mode}
            onChange={(e) => setMode(e.target.value as Mode)}
            aria-label="Study mode"
          >
            <option value="review">Review</option>
            <option value="practice">Practice</option>
          </select>
          <select
            className="input"
            style={{ maxWidth: 160 }}
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            aria-label="Filter by tag"
          >
            <option>All tags</option>
            {quizzes
              .flatMap((q) => q.questions.flatMap((qq) => qq.tags || []))
              .filter((v, i, a) => a.indexOf(v) === i)
              .map((t) => (
                <option key={t}>
                  {t}
                </option>
              ))}
          </select>
          <select
            className="input"
            style={{ maxWidth: 160 }}
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            aria-label="Filter by difficulty"
          >
            <option>All levels</option>
            <option>easy</option>
            <option>medium</option>
            <option>hard</option>
          </select>
          <div className="spacer" />
          <button
            type="button"
            className="btn"
            disabled
            title="Guided session player is not available yet. Use Study Coach for now."
            aria-describedby="study-start-session-hint"
          >
            Start session
          </button>
          <span id="study-start-session-hint" className="sr-only">
            Not available yet. Use the Study Coach button for AI guidance.
          </span>
        </Toolbar>

        {showChat && (
          <ChatDock
            mode="study"
            onClose={() => setShowChat(false)}
            initialMessage={getWeaknessSummary}
          />
        )}
    </PageShell>
  );
}

