import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { gradeHand, toggleReach, ensureDeckHasTurns } from './CombosQuiz.jsx';
import { analyzeQuestion, analyzeWithTurn, QUIZ_CATEGORIES } from '../../utils/combos.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const combosSource = readFileSync(resolve(__dirname, 'CombosQuiz.jsx'), 'utf8');

const c = (rank, suit) => ({ rank, suit });

describe('gradeHand', () => {
  // AsKs on 2s 7s Jd — flush draw. We use analyzeQuestion so the test stays
  // honest to the real reachability set for both turn and river horizons.
  const holes = [c('A', '♠'), c('K', '♠')];
  const flop = [c('2', '♠'), c('7', '♠'), c('J', '♦')];
  const analysis = analyzeQuestion(holes, flop);

  function perfectInputs(a) {
    const p1Turn = new Set(QUIZ_CATEGORIES.filter(C => a.reachableByTurn.has(C)));
    const p1River = new Set(QUIZ_CATEGORIES.filter(C => a.reachableByRiver.has(C)));
    const p2 = {};
    for (const C of p1Turn) {
      if (!a.madeSet.has(C)) p2[C] = String(a.turnOuts[C].count);
    }
    return { p1Turn, p1River, p2 };
  }

  it('scores a perfect hand when every turn/river/outs judgement matches truth', () => {
    const { p1Turn, p1River, p2 } = perfectInputs(analysis);
    const g = gradeHand(analysis, p1Turn, p1River, p2);
    expect(g.handCorrect).toBe(true);
    expect(g.phase1Correct).toBe(QUIZ_CATEGORIES.length * 2);
    expect(g.phase1TurnCorrect).toBe(QUIZ_CATEGORIES.length);
    expect(g.phase1RiverCorrect).toBe(QUIZ_CATEGORIES.length);
    expect(g.phase2Correct).toBe(g.phase2Total);
  });

  it('docks the turn judgement when user misses a turn-reachable category', () => {
    const { p1Turn, p1River, p2 } = perfectInputs(analysis);
    // Flush IS reachable by turn here (flush draw with 9 spade outs). Drop it
    // from the turn set to force a phase-1 turn miss.
    p1Turn.delete('Flush');
    delete p2['Flush'];
    const g = gradeHand(analysis, p1Turn, p1River, p2);
    expect(g.handCorrect).toBe(false);
    expect(g.perCat['Flush'].turnRight).toBe(false);
    expect(g.perCat['Flush'].riverRight).toBe(true);
    expect(g.perCat['Flush'].categoryRight).toBe(false);
  });

  it('docks the river judgement when user misses a river-reachable category', () => {
    const { p1Turn, p1River, p2 } = perfectInputs(analysis);
    p1River.delete('Flush');
    const g = gradeHand(analysis, p1Turn, p1River, p2);
    expect(g.handCorrect).toBe(false);
    expect(g.perCat['Flush'].riverRight).toBe(false);
    expect(g.perCat['Flush'].categoryRight).toBe(false);
  });

  it('treats backdoor draws as river-only — marking turn for a backdoor is wrong', () => {
    // AsKh on 2s 7s Jd: backdoor flush via spade runner-runner. Flush is
    // reachable by river but NOT by turn (0 turn outs).
    const bdHoles = [c('A', '♠'), c('K', '♥')];
    const bdFlop = [c('2', '♠'), c('7', '♠'), c('J', '♦')];
    const a = analyzeQuestion(bdHoles, bdFlop);
    expect(a.turnOuts['Flush'].count).toBe(0);
    expect(a.reachableByTurn.has('Flush')).toBe(false);
    expect(a.reachableByRiver.has('Flush')).toBe(true);

    // User incorrectly marks Flush as turn-reachable.
    const p1Turn = new Set(QUIZ_CATEGORIES.filter(C => a.reachableByTurn.has(C)));
    p1Turn.add('Flush');
    const p1River = new Set(QUIZ_CATEGORIES.filter(C => a.reachableByRiver.has(C)));
    const p2 = {};
    for (const C of p1Turn) {
      if (!a.madeSet.has(C)) p2[C] = String(a.turnOuts[C].count);
    }
    const g = gradeHand(a, p1Turn, p1River, p2);
    expect(g.perCat['Flush'].turnRight).toBe(false);
    expect(g.perCat['Flush'].riverRight).toBe(true);
    expect(g.handCorrect).toBe(false);
  });

  it('docks phase 2 when outs are off by one', () => {
    const { p1Turn, p1River, p2 } = perfectInputs(analysis);
    // Bump the Flush outs answer by 1.
    p2['Flush'] = String(analysis.turnOuts['Flush'].count + 1);
    const g = gradeHand(analysis, p1Turn, p1River, p2);
    expect(g.handCorrect).toBe(false);
    expect(g.perCat['Flush'].phase2Right).toBe(false);
  });

  it('does not ask phase 2 for made categories even if user selected them', () => {
    const madeHoles = [c('7', '♠'), c('7', '♥')];
    const madeFlop = [c('K', '♣'), c('7', '♦'), c('2', '♠')];
    const a = analyzeQuestion(madeHoles, madeFlop);
    expect(a.made).toBe('Three of a Kind');
    const { p1Turn, p1River, p2 } = perfectInputs(a);
    const g = gradeHand(a, p1Turn, p1River, p2);
    expect(g.perCat['Three of a Kind'].phase2Right).toBeNull();
    expect(g.handCorrect).toBe(true);
  });

  it('treats subset-made categories as "already made" — Pair is auto-correct when Two Pair is on the flop', () => {
    // KQ on KQJ: Two Pair on the flop. Pair is a subset of Two Pair.
    const madeHoles = [c('K', '♠'), c('Q', '♦')];
    const madeFlop = [c('K', '♥'), c('Q', '♣'), c('J', '♠')];
    const a = analyzeQuestion(madeHoles, madeFlop);
    expect(a.made).toBe('Two Pair');
    expect(a.madeSet.has('Pair')).toBe(true);
    expect(a.reachableByTurn.has('Pair')).toBe(true);
    expect(a.reachableByRiver.has('Pair')).toBe(true);

    const { p1Turn, p1River, p2 } = perfectInputs(a);
    const g = gradeHand(a, p1Turn, p1River, p2);
    expect(g.perCat['Pair'].phase2Right).toBeNull();
    expect(g.perCat['Pair'].made).toBe(true);
    expect(g.perCat['Two Pair'].made).toBe(true);
    expect(g.handCorrect).toBe(true);
  });

  it('treats empty/blank phase 2 entries as wrong when phase-1 turn is selected', () => {
    const p1Turn = new Set(QUIZ_CATEGORIES.filter(C => analysis.reachableByTurn.has(C)));
    const p1River = new Set(QUIZ_CATEGORIES.filter(C => analysis.reachableByRiver.has(C)));
    const p2 = {}; // no inputs
    const g = gradeHand(analysis, p1Turn, p1River, p2);
    expect(g.handCorrect).toBe(false);
    const flushPc = g.perCat['Flush'];
    expect(flushPc.phase2Right).toBe(false);
  });
});

