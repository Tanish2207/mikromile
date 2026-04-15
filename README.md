# MikroMile

Micro-errands for college communities. Post where you're heading, pick up requests from your hostel, earn rewards.

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
| Aman Sharma    | aman@vjti.ac.in  | Helper (has an active trip) |
| Priya Desai    | priya@vjti.ac.in | Requester                   |
| Rohit Patil    | rohit@vjti.ac.in | Requester                   |
| Sneha Kulkarni | sneha@vjti.ac.in | Requester                   |

## Tech Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS v4** + **shadcn/ui**
- **localStorage** as temporary database (easily swappable to MongoDB)
- **Zod** for validation (ready)
- **Socket.io** (installed, wiring pending)

## Pages

| Page          | Route            | Description               |
| ------------- | ---------------- | ------------------------- |
| Landing       | `/`              | Hero + how-it-works + CTA |
| Login         | `/login`         | Demo account picker       |
| Dashboard     | `/dashboard`     | Community feed + stats    |
| Create Trip   | `/trips/create`  | Post "going out" form     |
| Trip Details  | `/trips/[id]`    | View trip + request items |
| My Trips      | `/my-trips`      | Trips you created         |
| My Requests   | `/my-requests`   | Items you requested       |
| Notifications | `/notifications` | Real-time alerts          |
| Leaderboard   | `/leaderboard`   | Community rankings        |
| Profile       | `/profile`       | Your stats + rewards      |

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
- [ ] Rating modal after delivery
- [ ] Payment gateway integration
