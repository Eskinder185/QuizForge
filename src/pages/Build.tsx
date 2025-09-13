// Remove all code after this line (duplicate/stray Build component)
// (File should end after the single Build component above)
import React from "react";
import PageHeader from "../components/PageHeader";
import Empty from "../components/Empty";
import ChatDock from "../components/ChatDock";
import SourcesPanel from "../components/SourcesPanel";
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
    <div className="container">
      <PageHeader
        title="Build"
        subtitle="Create questions and sources. Keep it small and focused."
        right={
          <div className="row">
            <button 
              className="btn secondary"
              onClick={() => setShowChat(true)}
            >
              ✨ Ask AI
            </button>
            <button className="btn ghost">Save Draft</button>
            <button className="btn primary">Publish</button>
          </div>
        }
      />

      <div className="panel" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <div className="lead" style={{ marginBottom: "8px" }}>Title</div>
            <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter quiz title..." />
          </div>
          <div>
            <div className="lead" style={{ marginBottom: "8px" }}>Topic</div>
            <input className="input" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g., React, Math, Science..." />
          </div>
        </div>
        
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button className="btn secondary" onClick={() => addQuestion("single")}>+ Single Choice</button>
          <button className="btn secondary" onClick={() => addQuestion("multi")}>+ Multiple Choice</button>
          <button className="btn secondary" onClick={() => addQuestion("truefalse")}>+ True/False</button>
          <button className="btn secondary" onClick={() => addQuestion("text")}>+ Short Answer</button>
          <button className="btn secondary" onClick={() => addQuestion("code")}>+ Code</button>
        </div>
      </div>

      {!quiz && (
        <div style={{ marginTop: "24px" }}>
          <Empty title="No quiz yet" body="Add your first question to start a quiz." />
        </div>
      )}

      {quiz && (
        <div style={{ marginTop: "24px", display: "grid", gap: "20px", gridTemplateColumns: "2fr 1fr" }}>
          <div className="card">
            <div style={{ fontSize: "var(--font-size-xl)", fontWeight: 600, marginBottom: "16px" }}>
              {quiz.title}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {quiz.questions.map((q, idx) => (
                <div 
                  key={q.id} 
                  className="panel" 
                  style={{ 
                    cursor: "pointer", 
                    borderColor: selectedId === q.id ? "var(--accent)" : "var(--border)",
                    borderWidth: selectedId === q.id ? "2px" : "1px",
                    transition: "all 120ms ease"
                  }} 
                  onClick={() => setSelectedId(q.id)}
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

          <div className="card">
            <div style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, marginBottom: "12px" }}>
              Sources & Notes
            </div>
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
    </div>
  );
}
