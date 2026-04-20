import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dashboardSource = readFileSync(resolve(__dirname, 'Dashboard.jsx'), 'utf8');

describe('Dashboard — section order', () => {
  it('renders preflop quiz sections before Study Progress', () => {
    // User-requested ordering: preflop stats (the primary trainer) live
    // above study/terminology stats on the dashboard.
    const rfiIdx     = dashboardSource.indexOf('Preflop RFI Quiz');
    const limpIdx    = dashboardSource.indexOf('Preflop vs Limp Quiz');
    const vsRaiseIdx = dashboardSource.indexOf('Preflop vs Raise Quiz');
    const allIdx     = dashboardSource.indexOf('Preflop All-Modes Quiz');
    const studyIdx   = dashboardSource.indexOf('<h3>Study Progress</h3>');
    const termIdx    = dashboardSource.indexOf('<h3>Terminology Quiz</h3>');

    expect(rfiIdx).toBeGreaterThan(-1);
    expect(studyIdx).toBeGreaterThan(-1);
    expect(termIdx).toBeGreaterThan(-1);

    expect(rfiIdx).toBeLessThan(studyIdx);
    expect(limpIdx).toBeLessThan(studyIdx);
    expect(vsRaiseIdx).toBeLessThan(studyIdx);
    expect(allIdx).toBeLessThan(studyIdx);
    expect(studyIdx).toBeLessThan(termIdx);
  });
});

describe('Dashboard — terminology quiz category breakdown', () => {
  it('renders an "Accuracy by Category" bar chart from termQuiz.byCategory', () => {
    // Mirrors the RFI "Accuracy by Position" chart — users need to see which
    // term categories they struggle with, not just an overall accuracy number.
    expect(dashboardSource).toMatch(/Accuracy by Category/);
    expect(dashboardSource).toMatch(/termQuiz\.byCategory/);
  });

  it('iterates CATS when rendering per-category rows so order matches the rest of the app', () => {
    expect(dashboardSource).toMatch(/CATS\.map\(cat\s*=>\s*\{[\s\S]*?termQuiz\.byCategory\[cat\]/);
  });
});
