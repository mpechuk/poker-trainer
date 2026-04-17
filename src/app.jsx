import { useState, useEffect } from 'preact/hooks';
import { Header } from './components/Header.jsx';
import { Study } from './sections/terminology/Study.jsx';
import { Quiz as TermQuiz } from './sections/terminology/Quiz.jsx';
import { Reference } from './sections/terminology/Reference.jsx';
import { Charts } from './sections/preflop/Charts.jsx';
import { LimpCharts } from './sections/preflop/LimpCharts.jsx';
import { RaiseCharts } from './sections/preflop/RaiseCharts.jsx';
import { PreflopQuiz } from './sections/preflop/Quiz.jsx';
import { Dashboard } from './sections/stats/Dashboard.jsx';
import { Welcome } from './sections/welcome/Welcome.jsx';
import { REDIRECTS } from './routing.js';

function parseHash() {
  const raw = window.location.hash.slice(1) || '/';
  const qIdx = raw.indexOf('?');
  if (qIdx < 0) return { path: raw, query: {} };
  const path = raw.slice(0, qIdx);
  const query = {};
  for (const pair of raw.slice(qIdx + 1).split('&')) {
    if (!pair) continue;
    const [k, v = ''] = pair.split('=');
    query[decodeURIComponent(k)] = decodeURIComponent(v);
  }
  return { path, query };
}

function useHashRoute() {
  const [route, setRoute] = useState(parseHash);

  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  return route;
}

const ROUTES = {
  '/welcome': Welcome,
  '/terminology/study': Study,
  '/terminology/reference': Reference,
  '/preflop/charts': Charts,
  '/preflop/limp': LimpCharts,
  '/preflop/vs-raise': RaiseCharts,
  '/quizzes/terminology': TermQuiz,
  '/quizzes/preflop': PreflopQuiz,
  '/stats': Dashboard,
};

export function App() {
  const { path, query } = useHashRoute();
  const redirect = REDIRECTS[path];

  // Update the URL when a redirect is needed, but render the target immediately
  useEffect(() => {
    if (redirect) {
      window.location.hash = '#' + redirect;
    }
  }, [redirect]);

  const effectivePath = redirect || path;
  const Page = ROUTES[effectivePath] || Welcome;

  return (
    <>
      <Header />
      <Page path={effectivePath} query={query} />
    </>
  );
}
