# 🌾 Krishi Sangam

**India's digital agricultural platform — connecting farmers with land leasing, equipment rental, farm labour, and produce markets.**

Krishi Sangam is a full-stack web application that helps farmers find trusted land to lease, rent farm equipment by the hour or day, hire skilled labour teams, and sell produce directly to verified buyers — cutting out intermediaries and expanding markets beyond local mandis.

---

## ✨ Features

- 🚜 **Land Leasing** — Browse & list farmland by season, month, or year with soil type, water source, and area filters
- ⚙️ **Equipment Rental** — Rent tractors, harvesters, sprayers & more (hourly/daily, with or without operator)
- 👷 **Labour Services** — Hire individual farm workers or book whole labour teams by skill level
- 🌱 **Produce Marketplace** — Sell crops with quantity, unit, and quality grade; buyers connect directly
- 📅 **Bookings** — Request, confirm, and track bookings with instant **optimistic UI** (book buttons respond immediately, revert on failure)
- 💬 **Messaging** — Direct buyer ↔ seller conversations tied to bookings
- 💰 **Payments (Escrow)** — Held → released / refunded payment ledger per booking
- 🛡️ **Admin Panel** — Approve/reject listings, manage users, view platform stats
- 📸 **Photo Uploads** — Upload listing images via drag & drop
- 📍 **Farm Location Picker** — "Use My Location" + interactive map pin
- 🗣️ **12 Indian Languages** — Full UI translation (English, हिन्दी, বাংলা, मराठी, తెలుగు, தமிழ், ગુજરાતી, اردو, ಕನ್ನಡ, ଓଡ଼ିଆ, മലയാളം, ਪੰਜਾਬੀ)
- 📱 **Mobile OTP Sign-up** — Phone verification (dev OTP returned in API response), with **live username availability check** as you type
- 🎨 **Modern React 19 UX** — Code-split pages with skeleton loaders, `useTransition` navigation with a top progress bar, `useDeferredValue` search, `useActionState` forms, `useOptimistic` actions, and a cinematic Ken Burns hero

---

## 🧰 Tech Stack

| Layer    | Technology |
| -------- | ---------- |
| Frontend | **React 19** + **Vite 5** (JavaScript/JSX) |
| Backend  | **Node.js** + **Express 4** |
| Database | **PostgreSQL 17** hosted on **Supabase** (via `pg` + a better-sqlite3-compatible facade) |
| Auth     | **JWT** (Bearer tokens, 7-day sessions) + **bcryptjs** password hashing |
| Uploads  | **Multer** (images stored in `server/uploads/`) |
| Other    | CORS, Google Fonts (Inter + Poppins), `dotenv` |

---

## 📁 Project Structure

```
krishi-sangam/
├── client/                  # React 19 frontend (Vite)
│   ├── index.html
│   ├── vite.config.js       # Port 5173, proxies /api & /uploads → :3001
│   └── src/
│       ├── main.jsx / App.jsx
│       ├── styles.css       # All styling (design tokens, animations)
│       ├── components/      # Navbar, AppRouter, PageLoader, ListingCard,
│       │                    # BookingCard, PhotoUpload, FarmLocationField…
│       ├── context/         # Auth, Nav, Toast providers
│       ├── data/            # services.js, locations.js
│       ├── i18n/            # LanguageContext + translations (12 languages)
│       ├── lib/api.js       # All API client helpers
│       └── pages/           # Home, LandLeasing, EquipmentRental, Labour,
│                            # Produce, Bookings, Messages, Payments, Profile,
│                            # Admin, SignIn, SignUp, About, Contact, Terms…
├── server/                  # Express backend
│   ├── server.js            # Entry point (port 3001)
│   ├── db.js                # pg Pool + better-sqlite3-compatible async facade
│   ├── sql/schema.sql       # Postgres DDL (run in Supabase SQL editor)
│   ├── migrate.js           # One-time SQLite → Postgres data migration
│   ├── seed.js              # Idempotent sample-data seeder
│   ├── .env.example         # Copy to .env, fill in DATABASE_URL + JWT_SECRET
│   ├── middleware/auth.js   # JWT auth middleware
│   └── routes/              # auth, land, equipment, labour, produce,
│                            # bookings, messages, payments, profile,
│                            # upload, admin, services
├── start.bat                # One-click launcher (Windows)
├── start.sh                 # One-click launcher (Git Bash / Linux / macOS)
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (includes `npm`) — [nodejs.org](https://nodejs.org)
- Git Bash (on Windows) for `start.sh`, or plain cmd for `start.bat`

### Option 1 — One-click launchers (easiest)

**Windows:**

```bat
start.bat
```

**Git Bash / Linux / macOS:**

```bash
./start.sh
```

These scripts install dependencies (if missing), start the API server and the Vite dev server, wait for the API to be healthy, and open the app in your browser.

### Option 2 — Manual setup

```bash
# 1. Backend
cd server
cp .env.example .env   # then edit .env with your Supabase DATABASE_URL + JWT_SECRET
npm install            # express, pg, dotenv, bcryptjs, jsonwebtoken, multer, cors
npm start              # → http://localhost:3001

