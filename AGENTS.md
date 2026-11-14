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
| `VITE_GOOGLE_MAPS_MAP_ID` | no | Map ID for `<AdvancedMarker>` / cloud styling (the style is set in Google Cloud Console → Map Management → the map ID → Map styles); used by `MapPage` and `MapBackdrop`; defaults to `DEMO_MAP_ID` (dev only) |

Everything `VITE_*` ends up in the public bundle — never put server secrets here (`GOOGLE_PLACES_API_KEY`, `GOOGLE_CLIENT_SECRET`, `JWT_SECRET`, S3 keys). The server's `FRONTEND_ORIGIN` must equal this client's origin.

## Status

The design system is in `src/components/ui` (tokens, components, constants, `ui` i18n namespace — see its `README.md`). Screens are rebuilt one design section at a time (design: "Landly v3 (API-aligned)"); done so far: **1 · Sign in & Sign up** — the guest landing (`/`), `/signin`, `/signup` (two steps; all three under `GuestOnly`, which sends a signed-in user to `/map`) and the Google callback (`/auth/google/callback`); and **2 · Map** (design states: Map, Filters, Corridors, each on desktop / tablet / phone) — `/map` (`MapPage`, public: guests browse too, a signed-in user lands here) inside `AppShell` (top bar with the corridor pill and sections from `md`, bottom tab bar on phones), the filters sheet and the corridor picker — the map shows places waiting for moderation too (`status: 'pending'` from `GET /organisation/search`): their pin is the type's colour muted (`MapPin pending`) and their row carries a "Pending review" `StatusBadge`; and **7 · Add organization** — `/add` (`AddPlacePage`, form in `components/place/`) and `/add/sent/{id}` (`AddPlaceSentPage`: what happens next + photo upload), both under `RequireAuth` (a guest is sent to `/signin`). The form takes the point from a Google Maps pick (only the place id and its point are sent — Google's name, address, phone and hours are shown live, never copied into the form) or a pin on the map, the countries from the current corridor, languages from `GET /common/languages?country_ids=`, the time-zone hint from `GET /common/timezone`, and warns about like places nearby (`GET /organisation/duplicates`). **Photos** (`PhotosField.tsx`, `Dropzone` + a grid with the cover badge, "Make cover" and remove): on a new place they are queued in the form (`QueuedPhotos`, the first is the cover) and sent by `useUploadImages` right after the place is created — how many went up / failed travels to the "sent" page in `location.state.photos`; when editing, `PlacePhotosEditor` works on the stored photos and saves each change at once (upload, `set-primary`, delete); and **10 · Account** — `/account` (`AccountPage`, blocks in `components/account/`): who you are (avatar, name, `@username · city · from <home country>`, here-as badge, bio), the four counters of `GET /user/me` (`placesAdded`, `peopleRecommended`, `reviews`, `saved`), the languages you speak, **My places** (`GET /organisation/mine`) and **People I recommended** (`GET /person/mine`) in every moderation status with the moderator's note — both paged by `MINE_DEFAULT_LIMIT` with "Show more" (`useInfiniteQuery`, `nextOffset` in `lib/query.ts`) and `staleTime: 0`, so a moderator's decision shows as soon as the screen is opened again; `rejectedByModerator` labels a moderator's reject apart from a declined claim — where each stands is derived from `status` + `updatedAt` + `moderationNote` (`Live since …`, `Submitted …`, `Changes requested · …`, `Rejected · …`) — and **My corridors** (`CorridorCard compact`, "Manage" opens the corridor picker); and `/account/edit` (`EditProfilePage` + `EditProfileForm`, schema in `components/account/schemas.ts`): avatar colour, name, city, bio, home country, interface language, here-as and languages, saved in one go by `useSaveProfile` (`PUT /user/me` first — the part the server may refuse — then language removals and additions); the interface-language field starts from the language the UI is in, not the stored `locale`; email and username are read-only. Both are under `RequireAuth`. Each place in **My places** has an "Edit" link (the edit form below, which also answers a moderator's note). Not linked yet because the screen does not exist: "Recommend" (goes to `ROUTES.people`); notification settings are not on the screen.  **Edit a place** — `/place/{id}/edit` (`EditPlacePage`, `editPlacePath`, under `RequireAuth`): the add-a-place form (`AddPlaceForm` with `place`) filled from the place by `toFormValues` and saved with `PUT /organisation/update/{id}` (`toUpdateRequest`: every field is sent — a cleared one as `""`, no open day as `{}` — so deletions are saved; the point only when the pin was moved; no Google search, the link stays). Only the submitter (`place.createdBy` = the signed-in user) gets the form; `PlaceActions` shows the "Edit place" link to them alone, and the server checks ownership again. A live place goes back to `pending` when saved — the form says so first. Stored hours are shown as the editor takes them (`fromOpeningHours` joins a night split at midnight); and **3 · Organization** — the compact panel (`PlaceCompactPanel`: picked from the list it opens over the map's right side from tablets up, and the map shifts the place left of it by `PANEL_COVER_PX`; a pin opens it without moving the map; on phones it replaces the list in the bottom sheet) and the full page `/place/{id}` (`PlacePage`, public, `placePath`): head (type, verified / moderation badges, address, open state, rating, visits — one visit counted per opening), actions (directions by Google Maps URL — no billed Places call —, save / unsave with a guest sent to sign in, copy link), contacts, languages, a still mini map, about, services, photos (`GET /images/list`), opening hours in the place's zone, consular network (`GET /country-connection/list` both ways, linked places by name), community check-ins with tip authors, reviews (`GET /review/summary` → `RatingBreakdown`, latest `GET /review/list` with author faces) and who added it (`creator`, Google point). Blocks live in `components/place/`; "Write a review", "Report a problem" and "See all photos" belong to sections 4 and 5 and are not shown yet. Not built yet: people, countries and saved screens (their routes in `ROUTES` exist, the pages do not), and a server-side text search (the search box filters the places in view by name, city, address and services client-side — `GET /organisation/search` has no text parameter). The data layer is complete and mirrors the current landly-server. Translation files still hold some copy of the old screens (`header`, `home`, …); the new screens use the `landing`, `auth`, `corridor` and `language` keys.

## Documentation is part of every change

**Every code change includes checking and updating the `.md` files.** Before you finish (and before any commit), go through every Markdown file in the repo and update whatever the change made stale — a doc that disagrees with the code is a bug.

Files and what usually affects them:

| File | Update when you change |
|---|---|
| `AGENTS.md` | architecture, directory layout, conventions, auth/session flow, env vars, commands, stack |
| `README.md` | what Landly is for (product), what is built, how to run it — no technical detail; that lives here |
| `.claude/skills/library-first/SKILL.md` | dependencies (added/removed/bumped packages, APIs now used), project helpers in `src/lib` |
| `.claude/skills/design-system/SKILL.md` and `src/components/ui/README.md` | tokens (`src/components/ui/tokens/`), DS components / `src/components/ui`, breakpoints, layout patterns, verification steps |
| `.claude/skills/test-after-change/SKILL.md` | test helpers in `src/test/`, test layout per layer, test/coverage commands, `vite.config.ts` → `test.coverage` excludes (mirrored in `changed-coverage.mjs`) |
| `.claude/skills/contract-sync/SKILL.md` and `check.mjs` | the server-feature → client-file mapping (`FEATURE_MAP`), which server files count as contracts (`PATHSPEC`, `CATEGORIES`), the sync procedure; `synced-with.json` moves only through `check.mjs --stamp` |
| `.env.example` (not Markdown, same rule) | any `import.meta.env.VITE_*` added, renamed or removed |

How:

1. List them (tracked and new): `git ls-files --cached --others --exclude-standard '*.md'`.
2. Grep the docs for every name you renamed, moved or removed (files, functions, hooks, env vars, routes, packages) — no stale references may remain.
3. New behaviour, convention or file a future reader needs → document it in the matching file in the same change.
4. Say in your final message which `.md` files you updated — or that you checked them and none needed changes.

## Contract sync before a new task (skill `contract-sync`)

**Before starting any new task**, run `node .claude/skills/contract-sync/check.mjs` (source: `master` of `landly-server`; `--source folder` for the sibling `../landly-server` working tree when the task depends on unmerged server work). It lists what changed in the server's client-facing contracts since the commit in `.claude/skills/contract-sync/synced-with.json` and cross-checks every server route against `src/services`. If anything changed, bring `src/types/api`, services, hooks, factories, contract pins and docs up to date first — workflow in `.claude/skills/contract-sync/SKILL.md` (own commit, then `--stamp`) — and only then start the task. State the source and the result in the first message.

## Library-first (skill `library-first`)

Before writing code, follow `.claude/skills/library-first/SKILL.md`: use the functions the installed libraries and `src/lib` already provide (listed there, verified against the installed versions), re-check an API against the installed version before using it, and for new functionality install an npm package — TanStack first, versions at least 14 days old — instead of writing it. Keep its lists in sync when dependencies change.

## No hardcoded data

Nothing the app shows or sends is hardcoded in code:

- **Domain data comes from the backend** — organisation types, countries, languages, corridors, counts, statuses, limits. Never inline a list of domain values (`['Ukrainian', 'Russian']`, `['embassy', …]`, `'Europe/Berlin'`) in a component, hook or service; derive it from an API response or from the contract constants in `src/types/api` (which mirror the server's enums and limits and are guarded by the contract tests). If the backend has no source for something the UI needs, add one there (an endpoint or a field) instead of a client-side copy.
- **Text goes through i18n** (`t('…')`, keys in all three locales); **configuration** through env (`import.meta.env.VITE_*`) or a named constant in `src/lib` that says what it is and why.
- **Design values** come from DS tokens and components, never raw colours/sizes.
- Test data lives in `src/test/factories.ts` and test files only.

A design mock's sample content (names, addresses, hours, chips) is an example of the shape, not data to copy.

## UI: design system, mobile-first (skill `design-system`)

For anything visible, follow `.claude/skills/design-system/SKILL.md`: screens are composed only of design-system components (`src/components/ui/`, inventory in its `index.ts`) and tokens (`src/components/ui/tokens/tokens.ts` + `tokens.css`); never duplicate an existing component — extend it with a variant; phone layout is the base and `md`/`lg` adapt it; and every UI change is verified in the browser at phone (375, 320) and desktop (1440) sizes with screenshots and `.claude/skills/design-system/layout-check.js` before it is called done.

## Test every change (skill `test-after-change`)

After writing or changing any code in `src/`, follow `.claude/skills/test-after-change/SKILL.md` before calling it done: add tests for the behaviour in the layer's test file (contract pins, the services table, hook tests, lib/store tests, component tests), prove they fail without the change (bug fixes: regression test first), then pass the gate — `npm test`, `npm run coverage` + `node .claude/skills/test-after-change/changed-coverage.mjs` (every changed source file at 100%), `npm run lint`, `npm run build` — and report what was tested and anything left unverified.

## Architecture

React 19 + TypeScript 6 + Vite 8 SPA with Tailwind CSS 4.

TypeScript is pinned to `~6.0` (typescript-eslint supports only `<6.1`). TS 6 loads no `@types/*` globals implicitly — global type packages are listed in `compilerOptions.types` (`google.maps`), and `paths` work without `baseUrl`.

### Stack

- **Routing** — `react-router-dom` v7; every page in `App.tsx` is `React.lazy` (its own chunk, one `Suspense` with a loading status around `<Routes>`) — a new page is added the same way, as a default export
- **Server state** — `@tanstack/react-query` v5 (keys in `src/lib/queryKeys.ts`)
- **Client state** — `zustand`: `authStore` (JWT + user, persisted in `localStorage`), `corridorStore` (guest corridor; signed-in users use server corridors)
- **HTTP client** — `axios` instance in `src/lib/axios.ts`
- **Utilities** — `es-toolkit` for collection / object / number helpers (`compact`, `uniqBy`, `orderBy`, `sortBy`, `sumBy`, `range`, `clamp`, `isEqual`, `isNil`, …) — never a hand-written copy of one of them. Two spots stay native on purpose: locale-aware sorts (`localeCompare`, whose order es-toolkit's `<` comparison does not match) and `charCount` (counts code points, as the server does). A component with a `compact` prop destructures it as `compact: dense`, so `compact` stays the es-toolkit function everywhere.
- **Map** — Google Maps Platform via `@vis.gl/react-google-maps`; `<APIProvider>` is mounted in `main.tsx` (and in the Storybook decorator), config and helpers in `src/lib/maps.ts`. `MapBackdrop` (landing, sign-in) is a non-interactive, still world map (`BACKDROP_VIEW`); it mounts the `<Map>` only while on screen (IntersectionObserver), so a copy hidden by CSS costs no Google map load — each mounted map counts against the daily *Map loads* quota
- **Styling** — Tailwind CSS v4 via `@tailwindcss/vite` (no PostCSS config); design tokens live in `src/components/ui/tokens/tokens.ts` (single source; `tailwind.config.ts` builds the theme from it and is loaded with `@config` from `src/index.css`) and are mirrored as CSS variables in `src/components/ui/tokens/tokens.css` (`tokens.test.ts` checks the two match). Class names are joined with `clsx`. v4 defaults differ from v3: `border` is `currentColor`, `hover:` applies only on hover-capable devices
- **Forms** — `@tanstack/react-form` with `zod` schemas as the Standard Schema validator (`validators.onSubmit`); schemas live next to the form (`components/auth/schemas.ts`) and carry i18n keys as messages; `FormTextField` binds a field to the DS and translates them
- **i18n** — `i18next` + `react-i18next` + `i18next-browser-languagedetector`; languages `en`, `ru`, `uk` (same as the server's `Locale`), files in `src/i18n/locales/{en,ru,uk}/translation.json`; the design system's own strings are the `ui` namespace in `src/components/ui/i18n/{en,ru,uk}.json`

### Directory structure

```
src/
├── types/api/          # server contracts — one file per server feature + index.ts
├── services/           # <feature>.service.ts — one API object per server feature
├── hooks/              # use<Feature>.ts — React Query hooks; usePlaceDetails (Google Places)
├── components/ui/      # design system: tokens/, constants/, i18n/ (`ui` namespace), lib/, one component per file, barrel index.ts
├── components/<feature>/ # domain blocks composed from DS components: auth/ (forms, schemas), corridor/ (CorridorPicker, CorridorCard, CorridorsSheet), account/ (ProfileSummary, MyPlaces, MyPeople, MyCorridors, EditProfileForm, schemas), profile/ (avatarColors), layout/ (AppShell, LanguageSelect), map/ (MapToolbar, TypeRail, ResultsHeader, PlaceList, PlaceListItem, MapControls, FiltersSheet)
├── pages/              # one file per route (LandingPage, SignInPage, SignUpPage, GoogleCallbackPage, MapPage, PlacePage, AddPlacePage, AddPlaceSentPage, EditPlacePage, AccountPage, EditProfilePage); tests in pages/__test__
├── lib/                # axios, queryClient, session, queryKeys, invalidation, maps, errors, dates, query (toQueryString, nextOffset), routes (ROUTES), locales (LOCALE_OPTIONS), navigation (redirectTo), text (charCount), orgTypes (orgTypeColor), contacts (tel/website/Telegram/WhatsApp links), maps (directionsUrl), openingHours (weekdayLabel)
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
- Input caps of the server (`utils/validation.rs` → `limits::*`, `MAX_JSON_BODY_BYTES`) are the `*_MAX_CHARS` / `*_MAX` constants in `src/types/api/limits.ts` (user credentials/profile ones in `user.ts`), pinned in `contract.test.ts`; lengths count Unicode characters, a longer value is a 422.
- Trust rules answer 403 (own organisation/person review or vouch, `added_by: 'official'` by a non-moderator, a moderator approving their own submission); check-ins are one per (organisation, user) — a repeat updates it.
- Enum-like strings are `as const` arrays + a union type (`ORGANISATION_STATUSES` / `OrganisationStatus`, …), mirroring the server's `TEXT` + `CHECK` columns.
- List endpoints answer `ListResponse<T>` = `{ items, total }`; `total` is the size of this page, not of the table. `GET /common/countries` and `/common/org_types` answer plain arrays.
- Timestamps are UTC without a zone (`ServerDateTime`) — parse with `parseServerDateTime`.
- Array query params are sent comma-separated (`toQueryString`, the axios `paramsSerializer`).
- Errors: `{ error, constraint?, details? }`, or a plain string for 500/400/429 — read them with `lib/errors.ts`.

### Authentication

`authStore` keeps the JWT in `localStorage`; the axios request interceptor adds `Authorization: Bearer`. Sessions start and end only through `lib/session.ts` (`startSession` / `endSession`), which also clears the React Query cache (`lib/queryClient.ts`) — disabled queries would otherwise keep serving the previous account's data. A 401 on a request that carried the token calls `endSession` (no redirect — screens decide). Screens that need an account sit under the `RequireAuth` layout route (`components/auth/RequireAuth.tsx`). The user id is never sent in bodies: the server takes it from the token.

Screens: `/signin` (`SignInForm`) and `/signup` sit under `GuestOnly`, which sends a signed-in user to `ROUTES.map`. Sign-up is two steps on one URL held in `SignUpPage` state — step 1 (username, email, password; validated by `components/auth/schemas.ts`, which mirrors `user/entities.rs`) and step 2 (corridor, name, "I'm here as", language, avatar colour; all optional) — and **one** `POST /api/user/signup` after step 2 ("Skip for now" sends just the account + the UI locale). The password never leaves the component's state. Step 2 stays mounted (only hidden) once reached, so its draft — including the corridor draft — survives the round trip to step 1 after a taken username/email; "Back" and "Skip" are ignored while the request is running, so a second account cannot be started. Length rules count Unicode code points like the server (`chars` in `components/auth/schemas.ts`). The corridor sent is the guest corridor (`useGuestCorridor`: `corridorStore` resolved against `useAllCountries`, default Russia → Germany); `home_country_id` is set to the "from" country. Username/email are only checked by the server: a 422 whose `constraint` is in `SIGNUP_CONFLICT_CONSTRAINTS` sends the user back to step 1 with the field marked; sign-in shows one message for a 401 (unknown email and wrong password are indistinguishable). Messages are translated client-side (`auth.errors.*`), never the server's English text. The landing's "Open the map · N places" and type breakdown come from the public `GET /api/common/countries/{id}` (`useCountry`) — `/corridor/stats` needs a session.

Google sign-in is a top-level navigation (`redirectTo(GOOGLE_LOGIN_URL)`, `lib/navigation.ts`); the server redirects back to `GOOGLE_CALLBACK_PATH` (`/auth/google/callback?code=…`), where `useGoogleExchange` trades the single-use code for the session. It needs Redis on the server.

### Google Maps

Google's terms: only `google_place_id` (and a refreshable point) is stored server-side. Hours, photos and Google ratings are fetched live with `usePlaceDetails(googlePlaceId)` — request only the fields a screen renders (they decide the billed SKU), show them on a Google map with attribution, never send them to the server. When creating a place from Places Autocomplete use `placeToOrganisationLocation`; for map search use `boundsToSearchBox` (it widens viewports crossing the antimeridian, the server filters longitude with a plain BETWEEN).

`MapPage` (`/map`) is `AppShell` + `MapScreen`. **Layout** (`MapLayout`, `useBreakpoint`): desktop — filter bar, results panel (440 px) left of the map; tablet — filter bar, map, results list below; phone — full-bleed map with the toolbar floating over it and the results in a docked bottom sheet (`DockedSheet`, peek / expanded). The results list is rendered once, in the place the size needs. **Map**: `<Map>` mounts only after the destination country's detail is loaded (the country list is `brief`, without borders; `geometryBounds` turns `CountryDetail.geoJson` into the start viewport, `WORLD_VIEW` when there is none). **Search**: each `idle` event gives a `Viewport` (`boundsToSearchBox` + the centre as origin for `distanceKm` and `sort=nearest`); phones search on every move and for the first search, larger screens show "Search this area" after a move; a new corridor destination starts a fresh search. The request is `useSearchOrganisations({ ...box, lat, lng, ...filtersToQuery(filters), limit: MAP_SEARCH_LIMIT })`. **Filters** are one `MapFilters` value in the URL (`lib/mapFilters.ts`: `parseFilters` / `serializeFilters` / `countActiveFilters` / `filtersToQuery`); the type rail and the quick chips edit it directly, `FiltersSheet` edits a draft and "Show N places" applies it (the count is the same search over the same area with the draft, one page of 200). The languages on offer are not a fixed list: they are the ones the places in the area speak (`Organisation.languages`, most common first, at most 8 besides the chosen ones), read from the same search without the language filter — `GET /common/languages` is a people/users reference and is empty or huge. **Pins** are `<AdvancedMarker>` + `MapPin` (the selected one shows its name); a place without a point is listed but not pinned; selecting (pin, row, sheet row) highlights both and pans the map, a click on the map clears it. **Corridor**: `useCurrentCorridor` (guest: stored pair; signed in: the saved corridor matching the stored pair, else the default, else the first); the nav pill, the map's corridor summary and the phone toolbar open `CorridorsSheet` through `useAppShell().openCorridors` — saved corridors with stats (`/corridor/stats/{id}`), "Set default", add one, "Switch to …" (stores the pair in `corridorStore`); a guest gets the plain from → to picker. The summary shows `/corridor/stats` for a signed-in user and the country detail's totals for a guest (no "new this week"); its detail line names the two biggest types by count with the titles of `GET /common/org_types`. **No domain data is hardcoded**: types, languages, countries, corridors, stats and flags all come from the API; only the enums the contract pins (`added_by`, `sort`, the type slugs the DS has colours for), UI thresholds (rating choices, the 50 km "near" rule, page sizes) and the map's default views are constants — and `useGuestCorridor`'s default pair (Russia → Germany, by country name) for a guest who has not chosen yet, since the API has no default corridor. **List rows** (`PlaceListItem`): `hoursToday` (`lib/openingHours.ts`, the place's own time zone) next to the server's `openNow`; the bookmark (`useSavedPlaces`, signed-in only) is the row's sibling — a button inside the row's button is invalid. Not covered by the design or the API: deleting a corridor (`DELETE /corridor/delete/{id}` exists, no UI).

### Path alias

`@/` maps to `src/` (configured in both `vite.config.ts` and `tsconfig.json`).

### API proxy

In development, Vite proxies `/api/*` to `VITE_API_URL` (default `http://localhost:8080`). Note that the axios base URL is `VITE_API_URL` itself, so with it set requests go to the server directly and its CORS (`FRONTEND_ORIGIN`) applies. `apiClient` sets no default `Content-Type` (axios adds `application/json` to JSON bodies), so anonymous GETs stay CORS-simple — no preflight.

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
- **Viewport in jsdom:** `src/test/viewport.ts` gives jsdom a `matchMedia` that answers `(min-width: Npx)` from `window.innerWidth` (default 1024 = desktop, reset after every test); a test switches size with `setViewportWidth(375 | 834 | 1440)` — screens that use `useBreakpoint` render the layout of that size. `Element.prototype.scrollIntoView` is a `vi.fn()` in `setup.ts`.
- **Google Maps in jsdom:** `src/test/setup.ts` replaces `@vis.gl/react-google-maps` with stubs (`Map` renders a `div`, `useMap` is `null`) and gives jsdom an `IntersectionObserver` that reports "on screen" — screens containing `MapBackdrop` just work. A test that looks at the map overrides them: `vi.mock('@vis.gl/react-google-maps', …)` per file (see `MapPage.test.tsx`, `ui/__test__/map.test.tsx`) and `vi.stubGlobal` for the observer.
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

`npm run storybook` (http://localhost:6006) shows every DS component; `npm run build-storybook` builds it (also in CI). Config in `.storybook/` (tokens, i18n toolbar en/ru/uk, router, viewports 320/375/768/1024/1440, a11y addon). Every component exported from `src/components/ui/index.ts` needs a `<Name>.stories.tsx` in the `stories/` folder next to the component (`src/components/ui/DS/stories/` for DS components, `src/components/ui/stories/` for product components) — `src/components/ui/__test__/stories.test.tsx` fails otherwise, and runs every story checking for React console errors and axe violations. Stories are excluded from coverage.
