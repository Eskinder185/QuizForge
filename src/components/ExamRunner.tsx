import React, { useState, useEffect, useCallback } from "react";
import { useApp } from "../store/app";
import { formatTimeRemaining, isTimeUp, isCorrectAnswer, humanTime } from "../utils/exam";
import type { ExamAttempt, Question } from "../types/quiz";

interface ExamRunnerProps {
  attempt: ExamAttempt;
  onFinish: (autoSubmitted?: boolean) => void;
}

export default function ExamRunner({ attempt, onFinish }: ExamRunnerProps) {
  const { state, dispatch } = useApp();
  const [timeRemaining, setTimeRemaining] = useState(formatTimeRemaining(attempt));
  const [eliminateMode, setEliminateMode] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const quiz = state.quizzes.find(q => q.id === attempt.quizId);
  const currentQuestion = quiz?.questions.find(q => q.id === attempt.questionIds[attempt.current]);
  const currentSelection = attempt.selected[currentQuestion?.id || ""] || [];
  const currentEliminated = attempt.eliminated[currentQuestion?.id || ""] || [];
  const isFlagged = attempt.flagged[currentQuestion?.id || ""] || false;

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = formatTimeRemaining(attempt);
      setTimeRemaining(remaining);
      
      if (isTimeUp(attempt)) {
        onFinish(true); // Auto-submit
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [attempt, onFinish]);

  // Track question time
  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [attempt.current]);

  const handleSelection = useCallback((choiceId: string) => {
    if (!currentQuestion) return;

    if (eliminateMode) {
      const newEliminated = currentEliminated.includes(choiceId)
        ? currentEliminated.filter(id => id !== choiceId)
        : [...currentEliminated, choiceId];
      
      dispatch({ type: "updateExamElimination", questionId: currentQuestion.id, eliminated: newEliminated });
    } else {
      let newSelection: string[];
      
      if (currentQuestion.type === "single" || currentQuestion.type === "truefalse") {
        newSelection = [choiceId];
      } else if (currentQuestion.type === "multi") {
        newSelection = currentSelection.includes(choiceId)
          ? currentSelection.filter(id => id !== choiceId)
          : [...currentSelection, choiceId];
      } else {
        newSelection = [choiceId];
      }
      
      dispatch({ type: "updateExamSelection", questionId: currentQuestion.id, selected: newSelection });
    }
  }, [currentQuestion, currentSelection, currentEliminated, eliminateMode, dispatch]);

  const handleFlag = useCallback(() => {
    if (!currentQuestion) return;
    dispatch({ type: "updateExamFlag", questionId: currentQuestion.id, flagged: !isFlagged });
  }, [currentQuestion, isFlagged, dispatch]);

  const handleNavigate = useCallback((direction: "prev" | "next") => {
    const newIndex = direction === "prev" ? attempt.current - 1 : attempt.current + 1;
    if (newIndex >= 0 && newIndex < attempt.questionIds.length) {
      dispatch({ type: "navigateExamQuestion", questionIndex: newIndex });
    }
  }, [attempt.current, attempt.questionIds.length, dispatch]);

  const handleSubmit = useCallback(() => {
    onFinish(false);
  }, [onFinish]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch (e.key) {
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
          const index = parseInt(e.key) - 1;
          if (currentQuestion?.choices && index < currentQuestion.choices.length) {
            handleSelection(currentQuestion.choices[index].id);
          }
          break;
        case "ArrowLeft":
          e.preventDefault();
          handleNavigate("prev");
          break;
        case "ArrowRight":
          e.preventDefault();
          handleNavigate("next");
          break;
        case "f":
        case "F":
          e.preventDefault();
          handleFlag();
          break;
        case "e":
        case "E":
          e.preventDefault();
          setEliminateMode(!eliminateMode);
          break;
        case "s":
        case "S":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleSubmit();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentQuestion, handleSelection, handleNavigate, handleFlag, handleSubmit, eliminateMode]);

  if (!quiz || !currentQuestion) {
    return <div>Loading...</div>;
  }

  const canGoBack = attempt.current > 0;
  const canGoForward = attempt.current < attempt.questionIds.length - 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Header */}
      <div className="panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ fontSize: "var(--font-size-lg)", fontWeight: 600 }}>
            Question {attempt.current + 1} of {attempt.questionIds.length}
          </div>
          <div style={{ 
            fontSize: "var(--font-size-lg)", 
            fontWeight: 600,
            color: isTimeUp(attempt) ? "var(--danger)" : "var(--accent)"
          }}>
            {timeRemaining}
          </div>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => setEliminateMode(!eliminateMode)}
            className={`btn ${eliminateMode ? "primary" : "secondary"}`}
            style={{ fontSize: "12px" }}
          >
            {eliminateMode ? "Eliminate Mode" : "Select Mode"}
          </button>
          <button
            onClick={handleFlag}
            className={`btn ${isFlagged ? "primary" : "secondary"}`}
            style={{ fontSize: "12px" }}
          >
            {isFlagged ? "Flagged" : "Flag"}
          </button>
          <button
            onClick={handleSubmit}
            className="btn danger"
          >
            Submit Exam
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, gap: "16px" }}>
        {/* Main Question Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div className="card" style={{ flex: 1 }}>
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, marginBottom: "8px" }}>
                {currentQuestion.prompt}
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <div className="badge">{currentQuestion.type}</div>
                {currentQuestion.difficulty && (
                  <div className={`badge ${currentQuestion.difficulty === "easy" ? "success" : currentQuestion.difficulty === "medium" ? "warning" : "danger"}`}>
                    {currentQuestion.difficulty}
                  </div>
                )}
                {currentQuestion.tags?.map(tag => (
                  <div key={tag} className="badge">{tag}</div>
                ))}
              </div>
            </div>

            {/* Choices */}
            {currentQuestion.choices && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
                {currentQuestion.choices.map((choice, index) => {
                  const isSelected = currentSelection.includes(choice.id);
                  const isEliminated = currentEliminated.includes(choice.id);
                  
                  return (
                    <button
                      key={choice.id}
                      onClick={() => handleSelection(choice.id)}
                      className={`btn ${isSelected ? "primary" : "secondary"}`}
                      style={{
                        textAlign: "left",
                        justifyContent: "flex-start",
                        textDecoration: isEliminated ? "line-through" : "none",
                        opacity: isEliminated ? 0.5 : 1,
                        backgroundColor: isEliminated ? "rgba(244, 63, 94, 0.1)" : undefined
                      }}
                    >
                      <span style={{ marginRight: "8px", fontWeight: 600 }}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      {choice.text}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Text Input */}
            {currentQuestion.type === "text" && (
              <textarea
                value={currentSelection[0] || ""}
                onChange={(e) => {
                  if (currentQuestion) {
                    dispatch({ type: "updateExamSelection", questionId: currentQuestion.id, selected: [e.target.value] });
                  }
                }}
                className="input"
                style={{ minHeight: "100px", resize: "vertical" }}
                placeholder="Enter your answer..."
              />
            )}

            {/* Navigation */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
              <button
                onClick={() => handleNavigate("prev")}
                disabled={!canGoBack}
                className="btn secondary"
              >
                ← Previous
              </button>
              <button
                onClick={() => handleNavigate("next")}
                disabled={!canGoForward}
                className="btn secondary"
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* Question Palette */}
        <div style={{ width: "200px" }}>
          <div className="card">
            <div style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, marginBottom: "12px" }}>
              Question Palette
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "4px" }}>
              {attempt.questionIds.map((questionId, index) => {
                const isCurrent = index === attempt.current;
                const isAnswered = attempt.selected[questionId]?.length > 0;
                const isFlagged = attempt.flagged[questionId];
                
                return (
                  <button
                    key={questionId}
                    onClick={() => dispatch({ type: "navigateExamQuestion", questionIndex: index })}
                    className={`btn ${isCurrent ? "primary" : isFlagged ? "warning" : isAnswered ? "success" : "secondary"}`}
                    style={{ 
                      minWidth: "32px", 
                      height: "32px", 
                      padding: "0",
                      fontSize: "12px"
                    }}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
