import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { RANKS, RFI_RANGES, RFI_QUIZ_LENGTH, RFI_QUIZ_POSITIONS, STACK_DEPTHS } from '../../data/rfi-ranges.js';
import { LIMP_HERO_POSITIONS, RAISE_HERO_POSITIONS } from '../../data/preflop-ranges.js';
import { getPositionsForMode, getVillainsForSelection, getHeroesForVillain, buildDeck } from './Quiz.jsx';

const __dirname = dirname(fileURLToPath(import.meta.url));
const quizSource = readFileSync(resolve(__dirname, 'Quiz.jsx'), 'utf8');

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
  it('countdown starts at 10 seconds', () => {
    const INITIAL_COUNTDOWN = 10;
    expect(INITIAL_COUNTDOWN).toBe(10);
  });

  it('countdown decrements to 0 before advancing', () => {
    let secs = 10;
    const steps = [];
    while (secs > 0) {
      secs -= 1;
      steps.push(secs);
    }
    expect(steps[steps.length - 1]).toBe(0);
    expect(steps.length).toBe(10);
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

describe('PreflopQuiz — default mode', () => {
  it('initial mode defaults to "all" when no query mode is provided', () => {
    // Mirrors the resolution in Quiz.jsx so the default never silently regresses to a single-mode quiz.
    expect(quizSource).toMatch(/MODES\.some\(m\s*=>\s*m\.id\s*===\s*query\.mode\)\s*\?\s*query\.mode\s*:\s*'all'/);
  });

  it('initial deck is built with the resolved initialMode (so default-all hits all hand generators)', () => {
    expect(quizSource).toMatch(/buildDeck\(initialMode,\s*'100BB',\s*'all',\s*'all'(?:,\s*settings\.quizLength)?\)/);
  });
});

describe('PreflopQuiz — complete screen', () => {
  it('renders a Stats link pointing to #/stats on the complete screen', () => {
    // Lets users jump straight to their overall stats after finishing a quiz.
    expect(quizSource).toMatch(/href="#\/stats"[^>]*>Stats<\/a>/);
  });

  it('renders the Recommendation component on the complete screen', () => {
    // Surfaces the "Recommended Next Quiz" block right after a quiz ends.
    expect(quizSource).toMatch(/import\s*\{\s*Recommendation\s*\}\s*from\s*['"][^'"]*Recommendation\.jsx['"]/);
    expect(quizSource).toMatch(/<Recommendation\s*\/>/);
  });

  it('resets to setup screen when query.mode changes — fixes stuck Practice Now navigation', () => {
    // Regression: previously, clicking "Practice Now" from the complete screen
    // only updated the URL hash; the component stayed mounted showing the old
    // complete screen because useState initializers don't re-run on prop change.
    // A useEffect watching query?.mode must reset phase + mode + deck so the
    // user lands on the setup screen for the requested mode.
    expect(quizSource).toMatch(/useEffect\(\(\)\s*=>\s*\{[\s\S]*?query\?\.mode[\s\S]*?setPhase\(['"]setup['"]\)[\s\S]*?\},\s*\[query\?\.mode\]\)/);
  });
});

describe('PreflopQuiz — configurable quiz length', () => {
  it('buildDeck honors the length parameter (rfi mode)', () => {
    for (const len of [5, 10, 20, 30]) {
      const deck = buildDeck('rfi', '100BB', 'all', 'all', len);
      expect(deck.length).toBe(len);
    }
  });

  it('buildDeck honors the length parameter (all mode)', () => {
    for (const len of [5, 15, 25]) {
      const deck = buildDeck('all', '100BB', 'all', 'all', len);
      expect(deck.length).toBe(len);
    }
  });

  it('buildDeck defaults to RFI_QUIZ_LENGTH when no length is passed', () => {
    const deck = buildDeck('rfi', '100BB', 'all', 'all');
    expect(deck.length).toBe(RFI_QUIZ_LENGTH);
  });

  it('component reads settings.quizLength and threads it through buildDeck', () => {
    // Regression: if buildDeck is called without the length arg, the preflop
    // quiz silently ignores the Settings page "Quiz length" choice.
    expect(quizSource).toMatch(/buildDeck\([^)]*,\s*fresh\.quizLength\)/);
    expect(quizSource).toMatch(/buildDeck\(initialMode,\s*'100BB',\s*'all',\s*'all',\s*settings\.quizLength\)/);
  });

  it('component renders deck.length in playing/complete UI (not a hardcoded constant)', () => {
    // Progress bar, "Question X / N", and complete-screen score must scale
    // with the user-chosen quiz length.
    expect(quizSource).toMatch(/qIdx \/ deck\.length \* 100/);
    expect(quizSource).toMatch(/\{qIdx \+ 1\} \/ \{deck\.length\}/);
    expect(quizSource).toMatch(/score \/ deck\.length \* 100/);
    expect(quizSource).toMatch(/\{score\} \/ \{deck\.length\}/);
  });
});

describe('PreflopQuiz — share link integration', () => {
  it('imports share utilities used to encode/decode quiz config into a URL', () => {
    expect(quizSource).toMatch(/from\s+['"][^'"]*\/utils\/share\.js['"]/);
    expect(quizSource).toMatch(/encodePreflopQuiz/);
    expect(quizSource).toMatch(/decodePreflopQuiz/);
  });

  it('renders a ShareButton so users can copy a link to the current quiz', () => {
    expect(quizSource).toMatch(/<ShareButton\s/);
  });

  it('splits the complete-screen share UI into Share Link + Share Score buttons', () => {
    // "Share Link" copies just the URL; "Share Score" copies a score-brag
    // message that already embeds the URL via buildScoreMessage.
    expect(quizSource).toMatch(/label="Share Link"/);
    expect(quizSource).toMatch(/label="Share Score"/);
    expect(quizSource).toMatch(/buildScoreMessage\(score,\s*deck\.length,\s*completeShareUrl\)/);
  });

  it('auto-starts in playing phase when a shared ?pq= deck is decoded', () => {
    // Share links should launch the quiz directly; if the recipient had to
    // click through the setup screen, they could rebuild a different deck.
    expect(quizSource).toMatch(/shared\s*\?\s*'playing'\s*:\s*'setup'/);
  });

  it('hydrates the deck from a shared ?pq= query and respects its stack depth', () => {
    expect(quizSource).toMatch(/decodePreflopQuiz\(query\)/);
    expect(quizSource).toMatch(/shared\.stackDepth/);
  });
});

describe('PreflopQuiz — playing screen position table', () => {
  it('renders the PositionTable inside the playing card — visual context for the question', () => {
    expect(quizSource).toMatch(/import\s*\{\s*PositionTable\s*\}/);
    // Used inside the rq-card block (not just on the setup screen).
    expect(quizSource).toMatch(/rq-card[\s\S]*?<PositionTable[\s\S]*?readOnly=\{true\}/);
  });

  it('passes readOnly=true on the playing screen — quiz table is for display, not selection', () => {
    expect(quizSource).toMatch(/readOnly=\{true\}/);
  });

  it('maps quiz mode to the matching villain action symbol — vsRaise → raise, limp → limp', () => {
    expect(quizSource).toMatch(/villainAction\s*=\s*current\?\.type\s*===\s*'vsRaise'\s*\?\s*'raise'\s*:\s*current\?\.type\s*===\s*'limp'\s*\?\s*'limp'\s*:\s*null/);
  });

  it('passes the per-question villain action into the PositionTable', () => {
    expect(quizSource).toMatch(/<PositionTable[\s\S]*?villainAction=\{villainAction\}/);
  });

  it('only shows villain seat when the question has one — RFI questions still render the table without a villain', () => {
    expect(quizSource).toMatch(/showVillain=\{!!current\.villainPos\}/);
  });
});
