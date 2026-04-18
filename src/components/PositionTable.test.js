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

  it('distinguishes hero (gold) and villain (red) seats visually', () => {
    expect(source).toMatch(/HERO_FILL\s*=\s*'#c9a84c'/);
    expect(source).toMatch(/VILL_FILL/);
    expect(source).toMatch(/pt-seat-hero/);
    expect(source).toMatch(/pt-seat-villain/);
  });

  // ── New behavior: auto-switch active role after a seat click ────────────
  it('auto-switches to villain after a hero seat is picked — so user flows hero → villain without clicking the role tab', () => {
    expect(source).toMatch(/onHeroSelect\(id\);[\s\S]{0,120}setActiveRole\('villain'\)/);
  });

  it('auto-switches back to hero after a villain seat is picked — so user flows villain → hero next', () => {
    expect(source).toMatch(/onVillainSelect\(id\);[\s\S]{0,120}setActiveRole\('hero'\)/);
  });

  it('auto-switch only fires when showVillain is true — otherwise there is no other role to switch to', () => {
    expect(source).toMatch(/showVillain\s*&&\s*autoSwitchRole/);
  });

  it('auto-switch can be disabled via the autoSwitchRole prop', () => {
    expect(source).toMatch(/autoSwitchRole\s*=\s*true/);
  });

  // ── New behavior: two separate "All" buttons (hero + villain) ──────────
  it('renders separate "All" buttons for hero and villain — both accessible without toggling the active role', () => {
    // Hero "All" button calls onHeroSelect('all').
    expect(source).toMatch(/onHeroSelect\('all'\)/);
    // Villain "All" button calls onVillainSelect('all').
    expect(source).toMatch(/onVillainSelect\('all'\)/);
    // Both buttons must live inside the same pt-all-row container.
    expect(source).toMatch(/pt-all-row[\s\S]+onHeroSelect\('all'\)[\s\S]+onVillainSelect\('all'\)/);
  });

  it('the villain "All" button only renders when showVillain is true', () => {
    expect(source).toMatch(/showVillain\s*&&\s*\(\s*<button[\s\S]+?onVillainSelect\('all'\)/);
  });

  it('the All-buttons row can be hidden via the showAllButtons prop (for chart use where "All" is not meaningful)', () => {
    expect(source).toMatch(/showAllButtons\s*=\s*true/);
    expect(source).toMatch(/showAllButtons\s*&&\s*\(/);
  });
});
