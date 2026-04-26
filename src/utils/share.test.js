import { describe, it, expect } from 'vitest';
import { TERMS } from '../data/terms.js';
import { RFI_RANGES } from '../data/rfi-ranges.js';
import { LIMP_RANGES, VS_RAISE_RANGES } from '../data/preflop-ranges.js';
import {
  encodeTermQuiz, decodeTermQuiz,
  encodePreflopQuiz, decodePreflopQuiz,
  encodeFlopQuiz, decodeFlopQuiz,
  encodeCombosQuiz, decodeCombosQuiz,
  buildShareUrl, buildScoreMessage,
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
      { type: 'rfi', hand: sampleHand, heroPos: 'UTG', villainPos: null, stackDepth: '100BB', suit: '\u2660', correctAction: 'raise' },
      { type: 'rfi', hand: '72o',       heroPos: 'UTG', villainPos: null, stackDepth: '100BB', suit: '\u2665', correctAction: 'fold'  },
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

  it('preserves per-question suits through the round-trip', () => {
    const deck = [
      { type: 'rfi', hand: 'AKs', heroPos: 'UTG', villainPos: null, stackDepth: '100BB', suit: '\u2660' },
      { type: 'rfi', hand: 'QJs', heroPos: 'HJ',  villainPos: null, stackDepth: '100BB', suit: '\u2665' },
      { type: 'rfi', hand: 'T9s', heroPos: 'CO',  villainPos: null, stackDepth: '100BB', suit: '\u2666' },
      { type: 'rfi', hand: '98s', heroPos: 'BTN', villainPos: null, stackDepth: '100BB', suit: '\u2663' },
    ];
    const encoded = encodePreflopQuiz('100BB', deck);
    const { deck: decoded } = decodePreflopQuiz({ pq: encoded.slice(3) });
    expect(decoded.map(q => q.suit)).toEqual(['\u2660', '\u2665', '\u2666', '\u2663']);
  });

  it('decodes legacy 4-field links (no suit) without failing', () => {
    // Links shared before suit encoding existed must still open — the
    // recipient just gets freshly-randomized suits at render time.
    const { deck } = decodePreflopQuiz({ pq: '100BB~r.AA.UTG.-~r.72o.HJ.-' });
    expect(deck).toHaveLength(2);
    expect(deck[0].suit).toBeUndefined();
    expect(deck[1].suit).toBeUndefined();
  });

  it('returns null for an unknown suit code', () => {
    expect(decodePreflopQuiz({ pq: '100BB~r.AA.UTG.-.x' })).toBeNull();
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

describe('encodeFlopQuiz / decodeFlopQuiz', () => {
  const deck = [
    { cards: [{rank:'A',suit:'♠'},{rank:'9',suit:'♠'},{rank:'5',suit:'♦'}], texture: 'Two-tone Flop' },
    { cards: [{rank:'K',suit:'♣'},{rank:'8',suit:'♠'},{rank:'3',suit:'♦'}], texture: 'Dry / Static Flop' },
    { cards: [{rank:'10',suit:'♥'},{rank:'9',suit:'♥'},{rank:'8',suit:'♥'}], texture: 'Monotone Flop' },
  ];

  it('round-trips a deck and re-derives the correct texture', () => {
    const encoded = encodeFlopQuiz(deck);
    expect(encoded).toMatch(/^fq=/);
    const { deck: decoded } = decodeFlopQuiz({ fq: encoded.slice(3) });
    expect(decoded).toHaveLength(3);
    expect(decoded[0].cards).toEqual(deck[0].cards);
    expect(decoded[0].texture).toBe('Two-tone Flop');
    expect(decoded[1].texture).toBe('Dry / Static Flop');
    expect(decoded[2].texture).toBe('Monotone Flop');
  });

  it('encodes 10 as T so every card stays two characters', () => {
    const encoded = encodeFlopQuiz([deck[2]]);
    expect(encoded).toBe('fq=Th9h8h');
  });

  it('returns null for malformed / missing input', () => {
    expect(encodeFlopQuiz([])).toBeNull();
    expect(encodeFlopQuiz(null)).toBeNull();
    expect(decodeFlopQuiz({})).toBeNull();
    expect(decodeFlopQuiz({ fq: '' })).toBeNull();
    expect(decodeFlopQuiz({ fq: 'invalid' })).toBeNull();
    expect(decodeFlopQuiz({ fq: 'Xs8s3d' })).toBeNull();
  });
});

describe('encodeCombosQuiz / decodeCombosQuiz', () => {
  const deck = [
    { holes: [{rank:'A',suit:'♠'},{rank:'K',suit:'♥'}],
      flop:  [{rank:'2',suit:'♠'},{rank:'7',suit:'♠'},{rank:'J',suit:'♦'}] },
    { holes: [{rank:'10',suit:'♦'},{rank:'10',suit:'♣'}],
      flop:  [{rank:'10',suit:'♠'},{rank:'5',suit:'♥'},{rank:'2',suit:'♣'}] },
  ];

  it('round-trips a deck, preserving exact cards', () => {
    const encoded = encodeCombosQuiz(deck);
    expect(encoded).toMatch(/^cq=/);
    const decoded = decodeCombosQuiz({ cq: encoded.slice(3) });
    expect(decoded.deck).toHaveLength(2);
    expect(decoded.deck[0].holes).toEqual(deck[0].holes);
    expect(decoded.deck[0].flop).toEqual(deck[0].flop);
    expect(decoded.deck[1].holes).toEqual(deck[1].holes);
  });

  it('encodes 10 as T so every card is exactly two characters', () => {
    const encoded = encodeCombosQuiz([deck[1]]);
    expect(encoded).toBe('cq=TdTcTs5h2c');
  });

  it('returns null for malformed / missing input', () => {
    expect(encodeCombosQuiz([])).toBeNull();
    expect(encodeCombosQuiz(null)).toBeNull();
    expect(decodeCombosQuiz({})).toBeNull();
    expect(decodeCombosQuiz({ cq: '' })).toBeNull();
    expect(decodeCombosQuiz({ cq: 'short' })).toBeNull();
    expect(decodeCombosQuiz({ cq: 'Xs8s3d2c9h' })).toBeNull();
  });

  it('round-trips a deck that includes a turn card (12-char question)', () => {
    const deckWithTurn = [
      {
        holes: [{rank:'A',suit:'♠'},{rank:'K',suit:'♥'}],
        flop:  [{rank:'2',suit:'♠'},{rank:'7',suit:'♠'},{rank:'J',suit:'♦'}],
        turn:  {rank:'9',suit:'♣'},
      },
    ];
    const encoded = encodeCombosQuiz(deckWithTurn);
    expect(encoded).toBe('cq=AsKh2s7sJd9c');
    const decoded = decodeCombosQuiz({ cq: encoded.slice(3) });
    expect(decoded.deck).toHaveLength(1);
    expect(decoded.deck[0].turn).toEqual(deckWithTurn[0].turn);
  });

  it('decodes legacy 10-char questions (no turn) without setting a turn — recipient hydrates a fresh one', () => {
    const decoded = decodeCombosQuiz({ cq: 'AsKh2s7sJd' });
    expect(decoded.deck).toHaveLength(1);
    expect(decoded.deck[0].turn).toBeUndefined();
    expect(decoded.deck[0].holes).toEqual([{rank:'A',suit:'♠'},{rank:'K',suit:'♥'}]);
  });

  it('rejects a question with an odd partial card (e.g. 11 chars)', () => {
    expect(decodeCombosQuiz({ cq: 'AsKh2s7sJd9' })).toBeNull();
  });
});

describe('buildScoreMessage', () => {
  it('produces the brag-message wording with percent, raw score, and link', () => {
    const url = 'https://example.com/#/quizzes/terminology?tq=1,2,3';
    const msg = buildScoreMessage(3, 5, url);
    expect(msg).toBe(`I've got 60% correct (3/5). Can you beat my score? ${url}`);
  });

  it('rounds percent and handles a total of zero without NaN', () => {
    expect(buildScoreMessage(0, 0, 'https://x/')).toContain('0% correct (0/0)');
    expect(buildScoreMessage(1, 3, 'https://x/')).toContain('33% correct (1/3)');
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
