import { useState, useCallback, useEffect } from 'preact/hooks';
import { SubNav } from '../../components/SubNav.jsx';
import { FilterChips } from '../../components/FilterChips.jsx';
import { Recommendation } from '../../components/Recommendation.jsx';
import { ShareButton } from '../../components/ShareButton.jsx';
import { useFilters } from '../../hooks/useFilters.js';
import { TERMS } from '../../data/terms.js';
import { shuffle } from '../../utils/shuffle.js';
import { getIllus } from '../../utils/illustrations.jsx';
import { getTermQuizStats, saveTermQuizStats, initTermQuizStats, getSettings } from '../../utils/storage.js';
import { encodeTermQuiz, decodeTermQuiz, buildShareUrl, buildScoreMessage } from '../../utils/share.js';
import '../../styles/quiz.css';

const TABS = [
  { path: '/quizzes/preflop', label: 'Preflop' },
  { path: '/quizzes/flop', label: 'Flop Texture' },
  { path: '/quizzes/flop-combos', label: 'Flop Combos' },
  { path: '/quizzes/terminology', label: 'Terminology' },
];

export function buildDeck(cats, length = Infinity) {
  const deck = shuffle(TERMS.filter(t => cats.has(t.cat)));
  return Number.isFinite(length) ? deck.slice(0, Math.max(0, length)) : deck;
}

export function buildOptions(deck, idx) {
  if (idx >= deck.length) return [];
  const t = deck[idx];
  // Wrong answers come from the same topic pool as the deck — selecting
  // "Hand Rankings" only shouldn't surface a "Positions" term as a distractor.
  const deckCats = new Set(deck.map(x => x.cat));
  const wrong = TERMS.filter(x => x.term !== t.term && deckCats.has(x.cat));
  const picked = shuffle(wrong).slice(0, 3);
  return shuffle([...picked, t]);
}

