# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Type-check without emitting
npm run typecheck

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
npx vitest run src/hooks/__test__/useCommon.test.tsx -t "pages by 50"

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

The design system is in `src/components/ui` (tokens, components, constants, `ui` i18n namespace — see its `README.md`). Screens are rebuilt one design section at a time (design: "Landly v3 (API-aligned)"); done so far: **1 · Sign in & Sign up** — the guest landing (`/`), `/signin`, `/signup` (two steps) and the Google callback (`/auth/google/callback`). A signed-in user lands on `ROUTES.map` (`/map`), which is not built yet (empty route). The data layer is complete and mirrors the current landly-server. Translation files still hold some copy of the old screens (`header`, `home`, …); the new screens use the `landing`, `auth`, `corridor` and `language` keys.

## Documentation is part of every change

**Every code change includes checking and updating the `.md` files.** Before you finish (and before any commit), go through every Markdown file in the repo and update whatever the change made stale — a doc that disagrees with the code is a bug.

Files and what usually affects them:

| File | Update when you change |
|---|---|
| `AGENTS.md` | architecture, directory layout, conventions, auth/session flow, env vars, commands, stack |
| `README.md` | setup, env vars, scripts, structure, features, how to run |
| `.claude/skills/library-first/SKILL.md` | dependencies (added/removed/bumped packages, APIs now used), project helpers in `src/lib` |
| `.claude/skills/design-system/SKILL.md` and `src/components/ui/README.md` | tokens (`src/components/ui/tokens/`), DS components / `src/components/ui`, breakpoints, layout patterns, verification steps |
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

