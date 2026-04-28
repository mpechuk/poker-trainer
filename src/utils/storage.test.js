import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getLimpQuizStats, saveLimpQuizStats, initLimpQuizStats,
  getVsRaiseQuizStats, saveVsRaiseQuizStats, initVsRaiseQuizStats,
  getAllModesQuizStats, saveAllModesQuizStats, initAllModesQuizStats,
  getTermQuizStats, saveTermQuizStats, initTermQuizStats,
  getFlopQuizStats, saveFlopQuizStats, initFlopQuizStats,
  getFlopCombosQuizStats, saveFlopCombosQuizStats, initFlopCombosQuizStats,
  getSettings, saveSettings, resetSettings, DEFAULT_SETTINGS, CARD_SIZES,
  QUIZ_LENGTH_MIN, QUIZ_LENGTH_MAX,
} from './storage.js';

// Provide a minimal localStorage shim for the node test environment
const store = {};
const localStorageMock = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); },
};
vi.stubGlobal('localStorage', localStorageMock);

beforeEach(() => { localStorageMock.clear(); });

describe('initLimpQuizStats', () => {
  it('returns correct shape', () => {
    const s = initLimpQuizStats();
    expect(s.totalQuizzes).toBe(0);
    expect(s.totalQuestions).toBe(0);
    expect(s.totalCorrect).toBe(0);
    expect(s.byHeroPosition).toEqual({});
    expect(s.byVillainPosition).toEqual({});
    expect(Array.isArray(s.recentScores)).toBe(true);
  });

  it('getLimpQuizStats returns null when nothing stored', () => {
    expect(getLimpQuizStats()).toBeNull();
  });

  it('save/get round-trips correctly', () => {
    const s = initLimpQuizStats();
    s.totalQuizzes = 3;
    s.totalCorrect = 25;
    saveLimpQuizStats(s);
    const loaded = getLimpQuizStats();
    expect(loaded.totalQuizzes).toBe(3);
    expect(loaded.totalCorrect).toBe(25);
  });
});

describe('initFlopQuizStats', () => {
  it('returns the expected shape for the Board Texture quiz', () => {
    const s = initFlopQuizStats();
    expect(s.totalQuizzes).toBe(0);
    expect(s.totalQuestions).toBe(0);
    expect(s.totalCorrect).toBe(0);
    expect(s.bestStreak).toBe(0);
    expect(s.byTexture).toEqual({});
    expect(Array.isArray(s.recentScores)).toBe(true);
  });

  it('getFlopQuizStats returns null when nothing stored', () => {
    expect(getFlopQuizStats()).toBeNull();
  });

  it('save/get round-trips — per-texture buckets survive serialization', () => {
    const s = initFlopQuizStats();
    s.totalQuizzes = 2;
    s.totalQuestions = 12;
    s.totalCorrect = 9;
    s.bestStreak = 5;
    s.byTexture['Paired Flop'] = { total: 3, correct: 2 };
    saveFlopQuizStats(s);
    const loaded = getFlopQuizStats();
    expect(loaded.totalQuizzes).toBe(2);
    expect(loaded.bestStreak).toBe(5);
    expect(loaded.byTexture['Paired Flop']).toEqual({ total: 3, correct: 2 });
  });
});

