import React from "react";
import { useApp } from "../store/app";
import { analyzePerformance, buildMicroDrill, type AnalysisResult } from "../utils/analytics";
import { useNavigate } from "react-router-dom";
import ChatDock from "../components/ChatDock";
import PageHeader from "../components/PageHeader";
import Empty from "../components/Empty";
import { PageShell, SectionHeader, Metric } from "../components/ui";
import { StaggerChildren } from "../motion/StaggerChildren";
import type { ExamAttempt, PracticeAttempt } from "../types/quiz";

function isPracticeAttempt(a: ExamAttempt | PracticeAttempt): a is PracticeAttempt {
  return "mode" in a;
}

function formatWhen(ms: number) {
  return new Date(ms).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function formatDuration(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function statAccuracyClass(pct: number): string {
  if (pct >= 80) return "results-stat-value results-stat-value--success";
  if (pct >= 60) return "results-stat-value results-stat-value--warn";
  return "results-stat-value results-stat-value--danger";
}

function meterFillClass(pct: number): string {
  if (pct >= 80) return "results-meter-fill results-meter-fill--success";
  if (pct >= 55) return "results-meter-fill results-meter-fill--warn";
  return "results-meter-fill results-meter-fill--danger";
}

function attemptScore(a: ExamAttempt | PracticeAttempt): { text: string; pct: number | null } {
  const ans = a.answers ?? [];
  const correct = ans.filter((x) => x.correct).length;
  const total = ans.length;
  if (total === 0) return { text: "—", pct: null };
  const pct = Math.round((correct / total) * 100);
  if (!isPracticeAttempt(a) && typeof a.score === "number") {
    return { text: `${correct}/${total} · ${Math.round(a.score)}%`, pct: Math.round(a.score) };
  }
  return { text: `${correct}/${total} (${pct}%)`, pct };
}

function emptyAnalysis(): AnalysisResult {
  return { byTag: {}, byDifficulty: {}, topWeaknesses: [], topStrengths: [] };
}

export default function Results() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [showChat, setShowChat] = React.useState(false);

  const attempts = [...state.examAttempts, ...state.practiceAttempts].sort(
    (a, b) => (b.finishedAt ?? b.startedAt) - (a.finishedAt ?? a.startedAt)
  );
  const last = attempts[0];
  const totalQ = last?.answers?.length ?? 0;
  const correct = last?.answers?.filter((x) => x.correct).length ?? 0;
  const timeSec = Math.round(((last?.finishedAt ?? 0) - (last?.startedAt ?? 0)) / 1000);
  const accuracy = totalQ ? Math.round((correct / totalQ) * 100) : 0;

  const lastQuiz = last?.quizId ? state.quizzes.find((q) => q.id === last.quizId) ?? null : null;

  const analysis = React.useMemo((): AnalysisResult => {
    if (!last?.quizId) return emptyAnalysis();
    const quiz = state.quizzes.find((q) => q.id === last.quizId);
    if (!quiz) return emptyAnalysis();
    return analyzePerformance(quiz, attempts);
  }, [last, state.quizzes, attempts]);

  const tagBreakdown = React.useMemo(() => {
    return Object.entries(analysis.byTag)
      .map(([tag, d]) => ({
        tag,
        seen: d.seen,
        correct: d.correct,
        pct: d.seen ? Math.round((d.correct / d.seen) * 100) : 0,
      }))
      .filter((r) => r.seen > 0)
      .sort((a, b) => b.seen - a.seen);
  }, [analysis.byTag]);

  const difficultyBreakdown = React.useMemo(() => {
    return Object.entries(analysis.byDifficulty)
      .map(([difficulty, d]) => ({
        difficulty,
        seen: d.seen,
        correct: d.correct,
        pct: d.seen ? Math.round((d.correct / d.seen) * 100) : 0,
      }))
      .filter((r) => r.seen > 0)
      .sort((a, b) => b.seen - a.seen);
  }, [analysis.byDifficulty]);

  const handlePracticeWeakness = (weakness: (typeof analysis.topWeaknesses)[0]) => {
    if (!last?.quizId) return;
    const quiz = state.quizzes.find((q) => q.id === last.quizId);
    if (!quiz) return;

    const microDrillQuestions = buildMicroDrill(quiz, [weakness], 8);
    const questionIds = microDrillQuestions.map((q) => q.id);

    dispatch({
      type: "createMicroDrill",
      quizId: last.quizId,
      questionIds,
    });
    navigate("/study");
  };

  const getCoachMessage = () => {
    const weaknessTags = analysis.topWeaknesses.map((w) => w.tag);
    if (weaknessTags.length === 0) return "I just finished an exam. Give me study tips for improvement.";
    return `I'm weak on ${weaknessTags.join(", ")}. Explain the main misconceptions and give a 6-step plan for the next week.`;
  };

  const hasAttempts = attempts.length > 0;
  const hasQuizzes = state.quizzes.length > 0;

  const lastWhen = last ? (last.finishedAt ?? last.startedAt) : 0;
  const lastWhenLabel = lastWhen ? formatWhen(lastWhen) : null;

  return (
    <PageShell>
      <PageHeader
        title="Results"
        subtitle={
          hasAttempts
            ? "Review outcomes from study and exam sessions—everything here is computed locally from your attempts."
            : "Accuracy, timing, and tag-level breakdowns appear after you complete at least one session."
        }
        right={
          hasAttempts ? (
            <button type="button" className="btn secondary" onClick={() => setShowChat(true)}>
              Ask Coach
            </button>
          ) : undefined
        }
      />

      {!hasAttempts && !hasQuizzes && (
        <Empty
          flowStep="results"
          title="No results yet—you have not created a quiz"
          body="This page shows scores and trends after you finish studying or taking an exam. There is no data because you do not have any saved quizzes yet."
          hint="Usual order: Build → Study or Exam → Results. Everything stays in your browser until you export it."
          cta="Build a quiz"
          to="/build"
        />
      )}

      {!hasAttempts && hasQuizzes && (
        <Empty
          flowStep="results"
          title="No finished sessions yet"
          body="You already have quizzes saved, but this dashboard fills in only after you complete a study session or an exam attempt."
          hint="Open Study for review and practice, or Exam for a timed run. When a session ends, summary stats and strengths will show up here."
          cta="Go to Study"
          to="/study"
          secondaryCta="Try Exam"
          secondaryTo="/exam"
        />
      )}

      {hasAttempts && (
        <>
        <StaggerChildren className="qf-reveal-sections">
          <section className="content-section" aria-labelledby="results-summary-heading">
            <h2 id="results-summary-heading" className="sr-only">
              Last session summary
            </h2>
            <div className="results-stats-grid">
              <Metric
                kicker="Last session · Items"
                value={totalQ}
                hint="Graded questions in your most recent completed run."
                valueClassName="results-stat-value results-stat-value--accent"
              />
              <Metric
                kicker="Last session · Accuracy"
                value={totalQ ? `${accuracy}%` : "—"}
                hint="Share correct for that session only."
                valueClassName={statAccuracyClass(accuracy)}
              />
              <Metric
                kicker="Last session · Duration"
                value={formatDuration(timeSec)}
                hint="Wall time from start to finish (when timestamps are present)."
              />
              <Metric
                kicker="All sessions"
                value={attempts.length}
                hint="Exam and study attempts stored in this browser."
              />
            </div>
            {lastWhenLabel && (
              <p className="results-context-bar" style={{ marginTop: "var(--space-md)", marginBottom: 0 }}>
                <strong>Most recent:</strong> {lastWhenLabel}
                {lastQuiz ? (
                  <>
                    {" "}
                    · <strong>{lastQuiz.title}</strong>
                  </>
                ) : null}
                {last && !lastQuiz ? (
                  <>
                    {" "}
                    · <span>Quiz no longer in library</span>
                  </>
                ) : null}
              </p>
            )}
          </section>

          <section className="content-section" aria-labelledby="results-insights-heading">
            <SectionHeader
              headingId="results-insights-heading"
              title="Insights"
              description={
                <>
                  Strengths and gaps are inferred from your answers. They work best when questions have{" "}
                  <strong style={{ color: "var(--text)", fontWeight: 600 }}>tags</strong> in Build and you have enough
                  graded attempts on the same quiz.
                  {lastQuiz ? (
                    <>
                      {" "}
                      Current view is anchored to{" "}
                      <strong style={{ color: "var(--text)", fontWeight: 600 }}>{lastQuiz.title}</strong>.
                    </>
                  ) : null}
                </>
              }
            />

            {analysis.topWeaknesses.length > 0 && (
              <div style={{ marginBottom: "var(--space-xl)" }}>
                <h3 className="text-sm font-semibold text-danger" style={{ margin: "0 0 var(--space-md)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  Needs attention
                </h3>
                <div className="results-insight-list">
                  {analysis.topWeaknesses.map((weakness) => (
                    <div key={weakness.tag} className="results-insight results-insight--weak">
                      <div style={{ flex: "1 1 12rem" }}>
                        <p className="results-insight-tag">{weakness.tag}</p>
                        <p className="results-insight-meta">
                          Error rate {Math.round(weakness.errRate * 100)}% · Avg time{" "}
                          {Math.round(weakness.avgTimeMs / 1000)}s per item
                        </p>
                        <p className="results-insight-note">{weakness.note}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePracticeWeakness(weakness)}
                        className="btn danger sm"
                        aria-label={`Practice questions tagged ${weakness.tag}`}
                      >
                        Practice this
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis.topStrengths.length > 0 && (
              <div style={{ marginBottom: analysis.topWeaknesses.length ? 0 : undefined }}>
                <h3 className="text-sm font-semibold text-success" style={{ margin: "0 0 var(--space-md)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  Going well
                </h3>
                <div className="results-insight-list">
                  {analysis.topStrengths.map((strength) => (
                    <div key={strength.tag} className="results-insight results-insight--strong">
                      <div style={{ flex: "1 1 12rem" }}>
                        <p className="results-insight-tag">{strength.tag}</p>
                        <p className="results-insight-meta">
                          Accuracy {Math.round(strength.accRate * 100)}% · Avg time{" "}
                          {Math.round(strength.avgTimeMs / 1000)}s per item
                        </p>
                      </div>
                      <span className="badge success">Strong</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis.topWeaknesses.length === 0 && analysis.topStrengths.length === 0 && (
              <div className="results-empty-panel">
                <h3 className="results-section-title">Not enough signal yet</h3>
                <p>
                  Keep completing sessions on this quiz. Once tags see enough graded answers, strengths and weak spots
                  will surface here automatically (the engine skips tags with very few samples).
                </p>
              </div>
            )}
          </section>

          <section className="content-section" aria-labelledby="results-tags-heading">
            <SectionHeader
              headingId="results-tags-heading"
              title="Accuracy by tag"
              description="Aggregates from your attempts that match questions on the anchor quiz. Tags come from how you labeled questions in Build."
            />

            {tagBreakdown.length > 0 ? (
              <div className="results-data-table-wrap">
                <table className="results-data-table">
                  <thead>
                    <tr>
                      <th scope="col">Tag</th>
                      <th scope="col" className="num">
                        Correct
                      </th>
                      <th scope="col" className="num">
                        Attempted
                      </th>
                      <th scope="col">Accuracy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tagBreakdown.map((row) => (
                      <tr key={row.tag}>
                        <td>
                          <span className="font-medium">{row.tag}</span>
                        </td>
                        <td className="num">{row.correct}</td>
                        <td className="num">{row.seen}</td>
                        <td>
                          <div className="results-meter">
                            <div className="results-meter-track" aria-hidden>
                              <div className={meterFillClass(row.pct)} style={{ width: `${row.pct}%` }} />
                            </div>
                            <span className="text-muted" style={{ fontVariantNumeric: "tabular-nums", minWidth: "2.5rem" }}>
                              {row.pct}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="results-empty-panel">
                <h3 className="results-section-title">No tag breakdown yet</h3>
                <p>
                  Add tags to your questions on Build, then complete more graded sessions. This table fills only when
                  answers can be tied to tags from the anchor quiz.
                </p>
              </div>
            )}
          </section>

          {difficultyBreakdown.length > 0 && (
            <section className="content-section" aria-labelledby="results-diff-heading">
              <SectionHeader
                headingId="results-diff-heading"
                title="Accuracy by difficulty"
                description="Uses the difficulty field on questions (easy / medium / hard)."
              />
              <div className="results-data-table-wrap">
                <table className="results-data-table">
                  <thead>
                    <tr>
                      <th scope="col">Difficulty</th>
                      <th scope="col" className="num">
                        Correct
                      </th>
                      <th scope="col" className="num">
                        Attempted
                      </th>
                      <th scope="col">Accuracy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {difficultyBreakdown.map((row) => (
                      <tr key={row.difficulty}>
                        <td style={{ textTransform: "capitalize" }}>{row.difficulty}</td>
                        <td className="num">{row.correct}</td>
                        <td className="num">{row.seen}</td>
                        <td>
                          <div className="results-meter">
                            <div className="results-meter-track" aria-hidden>
                              <div className={meterFillClass(row.pct)} style={{ width: `${row.pct}%` }} />
                            </div>
                            <span className="text-muted" style={{ fontVariantNumeric: "tabular-nums", minWidth: "2.5rem" }}>
                              {row.pct}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section className="content-section" aria-labelledby="results-history-heading">
            <SectionHeader
              headingId="results-history-heading"
              title="Session history"
              description="Newest first. Only sessions stored in this browser are listed."
            />
            <div className="results-data-table-wrap">
              <table className="results-data-table">
                <thead>
                  <tr>
                    <th scope="col">When</th>
                    <th scope="col">Type</th>
                    <th scope="col">Quiz</th>
                    <th scope="col">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.slice(0, 12).map((a) => {
                    const quiz = state.quizzes.find((q) => q.id === a.quizId);
                    const title = quiz?.title ?? "Removed or unknown quiz";
                    const when = a.finishedAt ?? a.startedAt;
                    const { text: scoreText } = attemptScore(a);
                    const typeLabel = isPracticeAttempt(a) ? `Study · ${a.mode}` : "Exam";
                    return (
                      <tr key={a.id}>
                        <td>{formatWhen(when)}</td>
                        <td>
                          <span
                            className={`results-type-pill ${isPracticeAttempt(a) ? "" : "results-type-pill--exam"}`}
                          >
                            {typeLabel}
                          </span>
                        </td>
                        <td>{title}</td>
                        <td style={{ fontVariantNumeric: "tabular-nums" }}>{scoreText}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

        </StaggerChildren>
        {showChat && (
          <ChatDock
            mode="study"
            onClose={() => setShowChat(false)}
            initialMessage={getCoachMessage()}
          />
        )}
        </>
      )}
    </PageShell>
  );
}
