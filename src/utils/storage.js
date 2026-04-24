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
  return { totalQuizzes:0, totalQuestions:0, totalCorrect:0, bestStreak:0, byCategory:{}, recentScores:[] };
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

// Flop (Board Texture) Quiz Stats
export function getFlopQuizStats() {
  try { const d = localStorage.getItem('flop-quiz-stats'); return d ? JSON.parse(d) : null; }
  catch(e) { return null; }
}
export function saveFlopQuizStats(s) {
  try { localStorage.setItem('flop-quiz-stats', JSON.stringify(s)); } catch(e) {}
}
export function initFlopQuizStats() {
  return { totalQuizzes:0, totalQuestions:0, totalCorrect:0, bestStreak:0, byTexture:{}, recentScores:[] };
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

// App Settings
export const CARD_SIZES = {
  xsmall: { w: 40, h: 56,  label: 'Extra Small' },
  small:  { w: 52, h: 74,  label: 'Small'  },
  medium: { w: 64, h: 90,  label: 'Medium' },
  large:  { w: 80, h: 112, label: 'Large'  },
  xlarge: { w: 100, h: 140, label: 'Extra Large' },
};

export const QUIZ_LENGTH_MIN = 5;
export const QUIZ_LENGTH_MAX = 100;

export const DEFAULT_SETTINGS = {
  autoAdvance: false,       // off by default — users asked to read the explanation at their own pace
  autoAdvanceSeconds: 10,   // only used when autoAdvance is true
  cardSize: 'medium',
  quizLength: 10,           // number of questions per quiz run
};

function normalizeSettings(raw) {
  const s = { ...DEFAULT_SETTINGS, ...(raw || {}) };
  s.autoAdvance = Boolean(s.autoAdvance);
  const secs = Number(s.autoAdvanceSeconds);
  s.autoAdvanceSeconds = Number.isFinite(secs) && secs >= 1 && secs <= 60
    ? Math.round(secs)
    : DEFAULT_SETTINGS.autoAdvanceSeconds;
  if (!CARD_SIZES[s.cardSize]) s.cardSize = DEFAULT_SETTINGS.cardSize;
  const ql = Number(s.quizLength);
  s.quizLength = Number.isFinite(ql) && ql >= QUIZ_LENGTH_MIN && ql <= QUIZ_LENGTH_MAX
    ? Math.round(ql)
    : DEFAULT_SETTINGS.quizLength;
  return s;
}

export function getSettings() {
  try {
    const d = localStorage.getItem('settings');
    return normalizeSettings(d ? JSON.parse(d) : null);
  } catch(e) { return normalizeSettings(null); }
}

export function saveSettings(s) {
  try { localStorage.setItem('settings', JSON.stringify(normalizeSettings(s))); } catch(e) {}
}

export function resetSettings() {
  try { localStorage.removeItem('settings'); } catch(e) {}
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
