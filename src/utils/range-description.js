// Convert a Set of poker hands (e.g. {'AA','KK','AKs','A5s','AKo'}) into
// a memorization-friendly natural-language description that groups hands
// into recognizable poker categories (pairs, broadways, wheel aces,
// suited connectors, one-gappers, etc.).

const RANK_ORDER = ['A','K','Q','J','T','9','8','7','6','5','4','3','2'];
const RANK_IDX = Object.fromEntries(RANK_ORDER.map((r, i) => [r, i]));
const BROADWAY = new Set(['A','K','Q','J','T']);

// Collapse a sorted (highest-kicker-first) list of hands sharing one top card
// into prose like "ATs+", "K9s–K5s", or "97s, 75s".
//   topPlusKicker: which kicker triggers the "+" notation (e.g. 'K' for Axs).
function compactRun(hands, isPair, topPlusKicker) {
  if (hands.length === 0) return '';
  const runs = [];
  let cur = [hands[0]];
  for (let i = 1; i < hands.length; i++) {
    const prevK = isPair ? hands[i - 1][0] : hands[i - 1][1];
    const nextK = isPair ? hands[i][0] : hands[i][1];
    if (RANK_IDX[nextK] === RANK_IDX[prevK] + 1) cur.push(hands[i]);
    else { runs.push(cur); cur = [hands[i]]; }
  }
  runs.push(cur);

  return runs.map((run, idx) => {
    if (run.length === 1) return run[0];
    const firstK = isPair ? run[0][0] : run[0][1];
    if (idx === 0 && firstK === topPlusKicker) return `${run[run.length - 1]}+`;
    return `${run[0]}–${run[run.length - 1]}`;
  }).join(', ');
}

function joinList(items, conj = 'and') {
  const xs = items.filter(Boolean);
  if (xs.length === 0) return '';
  if (xs.length === 1) return xs[0];
  if (xs.length === 2) return `${xs[0]} ${conj} ${xs[1]}`;
  return `${xs.slice(0, -1).join(', ')}, ${conj} ${xs[xs.length - 1]}`;
}

// --- bucket builders -------------------------------------------------------

function pairsClause(pairs) {
  if (pairs.length === 0) return null;
  if (pairs.length === 13) return 'all pairs';
  const sorted = [...pairs].sort((a, b) => RANK_IDX[a[0]] - RANK_IDX[b[0]]);
  return `pairs ${compactRun(sorted, true, 'A')}`;
}

function axsClause(axs) {
  if (axs.length === 0) return null;
  const sorted = [...axs].sort((a, b) => RANK_IDX[a[1]] - RANK_IDX[b[1]]);
  const top = sorted.filter(h => RANK_IDX[h[1]] <= RANK_IDX['T']); // AKs..ATs
  const mid = sorted.filter(h => RANK_IDX[h[1]] > RANK_IDX['T'] && RANK_IDX[h[1]] < RANK_IDX['5']); // A9s..A6s
  const wheel = sorted.filter(h => RANK_IDX[h[1]] >= RANK_IDX['5']); // A5s..A2s

  if (sorted.length === 12) return 'every suited ace';

  const parts = [];
  if (top.length) parts.push(`suited aces ${compactRun(top, false, 'K')}`);
  if (mid.length) parts.push(compactRun(mid, false, 'K'));
  if (wheel.length === 4) parts.push('the wheel suited aces (A5s–A2s)');
  else if (wheel.length) parts.push(`wheel ${compactRun(wheel, false, 'K')}`);
  return joinList(parts, 'plus');
}

function suitedBroadwaysClause(suitedByTop) {
  const broad = ['K', 'Q', 'J'].flatMap(t =>
    (suitedByTop[t] || []).filter(h => BROADWAY.has(h[1]))
  );
  if (broad.length === 0) return null;
  if (broad.length === 6) return 'all suited broadways (KQs–JTs)';

  const parts = [];
  for (const t of ['K', 'Q', 'J']) {
    const list = (suitedByTop[t] || []).filter(h => BROADWAY.has(h[1]))
      .sort((a, b) => RANK_IDX[a[1]] - RANK_IDX[b[1]]);
    if (list.length === 0) continue;
    parts.push(compactRun(list, false, { K: 'Q', Q: 'J', J: 'T' }[t]));
  }
  return `suited broadways ${parts.join(', ')}`;
}

