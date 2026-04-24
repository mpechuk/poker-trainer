// Flop generation and classification for the Board Texture quiz.
//
// Each flop falls into exactly one of six canonical textures, matching the
// Board Texture terms in src/data/terms.js:
//
//   Paired Flop          — two of the three cards share a rank.
//   Monotone Flop        — all three cards share a suit.
//   Wet / Dynamic Flop   — unpaired, two cards of one suit, close ranks.
//   Two-tone Flop        — unpaired, two cards of one suit, disconnected ranks.
//   Connected Flop       — unpaired, three different suits, close ranks.
//   Dry / Static Flop    — unpaired, three different suits, disconnected ranks.
//
// "Close ranks" means the three ranks span at most 4 (covers consecutive and
// one/two-gap flops that still have straight potential), with Ace-low wheel
// handling so A-2-3 counts as connected.

export const FLOP_RANKS = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
export const FLOP_SUITS = ['♠','♥','♦','♣']; // ♠ ♥ ♦ ♣

export const BOARD_TEXTURES = [
  'Paired Flop',
  'Monotone Flop',
  'Wet / Dynamic Flop',
  'Two-tone Flop',
  'Connected Flop',
  'Dry / Static Flop',
];

function rankIdx(r) { return FLOP_RANKS.indexOf(r); }

function isConnected(cards) {
  const idxs = cards.map(c => rankIdx(c.rank)).sort((a, b) => a - b);
  if (idxs[2] - idxs[0] <= 4) return true;
  // Ace-low wheel: treat A as rank -1 when combined with small cards.
  if (idxs[2] === 12) {
    const low = [-1, idxs[0], idxs[1]].sort((a, b) => a - b);
    if (low[2] - low[0] <= 4) return true;
  }
  return false;
}

export function classifyFlop(cards) {
  if (!Array.isArray(cards) || cards.length !== 3) return null;
  for (const c of cards) {
    if (!c || !FLOP_RANKS.includes(c.rank) || !FLOP_SUITS.includes(c.suit)) return null;
  }
  const ranks = cards.map(c => c.rank);
  if (new Set(ranks).size < 3) return 'Paired Flop';
  const suits = new Set(cards.map(c => c.suit));
  if (suits.size === 1) return 'Monotone Flop';
  const connected = isConnected(cards);
  if (suits.size === 2) return connected ? 'Wet / Dynamic Flop' : 'Two-tone Flop';
  return connected ? 'Connected Flop' : 'Dry / Static Flop';
}

function randInt(n) { return Math.floor(Math.random() * n); }
function pick(arr) { return arr[randInt(arr.length)]; }

function sortByRank(cards) {
  return [...cards].sort((a, b) => rankIdx(a.rank) - rankIdx(b.rank));
}

function dedupeCards(cards) {
  const keys = new Set();
  for (const c of cards) {
    const k = c.rank + c.suit;
    if (keys.has(k)) return false;
    keys.add(k);
  }
  return true;
}

function make(rank, suit) { return { rank, suit }; }

function rollPairedFlop() {
  // Paired + rainbow + disconnected — keeps the pairing unambiguous.
  const pairRank = pick(FLOP_RANKS);
  const [s1, s2] = shufflePick(FLOP_SUITS, 2);
  let kickerRank;
  do {
    kickerRank = pick(FLOP_RANKS);
  } while (kickerRank === pairRank || Math.abs(rankIdx(kickerRank) - rankIdx(pairRank)) < 3);
  const remainingSuits = FLOP_SUITS.filter(s => s !== s1 && s !== s2);
  const kickerSuit = pick(remainingSuits);
  return [make(pairRank, s1), make(pairRank, s2), make(kickerRank, kickerSuit)];
}

