// RFI Quiz Stats
export function getRfiQuizStats() {
  try { const d = localStorage.getItem('rfi-quiz-stats'); return d ? JSON.parse(d) : null; }
  catch(e) { return null; }
}
export function saveRfiQuizStats(s) {
  try { localStorage.setItem('rfi-quiz-stats', JSON.stringify(s)); } catch(e) {}
}
export function initRfiQuizStats() {
  return { totalQuizzes:0, totalQuestions:0, totalCorrect:0, byPosition:{}, recentScores:[] };
}

// Terminology Quiz Stats
export function getTermQuizStats() {
  try { const d = localStorage.getItem('term-quiz-stats'); return d ? JSON.parse(d) : null; }
  catch(e) { return null; }
}
export function saveTermQuizStats(s) {
  try { localStorage.setItem('term-quiz-stats', JSON.stringify(s)); } catch(e) {}
}
export function initTermQuizStats() {
  return { totalQuizzes:0, totalQuestions:0, totalCorrect:0, bestStreak:0, recentScores:[] };
}

// Study Progress
export function getStudyProgress() {
  try { const d = localStorage.getItem('study-progress'); return d ? JSON.parse(d) : null; }
  catch(e) { return null; }
}
export function saveStudyProgress(s) {
  try { localStorage.setItem('study-progress', JSON.stringify(s)); } catch(e) {}
}
export function initStudyProgress() {
  return { cardsSeen:[], totalFlips:0, byCategory:{} };
}
