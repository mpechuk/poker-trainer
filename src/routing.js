// Pure routing logic extracted for testability
export const ROUTES_LIST = [
  '/terminology/study',
  '/terminology/quiz',
  '/terminology/reference',
  '/preflop/charts',
  '/preflop/quiz',
  '/stats',
];

export const REDIRECTS = {
  '/': '/terminology/study',
  '/terminology': '/terminology/study',
  '/preflop': '/preflop/charts',
};

// Resolves a raw hash path to the effective route path (following redirects)
export function resolveRoute(path) {
  return REDIRECTS[path] || path;
}
