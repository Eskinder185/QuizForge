import type { Quiz, Question, ExamAttempt, ExamPreset } from "../types/quiz";

export function scoreAttempt(quiz: Quiz, attempt: ExamAttempt): { scorePct: number; correctCount: number; total: number } {
  const total = attempt.questionIds.length;
  const correctCount = attempt.answers.filter(answer => answer.correct).length;
  const scorePct = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  
  return { scorePct, correctCount, total };
}

export function humanTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

export function shuffle<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function buildExamSet(quiz: Quiz, numQuestions: number, options: { shuffle?: boolean } = {}): Question[] {
  const questions = options.shuffle ? shuffle(quiz.questions) : [...quiz.questions];
  return questions.slice(0, Math.min(numQuestions, questions.length));
}

export function createExamAttempt(
  quiz: Quiz,
  preset?: ExamPreset,
  custom?: { numQuestions: number; totalMinutes: number }
): ExamAttempt {
  const numQuestions = preset?.numQuestions || custom?.numQuestions || 10;
  const totalMinutes = preset?.totalMinutes || custom?.totalMinutes || 30;
  
  const questionIds = buildExamSet(quiz, numQuestions, { shuffle: true }).map(q => q.id);
  
  return {
    id: crypto.randomUUID(),
    quizId: quiz.id,
    presetId: preset?.id,
    custom,
    startedAt: Date.now(),
    totalMinutes,
    questionIds,
    current: 0,
    selected: {},
    eliminated: {},
    flagged: {},
    answers: []
  };
}

export function calculateQuestionTime(attempt: ExamAttempt, questionId: string): number {
  const answer = attempt.answers.find(a => a.questionId === questionId);
  return answer?.timeMs || 0;
}

export function getQuestionStatus(attempt: ExamAttempt, questionId: string): "unanswered" | "answered" | "flagged" {
  if (attempt.flagged[questionId]) return "flagged";
  if (attempt.selected[questionId]?.length > 0) return "answered";
  return "unanswered";
}

export function isCorrectAnswer(question: Question, selected: string[]): boolean {
  if (!question.choices) return false;
  
  const correctChoices = question.choices.filter(c => c.correct).map(c => c.id);
  
  if (question.type === "single" || question.type === "truefalse") {
    return selected.length === 1 && correctChoices.includes(selected[0]);
  } else if (question.type === "multi") {
    return selected.length === correctChoices.length && 
           selected.every(id => correctChoices.includes(id));
  }
  
  return false;
}

export function formatTimeRemaining(attempt: ExamAttempt): string {
  const elapsed = Date.now() - attempt.startedAt;
  const remaining = (attempt.totalMinutes * 60 * 1000) - elapsed;
  
  if (remaining <= 0) return "00:00";
  
  const minutes = Math.floor(remaining / (60 * 1000));
  const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function isTimeUp(attempt: ExamAttempt): boolean {
  const elapsed = Date.now() - attempt.startedAt;
  return elapsed >= (attempt.totalMinutes * 60 * 1000);
}

export function calibrationBins(attempts: any[]): { confidence: number; accuracy: number; count: number }[] {
  // Simple calibration bins for demo
  return [
    { confidence: 0.1, accuracy: 0.15, count: 5 },
    { confidence: 0.3, accuracy: 0.25, count: 8 },
    { confidence: 0.5, accuracy: 0.45, count: 12 },
    { confidence: 0.7, accuracy: 0.65, count: 15 },
    { confidence: 0.9, accuracy: 0.85, count: 10 }
  ];
}