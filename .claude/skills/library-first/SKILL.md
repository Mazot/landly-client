---
name: library-first
description: Library-first rules for landly-client. Use BEFORE writing or changing any code in this repo (components, hooks, services, stores, helpers) — "add a screen", "build X", "implement Y", "fetch Z", "debounce/paginate/virtualize/validate/format …". Lists the functions the installed libraries already provide (verified against the installed versions), how to re-check an API before using it, and the procedure for installing an npm package — TanStack first — instead of hand-writing new functionality.
---

# Library-first in landly-client

Two rules, in this order:

1. **Use what is already installed.** Before writing a helper, hook or
   component, check the lists below and `src/lib/*` — if a library or the
   project already does it, call that.
2. **Need something new → install a package, don't write it.** Search npm,
   TanStack packages first, and install the best fit (procedure in §3). Write
   it yourself only when §3.4 says so.

And one meta-rule: **re-check every API before you write code against it.**
Memory of a library is not proof — versions move (React here is **19**, TypeScript **6**, Vite **8**).

## 0. Re-check before writing code

Run these from the repo root (`landly-client/`); takes seconds.

```bash
# installed version (package.json ranges are not what is installed)
node -p "require('<pkg>/package.json').version"
```

```bash
# does the installed version export <name>? (ESM resolution, like Vite)
node --input-type=module -e "import * as m from '<pkg>'; console.log(['<name1>','<name2>'].map(n => n + ': ' + (n in m)).join('\n'))"
```

```bash
# types-only APIs (google.maps.*): grep the declarations
grep -n "class Place \|static searchNearby" node_modules/@types/google.maps/index.d.ts
```

Then read the docs **for that major version** (WebFetch the official docs) for
signatures and options. If a name below is missing in the installed version,
do not use it — and fix this file.

## 1. Already available — use these

Versions are what `npm ci` installs from the lockfile (checked 2026-10-18).

### Project helpers (`src/`) — always reuse, never re-implement

| Need | Use |
|---|---|
| Any HTTP call | `apiClient` (`lib/axios.ts`) through a `services/<feature>.service.ts` method — never `fetch`/raw axios in components |
| Server data in components | the hooks in `hooks/use<Feature>.ts`; add a hook there if one is missing |
| Query keys / invalidation | `queryKeys` (`lib/queryKeys.ts`), `invalidatePlaceSummaries` (`lib/invalidation.ts`) |
| Sign-in / sign-out | `startSession` / `endSession` (`lib/session.ts`), `useSignIn`, `useSignUp`, `useGoogleExchange`, `useSignOut` |
| Current user / role | `useAuthStore` (session), `useMe()` (profile, `role`) |
| Query strings | `toQueryString` (`lib/query.ts`) — already the axios `paramsSerializer`; pass plain objects with arrays |
| Server timestamps | `parseServerDateTime` (`lib/dates.ts`) — never `new Date(serverString)` |
| API errors | `apiErrorStatus`, `apiErrorMessage`, `apiErrorConstraint` (`lib/errors.ts`) |
| Map ↔ API | `boundsToSearchBox`, `organisationPosition`, `placeToOrganisationLocation`, `GOOGLE_MAPS_MAP_ID` (`lib/maps.ts`); live Google data via `usePlaceDetails` |
| Enum values / limits | the `as const` arrays and limit constants in `types/api/*` (`ORGANISATION_STATUSES`, `LOCALES`, `PASSWORD_MIN_CHARS`, `MAX_IMAGE_BYTES`, …) |

### @tanstack/react-query 5.104 (+ react-query-devtools 5.104)

- Reading: `useQuery`, `useInfiniteQuery`, `useQueries`, `useSuspenseQuery`, `useSuspenseInfiniteQuery`, `usePrefetchQuery`, `usePrefetchInfiniteQuery`
- Writing: `useMutation`, `useMutationState` (pending/optimistic UI from another component), `useIsMutating`, `useIsFetching`
- Typed reusable options: `queryOptions`, `infiniteQueryOptions`, `mutationOptions`
- Conditional queries: `skipToken` (instead of `enabled` + `!` non-null assertions in new code)
- Keep data between keys: `placeholderData: keepPreviousData`
- Client: `useQueryClient()` → `invalidateQueries`, `setQueryData`, `getQueryData`, `removeQueries`, `cancelQueries`, `prefetchQuery`, `ensureQueryData`, `fetchQuery`
- Errors / SSR-ish: `QueryErrorResetBoundary`, `useQueryErrorResetBoundary`, `HydrationBoundary`, `dehydrate`, `hydrate`
- Utilities: `hashKey`, `matchQuery`, `matchMutation`, `isCancelledError`
- Built-in behaviours you must not re-implement: retries, dedupe, cache/`staleTime`/`gcTime`, `select` (derive data), `refetchInterval` (polling), `signal` in `queryFn` (pass it to axios for cancellation), optimistic updates via `onMutate`
- Devtools: `ReactQueryDevtools` (mounted in `main.tsx`), `ReactQueryDevtoolsPanel`

