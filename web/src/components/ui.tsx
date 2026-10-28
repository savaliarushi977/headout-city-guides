import { createContext, useContext, type ReactNode } from 'react';
import type { BookLink, CityGuide, MoreTime, PriceBand, Spot, Zone } from '../types';

/* ---------- Guide context: one lookup for zone references across sections ---------- */

interface GuideCtx {
  guide: CityGuide;
  zone: (id: string) => Zone | undefined;
  zoneIndex: (id: string) => number;
  trip: (id: string) => MoreTime | undefined;
  spot: (id: string) => Spot | undefined;
}

const Ctx = createContext<GuideCtx | null>(null);

export function GuideProvider({ guide, children }: { guide: CityGuide; children: ReactNode }) {
  const zones = new Map(guide.zones.map((z) => [z.id, z]));
  const order = new Map(guide.zones.map((z, i) => [z.id, i]));
  const trips = new Map(guide.moreTime.trips.map((t) => [t.id, t]));
  const spots = new Map([...guide.zones.flatMap((z) => z.spots), ...guide.extraSpots].map((s) => [s.id, s]));
  const value: GuideCtx = {
    guide,
    zone: (id) => zones.get(id),
    zoneIndex: (id) => order.get(id) ?? -1,
    trip: (id) => trips.get(id),
    spot: (id) => spots.get(id),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGuide() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useGuide outside GuideProvider');
  return v;
}

/* ---------- Icons: SVG at the text's font size, stroke in currentColor ---------- */

type IconProps = { size?: number; className?: string };
const base = (size: number) => ({
  width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true,
});

export const IconExternal = ({ size = 14, className }: IconProps) => (
  <svg {...base(size)} className={`icon ${className ?? ''}`}><path d="M14 5h5v5M19 5l-8 8M18 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4" /></svg>
);
export const IconChevronRight = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={`icon ${className ?? ''}`}><path d="m9 6 6 6-6 6" /></svg>
);
export const IconChevronLeft = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={`icon ${className ?? ''}`}><path d="m15 6-6 6 6 6" /></svg>
);
export const IconChevronDown = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={`icon ${className ?? ''}`}><path d="m6 9 6 6 6-6" /></svg>
);
export const IconSearch = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} className={`icon ${className ?? ''}`}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
export const IconClock = ({ size = 14, className }: IconProps) => (
  <svg {...base(size)} className={`icon ${className ?? ''}`}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
export const IconCheck = ({ size = 14, className }: IconProps) => (
  <svg {...base(size)} className={`icon ${className ?? ''}`}><path d="m5 12 5 5 9-10" /></svg>
);
export const IconMinus = ({ size = 14, className }: IconProps) => (
  <svg {...base(size)} className={`icon ${className ?? ''}`}><path d="M6 12h12" /></svg>
);
export const IconAlert = ({ size = 14, className }: IconProps) => (
  <svg {...base(size)} className={`icon ${className ?? ''}`}><path d="M12 4 2.5 20h19L12 4Z" /><path d="M12 10v4M12 17.5v.01" /></svg>
);
export const IconArrowLeft = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={`icon ${className ?? ''}`}><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
);
export const IconDirections = ({ size = 14, className }: IconProps) => (
  <svg {...base(size)} className={`icon ${className ?? ''}`}><path d="M12 2.5 21.5 12 12 21.5 2.5 12 12 2.5Z" /><path d="M9 13v-2.5h5M12.5 8.5 15 11l-2.5 2.5" /></svg>
);
export const IconWalk = ({ size = 14, className }: IconProps) => (
  <svg {...base(size)} className={`icon ${className ?? ''}`}><circle cx="13" cy="4.5" r="1.5" /><path d="m9 21 2.5-6.5L14 17v4M8 11l3-3.5 3 1 2.5 3M11.5 14.5 13 9" /></svg>
);
export const IconTrain = ({ size = 14, className }: IconProps) => (
  <svg {...base(size)} className={`icon ${className ?? ''}`}><rect x="5" y="3" width="14" height="14" rx="3" /><path d="M5 11h14M9 21l1.5-4M15 21l-1.5-4M9 14h.01M15 14h.01" /></svg>
);
export const IconSkip = ({ size = 14, className }: IconProps) => (
  <svg {...base(size)} className={`icon ${className ?? ''}`}><circle cx="12" cy="12" r="9" /><path d="m6 6 12 12" /></svg>
);

/* ---------- Building blocks ---------- */

/** Section heading in plain words, with one line saying what the section answers. */
export function SectionHeader({ title, intro }: { title: string; intro: string }) {
  return (
    <header className="section-header">
      <h2 className="t-heading-large">{title}</h2>
      <p className="t-para-medium grey-2">{intro}</p>
    </header>
  );
}

