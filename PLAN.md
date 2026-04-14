# Plan: Expand Preflop Section — vs Limp, vs Raise Charts + Quizzes

## Context

The preflop section currently has one chart type (RFI / open-raise) and one quiz mode (raise/fold). The user wants two new chart types (facing a limp, facing a raise), opponent position selection, and expanded quiz modes including a combined quiz that tests all three scenarios together.

---

## New Routes

| Route | Component | Description |
|---|---|---|
| `/preflop/limp` | `LimpCharts` | ISO raise vs a limper |
| `/preflop/vs-raise` | `RaiseCharts` | 3-bet/call/fold vs a raiser |

Updated SubNav across all preflop pages: **RFI \| vs Limp \| vs Raise \| Quiz**  
(header.css sub-nav `max-width: 400px` → `max-width: 520px` for the extra tab)

---

## Files to Create

### 1. `src/data/preflop-ranges.js`

Exports:
- `LIMP_HERO_POSITIONS = ['HJ','CO','BTN','SB','BB']`
- `RAISE_HERO_POSITIONS = ['HJ','CO','BTN','SB','BB']`
- `VALID_LIMP_VILLAINS = { HJ:['UTG'], CO:['UTG','HJ'], BTN:['UTG','HJ','CO'], SB:['UTG','HJ','CO','BTN'], BB:['UTG','HJ','CO','BTN','SB'] }`
- `VALID_RAISE_VILLAINS` — same structure
- `LIMP_RANGES[stackDepth][heroPos][villainPos] = { raise: Set, call: Set }`  
  (fold = all 169 hands minus raise ∪ call; for BB "call" = check)
- `VS_RAISE_RANGES[stackDepth][heroPos][villainPos] = { threebet: Set, call: Set }`  
  (fold = everything else)

**100BB LIMP_RANGES data:**