### axios 1.20

- Instance: use the existing `apiClient`; `create`, `mergeConfig` only for a genuinely different backend
- Errors: `isAxiosError`, `AxiosError`, `isCancel`, `CanceledError`, `HttpStatusCode` (named statuses instead of magic numbers)
- Bodies: `toFormData`, `formToJSON`, `AxiosHeaders`
- Cancellation: `{ signal }` option (AbortController) — wire React Query's `signal` through
- Progress: `onUploadProgress` / `onDownloadProgress` config (image upload progress)

### react-router-dom 7.18 (declarative `<Routes>` mode)

- Components: `BrowserRouter`, `Routes`, `Route`, `Navigate`, `Outlet`, `Link`, `NavLink`
- Hooks: `useNavigate`, `useParams`, `useSearchParams` (URL state for filters/tabs — not local state), `useLocation`, `useMatch`, `useOutletContext`, `useHref`, `useNavigationType`
- Utilities: `generatePath` (build `/org/:id` links), `matchPath`, `resolvePath`, `createSearchParams`
- **Exported but data-router only** (`createBrowserRouter` + `RouterProvider`), so they do not work with the app's `<BrowserRouter>`: `useBlocker`, `ScrollRestoration`, loaders/actions, `useNavigation`, `useFetcher`. Switching router mode is a decision for the user.

### zustand 5.0

- `create`, `createStore`, `useStore`
- Middleware (`zustand/middleware`): `persist` + `createJSONStorage` (localStorage state), `devtools`, `subscribeWithSelector`, `combine`
- Selectors: `useShallow` (`zustand/react/shallow`), `shallow` (`zustand/shallow`)
- Zustand is for **client** state only (session, guest corridor, UI prefs). Server data lives in React Query.

### i18next 26 + react-i18next 17 + i18next-browser-languagedetector 8

- `useTranslation()` → `t`, `i18n.changeLanguage`, `i18n.language`; `<Trans>` for markup inside strings; `Translation`, `withTranslation`, `I18nextProvider`
- i18next: `t`, `changeLanguage`, `createInstance`; interpolation `{{name}}`, plurals (`key_one` / `key_other`), contexts
- Language detection is configured in `src/i18n/index.ts` (localStorage → navigator); languages = `LOCALES`
- Dates/numbers in the UI: `Intl.DateTimeFormat`, `Intl.RelativeTimeFormat`, `Intl.NumberFormat`, `Intl.ListFormat` with `i18n.language` — no hand-made formatting

### @vis.gl/react-google-maps 1.10 (+ @types/google.maps 3.66)

- Components: `APIProvider` (mounted in `main.tsx`), `Map`, `AdvancedMarker`, `Pin`, `InfoWindow`, `MapControl` + `ControlPosition`, `Circle`, `Polygon`, `Polyline`, `Rectangle`, `StaticMap` + `createStaticMapsUrl`, `Popover`
- Hooks: `useMap`, `useMapsLibrary('places' | 'marker' | 'geometry' | 'geocoding' | 'routes' | …)`, `useApiIsLoaded`, `useApiLoadingStatus` + `APILoadingStatus`, `useAdvancedMarkerRef`
- Enums: `AdvancedMarkerAnchorPoint`, `CollisionBehavior`, `ColorScheme`, `GestureHandling`, `RenderingType`
- Geo utils: `isLatLngLiteral`, `latLngEquals`, `toLatLngLiteral`, `toLatLngBoundsLiteral`, `boundsEquals`
- Google classes (via `useMapsLibrary`): `places.Place` (`fetchFields`, `searchNearby`, `searchByText`), `places.AutocompleteSuggestion` + `AutocompleteSessionToken`, `places.PlaceAutocompleteElement`, `places.OpeningHours` / `Place.isOpen()`, `Photo.getURI()` + `authorAttributions`, `marker.AdvancedMarkerElement`, `marker.PinElement`, `geometry.spherical.computeDistanceBetween`, `geocoding.Geocoder`, `routes.DirectionsService`, `LatLngBounds`, `map.fitBounds` / `panTo`
- Google terms: show Places data on a Google map with attribution, never send it to the server (see `AGENTS.md`).

### React 19.3 (+ react-dom 19.3)