// Suited high-card hands with one broadway + one non-broadway kicker
// (K9s–K2s, Q9s–Q2s, J9s–J2s). T-top hands belong in connectors below.
function suitedHighNonBroadwayClause(suitedByTop) {
  const parts = [];
  for (const t of ['K', 'Q', 'J']) {
    const list = (suitedByTop[t] || [])
      .filter(h => !BROADWAY.has(h[1]))
      .sort((a, b) => RANK_IDX[a[1]] - RANK_IDX[b[1]]);
    if (list.length === 0) continue;
    parts.push(compactRun(list, false, '9'));
  }
  if (parts.length === 0) return null;
  return `suited ${parts.join(', ')}`;
}

// Suited connectors / gappers — hands whose top card is T or lower
// (T9s, 98s, 87s, ... and their gap variants).
function suitedConnectorsClause(suitedByTop) {
  const lows = [];
  for (const t of RANK_ORDER) {
    if (t === 'A' || t === 'K' || t === 'Q' || t === 'J') continue;
    for (const h of suitedByTop[t] || []) lows.push(h);
  }
  if (lows.length === 0) return null;

  const byGap = { 0: [], 1: [], 2: [], 3: [] };
  for (const h of lows) {
    const gap = RANK_IDX[h[1]] - RANK_IDX[h[0]] - 1;
    if (gap >= 0 && gap <= 3) byGap[gap].push(h);
  }
  // Sort each by top rank descending (98s first, 32s last).
  for (const g of [0, 1, 2, 3]) {
    byGap[g].sort((a, b) => RANK_IDX[a[0]] - RANK_IDX[b[0]]);
  }

  const labels = { 0: 'suited connectors', 1: 'one-gappers', 2: 'two-gappers', 3: 'three-gappers' };
  const parts = [];
  for (const g of [0, 1, 2, 3]) {
    const list = byGap[g];
    if (list.length === 0) continue;
    if (list.length === 1) {
      parts.push(`${labels[g]} ${list[0]}`);
    } else {
      // Try to express as a contiguous "98s–54s" if tops form a run.
      const tops = list.map(h => RANK_IDX[h[0]]);
      let contiguous = true;
      for (let i = 1; i < tops.length; i++) if (tops[i] !== tops[i - 1] + 1) { contiguous = false; break; }
      if (contiguous) parts.push(`${labels[g]} ${list[0]}–${list[list.length - 1]}`);
      else parts.push(`${labels[g]} ${list.join(', ')}`);
    }
  }
  return joinList(parts, 'plus');
}

function axoClause(axo) {
  if (axo.length === 0) return null;
  const sorted = [...axo].sort((a, b) => RANK_IDX[a[1]] - RANK_IDX[b[1]]);
  if (sorted.length === 12) return 'every offsuit ace';
  const strong = sorted.filter(h => RANK_IDX[h[1]] <= RANK_IDX['T']);
  const weak = sorted.filter(h => RANK_IDX[h[1]] > RANK_IDX['T']);

  const parts = [];
  if (strong.length) parts.push(`offsuit aces ${compactRun(strong, false, 'K')}`);
  if (weak.length) parts.push(`weak offsuit aces ${compactRun(weak, false, '9')}`);
  return joinList(parts, 'plus');
}

function offsuitBroadwaysClause(offsuitByTop) {
  const broad = ['K', 'Q', 'J'].flatMap(t =>
    (offsuitByTop[t] || []).filter(h => BROADWAY.has(h[1]))
  );
  if (broad.length === 0) return null;
  if (broad.length === 6) return 'all offsuit broadways (KQo–JTo)';

  const parts = [];
  for (const t of ['K', 'Q', 'J']) {
    const list = (offsuitByTop[t] || []).filter(h => BROADWAY.has(h[1]))
      .sort((a, b) => RANK_IDX[a[1]] - RANK_IDX[b[1]]);
    if (list.length === 0) continue;
    parts.push(compactRun(list, false, { K: 'Q', Q: 'J', J: 'T' }[t]));
  }
  return `offsuit broadways ${parts.join(', ')}`;
}

