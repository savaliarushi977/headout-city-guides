import type { LatLng, Spot } from './types';

const R = 6371; // km
const rad = (d: number) => (d * Math.PI) / 180;

export function distanceKm(a: LatLng, b: LatLng) {
  const dLat = rad(b[0] - a[0]);
  const dLng = rad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function lineKm(points: LatLng[]) {
  let d = 0;
  for (let i = 1; i < points.length; i++) d += distanceKm(points[i - 1], points[i]);
  return d;
}

/** Straight-line legs understate real streets; 1.3× is a common urban detour factor. */
export const STREET_FACTOR = 1.3;
export const walkMinutes = (km: number) => Math.round((km / 4.8) * 60);

export function fmtKm(km: number) {
  return km < 1 ? `${Math.round(km * 1000 / 50) * 50} m` : `${km.toFixed(1)} km`;
}
export function fmtMin(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

/** Where you arrive at a spot, and where you leave it (walks and boat rides have both ends). */
export const spotStart = (s: Spot): LatLng => (s.path ? s.path[0] : s.coords);
export const spotEnd = (s: Spot): LatLng => (s.path ? s.path[s.path.length - 1] : s.coords);

/** Walking distance from where one spot ends to where the next one starts. */
const legKm = (a: Spot, b: Spot) => distanceKm(spotEnd(a), spotStart(b));

/**
 * Shortest walking order through a zone's spots (open path, any start). Zones cap at 6 spots,
 * so trying every order (720 at most) is instant and avoids the backtracking a greedy route makes.
 * Spots with a fixed path keep their own direction.
 */
export function walkingOrder(spots: Spot[]): Spot[] {
  if (spots.length < 3 || spots.length > 7) return spots;
  let best: Spot[] = spots;
  let bestKm = Infinity;
  const used = new Array(spots.length).fill(false);
  const cur: Spot[] = [];
  const go = (km: number) => {
    if (km >= bestKm) return;
    if (cur.length === spots.length) { bestKm = km; best = [...cur]; return; }
    for (let i = 0; i < spots.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      const add = cur.length ? legKm(cur[cur.length - 1], spots[i]) : 0;
      cur.push(spots[i]);
      go(km + add);
      cur.pop();
      used[i] = false;
    }
  };
  go(0);
  return best;
}

/** Full drawn route for an ordered list of spots: walk between spots, follow a spot's own path. */
export function routePoints(spots: Spot[]): LatLng[] {
  const pts: LatLng[] = [];
  spots.forEach((s) => {
    if (s.path) pts.push(...s.path);
    else pts.push(s.coords);
  });
  return pts;
}

export function routeKm(spots: Spot[]) {
  let km = 0;
  for (let i = 0; i < spots.length; i++) {
    if (spots[i].path && spots[i].path_mode !== 'boat') km += lineKm(spots[i].path!);
    if (i > 0) km += distanceKm(spotEnd(spots[i - 1]), spotStart(spots[i])) * STREET_FACTOR;
  }
  return km;
}

type Mode = 'walking' | 'transit' | 'driving';
const ll = (p: LatLng) => `${p[0]},${p[1]}`;

/** Google Maps directions URL (public URL scheme, no key needed). */
export function directionsUrl(opts: { destination: LatLng; origin?: LatLng; waypoints?: LatLng[]; mode?: Mode }) {
  const q = new URLSearchParams({ api: '1', destination: ll(opts.destination), travelmode: opts.mode ?? 'walking' });
  if (opts.origin) q.set('origin', ll(opts.origin));
  if (opts.waypoints?.length) q.set('waypoints', opts.waypoints.slice(0, 9).map(ll).join('|'));
  return `https://www.google.com/maps/dir/?${q.toString()}`;
}

export function spotsDirectionsUrl(spots: Spot[]) {
  if (!spots.length) return undefined;
  const first = spotStart(spots[0]);
  const last = spotEnd(spots[spots.length - 1]);
  const mid = spots.slice(1, -1).map(spotStart);
  return directionsUrl({ origin: first, destination: last, waypoints: mid, mode: 'walking' });
}