- `useId` (form/label ids), `useDeferredValue` (search-as-you-type), `useTransition` / `startTransition`, `useSyncExternalStore`, `lazy` + `Suspense` (route-level code splitting), `memo`, `useMemo`, `useCallback`, `useReducer`, `useImperativeHandle`
- React 19: `use` (read a promise/context in render), `useOptimistic` (optimistic UI for local actions — for server data prefer React Query's `onMutate`), `useActionState` + `<form action>` (form submit state), `useEffectEvent` (non-reactive logic inside effects), `<Activity>` (keep hidden UI mounted, e.g. map ↔ list tabs on mobile)
- react-dom: `useFormStatus` (pending state inside a form), `createPortal`, `flushSync`, resource hints `preload` / `preinit` / `preconnect` / `prefetchDNS`
- `ref` is a regular prop — new components take `ref` directly; don't add `forwardRef` (still exported, legacy).
- `<title>` / `<meta>` / `<link>` rendered anywhere are hoisted into `<head>` — no helmet-style library needed.

### Tailwind CSS 4.3 (`@tailwindcss/vite`)

- Utility classes + the design tokens from `tailwind.config.ts` (loaded via `@config` in `src/index.css`): `bg-ink-1/28`, `bg-surface`, `text-type-embassy`, `rounded-r3`, `shadow-pop`, `font-display`, …
- v4 defaults: borders are `currentColor`, `hover:` only on hover-capable devices.
- Styling goes through classes and tokens — no inline style objects for things Tailwind expresses, no new CSS files for one component.

### Tooling: TypeScript 6.0, Vite 8, ESLint 10

- TypeScript is pinned to `~6.0` because `typescript-eslint` 8.x supports only `<6.1` — don't bump to 6.1+/7 until it does.
- TS 6 loads no `@types/*` globals by default: a package that adds globals (like `@types/google.maps`) must be listed in `compilerOptions.types` in `tsconfig.json`. `baseUrl` is deprecated — `paths` are relative to the tsconfig.
- Vite 8 (Rolldown) + `@vitejs/plugin-react` 6; Tailwind via `@tailwindcss/vite`.
- ESLint 10 flat config; `eslint-plugin-react-hooks` 7 `recommended` includes the React Compiler rules (purity, refs, set-state-in-effect, …) — fix the code, don't disable them.

### Testing: Vitest 5.0, Testing Library, MSW 3 (dev only)

- **Vitest 5.0** (`vitest`, `@vitest/coverage-v8`, jsdom 30) — config in `vite.config.ts` → `test`. `describe` / `it` / `it.each` / `expect` / `beforeEach` / `afterEach` / `beforeAll` / `afterAll`; `vi.fn`, `vi.spyOn`, `vi.mock` + `vi.mocked`, `vi.hoisted`, `vi.importActual`, `vi.stubEnv` (auto-unstubbed), `vi.stubGlobal`, `vi.resetModules`, `vi.useFakeTimers` + `vi.advanceTimersByTimeAsync`, `vi.waitFor`. Coverage: `npm run coverage` (v8).
- **@testing-library/react 16.3** (+ `@testing-library/dom` 10.4): `renderHook`, `render`, `waitFor`, `act`, `screen`, `cleanup`. No `jest-dom` matchers are installed — add `@testing-library/jest-dom` when the first component tests need them.
- **MSW 3.0**: `http.get/post/put/delete`, `HttpResponse.json`, `delay`, `bypass`; `setupServer` from `msw/node` with `listen` / `use` / `resetHandlers` / `close`. MSW 3 renamed `onUnhandledRequest` → **`onUnhandledFrame`** (`'error' | 'warn' | 'bypass'`); resolvers get `{ request, params, cookies }`.
- **Project test helpers — reuse, don't re-implement:** `capture()` + `server` + `API` (`src/test/server.ts`), payload factories (`src/test/factories.ts`), `renderQueryHook`, `runMutation`, `seed`, `isInvalidated`, `createTestQueryClient` (`src/test/render.tsx`).

### Platform APIs (no package needed)

`Intl.*`, `URLSearchParams`, `AbortController`, `structuredClone`, `crypto.randomUUID()`, `navigator.clipboard`, `navigator.geolocation` (user's position for `lat`/`lng` search), `IntersectionObserver` (infinite-scroll trigger), `ResizeObserver`, `matchMedia`.

## 2. Anti-patterns → what to use instead

| Don't write | Use |
|---|---|
| `useEffect` + `fetch`/axios + `useState(loading/error)` | a React Query hook over a service |
| Manual cache / "refetch after save" plumbing | `invalidateQueries` / `setQueryData` in the mutation's `onSuccess` |
| Hand-rolled optimistic state | React Query `onMutate` (+ rollback in `onError`) for server data; `useOptimistic` for local actions |
| `isSubmitting` flags threaded through props | `useFormStatus` / `useActionState`, or the mutation's `isPending` |
| `forwardRef` wrappers in new components | `ref` as a regular prop (React 19) |
| A document-head library (helmet) | render `<title>` / `<meta>` directly (React 19 hoists them) |
| `setTimeout` debounce/throttle helpers | `useDeferredValue`; for real debounce/throttle/rate-limit install `@tanstack/react-pacer` |
| Hand-made form state + validation | install `@tanstack/react-form` (+ a Standard Schema validator such as `zod`) |
| Hand-made table sorting/filtering/pagination | install `@tanstack/react-table` |
| Rendering hundreds of rows/markers in a list | install `@tanstack/react-virtual` |
| Own marker clustering | install `@googlemaps/markerclusterer` |
| Own distance/geo math | `google.maps.geometry.spherical.*` (server results already carry `distanceKm`) |
| String-building query strings / URLs | `toQueryString`, `createSearchParams`, `generatePath` |
| Filters/tabs kept in `useState` | `useSearchParams` (shareable, back-button safe) |
| Manual date/number formatting | `Intl.*` with `i18n.language` |
| A `cn()`/classnames helper | install `clsx` (+ `tailwind-merge` if classes must override each other) |

## 3. Installing a package for new functionality

### 3.1 Search — in this order

1. **TanStack** (`npm search @tanstack/<topic>`, https://tanstack.com). Known fits:

   | Need | Package |
   |---|---|
   | Forms + validation | `@tanstack/react-form` |
   | Tables, sorting, column filters | `@tanstack/react-table` (+ `@tanstack/match-sorter-utils` for fuzzy filtering) |
   | Long lists / virtual scroll | `@tanstack/react-virtual` |
   | Debounce, throttle, rate limit, queues | `@tanstack/react-pacer` (0.x — pin the minor) |
   | Keyboard shortcuts | `@tanstack/react-hotkeys` (0.x) |
   | Persist the query cache (offline / reload) | `@tanstack/react-query-persist-client` + `@tanstack/query-sync-storage-persister` |
   | Lint rules for React Query | `@tanstack/eslint-plugin-query` (dev) |

   Not without the user's go-ahead: `@tanstack/react-router` (the app uses
   react-router — switching routers is a decision, not a dependency),
   `@tanstack/react-store` / `@tanstack/react-db` (overlap with zustand/React Query).
2. **The vendor's official package** for the domain (e.g. `@googlemaps/*` for maps).
3. A **well-maintained, popular** package otherwise (small, typed, actively released).

### 3.2 Check before installing

```bash
npm view <pkg> version peerDependencies deprecated license time.modified
```

- `peerDependencies` accept **React 19** (`^19` / `>=18` / `>=16.8`), **TypeScript 6** when it lists one, **Vite 8** for Vite plugins, **ESLint 10** for lint plugins, **Vitest 5** for test plugins, and the installed TanStack versions.
- `npm view` ignores `--before` and always shows the newest release; check the release dates with `npm view <pkg> time --json` and read the peers of the version the 14-day cut-off will actually pick (`npm view <pkg>@<that version> peerDependencies`).
- Not `deprecated`; maintained (recent releases); ships its own types or has `@types/*`.
- No overlap with something already installed (§1) — one library per job.
- The `@tanstack/*query*` packages share one version: a new query plugin may
  require bumping `@tanstack/react-query` / `-devtools` to the same version
  (e.g. `react-query-persist-client@5.104` needs `react-query@^5.104`).

### 3.3 Install — only versions at least 14 days old

```bash
npm install <pkg> --before="$(node -p "new Date(Date.now() - 14 * 864e5).toISOString().slice(0, 10)")"
```

`-D` for build/lint-only tools. The only exception to the 14-day rule is a
fix for a **critical/high** `npm audit` advisory that has no older fixed
release: update just the affected package(s) (`npm update <pkg> --before=<fix
release date>`), keep everything else on the 14-day cut-off, and name the
exception in the PR.

Then, all must pass:

```bash
npm audit
```

```bash
npx tsc --noEmit
```

```bash
npm run lint
```

```bash
npm run build
```

```bash
npm test
```

Finally add the package to the stack list in `AGENTS.md` and to §1 of this file
(with the APIs you used, re-checked as in §0).

### 3.4 When writing it yourself is right

- It is project glue (a service method, a hook over a service, a mapping to `types/api`).
- It is a few lines over a platform API (`Intl`, `URLSearchParams`, …).
- No package passes §3.2 (React 19 peers, maintenance, size, licence) — say so in the PR description.

## 4. Before you hand the change over

- [ ] Every library call was checked against the installed version (§0).
- [ ] No hand-written equivalent of §1 / §2 slipped in.
- [ ] New packages: TanStack considered first, §3.2 checks done, ≥14-day-old version, audit/tsc/lint/build/test green, `AGENTS.md` + this file updated.
- [ ] New or changed code is tested per the **test-after-change** skill (helpers in §1 "Testing"; changed files at 100% in `changed-coverage.mjs`).