describe('toggleReach', () => {
  it('selecting "By Turn" auto-selects "By River" — reachable in one card implies reachable in two', () => {
    const { p1Turn, p1River } = toggleReach(new Set(), new Set(), 'Flush', 'turn');
    expect(p1Turn.has('Flush')).toBe(true);
    expect(p1River.has('Flush')).toBe(true);
  });

  it('selecting "By Turn" leaves an already-on river untouched (returns same reference)', () => {
    const turn = new Set();
    const river = new Set(['Flush']);
    const out = toggleReach(turn, river, 'Flush', 'turn');
    expect(out.p1Turn.has('Flush')).toBe(true);
    expect(out.p1River).toBe(river);
  });

  it('deselecting "By Turn" does not auto-deselect "By River" — keeps backdoor (river-only) selection intact', () => {
    const turn = new Set(['Flush']);
    const river = new Set(['Flush']);
    const out = toggleReach(turn, river, 'Flush', 'turn');
    expect(out.p1Turn.has('Flush')).toBe(false);
    expect(out.p1River.has('Flush')).toBe(true);
  });

  it('toggling "By River" alone does not affect "By Turn"', () => {
    const turn = new Set();
    const river = new Set();
    const on = toggleReach(turn, river, 'Flush', 'river');
    expect(on.p1Turn).toBe(turn);
    expect(on.p1River.has('Flush')).toBe(true);

    const off = toggleReach(turn, on.p1River, 'Flush', 'river');
    expect(off.p1Turn).toBe(turn);
    expect(off.p1River.has('Flush')).toBe(false);
  });

  it('returns new Set instances for the changed horizon — does not mutate inputs', () => {
    const turn = new Set();
    const river = new Set();
    const out = toggleReach(turn, river, 'Flush', 'turn');
    expect(out.p1Turn).not.toBe(turn);
    expect(out.p1River).not.toBe(river);
    expect(turn.size).toBe(0);
    expect(river.size).toBe(0);
  });
});

