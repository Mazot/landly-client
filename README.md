# 🌍 Landly Client

[![CI](https://github.com/Mazot/landly-client/actions/workflows/ci.yml/badge.svg)](https://github.com/Mazot/landly-client/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/Mazot/landly-client/branch/master/graph/badge.svg)](https://codecov.io/gh/Mazot/landly-client)

React client for Landly — a map of businesses, helpers, communities and official representatives for people who moved to another country.

> **Status:** the old screens were removed together with the old design. In place: the data layer — typed contracts of every landly-server endpoint, API services, React Query hooks, stores — the Google Maps setup, and the new design system in `src/components/ui`. Screens are rebuilt on top of them.

## 🛠️ Stack

- **React 19** + **TypeScript 6** + **Vite 8**
- **TanStack Query** — server state; **Zustand** — client state (session, guest corridor)
- **Axios** — HTTP client (`src/lib/axios.ts`)
- **React Router** — routing
- **Google Maps Platform** via [`@vis.gl/react-google-maps`](https://visgl.github.io/react-google-maps/) — map, markers, Places
- **i18next** — `en`, `ru`, `uk`
- **Tailwind CSS** + design system in `src/components/ui` (tokens in `tokens/tokens.ts`, see [its README](src/components/ui/README.md)), browsable in **Storybook**

## 📋 Prerequisites

- Node.js 22.13+ or 24 (24 recommended, used in CI) — Vite 8 and ESLint 10 need 20.19+/22.13+, Vitest 5 needs 22.12+/24
- [landly-server](../landly-server) on `http://localhost:8080` with `FRONTEND_ORIGIN=http://localhost:5173`
- A Google Maps Platform browser key (Maps JavaScript API + Places API (New))

## 🚀 Quick start

```bash
npm install
cp .env.example .env   # then fill in the values
npm run dev            # http://localhost:5173
```

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | no | Backend origin without `/api`, e.g. `http://localhost:8080`. Empty = same origin (the Vite proxy forwards `/api/*`) |
| `VITE_GOOGLE_MAPS_API_KEY` | yes | Browser key, restricted by HTTP referrer. Never the server's `GOOGLE_PLACES_API_KEY` |
| `VITE_GOOGLE_MAPS_MAP_ID` | no | Map ID for Advanced Markers / cloud styling; `DEMO_MAP_ID` when unset (dev only) |

Shared with the server: `VITE_API_URL` must point to the server, and the server's `FRONTEND_ORIGIN` must be this client's origin (CORS + the Google sign-in redirect).

## 📁 Structure

```text
src/
├── types/api/      # landly-server contracts, one file per server feature
├── services/       # one API object per server feature (all endpoints)
├── hooks/          # React Query hooks over the services + usePlaceDetails (Google)
├── components/ui/  # design system: tokens, components, constants, `ui` i18n namespace
├── lib/
│   ├── axios.ts        # client: base URL, Bearer token, comma-separated query arrays
│   ├── queryClient.ts  # the app's React Query client
│   ├── session.ts      # startSession / endSession (also clear the query cache)
│   ├── queryKeys.ts
│   ├── invalidation.ts # refresh country/corridor place counts
│   ├── maps.ts         # Google Maps config + bbox/marker/place helpers
│   ├── errors.ts       # landly-server error bodies
│   ├── dates.ts        # server timestamps (UTC without a zone)
│   └── query.ts
├── stores/         # authStore (JWT session), corridorStore (guest corridor)
├── i18n/
├── test/           # test helpers (MSW server, factories, render helpers, setup)
├── App.tsx         # routes (empty until screens are rebuilt)
└── main.tsx        # providers: React Query, Google Maps APIProvider, Router
```

## 🔌 API

Contracts follow the server's OpenAPI spec (`http://localhost:8080/api-docs/openapi.json`, UI at `/scalar`): request bodies and query strings are `snake_case`, responses `camelCase`; list endpoints answer `{ items, total }`, where `total` is the size of this page.

## 🗺️ Google Maps

The server stores only a place's `google_place_id` and a refreshable copy of its point. Hours, photos and the Google rating are fetched live in the browser (`usePlaceDetails`) and must be shown on a Google map with Google's attribution — never send them to the server.

## 🧪 Tests

[Vitest](https://vitest.dev/) in jsdom, no backend needed: requests go through the real axios client and are answered by [MSW](https://mswjs.io/) handlers; hooks are rendered with Testing Library's `renderHook`.

```bash
npm test               # run once
npm run test:watch     # watch mode
npm run coverage       # + v8 coverage → coverage/ (lcov, html, summary)
node .claude/skills/test-after-change/changed-coverage.mjs   # after coverage: files changed since origin/master must be at 100%
```

New or changed code is tested right after it is written — the workflow (what to test per layer, regression check, the gate) is the `test-after-change` skill in `.claude/skills/`.

- Tests live next to the code as `*.test.ts(x)`; shared helpers are in `src/test/` — `server.ts` (MSW server, `capture()` records a request and answers it), `factories.ts` (typed server payloads), `render.tsx` (`renderQueryHook`, `runMutation`, `seed`, `isInvalidated`).
- An unhandled request fails the test; session, `localStorage` and the query cache are reset after every test (`src/test/setup.ts`).
- `src/types/api/contract.test.ts` pins the enum values and limits shared with the server — update both sides together.

CI (`.github/workflows/ci.yml`, Node 24) runs lint, type-check + build, and the tests with coverage uploaded to [Codecov](https://app.codecov.io/gh/Mazot/landly-client) (`codecov.yml`, same settings as landly-server).

## 🎯 Scripts

```bash
npm run dev          # dev server
npm run build        # tsc + production build
npm run lint         # ESLint
npm test             # Vitest
npm run coverage     # Vitest + coverage
npm run storybook    # design-system catalogue on http://localhost:6006
npm run build-storybook  # static Storybook → storybook-static/ (also in CI)
npm run preview      # preview the build
```
