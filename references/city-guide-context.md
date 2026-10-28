# Headout City Guides: Project Context

Everything established so far for the hackathon city guide project: the brief, the content framework, design decisions, data sources, the code and the open items. Use this file to bring a new session, teammate or agent up to speed.

Last updated: 28 Oct 2026.

---

## 1. The brief

- **What:** static city guides for Headout. One guide per city, following a fixed A/B/C template.
- **Shape:** frontend only. A React page where you type a city name and get its guide. No backend server, no database. (The first idea was a frontend plus backend; the user changed it to frontend only.)
- **Data:** static for now, one data file per city. The user will later explain where the data comes from.
- **End goal:** generate guides through a dynamic workflow (an agent pipeline). The static London build is the reference output and the schema is the contract that workflow must produce.
- **Scope today:** London only, prices in GBP.
- **Design:** must follow Headout's design language.
- **Links:** real Headout URLs only.
- **Maps:** required for the areas (zones) and for the top things to do. Inspiration: https://www.plumhq.com/health-map/bengaluru
- **Directions:** wherever spots or destinations are recommended, the map should update as the reader picks them, with a way to get directions.
- **Desktop only.** No mobile design needed.
- **Headings:** plain, self-explanatory names, not framework labels.

### User requests, in order

1. Hackathon context, the A/B/C template and the detailed spec (section 2). "Change in idea, lets only build the frontend and no backend server as such." "My final goal is to execute this via a dynamic workflow… afterwards I will share you how to get the data."
2. Design: use `/Users/apple/Downloads/headout-storefront-design-system.md` plus a pasted blog design extract. Static data for now. Zones should be the ideal ones for the city. London only for price bands. Map for zones and top things to do. Real Headout URLs. Extract London data from the Headout London travel guide. "Make sure UI is neat and clean."
3. Also use `/Users/apple/Downloads/london_guide.md`. Add direction elements so the map updates as recommended spots or destinations are chosen.
4. No need to design for mobile.
5. Replace the main headings with easy-to-understand names.
6. Store this context in a `references/` folder at the project root as a `.md` file (this file).

---

## 2. The content framework (A/B/C spec)

### Template

- **A) Understanding the city:** Vibe · Constraint + Cost · City distribution (Zones) · Zone-wise spots (priority order) · Best season
- **B) Logistics / planning:** Time-based itinerary · Transport · Stay · Food · Safety
- **C) Additionals:** More time · FAQ + link hub

### Global rules (apply to every section)

1. **Zones are the spine.** The zone taxonomy is defined once in A3 and reused verbatim in A4, B1, B3, B4 and C1. No section may invent a new area name.
2. **Controlled tag vocabulary** on every spot: `zone` · `hours_needed` · `price_band` · `book_ahead` · `best_for` · `skip_if`. The spec used ₹ bands; for London these are `free / £ / ££ / £££`.
3. **Cap and rank everything.** No exhaustive lists in the main flow. Deep inventory goes to C2.
4. **Give verdicts, not neutral option lists.** "Do X" beats "here are 6 options."
5. **Use a table when a block covers more than 3 permutations.** Prose for one answer, table for many.
6. **Handle traveller variance with inline conditionals** ("With kids, swap X for Y"), not duplicate sections.

### Section definitions

| Id | Section | Question it answers | Requirements |
|---|---|---|---|
| A1 | Vibe | Is this place for me? | 3–5 lines on character, texture of a day, who won't enjoy it. No history, no "city of contrasts". Must be falsifiable: if it fits another city, rewrite it. |
| A2 | Constraint + Cost | Hard constraints, and what will it cost? | (a) Essentials strip: currency, language, timezone, socket, country code, card vs cash, tipping, safety level. (b) Cost tiers table: shoestring / mid / splurge, daily total split into stay + food + transport + attractions. Real numbers. |
| A3 | Zones | What does the city look like? | The most important module. 5–7 visitor-meaningful zones (not administrative districts). Each: name, one-line character, half/full-day sizing, 3 anchor sights, who it suits, position relative to centre. Walkable inside, tile the city without overlap. Needs a map. |
| A4 | Zone-wise spots | What must I not miss? | Ranked 4–6 spots per zone with the full tag set. Plus a city-wide top 10. Ranked by visitor value, never alphabetical. Every row says cost and whether to book ahead. |
| A5 | Best season | When should I come? | 12-row month grid: weather · crowds · prices · what's on · verdict (best/good/avoid). Then a 2-line "if I can pick any month" answer. |
| B1 | Itinerary | How do I fit this into my days? | (a) Combining rule: how many zones fit in a day (usually 2). (b) Duration × traveller matrix: rows 1/2/3/5/7 days, columns first-timer / repeat / family / couple / budget. Each cell is an ordered zone sequence from A3. Never re-describe A4 spots. |
| B2 | Transport | How do I move? | Lead with the verdict. Airport → city options with cost and time, in-city modes with cost, pass/travel-card decision rule, what to avoid. |
| B3 | Stay | Where do I sleep? | By the same zones as A3. Per zone: who it suits, price band, one pro, one con, 3–5 named properties across budgets. One default pick ("first time, stay here"). |
| B4 | Food | What do I eat? | 5–8 signature dishes with 2–3 places each; where to eat by zone; meal norms (timing, reservations, cost per meal by tier). Every restaurant anchored to a dish or zone. |
| B5 | Safety | How do I not get burned? | Areas to be careful in and when, the 2–3 real scams, emergency numbers, water and health, etiquette, solo and female traveller notes. "Stay aware of your surroundings" is a failure. |
| C1 | More time | What if I have extra days? | Day trips, ranked, capped at 5–6. Each: travel time, half/full day, how to get there, why go, best for. |
| C2 | FAQ + link hub | Everything else | 6–10 real residual questions the body doesn't answer, then a taxonomy-grouped link grid (attractions, passes, themed guides, monthly guides). Below the fold. |

