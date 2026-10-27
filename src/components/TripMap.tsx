'use client';

// ===============================
// TripMap — OpenStreetMap via Leaflet (react-leaflet)
// ===============================
// Replaces the old "Google Maps API key" placeholder. Tiles: OpenStreetMap.
// Location search: free OpenStreetMap Nominatim geocoding — place name →
// coordinates (2-step geocoding) → the pin flies to the result. Debounced and
// biased to the Mumbai area via a viewbox (bounded=0, so global results still
// rank in). Nominatim's informal usage policy asks for low-rate, identifying
// traffic; the browser sends its own UA. For production scale, self-host or
// swap the endpoint (e.g. Photon) — this is the only line to change.
// Two modes:
//  - Display: fixed marker at the trip's shopLocation (default).
//  - Picker:  pass `onPick` — searching, tapping the map or dragging the pin
//             reports coordinates back to the form.
// Pin uses the DESIGN.md CTA green, drawn with a divIcon so no marker image
// assets are needed (the classic bundler-URL problem is avoided entirely).
// Loaded through next/dynamic with ssr:false — react-leaflet touches `window`.
// ===============================

import { useCallback, useEffect, useRef, useState } from 'react';
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    ZoomControl,
    useMapEvents,
    useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Search, Loader2, MapPin as MapPinIcon } from 'lucide-react';

// Teardrop pin: green apron with white dot, per the design system.
const pinIcon = L.divIcon({
    className: 'mm-osm-pin',
    html: `<svg width="26" height="36" viewBox="0 0 26 36" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M13 0C6.1 0 0.7 5.4 0.7 12.3c0 9.3 12.3 22.7 12.3 22.7s12.3-13.4 12.3-22.7C25.3 5.4 19.9 0 13 0z" fill="#00754A" stroke="#1E3932" stroke-width="0.8"/>
        <circle cx="13" cy="12.3" r="4.2" fill="#ffffff"/>
    </svg>`,
    iconSize: [26, 36],
    iconAnchor: [13, 36],
    popupAnchor: [0, -34],
});

// ---------- Nominatim geocoding ----------

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
// Bias results to the Mumbai region (VJTI ~19.03, 72.86) without excluding
// global hits. Format: left,top,right,bottom.
const VIEWBOX = 'viewbox=72.55,19.35,73.10,18.80&bounded=0';
// Street-level zoom after picking a search result.
const SEARCH_ZOOM = 17;
// Nominatim informal policy: max ~1 request/second, start at 3+ characters.
const SEARCH_DEBOUNCE_MS = 900;
const SEARCH_MIN_CHARS = 3;

interface NominatimHit {
    name?: string;
    display_name?: string;
    lat?: string;
    lon?: string;
}

export interface MapSearchResult {
    name: string;
    displayName: string;
    lat: number;
    lng: number;
}

// Report map taps (picker mode).
function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
    useMapEvents({
        click: (e) => onPick(e.latlng.lat, e.latlng.lng),
    });
    return null;
}

// Keep the marker centered when the parent recalculates position. A fresh
// `fly` token (bumped by MapSearch selections) carries a one-time street-level
// flight to the result; drag/map-tap picks keep the current zoom. `lastN` is
// this component's own ref — the compiler forbids mutating anything owned by
// the parent (props/hook arguments).
function ViewSync({
    lat,
    lng,
    fly,
}: {
    lat: number;
    lng: number;
    fly: { n: number; zoom: number } | null;
}) {
    const map = useMap();
    const lastN = useRef<number>(-1);
    useEffect(() => {
        const boost = fly && fly.n !== lastN.current ? fly.zoom : undefined;
        if (fly) lastN.current = fly.n;
        if (boost !== undefined) {
            map.flyTo([lat, lng], boost, { duration: 0.8 });
        } else {
            map.setView([lat, lng], map.getZoom(), { animate: true });
        }
    }, [lat, lng, fly, map]);
    return null;
}

