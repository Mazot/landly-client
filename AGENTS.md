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

# Lint (ESLint v10 flat config)
npm run lint

# Production build
npm run build

# Tests (Vitest, jsdom + MSW — no backend needed)
npm test

# Tests in watch mode
npm run test:watch

# Tests + v8 coverage (coverage/, lcov for Codecov)
npm run coverage

# Run one test file / tests matching a name
npx vitest run src/hooks/useCommon.test.tsx -t "pages by 50"

# Preview production build
npm run preview
```

Node.js 22.13+ or 24 (CI uses 24): Vitest 5 needs `^22.12 || ^24`.

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

## Documentation is part of every change

**Every code change includes checking and updating the `.md` files.** Before you finish (and before any commit), go through every Markdown file in the repo and update whatever the change made stale — a doc that disagrees with the code is a bug.

Files and what usually affects them:

| File | Update when you change |
|---|---|
| `AGENTS.md` | architecture, directory layout, conventions, auth/session flow, env vars, commands, stack |
| `README.md` | setup, env vars, scripts, structure, features, how to run |
| `.claude/skills/library-first/SKILL.md` | dependencies (added/removed/bumped packages, APIs now used), project helpers in `src/lib` |
| `.claude/skills/design-system/SKILL.md` | tokens (`tailwind.config.ts`, `src/index.css`), DS components / `src/components/ui`, breakpoints, layout patterns, verification steps |
| `.claude/skills/test-after-change/SKILL.md` | test helpers in `src/test/`, test layout per layer, test/coverage commands, `vite.config.ts` → `test.coverage` excludes (mirrored in `changed-coverage.mjs`) |
| `.env.example` (not Markdown, same rule) | any `import.meta.env.VITE_*` added, renamed or removed |

How:

1. List them (tracked and new): `git ls-files --cached --others --exclude-standard '*.md'`.
2. Grep the docs for every name you renamed, moved or removed (files, functions, hooks, env vars, routes, packages) — no stale references may remain.
3. New behaviour, convention or file a future reader needs → document it in the matching file in the same change.
4. Say in your final message which `.md` files you updated — or that you checked them and none needed changes.

## Library-first (skill `library-first`)

Before writing code, follow `.claude/skills/library-first/SKILL.md`: use the functions the installed libraries and `src/lib` already provide (listed there, verified against the installed versions), re-check an API against the installed version before using it, and for new functionality install an npm package — TanStack first, versions at least 14 days old — instead of writing it. Keep its lists in sync when dependencies change.

## UI: design system, mobile-first (skill `design-system`)

For anything visible, follow `.claude/skills/design-system/SKILL.md`: screens are composed only of design-system components (`src/components/ui/`, inventory in its `index.ts`) and tokens (`tailwind.config.ts` + `src/index.css`); never duplicate an existing component — extend it with a variant; phone layout is the base and `md`/`lg` adapt it; and every UI change is verified in the browser at phone (375, 320) and desktop (1440) sizes with screenshots and `.claude/skills/design-system/layout-check.js` before it is called done.

## Test every change (skill `test-after-change`)

After writing or changing any code in `src/`, follow `.claude/skills/test-after-change/SKILL.md` before calling it done: add tests for the behaviour in the layer's test file (contract pins, the services table, hook tests, lib/store tests, component tests), prove they fail without the change (bug fixes: regression test first), then pass the gate — `npm test`, `npm run coverage` + `node .claude/skills/test-after-change/changed-coverage.mjs` (every changed source file at 100%), `npm run lint`, `npm run build` — and report what was tested and anything left unverified.

## Architecture

React 19 + TypeScript 6 + Vite 8 SPA with Tailwind CSS 4.

TypeScript is pinned to `~6.0` (typescript-eslint supports only `<6.1`). TS 6 loads no `@types/*` globals implicitly — global type packages are listed in `compilerOptions.types` (`google.maps`), and `paths` work without `baseUrl`.

### Stack

- **Routing** — `react-router-dom` v7
- **Server state** — `@tanstack/react-query` v5 (keys in `src/lib/queryKeys.ts`)
- **Client state** — `zustand`: `authStore` (JWT + user, persisted in `localStorage`), `corridorStore` (guest corridor; signed-in users use server corridors)
- **HTTP client** — `axios` instance in `src/lib/axios.ts`
- **Map** — Google Maps Platform via `@vis.gl/react-google-maps`; `<APIProvider>` is mounted in `main.tsx`, config and helpers in `src/lib/maps.ts`
- **Styling** — Tailwind CSS v4 via `@tailwindcss/vite` (no PostCSS config); design tokens live in `tailwind.config.ts`, loaded with `@config` from `src/index.css`, and are mirrored as CSS variables there. v4 defaults differ from v3: `border` is `currentColor`, `hover:` applies only on hover-capable devices
- **i18n** — `i18next` + `react-i18next` + `i18next-browser-languagedetector`; languages `en`, `ru`, `uk` (same as the server's `Locale`), files in `src/i18n/locales/{en,ru,uk}/translation.json`

### Directory structure

```
src/
├── types/api/          # server contracts — one file per server feature + index.ts
├── services/           # <feature>.service.ts — one API object per server feature
├── hooks/              # use<Feature>.ts — React Query hooks; usePlaceDetails (Google Places)
├── lib/                # axios, queryClient, session, queryKeys, invalidation, maps, errors, dates, query
├── stores/             # authStore, corridorStore
├── i18n/
├── test/               # test-only helpers: MSW server, factories, render helpers, setup
├── App.tsx             # routes
└── main.tsx            # providers
```

Tests sit next to the code they cover as `*.test.ts(x)`.

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

`authStore` keeps the JWT in `localStorage`; the axios request interceptor adds `Authorization: Bearer`. Sessions start and end only through `lib/session.ts` (`startSession` / `endSession`), which also clears the React Query cache (`lib/queryClient.ts`) — disabled queries would otherwise keep serving the previous account's data. A 401 on a request that carried the token calls `endSession` (no redirect — screens decide). The user id is never sent in bodies: the server takes it from the token.

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
4. Add a row to the table in `src/services/services.test.ts` (its "covers every service method" test fails until you do) and tests for the hook in `src/hooks/use<Feature>.test.tsx` — what it requests, when it stays idle, what it writes to / invalidates in the cache

## Tests

Every code change comes with tests (workflow: skill `test-after-change`); CI keeps coverage on Codecov (currently 100% of lines, branches and functions). Locally, `node .claude/skills/test-after-change/changed-coverage.mjs [base]` (after `npm run coverage`) shows the coverage of the files changed since `origin/master` — the same idea as Codecov's patch status.

- **Stack:** Vitest 5 (configured in `vite.config.ts` → `test`), jsdom, `@testing-library/react` (`renderHook`), MSW 3 for HTTP, `@vitest/coverage-v8`.
- **HTTP:** requests go through the real `apiClient` (interceptors, `paramsSerializer`) to `http://api.test` and are answered by MSW. Register handlers per test with `capture(method, path, response, status)` from `src/test/server.ts` — it records method, path, query, headers and body (JSON, or multipart parts). An unhandled request fails the test (`onUnhandledFrame: 'error'`). jsdom runs on the API origin because its XHR enforces CORS.
- **Hooks:** `renderQueryHook` gives each test a fresh `QueryClient` (no retries); `runMutation(client, hook, variables)` runs a mutation; `seed` + `isInvalidated` check what a mutation invalidated. Session hooks use the app's module `queryClient` (`lib/session.ts` clears it).
- **Fixtures:** `src/test/factories.ts` builds typed server payloads (`organisation()`, `person()`, `authUser()`, … and `list()` for `{ items, total }`).
- **Isolation:** `src/test/setup.ts` resets MSW handlers, the session, `localStorage` and the query cache after each test. Env-dependent modules are tested with `vi.stubEnv` + `vi.resetModules` + a dynamic `import()` (envs are unstubbed automatically).
- **Contract pins:** `src/types/api/contract.test.ts` holds the enum values and limits shared with the server (migration `CHECK`s, Rust constants) — a failure means one side changed.
- **Gotcha:** with React 19, don't wrap `fetchNextPage()` in `act()` — the observer update never reaches the hook; call it and `await waitFor(...)` (TanStack's documented pattern).

## CI

`.github/workflows/ci.yml` (push/PR to `master`, Node 24): job `build` runs `npm ci`, `npm run lint`, `npm run build` (tsc + Vite); job `coverage` runs `npm run coverage` and uploads `coverage/lcov.info` to Codecov with the `CODECOV_TOKEN` secret (`codecov.yml` mirrors landly-server's settings). `codeql.yml` and `dependency-review.yml` run alongside.

### Adding a new translation key

1. Add the key to `src/i18n/locales/en/translation.json` (English — source of truth)
2. Add the same key to `src/i18n/locales/ru/translation.json` (Russian)
3. Add the same key to `src/i18n/locales/uk/translation.json` (Ukrainian)
4. Use `const { t } = useTranslation()` in the component

## ESLint

The project uses ESLint v10 with a flat config (`eslint.config.js`).

Rules enforced:

- `@typescript-eslint/recommended` — strict TypeScript checks
- `react-hooks/recommended` (v7) — rules of hooks plus the React Compiler rules (purity, refs, set-state-in-effect, …)
- `react-refresh/only-export-components` — fast-refresh compatibility
- `@typescript-eslint/consistent-type-imports` — enforce `import type` for type-only imports
- `@typescript-eslint/no-explicit-any` — warn on `any` usage
- `@typescript-eslint/no-unused-vars` — error (args prefixed with `_` are ignored)
