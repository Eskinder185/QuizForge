import React from "react";
import type { Quiz, SourceRef, ReviewCard as Card, PracticeAttempt, ExamPreset, ExamAttempt, Question, ReviewMode } from "../types/quiz";
import { initializeReviewCard, updateReview } from "../utils/fsrs";

type State = {
  quizzes: Quiz[];
  activeQuizId?: string;
  reviewCards: Record<string, Card>; // key: questionId
  practiceAttempts: PracticeAttempt[];
  examPresets: ExamPreset[];
  examAttempts: ExamAttempt[];
  currentExam?: ExamAttempt;
  reviewMode?: ReviewMode;
  microDrill?: {
    quizId: string;
    questionIds: string[];
  };
};

type Action =
  | { type: "addQuiz"; quiz: Quiz }
  | { type: "updateQuiz"; quiz: Quiz }
  | { type: "setActiveQuiz"; quizId?: string }
  | { type: "addSourceRef"; questionId: string; ref: SourceRef }
  | { type: "removeSourceRef"; questionId: string; index: number }
  | { type: "seedReviewCardsFromQuiz"; quizId: string }
  | { type: "gradeReview"; questionId: string; grade: 1|2|3|4; nowMs: number }
  | { type: "startPracticeAttempt"; attempt: PracticeAttempt }
  | { type: "recordPracticeAnswer"; attemptId: string; answer: PracticeAttempt["answers"][number] }
  | { type: "startExamAttempt"; attempt: ExamAttempt }
  | { type: "updateExamSelection"; questionId: string; selected: string[] }
  | { type: "updateExamElimination"; questionId: string; eliminated: string[] }
  | { type: "updateExamFlag"; questionId: string; flagged: boolean }
  | { type: "navigateExamQuestion"; questionIndex: number }
  | { type: "finishExamAttempt"; attemptId: string; autoSubmitted?: boolean }
  | { type: "startReviewMode"; reviewMode: ReviewMode }
  | { type: "navigateReview"; index: number }
  | { type: "createMicroDrill"; quizId: string; questionIds: string[] }
  | { type: "clearMicroDrill" }
  | { type: "exportData" }
  | { type: "importData"; data: any };

const STORAGE_KEY = "quizforge_store_v1";

const initial: State = loadInitial();

