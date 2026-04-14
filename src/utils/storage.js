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

// Limp Quiz Stats
export function getLimpQuizStats() {
  try { const d = localStorage.getItem('limp-quiz-stats'); return d ? JSON.parse(d) : null; }
  catch(e) { return null; }
}
export function saveLimpQuizStats(s) {
  try { localStorage.setItem('limp-quiz-stats', JSON.stringify(s)); } catch(e) {}
}
export function initLimpQuizStats() {
  return { totalQuizzes:0, totalQuestions:0, totalCorrect:0, byHeroPosition:{}, byVillainPosition:{}, recentScores:[] };
}

// vs-Raise Quiz Stats
export function getVsRaiseQuizStats() {
  try { const d = localStorage.getItem('vs-raise-quiz-stats'); return d ? JSON.parse(d) : null; }
  catch(e) { return null; }
}
export function saveVsRaiseQuizStats(s) {
  try { localStorage.setItem('vs-raise-quiz-stats', JSON.stringify(s)); } catch(e) {}
}
export function initVsRaiseQuizStats() {
  return { totalQuizzes:0, totalQuestions:0, totalCorrect:0, byHeroPosition:{}, byVillainPosition:{}, recentScores:[] };
}

// All-Modes Quiz Stats
export function getAllModesQuizStats() {
  try { const d = localStorage.getItem('all-modes-quiz-stats'); return d ? JSON.parse(d) : null; }
  catch(e) { return null; }
}
export function saveAllModesQuizStats(s) {
  try { localStorage.setItem('all-modes-quiz-stats', JSON.stringify(s)); } catch(e) {}
}
export function initAllModesQuizStats() {
  return { totalQuizzes:0, totalQuestions:0, totalCorrect:0, byMode:{ rfi:{total:0,correct:0}, limp:{total:0,correct:0}, vsRaise:{total:0,correct:0} }, recentScores:[] };
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
