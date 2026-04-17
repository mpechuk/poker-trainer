import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(resolve(__dirname, 'Header.jsx'), 'utf8');

describe('Header — hamburger menu', () => {
  it('renders a hamburger toggle button with accessible label', () => {
    expect(source).toMatch(/class=\{?`?hamburger/);
    expect(source).toMatch(/aria-label=\{[^}]*menu/i);
    expect(source).toMatch(/aria-expanded=\{menuOpen\}/);
  });

  it('toggles menuOpen state when the hamburger is clicked', () => {
    expect(source).toMatch(/setMenuOpen\(o\s*=>\s*!o\)/);
  });

  it('closes the menu when a nav link is clicked — avoids leaving drawer open after navigation', () => {
    expect(source).toMatch(/onClick=\{\(\)\s*=>\s*setMenuOpen\(false\)\}/);
  });

  it('closes the menu on Escape key', () => {
    expect(source).toMatch(/e\.key\s*===\s*'Escape'/);
  });

  it('closes the menu on hashchange — so the drawer disappears after client-side navigation', () => {
    expect(source).toMatch(/hashchange/);
    // setMenuOpen(false) must appear inside the hashchange handler block
    expect(source).toMatch(/onHash[\s\S]{0,200}setMenuOpen\(false\)/);
  });

  it('includes all five top-level sections in the drawer', () => {
    for (const label of ['Home', 'Terminology', 'Preflop', 'Quizzes', 'Stats']) {
      expect(source).toContain(label);
    }
  });

  it('includes a backdrop that closes the menu when clicked outside', () => {
    expect(source).toMatch(/nav-backdrop/);
    // The backdrop's onClick must also call setMenuOpen(false)
    expect(source).toMatch(/nav-backdrop[\s\S]{0,200}setMenuOpen\(false\)/);
  });
});