function loadInitial(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    quizzes: [],
    activeQuizId: undefined,
    reviewCards: {},
    practiceAttempts: [],
    examPresets: [
      { id: "aws-ccp-65x90", name: "AWS CCP", numQuestions: 65, totalMinutes: 90 },
      { id: "secplus-90x90", name: "Security+", numQuestions: 90, totalMinutes: 90 },
      { id: "custom-20x30", name: "Quick Test", numQuestions: 20, totalMinutes: 30 },
    ],
    examAttempts: [],
    currentExam: undefined,
    reviewMode: undefined,
    microDrill: undefined,
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "addQuiz": {
      const quizzes = [...state.quizzes, action.quiz];
      return { ...state, quizzes, activeQuizId: action.quiz.id };
    }
    case "updateQuiz": {
      const quizzes = state.quizzes.map(q => q.id === action.quiz.id ? action.quiz : q);
      return { ...state, quizzes };
    }
    case "setActiveQuiz": {
      return { ...state, activeQuizId: action.quizId };
    }
    case "addSourceRef": {
      const aqid = state.activeQuizId;
      if (!aqid) return state;
      const quizzes = state.quizzes.map(q => {
        if (q.id !== aqid) return q;
        const curr = q.sources[action.questionId] || [];
        return { ...q, sources: { ...q.sources, [action.questionId]: [...curr, action.ref] } };
      });
      return { ...state, quizzes };
    }
    case "removeSourceRef": {
      const aqid = state.activeQuizId;
      if (!aqid) return state;
      const quizzes = state.quizzes.map(q => {
        if (q.id !== aqid) return q;
        const curr = q.sources[action.questionId] || [];
        const next = curr.filter((_, i) => i !== action.index);
        return { ...q, sources: { ...q.sources, [action.questionId]: next } };
      });
      return { ...state, quizzes };
    }
    case "seedReviewCardsFromQuiz": {
      const quiz = state.quizzes.find(q => q.id === action.quizId);
      if (!quiz) return state;
      const copy = { ...state.reviewCards };
      for (const q of quiz.questions) {
        const base = initializeReviewCard(q.id, Date.now());
        copy[q.id] = copy[q.id] || { questionId: q.id, ...base } as Card;
      }
      return { ...state, reviewCards: copy };
    }
    case "gradeReview": {
      const cur = state.reviewCards[action.questionId] || { questionId: action.questionId, ...initializeReviewCard(action.questionId, action.nowMs) } as Card;
      const nextState = updateReview(cur, action.grade, action.nowMs);
      const next = { questionId: action.questionId, ...nextState } as Card;
      return { ...state, reviewCards: { ...state.reviewCards, [action.questionId]: next } };
    }
    case "startPracticeAttempt": {
      return { ...state, practiceAttempts: [action.attempt, ...state.practiceAttempts] };
    }
    case "recordPracticeAnswer": {
      const practiceAttempts = state.practiceAttempts.map(a => a.id === action.attemptId ? { ...a, answers: [...a.answers, action.answer] } : a);
      return { ...state, practiceAttempts };
    }
    case "startExamAttempt": {
      return { ...state, currentExam: action.attempt };
    }
    case "updateExamSelection": {
      if (!state.currentExam) return state;
      const selected = { ...state.currentExam.selected, [action.questionId]: action.selected };
      return { ...state, currentExam: { ...state.currentExam, selected } };
    }
    case "updateExamElimination": {
      if (!state.currentExam) return state;
      const eliminated = { ...state.currentExam.eliminated, [action.questionId]: action.eliminated };
      return { ...state, currentExam: { ...state.currentExam, eliminated } };
    }
    case "updateExamFlag": {
      if (!state.currentExam) return state;
      const flagged = { ...state.currentExam.flagged, [action.questionId]: action.flagged };
      return { ...state, currentExam: { ...state.currentExam, flagged } };
    }
    case "navigateExamQuestion": {
      if (!state.currentExam) return state;
      return { ...state, currentExam: { ...state.currentExam, current: action.questionIndex } };
    }
    case "finishExamAttempt": {
      if (!state.currentExam) return state;
      const finishedAttempt = { ...state.currentExam, finishedAt: Date.now(), autoSubmitted: action.autoSubmitted };
      const examAttempts = [...state.examAttempts, finishedAttempt];
      return { ...state, examAttempts, currentExam: undefined };
    }
    case "startReviewMode": {
      return { ...state, reviewMode: action.reviewMode };
    }
    case "navigateReview": {
      if (!state.reviewMode) return state;
      return { ...state, reviewMode: { ...state.reviewMode, index: action.index } };
    }
    case "createMicroDrill": {
      return {
        ...state,
        microDrill: {
          quizId: action.quizId,
          questionIds: action.questionIds
        }
      };
    }
    case "clearMicroDrill": {
      return { ...state, microDrill: undefined };
    }
    case "exportData": {
      const data = {
        quizzes: state.quizzes,
        examPresets: state.examPresets,
        examAttempts: state.examAttempts,
        practiceAttempts: state.practiceAttempts,
        version: "1.0"
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `quizforge-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      return state;
    }
    case "importData": {
      try {
        const { quizzes, examPresets, examAttempts, practiceAttempts } = action.data;
        return {
          ...state,
          quizzes: [...state.quizzes, ...(quizzes || [])],
          examPresets: [...state.examPresets, ...(examPresets || [])],
          examAttempts: [...state.examAttempts, ...(examAttempts || [])],
          practiceAttempts: [...state.practiceAttempts, ...(practiceAttempts || [])]
        };
      } catch (error) {
        console.error("Failed to import data:", error);
        return state;
      }
    }
    default:
      return state;
  }
}

const AppContext = React.createContext<{ state: State; dispatch: React.Dispatch<Action> } | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, initial);
  React.useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }, [state]);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = React.useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
