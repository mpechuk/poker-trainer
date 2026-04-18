import { describe, it, expect } from 'vitest';
import { describeHands, describeRfi, describeLimp, describeVsRaise } from './range-description.js';
import { RFI_RANGES } from '../data/rfi-ranges.js';

describe('describeHands', () => {
  it('returns "nothing" for empty or missing sets', () => {
    expect(describeHands(new Set())).toBe('nothing');
    expect(describeHands(null)).toBe('nothing');
  });

  it('collapses a contiguous pair run from AA into "pairs XX+"', () => {
    const s = new Set(['AA', 'KK', 'QQ', 'JJ', 'TT', '99']);
    expect(describeHands(s)).toBe('pairs 99+');
  });

  it('uses "all pairs" when all 13 pocket pairs are present', () => {
    const all = new Set(['AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22']);
    expect(describeHands(all)).toBe('all pairs');
  });

  it('uses dash notation for non-prefix pair runs', () => {
    const s = new Set(['JJ', 'TT', '99', '77']);
    expect(describeHands(s)).toBe('pairs JJ–99, 77');
  });

  it('collapses contiguous top suited aces into "ATs+"', () => {
    const s = new Set(['AKs', 'AQs', 'AJs', 'ATs']);
    expect(describeHands(s)).toBe('suited aces ATs+');
  });

  it('names the wheels when A5s–A4s are present alongside top aces', () => {
    const s = new Set(['AKs', 'AQs', 'AJs', 'ATs', 'A5s', 'A4s']);
    expect(describeHands(s)).toBe('suited aces ATs+ plus wheel A5s–A4s');
  });

  it('collapses all four wheel suited aces into a named group', () => {
    const s = new Set(['AKs', 'AQs', 'AJs', 'ATs', 'A5s', 'A4s', 'A3s', 'A2s']);
    expect(describeHands(s)).toContain('the wheel suited aces (A5s–A2s)');
  });

  it('collapses all 12 suited aces into "every suited ace"', () => {
    const all = new Set(['AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s']);
    expect(describeHands(all)).toBe('every suited ace');
  });

  it('collapses all 6 suited broadways', () => {
    const s = new Set(['KQs', 'KJs', 'KTs', 'QJs', 'QTs', 'JTs']);
    expect(describeHands(s)).toBe('all suited broadways (KQs–JTs)');
  });

  it('lists partial suited broadways by top card', () => {
    const s = new Set(['KQs', 'KJs', 'KTs', 'QJs', 'QTs', 'JTs'].slice(0, 3).concat(['JTs']));
    // KQs, KJs, KTs, JTs → "suited broadways KTs+, JTs"
    expect(describeHands(s)).toBe('suited broadways KTs+, JTs');
  });

  it('classifies T9s/T8s as suited connectors and one-gappers (not Tx)', () => {
    const s = new Set(['T9s', 'T8s', '98s']);
    const out = describeHands(s);
    expect(out).toMatch(/suited connectors T9s–98s/);
    expect(out).toMatch(/one-gappers? T8s/);
  });

  it('labels 97s/75s as "one-gappers"', () => {
    const s = new Set(['97s', '75s']);
    const out = describeHands(s);
    expect(out).toMatch(/one-gappers 97s, 75s|one-gappers 97s.*75s/);
  });

  it('handles a wide offsuit range with connectors', () => {
    const s = new Set(['98o', '87o', '76o']);
    const out = describeHands(s);
    expect(out).toMatch(/offsuit connectors 98o–76o/);
  });

  it('places pairs before suited and suited before offsuit', () => {
    const s = new Set(['AA', 'AKs', 'AKo']);
    const out = describeHands(s);
    expect(out.indexOf('AA')).toBeLessThan(out.indexOf('AKs'));
    expect(out.indexOf('AKs')).toBeLessThan(out.indexOf('AKo'));
  });

  it('labels weak offsuit aces separately from strong ones', () => {
    const s = new Set(['AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'A8o']);
    const out = describeHands(s);
    expect(out).toMatch(/offsuit aces ATo\+/);
    expect(out).toMatch(/weak offsuit aces/);
  });
});

describe('describeRfi — sentence shape', () => {
  it('starts with "Open" and ends with fold sentence', () => {
    const out = describeRfi(new Set(['AA', 'KK']));
    expect(out).toMatch(/^Open /);
    expect(out).toMatch(/Fold everything else\.$/);
  });

  it('100BB UTG mentions pairs 66+, wheels, and KQo', () => {
    const out = describeRfi(RFI_RANGES['100BB'].UTG);
    expect(out).toContain('pairs 66+');
    expect(out).toContain('wheel A5s–A4s');
    expect(out).toContain('all suited broadways');
    expect(out).toContain('KQo');
  });

  it('100BB BTN uses "all pairs" and "every suited ace"', () => {
    const out = describeRfi(RFI_RANGES['100BB'].BTN);
    expect(out).toContain('all pairs');
    expect(out).toContain('every suited ace');
    expect(out).toContain('all suited broadways');
  });

  it('25BB UTG is short and has no connectors section', () => {
    const out = describeRfi(RFI_RANGES['25BB'].UTG);
    expect(out).toContain('pairs 99+');
    expect(out).not.toMatch(/connector/i);
    expect(out).not.toMatch(/gapper/i);
  });
});

describe('describeLimp', () => {
  it('uses Call for non-BB and Check for BB', () => {
    const rs = { raise: new Set(['AA']), call: new Set(['KK']) };
    expect(describeLimp(rs, false)).toMatch(/Call behind with/);
    expect(describeLimp(rs, true)).toMatch(/Check behind with/);
  });

  it('ends with fold sentence', () => {
    const rs = { raise: new Set(['AA']), call: new Set(['KK']) };
    expect(describeLimp(rs, false)).toMatch(/Fold the rest\.$/);
  });
});

describe('describeVsRaise', () => {
  it('has 3-bet, flat-call, and fold clauses', () => {
    const rs = { threebet: new Set(['AA', 'KK']), call: new Set(['QQ', 'JJ']) };
    const out = describeVsRaise(rs);
    expect(out).toMatch(/^3-bet /);
    expect(out).toMatch(/Flat-call /);
    expect(out).toMatch(/Fold the rest\.$/);
  });
});
