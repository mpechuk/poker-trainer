import { useState, useCallback } from 'preact/hooks';
import { SubNav } from '../../components/SubNav.jsx';
import { RANKS, RFI_RANGES, RFI_QUIZ_LENGTH, RFI_QUIZ_POSITIONS, STACK_DEPTHS } from '../../data/rfi-ranges.js';
import { getRfiQuizStats, saveRfiQuizStats, initRfiQuizStats } from '../../utils/storage.js';
import { handToCards } from '../../utils/illustrations.jsx';
import '../../styles/quiz.css';

const TABS = [
  { path: '/preflop/charts', label: 'Charts' },
  { path: '/preflop/quiz', label: 'RFI Quiz' }
];

function generateHand(stackDepth) {
  const pos = RFI_QUIZ_POSITIONS[Math.floor(Math.random() * RFI_QUIZ_POSITIONS.length)];
  const r = Math.floor(Math.random() * 13);
  const c = Math.floor(Math.random() * 13);
  let hand;
  if (r === c) hand = RANKS[r] + RANKS[c];
  else if (c > r) hand = RANKS[r] + RANKS[c] + 's';
  else hand = RANKS[c] + RANKS[r] + 'o';
  return { hand, pos, shouldRaise: RFI_RANGES[stackDepth][pos].has(hand) };
}

function buildDeck(stackDepth) {
  const deck = [];
  let raiseN = 0, foldN = 0, attempts = 0;
  while (deck.length < RFI_QUIZ_LENGTH && attempts < 200) {
    attempts++;
    const q = generateHand(stackDepth);
    if (q.shouldRaise && raiseN >= 7) continue;
    if (!q.shouldRaise && foldN >= 7) continue;
    if (deck.some(x => x.hand === q.hand && x.pos === q.pos)) continue;
    deck.push(q);
    if (q.shouldRaise) raiseN++;
    else foldN++;
  }
  return deck;
}

export function PreflopQuiz({ path }) {
  const [stackDepth, setStackDepth] = useState('100BB');
  const [deck, setDeck] = useState(() => buildDeck('100BB'));
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [choseRaise, setChoseRaise] = useState(null);
  const [results, setResults] = useState([]);
  const quizInProgress = qIdx > 0 && qIdx < deck.length;

  function changeStackDepth(depth) {
    setStackDepth(depth);
    setDeck(buildDeck(depth));
    setQIdx(0);
    setScore(0);
    setAnswered(false);
    setChoseRaise(null);
    setResults([]);
  }

  function restart() {
    setDeck(buildDeck(stackDepth));
    setQIdx(0);
    setScore(0);
    setAnswered(false);
    setChoseRaise(null);
    setResults([]);
  }

  const answer = useCallback((chose) => {
    if (answered) return;
    setAnswered(true);
    setChoseRaise(chose);
    const q = deck[qIdx];
    const isCorrect = chose === q.shouldRaise;
    if (isCorrect) setScore(s => s + 1);
    setResults(r => [...r, { pos: q.pos, correct: isCorrect }]);
  }, [answered, deck, qIdx]);

  function next() {
    setQIdx(i => i + 1);
    setAnswered(false);
    setChoseRaise(null);
  }

  // Quiz complete
  if (qIdx >= deck.length && deck.length > 0) {
    const pct = Math.round(score / RFI_QUIZ_LENGTH * 100);
    const msg = pct >= 90 ? 'Phenomenal \u2014 you know your ranges!' :
                pct >= 70 ? 'Well played \u2014 solid range knowledge.' :
                pct >= 50 ? 'Good start \u2014 review the charts.' :
                'Hit the charts and come back!';

    // Save stats
    const stats = getRfiQuizStats() || initRfiQuizStats();
    stats.totalQuizzes++;
    stats.totalQuestions += RFI_QUIZ_LENGTH;
    stats.totalCorrect += score;
    results.forEach(r => {
      if (!stats.byPosition[r.pos]) stats.byPosition[r.pos] = { total: 0, correct: 0 };
      stats.byPosition[r.pos].total++;
      if (r.correct) stats.byPosition[r.pos].correct++;
    });
    stats.recentScores.push({ date: new Date().toLocaleDateString(), score, total: RFI_QUIZ_LENGTH });
    if (stats.recentScores.length > 20) stats.recentScores = stats.recentScores.slice(-20);
    saveRfiQuizStats(stats);

    return (
      <div>
        <SubNav tabs={TABS} currentPath="/preflop/quiz" />
        <div class="rq-panel">
          <div class="rq-complete">
            <h2>{pct >= 70 ? '\uD83C\uDFC6' : '\uD83C\uDCCF'} Quiz Complete</h2>
            <div class="score-big">{score} / {RFI_QUIZ_LENGTH} &mdash; {pct}%</div>
            <p>{msg}</p>
            <button class="rq-restart" onClick={restart}>Play Again</button>
            <a class="rq-restart" href="#/preflop/charts" style="background:transparent;border:1px solid var(--gold-dark);text-decoration:none;display:inline-block;text-align:center">Review Charts</a>
          </div>
          <RfiStats />
        </div>
      </div>
    );
  }

  const current = deck[qIdx];
  const pctDisplay = qIdx > 0 ? Math.round(score / qIdx * 100) + '%' : '\u2014';
  const isCorrect = answered ? (choseRaise === current.shouldRaise) : null;

  return (
    <div>
      <SubNav tabs={TABS} currentPath="/preflop/quiz" />
      <div class="rq-panel">
        <h2 class="rq-title">Preflop Open-Raise Quiz</h2>
        <p class="rq-sub">Should you raise or fold? &mdash; 6-max, everyone folds to you</p>
        <div class="stack-tabs rq-stack-tabs">
          {STACK_DEPTHS.map(d => (
            <button
              key={d}
              class={`stack-tab${d === stackDepth ? ' active' : ''}${quizInProgress ? ' disabled' : ''}`}
              onClick={() => !quizInProgress && changeStackDepth(d)}
              title={quizInProgress ? 'Finish or restart quiz to change stack depth' : ''}
            >
              {d}
            </button>
          ))}
        </div>
        {quizInProgress && <p class="rq-stack-note">Stack depth locked during quiz &mdash; finish or restart to change</p>}
        <div class="rq-progress"><div class="rq-progress-fill" style={{ width: (qIdx / RFI_QUIZ_LENGTH * 100) + '%' }}></div></div>
        <div class="rq-status">
          <div class="rq-stat"><div class="val">{score}</div><div class="lbl">Correct</div></div>
          <div class="rq-stat"><div class="val">{qIdx + 1} / {RFI_QUIZ_LENGTH}</div><div class="lbl">Question</div></div>
          <div class="rq-stat"><div class="val">{pctDisplay}</div><div class="lbl">Accuracy</div></div>
        </div>
        {current && (
          <>
            <div class="rq-card">
              <div class="rq-pos">Your Position: <strong style="font-size:1.1rem">{current.pos}</strong></div>
              <div class="rq-hand-display" dangerouslySetInnerHTML={{ __html: handToCards(current.hand) }} />
              <div style="font-size:1.1rem;color:var(--gold-bright);font-weight:600;margin-top:.3rem">{current.hand}</div>
              <div class="rq-prompt">Everyone folds to you. What do you do?</div>
            </div>
            <div class="rq-actions">
              <button
                class={`rq-btn rq-btn-raise${answered ? (current.shouldRaise ? ' correct' : choseRaise ? ' wrong' : '') : ''}`}
                disabled={answered}
                onClick={() => answer(true)}
              >Raise</button>
              <button
                class={`rq-btn rq-btn-fold${answered ? (!current.shouldRaise ? ' correct' : !choseRaise ? ' wrong' : '') : ''}`}
                disabled={answered}
                onClick={() => answer(false)}
              >Fold</button>
            </div>
            {answered && (
              <div class="rq-feedback">
                {isCorrect ? (
                  <span style="color:#27ae60">Correct! {current.hand} from {current.pos} is a <strong>{current.shouldRaise ? 'raise' : 'fold'}</strong>.</span>
                ) : (
                  <span style="color:#c0392b">Incorrect. {current.hand} from {current.pos} is a <strong>{current.shouldRaise ? 'raise' : 'fold'}</strong>.</span>
                )}
              </div>
            )}
            <div style="text-align:center">
              {answered && (
                <button class="rq-next" style="display:inline-block" onClick={next}>
                  Next Question {'\u2192'}
                </button>
              )}
            </div>
          </>
        )}
        <RfiStats />
      </div>
    </div>
  );
}

