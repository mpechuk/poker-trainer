// Convert a Set of poker hands (e.g. {'AA','KK','AKs','A5s','AKo'}) to a
// compact human-readable description using standard poker "+" / dash notation.
// Handles pairs, suited (s), and offsuit (o) groupings.

const RANK_ORDER = ['A','K','Q','J','T','9','8','7','6','5','4','3','2'];
const RANK_IDX = Object.fromEntries(RANK_ORDER.map((r, i) => [r, i]));

function formatGroup(hands, isPair) {
  if (hands.length === 0) return '';

  const runs = [];
  let cur = [hands[0]];
  for (let i = 1; i < hands.length; i++) {
    const prev = hands[i - 1];
    const next = hands[i];
    const prevKicker = isPair ? prev[0] : prev[1];
    const nextKicker = isPair ? next[0] : next[1];
    if (RANK_IDX[nextKicker] === RANK_IDX[prevKicker] + 1) {
      cur.push(next);
    } else {
      runs.push(cur);
      cur = [next];
    }
  }
  runs.push(cur);

  return runs.map((run, idx) => {
    if (run.length === 1) return run[0];
    if (idx === 0) {
      const first = run[0];
      const topKicker = isPair ? 'A' : 'K';
      const firstKicker = isPair ? first[0] : first[1];
      if (firstKicker === topKicker) {
        return `${run[run.length - 1]}+`;
      }
    }
    return `${run[0]}–${run[run.length - 1]}`;
  }).join(', ');
}

export function describeHands(handsSet) {
  if (!handsSet || handsSet.size === 0) return 'none';

  const pairs = [];
  const suited = {};
  const offsuit = {};

  for (const h of handsSet) {
    if (h.length === 2) {
      pairs.push(h);
    } else if (h.endsWith('s')) {
      const t = h[0];
      (suited[t] = suited[t] || []).push(h);
    } else if (h.endsWith('o')) {
      const t = h[0];
      (offsuit[t] = offsuit[t] || []).push(h);
    }
  }

  pairs.sort((a, b) => RANK_IDX[a[0]] - RANK_IDX[b[0]]);
  for (const t in suited) suited[t].sort((a, b) => RANK_IDX[a[1]] - RANK_IDX[b[1]]);
  for (const t in offsuit) offsuit[t].sort((a, b) => RANK_IDX[a[1]] - RANK_IDX[b[1]]);

  const sections = [];
  if (pairs.length > 0) sections.push(formatGroup(pairs, true));
  for (const t of RANK_ORDER) {
    if (suited[t]) sections.push(formatGroup(suited[t], false));
  }
  for (const t of RANK_ORDER) {
    if (offsuit[t]) sections.push(formatGroup(offsuit[t], false));
  }

  return sections.join('; ');
}

export function describeRfi(rangeSet) {
  return `Open-raise ${describeHands(rangeSet)}; fold everything else.`;
}

export function describeLimp(rangeSet, heroIsBB) {
  const raise = describeHands(rangeSet.raise);
  const call = describeHands(rangeSet.call);
  const callVerb = heroIsBB ? 'Check' : 'Call';
  return `Iso-raise ${raise}. ${callVerb} behind with ${call}. Fold everything else.`;
}

export function describeVsRaise(rangeSet) {
  const threebet = describeHands(rangeSet.threebet);
  const call = describeHands(rangeSet.call);
  return `3-bet ${threebet}. Flat-call ${call}. Fold everything else.`;
}
