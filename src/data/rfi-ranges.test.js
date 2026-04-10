import { describe, it, expect } from 'vitest';
import { RANKS, RFI_RANGES, STACK_DEPTHS, POS_LIST, RFI_QUIZ_POSITIONS } from './rfi-ranges.js';

describe('RFI_RANGES structure', () => {
  it('exports STACK_DEPTHS with expected values', () => {
    expect(STACK_DEPTHS).toEqual(['100BB', '50BB', '33BB', '25BB']);
  });

  it('RFI_RANGES has an entry for each stack depth', () => {
    for (const depth of STACK_DEPTHS) {
      expect(RFI_RANGES[depth], `missing depth ${depth}`).toBeTruthy();
    }
  });

  it('each stack depth has all five positions', () => {
    for (const depth of STACK_DEPTHS) {
      for (const pos of POS_LIST) {
        expect(RFI_RANGES[depth][pos], `missing ${depth}/${pos}`).toBeInstanceOf(Set);
        expect(RFI_RANGES[depth][pos].size, `${depth}/${pos} is empty`).toBeGreaterThan(0);
      }
    }
  });

  it('all hand notations are valid format', () => {
    const validHand = /^[AKQJT98765432]{2}[so]?$/;
    for (const depth of STACK_DEPTHS) {
      for (const pos of POS_LIST) {
        for (const hand of RFI_RANGES[depth][pos]) {
          expect(hand, `invalid hand "${hand}" in ${depth}/${pos}`).toMatch(validHand);
        }
      }
    }
  });
});

describe('RFI_RANGES stack depth ordering', () => {
  it('100BB ranges are wider than 50BB for every position', () => {
    for (const pos of POS_LIST) {
      expect(RFI_RANGES['100BB'][pos].size).toBeGreaterThan(RFI_RANGES['50BB'][pos].size);
    }
  });

  it('50BB ranges are wider than 33BB for every position', () => {
    for (const pos of POS_LIST) {
      expect(RFI_RANGES['50BB'][pos].size).toBeGreaterThan(RFI_RANGES['33BB'][pos].size);
    }
  });

  it('33BB ranges are wider than 25BB for every position', () => {
    for (const pos of POS_LIST) {
      expect(RFI_RANGES['33BB'][pos].size).toBeGreaterThan(RFI_RANGES['25BB'][pos].size);
    }
  });

  it('ranges get tighter from BTN to UTG at each stack depth', () => {
    for (const depth of STACK_DEPTHS) {
      expect(RFI_RANGES[depth]['BTN'].size).toBeGreaterThan(RFI_RANGES[depth]['CO'].size);
      expect(RFI_RANGES[depth]['CO'].size).toBeGreaterThan(RFI_RANGES[depth]['HJ'].size);
      expect(RFI_RANGES[depth]['HJ'].size).toBeGreaterThan(RFI_RANGES[depth]['UTG'].size);
    }
  });
});

describe('RFI_RANGES hand notation correctness', () => {
  it('pocket pairs have no suit suffix', () => {
    for (const depth of STACK_DEPTHS) {
      for (const pos of POS_LIST) {
        for (const hand of RFI_RANGES[depth][pos]) {
          if (hand.length === 2) {
            expect(hand[0]).toBe(hand[1]);
          }
        }
      }
    }
  });

  it('suited hands end in s, offsuit hands end in o', () => {
    for (const depth of STACK_DEPTHS) {
      for (const pos of POS_LIST) {
        for (const hand of RFI_RANGES[depth][pos]) {
          if (hand.length === 3) {
            expect(['s', 'o']).toContain(hand[2]);
          }
        }
      }
    }
  });

  it('non-pair hands list higher rank first', () => {
    for (const depth of STACK_DEPTHS) {
      for (const pos of POS_LIST) {
        for (const hand of RFI_RANGES[depth][pos]) {
          if (hand.length >= 3) {
            const hi = RANKS.indexOf(hand[0]);
            const lo = RANKS.indexOf(hand[1]);
            expect(hi, `hand ${hand} in ${depth}/${pos} has ranks out of order`).toBeLessThan(lo);
          }
        }
      }
    }
  });
});

describe('RANKS and POS_LIST exports', () => {
  it('RANKS has 13 entries from A to 2', () => {
    expect(RANKS).toHaveLength(13);
    expect(RANKS[0]).toBe('A');
    expect(RANKS[12]).toBe('2');
  });

  it('POS_LIST and RFI_QUIZ_POSITIONS have 5 positions', () => {
    expect(POS_LIST).toHaveLength(5);
    expect(RFI_QUIZ_POSITIONS).toHaveLength(5);
  });
});
