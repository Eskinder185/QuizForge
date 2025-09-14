import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../store/app";
import { scoreAttempt } from "../utils/exam";
import { analyzePerformance, buildMicroDrill } from "../utils/analytics";
import PageHeader from "../components/PageHeader";
import Empty from "../components/Empty";
import ExamSetup from "../components/ExamSetup";
import type { ExamAttempt } from "../types/quiz";

type ExamMode = "setup" | "running" | "review" | "results";

export default function Exam() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState<ExamMode>("setup");
  const [currentAttempt, setCurrentAttempt] = useState<ExamAttempt | null>(null);

  const quizzes = state.quizzes ?? [];
  const presets = state.examPresets ?? [];

  // Auto-save current exam state
  useEffect(() => {
    if (state.currentExam) {
      setCurrentAttempt(state.currentExam);
      setMode("running");
    }
  }, [state.currentExam]);

  const handleStartExam = (attempt: ExamAttempt) => {
    setCurrentAttempt(attempt);
    setMode("running");
  };

  const handleFinishExam = (autoSubmitted: boolean = false) => {
    if (!currentAttempt) return;

    // Calculate final answers and score
    const quiz = quizzes.find(q => q.id === currentAttempt.quizId);
    if (!quiz) return;

    const finalAnswers = currentAttempt.questionIds.map(questionId => {
      const question = quiz.questions.find(q => q.id === questionId);
      const selected = currentAttempt.selected[questionId] || [];
      const eliminated = currentAttempt.eliminated[questionId] || [];
      const flagged = currentAttempt.flagged[questionId] || false;
      
      // Calculate time spent (simplified - in real implementation, track per question)
      const timeMs = Math.random() * 120000; // Random for demo
      const changedCount = Math.floor(Math.random() * 5); // Random for demo
      
      const correct = question ? 
        (question.type === "single" || question.type === "truefalse" ? 
          selected.length === 1 && (question.choices?.find(c => c.id === selected[0])?.correct || false) :
          question.type === "multi" ?
          selected.length === question.choices?.filter(c => c.correct).length &&
          selected.every(id => question.choices?.find(c => c.id === id)?.correct || false) :
          false) : false;

      return {
        questionId,
        selected,
        correct,
        timeMs,
        changedCount,
        flagged,
        eliminated
      };
    });

    const finalAttempt: ExamAttempt = {
      ...currentAttempt,
      answers: finalAnswers,
      finishedAt: Date.now()
    };

    const { scorePct } = scoreAttempt(quiz, finalAttempt);
    finalAttempt.score = scorePct;

    dispatch({ type: "finishExamAttempt", attemptId: finalAttempt.id, autoSubmitted });
    setCurrentAttempt(finalAttempt);
    setMode("review");
  };

  const handleCloseReview = () => {
    setMode("results");
    navigate("/results");
  };

  const handlePracticeWeakness = (tag: string) => {
    if (!currentAttempt) return;
    
    const quiz = quizzes.find(q => q.id === currentAttempt.quizId);
    if (!quiz) return;

    const attempts = state.examAttempts.filter(a => a.quizId === quiz.id);
    const analysis = analyzePerformance(quiz, attempts);
    const weakness = analysis.topWeaknesses.find(w => w.tag === tag);
    
    if (weakness) {
      const microDrillQuestions = buildMicroDrill(quiz, [weakness], 8);
      dispatch({ 
        type: "createMicroDrill", 
        quizId: quiz.id, 
        questionIds: microDrillQuestions.map(q => q.id) 
      });
      navigate("/study");
    }
  };

  if (quizzes.length === 0) {
    return (
      <div className="container">
        <PageHeader title="Exam" />
        <Empty 
          title="No quizzes available" 
          body="Create a quiz first to start an exam." 
          cta="Build a quiz" 
          to="/build" 
        />
      </div>
    );
  }

  return (
    <div className="container">
      <PageHeader title="Exam" subtitle="Realistic exam simulator with timers, flags, and review." />

      {/* Privacy Badge */}
      <div style={{ 
        background: "transparent", 
        border: "0",
        padding: "0",
        marginBottom: "var(--space-md)",
        color: "var(--muted)",
        fontSize: "var(--font-size-sm)"
      }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "var(--space-xs)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)", flex: "1", minWidth: "200px" }}>
            <div style={{ 
              width: "6px", 
              height: "6px", 
              background: "var(--success)", 
              borderRadius: "50%",
              flexShrink: 0
            }}></div>
            <span>
              Privacy-first: no webcam, no mic, local-only
            </span>
          </div>
          <a 
            href="/about#privacy" 
            style={{ 
              fontSize: "var(--font-size-xs)", 
              color: "var(--accent)", 
              textDecoration: "underline",
              whiteSpace: "nowrap",
              flexShrink: 0
            }}
            aria-label="Learn more about privacy"
          >
            Learn more
          </a>
        </div>
      </div>

      {mode === "setup" && (
        <ExamSetup onStart={handleStartExam} />
      )}

      {mode === "running" && currentAttempt && (
        <div className="panel">
          <h3>Exam Running</h3>
          <p>Exam functionality is temporarily unavailable. The ExamRunner component has been removed.</p>
          <button 
            className="btn btn-primary" 
            onClick={() => handleFinishExam(true)}
          >
            Finish Exam
          </button>
        </div>
      )}

      {mode === "review" && currentAttempt && (
        <div className="panel">
          <h3>Exam Review</h3>
          <p>Review functionality is temporarily unavailable. The ExamReview component has been removed.</p>
          <button 
            className="btn btn-primary" 
            onClick={handleCloseReview}
          >
            Close Review
          </button>
        </div>
      )}
    </div>
  );
}
