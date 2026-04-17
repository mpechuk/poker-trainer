import { useState, useEffect } from 'preact/hooks';
import '../styles/header.css';

const NAV_ITEMS = [
  { href: '#/welcome', label: 'Home', section: 'welcome' },
  { href: '#/terminology/study', label: 'Terminology', section: 'terminology' },
  { href: '#/preflop/charts', label: 'Preflop', section: 'preflop' },
  { href: '#/quizzes/preflop', label: 'Quizzes', section: 'quizzes' },
  { href: '#/stats', label: 'Stats', section: 'stats' },
];

export function Header() {
  const [currentPath, setCurrentPath] = useState(window.location.hash.slice(1) || '/welcome');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onHash = () => {
      setCurrentPath(window.location.hash.slice(1) || '/welcome');
      setMenuOpen(false);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const section = currentPath.split('/')[1] || 'welcome';

  return (
    <header>
      <button
        type="button"
        class={`hamburger${menuOpen ? ' is-open' : ''}`}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        aria-controls="primary-nav"
        onClick={() => setMenuOpen(o => !o)}
      >
        <span class="hamburger-bar"></span>
        <span class="hamburger-bar"></span>
        <span class="hamburger-bar"></span>
      </button>

      {menuOpen && (
        <div class="nav-backdrop" onClick={() => setMenuOpen(false)} aria-hidden="true"></div>
      )}

      <nav
        id="primary-nav"
        class={`section-nav${menuOpen ? ' is-open' : ''}`}
        aria-hidden={!menuOpen}
      >
        {NAV_ITEMS.map(item => (
          <a
            key={item.href}
            href={item.href}
            class={section === item.section ? 'active' : ''}
            tabIndex={menuOpen ? 0 : -1}
            onClick={() => setMenuOpen(false)}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div class="suits-row">
        <span class="s">{'\u2660'}</span>
        <span class="h">{'\u2665'}</span>
        <span class="d">{'\u2666'}</span>
        <span class="c">{'\u2663'}</span>
      </div>
      <h1><em>Texas Hold'em</em> Poker Trainer</h1>
      <p class="subtitle">Master the language of the felt</p>
    </header>
  );
}
