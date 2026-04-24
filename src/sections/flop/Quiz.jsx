import { useState, useCallback, useEffect } from 'preact/hooks';
import { SubNav } from '../../components/SubNav.jsx';
import { ShareButton } from '../../components/ShareButton.jsx';
import { TERMS } from '../../data/terms.js';
import { shuffle } from '../../utils/shuffle.js';
import { cardSvg } from '../../utils/illustrations.jsx';
import { BOARD_TEXTURES, buildFlopDeck } from '../../utils/flop.js';
import {
  getFlopQuizStats,
  saveFlopQuizStats,
  initFlopQuizStats,
  getSettings,
} from '../../utils/storage.js';
import {
  encodeFlopQuiz,
  decodeFlopQuiz,
  buildShareUrl,
  buildScoreMessage,
} from '../../utils/share.js';
import '../../styles/quiz.css';

const TABS = [
  { path: '/quizzes/preflop', label: 'Preflop' },
  { path: '/quizzes/terminology', label: 'Terminology' },
  { path: '/quizzes/flop', label: 'Flop' },
];

// The six Board Texture terms power both the quiz answers and the per-option
// definitions shown to the user (pulled by name from terms.js).
const TEXTURE_TERMS = BOARD_TEXTURES
  .map(name => TERMS.find(t => t.term === name))
  .filter(Boolean);

const TEXTURE_BY_NAME = Object.fromEntries(TEXTURE_TERMS.map(t => [t.term, t]));

function renderFlop(cards) {
  const parts = cards.map(c => cardSvg(c.rank, c.suit, 60, 84)).join('');
  return `<div class="hand">${parts}</div>`;
}

function buildOptions(correctTexture) {
  const wrong = TEXTURE_TERMS.filter(t => t.term !== correctTexture);
  const picks = shuffle(wrong).slice(0, 3);
  const correct = TEXTURE_BY_NAME[correctTexture];
  return shuffle([...picks, correct]);
}

