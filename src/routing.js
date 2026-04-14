// Pure routing logic extracted for testability
export const ROUTES_LIST = [
  '/welcome',
  '/terminology/study',
  '/terminology/quiz',
  '/terminology/reference',
  '/preflop/charts',
  '/preflop/limp',
  '/preflop/vs-raise',
  '/preflop/quiz',
  '/stats',
];

export const REDIRECTS = {
  '/': '/welcome',
  '/terminology': '/terminology/study',
  '/preflop': '/preflop/charts',
};

// Resolves a raw hash path to the effective route path (following redirects)
export function resolveRoute(path) {
  return REDIRECTS[path] || path;
}
