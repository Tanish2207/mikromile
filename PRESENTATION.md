# MikroMile — Demo Presentation

> Deck for the live demo of **MikroMile** (9 slides).
> Narrative spine: one number repeated until it sticks — **₹60 → ₹45**.
> Tone: confident, concrete, zero exaggeration.

| # | Slide | Purpose |
| - | ----- | ------- |
| 1 | Buy Together. Move Together. | Title + hook |
| 2 | Three Everyday Scenes | Ideation — where the idea came from |
| 3 | One Big Buyer, Not 500 Small Ones | The unlock — the idea itself |
| 4 | One Community, Two Ways to Save | The product — two pillars |
| 5 | Commerce Never Depends on Kindness | Design rule — independence |
| 6 | The Trust Machine | Lifecycle + money states |
| 7 | What's Inside the App | Feature tour (visual-only) |
| 8 | From ₹60 to ₹45 in Three Minutes | Live demo screen |
| 9 | Real / Simulated / Next | Honest scope + closing |

---

## Slide 1 — Title: "MikroMile — Buy Together. Move Together."

**On screen:**

- Group Buying + Community Errands for campus hostels
- One-line pitch: *"Your hostel already has the demand. We just pool it."*
- Names, roll numbers, course, assignment label

**Visual:** Clean hero slide, cream background with the app's green (`#00754A`), one product screenshot or just the logo. Nothing else.

---

## Slide 2 — The Idea Started With Three Everyday Scenes

**On screen:**

- 🚶 Every student walks to the same few shops, alone, and pays full price every time
- 📝 Small quantities mean no negotiating power — a notebook is ₹60 today, ₹60 tomorrow
- 💬 *"Anyone going out? Get me X please…"* — a request that dies in a WhatsApp group by evening

**Visual:** Three simple illustrated panels (or everyday hostel photos). Keep icons, skip long text.

**Presenter notes:**

> "We didn't invent a problem — we just observed hostel life for a week. These three scenes are the same problem in disguise: campus demand is enormous, but it's spent one student at a time."

---

## Slide 3 — The Unlock: A Hostel Is One Big Buyer, Not 500 Small Ones

**On screen:**

- Pool the demand of a whole wing → one large order → bulk prices from local stores
- **The math:** 50 students × ₹60 notebook = ₹3,000 spent. One pooled order of 50 @ ₹45 = ₹750 saved. Same notebooks.
- The order lands at a hostel pickup point — one trip, not fifty

**Visual:** Simple diagram — 50 dots flowing into 1 arrow → store, with a big **₹60 → ₹45** stamp. This is the slide the teacher should remember; give it the most design effort.

---

## Slide 4 — One Community, Two Ways to Save

**On screen:**

- **Group Buy** — someone posts a deal (product, store, deal price, minimum quantity, deadline). Students pledge their quantity. When the meter hits the minimum, the deal is confirmed with the store, packed, and collected at a campus pickup point. The organizer earns reward points for running it.
- **Community Errands** — someone posts *"I'm going out anyway"*; others request items to be picked up. Money is held in escrow until delivered; helpers earn points and ratings.

**Visual:** Two columns with one screenshot each. Bottom strip: *shared engine — accounts, stores, rewards, ratings, notifications.*

**Presenter notes:**

> "Same community, same trust system, two transaction types. Which raises a design question…"

---

## Slide 5 — One Hard Design Rule: Commerce Never Depends on Kindness

**On screen:**

- ✅ A group buy **completes on its own** — collect at the community pickup point, zero errands required
- ✅ Errands are **optional piggybacking**: a helper can attach their trip — *"I'm collecting the group order at 5 PM, I'll drop your share at the hostel gate"*
- ❌ Never: a pooled order stuck waiting for a random stranger to accept a delivery

**Visual:** Two paths — solid line (pickup point) vs. dashed line (trip helper), with the word **"Optional"** on the dashed one.

**Presenter notes:**

> If the teacher asks how you know it works: **TC-41** — a dedicated test case proving a deal completes with zero trips.

---

## Slide 6 — The Trust Machine: Pledge → Pay → Collect, or Refund

**On screen:**

- Lifecycle: **Open → Confirmed → Ready → Completed** — or **Cancelled**
- Money states: **pledged → paid → collected**, or **refunded**
- Minimum met at deadline → auto-confirm. Minimum missed → auto-cancel, everyone refunded
- No participant can lose money on a half-formed deal — escrow behavior built into the lifecycle itself

**Visual:** Redraw the README lifecycle arrows as a clean horizontal flow with a red refund branch. The refund branch is what makes it credible — give it equal visual weight.

---

## Slide 7 — What's Inside the App

**On screen (keep it thin):**

- 13 routes, one design system: landing, dashboard, group-buy feed with live progress meters, deal creation with price validation, trip posting with an **interactive map + place search** (OpenStreetMap)
- Notifications for every event, community **leaderboard**, profile with rewards
- **48 manual QA scenarios** documented (TESTCASES.md) — every feature has a written expected behavior

**Visual:** Screenshot collage — dashboard, deal page with the 8/20 progress meter, trip map with the pin. Do **not** list routes as text; screenshots carry this slide.

---

## Slide 8 — Live Demo: From ₹60 to ₹45 in Three Minutes

*(Leave this slide on screen during the demo.)*

**Run list:**

1. **Join** an open deal — pledge into the Diet Coke meter (8/20 → unlocked)
2. **Run** a deal as organizer — second account pledges → Confirm with store → Mark Ready → Collect → **+2 reward points per unit**
3. **Bridge** — Tanish's trip carries the noodle order to hostel gate *(the Optional badge)*
4. **Prove independence** — the deal completes with no trip attached
5. (If time) **Refund path** — a deal that misses its minimum; everyone refunded

**Visual:** Just the numbered list, big. No screenshots — the real app is next to it.

---

## Slide 9 — What's Real, What's Simulated, What's Next

**On screen:**

- **Real now:** full group-buy + errand lifecycles, maps, rewards, notifications, 48-case QA matrix
- **Deliberately simulated:** money (no payment gateway), auth (demo accounts), storage (localStorage — a typed layer built to swap to MongoDB)
- **Next:** store-partner portal (shops post their own deals), real escrow + payments, real-time updates, ratings on group buys

**Visual:** Three small columns with ✅ / 🔬 / 🚀 icons.

**Closing line (bottom of slide):**

> **"MikroMile — the hostel as one buyer."**

---

## Delivery Notes

- **Mirror your app's look:** cream background (`#f2f0eb`), green `#00754A` accents, Bricolage Grotesque headings — the deck then feels like an extension of the product, which subtly says "design thought went into both."
- **Spend the design effort on Slides 3, 5, 6** — those carry the ideation and the systems thinking; Slides 7–8 are mostly screenshots and patience.
- **Don't narrate features the demo will show.** Slides 4–6 are for understanding *why* it works; the demo on Slide 8 proves it *does*. Saying less there makes the live part land harder.
