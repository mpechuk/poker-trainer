import { useState } from 'preact/hooks';
import { SubNav } from '../../components/SubNav.jsx';
import { RANKS, RFI_RANGES, POS_LIST } from '../../data/rfi-ranges.js';
import '../../styles/charts.css';

const TABS = [
  { path: '/preflop/charts', label: 'Charts' },
  { path: '/preflop/quiz', label: 'RFI Quiz' }
];

export function Charts({ path }) {
  const [activePos, setActivePos] = useState('UTG');

  const range = RFI_RANGES[activePos];
  const raiseCount = range.size;
  const totalCombos = 169;
  const pct = Math.round(raiseCount / totalCombos * 100);

  return (
    <div>
      <SubNav tabs={TABS} currentPath="/preflop/charts" />
      <div class="charts-panel">
        <div class="pos-tabs">
          {POS_LIST.map(p => (
            <button
              key={p}
              class={`pos-tab${p === activePos ? ' active' : ''}`}
              onClick={() => setActivePos(p)}
            >
              {p}
            </button>
          ))}
        </div>
        <div class="rfi-grid">
          <div class="rfi-cell rfi-hdr"></div>
          {RANKS.map(r => (
            <div class="rfi-cell rfi-hdr" key={'col-' + r}>{r}</div>
          ))}
          {RANKS.map((rowRank, r) => (
            <>
              <div class="rfi-cell rfi-hdr" key={'row-' + rowRank}>{rowRank}</div>
              {RANKS.map((colRank, c) => {
                let hand;
                if (r === c) hand = RANKS[r] + RANKS[c];
                else if (c > r) hand = RANKS[r] + RANKS[c] + 's';
                else hand = RANKS[c] + RANKS[r] + 'o';
                const isRaise = range.has(hand);
                return (
                  <div class={`rfi-cell ${isRaise ? 'rfi-raise' : 'rfi-fold'}`} key={hand}>
                    {hand}
                  </div>
                );
              })}
            </>
          ))}
        </div>
        <div class="rfi-legend">
          <span class="rfi-legend-item"><span class="rfi-swatch rfi-raise"></span> Raise ({raiseCount} combos, {pct}%)</span>
          <span class="rfi-legend-item"><span class="rfi-swatch rfi-fold"></span> Fold</span>
        </div>
      </div>
    </div>
  );
}
