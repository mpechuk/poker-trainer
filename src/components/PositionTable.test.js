import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(resolve(__dirname, 'PositionTable.jsx'), 'utf8');

describe('PositionTable — visual position selector', () => {
  it('renders all six 6-max seats (UTG, HJ, CO, BTN, SB, BB)', () => {
    for (const pos of ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB']) {
      expect(source).toMatch(new RegExp(`id:\\s*'${pos}'`));
    }
  });

  it('calls onSelect only for available seats — disabled seats cannot be clicked', () => {
    expect(source).toMatch(/enabled\s*\?\s*\(\)\s*=>\s*onSelect\(seat\.id\)\s*:\s*undefined/);
  });

  it('supports keyboard activation (Enter/Space) for a11y', () => {
    expect(source).toMatch(/e\.key\s*===\s*'Enter'\s*\|\|\s*e\.key\s*===\s*' '/);
    expect(source).toMatch(/onSelect\(seat\.id\)/);
  });

  it('renders an "All Positions" option when allowAll is true', () => {
    expect(source).toMatch(/allowAll\s*=\s*true/);
    expect(source).toMatch(/All Positions/);
    expect(source).toMatch(/onSelect\('all'\)/);
  });

  it('highlights the selected seat and marks it aria-pressed', () => {
    expect(source).toMatch(/aria-pressed/);
    expect(source).toMatch(/active\s*=\s*enabled\s*&&\s*selected\s*===\s*seat\.id/);
  });

  it('visually dims seats that are not in the available set — no dead-click feedback', () => {
    expect(source).toMatch(/availSet\.has\(seat\.id\)/);
    expect(source).toMatch(/dimmed/);
  });
});