# 2. Frontend (new terminal)
cd client
npm install          # react 19, react-dom, vite
npm run dev          # → http://localhost:5173
```

Then open **http://localhost:5173**.

> ⚙️ The Vite dev server proxies `/api` and `/uploads` to `http://localhost:3001`, so no CORS fiddling is needed in development.

> ⚙️ The Vite dev server proxies `/api` and `/uploads` to `http://localhost:3001`, so no CORS fiddling is needed in development.

---

## 🔌 Ports & URLs

| Service            | URL                                   |
| ------------------ | ------------------------------------- |
| Web app (dev)      | http://localhost:5173                 |
| API server         | http://localhost:3001                 |
| Health check       | http://localhost:3001/api/health      |
| Uploaded files     | http://localhost:3001/uploads/…       |

---

## 🔐 Authentication

- **Sign in** with your **username** (or email) + password — `POST /api/auth/signin`
- **Sign up** flow:
  1. `POST /api/auth/send-otp` — sends a 6-digit OTP to a 10-digit mobile number (dev: OTP is echoed back as `devOtp`)
  2. `POST /api/auth/verify-otp` — verifies the OTP
  3. `POST /api/auth/register` — creates the account with **username** (optional — auto-derived from name+phone if blank), email, and profile details
- **Live username availability** — `GET /api/auth/check-username?username=…` is polled (debounced) by the sign-up form while you type
- Sessions are JWT Bearer tokens stored in a `sessions` table (7-day expiry, cleaned up on server start). Every sign-in issues a unique token.

**Roles:** `farmer` (default), `owner`, `labourer`, `admin`.

---

## 🗄️ Database

Hosted **PostgreSQL on Supabase** (project region: Mumbai `ap-south-1`). The app connects through the IPv4 transaction pooler. Main tables:

- `users`, `sessions`, `otp_verifications`
- `land_listings`, `equipment_listings`, `labour_services`, `produce_listings`
- `bookings`, `service_bookings` (labour teams + agri services)
- `messages`, `payments` (escrow ledger), `reviews`

