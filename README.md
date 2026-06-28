# Landly Client

The web client for **Landly** — find diaspora-oriented organizations, businesses, embassies and helpers by **country corridor** (where you're *from* → where you're *heading*). React 18 + TypeScript SPA, talking to the `landly-server` REST API.

> **v2 UI.** Corridor-first, map-centric experience built from a typed component library and a shared layout system. User-facing text is fully externalized via i18n — no hardcoded strings in components.

## Tech Stack

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

## Prerequisites

- **Node.js 18+**
- **landly-server** running (default `http://localhost:8080`) — see repo-root `OVERVIEW.md`
- A **Mapbox** public token for the live map

## Quick Start

```bash
npm install
cp .env.example .env   # fill in the values below
npm run dev            # http://localhost:5173
```

### Environment variables (`.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | yes | Backend base URL, proxied by Vite in dev (default `http://localhost:8080`) |
| `VITE_API_BASE_URL` | yes | Backend base URL used for OAuth redirects |
| `VITE_MAPBOX_TOKEN` | yes | Mapbox GL public token (map degrades gracefully if missing) |
| `VITE_GOOGLE_CLIENT_ID` | no | Google OAuth client ID |
| `VITE_MOCK_API` | no | Set `true` to enable Vite middleware mock API (dev only) |

## Scripts

```bash
npm run dev       # Vite dev server (port 5173, /api proxied to backend)
npm run build     # tsc --noEmit + vite production build
npm run preview   # preview the production build
npm run lint      # ESLint (flat config)
```

## Routes

| Path | Page | Notes |
|---|---|---|
| `/` | Landing | Public; corridor quick-start + live map preview |
| `/map` | Map | Sidebar list + Mapbox + org quick-view panel (`?org=:id`) |
| `/org/:id` | Organization | Full page — about, photos, contacts, mini-map |
| `/countries` | Countries | Active corridor + real country catalogue |
| `/saved` | Saved | Bookmarks by kind (orgs / people / countries / corridors) |
| `/account` | Account | Profile, my orgs, my people, corridors — requires auth |
| `/messages` | Messages | Conversation inbox |
| `/messages/:id` | Thread | Full message thread |
| `/signup`, `/signup/corridor` | Sign up | One-screen + corridor step |
| `/welcome` | First-run onboarding | Post-signup |
| `/login`, `/profile` | Auth | `/profile` is protected |

## Project Structure

```text
src/
├── layouts/
│   ├── AppShell.tsx           # Outer page shell: 100dvh flex-col + TopBar + footer + MobileBottomNav
│   ├── StickySection.tsx      # Non-scrolling header zone (profile strip, tab bar, filter bar)
│   └── TwoColumnLayout.tsx    # Responsive 1→2 col grid for detail pages (md:300px xl:380px)
├── components/
│   ├── ui/                    # Design-system primitives — see Component Library below
│   ├── mobile/
│   │   └── MobileBottomNav.tsx  # 4-tab bottom nav (md:hidden)
│   ├── map/                   # LandlyMap, MapControls, FiltersSheet, CorridorSwitcher, OrgCompactPanel
│   ├── auth/                  # ProtectedRoute
│   └── organizations/         # Legacy create-modal + gallery
├── hooks/
│   ├── useCorridor.ts         # Resolves corridor (country ids) → Country objects, lazy default
│   ├── useDisplayOrgs.ts      # Server orgs → display shape
│   ├── useOrganizations / useReferences / useImages / useAuth
│   ├── useToggleSet.ts        # Set state with toggle/has/reset
│   └── useClickOutside.ts     # Popover dismissal
├── lib/
│   ├── displayOrg.ts          # toDisplayOrg() mapper + initials
│   ├── orgTypes.ts            # type → colour/key metadata, orgTypeKeyFromString()
│   ├── countries.ts           # flagOf / countryLabel helpers
│   ├── cn.ts                  # classname joiner
│   └── axios.ts               # Axios instance
├── stores/
│   ├── corridorStore.ts       # { fromId, toId } country ids, persisted
│   ├── savedStore.ts          # saved bookmarks, persisted
│   └── authStore.ts           # JWT + user; use clearAuth() not logout()
├── services/                  # API call layer (do not call axios from components)
├── i18n/                      # i18next config + en/ru/uk locales
├── types/api.ts               # API contract types (match server presenters)
├── App.tsx                    # Lazy routes + Suspense + ErrorBoundary
├── main.tsx                   # Providers (QueryClient, Router)
└── index.css                  # Tokens (CSS vars) + l-* utility classes
```

## Layout System