function RfiStats() {
  const stats = getRfiQuizStats();
  if (!stats || stats.totalQuizzes === 0) return null;

  const overallPct = Math.round(stats.totalCorrect / stats.totalQuestions * 100);

  return (
    <div class="rq-stats">
      <div class="rq-stats-header">
        <div class="rq-stats-title">Your Progress</div>
        <button class="rq-reset-stats" onClick={() => {
          if (confirm('Reset all RFI quiz statistics? This cannot be undone.')) {
            localStorage.removeItem('rfi-quiz-stats');
            location.reload();
          }
        }}>Reset Stats</button>
      </div>
      <div class="rq-stats-grid">
        <div class="rq-stats-card"><div class="val">{stats.totalQuizzes}</div><div class="lbl">Quizzes</div></div>
        <div class="rq-stats-card"><div class="val">{overallPct}%</div><div class="lbl">Overall</div></div>
        <div class="rq-stats-card"><div class="val">{stats.totalCorrect}/{stats.totalQuestions}</div><div class="lbl">Correct</div></div>
      </div>
      <div class="rq-pos-stats">
        {RFI_QUIZ_POSITIONS.map(pos => {
          const ps = stats.byPosition[pos];
          if (!ps || ps.total === 0) return null;
          const pct = Math.round(ps.correct / ps.total * 100);
          const clr = pct >= 80 ? '#27ae60' : pct >= 60 ? '#c9a84c' : '#c0392b';
          return (
            <div class="rq-pos-row" key={pos}>
              <div class="rq-pos-label">{pos}</div>
              <div class="rq-pos-bar">
                <div class="rq-pos-bar-fill" style={{ width: pct + '%', background: clr }}></div>
                <div class="rq-pos-bar-text">{pct}% ({ps.correct}/{ps.total})</div>
              </div>
            </div>
          );
        })}
      </div>
      {stats.recentScores.length > 0 && (
        <div class="rq-history">
          <div class="rq-history-title">Recent Quizzes</div>
          {stats.recentScores.slice(-5).reverse().map((r, i) => {
            const p = Math.round(r.score / r.total * 100);
            return (
              <div class="rq-history-row" key={i}>
                <span>{r.date}</span>
                <span style={{ color: p >= 70 ? '#27ae60' : p >= 50 ? '#c9a84c' : '#c0392b' }}>
                  {r.score}/{r.total} ({p}%)
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
