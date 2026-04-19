import { describe, it, expect, beforeEach, vi } from 'vitest';

const store = {};
const localStorageMock = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); },
};
vi.stubGlobal('localStorage', localStorageMock);

beforeEach(() => { localStorageMock.clear(); });

describe('Recommendation source — wired to preflop stats only', () => {
  it('imports only preflop stats getters (not terminology) for its recommendation', async () => {
    // Guardrail: terminology quiz stats must NOT influence the recommendation since
    // terminology was removed from QUIZ_CATALOG.
    const { readFileSync } = await import('fs');
    const { fileURLToPath } = await import('url');
    const { dirname, resolve } = await import('path');
    const here = dirname(fileURLToPath(import.meta.url));
    const src = readFileSync(resolve(here, 'Recommendation.jsx'), 'utf8');
    expect(src).toMatch(/getRfiQuizStats/);
    expect(src).toMatch(/getLimpQuizStats/);
    expect(src).toMatch(/getVsRaiseQuizStats/);
    expect(src).not.toMatch(/getTermQuizStats/);
  });

  it('reads current stats from storage via getRecommendation', async () => {
    // Populate rfi as weakest; expect rfi to be the recommendation after save.
    const { saveRfiQuizStats, saveLimpQuizStats, saveVsRaiseQuizStats } = await import('../utils/storage.js');
    saveRfiQuizStats({     totalQuizzes: 1, totalQuestions: 10, totalCorrect:  2, byPosition: {},       recentScores: [] });
    saveLimpQuizStats({    totalQuizzes: 1, totalQuestions: 10, totalCorrect:  9, byHeroPosition: {},   byVillainPosition: {}, recentScores: [] });
    saveVsRaiseQuizStats({ totalQuizzes: 1, totalQuestions: 10, totalCorrect:  8, byHeroPosition: {},   byVillainPosition: {}, recentScores: [] });

    const { getRfiQuizStats, getLimpQuizStats, getVsRaiseQuizStats } = await import('../utils/storage.js');
    const { getRecommendation } = await import('../utils/recommendation.js');
    const rec = getRecommendation({
      rfi: getRfiQuizStats(),
      limp: getLimpQuizStats(),
      vsRaise: getVsRaiseQuizStats(),
    });
    expect(rec.key).toBe('rfi');
    expect(rec.accuracy).toBe(20);
  });
});