export function Quiz({ path, query }) {
  const shared = decodeTermQuiz(query);
  const { activeCats, toggleCat } = useFilters();
  const [settings, setSettings] = useState(() => getSettings());
  const [phase, setPhase] = useState(shared ? 'playing' : 'setup');
  const [sharedDeck, setSharedDeck] = useState(() => shared?.deck || null);
  const [quizDeck, setQuizDeck] = useState(() => shared?.deck || []);
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [total, setTotal] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [options, setOptions] = useState(() => (shared?.deck ? buildOptions(shared.deck, 0) : []));
  const [countdown, setCountdown] = useState(settings.autoAdvanceSeconds);
  const [perQuestionResults, setPerQuestionResults] = useState([]);

  // If the URL's ?tq= query changes (e.g. opening a shared link while already
  // on the quiz), rebuild the deck from the shared terms and jump straight
  // into playing — mirrors the preflop shared-link behavior.
  useEffect(() => {
    const next = decodeTermQuiz(query);
    if (!next) return;
    const sameDeck = sharedDeck
      && sharedDeck.length === next.deck.length
      && sharedDeck.every((t, i) => t.term === next.deck[i].term);
    if (sameDeck) return;
    setSharedDeck(next.deck);
    setQuizDeck(next.deck);
    setPhase('playing');
    setQIdx(0);
    setScore(0);
    setStreak(0);
    setTotal(0);
    setAnswered(false);
    setSelectedAnswer(null);
    setOptions(buildOptions(next.deck, 0));
    setPerQuestionResults([]);
  }, [query?.tq]);

  function startQuiz() {
    // Entered from the setup screen's Start button. Reads fresh settings so
    // quizLength/autoAdvance changes made on the Settings page take effect
    // without requiring a reload.
    const fresh = getSettings();
    setSettings(fresh);
    const newDeck = buildDeck(activeCats, fresh.quizLength);
    setQuizDeck(newDeck);
    setQIdx(0);
    setScore(0);
    setStreak(0);
    setTotal(0);
    setAnswered(false);
    setSelectedAnswer(null);
    setOptions(buildOptions(newDeck, 0));
    setPerQuestionResults([]);
    setPhase('playing');
  }

  function restart() {
    // "Play Again" from the complete screen — stays in playing phase.
    // Shared quizzes replay the same deck so the share link stays reproducible.
    const fresh = getSettings();
    setSettings(fresh);
    const newDeck = sharedDeck ? sharedDeck : buildDeck(activeCats, fresh.quizLength);
    setQuizDeck(newDeck);
    setQIdx(0);
    setScore(0);
    setStreak(0);
    setTotal(0);
    setAnswered(false);
    setSelectedAnswer(null);
    setOptions(buildOptions(newDeck, 0));
    setPerQuestionResults([]);
  }

  function exitQuiz() {
    setPhase('setup');
    setQIdx(0);
    setScore(0);
    setStreak(0);
    setTotal(0);
    setAnswered(false);
    setSelectedAnswer(null);
    setPerQuestionResults([]);
  }

  function startFreshQuiz() {
    // Dropping out of a shared deck returns the user to the setup screen so
    // they can pick topics before the random quiz starts.
    setSharedDeck(null);
    setQuizDeck([]);
    setQIdx(0);
    setScore(0);
    setStreak(0);
    setTotal(0);
    setAnswered(false);
    setSelectedAnswer(null);
    setPerQuestionResults([]);
    setPhase('setup');
    if (window.location.hash.includes('?tq=')) {
      window.location.hash = '#/quizzes/terminology';
    }
  }

  const shareQuery = encodeTermQuiz(quizDeck);
  const shareUrl = shareQuery ? buildShareUrl('/quizzes/terminology', shareQuery) : null;

  const answerQuiz = useCallback((chosen) => {
    if (answered) return;
    setAnswered(true);
    setSelectedAnswer(chosen);
    const current = quizDeck[qIdx];
    const correct = current.term;
    const isCorrect = chosen === correct;
    if (isCorrect) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
    setTotal(t => t + 1);
    setPerQuestionResults(r => [...r, { cat: current.cat, correct: isCorrect }]);
  }, [answered, quizDeck, qIdx]);

  function nextQuiz(e) {
    if (e?.currentTarget?.blur) e.currentTarget.blur();
    const nextIdx = qIdx + 1;
    setQIdx(nextIdx);
    setAnswered(false);
    setSelectedAnswer(null);
    setOptions(buildOptions(quizDeck, nextIdx));
  }

  // Auto-advance after answering — only runs when the user has enabled it in
  // settings. Cleanup cancels the timer when the user clicks Next manually or
  // exits the quiz.
  useEffect(() => {
    if (!answered || phase !== 'playing') return;
    if (!settings.autoAdvance) return;
    const start = settings.autoAdvanceSeconds;
    setCountdown(start);
    let secs = start;
    const id = setInterval(() => {
      secs -= 1;
      setCountdown(secs);
      if (secs <= 0) {
        clearInterval(id);
        const nextIdx = qIdx + 1;
        setQIdx(nextIdx);
        setAnswered(false);
        setSelectedAnswer(null);
        setOptions(buildOptions(quizDeck, nextIdx));
      }
    }, 1000);
    return () => clearInterval(id);
  }, [answered, phase, settings.autoAdvance, settings.autoAdvanceSeconds, qIdx, quizDeck]);

  // ── Setup screen ──────────────────────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <div>
        <SubNav tabs={TABS} currentPath="/quizzes/terminology" />
        <div class="rq-panel">
          <h2 class="rq-title">Terminology Quiz</h2>
          <p class="rq-sub">Pick the topics you want to practice, then start the quiz.</p>
          <div class="rq-setup-label">Topics</div>
          <FilterChips activeCats={activeCats} onToggle={toggleCat} />
          <div class="rq-start-row">
            <button class="rq-start-btn" onClick={startQuiz}>Start Quiz</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Complete screen ───────────────────────────────────────────────────────
  if (qIdx >= quizDeck.length && quizDeck.length > 0) {
    const pct = Math.round(score / total * 100);
    const msg = pct >= 90 ? 'Phenomenal \u2014 table captain!' :
                pct >= 70 ? 'Well played \u2014 solid fundamentals.' :
                pct >= 50 ? 'Good start \u2014 keep grinding.' :
                'Hit the study cards and come back!';

    // Save stats
    const stats = getTermQuizStats() || initTermQuizStats();
    stats.totalQuizzes++;
    stats.totalQuestions += total;
    stats.totalCorrect += score;
    if (streak > stats.bestStreak) stats.bestStreak = streak;
    if (!stats.byCategory) stats.byCategory = {};
    for (const r of perQuestionResults) {
      const bucket = stats.byCategory[r.cat] || { total: 0, correct: 0 };
      bucket.total += 1;
      if (r.correct) bucket.correct += 1;
      stats.byCategory[r.cat] = bucket;
    }
    stats.recentScores.push({ date: new Date().toLocaleDateString(), score, total });
    if (stats.recentScores.length > 20) stats.recentScores = stats.recentScores.slice(-20);
    saveTermQuizStats(stats);

    return (
      <div>
        <SubNav tabs={TABS} currentPath="/quizzes/terminology" />
        <div class="rq-panel">
          <div class="rq-complete">
            <h2>{pct >= 70 ? '\uD83C\uDFC6' : '\uD83C\uDCCF'} Round Complete</h2>
            <div class="score-big">{score} / {total} &mdash; {pct}%</div>
            <p>{msg}</p>
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
          <Recommendation />
        </div>
      </div>
    );
  }

  // ── Playing screen ────────────────────────────────────────────────────────
  const current = quizDeck[qIdx];
  const correctTerm = current?.term;
  const pctDisplay = total > 0 ? Math.round(score / total * 100) + '%' : '\u2014';

  return (
    <div class="rq-playing-wrapper">
      <div class="rq-panel">
        <div class="rq-playing-header">
          <div class="rq-mode-badge">Terminology{sharedDeck ? ' \u00b7 Shared' : ''}</div>
          <button class="rq-exit-btn" onClick={sharedDeck ? startFreshQuiz : exitQuiz}>Exit</button>
        </div>

        <div class="rq-progress"><div class="rq-progress-fill" style={{ width: (qIdx / quizDeck.length * 100) + '%' }}></div></div>
        <div class="rq-status">
          <div class="rq-stat"><div class="val">{score}</div><div class="lbl">Correct</div></div>
          <div class="rq-stat"><div class="val">{qIdx + 1} / {quizDeck.length}</div><div class="lbl">Question</div></div>
          <div class="rq-stat"><div class="val">{streak}</div><div class="lbl">Streak</div></div>
          <div class="rq-stat"><div class="val">{pctDisplay}</div><div class="lbl">Accuracy</div></div>
        </div>

        {current && (
          <>
            <div class="quiz-q">
              <div class="q-cat">{current.cat}</div>
              <div class="q-term">{current.term}</div>
              <div class="q-illus" dangerouslySetInnerHTML={{ __html: getIllus(current) }} />
            </div>
            <div class="answers">
              {options.map(o => {
                let cls = 'ans-btn';
                if (answered) {
                  if (o.term === correctTerm) cls += ' correct';
                  else if (o.term === selectedAnswer) cls += ' wrong';
                }
                // Key is scoped to qIdx so a term appearing as a distractor in
                // consecutive questions doesn't reuse the previous question's
                // DOM node. Reuse was preserving :focus-visible on a randomly-
                // positioned button in the next question's shuffled options,
                // which looked like a "yellow highlight" on a random answer.
                return (
                  <button
                    key={qIdx + ':' + o.term}
                    class={cls}
                    disabled={answered}
                    onClick={() => answerQuiz(o.term)}
                  >
                    <span class="ans-def">{o.def}</span>
                  </button>
                );
              })}
            </div>
            <div class="rq-next-row">
              {answered && (
                <>
                  <button class="rq-next" style="display:inline-block" onClick={nextQuiz}>
                    Next Question {'\u2192'}
                  </button>
                  {settings.autoAdvance && (
                    <div class="rq-countdown">Auto-advancing in {countdown}s</div>
                  )}
                </>
              )}
            </div>
            <div class="share-row">
              <ShareButton url={shareUrl} label="Share Link" copiedLabel="Link Copied!" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
