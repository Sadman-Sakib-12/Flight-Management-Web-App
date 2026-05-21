# ✈️ FlightX — Flight Management Web App (PWA)

A full-stack flight booking application built with Next.js 14, Supabase, Zustand, and Tailwind CSS.

## 🚀 Live Demo

> Deployed on Vercel: [https://flightx-app.vercel.app](https://flightx-app.vercel.app) *(update after deploy)*

---

## 🧪 Test Account

| Field    | Value              |
|----------|--------------------|
| Email    | test@flightx.com   |
| Password | Test@1234          |

> Create this user in your Supabase Auth dashboard or via the signup page.

---

## 🛠️ Tech Stack

| Layer         | Technology                        |
|---------------|-----------------------------------|
| Frontend      | Next.js 14 (App Router)           |
| Database      | Supabase (PostgreSQL)             |
| Auth          | Supabase Auth                     |
| Realtime      | Supabase Realtime                 |
| State         | Zustand + persist middleware      |
| Styling       | Tailwind CSS                      |
| PWA           | next-pwa                          |
| Language      | TypeScript (strict, no `any`)     |

---

## 📦 Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/flightx.git
cd flightx
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run **only this one file** (it contains everything):
   - `supabase/migrations/005_refresh_flight_dates.sql` ← **Run this**
   
   > This single file drops and recreates all tables, RLS policies, RPC functions, and seeds fresh flight data with future dates. The individual migration files (001–004) are kept for reference.

3. Enable **Realtime** for the `seats` table:
   - Supabase Dashboard → Database → Replication → enable `seats` table

### 5. Generate PWA Icons

Icons are already pre-generated in `/public/icons/`. If you need to regenerate:

```bash
node scripts/generate-icons.js
```

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🗄️ Database Schema

### Tables

| Table        | Description                                      |
|--------------|--------------------------------------------------|
| `flights`    | Flight schedules with origin, destination, price |
| `seats`      | Seat map per flight with class and availability  |
| `bookings`   | User bookings with PNR code and status           |
| `passengers` | Passenger details linked to bookings             |
| `reschedules`| Reschedule history with fee tracking             |

### RLS Policies

- **flights** & **seats**: Public read access (anyone can search)
- **bookings**: Users can only read/write their own bookings (`auth.uid() = user_id`)
- **passengers**: Accessible only through owned bookings
- **reschedules**: Accessible only through owned bookings

### RPC Functions

| Function           | Description                                                    |
|--------------------|----------------------------------------------------------------|
| `reserve_seat`     | Atomically reserves a seat + creates booking (advisory lock)   |
| `cancel_booking`   | Atomically cancels booking + frees seat (enforces 2hr rule)    |
| `reschedule_booking` | Swaps flight/seat atomically, charges price difference fee   |

### DB Trigger

`enforce_cancellation_window` — fires `BEFORE UPDATE` on `bookings`. Raises an exception if a cancellation is attempted within 2 hours of departure.

---

## 🏪 Zustand Store Structure

### `useFlightStore` (persisted, sensitive fields excluded)

```typescript
{
  searchQuery: SearchQuery | null,       // persisted
  searchResults: Flight[],               // NOT persisted (fetched fresh)
  selectedFlight: Flight | null,         // persisted
  selectedSeat: Seat | null,             // persisted
  bookingStep: BookingStep,              // persisted
  passengerFormData: PassengerFormData,  // persisted (passport_no excluded via type)
  optimisticSeatId: string | null,       // NOT persisted
}
```

**`partialize` config** excludes `searchResults` and `optimisticSeatId` from localStorage. The `PassengerFormData` type stored in the store already excludes `passport_no` — it is only held in local component state during form submission and never written to the store.

### `useUserStore` (persisted, minimal data)

```typescript
{
  session: Session | null,        // NOT persisted (full session object)
  sessionToken: string | null,    // persisted (only the access token)
  cachedBookings: Booking[],      // persisted (for offline access)
}
```

**`partialize` config** only persists `sessionToken` and `cachedBookings`. The full session object (which contains sensitive user metadata) is not written to localStorage.

### Reset Actions

- `useFlightStore.resetBooking()` — clears flight/seat/step/passenger data. Called after booking confirmation or cancellation.
- `useFlightStore.resetAll()` — full reset including search query. Called on logout.
- `useUserStore.resetUser()` — clears session, token, and cached bookings. Called on logout.

---

## ✨ Features

### Task 01 — Flight Search & Booking
- Search by origin, destination, date, passenger count, and class
- Server-side flight fetching (no key exposure beyond anon key)
- Seat availability validated via `reserve_seat` RPC before booking
- PNR code generated and displayed on confirmation page

### Task 02 — Interactive Seat Map
- Visual cabin grid with row × column layout
- Color-coded: available (green), selected (blue), occupied (red)
- First class / Business / Economy zones with tab switching
- Supabase Realtime subscription — live seat updates without refresh
- Hover tooltips showing class and extra fee
- Scrollable, touch-friendly on mobile

### Task 03 — Reschedule & Cancellation
- My Bookings page with status badges
- Reschedule modal: pick alternative flight on same route, fee charged if more expensive
- Cancel via `cancel_booking` RPC (atomic seat release)
- 2-hour cancellation rule enforced at DB level via trigger
- Confirmation dialogs before destructive actions

### Task 04 — Zustand Store
- `useFlightStore` with `partialize` excluding sensitive/transient fields
- `useUserStore` persisting only session token
- Optimistic seat selection before Supabase write confirms
- Reset actions on cancellation and logout

### Task 05 — PWA (Bonus)
- `manifest.json` with name, icons, theme color, `display: standalone`
- `StaleWhileRevalidate` for flight search API calls
- `CacheFirst` for static assets
- Offline fallback page at `/offline`
- My Bookings cached for offline reading
- Install prompt banner for first-time mobile visitors

---

## 📁 Project Structure

```
src/
├── app/
│   ├── auth/login/          # Login page
│   ├── auth/signup/         # Signup page
│   ├── bookings/            # My Bookings + Confirmation
│   ├── flights/             # Search results + Seat map + Booking form
│   ├── offline/             # PWA offline fallback
│   ├── layout.tsx           # Root layout with Navbar
│   └── page.tsx             # Home / Search page
├── components/
│   ├── bookings/            # BookingsList, RescheduleModal
│   ├── flights/             # FlightResults, Skeleton
│   ├── layout/              # Navbar
│   ├── pwa/                 # InstallPrompt
│   ├── search/              # FlightSearchForm
│   ├── seats/               # SeatMapClient
│   └── ui/                  # ConfirmDialog
├── lib/
│   ├── supabase/            # client.ts, server.ts, middleware.ts
│   └── utils.ts             # Helpers (format, cn, generatePNR)
├── store/
│   ├── useFlightStore.ts    # Flight booking state
│   └── useUserStore.ts      # Auth + cached bookings
├── types/
│   └── index.ts             # All TypeScript types
└── middleware.ts             # Supabase session refresh
supabase/
└── migrations/
    ├── 001_initial_schema.sql
    ├── 002_rls_policies.sql
    ├── 003_rpc_functions.sql
    └── 004_seed_data.sql
```

---

## 🔐 Security Notes

- Only `NEXT_PUBLIC_SUPABASE_ANON_KEY` is exposed to the client
- `SUPABASE_SERVICE_ROLE_KEY` is server-side only
- RLS policies ensure users can only access their own data
- Passport numbers are never stored in Zustand/localStorage
- All destructive DB operations go through `SECURITY DEFINER` RPC functions

---

## ⚠️ Trade-offs & What I'd Do Differently

1. **Payment**: Integrated a mock payment flow. In production, I'd integrate Stripe with proper webhook handling.
2. **Multi-passenger**: Currently supports 1 passenger per booking. Multi-passenger would require looping seat selection and passenger forms.
3. **Email notifications**: Would add Supabase Edge Functions to send booking confirmation emails.
4. **Testing**: Would add Playwright E2E tests for the booking flow and Jest unit tests for utility functions.
5. **Icons**: PWA icons need to be generated from the SVG — added instructions in `/public/icons/generate-icons.md`.

---

## 📸 Lighthouse PWA Score

> *(Run Lighthouse audit on the deployed Vercel URL and add screenshot here)*
>
> Target: ≥ 90 PWA score. The app is configured with:
> - Valid `manifest.json` with 192×192 and 512×512 icons
> - Service Worker via `next-pwa` with `StaleWhileRevalidate` + `CacheFirst` strategies
> - Offline fallback page at `/offline`
> - `display: standalone` for installable PWA experience

---

## ✅ Submission Checklist

- [x] Public GitHub repository with descriptive commit history
- [x] `.env.example` with all Supabase environment variables listed
- [x] Supabase migration SQL files in `/supabase/migrations`
- [x] Seed script with flights, seats, and a test user account (credentials in README)
- [x] README with local setup steps, Supabase project config, and Zustand store explanation
- [ ] Deployed preview link (Vercel) — deploy with `npm run build && vercel`
- [x] PWA icons generated (192×192 and 512×512 in `/public/icons/`)
- [ ] Lighthouse PWA screenshot — run after Vercel deploy

```
feat: initial Next.js 14 project setup with Tailwind and TypeScript
feat: add Supabase schema migrations (flights, seats, bookings, passengers, reschedules)
feat: add RLS policies for all tables
feat: add RPC functions (reserve_seat, cancel_booking, reschedule_booking)
feat: add DB trigger for 2-hour cancellation enforcement
feat: add seed data with 8 flights across 4 routes
feat: implement flight search page with origin/destination/date filters
feat: implement flight results page with server-side data fetching
feat: implement interactive seat map with Realtime subscription
feat: implement booking form with passenger details collection
feat: implement booking confirmation page with PNR display
feat: implement My Bookings page with status badges
feat: implement reschedule modal with alternative flight selection
feat: implement cancel booking with confirmation dialog
feat: add Zustand stores (useFlightStore, useUserStore) with persist
feat: configure next-pwa with manifest and cache strategies
feat: add offline fallback page
feat: add PWA install prompt banner
feat: add auth pages (login, signup)
docs: add README with setup instructions and store documentation
```
