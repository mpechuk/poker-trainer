// Preflop ranges for vs-Limp and vs-Raise scenarios (6-max, GTO-approximate)
// LIMP_RANGES[stackDepth][heroPos][villainPos] = { raise: Set, call: Set }
//   raise = ISO raise; call = limp behind (or check for BB); fold = everything else
// VS_RAISE_RANGES[stackDepth][heroPos][villainPos] = { threebet: Set, call: Set }
//   fold = everything else

export const LIMP_HERO_POSITIONS = ['HJ','CO','BTN','SB','BB'];
export const RAISE_HERO_POSITIONS = ['HJ','CO','BTN','SB','BB'];

// Valid villain positions for each hero (hero must be to villain's left / in blinds)
export const VALID_LIMP_VILLAINS = {
  HJ:  ['UTG'],
  CO:  ['UTG','HJ'],
  BTN: ['UTG','HJ','CO'],
  SB:  ['UTG','HJ','CO','BTN'],
  BB:  ['UTG','HJ','CO','BTN','SB'],
};
export const VALID_RAISE_VILLAINS = {
  HJ:  ['UTG'],
  CO:  ['UTG','HJ'],
  BTN: ['UTG','HJ','CO'],
  SB:  ['UTG','HJ','CO','BTN'],
  BB:  ['UTG','HJ','CO','BTN','SB'],
};

function s(...hands) { return new Set(hands.flatMap(h => h.split(','))); }

