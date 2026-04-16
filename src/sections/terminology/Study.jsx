import { useEffect } from 'preact/hooks';
import { SubNav } from '../../components/SubNav.jsx';
import { FilterChips } from '../../components/FilterChips.jsx';
import { ProgressBar } from '../../components/ProgressBar.jsx';
import { useFilters } from '../../hooks/useFilters.js';
import { useDeck } from '../../hooks/useDeck.js';
import { getIllus } from '../../utils/illustrations.jsx';
import { getStudyProgress, saveStudyProgress, initStudyProgress } from '../../utils/storage.js';
import '../../styles/study.css';

const TABS = [
  { path: '/terminology/study', label: 'Study' },
  { path: '/terminology/reference', label: 'Reference' },
];

export function Study({ path }) {
  const { activeCats, toggleCat } = useFilters();
  const { deck, idx, flipped, flipCard, navCard, shuffleDeck } = useDeck(activeCats);

  useEffect(() => {
    if (!deck.length) return;
    const t = deck[idx];
    const progress = getStudyProgress() || initStudyProgress();
    if (!progress.cardsSeen.includes(t.term)) {
      progress.cardsSeen.push(t.term);
    }
    if (!progress.byCategory[t.cat]) progress.byCategory[t.cat] = 0;
    progress.byCategory[t.cat]++;
    if (flipped) progress.totalFlips++;
    saveStudyProgress(progress);
  }, [idx, flipped]);

  const current = deck[idx];

  return (
    <div>
      <SubNav tabs={TABS} currentPath="/terminology/study" />
      <FilterChips activeCats={activeCats} onToggle={toggleCat} />
      <ProgressBar current={idx} total={deck.length} />
      <div class="study-panel">
        <div class="scene" onClick={flipCard}>
          <div class={`card-wrap ${flipped ? 'flipped' : ''}`}>
            <div class="card-back">
              <div class="back-pattern" />
              <div class="term-cat">{current?.cat || 'Category'}</div>
              <div class="term-main">{current?.term || 'Term'}</div>
              <div class="tap-hint">tap to reveal definition</div>
            </div>
            <div class="card-face">
              <div class="cf-header">
                <div class="cf-cat">{current?.cat || 'Category'}</div>
                <div class="cf-term">{current?.term || 'Term'}</div>
              </div>
              <div class="cf-body">
                <div class="cf-def">{current?.def || 'Definition'}</div>
                <div class="illus" dangerouslySetInnerHTML={{ __html: current ? getIllus(current) : '' }} />
              </div>
            </div>
          </div>
        </div>
        <div class="card-nav">
          <button onClick={() => navCard(-1)}>{'\u2190'} Prev</button>
          <span class="counter">{idx + 1} / {deck.length}</span>
          <button onClick={() => navCard(1)}>Next {'\u2192'}</button>
        </div>
        <button class="shuffle-btn" onClick={shuffleDeck}>{'\u21C4'} Shuffle deck</button>
      </div>
    </div>
  );
}
