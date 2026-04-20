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
  { path: '/quizzes/terminology', label: 'Terminology' },
];

export function buildDeck(cats, length = Infinity) {
  const deck = shuffle(TERMS.filter(t => cats.has(t.cat)));
  return Number.isFinite(length) ? deck.slice(0, Math.max(0, length)) : deck;
}

export function buildOptions(deck, idx) {
  if (idx >= deck.length) return [];
  const t = deck[idx];
  const wrong = TERMS.filter(x => x.term !== t.term);
  const picked = shuffle(wrong).slice(0, 3);
  return shuffle([...picked, t]);
}

export function Quiz({ path, query }) {
  const shared = decodeTermQuiz(query);
  const { activeCats, toggleCat } = useFilters();
  const [settings, setSettings] = useState(() => getSettings());
  const [sharedDeck, setSharedDeck] = useState(() => shared?.deck || null);
  const [quizDeck, setQuizDeck] = useState(() => (
    shared?.deck ? shared.deck : buildDeck(activeCats, settings.quizLength)
  ));
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [total, setTotal] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  // quizDeck is already set above; use the same deck for initial options so q0 answer is always present
  const [options, setOptions] = useState(() => buildOptions(quizDeck, 0));

  // If the URL's ?tq= query changes (e.g. opening a shared link while already
  // on the quiz), rebuild the deck from the shared terms.
  useEffect(() => {
    const next = decodeTermQuiz(query);
    if (!next) return;
    const sameDeck = sharedDeck
      && sharedDeck.length === next.deck.length
      && sharedDeck.every((t, i) => t.term === next.deck[i].term);
    if (sameDeck) return;
    setSharedDeck(next.deck);
    setQuizDeck(next.deck);
    setQIdx(0);
    setScore(0);
    setStreak(0);
    setTotal(0);
    setAnswered(false);
    setSelectedAnswer(null);
    setOptions(buildOptions(next.deck, 0));
  }, [query?.tq]);

  function restart() {
    // Re-read settings so a quizLength change on the Settings page takes
    // effect on the next run without requiring a reload. Shared quizzes
    // replay the same deck so the share link stays reproducible.
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
  }

  function startFreshQuiz() {
    setSharedDeck(null);
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
    // Strip the share query from the URL so the user ends up on a clean quiz route.
    if (window.location.hash.includes('?tq=')) {
      window.location.hash = '#/quizzes/terminology';
    }
  }

  function handleFilterToggle(cat) {
    if (sharedDeck) return; // filters are meaningless for a fixed shared deck
    toggleCat(cat);
    // Restart quiz with new filters on next render
    setTimeout(restart, 0);
  }

  const shareQuery = encodeTermQuiz(quizDeck);
  const shareUrl = shareQuery ? buildShareUrl('/quizzes/terminology', shareQuery) : null;

  const answerQuiz = useCallback((chosen) => {
    if (answered) return;
    setAnswered(true);
    setSelectedAnswer(chosen);
    const correct = quizDeck[qIdx].term;
    const isCorrect = chosen === correct;
    if (isCorrect) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
    setTotal(t => t + 1);
  }, [answered, quizDeck, qIdx]);

  function nextQuiz(e) {
    e.currentTarget.blur();
    const nextIdx = qIdx + 1;
    setQIdx(nextIdx);
    setAnswered(false);
    setSelectedAnswer(null);
    setOptions(buildOptions(quizDeck, nextIdx));
  }

  // Quiz complete
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
    stats.recentScores.push({ date: new Date().toLocaleDateString(), score, total });
    if (stats.recentScores.length > 20) stats.recentScores = stats.recentScores.slice(-20);
    saveTermQuizStats(stats);

    return (
      <div>
        <SubNav tabs={TABS} currentPath="/quizzes/terminology" />
        {!sharedDeck && <FilterChips activeCats={activeCats} onToggle={handleFilterToggle} />}
        <div class="quiz-panel">
          <div class="quiz-complete">
            <h2>{pct >= 70 ? '\uD83C\uDFC6' : '\uD83C\uDCCF'} Round Complete</h2>
            <p style="font-size:1.5rem;color:var(--gold-bright);margin:.5rem 0">{score} / {total} &mdash; {pct}%</p>
            <p>{msg}</p>
            <button class="restart-btn" onClick={restart}>Play Again</button>
            {sharedDeck && (
              <button class="restart-btn" style="background:transparent;border:1px solid var(--gold-dark);margin-left:.5rem" onClick={startFreshQuiz}>New Random Quiz</button>
            )}
            <a class="restart-btn" href="#/stats" style="background:transparent;border:1px solid var(--gold-dark);text-decoration:none;display:inline-block;margin-left:.5rem">Stats</a>
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

  const current = quizDeck[qIdx];
  const correctTerm = current?.term;
  const pctDisplay = total > 0 ? Math.round(score / total * 100) + '%' : '\u2014';

  return (
    <div>
      <SubNav tabs={TABS} currentPath="/quizzes/terminology" />
      {!sharedDeck && <FilterChips activeCats={activeCats} onToggle={handleFilterToggle} />}
      <div class="quiz-panel">
        {sharedDeck && (
          <div class="shared-quiz-banner">
            <span>Shared quiz {'\u2014'} {quizDeck.length} questions</span>
            <button type="button" class="shared-quiz-exit" onClick={startFreshQuiz}>Start Random Quiz</button>
          </div>
        )}
        <div class="quiz-status">
          <div class="q-stat"><div class="val">{score}</div><div class="lbl">Correct</div></div>
          <div class="q-stat"><div class="val">{streak}</div><div class="lbl">Streak</div></div>
          <div class="q-stat"><div class="val">{total}</div><div class="lbl">Answered</div></div>
          <div class="q-stat"><div class="val">{pctDisplay}</div><div class="lbl">Accuracy</div></div>
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
                return (
                  <button
                    key={o.term}
                    class={cls}
                    disabled={answered}
                    onClick={() => answerQuiz(o.term)}
                  >
                    <span class="ans-def">{o.def}</span>
                  </button>
                );
              })}
            </div>
            <div style="text-align:center">
              {answered && (
                <button class="quiz-next" style="display:inline-block" onClick={nextQuiz}>
                  Next Question {'\u2192'}
                </button>
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
