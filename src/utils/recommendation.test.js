import { describe, it, expect } from 'vitest';
import { getRecommendation, QUIZ_CATALOG } from './recommendation.js';

function stats(totalQuestions, totalCorrect) {
  return { totalQuestions, totalCorrect };
}

describe('getRecommendation', () => {
  it('recommends an untaken quiz before ranking by accuracy', () => {
    const rec = getRecommendation({
      terminology: stats(10, 5),
      rfi:         stats(10, 9),
      limp:        null, // untaken
      vsRaise:     stats(10, 4),
    });
    expect(rec.key).toBe('limp');
    expect(rec.accuracy).toBeNull();
    expect(rec.reason).toMatch(/baseline/i);
  });

  it('recommends the lowest-accuracy quiz when all have data', () => {
    const rec = getRecommendation({
      terminology: stats(20, 18), // 90%
      rfi:         stats(20, 14), // 70%
      limp:        stats(20,  8), // 40%  ← weakest
      vsRaise:     stats(20, 12), // 60%
    });
    expect(rec.key).toBe('limp');
    expect(rec.accuracy).toBe(40);
    expect(rec.href).toBe('#/quizzes/preflop?mode=limp');
  });

  it('treats zero totalQuestions as untaken (not 0% accuracy)', () => {
    const rec = getRecommendation({
      terminology: { totalQuestions: 0, totalCorrect: 0 },
      rfi:         stats(10, 9),
      limp:        stats(10, 8),
      vsRaise:     stats(10, 7),
    });
    expect(rec.key).toBe('terminology');
    expect(rec.accuracy).toBeNull();
  });

  it('returns first catalog entry on a ties-at-lowest-accuracy case', () => {
    const rec = getRecommendation({
      terminology: stats(10, 5),
      rfi:         stats(10, 5),
      limp:        stats(10, 5),
      vsRaise:     stats(10, 5),
    });
    // All 50%; tie-break picks the first in catalog order (terminology).
    expect(rec.key).toBe('terminology');
  });

  it('handles undefined statsMap entries the same as null', () => {
    const rec = getRecommendation({}); // everything untaken
    expect(rec.key).toBe(QUIZ_CATALOG[0].key);
    expect(rec.accuracy).toBeNull();
  });

  it('each catalog entry has a href that links to a real app route', () => {
    // Regression: links must match the actual route strings in routing.js.
    // Any mismatch here will break the "take me there" button.
    const validPaths = new Set(['/quizzes/terminology', '/quizzes/preflop']);
    for (const q of QUIZ_CATALOG) {
      const hash = q.href.replace(/^#/, '');
      const path = hash.split('?')[0];
      expect(validPaths.has(path), `${q.key} href ${q.href} points to unknown route ${path}`).toBe(true);
    }
  });
});