The schema lives in `server/sql/schema.sql` — paste it into the **Supabase SQL Editor** once when creating a new project (the server doesn't auto-create tables anymore).

**Migrating from the old SQLite DB** (one-time):

```bash
cd server
node migrate.js   # copies server/krishisetu.db → Supabase, preserving IDs & FKs
```

**Seed sample data** (idempotent — only runs when tables are empty):

```bash
cd server && node seed.js
```

This inserts ~3–4 approved demo listings per category and demo owner/farmer/worker accounts (`demo_landowner_ravi`, `demo_farmer_kiran`, …). Note: demo accounts use a placeholder hash and **cannot be signed into** — create a real account via the sign-up form to test auth.

### How the DB layer works

`server/db.js` exposes a **better-sqlite3-compatible facade** over a `pg` connection pool, so routes keep their familiar `db.prepare(sql).get()/all()/run()` API — just `async`/`await` now. It auto-translates SQLite syntax to Postgres: `datetime('now')` → `NOW()`, `LIKE` → `ILIKE` (case-insensitive search), `?` → `$1..$n`, and appends `RETURNING id` on INSERTs so `lastInsertRowid` still works.

---

## 📡 API Overview

All endpoints are under `/api`. Authenticated routes expect `Authorization: Bearer <token>`.

| Area     | Endpoints |
| -------- | --------- |
| **Auth** | `POST /auth/send-otp`, `POST /auth/verify-otp`, `POST /auth/register`, `POST /auth/signup`, `POST /auth/signin`, `POST /auth/signout`, `GET /auth/me`, `GET /auth/check-username` |
| **Land** | `GET/POST /land`, `GET /land/my`, `PUT/DELETE /land/:id` |
| **Equipment** | `GET/POST /equipment`, `GET /equipment/my`, `PUT/DELETE /equipment/:id` |
| **Labour** | `GET/POST /labour`, `GET /labour/my`, `PUT/DELETE /labour/:id` |
| **Produce** | `GET/POST /produce`, `GET /produce/my`, `PUT/DELETE /produce/:id` |
| **Bookings** | `GET /bookings`, `GET /bookings/incoming`, `POST /bookings`, `PUT/DELETE /bookings/:id` |
| **Messages** | `GET /messages`, `GET /messages/:userId`, `POST /messages`, `GET /messages/unread/count` |
| **Payments** | `GET /payments`, `POST /payments`, `PUT /payments/:id/release`, `PUT /payments/:id/refund` |
| **Profile** | `GET/PUT /profile`, `PUT /profile/password` |
| **Services** | `POST /services/book`, `GET /services/my`, `PUT /services/:id` |
| **Admin** | `GET /admin/stats`, `GET /admin/listings/pending`, `PUT /admin/approve/:type/:id`, `GET /admin/users`, `DELETE /admin/users/:id` |
| **Upload** | `POST /upload` (multipart `image`) |
| **Health** | `GET /health` |

---

## 📦 Production Build

```bash
cd client
npm run build     # outputs to client/dist
```

The Express server serves `client/dist` as static files and falls back to `index.html` for SPA routing, so a single server can host both the built app and the API. Serve the whole project from `server/`:

```bash
cd server && npm start   # serves API + built frontend on :3001
```

---

## 🧩 Frontend Highlights (React 19)

- **Code splitting** — every page is lazy-loaded (`React.lazy` + `Suspense`) behind a shimmering **skeleton loader** (`PageLoader`), shrinking the main bundle
- **`useTransition` navigation** — page switches are non-blocking, with an animated top **progress bar**
- **`useDeferredValue` search** — instant, responsive filtering on Land / Equipment / Produce pages
- **`useActionState`** — the Contact form uses React 19 form actions (uncontrolled inputs + `FormData`, auto-reset, pending spinner)
- **`useOptimistic`** — Bookings and listing **Book** buttons update instantly and revert automatically on failure
- **i18n** — one `t()` helper with interpolation powers all 12 languages; choice is persisted in `localStorage`
- All animations respect `prefers-reduced-motion`

---

## 🛠️ Useful Scripts

| Command                    | What it does                              |
| -------------------------- | ----------------------------------------- |
| `cd server && npm start`   | Start the API server on :3001             |
| `cd server && node seed.js`| Seed sample listings (idempotent)         |
| `cd server && node migrate.js` | One-time SQLite → Supabase migration  |
| `cd client && npm run dev` | Start the Vite dev server on :5173        |
| `cd client && npm run build` | Production build to `client/dist`       |
| `cd client && npm run preview` | Preview the production build          |

---

## 📄 License

Private project. All rights reserved.