// ---------------------------------------------------------------------------
// LIMP_RANGES
// ---------------------------------------------------------------------------
export const LIMP_RANGES = {
  '100BB': {
    HJ: {
      UTG: { raise: s('AA,KK,QQ,JJ,TT,AKs,AQs,AJs,ATs,A5s,A4s,KQs,KJs,QJs,JTs,AKo,AQo,AJo,KQo'), call: s('99,88,77,66,55,44,33,22,A9s,A8s,A7s,A6s,A3s,A2s,KTs,K9s,K8s,QTs,Q9s,J9s,T9s,T8s,98s,97s,87s,86s,76s,75s,65s,64s,54s,ATo,KJo,KTo,QJo,QTo') },
    },
    CO: {
      UTG: { raise: s('AA,KK,QQ,JJ,TT,AKs,AQs,AJs,ATs,A5s,A4s,KQs,KJs,KTs,QJs,JTs,T9s,AKo,AQo,AJo,KQo,KJo'), call: s('99,88,77,66,55,44,33,22,A9s,A8s,A7s,A6s,A3s,A2s,K9s,K8s,QTs,Q9s,J9s,98s,97s,87s,86s,76s,75s,65s,64s,54s,43s,ATo,KTo,QJo,QTo,JTo') },
      HJ:  { raise: s('AA,KK,QQ,JJ,TT,99,AKs,AQs,AJs,ATs,A5s,A4s,KQs,KJs,KTs,QJs,QTs,JTs,T9s,AKo,AQo,AJo,ATo,KQo,KJo,QJo'), call: s('88,77,66,55,44,33,22,A9s,A8s,A7s,A6s,A3s,A2s,K9s,K8s,Q9s,J9s,98s,97s,87s,86s,76s,75s,65s,64s,54s,43s,KTo,QTo,JTo') },
    },
    BTN: {
      UTG: { raise: s('AA,KK,QQ,JJ,TT,99,88,AKs,AQs,AJs,ATs,A9s,A5s,A4s,A3s,KQs,KJs,KTs,QJs,QTs,JTs,T9s,98s,AKo,AQo,AJo,ATo,KQo,KJo,QJo,QTo,JTo'), call: s('77,66,55,44,33,22,A8s,A7s,A6s,A2s,K9s,K8s,Q9s,J9s,J8s,T8s,97s,87s,86s,76s,75s,65s,64s,54s,53s,43s,A9o,KTo,K9o,Q9o,J9o,T9o') },
      HJ:  { raise: s('AA,KK,QQ,JJ,TT,99,88,AKs,AQs,AJs,ATs,A9s,A5s,A4s,A3s,KQs,KJs,KTs,QJs,QTs,JTs,J9s,T9s,98s,87s,AKo,AQo,AJo,ATo,KQo,KJo,QJo,QTo,JTo'), call: s('77,66,55,44,33,22,A8s,A7s,A6s,A2s,K9s,K8s,Q9s,T8s,97s,76s,75s,65s,64s,54s,43s,A9o,KTo,K9o,Q9o') },
      CO:  { raise: s('AA,KK,QQ,JJ,TT,99,88,77,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQs,KJs,KTs,K9s,K8s,QJs,QTs,Q9s,Q8s,JTs,J9s,J8s,T9s,T8s,98s,97s,87s,86s,76s,75s,65s,AKo,AQo,AJo,ATo,A9o,KQo,KJo,KTo,QJo,QTo,JTo,T9o'), call: s('66,55,44,33,22,K7s,K6s,Q7s,J7s,T7s,96s,85s,74s,64s,54s,53s,43s,A8o,A7o,A6o,K9o,K8o,Q9o,J9o,98o') },
    },
    SB: {
      UTG: { raise: s('AA,KK,QQ,JJ,TT,AKs,AQs,AJs,ATs,A5s,A4s,KQs,KJs,QJs,JTs,AKo,AQo,AJo,KQo'), call: s('99,88,77,66,55,44,33,22,A9s,A8s,A7s,A6s,A3s,A2s,KTs,K9s,K8s,QTs,Q9s,J9s,T9s,T8s,98s,97s,87s,86s,76s,75s,65s,ATo,KJo,KTo,QJo') },
      HJ:  { raise: s('AA,KK,QQ,JJ,TT,AKs,AQs,AJs,ATs,A5s,A4s,A3s,KQs,KJs,KTs,QJs,JTs,T9s,AKo,AQo,AJo,KQo,KJo'), call: s('99,88,77,66,55,44,33,22,A9s,A8s,A7s,A6s,A2s,K9s,K8s,QTs,Q9s,J9s,98s,97s,87s,86s,76s,75s,65s,ATo,KTo,QJo') },
      CO:  { raise: s('AA,KK,QQ,JJ,TT,99,AKs,AQs,AJs,ATs,A5s,A4s,A3s,KQs,KJs,KTs,QJs,QTs,JTs,T9s,AKo,AQo,AJo,ATo,KQo,KJo,QJo'), call: s('88,77,66,55,44,33,22,A9s,A8s,A7s,A6s,A2s,K9s,K8s,Q9s,J9s,98s,97s,87s,86s,76s,75s,65s,54s,KTo,QTo,Q9o') },
      BTN: { raise: s('AA,KK,QQ,JJ,TT,99,AKs,AQs,AJs,ATs,A9s,A5s,A4s,A3s,A2s,KQs,KJs,KTs,K9s,QJs,QTs,JTs,T9s,98s,87s,AKo,AQo,AJo,ATo,A9o,KQo,KJo,QJo,QTo,JTo'), call: s('88,77,66,55,44,33,22,A8s,A7s,A6s,K8s,Q9s,J9s,J8s,T8s,97s,76s,75s,65s,64s,54s,53s,K9o,K8o,Q9o,J9o,T9o') },
    },
    BB: {
      UTG: { raise: s('AA,KK,QQ,JJ,TT,AKs,AQs,AJs,ATs,A5s,A4s,KQs,KJs,QJs,JTs,AKo,AQo,AJo,KQo'), call: s('99,88,77,66,55,44,33,22,A9s,A8s,A7s,A6s,A3s,A2s,KTs,K9s,K8s,QTs,Q9s,J9s,T9s,T8s,98s,97s,87s,86s,76s,75s,65s,64s,54s,53s,43s,32s,ATo,A9o,KJo,KTo,K9o,QJo,QTo,Q9o,JTo,J9o,T9o,98o,87o,76o,65o') },
      HJ:  { raise: s('AA,KK,QQ,JJ,TT,99,AKs,AQs,AJs,ATs,A5s,A4s,A3s,KQs,KJs,KTs,QJs,JTs,AKo,AQo,AJo,KQo,KJo'), call: s('88,77,66,55,44,33,22,A9s,A8s,A7s,A6s,A2s,K9s,K8s,QTs,Q9s,J9s,T9s,T8s,98s,97s,87s,86s,76s,75s,65s,64s,54s,43s,32s,ATo,A9o,KTo,K9o,QJo,QTo,Q9o,JTo,J9o,T9o,98o,87o,76o') },
      CO:  { raise: s('AA,KK,QQ,JJ,TT,99,AKs,AQs,AJs,ATs,A5s,A4s,A3s,KQs,KJs,KTs,QJs,QTs,JTs,T9s,AKo,AQo,AJo,ATo,KQo,KJo,QJo'), call: s('88,77,66,55,44,33,22,A9s,A8s,A7s,A6s,A2s,K9s,K8s,Q9s,J9s,J8s,T8s,98s,97s,87s,86s,76s,75s,65s,64s,54s,43s,32s,A9o,K9o,KTo,Q9o,QTo,JTo,J9o,T9o,98o,87o,76o,65o') },
      BTN: { raise: s('AA,KK,QQ,JJ,TT,99,88,77,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQs,KJs,KTs,K9s,QJs,QTs,Q9s,JTs,J9s,T9s,T8s,98s,87s,76s,AKo,AQo,AJo,ATo,A9o,A8o,KQo,KJo,KTo,QJo,QTo,JTo,T9o,98o'), call: s('66,55,44,33,22,K8s,K7s,Q8s,J8s,T7s,97s,86s,75s,65s,64s,54s,53s,43s,A7o,A6o,A5o,K9o,K8o,Q9o,Q8o,J9o,J8o,T8o,97o,87o,86o,76o,75o,65o') },
      SB:  { raise: s('AA,KK,QQ,JJ,TT,99,88,77,66,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQs,KJs,KTs,K9s,K8s,QJs,QTs,Q9s,JTs,J9s,T9s,T8s,98s,97s,87s,76s,AKo,AQo,AJo,ATo,A9o,A8o,A7o,KQo,KJo,KTo,K9o,QJo,QTo,Q9o,JTo,T9o,98o,87o,76o'), call: s('55,44,33,22,K7s,K6s,Q8s,Q7s,J8s,J7s,T7s,96s,86s,75s,74s,65s,64s,54s,53s,43s,A6o,A5o,A4o,K8o,Q8o,J9o,J8o,T8o,97o,86o,75o,65o') },
    },
  },

  '50BB': {
    HJ: {
      UTG: { raise: s('AA,KK,QQ,JJ,TT,AKs,AQs,AJs,ATs,A5s,A4s,KQs,KJs,QJs,JTs,AKo,AQo,AJo,KQo'), call: s('99,88,77,66,55,44,A9s,A8s,A7s,A6s,A3s,A2s,KTs,K9s,QTs,Q9s,J9s,T9s,T8s,98s,87s,76s,65s,ATo,KJo,KTo,QJo') },
    },
    CO: {
      UTG: { raise: s('AA,KK,QQ,JJ,TT,AKs,AQs,AJs,ATs,A5s,A4s,KQs,KJs,KTs,QJs,JTs,AKo,AQo,AJo,KQo'), call: s('99,88,77,66,55,44,A9s,A8s,A7s,A6s,A3s,A2s,K9s,QTs,Q9s,J9s,98s,87s,76s,65s,ATo,QJo,QTo,JTo') },
      HJ:  { raise: s('AA,KK,QQ,JJ,TT,99,AKs,AQs,AJs,ATs,A5s,A4s,KQs,KJs,KTs,QJs,QTs,JTs,T9s,AKo,AQo,AJo,ATo,KQo,KJo,QJo'), call: s('88,77,66,55,44,A9s,A8s,A7s,A6s,A3s,A2s,K9s,Q9s,J9s,98s,87s,76s,65s,KTo,QTo') },
    },
    BTN: {
      UTG: { raise: s('AA,KK,QQ,JJ,TT,99,88,77,AKs,AQs,AJs,ATs,A9s,A5s,A4s,A3s,KQs,KJs,KTs,QJs,QTs,JTs,T9s,98s,AKo,AQo,AJo,ATo,KQo,KJo,QJo,QTo,JTo'), call: s('66,55,44,A8s,A7s,A6s,A2s,K9s,Q9s,J9s,T8s,87s,76s,65s,A9o,KTo,K9o,Q9o,J9o') },
      HJ:  { raise: s('AA,KK,QQ,JJ,TT,99,88,77,AKs,AQs,AJs,ATs,A9s,A5s,A4s,A3s,KQs,KJs,KTs,QJs,QTs,JTs,J9s,T9s,98s,87s,AKo,AQo,AJo,ATo,KQo,KJo,QJo,QTo,JTo'), call: s('66,55,44,A8s,A7s,A6s,A2s,K9s,Q9s,76s,65s,A9o,KTo,K9o') },
      CO:  { raise: s('AA,KK,QQ,JJ,TT,99,88,77,66,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQs,KJs,KTs,K9s,QJs,QTs,Q9s,JTs,J9s,T9s,T8s,98s,97s,87s,76s,65s,AKo,AQo,AJo,ATo,A9o,KQo,KJo,KTo,QJo,QTo,JTo,T9o'), call: s('55,44,K8s,Q8s,J8s,86s,75s,64s,A8o,A7o,K9o,K8o,Q9o,J9o') },
    },
    SB: {
      UTG: { raise: s('AA,KK,QQ,JJ,TT,AKs,AQs,AJs,ATs,A5s,A4s,KQs,KJs,QJs,JTs,AKo,AQo,AJo,KQo'), call: s('99,88,77,66,55,44,A9s,A8s,A7s,A6s,A3s,A2s,KTs,K9s,QTs,Q9s,J9s,T9s,98s,87s,76s,65s,ATo,KJo,KTo,QJo') },
      HJ:  { raise: s('AA,KK,QQ,JJ,TT,AKs,AQs,AJs,ATs,A5s,A4s,A3s,KQs,KJs,KTs,QJs,JTs,T9s,AKo,AQo,AJo,KQo,KJo'), call: s('99,88,77,66,55,44,A9s,A8s,A7s,A6s,A2s,K9s,QTs,Q9s,J9s,98s,87s,76s,65s,ATo,KTo,QJo') },
      CO:  { raise: s('AA,KK,QQ,JJ,TT,99,AKs,AQs,AJs,ATs,A5s,A4s,A3s,KQs,KJs,KTs,QJs,QTs,JTs,T9s,AKo,AQo,AJo,ATo,KQo,KJo,QJo'), call: s('88,77,66,55,44,A9s,A8s,A7s,A6s,A2s,K9s,Q9s,J9s,98s,87s,76s,65s,KTo,QTo') },
      BTN: { raise: s('AA,KK,QQ,JJ,TT,99,AKs,AQs,AJs,ATs,A9s,A5s,A4s,A3s,A2s,KQs,KJs,KTs,K9s,QJs,QTs,JTs,T9s,98s,87s,AKo,AQo,AJo,ATo,A9o,KQo,KJo,QJo,QTo,JTo'), call: s('88,77,66,55,44,A8s,A7s,A6s,Q9s,J9s,76s,75s,65s,K9o,Q9o,J9o,T9o') },
    },
    BB: {
      UTG: { raise: s('AA,KK,QQ,JJ,TT,AKs,AQs,AJs,ATs,A5s,A4s,KQs,KJs,QJs,JTs,AKo,AQo,AJo,KQo'), call: s('99,88,77,66,55,44,A9s,A8s,A7s,A6s,A3s,A2s,KTs,K9s,QTs,Q9s,J9s,T9s,T8s,98s,87s,76s,65s,54s,43s,ATo,A9o,KJo,KTo,K9o,QJo,QTo,Q9o,JTo,J9o,T9o,98o,87o,76o') },
      HJ:  { raise: s('AA,KK,QQ,JJ,TT,99,AKs,AQs,AJs,ATs,A5s,A4s,A3s,KQs,KJs,KTs,QJs,JTs,AKo,AQo,AJo,KQo,KJo'), call: s('88,77,66,55,44,A9s,A8s,A7s,A6s,A2s,K9s,QTs,Q9s,J9s,T9s,T8s,98s,87s,76s,65s,54s,43s,ATo,A9o,KTo,K9o,QJo,QTo,Q9o,JTo,J9o,T9o,98o,87o') },
      CO:  { raise: s('AA,KK,QQ,JJ,TT,99,AKs,AQs,AJs,ATs,A5s,A4s,A3s,KQs,KJs,KTs,QJs,QTs,JTs,T9s,AKo,AQo,AJo,ATo,KQo,KJo,QJo'), call: s('88,77,66,55,44,A9s,A8s,A7s,A6s,A2s,K9s,Q9s,J9s,J8s,T8s,98s,87s,76s,65s,54s,A9o,K9o,KTo,Q9o,QTo,JTo,J9o,T9o,98o,87o') },
      BTN: { raise: s('AA,KK,QQ,JJ,TT,99,88,77,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQs,KJs,KTs,K9s,QJs,QTs,Q9s,JTs,J9s,T9s,T8s,98s,87s,76s,AKo,AQo,AJo,ATo,A9o,KQo,KJo,KTo,QJo,QTo,JTo,T9o'), call: s('66,55,44,K8s,Q8s,J8s,97s,86s,75s,65s,54s,A8o,A7o,K9o,K8o,Q9o,J9o,J8o,T8o,97o,87o,76o') },
      SB:  { raise: s('AA,KK,QQ,JJ,TT,99,88,77,66,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQs,KJs,KTs,K9s,QJs,QTs,Q9s,JTs,J9s,T9s,T8s,98s,97s,87s,76s,AKo,AQo,AJo,ATo,A9o,A8o,KQo,KJo,KTo,K9o,QJo,QTo,Q9o,JTo,T9o,98o,87o'), call: s('55,44,K8s,K7s,Q8s,J8s,T7s,96s,75s,74s,65s,64s,54s,53s,A7o,A6o,K8o,Q8o,J9o,J8o,T8o,97o,86o,75o,65o') },
    },
  },

  '33BB': {
    HJ: {
      UTG: { raise: s('AA,KK,QQ,JJ,TT,AKs,AQs,AJs,ATs,A5s,KQs,KJs,QJs,JTs,AKo,AQo,AJo,KQo'), call: s('99,88,77,66,55,A9s,A8s,A7s,A6s,A4s,A3s,KTs,K9s,QTs,Q9s,J9s,T9s,98s,87s,76s,65s,ATo,KJo,KTo') },
    },
    CO: {
      UTG: { raise: s('AA,KK,QQ,JJ,TT,AKs,AQs,AJs,ATs,A5s,KQs,KJs,KTs,QJs,JTs,AKo,AQo,AJo,KQo'), call: s('99,88,77,66,55,A9s,A8s,A7s,A6s,A4s,A3s,K9s,QTs,Q9s,J9s,98s,87s,76s,65s,ATo,QJo,JTo') },
      HJ:  { raise: s('AA,KK,QQ,JJ,TT,99,AKs,AQs,AJs,ATs,A5s,KQs,KJs,KTs,QJs,QTs,JTs,T9s,AKo,AQo,AJo,ATo,KQo,KJo,QJo'), call: s('88,77,66,55,A9s,A8s,A7s,A6s,A4s,A3s,K9s,Q9s,J9s,98s,87s,76s,65s,KTo') },
    },
    BTN: {
      UTG: { raise: s('AA,KK,QQ,JJ,TT,99,88,77,AKs,AQs,AJs,ATs,A9s,A5s,A4s,KQs,KJs,KTs,QJs,QTs,JTs,T9s,98s,AKo,AQo,AJo,ATo,KQo,KJo,QJo,QTo,JTo'), call: s('66,55,A8s,A7s,A6s,A3s,A2s,K9s,Q9s,J9s,87s,76s,65s,A9o,KTo,K9o') },
      HJ:  { raise: s('AA,KK,QQ,JJ,TT,99,88,77,AKs,AQs,AJs,ATs,A9s,A5s,A4s,KQs,KJs,KTs,QJs,QTs,JTs,J9s,T9s,98s,87s,AKo,AQo,AJo,ATo,KQo,KJo,QJo,QTo,JTo'), call: s('66,55,A8s,A7s,A6s,A3s,A2s,K9s,Q9s,76s,65s,A9o,KTo') },
      CO:  { raise: s('AA,KK,QQ,JJ,TT,99,88,77,66,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQs,KJs,KTs,K9s,QJs,QTs,Q9s,JTs,J9s,T9s,T8s,98s,87s,76s,65s,AKo,AQo,AJo,ATo,A9o,KQo,KJo,KTo,QJo,QTo,JTo,T9o'), call: s('55,K8s,Q8s,J8s,97s,75s,64s,A8o,A7o,K9o,K8o') },
    },
    SB: {
      UTG: { raise: s('AA,KK,QQ,JJ,TT,AKs,AQs,AJs,ATs,A5s,KQs,KJs,QJs,JTs,AKo,AQo,AJo,KQo'), call: s('99,88,77,66,55,A9s,A8s,A7s,A6s,A4s,A3s,KTs,K9s,QTs,Q9s,J9s,T9s,98s,87s,76s,65s,ATo,KJo,KTo') },
      HJ:  { raise: s('AA,KK,QQ,JJ,TT,AKs,AQs,AJs,ATs,A5s,A4s,KQs,KJs,KTs,QJs,JTs,T9s,AKo,AQo,AJo,KQo,KJo'), call: s('99,88,77,66,55,A9s,A8s,A7s,A6s,A3s,A2s,K9s,QTs,Q9s,J9s,98s,87s,76s,65s,ATo,KTo') },
      CO:  { raise: s('AA,KK,QQ,JJ,TT,99,AKs,AQs,AJs,ATs,A5s,A4s,KQs,KJs,KTs,QJs,QTs,JTs,T9s,AKo,AQo,AJo,ATo,KQo,KJo,QJo'), call: s('88,77,66,55,A9s,A8s,A7s,A6s,A3s,A2s,K9s,Q9s,J9s,98s,87s,76s,65s,KTo') },
      BTN: { raise: s('AA,KK,QQ,JJ,TT,99,AKs,AQs,AJs,ATs,A9s,A5s,A4s,A3s,A2s,KQs,KJs,KTs,K9s,QJs,QTs,JTs,T9s,98s,AKo,AQo,AJo,ATo,A9o,KQo,KJo,QJo,QTo,JTo'), call: s('88,77,66,55,A8s,A7s,A6s,Q9s,J9s,76s,65s,K9o,Q9o,J9o') },
    },
    BB: {
      UTG: { raise: s('AA,KK,QQ,JJ,TT,AKs,AQs,AJs,ATs,A5s,A4s,KQs,KJs,QJs,JTs,AKo,AQo,AJo,KQo'), call: s('99,88,77,66,55,A9s,A8s,A7s,A6s,A3s,A2s,KTs,K9s,QTs,Q9s,J9s,T9s,98s,87s,76s,65s,54s,43s,ATo,A9o,KJo,KTo,K9o,QJo,QTo,Q9o,JTo,J9o,T9o,98o,87o') },
      HJ:  { raise: s('AA,KK,QQ,JJ,TT,99,AKs,AQs,AJs,ATs,A5s,A4s,A3s,KQs,KJs,KTs,QJs,JTs,AKo,AQo,AJo,KQo,KJo'), call: s('88,77,66,55,A9s,A8s,A7s,A6s,A2s,K9s,QTs,Q9s,J9s,T9s,98s,87s,76s,65s,54s,ATo,A9o,KTo,K9o,QJo,QTo,Q9o,JTo,J9o,T9o,98o') },
      CO:  { raise: s('AA,KK,QQ,JJ,TT,99,AKs,AQs,AJs,ATs,A5s,A4s,A3s,KQs,KJs,KTs,QJs,QTs,JTs,T9s,AKo,AQo,AJo,ATo,KQo,KJo,QJo'), call: s('88,77,66,55,A9s,A8s,A7s,A6s,A2s,K9s,Q9s,J9s,98s,87s,76s,65s,54s,A9o,K9o,KTo,Q9o,JTo,J9o,T9o,98o') },
      BTN: { raise: s('AA,KK,QQ,JJ,TT,99,88,77,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQs,KJs,KTs,K9s,QJs,QTs,Q9s,JTs,J9s,T9s,T8s,98s,87s,76s,AKo,AQo,AJo,ATo,A9o,KQo,KJo,KTo,QJo,QTo,JTo,T9o'), call: s('66,55,K8s,Q8s,J8s,97s,86s,75s,65s,54s,A8o,K9o,K8o,Q9o,J9o,T8o,97o,87o') },
      SB:  { raise: s('AA,KK,QQ,JJ,TT,99,88,77,66,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQs,KJs,KTs,K9s,QJs,QTs,Q9s,JTs,J9s,T9s,T8s,98s,97s,87s,76s,AKo,AQo,AJo,ATo,A9o,A8o,KQo,KJo,KTo,K9o,QJo,QTo,Q9o,JTo,T9o,98o'), call: s('55,K8s,K7s,Q8s,J8s,T7s,96s,75s,65s,54s,A7o,A6o,K8o,Q8o,J9o,J8o,T8o,97o') },
    },
  },

  '25BB': {
    HJ: {
      UTG: { raise: s('AA,KK,QQ,JJ,TT,AKs,AQs,AJs,ATs,A5s,KQs,KJs,QJs,AKo,AQo,AJo,KQo'), call: s('99,88,77,66,A9s,A8s,A7s,KTs,K9s,QTs,J9s,T9s,98s,ATo,KTo') },
    },
    CO: {
      UTG: { raise: s('AA,KK,QQ,JJ,TT,AKs,AQs,AJs,ATs,A5s,KQs,KJs,KTs,QJs,JTs,AKo,AQo,AJo,KQo'), call: s('99,88,77,66,A9s,A8s,A7s,K9s,QTs,J9s,T9s,87s,76s,ATo,QJo') },
      HJ:  { raise: s('AA,KK,QQ,JJ,TT,99,AKs,AQs,AJs,ATs,A5s,KQs,KJs,KTs,QJs,QTs,JTs,T9s,AKo,AQo,AJo,ATo,KQo,KJo'), call: s('88,77,66,A9s,A8s,K9s,Q9s,J9s,87s,76s,KTo') },
    },
    BTN: {
      UTG: { raise: s('AA,KK,QQ,JJ,TT,99,88,AKs,AQs,AJs,ATs,A9s,A5s,A4s,KQs,KJs,KTs,QJs,QTs,JTs,T9s,AKo,AQo,AJo,ATo,KQo,KJo,QJo,JTo'), call: s('77,66,A8s,A7s,K9s,J9s,87s,76s,A9o,KTo') },
      HJ:  { raise: s('AA,KK,QQ,JJ,TT,99,88,AKs,AQs,AJs,ATs,A9s,A5s,A4s,KQs,KJs,KTs,QJs,QTs,JTs,J9s,T9s,98s,AKo,AQo,AJo,ATo,KQo,KJo,QJo,JTo'), call: s('77,66,A8s,A7s,K9s,Q9s,76s,65s,A9o,KTo') },
      CO:  { raise: s('AA,KK,QQ,JJ,TT,99,88,77,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,KQs,KJs,KTs,K9s,QJs,QTs,Q9s,JTs,J9s,T9s,98s,87s,76s,65s,AKo,AQo,AJo,ATo,A9o,KQo,KJo,KTo,QJo,QTo,JTo,T9o'), call: s('66,55,A2s,K8s,Q8s,J8s,T8s,97s,86s,75s,A8o,A7o,K9o') },
    },
    SB: {
      UTG: { raise: s('AA,KK,QQ,JJ,TT,AKs,AQs,AJs,ATs,A5s,KQs,KJs,QJs,JTs,AKo,AQo,AJo,KQo'), call: s('99,88,77,66,A9s,A8s,KTs,K9s,QTs,J9s,T9s,98s,87s,ATo,KJo,KTo') },
      HJ:  { raise: s('AA,KK,QQ,JJ,TT,AKs,AQs,AJs,ATs,A5s,A4s,KQs,KJs,KTs,QJs,JTs,T9s,AKo,AQo,AJo,KQo,KJo'), call: s('99,88,77,66,A9s,A8s,K9s,QTs,J9s,98s,87s,76s,ATo,KTo') },
      CO:  { raise: s('AA,KK,QQ,JJ,TT,99,AKs,AQs,AJs,ATs,A5s,A4s,KQs,KJs,KTs,QJs,QTs,JTs,T9s,AKo,AQo,AJo,ATo,KQo,KJo,QJo'), call: s('88,77,66,A9s,A8s,K9s,Q9s,J9s,98s,87s,76s,KTo') },
      BTN: { raise: s('AA,KK,QQ,JJ,TT,99,AKs,AQs,AJs,ATs,A9s,A5s,A4s,A3s,KQs,KJs,KTs,K9s,QJs,QTs,JTs,T9s,98s,AKo,AQo,AJo,ATo,A9o,KQo,KJo,QJo,QTo,JTo'), call: s('88,77,66,A8s,A7s,Q9s,J9s,76s,65s,K9o,Q9o') },
    },
    BB: {
      UTG: { raise: s('AA,KK,QQ,JJ,TT,AKs,AQs,AJs,ATs,A5s,A4s,KQs,KJs,QJs,JTs,AKo,AQo,AJo,KQo'), call: s('99,88,77,66,55,A9s,A8s,A7s,A6s,A3s,A2s,KTs,K9s,QTs,Q9s,J9s,T9s,98s,87s,76s,65s,54s,ATo,A9o,KJo,KTo,K9o,QJo,QTo,JTo,J9o,T9o,98o') },
      HJ:  { raise: s('AA,KK,QQ,JJ,TT,99,AKs,AQs,AJs,ATs,A5s,A4s,A3s,KQs,KJs,KTs,QJs,JTs,AKo,AQo,AJo,KQo,KJo'), call: s('88,77,66,55,A9s,A8s,A7s,A6s,A2s,K9s,QTs,Q9s,J9s,T9s,98s,87s,76s,65s,54s,ATo,A9o,KTo,K9o,QJo,QTo,JTo,J9o,T9o') },
      CO:  { raise: s('AA,KK,QQ,JJ,TT,99,AKs,AQs,AJs,ATs,A5s,A4s,KQs,KJs,KTs,QJs,QTs,JTs,T9s,AKo,AQo,AJo,ATo,KQo,KJo,QJo'), call: s('88,77,66,55,A9s,A8s,A7s,A6s,A3s,A2s,K9s,Q9s,J9s,98s,87s,76s,65s,A9o,K9o,KTo,Q9o,JTo,J9o,T9o') },
      BTN: { raise: s('AA,KK,QQ,JJ,TT,99,88,77,66,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQs,KJs,KTs,K9s,QJs,QTs,Q9s,JTs,J9s,T9s,98s,87s,76s,AKo,AQo,AJo,ATo,A9o,KQo,KJo,KTo,QJo,QTo,JTo,T9o'), call: s('55,44,K8s,Q8s,J8s,T8s,97s,86s,75s,65s,A8o,K9o,K8o,Q9o,J9o,97o,87o') },
      SB:  { raise: s('AA,KK,QQ,JJ,TT,99,88,77,66,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQs,KJs,KTs,K9s,QJs,QTs,Q9s,JTs,J9s,T9s,T8s,98s,97s,87s,76s,AKo,AQo,AJo,ATo,A9o,A8o,KQo,KJo,KTo,K9o,QJo,QTo,Q9o,JTo,T9o,98o'), call: s('55,K8s,K7s,Q8s,J8s,T7s,75s,65s,54s,A7o,A6o,K8o,Q8o,J9o,J8o,T8o') },
    },
  },
};

