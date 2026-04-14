import { describe, it, expect } from 'vitest';
import {
  LIMP_RANGES, VS_RAISE_RANGES,
  LIMP_HERO_POSITIONS, RAISE_HERO_POSITIONS,
  VALID_LIMP_VILLAINS, VALID_RAISE_VILLAINS,
} from './preflop-ranges.js';
import { STACK_DEPTHS } from './rfi-ranges.js';

const VALID_HAND = /^[AKQJT98765432]{2}[so]?$/;

describe('LIMP_RANGES structure', () => {
  it('has all 4 stack depths', () => {
    for (const d of STACK_DEPTHS) expect(LIMP_RANGES[d], `missing ${d}`).toBeTruthy();
  });

  it('each hero/villain combo has raise and call Sets', () => {
    for (const d of STACK_DEPTHS) {
      for (const hero of LIMP_HERO_POSITIONS) {
        for (const villain of VALID_LIMP_VILLAINS[hero]) {
          const r = LIMP_RANGES[d]?.[hero]?.[villain];
          expect(r, `missing ${d}/${hero}/${villain}`).toBeTruthy();
          expect(r.raise).toBeInstanceOf(Set);
          expect(r.call).toBeInstanceOf(Set);
        }
      }
    }
  });

  it('raise and call sets are disjoint', () => {
    for (const d of STACK_DEPTHS) {
      for (const hero of LIMP_HERO_POSITIONS) {
        for (const villain of VALID_LIMP_VILLAINS[hero]) {
          const { raise, call } = LIMP_RANGES[d][hero][villain];
          for (const h of raise) expect(call.has(h), `${h} in both raise+call (${d}/${hero}/${villain})`).toBe(false);
        }
      }
    }
  });

  it('all hand notations are valid', () => {
    for (const d of STACK_DEPTHS) {
      for (const hero of LIMP_HERO_POSITIONS) {
        for (const villain of VALID_LIMP_VILLAINS[hero]) {
          const { raise, call } = LIMP_RANGES[d][hero][villain];
          for (const h of [...raise, ...call]) expect(h, `invalid hand "${h}"`).toMatch(VALID_HAND);
        }
      }
    }
  });

  it('BTN raise range vs CO wider than HJ raise range vs UTG at 100BB', () => {
    const btn = LIMP_RANGES['100BB']['BTN']['CO'].raise.size;
    const hj  = LIMP_RANGES['100BB']['HJ']['UTG'].raise.size;
    expect(btn).toBeGreaterThan(hj);
  });

  it('100BB raise ranges wider than 25BB for BTN vs CO', () => {
    const r100 = LIMP_RANGES['100BB']['BTN']['CO'].raise.size;
    const r25  = LIMP_RANGES['25BB']['BTN']['CO'].raise.size;
    expect(r100).toBeGreaterThan(r25);
  });
});

describe('VALID_LIMP_VILLAINS', () => {
  it('HJ only faces UTG limp', () => expect(VALID_LIMP_VILLAINS['HJ']).toEqual(['UTG']));
  it('BB faces all 5 villain positions', () => expect(VALID_LIMP_VILLAINS['BB']).toHaveLength(5));
  it('BTN faces 3 villain positions', () => expect(VALID_LIMP_VILLAINS['BTN']).toHaveLength(3));
});

describe('VS_RAISE_RANGES structure', () => {
  it('has all 4 stack depths', () => {
    for (const d of STACK_DEPTHS) expect(VS_RAISE_RANGES[d], `missing ${d}`).toBeTruthy();
  });

  it('each hero/villain combo has threebet and call Sets', () => {
    for (const d of STACK_DEPTHS) {
      for (const hero of RAISE_HERO_POSITIONS) {
        for (const villain of VALID_RAISE_VILLAINS[hero]) {
          const r = VS_RAISE_RANGES[d]?.[hero]?.[villain];
          expect(r, `missing ${d}/${hero}/${villain}`).toBeTruthy();
          expect(r.threebet).toBeInstanceOf(Set);
          expect(r.call).toBeInstanceOf(Set);
        }
      }
    }
  });

  it('threebet and call sets are disjoint', () => {
    for (const d of STACK_DEPTHS) {
      for (const hero of RAISE_HERO_POSITIONS) {
        for (const villain of VALID_RAISE_VILLAINS[hero]) {
          const { threebet, call } = VS_RAISE_RANGES[d][hero][villain];
          for (const h of threebet) expect(call.has(h), `${h} in both 3bet+call`).toBe(false);
        }
      }
    }
  });

  it('all hand notations are valid', () => {
    for (const d of STACK_DEPTHS) {
      for (const hero of RAISE_HERO_POSITIONS) {
        for (const villain of VALID_RAISE_VILLAINS[hero]) {
          const { threebet, call } = VS_RAISE_RANGES[d][hero][villain];
          for (const h of [...threebet, ...call]) expect(h).toMatch(VALID_HAND);
        }
      }
    }
  });

  it('BB call range vs BTN wider than SB call range vs BTN at 100BB', () => {
    const bb = VS_RAISE_RANGES['100BB']['BB']['BTN'].call.size;
    const sb = VS_RAISE_RANGES['100BB']['SB']['BTN'].call.size;
    expect(bb).toBeGreaterThan(sb);
  });

  it('AA is always in 3-bet range for all hero/villain combos at 100BB', () => {
    for (const hero of RAISE_HERO_POSITIONS) {
      for (const villain of VALID_RAISE_VILLAINS[hero]) {
        expect(VS_RAISE_RANGES['100BB'][hero][villain].threebet.has('AA')).toBe(true);
      }
    }
  });
});
