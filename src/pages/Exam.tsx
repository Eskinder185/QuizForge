import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../store/app";
import { scoreAttempt } from "../utils/exam";
import { analyzePerformance, buildMicroDrill } from "../utils/analytics";
import PageHeader from "../components/PageHeader";
import Empty from "../components/Empty";
import ExamSetup from "../components/ExamSetup";
import ExamRunner from "../components/ExamRunner";
import ExamReview from "../components/ExamReview";
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
      <div className="panel" style={{ 
        background: "rgba(16, 185, 129, 0.1)", 
        border: "1px solid rgba(16, 185, 129, 0.3)",
        marginBottom: "16px"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ 
              width: "8px", 
              height: "8px", 
              background: "var(--success)", 
              borderRadius: "50%" 
            }}></div>
            <span style={{ fontSize: "14px", color: "var(--success)" }}>
              Privacy-first: no webcam, no mic, local-only
            </span>
          </div>
          <a 
            href="/about#privacy" 
            style={{ 
              fontSize: "12px", 
              color: "var(--success)", 
              textDecoration: "underline" 
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
        <ExamRunner 
          attempt={currentAttempt} 
          onFinish={handleFinishExam} 
        />
      )}

      {mode === "review" && currentAttempt && (
        <ExamReview 
          attempt={currentAttempt} 
          onClose={handleCloseReview} 
        />
      )}
    </div>
  );
}
