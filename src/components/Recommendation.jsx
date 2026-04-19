import { getRfiQuizStats, getLimpQuizStats, getVsRaiseQuizStats } from '../utils/storage.js';
import { getRecommendation } from '../utils/recommendation.js';
import '../styles/stats.css';

export function Recommendation() {
  const rec = getRecommendation({
    rfi:     getRfiQuizStats(),
    limp:    getLimpQuizStats(),
    vsRaise: getVsRaiseQuizStats(),
  });
  if (!rec) return null;
  return (
    <div class="stats-recommendation" data-testid="stats-recommendation">
      <div class="stats-rec-label">Recommended Next Quiz</div>
      <div class="stats-rec-title">{rec.label}</div>
      <div class="stats-rec-reason">{rec.reason}</div>
      <a class="stats-rec-btn" href={rec.href}>
        {rec.accuracy === null ? 'Start Quiz' : 'Practice Now'} &rarr;
      </a>
    </div>
  );
}
