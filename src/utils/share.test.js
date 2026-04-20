import { describe, it, expect } from 'vitest';
import { TERMS } from '../data/terms.js';
import { RFI_RANGES } from '../data/rfi-ranges.js';
import { LIMP_RANGES, VS_RAISE_RANGES } from '../data/preflop-ranges.js';
import {
  encodeTermQuiz, decodeTermQuiz,
  encodePreflopQuiz, decodePreflopQuiz,
  buildShareUrl,
} from './share.js';

describe('encodeTermQuiz / decodeTermQuiz', () => {
  it('round-trips an ordered deck of terms', () => {
    const deck = [TERMS[0], TERMS[5], TERMS[12], TERMS[3]];
    const encoded = encodeTermQuiz(deck);
    expect(encoded).toBe('tq=0,5,12,3');
    const decoded = decodeTermQuiz({ tq: '0,5,12,3' });
    expect(decoded.deck.map(t => t.term)).toEqual(deck.map(t => t.term));
  });

  it('preserves question order — share link must reproduce identical quiz', () => {
    const deck = [TERMS[7], TERMS[2], TERMS[9]];
    const encoded = encodeTermQuiz(deck);
    const { deck: decoded } = decodeTermQuiz(Object.fromEntries(new URLSearchParams(encoded)));
    expect(decoded).toEqual(deck);
  });

  it('returns null for empty / missing query', () => {
    expect(decodeTermQuiz({})).toBeNull();
    expect(decodeTermQuiz({ tq: '' })).toBeNull();
    expect(decodeTermQuiz(null)).toBeNull();
  });

  it('returns null for out-of-range indexes — guards against stale links', () => {
    expect(decodeTermQuiz({ tq: '9999' })).toBeNull();
    expect(decodeTermQuiz({ tq: '-1' })).toBeNull();
    expect(decodeTermQuiz({ tq: '1,abc,3' })).toBeNull();
  });

  it('returns null when encoding an empty deck', () => {
    expect(encodeTermQuiz([])).toBeNull();
    expect(encodeTermQuiz(null)).toBeNull();
  });
});

describe('encodePreflopQuiz / decodePreflopQuiz', () => {
  it('round-trips an RFI deck and fills in correctAction from ranges', () => {
    const sampleHand = [...RFI_RANGES['100BB'].UTG][0];
    const deck = [
      { type: 'rfi', hand: sampleHand, heroPos: 'UTG', villainPos: null, stackDepth: '100BB', correctAction: 'raise' },
      { type: 'rfi', hand: '72o',       heroPos: 'UTG', villainPos: null, stackDepth: '100BB', correctAction: 'fold'  },
    ];
    const encoded = encodePreflopQuiz('100BB', deck);
    expect(encoded).toMatch(/^pq=100BB~r\./);
    const { stackDepth, deck: decoded } = decodePreflopQuiz({ pq: encoded.slice(3) });
    expect(stackDepth).toBe('100BB');
    expect(decoded).toHaveLength(2);
    expect(decoded[0].type).toBe('rfi');
    expect(decoded[0].hand).toBe(sampleHand);
    expect(decoded[0].heroPos).toBe('UTG');
    expect(decoded[0].villainPos).toBeNull();
    expect(decoded[0].correctAction).toBe('raise');
    expect(decoded[1].correctAction).toBe('fold');
  });

  it('round-trips a mixed limp + vsRaise deck', () => {
    const limpHand = [...LIMP_RANGES['100BB'].HJ.UTG.raise][0];
    const vsrHand  = [...VS_RAISE_RANGES['100BB'].HJ.UTG.threebet][0];
    const deck = [
      { type: 'limp',    hand: limpHand, heroPos: 'HJ', villainPos: 'UTG', stackDepth: '100BB', correctAction: 'raise'    },
      { type: 'vsRaise', hand: vsrHand,  heroPos: 'HJ', villainPos: 'UTG', stackDepth: '100BB', correctAction: 'threebet' },
    ];
    const encoded = encodePreflopQuiz('100BB', deck);
    const { deck: decoded } = decodePreflopQuiz({ pq: encoded.slice(3) });
    expect(decoded).toHaveLength(2);
    expect(decoded[0].type).toBe('limp');
    expect(decoded[0].villainPos).toBe('UTG');
    expect(decoded[0].correctAction).toBe('raise');
    expect(decoded[1].type).toBe('vsRaise');
    expect(decoded[1].correctAction).toBe('threebet');
  });

  it('returns null for unknown stack depth', () => {
    expect(decodePreflopQuiz({ pq: '9999BB~r.AA.UTG.-' })).toBeNull();
    expect(encodePreflopQuiz('9999BB', [{ type: 'rfi', hand: 'AA', heroPos: 'UTG', villainPos: null }])).toBeNull();
  });

  it('returns null for unknown type code', () => {
    expect(decodePreflopQuiz({ pq: '100BB~x.AA.UTG.-' })).toBeNull();
  });

  it('returns null for empty / missing query', () => {
    expect(decodePreflopQuiz({})).toBeNull();
    expect(decodePreflopQuiz({ pq: '' })).toBeNull();
    expect(decodePreflopQuiz(null)).toBeNull();
  });

  it('returns null when encoding an empty deck', () => {
    expect(encodePreflopQuiz('100BB', [])).toBeNull();
    expect(encodePreflopQuiz('100BB', null)).toBeNull();
  });

  it('preserves deck order exactly — share link reproduces identical quiz', () => {
    const deck = [
      { type: 'rfi', hand: 'AA', heroPos: 'UTG', villainPos: null, stackDepth: '100BB', correctAction: 'raise' },
      { type: 'rfi', hand: '72o', heroPos: 'HJ', villainPos: null, stackDepth: '100BB', correctAction: 'fold' },
      { type: 'rfi', hand: 'KK', heroPos: 'CO', villainPos: null, stackDepth: '100BB', correctAction: 'raise' },
    ];
    const encoded = encodePreflopQuiz('100BB', deck);
    const { deck: decoded } = decodePreflopQuiz({ pq: encoded.slice(3) });
    expect(decoded.map(q => `${q.type}.${q.hand}.${q.heroPos}`)).toEqual([
      'rfi.AA.UTG', 'rfi.72o.HJ', 'rfi.KK.CO',
    ]);
  });
});

describe('buildShareUrl', () => {
  it('composes an absolute hash URL from the current location + path + query', () => {
    const prevOrigin = globalThis.window;
    globalThis.window = { location: { origin: 'https://example.com', pathname: '/poker-trainer/' } };
    try {
      const url = buildShareUrl('/quizzes/terminology', 'tq=1,2,3');
      expect(url).toBe('https://example.com/poker-trainer/#/quizzes/terminology?tq=1,2,3');
    } finally {
      if (prevOrigin === undefined) delete globalThis.window;
      else globalThis.window = prevOrigin;
    }
  });
});
