import type { Quiz, Question } from "../types/quiz";

export function exportJSON(quiz: Quiz) {
  return JSON.stringify(quiz, null, 2);
}

export function exportCSV(quiz: Quiz) {
  const lines = ["prompt;answer;tags"];
  quiz.questions.forEach(q => {
    const ans = q.answerText || (q.choices||[]).filter(c=>c.correct).map(c=>c.text).join(", ");
    const tags = (q.tags||[]).join(",");
    lines.push(`${escapeCsv(q.prompt)};${escapeCsv(ans)};${escapeCsv(tags)}`);
  });
  return lines.join("\n");
}

export function importCSV(text: string) {
  const lines = text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
  const header = lines[0]?.toLowerCase();
  const rows = (header && header.includes("prompt")) ? lines.slice(1) : lines;
  const questions: Question[] = rows.map((line, i) => {
    const parts = line.split(";");
    const prompt = parts[0] || `Q${i+1}`;
    const answer = (parts[1] || "").trim();
    const tags = (parts[2] || "").split(/\s+/).filter(Boolean);
    return {
      id: crypto.randomUUID(),
      type: "short",
      prompt,
      answerText: answer,
      tags,
      difficulty: "medium",
    };
  });
  const quiz: Quiz = {
    id: crypto.randomUUID(),
    title: `Imported ${new Date().toLocaleString()}`,
    topic: "Imported",
    questions,
    sources: {},
  };
  return quiz;
}

export function fileDownload(name: string, data: string, mime: string) {
  const blob = new Blob([data], { type: mime });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
}

function escapeCsv(s: string) {
  const needs = /[";,\n]/.test(s);
  return needs ? '"' + s.replace(/"/g, '""') + '"' : s;
}