function rollMonotoneFlop() {
  // All three same suit, distinct ranks, not connected (so classifier lands on monotone).
  const suit = pick(FLOP_SUITS);
  for (let i = 0; i < 40; i++) {
    const [a, b, c] = shufflePick(FLOP_RANKS, 3).map(r => make(r, suit));
    if (!isConnected([a, b, c])) return [a, b, c];
  }
  const [a, b, c] = shufflePick(FLOP_RANKS, 3).map(r => make(r, suit));
  return [a, b, c];
}

function rollWetFlop() {
  // Unpaired, two of one suit, connected ranks.
  for (let i = 0; i < 60; i++) {
    const [r1, r2, r3] = shufflePick(FLOP_RANKS, 3);
    const cards = [make(r1, '♠'), make(r2, '♠'), make(r3, '♥')];
    if (!isConnected(cards)) continue;
    if (classifyFlop(cards) === 'Wet / Dynamic Flop') return cards;
  }
  return [make('9', '♠'), make('8', '♠'), make('J', '♣')];
}

function rollTwoToneFlop() {
  // Unpaired, two of one suit, disconnected ranks.
  for (let i = 0; i < 60; i++) {
    const [r1, r2, r3] = shufflePick(FLOP_RANKS, 3);
    const cards = [make(r1, '♠'), make(r2, '♠'), make(r3, '♦')];
    if (classifyFlop(cards) === 'Two-tone Flop') return cards;
  }
  return [make('A', '♠'), make('9', '♠'), make('5', '♦')];
}

function rollConnectedFlop() {
  // Unpaired, three different suits, connected ranks.
  for (let i = 0; i < 80; i++) {
    const [r1, r2, r3] = shufflePick(FLOP_RANKS, 3);
    const suits = shufflePick(FLOP_SUITS, 3);
    const cards = [make(r1, suits[0]), make(r2, suits[1]), make(r3, suits[2])];
    if (classifyFlop(cards) === 'Connected Flop') return cards;
  }
  return [make('4', '♣'), make('6', '♦'), make('7', '♠')];
}

function rollDryFlop() {
  for (let i = 0; i < 80; i++) {
    const [r1, r2, r3] = shufflePick(FLOP_RANKS, 3);
    const suits = shufflePick(FLOP_SUITS, 3);
    const cards = [make(r1, suits[0]), make(r2, suits[1]), make(r3, suits[2])];
    if (classifyFlop(cards) === 'Dry / Static Flop') return cards;
  }
  return [make('K', '♣'), make('8', '♠'), make('3', '♦')];
}

function shufflePick(arr, n) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

const ROLLERS = {
  'Paired Flop': rollPairedFlop,
  'Monotone Flop': rollMonotoneFlop,
  'Wet / Dynamic Flop': rollWetFlop,
  'Two-tone Flop': rollTwoToneFlop,
  'Connected Flop': rollConnectedFlop,
  'Dry / Static Flop': rollDryFlop,
};

export function generateFlopForTexture(texture) {
  const roll = ROLLERS[texture];
  if (!roll) return null;
  for (let i = 0; i < 5; i++) {
    const cards = sortByRank(roll());
    if (!dedupeCards(cards)) continue;
    if (classifyFlop(cards) === texture) return cards;
  }
  // Fallback: the canonical example in the terms.js definitions.
  return sortByRank(roll());
}

// Build a full quiz deck: one question per texture (randomized order),
// repeating cyclically if length exceeds BOARD_TEXTURES.length.
export function buildFlopDeck(length) {
  const order = shufflePick(BOARD_TEXTURES, BOARD_TEXTURES.length);
  const deck = [];
  let i = 0;
  while (deck.length < length) {
    const texture = order[i % order.length];
    const cards = generateFlopForTexture(texture);
    deck.push({ cards, texture });
    i++;
    if (i % order.length === 0) {
      // Reshuffle each cycle so repeats don't line up in the same order.
      const next = shufflePick(BOARD_TEXTURES, BOARD_TEXTURES.length);
      for (let j = 0; j < order.length; j++) order[j] = next[j];
    }
  }
  return deck;
}
