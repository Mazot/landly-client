---
name: test-after-change
description: Always test new or changed functionality in landly-client right after writing it — before saying the work is done. Use after ANY code change in src/ (new hook, service method, type/enum, helper, store, component, screen, bug fix, refactor) — "implement X", "add Y", "fix Z", "refactor …", "wire up the endpoint". Says what to test per layer with the project's test helpers, how to prove the test catches a regression, which commands must pass (tests, changed-file coverage, lint, build) and how to report it.
---

# Test every change, right after writing it

New or changed code is **not done** until, in the same change:

1. it has tests that describe its behaviour (§2, §3);
2. those tests fail without the change (§4);
3. `npm test`, the changed-file coverage check, `npm run lint` and `npm run build` pass (§5);
4. the final message says what was tested (§6).

No "tests later", no "too small to test". If something truly cannot be unit
tested, say so explicitly and verify it another way (§5.4).

The test stack and helpers are described in `AGENTS.md` → "Tests" and in the
**library-first** skill → "Testing"; UI changes additionally follow the
**design-system** skill's browser verification.

## 1. Order of work

1. Write the code (library-first, design-system rules apply).
2. Write the tests next to it (`*.test.ts(x)` in a `__test__/` folder next to the file) — or first, for a bug fix (§4).
3. Iterate fast on just the affected tests: `npx vitest related <changed files> --run`.
4. Prove the tests bite (§4), then run the full gate (§5).

## 2. What to test, per layer

| You changed | Test it in | Assert |
|---|---|---|
| A type / enum / limit shared with the server (`src/types/api`) | `src/types/api/__test__/contract.test.ts` | the exact values, with the server source (migration `CHECK`, Rust constant) in the test name |
| A service method (`src/services/*.service.ts`) | a row in the table in `src/services/__test__/services.test.ts` (its "covers every service method" test fails until you add it) | HTTP method, path, query, JSON body, returned value; special bodies (multipart, `DELETE` with body) get their own test |
| A hook (`src/hooks/use<Feature>.ts`) | `src/hooks/__test__/use<Feature>.test.tsx` | the request it sends (`capture`), when it stays idle (guest / no id / wrong role → `fetchStatus: 'idle'`), what it writes to the cache (`getQueryData`), what it invalidates and what it must **not** (`seed` + `isInvalidated`), error states |
| A helper in `src/lib` | `src/lib/__test__/<name>.test.ts` | inputs → outputs including edge cases; env-dependent code via `vi.stubEnv` + `vi.resetModules` + `await import()` |
| A store (`src/stores`) | `src/stores/__test__/<name>.test.ts` | state transitions, persistence (`localStorage`), restoring on load (`vi.resetModules`) |
| i18n keys / config | `src/i18n/__test__/i18n.test.ts` | the key exists in all three locales; switching languages works |
| A component / screen | `src/components/ui/__test__/<area>.test.tsx` (DS) or `__test__/<Component>.test.tsx` next to it | renders from props/hook data, user interactions, loading / empty / error states; plus the design-system browser check at phone and desktop sizes. Use `@testing-library/user-event` + `jest-dom` matchers (installed). A DS component also needs a `<Name>.stories.tsx` — `src/components/ui/__test__/stories.test.tsx` renders every story with axe |
| A bug fix | the test file of the layer where the bug lived | a regression test that reproduces the bug (§4) |

### Cases to cover

- **Happy path** with realistic payloads from `src/test/factories.ts`.
- **Empty / missing:** `null` fields, empty lists, missing ids (`undefined`), empty strings.
- **Errors:** 401 with and without a token, 403, 404, 422 `{ error, constraint }`, 500 plain string, network error — via `capture(method, path, body, status)`.
- **Auth & roles:** guest vs signed-in (`useAuthStore.getState().setAuth(authUser())`), `user` vs `moderator`/`admin` (answer `/api/user/me` with `userProfile({ role })`).
- **Boundaries:** server limits and caps (page sizes, offset caps, max lengths), comma-separated arrays, `0` / `false` values that must not be dropped.
- **Cache side-effects:** every key a mutation should refresh, and a sibling key it must leave alone.

## 3. How to write them

- **Through the public surface:** services via their methods, hooks via `renderQueryHook` / `runMutation`, never by reaching into internals or library state.
- **HTTP only through MSW:** `capture()` from `src/test/server.ts`; for dynamic answers `server.use(http.get(\`${API}/…\`, resolver))`. An unhandled request fails the test — that is intended, don't bypass it.
- **No sleeps:** wait with `waitFor`; for timers use `vi.useFakeTimers()`.
- **Deterministic:** factories, fixed ids/dates; no real time zones or randomness in assertions.
- **One behaviour per test**, named as the behaviour (`'stays idle for guests'`, not `'test 3'`).
- **Typed:** no `any` / `as any` / eslint-disable in tests; heterogeneous `it.each` rows become typed closures (see `runMutation` usage in `src/hooks/__test__/*.test.tsx`).
- **Never** delete, skip (`it.skip`), weaken (`toBeTruthy` instead of the real value) or comment out a failing test to get green — fix the code, or stop and explain why the expectation changed. No `it.only` left behind.
- Known traps: with React 19 don't wrap `fetchNextPage()` in `act()` (call it, then `await waitFor`); MSW 3 option is `onUnhandledFrame`; jsdom runs on the API origin (`http://api.test`) because its XHR enforces CORS; multipart bodies are read by the helper's own parser.

## 4. Prove the tests catch a regression

A test that passes with and without the change proves nothing.

- **Bug fix:** write the regression test first, run it, and see it **fail** for the reported reason; then fix and see it pass.
- **New code:** after the tests pass, break the new code on purpose (invert a condition, drop an invalidation, change a path) and run `npx vitest related <file> --run` — at least one test must fail. Restore the code and re-run.

## 5. The gate — all must pass

```bash
npx vitest related <changed files> --run
```

```bash
npm test
```

```bash
npm run coverage
```

```bash
node .claude/skills/test-after-change/changed-coverage.mjs
```

The last command lists every source file changed since `origin/master`
(committed, staged, unstaged and new) with its line / branch / function
coverage and exits 1 if any of them is below 100% — the project is at 100%,
keep it there. Pass another base as the first argument (`HEAD` for only the
uncommitted work). Uncovered lines are in `coverage/index.html`.

```bash
npm run lint
```

```bash
npm run build
```

### 5.4 Beyond unit tests

- **UI:** the design-system skill §5 — screenshots + `layout-check.js` at 375/320/1440.
- **API contracts:** when types or services change for a new/changed server route, compare them with the running server's spec (`http://localhost:8080/api-docs/openapi.json`, UI at `/scalar`) — field names, nullability, required-ness.
- **Google Maps / Places:** unit tests mock `useMapsLibrary`; check the real behaviour in the browser with a key in `.env` when the change depends on Google's response.
- Can't run something (no browser, no server, no key)? Say exactly what was not verified.

## 6. Report

In the final message, list:

- the test files added/changed and what they cover (one line each);
- the results: test count, `changed-coverage.mjs` output (files at 100%), lint/build status;
- how the regression check (§4) went;
- anything not verified and why.

## 7. Checklist

- [ ] Every changed source file has tests for its behaviour (§2) — including error, empty and auth/role cases.
- [ ] Bug fixes have a regression test that failed before the fix.
- [ ] Breaking the new code makes a test fail (§4).
- [ ] `npm test`, `changed-coverage.mjs` (100%), `npm run lint`, `npm run build` all green.
- [ ] No skipped / `.only` / weakened / `any`-cast tests.
- [ ] UI and contract changes verified beyond unit tests, or the gap is stated.
