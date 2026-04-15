import { describe, it, expect } from 'vitest';
import { handToCards } from './illustrations.jsx';

describe('handToCards', () => {
  it('suited hand renders the same SVG across repeated calls when a suit is supplied — no suit-flip regression for #21', () => {
    // Regression: previously handToCards called Math.random() on every invocation,
    // so each re-render of the quiz (e.g. after clicking an answer) rolled a new
    // suit for suited hands like AKs. With an explicit suit it must be stable.
    const first = handToCards('AKs', '♠');
    for (let i = 0; i < 20; i++) {
      expect(handToCards('AKs', '♠')).toBe(first);
    }
  });

  it('suited hand uses the suit that was supplied', () => {
    const spades = handToCards('AKs', '♠');
    const hearts = handToCards('AKs', '♥');
    const diamonds = handToCards('AKs', '♦');
    const clubs = handToCards('AKs', '♣');
    // All four must differ from each other — if the suit arg were ignored they'd match.
    expect(new Set([spades, hearts, diamonds, clubs]).size).toBe(4);
    // And each must contain its suit glyph.
    expect(spades).toContain('♠');
    expect(hearts).toContain('♥');
    expect(diamonds).toContain('♦');
    expect(clubs).toContain('♣');
  });

  it('suited hand without a suit arg still returns a valid suited SVG (backward compat)', () => {
    const out = handToCards('AKs');
    expect(typeof out).toBe('string');
    expect(out.length).toBeGreaterThan(0);
    // Both cards share the same suit — exactly one of the four glyphs should appear, twice.
    const glyphs = ['♠','♥','♦','♣'].filter(g => out.includes(g));
    expect(glyphs).toHaveLength(1);
  });

  it('pair is deterministic and ignores the suit argument', () => {
    const a = handToCards('AA');
    const b = handToCards('AA', '♦');
    expect(a).toBe(b);
    expect(a).toContain('♠');
    expect(a).toContain('♥');
  });

  it('offsuit is deterministic and ignores the suit argument', () => {
    const a = handToCards('AKo');
    const b = handToCards('AKo', '♦');
    expect(a).toBe(b);
    expect(a).toContain('♠');
    expect(a).toContain('♥');
  });
});
