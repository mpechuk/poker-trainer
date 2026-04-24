import { describe, it, expect } from 'vitest';
import {
  BOARD_TEXTURES,
  FLOP_RANKS,
  FLOP_SUITS,
  classifyFlop,
  generateFlopForTexture,
  buildFlopDeck,
} from './flop.js';

const c = (rank, suit) => ({ rank, suit });

describe('classifyFlop', () => {
  it('identifies a paired flop regardless of suits', () => {
    expect(classifyFlop([c('A','♣'), c('A','♦'), c('9','♠')])).toBe('Paired Flop');
    expect(classifyFlop([c('7','♠'), c('7','♥'), c('7','♦')])).toBe('Paired Flop');
  });

  it('identifies a monotone flop when all three cards share a suit', () => {
    expect(classifyFlop([c('Q','♥'), c('8','♥'), c('5','♥')])).toBe('Monotone Flop');
  });

  it('identifies a wet flop (two-tone + close ranks)', () => {
    expect(classifyFlop([c('9','♠'), c('8','♠'), c('J','♣')])).toBe('Wet / Dynamic Flop');
  });

  it('identifies a two-tone flop (two of a suit, disconnected ranks)', () => {
    expect(classifyFlop([c('A','♠'), c('9','♠'), c('5','♦')])).toBe('Two-tone Flop');
  });

  it('identifies a connected flop (rainbow + close ranks)', () => {
    expect(classifyFlop([c('4','♣'), c('6','♦'), c('7','♠')])).toBe('Connected Flop');
  });

  it('identifies a dry flop (rainbow + disconnected ranks)', () => {
    expect(classifyFlop([c('K','♣'), c('8','♠'), c('3','♦')])).toBe('Dry / Static Flop');
  });

  it('treats A-2-3 as connected via the Ace-low wheel', () => {
    // Rainbow + Ace-low connected should still classify as Connected, not Dry.
    expect(classifyFlop([c('A','♠'), c('2','♥'), c('3','♦')])).toBe('Connected Flop');
  });

  it('returns null for malformed input', () => {
    expect(classifyFlop(null)).toBeNull();
    expect(classifyFlop([c('A','♠'), c('K','♥')])).toBeNull();
    expect(classifyFlop([c('A','♠'), c('K','♥'), { rank: 'X', suit: '♦' }])).toBeNull();
  });
});

describe('generateFlopForTexture', () => {
  it('produces a flop whose classification matches the requested texture', () => {
    for (const texture of BOARD_TEXTURES) {
      for (let i = 0; i < 10; i++) {
        const cards = generateFlopForTexture(texture);
        expect(cards).toHaveLength(3);
        // Every card must use canonical ranks/suits so share-link encoding works.
        for (const card of cards) {
          expect(FLOP_RANKS).toContain(card.rank);
          expect(FLOP_SUITS).toContain(card.suit);
        }
        // The canonical-example fallback for wet/connected may not survive the
        // classifyFlop re-check in edge cases, but randomized generation does.
        expect(classifyFlop(cards)).toBe(texture);
      }
    }
  });

  it('returns null for an unknown texture', () => {
    expect(generateFlopForTexture('Nonsense Flop')).toBeNull();
  });
});

describe('buildFlopDeck', () => {
  it('produces the requested number of questions', () => {
    const deck = buildFlopDeck(10);
    expect(deck).toHaveLength(10);
  });

  it('covers all six textures when the deck is long enough', () => {
    const deck = buildFlopDeck(12);
    const seen = new Set(deck.map(q => q.texture));
    for (const texture of BOARD_TEXTURES) {
      expect(seen).toContain(texture);
    }
  });

  it('every question matches its classification — so correct answers stay valid', () => {
    const deck = buildFlopDeck(18);
    for (const q of deck) {
      expect(classifyFlop(q.cards)).toBe(q.texture);
    }
  });
});