describe('gradeHand with turn phases', () => {
  // AsKs on 2s 7s Jd, brick turn 4d — still drawing to flush. Phase 3 should
  // flag Flush as river-reachable; phase 4 should expect 9 river outs.
  const holes = [c('A', '♠'), c('K', '♠')];
  const flop = [c('2', '♠'), c('7', '♠'), c('J', '♦')];
  const turn = c('4', '♦');
  const analysis = analyzeQuestion(holes, flop);
  const turnAnalysis = analyzeWithTurn(holes, flop, turn);

  function flopInputs() {
    const p1Turn = new Set(QUIZ_CATEGORIES.filter(C => analysis.reachableByTurn.has(C)));
    const p1River = new Set(QUIZ_CATEGORIES.filter(C => analysis.reachableByRiver.has(C)));
    const p2 = {};
    for (const C of p1Turn) {
      if (!analysis.madeSet.has(C)) p2[C] = String(analysis.turnOuts[C].count);
    }
    return { p1Turn, p1River, p2 };
  }

  function turnInputs() {
    const p3River = new Set(QUIZ_CATEGORIES.filter(C => turnAnalysis.reachableByRiver.has(C)));
    const p4 = {};
    for (const C of p3River) {
      if (!turnAnalysis.madeSet.has(C)) p4[C] = String(turnAnalysis.riverOuts[C].count);
    }
    return { p3River, p4 };
  }

  it('scores a perfect hand only when both flop and turn judgements match truth', () => {
    const { p1Turn, p1River, p2 } = flopInputs();
    const { p3River, p4 } = turnInputs();
    const g = gradeHand(analysis, p1Turn, p1River, p2, turnAnalysis, p3River, p4);
    expect(g.handCorrect).toBe(true);
    expect(g.phase3Correct).toBe(QUIZ_CATEGORIES.length);
    expect(g.phase3Total).toBe(QUIZ_CATEGORIES.length);
    expect(g.phase4Correct).toBe(g.phase4Total);
  });

  it('docks phase 3 when user misses a post-turn river-reachable category', () => {
    const { p1Turn, p1River, p2 } = flopInputs();
    const { p3River, p4 } = turnInputs();
    p3River.delete('Flush');
    delete p4['Flush'];
    const g = gradeHand(analysis, p1Turn, p1River, p2, turnAnalysis, p3River, p4);
    expect(g.handCorrect).toBe(false);
    expect(g.perCat['Flush'].phase3Right).toBe(false);
    expect(g.perCat['Flush'].categoryRight).toBe(false);
  });

  it('docks phase 4 when river outs are off by one', () => {
    const { p1Turn, p1River, p2 } = flopInputs();
    const { p3River, p4 } = turnInputs();
    p4['Flush'] = String(turnAnalysis.riverOuts['Flush'].count + 1);
    const g = gradeHand(analysis, p1Turn, p1River, p2, turnAnalysis, p3River, p4);
    expect(g.handCorrect).toBe(false);
    expect(g.perCat['Flush'].phase4Right).toBe(false);
  });

  it('does not ask phase 4 for categories already made after the turn', () => {
    // Made-after-turn case: 7s7h on Kc 7d 2s, turn 7c → Quads on the turn.
    const madeHoles = [c('7', '♠'), c('7', '♥')];
    const madeFlop = [c('K', '♣'), c('7', '♦'), c('2', '♠')];
    const madeTurn = c('7', '♣');
    const a = analyzeQuestion(madeHoles, madeFlop);
    const ta = analyzeWithTurn(madeHoles, madeFlop, madeTurn);
    expect(ta.made).toBe('Four of a Kind');
    const p1Turn = new Set(QUIZ_CATEGORIES.filter(C => a.reachableByTurn.has(C)));
    const p1River = new Set(QUIZ_CATEGORIES.filter(C => a.reachableByRiver.has(C)));
    const p2 = {};
    for (const C of p1Turn) if (!a.madeSet.has(C)) p2[C] = String(a.turnOuts[C].count);
    const p3River = new Set(QUIZ_CATEGORIES.filter(C => ta.reachableByRiver.has(C)));
    const p4 = {};
    for (const C of p3River) if (!ta.madeSet.has(C)) p4[C] = String(ta.riverOuts[C].count);
    const g = gradeHand(a, p1Turn, p1River, p2, ta, p3River, p4);
    expect(g.perCat['Four of a Kind'].phase4Right).toBeNull();
    expect(g.handCorrect).toBe(true);
  });

  it('keeps the legacy 4-arg call working (no turn analysis) — phase3/phase4 totals stay at 0', () => {
    const { p1Turn, p1River, p2 } = flopInputs();
    const g = gradeHand(analysis, p1Turn, p1River, p2);
    expect(g.handCorrect).toBe(true);
    expect(g.phase3Correct).toBe(0);
    expect(g.phase3Total).toBe(0);
    expect(g.phase4Correct).toBe(0);
    expect(g.phase4Total).toBe(0);
  });
});

