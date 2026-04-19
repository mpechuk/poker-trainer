import { useState, useCallback, useEffect } from 'preact/hooks';
import { SubNav } from '../../components/SubNav.jsx';
import { PositionTable } from '../../components/PositionTable.jsx';
import { Recommendation } from '../../components/Recommendation.jsx';
import { RANKS, RFI_RANGES, RFI_QUIZ_LENGTH, RFI_QUIZ_POSITIONS, STACK_DEPTHS } from '../../data/rfi-ranges.js';
import { LIMP_RANGES, LIMP_HERO_POSITIONS, VALID_LIMP_VILLAINS, VS_RAISE_RANGES, RAISE_HERO_POSITIONS, VALID_RAISE_VILLAINS } from '../../data/preflop-ranges.js';

export function getPositionsForMode(mode) {
  if (mode === 'rfi')     return RFI_QUIZ_POSITIONS;
  if (mode === 'limp')    return LIMP_HERO_POSITIONS;
  if (mode === 'vsRaise') return RAISE_HERO_POSITIONS;
  // 'all' mode — union of all positions
  const seen = new Set();
  const union = [];
  for (const p of [...RFI_QUIZ_POSITIONS, ...LIMP_HERO_POSITIONS, ...RAISE_HERO_POSITIONS]) {
    if (!seen.has(p)) { seen.add(p); union.push(p); }
  }
  return union;
}

// Returns valid villain positions given a mode and the selected hero position.
export function getVillainsForSelection(mode, heroPos) {
  const map = mode === 'limp' ? VALID_LIMP_VILLAINS : VALID_RAISE_VILLAINS;
  if (heroPos === 'all') {
    const seen = new Set();
    const union = [];
    for (const villains of Object.values(map)) {
      for (const v of villains) {
        if (!seen.has(v)) { seen.add(v); union.push(v); }
      }
    }
    return union;
  }
  return map[heroPos] || [];
}

// Returns hero positions that can face the given villain position.
export function getHeroesForVillain(mode, villainPos) {
  const map = mode === 'limp' ? VALID_LIMP_VILLAINS : VALID_RAISE_VILLAINS;
  return Object.entries(map).filter(([, v]) => v.includes(villainPos)).map(([h]) => h);
}
import { getRfiQuizStats, saveRfiQuizStats, initRfiQuizStats, getLimpQuizStats, saveLimpQuizStats, initLimpQuizStats, getVsRaiseQuizStats, saveVsRaiseQuizStats, initVsRaiseQuizStats, getAllModesQuizStats, saveAllModesQuizStats, initAllModesQuizStats, getSettings, CARD_SIZES } from '../../utils/storage.js';
import { handToCards } from '../../utils/illustrations.jsx';
import { explainQuestion } from '../../utils/explain.js';
import '../../styles/quiz.css';

const TABS = [
  { path: '/quizzes/preflop', label: 'Preflop' },
  { path: '/quizzes/terminology', label: 'Terminology' },
];

const MODES = [
  { id: 'rfi',     label: 'RFI' },
  { id: 'limp',    label: 'vs Limp' },
  { id: 'vsRaise', label: 'vs Raise' },
  { id: 'all',     label: 'All' },
];

// ---------- hand generators ----------
const SUITS = ['♠','♥','♦','♣'];
function randomSuit() { return SUITS[Math.floor(Math.random() * SUITS.length)]; }

function randomHand() {
  const r = Math.floor(Math.random() * 13);
  const c = Math.floor(Math.random() * 13);
  if (r === c) return RANKS[r] + RANKS[c];
  if (c > r) return RANKS[r] + RANKS[c] + 's';
  return RANKS[c] + RANKS[r] + 'o';
}

function generateRfiHand(stackDepth, posOverride = null) {
  const pos = posOverride || RFI_QUIZ_POSITIONS[Math.floor(Math.random() * RFI_QUIZ_POSITIONS.length)];
  const hand = randomHand();
  return { type: 'rfi', hand, heroPos: pos, villainPos: null, stackDepth, suit: randomSuit(), correctAction: RFI_RANGES[stackDepth][pos].has(hand) ? 'raise' : 'fold' };
}

