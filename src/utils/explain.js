// Short GTO-flavored rationale for a preflop quiz answer.
// Combines a hand-feature description with an action rationale that
// contrasts the correct choice against the alternatives the quiz offered.

const RV = { A: 14, K: 13, Q: 12, J: 11, T: 10, 9: 9, 8: 8, 7: 7, 6: 6, 5: 5, 4: 4, 3: 3, 2: 2 };

export function handFeatures(hand) {
  const isPair = hand.length === 2;
  const isSuited = hand.endsWith('s');
  const r1 = hand[0];
  const r2 = hand[1];
  const hi = Math.max(RV[r1], RV[r2]);
  const lo = Math.min(RV[r1], RV[r2]);
  const gap = isPair ? 0 : hi - lo - 1;
  return {
    isPair,
    isSuited,
    isOffsuit: !isPair && !isSuited,
    hi,
    lo,
    gap,
    isPremiumPair: isPair && lo >= 10,         // TT+
    isMidPair:     isPair && lo >= 7 && lo <= 9, // 77–99
    isSmallPair:   isPair && lo <= 6,            // 22–66
    isBroadway:    !isPair && hi >= 10 && lo >= 10,
    isAx:          !isPair && hi === 14,
    isWheelAx:     !isPair && hi === 14 && lo <= 5,
    isKx:          !isPair && hi === 13,
    isConnector:   !isPair && gap === 0,
    isOneGapper:   !isPair && gap === 1,
  };
}

export function handDescriptor(hand) {
  const f = handFeatures(hand);
  if (f.isPremiumPair) return 'Premium pair dominates almost every opening range';
  if (f.isMidPair)     return 'Mid pair flops a set ~12% with solid showdown value';
  if (f.isSmallPair)   return 'Small pair flops a set ~12% but needs implied odds';
  if (f.isAx && f.isSuited && f.lo >= 10) return 'Suited big ace — top-pair equity plus nut-flush outs (~6.5%)';
  if (f.isWheelAx && f.isSuited)          return 'Suited wheel ace — ~6.5% flush plus wheel-straight outs and an ace blocker';
  if (f.isAx && f.isSuited)               return 'Suited ace — ~6.5% flush potential and an ace blocker';
  if (f.isAx && f.lo >= 10)               return 'Offsuit big ace — strong top-pair hand but no flush outs';
  if (f.isAx)                             return 'Offsuit small ace — easily dominated post-flop';
  if (f.isBroadway && f.isSuited)         return 'Suited Broadway — top-pair equity stacked with flush + straight draws';
  if (f.isBroadway)                       return 'Offsuit Broadway — top-pair and straight equity but no flush outs';
  if (f.isKx && f.isSuited)               return 'Suited king — ~6.5% flush plus second-nut potential';
  if (f.isConnector && f.isSuited)        return 'Suited connector — ~6.5% flush plus open-ended straight coverage';
  if (f.isOneGapper && f.isSuited)        return 'Suited one-gapper — flush outs plus inside-straight coverage';
  if (f.isSuited)                         return 'Suited — ~6.5% flush probability with backdoor straight potential';
  if (f.isConnector)                      return 'Offsuit connector — straight coverage only, no flush outs';
  return 'Offsuit holding with limited flush and straight equity';
}

const EP  = new Set(['UTG', 'HJ']);
const LP  = new Set(['CO', 'BTN']);

function posBucket(pos) {
  if (EP.has(pos)) return 'ep';
  if (LP.has(pos)) return 'lp';
  return 'blind';
}

function stackNote(stack) {
  if (stack === '25BB') return ' at 25BB, where speculative hands can\'t realize equity';
  if (stack === '33BB') return ' at 33BB, where implied odds shrink';
  return '';
}

export function actionRationale(q) {
  const { type, heroPos, villainPos, stackDepth, correctAction } = q;
  const bucket = posBucket(heroPos);
  const stack = stackNote(stackDepth);

  if (type === 'rfi') {
    if (correctAction === 'raise') {
      if (bucket === 'ep')    return `strong enough to open from ${heroPos} with players left to act; folding passes up clear +EV`;
      if (bucket === 'lp')    return `${heroPos} has position and fold equity on the blinds — raising prints, folding is too tight`;
      return `from ${heroPos} you can steal or set mine wide — raising beats folding here`;
    }
    if (bucket === 'ep')   return `too thin to open from ${heroPos}${stack} — raising gets 3-bet or flatted by better`;
    if (bucket === 'lp')   return `below ${heroPos}'s threshold${stack} — raising bleeds when blinds wake up`;
    return `not strong enough to steal from ${heroPos}${stack} — folding preserves chips`;
  }

  if (type === 'limp') {
    if (correctAction === 'raise') {
      return `iso-raise to punish the ${villainPos} limp and deny equity; over-limping is passive and folding wastes a range edge`;
    }
    if (correctAction === 'call') {
      return `over-limp for pot odds — iso-raising gets 3-bet or called by better, folding passes up cheap equity`;
    }
    return `too dominated to iso and too weak to call profitably vs ${villainPos}'s limping range — fold`;
  }

  if (type === 'vsRaise') {
    if (correctAction === 'threebet') {
      return `3-bet for value and fold equity vs ${villainPos}'s open; flatting lets them realize, folding spills a +EV spot`;
    }
    if (correctAction === 'call') {
      return `flat to realize equity with pot odds; 3-betting folds out worse and gets called by better, folding is too tight`;
    }
    return `dominated by ${villainPos}'s opening range${stack} — calling bleeds postflop, 3-bet is pure bluff`;
  }

  return '';
}

export function explainQuestion(q) {
  if (!q) return '';
  return `${handDescriptor(q.hand)} — ${actionRationale(q)}.`;
}
