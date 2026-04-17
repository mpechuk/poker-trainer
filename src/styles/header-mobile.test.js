import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(resolve(__dirname, 'header.css'), 'utf8');

describe('header.css mobile nav', () => {
  it('section-nav wraps to multiple rows on small screens — prevents mobile truncation', () => {
    expect(css).toContain('flex-wrap:wrap');
  });

  it('has a mobile media query for section-nav', () => {
    expect(css).toMatch(/@media\s*\(max-width:\s*540px\)/);
  });

  it('last two nav items are wider on mobile to balance the 3+2 row layout', () => {
    expect(css).toContain('nth-last-child(2)');
    expect(css).toContain('flex:1 0 50%');
  });
});
