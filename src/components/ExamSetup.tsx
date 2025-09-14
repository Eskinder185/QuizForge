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
    <div className="card" style={{ 
      maxWidth: "600px", 
      margin: "0 auto"
    }}>
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
        <label className="lead" style={{ display: "block", marginBottom: "var(--space-xs)" }}>
          Select Quiz
        </label>
        <select
          value={selectedQuizId}
          onChange={(e) => setSelectedQuizId(e.target.value)}
          className="input"
          style={{ width: "100%" }}
        >
          <option value="">Choose a quiz...</option>
          {state.quizzes.map(quiz => (
            <option key={quiz.id} value={quiz.id}>
              {quiz.title} ({quiz.questions.length} questions)
            </option>
          ))}
        </select>
        {selectedQuiz && (
          <div style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>
            {selectedQuiz.questions.length} questions available
          </div>
        )}
      </div>

      {/* Preset Selection */}
      <div style={{ marginBottom: "20px" }}>
        <label className="lead" style={{ display: "block", marginBottom: "8px" }}>
          Exam Format
        </label>
        <div style={{ 
          display: "flex", 
          gap: "var(--space-sm)", 
          marginBottom: "var(--space-sm)",
          flexWrap: "wrap"
        }}>
          <label style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "var(--space-xs)", 
            cursor: "pointer",
            padding: "var(--pad-1) var(--pad-2)",
            borderRadius: "var(--radius-sm)",
            background: !customMode ? "var(--surface-1)" : "transparent",
            border: !customMode ? "1px solid var(--border-mid)" : "1px solid transparent",
            transition: "all var(--transition-fast)",
            minHeight: "32px"
          }}>
            <input
              type="radio"
              checked={!customMode}
              onChange={() => setCustomMode(false)}
              style={{ margin: 0 }}
            />
            Use Preset
          </label>
          <label style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "var(--space-xs)", 
            cursor: "pointer",
            padding: "var(--pad-1) var(--pad-2)",
            borderRadius: "var(--radius-sm)",
            background: customMode ? "var(--surface-1)" : "transparent",
            border: customMode ? "1px solid var(--border-mid)" : "1px solid transparent",
            transition: "all var(--transition-fast)",
            minHeight: "32px"
          }}>
            <input
              type="radio"
              checked={customMode}
              onChange={() => setCustomMode(true)}
              style={{ margin: 0 }}
            />
            Custom
          </label>
        </div>

        {!customMode ? (
          <select
            value={selectedPresetId}
            onChange={(e) => setSelectedPresetId(e.target.value)}
            className="input"
            style={{ width: "100%" }}
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
              <label className="lead" style={{ display: "block", marginBottom: "4px" }}>
                Questions
              </label>
              <input
                type="number"
                min="1"
                max={selectedQuiz?.questions.length || 100}
                value={customQuestions}
                onChange={(e) => setCustomQuestions(parseInt(e.target.value) || 1)}
                className="input"
                style={{ minHeight: "44px" }}
              />
            </div>
            <div>
              <label className="lead" style={{ display: "block", marginBottom: "4px" }}>
                Minutes
              </label>
              <input
                type="number"
                min="1"
                max="300"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(parseInt(e.target.value) || 1)}
                className="input"
                style={{ minHeight: "44px" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Options */}
      <div style={{ marginBottom: "24px" }}>
        <label className="lead" style={{ display: "block", marginBottom: "12px" }}>
          Options
        </label>
        <div style={{ display: "grid", gap: "var(--space-xs)" }}>
          {Object.entries(options).map(([key, value]) => (
            <label key={key} style={{ 
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
            }}>
              <input
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
          ))}
        </div>
      </div>

      {/* Start Button */}
      <div style={{ 
        display: "flex", 
        gap: "var(--space-sm)", 
        justifyContent: "stretch",
        flexDirection: "column"
      }}>
        <button
          onClick={handleStart}
          disabled={!canStart}
          className="btn primary lg"
        >
          Start Exam
        </button>
        <button
          onClick={() => navigate("/")}
          className="btn ghost"
        >
          Cancel
        </button>
      </div>

      {!canStart && (
        <div style={{ 
          marginTop: "12px", 
          padding: "8px 12px", 
          background: "rgba(244, 63, 94, 0.1)", 
          border: "1px solid rgba(244, 63, 94, 0.3)", 
          borderRadius: "8px",
          fontSize: "14px",
          color: "var(--danger)"
        }}>
          {!selectedQuiz ? "Please select a quiz" :
           selectedQuiz.questions.length === 0 ? "Selected quiz has no questions" :
           !customMode && !selectedPreset ? "Please select a preset or use custom mode" :
           customMode && (customQuestions <= 0 || customMinutes <= 0) ? "Please set valid custom values" :
           "Ready to start"}
        </div>
      )}
    </div>
  );
}