For anything visible, follow `.claude/skills/design-system/SKILL.md`: screens are composed only of design-system components (`src/components/ui/`, inventory in its `index.ts`) and tokens (`src/components/ui/tokens/tokens.ts` + `tokens.css`); never duplicate an existing component — extend it with a variant; phone layout is the base and `md`/`lg` adapt it; and every UI change is verified in the browser at phone (375, 320) and desktop (1440) sizes with screenshots and `.claude/skills/design-system/layout-check.js` before it is called done.

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
- **Styling** — Tailwind CSS v4 via `@tailwindcss/vite` (no PostCSS config); design tokens live in `src/components/ui/tokens/tokens.ts` (single source; `tailwind.config.ts` builds the theme from it and is loaded with `@config` from `src/index.css`) and are mirrored as CSS variables in `src/components/ui/tokens/tokens.css` (`tokens.test.ts` checks the two match). Class names are joined with `clsx`. v4 defaults differ from v3: `border` is `currentColor`, `hover:` applies only on hover-capable devices
- **Forms** — `@tanstack/react-form` with `zod` schemas as the Standard Schema validator (`validators.onSubmit`); schemas live next to the form (`components/auth/schemas.ts`) and carry i18n keys as messages, the form translates them
- **i18n** — `i18next` + `react-i18next` + `i18next-browser-languagedetector`; languages `en`, `ru`, `uk` (same as the server's `Locale`), files in `src/i18n/locales/{en,ru,uk}/translation.json`; the design system's own strings are the `ui` namespace in `src/components/ui/i18n/{en,ru,uk}.json`

### Directory structure

```
src/
├── types/api/          # server contracts — one file per server feature + index.ts
├── services/           # <feature>.service.ts — one API object per server feature
├── hooks/              # use<Feature>.ts — React Query hooks; usePlaceDetails (Google Places)
├── components/ui/      # design system: tokens/, constants/, i18n/ (`ui` namespace), lib/, one component per file, barrel index.ts
├── components/<feature>/ # domain blocks composed from DS components: auth/ (forms, schemas), corridor/ (CorridorPicker), layout/ (LanguageSelect)
├── pages/              # one file per route (LandingPage, SignInPage, SignUpPage, GoogleCallbackPage); tests in pages/__test__
├── lib/                # axios, queryClient, session, queryKeys, invalidation, maps, errors, dates, query, routes (ROUTES), locales (LOCALE_OPTIONS), navigation (redirectTo)
├── stores/             # authStore, corridorStore
├── i18n/
├── test/               # test-only helpers: MSW server, factories, render helpers, setup
├── App.tsx             # routes
└── main.tsx            # providers
```

Tests sit in a `__test__/` folder next to the code they cover (`src/<area>/__test__/*.test.ts(x)`; vitest only picks up `src/**/__test__/*.test.{ts,tsx}`).

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

Screens: `/signin` (`SignInForm`) and `/signup` sit under `GuestOnly`, which sends a signed-in user to `ROUTES.map`. Sign-up is two steps on one URL held in `SignUpPage` state — step 1 (username, email, password; validated by `components/auth/schemas.ts`, which mirrors `user/entities.rs`) and step 2 (corridor, name, "I'm here as", language, avatar colour; all optional) — and **one** `POST /api/user/signup` after step 2 ("Skip for now" sends just the account + the UI locale). The password never leaves the component's state. The corridor sent is the guest corridor (`useGuestCorridor`: `corridorStore` resolved against `useAllCountries`, default Russia → Germany); `home_country_id` is set to the "from" country. Username/email are only checked by the server: a 422 whose `constraint` is in `SIGNUP_CONFLICT_CONSTRAINTS` sends the user back to step 1 with the field marked; sign-in shows one message for a 401 (unknown email and wrong password are indistinguishable). Messages are translated client-side (`auth.errors.*`), never the server's English text. The landing's "Open the map · N places" and type breakdown come from the public `GET /api/common/countries/{id}` (`useCountry`) — `/corridor/stats` needs a session.

Google sign-in is a top-level navigation (`redirectTo(GOOGLE_LOGIN_URL)`, `lib/navigation.ts`); the server redirects back to `GOOGLE_CALLBACK_PATH` (`/auth/google/callback?code=…`), where `useGoogleExchange` trades the single-use code for the session. It needs Redis on the server.

### Google Maps

Google's terms: only `google_place_id` (and a refreshable point) is stored server-side. Hours, photos and Google ratings are fetched live with `usePlaceDetails(googlePlaceId)` — request only the fields a screen renders (they decide the billed SKU), show them on a Google map with attribution, never send them to the server. When creating a place from Places Autocomplete use `placeToOrganisationLocation`; for map search use `boundsToSearchBox` (it widens viewports crossing the antimeridian, the server filters longitude with a plain BETWEEN).

### Path alias

`@/` maps to `src/` (configured in both `vite.config.ts` and `tsconfig.json`).

### API proxy

In development, Vite proxies `/api/*` to `VITE_API_URL` (default `http://localhost:8080`). Note that the axios base URL is `VITE_API_URL` itself, so with it set requests go to the server directly and its CORS (`FRONTEND_ORIGIN`) applies.

### Adding a new page

1. Create the component in `src/pages/` (domain blocks in `src/components/<feature>/`, built only from DS components) and a test in `src/pages/__test__/`
2. Add a `<Route>` in `src/App.tsx` (path in `src/lib/routes.ts` when other code links to it)
3. Add translation keys to all three locale files
4. Gate it on `useAuthStore` / `useMe().data?.role` if it needs auth or a role

### Adding a new endpoint

1. Add/adjust the types in `src/types/api/<feature>.ts`
2. Add the call to `src/services/<feature>.service.ts`
3. Add a hook in `src/hooks/use<Feature>.ts` (keys in `src/lib/queryKeys.ts`; invalidate the feature root on writes)
4. Add a row to the table in `src/services/__test__/services.test.ts` (its "covers every service method" test fails until you do) and tests for the hook in `src/hooks/__test__/use<Feature>.test.tsx` — what it requests, when it stays idle, what it writes to / invalidates in the cache

## Tests

Every code change comes with tests (workflow: skill `test-after-change`); CI keeps coverage on Codecov (currently 100% of lines, branches and functions). Locally, `node .claude/skills/test-after-change/changed-coverage.mjs [base]` (after `npm run coverage`) shows the coverage of the files changed since `origin/master` — the same idea as Codecov's patch status.

- **Stack:** Vitest 5 (configured in `vite.config.ts` → `test`), jsdom, `@testing-library/react` (`render`, `renderHook`), `@testing-library/user-event`, `@testing-library/jest-dom` matchers (loaded in `src/test/setup.ts`), MSW 3 for HTTP, `@vitest/coverage-v8`.
- **Components:** DS tests sit in `src/components/ui/__test__/*.test.tsx`, grouped by area (primitives, display, fields, choices, upload, containers, shell). jsdom has no `HTMLDialogElement.showModal` — `shell.test.tsx` polyfills it for `Sheet`.
- **HTTP:** requests go through the real `apiClient` (interceptors, `paramsSerializer`) to `http://api.test` and are answered by MSW. Register handlers per test with `capture(method, path, response, status)` from `src/test/server.ts` — it records method, path, query, headers and body (JSON, or multipart parts). An unhandled request fails the test (`onUnhandledFrame: 'error'`). jsdom runs on the API origin because its XHR enforces CORS.
- **Screens and components with providers:** `renderApp(ui, { route, client })` (`src/test/render.tsx`) wraps in a fresh `QueryClient` + `MemoryRouter`; add routes inside `ui` when the test navigates. `lib/navigation` is mocked with `vi.mock` where a test would leave the SPA.
- **Hooks:** `renderQueryHook` gives each test a fresh `QueryClient` (no retries); `runMutation(client, hook, variables)` runs a mutation; `seed` + `isInvalidated` check what a mutation invalidated. Session hooks use the app's module `queryClient` (`lib/session.ts` clears it).
- **Fixtures:** `src/test/factories.ts` builds typed server payloads (`organisation()`, `person()`, `authUser()`, … and `list()` for `{ items, total }`).
- **Isolation:** `src/test/setup.ts` resets MSW handlers, the session, `localStorage` and the query cache after each test. Env-dependent modules are tested with `vi.stubEnv` + `vi.resetModules` + a dynamic `import()` (envs are unstubbed automatically).
- **Contract pins:** `src/types/api/__test__/contract.test.ts` holds the enum values and limits shared with the server (migration `CHECK`s, Rust constants) — a failure means one side changed.
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

## Storybook (design-system catalogue)

`npm run storybook` (http://localhost:6006) shows every DS component; `npm run build-storybook` builds it (also in CI). Config in `.storybook/` (tokens, i18n toolbar en/ru/uk, router, viewports 320/375/768/1024/1440, a11y addon). Every component exported from `src/components/ui/index.ts` needs a `<Name>.stories.tsx` next to it — `src/components/ui/__test__/stories.test.tsx` fails otherwise, and runs every story checking for React console errors and axe violations. Stories are excluded from coverage.
