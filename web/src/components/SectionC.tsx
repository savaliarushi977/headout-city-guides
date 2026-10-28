import { useState } from 'react';
import CityMap, { type MapMarker, type MapRoute } from './CityMap';
import { directionsUrl } from '../geo';
import { BookButton, DirectionsLink, IconChevronDown, IconClock, IconTrain, RankBadge, SectionHeader, useGuide } from './ui';

/* Day trips (C1) */
export function MoreTime() {
  const { guide } = useGuide();
  const { trips, cut } = guide.moreTime;
  const [sel, setSel] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const active = sel ?? hover;
  const current = trips.find((t) => t.id === active);

  const routes: MapRoute[] = trips.map((t) => ({
    id: t.id, points: [t.stationCoords, ...(t.via ?? []).map((v) => v.coords), t.coords], kind: 'transit', color: '#222222',
  }));
  const markers: MapMarker[] = [
    { id: 'london', label: guide.city, coords: guide.centre.coords, kind: 'origin', rank: '' },
    ...trips.map((t) => ({ id: t.id, label: t.name, rank: t.rank, coords: t.coords, color: '#222222' })),
    ...(current?.via ?? []).map((v, i) => ({ id: `via-${i}`, label: v.name, coords: v.coords, kind: 'dot' as const, color: '#666666' })),
  ];
  const focus = current
    ? [current.stationCoords, ...(current.via ?? []).map((v) => v.coords), current.coords]
    : [guide.centre.coords, ...trips.map((t) => t.coords)];

  return (
    <section id="more-time" className="section">
      <SectionHeader title="Day trips from London" intro="Worth a dedicated day if you have more than three. Ranked, with how to get there." />

      <div className="split">
        <ol className="spot-list">
          {trips.map((t) => {
            const on = sel === t.id;
            return (
              <li
                key={t.id}
                className={`spot-row spot-row--interactive${on ? ' spot-row--active' : ''}`}
                onMouseEnter={() => setHover(t.id)}
                onMouseLeave={() => setHover(null)}
              >
                <RankBadge n={t.rank} />
                <div className="spot-row__body">
                  <button type="button" className="spot-row__title t-label-large-heavy" aria-pressed={on} onClick={() => setSel(on ? null : t.id)}>
                    {t.name}
                  </button>
                  <p className="t-para-regular grey-2">{t.why}</p>
                  <ul className="tag-row">
                    <li className="badge t-label-small"><IconClock size={14} />{t.travel_time}</li>
                    <li className="badge t-label-small">{t.length}</li>
                    <li className="badge t-label-small">{t.price}</li>
                    {t.best_for.map((b) => <li key={b} className="badge badge--quiet t-label-small">{b}</li>)}
                  </ul>
                  <p className="t-label-small grey-2 trip-how"><IconTrain size={14} />{t.how}</p>
                  <div className="row-actions">
                    {t.book && <BookButton link={t.book} />}
                    <DirectionsLink href={directionsUrl({ origin: t.stationCoords, destination: t.coords, mode: 'transit' })} label={`From ${t.station}`} />
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
        <div className="split__map">
          <CityMap
            zones={guide.zones}
            showZones={false}
            markers={markers}
            activeMarker={active}
            routes={routes}
            activeRoute={active}
            onMarkerClick={(id) => id !== 'london' && setSel(id)}
            focus={focus}
            maxZoom={10}
            height={560}
          />
          <p className="t-label-small grey-3 footnote">Lines show the direction of travel from the London station, not the exact track.</p>
        </div>
      </div>
      <p className="t-para-regular grey-3 trip-cut">{cut}</p>
    </section>
  );
}

/* Questions and more guides (C2) */
export function FaqLinks() {
  const { guide } = useGuide();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="section">
      <SectionHeader title="Questions and more guides" intro="Answers the rest of the guide doesn’t cover, then every London page on Headout." />
      <div className="accordion">
        {guide.faq.map((f, i) => {
          const on = open === i;
          return (
            <div key={f.q} className="accordion__item">
              <h3>
                <button
                  type="button"
                  className="accordion__trigger t-label-medium-heavy"
                  aria-expanded={on}
                  aria-controls={`faq-${i}`}
                  onClick={() => setOpen(on ? null : i)}
                >
                  {f.q}
                  <IconChevronDown size={16} className={on ? 'rot' : ''} />
                </button>
              </h3>
              <div id={`faq-${i}`} className="accordion__panel" hidden={!on}>
                <p className="t-para-medium grey-2">{f.a}</p>
              </div>
            </div>
          );
        })}
      </div>

      <h3 className="t-heading-regular sub-head">All London guides</h3>
      <div className="link-hub">
        {guide.linkHub.map((g) => (
          <div key={g.title}>
            <p className="t-subheading-regular link-hub__title">{g.title}</p>
            <ul>
              {g.links.map((l) => (
                <li key={l.url + l.label}>
                  <a className="u-link t-label-regular" href={l.url} target="_blank" rel="noreferrer">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