| Hero | Villain | raise | call |
|---|---|---|---|
| HJ | UTG | AA-TT, AKs-ATs, A5s-A4s, KQs-KJs, QJs, JTs, AKo-AJo, KQo | 99-22, A9s-A6s, A3s-A2s, KTs-K8s, QTs-Q9s, J9s, T9s-T8s, 98s-97s, 87s-86s, 76s-75s, 65s-64s, 54s, ATo, KJo-KTo, QJo-QTo |
| CO | UTG | AA-TT, AKs-ATs, A5s-A4s, KQs-KJs, KTs, QJs, JTs, T9s, AKo-AJo, KQo-KJo | 99-22, A9s-A6s, A3s-A2s, K9s-K8s, QTs-Q9s, J9s, 98s-97s, 87s-86s, 76s-75s, 65s-64s, 54s-43s, ATo, KTo, QJo-QTo-JTo |
| CO | HJ | AA-99, AKs-ATs, A5s-A4s, KQs-KJs, KTs, QJs-QTs, JTs, T9s, AKo-ATo, KQo-KJo, QJo | 88-22, A9s-A6s, A3s-A2s, K9s-K8s, Q9s, J9s, 98s-97s, 87s-86s, 76s-75s, 65s-64s, 54s-43s, KTo, QTo, JTo |
| BTN | UTG | AA-88, AKs-ATs, A9s, A5s-A3s, KQs-KTs, QJs-QTs, JTs, T9s, 98s, AKo-ATo, KQo-KJo, QJo-QTo, JTo | 77-22, A8s-A6s, A2s, K9s-K8s, Q9s, J9s-J8s, T8s, 97s, 87s-86s, 76s-75s, 65s-64s, 54s-53s, 43s, A9o, KTo-K9o, Q9o, J9o, T9o |
| BTN | HJ | AA-88, AKs-ATs, A9s, A5s-A3s, KQs-KTs, QJs-QTs, JTs-J9s, T9s, 98s, 87s, AKo-ATo, KQo-KJo, QJo-QTo, JTo | 77-22, A8s-A6s, A2s, K9s-K8s, Q9s, T8s, 97s, 76s-75s, 65s-64s, 54s-43s, A9o, KTo-K9o, Q9o |
| BTN | CO | AA-77, AKs-A2s (all), KQs-K8s, QJs-Q8s, JTs-J8s, T9s-T8s, 98s-97s, 87s, 76s, 65s, AKo-A7o, KQo-KTo, QJo-QTo, JTo, T9o | 66-22, K7s-K5s, Q7s, J7s, T7s, 96s, 86s-85s, 74s, 64s, 54s-53s, 43s, A6o-A2o, K9o-K8o, Q9o, J9o, 98o |
| SB | UTG | AA-TT, AKs-ATs, A5s-A4s, KQs-KJs, QJs, JTs, AKo-AJo, KQo | 99-22, A9s-A6s, A3s-A2s, KTs-K8s, QTs-Q9s, J9s, T9s-T8s, 98s-97s, 87s-86s, 76s-75s, 65s, ATo, KJo-KTo, QJo |
| SB | HJ | AA-TT, AKs-ATs, A5s-A3s, KQs-KJs, KTs, QJs, JTs, T9s, AKo-AJo, KQo-KJo | 99-22, A9s-A6s, A2s, K9s-K8s, QTs-Q9s, J9s, 98s-97s, 87s-86s, 76s-75s, 65s, ATo, KTo, QJo |
| SB | CO | AA-99, AKs-ATs, A5s-A3s, KQs-KJs, KTs, QJs-QTs, JTs, T9s, AKo-ATo, KQo-KJo, QJo | 88-22, A9s-A6s, A2s, K9s-K8s, Q9s, J9s, 98s-97s, 87s-86s, 76s-75s, 65s-64s, 54s, KTo, QTo-Q9o |
| SB | BTN | AA-99, AKs-ATs, A9s, A5s-A2s, KQs-KJs, KTs-K9s, QJs-QTs, JTs, T9s, 98s, 87s, AKo-ATo-A9o, KQo-KJo, QJo-QTo, JTo | 88-22, A8s-A6s, K8s, Q9s, J9s-J8s, T8s, 97s, 76s-75s, 65s-64s, 54s-53s, K9o-K8o, Q9o, J9o, T9o |
| BB | UTG | AA-TT, AKs-ATs, A5s-A4s, KQs-KJs, QJs, JTs, AKo-AJo, KQo | 99-22, A9s-A2s, KTs-K8s, QTs-Q9s, J9s, T9s-T8s, 98s-97s, 87s-86s, 76s-75s, 65s-64s, 54s-53s, 43s-32s, ATo-A9o, KJo-KTo-K9o, QJo-QTo-Q9o, JTo-J9o, T9o, 98o, 87o, 76o, 65o |
| BB | HJ | AA-99, AKs-ATs, A5s-A3s, KQs-KJs, KTs, QJs, JTs, AKo-AJo, KQo-KJo | 88-22, A9s-A2s, K9s-K8s, QTs-Q9s, J9s, T9s-T8s, 98s-97s, 87s-86s, 76s-75s, 65s-64s, 54s-43s-32s, ATo-A9o, KTo-K9o, QJo-QTo-Q9o, JTo-J9o, T9o, 98o, 87o, 76o |
| BB | CO | AA-99, AKs-ATs, A5s-A3s, KQs-KJs, KTs, QJs-QTs, JTs, T9s, AKo-ATo, KQo-KJo, QJo | 88-22, A9s-A2s, K9s-K8s, Q9s, J9s-J8s, T8s, 98s-97s, 87s-86s, 76s-75s, 65s-64s, 54s-43s-32s, A9o, KTo-K9o, Q9o-QTo, JTo-J9o, T9o, 98o, 87o, 76o-65o |
| BB | BTN | AA-77, AKs-A2s, KQs-K9s, QJs-Q9s, JTs-J9s, T9s-T8s, 98s, 87s, 76s, AKo-A8o-A9o, KQo-KTo, QJo-QTo, JTo, T9o, 98o | 66-22, K8s-K7s, Q8s, J8s, T7s, 97s, 86s, 75s, 65s-64s, 54s-53s, 43s, A7o-A6o-A5o, K9o-K8o, Q9o-Q8o, J9o-J8o, T8o, 97o, 87o-86o, 76o-75o-65o |
| BB | SB | AA-66, AKs-A2s, KQs-K8s, QJs-Q8s, JTs-J8s, T9s-T7s, 98s-96s, 87s, 76s, AKo-A7o, KQo-K9o, QJo-Q9o, JTo-J9o, T9o, 98o, 87o, 76o | 55-22, K7s-K6s, Q7s, J7s, T6s, 95s, 85s, 75s-74s, 65s-64s, 54s-53s, 43s, A6o-A4o, K8o, Q8o, J8o, T8o, 97o, 86o, 75o, 65o |

**100BB VS_RAISE_RANGES data:**