function generateLimpHand(stackDepth, heroOverride = null, villainOverride = null) {
  let heroPos, villainPos;
  if (heroOverride && villainOverride) {
    heroPos = heroOverride; villainPos = villainOverride;
  } else if (heroOverride) {
    heroPos = heroOverride;
    const v = VALID_LIMP_VILLAINS[heroPos];
    villainPos = v[Math.floor(Math.random() * v.length)];
  } else if (villainOverride) {
    villainPos = villainOverride;
    const heroes = getHeroesForVillain('limp', villainOverride);
    heroPos = heroes[Math.floor(Math.random() * heroes.length)];
  } else {
    heroPos = LIMP_HERO_POSITIONS[Math.floor(Math.random() * LIMP_HERO_POSITIONS.length)];
    const v = VALID_LIMP_VILLAINS[heroPos];
    villainPos = v[Math.floor(Math.random() * v.length)];
  }
  const hand = randomHand();
  const range = LIMP_RANGES[stackDepth]?.[heroPos]?.[villainPos];
  if (!range) return generateLimpHand(stackDepth, heroOverride, villainOverride);
  const correctAction = range.raise.has(hand) ? 'raise' : range.call.has(hand) ? 'call' : 'fold';
  return { type: 'limp', hand, heroPos, villainPos, stackDepth, suit: randomSuit(), correctAction };
}

function generateVsRaiseHand(stackDepth, heroOverride = null, villainOverride = null) {
  let heroPos, villainPos;
  if (heroOverride && villainOverride) {
    heroPos = heroOverride; villainPos = villainOverride;
  } else if (heroOverride) {
    heroPos = heroOverride;
    const v = VALID_RAISE_VILLAINS[heroPos];
    villainPos = v[Math.floor(Math.random() * v.length)];
  } else if (villainOverride) {
    villainPos = villainOverride;
    const heroes = getHeroesForVillain('vsRaise', villainOverride);
    heroPos = heroes[Math.floor(Math.random() * heroes.length)];
  } else {
    heroPos = RAISE_HERO_POSITIONS[Math.floor(Math.random() * RAISE_HERO_POSITIONS.length)];
    const v = VALID_RAISE_VILLAINS[heroPos];
    villainPos = v[Math.floor(Math.random() * v.length)];
  }
  const hand = randomHand();
  const range = VS_RAISE_RANGES[stackDepth]?.[heroPos]?.[villainPos];
  if (!range) return generateVsRaiseHand(stackDepth, heroOverride, villainOverride);
  const correctAction = range.threebet.has(hand) ? 'threebet' : range.call.has(hand) ? 'call' : 'fold';
  return { type: 'vsRaise', hand, heroPos, villainPos, stackDepth, suit: randomSuit(), correctAction };
}

function buildDeck(mode, stackDepth, heroPos = 'all', villainPos = 'all') {
  const heroOv    = heroPos    !== 'all' ? heroPos    : null;
  const villainOv = villainPos !== 'all' ? villainPos : null;
  const deck = [];
  const counts = {};
  let attempts = 0;
  const maxPerAction = mode === 'rfi' ? 7 : 4;

  while (deck.length < RFI_QUIZ_LENGTH && attempts < 300) {
    attempts++;
    let q;
    if (mode === 'rfi') q = generateRfiHand(stackDepth, heroOv);
    else if (mode === 'limp') q = generateLimpHand(stackDepth, heroOv, villainOv);
    else if (mode === 'vsRaise') q = generateVsRaiseHand(stackDepth, heroOv, villainOv);
    else {
      const canRfi     = !heroOv || RFI_QUIZ_POSITIONS.includes(heroOv);
      const canLimp    = !heroOv || LIMP_HERO_POSITIONS.includes(heroOv);
      const canVsRaise = !heroOv || RAISE_HERO_POSITIONS.includes(heroOv);
      const avail = [];
      if (canRfi)     avail.push('rfi');
      if (canLimp)    avail.push('limp');
      if (canVsRaise) avail.push('vsRaise');
      const picked = avail[Math.floor(Math.random() * avail.length)];
      if (picked === 'rfi')       q = generateRfiHand(stackDepth, heroOv);
      else if (picked === 'limp') q = generateLimpHand(stackDepth, heroOv, null);
      else                        q = generateVsRaiseHand(stackDepth, heroOv, null);
    }
    const key = `${q.type}:${q.hand}:${q.heroPos}:${q.villainPos}`;
    if (deck.some(x => `${x.type}:${x.hand}:${x.heroPos}:${x.villainPos}` === key)) continue;
    counts[q.correctAction] = (counts[q.correctAction] || 0) + 1;
    if (counts[q.correctAction] > maxPerAction) continue;
    deck.push(q);
  }
  return deck;
}

