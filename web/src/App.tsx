import { useEffect, useState } from 'react';
import Header from './components/Header';
import Landing from './components/Landing';
import Guide from './components/Guide';
import { guides } from './data';
import './app.css';

// Hash routes: "#/" is the search page, "#/<slug>" is a guide. In-page anchors ("#zones") leave the route alone.
function readRoute() {
  const h = window.location.hash;
  return h.startsWith('#/') ? h.slice(2) : null;
}

export default function App() {
  const [route, setRoute] = useState<string>(() => readRoute() ?? '');

  useEffect(() => {
    const onHash = () => {
      const r = readRoute();
      if (r !== null) setRoute(r);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const guide = route ? guides[route.toLowerCase()] : undefined;

  return (
    <>
      <Header />
      {guide ? <Guide guide={guide} /> : <Landing key={route} notFound={route || undefined} />}
    </>
  );
}