| Hero | Villain | threebet | call |
|---|---|---|---|
| HJ | UTG | AA, KK, QQ, AKs, A5s, A4s, AKo | JJ, TT, 99, AQs, AJs, ATs, KQs, JTs, AQo, KQo |
| CO | UTG | AA, KK, QQ, AKs, A5s, A4s, AKo | JJ, TT, 99, AQs, AJs, ATs, KQs, KJs, QJs, JTs, T9s, AQo, AJo, KQo |
| CO | HJ | AA, KK, QQ, AKs, KQs, A5s, A4s, A3s, AKo | JJ, TT, 99, 88, AQs, AJs, ATs, KJs, QJs, JTs, T9s, 98s, AQo, AJo, KQo, QJo |
| BTN | UTG | AA, KK, QQ, AKs, A5s, A4s, A3s, AKo | JJ, TT, 99, 88, AQs, AJs, ATs, KQs, KJs, QJs, JTs, T9s, 98s, 87s, AQo, AJo, ATo, KQo, KJo, QJo |
| BTN | HJ | AA, KK, QQ, AKs, KQs, A5s, A4s, A3s, A2s, AKo | JJ, TT, 99, 88, 77, AQs, AJs, ATs, KJs, KTs, QJs, JTs, T9s, 98s, 87s, 76s, AQo, AJo, ATo, KQo, KJo, QJo, JTo |
| BTN | CO | AA, KK, QQ, JJ, AKs, AQs, KQs, A5s, A4s, A3s, A2s, AKo, AQo | TT, 99, 88, 77, 66, AJs, ATs, KJs, KTs, K9s, QJs, JTs, T9s, 98s, 87s, 76s, 65s, AJo, ATo, KQo, KJo, KTo, QJo, JTo, T9o |
| SB | UTG | AA, KK, QQ, AKs, A5s, A4s, AKo | JJ, TT, AQs, AJs, KQs, QJs, JTs, AQo |
| SB | HJ | AA, KK, QQ, AKs, A5s, A4s, A3s, AKo | JJ, TT, 99, AQs, AJs, ATs, KQs, QJs, JTs, AQo, KQo |
| SB | CO | AA, KK, QQ, JJ, AKs, KQs, A5s, A4s, A3s, AKo | TT, 99, AQs, AJs, ATs, KJs, QJs, JTs, T9s, AQo, KQo |
| SB | BTN | AA, KK, QQ, JJ, TT, AKs, AQs, KQs, KJs, A5s, A4s, A3s, A2s, AKo, AQo, KQo | 99, 88, AJs, ATs, KTs, QJs, JTs, T9s, 98s, AJo, ATo, KJo, QJo |
| BB | UTG | AA, KK, QQ, AKs, A5s, A4s, AKo | JJ, TT, 99, 88, 77, AQs, AJs, ATs, KQs, KJs, QJs, JTs, T9s, 98s, 87s, AQo, AJo, ATo, KQo, KJo, QJo |
| BB | HJ | AA, KK, QQ, AKs, A5s, A4s, A3s, AKo | JJ, TT, 99, 88, 77, 66, AQs, AJs, ATs, KQs, KJs, QJs, JTs, T9s, 98s, 87s, 76s, AQo, AJo, ATo, KQo, KJo, QJo, JTo |
| BB | CO | AA, KK, QQ, JJ, AKs, KQs, A5s, A4s, A3s, AKo | TT, 99, 88, 77, 66, 55, AQs, AJs, ATs, KJs, KTs, QJs, JTs, T9s, 98s, 87s, 76s, 65s, AQo, AJo, ATo, A9o, KQo, KJo, KTo, QJo, QTo, JTo |
| BB | BTN | AA, KK, QQ, JJ, TT, AKs, AQs, KQs, KJs, A5s, A4s, A3s, A2s, AKo, AQo, KQo | 99-22, AJs, ATs, A9s, A8s, KTs, K9s, K8s, QJs, Q9s, JTs, J9s, T9s, T8s, 98s, 97s, 87s, 86s, 76s, 75s, 65s, AJo, ATo, A9o, A8o, KJo, KTo, K9o, QJo, QTo, Q9o, JTo, J9o, T9o, T8o, 98o |
| BB | SB | AA, KK, QQ, JJ, TT, AKs, AQs, AJs, KQs, KJs, KTs, QJs, JTs, A5s, A4s, A3s, A2s, AKo, AQo, AJo, KQo, KJo, QJo | 99-22, ATs, A9s-A6s, K9s-K7s, QTs-Q8s, J9s-J8s, T9s-T7s, 98s-96s, 87s-85s, 76s-74s, 65s-63s, 54s, ATo, A9o, A8o, KTo, K9o, Q9o, JTo, T9o, 98o, 87o |

