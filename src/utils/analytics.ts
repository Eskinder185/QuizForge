import type { Quiz, Question, ExamAttempt, PracticeAttempt } from "../types/quiz";

export interface PerformanceData {
  seen: number;
  correct: number;
  timeMs: number;
}

export interface Weakness {
  tag: string;
  errRate: number;
  avgTimeMs: number;
  sampleQuestionIds: string[];
  note: string;
}

export interface Strength {
  tag: string;
  accRate: number;
  avgTimeMs: number;
}

export interface AnalysisResult {
  byTag: Record<string, PerformanceData>;
  byDifficulty: Record<string, PerformanceData>;
  topWeaknesses: Weakness[];
  topStrengths: Strength[];
}

export function analyzePerformance(quiz: Quiz, attempts: (ExamAttempt | PracticeAttempt)[]): AnalysisResult {
  const byTag: Record<string, PerformanceData> = {};
  const byDifficulty: Record<string, PerformanceData> = {};

  // Initialize with zeros
  const allTags = new Set<string>();
  const allDifficulties = new Set<string>();
  
  quiz.questions.forEach(q => {
    q.tags?.forEach(tag => allTags.add(tag));
    if (q.difficulty) allDifficulties.add(q.difficulty);
  });

  allTags.forEach(tag => {
    byTag[tag] = { seen: 0, correct: 0, timeMs: 0 };
  });

  allDifficulties.forEach(diff => {
    byDifficulty[diff] = { seen: 0, correct: 0, timeMs: 0 };
  });

  // Analyze attempts
  attempts.forEach(attempt => {
    attempt.answers.forEach(answer => {
      const question = quiz.questions.find(q => q.id === answer.questionId);
      if (!question) return;

      // Track by tags
      question.tags?.forEach(tag => {
        if (byTag[tag]) {
          byTag[tag].seen++;
          if (answer.correct) byTag[tag].correct++;
          byTag[tag].timeMs += answer.timeMs || 0;
        }
      });

      // Track by difficulty
      if (question.difficulty && byDifficulty[question.difficulty]) {
        byDifficulty[question.difficulty].seen++;
        if (answer.correct) byDifficulty[question.difficulty].correct++;
        byDifficulty[question.difficulty].timeMs += answer.timeMs || 0;
      }
    });
  });

  // Calculate weaknesses and strengths
  const topWeaknesses: Weakness[] = [];
  const topStrengths: Strength[] = [];

  Object.entries(byTag).forEach(([tag, data]) => {
    if (data.seen < 2) return; // Need at least 2 attempts to be meaningful

    const errRate = (data.seen - data.correct) / data.seen;
    const accRate = data.correct / data.seen;
    const avgTimeMs = data.timeMs / data.seen;

    // Get sample question IDs for this tag
    const sampleQuestionIds = quiz.questions
      .filter(q => q.tags?.includes(tag))
      .slice(0, 5)
      .map(q => q.id);

    if (errRate > 0.3) { // 30% error rate threshold for weaknesses
      topWeaknesses.push({
        tag,
        errRate,
        avgTimeMs,
        sampleQuestionIds,
        note: errRate > 0.6 ? "High error rate - needs focused practice" :
              errRate > 0.4 ? "Moderate errors - review concepts" :
              "Some confusion - practice recommended"
      });
    }

    if (accRate > 0.8 && data.seen >= 3) { // 80% accuracy threshold for strengths
      topStrengths.push({
        tag,
        accRate,
        avgTimeMs
      });
    }
  });

  // Sort and limit to top 3
  topWeaknesses.sort((a, b) => b.errRate - a.errRate);
  topStrengths.sort((a, b) => b.accRate - a.accRate);

  return {
    byTag,
    byDifficulty,
    topWeaknesses: topWeaknesses.slice(0, 3),
    topStrengths: topStrengths.slice(0, 3)
  };
}

export function buildMicroDrill(
  quiz: Quiz, 
  weaknesses: Weakness[], 
  size: number = 8
): Question[] {
  const selectedQuestions: Question[] = [];
  const usedIds = new Set<string>();

  // Prioritize questions from top weaknesses
  weaknesses.forEach(weakness => {
    if (selectedQuestions.length >= size) return;

    const availableQuestions = weakness.sampleQuestionIds
      .map(id => quiz.questions.find(q => q.id === id))
      .filter((q): q is Question => q !== undefined && !usedIds.has(q.id))
      .slice(0, Math.ceil(size / weaknesses.length));

    availableQuestions.forEach(question => {
      if (selectedQuestions.length >= size) return;
      selectedQuestions.push(question);
      usedIds.add(question.id);
    });
  });

  // Fill remaining slots with similar questions
  if (selectedQuestions.length < size) {
    const remaining = size - selectedQuestions.length;
    const weaknessTags = new Set(weaknesses.map(w => w.tag));
    
    const similarQuestions = quiz.questions
      .filter(q => !usedIds.has(q.id))
      .filter(q => q.tags?.some(tag => weaknessTags.has(tag)))
      .slice(0, remaining);

    selectedQuestions.push(...similarQuestions);
  }

  // Shuffle the final selection
  return selectedQuestions.sort(() => Math.random() - 0.5);
}

