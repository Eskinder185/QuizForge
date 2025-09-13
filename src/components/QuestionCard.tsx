import React from "react";
import type { Question } from "../types/quiz";

export default function QuestionCard(props: {
  question: Question;
  mode: "exam" | "review";
  selectedIds: string[];
  eliminatedIds: string[];
  onSelect: (choiceId: string) => void;
  onEliminate: (choiceId: string) => void;
  allowMulti?: boolean;
  showExplanation?: boolean;
  correctIds?: string[];
  sources?: string[];
}) {
  const q = props.question;
  return (
    <div>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{q.prompt}</div>
      {q.type !== "short" && q.type !== "code" && (q.choices || []).map((c: any, i: number) => {
        const selected = props.selectedIds.includes(c.id);
        const eliminated = props.eliminatedIds.includes(c.id);
        const correct = props.correctIds?.includes(c.id);
        return (
          <button
            key={c.id}
            onClick={() => props.onSelect(c.id)}
            disabled={props.mode === "review"}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "10px 12px",
              marginBottom: 8,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.1)",
              background: eliminated ? "rgba(244,63,94,.15)" : selected ? "rgba(34,197,94,.15)" : "rgba(255,255,255,.05)",
              color: correct && props.mode === "review" ? "#86efac" : undefined
            }}
          >
            {i + 1}. {c.text}
          </button>
        );
      })}
      {(q.type === "short" || q.type === "code") && (
        <input
          type="text"
          placeholder="Type your answer"
          onChange={(e) => props.onSelect("text:" + e.target.value)}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,.05)" }}
        />
      )}
      {props.showExplanation && q.explanation && (
        <div style={{ marginTop: 8, fontSize: 14, color: "#cbd5e1" }}>{q.explanation}</div>
      )}
    </div>
  );
}
