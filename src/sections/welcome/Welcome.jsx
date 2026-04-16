import { ILLUS } from '../../utils/illustrations.jsx';
import '../../styles/welcome.css';

const HAND_RANKINGS = [
  { key: 'royal-flush', name: 'Royal Flush', desc: 'A, K, Q, J, 10 — all the same suit' },
  { key: 'straight-flush', name: 'Straight Flush', desc: 'Five consecutive cards of the same suit' },
  { key: 'quads', name: 'Four of a Kind', desc: 'Four cards of the same rank' },
  { key: 'full-house', name: 'Full House', desc: 'Three of a kind plus a pair' },
  { key: 'flush', name: 'Flush', desc: 'Five cards of the same suit, any order' },
  { key: 'straight', name: 'Straight', desc: 'Five consecutive cards of mixed suits' },
  { key: 'trips', name: 'Three of a Kind', desc: 'Three cards of the same rank' },
  { key: 'two-pair', name: 'Two Pair', desc: 'Two different pairs' },
  { key: 'pair', name: 'One Pair', desc: 'Two cards of the same rank' },
  { key: 'high-card', name: 'High Card', desc: 'No combination — highest card plays' },
];

const SECTIONS = [
  {
    href: '#/terminology/study',
    title: 'Terminology',
    desc: 'Learn the language of poker with interactive flashcards and a searchable glossary of 78+ terms.',
  },
  {
    href: '#/preflop/charts',
    title: 'Preflop Strategy',
    desc: 'Study GTO-optimal preflop raise ranges for every position with interactive charts.',
  },
  {
    href: '#/quizzes/terminology',
    title: 'Quizzes',
    desc: 'Test your knowledge with terminology and preflop decision quizzes across all positions and stack depths.',
  },
  {
    href: '#/stats',
    title: 'Stats',
    desc: 'Track your learning progress across all study modes and quiz scores in one dashboard.',
  },
];

export function Welcome({ path }) {
  return (
    <div class="welcome">
      <h2 class="sections-heading">Explore the Trainer</h2>

      <div class="sections-grid">
        {SECTIONS.map(s => (
          <a class="section-card" href={s.href} key={s.href}>
            <div class="section-card-title">{s.title}</div>
            <div class="section-card-desc">{s.desc}</div>
            <span class="section-card-link">Start learning &rarr;</span>
          </a>
        ))}
      </div>

      <h2>Poker Hand Rankings</h2>
      <p class="welcome-intro">From strongest to weakest — know these by heart.</p>

      <div class="rankings-grid">
        {HAND_RANKINGS.map((h, i) => (
          <div class="ranking-card" key={h.key}>
            <span class="ranking-rank">#{i + 1}</span>
            <div class="ranking-name">{h.name}</div>
            <div class="ranking-illus" dangerouslySetInnerHTML={{ __html: ILLUS[h.key]() }} />
            <div class="ranking-desc">{h.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