function offsuitHighNonBroadwayClause(offsuitByTop) {
  const parts = [];
  for (const t of ['K', 'Q', 'J']) {
    const list = (offsuitByTop[t] || [])
      .filter(h => !BROADWAY.has(h[1]))
      .sort((a, b) => RANK_IDX[a[1]] - RANK_IDX[b[1]]);
    if (list.length === 0) continue;
    parts.push(compactRun(list, false, '9'));
  }
  if (parts.length === 0) return null;
  return `offsuit ${parts.join(', ')}`;
}

function offsuitConnectorsClause(offsuitByTop) {
  const lows = [];
  for (const t of RANK_ORDER) {
    if (t === 'A' || t === 'K' || t === 'Q' || t === 'J') continue;
    for (const h of offsuitByTop[t] || []) lows.push(h);
  }
  if (lows.length === 0) return null;

  const byGap = { 0: [], 1: [], 2: [], 3: [] };
  for (const h of lows) {
    const gap = RANK_IDX[h[1]] - RANK_IDX[h[0]] - 1;
    if (gap >= 0 && gap <= 3) byGap[gap].push(h);
  }
  for (const g of [0, 1, 2, 3]) {
    byGap[g].sort((a, b) => RANK_IDX[a[0]] - RANK_IDX[b[0]]);
  }

  const labels = { 0: 'offsuit connectors', 1: 'offsuit one-gappers', 2: 'offsuit two-gappers', 3: 'offsuit three-gappers' };
  const parts = [];
  for (const g of [0, 1, 2, 3]) {
    const list = byGap[g];
    if (list.length === 0) continue;
    if (list.length === 1) { parts.push(`${labels[g]} ${list[0]}`); continue; }
    const tops = list.map(h => RANK_IDX[h[0]]);
    let contiguous = true;
    for (let i = 1; i < tops.length; i++) if (tops[i] !== tops[i - 1] + 1) { contiguous = false; break; }
    parts.push(contiguous
      ? `${labels[g]} ${list[0]}–${list[list.length - 1]}`
      : `${labels[g]} ${list.join(', ')}`);
  }
  return joinList(parts, 'plus');
}

// --- public API ------------------------------------------------------------

export function describeHands(handsSet) {
  if (!handsSet || handsSet.size === 0) return 'nothing';

  const pairs = [];
  const suited = {};
  const offsuit = {};
  for (const h of handsSet) {
    if (h.length === 2) pairs.push(h);
    else if (h.endsWith('s')) (suited[h[0]] = suited[h[0]] || []).push(h);
    else if (h.endsWith('o')) (offsuit[h[0]] = offsuit[h[0]] || []).push(h);
  }

  const clauses = [
    pairsClause(pairs),
    axsClause(suited['A'] || []),
    suitedBroadwaysClause(suited),
    suitedHighNonBroadwayClause(suited),
    suitedConnectorsClause(suited),
    axoClause(offsuit['A'] || []),
    offsuitBroadwaysClause(offsuit),
    offsuitHighNonBroadwayClause(offsuit),
    offsuitConnectorsClause(offsuit),
  ].filter(Boolean);

  if (clauses.length === 0) return 'nothing';
  return clauses.join('; ');
}

export function describeRfi(rangeSet) {
  return `Open ${describeHands(rangeSet)}. Fold everything else.`;
}

export function describeLimp(rangeSet, heroIsBB) {
  const callVerb = heroIsBB ? 'Check behind with' : 'Call behind with';
  return `Iso-raise ${describeHands(rangeSet.raise)}. ${callVerb} ${describeHands(rangeSet.call)}. Fold the rest.`;
}

export function describeVsRaise(rangeSet) {
  return `3-bet ${describeHands(rangeSet.threebet)}. Flat-call ${describeHands(rangeSet.call)}. Fold the rest.`;
}