**Stack depth scaling for both range types:**  
Apply same principle as existing `rfi-ranges.js` — proportional tightening at 50BB, 33BB, 25BB by removing the most speculative hands at each step (low pairs from raise ranges, suited connectors below 65s, weak offsuit hands). Implement and verify the monotonic-narrowing invariant in tests.

---

### 2. `src/sections/preflop/LimpCharts.jsx`

- SubNav with 4 tabs (same TABS constant as updated Charts.jsx)
- Stack depth tabs (reuse `.stack-tabs`)
- Two dropdowns: "Your Position" (from `LIMP_HERO_POSITIONS`) + "Limper Position" (filtered to `VALID_LIMP_VILLAINS[heroPos]`)
- When `heroPos` changes, auto-reset `villainPos` to first valid villain
- 13×13 grid with 3 cell classes: `rfi-raise` (green), `rfi-call` (blue/teal), `rfi-fold` (gray)
- Legend: Raise / Call (or "Check" when `heroPos==='BB'`) / Fold with combo counts
- Placeholder text if `LIMP_RANGES[stackDepth]?.[heroPos]?.[villainPos]` is undefined

### 3. `src/sections/preflop/RaiseCharts.jsx`

- Same structure as `LimpCharts.jsx`
- Uses `VS_RAISE_RANGES`, labels villain as "Raiser Position"
- Cell actions: 3-Bet (green) / Call (blue) / Fold (gray)

---

## Files to Modify

### 4. `src/routing.js`
Add to `ROUTES_LIST`:
```js
'/preflop/limp',
'/preflop/vs-raise',
```

### 5. `src/app.jsx`
Import `LimpCharts` and `RaiseCharts`, add to `ROUTES` map.

### 6. `src/sections/preflop/Charts.jsx`
Update `TABS` from 2 to 4 entries:
```js
const TABS = [
  { path: '/preflop/charts', label: 'RFI' },
  { path: '/preflop/limp', label: 'vs Limp' },
  { path: '/preflop/vs-raise', label: 'vs Raise' },
  { path: '/preflop/quiz', label: 'Quiz' },
];
```
No other changes.

### 7. `src/styles/charts.css`
Add:
```css
.rfi-call { background:rgba(52,152,219,.22); color:#a8d8f0; border:1px solid rgba(52,152,219,.25) }
.rfi-legend .sw-call { background:rgba(52,152,219,.22); border:1px solid rgba(52,152,219,.25) }
/* Position selectors */
.pos-selectors { display:flex; justify-content:center; gap:1.5rem; margin-bottom:1rem; flex-wrap:wrap }
.pos-selector-group { display:flex; flex-direction:column; align-items:center; gap:.3rem }
.pos-selector-label { font-size:.75rem; color:var(--muted); letter-spacing:.08em; text-transform:uppercase }
.pos-selector-select { background:rgba(0,0,0,.4); color:var(--gold-bright); border:1px solid var(--gold-dark);
  border-radius:8px; padding:.35rem .7rem; font-family:'Crimson Pro',serif; font-size:.95rem; cursor:pointer }
.pos-selector-select:focus { outline:none; border-color:var(--gold) }
```

### 8. `src/styles/header.css`
Update `.sub-nav` max-width from `400px` → `520px` (fits 4 tabs comfortably).

### 9. `src/sections/preflop/Quiz.jsx`

Add internal mode selector tabs: **RFI | vs Limp | vs Raise | All**

New state: `quizMode` (default `'rfi'`).  
Mode switching resets deck/score/idx (same as stack depth change). Mode tabs lock during active quiz (same `.disabled` pattern).

**New question generators:**
```js
function generateLimpHand(stackDepth) {
  heroPos = random from LIMP_HERO_POSITIONS
  villainPos = random from VALID_LIMP_VILLAINS[heroPos]
  hand = random hand (same row/col logic)
  range = LIMP_RANGES[stackDepth][heroPos][villainPos]
  correctAction = range.raise.has(hand) ? 'raise' : range.call.has(hand) ? 'call' : 'fold'
  return { type:'limp', hand, heroPos, villainPos, stackDepth, correctAction }
}

function generateVsRaiseHand(stackDepth) { // same pattern with VS_RAISE_RANGES, correctAction: 'threebet'|'call'|'fold' }
```

