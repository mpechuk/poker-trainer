import { useState, useCallback } from 'preact/hooks';
import { SubNav } from '../../components/SubNav.jsx';
import { FilterChips } from '../../components/FilterChips.jsx';
import { useFilters } from '../../hooks/useFilters.js';
import { TERMS } from '../../data/terms.js';
import { shuffle } from '../../utils/shuffle.js';
import { getIllus } from '../../utils/illustrations.jsx';
import { getTermQuizStats, saveTermQuizStats, initTermQuizStats } from '../../utils/storage.js';
import '../../styles/quiz.css';

const TABS = [
  { path: '/terminology/study', label: 'Study' },
  { path: '/terminology/quiz', label: 'Quiz' },
  { path: '/terminology/reference', label: 'Reference' }
];

export function Quiz({ path }) {
  const { activeCats, toggleCat } = useFilters();
  const [quizDeck, setQuizDeck] = useState(() => buildDeck(activeCats));
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [total, setTotal] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [options, setOptions] = useState(() => buildOptions(buildDeck(activeCats), 0));

  function buildDeck(cats) {
    return shuffle(TERMS.filter(t => cats.has(t.cat)));
  }

  function buildOptions(deck, idx) {
    if (idx >= deck.length) return [];
    const t = deck[idx];
    const wrong = TERMS.filter(x => x.term !== t.term);
    const picked = shuffle(wrong).slice(0, 3);
    return shuffle([...picked, t]);
  }

  function restart() {
    const newDeck = buildDeck(activeCats);
    setQuizDeck(newDeck);
    setQIdx(0);
    setScore(0);
    setStreak(0);
    setTotal(0);
    setAnswered(false);
    setSelectedAnswer(null);
    setOptions(buildOptions(newDeck, 0));
  }

  function handleFilterToggle(cat) {
    toggleCat(cat);
    // Restart quiz with new filters on next render
    setTimeout(restart, 0);
  }

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

  function nextQuiz() {
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
        <SubNav tabs={TABS} currentPath="/terminology/quiz" />
        <FilterChips activeCats={activeCats} onToggle={handleFilterToggle} />
        <div class="quiz-panel">
          <div class="quiz-complete">
            <h2>{pct >= 70 ? '\uD83C\uDFC6' : '\uD83C\uDCCF'} Round Complete</h2>
            <p style="font-size:1.5rem;color:var(--gold-bright);margin:.5rem 0">{score} / {total} &mdash; {pct}%</p>
            <p>{msg}</p>
            <button class="restart-btn" onClick={restart}>Play Again</button>
          </div>
        </div>
      </div>
    );
  }

  const current = quizDeck[qIdx];
  const correctTerm = current?.term;
  const pctDisplay = total > 0 ? Math.round(score / total * 100) + '%' : '\u2014';

  return (
    <div>
      <SubNav tabs={TABS} currentPath="/terminology/quiz" />
      <FilterChips activeCats={activeCats} onToggle={handleFilterToggle} />
      <div class="quiz-panel">
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
                    <span style="font-size:.82rem;color:#a09070">{o.def}</span>
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
          </>
        )}
      </div>
    </div>
  );
}
