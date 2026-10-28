import { useMemo, useRef, useState } from 'react';
import CityMap, { type MapMarker, type MapRoute } from './CityMap';
import type { Level, Spot } from '../types';
import {
  directionsUrl, fmtKm, fmtMin, routeKm, routePoints, spotsDirectionsUrl, walkMinutes, walkingOrder,
} from '../geo';
import {
  BookButton, DirectionsLink, IconCheck, IconChevronLeft, IconChevronRight, IconMinus, IconSkip, IconWalk,
  RankBadge, SectionHeader, SkipIf, TagRow, Tabs, ZoneDot, useGuide,
} from './ui';

/* Is London for you? (A1) */
export function Vibe() {
  const { guide } = useGuide();
  return (
    <section id="vibe" className="section">
      <SectionHeader title={`Is ${guide.city} for you?`} intro="What the city is like, and who will and won’t love it." />
      <div className="prose">
        {guide.vibe.lines.map((l) => <p key={l} className="t-para-large">{l}</p>)}
        <p className="t-para-large not-for"><span className="t-label-large-heavy">Not for you if</span> {guide.vibe.notFor}</p>
      </div>
    </section>
  );
}

/* Costs and essentials (A2) */
export function ConstraintCost() {
  const { guide } = useGuide();
  const { tiers, note } = guide.costTiers;
  const rows = [
    { key: 'stay', label: 'Stay' },
    { key: 'food', label: 'Food' },
    { key: 'transport', label: 'Transport' },
    { key: 'attractions', label: 'Attractions' },
  ] as const;
  return (
    <section id="cost" className="section">
      <SectionHeader title="Costs and essentials" intro="Money, plugs and entry rules, and what a day here really costs." />
      <dl className="fact-grid">
        {guide.essentials.map((e) => (
          <div key={e.label} className="fact">
            <dt className="t-label-small grey-3">{e.label}</dt>
            <dd className="t-label-medium">{e.value}</dd>
          </div>
        ))}
      </dl>

      <h3 className="t-heading-regular sub-head">What a day costs</h3>
      <div className="table-wrap">
        <table className="data-table data-table--cost">
          <thead>
            <tr>
              <th scope="col" className="t-subheading-regular"><span className="visually-hidden">Item</span></th>
              {tiers.map((t) => <th key={t.tier} scope="col" className="t-subheading-regular">{t.tier}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key}>
                <th scope="row" className="t-para-regular grey-2">{r.label}</th>
                {tiers.map((t) => (
                  <td key={t.tier}>
                    <span className="t-label-regular-heavy num">£{t[r.key].amount}</span>
                    {t[r.key].note && <span className="t-label-small grey-3 cost-note">{t[r.key].note}</span>}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="data-table__total">
              <th scope="row" className="t-label-regular-heavy">Per day</th>
              {tiers.map((t) => <td key={t.tier} className="t-label-large-heavy num">about £{t.total}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="t-label-small grey-3 footnote">{note}</p>
    </section>
  );
}

/* The areas (A3) */
export function Zones() {
  const { guide } = useGuide();
  const [active, setActive] = useState<string | null>(null);
  const zone = guide.zones.find((z) => z.id === active);
  const markers: MapMarker[] = zone
    ? zone.spots.map((s, i) => ({ id: s.id, label: s.name, rank: i + 1, coords: s.coords, color: zone.color }))
    : [];

  return (
    <section id="zones" className="section">
      <SectionHeader
        title={`The ${guide.zones.length} areas to explore`}
        intro={`${guide.city} is huge, so this guide splits it into ${guide.zones.length} walkable areas. Two neighbouring areas fit in a day, and every plan below uses them. Pick one to see it on the map.`}
      />

      <div className="zone-explorer">
        <ol className="zone-list">
          {guide.zones.map((z, i) => {
            const on = active === z.id;
            return (
              <li key={z.id} id={`zone-${z.id}`}>
                <button
                  type="button"
                  className={`zone-card${on ? ' zone-card--active' : ''}`}
                  aria-pressed={on}
                  onClick={() => setActive(on ? null : z.id)}
                  style={{ ['--zone' as string]: z.color }}
                >
                  <span className="zone-card__num t-label-regular-heavy" style={{ background: z.color }}>{i + 1}</span>
                  <span className="zone-card__body">
                    <span className="zone-card__title">
                      <span className="t-label-large-heavy">{z.name}</span>
                      <span className="badge t-label-small">{z.time}</span>
                    </span>
                    <span className="t-para-regular grey-2">{z.character}</span>
                    <span className="zone-card__meta t-label-small grey-3">{z.anchors.join(', ')}</span>
                    {on && (
                      <span className="zone-card__more t-para-regular grey-2">
                        <span><span className="t-subheading-regular">Best for:</span> {z.best_for}</span>
                        <span><span className="t-subheading-regular">Where:</span> {z.position}</span>
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="zone-explorer__map">
          <CityMap
            zones={guide.zones}
            zoneBadges
            highlight={active ? [active] : undefined}
            markers={markers}
            onZoneClick={(id) => setActive((a) => (a === id ? null : id))}
            focus={zone ? [...zone.polygon, ...zone.spots.map((s) => s.coords)] : undefined}
            height="100%"
          />
          {zone && (
            <button type="button" className="map-reset t-label-regular" onClick={() => setActive(null)}>Show all areas</button>
          )}
        </div>
      </div>
    </section>
  );
}

/* What to see (A4) */
export function Spots() {
  return (
    <section id="spots" className="section">
      <SectionHeader title="What to see" intro="Start with the top 10, then go deeper area by area. Pick any place to see it on the map and get directions." />
      <TopTen />
      <ZoneSpots />
      <SkipList />
    </section>
  );
}

function TopTen() {
  const { guide, spot, zone } = useGuide();
  const [sel, setSel] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const rail = useRef<HTMLDivElement>(null);

  const items = guide.topTen.map((t) => ({ ...t, spot: spot(t.spotId)! }));
  const current = items.find((t) => t.spotId === sel);

  const markers: MapMarker[] = items.map((t) => ({
    id: t.spotId, label: t.spot.name, rank: t.rank, coords: t.spot.coords, color: '#222222',
  }));
  const routes: MapRoute[] = items.filter((t) => t.spot.path).map((t) => ({ id: t.spotId, points: t.spot.path!, kind: 'path', color: '#222222' }));
  const focus = current ? (current.spot.path ?? [current.spot.coords]) : items.map((t) => t.spot.coords);

  const scroll = (dir: 1 | -1) => rail.current?.scrollBy({ left: dir * rail.current.clientWidth * 0.8, behavior: 'smooth' });

  return (
    <div className="top-ten">
      <div className="sub-head-row">
        <h3 className="t-heading-regular">Only have a day? Start with these 10</h3>
        <div className="carousel-nav">
          <button type="button" className="icon-btn" aria-label="Previous" onClick={() => scroll(-1)}><IconChevronLeft size={16} /></button>
          <button type="button" className="icon-btn" aria-label="Next" onClick={() => scroll(1)}><IconChevronRight size={16} /></button>
        </div>
      </div>
      <div className="carousel" ref={rail}>
        {items.map((t) => {
          const z = zone(t.spot.zone)!;
          const on = sel === t.spotId;
          return (
            <button
              key={t.rank}
              type="button"
              className={`numbered-card${on || hover === t.spotId ? ' numbered-card--hover' : ''}${on ? ' numbered-card--active' : ''}`}
              aria-pressed={on}
              onClick={() => setSel(on ? null : t.spotId)}
              onMouseEnter={() => setHover(t.spotId)}
              onMouseLeave={() => setHover(null)}
            >
              <span className="numbered-card__img">
                <img src={t.image} alt="" loading="lazy" />
                <RankBadge n={t.rank} size="lg" />
              </span>
              <span className="numbered-card__body">
                <span className="t-label-large-heavy">{t.spot.name}</span>
                <span className="t-label-small grey-2 numbered-card__meta"><ZoneDot color={z.color} />{z.name}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="map-with-panel">
        <CityMap
          zones={guide.zones}
          highlight={current ? [current.spot.zone] : undefined}
          markers={markers}
          activeMarker={sel ?? hover}
          routes={routes}
          activeRoute={current?.spot.path ? current.spotId : null}
          onMarkerClick={(id) => setSel(id)}
          focus={focus}
          maxZoom={15}
          height={400}
        />
        <aside className="map-panel">
          {current ? (
            <SpotDetail s={current.spot} rank={current.rank} onClose={() => setSel(null)} />
          ) : (
            <div className="map-panel__empty">
              <p className="t-label-large-heavy">Pick a place</p>
              <p className="t-para-regular grey-2">Choose any of the 10 above, or a pin on the map, to see why it’s worth it, what it costs and how to get there.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function SpotDetail({ s, rank, onClose }: { s: Spot; rank: number; onClose: () => void }) {
  const { zone } = useGuide();
  const z = zone(s.zone)!;
  const dest = s.path ? s.path[0] : s.coords;
  return (
    <div className="spot-detail">
      <div className="spot-detail__head">
        <RankBadge n={rank} size="sm" />
        <button type="button" className="u-link t-label-small spot-detail__close" onClick={onClose}>Show all 10</button>
      </div>
      <p className="t-label-large-heavy">{s.name}</p>
      <p className="t-label-small grey-2 numbered-card__meta"><ZoneDot color={z.color} />{z.name}</p>
      <p className="t-para-regular grey-2">{s.why}</p>
      <TagRow item={s} />
      <div className="row-actions">
        {s.book?.map((b) => <BookButton key={b.url} link={b} />)}
        <DirectionsLink href={directionsUrl({ destination: dest, mode: 'transit' })} label={s.path ? 'Directions to the start' : 'Directions'} />
      </div>
    </div>
  );
}

function ZoneSpots() {
  const { guide } = useGuide();
  const [tab, setTab] = useState(guide.zones[0].id);
  const [sel, setSel] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const zone = guide.zones.find((z) => z.id === tab)!;
  const zoneNo = guide.zones.indexOf(zone) + 1;

  const ordered = useMemo(() => walkingOrder(zone.spots), [zone]);
  const rankOf = (id: string) => zone.spots.findIndex((s) => s.id === id) + 1;

  // Long boat rides leave the area; keep them off the walking line and draw them on their own.
  const walkable = ordered.filter((s) => s.path_mode !== 'boat');
  const km = routeKm(walkable);
  const routes: MapRoute[] = [
    { id: 'walk', points: routePoints(walkable), kind: 'walk', color: zone.color },
    ...zone.spots.filter((s) => s.path).map((s) => ({ id: s.id, points: s.path!, kind: 'path' as const, color: zone.color })),
  ];
  const markers: MapMarker[] = zone.spots.map((s, i) => ({ id: s.id, label: s.name, rank: i + 1, coords: s.coords, color: zone.color }));
  const selected = zone.spots.find((s) => s.id === sel);
  const focus = selected ? (selected.path ?? [selected.coords]) : walkable.flatMap((s) => s.path ?? [s.coords]);

  const pick = (id: string) => setSel((v) => (v === id ? null : id));

  return (
    <div className="zone-spots">
      <h3 className="t-heading-regular sub-head">The best of each area, ranked</h3>
      <Tabs
        label="Area"
        value={tab}
        onChange={(v) => { setTab(v); setSel(null); }}
        items={guide.zones.map((z, i) => ({ id: z.id, label: <><span className="tab-num" style={{ background: z.color }}>{i + 1}</span>{z.name}</> }))}
      />

      <div className="split">
        <ol className="spot-list">
          {zone.spots.map((s, i) => {
            const on = sel === s.id;
            return (
              <li
                key={s.id}
                className={`spot-row spot-row--interactive${on ? ' spot-row--active' : ''}`}
                onMouseEnter={() => setHover(s.id)}
                onMouseLeave={() => setHover(null)}
              >
                <RankBadge n={i + 1} color={on ? zone.color : undefined} />
                <div className="spot-row__body">
                  <button type="button" className="spot-row__title t-label-large-heavy" aria-pressed={on} onClick={() => pick(s.id)}>
                    {s.name}
                  </button>
                  <p className="t-para-regular grey-2">{s.why}</p>
                  <TagRow item={s} />
                  <SkipIf text={s.skip_if} />
                  <div className="row-actions">
                    {s.book?.map((b) => <BookButton key={b.url} link={b} />)}
                    <button type="button" className="dir-link t-label-regular" onClick={() => pick(s.id)}>
                      {on ? 'Show whole area' : 'Show on map'}
                    </button>
                    <DirectionsLink href={directionsUrl({ destination: s.path ? s.path[0] : s.coords, mode: 'transit' })} />
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="split__map">
          <div className="route-card">
            <p className="t-subheading-small grey-3">Suggested walking order in {zone.name}</p>
            <ol className="route-steps">
              {walkable.map((s, i) => (
                <li key={s.id}>
                  <button type="button" className="route-step t-label-small" onClick={() => pick(s.id)} aria-pressed={sel === s.id}>
                    <span className="route-step__n" style={{ background: zone.color }}>{rankOf(s.id)}</span>
                    {shortName(s.name)}
                  </button>
                  {i < walkable.length - 1 && <IconChevronRight size={14} className="grey-3" />}
                </li>
              ))}
            </ol>
            <div className="route-card__foot">
              <span className="t-label-regular grey-2 route-card__stat"><IconWalk size={14} />About {fmtKm(km)}, {fmtMin(walkMinutes(km))} on foot, plus time inside</span>
              {spotsDirectionsUrl(walkable) && <DirectionsLink href={spotsDirectionsUrl(walkable)!} label="Open walking route" />}
            </div>
          </div>
          <CityMap
            zones={guide.zones}
            highlight={[zone.id]}
            markers={markers}
            activeMarker={sel ?? hover}
            routes={routes}
            activeRoute={selected?.path ? selected.id : null}
            onMarkerClick={pick}
            focus={focus}
            maxZoom={15}
            height={460}
          />
          <p className="t-label-small grey-3 footnote">Area {zoneNo} of {guide.zones.length}. Numbers are ranks, and the dotted line is the walking order. Distances are approximate.</p>
        </div>
      </div>
    </div>
  );
}

/** Compact label for route steps: "Tower of London and the Crown Jewels" → "Tower of London". */
export function shortName(name: string) {
  const head = name.split(/[:,]/)[0];
  return head.length > 22 && head.includes(' and ') ? head.split(' and ')[0] : head;
}

function SkipList() {
  const { guide } = useGuide();
  return (
    <div className="skip-list">
      <h3 className="t-heading-regular sub-head">Skip or downgrade</h3>
      <ul>
        {guide.skip.map((s) => (
          <li key={s.name}>
            <IconSkip size={15} />
            <p className="t-para-regular grey-2"><span className="t-label-regular-heavy skip-list__name">{s.name}.</span> {s.why}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* When to go (A5) */
export function Season() {
  const { guide } = useGuide();
  return (
    <section id="season" className="section">
      <SectionHeader title="When to go" intro="Month by month: weather, daylight, crowds, prices and what’s on." />
      <div className="table-wrap">
        <table className="data-table data-table--months">
          <thead>
            <tr>
              {['Month', 'Weather', 'Daylight', 'Crowds', 'Prices', 'What’s on', 'Verdict'].map((h) => (
                <th key={h} scope="col" className="t-subheading-regular">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {guide.season.months.map((m) => (
              <tr key={m.month}>
                <th scope="row" className="t-label-regular-heavy">
                  {m.url ? <a className="u-link" href={m.url} target="_blank" rel="noreferrer">{m.month}</a> : m.month}
                </th>
                <td className="t-para-regular grey-2"><span className="temp">{m.high}° / {m.low}°C</span>{m.sky ?? ''}</td>
                <td className="t-para-regular grey-2 num">{m.daylight} h</td>
                <td><LevelBars v={m.crowds} note={m.crowdsNote} /></td>
                <td><LevelBars v={m.prices} /></td>
                <td className="t-para-regular grey-2">{m.on}</td>
                <td><VerdictCell v={m.verdict} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="callout">
        <p className="t-subheading-small callout__label">If you can pick any month</p>
        <p className="t-para-medium">{guide.season.pick}</p>
      </div>
    </section>
  );
}

const LEVELS: Record<Level, number> = { low: 1, medium: 2, 'medium-high': 3, high: 4, 'very high': 5 };

function LevelBars({ v, note }: { v: Level; note?: string }) {
  const n = LEVELS[v];
  return (
    <span className="level t-label-small grey-2" aria-label={v}>
      <span className="level__bars" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => <span key={i} className={i <= n ? 'on' : ''} />)}
      </span>
      <span>
        <span className="level__text">{v[0].toUpperCase() + v.slice(1)}</span>
        {note && <span className="level__note grey-3">{note}</span>}
      </span>
    </span>
  );
}

function VerdictCell({ v }: { v: 'best' | 'good' | 'avoid' }) {
  if (v === 'best') return <span className="verdict-cell verdict-cell--best t-label-regular-heavy"><IconCheck size={14} />Best</span>;
  if (v === 'good') return <span className="verdict-cell t-label-regular grey-2">Good</span>;
  return <span className="verdict-cell verdict-cell--avoid t-label-regular grey-3"><IconMinus size={14} />Avoid</span>;
}
