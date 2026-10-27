# MikroMile

Community commerce & convenience for college hostels. Two pillars:
**Group Buy** — pool demand, unlock bulk prices from local stores, collect together at a pickup point.
**Community Errands** — get items bought or collected by someone already going out.

## Quick Start

```bash
cd app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo Accounts

No authentication needed — pick a demo account on the login page:

| Name           | Email            | Role                        |
| -------------- | ---------------- | --------------------------- |
| Tanish Bhamare | tanish@vjti.ac.in | Helper + noodles group buy organizer |
| Gaurav Gaur    | gaurav@vjti.ac.in | Requester (can create new group buys) |
| Daksh Gohil    | daksh@vjti.ac.in  | Requester                   |
| Khushbu Chaudhari | khushbu@vjti.ac.in | Requester                |

## Tech Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS v4** + **shadcn/ui**
- **localStorage** as temporary database (easily swappable to MongoDB)
- **Zod** for validation (ready)
- **Socket.io** (installed, wiring pending)

## Pages

| Page          | Route            | Description                          |
| ------------- | ---------------- | ------------------------------------ |
| Landing       | `/`              | Two pillars + how-it-works + CTA     |
| Login         | `/login`         | Demo account picker                  |
| Dashboard     | `/dashboard`     | Community feed, trips + group buys   |
| Group Buys    | `/group-buy`     | Live deals feed + progress meters    |
| New Group Buy | `/group-buy/create` | Pooled order setup form           |
| Deal Details  | `/group-buy/[id]`| Pledge, track unlock, coordinate pickup |
| Create Trip   | `/trips/create`  | Post "going out" form (+ optional group-order link) |
| Trip Details  | `/trips/[id]`    | View trip + request items            |
| My Trips      | `/my-trips`      | Trips you created                    |
| My Requests   | `/my-requests`   | Items you requested                  |
| Notifications | `/notifications` | Alerts (trips + group buys)          |
| Leaderboard   | `/leaderboard`   | Community rankings                   |
| Profile       | `/profile`       | Your stats + rewards                 |

## Group Buy Lifecycle

```
open ──min reached──▶ confirmed ──store packs──▶ ready ──all collected──▶ completed
  │                                                                │
  └────deadline missed──▶ cancelled (all pledges refunded) ◀────────┘ (organizer cancel)
```

**Design rule — the two transaction flows are independent.** A group buy NEVER
waits for a helper trip: the consolidated order is collected at a community
pickup point automatically. Optionally, a helper heading to that store attaches
their trip (`Trip.groupBuyId`) so participants can piggyback on it — pure
convenience, never a dependency.

## Seeded Demo State

- 🔓 **Diet Coke** deal — OPEN at 8/20 cans pledged by Tanish (₹60 → ₹50 @ 20 cans). Pledge 12 more and watch the meter unlock.
- 🎉 **Maggi cases** deal — READY for pickup at "Hostel Gate A". Tanish's active trip is attached as the errand bridge.
- No COMPLETED deals are pre-seeded — create your own via **Create Group Buy** (e.g. a COMPLETED one to populate "Past Deals"). Existing browsers re-seed automatically (seed key `mikromile_seeded_v5`).

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
```

## Future Enhancements

- [ ] MongoDB/Mongoose integration
- [ ] Firebase/Clerk authentication
- [ ] Socket.io real-time push
- [ ] Google Maps pin-drop for meeting points
- [ ] Rating modal after delivery and after group buys
- [ ] Payment gateway integration (real escrow)
- [ ] Store partner portal (deals + order management)
