# Habit Tracker PWA

A mobile-first Progressive Web App for tracking daily habits, built with Next.js App Router, TypeScript, Tailwind CSS, and localStorage persistence.

---

## Project Overview

Habit Tracker allows users to:
- Sign up, log in, and log out (local auth — no remote service)
- Create, edit, and delete habits
- Mark habits complete for today and unmark them
- See a live current streak count per habit
- Have all data persist across page reloads
- Install the app as a PWA and use a cached app shell offline

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm 9+

### Install dependencies
```bash
npm install
```

### Install Playwright browsers
```bash
npx playwright install chromium
```

---

## Run Instructions

### Development
```bash
npm run dev
```

### Production build
```bash
npm run build
npm run start
```

---

## Test Instructions

### All tests
```bash
npm test
```

### Unit tests only
```bash
npm run test:unit
```

### Integration tests only
```bash
npm run test:integration
```

### E2E tests only
```bash
npm run test:e2e
```

---

## Local Persistence Structure

All data is stored in localStorage under three fixed keys:

| Key | Shape | Purpose |
|---|---|---|
| `habit-tracker-users` | `User[]` | Registered user accounts |
| `habit-tracker-session` | `Session` or `null` | Active logged-in session |
| `habit-tracker-habits` | `Habit[]` | All habits across all users |

On dashboard load, habits are filtered by `userId` from the active session so users only see their own habits.

---

## PWA Support

The app registers `/public/sw.js` from the client via a `ServiceWorkerRegistration` component.

The service worker:
- **Install**: caches the app shell routes
- **Activate**: purges stale caches
- **Fetch**: serves cache first, falls back to network, falls back to `/` when offline

`/public/manifest.json` declares name, display mode, theme color, start URL, and icons at 192×192 and 512×512.

---

## Trade-offs and Limitations

- Passwords stored as plaintext in localStorage — acceptable for local demo, not for production
- Sessions are client-only — protected routes use a client-side guard, not middleware
- Only `daily` frequency is implemented as required by the spec
- No cross-device sync — data is per-browser localStorage

---

---

## Mapping to Technical Requirements Document

| TRD Section | Requirement | Implementation |
|---|---|---|
| Section 4 — Routes | `/`, `/login`, `/signup`, `/dashboard` | `src/app/page.tsx`, `src/app/login/page.tsx`, `src/app/signup/page.tsx`, `src/app/dashboard/page.tsx` |
| Section 4 — Route behavior | Splash screen on `/`, redirects based on session | `src/app/page.tsx` — 1200ms delay then checks session |
| Section 4 — Protected route | `/dashboard` redirects to `/login` if no session | `src/components/shared/ProtectedRoute.tsx` |
| Section 5 — Persistence | localStorage with three required keys | `src/lib/storage.ts`, `src/lib/constants.ts` |
| Section 8 — Types | `User`, `Session`, `Habit` types | `src/types/auth.ts`, `src/types/habit.ts` |
| Section 9 — Utilities | `getHabitSlug`, `validateHabitName`, `calculateCurrentStreak`, `toggleHabitCompletion` | `src/lib/slug.ts`, `src/lib/validators.ts`, `src/lib/streaks.ts`, `src/lib/habits.ts` |
| Section 10 — UI Contract | All required `data-testid` attributes | All component files in `src/components/` |
| Section 11 — Auth behavior | Signup, login, logout with exact error messages | `src/lib/auth.ts`, `src/components/auth/` |
| Section 12 — Habit behavior | Create, edit, delete, complete with confirmation | `src/app/dashboard/page.tsx`, `src/components/habits/` |
| Section 13 — PWA | manifest.json, sw.js, icons, SW registration | `public/manifest.json`, `public/sw.js`, `public/icons/`, `src/components/shared/ServiceWorkerRegistration.tsx` |
| Section 16 — Tests | All required test files with exact titles | `tests/unit/`, `tests/integration/`, `tests/e2e/` |
| Section 17 — Coverage | 80% line coverage for `src/lib` | 85.71% achieved — verified with `npm run test:unit` |
| Section 18 — Scripts | All 7 required package scripts | `package.json` |

---

## Test File Map

| Test file | Behavior verified |
|---|---|
| `tests/unit/slug.test.ts` | `getHabitSlug` — slug generation from habit names |
| `tests/unit/validators.test.ts` | `validateHabitName` — empty, too long, valid/trimmed |
| `tests/unit/streaks.test.ts` | `calculateCurrentStreak` — empty, today missing, consecutive, duplicates, gaps |
| `tests/unit/habits.test.ts` | `toggleHabitCompletion` — add, remove, immutability, no duplicates |
| `tests/integration/auth-flow.test.tsx` | SignupForm and LoginForm — success, error states, session creation |
| `tests/integration/habit-form.test.tsx` | HabitForm and HabitCard — validation, create, edit, delete confirmation, streak toggle |
| `tests/e2e/app.spec.ts` | Full user journeys — splash, auth, CRUD, streak, persistence, logout, offline |