// ---------- action labels per type ----------
function getButtons(type) {
  if (type === 'rfi')     return [{ label: 'Raise', action: 'raise' }, { label: 'Fold', action: 'fold' }];
  if (type === 'limp')    return [{ label: 'Raise', action: 'raise' }, { label: 'Call', action: 'call' }, { label: 'Fold', action: 'fold' }];
  if (type === 'vsRaise') return [{ label: '3-Bet', action: 'threebet' }, { label: 'Call', action: 'call' }, { label: 'Fold', action: 'fold' }];
  return [];
}

function actionLabel(action) {
  if (action === 'raise')    return 'raise';
  if (action === 'fold')     return 'fold';
  if (action === 'call')     return 'call';
  if (action === 'threebet') return '3-bet';
  return action;
}

function promptText(q) {
  if (!q) return '';
  if (q.type === 'rfi')     return 'Everyone folds to you.';
  if (q.type === 'limp')    return `${q.villainPos} limps.`;
  if (q.type === 'vsRaise') return `${q.villainPos} raises.`;
  return '';
}

// ---------- save stats helpers ----------
function saveStats(results, mode, score, stackDepth) {
  if (mode === 'rfi' || mode === 'all') {
    const rfi = getRfiQuizStats() || initRfiQuizStats();
    const rfiResults = results.filter(r => r.type === 'rfi');
    if (rfiResults.length > 0) {
      rfi.totalQuizzes += mode === 'rfi' ? 1 : 0;
      rfi.totalQuestions += rfiResults.length;
      rfi.totalCorrect += rfiResults.filter(r => r.correct).length;
      rfiResults.forEach(r => {
        if (!rfi.byPosition[r.heroPos]) rfi.byPosition[r.heroPos] = { total: 0, correct: 0 };
        rfi.byPosition[r.heroPos].total++;
        if (r.correct) rfi.byPosition[r.heroPos].correct++;
      });
      if (mode === 'rfi') {
        rfi.recentScores.push({ date: new Date().toLocaleDateString(), score, total: RFI_QUIZ_LENGTH });
        if (rfi.recentScores.length > 20) rfi.recentScores = rfi.recentScores.slice(-20);
      }
      saveRfiQuizStats(rfi);
    }
  }

  if (mode === 'limp' || mode === 'all') {
    const limp = getLimpQuizStats() || initLimpQuizStats();
    const limpResults = results.filter(r => r.type === 'limp');
    if (limpResults.length > 0) {
      limp.totalQuizzes += mode === 'limp' ? 1 : 0;
      limp.totalQuestions += limpResults.length;
      limp.totalCorrect += limpResults.filter(r => r.correct).length;
      limpResults.forEach(r => {
        if (!limp.byHeroPosition[r.heroPos]) limp.byHeroPosition[r.heroPos] = { total: 0, correct: 0 };
        limp.byHeroPosition[r.heroPos].total++;
        if (r.correct) limp.byHeroPosition[r.heroPos].correct++;
        if (r.villainPos) {
          if (!limp.byVillainPosition[r.villainPos]) limp.byVillainPosition[r.villainPos] = { total: 0, correct: 0 };
          limp.byVillainPosition[r.villainPos].total++;
          if (r.correct) limp.byVillainPosition[r.villainPos].correct++;
        }
      });
      if (mode === 'limp') {
        limp.recentScores.push({ date: new Date().toLocaleDateString(), score, total: RFI_QUIZ_LENGTH });
        if (limp.recentScores.length > 20) limp.recentScores = limp.recentScores.slice(-20);
      }
      saveLimpQuizStats(limp);
    }
  }

  if (mode === 'vsRaise' || mode === 'all') {
    const vsr = getVsRaiseQuizStats() || initVsRaiseQuizStats();
    const vsrResults = results.filter(r => r.type === 'vsRaise');
    if (vsrResults.length > 0) {
      vsr.totalQuizzes += mode === 'vsRaise' ? 1 : 0;
      vsr.totalQuestions += vsrResults.length;
      vsr.totalCorrect += vsrResults.filter(r => r.correct).length;
      vsrResults.forEach(r => {
        if (!vsr.byHeroPosition[r.heroPos]) vsr.byHeroPosition[r.heroPos] = { total: 0, correct: 0 };
        vsr.byHeroPosition[r.heroPos].total++;
        if (r.correct) vsr.byHeroPosition[r.heroPos].correct++;
        if (r.villainPos) {
          if (!vsr.byVillainPosition[r.villainPos]) vsr.byVillainPosition[r.villainPos] = { total: 0, correct: 0 };
          vsr.byVillainPosition[r.villainPos].total++;
          if (r.correct) vsr.byVillainPosition[r.villainPos].correct++;
        }
      });
      if (mode === 'vsRaise') {
        vsr.recentScores.push({ date: new Date().toLocaleDateString(), score, total: RFI_QUIZ_LENGTH });
        if (vsr.recentScores.length > 20) vsr.recentScores = vsr.recentScores.slice(-20);
      }
      saveVsRaiseQuizStats(vsr);
    }
  }

  if (mode === 'all') {
    const all = getAllModesQuizStats() || initAllModesQuizStats();
    all.totalQuizzes++;
    all.totalQuestions += RFI_QUIZ_LENGTH;
    all.totalCorrect += score;
    results.forEach(r => {
      const modeKey = r.type === 'vsRaise' ? 'vsRaise' : r.type;
      if (!all.byMode[modeKey]) all.byMode[modeKey] = { total: 0, correct: 0 };
      all.byMode[modeKey].total++;
      if (r.correct) all.byMode[modeKey].correct++;
    });
    all.recentScores.push({ date: new Date().toLocaleDateString(), score, total: RFI_QUIZ_LENGTH });
    if (all.recentScores.length > 20) all.recentScores = all.recentScores.slice(-20);
    saveAllModesQuizStats(all);
  }
}

