import { useEffect, useState } from 'react';
import type { CityGuide } from '../types';
import { ConstraintCost, Season, Spots, Vibe, Zones } from './SectionA';
import { Food, Itinerary, Safety, Stay, Transport } from './SectionB';
import { FaqLinks, MoreTime } from './SectionC';
import { GuideProvider, IconArrowLeft, PartHeader } from './ui';

// Plain-language navigation. The A/B/C framework stays in the data model; readers see what each part answers.
const toc = (city: string) => [
  {
    title: `Get to know ${city}`,
    intro: 'What it’s like, what it costs, its areas and what to see.',
    items: [
      { id: 'vibe', label: `Is ${city} for you?` },
      { id: 'cost', label: 'Costs and essentials' },
      { id: 'zones', label: 'The areas to explore' },
      { id: 'spots', label: 'What to see' },
      { id: 'season', label: 'When to go' },
    ],
  },
  {
    title: 'Plan your trip',
    intro: 'Your days, getting around, where to stay, what to eat and staying safe.',
    items: [
      { id: 'itinerary', label: 'Plan your days' },
      { id: 'transport', label: 'Getting around' },
      { id: 'stay', label: 'Where to stay' },
      { id: 'food', label: 'What to eat' },
      { id: 'safety', label: 'Staying safe' },
    ],
  },
  {
    title: 'If you have more time',
    intro: 'Day trips, common questions and more guides.',
    items: [
      { id: 'more-time', label: 'Day trips' },
      { id: 'faq', label: 'Questions and more guides' },
    ],
  },
];

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-120px 0px -60% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);
  return active;
}

export default function Guide({ guide }: { guide: CityGuide }) {
  const groups = toc(guide.city);
  const [ids] = useState(() => groups.flatMap((g) => g.items.map((i) => i.id)));
  const active = useActiveSection(ids);

  useEffect(() => {
    document.title = `${guide.city} travel guide · Headout`;
    window.scrollTo(0, 0);
  }, [guide]);

  // In-page anchors scroll without replacing the "#/<city>" route in the URL.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a');
      const href = a?.getAttribute('href');
      if (!href || !href.startsWith('#') || href.startsWith('#/')) return;
      const el = document.getElementById(href.slice(1));
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ block: 'start' });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const spotCount = guide.zones.reduce((n, z) => n + z.spots.length, 0);

  return (
    <GuideProvider guide={guide}>
      <div className="hero" style={{ backgroundImage: `url(${guide.heroImage})` }}>
        <div className="hero__overlay" />
        <div className="rail hero__inner">
          <a href="#/" className="hero__back t-label-regular"><IconArrowLeft size={14} />All cities</a>
          <h1 className="t-display-regular">{guide.city} travel guide</h1>
          <p className="t-para-medium hero__sub">
            {guide.zones.length} areas, {spotCount} ranked places, and day-by-day plans with routes for every trip length.
          </p>
        </div>
      </div>

      <div className="rail guide-layout">
        <aside className="toc" aria-label="On this page">
          <p className="t-heading-small toc__title">In this guide</p>
          {groups.map((g, gi) => (
            <div key={g.title} className="toc__group">
              <p className="t-subheading-small grey-3">{gi + 1}. {g.title}</p>
              <ul>
                {g.items.map((i) => (
                  <li key={i.id}>
                    <a href={`#${i.id}`} className="t-label-regular" aria-current={active === i.id ? 'true' : undefined}>{i.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>

        <main className="guide-content">
          <PartHeader step={1} title={groups[0].title} intro={groups[0].intro} />
          <Vibe />
          <ConstraintCost />
          <Zones />
          <Spots />
          <Season />

          <PartHeader step={2} title={groups[1].title} intro={groups[1].intro} />
          <Itinerary />
          <Transport />
          <Stay />
          <Food />
          <Safety />

          <PartHeader step={3} title={groups[2].title} intro={groups[2].intro} />
          <MoreTime />
          <FaqLinks />
        </main>
      </div>

      <footer className="site-footer">
        <div className="rail site-footer__inner">
          <span className="t-label-small grey-3">
            Static prototype. Headout prices are from 16 Oct 2026; other prices are typical 2026 figures. Map routes are approximate.
          </span>
          <span className="t-label-small grey-3">
            Sources:{' '}
            {guide.sources.map((s, i) => (
              <span key={s.label}>
                {i > 0 && ', '}
                {s.url ? <a className="u-link" href={s.url} target="_blank" rel="noreferrer">{s.label}</a> : s.label}
              </span>
            ))}
          </span>
        </div>
      </footer>
    </GuideProvider>
  );
}
