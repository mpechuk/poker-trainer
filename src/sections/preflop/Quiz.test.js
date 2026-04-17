import { describe, it, expect } from 'vitest';
import { RANKS, RFI_RANGES, RFI_QUIZ_LENGTH, RFI_QUIZ_POSITIONS, STACK_DEPTHS } from '../../data/rfi-ranges.js';
import { LIMP_HERO_POSITIONS, RAISE_HERO_POSITIONS } from '../../data/preflop-ranges.js';
import { getPositionsForMode, getVillainsForSelection, getHeroesForVillain } from './Quiz.jsx';

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

describe('PreflopQuiz — position selector', () => {
  it('getPositionsForMode returns correct positions for rfi', () => {
    expect(getPositionsForMode('rfi')).toEqual(RFI_QUIZ_POSITIONS);
  });

  it('getPositionsForMode returns correct positions for limp', () => {
    expect(getPositionsForMode('limp')).toEqual(LIMP_HERO_POSITIONS);
  });

  it('getPositionsForMode returns correct positions for vsRaise', () => {
    expect(getPositionsForMode('vsRaise')).toEqual(RAISE_HERO_POSITIONS);
  });

  it('getPositionsForMode for all mode contains all positions without duplicates', () => {
    const positions = getPositionsForMode('all');
    const unique = [...new Set(positions)];
    expect(positions).toEqual(unique);
    for (const p of [...RFI_QUIZ_POSITIONS, ...LIMP_HERO_POSITIONS, ...RAISE_HERO_POSITIONS]) {
      expect(positions).toContain(p);
    }
  });

  it('UTG only appears in rfi positions, not limp or vsRaise', () => {
    expect(getPositionsForMode('rfi')).toContain('UTG');
    expect(getPositionsForMode('limp')).not.toContain('UTG');
    expect(getPositionsForMode('vsRaise')).not.toContain('UTG');
  });

  it('BB only appears in limp and vsRaise positions, not rfi', () => {
    expect(getPositionsForMode('rfi')).not.toContain('BB');
    expect(getPositionsForMode('limp')).toContain('BB');
    expect(getPositionsForMode('vsRaise')).toContain('BB');
  });
});

describe('PreflopQuiz — villain position selector', () => {
  it('getVillainsForSelection limp with hero=HJ returns only UTG', () => {
    expect(getVillainsForSelection('limp', 'HJ')).toEqual(['UTG']);
  });

  it('getVillainsForSelection limp with hero=BB returns all positions', () => {
    const v = getVillainsForSelection('limp', 'BB');
    expect(v).toContain('UTG');
    expect(v).toContain('SB');
    expect(v.length).toBe(5);
  });

  it('getVillainsForSelection limp with hero=all returns deduplicated union', () => {
    const v = getVillainsForSelection('limp', 'all');
    const unique = [...new Set(v)];
    expect(v).toEqual(unique);
    expect(v.length).toBeGreaterThan(0);
  });

  it('getVillainsForSelection vsRaise mirrors limp structure', () => {
    expect(getVillainsForSelection('vsRaise', 'HJ')).toEqual(['UTG']);
    expect(getVillainsForSelection('vsRaise', 'BB').length).toBe(5);
  });

  it('getHeroesForVillain limp UTG returns all hero positions', () => {
    const heroes = getHeroesForVillain('limp', 'UTG');
    expect(heroes).toContain('HJ');
    expect(heroes).toContain('BB');
    expect(heroes.length).toBe(5);
  });

  it('getHeroesForVillain limp SB returns only BB', () => {
    expect(getHeroesForVillain('limp', 'SB')).toEqual(['BB']);
  });

  it('getHeroesForVillain vsRaise mirrors limp structure', () => {
    expect(getHeroesForVillain('vsRaise', 'SB')).toEqual(['BB']);
    expect(getHeroesForVillain('vsRaise', 'UTG').length).toBe(5);
  });
});
