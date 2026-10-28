// City guide schema: the contract between the (future) generation workflow and the renderer.
// Every section references zones by id; no section may name an area that is not in `zones`.

export type LatLng = [number, number];

/* Controlled tag vocabulary (global rule 2) */
export type HoursNeeded = '<1h' | '1-2h' | '2-4h' | 'half-day' | 'full-day';
export type PriceBand = 'free' | '£' | '££' | '£££';
export type BestFor =
  | 'first-timer' | 'repeat' | 'family' | 'couple' | 'budget'
  | 'culture' | 'foodie' | 'nightlife' | 'solo' | 'everyone';

export type TravelerType = 'first-timer' | 'repeat' | 'family' | 'couple' | 'budget';

export interface BookLink {
  label: string;
  url: string;
  from?: number; // live Headout "from" price in £
}

export interface Spot {
  id: string;
  name: string;
  zone: string;
  why: string;
  hours_needed: HoursNeeded;
  price_band: PriceBand;
  from?: number;
  book_ahead: boolean;
  book_ahead_note?: string;
  best_for: BestFor[];
  skip_if: string; // "never" is a valid verdict
  book?: BookLink[];
  coords: LatLng;
  path?: LatLng[]; // walks and boat rides are drawn as a line, not a pin
  path_mode?: 'walk' | 'boat'; // default walk; boat legs don't count towards distance on foot
}

export interface Zone {
  id: string;
  name: string;
  character: string;
  time: string;
  anchors: string[];
  best_for: string;
  position: string;
  color: string;
  polygon: LatLng[];
  spots: Spot[]; // ranked by visitor value, 4–6
}

export interface TopPick {
  rank: number;
  spotId: string; // resolves to a zone spot or an entry in `extraSpots`
  image: string;
}

export interface Essential { label: string; value: string }

export interface CostCell { amount: number; note?: string }
export interface CostTier {
  tier: 'Shoestring' | 'Mid' | 'Splurge';
  total: number;
  stay: CostCell; food: CostCell; transport: CostCell; attractions: CostCell;
}

export type Level = 'low' | 'medium' | 'medium-high' | 'high' | 'very high';

export interface Month {
  month: string;
  high: number; low: number;
  sky?: string;
  daylight: number; // hours
  crowds: Level; crowdsNote?: string;
  prices: Level;
  on: string;
  verdict: 'best' | 'good' | 'avoid';
  url?: string;
}

/** One day: ordered stops (zone id or `trip:<id>`); an empty list is a free day. */
export interface DayPlan { stops: string[]; note?: string }

export interface ItineraryRow {
  days: number;
  url?: string;
  plans: Record<TravelerType, DayPlan[]>;
}

export interface AirportOption {
  from: string; option: string; cost: string; time: string; verdict: string; best?: boolean; book?: BookLink;
  coords?: LatLng; // airport
  arrive?: { name: string; coords: LatLng }; // where in town you land
}

export interface Mode { mode: string; cost: string; use: string; book?: BookLink }

export interface StayZone {
  zone: string;
  best_for: string;
  price: string;
  pro: string;
  con: string;
  properties: { name: string; band: Exclude<PriceBand, 'free'> }[];
}

export interface Dish {
  name: string;
  places: string;
  zones: string[];
  price: PriceBand;
}

export interface MoreTime {
  id: string;
  rank: number;
  name: string;
  travel_time: string;
  length: string;
  how: string;
  why: string;
  best_for: BestFor[];
  price: PriceBand | string;
  book?: BookLink;
  coords: LatLng;
  via?: { name: string; coords: LatLng }[]; // stops on the way, e.g. Stonehenge before Bath
  station: string; // where to start from in London
  stationCoords: LatLng;
}

export interface LinkGroup { title: string; links: { label: string; url: string }[] }

export interface CityGuide {
  slug: string;
  city: string;
  country: string;
  heroImage: string;
  centre: { name: string; coords: LatLng };
  sources: { label: string; url?: string }[];

  // A) Understanding the city
  vibe: { lines: string[]; notFor: string };
  essentials: Essential[];
  costTiers: { tiers: CostTier[]; note: string };
  zones: Zone[];
  extraSpots: Spot[];
  topTen: TopPick[];
  skip: { name: string; why: string }[];
  season: { months: Month[]; pick: string };

  // B) Logistics
  itinerary: { rule: string; pairs: string[]; rows: ItineraryRow[]; conditionals: { label: string; text: string }[] };
  transport: {
    verdict: string;
    airports: AirportOption[];
    modes: Mode[];
    passRules: { label: string; text: string; links?: BookLink[] }[];
    avoid: string[];
  };
  stay: { verdict: string; picks: string[]; zones: StayZone[]; skip: { zone: string; why: string }[] };
  food: {
    dishes: Dish[];
    byZone: { zone: string; places: string }[];
    norms: { label: string; text: string }[];
  };
  safety: {
    verdict: string;
    careful: { label: string; text: string }[];
    scams: { name: string; how: string }[];
    emergency: Essential[];
    health: string[];
    etiquette: { label?: string; text: string }[];
    solo: string[];
  };

  // C) Additionals
  moreTime: { trips: MoreTime[]; cut: string };
  faq: { q: string; a: string }[];
  linkHub: LinkGroup[];
}
