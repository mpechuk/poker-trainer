// Flop Combos & Outs quiz.
//
// Auto-advance is intentionally not wired into this quiz: the feedback panel is
// dense (per-category outs + probability + out-card lists), and auto-dismissing
// it would defeat the teaching intent.

import { useState, useMemo, useEffect } from 'preact/hooks';
import { SubNav } from '../../components/SubNav.jsx';
import { ShareButton } from '../../components/ShareButton.jsx';
import { cardSvg } from '../../utils/illustrations.jsx';
import {
  analyzeQuestion,
  buildCombosDeck,
  QUIZ_CATEGORIES,
} from '../../utils/combos.js';
import {
  getFlopCombosQuizStats,
  saveFlopCombosQuizStats,
  initFlopCombosQuizStats,
  getSettings,
} from '../../utils/storage.js';
import {
  encodeCombosQuiz,
  decodeCombosQuiz,
  buildShareUrl,
  buildScoreMessage,
} from '../../utils/share.js';
import '../../styles/quiz.css';
import '../../styles/combos-quiz.css';

const TABS = [
  { path: '/quizzes/preflop', label: 'Preflop' },
  { path: '/quizzes/flop', label: 'Flop Texture' },
  { path: '/quizzes/flop-combos', label: 'Flop Combos' },
  { path: '/quizzes/terminology', label: 'Terminology' },
];

function renderCards(cards, w = 60, h = 84) {
  return cards.map(c => cardSvg(c.rank, c.suit, w, h)).join('');
}

function fmtPct(p) {
  return (p * 100).toFixed(1) + '%';
}

function ruleOfFour(outs) {
  return outs * 4 + '%';
}

// Question grading: returns per-category status + whether the hand is perfect.
// For each category C:
//   phase1Right: user's "reachable" ✓/✗ matches truth
//   phase2Right: if category was selected and not made, user's outs exactly match
//                 actual turn-out count; otherwise null (not applicable)
//   categoryRight: phase1Right && phase2Right !== false  (all judgements for this category)
export function gradeHand(analysis, p1Selected, p2Outs) {
  const perCat = {};
  let phase1Correct = 0;
  let phase2Correct = 0;
  let phase2Asked = 0;
  const madeSet = analysis.madeSet || new Set([analysis.made]);
  for (const C of QUIZ_CATEGORIES) {
    const trueReachable = analysis.reachable.has(C);
    const userSelected = p1Selected.has(C);
    const phase1Right = trueReachable === userSelected;
    if (phase1Right) phase1Correct += 1;

    const made = madeSet.has(C);
    const askedInP2 = userSelected && !made;
    let phase2Right = null;
    if (askedInP2) {
      phase2Asked += 1;
      const actual = analysis.turnOuts[C].count;
      const entered = Number(p2Outs[C]);
      if (Number.isFinite(entered) && entered === actual) {
        phase2Right = true;
        phase2Correct += 1;
      } else {
        phase2Right = false;
      }
    }

    const categoryRight = phase1Right && phase2Right !== false;
    perCat[C] = { phase1Right, phase2Right, categoryRight, trueReachable, userSelected, made };
  }
  const allCorrect = Object.values(perCat).every(x => x.categoryRight);
  return {
    perCat,
    phase1Correct,
    phase1Total: QUIZ_CATEGORIES.length,
    phase2Correct,
    phase2Total: phase2Asked,
    handCorrect: allCorrect,
  };
}

