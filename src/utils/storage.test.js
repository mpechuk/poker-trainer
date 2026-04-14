import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getLimpQuizStats, saveLimpQuizStats, initLimpQuizStats,
  getVsRaiseQuizStats, saveVsRaiseQuizStats, initVsRaiseQuizStats,
  getAllModesQuizStats, saveAllModesQuizStats, initAllModesQuizStats,
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
