import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getLimpQuizStats, saveLimpQuizStats, initLimpQuizStats,
  getVsRaiseQuizStats, saveVsRaiseQuizStats, initVsRaiseQuizStats,
  getAllModesQuizStats, saveAllModesQuizStats, initAllModesQuizStats,
  getSettings, saveSettings, resetSettings, DEFAULT_SETTINGS, CARD_SIZES,
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
