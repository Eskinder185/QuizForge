import React, { useState, useMemo } from "react";
import { useApp } from "../store/app";
import { humanTime, isCorrectAnswer } from "../utils/exam";
import type { ExamAttempt, ReviewMode } from "../types/quiz";

interface ExamReviewProps {
  attempt: ExamAttempt;
  onClose: () => void;
}

export default function ExamReview({ attempt, onClose }: ExamReviewProps) {
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState<"wrong" | "flagged" | "all">("all");
  const [currentIndex, setCurrentIndex] = useState(0);

  const quiz = state.quizzes.find(q => q.id === attempt.quizId);

  const filteredAnswers = useMemo(() => {
    if (!quiz) return [];
    
    return attempt.answers.filter(answer => {
      const question = quiz.questions.find(q => q.id === answer.questionId);
      if (!question) return false;
      
      switch (filter) {
        case "wrong":
          return !answer.correct;
        case "flagged":
          return answer.flagged;
        case "all":
        default:
          return true;
      }
    });
  }, [quiz, attempt.answers, filter]);

  const currentAnswer = filteredAnswers[currentIndex];
  const currentQuestion = currentAnswer ? quiz?.questions.find(q => q.id === currentAnswer.questionId) : null;

  const handleNavigate = (direction: "prev" | "next") => {
    if (direction === "prev" && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (direction === "next" && currentIndex < filteredAnswers.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleJumpToQuestion = (index: number) => {
    setCurrentIndex(index);
  };

  if (!quiz || !currentQuestion || !currentAnswer) {
    return <div>Loading...</div>;
  }

  const correctChoices = currentQuestion.choices?.filter(c => c.correct) || [];
  const userSelected = currentAnswer.selected;
  const userEliminated = currentAnswer.eliminated || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Header */}
      <div className="panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <h2 style={{ fontSize: "var(--font-size-xl)", fontWeight: 600, margin: 0 }}>
            Exam Review
          </h2>
          <div style={{ fontSize: "var(--font-size-base)", color: "var(--text-muted)" }}>
            {currentIndex + 1} of {filteredAnswers.length} questions
          </div>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value as "wrong" | "flagged" | "all");
              setCurrentIndex(0);
            }}
            className="input"
          >
            <option value="all">All Questions</option>
            <option value="wrong">Wrong Answers</option>
            <option value="flagged">Flagged Questions</option>
          </select>
          <button onClick={onClose} className="btn secondary">
            Close Review
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, gap: "16px" }}>
        {/* Main Review Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div className="card" style={{ flex: 1 }}>
            {/* Question Header */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <div className={`badge ${currentAnswer.correct ? "success" : "danger"}`}>
                  {currentAnswer.correct ? "Correct" : "Incorrect"}
                </div>
                {currentAnswer.flagged && <div className="badge warning">Flagged</div>}
                <div className="badge">{currentQuestion.type}</div>
                {currentQuestion.difficulty && (
                  <div className={`badge ${currentQuestion.difficulty === "easy" ? "success" : currentQuestion.difficulty === "medium" ? "warning" : "danger"}`}>
                    {currentQuestion.difficulty}
                  </div>
                )}
              </div>
              
              <div style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, marginBottom: "8px" }}>
                {currentQuestion.prompt}
              </div>
              
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {currentQuestion.tags?.map(tag => (
                  <div key={tag} className="badge">{tag}</div>
                ))}
              </div>
            </div>

            {/* Answer Analysis */}
            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, marginBottom: "12px" }}>
                Your Answer
              </h3>
              
              {currentQuestion.choices && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                  {currentQuestion.choices.map((choice, index) => {
                    const isUserSelected = userSelected.includes(choice.id);
                    const isCorrect = choice.correct;
                    const isEliminated = userEliminated.includes(choice.id);
                    
                    let className = "btn secondary";
                    let style: React.CSSProperties = { textAlign: "left", justifyContent: "flex-start" };
                    
                    if (isCorrect && isUserSelected) {
                      className = "btn success";
                    } else if (isCorrect && !isUserSelected) {
                      className = "btn success";
                      style.opacity = 0.7;
                    } else if (!isCorrect && isUserSelected) {
                      className = "btn danger";
                    }
                    
                    if (isEliminated) {
                      style.textDecoration = "line-through";
                      style.opacity = 0.5;
                    }
                    
                    return (
                      <div key={choice.id} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <button className={className} style={style}>
                          <span style={{ marginRight: "8px", fontWeight: 600 }}>
                            {String.fromCharCode(65 + index)}
                          </span>
                          {choice.text}
                        </button>
                        {isCorrect && <span style={{ color: "var(--success)", fontSize: "18px" }}>✓</span>}
                        {!isCorrect && isUserSelected && <span style={{ color: "var(--danger)", fontSize: "18px" }}>✗</span>}
                      </div>
                    );
                  })}
                </div>
              )}

              {currentQuestion.type === "text" && (
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "4px" }}>
                    Your answer:
                  </div>
                  <div className="panel" style={{ padding: "12px", fontStyle: "italic" }}>
                    {userSelected[0] || "No answer provided"}
                  </div>
                </div>
              )}
            </div>

            {/* Explanation */}
            {currentQuestion.explanation && (
              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, marginBottom: "12px" }}>
                  Explanation
                </h3>
                <div className="panel" style={{ padding: "16px" }}>
                  {currentQuestion.explanation}
                </div>
              </div>
            )}

            {/* Sources */}
            {quiz.sources[currentQuestion.id] && quiz.sources[currentQuestion.id].length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, marginBottom: "12px" }}>
                  Sources
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {quiz.sources[currentQuestion.id].map((source, index) => (
                    <div key={index} className="panel" style={{ padding: "12px" }}>
                      {source.url && (
                        <a 
                          href={source.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn ghost"
                          style={{ marginBottom: "8px" }}
                        >
                          {source.url}
                        </a>
                      )}
                      {source.snippet && (
                        <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                          {source.snippet}
                        </div>
                      )}
                      {source.note && (
                        <div style={{ fontSize: "14px", fontStyle: "italic", marginTop: "4px" }}>
                          {source.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px" }}>
              <div className="panel" style={{ padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--accent)" }}>
                  {humanTime(currentAnswer.timeMs)}
                </div>
                <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>Time Spent</div>
              </div>
              <div className="panel" style={{ padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--warning)" }}>
                  {currentAnswer.changedCount}
                </div>
                <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>Changes Made</div>
              </div>
            </div>

            {/* Navigation */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
              <button
                onClick={() => handleNavigate("prev")}
                disabled={currentIndex === 0}
                className="btn secondary"
              >
                ← Previous
              </button>
              <button
                onClick={() => handleNavigate("next")}
                disabled={currentIndex === filteredAnswers.length - 1}
                className="btn secondary"
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Palette */}
        <div style={{ width: "200px" }}>
          <div className="card">
            <div style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, marginBottom: "12px" }}>
              Navigation
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "4px" }}>
              {filteredAnswers.map((answer, index) => {
                const question = quiz.questions.find(q => q.id === answer.questionId);
                const isCurrent = index === currentIndex;
                const isCorrect = answer.correct;
                const isFlagged = answer.flagged;
                
                let className = "btn secondary";
                if (isCurrent) className = "btn primary";
                else if (isFlagged) className = "btn warning";
                else if (isCorrect) className = "btn success";
                else className = "btn danger";
                
                return (
                  <button
                    key={answer.questionId}
                    onClick={() => handleJumpToQuestion(index)}
                    className={className}
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
