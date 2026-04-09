import { describe, it, expect } from 'vitest';
import { TERMS, CATS } from './terms.js';
import { ILLUS } from '../utils/illustrations.jsx';

describe('terms data integrity', () => {
  it('every term has required fields', () => {
    for (const t of TERMS) {
      expect(t.term).toBeTruthy();
      expect(t.cat).toBeTruthy();
      expect(t.def).toBeTruthy();
      expect(t.illus).toBeTruthy();
    }
  });

  it('no duplicate term names', () => {
    const names = TERMS.map(t => t.term);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });

  it('all illus keys resolve to ILLUS entries or table positions', () => {
    for (const t of TERMS) {
      const valid = t.illus.startsWith('table-') || typeof ILLUS[t.illus] === 'function';
      expect(valid, `missing illustration for "${t.term}" (key: ${t.illus})`).toBe(true);
    }
  });

  it('CATS is derived from TERMS with no empty categories', () => {
    expect(CATS.length).toBeGreaterThan(0);
    for (const cat of CATS) {
      expect(cat).toBeTruthy();
      const count = TERMS.filter(t => t.cat === cat).length;
      expect(count, `category "${cat}" has no terms`).toBeGreaterThan(0);
    }
  });
});

describe('card combination terms', () => {
  const cardComboTerms = [
    'Offsuit',
    'Suited Connectors',
    'Connectors',
    'Broadway',
    'Overcards',
    'Set',
    'Trips',
    'Top Pair',
    'Overpair',
    'Wheel',
    'Open-Ended Straight Draw (OESD)',
    'Gutshot (Inside Straight Draw)',
    'Flush Draw',
    'Combo Draw',
    'Counterfeit',
  ];

  for (const name of cardComboTerms) {
    it(`"${name}" exists in Board & Cards category`, () => {
      const found = TERMS.find(t => t.term === name);
      expect(found, `term "${name}" not found`).toBeTruthy();
      expect(found.cat).toBe('Board & Cards');
    });
  }
});
