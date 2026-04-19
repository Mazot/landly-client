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
# or directly:
npx eslint src

# Production build
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Copy `.env.example` to `.env` and fill in values:

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | yes | Backend base URL (proxied by Vite dev server) |
| `VITE_API_BASE_URL` | yes | Backend base URL for OAuth redirects |
| `VITE_MAPBOX_TOKEN` | yes | Mapbox GL JS public token |
| `VITE_GOOGLE_CLIENT_ID` | no | Google OAuth client ID |

## Architecture

React 18 + TypeScript + Vite SPA with Tailwind CSS.

### Stack

- **Routing** — `react-router-dom` v7 (`BrowserRouter`, nested `<Route>`)
- **Server state** — `@tanstack/react-query` v5 (queries, mutations, infinite scroll)
- **Client state** — `zustand` (auth store)
- **HTTP client** — `axios` (instance in `src/lib/axios.ts` with base URL and auth interceptors)
- **Map** — `mapbox-gl` v3 via `MapView` component
- **i18n** — `i18next` + `react-i18next` + `i18next-browser-languagedetector`
  - Supported languages: **English** (`en`), **Russian** (`ru`), **Ukrainian** (`uk`)
  - Translation files: `src/i18n/locales/{en,ru,uk}/translation.json`
  - Language is persisted to `localStorage`; falls back to `en`

### Directory structure

```
src/
├── i18n/               # i18next config + locale JSON files
│   ├── index.ts        # i18n initialisation (imported in main.tsx)
│   └── locales/
│       ├── en/translation.json
│       ├── ru/translation.json
│       └── uk/translation.json
├── components/
│   ├── auth/           # ProtectedRoute
│   ├── layout/         # Header, Footer, Layout
│   ├── map/            # MapView (Mapbox GL)
│   ├── organizations/  # OrganizationCard
│   └── ui/             # SearchableSelect (with infinite scroll)
├── hooks/
│   ├── useAuth.ts      # login / signup / logout mutations
│   ├── useOrganizations.ts  # org list + single org queries
│   └── useReferences.ts     # countries (infinite), org types
├── lib/
│   └── axios.ts        # Axios instance
├── pages/
│   ├── auth/           # LoginPage, SignupPage
│   ├── HomePage.tsx
│   ├── OrganizationsPage.tsx
│   ├── OrganizationDetailPage.tsx
│   └── ProfilePage.tsx
├── services/           # API call functions (called by hooks)
├── stores/
│   └── authStore.ts    # Zustand auth store (user, token, isAuthenticated)
└── types/
    └── api.ts          # TypeScript interfaces for all API entities
```

### Path alias

`@/` maps to `src/` (configured in both `vite.config.ts` and `tsconfig.json`).

### API proxy

In development, Vite proxies `/api/*` requests to `VITE_API_URL` (default `http://localhost:8080`), so no CORS issues during local development.

### Authentication

`authStore` holds the JWT token in memory and writes it to `localStorage`. The Axios instance reads the token from the store and attaches it as a `Bearer` header on every request. `ProtectedRoute` redirects unauthenticated users to `/login`.

### Adding a new page

1. Create the component in `src/pages/`
2. Add a `<Route>` in `src/App.tsx`
3. Add translation keys to all three locale files
4. Wrap with `<ProtectedRoute>` if auth is required

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