// ---------------------------------------------------------------------------
// VS_RAISE_RANGES
// ---------------------------------------------------------------------------
export const VS_RAISE_RANGES = {
  '100BB': {
    HJ: {
      UTG: { threebet: s('AA,KK,QQ,AKs,A5s,A4s,AKo'), call: s('JJ,TT,99,AQs,AJs,ATs,KQs,JTs,AQo,KQo') },
    },
    CO: {
      UTG: { threebet: s('AA,KK,QQ,AKs,A5s,A4s,AKo'), call: s('JJ,TT,99,AQs,AJs,ATs,KQs,KJs,QJs,JTs,T9s,AQo,AJo,KQo') },
      HJ:  { threebet: s('AA,KK,QQ,AKs,KQs,A5s,A4s,A3s,AKo'), call: s('JJ,TT,99,88,AQs,AJs,ATs,KJs,QJs,JTs,T9s,98s,AQo,AJo,KQo,QJo') },
    },
    BTN: {
      UTG: { threebet: s('AA,KK,QQ,AKs,A5s,A4s,A3s,AKo'), call: s('JJ,TT,99,88,AQs,AJs,ATs,KQs,KJs,QJs,JTs,T9s,98s,87s,AQo,AJo,ATo,KQo,KJo,QJo') },
      HJ:  { threebet: s('AA,KK,QQ,AKs,KQs,A5s,A4s,A3s,A2s,AKo'), call: s('JJ,TT,99,88,77,AQs,AJs,ATs,KJs,KTs,QJs,JTs,T9s,98s,87s,76s,AQo,AJo,ATo,KQo,KJo,QJo,JTo') },
      CO:  { threebet: s('AA,KK,QQ,JJ,AKs,AQs,KQs,A5s,A4s,A3s,A2s,AKo,AQo'), call: s('TT,99,88,77,66,AJs,ATs,KJs,KTs,K9s,QJs,JTs,T9s,98s,87s,76s,65s,AJo,ATo,KQo,KJo,KTo,QJo,JTo,T9o') },
    },
    SB: {
      UTG: { threebet: s('AA,KK,QQ,AKs,A5s,A4s,AKo'), call: s('JJ,TT,AQs,AJs,KQs,QJs,JTs,AQo') },
      HJ:  { threebet: s('AA,KK,QQ,AKs,A5s,A4s,A3s,AKo'), call: s('JJ,TT,99,AQs,AJs,ATs,KQs,QJs,JTs,AQo,KQo') },
      CO:  { threebet: s('AA,KK,QQ,JJ,AKs,KQs,A5s,A4s,A3s,AKo'), call: s('TT,99,AQs,AJs,ATs,KJs,QJs,JTs,T9s,AQo,KQo') },
      BTN: { threebet: s('AA,KK,QQ,JJ,TT,AKs,AQs,KQs,KJs,A5s,A4s,A3s,A2s,AKo,AQo,KQo'), call: s('99,88,AJs,ATs,KTs,QJs,JTs,T9s,98s,AJo,ATo,KJo,QJo') },
    },
    BB: {
      UTG: { threebet: s('AA,KK,QQ,AKs,A5s,A4s,AKo'), call: s('JJ,TT,99,88,77,AQs,AJs,ATs,KQs,KJs,QJs,JTs,T9s,98s,87s,AQo,AJo,ATo,KQo,KJo,QJo') },
      HJ:  { threebet: s('AA,KK,QQ,AKs,A5s,A4s,A3s,AKo'), call: s('JJ,TT,99,88,77,66,AQs,AJs,ATs,KQs,KJs,QJs,JTs,T9s,98s,87s,76s,AQo,AJo,ATo,KQo,KJo,QJo,JTo') },
      CO:  { threebet: s('AA,KK,QQ,JJ,AKs,KQs,A5s,A4s,A3s,AKo'), call: s('TT,99,88,77,66,55,AQs,AJs,ATs,KJs,KTs,QJs,JTs,T9s,98s,87s,76s,65s,AQo,AJo,ATo,A9o,KQo,KJo,KTo,QJo,QTo,JTo') },
      BTN: { threebet: s('AA,KK,QQ,JJ,TT,AKs,AQs,KQs,KJs,A5s,A4s,A3s,A2s,AKo,AQo,KQo'), call: s('99,88,77,66,55,44,33,22,AJs,ATs,A9s,A8s,KTs,K9s,K8s,QJs,Q9s,JTs,J9s,T9s,T8s,98s,97s,87s,86s,76s,75s,65s,AJo,ATo,A9o,A8o,KJo,KTo,K9o,QJo,QTo,Q9o,JTo,J9o,T9o,T8o,98o') },
      SB:  { threebet: s('AA,KK,QQ,JJ,TT,AKs,AQs,AJs,KQs,KJs,KTs,QJs,JTs,A5s,A4s,A3s,A2s,AKo,AQo,AJo,KQo,KJo,QJo'), call: s('99,88,77,66,55,44,33,22,ATs,A9s,A8s,A7s,A6s,K9s,K8s,K7s,QTs,Q9s,Q8s,J9s,J8s,T9s,T8s,T7s,98s,97s,96s,87s,86s,85s,76s,75s,74s,65s,64s,63s,54s,ATo,A9o,A8o,KTo,K9o,Q9o,JTo,T9o,98o,87o') },
    },
  },

  '50BB': {
    HJ: {
      UTG: { threebet: s('AA,KK,QQ,AKs,A5s,A4s,AKo'), call: s('JJ,TT,AQs,AJs,ATs,KQs,JTs,AQo,KQo') },
    },
    CO: {
      UTG: { threebet: s('AA,KK,QQ,AKs,A5s,A4s,AKo'), call: s('JJ,TT,99,AQs,AJs,ATs,KQs,KJs,QJs,JTs,AQo,AJo,KQo') },
      HJ:  { threebet: s('AA,KK,QQ,AKs,KQs,A5s,A4s,A3s,AKo'), call: s('JJ,TT,99,AQs,AJs,ATs,KJs,QJs,JTs,T9s,AQo,AJo,KQo,QJo') },
    },
    BTN: {
      UTG: { threebet: s('AA,KK,QQ,AKs,A5s,A4s,A3s,AKo'), call: s('JJ,TT,99,88,AQs,AJs,ATs,KQs,KJs,QJs,JTs,T9s,98s,AQo,AJo,ATo,KQo,KJo,QJo') },
      HJ:  { threebet: s('AA,KK,QQ,AKs,KQs,A5s,A4s,A3s,A2s,AKo'), call: s('JJ,TT,99,88,AQs,AJs,ATs,KJs,KTs,QJs,JTs,T9s,98s,87s,AQo,AJo,ATo,KQo,KJo,QJo,JTo') },
      CO:  { threebet: s('AA,KK,QQ,JJ,AKs,AQs,KQs,A5s,A4s,A3s,A2s,AKo,AQo'), call: s('TT,99,88,77,AJs,ATs,KJs,KTs,K9s,QJs,JTs,T9s,98s,87s,76s,AJo,ATo,KQo,KJo,KTo,QJo,JTo,T9o') },
    },
    SB: {
      UTG: { threebet: s('AA,KK,QQ,AKs,A5s,A4s,AKo'), call: s('JJ,TT,AQs,AJs,KQs,QJs,JTs,AQo') },
      HJ:  { threebet: s('AA,KK,QQ,AKs,A5s,A4s,A3s,AKo'), call: s('JJ,TT,99,AQs,AJs,ATs,KQs,JTs,AQo,KQo') },
      CO:  { threebet: s('AA,KK,QQ,JJ,AKs,KQs,A5s,A4s,A3s,AKo'), call: s('TT,99,AQs,AJs,ATs,KJs,QJs,JTs,AQo,KQo') },
      BTN: { threebet: s('AA,KK,QQ,JJ,TT,AKs,AQs,KQs,KJs,A5s,A4s,A3s,A2s,AKo,AQo,KQo'), call: s('99,88,AJs,ATs,KTs,QJs,JTs,T9s,AJo,ATo,KJo,QJo') },
    },
    BB: {
      UTG: { threebet: s('AA,KK,QQ,AKs,A5s,A4s,AKo'), call: s('JJ,TT,99,88,77,AQs,AJs,ATs,KQs,KJs,QJs,JTs,T9s,98s,87s,AQo,AJo,ATo,KQo,KJo,QJo') },
      HJ:  { threebet: s('AA,KK,QQ,AKs,A5s,A4s,A3s,AKo'), call: s('JJ,TT,99,88,77,66,AQs,AJs,ATs,KQs,KJs,QJs,JTs,T9s,98s,87s,76s,AQo,AJo,ATo,KQo,KJo,QJo,JTo') },
      CO:  { threebet: s('AA,KK,QQ,JJ,AKs,KQs,A5s,A4s,A3s,AKo'), call: s('TT,99,88,77,66,55,AQs,AJs,ATs,KJs,KTs,QJs,JTs,T9s,98s,87s,76s,65s,AQo,AJo,ATo,A9o,KQo,KJo,KTo,QJo,QTo,JTo') },
      BTN: { threebet: s('AA,KK,QQ,JJ,TT,AKs,AQs,KQs,KJs,A5s,A4s,A3s,A2s,AKo,AQo,KQo'), call: s('99,88,77,66,55,44,AJs,ATs,A9s,A8s,KTs,K9s,K8s,QJs,Q9s,JTs,J9s,T9s,T8s,98s,97s,87s,86s,76s,75s,65s,AJo,ATo,A9o,A8o,KJo,KTo,K9o,QJo,QTo,Q9o,JTo,J9o,T9o,T8o,98o') },
      SB:  { threebet: s('AA,KK,QQ,JJ,TT,AKs,AQs,AJs,KQs,KJs,KTs,QJs,JTs,A5s,A4s,A3s,A2s,AKo,AQo,AJo,KQo,KJo,QJo'), call: s('99,88,77,66,55,44,ATs,A9s,A8s,A7s,K9s,K8s,K7s,QTs,Q9s,Q8s,J9s,J8s,T9s,T8s,T7s,98s,97s,87s,86s,76s,75s,65s,ATo,A9o,A8o,KTo,K9o,Q9o,JTo,T9o,98o,87o') },
    },
  },

  '33BB': {
    HJ: {
      UTG: { threebet: s('AA,KK,QQ,AKs,A5s,AKo'), call: s('JJ,TT,AQs,AJs,ATs,KQs,AQo') },
    },
    CO: {
      UTG: { threebet: s('AA,KK,QQ,AKs,A5s,A4s,AKo'), call: s('JJ,TT,AQs,AJs,ATs,KQs,KJs,QJs,JTs,AQo,AJo,KQo') },
      HJ:  { threebet: s('AA,KK,QQ,AKs,KQs,A5s,A4s,AKo'), call: s('JJ,TT,99,AQs,AJs,ATs,KJs,QJs,JTs,AQo,AJo,KQo') },
    },
    BTN: {
      UTG: { threebet: s('AA,KK,QQ,AKs,A5s,A4s,AKo'), call: s('JJ,TT,99,AQs,AJs,ATs,KQs,KJs,QJs,JTs,T9s,AQo,AJo,ATo,KQo,KJo') },
      HJ:  { threebet: s('AA,KK,QQ,AKs,KQs,A5s,A4s,A3s,AKo'), call: s('JJ,TT,99,88,AQs,AJs,ATs,KJs,KTs,QJs,JTs,T9s,98s,AQo,AJo,ATo,KQo,KJo,QJo') },
      CO:  { threebet: s('AA,KK,QQ,JJ,AKs,AQs,KQs,A5s,A4s,A3s,A2s,AKo,AQo'), call: s('TT,99,88,AJs,ATs,KJs,KTs,K9s,QJs,JTs,T9s,98s,87s,76s,AJo,ATo,KQo,KJo,KTo,QJo,JTo') },
    },
    SB: {
      UTG: { threebet: s('AA,KK,QQ,AKs,A5s,AKo'), call: s('JJ,TT,AQs,AJs,KQs,AQo') },
      HJ:  { threebet: s('AA,KK,QQ,AKs,A5s,A4s,AKo'), call: s('JJ,TT,AQs,AJs,ATs,KQs,QJs,JTs,AQo,KQo') },
      CO:  { threebet: s('AA,KK,QQ,JJ,AKs,KQs,A5s,A4s,AKo'), call: s('TT,99,AQs,AJs,ATs,KJs,QJs,JTs,AQo,KQo') },
      BTN: { threebet: s('AA,KK,QQ,JJ,TT,AKs,AQs,KQs,KJs,A5s,A4s,A3s,A2s,AKo,AQo,KQo'), call: s('99,AJs,ATs,KTs,QJs,JTs,T9s,AJo,ATo,KJo') },
    },
    BB: {
      UTG: { threebet: s('AA,KK,QQ,AKs,A5s,A4s,AKo'), call: s('JJ,TT,99,88,77,AQs,AJs,ATs,KQs,KJs,QJs,JTs,T9s,98s,AQo,AJo,ATo,KQo,KJo,QJo') },
      HJ:  { threebet: s('AA,KK,QQ,AKs,A5s,A4s,A3s,AKo'), call: s('JJ,TT,99,88,77,AQs,AJs,ATs,KQs,KJs,QJs,JTs,T9s,98s,87s,AQo,AJo,ATo,KQo,KJo,QJo') },
      CO:  { threebet: s('AA,KK,QQ,JJ,AKs,KQs,A5s,A4s,A3s,AKo'), call: s('TT,99,88,77,66,AQs,AJs,ATs,KJs,KTs,QJs,JTs,T9s,98s,87s,76s,AQo,AJo,ATo,A9o,KQo,KJo,KTo,QJo,JTo') },
      BTN: { threebet: s('AA,KK,QQ,JJ,TT,AKs,AQs,KQs,KJs,A5s,A4s,A3s,A2s,AKo,AQo,KQo'), call: s('99,88,77,66,55,44,AJs,ATs,A9s,A8s,KTs,K9s,QJs,Q9s,JTs,J9s,T9s,T8s,98s,87s,76s,65s,AJo,ATo,A9o,KJo,KTo,K9o,QJo,QTo,JTo,J9o,T9o,98o') },
      SB:  { threebet: s('AA,KK,QQ,JJ,TT,AKs,AQs,AJs,KQs,KJs,KTs,QJs,JTs,A5s,A4s,A3s,A2s,AKo,AQo,AJo,KQo,KJo,QJo'), call: s('99,88,77,66,55,ATs,A9s,A8s,A7s,K9s,K8s,QTs,Q9s,J9s,J8s,T9s,T8s,98s,97s,87s,76s,75s,ATo,A9o,KTo,K9o,JTo,T9o,98o') },
    },
  },

  '25BB': {
    HJ: {
      UTG: { threebet: s('AA,KK,QQ,AKs,A5s,AKo'), call: s('JJ,TT,AQs,AJs,KQs,AQo') },
    },
    CO: {
      UTG: { threebet: s('AA,KK,QQ,AKs,A5s,A4s,AKo'), call: s('JJ,TT,AQs,AJs,KQs,KJs,QJs,AQo,KQo') },
      HJ:  { threebet: s('AA,KK,QQ,AKs,KQs,A5s,A4s,AKo'), call: s('JJ,TT,99,AQs,AJs,ATs,KJs,QJs,JTs,AQo,AJo,KQo') },
    },
    BTN: {
      UTG: { threebet: s('AA,KK,QQ,AKs,A5s,A4s,AKo'), call: s('JJ,TT,AQs,AJs,KQs,KJs,QJs,JTs,AQo,AJo,ATo,KQo') },
      HJ:  { threebet: s('AA,KK,QQ,AKs,KQs,A5s,A4s,A3s,AKo'), call: s('JJ,TT,99,AQs,AJs,ATs,KJs,KTs,QJs,JTs,T9s,AQo,AJo,ATo,KQo,KJo,QJo') },
      CO:  { threebet: s('AA,KK,QQ,JJ,AKs,AQs,KQs,A5s,A4s,A3s,A2s,AKo,AQo'), call: s('TT,99,88,AJs,ATs,KJs,KTs,QJs,JTs,T9s,98s,AJo,ATo,KQo,KJo,KTo,QJo') },
    },
    SB: {
      UTG: { threebet: s('AA,KK,QQ,AKs,A5s,AKo'), call: s('JJ,TT,AQs,KQs,AQo') },
      HJ:  { threebet: s('AA,KK,QQ,AKs,A5s,A4s,AKo'), call: s('JJ,TT,AQs,AJs,KQs,JTs,AQo') },
      CO:  { threebet: s('AA,KK,QQ,JJ,AKs,KQs,A5s,A4s,AKo'), call: s('TT,99,AQs,AJs,KJs,QJs,JTs,AQo,KQo') },
      BTN: { threebet: s('AA,KK,QQ,JJ,TT,AKs,AQs,KQs,KJs,A5s,A4s,A3s,A2s,AKo,AQo,KQo'), call: s('99,AJs,ATs,KTs,QJs,JTs,AJo,ATo') },
    },
    BB: {
      UTG: { threebet: s('AA,KK,QQ,AKs,A5s,A4s,AKo'), call: s('JJ,TT,99,88,AQs,AJs,ATs,KQs,KJs,QJs,JTs,T9s,AQo,AJo,ATo,KQo,KJo') },
      HJ:  { threebet: s('AA,KK,QQ,AKs,A5s,A4s,A3s,AKo'), call: s('JJ,TT,99,88,77,AQs,AJs,ATs,KQs,KJs,QJs,JTs,T9s,98s,AQo,AJo,ATo,KQo,KJo,QJo') },
      CO:  { threebet: s('AA,KK,QQ,JJ,AKs,KQs,A5s,A4s,A3s,AKo'), call: s('TT,99,88,77,66,AQs,AJs,ATs,KJs,KTs,QJs,JTs,T9s,98s,87s,AQo,AJo,ATo,KQo,KJo,KTo,QJo') },
      BTN: { threebet: s('AA,KK,QQ,JJ,TT,AKs,AQs,KQs,KJs,A5s,A4s,A3s,A2s,AKo,AQo,KQo'), call: s('99,88,77,66,55,AJs,ATs,A9s,KTs,K9s,QJs,JTs,J9s,T9s,T8s,98s,87s,76s,AJo,ATo,A9o,KJo,KTo,K9o,QJo,QTo,JTo,J9o,T9o') },
      SB:  { threebet: s('AA,KK,QQ,JJ,TT,AKs,AQs,AJs,KQs,KJs,KTs,QJs,JTs,A5s,A4s,A3s,A2s,AKo,AQo,AJo,KQo,KJo,QJo'), call: s('99,88,77,66,ATs,A9s,A8s,K9s,K8s,QTs,Q9s,J9s,T9s,T8s,98s,97s,87s,76s,ATo,A9o,KTo,K9o,JTo,T9o') },
    },
  },
};
