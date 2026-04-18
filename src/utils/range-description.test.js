import { describe, it, expect } from 'vitest';
import { describeHands, describeRfi, describeLimp, describeVsRaise } from './range-description.js';

describe('describeHands', () => {
  it('returns "none" for empty set', () => {
    expect(describeHands(new Set())).toBe('none');
    expect(describeHands(null)).toBe('none');
  });

  it('collapses contiguous pairs from AA into "XX+"', () => {
    const s = new Set(['AA', 'KK', 'QQ', 'JJ', 'TT', '99']);
    expect(describeHands(s)).toBe('99+');
  });

  it('uses dash range for non-prefix pair runs', () => {
    const s = new Set(['JJ', 'TT', '99', '77']);
    expect(describeHands(s)).toBe('JJ–99, 77');
  });

  it('collapses contiguous suited aces from AKs into "AXs+"', () => {
    const s = new Set(['AKs', 'AQs', 'AJs', 'ATs']);
    expect(describeHands(s)).toBe('ATs+');
  });

  it('separates wheel suited aces from top suited aces', () => {
    const s = new Set(['AKs', 'AQs', 'AJs', 'ATs', 'A5s', 'A4s']);
    expect(describeHands(s)).toBe('ATs+, A5s–A4s');
  });

  it('handles mixed pairs, suited, and offsuit', () => {
    const s = new Set(['AA', 'KK', 'QQ', 'AKs', 'AQs', 'AKo', 'AQo']);
    expect(describeHands(s)).toBe('QQ+; AQs+; AQo+');
  });

  it('orders by top rank A → 2', () => {
    const s = new Set(['KQs', 'AKs', 'QJs']);
    const out = describeHands(s);
    expect(out.indexOf('AKs')).toBeLessThan(out.indexOf('KQs'));
    expect(out.indexOf('KQs')).toBeLessThan(out.indexOf('QJs'));
  });

  it('places pairs before suited and suited before offsuit', () => {
    const s = new Set(['AA', 'AKs', 'AKo']);
    const out = describeHands(s);
    expect(out.indexOf('AA')).toBeLessThan(out.indexOf('AKs'));
    expect(out.indexOf('AKs')).toBeLessThan(out.indexOf('AKo'));
  });

  it('single hand renders as just the hand', () => {
    expect(describeHands(new Set(['AA']))).toBe('AA');
    expect(describeHands(new Set(['A5s']))).toBe('A5s');
  });
});

describe('describeRfi', () => {
  it('wraps range in an "Open-raise ... fold everything else." sentence', () => {
    const s = new Set(['AA', 'KK', 'AKs', 'AKo']);
    const out = describeRfi(s);
    expect(out).toMatch(/^Open-raise /);
    expect(out).toMatch(/fold everything else\.$/);
    expect(out).toContain('KK+');
  });
});

describe('describeLimp', () => {
  it('uses Call verb for non-BB hero', () => {
    const rs = { raise: new Set(['AA']), call: new Set(['KK']) };
    const out = describeLimp(rs, false);
    expect(out).toMatch(/Iso-raise AA/);
    expect(out).toMatch(/Call behind with KK/);
  });

  it('uses Check verb for BB hero', () => {
    const rs = { raise: new Set(['AA']), call: new Set(['KK']) };
    const out = describeLimp(rs, true);
    expect(out).toMatch(/Check behind with KK/);
  });
});

describe('describeVsRaise', () => {
  it('produces a 3-bet / flat-call / fold description', () => {
    const rs = { threebet: new Set(['AA', 'KK']), call: new Set(['QQ', 'JJ']) };
    const out = describeVsRaise(rs);
    expect(out).toMatch(/^3-bet KK\+/);
    expect(out).toMatch(/Flat-call QQ–JJ/);
    expect(out).toMatch(/Fold everything else\.$/);
  });
});
