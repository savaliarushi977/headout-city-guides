import { useState, type FormEvent } from 'react';
import { findGuide, guides, upcoming } from '../data';
import { IconSearch } from './ui';

export default function Landing({ notFound }: { notFound?: string }) {
  const [q, setQ] = useState(notFound ?? '');
  const [miss, setMiss] = useState<string | null>(notFound ?? null);
  const available = Object.values(guides);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    const g = findGuide(q);
    if (g) {
      window.location.hash = `#/${g.slug}`;
    } else {
      setMiss(q.trim());
    }
  };

  return (
    <main className="landing">
      <div className="rail landing__inner">
        <h1 className="t-display-regular">Static city guides, one zone at a time</h1>
        <p className="t-para-large grey-2 landing__sub">
          Type a city to open its guide: the city’s vibe, its zones, what to see, when to go and how to plan the trip.
        </p>

        <form className="search" onSubmit={submit} role="search">
          <label htmlFor="city" className="visually-hidden">City name</label>
          <span className="search__icon"><IconSearch size={20} /></span>
          <input
            id="city"
            className="search__input t-label-large"
            placeholder="Enter a city, e.g. London"
            value={q}
            onChange={(e) => { setQ(e.target.value); setMiss(null); }}
            autoComplete="off"
            list="city-options"
          />
          <datalist id="city-options">
            {available.map((g) => <option key={g.slug} value={g.city} />)}
          </datalist>
          <button type="submit" className="btn-primary t-cta-regular">View guide</button>
        </form>

        {miss && (
          <p className="landing__miss t-para-regular" role="status">
            We don’t have a guide for “{miss}” yet. Try London.
          </p>
        )}

        <div className="landing__cities">
          <p className="t-subheading-regular">Available now</p>
          <div className="city-row">
            {available.map((g) => (
              <a key={g.slug} href={`#/${g.slug}`} className="city-card">
                <span className="city-card__img">
                  <img src={g.heroImage} alt="" />
                </span>
                <span className="t-label-large-heavy">{g.city}</span>
                <span className="t-label-small grey-2">{g.zones.length} zones<span className="sep-dot" aria-hidden />{g.zones.reduce((n, z) => n + z.spots.length, 0)} spots</span>
              </a>
            ))}
          </div>
          <p className="t-subheading-regular landing__soon">Coming soon</p>
          <ul className="soon-row">
            {upcoming.map((c) => <li key={c} className="badge t-label-small">{c}</li>)}
          </ul>
        </div>
      </div>
    </main>
  );
}