Decisions taken on the spec's two open questions:
- **Zone count:** London uses 7 (large city). Guidance: 5 for small cities, 7 for large.
- **Tag vocabulary:** fixed enum, so output is machine-checkable across cities (see `web/src/types.ts`).

---

## 3. Design language

### Sources

1. **Storefront design system:** `/Users/apple/Downloads/headout-storefront-design-system.md`. This is the source of truth.
2. **Blog design extract** (pasted by the user, taken from the live Headout London blog page): white canvas, light editorial type, a single navy accent `#00247D`, circular numbered badges, short accent rule under section headings, fixed left TOC, hairline separators, accordions, link-hub grid. Its own caveat said the navy might not match the core brand and to pick one source of truth.

### How the conflict was resolved

The storefront design system wins on tokens and colour. The blog extract informed layout and components (hero, sticky TOC, numbered cards, accordion FAQ, link hub, month grid, duration × traveller matrix, tag chips).

- **Colour:** purple `#8000ff` is the only primary CTA colour. Links are grey `#444`. Booking buttons are black (`#222`) with a "from £X" price. Status colours: positive `#078842`, warning `#9f6b00`, candy `#e5006e`.
- **Surfaces and edges:** white page, greys `#fafafa / #f8f8f8 / #f0f0f0`, dividers `#f0f0f0 / #e2e2e2`. 1px edges rather than shadows.
- **Type:** Halyard (`halyard-display` for headings, `halyard-text` for body and UI) loaded from Typekit with `@font-face`, weights 300/500/600. Text-style classes such as `.t-heading-large`, `.t-label-medium`, `.t-cta-small`.
- **Badges:** radius 4, 1/3 split padding.
- **Layout:** content rail 75rem, 240px sticky TOC on the left.
- **Area colours:** each area has its own colour on the map and in chips. This departs from the blog's "monochrome UI" rule because the map needs areas to be told apart.
- **Map basemap:** muted grey (Esri World Light Gray plus a CSS grayscale filter).
- The `@headout/storefront-design-system` npm package was not installed because it needs a GitHub token. Tokens are copied into CSS variables in `web/src/index.css`.

### Wording rules adopted

