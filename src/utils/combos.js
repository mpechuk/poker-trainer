// Flop Combos & Outs quiz — hand evaluator, per-question analyzer, deck builder.
//
// A "question" is: 2 hole cards + 3 flop cards (all distinct).
// We report, for every hand category:
//   made:             the current best category from hole+flop
//   turnOuts:         cards that, drawn on the turn, make the best 5-card hand
//                     exactly that category (the poker definition of "outs")
//   reachableByTurn:  categories achievable as the best 5-card hand after one
//                     more card (turn) — i.e. categories with ≥1 turn out, plus
//                     anything already made (subset-closed)
//   reachableByRiver: categories achievable as the final showdown category over
//                     any (turn, river) runout — includes runner-runner draws
//   reachable:        alias of reachableByRiver (kept for backward compatibility)
//   riverProb:        exact probability that the final best 5-card category equals
//                     C, over all C(47,2)=1081 runouts

import { FLOP_RANKS, FLOP_SUITS } from './flop.js';

export const CATEGORIES = [
  'High Card',
  'Pair',
  'Two Pair',
  'Three of a Kind',
  'Straight',
  'Flush',
  'Full House',
  'Four of a Kind',
  'Straight Flush',
  'Royal Flush',
];

// Categories offered as quiz options (High Card excluded — always trivially
// reachable on any flop, adds no teaching value).
export const QUIZ_CATEGORIES = CATEGORIES.slice(1);

// Subset relation: which categories are inherently contained in a 5-card hand
// of the keyed category. Having Two Pair means you also have a Pair; having a
// Full House means you also have Three of a Kind, Two Pair, and a Pair; etc.
// Note: Four of a Kind contains a Pair and Three of a Kind, but not Two Pair —
// "two pair" requires two different paired ranks. Royal Flush / Straight Flush
// contain Flush and Straight (5 distinct ranks → no pairs implied).
export const SUBSETS = {
  'High Card': new Set(),
  'Pair': new Set(),
  'Two Pair': new Set(['Pair']),
  'Three of a Kind': new Set(['Pair']),
  'Straight': new Set(),
  'Flush': new Set(),
  'Full House': new Set(['Three of a Kind', 'Two Pair', 'Pair']),
  'Four of a Kind': new Set(['Three of a Kind', 'Pair']),
  'Straight Flush': new Set(['Flush', 'Straight']),
  'Royal Flush': new Set(['Straight Flush', 'Flush', 'Straight']),
};

// All categories implied when your best 5-card hand is `cat` (cat itself + its subsets).
export function categoriesIncluded(cat) {
  const out = new Set([cat]);
  for (const s of SUBSETS[cat] || []) out.add(s);
  return out;
}

function rankIdx(r) { return FLOP_RANKS.indexOf(r); }

function isStraight(sortedIdx) {
  if (sortedIdx.length !== 5) return false;
  let consecutive = true;
  for (let i = 1; i < 5; i++) {
    if (sortedIdx[i] - sortedIdx[i - 1] !== 1) { consecutive = false; break; }
  }
  if (consecutive) return true;
  // A-2-3-4-5 wheel: ranks index out as [0,1,2,3,12].
  return sortedIdx[0] === 0 && sortedIdx[1] === 1
      && sortedIdx[2] === 2 && sortedIdx[3] === 3
      && sortedIdx[4] === 12;
}

export function evalFive(cards) {
  const ranks = cards.map(c => c.rank);
  const suits = cards.map(c => c.suit);
  const idxs = [...new Set(ranks.map(rankIdx))].sort((a, b) => a - b);
  const counts = {};
  for (const r of ranks) counts[r] = (counts[r] || 0) + 1;
  const countValues = Object.values(counts).sort((a, b) => b - a);

  const flush = new Set(suits).size === 1;
  const straight = idxs.length === 5 && isStraight(idxs);

  if (straight && flush) {
    const top = idxs[4];
    if (top === 12 && idxs[0] === 8) return { rank: 9, category: 'Royal Flush' };
    return { rank: 8, category: 'Straight Flush' };
  }
  if (countValues[0] === 4) return { rank: 7, category: 'Four of a Kind' };
  if (countValues[0] === 3 && countValues[1] === 2) return { rank: 6, category: 'Full House' };
  if (flush) return { rank: 5, category: 'Flush' };
  if (straight) return { rank: 4, category: 'Straight' };
  if (countValues[0] === 3) return { rank: 3, category: 'Three of a Kind' };
  if (countValues[0] === 2 && countValues[1] === 2) return { rank: 2, category: 'Two Pair' };
  if (countValues[0] === 2) return { rank: 1, category: 'Pair' };
  return { rank: 0, category: 'High Card' };
}

