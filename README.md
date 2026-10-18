# 🌍 Landly Client

React client for Landly — a map of businesses, helpers, communities and official representatives for people who moved to another country.

> **Status:** the old screens and UI components were removed together with the old design. What remains is the data layer — typed contracts of every landly-server endpoint, API services, React Query hooks, stores — and the Google Maps setup. Screens are rebuilt on top of it.

## 🛠️ Stack

- **React 18** + **TypeScript** + **Vite**
- **TanStack Query** — server state; **Zustand** — client state (session, guest corridor)
- **Axios** — HTTP client (`src/lib/axios.ts`)
- **React Router** — routing
- **Google Maps Platform** via [`@vis.gl/react-google-maps`](https://visgl.github.io/react-google-maps/) — map, markers, Places
- **i18next** — `en`, `ru`, `uk`
- **Tailwind CSS** + design tokens in `src/index.css`

## 📋 Prerequisites

- Node.js 18+
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
├── lib/
│   ├── axios.ts    # client: base URL, Bearer token, comma-separated query arrays
│   ├── queryKeys.ts
│   ├── maps.ts     # Google Maps config + bbox/marker/place helpers
│   ├── errors.ts   # landly-server error bodies
│   ├── dates.ts    # server timestamps (UTC without a zone)
│   └── query.ts
├── stores/         # authStore (JWT session), corridorStore (guest corridor)
├── i18n/
├── App.tsx         # routes (empty until screens are rebuilt)
└── main.tsx        # providers: React Query, Google Maps APIProvider, Router
```

## 🔌 API

Contracts follow the server's OpenAPI spec (`http://localhost:8080/api-docs/openapi.json`, UI at `/scalar`): request bodies and query strings are `snake_case`, responses `camelCase`; list endpoints answer `{ items, total }`, where `total` is the size of this page.

## 🗺️ Google Maps

The server stores only a place's `google_place_id` and a refreshable copy of its point. Hours, photos and the Google rating are fetched live in the browser (`usePlaceDetails`) and must be shown on a Google map with Google's attribution — never send them to the server.

## 🎯 Scripts

```bash
npm run dev       # dev server
npm run build     # tsc + production build
npm run lint      # ESLint
npm run preview   # preview the build
```