export function CombosQuiz({ query }) {
  const sharedInit = decodeCombosQuiz(query);
  const [settings, setSettings] = useState(() => getSettings());
  const [phase, setPhase] = useState(sharedInit ? 'playing' : 'setup');
  const [subphase, setSubphase] = useState('p1');
  const [sharedDeck, setSharedDeck] = useState(() => sharedInit?.deck || null);
  const [deck, setDeck] = useState(() => sharedInit?.deck || []);
  const [qIdx, setQIdx] = useState(0);
  const [p1Selected, setP1Selected] = useState(() => new Set());
  const [p2Outs, setP2Outs] = useState({});
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [total, setTotal] = useState(0);
  const [results, setResults] = useState([]);
  const [statsSaved, setStatsSaved] = useState(false);

  const current = deck[qIdx];
  const analysis = useMemo(() => (current ? analyzeQuestion(current.holes, current.flop) : null), [current]);
  const isComplete = phase === 'playing' && qIdx >= deck.length && deck.length > 0;

  // When a fresh question becomes the active one (start of phase 1), pre-check
  // every category already made on the flop — these are guaranteed correct and
  // not something the user needs to "guess". Includes subsets (e.g. Two Pair
  // pre-checks Pair too) so the UI matches the grading semantics.
  useEffect(() => {
    if (phase !== 'playing' || subphase !== 'p1' || !analysis) return;
    const made = new Set(
      [...analysis.madeSet].filter(c => QUIZ_CATEGORIES.includes(c))
    );
    setP1Selected(prev => {
      // Only seed once per question — don't clobber user toggles after they've
      // started clicking. We detect "fresh question" as: every made category is
      // missing from prev (or prev is empty).
      if (prev.size > 0) {
        const allPresent = [...made].every(c => prev.has(c));
        if (allPresent) return prev;
      }
      const next = new Set(prev);
      for (const c of made) next.add(c);
      return next;
    });
  }, [qIdx, phase, subphase, analysis]);

  // Persist stats exactly once per completed run.
  useEffect(() => {
    if (!isComplete || statsSaved) return;
    const stats = getFlopCombosQuizStats() || initFlopCombosQuizStats();
    stats.totalQuizzes++;
    stats.totalQuestions += total;
    stats.totalCorrect += score;
    if (streak > stats.bestStreak) stats.bestStreak = streak;
    if (!stats.byCategory) stats.byCategory = {};
    for (const r of results) {
      stats.phase1Correct += r.grade.phase1Correct;
      stats.phase1Total   += r.grade.phase1Total;
      stats.phase2Correct += r.grade.phase2Correct;
      stats.phase2Total   += r.grade.phase2Total;
      for (const C of QUIZ_CATEGORIES) {
        const b = stats.byCategory[C] || { total: 0, correct: 0 };
        b.total += 1;
        if (r.grade.perCat[C].categoryRight) b.correct += 1;
        stats.byCategory[C] = b;
      }
    }
    stats.recentScores.push({ date: new Date().toLocaleDateString(), score, total });
    if (stats.recentScores.length > 20) stats.recentScores = stats.recentScores.slice(-20);
    saveFlopCombosQuizStats(stats);
    setStatsSaved(true);
  }, [isComplete, statsSaved, total, score, streak, results]);

  // Shared-link handler: when ?cq= appears or changes, rebuild from the
  // encoded cards and auto-start the quiz.
  useEffect(() => {
    const next = decodeCombosQuiz(query);
    if (!next) return;
    const sameDeck = sharedDeck
      && sharedDeck.length === next.deck.length
      && sharedDeck.every((q, i) => {
        const a = [...q.holes, ...q.flop];
        const b = [...next.deck[i].holes, ...next.deck[i].flop];
        return a.every((c, j) => c.rank === b[j].rank && c.suit === b[j].suit);
      });
    if (sameDeck) return;
    setSharedDeck(next.deck);
    setDeck(next.deck);
    setPhase('playing');
    setSubphase('p1');
    setQIdx(0);
    setP1Selected(new Set());
    setP2Outs({});
    setScore(0);
    setStreak(0);
    setTotal(0);
    setResults([]);
    setStatsSaved(false);
  }, [query?.cq]);

  function startQuiz() {
    const fresh = getSettings();
    setSettings(fresh);
    const newDeck = buildCombosDeck(fresh.quizLength);
    setDeck(newDeck);
    setQIdx(0);
    setP1Selected(new Set());
    setP2Outs({});
    setScore(0);
    setStreak(0);
    setTotal(0);
    setResults([]);
    setStatsSaved(false);
    setSubphase('p1');
    setPhase('playing');
  }

  function restart() {
    const fresh = getSettings();
    setSettings(fresh);
    const newDeck = sharedDeck ? sharedDeck : buildCombosDeck(fresh.quizLength);
    setDeck(newDeck);
    setQIdx(0);
    setP1Selected(new Set());
    setP2Outs({});
    setScore(0);
    setStreak(0);
    setTotal(0);
    setResults([]);
    setStatsSaved(false);
    setSubphase('p1');
  }

  function exitQuiz() {
    setPhase('setup');
    setSubphase('p1');
    setQIdx(0);
    setP1Selected(new Set());
    setP2Outs({});
    setScore(0);
    setStreak(0);
    setTotal(0);
    setResults([]);
    setStatsSaved(false);
  }

  function startFreshQuiz() {
    setSharedDeck(null);
    setDeck([]);
    exitQuiz();
    if (window.location.hash.includes('?cq=')) {
      window.location.hash = '#/quizzes/flop-combos';
    }
  }

  function toggleP1(cat) {
    if (subphase !== 'p1') return;
    // Made categories (and their subsets) are guaranteed correct — locked on.
    if (analysis && analysis.madeSet.has(cat)) return;
    setP1Selected(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  }

  function goToPhase2() {
    setSubphase('p2');
  }

  function submitPhase2() {
    const grade = gradeHand(analysis, p1Selected, p2Outs);
    if (grade.handCorrect) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
    setTotal(t => t + 1);
    setResults(r => [...r, { analysis, p1Selected: new Set(p1Selected), p2Outs: { ...p2Outs }, grade }]);
    setSubphase('fb');
  }

  function nextQuestion(e) {
    if (e?.currentTarget?.blur) e.currentTarget.blur();
    const next = qIdx + 1;
    setQIdx(next);
    setP1Selected(new Set());
    setP2Outs({});
    setSubphase('p1');
  }

  const shareQuery = encodeCombosQuiz(deck);
  const shareUrl = shareQuery ? buildShareUrl('/quizzes/flop-combos', shareQuery) : null;

  // ── Setup screen ──────────────────────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <div>
        <SubNav tabs={TABS} currentPath="/quizzes/flop-combos" />
        <div class="rq-panel">
          <h2 class="rq-title">Flop Combos &amp; Outs</h2>
          <p class="rq-sub">
            Each hand shows 2 hole cards and a 3-card flop. First, pick every hand category you could still make by the river. Then, for each category you picked, enter the number of <strong>single-card outs</strong> &mdash; cards that make the category if they arrive on the turn.
          </p>
          <div class="rq-setup-label">Categories you'll judge</div>
          <ul class="rq-texture-list combos-cat-list">
            {QUIZ_CATEGORIES.map(C => (
              <li key={C}><strong>{C}</strong></li>
            ))}
          </ul>
          <p class="rq-sub combos-setup-note">
            Runner-runner (backdoor) draws count as achievable, but their single-card outs are 0 &mdash; only the river probability reflects them.
          </p>
          <div class="rq-start-row">
            <button class="rq-start-btn" onClick={startQuiz}>Start Quiz</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Complete screen ───────────────────────────────────────────────────────
  if (isComplete) {
    const pct = total > 0 ? Math.round(score / total * 100) : 0;
    const msg = pct >= 90 ? 'Phenomenal — you read boards like a pro!' :
                pct >= 70 ? 'Well played — solid combinatorial chops.' :
                pct >= 40 ? 'Good start — review the categories and try again.' :
                            'Revisit hand rankings and come back sharper!';

    return (
      <div>
        <SubNav tabs={TABS} currentPath="/quizzes/flop-combos" />
        <div class="rq-panel">
          <div class="rq-complete">
            <h2>{pct >= 70 ? '🏆' : '🃏'} Quiz Complete</h2>
            <div class="score-big">{score} / {total} &mdash; {pct}%</div>
            <p>{msg}</p>
            <p class="combos-summary-sub">
              A hand counts as correct only when every category judgement (phase 1 and phase 2) is exact.
            </p>
            <button class="rq-restart" onClick={restart}>Play Again</button>
            {sharedDeck ? (
              <button class="rq-restart" style="background:transparent;border:1px solid var(--gold-dark)" onClick={startFreshQuiz}>New Random Quiz</button>
            ) : (
              <button class="rq-restart" style="background:transparent;border:1px solid var(--gold-dark)" onClick={exitQuiz}>Back to Setup</button>
            )}
            <a class="rq-restart" href="#/stats" style="background:transparent;border:1px solid var(--gold-dark);text-decoration:none;display:inline-block;text-align:center">Stats</a>
            <div class="share-row">
              <ShareButton url={shareUrl} label="Share Link" copiedLabel="Link Copied!" />
              <ShareButton
                content={shareUrl ? buildScoreMessage(score, total, shareUrl) : null}
                label="Share Score"
                copiedLabel="Message Copied!"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Playing screen ────────────────────────────────────────────────────────
  const pctDisplay = total > 0 ? Math.round(score / total * 100) + '%' : '—';
  const progress = Math.max(0, Math.min(1, qIdx / Math.max(1, deck.length)));
  const currentResult = results[qIdx]; // only defined in fb subphase

  return (
    <div class="rq-playing-wrapper">
      <div class="rq-panel">
        <div class="rq-playing-header">
          <div class="rq-mode-badge">Flop Combos{sharedDeck ? ' · Shared' : ''}</div>
          <button class="rq-exit-btn" onClick={sharedDeck ? startFreshQuiz : exitQuiz}>Exit</button>
        </div>

        <div class="rq-progress"><div class="rq-progress-fill" style={{ width: (progress * 100) + '%' }}></div></div>
        <div class="rq-status">
          <div class="rq-stat"><div class="val">{score}</div><div class="lbl">Correct</div></div>
          <div class="rq-stat"><div class="val">{qIdx + 1} / {deck.length}</div><div class="lbl">Question</div></div>
          <div class="rq-stat"><div class="val">{streak}</div><div class="lbl">Streak</div></div>
          <div class="rq-stat"><div class="val">{pctDisplay}</div><div class="lbl">Accuracy</div></div>
        </div>

        {current && analysis && (
          <>
            <div class="combos-board">
              <div class="combos-board-row">
                <div class="combos-board-lbl">Your hand</div>
                <div class="hand" dangerouslySetInnerHTML={{ __html: renderCards(current.holes) }} />
              </div>
              <div class="combos-board-row">
                <div class="combos-board-lbl">Flop</div>
                <div class="hand" dangerouslySetInnerHTML={{ __html: renderCards(current.flop) }} />
              </div>
            </div>

            {subphase === 'p1' && (
              <Phase1
                madeSet={analysis.madeSet}
                p1Selected={p1Selected}
                onToggle={toggleP1}
                onNext={goToPhase2}
              />
            )}

            {subphase === 'p2' && (
              <Phase2
                analysis={analysis}
                p1Selected={p1Selected}
                p2Outs={p2Outs}
                setP2Outs={setP2Outs}
                onSubmit={submitPhase2}
              />
            )}

            {subphase === 'fb' && currentResult && (
              <Feedback
                result={currentResult}
                onNext={nextQuestion}
                isLast={qIdx + 1 >= deck.length}
              />
            )}

            <div class="share-row">
              <ShareButton url={shareUrl} label="Share Link" copiedLabel="Link Copied!" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Phase1({ madeSet, p1Selected, onToggle, onNext }) {
  return (
    <>
      <div class="combos-phase-header">
        <span class="combos-phase-tag">Phase 1</span>
        <span class="combos-phase-q">Which categories are reachable by the river?</span>
      </div>
      <div class="combos-check-grid">
        {QUIZ_CATEGORIES.map(C => {
          const on = p1Selected.has(C);
          const locked = madeSet && madeSet.has(C);
          return (
            <button
              key={C}
              type="button"
              class={'combos-check' + (on ? ' on' : '') + (locked ? ' locked' : '')}
              aria-pressed={on}
              aria-disabled={locked || undefined}
              title={locked ? 'Already made on the flop' : undefined}
              onClick={() => onToggle(C)}
            >
              <span class="combos-check-box">{on ? '✓' : ''}</span>
              <span class="combos-check-lbl">{C}</span>
              {locked && <span class="combos-check-made">made</span>}
            </button>
          );
        })}
      </div>
      <div class="rq-next-row">
        <button class="rq-next" style="display:inline-block" onClick={onNext}>
          Check Answers →
        </button>
      </div>
    </>
  );
}

function Phase2({ analysis, p1Selected, p2Outs, setP2Outs, onSubmit }) {
  const toAnswer = QUIZ_CATEGORIES.filter(C => p1Selected.has(C));
  if (toAnswer.length === 0) {
    // Nothing selected → no outs to enter. Let the user confirm their phase-1 answer.
    return (
      <>
        <div class="combos-phase-header">
          <span class="combos-phase-tag">Phase 2</span>
          <span class="combos-phase-q">No categories selected — submit to see the answer.</span>
        </div>
        <div class="rq-next-row">
          <button class="rq-next" style="display:inline-block" onClick={onSubmit}>
            Submit →
          </button>
        </div>
      </>
    );
  }
  return (
    <>
      <div class="combos-phase-header">
        <span class="combos-phase-tag">Phase 2</span>
        <span class="combos-phase-q">How many single-card (turn) outs for each?</span>
      </div>
      <div class="combos-outs-grid">
        {toAnswer.map(C => {
          const made = analysis.madeSet.has(C);
          return (
            <div key={C} class="combos-outs-row">
              <div class="combos-outs-lbl">{C}</div>
              {made ? (
                <div class="combos-outs-made">Already made</div>
              ) : (
                <input
                  type="number"
                  min="0"
                  max="47"
                  class="combos-outs-input"
                  value={p2Outs[C] ?? ''}
                  onInput={(e) => setP2Outs(prev => ({ ...prev, [C]: e.currentTarget.value }))}
                  placeholder="#"
                />
              )}
            </div>
          );
        })}
      </div>
      <div class="rq-next-row">
        <button class="rq-next" style="display:inline-block" onClick={onSubmit}>
          Submit →
        </button>
      </div>
    </>
  );
}

function Feedback({ result, onNext, isLast }) {
  const { analysis, grade, p2Outs } = result;
  return (
    <>
      <div class="combos-phase-header">
        <span class={'combos-phase-tag' + (grade.handCorrect ? ' ok' : ' bad')}>
          {grade.handCorrect ? 'All correct' : 'Some mistakes'}
        </span>
        <span class="combos-phase-q">Review</span>
      </div>
      <div class="combos-fb-list">
        {QUIZ_CATEGORIES.map(C => {
          const pc = grade.perCat[C];
          const actualOuts = analysis.turnOuts[C];
          const prob = analysis.riverProb[C];
          const entered = p2Outs[C];
          const askedOuts = pc.userSelected && !pc.made;
          const rowCls = 'combos-fb-row '
            + (pc.categoryRight ? 'ok' : (pc.trueReachable || pc.userSelected ? 'bad' : 'dim'));
          return (
            <div key={C} class={rowCls}>
              <div class="combos-fb-head">
                <span class="combos-fb-cat">{C}</span>
                {pc.made && <span class="combos-fb-badge made">Made on flop</span>}
                {pc.trueReachable && !pc.made && <span class="combos-fb-badge reachable">Reachable</span>}
                {!pc.trueReachable && <span class="combos-fb-badge unreach">Not reachable</span>}
              </div>
              <div class="combos-fb-line">
                <span class="combos-fb-k">Your pick:</span>
                <span class={'combos-fb-v ' + (pc.phase1Right ? 'ok' : 'bad')}>
                  {pc.userSelected ? 'Reachable' : 'Not reachable'}
                  {' '}{pc.phase1Right ? '✓' : '✗'}
                </span>
              </div>
              {askedOuts && (
                <div class="combos-fb-line">
                  <span class="combos-fb-k">Your outs:</span>
                  <span class={'combos-fb-v ' + (pc.phase2Right ? 'ok' : 'bad')}>
                    {entered === '' || entered == null ? '—' : entered}
                    {' '}vs. actual <strong>{actualOuts.count}</strong>
                    {' '}{pc.phase2Right ? '✓' : '✗'}
                  </span>
                </div>
              )}
              {pc.trueReachable && (
                <div class="combos-fb-line">
                  <span class="combos-fb-k">River probability:</span>
                  <span class="combos-fb-v">
                    <strong>{fmtPct(prob)}</strong>
                    {!pc.made && (actualOuts.count > 0
                      ? <> &middot; rule of 4: ≈{ruleOfFour(actualOuts.count)}</>
                      : <> &middot; runner-runner (no turn outs)</>)}
                  </span>
                </div>
              )}
              {!pc.made && actualOuts.count > 0 && (
                <div class="combos-fb-outs">
                  <div class="combos-fb-k">Turn outs ({actualOuts.count}):</div>
                  <div class="hand combos-fb-outs-cards"
                       dangerouslySetInnerHTML={{ __html: renderCards(actualOuts.cards, 34, 48) }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div class="rq-next-row">
        <button class="rq-next" style="display:inline-block" onClick={onNext}>
          {isLast ? 'Finish' : 'Next Question'} →
        </button>
      </div>
    </>
  );
}
