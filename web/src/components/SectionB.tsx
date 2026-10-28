import { useMemo, useState } from 'react';
import CityMap, { type MapMarker, type MapRoute } from './CityMap';
import type { DayPlan, LatLng, Spot, TravelerType, Zone } from '../types';
import { directionsUrl, fmtKm, fmtMin, routeKm, routePoints, spotsDirectionsUrl, walkMinutes, walkingOrder } from '../geo';
import { shortName } from './SectionA';
import {
  BookButton, DirectionsLink, IconAlert, IconTrain, IconWalk, SectionHeader, Verdict, ZoneChip, ZoneDot, useGuide,
} from './ui';

const TRAVELERS: { id: TravelerType; label: string }[] = [
  { id: 'first-timer', label: 'First-timer' },
  { id: 'repeat', label: 'Repeat visitor' },
  { id: 'family', label: 'Family' },
  { id: 'couple', label: 'Couple' },
  { id: 'budget', label: 'Budget' },
];

export const shortZone = (z: Zone) => z.name.split(' & ')[0];

/* Plan your days (B1) */
export function Itinerary() {
  const { guide, zone } = useGuide();
  const { rule, pairs, rows, conditionals } = guide.itinerary;
  const [days, setDays] = useState(3);
  const [who, setWho] = useState<TravelerType>('first-timer');
  const [day, setDay] = useState(0);
  const row = rows.find((r) => r.days === days)!;
  const plan = row.plans[who];

  const choose = (d: number, t: TravelerType) => { setDays(d); setWho(t); setDay(0); };

  return (
    <section id="itinerary" className="section">
      <SectionHeader title="Plan your days" intro="Pick how long you have and who you’re travelling as. The plan and its route appear on the map below." />
      <Verdict>{rule}</Verdict>
      <ul className="pair-row" aria-label="Areas that pair well">
        {pairs.map((p) => (
          <li key={p} className="pair">
            {p.split('+').map((id, i) => (
              <span key={id} className="pair__part">
                {i > 0 && <span className="pair__plus t-label-small grey-3">+</span>}
                <ZoneChip id={id} />
              </span>
            ))}
            {!p.includes('+') && <span className="t-label-small grey-3">on its own</span>}
          </li>
        ))}
      </ul>

      <div className="table-wrap">
        <table className="data-table data-table--matrix">
          <thead>
            <tr>
              <th scope="col" className="t-subheading-regular">Trip length</th>
              {TRAVELERS.map((t) => <th key={t.id} scope="col" className="t-subheading-regular">{t.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.days}>
                <th scope="row" className="matrix-days">
                  <span className="t-label-large-heavy">{r.days} {r.days === 1 ? 'day' : 'days'}</span>
                  {r.url && <a className="u-link t-label-small" href={r.url} target="_blank" rel="noreferrer">Full guide</a>}
                </th>
                {TRAVELERS.map((t) => {
                  const on = r.days === days && t.id === who;
                  return (
                    <td key={t.id} className={on ? 'cell-active' : undefined}>
                      <button type="button" className="matrix-cell" aria-pressed={on} onClick={() => choose(r.days, t.id)}>
                        {r.plans[t.id].map((d, i) => (
                          <span key={i} className="day-seq">
                            <span className="day-seq__n t-label-small grey-3">D{i + 1}</span>
                            <span className="day-seq__zones t-label-small">
                              {d.stops.length === 0 && <span className="grey-3">Free day</span>}
                              {d.stops.map((s) => {
                                if (s.startsWith('trip:')) return <span key={s} className="mini-trip"><IconTrain size={14} />Trip</span>;
                                const z = zone(s)!;
                                return <span key={s} className="mini-zone"><ZoneDot color={z.color} />{shortZone(z)}</span>;
                              })}
                            </span>
                          </span>
                        ))}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PlanViewer key={`${days}-${who}`} days={days} who={TRAVELERS.find((t) => t.id === who)!.label} plan={plan} day={day} setDay={setDay} />

      <h3 className="t-heading-regular sub-head">Adjust the plan</h3>
      <dl className="cond-grid">
        {conditionals.map((c) => (
          <div key={c.label}>
            <dt className="t-label-regular-heavy">{c.label}</dt>
            <dd className="t-para-regular grey-2">{c.text}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

interface DayRoute {
  zones: string[];
  spots: (Spot & { n: number })[];
  routes: MapRoute[];
  focus: LatLng[];
  markers: MapMarker[];
  km: number;
  dirUrl?: string;
  dirLabel: string;
}

/** Turns one day of zone ids / trips into map routes: the top 3 spots of each area in walking order. */
function useDayRoute(d: DayPlan): DayRoute {
  const { guide, zone, trip } = useGuide();
  return useMemo(() => {
    const t = d.stops.find((s) => s.startsWith('trip:'));
    if (t) {
      const tr = trip(t.slice(5))!;
      const pts: LatLng[] = [tr.stationCoords, ...(tr.via ?? []).map((v) => v.coords), tr.coords];
      return {
        zones: [],
        spots: [],
        routes: [{ id: tr.id, points: pts, kind: 'transit', color: '#222222' }],
        focus: pts,
        markers: [
          { id: 'from', label: tr.station, coords: tr.stationCoords, kind: 'origin', rank: 'A' },
          ...(tr.via ?? []).map((v, i) => ({ id: `via-${i}`, label: v.name, coords: v.coords, kind: 'dot' as const, color: '#666666' })),
          { id: 'to', label: tr.name, coords: tr.coords, rank: 'B', color: '#222222' },
        ],
        km: 0,
        dirUrl: directionsUrl({ origin: tr.stationCoords, destination: tr.coords, mode: 'transit' }),
        dirLabel: `Train or coach from ${tr.station}`,
      };
    }
    const zs = d.stops.map((id) => zone(id)!).filter(Boolean);
    if (!zs.length) {
      return { zones: [], spots: [], routes: [], focus: guide.zones.flatMap((z) => z.polygon), markers: [], km: 0, dirLabel: '' };
    }
    let n = 0;
    const spots: (Spot & { n: number })[] = [];
    const routes: MapRoute[] = [];
    let prev: Spot | undefined;
    zs.forEach((z) => {
      const picked = walkingOrder(z.spots.slice(0, 3));
      if (prev) {
        const a = prev.path ? prev.path[prev.path.length - 1] : prev.coords;
        const b = picked[0].path ? picked[0].path[0] : picked[0].coords;
        routes.push({ id: `hop-${z.id}`, points: [a, b], kind: 'transit', color: '#666666' });
      }
      picked.filter((s) => s.path_mode === 'boat').forEach((s) => routes.push({ id: `boat-${s.id}`, points: s.path!, kind: 'path', color: z.color }));
      routes.push({ id: `walk-${z.id}`, points: routePoints(picked.filter((s) => s.path_mode !== 'boat')), kind: 'walk', color: z.color });
      picked.forEach((s) => spots.push({ ...s, n: ++n }));
      prev = picked[picked.length - 1];
    });
    const flat = spots as Spot[];
    return {
      zones: zs.map((z) => z.id),
      spots,
      routes,
      focus: [...flat.flatMap((s) => s.path ?? [s.coords])],
      markers: spots.map((s) => ({ id: s.id, label: s.name, rank: s.n, coords: s.coords, color: zone(s.zone)!.color })),
      km: zs.reduce((sum, z) => sum + routeKm(walkingOrder(z.spots.slice(0, 3))), 0),
      dirUrl: spotsDirectionsUrl(flat),
      dirLabel: 'Open the day in Google Maps',
    };
  }, [d, guide, zone, trip]);
}

function PlanViewer({ days, who, plan, day, setDay }: { days: number; who: string; plan: DayPlan[]; day: number; setDay: (n: number) => void }) {
  const { guide, zone, trip } = useGuide();
  const d = plan[Math.min(day, plan.length - 1)];
  const r = useDayRoute(d);
  const [hover, setHover] = useState<string | null>(null);
  const t = d.stops.find((s) => s.startsWith('trip:'));
  const tr = t ? trip(t.slice(5)) : undefined;

  return (
    <div className="plan-viewer">
      <div className="plan-viewer__head">
        <p className="t-heading-regular">{days} {days === 1 ? 'day' : 'days'} for a {who.toLowerCase()}</p>
        <div className="day-tabs" role="group" aria-label="Day">
          {plan.map((_, i) => (
            <button key={i} type="button" className="day-tab t-label-regular" aria-pressed={i === day} onClick={() => setDay(i)}>Day {i + 1}</button>
          ))}
        </div>
      </div>

      <div className="plan-viewer__body">
        <div className="plan-day">
          {d.note && <p className="t-label-medium plan-day__note">{d.note}</p>}

          {tr && (
            <div className="plan-trip">
              <p className="t-label-large-heavy">Day trip: {tr.name}</p>
              <p className="t-para-regular grey-2">{tr.why}</p>
              <dl className="plan-trip__facts">
                <div><dt className="t-label-small grey-3">Getting there</dt><dd className="t-para-regular">{tr.how}</dd></div>
                <div><dt className="t-label-small grey-3">Travel time</dt><dd className="t-para-regular">{tr.travel_time}</dd></div>
                <div><dt className="t-label-small grey-3">Length</dt><dd className="t-para-regular">{tr.length}</dd></div>
              </dl>
              {tr.book && <div className="row-actions"><BookButton link={tr.book} /></div>}
            </div>
          )}

          {!tr && r.zones.length === 0 && (
            <p className="t-para-regular grey-2">Nothing planned: go back to a favourite area, shop, or rest.</p>
          )}

          {r.zones.map((zid, zi) => {
            const z = zone(zid)!;
            return (
              <div key={zid} className="plan-zone">
                <p className="plan-zone__title">
                  <span className="t-label-small grey-3">{zi === 0 ? (r.zones.length > 1 ? 'Morning' : 'All day') : 'Afternoon and evening'}</span>
                  <ZoneChip id={zid} />
                </p>
                <ol className="plan-stops">
                  {r.spots.filter((s) => s.zone === zid).map((s) => (
                    <li key={s.id} onMouseEnter={() => setHover(s.id)} onMouseLeave={() => setHover(null)}>
                      <span className="route-step__n" style={{ background: z.color }}>{s.n}</span>
                      <span>
                        <span className="t-label-regular-heavy">{shortName(s.name)}</span>
                        <span className="t-label-small grey-3 plan-stops__why">{s.why}</span>
                      </span>
                    </li>
                  ))}
                </ol>
                {zi < r.zones.length - 1 && (
                  <p className="t-label-small grey-3 plan-hop"><IconTrain size={14} />Then walk or take the Tube to the next area</p>
                )}
              </div>
            );
          })}

          {r.dirUrl && (
            <div className="plan-day__foot">
              {r.km > 0 && <span className="t-label-regular grey-2 route-card__stat"><IconWalk size={14} />About {fmtKm(r.km)} on foot ({fmtMin(walkMinutes(r.km))}), plus time inside</span>}
              <DirectionsLink href={r.dirUrl} label={r.dirLabel} />
            </div>
          )}
        </div>

        <CityMap
          zones={guide.zones}
          showZones
          highlight={r.zones.length ? r.zones : undefined}
          markers={r.markers}
          activeMarker={hover}
          routes={r.routes}
          focus={r.focus}
          maxZoom={tr ? 9 : 15.5}
          height={440}
        />
      </div>
    </div>
  );
}

/* Getting around (B2) */
export function Transport() {
  const { guide } = useGuide();
  const t = guide.transport;
  const [hover, setHover] = useState<string | null>(null);

  const airports = t.airports.filter((a) => a.coords && a.arrive);
  const routes: MapRoute[] = airports.map((a, i) => ({
    id: `${a.from}-${i}`, points: [a.coords!, a.arrive!.coords], kind: 'transit', color: a.best ? '#222222' : '#9f9f9f',
  }));
  const seen = new Set<string>();
  const markers: MapMarker[] = [];
  airports.forEach((a) => {
    if (!seen.has(a.from)) { seen.add(a.from); markers.push({ id: a.from, label: a.from, coords: a.coords!, kind: 'dot', color: '#222222' }); }
    if (!seen.has(a.arrive!.name)) { seen.add(a.arrive!.name); markers.push({ id: a.arrive!.name, label: a.arrive!.name, coords: a.arrive!.coords, kind: 'dot', color: '#8000ff' }); }
  });
  const hovered = hover ? airports.findIndex((a, i) => `${a.from}-${i}` === hover) : -1;
  const focusPts = hovered >= 0 ? [airports[hovered].coords!, airports[hovered].arrive!.coords] : airports.flatMap((a) => [a.coords!, a.arrive!.coords]);

  return (
    <section id="transport" className="section">
      <SectionHeader title="Getting around" intro="Airport transfers, how to move around town, and what to avoid." />
      <Verdict>{t.verdict}</Verdict>

      <h3 className="t-heading-regular sub-head">From the airport into town</h3>
      <div className="airport-layout">
        <div className="table-wrap">
          <table className="data-table data-table--airports">
            <thead>
              <tr>{['From', 'Option', 'Cost', 'Time'].map((h) => <th key={h} scope="col" className="t-subheading-regular">{h}</th>)}</tr>
            </thead>
            <tbody>
              {t.airports.map((a, i) => {
                const id = `${a.from}-${i}`;
                return (
                  <tr key={id} onMouseEnter={() => setHover(id)} onMouseLeave={() => setHover(null)} className={hover === id ? 'row-hover' : undefined}>
                    <td className="t-label-regular-heavy">{a.from}</td>
                    <td>
                      <span className="t-para-regular">{a.option}</span>
                      <span className="t-label-small grey-3 cell-sub">
                        {a.best && <span className="badge badge--dark t-label-small">Best</span>}{a.verdict}
                      </span>
                      {a.book && <span className="cell-actions"><BookButton link={a.book} /></span>}
                    </td>
                    <td className="t-para-regular grey-2">{a.cost}</td>
                    <td className="t-para-regular grey-2 nowrap">{a.time}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="airport-layout__map">
          <CityMap
            zones={guide.zones}
            showZones={hovered < 0}
            markers={markers}
            routes={routes}
            activeRoute={hover}
            focus={focusPts}
            maxZoom={11}
            height={460}
          />
          <p className="t-label-small grey-3 footnote">Hover a row to see the route. The darker lines are the best options.</p>
        </div>
      </div>

      <h3 className="t-heading-regular sub-head">Getting around town</h3>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>{['How', 'Cost', 'Use it for'].map((h) => <th key={h} scope="col" className="t-subheading-regular">{h}</th>)}</tr>
          </thead>
          <tbody>
            {t.modes.map((m) => (
              <tr key={m.mode}>
                <td className="t-label-regular-heavy nowrap">{m.mode}</td>
                <td className="t-para-regular grey-2">{m.cost}</td>
                <td className="t-para-regular grey-2">
                  {m.use}
                  {m.book && <span className="cell-actions"><BookButton link={m.book} /></span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="t-heading-regular sub-head">Passes and cards</h3>
      <dl className="cond-grid">
        {t.passRules.map((p) => (
          <div key={p.label}>
            <dt className="t-label-regular-heavy">{p.label}</dt>
            <dd className="t-para-regular grey-2">{p.text}</dd>
            {p.links && <dd className="row-actions">{p.links.map((l) => <BookButton key={l.url} link={l} />)}</dd>}
          </div>
        ))}
      </dl>

      <h3 className="t-heading-regular sub-head">Avoid</h3>
      <ul className="icon-list">
        {t.avoid.map((a) => <li key={a} className="t-para-medium grey-2"><IconAlert size={15} />{a}</li>)}
      </ul>
    </section>
  );
}

/* Where to stay (B3) */
export function Stay() {
  const { guide, zone } = useGuide();
  const s = guide.stay;
  const [hover, setHover] = useState<string | null>(null);
  const highlight = hover ? [hover] : s.picks;

  return (
    <section id="stay" className="section">
      <SectionHeader title="Where to stay" intro="The best areas to sleep in, what each costs, and hotels at every budget." />
      <Verdict>{s.verdict}</Verdict>

      <div className="split split--stay">
        <div className="stay-list">
          {s.zones.map((sz) => {
            const z = zone(sz.zone)!;
            const pick = s.picks.includes(sz.zone);
            return (
              <article
                key={sz.zone}
                className={`picks-card${hover === sz.zone ? ' picks-card--hover' : ''}`}
                style={{ ['--zone' as string]: z.color }}
                onMouseEnter={() => setHover(sz.zone)}
                onMouseLeave={() => setHover(null)}
              >
                <header className="picks-card__head">
                  <span className="picks-card__title"><ZoneDot color={z.color} /><span className="t-label-large-heavy">{z.name}</span></span>
                  <span className="picks-card__badges">
                    {pick && <span className="badge badge--dark t-label-small">Our pick</span>}
                    <span className="badge t-label-small">{sz.price} a night</span>
                  </span>
                </header>
                <p className="t-para-regular grey-2"><span className="t-subheading-regular">Best for:</span> {sz.best_for}</p>
                <dl className="pro-con">
                  <div><dt className="t-subheading-small">Pro</dt><dd className="t-para-regular grey-2">{sz.pro}</dd></div>
                  <div><dt className="t-subheading-small">Con</dt><dd className="t-para-regular grey-2">{sz.con}</dd></div>
                </dl>
                <ul className="hotel-row">
                  {sz.properties.map((p) => (
                    <li key={p.name} className="t-label-regular"><span className="hotel-row__band grey-3">{p.band}</span>{p.name}</li>
                  ))}
                </ul>
              </article>
            );
          })}
          {s.skip.map((k) => (
            <p key={k.zone} className="t-para-regular grey-2 stay-skip">
              <ZoneChip id={k.zone} /> {k.why}
            </p>
          ))}
        </div>
        <div className="split__map">
          <CityMap zones={guide.zones} zoneBadges highlight={highlight} height={520} focus={guide.zones.filter((z) => z.id !== 'gr').flatMap((z) => z.polygon)} />
          <p className="t-label-small grey-3 footnote">Our picks are highlighted. Hover an area to find it on the map.</p>
        </div>
      </div>
    </section>
  );
}

/* What to eat (B4) */
export function Food() {
  const { guide } = useGuide();
  const f = guide.food;
  return (
    <section id="food" className="section">
      <SectionHeader title="What to eat" intro="The dishes to try, where to eat in each area, and how Londoners eat." />

      <h3 className="t-heading-regular sub-head sub-head--first">Signature things to eat</h3>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>{['Dish', 'Where', 'Area', 'Price'].map((h) => <th key={h} scope="col" className="t-subheading-regular">{h}</th>)}</tr>
          </thead>
          <tbody>
            {f.dishes.map((d) => (
              <tr key={d.name}>
                <td className="t-label-regular-heavy nowrap">{d.name}</td>
                <td className="t-para-regular grey-2">{d.places}</td>
                <td><span className="chip-stack">{d.zones.map((z) => <ZoneChip key={z} id={z} />)}</span></td>
                <td className="t-label-regular">{d.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="t-heading-regular sub-head">Where to eat in each area</h3>
      <ul className="zone-rows">
        {f.byZone.map((b) => (
          <li key={b.zone}>
            <ZoneChip id={b.zone} />
            <p className="t-para-regular grey-2">{b.places}</p>
          </li>
        ))}
      </ul>

      <h3 className="t-heading-regular sub-head">How Londoners eat</h3>
      <dl className="cond-grid cond-grid--3">
        {f.norms.map((n) => (
          <div key={n.label}>
            <dt className="t-label-regular-heavy">{n.label}</dt>
            <dd className="t-para-regular grey-2">{n.text}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* Staying safe (B5) */
export function Safety() {
  const { guide } = useGuide();
  const s = guide.safety;
  return (
    <section id="safety" className="section">
      <SectionHeader title="Staying safe" intro="Where to be careful, scams to know, emergency numbers and local etiquette." />
      <Verdict>{s.verdict}</Verdict>

      <h3 className="t-heading-regular sub-head">Where to be careful</h3>
      <dl className="cond-grid cond-grid--3">
        {s.careful.map((c) => (
          <div key={c.label}>
            <dt className="t-label-regular-heavy">{c.label}</dt>
            <dd className="t-para-regular grey-2">{c.text}</dd>
          </div>
        ))}
      </dl>

      <h3 className="t-heading-regular sub-head">Scams that actually happen</h3>
      <ol className="how-to how-to--grid">
        {s.scams.map((sc, i) => (
          <li key={sc.name}>
            <span className="how-to__n t-display-small" aria-hidden>{i + 1}</span>
            <div>
              <p className="t-label-large-heavy">{sc.name}</p>
              <p className="t-para-regular grey-2">{sc.how}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="safety-grid">
        <div className="safety-block">
          <h4 className="t-heading-small">Emergency numbers</h4>
          <dl className="fact-list">
            {s.emergency.map((e) => (
              <div key={e.label}>
                <dt className="t-label-small grey-3">{e.label}</dt>
                <dd className="t-label-large-heavy">{e.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="safety-block">
          <h4 className="t-heading-small">Health</h4>
          <ul className="bullet-list">{s.health.map((h) => <li key={h} className="t-para-regular grey-2">{h}</li>)}</ul>
        </div>
        <div className="safety-block">
          <h4 className="t-heading-small">Etiquette</h4>
          <ul className="bullet-list">
            {s.etiquette.map((h) => (
              <li key={h.text} className="t-para-regular grey-2">
                {h.label && <span className="t-label-regular-heavy etiquette-label">{h.label}:</span>} {h.text}
              </li>
            ))}
          </ul>
        </div>
        <div className="safety-block">
          <h4 className="t-heading-small">Solo and female travellers</h4>
          <ul className="bullet-list">{s.solo.map((h) => <li key={h} className="t-para-regular grey-2">{h}</li>)}</ul>
        </div>
      </div>
    </section>
  );
}
