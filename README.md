# Headout City Guides

Static city guides for Headout, built on the A/B/C city guide framework. Type a city name and get its guide: areas, ranked places, maps with walking routes and directions, day-by-day plans, transport, stay, food, safety and day trips.

London is the first and only city so far.

## Run it

```bash
cd web
npm install
npm run dev
```

Open the local URL Vite prints, then go to `#/london`.

## Layout

- `web/` is the React app (Vite, React 19, TypeScript, Leaflet).
  - `src/types.ts` is the guide format every city file must match.
  - `src/data/london.ts` holds the London data. Add a city by adding a file here and registering it in `src/data/index.ts`.
- `references/city-guide-context.md` covers the brief, the framework spec, design decisions, data sources and open items.
