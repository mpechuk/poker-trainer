import { describe, it, expect } from 'vitest';
import { gradeHand } from './CombosQuiz.jsx';
import { analyzeQuestion, QUIZ_CATEGORIES } from '../../utils/combos.js';

const c = (rank, suit) => ({ rank, suit });

describe('gradeHand', () => {
  // AsKs on 2s 7s Jd — flush draw. Categories reachable: Pair, Two Pair, Trips,
  // Straight (no — no connected cards to the Broadway), Flush, Full House?, etc.
  // We use analyzeQuestion so the test stays honest to the real reachability set.
  const holes = [c('A', '♠'), c('K', '♠')];
  const flop = [c('2', '♠'), c('7', '♠'), c('J', '♦')];
  const analysis = analyzeQuestion(holes, flop);

  it('scores a perfect hand when every category judgement matches truth', () => {
    const p1 = new Set(QUIZ_CATEGORIES.filter(C => analysis.reachable.has(C)));
    const p2 = {};
    for (const C of QUIZ_CATEGORIES) {
      if (p1.has(C) && analysis.made !== C) {
        p2[C] = String(analysis.turnOuts[C].count);
      }
    }
    const g = gradeHand(analysis, p1, p2);
    expect(g.handCorrect).toBe(true);
    expect(g.phase1Correct).toBe(QUIZ_CATEGORIES.length);
    expect(g.phase2Correct).toBe(g.phase2Total);
  });

  it('docks phase 1 when user misses a reachable category', () => {
    const p1 = new Set(QUIZ_CATEGORIES.filter(C => analysis.reachable.has(C) && C !== 'Flush'));
    const p2 = {};
    for (const C of p1) {
      if (analysis.made !== C) p2[C] = String(analysis.turnOuts[C].count);
    }
    const g = gradeHand(analysis, p1, p2);
    expect(g.handCorrect).toBe(false);
    expect(g.perCat['Flush'].phase1Right).toBe(false);
    expect(g.perCat['Flush'].categoryRight).toBe(false);
  });

  it('docks phase 2 when outs are off by one', () => {
    const p1 = new Set(QUIZ_CATEGORIES.filter(C => analysis.reachable.has(C)));
    const p2 = {};
    for (const C of QUIZ_CATEGORIES) {
      if (p1.has(C) && analysis.made !== C) {
        const trueCount = analysis.turnOuts[C].count;
        // Flip one category's answer to be wrong by 1.
        p2[C] = String(C === 'Flush' ? trueCount + 1 : trueCount);
      }
    }
    const g = gradeHand(analysis, p1, p2);
    expect(g.handCorrect).toBe(false);
    expect(g.perCat['Flush'].phase2Right).toBe(false);
  });

  it('does not ask phase 2 for made categories even if user selected them', () => {
    const madeHoles = [c('7', '♠'), c('7', '♥')];
    const madeFlop = [c('K', '♣'), c('7', '♦'), c('2', '♠')];
    const a = analyzeQuestion(madeHoles, madeFlop);
    expect(a.made).toBe('Three of a Kind');
    const p1 = new Set(QUIZ_CATEGORIES.filter(C => a.reachable.has(C)));
    // Leave "Three of a Kind" out of p2 — user isn't asked for outs on made hands.
    const p2 = {};
    for (const C of p1) {
      if (a.made !== C) p2[C] = String(a.turnOuts[C].count);
    }
    const g = gradeHand(a, p1, p2);
    expect(g.perCat['Three of a Kind'].phase2Right).toBeNull();
    expect(g.handCorrect).toBe(true);
  });

  it('treats empty/blank phase 2 entries as wrong', () => {
    const p1 = new Set(QUIZ_CATEGORIES.filter(C => analysis.reachable.has(C)));
    const p2 = {}; // no inputs
    const g = gradeHand(analysis, p1, p2);
    expect(g.handCorrect).toBe(false);
    // Any reachable-not-made category is now wrong in phase 2.
    const flushPc = g.perCat['Flush'];
    expect(flushPc.phase2Right).toBe(false);
  });
});
