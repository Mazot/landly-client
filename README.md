# 🌍 Landly Client

The web client for **Landly** — find diaspora-oriented organizations, businesses, embassies and helpers by **country corridor** (where you're *from* → where you're *heading*). React 18 + TypeScript SPA, talking to the `landly-server` REST API.

> **v2 UI.** The app is a corridor-first, map-centric experience built from a typed component library. All displayed data comes from the server; there is no hardcoded sample data.

## 🛠️ Tech Stack

| Area | Choice |
|---|---|
| Framework | React 18, TypeScript 5.7, Vite 6 |
| Routing | React Router v7 (lazy, code-split routes) |
| Server state | TanStack Query v5 |
| Client state | Zustand v5 (persisted to `localStorage`) |
| Maps | Mapbox GL 3 |
| Styling | Tailwind CSS 3.4 + design-token CSS variables |
| i18n | i18next + react-i18next — **EN / RU / UK** |
| HTTP | Axios (interceptors for JWT + 401 handling) |

## 📋 Prerequisites

- **Node.js 18+**
- **landly-server** running (default `http://localhost:8080`) — see the repo-root `OVERVIEW.md`
- A **Mapbox** public token for the live map

## 🚀 Quick Start

```bash
npm install
cp .env.example .env   # then fill in the values below
npm run dev            # http://localhost:5173
```

### Environment variables (`.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | yes | Backend base URL, proxied by Vite in dev (default `http://localhost:8080`) |
| `VITE_API_BASE_URL` | yes | Backend base URL used for OAuth redirects |
| `VITE_MAPBOX_TOKEN` | yes | Mapbox GL public token (map degrades gracefully if missing) |
| `VITE_GOOGLE_CLIENT_ID` | no | Google OAuth client ID |

## 📜 Scripts

```bash
npm run dev       # Vite dev server (port 5173, /api proxied to backend)
npm run build     # tsc --noEmit + vite production build
npm run preview   # preview the production build
npm run lint      # ESLint (flat config)
```

## 🧭 Routes

| Path | Page | Notes |
|---|---|---|
| `/` | Landing | Public; corridor quick-start + live map preview |
| `/map` | Map | Sidebar list + Mapbox + org quick-view panel (`?org=:id`) |
| `/org/:id` | Organization | Full page (about, photos, contacts, mini-map) |
| `/countries` | Countries | Active corridor + real country catalogue |
| `/saved` | Saved | Bookmarks by kind (orgs / people / countries / corridors) |
| `/signup`, `/signup/corridor` | Sign up | One-screen + corridor step |
| `/welcome` | First-run onboarding | Post-signup |
| `/login`, `/profile` | Auth | `/profile` is protected |

All v2 pages are full-screen and render their own `TopBar`; there is no shared layout wrapper.

## 📁 Project Structure

```text
src/
├── components/
│   ├── ui/                # Design-system primitives (see below)
│   ├── map/               # LandlyMap, MapControls, FiltersSheet, CorridorSwitcher, OrgCompactPanel
│   ├── auth/              # ProtectedRoute
│   └── organizations/     # Legacy create-modal + gallery
├── hooks/
│   ├── useCorridor.ts     # Resolves corridor (country ids) → Country objects, lazy default
│   ├── useDisplayOrgs.ts  # useDisplayOrgs / useDisplayOrg — server orgs → display shape
│   ├── useOrganizations / useReferences / useImages / useAuth
│   ├── useToggleSet.ts    # Set state with toggle/has/reset
│   └── useClickOutside.ts # Popover dismissal
├── lib/
│   ├── displayOrg.ts      # toDisplayOrg() mapper + initials
│   ├── orgTypes.ts        # type → colour/key metadata, orgTypeKeyFromString()
│   ├── countries.ts       # flagOf / countryLabel helpers (over server Country)
│   ├── cn.ts              # classname joiner
│   └── axios.ts           # Axios instance
├── stores/
│   ├── corridorStore.ts   # { fromId, toId } country ids, persisted
│   ├── savedStore.ts      # saved bookmarks, persisted
│   └── authStore.ts       # JWT + user
├── services/              # API call layer (do not call axios from components)
├── i18n/                  # i18next config + en/ru/uk locales
├── types/api.ts           # API contract types (match server presenters)
├── App.tsx                # Lazy routes + Suspense + ErrorBoundary
├── main.tsx               # Providers (QueryClient, Router)
└── index.css              # Tokens (CSS vars) + l-* utility classes
```

