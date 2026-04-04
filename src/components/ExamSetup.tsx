import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../store/app";
import { createExamAttempt } from "../utils/exam";
import type { ExamPreset } from "../types/quiz";

interface ExamSetupProps {
  onStart: (attempt: any) => void;
}

export default function ExamSetup({ onStart }: ExamSetupProps) {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  
  const [selectedQuizId, setSelectedQuizId] = useState<string>("");
  const [selectedPresetId, setSelectedPresetId] = useState<string>("");
  const [customMode, setCustomMode] = useState(false);
  const [customQuestions, setCustomQuestions] = useState(20);
  const [customMinutes, setCustomMinutes] = useState(30);
  
  const [options, setOptions] = useState({
    shuffle: true,
    allowBacktrack: true,
    showPalette: true,
    perQuestionTimer: false,
    autoSubmit: true
  });

  const selectedQuiz = state.quizzes.find(q => q.id === selectedQuizId);
  const selectedPreset = state.examPresets.find(p => p.id === selectedPresetId);

  const handleStart = () => {
    if (!selectedQuiz) return;
    
    const preset = customMode ? undefined : selectedPreset;
    const custom = customMode ? { numQuestions: customQuestions, totalMinutes: customMinutes } : undefined;
    
    const attempt = createExamAttempt(selectedQuiz, preset, custom);
    
    dispatch({ type: "startExamAttempt", attempt });
    onStart(attempt);
  };

  const canStart = selectedQuiz && selectedQuiz.questions.length > 0 && 
    (customMode ? customQuestions > 0 && customMinutes > 0 : selectedPreset);

  return (
    <div className="exam-setup">
      <h2 style={{ 
        fontSize: "var(--font-size-xl)", 
        fontWeight: 600, 
        marginBottom: "var(--space-lg)",
        textAlign: "center"
      }}>
        Exam Setup
      </h2>

      {/* Quiz Selection */}
      <div style={{ marginBottom: "var(--space-lg)" }}>
        <label htmlFor="exam-setup-quiz" className="lead" style={{ display: "block", marginBottom: "var(--space-xs)" }}>
          Select quiz
        </label>
        <select
          id="exam-setup-quiz"
          value={selectedQuizId}
          onChange={(e) => setSelectedQuizId(e.target.value)}
          className="input"
          style={{ width: "100%" }}
          aria-describedby="exam-setup-quiz-help"
        >
          <option value="">Choose a quiz...</option>
          {state.quizzes.map(quiz => (
            <option key={quiz.id} value={quiz.id}>
              {quiz.title} ({quiz.questions.length} questions)
            </option>
          ))}
        </select>
        <p id="exam-setup-quiz-help" className="text-xs text-muted" style={{ margin: "var(--space-xs) 0 0" }}>
          Only quizzes you built with at least one question appear here.
        </p>
        {selectedQuiz && (
          <div style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>
            {selectedQuiz.questions.length} questions available
          </div>
        )}
      </div>

      {/* Preset Selection */}
      <fieldset style={{ marginBottom: "20px", border: "none", padding: 0, marginInline: 0 }}>
        <legend className="lead" style={{ display: "block", marginBottom: "8px", padding: 0 }}>
          Exam format
        </legend>
        <div
          style={{
            display: "flex",
            gap: "var(--space-sm)",
            marginBottom: "var(--space-sm)",
            flexWrap: "wrap",
          }}
          role="radiogroup"
          aria-label="Use a preset length or custom counts"
        >
          <label
            htmlFor="exam-mode-preset"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-xs)",
              cursor: "pointer",
              padding: "var(--pad-1) var(--pad-2)",
              borderRadius: "var(--radius-sm)",
              background: !customMode ? "var(--surface-1)" : "transparent",
              border: !customMode ? "1px solid var(--border-mid)" : "1px solid transparent",
              transition: "all var(--transition-fast)",
              minHeight: "32px",
            }}
          >
            <input
              id="exam-mode-preset"
              type="radio"
              name="exam-format"
              checked={!customMode}
              onChange={() => setCustomMode(false)}
              style={{ margin: 0 }}
            />
            Use preset
          </label>
          <label
            htmlFor="exam-mode-custom"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-xs)",
              cursor: "pointer",
              padding: "var(--pad-1) var(--pad-2)",
              borderRadius: "var(--radius-sm)",
              background: customMode ? "var(--surface-1)" : "transparent",
              border: customMode ? "1px solid var(--border-mid)" : "1px solid transparent",
              transition: "all var(--transition-fast)",
              minHeight: "32px",
            }}
          >
            <input
              id="exam-mode-custom"
              type="radio"
              name="exam-format"
              checked={customMode}
              onChange={() => setCustomMode(true)}
              style={{ margin: 0 }}
            />
            Custom
          </label>
        </div>

        {!customMode ? (
          <select
            id="exam-setup-preset"
            value={selectedPresetId}
            onChange={(e) => setSelectedPresetId(e.target.value)}
            className="input"
            style={{ width: "100%" }}
            aria-label="Timed exam preset"
          >
            <option value="">Choose a preset...</option>
            {state.examPresets.map(preset => (
              <option key={preset.id} value={preset.id}>
                {preset.name} - {preset.numQuestions} questions, {preset.totalMinutes} minutes
              </option>
            ))}
          </select>
        ) : (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", 
            gap: "12px" 
          }}>
            <div>
              <label htmlFor="exam-custom-questions" className="lead" style={{ display: "block", marginBottom: "4px" }}>
                Questions
              </label>
              <input
                id="exam-custom-questions"
                type="number"
                min="1"
                max={selectedQuiz?.questions.length || 100}
                value={customQuestions}
                onChange={(e) => setCustomQuestions(parseInt(e.target.value, 10) || 1)}
                className="input"
                style={{ minHeight: "44px" }}
              />
            </div>
            <div>
              <label htmlFor="exam-custom-minutes" className="lead" style={{ display: "block", marginBottom: "4px" }}>
                Minutes
              </label>
              <input
                id="exam-custom-minutes"
                type="number"
                min="1"
                max="300"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(parseInt(e.target.value, 10) || 1)}
                className="input"
                style={{ minHeight: "44px" }}
              />
            </div>
          </div>
        )}
      </fieldset>

      {/* Options */}
      <fieldset style={{ marginBottom: "24px", border: "none", padding: 0, marginInline: 0 }}>
        <legend className="lead" style={{ display: "block", marginBottom: "12px", padding: 0 }}>
          Options
        </legend>
        <div style={{ display: "grid", gap: "var(--space-xs)" }}>
          {Object.entries(options).map(([key, value]) => {
            const optId = `exam-opt-${key}`;
            return (
            <label
              key={key}
              htmlFor={optId}
              style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "var(--space-sm)", 
              cursor: "pointer",
              padding: "var(--pad-1) var(--pad-2)",
              borderRadius: "var(--radius-sm)",
              background: "var(--surface-0)",
              border: "1px solid var(--border-weak)",
              transition: "all var(--transition-fast)",
              minHeight: "32px"
            }}
            >
              <input
                id={optId}
                type="checkbox"
                checked={value}
                onChange={(e) => setOptions(prev => ({ ...prev, [key]: e.target.checked }))}
                style={{ margin: 0 }}
              />
              <span style={{ 
                textTransform: "capitalize",
                fontSize: "var(--font-size-sm)",
                lineHeight: "1.4"
              }}>
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </label>
            );
          })}
        </div>
      </fieldset>

      {/* Start Button */}
      <div style={{ 
        display: "flex", 
        gap: "var(--space-sm)", 
        justifyContent: "stretch",
        flexDirection: "column"
      }}>
        <button
          type="button"
          onClick={handleStart}
          disabled={!canStart}
          className="btn primary lg"
          title={
            canStart
              ? "Begin the timed exam with your selected settings"
              : "Choose a quiz and preset (or valid custom settings) to enable start"
          }
        >
          Start exam
        </button>
        <button type="button" onClick={() => navigate("/")} className="btn ghost">
          Cancel
        </button>
      </div>

      {!canStart && (
        <div role="status" aria-live="polite" className="exam-setup-status">
          {!selectedQuiz
            ? "Select a quiz to continue."
            : selectedQuiz.questions.length === 0
              ? "That quiz has no questions yet—add some on Build."
              : !customMode && !selectedPreset
                ? "Pick a preset, or switch to Custom and set question and time limits."
                : customMode && (customQuestions <= 0 || customMinutes <= 0)
                  ? "Enter a positive number of questions and minutes."
                  : "Ready when you are."}
        </div>
      )}
    </div>
  );
}

