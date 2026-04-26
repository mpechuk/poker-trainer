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
  analyzeWithTurn,
  buildCombosDeck,
  randomTurnCard,
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

// Toggle one cell of the phase-1 reachability table. When the user turns a
// category's "By Turn" ON, "By River" auto-selects too — anything reachable
// in one card is reachable in two. Turning "By Turn" OFF leaves the river
// selection alone, since the user may still want to flag a backdoor
// (river-only) draw. River clicks are a plain toggle.
export function toggleReach(p1Turn, p1River, cat, horizon) {
  if (horizon === 'turn') {
    const nextTurn = new Set(p1Turn);
    if (p1Turn.has(cat)) {
      nextTurn.delete(cat);
      return { p1Turn: nextTurn, p1River };
    }
    nextTurn.add(cat);
    if (p1River.has(cat)) return { p1Turn: nextTurn, p1River };
    const nextRiver = new Set(p1River);
    nextRiver.add(cat);
    return { p1Turn: nextTurn, p1River: nextRiver };
  }
  const nextRiver = new Set(p1River);
  if (nextRiver.has(cat)) nextRiver.delete(cat); else nextRiver.add(cat);
  return { p1Turn, p1River: nextRiver };
}

// Question grading: returns per-category status + whether the hand is perfect.
// For each category C:
//   turnRight:    user's flop "reachable by turn" ✓/✗ matches truth
//   riverRight:   user's flop "reachable by river" ✓/✗ matches truth
//   phase2Right:  if category was selected as by-turn and is not made on the
//                 flop, user's turn-out count exactly matches actual; otherwise
//                 null (not applicable — no turn outs to count)
//   phase3Right:  user's post-turn "reachable by river" ✓/✗ matches truth
//                 (null when the turn snapshot has not been graded yet)
//   phase4Right:  if category was selected as river-reachable post-turn and
//                 is not made after the turn, user's river-out count exactly
//                 matches actual; otherwise null
//   categoryRight: every applicable judgement above is right
//
// Phase 1 contributes 2 judgements per category (turn + river). Phase 2 only
// kicks in for categories the user marked as reachable-by-turn and that aren't
// already made on the flop. Phase 3 contributes 1 post-turn judgement per
// category. Phase 4 only kicks in for categories the user marked as river-
// reachable post-turn and that aren't already made after the turn. Categories
// marked as river-only (backdoor) on the flop have 0 turn outs by definition;
// we skip the input rather than force "0". Same applies to backdoor → no
// river outs after a brick turn.
export function gradeHand(analysis, p1Turn, p1River, p2Outs, turnAnalysis, p3River, p4Outs) {
  const perCat = {};
  let phase1TurnCorrect = 0;
  let phase1RiverCorrect = 0;
  let phase2Correct = 0;
  let phase2Asked = 0;
  let phase3Correct = 0;
  let phase4Correct = 0;
  let phase4Asked = 0;
  const madeSet = analysis.madeSet || new Set([analysis.made]);
  const turnMadeSet = turnAnalysis ? (turnAnalysis.madeSet || new Set([turnAnalysis.made])) : null;
  const turnGraded = !!turnAnalysis;
  for (const C of QUIZ_CATEGORIES) {
    const trueByTurn = analysis.reachableByTurn.has(C);
    const trueByRiver = analysis.reachableByRiver.has(C);
    const userByTurn = p1Turn.has(C);
    const userByRiver = p1River.has(C);
    const turnRight = trueByTurn === userByTurn;
    const riverRight = trueByRiver === userByRiver;
    if (turnRight) phase1TurnCorrect += 1;
    if (riverRight) phase1RiverCorrect += 1;

    const made = madeSet.has(C);
    const askedInP2 = userByTurn && !made;
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

    let phase3Right = null;
    let phase4Right = null;
    let trueRiverPostTurn = null;
    let userRiverPostTurn = null;
    let madePostTurn = null;
    if (turnGraded) {
      trueRiverPostTurn = turnAnalysis.reachableByRiver.has(C);
      userRiverPostTurn = (p3River || new Set()).has(C);
      phase3Right = trueRiverPostTurn === userRiverPostTurn;
      if (phase3Right) phase3Correct += 1;
      madePostTurn = turnMadeSet.has(C);

      const askedInP4 = userRiverPostTurn && !madePostTurn;
      if (askedInP4) {
        phase4Asked += 1;
        const actual = turnAnalysis.riverOuts[C].count;
        const entered = Number((p4Outs || {})[C]);
        if (Number.isFinite(entered) && entered === actual) {
          phase4Right = true;
          phase4Correct += 1;
        } else {
          phase4Right = false;
        }
      }
    }

    const categoryRight = turnRight && riverRight
      && phase2Right !== false
      && phase3Right !== false
      && phase4Right !== false;
    perCat[C] = {
      turnRight,
      riverRight,
      phase2Right,
      phase3Right,
      phase4Right,
      categoryRight,
      trueByTurn,
      trueByRiver,
      userByTurn,
      userByRiver,
      made,
      trueRiverPostTurn,
      userRiverPostTurn,
      madePostTurn,
    };
  }
  const allCorrect = Object.values(perCat).every(x => x.categoryRight);
  return {
    perCat,
    phase1Correct: phase1TurnCorrect + phase1RiverCorrect,
    phase1Total: QUIZ_CATEGORIES.length * 2,
    phase1TurnCorrect,
    phase1RiverCorrect,
    phase1TurnTotal: QUIZ_CATEGORIES.length,
    phase1RiverTotal: QUIZ_CATEGORIES.length,
    phase2Correct,
    phase2Total: phase2Asked,
    phase3Correct,
    phase3Total: turnGraded ? QUIZ_CATEGORIES.length : 0,
    phase4Correct,
    phase4Total: phase4Asked,
    handCorrect: allCorrect,
  };
}