describe('initFlopCombosQuizStats', () => {
  it('returns the expected shape for the Flop Combos & Outs quiz', () => {
    const s = initFlopCombosQuizStats();
    expect(s.totalQuizzes).toBe(0);
    expect(s.totalQuestions).toBe(0);
    expect(s.totalCorrect).toBe(0);
    expect(s.bestStreak).toBe(0);
    expect(s.phase1Total).toBe(0);
    expect(s.phase1Correct).toBe(0);
    expect(s.phase2Total).toBe(0);
    expect(s.phase2Correct).toBe(0);
    expect(s.byCategory).toEqual({});
    expect(Array.isArray(s.recentScores)).toBe(true);
  });

  it('getFlopCombosQuizStats returns null when nothing stored', () => {
    expect(getFlopCombosQuizStats()).toBeNull();
  });

  it('save/get round-trips — per-category buckets survive serialization', () => {
    const s = initFlopCombosQuizStats();
    s.totalQuizzes = 2;
    s.totalQuestions = 10;
    s.totalCorrect = 6;
    s.phase1Correct = 78;
    s.phase1Total = 90;
    s.phase2Correct = 14;
    s.phase2Total = 22;
    s.byCategory['Flush'] = { total: 9, correct: 7 };
    saveFlopCombosQuizStats(s);
    const loaded = getFlopCombosQuizStats();
    expect(loaded.totalQuizzes).toBe(2);
    expect(loaded.phase1Correct).toBe(78);
    expect(loaded.phase2Total).toBe(22);
    expect(loaded.byCategory['Flush']).toEqual({ total: 9, correct: 7 });
  });
});

describe('initVsRaiseQuizStats', () => {
  it('returns correct shape', () => {
    const s = initVsRaiseQuizStats();
    expect(s.totalQuizzes).toBe(0);
    expect(s.byHeroPosition).toEqual({});
    expect(s.byVillainPosition).toEqual({});
  });

  it('getVsRaiseQuizStats returns null when nothing stored', () => {
    expect(getVsRaiseQuizStats()).toBeNull();
  });

  it('save/get round-trips correctly', () => {
    const s = initVsRaiseQuizStats();
    s.totalQuizzes = 2;
    saveVsRaiseQuizStats(s);
    expect(getVsRaiseQuizStats().totalQuizzes).toBe(2);
  });
});

