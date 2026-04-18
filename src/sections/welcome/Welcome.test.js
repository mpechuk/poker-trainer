import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { REDIRECTS, resolveRoute } from '../../routing.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(resolve(__dirname, 'Welcome.jsx'), 'utf8');

describe('Welcome — section cards', () => {
  it('Quizzes card links to the Preflop quiz — Preflop is the default quiz mode', () => {
    // Regression: the Quizzes card previously pointed to /quizzes/terminology,
    // but Preflop is the default quiz landing per the Quizzes nav and /quizzes redirect.
    expect(source).toMatch(/href:\s*'#\/quizzes\/preflop'[\s\S]{0,80}title:\s*'Quizzes'/);
    expect(source).not.toMatch(/href:\s*'#\/quizzes\/terminology'/);
  });

  it('Quizzes card href resolves to the same target as the /quizzes redirect — consistent default', () => {
    const match = source.match(/href:\s*'#(\/quizzes\/[a-z]+)'[\s\S]{0,80}title:\s*'Quizzes'/);
    expect(match).toBeTruthy();
    const quizzesCardPath = match[1];
    expect(resolveRoute(quizzesCardPath)).toBe(REDIRECTS['/quizzes']);
  });
});
