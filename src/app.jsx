import { useState, useEffect } from 'preact/hooks';
import { Header } from './components/Header.jsx';
import { Study } from './sections/terminology/Study.jsx';
import { Quiz as TermQuiz } from './sections/terminology/Quiz.jsx';
import { Reference } from './sections/terminology/Reference.jsx';
import { Charts } from './sections/preflop/Charts.jsx';
import { PreflopQuiz } from './sections/preflop/Quiz.jsx';
import { Dashboard } from './sections/stats/Dashboard.jsx';

function useHashRoute() {
  const getPath = () => window.location.hash.slice(1) || '/';
  const [path, setPath] = useState(getPath);

  useEffect(() => {
    const onHash = () => setPath(getPath());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  return path;
}

const ROUTES = {
  '/terminology/study': Study,
  '/terminology/quiz': TermQuiz,
  '/terminology/reference': Reference,
  '/preflop/charts': Charts,
  '/preflop/quiz': PreflopQuiz,
  '/stats': Dashboard,
};

const REDIRECTS = {
  '/': '/terminology/study',
  '/terminology': '/terminology/study',
  '/preflop': '/preflop/charts',
};

export function App() {
  const path = useHashRoute();

  // Handle redirects
  const redirect = REDIRECTS[path];
  if (redirect) {
    window.location.hash = '#' + redirect;
    return null;
  }

  const Page = ROUTES[path] || Study;

  return (
    <>
      <Header />
      <Page path={path} />
    </>
  );
}