**buildDeck for 3-action modes:** max 4 of any single action in a 10-question deck.

**Answer buttons:**
- RFI: `[Raise, Fold]` (existing)
- vs Limp: `[Raise, Call, Fold]`
- vs Raise: `[3-Bet, Call, Fold]`
- All: use buttons matching current question's type

**Question prompt text:**
- RFI: "Everyone folds to you. What do you do?" (existing)
- vs Limp: "Villain limped from {villainPos}. What do you do?"
- vs Raise: "Villain raised from {villainPos}. What do you do?"

**Quiz card:** Show "Your Position: {heroPos}" and "Villain: {villainPos}" for non-RFI questions.

**Stats saving:** Keep existing `rfi-quiz-stats` write unchanged. New modes write to `limp-quiz-stats`, `vs-raise-quiz-stats`. All-mode quiz writes to `all-modes-quiz-stats` and also updates all individual mode stats.

**SubNav TABS:** same 4-tab constant as other preflop pages.

### 10. `src/utils/storage.js`
Add 9 new helpers following the existing pattern:
```js
// Keys: 'limp-quiz-stats', 'vs-raise-quiz-stats', 'all-modes-quiz-stats'
// Shapes:
initLimpQuizStats()    → { totalQuizzes, totalQuestions, totalCorrect, byHeroPosition:{}, byVillainPosition:{}, recentScores:[] }
initVsRaiseQuizStats() → same shape
initAllModesQuizStats()→ { totalQuizzes, totalQuestions, totalCorrect, byMode:{rfi:{total,correct}, limp:{total,correct}, vsRaise:{total,correct}}, recentScores:[] }
```

### 11. `src/sections/stats/Dashboard.jsx`
Import 3 new storage helpers, add 3 new `<div class="stats-section">` blocks mirroring the existing RFI quiz section. Reset functions remove the appropriate localStorage keys.

---

## Tests to Write

### `src/routing.test.js` (append)
```js
it('/preflop/limp exists in routes list', ...)
it('/preflop/vs-raise exists in routes list', ...)
it('resolveRoute passes through new preflop routes unchanged', ...)
```

### `src/data/preflop-ranges.test.js` (new file)
- LIMP_RANGES: has all 4 stack depths, each hero has all valid villains, raise/call Sets are disjoint, all hand notations valid, BTN raise range wider than HJ raise range vs same villain, 100BB wider than 50BB
- VS_RAISE_RANGES: same structure tests, threebet/call disjoint, BB vs BTN call wider than SB vs BTN call, 3-bet range never contains a hand that's in call range

### `src/utils/storage.test.js` (new file)
- initLimpQuizStats returns correct shape
- initVsRaiseQuizStats returns correct shape
- initAllModesQuizStats has byMode with rfi/limp/vsRaise keys
- getLimpQuizStats returns null when nothing stored
- save/get round-trip

---

## Implementation Order (dependency-safe)

1. `src/data/preflop-ranges.js`
2. `src/utils/storage.js` (new helpers)
3. `src/routing.js` (new routes)
4. `src/styles/charts.css` + `src/styles/header.css`
5. `src/sections/preflop/LimpCharts.jsx` (new)
6. `src/sections/preflop/RaiseCharts.jsx` (new)
7. `src/sections/preflop/Charts.jsx` (TABS only)
8. `src/sections/preflop/Quiz.jsx` (mode selector + generators)
9. `src/app.jsx` (register routes)
10. `src/sections/stats/Dashboard.jsx`
11. `src/data/preflop-ranges.test.js` (new)
12. `src/utils/storage.test.js` (new)
13. `src/routing.test.js` (append)
14. Verify: `npm test && npm run build`

---

## Verification

```bash
npm test        # all existing + new tests pass
npm run build   # no build errors
```

Manual checks:
- Navigate to `#/preflop/limp`, select BTN vs CO → grid shows green/blue/gray cells
- Navigate to `#/preflop/vs-raise`, select BB vs BTN → large call range visible
- SubNav shows 4 tabs on all preflop pages
- Quiz: switch to "vs Limp" mode → 3 buttons appear, correct/wrong feedback works
- Quiz: switch to "All" mode → mixed question types, correct button set per question
- Stats dashboard shows 3 new quiz sections
