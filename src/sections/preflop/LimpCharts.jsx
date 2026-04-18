import { useState } from 'preact/hooks';
import { SubNav } from '../../components/SubNav.jsx';
import { PositionTable } from '../../components/PositionTable.jsx';
import { RANKS, STACK_DEPTHS } from '../../data/rfi-ranges.js';
import { LIMP_HERO_POSITIONS, VALID_LIMP_VILLAINS, LIMP_RANGES } from '../../data/preflop-ranges.js';
import '../../styles/charts.css';

const TABS = [
  { path: '/preflop/charts', label: 'RFI' },
  { path: '/preflop/limp', label: 'vs Limp' },
  { path: '/preflop/vs-raise', label: 'vs Raise' },
];

export function LimpCharts() {
  const [heroPos, setHeroPos] = useState('BTN');
  const [villainPos, setVillainPos] = useState('CO');
  const [stackDepth, setStackDepth] = useState('100BB');

  const validVillains = VALID_LIMP_VILLAINS[heroPos] || [];

  function changeHero(pos) {
    setHeroPos(pos);
    const valid = VALID_LIMP_VILLAINS[pos] || [];
    if (!valid.includes(villainPos)) setVillainPos(valid[valid.length - 1] || valid[0]);
  }

  const rangeSet = LIMP_RANGES[stackDepth]?.[heroPos]?.[villainPos];
  const raiseCount = rangeSet ? rangeSet.raise.size : 0;
  const callCount  = rangeSet ? rangeSet.call.size : 0;
  const totalCombos = 169;

  return (
    <div>
      <SubNav tabs={TABS} currentPath="/preflop/limp" />
      <div class="charts-panel">
        <div class="stack-tabs">
          {STACK_DEPTHS.map(d => (
            <button key={d} class={`stack-tab${d === stackDepth ? ' active' : ''}`} onClick={() => setStackDepth(d)}>{d}</button>
          ))}
        </div>

        <PositionTable
          heroSelected={heroPos}
          villainSelected={villainPos}
          heroAvailable={LIMP_HERO_POSITIONS}
          villainAvailable={validVillains}
          onHeroSelect={changeHero}
          onVillainSelect={setVillainPos}
          showVillain={true}
          showAllButtons={false}
          heroLabel="Your Position"
          villainLabel="Limper"
        />

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
                    const isRaise = rangeSet.raise.has(hand);
                    const isCall  = !isRaise && rangeSet.call.has(hand);
                    return (
                      <div class={`rfi-cell ${isRaise ? 'rfi-raise' : isCall ? 'rfi-call' : 'rfi-fold'}`} key={hand}>{hand}</div>
                    );
                  })}
                </>
              ))}
            </div>
            <div class="rfi-legend">
              <span class="rfi-legend-item"><span class="rfi-swatch rfi-raise"></span> Raise ({raiseCount}, {Math.round(raiseCount/totalCombos*100)}%)</span>
              <span class="rfi-legend-item"><span class="rfi-swatch rfi-call"></span> {heroPos === 'BB' ? 'Check' : 'Call'} ({callCount}, {Math.round(callCount/totalCombos*100)}%)</span>
              <span class="rfi-legend-item"><span class="rfi-swatch rfi-fold"></span> Fold</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