describe('ensureDeckHasTurns', () => {
  it('hydrates legacy turn-less questions with a deterministic random turn', () => {
    const deck = [
      { holes: [c('A', '♠'), c('K', '♥')], flop: [c('2', '♠'), c('7', '♠'), c('J', '♦')] },
    ];
    const hydrated = ensureDeckHasTurns(deck);
    expect(hydrated[0].turn).toBeTruthy();
    // Turn must not collide with any known card.
    const used = new Set([...deck[0].holes, ...deck[0].flop].map(x => x.rank + x.suit));
    expect(used.has(hydrated[0].turn.rank + hydrated[0].turn.suit)).toBe(false);
  });

  it('preserves an existing turn card unchanged', () => {
    const deck = [
      {
        holes: [c('A', '♠'), c('K', '♥')],
        flop: [c('2', '♠'), c('7', '♠'), c('J', '♦')],
        turn: c('9', '♣'),
      },
    ];
    const hydrated = ensureDeckHasTurns(deck);
    expect(hydrated[0].turn).toEqual(deck[0].turn);
  });
});

describe('Feedback rendering', () => {
  it('hides turn outs and rule-of-4 for categories already made on the flop', () => {
    // Regression: showing "Turn outs (N): [cards]" or "rule of 4" for a hand
    // already made on the flop is misleading — there is nothing to draw to.
    // Both gates must include `!pc.made` so made categories skip the outs UI.
    const turnOutsGate = combosSource.match(
      /\{!pc\.made && actualOuts\.count > 0 && \(\s*<div class="combos-fb-outs">/
    );
    expect(turnOutsGate, 'Turn outs block should be gated on !pc.made').not.toBeNull();

    const ruleOfFourGate = combosSource.match(
      /\{!pc\.made && \(actualOuts\.count > 0[\s\S]*?rule of 4/
    );
    expect(ruleOfFourGate, 'rule-of-4 / runner-runner suffix should be gated on !pc.made').not.toBeNull();
  });

  it('renders an example runout only when the user missed a river-reachable category', () => {
    // The example block is the teaching moment for backdoor draws the user
    // wrote off as unreachable. Gate: pc.trueByRiver && !pc.userByRiver.
    // (No example when actual=no, since there's nothing to demonstrate, and
    // no example when the user already said yes — they got it right.)
    const exampleGate = combosSource.match(
      /\{pc\.trueByRiver && !pc\.userByRiver && analysis\.exampleRunouts\?\.\[C\] && \(/
    );
    expect(exampleGate, 'example runout should be gated on missed-by-river').not.toBeNull();
  });
});