## 🧱 Component Library (`components/ui/`)

**Primitives** — `Button` (variant `primary|accent|ghost`, size `sm|md|lg`, `iconButton`, `fullWidth`, polymorphic `href`), `Pill`, `Chip`, `Badge`, `TextField`, `SearchInput`, `Avatar`, `CountryPill`, `Icon`, `Logo`.

**Composites** — `TopBar`, `CorridorBubble`, `CorridorPicker`, `ColoredTypeRail`, `FlagPair`, `InfoRow`, `SectionHeading`, `OrgHeroCover`, `AuthSplitLayout`, `ErrorBoundary` / `ErrorScreen` / `PageFallback`.

Prefer these over re-inlining styles. They compose the `l-*` style classes defined in `index.css` (`l-btn`, `l-pill`, `l-input`, `l-card`, `l-label`, `l-display`, `l-hairline`, `l-scroll`).

## 🎨 Design Tokens

Tokens are defined **once per concern** and mirrored where the platform requires it:

- **CSS custom properties** in `index.css` (`--accent`, `--ink-1`, `--surface`, radii, shadows, fonts…) — the runtime source used by inline styles and the `l-*` classes.
- **Tailwind theme** in `tailwind.config.ts` (same hex values) — enables utility classes and opacity modifiers (`bg-ink-1/28`).
- Fonts: **Manrope** (sans) + **Instrument Serif** (display) via Google Fonts in `index.html`.

## 🔌 Server Integration

- The client renders **server data only**. `useDisplayOrgs` fetches `/api/organisation/list` (filtered by the corridor's destination country) and maps each `Organization` through `toDisplayOrg()` using the org-type (`/api/common/org_types`) and country (`/api/common/countries`) references. Photos come from `/api/images/list/{id}`.
- **Corridor** = a pair of server country ids in `corridorStore`; `useCorridor` resolves them to `Country` objects and lazily defaults to Russia → Germany (or the first two countries).
- **Saved** bookmarks are client-side (`savedStore`, `localStorage`) — the backend has no `/api/saved`.
- Fields the schema doesn't have (rating, hours, "verified", org languages…) are omitted from the UI rather than faked.
- API calls live in `services/*` and flow through the Axios instance (`lib/axios.ts`), which attaches the JWT and redirects to `/login` on 401.

## ⚡ Performance & Resilience

- **Route-level code splitting** — every page is `React.lazy`-loaded behind `<Suspense>`, so a route only ships the code it needs.
- **Vendor chunking** (`vite.config.ts` `manualChunks`) — `mapbox-gl` (~1.7 MB) is isolated into its own long-cached chunk and loads only on map-bearing routes; `react-vendor` and `query` split out too.
- **Error boundary** — `ErrorBoundary` wraps the router with a branded `ErrorScreen` fallback so a render crash never blanks the app.

## 🌐 Dev Proxy

Vite proxies `/api/*` → `VITE_API_URL` (default `http://localhost:8080`), so the client calls `/api/...` with no CORS setup in development.

## 🌍 Internationalisation

Locale files: `src/i18n/locales/{en,ru,uk}/translation.json`. Use `const { t } = useTranslation()`; **EN is the source of truth** — add a key to all three files. Language is detected from `localStorage` → `navigator` and persisted.

## 📄 License

MIT.
