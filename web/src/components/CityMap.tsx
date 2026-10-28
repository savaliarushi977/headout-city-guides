import { useEffect, useMemo, useRef } from 'react';
import { CircleMarker, MapContainer, Marker, Polygon, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet';
import L, { type LatLngBoundsExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { LatLng, Zone } from '../types';

export interface MapMarker {
  id: string;
  label: string;
  rank?: number | string;
  coords: LatLng;
  color?: string;
  kind?: 'pin' | 'dot' | 'origin';
}

export interface MapRoute {
  id: string;
  points: LatLng[];
  color?: string;
  kind: 'walk' | 'path' | 'transit';
}

interface Props {
  zones: Zone[];
  /** zones drawn strong; when set, every other zone is dimmed */
  highlight?: string[];
  showZones?: boolean;
  zoneBadges?: boolean;
  markers?: MapMarker[];
  activeMarker?: string | null;
  routes?: MapRoute[];
  activeRoute?: string | null;
  focus?: LatLng[];
  maxZoom?: number;
  onZoneClick?: (id: string) => void;
  onMarkerClick?: (id: string) => void;
  height?: number | string;
}

function pinIcon(m: MapMarker, active: boolean) {
  const cls = m.kind === 'origin' ? 'map-pin map-pin--origin' : 'map-pin';
  return L.divIcon({
    className: '',
    html: `<span class="${cls}${active ? ' map-pin--active' : ''}"${m.color ? ` style="--pin:${m.color}"` : ''}>${m.rank ?? ''}</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function FitTo({ points, maxZoom }: { points: LatLng[]; maxZoom: number }) {
  const map = useMap();
  const key = points.map((p) => p.join(',')).join('|');
  const first = useRef(true);
  const latest = useRef(points);
  latest.current = points;

  useEffect(() => {
    if (!points.length) return;
    map.invalidateSize();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const opts = { padding: [32, 32] as [number, number], maxZoom };
    if (points.length === 1) {
      if (first.current || reduce) map.setView(points[0], maxZoom);
      else map.flyTo(points[0], maxZoom, { duration: 0.5 });
    } else if (first.current || reduce) {
      map.fitBounds(points as LatLngBoundsExpression, opts);
    } else {
      map.flyToBounds(points as LatLngBoundsExpression, { ...opts, duration: 0.6 });
    }
    first.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map, maxZoom]);

  // The container can resize after first paint (sticky columns, fonts loading).
  useEffect(() => {
    let w = 0;
    const ro = new ResizeObserver((entries) => {
      const nw = Math.round(entries[0].contentRect.width);
      if (nw === w) return;
      w = nw;
      map.invalidateSize();
      const pts = latest.current;
      if (pts.length > 1) map.fitBounds(pts as LatLngBoundsExpression, { padding: [32, 32], maxZoom });
    });
    ro.observe(map.getContainer());
    return () => ro.disconnect();
  }, [map, maxZoom]);
  return null;
}

export default function CityMap({
  zones, highlight, showZones = true, zoneBadges = false, markers = [], activeMarker, routes = [], activeRoute,
  focus, maxZoom = 16, onZoneClick, onMarkerClick, height = 480,
}: Props) {
  const allPoints = useMemo(() => zones.flatMap((z) => z.polygon), [zones]);
  const fitPoints = focus && focus.length ? focus : allPoints;
  const hl = highlight && highlight.length ? new Set(highlight) : null;

  return (
    <div className="city-map" style={{ height }}>
      <MapContainer
        bounds={allPoints as LatLngBoundsExpression}
        boundsOptions={{ padding: [24, 24] }}
        scrollWheelZoom={false}
        zoomSnap={0.25}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors"
          maxNativeZoom={16}
        />
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
          maxNativeZoom={16}
        />

        {showZones && zones.map((z, i) => {
          const on = hl ? hl.has(z.id) : false;
          const dim = hl ? !on : false;
          return (
            <Polygon
              key={`${z.id}-${on ? 1 : 0}-${dim ? 1 : 0}`}
              positions={z.polygon}
              pathOptions={{
                color: z.color,
                weight: on ? 2 : 1,
                opacity: dim ? 0.3 : 0.9,
                fillColor: z.color,
                fillOpacity: on ? 0.16 : dim ? 0.04 : 0.14,
              }}
              eventHandlers={onZoneClick ? { click: () => onZoneClick(z.id) } : undefined}
            >
              {zoneBadges && (
                <Tooltip direction="center" permanent className="zone-label" opacity={dim ? 0.45 : 1}>
                  <span className="zone-num" style={{ background: z.color }}>{i + 1}</span>
                  {on && <span className="zone-num__name">{z.name}</span>}
                </Tooltip>
              )}
            </Polygon>
          );
        })}

        {routes.map((r) => {
          const on = activeRoute ? activeRoute === r.id : true;
          const color = r.color ?? '#222222';
          const style =
            r.kind === 'walk'
              ? { color, weight: 3, opacity: on ? 0.9 : 0.25, dashArray: '2 7', lineCap: 'round' as const }
              : r.kind === 'transit'
                ? { color, weight: on ? 3 : 2, opacity: on ? 0.9 : 0.3, dashArray: '10 8' }
                : { color, weight: on ? 5 : 4, opacity: on ? 0.85 : 0.3, lineCap: 'round' as const };
          return <Polyline key={`${r.id}-${on ? 1 : 0}`} positions={r.points} pathOptions={style} />;
        })}

        {markers.map((m) => {
          const active = activeMarker === m.id;
          if (m.kind === 'dot') {
            return (
              <CircleMarker
                key={`${m.id}-${active ? 1 : 0}`}
                center={m.coords}
                radius={active ? 7 : 5}
                pathOptions={{ color: '#fff', weight: 2, fillColor: m.color ?? '#222', fillOpacity: 1 }}
                eventHandlers={onMarkerClick ? { click: () => onMarkerClick(m.id) } : undefined}
              >
                <Tooltip direction="top" offset={[0, -6]} className="pin-label" permanent={active}>{m.label}</Tooltip>
              </CircleMarker>
            );
          }
          return (
            <Marker
              key={`${m.id}-${active ? 1 : 0}`}
              position={m.coords}
              icon={pinIcon(m, active)}
              zIndexOffset={active ? 1000 : 0}
              eventHandlers={onMarkerClick ? { click: () => onMarkerClick(m.id) } : undefined}
            >
              <Tooltip direction="top" offset={[0, -14]} className="pin-label" permanent={active}>{m.label}</Tooltip>
            </Marker>
          );
        })}

        <FitTo points={fitPoints} maxZoom={maxZoom} />
      </MapContainer>
    </div>
  );
}
