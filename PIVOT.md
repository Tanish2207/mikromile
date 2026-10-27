# MikroMile Pivot — Group Buy (context for future sessions)

> Read this file to get full context on the pivot currently under implementation.
> Code references are exact paths; claims here are verified against the codebase as of the pivot build
> (Noodles-only seed v3; create your own deals while demoing). See `README.md` for commands, `AGENTS.md` for repo conventions.

## 1. The pivot in one paragraph

MikroMile started as a community **errands** app (post a "going out" trip, pick up requests, deliver, earn
rewards — the Assignment 2 prototype described in `MDM Assgn 2 - MikroMile (1).pdf`). It is pivoting to a
**community commerce & convenience network**: collect the hostel's demand, consolidate it, and unlock bulk
prices from local stores — while running the errands pillar on the same shared infrastructure
(college communities · local stores · payments · rewards · ratings · pickup locations).

## 2. The two pillars (positioning)

- **Group Buy** — combine demand, unlock bulk discounts, purchase together. Example from the pitch:
  a notebook costs ₹60 individually; a stationery store offers ₹45 if the order has at least 50 notebooks.
- **Community Errands** — get items bought or collected by someone already heading out (the original MVP).
- **Hard rule (verified in `src/lib/groupbuy.ts` header):** the two transaction types are **distinct**.
  A group buy NEVER depends on a random helper accepting an errand — it must complete even with zero trips.
  Errands optionally *help*: a helper can attach their trip to a group buy ("I'm collecting the
  MikroMile order at 5 PM, can bring your items to the hostel gate"), which is pure piggyback, never gating.

## 3. What is implemented (exact locations)

### Data model — `src/types/index.ts`
- `Store` — partner shop (name, category, address).
- `GroupBuy` — pooled deal: `organizerId` (community member as coordinator), `storeId`, product,
  `individualPrice` vs `dealPrice`, `minQuantity` to unlock, optional `maxQuantity`, `deadline`,
  `pickupLocation`, `pickupTime` (set when ready), lifecycle timestamps.
- `Participation` — a student's stake: quantity + money state.
- `Trip.groupBuyId?` — optional errand→commerce bridge. `NotificationType` extended with
  `group_buy_new` / `group_buy_update`; `Notification.relatedGroupBuyId?` added.

### Persistence — `src/lib/db.ts` + `src/lib/seed.ts`
- Collections: `STORES`, `GROUP_BUYS`, `PARTICIPATIONS` (localStorage, prefix `mikromile_`).
- Seed key bumped to `mikromile_seeded_v2` (browsers reseed automatically; earlier local data is wiped).

### Domain logic — `src/lib/groupbuy.ts`
- Lifecycle: `open → confirmed → ready → completed`, or `cancelled`.
- Participation money states: `pledged → paid → collected`, or `refunded` (simulated escrow — keeps group-buy
  money cleanly separate from the errand flow's `held_in_escrow` `Transaction`s).
- `processDeadlines()` on page mount: deadline with minimum met → **auto-confirm**; below minimum →
  **auto-cancel + refund all**. (Only runs when pages load — there is no cron/server timer; also intentional.)
- `confirmGroupBuy()` charges all pledges (simulated escrow); `markReady()` publishes pickup info;
  `collect()` marks shares picked up; when all shares are collected the deal **completes** and the organizer
  earns **+2 reward points per unit** (goes through the same `REWARDS` collection / leaderboard as errands).
- `pledge()` supports join + adjust; `withdrawPledge()` refunds while still `open`;
  `cancelGroupBuy()` is the organizer's manual cancel-with-refund.

### Pages — `src/app/group-buy/*`
- `/group-buy` — feed grouped by lifecycle (Accepting Pledges / Ready for Pickup / Order Confirmed /
  Past Deals) + community savings strip (units committed, ₹ saved).
- `/group-buy/create` — deal setup: product, unit, store (existing partner or inline "add new store"),
  individual vs deal price, min/max quantity, deadline (default +3 days), pickup location. Validates deal
  price < individual price; notifies the community (`group_buy_new`).
- `/group-buy/[id]` — deal header (₹60→₹45 comparison, % saving, countdown), demand-pool progress meter,
  pledge/adjust/withdraw form, participants list with per-user status, **Coordinator Panel** (confirm /
  mark ready + pickup time / cancel), "Your Share" card with "I've Collected It", and the **Errand Trips
  Carrying This Order** section (lists active `trip.groupBuyId` trips, explicitly badged *Optional*).

### Integration points in existing UI
- `Navbar` — "Group Buy" desktop + mobile links (Boxes icon).
- `Dashboard` (`src/app/dashboard/page.tsx`) — "Group Buys" strip (4 latest deals), dual CTA
  (Group Buy / Post a Trip); calls `processDeadlines()` so deadline resolution also happens on dashboard load.
- `TripCard` — violet chip "Carrying group order: {product}" when `trip.groupBuyId` is set.
- `src/app/trips/create/page.tsx` — optional "Carrying a MikroMile Group Order?" select listing the
  community's `confirmed`/`ready` deals; sets `groupBuyId` on the new trip.
- `StatusBadge` — statuses `open/confirmed/ready` (group buy) and `pledged/paid/collected/refunded`
  (participations) render with distinct colors.
- `src/app/notifications/page.tsx` — group-buy icons + "View" deep link to `/group-buy/:id`.
- `src/app/page.tsx` (landing) — repositioned as "Community Commerce & Convenience": hero, two-pillar
  section, "Group Buy met Community Errands" story block, shared-infrastructure chips, updated footer tagline.

### Test/QA coverage
- `TESTCASES.md` rows TC-28…TC-43 cover: feed sections, creation validation, pledge adjust/withdraw,
  confirm charges pledges, mark-ready + pickup info, collect, completion rewards, auto-confirm/auto-cancel
  on deadline (via localStorage deadline edits), trip-carrying chip, **TC-41: group buy completes with no
  trip attached**, dashboard strip, group-buy notifications.

## 4. Decisions locked in (do not silently change)

1. **Self-sufficiency invariant** — see §2. TC-41 guards it.
2. **Organizer = coordinator role** — any community member can run a deal (prototype stand-in for MikroMile
   ops; a dedicated store-partner portal is future work).
3. **Simulated money** — escrow is simulated at participation level; no payment gateway, no server.
4. **Explicit confirm is preferred over silent auto-confirm for the organizer demo path** — auto-confirm only
   fires on deadline pass; the coordinator panel's confirm button is the visible "MikroMile coordinates" step.
5. **Completeer rewards** — organizer gets +2 points/unit on full distribution (leaderboard integration).
6. **Seed demo state** (`seed.ts`, key v5): an OPEN Diet Coke deal (8/20, Tanish's opening pledge — join-to-unlock
   demo) and a READY noodles deal with Tanish's active trip attached (errand-bridge demo). No completed deal
   is seeded: demo the savings/history section by driving a deal through the lifecycle live.
7. **Design**: UI must migrate toward `DESIGN.md` (Starbucks-inspired system) when pages are touched —
   see the authoritative-design section in `AGENTS.md`.

## 5. Demo script (assignments/presentations)

1. Landing page → "Community Commerce & Convenience" positioning.
2. Login as any seeded account (no auth). Dashboard shows Group Buys + Trips side by side.
3. **Join flow**: as Tanish, create an OPEN deal via "Create Group Buy" (e.g. ₹60 → ₹45, min 50, pick Sharma
    Book Depot) → pledge ~50 as a second account → meter unlocks → as the organizer, "Confirm Order with
    Store" (pledges → Paid, participants notified).
4. **Ready + collect flow**: as organizer, "Mark Ready for Pickup" with a time → participants get notified →
   "I've Collected It" → last collector completes the deal → organizer earns +2/unit (check Profile rewards).
5. **Errand bridge**: Tanish's seeded trip carries the noodles order (chip on TripCard, trip listed on the deal
   page). Show the deal still works with no trip (TC-41) — the independence story.
6. **Refund path (optional)**: create a deal with min 500, let the deadline pass → auto-cancel + refunds +
   cancellation notifications.

## 6. Known gaps / next steps (not yet built)

- No real-time push: deadlines resolve only when a page loads; no Socket.io (installed but unwired).
- No store-partner portal (stores are name/address records; deals are entered by the coordinator side).
- No ratings after pickup; no real payment gateway (escrow is simulated); no MongoDB (localStorage only).
- Single community seed only (invite-code flows / multi-community group buys untested).
- **The whole app is migrated to the DESIGN.md system** (2026-10): cream canvas, flat CTA-green fills, pill
  buttons, Bricolage Grotesque headings (`h1–h3` mapped in `globals.css`), Starbucks status-green accents.
  Legacy classes `.gradient-primary`/`.gradient-hero`/`.glass` remain as themed aliases for compatibility.
- Documents feeding this pivot keep: `README.md` (lifecycle diagram), `TESTCASES.md` (QA matrix),
  `AGENTS.md` (repo conventions), `DESIGN.md` (target visual system).
