import { useState, useEffect } from 'preact/hooks';
import '../styles/header.css';

export function Header() {
  const [currentPath, setCurrentPath] = useState(window.location.hash.slice(1) || '/terminology/study');

  useEffect(() => {
    const onHash = () => setCurrentPath(window.location.hash.slice(1) || '/terminology/study');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const section = currentPath.split('/')[1] || 'welcome';

  return (
    <header>
      <div class="suits-row">
        <span class="s">{'\u2660'}</span>
        <span class="h">{'\u2665'}</span>
        <span class="d">{'\u2666'}</span>
        <span class="c">{'\u2663'}</span>
      </div>
      <h1><em>Texas Hold'em</em> Poker Trainer</h1>
      <p class="subtitle">Master the language of the felt</p>
      <nav class="section-nav">
        <a href="#/welcome" class={section === 'welcome' ? 'active' : ''}>Home</a>
        <a href="#/terminology/study" class={section === 'terminology' ? 'active' : ''}>Terminology</a>
        <a href="#/preflop/charts" class={section === 'preflop' ? 'active' : ''}>Preflop</a>
        <a href="#/quizzes/preflop" class={section === 'quizzes' ? 'active' : ''}>Quizzes</a>
        <a href="#/stats" class={section === 'stats' ? 'active' : ''}>Stats</a>
      </nav>
    </header>
  );
}
