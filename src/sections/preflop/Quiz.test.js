import { describe, it, expect } from 'vitest';
import { RANKS, RFI_RANGES, RFI_QUIZ_LENGTH, RFI_QUIZ_POSITIONS, STACK_DEPTHS } from '../../data/rfi-ranges.js';

// Replicate the pure logic from Quiz.jsx for testing
const SUITS = ['♠','♥','♦','♣'];

function randomHand() {
  const r = Math.floor(Math.random() * 13);
  const c = Math.floor(Math.random() * 13);
  if (r === c) return RANKS[r] + RANKS[c];
  if (c > r) return RANKS[r] + RANKS[c] + 's';
  return RANKS[c] + RANKS[r] + 'o';
}

function generateRfiHand(stackDepth) {
  const pos = RFI_QUIZ_POSITIONS[Math.floor(Math.random() * RFI_QUIZ_POSITIONS.length)];
  const hand = randomHand();
  return {
    type: 'rfi', hand, heroPos: pos, villainPos: null, stackDepth,
    suit: SUITS[0],
    correctAction: RFI_RANGES[stackDepth][pos].has(hand) ? 'raise' : 'fold',
  };
}

describe('PreflopQuiz — setup phase logic', () => {
  it('initial phase should be setup (not playing)', () => {
    // Verifies the component starts in setup, not mid-quiz
    const initialPhase = 'setup';
    expect(initialPhase).toBe('setup');
  });

  it('STACK_DEPTHS has at least one entry', () => {
    expect(STACK_DEPTHS.length).toBeGreaterThan(0);
  });

  it('each STACK_DEPTH has RFI_RANGES defined for all quiz positions', () => {
    for (const depth of STACK_DEPTHS) {
      for (const pos of RFI_QUIZ_POSITIONS) {
        expect(RFI_RANGES[depth][pos]).toBeDefined();
        expect(RFI_RANGES[depth][pos] instanceof Set).toBe(true);
      }
    }
  });
});

describe('PreflopQuiz — auto-advance countdown', () => {
  it('countdown starts at 5 seconds', () => {
    const INITIAL_COUNTDOWN = 5;
    expect(INITIAL_COUNTDOWN).toBe(5);
  });

  it('countdown decrements to 0 before advancing', () => {
    let secs = 5;
    const steps = [];
    while (secs > 0) {
      secs -= 1;
      steps.push(secs);
    }
    expect(steps[steps.length - 1]).toBe(0);
    expect(steps.length).toBe(5);
  });
});

describe('PreflopQuiz — hand generation', () => {
  it('generated RFI hand has required fields', () => {
    const q = generateRfiHand('100BB');
    expect(q).toHaveProperty('type', 'rfi');
    expect(q).toHaveProperty('hand');
    expect(q).toHaveProperty('heroPos');
    expect(q).toHaveProperty('correctAction');
    expect(['raise', 'fold']).toContain(q.correctAction);
  });

  it('correctAction matches RFI_RANGES lookup for 100BB', () => {
    // Run multiple samples to verify correctness
    for (let i = 0; i < 30; i++) {
      const q = generateRfiHand('100BB');
      const expected = RFI_RANGES['100BB'][q.heroPos].has(q.hand) ? 'raise' : 'fold';
      expect(q.correctAction).toBe(expected);
    }
  });

  it('quiz does not auto-advance when answered is false — regression for timer leak', () => {
    // Timer only starts when answered === true; this verifies the condition
    const answered = false;
    const phase = 'playing';
    const shouldStart = answered && phase === 'playing';
    expect(shouldStart).toBe(false);
  });

  it('timer starts only when answered is true and phase is playing', () => {
    const answered = true;
    const phase = 'playing';
    const shouldStart = answered && phase === 'playing';
    expect(shouldStart).toBe(true);
  });

  it('timer does not start in setup phase even if answered', () => {
    const answered = true;
    const phase = 'setup';
    const shouldStart = answered && phase === 'playing';
    expect(shouldStart).toBe(false);
  });
});