Pages are composed from layout primitives in `src/layouts/` — never raw `div`s for structural concerns:

```tsx
// Full-height page with TopBar + bottom nav
<AppShell showBottomNav>
  <StickySection>          {/* profile strip, tab bar, etc. */}
  </StickySection>
  <ScrollArea padding="16px">
    {/* scrollable content */}
  </ScrollArea>
</AppShell>

// Thread/detail: no TopBar, composer pinned to bottom
<AppShell showTopBar={false} showBottomNav={false} footer={<MessageComposer />}>
  <NavHeader onBack={...} title="..." />
  <ScrollArea>...</ScrollArea>
</AppShell>

// Responsive 2-column detail page
<TwoColumnLayout sidebar={<ContactCard />}>
  <OrgBody />
</TwoColumnLayout>
```

## Component Library (`components/ui/`)

**Primitives** — `Button` (`primary|accent|ghost`, `sm|md|lg`, `iconButton`, `fullWidth`, polymorphic `href`), `Pill`, `Chip`, `Badge`, `TextField`, `SearchInput`, `Avatar`, `CountryPill`, `Icon`, `Logo`.

**Content components** — `Divider`, `DividerWithText`, `TabBar`, `InfoBox` (`accent|warning|neutral`), `ConversationRow`, `MessageBubble`, `MessageComposer`, `DateSeparator`.

**Header / navigation** — `TopBar`, `PageHeader` (display-title + trailing slot), `NavHeader` (back + leading + title/subtitle + trailing).

**Scroll / layout helpers** — `ScrollArea` (`flex:1 overflow-y:auto` zone).

**Composites** — `CorridorBubble`, `CorridorPicker`, `ColoredTypeRail`, `FlagPair`, `InfoRow`, `SectionHeading`, `OrgHeroCover`, `AuthSplitLayout`, `ErrorBoundary` / `ErrorScreen` / `PageFallback`.

Use these over raw `div` + inline styles. They compose the `l-*` classes defined in `index.css` (`l-btn`, `l-pill`, `l-input`, `l-card`, `l-label`, `l-display`, `l-hairline`, `l-scroll`).

## Responsive Breakpoints

Mobile-first Tailwind — default styles target mobile, then layer up:

| Breakpoint | Width | Target |
|---|---|---|
| (default) | < 390px | Mobile |
| `sm:` | ≥ 390px | Mobile (standard) |
| `md:` | ≥ 834px | Tablet |
| `xl:` | ≥ 1280px | Desktop |
| `2xl:` | ≥ 1440px | Wide desktop |

Use `100dvh` (not `100vh`) for full-height layouts on mobile.

## Design Tokens

Tokens are defined once and mirrored where the platform requires it:

- **CSS custom properties** in `index.css` (`--accent`, `--ink-1`, `--surface`, radii, shadows, fonts…) — the runtime source used by inline styles and `l-*` classes.
- **Tailwind theme** in `tailwind.config.ts` (same hex values) — enables utility classes and opacity modifiers (`bg-ink-1/28`).
- Fonts: **Manrope** (sans) + **Instrument Serif** (display) via Google Fonts in `index.html`.

## Internationalisation

Locale files: `src/i18n/locales/{en,ru,uk}/translation.json`. Use `const { t } = useTranslation()`; **EN is the source of truth** — add a key to all three files when adding text. Language is detected from `localStorage` → `navigator` and persisted.

ESLint rule `i18next/no-literal-string` (warn) catches raw string literals in JSX markup before they slip in.

## Server Integration

- `useDisplayOrgs` fetches `/api/organisation/list` filtered by the corridor's destination country and maps each `Organization` through `toDisplayOrg()` using org-type and country references.
- **Corridor** = a pair of server country ids in `corridorStore`; `useCorridor` resolves them to `Country` objects and lazily defaults to Russia → Germany.
- **Saved** bookmarks are client-side (`savedStore`, `localStorage`) — the backend has no `/api/saved`.
- API calls live in `services/*` and flow through the Axios instance (`lib/axios.ts`), which attaches the JWT and redirects to `/login` on 401.

## Performance & Resilience

- **Route-level code splitting** — every page is `React.lazy`-loaded behind `<Suspense>`.
- **Vendor chunking** (`vite.config.ts` `manualChunks`) — `mapbox-gl` (~1.7 MB) in its own long-cached chunk; `react-vendor` and `query` split out too.
- **Error boundary** — `ErrorBoundary` wraps the router with a branded `ErrorScreen` fallback.

## Dev Proxy

Vite proxies `/api/*` → `VITE_API_URL` (default `http://localhost:8080`) — no CORS setup needed in development.

## License

MIT.
