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

  it('selects hero and villain on the same chart — no second table instance', () => {
    expect(source).toMatch(/heroSelected/);
    expect(source).toMatch(/villainSelected/);
    expect(source).toMatch(/onHeroSelect/);
    expect(source).toMatch(/onVillainSelect/);
  });

  it('renders a dealer button chip near the BTN seat — so the button position is obvious', () => {
    expect(source).toMatch(/pt-dealer-chip/);
    // Chip must be derived from BTN_SEAT coordinates, not a magic pair.
    expect(source).toMatch(/BTN_SEAT\.x\s*\+/);
    expect(source).toMatch(/BTN_SEAT\.y\s*\+/);
    // And it must actually be a filled yellow circle.
    expect(source).toMatch(/fill="#f5e27a"/);
  });

  it('role tabs toggle which role a seat click targets', () => {
    expect(source).toMatch(/role="tablist"/);
    expect(source).toMatch(/setActiveRole\('hero'\)/);
    expect(source).toMatch(/setActiveRole\('villain'\)/);
    expect(source).toMatch(/active\s*===\s*'hero'/);
  });

  it('forces active role back to hero when villain is not applicable (e.g. RFI mode)', () => {
    expect(source).toMatch(/!showVillain[\s\S]{0,120}setActiveRole\('hero'\)/);
  });

  it('ignores clicks on seats that are not in the active role\'s available set', () => {
    expect(source).toMatch(/if\s*\(\s*!heroAvailSet\.has\(id\)\s*\)\s*return/);
    expect(source).toMatch(/if\s*\(\s*!villainAvailSet\.has\(id\)\s*\)\s*return/);
  });

  it('supports keyboard activation (Enter/Space) for a11y', () => {
    expect(source).toMatch(/e\.key\s*===\s*'Enter'\s*\|\|\s*e\.key\s*===\s*' '/);
    expect(source).toMatch(/handleSeatClick\(seat\.id\)/);
  });

  it('renders an "All" button for the currently active role', () => {
    expect(source).toMatch(/setAllForActive/);
    expect(source).toMatch(/onHeroSelect\('all'\)/);
    expect(source).toMatch(/onVillainSelect\('all'\)/);
  });

  it('distinguishes hero (gold) and villain (red) seats visually', () => {
    expect(source).toMatch(/HERO_FILL\s*=\s*'#c9a84c'/);
    expect(source).toMatch(/VILL_FILL/);
    expect(source).toMatch(/pt-seat-hero/);
    expect(source).toMatch(/pt-seat-villain/);
  });
});