// Hydrate any deck question that lacks a turn card (legacy 10-char shared
// links or freshly-built mocks) with a deterministic random turn rolled from
// the cards left in the deck after hole+flop. This keeps phase-3 always
// renderable without sprinkling null-checks through the playing UI.
export function ensureDeckHasTurns(deck) {
  return deck.map(q => {
    if (q.turn) return q;
    return { ...q, turn: randomTurnCard([...q.holes, ...q.flop]) };
  });
}

export function CombosQuiz({ query }) {
  const sharedInit = decodeCombosQuiz(query);
  const [settings, setSettings] = useState(() => getSettings());
  const [phase, setPhase] = useState(sharedInit ? 'playing' : 'setup');
  const [subphase, setSubphase] = useState('p1');
  const [sharedDeck, setSharedDeck] = useState(() => sharedInit ? ensureDeckHasTurns(sharedInit.deck) : null);
  const [deck, setDeck] = useState(() => sharedInit ? ensureDeckHasTurns(sharedInit.deck) : []);
  const [qIdx, setQIdx] = useState(0);
  const [p1Turn, setP1Turn] = useState(() => new Set());
  const [p1River, setP1River] = useState(() => new Set());
  const [p2Outs, setP2Outs] = useState({});
  const [p3River, setP3River] = useState(() => new Set());
  const [p4Outs, setP4Outs] = useState({});
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [total, setTotal] = useState(0);
  const [results, setResults] = useState([]);
  const [statsSaved, setStatsSaved] = useState(false);

  const current = deck[qIdx];
  const analysis = useMemo(() => (current ? analyzeQuestion(current.holes, current.flop) : null), [current]);
  const turnAnalysis = useMemo(
    () => (current?.turn ? analyzeWithTurn(current.holes, current.flop, current.turn) : null),
    [current]
  );
  const isComplete = phase === 'playing' && qIdx >= deck.length && deck.length > 0;

  // When a fresh question becomes the active one (start of phase 1), pre-check
  // every category already made on the flop — these are guaranteed correct
  // (both by-turn and by-river) and not something the user needs to "guess".
  // Includes subsets (e.g. Two Pair pre-checks Pair too) so the UI matches the
  // grading semantics.
  useEffect(() => {
    if (phase !== 'playing' || subphase !== 'p1' || !analysis) return;
    const made = new Set(
      [...analysis.madeSet].filter(c => QUIZ_CATEGORIES.includes(c))
    );
    const seed = (prev) => {
      // Only seed once per question — don't clobber user toggles after they've
      // started clicking. We detect "fresh question" as: every made category
      // is missing from prev (or prev is empty).
      if (prev.size > 0) {
        const allPresent = [...made].every(c => prev.has(c));
        if (allPresent) return prev;
      }
      const next = new Set(prev);
      for (const c of made) next.add(c);
      return next;
    };
    setP1Turn(seed);
    setP1River(seed);
  }, [qIdx, phase, subphase, analysis]);

  // Same auto-seed pattern for phase 3: pre-check every category made after
  // the turn is revealed. This includes any draws from the flop that hit on
  // the turn, plus the original flop-made categories that survive.
  useEffect(() => {
    if (phase !== 'playing' || subphase !== 'p3' || !turnAnalysis) return;
    const made = new Set(
      [...turnAnalysis.madeSet].filter(c => QUIZ_CATEGORIES.includes(c))
    );
    setP3River((prev) => {
      if (prev.size > 0) {
        const allPresent = [...made].every(c => prev.has(c));
        if (allPresent) return prev;
      }
      const next = new Set(prev);
      for (const c of made) next.add(c);
      return next;
    });
  }, [qIdx, phase, subphase, turnAnalysis]);

  // Persist stats exactly once per completed run.
  useEffect(() => {
    if (!isComplete || statsSaved) return;
    const stats = getFlopCombosQuizStats() || initFlopCombosQuizStats();
    stats.totalQuizzes++;
    stats.totalQuestions += total;
    stats.totalCorrect += score;
    if (streak > stats.bestStreak) stats.bestStreak = streak;
    if (!stats.byCategory) stats.byCategory = {};
    if (typeof stats.phase3Correct !== 'number') stats.phase3Correct = 0;
    if (typeof stats.phase3Total !== 'number') stats.phase3Total = 0;
    if (typeof stats.phase4Correct !== 'number') stats.phase4Correct = 0;
    if (typeof stats.phase4Total !== 'number') stats.phase4Total = 0;
    for (const r of results) {
      stats.phase1Correct += r.grade.phase1Correct;
      stats.phase1Total   += r.grade.phase1Total;
      stats.phase2Correct += r.grade.phase2Correct;
      stats.phase2Total   += r.grade.phase2Total;
      stats.phase3Correct += r.grade.phase3Correct;
      stats.phase3Total   += r.grade.phase3Total;
      stats.phase4Correct += r.grade.phase4Correct;
      stats.phase4Total   += r.grade.phase4Total;
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
  // encoded cards and auto-start the quiz. Legacy 10-char shares with no turn
  // are hydrated with a random turn so phase 3 always has a card to reveal.
  useEffect(() => {
    const next = decodeCombosQuiz(query);
    if (!next) return;
    const hydrated = ensureDeckHasTurns(next.deck);
    const sameDeck = sharedDeck
      && sharedDeck.length === hydrated.length
      && sharedDeck.every((q, i) => {
        const a = [...q.holes, ...q.flop];
        const b = [...hydrated[i].holes, ...hydrated[i].flop];
        return a.every((c, j) => c.rank === b[j].rank && c.suit === b[j].suit);
      });
    if (sameDeck) return;
    setSharedDeck(hydrated);
    setDeck(hydrated);
    setPhase('playing');
    setSubphase('p1');
    setQIdx(0);
    setP1Turn(new Set());
    setP1River(new Set());
    setP2Outs({});
    setP3River(new Set());
    setP4Outs({});
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
    setP1Turn(new Set());
    setP1River(new Set());
    setP2Outs({});
    setP3River(new Set());
    setP4Outs({});
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
    setP1Turn(new Set());
    setP1River(new Set());
    setP2Outs({});
    setP3River(new Set());
    setP4Outs({});
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
    setP1Turn(new Set());
    setP1River(new Set());
    setP2Outs({});
    setP3River(new Set());
    setP4Outs({});
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

  function toggleP1(cat, horizon) {
    if (subphase !== 'p1') return;
    // Made categories (and their subsets) are guaranteed correct — locked on
    // for both horizons.
    if (analysis && analysis.madeSet.has(cat)) return;
    const { p1Turn: nextTurn, p1River: nextRiver } = toggleReach(p1Turn, p1River, cat, horizon);
    if (nextTurn !== p1Turn) setP1Turn(nextTurn);
    if (nextRiver !== p1River) setP1River(nextRiver);
  }

  function toggleP3(cat) {
    if (subphase !== 'p3') return;
    // Categories made after the turn are guaranteed correct — locked on.
    if (turnAnalysis && turnAnalysis.madeSet.has(cat)) return;
    setP3River(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  }

  function goToPhase2() {
    setSubphase('p2');
  }

  // Submit phase 2 → reveal turn → phase 3. The hand is graded only after
  // phase 4 so all four phases contribute to the per-hand correct/incorrect.
  function submitPhase2() {
    setSubphase('p3');
  }

  function goToPhase4() {
    setSubphase('p4');
  }

  function submitPhase4() {
    const grade = gradeHand(analysis, p1Turn, p1River, p2Outs, turnAnalysis, p3River, p4Outs);
    if (grade.handCorrect) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
    setTotal(t => t + 1);
    setResults(r => [...r, {
      analysis,
      turnAnalysis,
      turnCard: current?.turn,
      p1Turn: new Set(p1Turn),
      p1River: new Set(p1River),
      p2Outs: { ...p2Outs },
      p3River: new Set(p3River),
      p4Outs: { ...p4Outs },
      grade,
    }]);
    setSubphase('fb');
  }

  function nextQuestion(e) {
    if (e?.currentTarget?.blur) e.currentTarget.blur();
    const next = qIdx + 1;
    setQIdx(next);
    setP1Turn(new Set());
    setP1River(new Set());
    setP2Outs({});
    setP3River(new Set());
    setP4Outs({});
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
            Each hand shows 2 hole cards and a 3-card flop. First, classify every hand category twice: is it reachable <strong>by the turn</strong> (one more card) and is it reachable <strong>by the river</strong> (two more cards)? Then, for each category you marked as reachable by the turn, enter the number of <strong>single-card outs</strong> &mdash; cards that make the category if they arrive on the turn. Once you submit, a random <strong>turn card</strong> is revealed and you'll repeat the exercise for the river: mark every category still reachable in one card, then enter the river outs.
          </p>
          <div class="rq-setup-label">Categories you'll judge</div>
          <ul class="rq-texture-list combos-cat-list">
            {QUIZ_CATEGORIES.map(C => (
              <li key={C}><strong>{C}</strong></li>
            ))}
          </ul>
          <p class="rq-sub combos-setup-note">
            Backdoor (runner-runner) draws are reachable by the river but not by the turn &mdash; mark only the river column for them.
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
              A hand counts as correct only when every category judgement is exact across all four phases (flop reachability + outs and river reachability + outs after the turn).
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
              {(subphase === 'p3' || subphase === 'p4' || subphase === 'fb') && current.turn && (
                <div class="combos-board-row combos-board-turn">
                  <div class="combos-board-lbl">Turn</div>
                  <div class="hand" dangerouslySetInnerHTML={{ __html: renderCards([current.turn]) }} />
                </div>
              )}
            </div>

            {subphase === 'p1' && (
              <Phase1
                madeSet={analysis.madeSet}
                p1Turn={p1Turn}
                p1River={p1River}
                onToggle={toggleP1}
                onNext={goToPhase2}
              />
            )}

            {subphase === 'p2' && (
              <Phase2
                analysis={analysis}
                p1Turn={p1Turn}
                p2Outs={p2Outs}
                setP2Outs={setP2Outs}
                onSubmit={submitPhase2}
              />
            )}

            {subphase === 'p3' && turnAnalysis && (
              <Phase3
                madeSet={turnAnalysis.madeSet}
                p3River={p3River}
                onToggle={toggleP3}
                onNext={goToPhase4}
              />
            )}

            {subphase === 'p4' && turnAnalysis && (
              <Phase4
                turnAnalysis={turnAnalysis}
                p3River={p3River}
                p4Outs={p4Outs}
                setP4Outs={setP4Outs}
                onSubmit={submitPhase4}
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

function Phase1({ madeSet, p1Turn, p1River, onToggle, onNext }) {
  return (
    <>
      <div class="combos-phase-header">
        <span class="combos-phase-tag">Phase 1</span>
        <span class="combos-phase-q">For each category, mark whether it's reachable by the turn and by the river.</span>
      </div>
      <div class="combos-reach-table" role="table">
        <div class="combos-reach-head" role="row">
          <div class="combos-reach-cat" role="columnheader">Category</div>
          <div class="combos-reach-col-h" role="columnheader" title="Reachable after one more card">By&nbsp;Turn</div>
          <div class="combos-reach-col-h" role="columnheader" title="Reachable after both turn and river">By&nbsp;River</div>
        </div>
        {QUIZ_CATEGORIES.map(C => {
          const turnOn = p1Turn.has(C);
          const riverOn = p1River.has(C);
          const locked = madeSet && madeSet.has(C);
          const lockTitle = locked ? 'Already made on the flop' : undefined;
          return (
            <div class={'combos-reach-row' + (locked ? ' locked' : '')} role="row" key={C}>
              <div class="combos-reach-cat" role="cell">
                <span class="combos-reach-cat-lbl">{C}</span>
                {locked && <span class="combos-check-made">made</span>}
              </div>
              <div class="combos-reach-cell" role="cell">
                <button
                  type="button"
                  class={'combos-reach-btn' + (turnOn ? ' on' : '') + (locked ? ' locked' : '')}
                  aria-pressed={turnOn}
                  aria-label={`${C} reachable by turn`}
                  aria-disabled={locked || undefined}
                  title={lockTitle}
                  onClick={() => onToggle(C, 'turn')}
                >
                  <span class="combos-check-box">{turnOn ? '✓' : ''}</span>
                </button>
              </div>
              <div class="combos-reach-cell" role="cell">
                <button
                  type="button"
                  class={'combos-reach-btn' + (riverOn ? ' on' : '') + (locked ? ' locked' : '')}
                  aria-pressed={riverOn}
                  aria-label={`${C} reachable by river`}
                  aria-disabled={locked || undefined}
                  title={lockTitle}
                  onClick={() => onToggle(C, 'river')}
                >
                  <span class="combos-check-box">{riverOn ? '✓' : ''}</span>
                </button>
              </div>
            </div>
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

function Phase2({ analysis, p1Turn, p2Outs, setP2Outs, onSubmit }) {
  // Phase 2 only asks for outs on categories the user marked as reachable
  // by the turn — those are the ones with concrete turn outs to count.
  // Categories marked as river-only (backdoor) have 0 turn outs by definition.
  const toAnswer = QUIZ_CATEGORIES.filter(C => p1Turn.has(C));
  if (toAnswer.length === 0) {
    return (
      <>
        <div class="combos-phase-header">
          <span class="combos-phase-tag">Phase 2</span>
          <span class="combos-phase-q">No turn-reachable categories selected — submit to see the answer.</span>
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

function Phase3({ madeSet, p3River, onToggle, onNext }) {
  return (
    <>
      <div class="combos-phase-header">
        <span class="combos-phase-tag">Phase 3</span>
        <span class="combos-phase-q">Turn revealed. For each category, mark whether it's still reachable by the river (one more card).</span>
      </div>
      <div class="combos-reach-table" role="table">
        <div class="combos-reach-head combos-reach-head-single" role="row">
          <div class="combos-reach-cat" role="columnheader">Category</div>
          <div class="combos-reach-col-h" role="columnheader" title="Reachable after the river">By&nbsp;River</div>
        </div>
        {QUIZ_CATEGORIES.map(C => {
          const riverOn = p3River.has(C);
          const locked = madeSet && madeSet.has(C);
          const lockTitle = locked ? 'Already made after the turn' : undefined;
          return (
            <div class={'combos-reach-row combos-reach-row-single' + (locked ? ' locked' : '')} role="row" key={C}>
              <div class="combos-reach-cat" role="cell">
                <span class="combos-reach-cat-lbl">{C}</span>
                {locked && <span class="combos-check-made">made</span>}
              </div>
              <div class="combos-reach-cell" role="cell">
                <button
                  type="button"
                  class={'combos-reach-btn' + (riverOn ? ' on' : '') + (locked ? ' locked' : '')}
                  aria-pressed={riverOn}
                  aria-label={`${C} reachable by river after turn`}
                  aria-disabled={locked || undefined}
                  title={lockTitle}
                  onClick={() => onToggle(C)}
                >
                  <span class="combos-check-box">{riverOn ? '✓' : ''}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div class="rq-next-row">
        <button class="rq-next" style="display:inline-block" onClick={onNext}>
          Next →
        </button>
      </div>
    </>
  );
}

function Phase4({ turnAnalysis, p3River, p4Outs, setP4Outs, onSubmit }) {
  // Phase 4 only asks for outs on categories the user marked as reachable
  // by the river after the turn — those are the ones with concrete river outs
  // to count. Categories already made after the turn skip the input.
  const toAnswer = QUIZ_CATEGORIES.filter(C => p3River.has(C));
  if (toAnswer.length === 0) {
    return (
      <>
        <div class="combos-phase-header">
          <span class="combos-phase-tag">Phase 4</span>
          <span class="combos-phase-q">No river-reachable categories selected — submit to see the answer.</span>
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
        <span class="combos-phase-tag">Phase 4</span>
        <span class="combos-phase-q">How many single-card (river) outs for each?</span>
      </div>
      <div class="combos-outs-grid">
        {toAnswer.map(C => {
          const made = turnAnalysis.madeSet.has(C);
          return (
            <div key={C} class="combos-outs-row">
              <div class="combos-outs-lbl">{C}</div>
              {made ? (
                <div class="combos-outs-made">Already made</div>
              ) : (
                <input
                  type="number"
                  min="0"
                  max="46"
                  class="combos-outs-input"
                  value={p4Outs[C] ?? ''}
                  onInput={(e) => setP4Outs(prev => ({ ...prev, [C]: e.currentTarget.value }))}
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
  const { analysis, turnAnalysis, grade, p2Outs, p4Outs } = result;
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
          const askedOuts = pc.userByTurn && !pc.made;
          const anyTouched = pc.trueByTurn || pc.trueByRiver
            || pc.userByTurn || pc.userByRiver
            || pc.trueRiverPostTurn || pc.userRiverPostTurn;
          const rowCls = 'combos-fb-row '
            + (pc.categoryRight ? 'ok' : (anyTouched ? 'bad' : 'dim'));
          let badgeLabel, badgeCls;
          if (pc.made) { badgeLabel = 'Made on flop'; badgeCls = 'made'; }
          else if (pc.trueByTurn) { badgeLabel = 'Reachable by turn'; badgeCls = 'reachable'; }
          else if (pc.trueByRiver) { badgeLabel = 'Backdoor (river only)'; badgeCls = 'reachable'; }
          else { badgeLabel = 'Not reachable'; badgeCls = 'unreach'; }

          const turnRiverActual = turnAnalysis ? turnAnalysis.riverOuts[C] : null;
          const askedRiverOuts = pc.userRiverPostTurn && !pc.madePostTurn;
          const enteredRiverOuts = (p4Outs || {})[C];

          let postBadgeLabel = null, postBadgeCls = '';
          if (turnAnalysis) {
            if (pc.madePostTurn) { postBadgeLabel = 'Made after turn'; postBadgeCls = 'made'; }
            else if (pc.trueRiverPostTurn) { postBadgeLabel = 'Reachable by river'; postBadgeCls = 'reachable'; }
            else { postBadgeLabel = 'Not reachable'; postBadgeCls = 'unreach'; }
          }

          return (
            <div key={C} class={rowCls}>
              <div class="combos-fb-head">
                <span class="combos-fb-cat">{C}</span>
                <span class={'combos-fb-badge ' + badgeCls}>{badgeLabel}</span>
              </div>
              <div class="combos-fb-section-lbl">On the flop</div>
              <div class="combos-fb-line">
                <span class="combos-fb-k">By turn:</span>
                <span class={'combos-fb-v ' + (pc.turnRight ? 'ok' : 'bad')}>
                  you said <strong>{pc.userByTurn ? 'yes' : 'no'}</strong>
                  {' '}&middot; actual <strong>{pc.trueByTurn ? 'yes' : 'no'}</strong>
                  {' '}{pc.turnRight ? '✓' : '✗'}
                </span>
              </div>
              <div class="combos-fb-line">
                <span class="combos-fb-k">By river:</span>
                <span class={'combos-fb-v ' + (pc.riverRight ? 'ok' : 'bad')}>
                  you said <strong>{pc.userByRiver ? 'yes' : 'no'}</strong>
                  {' '}&middot; actual <strong>{pc.trueByRiver ? 'yes' : 'no'}</strong>
                  {' '}{pc.riverRight ? '✓' : '✗'}
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
              {(pc.trueByTurn || pc.trueByRiver) && (
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

              {turnAnalysis && (
                <>
                  <div class="combos-fb-section-lbl">After the turn</div>
                  {postBadgeLabel && (
                    <div class="combos-fb-line">
                      <span class="combos-fb-k">Status:</span>
                      <span class={'combos-fb-badge ' + postBadgeCls}>{postBadgeLabel}</span>
                    </div>
                  )}
                  <div class="combos-fb-line">
                    <span class="combos-fb-k">By river:</span>
                    <span class={'combos-fb-v ' + (pc.phase3Right ? 'ok' : 'bad')}>
                      you said <strong>{pc.userRiverPostTurn ? 'yes' : 'no'}</strong>
                      {' '}&middot; actual <strong>{pc.trueRiverPostTurn ? 'yes' : 'no'}</strong>
                      {' '}{pc.phase3Right ? '✓' : '✗'}
                    </span>
                  </div>
                  {askedRiverOuts && turnRiverActual && (
                    <div class="combos-fb-line">
                      <span class="combos-fb-k">Your river outs:</span>
                      <span class={'combos-fb-v ' + (pc.phase4Right ? 'ok' : 'bad')}>
                        {enteredRiverOuts === '' || enteredRiverOuts == null ? '—' : enteredRiverOuts}
                        {' '}vs. actual <strong>{turnRiverActual.count}</strong>
                        {' '}{pc.phase4Right ? '✓' : '✗'}
                      </span>
                    </div>
                  )}
                  {!pc.madePostTurn && turnRiverActual && turnRiverActual.count > 0 && (
                    <div class="combos-fb-outs">
                      <div class="combos-fb-k">River outs ({turnRiverActual.count}):</div>
                      <div class="hand combos-fb-outs-cards"
                           dangerouslySetInnerHTML={{ __html: renderCards(turnRiverActual.cards, 34, 48) }} />
                    </div>
                  )}
                </>
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