export function FlopQuiz({ query }) {
  const shared = decodeFlopQuiz(query);
  const [settings, setSettings] = useState(() => getSettings());
  const [phase, setPhase] = useState(shared ? 'playing' : 'setup');
  const [sharedDeck, setSharedDeck] = useState(() => shared?.deck || null);
  const [deck, setDeck] = useState(() => shared?.deck || []);
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [total, setTotal] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState(null);
  const [options, setOptions] = useState(() => (
    shared?.deck?.length ? buildOptions(shared.deck[0].texture) : []
  ));
  const [countdown, setCountdown] = useState(settings.autoAdvanceSeconds);
  const [results, setResults] = useState([]);

  // Shared-link handler: when ?fq= appears or changes, rebuild from the
  // encoded cards and auto-start the quiz.
  useEffect(() => {
    const next = decodeFlopQuiz(query);
    if (!next) return;
    const sameDeck = sharedDeck
      && sharedDeck.length === next.deck.length
      && sharedDeck.every((q, i) => (
        q.cards.length === next.deck[i].cards.length
        && q.cards.every((c, j) => (
          c.rank === next.deck[i].cards[j].rank
          && c.suit === next.deck[i].cards[j].suit
        ))
      ));
    if (sameDeck) return;
    setSharedDeck(next.deck);
    setDeck(next.deck);
    setPhase('playing');
    setQIdx(0);
    setScore(0);
    setStreak(0);
    setTotal(0);
    setAnswered(false);
    setSelected(null);
    setOptions(buildOptions(next.deck[0].texture));
    setResults([]);
  }, [query?.fq]);

  function startQuiz() {
    const fresh = getSettings();
    setSettings(fresh);
    const newDeck = buildFlopDeck(fresh.quizLength);
    setDeck(newDeck);
    setQIdx(0);
    setScore(0);
    setStreak(0);
    setTotal(0);
    setAnswered(false);
    setSelected(null);
    setOptions(buildOptions(newDeck[0].texture));
    setResults([]);
    setPhase('playing');
  }

  function restart() {
    const fresh = getSettings();
    setSettings(fresh);
    const newDeck = sharedDeck ? sharedDeck : buildFlopDeck(fresh.quizLength);
    setDeck(newDeck);
    setQIdx(0);
    setScore(0);
    setStreak(0);
    setTotal(0);
    setAnswered(false);
    setSelected(null);
    setOptions(buildOptions(newDeck[0].texture));
    setResults([]);
  }

  function exitQuiz() {
    setPhase('setup');
    setQIdx(0);
    setScore(0);
    setStreak(0);
    setTotal(0);
    setAnswered(false);
    setSelected(null);
    setResults([]);
  }

  function startFreshQuiz() {
    setSharedDeck(null);
    setDeck([]);
    setQIdx(0);
    setScore(0);
    setStreak(0);
    setTotal(0);
    setAnswered(false);
    setSelected(null);
    setResults([]);
    setPhase('setup');
    if (window.location.hash.includes('?fq=')) {
      window.location.hash = '#/quizzes/flop';
    }
  }

  const shareQuery = encodeFlopQuiz(deck);
  const shareUrl = shareQuery ? buildShareUrl('/quizzes/flop', shareQuery) : null;

  const answer = useCallback((chosenTerm) => {
    if (answered) return;
    setAnswered(true);
    setSelected(chosenTerm);
    const current = deck[qIdx];
    const correct = current.texture;
    const isCorrect = chosenTerm === correct;
    if (isCorrect) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
    setTotal(t => t + 1);
    setResults(r => [...r, { texture: correct, correct: isCorrect }]);
  }, [answered, deck, qIdx]);

  function nextQuestion(e) {
    if (e?.currentTarget?.blur) e.currentTarget.blur();
    const nextIdx = qIdx + 1;
    setQIdx(nextIdx);
    setAnswered(false);
    setSelected(null);
    if (nextIdx < deck.length) {
      setOptions(buildOptions(deck[nextIdx].texture));
    }
  }

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
        setSelected(null);
        if (nextIdx < deck.length) {
          setOptions(buildOptions(deck[nextIdx].texture));
        }
      }
    }, 1000);
    return () => clearInterval(id);
  }, [answered, phase, settings.autoAdvance, settings.autoAdvanceSeconds, qIdx, deck]);

  // ── Setup screen ──────────────────────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <div>
        <SubNav tabs={TABS} currentPath="/quizzes/flop" />
        <div class="rq-panel">
          <h2 class="rq-title">Flop Texture Quiz</h2>
          <p class="rq-sub">
            You'll see three flop cards. Pick the board texture that best describes them.
          </p>
          <div class="rq-setup-label">Textures you'll see</div>
          <ul class="rq-texture-list">
            {TEXTURE_TERMS.map(t => (
              <li key={t.term}><strong>{t.term}</strong> &mdash; {t.def}</li>
            ))}
          </ul>
          <div class="rq-start-row">
            <button class="rq-start-btn" onClick={startQuiz}>Start Quiz</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Complete screen ───────────────────────────────────────────────────────
  if (qIdx >= deck.length && deck.length > 0) {
    const pct = Math.round(score / total * 100);
    const msg = pct >= 90 ? 'Phenomenal — you read boards like a pro!' :
                pct >= 70 ? 'Well played — solid texture reads.' :
                pct >= 50 ? 'Good start — revisit the Board Texture cards.' :
                'Hit the study cards and come back!';

    const stats = getFlopQuizStats() || initFlopQuizStats();
    stats.totalQuizzes++;
    stats.totalQuestions += total;
    stats.totalCorrect += score;
    if (streak > stats.bestStreak) stats.bestStreak = streak;
    if (!stats.byTexture) stats.byTexture = {};
    for (const r of results) {
      const bucket = stats.byTexture[r.texture] || { total: 0, correct: 0 };
      bucket.total += 1;
      if (r.correct) bucket.correct += 1;
      stats.byTexture[r.texture] = bucket;
    }
    stats.recentScores.push({ date: new Date().toLocaleDateString(), score, total });
    if (stats.recentScores.length > 20) stats.recentScores = stats.recentScores.slice(-20);
    saveFlopQuizStats(stats);

    return (
      <div>
        <SubNav tabs={TABS} currentPath="/quizzes/flop" />
        <div class="rq-panel">
          <div class="rq-complete">
            <h2>{pct >= 70 ? '🏆' : '🃏'} Round Complete</h2>
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
        </div>
      </div>
    );
  }

  // ── Playing screen ────────────────────────────────────────────────────────
  const current = deck[qIdx];
  const pctDisplay = total > 0 ? Math.round(score / total * 100) + '%' : '—';

  return (
    <div class="rq-playing-wrapper">
      <div class="rq-panel">
        <div class="rq-playing-header">
          <div class="rq-mode-badge">Flop Texture{sharedDeck ? ' · Shared' : ''}</div>
          <button class="rq-exit-btn" onClick={sharedDeck ? startFreshQuiz : exitQuiz}>Exit</button>
        </div>

        <div class="rq-progress"><div class="rq-progress-fill" style={{ width: (qIdx / deck.length * 100) + '%' }}></div></div>
        <div class="rq-status">
          <div class="rq-stat"><div class="val">{score}</div><div class="lbl">Correct</div></div>
          <div class="rq-stat"><div class="val">{qIdx + 1} / {deck.length}</div><div class="lbl">Question</div></div>
          <div class="rq-stat"><div class="val">{streak}</div><div class="lbl">Streak</div></div>
          <div class="rq-stat"><div class="val">{pctDisplay}</div><div class="lbl">Accuracy</div></div>
        </div>

        {current && (
          <>
            <div class="quiz-q">
              <div class="q-cat">Board Texture</div>
              <div class="q-term">Which texture best describes this flop?</div>
              <div class="q-illus" dangerouslySetInnerHTML={{ __html: renderFlop(current.cards) }} />
            </div>
            <div class="answers">
              {options.map(o => {
                let cls = 'ans-btn';
                if (answered) {
                  if (o.term === current.texture) cls += ' correct';
                  else if (o.term === selected) cls += ' wrong';
                }
                return (
                  <button
                    key={qIdx + ':' + o.term}
                    class={cls}
                    disabled={answered}
                    onClick={() => answer(o.term)}
                  >
                    <span class="ans-term">{o.term}</span>
                    <span class="ans-def">{o.def}</span>
                  </button>
                );
              })}
            </div>
            <div class="rq-next-row">
              {answered && (
                <>
                  <button class="rq-next" style="display:inline-block" onClick={nextQuestion}>
                    Next Question {'→'}
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
