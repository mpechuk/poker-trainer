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
