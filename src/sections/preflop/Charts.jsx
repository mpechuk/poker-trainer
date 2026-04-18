import { useState } from 'preact/hooks';
import { SubNav } from '../../components/SubNav.jsx';
import { PositionTable } from '../../components/PositionTable.jsx';
import { RANKS, RFI_RANGES, POS_LIST, STACK_DEPTHS } from '../../data/rfi-ranges.js';
import '../../styles/charts.css';

const TABS = [
  { path: '/preflop/charts', label: 'RFI' },
  { path: '/preflop/limp', label: 'vs Limp' },
  { path: '/preflop/vs-raise', label: 'vs Raise' },
];

export function Charts({ path }) {
  const [activePos, setActivePos] = useState('UTG');
  const [stackDepth, setStackDepth] = useState('100BB');

  const range = RFI_RANGES[stackDepth][activePos];
  const raiseCount = range.size;
  const totalCombos = 169;
  const pct = Math.round(raiseCount / totalCombos * 100);

  return (
    <div>
      <SubNav tabs={TABS} currentPath="/preflop/charts" />
      <div class="charts-panel">
        <div class="stack-tabs">
          {STACK_DEPTHS.map(d => (
            <button
              key={d}
              class={`stack-tab${d === stackDepth ? ' active' : ''}`}
              onClick={() => setStackDepth(d)}
            >
              {d}
            </button>
          ))}
        </div>
        <PositionTable
          heroSelected={activePos}
          heroAvailable={POS_LIST}
          onHeroSelect={setActivePos}
          showVillain={false}
          showAllButtons={false}
          heroLabel="Your Position"
        />
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
