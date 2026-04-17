import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(resolve(__dirname, 'header.css'), 'utf8');

describe('header.css hamburger nav', () => {
  it('hamburger button is pinned to the top-left corner on all screens', () => {
    expect(css).toMatch(/\.hamburger\s*\{[^}]*position:fixed/);
    expect(css).toMatch(/\.hamburger\s*\{[^}]*top:1rem/);
    expect(css).toMatch(/\.hamburger\s*\{[^}]*left:1rem/);
  });

  it('drawer is hidden off-screen by default and slides in when open', () => {
    // Default drawer state translates off-screen
    expect(css).toMatch(/\.section-nav\s*\{[^}]*transform:translateX\(-100%\)/);
    // Open state slides it in
    expect(css).toMatch(/\.section-nav\.is-open\s*\{[^}]*transform:translateX\(0\)/);
  });

  it('hamburger sits above drawer and backdrop so it stays clickable to close menu', () => {
    const hamburgerZ = css.match(/\.hamburger\s*\{[^}]*z-index:(\d+)/);
    const navZ = css.match(/\.section-nav\s*\{[^}]*z-index:(\d+)/);
    const backdropZ = css.match(/\.nav-backdrop\s*\{[^}]*z-index:(\d+)/);
    expect(hamburgerZ).not.toBeNull();
    expect(navZ).not.toBeNull();
    expect(backdropZ).not.toBeNull();
    expect(Number(hamburgerZ[1])).toBeGreaterThan(Number(navZ[1]));
    expect(Number(navZ[1])).toBeGreaterThan(Number(backdropZ[1]));
  });

  it('backdrop covers the full viewport behind the drawer', () => {
    expect(css).toMatch(/\.nav-backdrop\s*\{[^}]*position:fixed/);
    expect(css).toMatch(/\.nav-backdrop\s*\{[^}]*inset:0/);
  });

  it('compact header reduces top padding so the suits-row aligns vertically with the hamburger', () => {
    // header.is-compact must override the default 2.5rem top padding with a smaller value
    // so the suits-row sits at roughly the same vertical position as the hamburger button.
    expect(css).toMatch(/header\.is-compact\s*\{[^}]*padding:1\.2rem/);
  });
});
