# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Type-check without emitting
npx tsc --noEmit

# Lint (ESLint v9 flat config)
npm run lint

# Production build
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Copy `.env.example` to `.env` and fill in values:

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | no | Backend origin without `/api` (e.g. `http://localhost:8080`); also the Vite proxy target. Empty = same origin |
| `VITE_GOOGLE_MAPS_API_KEY` | yes | Google Maps Platform browser key (Maps JavaScript API + Places API (New)), referrer-restricted |
| `VITE_GOOGLE_MAPS_MAP_ID` | no | Map ID for `<AdvancedMarker>` / cloud styling; defaults to `DEMO_MAP_ID` (dev only) |

Everything `VITE_*` ends up in the public bundle — never put server secrets here (`GOOGLE_PLACES_API_KEY`, `GOOGLE_CLIENT_SECRET`, `JWT_SECRET`, S3 keys). The server's `FRONTEND_ORIGIN` must equal this client's origin.

## Status

Screens and visual components were deleted with the old design; `App.tsx` has no routes yet. The data layer is complete and mirrors the current landly-server. Translation files still hold the old screens' copy.

## Architecture

React 18 + TypeScript + Vite SPA with Tailwind CSS.

### Stack

- **Routing** — `react-router-dom` v7
- **Server state** — `@tanstack/react-query` v5 (keys in `src/lib/queryKeys.ts`)
- **Client state** — `zustand`: `authStore` (JWT + user, persisted in `localStorage`), `corridorStore` (guest corridor; signed-in users use server corridors)
- **HTTP client** — `axios` instance in `src/lib/axios.ts`
- **Map** — Google Maps Platform via `@vis.gl/react-google-maps`; `<APIProvider>` is mounted in `main.tsx`, config and helpers in `src/lib/maps.ts`
- **i18n** — `i18next` + `react-i18next` + `i18next-browser-languagedetector`; languages `en`, `ru`, `uk` (same as the server's `Locale`), files in `src/i18n/locales/{en,ru,uk}/translation.json`

### Directory structure

```
src/
├── types/api/          # server contracts — one file per server feature + index.ts
├── services/           # <feature>.service.ts — one API object per server feature
├── hooks/              # use<Feature>.ts — React Query hooks; usePlaceDetails (Google Places)
├── lib/                # axios, queryKeys, maps, errors, dates, query
├── stores/             # authStore, corridorStore
├── i18n/
├── App.tsx             # routes
└── main.tsx            # providers
```

### API contracts (`src/types/api`)

Source of truth is the server's OpenAPI spec (`/api-docs/openapi.json`; per-feature `ApiDoc` in `landly-server/src/app/features/<feature>/mod.rs`). Keep the types in step with it:

- Request bodies and query params are **snake_case**, response payloads **camelCase**.
- A server `Option` field is always sent, as `null` → type it `T | null`. Only fields the server skips when empty are `?:` (`Organisation.distanceKm`, `Organisation.community`, `Person.email`, `Person.whatsapp`).
- Enum-like strings are `as const` arrays + a union type (`ORGANISATION_STATUSES` / `OrganisationStatus`, …), mirroring the server's `TEXT` + `CHECK` columns.
- List endpoints answer `ListResponse<T>` = `{ items, total }`; `total` is the size of this page, not of the table. `GET /common/countries` and `/common/org_types` answer plain arrays.
- Timestamps are UTC without a zone (`ServerDateTime`) — parse with `parseServerDateTime`.
- Array query params are sent comma-separated (`toQueryString`, the axios `paramsSerializer`).
- Errors: `{ error, constraint?, details? }`, or a plain string for 500/400/429 — read them with `lib/errors.ts`.

### Authentication

`authStore` keeps the JWT in `localStorage`; the axios request interceptor adds `Authorization: Bearer`. A 401 on a request that carried the token clears the session (no redirect — screens decide). The user id is never sent in bodies: the server takes it from the token.

Google sign-in is a top-level navigation to `GOOGLE_LOGIN_URL`; the server redirects back to `GOOGLE_CALLBACK_PATH` (`/auth/google/callback?code=…`), where `useGoogleExchange` trades the single-use code for the session. It needs Redis on the server.

### Google Maps

Google's terms: only `google_place_id` (and a refreshable point) is stored server-side. Hours, photos and Google ratings are fetched live with `usePlaceDetails(googlePlaceId)` — request only the fields a screen renders (they decide the billed SKU), show them on a Google map with attribution, never send them to the server. When creating a place from Places Autocomplete use `placeToOrganisationLocation`; for map search use `boundsToSearchBox` (it widens viewports crossing the antimeridian, the server filters longitude with a plain BETWEEN).

### Path alias

`@/` maps to `src/` (configured in both `vite.config.ts` and `tsconfig.json`).

### API proxy

In development, Vite proxies `/api/*` to `VITE_API_URL` (default `http://localhost:8080`). Note that the axios base URL is `VITE_API_URL` itself, so with it set requests go to the server directly and its CORS (`FRONTEND_ORIGIN`) applies.

### Adding a new page

1. Create the component in `src/pages/`
2. Add a `<Route>` in `src/App.tsx`
3. Add translation keys to all three locale files
4. Gate it on `useAuthStore` / `useMe().data?.role` if it needs auth or a role

### Adding a new endpoint

1. Add/adjust the types in `src/types/api/<feature>.ts`
2. Add the call to `src/services/<feature>.service.ts`
3. Add a hook in `src/hooks/use<Feature>.ts` (keys in `src/lib/queryKeys.ts`; invalidate the feature root on writes)

### Adding a new translation key

1. Add the key to `src/i18n/locales/en/translation.json` (English — source of truth)
2. Add the same key to `src/i18n/locales/ru/translation.json` (Russian)
3. Add the same key to `src/i18n/locales/uk/translation.json` (Ukrainian)
4. Use `const { t } = useTranslation()` in the component

## ESLint

The project uses ESLint v9 with a flat config (`eslint.config.js`).

Rules enforced:

- `@typescript-eslint/recommended` — strict TypeScript checks
- `react-hooks/recommended` — rules of hooks
- `react-refresh/only-export-components` — fast-refresh compatibility
- `@typescript-eslint/consistent-type-imports` — enforce `import type` for type-only imports
- `@typescript-eslint/no-explicit-any` — warn on `any` usage
- `@typescript-eslint/no-unused-vars` — error (args prefixed with `_` are ignored)
