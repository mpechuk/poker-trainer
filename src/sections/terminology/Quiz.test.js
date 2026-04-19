import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { TERMS } from '../../data/terms.js';
import { buildDeck, buildOptions } from './Quiz.jsx';

const __dirname = dirname(fileURLToPath(import.meta.url));
const quizSource = readFileSync(resolve(__dirname, 'Quiz.jsx'), 'utf8');

const ALL_CATS = new Set(TERMS.map(t => t.cat));

describe('buildOptions', () => {
  it('always includes the correct term from deck[idx] — regression for dual-shuffle bug', () => {
    // Before fix, options were built from a *different* shuffled deck than quizDeck,
    // so the correct answer for question 0 was frequently absent.
    for (let run = 0; run < 20; run++) {
      const deck = buildDeck(ALL_CATS);
      const opts = buildOptions(deck, 0);
      const correctTerm = deck[0].term;
      const found = opts.some(o => o.term === correctTerm);
      expect(found, `correct term "${correctTerm}" missing from options on run ${run}`).toBe(true);
    }
  });

  it('returns exactly 4 options', () => {
    const deck = buildDeck(ALL_CATS);
    const opts = buildOptions(deck, 0);
    expect(opts).toHaveLength(4);
  });

  it('returns empty array when idx is out of bounds', () => {
    const deck = buildDeck(ALL_CATS);
    expect(buildOptions(deck, deck.length)).toEqual([]);
    expect(buildOptions([], 0)).toEqual([]);
  });
});

describe('Quiz — complete screen', () => {
  it('renders a Stats link pointing to #/stats on the complete screen', () => {
    // Lets users jump straight to their overall stats after finishing a quiz.
    expect(quizSource).toMatch(/href="#\/stats"[^>]*>Stats<\/a>/);
  });
});

describe('buildDeck', () => {
  it('filters terms to only matching categories', () => {
    const cats = new Set(['Hand Rankings']);
    const deck = buildDeck(cats);
    expect(deck.length).toBeGreaterThan(0);
    for (const t of deck) {
      expect(t.cat).toBe('Hand Rankings');
    }
  });

  it('returns empty array when no categories match', () => {
    const deck = buildDeck(new Set());
    expect(deck).toHaveLength(0);
  });
});
