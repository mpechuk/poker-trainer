// Share-link encoding for quiz configurations.
//
// Two quiz types have distinct encodings, both as query-string fragments
// appended to the existing quiz hash routes:
//
//   Terminology: #/quizzes/terminology?tq=<i1>,<i2>,...
//     Each iN is a zero-based index into the TERMS array. The order of
//     indexes defines the exact question order.
//
//   Preflop:     #/quizzes/preflop?pq=<stackDepth>~<q1>~<q2>...
//     Each qN = <typeCode>.<hand>.<heroPos>.<villainOrDash>.<suitCode>
//     typeCode: r = rfi, l = limp, v = vsRaise
//     villainOrDash: either a position string or "-" (RFI has no villain)
//     suitCode: s / h / d / c (spades / hearts / diamonds / clubs).
//       Older 4-field links without a suit field still decode — the recipient
//       just gets a freshly-randomized suit for those questions.
//
// The decoded deck is sufficient to reproduce the identical quiz: correct
// actions are looked up from the deterministic GTO ranges, and preserving
// the suit keeps suited-hand renderings identical across shares.

import { TERMS } from '../data/terms.js';
import { RFI_RANGES, STACK_DEPTHS } from '../data/rfi-ranges.js';
import { LIMP_RANGES, VS_RAISE_RANGES } from '../data/preflop-ranges.js';
import { classifyFlop, FLOP_RANKS, FLOP_SUITS } from './flop.js';

const TYPE_ENCODE = { rfi: 'r', limp: 'l', vsRaise: 'v' };
const TYPE_DECODE = { r: 'rfi', l: 'limp', v: 'vsRaise' };

const SUIT_ENCODE = { '\u2660': 's', '\u2665': 'h', '\u2666': 'd', '\u2663': 'c' };
const SUIT_DECODE = { s: '\u2660', h: '\u2665', d: '\u2666', c: '\u2663' };

const TERM_INDEX = new Map(TERMS.map((t, i) => [t.term, i]));

export function encodeTermQuiz(deck) {
  if (!Array.isArray(deck) || deck.length === 0) return null;
  const idxs = [];
  for (const t of deck) {
    const i = TERM_INDEX.get(t.term);
    if (i == null) return null;
    idxs.push(i);
  }
  return `tq=${idxs.join(',')}`;
}

export function decodeTermQuiz(query) {
  const raw = query?.tq;
  if (!raw) return null;
  const parts = raw.split(',');
  const deck = [];
  for (const p of parts) {
    const n = Number(p);
    if (!Number.isInteger(n) || n < 0 || n >= TERMS.length) return null;
    deck.push(TERMS[n]);
  }
  if (deck.length === 0) return null;
  return { deck };
}

function lookupCorrectAction(type, stackDepth, hand, heroPos, villainPos) {
  if (type === 'rfi') {
    const set = RFI_RANGES[stackDepth]?.[heroPos];
    if (!set) return null;
    return set.has(hand) ? 'raise' : 'fold';
  }
  if (type === 'limp') {
    const range = LIMP_RANGES[stackDepth]?.[heroPos]?.[villainPos];
    if (!range) return null;
    return range.raise.has(hand) ? 'raise' : range.call.has(hand) ? 'call' : 'fold';
  }
  if (type === 'vsRaise') {
    const range = VS_RAISE_RANGES[stackDepth]?.[heroPos]?.[villainPos];
    if (!range) return null;
    return range.threebet.has(hand) ? 'threebet' : range.call.has(hand) ? 'call' : 'fold';
  }
  return null;
}

export function encodePreflopQuiz(stackDepth, deck) {
  if (!STACK_DEPTHS.includes(stackDepth)) return null;
  if (!Array.isArray(deck) || deck.length === 0) return null;
  const parts = [];
  for (const q of deck) {
    const code = TYPE_ENCODE[q.type];
    if (!code || !q.hand || !q.heroPos) return null;
    const suitCode = SUIT_ENCODE[q.suit] || '';
    const suffix = suitCode ? `.${suitCode}` : '';
    parts.push(`${code}.${q.hand}.${q.heroPos}.${q.villainPos || '-'}${suffix}`);
  }
  return `pq=${stackDepth}~${parts.join('~')}`;
}

export function decodePreflopQuiz(query) {
  const raw = query?.pq;
  if (!raw) return null;
  const segments = raw.split('~');
  if (segments.length < 2) return null;
  const [stackDepth, ...qs] = segments;
  if (!STACK_DEPTHS.includes(stackDepth)) return null;
  const deck = [];
  for (const s of qs) {
    const fields = s.split('.');
    // 4-field (legacy) or 5-field (with suit) encodings.
    if (fields.length !== 4 && fields.length !== 5) return null;
    const [code, hand, heroPos, villainRaw, suitRaw] = fields;
    const type = TYPE_DECODE[code];
    if (!type) return null;
    const villainPos = villainRaw === '-' ? null : villainRaw;
    const correctAction = lookupCorrectAction(type, stackDepth, hand, heroPos, villainPos);
    if (!correctAction) return null;
    const question = { type, hand, heroPos, villainPos, stackDepth, correctAction };
    if (suitRaw) {
      const suit = SUIT_DECODE[suitRaw];
      if (!suit) return null;
      question.suit = suit;
    }
    deck.push(question);
  }
  if (deck.length === 0) return null;
  return { stackDepth, deck };
}

