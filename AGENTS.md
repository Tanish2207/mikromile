<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# MikroMile — Agent Notes

Single-package Next.js 16 (App Router, Turbopack) + TypeScript app: a community commerce network for college campuses with two pillars — **Group Buy** (pooled orders from local stores) and **Community Errands** (trips + item requests). All pages under `src/app/` are `'use client'` components that read `localStorage` inside effects; nothing is server-persisted.

## Commands

- `npm run dev` — dev server on :3000.
- `npx tsc --noEmit` — full typecheck; there is no `typecheck` script.
- `npm run build` — production build; also runs TypeScript. Use this as the completion gate (with `tsc --noEmit`).
- `npm run lint` is **not a gate**: `next build` does not run ESLint, and the repo ships with ~19 pre-existing `react-hooks/set-state-in-effect` errors (the `setMounted(true)` guard idiom in every page). Don't mass-fix them or treat new instances of the same idiom as regressions.
- No test runner exists. `TESTCASES.md` is the manual QA matrix — add/update a `TC-xx` row for every feature change.

## Gotchas

- shadcn/BaseUI `Select`: `onValueChange` emits `string | null` — coalesce it (`(v) => setX(v ?? 'none')`), plain setters don't typecheck.
- `src/lib/seed.ts` seeds demo data once, guarded by `SEED_KEY = "mikromile_seeded_v2"`. Whenever you change models or seed data, **bump the key suffix**, otherwise existing browsers keep stale localStorage.
- State flows: pages redirect to `/login` until `useAuth` reports `mounted && isLoggedIn`; `null` returns before hydration are expected.
- Maps are **Leaflet + OpenStreetMap** (`src/components/TripMap.tsx`, react-leaflet v5), loaded via `next/dynamic` with `ssr:false` — react-leaflet must never render server-side. Used in `/trips/create` (pin picker) and `/trips/[id]` (location display); no Google Maps key exists or is needed. The picker has a **Nominatim geocoding search bar** (place name → coordinates → pin flies there; debounced ≥3 chars, Mumbai viewbox bias, `NOMINATIM_URL` const to swap for Photon/self-host at scale). `socket.io` remains installed but imported nowhere — don't assume wiring exists.

## Data layer (temporary; will migrate to MongoDB)

- `src/lib/db.ts` is the only persistence: typed CRUD over JSON arrays in `localStorage`, keys prefixed `mikromile_`, collection names in the `Collections` const. Add every new collection there.
- Domain rules live in matching lib files (`src/lib/groupbuy.ts` for commerce). Header of `groupbuy.ts` states the invariant: **group buys never depend on errand trips** — the consolidated order is collected at a community pickup point automatically; `Trip.groupBuyId` is an optional convenience link only. Never make one flow require the other.
- Group-buy statuses: `open → confirmed → ready → completed` (or `cancelled`); participation money states: `pledged → paid → collected / refunded` (simulated escrow; real `Transaction` escrow belongs to the errand flow).
- `.env.example` is aspirational and stale: Firebase, MongoDB, and `DEMO_AUTH_MODE` have zero references in `src/`. Auth is a demo account switcher (`src/hooks/useAuth.tsx`); payments are simulated.

## Design system — `DESIGN.md` is authoritative for UI (app fully migrated)

**All routes now follow `DESIGN.md`** (Starbucks-inspired system), migrated 2026-10. Semantic CSS tokens in `src/app/globals.css` map to the palette (cream `--background` #f2f0eb, `--primary` #00754A CTA green, `--secondary`/`--muted` #edebe9, `--accent` #d4e9e2, foreground rgba(0,0,0,0.87), border rgba(0,0,0,0.08)); `h1–h3` render in Bricolage Grotesque globally, body stays Inter. Legacy classes are kept as aliases: `.gradient-primary` = flat CTA green fill, `.gradient-hero` = #1E3932 dark band, `.glass` = white + layered shadow (prefer the semantic tokens for new work). UI primitives are themed: `Button` is full-pill (`rounded-full` + `active:scale-[0.95]`), `Card` is 12px-radius white. Status accents: success green #00754A/#d4e9e2; gold #cba258 only for reward moments. When restyling anything, extend the DESIGN.md system — do not reintroduce gradients, glassmorphism, or the old oklch palette.

## Docs

- `PIVOT.md` — **read this first for the group-buy pivot**: idea, implemented scope, locked decisions, demo script, open gaps.
- `README.md` — positioning, routes table, group-buy lifecycle diagram, seeded demo state.
- `DESIGN.md` — visual system (authoritative for UI, see above).
- `TESTCASES.md` — manual QA matrix keyed by page/module.
- `CLAUDE.md` is just `@AGENTS.md` — edit this file only.
- This file is injected into agent sessions; keep the marked block above untouched.
