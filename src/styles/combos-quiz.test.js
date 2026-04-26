import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(resolve(__dirname, 'combos-quiz.css'), 'utf8');

describe('combos-quiz.css reachability table', () => {
  // Regression: at desktop the phase-3 (single-column) header & row both
  // collapse to `1fr 92px`. At mobile width the dual-column rule is overridden
  // to `1fr 64px 64px`, but without a matching mobile single-column rule the
  // row matched the 3-column variant while the header kept `1fr 92px` — the
  // checkbox ended up 64px from the right while the "By River" header sat at
  // the right edge, visually misaligned.
  it('mobile media query overrides single-column variants for both header and row', () => {
    // Pull out the mobile media block as a chunk.
    const mobileBlock = css.match(/@media\s*\(max-width:520px\)\s*\{([\s\S]*?)\n\}/);
    expect(mobileBlock, 'mobile media query block should exist').not.toBeNull();
    const body = mobileBlock[1];

    // Both single-column selectors must be present in the mobile block, and
    // they must use a single 64px column (matching the dual variant's right
    // column width) so phase-3 checkboxes align with the "By River" header.
    expect(body).toMatch(/\.combos-reach-head\.combos-reach-head-single/);
    expect(body).toMatch(/\.combos-reach-row-single/);
    expect(body).toMatch(/grid-template-columns:\s*minmax\(0,\s*1fr\)\s*64px\s*[;}]/);
  });

  it('desktop and mobile single-column rules use the same right-column width as the dual variant', () => {
    // Desktop: dual = `1fr 92px 92px`, single = `1fr 92px`. Mobile: dual =
    // `1fr 64px 64px`, single must = `1fr 64px`. This keeps the header's
    // right column flush with the row's checkbox cell at every breakpoint.
    expect(css).toMatch(
      /\.combos-reach-head\.combos-reach-head-single,\s*\.combos-reach-row-single\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s*92px[^}]*\}/
    );

    const mobileBlock = css.match(/@media\s*\(max-width:520px\)\s*\{([\s\S]*?)\n\}/)[1];
    expect(mobileBlock).toMatch(
      /\.combos-reach-head\.combos-reach-head-single,\s*\.combos-reach-row-single\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s*64px[^}]*\}/
    );
  });
});