export function PartHeader({ step, title, intro }: { step: number; title: string; intro: string }) {
  return (
    <div className="part-header">
      <span className="part-header__step t-label-regular grey-3">Part {step} of 3</span>
      <p className="t-heading-medium">{title}</p>
      <p className="t-label-medium grey-2">{intro}</p>
    </div>
  );
}

export function RankBadge({ n, size = 'md', color }: { n: number | string; size?: 'sm' | 'md' | 'lg'; color?: string }) {
  return <span className={`rank-badge rank-badge--${size}`} style={color ? { background: color } : undefined}>{n}</span>;
}

export function ZoneDot({ color }: { color: string }) {
  return <span className="zone-dot" style={{ background: color }} aria-hidden />;
}

export function ZoneChip({ id, onClick, active }: { id: string; onClick?: () => void; active?: boolean }) {
  const { zone, trip } = useGuide();
  if (id.startsWith('trip:')) {
    const t = trip(id.slice(5));
    return (
      <span className={`zone-chip zone-chip--trip t-label-small${active ? ' zone-chip--active' : ''}`}>
        <IconTrain size={14} />
        {t ? shortTrip(t.name) : id}
      </span>
    );
  }
  const z = zone(id);
  if (!z) return null;
  const inner = <><ZoneDot color={z.color} />{z.name}</>;
  if (onClick) {
    return <button type="button" className={`zone-chip t-label-small${active ? ' zone-chip--active' : ''}`} onClick={onClick}>{inner}</button>;
  }
  return <span className={`zone-chip t-label-small${active ? ' zone-chip--active' : ''}`}>{inner}</span>;
}

const shortTrip = (name: string) =>
  name.replace('Harry Potter Warner Bros. Studio Tour', 'Harry Potter Studio').replace(' Castle', '');

export function priceLabel(p: PriceBand | string, from?: number) {
  if (p === 'free') return 'FREE';
  return from ? `${p} · from £${from}` : p;
}

const HOURS: Record<string, string> = {
  '<1h': 'Under 1 hr', '1-2h': '1–2 hrs', '2-4h': '2–4 hrs', 'half-day': 'Half day', 'full-day': 'Full day',
};
export const hoursLabel = (h: string) => HOURS[h] ?? h;

/** The fixed tag set from global rule 2, rendered as badges (radius 4, 12/16). */
export function TagRow({ item }: { item: Spot }) {
  return (
    <ul className="tag-row" aria-label="Tags">
      <li className="badge t-label-small"><IconClock size={14} />{hoursLabel(item.hours_needed)}</li>
      <li className="badge t-label-small">{priceLabel(item.price_band, item.from)}</li>
      {item.book_ahead && (
        <li className="badge badge--warning t-label-small">Book ahead{item.book_ahead_note ? ` (${item.book_ahead_note})` : ''}</li>
      )}
      {!item.book_ahead && item.book_ahead_note && (
        <li className="badge badge--quiet t-label-small">Book {item.book_ahead_note}</li>
      )}
      {item.best_for.map((b) => (
        <li key={b} className="badge badge--quiet t-label-small">{b}</li>
      ))}
    </ul>
  );
}

export function SkipIf({ text }: { text: string }) {
  if (text === 'never') return <p className="t-label-small grey-3 skip-if">Don’t skip this one.</p>;
  return (
    <p className="t-label-small grey-3 skip-if">
      <span className="t-subheading-small">Skip if</span> {text}
    </p>
  );
}

export function ExtLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a className={`ext-link ${className ?? ''}`} href={href} target="_blank" rel="noreferrer">
      {children}
      <IconExternal />
    </a>
  );
}

/** A Headout booking link, styled as a compact black button (the card CTAs are not purple, colors.md §2). */
export function BookButton({ link }: { link: BookLink }) {
  return (
    <a className="book-btn t-cta-small" href={link.url} target="_blank" rel="noreferrer">
      {link.label}
      {link.from ? <span className="book-btn__from">from £{link.from}</span> : null}
    </a>
  );
}

export function DirectionsLink({ href, label = 'Directions' }: { href: string; label?: string }) {
  return (
    <a className="dir-link t-label-regular" href={href} target="_blank" rel="noreferrer">
      <IconDirections size={14} />{label}
    </a>
  );
}

export function Verdict({ children }: { children: ReactNode }) {
  return (
    <div className="verdict">
      <p className="t-subheading-small verdict__label">Our verdict</p>
      <p className="t-para-large">{children}</p>
    </div>
  );
}

export function Tabs<T extends string>({
  items, value, onChange, label,
}: {
  items: { id: T; label: ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div className="tabs" role="group" aria-label={label}>
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          className="tabs__item t-label-regular"
          aria-pressed={it.id === value}
          onClick={() => onChange(it.id)}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}
