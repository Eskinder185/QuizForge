import type { Question, SourceRef, TrustFactors } from "../types/quiz";

export function computeTrustFactors(q: Question, refs: SourceRef[]): TrustFactors {
  const currentYear = new Date().getFullYear();
  const hasCitation = refs.length > 0;
  const multiSources = refs.length >= 2;
  const recencyOk = refs.some(r => {
    const hay = `${r.url || ""} ${r.note || ""}`;
    const m = hay.match(/(19|20)\d{2}/);
    if (!m) return false;
    const year = parseInt(m[0], 10);
    return year >= currentYear - 3;
  });
  return { hasCitation, multiSources, recencyOk };
}

export function trustScore(f: TrustFactors): number {
  const score = (f.hasCitation ? 60 : 0) + (f.multiSources ? 25 : 0) + (f.recencyOk ? 15 : 0);
  return Math.max(0, Math.min(100, score));
}
