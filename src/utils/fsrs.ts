export type CardState = {
  stability: number; // days
  difficulty: number; // 0..1
  dueAt: number; // epoch ms
  lastSeenAt?: number;
};

export function initializeReviewCard(questionId: string, nowMs = Date.now()): CardState {
  return { stability: 1, difficulty: 0.3, dueAt: nowMs };
}

// grade: 1..4 (Again, Hard, Good, Easy)
export function updateReview(card: CardState, grade: 1 | 2 | 3 | 4, nowMs = Date.now()): CardState {
  let { stability, difficulty } = card;
  if (!stability) stability = 1.0;
  if (!difficulty && difficulty !== 0) difficulty = 0.3;

  if (grade === 1) {
    stability = Math.max(1, stability * 0.5);
    difficulty = Math.min(0.9, difficulty + 0.15);
  } else if (grade === 2) {
    stability = stability * (1 + 0.2 * difficulty);
  } else if (grade === 3) {
    stability = stability * (1 + 0.6 * difficulty);
  } else if (grade === 4) {
    stability = stability * (1 + 0.9 * difficulty);
    difficulty = Math.max(0.15, difficulty - 0.1);
  }
  const nextDueDays = Math.max(1, Math.round(stability));
  const dueAt = nowMs + nextDueDays * 86400000;
  return { stability, difficulty, dueAt, lastSeenAt: nowMs };
}

export function whyNow(card: CardState, nowMs = Date.now()): string {
  const last = card.lastSeenAt || nowMs;
  const daysSince = Math.max(0, Math.round((nowMs - last) / 86400000));
  const approx = Math.round((card.stability || 1) * 10) / 10;
  return `Scheduled today because stability≈${approx} days; last seen ${daysSince} days ago.`;
}
