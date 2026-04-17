import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(__dirname, 'Reference.jsx'), 'utf8');

describe('Reference search input placeholder', () => {
  it('uses the literal ellipsis character, not a JS escape sequence — regression for visible "\\u2026" text', () => {
    // JSX attribute strings do not process JS escape sequences, so `placeholder="Search terms\u2026"`
    // rendered as the literal text `Search terms\u2026` in the input.
    const placeholderMatch = source.match(/placeholder="([^"]+)"/);
    expect(placeholderMatch, 'expected a placeholder attribute on the search input').not.toBeNull();
    expect(placeholderMatch[1]).not.toMatch(/\\u[0-9a-fA-F]{4}/);
  });

  it('reads "Search terminology…"', () => {
    expect(source).toContain('placeholder="Search terminology…"');
  });
});
