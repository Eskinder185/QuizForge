import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../store/app";
import { scoreAttempt } from "../utils/exam";
import { analyzePerformance, buildMicroDrill } from "../utils/analytics";
import PageHeader from "../components/PageHeader";
import Empty from "../components/Empty";
import ExamSetup from "../components/ExamSetup";
import { PageShell } from "../components/ui";
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
      <PageShell>
        <PageHeader
          title="Exam"
          subtitle="Timed runs use the quizzes you save on Build—add one there first."
        />
        <Empty
          flowStep="exam"
          title="You need a quiz before you can start an exam"
          body="The exam simulator pulls from your saved quizzes. Right now you do not have any, so there is nothing to schedule or score."
          hint="Create questions on Build, then return here to pick a preset and start. Afterward, open Results to see how you did."
          cta="Go to Build"
          to="/build"
        />
      </PageShell>
    );
  }

  return (
    <PageShell variant="workspace">
      <PageHeader title="Exam" subtitle="Realistic exam simulator with timers, flags, and review." />

      <div className="exam-privacy-strip">
        <div className="exam-privacy-strip__left">
          <span className="exam-privacy-strip__dot" aria-hidden />
          <span>Privacy-first: no webcam, no mic, local-only</span>
        </div>
        <a
          href="/about#privacy"
          className="text-sm whitespace-nowrap shrink-0"
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--accent)",
            textDecoration: "underline",
            textUnderlineOffset: "3px",
          }}
          aria-label="Learn more about privacy"
        >
          Learn more
        </a>
      </div>

      {mode === "setup" && (
        <ExamSetup onStart={handleStartExam} />
      )}

      {mode === "running" && currentAttempt && (
        <div className="content-section">
          <h3>Exam Running</h3>
          <p>Exam functionality is temporarily unavailable. The ExamRunner component has been removed.</p>
          <button className="btn primary" onClick={() => handleFinishExam(true)}>
            Finish Exam
          </button>
        </div>
      )}

      {mode === "review" && currentAttempt && (
        <div className="content-section">
          <h3>Exam Review</h3>
          <p>Review functionality is temporarily unavailable. The ExamReview component has been removed.</p>
          <button className="btn primary" onClick={handleCloseReview}>
            Close Review
          </button>
        </div>
      )}
    </PageShell>
  );
}
