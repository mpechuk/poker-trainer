// Pure routing logic extracted for testability
export const ROUTES_LIST = [
  '/welcome',
  '/terminology/study',
  '/terminology/reference',
  '/preflop/charts',
  '/preflop/limp',
  '/preflop/vs-raise',
  '/quizzes/terminology',
  '/quizzes/preflop',
  '/quizzes/flop',
  '/stats',
  '/settings',
];

export const REDIRECTS = {
  '/': '/welcome',
  '/terminology': '/terminology/study',
  '/preflop': '/preflop/charts',
  '/quizzes': '/quizzes/preflop',
  '/terminology/quiz': '/quizzes/terminology',
  '/preflop/quiz': '/quizzes/preflop',
};

// Resolves a raw hash path to the effective route path (following redirects)
export function resolveRoute(path) {
  return REDIRECTS[path] || path;
}
