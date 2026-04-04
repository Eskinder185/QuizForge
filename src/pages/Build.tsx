import React from "react";
import PageHeader from "../components/PageHeader";
import Empty from "../components/Empty";
import ChatDock from "../components/ChatDock";
import SourcesPanel from "../components/SourcesPanel";
import { PageShell } from "../components/ui";
import { useApp } from "../store/app";
import type { Quiz, Question, SourceRef } from "../types/quiz";
import type { ParsedItem } from "../ai/json";

export default function Build() {
  const { state, dispatch } = useApp();
  const [title, setTitle] = React.useState("Untitled Quiz");
  const [topic, setTopic] = React.useState("General");
  const [selectedId, setSelectedId] = React.useState<string|undefined>(undefined);
  const [showChat, setShowChat] = React.useState(false);

  function addQuestion(type: "single" | "multi" | "truefalse" | "text" | "code") {
    const base = { id: crypto.randomUUID(), prompt: "New question", tags: [topic], difficulty: "medium" as const, explanation: "" };
    let q: Question;
    if (type === "text" || type === "code") {
      q = { ...base, type, answerText: "" };
    } else if (type === "truefalse") {
      q = { ...base, type, choices: [
        { id: crypto.randomUUID(), text: "True", correct: true },
        { id: crypto.randomUUID(), text: "False" }
      ] };
    } else if (type === "multi") {
      q = { ...base, type, choices: [
        { id: crypto.randomUUID(), text: "Choice A" },
        { id: crypto.randomUUID(), text: "Choice B" },
        { id: crypto.randomUUID(), text: "Choice C" }
      ] };
    } else {
      q = { ...base, type: "single", choices: [
        { id: crypto.randomUUID(), text: "Choice A", correct: true },
        { id: crypto.randomUUID(), text: "Choice B" }
      ] };
    }
    const existing = state.quizzes.find(qz => qz.id === state.activeQuizId);
    if (!existing) {
      const quiz: Quiz = { id: crypto.randomUUID(), title, topic, questions: [q], sources: {} };
      dispatch({ type: "addQuiz", quiz }); setSelectedId(q.id);
    } else {
      existing.questions.push(q); setSelectedId(q.id);
      // force redraw by re-setting active quiz
      dispatch({ type: "setActiveQuiz", quizId: existing.id });
    }
  }

  const handleInsertItems = (items: ParsedItem[]) => {
    const existing = state.quizzes.find(qz => qz.id === state.activeQuizId);
    const quizId = existing?.id || crypto.randomUUID();
    
    const questions: Question[] = items.map(item => ({
      id: crypto.randomUUID(),
      type: item.type === "text" ? "text" : item.type,
      prompt: item.prompt,
      choices: item.choices?.map(choice => ({
        id: crypto.randomUUID(),
        text: choice.text,
        correct: choice.correct
      })),
      answerText: item.answerText,
      tags: item.tags || [topic],
      difficulty: item.difficulty || "medium",
      explanation: item.explanation || ""
    }));

    if (!existing) {
      const quiz: Quiz = { 
        id: quizId, 
        title, 
        topic, 
        questions, 
        sources: {} 
      };
      dispatch({ type: "addQuiz", quiz });
    } else {
      const updatedQuiz = {
        ...existing,
        questions: [...existing.questions, ...questions]
      };
      dispatch({ type: "updateQuiz", quiz: updatedQuiz });
    }
    
    setShowChat(false);
  };

  const handleAddSource = () => {
    if (!selectedId || !quiz) return;
    
    const newSource: SourceRef = {
      url: "",
      snippet: "",
      note: ""
    };
    
    dispatch({ type: "addSourceRef", questionId: selectedId, ref: newSource });
  };

  const quiz = state.quizzes.find((qz: Quiz) => qz.id === state.activeQuizId);

  return (
    <PageShell variant="workspace">
      <PageHeader
        title="Build"
        subtitle={
          quiz
            ? "Create questions and sources. Keep it small and focused."
            : "Add your first question to create a quiz—then refine prompts, choices, and sources."
        }
        right={
          <div className="row">
            <button 
              className="btn secondary"
              onClick={() => setShowChat(true)}
            >
              Ask AI
            </button>
            <button
              type="button"
              className="btn ghost"
              disabled={!quiz}
              title={
                quiz
                  ? "Local-only: keeps your work in the browser (no server publish)"
                  : "Add a question first—there is no draft to save yet"
              }
            >
              Save draft
            </button>
            <button
              type="button"
              className="btn primary"
              disabled={!quiz}
              title={
                quiz
                  ? "Marks this quiz ready to use in Study and Exam (still stored locally)"
                  : "Create at least one question before publishing"
              }
            >
              Publish
            </button>
          </div>
        }
      />

      <div className="panel panel--editor">
        {!quiz && (
          <p className="build-first-step-hint" role="status">
            <strong>Start here:</strong> pick a question type below. Your quiz is saved as soon as the first question
            exists—you can edit wording, choices, and notes afterward.
          </p>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label htmlFor="build-quiz-title" className="lead" style={{ marginBottom: "8px", display: "block" }}>
              Quiz title
            </label>
            <input
              id="build-quiz-title"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Week 4 — Thermodynamics"
              autoComplete="off"
              aria-describedby="build-quiz-title-hint"
            />
            <span id="build-quiz-title-hint" className="sr-only">
              Shown at the top of your quiz when you add questions.
            </span>
          </div>
          <div>
            <label htmlFor="build-quiz-topic" className="lead" style={{ marginBottom: "8px", display: "block" }}>
              Default topic tag
            </label>
            <input
              id="build-quiz-topic"
              className="input"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Physics, Interview prep"
              autoComplete="off"
              aria-describedby="build-quiz-topic-hint"
            />
            <span id="build-quiz-topic-hint" className="sr-only">
              New questions inherit this tag until you change it on each question.
            </span>
          </div>
        </div>
        
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button type="button" className="btn secondary" onClick={() => addQuestion("single")}>
            + Single choice
          </button>
          <button type="button" className="btn secondary" onClick={() => addQuestion("multi")}>
            + Multiple choice
          </button>
          <button type="button" className="btn secondary" onClick={() => addQuestion("truefalse")}>
            + True / false
          </button>
          <button type="button" className="btn secondary" onClick={() => addQuestion("text")}>
            + Short answer
          </button>
          <button type="button" className="btn secondary" onClick={() => addQuestion("code")}>
            + Code
          </button>
        </div>
      </div>

      {!quiz && (
        <Empty
          flowStep="build"
          title="Your question list will appear here"
          body="Nothing is wrong—there are no questions yet. Use the buttons above to add one, or jump in with a ready-made multiple-choice stub."
          hint="After questions show up in this list, click one to edit it and attach sources on the right."
          primaryAction={{ label: "Add my first question", onClick: () => addQuestion("single") }}
        />
      )}

      {quiz && (
        <div
          style={{
            marginTop: "var(--space-2xl)",
            display: "grid",
            gap: "var(--space-2xl)",
            gridTemplateColumns: "2fr 1fr",
          }}
        >
          <div className="build-column">
            <h2 className="build-column-title">{quiz.title}</h2>
            <div role="listbox" aria-label="Questions in this quiz" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {quiz.questions.map((q, idx) => (
                <div
                  key={q.id}
                  id={`build-q-${q.id}`}
                  role="option"
                  aria-selected={selectedId === q.id}
                  tabIndex={0}
                  className={`panel panel--selectable${selectedId === q.id ? " is-selected" : ""}`}
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelectedId(q.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedId(q.id);
                    }
                  }}
                >
                  <div className="row" style={{ marginBottom: "8px" }}>
                    <div className="badge">{q.type}</div>
                    <div className="spacer" />
                    <div className="lead">Question {idx + 1}</div>
                  </div>
                  <div style={{ fontSize: "var(--font-size-base)", lineHeight: 1.5 }}>
                    {q.prompt}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="build-column">
            <h2 className="build-column-title">Sources & notes</h2>
            {selectedId ? (
              <SourcesPanel quizId={quiz.id} questionId={selectedId} />
            ) : (
              <div>
                <div className="lead" style={{ marginBottom: "16px" }}>
                  Select a question to add URLs, code snippets, or study notes.
                </div>
                <button 
                  className="btn secondary" 
                  disabled={!selectedId}
                  onClick={handleAddSource}
                >
                  + Add Source
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showChat && (
        <ChatDock
          mode="build"
          onClose={() => setShowChat(false)}
          onInsertItems={handleInsertItems}
        />
      )}
    </PageShell>
  );
}
