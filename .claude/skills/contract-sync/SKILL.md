---
name: contract-sync
description: Check whether landly-server's client-facing API contracts (request/response structs, enums, limits, routes, auth/RBAC, error shapes) changed since the client was last synced, and update landly-client's types, services, hooks, tests and docs to match. Run BEFORE starting any new task in landly-client ("new task", "start work on …", "implement …", "add a screen", "sync with the server", "the API changed", "перед началом задачи", "проверь контракты"). Compares against the sibling `landly-server` folder or its `master` branch.
---

# Contract sync — client follows the server

**Both directions of every endpoint are in scope: the arguments the client sends (path params, query string, JSON/multipart body, headers) AND the response it receives.** A request type that lags the server is as much drift as a response type that does.

The server is the source of truth for everything in `src/types/api`,
`src/services` and `src/hooks`. A task built on stale types compiles, passes
its own mocks and breaks against the real API — so **before the first line of
a new task, find out what the server changed and bring the client up to date**
(own commit, before the task's work).

The check is `check.mjs` (Node + git, no dependencies). It compares the
server's contract files against the commit stored in `synced-with.json` — the
`landly-server` master commit the client was last verified against.

## 0. Pick the server source

| Source | Command flag | Use when |
|---|---|---|
| **`master`** of the `landly-server` repo (default) | none (it runs `git fetch origin master` first) | normal case: only merged server work is a contract |
| **the folder** `../landly-server` as it is on disk | `--source folder` | the task depends on server work not merged yet (a branch / uncommitted change the user points at); also when offline |

The server checkout is `../landly-server` (sibling of this repo); override with
`--server <dir>` or `LANDLY_SERVER_DIR`. Never edit the server from here, and
never `git checkout`/`pull` in it — the check only reads (`fetch` is the single
write, to remote-tracking refs). If the user did not say which source, use
`master`; say which one you used.

## 1. Run the check

```bash
node .claude/skills/contract-sync/check.mjs
```

```bash
node .claude/skills/contract-sync/check.mjs --source folder
```

Output: the target (`origin/master @ sha` or the working tree + branch/dirty
count), the changed contract files **grouped per server feature** with the
client files each one maps to, then a **route cross-check** (every server route
vs every `apiClient` call in `src/services`). Exit code `0` = nothing to do,
`1` = changes or route mismatches, `2` = could not run (read the message:
missing checkout, unknown stamp commit, no `synced-with.json`).

- **Exit 0 and the route check is clean** → say "contracts in sync with
  server master @ <sha>" in one line and go on with the task. Don't move the
  stamp for nothing unless the server moved (then `--stamp`, §6).
- **Anything else** → continue with §2.

The route cross-check is independent of the stamp, so it also catches a wrong
stamp: a `✗` (client calls a route the server doesn't have) is always a bug to
fix; a `?` (server route no service calls) is either a new endpoint to wire up
or intentionally unused (browser-navigation routes are already skipped) —
decide each, don't ignore.

### Arguments and responses, field by field

`check.mjs --args` (also part of the default run) parses every server request
struct (`requests.rs`, plus request structs kept in `controllers.rs`) and
response struct (`presenters.rs`, `ToSchema`) and compares each field with
`src/types/api/<feature>.ts`:

- `✗` a server field the client does not declare (new field — add it);
- `≠` optionality differs: request `Option`/default → `?:`; response `Option` →
  `T | null` (`?:` only when `skip_serializing_if`); required → neither;
- `? … no server struct declares` client properties — removed/renamed on the
  server, or client-only/JSON-document keys (moderation `flags`, doc-comment
  words, multipart `file`): check each, delete the stale ones.

It checks names and optionality, **not types or ranges**, so also compare by
hand: field types and enum variants (`Option<String>` validated by
`TryFrom`), query defaults and caps (`.unwrap_or(20).clamp(0, 100)` in
`controllers.rs` ↔ the doc comment on the client query type, e.g. "limit
default 20, max 100; offset max 150"), path params, body/multipart shape,
which params are required together (one of two targets, bbox or origin), and
how arrays are sent (comma-separated).

## 2. Read the server diffs

```bash
node .claude/skills/contract-sync/check.mjs --diff organisation
```

```bash
node .claude/skills/contract-sync/check.mjs --diff shared
```

(`--diff` with no name prints everything; `--max-lines` raises the per-file
cap.) Read the real diff, not just the file list. What counts, by file category:

| Category | Files | Look for |
|---|---|---|
| `shape` | `requests.rs` (**arguments**), `presenters.rs` (**responses**), `entities.rs`, `mod.rs` (ApiDoc), `data/models.rs` | added/removed/renamed fields, `Option` ↔ required, `skip_serializing_if`, new/changed enum variants (`as_str`/`TryFrom`), `#[serde(rename…)]` |
| `routes` | `config.rs`, `controllers.rs` | new/removed/renamed routes, path params, query params + defaults/clamps (`clamp`, `unwrap_or`), status codes, multipart/body shape |
| `rules` | `usecases.rs`, `utils/validation.rs` (`limits::*`), `error.rs`, `main.rs`, `middlewares/{auth,rate_limit,cors}.rs` | length caps, new 403/422/429 cases, ownership/role gates (what the UI may offer), `AUTH_REQUIRED_ROUTES`, JSON/upload size caps, rate limits, error body shape |
| `db` | `migrations/*/up.sql` | `CHECK (col IN (...))` → enum values, `varchar(n)`, uniqueness (→ 422 `constraint` names the client matches on) |

Most of `usecases.rs` churn is internal (tests, refactors). Only act on what a
client can observe: a request it can send, a response it receives, a status it
must handle, an action it should offer or hide.

`usecases.rs` diffs include inline `#[cfg(test)]` code — skip it.
If the diff is unclear, the optional ground truth is the running server's spec
(`curl -s http://localhost:8080/api-docs/openapi.json`; port 8080 is usually
the local docker/cargo server — check it runs the same code before trusting it).

## 3. Translate each change into client edits

The conventions are in `AGENTS.md` → "API contracts" (snake_case requests,
camelCase responses, `Option` → `T | null`, `?:` only for skipped fields, enums
as `as const` arrays + union, `ListResponse<T>`, `ServerDateTime`, …) — apply
them, don't re-derive. Work in this order, one server feature at a time:

1. **`src/types/api/<feature>.ts`** — request structs → `*Request`/`*Query` types (snake_case, `?:` for `Option`), response structs → interfaces (camelCase, `| null`) (doc-comment the
   server struct name like the neighbours), enum → `as const` array + union,
   limits → exported constants. Remove what the server removed (don't leave
   dead fields "for compatibility" — the client ships with its server).
2. **`src/types/api/__test__/contract.test.ts`** — update/add the pin for every
   enum value and limit, naming the server source (migration / Rust constant).
3. **`src/services/<feature>.service.ts`** — new/changed/removed routes,
   path params, query shapes and bodies sent (the service must pass every argument the type declares). Add/adjust the row in `src/services/__test__/services.test.ts`
   (its "covers every service method" test fails until you do).
4. **`src/hooks/use<Feature>.ts`** + `src/lib/queryKeys.ts` + `src/lib/invalidation.ts`
   — new queries/mutations; a write that changes server data must invalidate the
   feature root (and any other key the server also changes, e.g. the server
   recomputing `rating_avg` on review writes).
5. **`src/test/factories.ts`** — keep the typed payload builders equal to the
   new response shape (a stale factory hides a stale type).
6. **Consumers** — `npm run typecheck` lists every screen/component/form the
   type change breaks (`src/components/auth/schemas.ts` mirrors server
   validation: update its limits too). Fix the mechanical ones (renames,
   removed fields). A change that needs **UI or product decisions** (new
   required field, removed capability, new role gate on a screen) is not yours
   to invent: make the types/services/hooks correct, list the affected
   screens, and ask the user.
7. **Errors/auth** — a new 4xx the UI should treat specially → `src/lib/errors.ts`
   (+ its test); a new auth/role requirement → hook `enabled` guards.
8. **New server feature** (a `NEW server feature` line in the output) → follow
   AGENTS.md "Adding a new endpoint" end to end, and add the feature to
   `FEATURE_MAP` in `check.mjs`.

Follow the **library-first** skill for anything beyond mechanical edits.

## 4. Test it

Every edit above is code under `src/`, so **test-after-change** applies in full:
contract pins, services table, hook tests, factories — then its gate
(`npm test`, changed-file coverage, `npm run lint`, `npm run build`). Also
`npm run typecheck`. A sync that only touches types still needs the pins and
the service rows.

## 5. Docs

`AGENTS.md` ("API contracts", "Status" if the data-layer description changed),
`README.md` if a listed endpoint/feature changed, and this skill if the
mapping or the procedure changed (`FEATURE_MAP`, `CATEGORIES` and `PATHSPEC` in
`check.mjs` when the server gains a new contract-bearing file kind). Say which
`.md` files you touched.

## 6. Move the stamp

Only when **all** hold: the source was `master` (never stamp from `--source
folder` — that is unmerged work), the client now matches everything the check
reported, and the gate in §4 is green:

```bash
node .claude/skills/contract-sync/check.mjs --stamp
```

This rewrites `synced-with.json` to the current `origin/master` sha. Commit it
together with the sync changes, as a separate commit before the task's own work:
`chore(api): sync contracts with landly-server @ <sha7>`.

If you synced against a server *folder/branch* (unmerged), commit the client
changes but leave the stamp alone — after that branch merges, the next check
against `master` will show the same files again and finish in seconds because
the client already matches (still confirm, then stamp).

## 7. Report

Open the task's first message with a short contract-sync result, e.g.:

```
Contract sync — landly-server master @ 8fdc7a6 (was 6eb1164)
- organisation: +`Organisation.addedBy` doc only — no code change
- user: +USERNAME_MAX_CHARS 50 → types, contract pin, signup schema
- checkin: one per user → unchanged client contract
- routes: 59 server / 57 client, no mismatches
Stamp moved; commit chore(api): sync contracts … (tests, lint, build green).
Needs your call: <screens/decisions>, or "nothing".
```

Always state: the source used (master/folder + sha), what changed in the
contract, what you edited, what is left for the user, and that the stamp moved
(or why not). If you could not run the check (no checkout, offline, stamp
commit missing), say so and stop before the task — don't guess.

## Limits of this check

- `--args` checks field names and optionality only (types, caps and cross-field rules are manual, see §1).
- It reads **source diffs**, not a generated schema: it tells you *where* to
  look and the route table is checked mechanically, but field-level
  correctness is your reading of the Rust diff (or the live OpenAPI spec).
- It only sees files in `PATHSPEC`. Behaviour changed purely in a repository
  or `utils/*.rs` file (e.g. a cache TTL, a new SQL ordering) is invisible —
  if the user mentions such a change, diff those files by hand
  (`git -C ../landly-server diff <stamp>..origin/master -- <path>`).
- The first stamp (server `6eb1164`) was derived from a commit date; the first full sync against master `8fdc7a6` (2026-11-01) verified it line by line and moved the stamp.
