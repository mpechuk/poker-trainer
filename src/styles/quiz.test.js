import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(resolve(__dirname, 'quiz.css'), 'utf8');

describe('quiz.css — answer button hover', () => {
  it('gates .ans-btn:hover inside @media (hover: hover) — iOS hover-stickiness regression for #46', () => {
    // Without the media gate, iOS keeps :hover on the last-tapped element
    // until another tap. After tapping "Next Question" or an answer in the
    // previous question, a randomly-positioned answer in the *next* question
    // inherited the gold border/background — the user-reported "yellow
    // highlight shows randomly" bug.
    //
    // Find the @media (hover: hover) block and assert that .ans-btn:hover
    // lives inside it (not as a bare top-level rule).
    const mediaBlockMatch = css.match(/@media\s*\(hover:\s*hover\)\s*\{([\s\S]*?)\n\}/);
    expect(mediaBlockMatch, 'expected a @media (hover: hover) block in quiz.css').not.toBeNull();
    expect(mediaBlockMatch[1]).toMatch(/\.ans-btn:hover/);

    // There must be no bare .ans-btn:hover rule at the top level — otherwise
    // the media-gated version would be redundant and iOS would still see it.
    const withoutMedia = css.replace(/@media\s*\(hover:\s*hover\)\s*\{[\s\S]*?\n\}/g, '');
    expect(withoutMedia).not.toMatch(/\.ans-btn:hover/);
  });
});