// Google-Maps-style search overlay (picker mode only). Renders above the map
// panes (leaflet controls sit at z-index ≤ 800). The overlay wrapper is
// pointer-events-none so map panning keeps working around it.
function MapSearch({ onSelect }: { onSelect: (r: MapSearchResult) => void }) {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<MapSearchResult[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);

    const debounceRef = useRef<number | undefined>(undefined);
    const abortRef = useRef<AbortController | undefined>(undefined);
    const boxRef = useRef<HTMLDivElement>(null);

    const runSearch = useCallback(async (raw: string) => {
        const q = raw.trim();
        window.clearTimeout(debounceRef.current);
        if (q.length < SEARCH_MIN_CHARS) {
            abortRef.current?.abort();
            setResults(null);
            setError(null);
            return;
        }
        abortRef.current?.abort();
        const ac = new AbortController();
        abortRef.current = ac;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(
                `${NOMINATIM_URL}?format=jsonv2&addressdetails=1&limit=5&${VIEWBOX}&q=${encodeURIComponent(q)}`,
                { signal: ac.signal, headers: { Accept: 'application/json' } },
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const hits = (await res.json()) as NominatimHit[];
            const parsed: MapSearchResult[] = hits.flatMap((h) => {
                const lat = parseFloat(h.lat ?? '');
                const lng = parseFloat(h.lon ?? '');
                if (!Number.isFinite(lat) || !Number.isFinite(lng)) return [];
                const fallbackName = (h.display_name ?? '').split(',')[0];
                const name = (h.name && h.name.length > 0 ? h.name : fallbackName) || 'Location';
                return [{ name, displayName: h.display_name || name, lat, lng }];
            });
            setResults(parsed);
        } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') return;
            setError('Search failed — check your connection and try again.');
            setResults([]);
        } finally {
            if (abortRef.current === ac) setLoading(false);
        }
    }, []);

    // Debounce typing so we stay well under Nominatim's 1 req/second.
    const onInput = (value: string) => {
        setQuery(value);
        window.clearTimeout(debounceRef.current);
        if (value.trim().length < SEARCH_MIN_CHARS) {
            abortRef.current?.abort();
            setResults(null);
            setError(null);
            setOpen(false);
            return;
        }
        debounceRef.current = window.setTimeout(
            () => { void runSearch(value); setOpen(true); },
            SEARCH_DEBOUNCE_MS,
        );
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Enter must never submit the surrounding trip form — it searches.
        if (e.key === 'Enter') {
            e.preventDefault();
            window.clearTimeout(debounceRef.current);
            void runSearch(query);
            setOpen(true);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setOpen(false);
        }
    };

    const pick = (r: MapSearchResult) => {
        onSelect(r);
        setOpen(false);
    };

    // Close the dropdown on outside click / unmount cleanup.
    useEffect(() => {
        const onDoc = (e: MouseEvent) => {
            if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', onDoc);
        return () => {
            document.removeEventListener('mousedown', onDoc);
            window.clearTimeout(debounceRef.current);
            abortRef.current?.abort();
        };
    }, []);

    const showDropdown = open && (results !== null || error !== null);
    const listContent = error
        ? <div className="px-3 py-2.5 text-xs text-destructive">{error}</div>
        : results !== null && results.length === 0
            ? <div className="px-3 py-2.5 text-xs text-muted-foreground">No results for “{query.trim()}”</div>
            : results?.map((r, i) => (
                <button
                    key={`${r.lat},${r.lng},${i}`}
                    type="button"
                    onClick={() => pick(r)}
                    className="flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left hover:bg-[#f9f9f9] transition-colors"
                >
                    <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#00754A]" />
                    <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{r.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">{r.displayName}</span>
                    </span>
                </button>
            ));

    return (
        <div ref={boxRef} className="pointer-events-none absolute left-2.5 top-2.5 z-[1000] w-[calc(100%-1.25rem)] max-w-md">
            <div className="pointer-events-auto flex items-center gap-1.5 rounded-[12px] bg-white p-1.5 pl-3 ring-1 ring-foreground/10 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_2px_2px_rgba(0,0,0,0.06),0_0_2px_rgba(0,0,0,0.07)]">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                    value={query}
                    onChange={(e) => onInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    onFocus={() => { if (results !== null || error) setOpen(true); }}
                    placeholder="Search a landmark or address…"
                    aria-label="Search for a location"
                    autoComplete="off"
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                {loading ? (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
                ) : (
                    <button
                        type="button"
                        onClick={() => { void runSearch(query); setOpen(true); }}
                        aria-label="Search"
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#00754A] text-white transition-colors hover:bg-[#006241] active:scale-95"
                    >
                        <Search className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>

            {showDropdown && (
                <div className="pointer-events-auto mt-1.5 max-h-64 overflow-y-auto rounded-[12px] bg-white ring-1 ring-foreground/10 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_2px_2px_rgba(0,0,0,0.06),0_0_2px_rgba(0,0,0,0.07)]">
                    {listContent}
                    <div className="border-t border-[rgba(0,0,0,0.06)] px-3 py-1.5 text-[10px] text-muted-foreground">
                        Search by OpenStreetMap Nominatim
                    </div>
                </div>
            )}
        </div>
    );
}

// ---------- Main component ----------

export interface TripMapProps {
    lat: number;
    lng: number;
    address?: string;
    /** When provided, searching / tapping the map / dragging the pin reports new coordinates. */
    onPick?: (lat: number, lng: number) => void;
    zoom?: number;
}

export default function TripMap({ lat, lng, address, onPick, zoom = 16 }: TripMapProps) {
    const isPicker = typeof onPick === 'function';
    const [fly, setFly] = useState<{ n: number; zoom: number } | null>(null);

    // Search result selected: broadcast a fresh fly token (consumed by ViewSync
    // for a one-time street-level flight) and report coordinates to the form.
    const handleSelect = (r: MapSearchResult) => {
        setFly((prev) => ({ n: (prev?.n ?? 0) + 1, zoom: SEARCH_ZOOM }));
        onPick?.(r.lat, r.lng);
    };

    return (
        <div className="relative overflow-hidden rounded-[12px] ring-1 ring-foreground/10">
            {isPicker && <MapSearch onSelect={handleSelect} />}
            <MapContainer
                center={[lat, lng]}
                zoom={zoom}
                scrollWheelZoom={false}
                zoomControl={false}
                style={{ height: 320, width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {/* Picker mode: the top-left corner hosts the search overlay,
                    so the +/- control lives bottom-right (stacks above the OSM
                    attribution in the same corner container). Display mode
                    keeps the default top-left placement. */}
                <ZoomControl position={isPicker ? 'bottomright' : 'topleft'} />
                {isPicker && <ClickHandler onPick={onPick} />}
                <ViewSync lat={lat} lng={lng} fly={fly} />
                <Marker
                    position={[lat, lng]}
                    icon={pinIcon}
                    draggable={isPicker}
                    eventHandlers={
                        isPicker
                            ? {
                                  dragend: (e) => {
                                      const target = e.target as L.Marker;
                                      const ll = target.getLatLng();
                                      onPick!(ll.lat, ll.lng);
                                  },
                              }
                            : undefined
                    }
                >
                    {address && <Popup>{address}</Popup>}
                </Marker>
            </MapContainer>
        </div>
    );
}