- Readers see **"areas"**, not "zones" (London's Tube fare zones would be confused with them). The code and data still say `zone`.
- `skip_if: "never"` renders as "Don't skip this one."
- Plain headings (section 6).

---

## 4. Data sources (London)

| Source | Used for |
|---|---|
| `/Users/apple/Downloads/london_guide.md` (an A1–C2 draft London guide) | **Primary.** Areas, spots, top 10, skip list, months, itinerary, transport, stay, food, safety, day trips, FAQ, link groups, live Headout "from" prices (snapshot 16 Oct 2026). |
| Headout London travel guide: https://www.headout.com/blog/london-travel-guide/ | First data source before the md arrived. Now supplies the hero image, monthly guide links and blog itinerary links. |
| Headout product pages | Real booking URLs (the `BOOK` map in `london.ts`) and top-10 images (Headout imgix CDN). |

### London areas (zone ids)

| id | Area |
|---|---|
| `ws` | Westminster & South Bank |
| `we` | West End |
| `bc` | Bloomsbury & Camden |
| `ce` | The City & East End |
| `bb` | Bankside & Borough |
| `ken` | Kensington & Hyde Park |
| `gr` | Greenwich |

Each has a hand-drawn polygon, a colour and 4–6 ranked spots with coordinates. Walks and boat rides carry a `path` (Regent's Canal walk, Millennium Bridge, boat to Greenwich with `path_mode: 'boat'`). The South Bank walk lives in `extraSpots` because it appears in the top 10 but not in an area list.

### Booking links in use

Tower of London, Westminster Abbey, Les Misérables, The Lion King, Hamilton, St Paul's, London Eye, Churchill War Rooms, Changing of the Guard tour, Tower Bridge, Sky Garden, The Shard, Kensington Palace, Thames cruise to Greenwich, Royal Observatory, Cutty Sark, Heathrow Express, Uber Boat by Thames Clippers, London Pass, London Explorer Pass, Warner Bros. Studio Tour, Windsor Castle, Stonehenge/Windsor/Bath day trip. All are `https://www.headout.com/...` product URLs.

### Day trips (C1)

Six ranked trips, each with its London departure station and coordinates:

| Trip | Leaves from |
|---|---|
| Warner Bros. Studio Tour (Harry Potter) | Euston |
| Windsor Castle | Paddington |
| Bath, with Stonehenge as a stop on the way | Victoria Coach Station |
| Oxford | Paddington |
| Cambridge | King's Cross |
| Brighton | Victoria |

---

## 5. Technical setup

- **Location:** `/Users/apple/Desktop/hackathon city guide/web/`
- **Stack:** Vite 8, React 19, TypeScript 6, Leaflet 1.9 with react-leaflet 5, oxlint.
- **Run:** `cd web && npm run dev` (was served at http://localhost:5179/#/london). Build: `npm run build`.
- **Routing:** hash routes. `#/` is the search page, `#/london` is the guide. In-page anchor clicks are intercepted so the `#/london` route stays in the URL.
- **Map tiles:** Esri World Light Gray (base + reference layers, no key, `maxNativeZoom` 16). CARTO was tried first but now requires an API key.

### Files

| File | Role |
|---|---|
| `index.html` | Title, Halyard font preloads |
| `src/index.css` | Font faces, design tokens, text-style classes |
| `src/app.css` | Component styles (desktop only) |
| `src/types.ts` | **The schema.** Contract between the future generation workflow and the renderer |
| `src/data/london.ts` | London data (≈900 lines) |
| `src/data/index.ts` | `guides` registry, `upcoming` cities list, `findGuide(q)` |
| `src/geo.ts` | Distances, walking order, route length, Google Maps directions URLs |
| `src/components/App.tsx`, `Header.tsx`, `Landing.tsx` | Hash router, header, city search with "not found" message and coming-soon list |
| `src/components/Guide.tsx` | Hero, plain-language TOC with active-section tracking, part headers, footer with sources |
| `src/components/SectionA.tsx` | A1–A5 |
| `src/components/SectionB.tsx` | B1–B5 |
| `src/components/SectionC.tsx` | C1–C2 |
| `src/components/CityMap.tsx` | Shared Leaflet map: area polygons, numbered badges, pins/dots/origin markers, walk/path/transit routes, active highlighting, animated fit/fly |
| `src/components/ui.tsx` | Guide context (`useGuide` lookups for zone, trip, spot), icons, headers, badges, chips, tag row, book button, directions link, verdict, tabs |

### Schema highlights (`src/types.ts`)

- **Tag enums:** `HoursNeeded` = `<1h | 1-2h | 2-4h | half-day | full-day`; `PriceBand` = `free | £ | ££ | £££`; `BestFor` = first-timer, repeat, family, couple, budget, culture, foodie, nightlife, solo, everyone; `TravelerType` = first-timer, repeat, family, couple, budget.
- **Spot:** id, name, zone, why, hours_needed, price_band, `from?` (live £ price), book_ahead, `book_ahead_note?`, best_for, skip_if, `book?: BookLink[]`, coords, `path?`, `path_mode?: 'walk' | 'boat'`.
- **Zone:** id, name, character, time, anchors, best_for, position, color, polygon, spots (ranked 4–6).
- **TopPick:** rank, spotId (zone spot or `extraSpots` entry), image.
- **Month:** high/low temp, sky, daylight hours, crowds and prices as `low | medium | medium-high | high | very high`, what's on, verdict `best | good | avoid`.
- **Itinerary:** `rows[]` of `{days, plans: Record<TravelerType, DayPlan[]>}`; a `DayPlan` is an ordered list of stops, each a zone id or `trip:<id>`. Empty list = free day.
- **AirportOption:** includes airport coords and an `arrive` point in town for drawing the route.
- **MoreTime:** includes destination coords, optional `via` stops, London `station` and `stationCoords`.
- **Referential rule:** every section refers to areas by zone id, so no section can name an area that isn't in `zones`.

### Directions logic (`src/geo.ts`)

- Haversine distance × 1.3 street factor; walking speed 4.8 km/h.
- **Walking order:** brute-force shortest open path through an area's spots (fine up to 7 spots; avoids greedy backtracking). Spots with a path keep their direction.
- **Route length:** boat legs are excluded from distance on foot (this fixed a Greenwich day showing 12.7 km instead of 2.2 km).
- **Directions links:** Google Maps public URL scheme, `https://www.google.com/maps/dir/?api=1&origin=…&destination=…&waypoints=…&travelmode=walking|transit`, no key, up to 9 waypoints.

---

## 6. What the page shows

Headings were renamed to plain language. The A/B/C structure stays in the data model.

| Part | Spec id | Heading on the page | Interactive behaviour |
|---|---|---|---|
| 1. Get to know London | A1 | Is London for you? | Vibe lines plus "not for you if" |
| | A2 | Costs and essentials | Facts grid; cost tiers table with notes per cell |
| | A3 | The 7 areas to explore | Area cards next to a sticky map with numbered badges; clicking an area highlights it and lists its spots |
| | A4 | What to see | **Top 10:** carousel of cards, map and side panel (tags, Book, Directions); picking a card or pin flies the map to it; walks draw their path. **By area:** area tabs; ranked list (Show on map, Directions, Book) beside a route card (suggested walking order, distance, time, "Open walking route" in Google Maps) and a map with a dotted walk line; zoom capped at 15. **Skip list.** |
| | A5 | When to go | 12-month grid with daylight column and 5-bar crowd/price levels, plus the pick-any-month answer |
| 2. Plan your trip | B1 | Plan your days | Verdict, good area pairs, clickable days × traveller matrix. Picking a cell opens a plan viewer with day tabs, stop list (top 3 spots per area, morning then afternoon), walking distance, Google Maps link and a map (walk in area colours, grey transit hops between areas, boat paths, day-trip lines from the London station). Conditionals grid below. |
| | B2 | Getting around | Verdict; airport table beside a map of airport-to-town routes (hovering a row highlights its route); modes table; pass decision rules with Book buttons; avoid list |
| | B3 | Where to stay | Stay cards beside a sticky map highlighting the hovered area or the default picks; areas to skip |
| | B4 | What to eat | Dishes table with area chips; where to eat by area; meal norms |
| | B5 | Staying safe | Careful areas, scams, emergency numbers, health, etiquette, solo notes |
| 3. If you have more time | C1 | Day trips | Ranked list beside a map; selecting or hovering focuses the route from the London station, including `via` stops; transit directions |
| | C2 | Questions and more guides | FAQ accordion plus grouped link hub |

---

## 7. Adding a city (contract for the workflow)

1. Produce a `CityGuide` object that type-checks against `web/src/types.ts`.
2. Save it as `web/src/data/<slug>.ts` and register it in `web/src/data/index.ts`.
3. Rules the generator must keep:
   - 5–7 areas with polygons, colours and 4–6 ranked spots each, all with coordinates.
   - Every zone reference in itinerary, stay, food and day trips uses an existing zone id.
   - Fixed tag enums only.
   - Real Headout booking URLs; "from" prices where available.
   - Top 10 points at spot ids.
   - Itinerary covers rows 1/2/3/5/7 × all five traveller types.
   - Day trips carry station coordinates so routes can be drawn.
4. Currency: the London build hard-codes £ in `PriceBand` and labels. A multi-city version needs currency on the guide.

---

## 8. Known caveats

- Area polygons, coordinates and route lines are hand-drawn approximations.
- Walking distances are straight-line × 1.3, so they are estimates.
- The itinerary matrix was expanded from the md's "Add D3…" shorthand into full day-by-day plans for every cell.
- Hotel names are plain text (the md had no hotel links). Hotel price bands come from the md.
- Headout prices are from the 16 Oct 2026 snapshot; other prices are typical 2026 figures.
- Desktop only (single 768px breakpoint left from earlier work; no mobile pass).
- `oxlint` reports only fast-refresh warnings; `npm run build` passes.

---

## 9. Open items

- Data-source explanation for the dynamic workflow (the user will share it).
- Design and build of the generation workflow that outputs `CityGuide` files.
- More cities (Paris, Rome, Barcelona, Dubai, New York, Amsterdam and Singapore are listed as coming soon).
- Multi-currency support if cities outside the UK are added.