// ---------- main component ----------
export function PreflopQuiz({ query }) {
  const initialMode = query?.mode && MODES.some(m => m.id === query.mode) ? query.mode : 'all';
  const [phase, setPhase]           = useState('setup'); // 'setup' | 'playing'
  const [quizMode, setQuizMode]     = useState(initialMode);
  const [stackDepth, setStackDepth] = useState('100BB');
  const [selectedPos, setSelectedPos] = useState('all');
  const [selectedVillainPos, setSelectedVillainPos] = useState('all');
  const [deck, setDeck]             = useState(() => buildDeck(initialMode, '100BB', 'all', 'all'));
  const [qIdx, setQIdx]             = useState(0);
  const [score, setScore]           = useState(0);
  const [answered, setAnswered]     = useState(false);
  const [choseAction, setChoseAction] = useState(null);
  const [results, setResults]       = useState([]);
  const [settings]                  = useState(() => getSettings());
  const [countdown, setCountdown]   = useState(settings.autoAdvanceSeconds);

  function resetQuiz(mode, depth, pos, villainPos) {
    setDeck(buildDeck(mode, depth, pos, villainPos));
    setQIdx(0); setScore(0); setAnswered(false); setChoseAction(null); setResults([]);
  }

  function changeMode(m) {
    setQuizMode(m);
    setSelectedPos('all');
    setSelectedVillainPos('all');
    resetQuiz(m, stackDepth, 'all', 'all');
  }

  function changeStackDepth(d) {
    setStackDepth(d);
    resetQuiz(quizMode, d, selectedPos, selectedVillainPos);
  }

  function changePosition(pos) {
    setSelectedPos(pos);
    setSelectedVillainPos('all');
    resetQuiz(quizMode, stackDepth, pos, 'all');
  }

  function changeVillainPosition(pos) {
    setSelectedVillainPos(pos);
    resetQuiz(quizMode, stackDepth, selectedPos, pos);
  }

  function startQuiz() {
    resetQuiz(quizMode, stackDepth, selectedPos, selectedVillainPos);
    setPhase('playing');
  }

  function exitQuiz() {
    setPhase('setup');
    setQIdx(0); setScore(0); setAnswered(false); setChoseAction(null); setResults([]);
  }

  // When the URL's ?mode= changes (e.g. via the Stats page's "Practice Now"
  // link landing on the same /quizzes/preflop route), reset to the setup
  // screen in the requested mode. Without this, the component stays mounted
  // and the previous complete screen persists.
  useEffect(() => {
    const urlMode = query?.mode && MODES.some(m => m.id === query.mode) ? query.mode : null;
    if (!urlMode) return;
    if (urlMode === quizMode && phase === 'setup') return;
    setQuizMode(urlMode);
    setSelectedPos('all');
    setSelectedVillainPos('all');
    setPhase('setup');
    resetQuiz(urlMode, stackDepth, 'all', 'all');
  }, [query?.mode]);

  const answer = useCallback((action) => {
    if (answered) return;
    setAnswered(true);
    setChoseAction(action);
    const q = deck[qIdx];
    const isCorrect = action === q.correctAction;
    if (isCorrect) setScore(s => s + 1);
    setResults(r => [...r, { type: q.type, heroPos: q.heroPos, villainPos: q.villainPos, correct: isCorrect }]);
  }, [answered, deck, qIdx]);

  function next() {
    setQIdx(i => i + 1);
    setAnswered(false);
    setChoseAction(null);
  }

  // Auto-advance after answering — only runs when the user has enabled it in settings.
  // Cleanup cancels the timer when next() is called manually.
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
        setQIdx(i => i + 1);
        setAnswered(false);
        setChoseAction(null);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [answered, phase, settings.autoAdvance, settings.autoAdvanceSeconds]);

  // ── Setup screen ──────────────────────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <div>
        <SubNav tabs={TABS} currentPath="/quizzes/preflop" />
        <div class="rq-panel">
          <h2 class="rq-title">Preflop Quiz</h2>

          <div class="rq-setup-label">Mode</div>
          <div class="rq-selector-group">
            {MODES.map(m => (
              <button
                key={m.id}
                class={`rq-selector-btn${m.id === quizMode ? ' active' : ''}`}
                onClick={() => changeMode(m.id)}
              >{m.label}</button>
            ))}
          </div>

          <div class="rq-setup-label">Stack Depth</div>
          <div class="rq-selector-group">
            {STACK_DEPTHS.map(d => (
              <button
                key={d}
                class={`rq-selector-btn${d === stackDepth ? ' active' : ''}`}
                onClick={() => changeStackDepth(d)}
              >{d}</button>
            ))}
          </div>

          <div class="rq-setup-label">Positions</div>
          <PositionTable
            heroSelected={selectedPos}
            villainSelected={selectedVillainPos}
            heroAvailable={getPositionsForMode(quizMode)}
            villainAvailable={getVillainsForSelection(quizMode, selectedPos)}
            onHeroSelect={changePosition}
            onVillainSelect={changeVillainPosition}
            showVillain={quizMode === 'limp' || quizMode === 'vsRaise'}
            heroLabel="Your Position"
            villainLabel={quizMode === 'limp' ? 'Limper' : 'Raiser'}
          />

          <div class="rq-start-row">
            <button class="rq-start-btn" onClick={startQuiz}>Start Quiz</button>
          </div>

          <QuizStats mode={quizMode} />
        </div>
      </div>
    );
  }

  // ── Complete screen ───────────────────────────────────────────────────────
  if (qIdx >= deck.length && deck.length > 0) {
    const pct = Math.round(score / RFI_QUIZ_LENGTH * 100);
    const msg = pct >= 90 ? 'Phenomenal \u2014 you know your ranges!' :
                pct >= 70 ? 'Well played \u2014 solid range knowledge.' :
                pct >= 50 ? 'Good start \u2014 review the charts.' :
                'Hit the charts and come back!';

    saveStats(results, quizMode, score, stackDepth);

    return (
      <div>
        <SubNav tabs={TABS} currentPath="/quizzes/preflop" />
        <div class="rq-panel">
          <div class="rq-complete">
            <h2>{pct >= 70 ? '\uD83C\uDFC6' : '\uD83C\uDCCF'} Quiz Complete</h2>
            <div class="score-big">{score} / {RFI_QUIZ_LENGTH} &mdash; {pct}%</div>
            <p>{msg}</p>
            <button class="rq-restart" onClick={startQuiz}>Play Again</button>
            <button class="rq-restart" style="background:transparent;border:1px solid var(--gold-dark)" onClick={exitQuiz}>Back to Setup</button>
            <a class="rq-restart" href="#/preflop/charts" style="background:transparent;border:1px solid var(--gold-dark);text-decoration:none;display:inline-block;text-align:center">Review Charts</a>
            <a class="rq-restart" href="#/stats" style="background:transparent;border:1px solid var(--gold-dark);text-decoration:none;display:inline-block;text-align:center">Stats</a>
          </div>
          <Recommendation />
          <QuizStats mode={quizMode} />
        </div>
      </div>
    );
  }

  // ── Playing screen ────────────────────────────────────────────────────────
  const current = deck[qIdx];
  const pctDisplay = qIdx > 0 ? Math.round(score / qIdx * 100) + '%' : '\u2014';
  const isCorrect = answered && current ? (choseAction === current.correctAction) : null;
  const buttons = current ? getButtons(current.type) : [];
  const modeLabel = MODES.find(m => m.id === quizMode)?.label ?? quizMode;
  const villainAction = current?.type === 'vsRaise' ? 'raise' : current?.type === 'limp' ? 'limp' : null;

  return (
    <div class="rq-playing-wrapper">
      <div class="rq-panel">
        <div class="rq-playing-header">
          <div class="rq-mode-badge">{modeLabel} &middot; {stackDepth}</div>
          <button class="rq-exit-btn" onClick={exitQuiz}>Exit</button>
        </div>

        <div class="rq-progress"><div class="rq-progress-fill" style={{ width: (qIdx / RFI_QUIZ_LENGTH * 100) + '%' }}></div></div>
        <div class="rq-status">
          <div class="rq-stat"><div class="val">{score}</div><div class="lbl">Correct</div></div>
          <div class="rq-stat"><div class="val">{qIdx + 1} / {RFI_QUIZ_LENGTH}</div><div class="lbl">Question</div></div>
          <div class="rq-stat"><div class="val">{pctDisplay}</div><div class="lbl">Accuracy</div></div>
        </div>

        {current && (
          <>
            <div class="rq-card">
              <div class="rq-pos">Your Position: <strong style="font-size:1.1rem">{current.heroPos}</strong>
                {current.villainPos && <span style="margin-left:.8rem;color:var(--muted)">Villain: <strong style="color:var(--text)">{current.villainPos}</strong></span>}
              </div>
              <div class="rq-table-wrap">
                <PositionTable
                  heroSelected={current.heroPos}
                  villainSelected={current.villainPos || 'all'}
                  heroAvailable={[]}
                  villainAvailable={[]}
                  showVillain={!!current.villainPos}
                  showAllButtons={false}
                  readOnly={true}
                  villainAction={villainAction}
                />
                {answered && (
                  <div class={`rq-explain-overlay${isCorrect ? ' correct' : ' wrong'}`} role="status" aria-live="polite">
                    <div class="rq-explain-verdict">
                      {isCorrect ? 'Correct!' : 'Incorrect.'}{' '}
                      {current.hand} from {current.heroPos} is a <strong>{actionLabel(current.correctAction)}</strong>.
                    </div>
                    <div class="rq-explain-text">{explainQuestion(current)}</div>
                  </div>
                )}
              </div>
              <div class="rq-hand-display" dangerouslySetInnerHTML={{ __html: handToCards(current.hand, current.suit, CARD_SIZES[settings.cardSize]) }} />
              <div style="font-size:1.1rem;color:var(--gold-bright);font-weight:600;margin-top:.3rem">{current.hand}</div>
              <div class="rq-prompt">{promptText(current)}</div>
            </div>

            <div class="rq-actions">
              {buttons.map(btn => {
                const isThis = choseAction === btn.action;
                const isCorrectBtn = current.correctAction === btn.action;
                let cls = `rq-btn rq-btn-${btn.action === 'fold' ? 'fold' : btn.action === 'raise' || btn.action === 'threebet' ? 'raise' : 'call'}`;
                if (answered) {
                  if (isCorrectBtn) cls += ' correct';
                  else if (isThis) cls += ' wrong';
                }
                return (
                  <button key={btn.action} class={cls} disabled={answered} onClick={() => answer(btn.action)}>
                    {btn.label}
                  </button>
                );
              })}
            </div>

            <div class="rq-next-row">
              {answered && (
                <>
                  <button class="rq-next" style="display:inline-block" onClick={next}>Next Question {'\u2192'}</button>
                  {settings.autoAdvance && (
                    <div class="rq-countdown">Auto-advancing in {countdown}s</div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ---------- stats panels ----------
function QuizStats({ mode }) {
  if (mode === 'rfi')     return <RfiStats />;
  if (mode === 'limp')    return <LimpStats />;
  if (mode === 'vsRaise') return <VsRaiseStats />;
  if (mode === 'all')     return <AllModesStats />;
  return null;
}

function RfiStats() {
  const stats = getRfiQuizStats();
  if (!stats || stats.totalQuizzes === 0) return null;
  const overallPct = Math.round(stats.totalCorrect / stats.totalQuestions * 100);
  return (
    <div class="rq-stats">
      <div class="rq-stats-header">
        <div class="rq-stats-title">Your Progress</div>
        <button class="rq-reset-stats" onClick={() => { if (confirm('Reset RFI stats?')) { localStorage.removeItem('rfi-quiz-stats'); location.reload(); } }}>Reset</button>
      </div>
      <div class="rq-stats-grid">
        <div class="rq-stats-card"><div class="val">{stats.totalQuizzes}</div><div class="lbl">Quizzes</div></div>
        <div class="rq-stats-card"><div class="val">{overallPct}%</div><div class="lbl">Overall</div></div>
        <div class="rq-stats-card"><div class="val">{stats.totalCorrect}/{stats.totalQuestions}</div><div class="lbl">Correct</div></div>
      </div>
      <PosByPosition byPos={stats.byPosition} positions={RFI_QUIZ_POSITIONS} label="Position" />
      <RecentScores scores={stats.recentScores} />
    </div>
  );
}

function LimpStats() {
  const stats = getLimpQuizStats();
  if (!stats || stats.totalQuizzes === 0) return null;
  const pct = Math.round(stats.totalCorrect / stats.totalQuestions * 100);
  return (
    <div class="rq-stats">
      <div class="rq-stats-header">
        <div class="rq-stats-title">vs Limp Progress</div>
        <button class="rq-reset-stats" onClick={() => { if (confirm('Reset vs Limp stats?')) { localStorage.removeItem('limp-quiz-stats'); location.reload(); } }}>Reset</button>
      </div>
      <div class="rq-stats-grid">
        <div class="rq-stats-card"><div class="val">{stats.totalQuizzes}</div><div class="lbl">Quizzes</div></div>
        <div class="rq-stats-card"><div class="val">{pct}%</div><div class="lbl">Overall</div></div>
        <div class="rq-stats-card"><div class="val">{stats.totalCorrect}/{stats.totalQuestions}</div><div class="lbl">Correct</div></div>
      </div>
      <PosByPosition byPos={stats.byHeroPosition} positions={LIMP_HERO_POSITIONS} label="Your Position" />
      <RecentScores scores={stats.recentScores} />
    </div>
  );
}

function VsRaiseStats() {
  const stats = getVsRaiseQuizStats();
  if (!stats || stats.totalQuizzes === 0) return null;
  const pct = Math.round(stats.totalCorrect / stats.totalQuestions * 100);
  return (
    <div class="rq-stats">
      <div class="rq-stats-header">
        <div class="rq-stats-title">vs Raise Progress</div>
        <button class="rq-reset-stats" onClick={() => { if (confirm('Reset vs Raise stats?')) { localStorage.removeItem('vs-raise-quiz-stats'); location.reload(); } }}>Reset</button>
      </div>
      <div class="rq-stats-grid">
        <div class="rq-stats-card"><div class="val">{stats.totalQuizzes}</div><div class="lbl">Quizzes</div></div>
        <div class="rq-stats-card"><div class="val">{pct}%</div><div class="lbl">Overall</div></div>
        <div class="rq-stats-card"><div class="val">{stats.totalCorrect}/{stats.totalQuestions}</div><div class="lbl">Correct</div></div>
      </div>
      <PosByPosition byPos={stats.byHeroPosition} positions={RAISE_HERO_POSITIONS} label="Your Position" />
      <RecentScores scores={stats.recentScores} />
    </div>
  );
}

function AllModesStats() {
  const stats = getAllModesQuizStats();
  if (!stats || stats.totalQuizzes === 0) return null;
  const pct = Math.round(stats.totalCorrect / stats.totalQuestions * 100);
  const modeLabels = { rfi: 'RFI', limp: 'vs Limp', vsRaise: 'vs Raise' };
  return (
    <div class="rq-stats">
      <div class="rq-stats-header">
        <div class="rq-stats-title">All Modes Progress</div>
        <button class="rq-reset-stats" onClick={() => { if (confirm('Reset All Modes stats?')) { localStorage.removeItem('all-modes-quiz-stats'); location.reload(); } }}>Reset</button>
      </div>
      <div class="rq-stats-grid">
        <div class="rq-stats-card"><div class="val">{stats.totalQuizzes}</div><div class="lbl">Quizzes</div></div>
        <div class="rq-stats-card"><div class="val">{pct}%</div><div class="lbl">Overall</div></div>
        <div class="rq-stats-card"><div class="val">{stats.totalCorrect}/{stats.totalQuestions}</div><div class="lbl">Correct</div></div>
      </div>
      <div class="rq-pos-stats">
        {Object.entries(stats.byMode).map(([key, ps]) => {
          if (!ps || ps.total === 0) return null;
          const p = Math.round(ps.correct / ps.total * 100);
          const clr = p >= 80 ? '#27ae60' : p >= 60 ? '#c9a84c' : '#c0392b';
          return (
            <div class="rq-pos-row" key={key}>
              <div class="rq-pos-label">{modeLabels[key] || key}</div>
              <div class="rq-pos-bar">
                <div class="rq-pos-bar-fill" style={{ width: p + '%', background: clr }}></div>
                <div class="rq-pos-bar-text">{p}% ({ps.correct}/{ps.total})</div>
              </div>
            </div>
          );
        })}
      </div>
      <RecentScores scores={stats.recentScores} />
    </div>
  );
}

function PosByPosition({ byPos, positions, label }) {
  if (!byPos || Object.keys(byPos).length === 0) return null;
  return (
    <div class="rq-pos-stats">
      {positions.map(pos => {
        const ps = byPos[pos];
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
  );
}

function RecentScores({ scores }) {
  if (!scores || scores.length === 0) return null;
  return (
    <div class="rq-history">
      <div class="rq-history-title">Recent Quizzes</div>
      {scores.slice(-5).reverse().map((r, i) => {
        const p = Math.round(r.score / r.total * 100);
        return (
          <div class="rq-history-row" key={i}>
            <span>{r.date}</span>
            <span style={{ color: p >= 70 ? '#27ae60' : p >= 50 ? '#c9a84c' : '#c0392b' }}>{r.score}/{r.total} ({p}%)</span>
          </div>
        );
      })}
    </div>
  );
}
