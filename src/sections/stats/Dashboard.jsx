import { useState } from 'preact/hooks';
import { TERMS, CATS } from '../../data/terms.js';
import { RFI_QUIZ_POSITIONS } from '../../data/rfi-ranges.js';
import { getStudyProgress, initStudyProgress, getTermQuizStats, initTermQuizStats, getRfiQuizStats, initRfiQuizStats, getLimpQuizStats, initLimpQuizStats, getVsRaiseQuizStats, initVsRaiseQuizStats, getAllModesQuizStats, initAllModesQuizStats } from '../../utils/storage.js';
import { LIMP_HERO_POSITIONS, RAISE_HERO_POSITIONS } from '../../data/preflop-ranges.js';
import '../../styles/stats.css';

export function Dashboard({ path }) {
  const [, forceUpdate] = useState(0);
  const refresh = () => forceUpdate(n => n + 1);

  const study = getStudyProgress() || initStudyProgress();
  const termQuiz = getTermQuizStats() || initTermQuizStats();
  const rfiQuiz    = getRfiQuizStats()     || initRfiQuizStats();
  const limpQuiz   = getLimpQuizStats()    || initLimpQuizStats();
  const vsRaiseQuiz = getVsRaiseQuizStats() || initVsRaiseQuizStats();
  const allModes   = getAllModesQuizStats() || initAllModesQuizStats();

  const totalTerms = TERMS.length;
  const cardsSeen = study.cardsSeen.length;
  const studyPct = totalTerms > 0 ? Math.round(cardsSeen / totalTerms * 100) : 0;

  const termAccuracy = termQuiz.totalQuestions > 0
    ? Math.round(termQuiz.totalCorrect / termQuiz.totalQuestions * 100) : 0;

  const rfiAccuracy = rfiQuiz.totalQuestions > 0
    ? Math.round(rfiQuiz.totalCorrect / rfiQuiz.totalQuestions * 100) : 0;

  function resetStudy() {
    if (!confirm('Reset all study progress? This cannot be undone.')) return;
    localStorage.removeItem('study-progress');
    refresh();
  }
  function resetTermQuiz() {
    if (!confirm('Reset all terminology quiz stats? This cannot be undone.')) return;
    localStorage.removeItem('term-quiz-stats');
    refresh();
  }
  function resetRfiQuiz() {
    if (!confirm('Reset all RFI quiz stats? This cannot be undone.')) return;
    localStorage.removeItem('rfi-quiz-stats');
    refresh();
  }
  function resetLimpQuiz() {
    if (!confirm('Reset all vs Limp quiz stats? This cannot be undone.')) return;
    localStorage.removeItem('limp-quiz-stats');
    refresh();
  }
  function resetVsRaiseQuiz() {
    if (!confirm('Reset all vs Raise quiz stats? This cannot be undone.')) return;
    localStorage.removeItem('vs-raise-quiz-stats');
    refresh();
  }
  function resetAllModes() {
    if (!confirm('Reset all All-Modes quiz stats? This cannot be undone.')) return;
    localStorage.removeItem('all-modes-quiz-stats');
    refresh();
  }

  return (
    <div class="stats-dashboard">
      <h2 class="stats-title">Your Stats</h2>

      {/* Study Progress */}
      <div class="stats-section">
        <div class="stats-section-header">
          <h3>Study Progress</h3>
          <button class="stats-reset" onClick={resetStudy}>Reset</button>
        </div>
        <div class="stats-grid">
          <div class="stats-card">
            <div class="stats-val">{cardsSeen}</div>
            <div class="stats-lbl">Cards Seen</div>
          </div>
          <div class="stats-card">
            <div class="stats-val">{totalTerms}</div>
            <div class="stats-lbl">Total Terms</div>
          </div>
          <div class="stats-card">
            <div class="stats-val">{studyPct}%</div>
            <div class="stats-lbl">Completion</div>
          </div>
          <div class="stats-card">
            <div class="stats-val">{study.totalFlips}</div>
            <div class="stats-lbl">Card Flips</div>
          </div>
        </div>
        {Object.keys(study.byCategory).length > 0 && (
          <div class="stats-bars">
            <div class="stats-bars-title">Views by Category</div>
            {CATS.map(cat => {
              const count = study.byCategory[cat] || 0;
              if (count === 0) return null;
              const maxCount = Math.max(...Object.values(study.byCategory));
              const barPct = maxCount > 0 ? Math.round(count / maxCount * 100) : 0;
              return (
                <div class="stats-cat-row" key={cat}>
                  <div class="stats-cat-label">{cat}</div>
                  <div class="stats-cat-bar">
                    <div class="stats-cat-bar-fill" style={{ width: barPct + '%' }}></div>
                    <div class="stats-cat-bar-text">{count}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Terminology Quiz */}
      <div class="stats-section">
        <div class="stats-section-header">
          <h3>Terminology Quiz</h3>
          <button class="stats-reset" onClick={resetTermQuiz}>Reset</button>
        </div>
        {termQuiz.totalQuizzes === 0 ? (
          <p class="stats-empty">No quizzes taken yet. <a href="#/terminology/quiz">Take a quiz</a></p>
        ) : (
          <>
            <div class="stats-grid">
              <div class="stats-card">
                <div class="stats-val">{termQuiz.totalQuizzes}</div>
                <div class="stats-lbl">Quizzes</div>
              </div>
              <div class="stats-card">
                <div class="stats-val">{termAccuracy}%</div>
                <div class="stats-lbl">Accuracy</div>
              </div>
              <div class="stats-card">
                <div class="stats-val">{termQuiz.totalCorrect}/{termQuiz.totalQuestions}</div>
                <div class="stats-lbl">Correct</div>
              </div>
              <div class="stats-card">
                <div class="stats-val">{termQuiz.bestStreak}</div>
                <div class="stats-lbl">Best Streak</div>
              </div>
            </div>
            {termQuiz.recentScores.length > 0 && (
              <div class="stats-history">
                <div class="stats-history-title">Recent Scores</div>
                {termQuiz.recentScores.slice(-5).reverse().map((r, i) => {
                  const p = Math.round(r.score / r.total * 100);
                  return (
                    <div class="stats-history-row" key={i}>
                      <span>{r.date}</span>
                      <span style={{ color: p >= 70 ? '#27ae60' : p >= 50 ? '#c9a84c' : '#c0392b' }}>
                        {r.score}/{r.total} ({p}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* RFI Quiz */}
      <div class="stats-section">
        <div class="stats-section-header">
          <h3>Preflop RFI Quiz</h3>
          <button class="stats-reset" onClick={resetRfiQuiz}>Reset</button>
        </div>
        {rfiQuiz.totalQuizzes === 0 ? (
          <p class="stats-empty">No quizzes taken yet. <a href="#/preflop/quiz">Take a quiz</a></p>
        ) : (
          <>
            <div class="stats-grid">
              <div class="stats-card">
                <div class="stats-val">{rfiQuiz.totalQuizzes}</div>
                <div class="stats-lbl">Quizzes</div>
              </div>
              <div class="stats-card">
                <div class="stats-val">{rfiAccuracy}%</div>
                <div class="stats-lbl">Accuracy</div>
              </div>
              <div class="stats-card">
                <div class="stats-val">{rfiQuiz.totalCorrect}/{rfiQuiz.totalQuestions}</div>
                <div class="stats-lbl">Correct</div>
              </div>
            </div>
            {Object.keys(rfiQuiz.byPosition).length > 0 && (
              <div class="stats-bars">
                <div class="stats-bars-title">Accuracy by Position</div>
                {RFI_QUIZ_POSITIONS.map(pos => {
                  const ps = rfiQuiz.byPosition[pos];
                  if (!ps || ps.total === 0) return null;
                  const pct = Math.round(ps.correct / ps.total * 100);
                  const clr = pct >= 80 ? '#27ae60' : pct >= 60 ? '#c9a84c' : '#c0392b';
                  return (
                    <div class="stats-cat-row" key={pos}>
                      <div class="stats-cat-label">{pos}</div>
                      <div class="stats-cat-bar">
                        <div class="stats-cat-bar-fill" style={{ width: pct + '%', background: clr }}></div>
                        <div class="stats-cat-bar-text">{pct}% ({ps.correct}/{ps.total})</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {rfiQuiz.recentScores.length > 0 && (
              <div class="stats-history">
                <div class="stats-history-title">Recent Scores</div>
                {rfiQuiz.recentScores.slice(-5).reverse().map((r, i) => {
                  const p = Math.round(r.score / r.total * 100);
                  return (
                    <div class="stats-history-row" key={i}>
                      <span>{r.date}</span>
                      <span style={{ color: p >= 70 ? '#27ae60' : p >= 50 ? '#c9a84c' : '#c0392b' }}>
                        {r.score}/{r.total} ({p}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
      {/* vs Limp Quiz */}
      <div class="stats-section">
        <div class="stats-section-header">
          <h3>Preflop vs Limp Quiz</h3>
          <button class="stats-reset" onClick={resetLimpQuiz}>Reset</button>
        </div>
        {limpQuiz.totalQuizzes === 0 ? (
          <p class="stats-empty">No quizzes taken yet. <a href="#/preflop/quiz">Take a quiz</a></p>
        ) : (
          <>
            <div class="stats-grid">
              <div class="stats-card"><div class="stats-val">{limpQuiz.totalQuizzes}</div><div class="stats-lbl">Quizzes</div></div>
              <div class="stats-card"><div class="stats-val">{Math.round(limpQuiz.totalCorrect/limpQuiz.totalQuestions*100)}%</div><div class="stats-lbl">Accuracy</div></div>
              <div class="stats-card"><div class="stats-val">{limpQuiz.totalCorrect}/{limpQuiz.totalQuestions}</div><div class="stats-lbl">Correct</div></div>
            </div>
            {Object.keys(limpQuiz.byHeroPosition).length > 0 && (
              <div class="stats-bars">
                <div class="stats-bars-title">Accuracy by Your Position</div>
                {LIMP_HERO_POSITIONS.map(pos => {
                  const ps = limpQuiz.byHeroPosition[pos];
                  if (!ps || ps.total === 0) return null;
                  const pct = Math.round(ps.correct/ps.total*100);
                  const clr = pct>=80?'#27ae60':pct>=60?'#c9a84c':'#c0392b';
                  return (<div class="stats-cat-row" key={pos}><div class="stats-cat-label">{pos}</div><div class="stats-cat-bar"><div class="stats-cat-bar-fill" style={{width:pct+'%',background:clr}}></div><div class="stats-cat-bar-text">{pct}% ({ps.correct}/{ps.total})</div></div></div>);
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* vs Raise Quiz */}
      <div class="stats-section">
        <div class="stats-section-header">
          <h3>Preflop vs Raise Quiz</h3>
          <button class="stats-reset" onClick={resetVsRaiseQuiz}>Reset</button>
        </div>
        {vsRaiseQuiz.totalQuizzes === 0 ? (
          <p class="stats-empty">No quizzes taken yet. <a href="#/preflop/quiz">Take a quiz</a></p>
        ) : (
          <>
            <div class="stats-grid">
              <div class="stats-card"><div class="stats-val">{vsRaiseQuiz.totalQuizzes}</div><div class="stats-lbl">Quizzes</div></div>
              <div class="stats-card"><div class="stats-val">{Math.round(vsRaiseQuiz.totalCorrect/vsRaiseQuiz.totalQuestions*100)}%</div><div class="stats-lbl">Accuracy</div></div>
              <div class="stats-card"><div class="stats-val">{vsRaiseQuiz.totalCorrect}/{vsRaiseQuiz.totalQuestions}</div><div class="stats-lbl">Correct</div></div>
            </div>
            {Object.keys(vsRaiseQuiz.byHeroPosition).length > 0 && (
              <div class="stats-bars">
                <div class="stats-bars-title">Accuracy by Your Position</div>
                {RAISE_HERO_POSITIONS.map(pos => {
                  const ps = vsRaiseQuiz.byHeroPosition[pos];
                  if (!ps || ps.total === 0) return null;
                  const pct = Math.round(ps.correct/ps.total*100);
                  const clr = pct>=80?'#27ae60':pct>=60?'#c9a84c':'#c0392b';
                  return (<div class="stats-cat-row" key={pos}><div class="stats-cat-label">{pos}</div><div class="stats-cat-bar"><div class="stats-cat-bar-fill" style={{width:pct+'%',background:clr}}></div><div class="stats-cat-bar-text">{pct}% ({ps.correct}/{ps.total})</div></div></div>);
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* All Modes Quiz */}
      <div class="stats-section">
        <div class="stats-section-header">
          <h3>Preflop All-Modes Quiz</h3>
          <button class="stats-reset" onClick={resetAllModes}>Reset</button>
        </div>
        {allModes.totalQuizzes === 0 ? (
          <p class="stats-empty">No quizzes taken yet. <a href="#/preflop/quiz">Take a quiz</a></p>
        ) : (
          <>
            <div class="stats-grid">
              <div class="stats-card"><div class="stats-val">{allModes.totalQuizzes}</div><div class="stats-lbl">Quizzes</div></div>
              <div class="stats-card"><div class="stats-val">{Math.round(allModes.totalCorrect/allModes.totalQuestions*100)}%</div><div class="stats-lbl">Accuracy</div></div>
              <div class="stats-card"><div class="stats-val">{allModes.totalCorrect}/{allModes.totalQuestions}</div><div class="stats-lbl">Correct</div></div>
            </div>
            <div class="stats-bars">
              <div class="stats-bars-title">Accuracy by Mode</div>
              {[['rfi','RFI'],['limp','vs Limp'],['vsRaise','vs Raise']].map(([key,lbl]) => {
                const ps = allModes.byMode[key];
                if (!ps || ps.total === 0) return null;
                const pct = Math.round(ps.correct/ps.total*100);
                const clr = pct>=80?'#27ae60':pct>=60?'#c9a84c':'#c0392b';
                return (<div class="stats-cat-row" key={key}><div class="stats-cat-label">{lbl}</div><div class="stats-cat-bar"><div class="stats-cat-bar-fill" style={{width:pct+'%',background:clr}}></div><div class="stats-cat-bar-text">{pct}% ({ps.correct}/{ps.total})</div></div></div>);
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
