import { useState } from 'preact/hooks';
import { SubNav } from '../../components/SubNav.jsx';
import { RANKS, STACK_DEPTHS } from '../../data/rfi-ranges.js';
import { RAISE_HERO_POSITIONS, VALID_RAISE_VILLAINS, VS_RAISE_RANGES } from '../../data/preflop-ranges.js';
import { describeVsRaise } from '../../utils/range-description.js';
import '../../styles/charts.css';

const TABS = [
  { path: '/preflop/charts', label: 'RFI' },
  { path: '/preflop/limp', label: 'vs Limp' },
  { path: '/preflop/vs-raise', label: 'vs Raise' },
  { path: '/preflop/quiz', label: 'Quiz' },
];

export function RaiseCharts() {
  const [heroPos, setHeroPos] = useState('BTN');
  const [villainPos, setVillainPos] = useState('CO');
  const [stackDepth, setStackDepth] = useState('100BB');

  const validVillains = VALID_RAISE_VILLAINS[heroPos] || [];

  function changeHero(pos) {
    setHeroPos(pos);
    const valid = VALID_RAISE_VILLAINS[pos] || [];
    if (!valid.includes(villainPos)) setVillainPos(valid[valid.length - 1] || valid[0]);
  }

  const rangeSet = VS_RAISE_RANGES[stackDepth]?.[heroPos]?.[villainPos];
  const threebetCount = rangeSet ? rangeSet.threebet.size : 0;
  const callCount     = rangeSet ? rangeSet.call.size : 0;
  const totalCombos = 169;

  return (
    <div>
      <SubNav tabs={TABS} currentPath="/preflop/vs-raise" />
      <div class="charts-panel">
        <div class="stack-tabs">
          {STACK_DEPTHS.map(d => (
            <button key={d} class={`stack-tab${d === stackDepth ? ' active' : ''}`} onClick={() => setStackDepth(d)}>{d}</button>
          ))}
        </div>

        <div class="pos-selectors">
          <div class="pos-selector-group">
            <span class="pos-selector-label">Your Position</span>
            <select class="pos-selector-select" value={heroPos} onChange={e => changeHero(e.target.value)}>
              {RAISE_HERO_POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div class="pos-selector-group">
            <span class="pos-selector-label">Raiser Position</span>
            <select class="pos-selector-select" value={villainPos} onChange={e => setVillainPos(e.target.value)}>
              {validVillains.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {!rangeSet ? (
          <p style="text-align:center;color:var(--muted);padding:2rem">Select positions above to view chart.</p>
        ) : (
          <>
            <div class="rfi-grid">
              <div class="rfi-cell rfi-hdr"></div>
              {RANKS.map(r => <div class="rfi-cell rfi-hdr" key={'col-' + r}>{r}</div>)}
              {RANKS.map((rowRank, r) => (
                <>
                  <div class="rfi-cell rfi-hdr" key={'row-' + rowRank}>{rowRank}</div>
                  {RANKS.map((colRank, c) => {
                    let hand;
                    if (r === c) hand = RANKS[r] + RANKS[c];
                    else if (c > r) hand = RANKS[r] + RANKS[c] + 's';
                    else hand = RANKS[c] + RANKS[r] + 'o';
                    const is3bet = rangeSet.threebet.has(hand);
                    const isCall = !is3bet && rangeSet.call.has(hand);
                    return (
                      <div class={`rfi-cell ${is3bet ? 'rfi-raise' : isCall ? 'rfi-call' : 'rfi-fold'}`} key={hand}>{hand}</div>
                    );
                  })}
                </>
              ))}
            </div>
            <div class="rfi-legend">
              <span class="rfi-legend-item"><span class="rfi-swatch rfi-raise"></span> 3-Bet ({threebetCount}, {Math.round(threebetCount/totalCombos*100)}%)</span>
              <span class="rfi-legend-item"><span class="rfi-swatch rfi-call"></span> Call ({callCount}, {Math.round(callCount/totalCombos*100)}%)</span>
              <span class="rfi-legend-item"><span class="rfi-swatch rfi-fold"></span> Fold</span>
            </div>
            <p class="range-desc">
              <span class="range-desc-label">{heroPos} vs {villainPos} raise · {stackDepth}:</span>{' '}
              {describeVsRaise(rangeSet)}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
