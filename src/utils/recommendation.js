// Pure logic for "next quiz to take" recommendation on the Stats dashboard.
// Extracted from the UI so it can be unit-tested without DOM / localStorage.

export const QUIZ_CATALOG = [
  { key: 'terminology', label: 'Terminology Quiz',      href: '#/quizzes/terminology' },
  { key: 'rfi',         label: 'Preflop RFI Quiz',      href: '#/quizzes/preflop?mode=rfi' },
  { key: 'limp',        label: 'Preflop vs Limp Quiz',  href: '#/quizzes/preflop?mode=limp' },
  { key: 'vsRaise',     label: 'Preflop vs Raise Quiz', href: '#/quizzes/preflop?mode=vsRaise' },
];

// `statsMap` keys match QUIZ_CATALOG keys; each value is a stats object
// (with `totalQuestions` + `totalCorrect`) or null/undefined if untaken.
// Returns { key, label, href, accuracy, reason } or null if the catalog is empty.
export function getRecommendation(statsMap) {
  const entries = QUIZ_CATALOG.map(q => {
    const s = statsMap?.[q.key];
    const total = s?.totalQuestions || 0;
    const correct = s?.totalCorrect || 0;
    const accuracy = total > 0 ? Math.round(correct / total * 100) : null;
    return { ...q, total, correct, accuracy };
  });

  if (entries.length === 0) return null;

  // Prefer an untaken quiz so the user builds a baseline before we rank accuracy.
  const untaken = entries.find(e => e.total === 0);
  if (untaken) {
    return {
      key: untaken.key,
      label: untaken.label,
      href: untaken.href,
      accuracy: null,
      reason: `You haven't tried the ${untaken.label} yet — take it to establish a baseline.`,
    };
  }

  // All quizzes have data: pick the one with the lowest accuracy (ties → first in catalog order).
  let weakest = entries[0];
  for (const e of entries.slice(1)) {
    if (e.accuracy < weakest.accuracy) weakest = e;
  }
  return {
    key: weakest.key,
    label: weakest.label,
    href: weakest.href,
    accuracy: weakest.accuracy,
    reason: `Your weakest area is ${weakest.label} at ${weakest.accuracy}% accuracy — practice to bring it up.`,
  };
}