// Flop quiz: encodes three cards per question. The correct texture is
// re-derived via classifyFlop, so only the cards need to travel in the URL.
//
//   #/quizzes/flop?fq=<q1>,<q2>,...
//     qN = <r1><s1><r2><s2><r3><s3>
//     rN ∈ {2..9,T,J,Q,K,A}  (T for 10 keeps every card two chars)
//     sN ∈ {s,h,d,c}
const RANK_ENCODE = { '10': 'T' };
const RANK_DECODE = { T: '10' };

function encodeRank(r) { return RANK_ENCODE[r] || r; }
function decodeRank(r) { return RANK_DECODE[r] || r; }

export function encodeFlopQuiz(deck) {
  if (!Array.isArray(deck) || deck.length === 0) return null;
  const parts = [];
  for (const q of deck) {
    if (!q?.cards || q.cards.length !== 3) return null;
    let s = '';
    for (const c of q.cards) {
      if (!FLOP_RANKS.includes(c.rank) || !FLOP_SUITS.includes(c.suit)) return null;
      s += encodeRank(c.rank) + SUIT_ENCODE[c.suit];
    }
    parts.push(s);
  }
  return `fq=${parts.join(',')}`;
}

export function decodeFlopQuiz(query) {
  const raw = query?.fq;
  if (!raw) return null;
  const deck = [];
  for (const s of raw.split(',')) {
    if (s.length !== 6) return null;
    const cards = [];
    for (let i = 0; i < 3; i++) {
      const rawRank = s[i * 2];
      const rawSuit = s[i * 2 + 1];
      const rank = decodeRank(rawRank);
      const suit = SUIT_DECODE[rawSuit];
      if (!FLOP_RANKS.includes(rank) || !suit) return null;
      cards.push({ rank, suit });
    }
    const texture = classifyFlop(cards);
    if (!texture) return null;
    deck.push({ cards, texture });
  }
  if (deck.length === 0) return null;
  return { deck };
}

// Flop Combos & Outs quiz: encodes 2 hole + 3 flop + 1 turn card per question.
// Correct answers (made / reachable / outs / probability) are re-derived via
// analyzeQuestion / analyzeWithTurn on decode, so only the cards need to
// travel in the URL.
//
//   #/quizzes/flop-combos?cq=<q1>,<q2>,...
//     qN = <h1><h2><f1><f2><f3><t>  (6 cards × 2 chars = 12 chars per question)
//     rank uses T for 10; suit codes are s/h/d/c.
//
// Backward compatibility: legacy 10-char questions (no turn) still decode —
// a fresh turn is rolled at deck-build / phase-3 entry time so old links keep
// working, the recipient just gets a randomized turn for those questions.
export function encodeCombosQuiz(deck) {
  if (!Array.isArray(deck) || deck.length === 0) return null;
  const parts = [];
  for (const q of deck) {
    if (!q?.holes || q.holes.length !== 2 || !q.flop || q.flop.length !== 3) return null;
    const cards = [...q.holes, ...q.flop];
    if (q.turn) cards.push(q.turn);
    let s = '';
    for (const c of cards) {
      if (!FLOP_RANKS.includes(c.rank) || !FLOP_SUITS.includes(c.suit)) return null;
      s += encodeRank(c.rank) + SUIT_ENCODE[c.suit];
    }
    parts.push(s);
  }
  return `cq=${parts.join(',')}`;
}

export function decodeCombosQuiz(query) {
  const raw = query?.cq;
  if (!raw) return null;
  const deck = [];
  for (const s of raw.split(',')) {
    if (s.length !== 10 && s.length !== 12) return null;
    const nCards = s.length / 2;
    const cards = [];
    for (let i = 0; i < nCards; i++) {
      const rawRank = s[i * 2];
      const rawSuit = s[i * 2 + 1];
      const rank = decodeRank(rawRank);
      const suit = SUIT_DECODE[rawSuit];
      if (!FLOP_RANKS.includes(rank) || !suit) return null;
      cards.push({ rank, suit });
    }
    const question = { holes: [cards[0], cards[1]], flop: [cards[2], cards[3], cards[4]] };
    if (cards.length === 6) question.turn = cards[5];
    deck.push(question);
  }
  if (deck.length === 0) return null;
  return { deck };
}

// Build an absolute share URL for the given hash path + encoded query.
export function buildShareUrl(path, encodedQuery) {
  const { origin, pathname } = window.location;
  return `${origin}${pathname}#${path}?${encodedQuery}`;
}

export async function copyToClipboard(text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch (_) { /* fall through */ }
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch (_) { return false; }
}

// "I've got 60% correct (3/5). Can you beat my score? <url>"
export function buildScoreMessage(score, total, url) {
  const safeTotal = Math.max(0, total | 0);
  const safeScore = Math.max(0, score | 0);
  const pct = safeTotal > 0 ? Math.round(safeScore / safeTotal * 100) : 0;
  return `I've got ${pct}% correct (${safeScore}/${safeTotal}). Can you beat my score? ${url}`;
}
