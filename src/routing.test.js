import { describe, it, expect } from 'vitest';
import { REDIRECTS, ROUTES_LIST, resolveRoute } from './routing.js';

describe('routing', () => {
  it('resolves / to /terminology/study (default landing page)', () => {
    expect(resolveRoute('/')).toBe('/terminology/study');
  });

  it('resolves /terminology shorthand to study page', () => {
    expect(resolveRoute('/terminology')).toBe('/terminology/study');
  });

  it('resolves /preflop shorthand to charts page', () => {
    expect(resolveRoute('/preflop')).toBe('/preflop/charts');
  });

  it('passes through known routes unchanged', () => {
    for (const route of ROUTES_LIST) {
      expect(resolveRoute(route)).toBe(route);
    }
  });

  it('all redirect targets exist in the routes list — prevents blank page on load', () => {
    // This test catches the regression: a redirect pointing to a non-existent
    // route would cause App to fall back to Study silently; a redirect
    // to a path that previously returned null would cause a blank page.
    for (const target of Object.values(REDIRECTS)) {
      expect(ROUTES_LIST).toContain(target);
    }
  });

  it('resolveRoute never returns a redirect source path — no redirect loops', () => {
    for (const source of Object.keys(REDIRECTS)) {
      const resolved = resolveRoute(source);
      expect(Object.keys(REDIRECTS)).not.toContain(resolved);
    }
  });

  it('empty hash on initial load resolves to a renderable route — no blank page regression', () => {
    // Reproduces the startup sequence in useHashRoute:
    //   window.location.hash.slice(1) || '/'
    // When the page loads with no hash (e.g. https://example.com/poker-trainer/),
    // hash is '', so slice(1) is '', and '' || '/' gives '/'.
    // This was the path that previously triggered `return null` and caused a blank page.
    const path = ''.slice(1) || '/';
    const effectivePath = resolveRoute(path);
    expect(effectivePath).toBeTruthy();
    expect(ROUTES_LIST).toContain(effectivePath);
  });
});