describe('Settings', () => {
  it('returns defaults when nothing is stored (auto-advance off)', () => {
    const s = getSettings();
    expect(s).toEqual(DEFAULT_SETTINGS);
    expect(s.autoAdvance).toBe(false);
    expect(s.autoAdvanceSeconds).toBe(10);
    expect(s.cardSize).toBe('medium');
  });

  it('persists and reloads user changes', () => {
    saveSettings({ autoAdvance: true, autoAdvanceSeconds: 7, cardSize: 'large' });
    const s = getSettings();
    expect(s.autoAdvance).toBe(true);
    expect(s.autoAdvanceSeconds).toBe(7);
    expect(s.cardSize).toBe('large');
  });

  it('merges partial saves with defaults', () => {
    saveSettings({ cardSize: 'xlarge' });
    const s = getSettings();
    expect(s.cardSize).toBe('xlarge');
    expect(s.autoAdvance).toBe(DEFAULT_SETTINGS.autoAdvance);
    expect(s.autoAdvanceSeconds).toBe(DEFAULT_SETTINGS.autoAdvanceSeconds);
  });

  it('clamps invalid autoAdvanceSeconds back to the default', () => {
    saveSettings({ autoAdvanceSeconds: 0 });
    expect(getSettings().autoAdvanceSeconds).toBe(DEFAULT_SETTINGS.autoAdvanceSeconds);

    saveSettings({ autoAdvanceSeconds: 999 });
    expect(getSettings().autoAdvanceSeconds).toBe(DEFAULT_SETTINGS.autoAdvanceSeconds);

    saveSettings({ autoAdvanceSeconds: 'nope' });
    expect(getSettings().autoAdvanceSeconds).toBe(DEFAULT_SETTINGS.autoAdvanceSeconds);
  });

  it('rejects unknown cardSize keys', () => {
    saveSettings({ cardSize: 'giant' });
    expect(getSettings().cardSize).toBe(DEFAULT_SETTINGS.cardSize);
  });

  it('resetSettings wipes the stored value', () => {
    saveSettings({ autoAdvance: true, cardSize: 'large' });
    resetSettings();
    expect(getSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('survives malformed JSON in storage', () => {
    localStorage.setItem('settings', '{not valid json');
    expect(getSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('CARD_SIZES exposes labels for every available size', () => {
    for (const key of Object.keys(CARD_SIZES)) {
      expect(CARD_SIZES[key].label).toBeTruthy();
      expect(CARD_SIZES[key].w).toBeGreaterThan(0);
      expect(CARD_SIZES[key].h).toBeGreaterThan(0);
    }
  });

  it('exposes an xsmall card size smaller than small', () => {
    expect(CARD_SIZES.xsmall).toBeDefined();
    expect(CARD_SIZES.xsmall.label).toBe('Extra Small');
    expect(CARD_SIZES.xsmall.w).toBeLessThan(CARD_SIZES.small.w);
    expect(CARD_SIZES.xsmall.h).toBeLessThan(CARD_SIZES.small.h);
  });

  it('persists xsmall as a valid cardSize selection', () => {
    saveSettings({ cardSize: 'xsmall' });
    expect(getSettings().cardSize).toBe('xsmall');
  });

  it('exposes a default quizLength in DEFAULT_SETTINGS', () => {
    expect(DEFAULT_SETTINGS.quizLength).toBe(10);
    expect(getSettings().quizLength).toBe(10);
  });

  it('persists quizLength selections within range', () => {
    saveSettings({ quizLength: 25 });
    expect(getSettings().quizLength).toBe(25);
    saveSettings({ quizLength: QUIZ_LENGTH_MAX });
    expect(getSettings().quizLength).toBe(QUIZ_LENGTH_MAX);
  });

  it('clamps invalid quizLength back to the default', () => {
    saveSettings({ quizLength: 0 }); // 0 is below QUIZ_LENGTH_MIN (1)
    expect(getSettings().quizLength).toBe(DEFAULT_SETTINGS.quizLength);

    saveSettings({ quizLength: QUIZ_LENGTH_MAX + 1 });
    expect(getSettings().quizLength).toBe(DEFAULT_SETTINGS.quizLength);

    saveSettings({ quizLength: 'nope' });
    expect(getSettings().quizLength).toBe(DEFAULT_SETTINGS.quizLength);
  });

  it('rounds non-integer quizLength values', () => {
    saveSettings({ quizLength: 12.7 });
    expect(getSettings().quizLength).toBe(13);
  });

  it('quiz length minimum is 1 (any positive integer allowed)', () => {
    expect(QUIZ_LENGTH_MIN).toBe(1);
    expect(QUIZ_LENGTH_MAX).toBeGreaterThanOrEqual(100);
    saveSettings({ quizLength: 1 });
    expect(getSettings().quizLength).toBe(1);
    saveSettings({ quizLength: 0 });
    expect(getSettings().quizLength).toBe(DEFAULT_SETTINGS.quizLength);
  });

  it('DEFAULT_SETTINGS includes per-quiz-type length keys defaulting to 10', () => {
    expect(DEFAULT_SETTINGS.quizLengthTerminology).toBe(10);
    expect(DEFAULT_SETTINGS.quizLengthPreflop).toBe(10);
    expect(DEFAULT_SETTINGS.quizLengthFlop).toBe(10);
    expect(DEFAULT_SETTINGS.quizLengthCombos).toBe(10);
  });

  it('getSettings returns per-quiz-type keys with defaults when nothing stored', () => {
    const s = getSettings();
    expect(s.quizLengthTerminology).toBe(10);
    expect(s.quizLengthPreflop).toBe(10);
    expect(s.quizLengthFlop).toBe(10);
    expect(s.quizLengthCombos).toBe(10);
  });

  it('persists each per-quiz-type length independently', () => {
    saveSettings({ quizLengthTerminology: 20, quizLengthPreflop: 30, quizLengthFlop: 15, quizLengthCombos: 5 });
    const s = getSettings();
    expect(s.quizLengthTerminology).toBe(20);
    expect(s.quizLengthPreflop).toBe(30);
    expect(s.quizLengthFlop).toBe(15);
    expect(s.quizLengthCombos).toBe(5);
  });

  it('changing one per-quiz-type length leaves others at their saved value', () => {
    saveSettings({ quizLengthTerminology: 20, quizLengthPreflop: 30, quizLengthFlop: 15, quizLengthCombos: 5 });
    saveSettings({ ...getSettings(), quizLengthTerminology: 50 });
    const s = getSettings();
    expect(s.quizLengthTerminology).toBe(50);
    expect(s.quizLengthPreflop).toBe(30);
    expect(s.quizLengthFlop).toBe(15);
    expect(s.quizLengthCombos).toBe(5);
  });

  it('clamps invalid per-quiz-type lengths back to the default', () => {
    for (const key of ['quizLengthTerminology', 'quizLengthPreflop', 'quizLengthFlop', 'quizLengthCombos']) {
      saveSettings({ [key]: 0 }); // 0 is below QUIZ_LENGTH_MIN (1)
      expect(getSettings()[key]).toBe(DEFAULT_SETTINGS[key]);

      saveSettings({ [key]: QUIZ_LENGTH_MAX + 1 });
      expect(getSettings()[key]).toBe(DEFAULT_SETTINGS[key]);

      saveSettings({ [key]: 'bad' });
      expect(getSettings()[key]).toBe(DEFAULT_SETTINGS[key]);
    }
  });

  it('rounds non-integer per-quiz-type lengths', () => {
    saveSettings({ quizLengthTerminology: 12.7, quizLengthPreflop: 9.1 });
    const s = getSettings();
    expect(s.quizLengthTerminology).toBe(13);
    expect(s.quizLengthPreflop).toBe(9);
  });

  it('resetSettings restores all per-quiz-type lengths to defaults', () => {
    saveSettings({ quizLengthTerminology: 50, quizLengthPreflop: 30, quizLengthFlop: 20, quizLengthCombos: 5 });
    resetSettings();
    const s = getSettings();
    expect(s.quizLengthTerminology).toBe(DEFAULT_SETTINGS.quizLengthTerminology);
    expect(s.quizLengthPreflop).toBe(DEFAULT_SETTINGS.quizLengthPreflop);
    expect(s.quizLengthFlop).toBe(DEFAULT_SETTINGS.quizLengthFlop);
    expect(s.quizLengthCombos).toBe(DEFAULT_SETTINGS.quizLengthCombos);
  });
});

describe('initTermQuizStats', () => {
  it('exposes an empty byCategory map for per-category accuracy tracking', () => {
    const s = initTermQuizStats();
    expect(s.byCategory).toEqual({});
  });

  it('save/get round-trips byCategory buckets', () => {
    const s = initTermQuizStats();
    s.byCategory['Hand Rankings'] = { total: 5, correct: 4 };
    s.byCategory['Positions']    = { total: 3, correct: 1 };
    saveTermQuizStats(s);
    const loaded = getTermQuizStats();
    expect(loaded.byCategory['Hand Rankings']).toEqual({ total: 5, correct: 4 });
    expect(loaded.byCategory['Positions']).toEqual({ total: 3, correct: 1 });
  });
});

describe('initAllModesQuizStats', () => {
  it('returns correct shape with byMode keys', () => {
    const s = initAllModesQuizStats();
    expect(s.byMode).toHaveProperty('rfi');
    expect(s.byMode).toHaveProperty('limp');
    expect(s.byMode).toHaveProperty('vsRaise');
    expect(s.byMode.rfi.total).toBe(0);
    expect(s.byMode.rfi.correct).toBe(0);
  });

  it('getAllModesQuizStats returns null when nothing stored', () => {
    expect(getAllModesQuizStats()).toBeNull();
  });

  it('save/get round-trips correctly', () => {
    const s = initAllModesQuizStats();
    s.byMode.rfi.total = 5;
    s.byMode.rfi.correct = 4;
    saveAllModesQuizStats(s);
    const loaded = getAllModesQuizStats();
    expect(loaded.byMode.rfi.total).toBe(5);
    expect(loaded.byMode.rfi.correct).toBe(4);
  });
});
