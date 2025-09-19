export type Choice = { id: string; text: string; correct?: boolean };

export type QuestionType = "single" | "multi" | "truefalse" | "text" | "code" | "short";

export type Question = {
  id: string;
  type: QuestionType;
  prompt: string;
  choices?: Choice[];
  answerText?: string;
  explanation?: string;
  tags?: string[];
  timeLimitSec?: number;
  difficulty?: "easy" | "medium" | "hard";
};

export type SourceRef = {
  url?: string;
  snippet?: string;
  note?: string;
};

export type TrustFactors = {
  hasCitation: boolean;
  multiSources: boolean;
  recencyOk: boolean;
};

export type Quiz = {
  id: string;
  title: string;
  topic: string;
  questions: Question[];
  sources: Record<string, SourceRef[]>; // by questionId
};

export type ReviewCard = {
  questionId: string;
  stability: number;
  difficulty: number;
  dueAt: number;
  lastSeenAt?: number;
};

export type PracticeAttempt = {
  id: string;
  quizId: string;
  mode: "learn" | "timed" | "cram";
  startedAt: number;
  finishedAt?: number;
  answers: { questionId: string; correct: boolean; timeMs: number }[];
};

export type ExamPreset = { id: string; name: string; numQuestions: number; totalMinutes: number; sectionNames?: string[] };

export type ExamAttempt = {
  id: string;
  quizId: string;
  presetId?: string;
  custom?: { numQuestions: number; totalMinutes: number };
  startedAt: number;
  finishedAt?: number;
  totalMinutes: number;
  questionIds: string[];
  current: number;
  selected: Record<string, string[]>; // questionId -> selected choiceIds
  eliminated: Record<string, string[]>; // questionId -> eliminated choiceIds
  flagged: Record<string, boolean>; // questionId -> is flagged
  answers: {
    questionId: string;
    selected: string[];
    correct: boolean;
    timeMs: number;
    changedCount: number;
    flagged: boolean;
    eliminated: string[];
  }[];
  score?: number;
  autoSubmitted?: boolean;
};

export type ReviewMode = {
  attemptId: string;
  filter: "wrong" | "flagged" | "all";
  index: number;
};