export function bestOf(cards) {
  if (cards.length === 5) return evalFive(cards);
  let best = { rank: -1, category: null };
  const n = cards.length;
  for (let i = 0; i < n - 4; i++)
    for (let j = i + 1; j < n - 3; j++)
      for (let k = j + 1; k < n - 2; k++)
        for (let l = k + 1; l < n - 1; l++)
          for (let m = l + 1; m < n; m++) {
            const e = evalFive([cards[i], cards[j], cards[k], cards[l], cards[m]]);
            if (e.rank > best.rank) best = e;
          }
  return best;
}

function deckMinus(used) {
  const usedKeys = new Set(used.map(c => c.rank + c.suit));
  const out = [];
  for (const r of FLOP_RANKS) {
    for (const s of FLOP_SUITS) {
      const k = r + s;
      if (!usedKeys.has(k)) out.push({ rank: r, suit: s });
    }
  }
  return out;
}

// Sort out-card lists high-rank first, then by suit, for a stable readable order.
const SUIT_ORDER = { '♠': 0, '♥': 1, '♦': 2, '♣': 3 };
function cmpCard(a, b) {
  const dr = rankIdx(b.rank) - rankIdx(a.rank);
  if (dr !== 0) return dr;
  return SUIT_ORDER[a.suit] - SUIT_ORDER[b.suit];
}

export function analyzeQuestion(holes, flop) {
  const known = [...holes, ...flop];
  const remaining = deckMinus(known);
  const made = bestOf(known).category;
  // Made includes subsets: e.g. Two Pair on the flop means you also "have" a Pair.
  const madeSet = categoriesIncluded(made);

  const turnOuts = {};
  for (const c of CATEGORIES) turnOuts[c] = { count: 0, cards: [] };

  const withOne = known.slice();
  withOne.push(null);
  for (const t of remaining) {
    withOne[withOne.length - 1] = t;
    const cat = bestOf(withOne).category;
    turnOuts[cat].cards.push(t);
    turnOuts[cat].count += 1;
  }
  for (const c of CATEGORIES) turnOuts[c].cards.sort(cmpCard);

  const riverCounts = {};
  for (const c of CATEGORIES) riverCounts[c] = 0;

  const withTwo = known.slice();
  withTwo.push(null, null);
  for (let i = 0; i < remaining.length; i++) {
    withTwo[withTwo.length - 2] = remaining[i];
    for (let j = i + 1; j < remaining.length; j++) {
      withTwo[withTwo.length - 1] = remaining[j];
      riverCounts[bestOf(withTwo).category] += 1;
    }
  }
  const total = remaining.length * (remaining.length - 1) / 2;
  const riverProb = {};
  for (const c of CATEGORIES) riverProb[c] = riverCounts[c] / total;

  // Reachable is subset-closed: if Two Pair is reachable, Pair is reachable too.
  // Made categories are always reachable. We track two horizons:
  //   reachableByTurn  — best 5-card hand after one more card
  //   reachableByRiver — best 5-card hand after both turn & river (includes
  //                      backdoor / runner-runner draws)
  // reachableByTurn is always a subset of reachableByRiver.
  const reachableByTurn = new Set();
  for (const c of CATEGORIES) {
    if (turnOuts[c].count > 0) {
      reachableByTurn.add(c);
      for (const s of SUBSETS[c]) reachableByTurn.add(s);
    }
  }
  for (const c of madeSet) reachableByTurn.add(c);

  const reachableByRiver = new Set();
  for (const c of CATEGORIES) {
    if (riverCounts[c] > 0) {
      reachableByRiver.add(c);
      for (const s of SUBSETS[c]) reachableByRiver.add(s);
    }
  }
  for (const c of madeSet) reachableByRiver.add(c);

  return {
    made,
    madeSet,
    reachableByTurn,
    reachableByRiver,
    reachable: reachableByRiver,
    turnOuts,
    riverProb,
  };
}

function randInt(n) { return Math.floor(Math.random() * n); }

function shufflePick(arr, n) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

function randomFiveCards() {
  const all = [];
  for (const r of FLOP_RANKS) for (const s of FLOP_SUITS) all.push({ rank: r, suit: s });
  return shufflePick(all, 5);
}

export function buildCombosDeck(length) {
  const deck = [];
  const n = Math.max(1, length | 0);
  for (let i = 0; i < n; i++) {
    const five = randomFiveCards();
    deck.push({ holes: [five[0], five[1]], flop: [five[2], five[3], five[4]] });
  }
  return deck;
}
