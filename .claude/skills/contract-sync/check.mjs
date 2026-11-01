#!/usr/bin/env node
// Contract drift check: what changed in landly-server's client-facing API since
// the commit this client was last synced with (synced-with.json)?
//
//   node .claude/skills/contract-sync/check.mjs                 # summary vs origin/master
//   node .claude/skills/contract-sync/check.mjs --source folder # summary vs the working tree of ../landly-server
//   node .claude/skills/contract-sync/check.mjs --diff organisation   # + the actual diffs of one feature
//   node .claude/skills/contract-sync/check.mjs --diff                # + the diffs of everything
//   node .claude/skills/contract-sync/check.mjs --routes        # route table: server vs src/services
//   node .claude/skills/contract-sync/check.mjs --args          # fields of every server request/response struct vs src/types/api (names + optionality)
//   node .claude/skills/contract-sync/check.mjs --stamp         # record origin/master as synced (after the client was updated)
//
// Options: --server <dir> (default ../landly-server or $LANDLY_SERVER_DIR), --no-fetch,
//          --since <sha> (override the stamp for one run), --max-lines <n> (per diff, default 400).
// Exit code: 0 = no contract changes, 1 = changes (or route mismatches) found, 2 = could not run.
// Needs only git and Node — no dependencies.
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const CLIENT = resolve(HERE, '../../..')
const STAMP_FILE = join(HERE, 'synced-with.json')

// ---- args -----------------------------------------------------------------
const argv = process.argv.slice(2)
const flag = (name) => argv.includes(name)
const value = (name) => {
  const i = argv.indexOf(name)
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : undefined
}
const source = value('--source') ?? 'master'
const SERVER = resolve(value('--server') ?? process.env.LANDLY_SERVER_DIR ?? join(CLIENT, '../landly-server'))
const maxLines = Number(value('--max-lines') ?? 400)
const wantDiff = flag('--diff')
const diffFeature = value('--diff')

const die = (msg) => {
  console.error(`contract-sync: ${msg}`)
  process.exit(2)
}
if (!['master', 'folder'].includes(source)) die(`--source must be "master" or "folder", got "${source}"`)
if (!existsSync(join(SERVER, '.git'))) die(`landly-server checkout not found at ${SERVER} (use --server <dir>)`)

const git = (...args) =>
  execFileSync('git', ['-C', SERVER, ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
const gitOk = (...args) => {
  try {
    git(...args)
    return true
  } catch {
    return false
  }
}

// ---- which server tree are we reading --------------------------------------
const REF = 'origin/master'
if (source === 'master' && !flag('--no-fetch')) {
  try {
    execFileSync('git', ['-C', SERVER, 'fetch', '--quiet', 'origin', 'master'], { stdio: 'pipe' })
  } catch (e) {
    console.warn(`warning: git fetch origin master failed (${String(e.message).split('\n')[0]}) — using the local ${REF}`)
  }
}
if (source === 'master' && !gitOk('rev-parse', '--verify', '--quiet', REF)) die(`${REF} does not exist in ${SERVER}`)

const targetSha = git('rev-parse', source === 'master' ? REF : 'HEAD').trim()
const listFiles = (dir) =>
  source === 'master'
    ? git('ls-tree', '-r', '--name-only', REF, '--', dir).split('\n').filter(Boolean)
    : git('ls-files', '--cached', '--others', '--exclude-standard', '--', dir).split('\n').filter(Boolean)
const readFile = (path) =>
  source === 'master' ? git('show', `${REF}:${path}`) : readFileSync(join(SERVER, path), 'utf8')

// ---- stamp -------------------------------------------------------------------
if (flag('--stamp')) {
  if (source !== 'master') die('--stamp records a merged master commit; run it without --source folder')
  const date = git('log', '-1', '--format=%cI', REF).trim()
  writeFileSync(STAMP_FILE, JSON.stringify({ sha: targetSha, serverCommitDate: date, ref: REF }, null, 2) + '\n')
  console.log(`stamped: client is in sync with landly-server ${REF} @ ${targetSha.slice(0, 10)} (${date})`)
  process.exit(0)
}

const stamp = existsSync(STAMP_FILE) ? JSON.parse(readFileSync(STAMP_FILE, 'utf8')) : null
const since = value('--since') ?? stamp?.sha
if (!flag('--routes') && !since) {
  die('no synced-with.json yet — pass --since <server sha> once, or run --stamp after verifying the client by hand')
}

// ---- what counts as a client-facing contract --------------------------------
// category → why it matters for the client
const CATEGORIES = [
  [/^src\/app\/features\/[^/]+\/(requests|presenters|entities)\.rs$/, 'shape', 'request/response structs, enums'],
  [/^src\/app\/features\/[^/]+\/mod\.rs$/, 'shape', 'OpenAPI ApiDoc (paths + schemas)'],
  [/^src\/app\/features\/[^/]+\/(config|controllers)\.rs$/, 'routes', 'routes, params, status codes'],
  [/^src\/app\/features\/[^/]+\/usecases\.rs$/, 'rules', 'validation, RBAC, error statuses'],
  [/^migrations\/.*\/up\.sql$/, 'db', 'CHECK constraints → enum pins, column limits'],
  [/^src\/(utils\/validation|error)\.rs$/, 'rules', 'input limits, error body shape'],
  [/^src\/data\/models\.rs$/, 'shape', 'shared models (common feature)'],
  [/^src\/main\.rs$/, 'rules', 'configure_api, JSON/multipart limits, OpenAPI merge'],
  [/^src\/app\/drivers\/middlewares\/(auth|rate_limit|cors)\.rs$/, 'rules', 'auth-required routes, rate limits, CORS'],
]
const PATHSPEC = [
  'src/app/features/*/requests.rs',
  'src/app/features/*/presenters.rs',
  'src/app/features/*/entities.rs',
  'src/app/features/*/mod.rs',
  'src/app/features/*/config.rs',
  'src/app/features/*/controllers.rs',
  'src/app/features/*/usecases.rs',
  'migrations/*/up.sql',
  'src/utils/validation.rs',
  'src/error.rs',
  'src/data/models.rs',
  'src/main.rs',
  'src/app/drivers/middlewares/auth.rs',
  'src/app/drivers/middlewares/rate_limit.rs',
  'src/app/drivers/middlewares/cors.rs',
]

// server feature dir → client files to look at
const FEATURE_MAP = {
  common: { types: 'common.ts', service: 'common.service.ts', hooks: 'useCommon.ts' },
  corridor: { types: 'corridor.ts', service: 'corridor.service.ts', hooks: 'useCorridors.ts' },
  country_connection: {
    types: 'countryConnection.ts',
    service: 'country-connection.service.ts',
    hooks: 'useCountryConnections.ts',
  },
  healthcheck: { service: 'healthcheck.service.ts' },
  images: { types: 'image.ts', service: 'image.service.ts', hooks: 'useImages.ts' },
  moderation: { types: 'moderation.ts', service: 'moderation.service.ts', hooks: 'useModeration.ts' },
  organisation: { types: 'organisation.ts', service: 'organisation.service.ts', hooks: 'useOrganisations.ts' },
  person: { types: 'person.ts', service: 'person.service.ts', hooks: 'usePeople.ts' },
  report: { types: 'report.ts', service: 'report.service.ts', hooks: 'useReports.ts' },
  review: { types: 'review.ts', service: 'review.service.ts', hooks: 'useReviews.ts' },
  saved: { types: 'saved.ts', service: 'saved.service.ts', hooks: 'useSaved.ts' },
  user: { types: 'user.ts', service: 'user.service.ts', hooks: 'useUser.ts + useAuth.ts' },
}
const clientFiles = (f) => {
  const m = FEATURE_MAP[f]
  if (!m) return [`NEW server feature "${f}" — no client mapping: add types/service/hook/tests (AGENTS.md → "Adding a new endpoint"), then add it to FEATURE_MAP in check.mjs`]
  return [
    m.types && `src/types/api/${m.types}`,
    m.service && `src/services/${m.service}`,
    m.hooks && `src/hooks/${m.hooks}`,
  ].filter(Boolean)
}
const SHARED_CLIENT = {
  db: 'src/types/api/__test__/contract.test.ts (+ the enum const arrays in src/types/api/*.ts)',
  rules: 'src/types/api/*.ts limits/constants, src/lib/errors.ts, src/components/auth/schemas.ts, src/test/factories.ts',
}

const featureOf = (path) => path.match(/^src\/app\/features\/([^/]+)\//)?.[1] ?? null
const categoryOf = (path) => CATEGORIES.find(([re]) => re.test(path))

// ---- routes: server vs client services ---------------------------------------
const norm = (p) => p.replace(/\$\{[^}]*\}/g, '{}').replace(/\{[^}]*\}/g, '{}').replace(/\/+$/, '')

// Routes the browser opens by navigation (redirectTo), not through axios.
const NAVIGATION_ROUTES = new Set(['GET /api/user/oauth/google/login', 'GET /api/user/oauth/google/callback'])

function serverRoutes() {
  const routes = [{ method: 'GET', path: '/api/healthcheck', feature: 'healthcheck' }]
  for (const file of listFiles('src/app/features').filter((f) => f.endsWith('/config.rs'))) {
    const feature = featureOf(file)
    const text = readFile(file)
    const scope = text.match(/web::scope\(\s*"([^"]*)"\s*\)/)?.[1]
    if (scope === undefined) continue
    // `.route("/x", web::post()` — the method call may sit on a later line, after comments or inside a wrapper like `cached(…)`
    const re = /\.route\(\s*"([^"]*)"\s*,((?:(?!\.route\()[\s\S]){0,300}?)web::(get|post|put|delete|patch)\(\)/g
    for (const m of text.matchAll(re)) {
      routes.push({ method: m[3].toUpperCase(), path: `/api${scope}${m[1]}`, feature })
    }
  }
  return routes
}

function clientCalls() {
  const dir = join(CLIENT, 'src/services')
  const calls = []
  for (const name of readdirSync(dir).filter((n) => n.endsWith('.service.ts'))) {
    const text = readFileSync(join(dir, name), 'utf8')
    // path helpers: const claimPath = (token) => `/api/person/claim/${token}`
    const helpers = {}
    for (const h of text.matchAll(/const (\w+) = \([^)]*\)(?::\s*string)? =>\s*`(\/api[^`]*)`/g)) helpers[h[1]] = h[2]
    const expand = (p) => p.replace(/\$\{(\w+)\([^}]*\)\}/g, (all, fn) => helpers[fn] ?? all)
    // apiClient.get('/api/x')  /  apiClient.post(`/api/x/${id}`)  /  apiClient.get(claimPath(token))
    const re = /apiClient\s*\.\s*(get|post|put|delete|patch)\s*(?:<[^>]*>)?\(\s*(?:(['"`])((?:\/api|\$\{\w+\()[^'"`]*)\2|(\w+)\()/g
    for (const m of text.matchAll(re)) {
      const path = m[3] !== undefined ? expand(m[3]) : helpers[m[4]]
      if (path) calls.push({ method: m[1].toUpperCase(), path: path.split('?')[0], file: name })
    }
  }
  return calls
}

function routesReport() {
  const srv = serverRoutes()
  const cli = clientCalls()
  const key = (r) => `${r.method} ${norm(r.path)}`
  const srvKeys = new Set(srv.map(key))
  const cliKeys = new Set(cli.map(key))
  const clientOnly = cli.filter((r) => !srvKeys.has(key(r)))
  const serverOnly = srv.filter((r) => !cliKeys.has(key(r)) && !NAVIGATION_ROUTES.has(`${r.method} ${r.path}`))
  console.log(`\nRoutes (${source === 'master' ? REF : 'working tree'} @ ${targetSha.slice(0, 10)}): ${srv.length} on the server, ${cli.length} client calls`)
  console.log(`\n  Client calls with NO matching server route — removed/renamed/typo (fix these):`)
  for (const r of clientOnly) console.log(`    ✗ ${r.method} ${r.path}   (src/services/${r.file})`)
  if (!clientOnly.length) console.log('    none')
  console.log(`\n  Server routes not called by any service — new, or intentionally unused (decide each):`)
  for (const r of serverOnly) console.log(`    ? ${r.method} ${r.path}   [${r.feature}]`)
  if (!serverOnly.length) console.log('    none')
  return clientOnly.length + serverOnly.length
}


// ---- args & responses: server structs vs src/types/api -------------------------
// Structs that are not part of a JSON contract: the OAuth callback is a browser redirect handled by the server.
const ARGS_IGNORED_STRUCTS = new Set(['OAuthCallbackParams'])
const camel = (n) => n.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase())

/** Structs of a requests.rs (snake_case wire names) or presenters.rs (camelCase via rename_all). */
function parseStructs(text, kind) {
  const out = []
  const re = /((?:[ \t]*(?:#\[[^\n]*\]|\/\/\/[^\n]*)\n)*)pub struct (\w+)\s*\{([\s\S]*?)\n\}/g
  for (const m of text.matchAll(re)) {
    const attrs = m[1]
    if (!/Deserialize|Serialize|ToSchema|IntoParams/.test(attrs)) continue
    if (kind === 'response' && !/ToSchema/.test(attrs)) continue
    const camelCase = /rename_all\s*=\s*"camelCase"/.test(attrs)
    const fields = []
    let pending = []
    for (const raw of m[3].split('\n')) {
      const l = raw.trim()
      if (l.startsWith('#[')) pending.push(l)
      else if (l.startsWith('///') || l === '') continue
      else {
        const f = l.match(/^pub (\w+)\s*:\s*(.+?),?$/)
        if (f) {
          const a = pending.join(' ')
          const rename = a.match(/rename\s*=\s*"([^"]+)"/)?.[1]
          if (!/flatten/.test(a) && (!/serde\(skip\)\s*\]|skip_deserializing/.test(a) || kind === 'response')) {
            fields.push({
              wire: rename ?? (kind === 'response' && camelCase ? camel(f[1]) : f[1]),
              option: /^Option</.test(f[2]),
              skipped: /skip_serializing_if|serde\(default|default\b/.test(a),
              type: f[2],
            })
          }
        }
        pending = []
      }
    }
    out.push({ name: m[2], fields })
  }
  return out
}

/** `name?: type` / `name: type` members of one client types file. */
function clientProps(text) {
  const props = new Map()
  // members on their own line or inline in a union / object type (`{ organisation_id: Uuid; person_id?: never }`)
  for (const m of text.matchAll(/(?:^|[{;,]|\s)(?:readonly )?([A-Za-z_]\w*)(\?)?\s*:\s*([^;\n}]*)/gm)) {
    if (/^(export|import|const|type|interface|return|http|https)$/.test(m[1])) continue
    props.set(m[1], [...(props.get(m[1]) ?? []), { optional: !!m[2], type: m[3] }])
  }
  return props
}

function argsReport() {
  const typesDir = join(CLIENT, 'src/types/api')
  const features = [...new Set(listFiles('src/app/features').map(featureOf).filter(Boolean))].sort()
  const sharedProps = clientProps(readFileSync(join(typesDir, 'shared.ts'), 'utf8'))
  const allProps = new Map()
  for (const n of readdirSync(typesDir).filter((x) => x.endsWith('.ts'))) {
    for (const [k, v] of clientProps(readFileSync(join(typesDir, n), 'utf8'))) allProps.set(k, [...(allProps.get(k) ?? []), ...v])
  }
  const allServerWire = new Set()
  const allClient = new Map()
  let problems = 0
  console.log(`\nArgs & responses (${source === 'master' ? REF : 'working tree'} @ ${targetSha.slice(0, 10)}) — server structs vs src/types/api:`)
  for (const feature of features) {
    const m = FEATURE_MAP[feature]
    const file = m?.types ? join(typesDir, m.types) : null
    const props = file && existsSync(file) ? clientProps(readFileSync(file, 'utf8')) : null
    if (props) for (const [k, v] of sharedProps) props.set(k, [...(props.get(k) ?? []), ...v]) // limit/offset/items/total
    if (file) allClient.set(feature, { file: m.types, props })
    const lines = []
    for (const [kind, name] of [['request', 'requests.rs'], ['request', 'controllers.rs'], ['response', 'presenters.rs']]) {
      const path = `src/app/features/${feature}/${name}`
      if (!listFiles(path).length) continue
      for (const st of parseStructs(readFile(path), kind)) {
        if (ARGS_IGNORED_STRUCTS.has(st.name)) continue
        for (const f of st.fields) {
          allServerWire.add(f.wire)
          if (!props) {
            lines.push(`    ? ${st.name}.${f.wire} — feature has no client types file`)
            continue
          }
          const found = props.get(f.wire) ?? allProps.get(f.wire)
          if (!found) {
            lines.push(`    ✗ ${kind} ${st.name}.${f.wire}${f.option ? ' (optional)' : ''} — missing in ${m.types}`)
            continue
          }
          // optionality: request Option/default → `?:`; response Option → `| null` (or `?:` when skipped)
          const ok = found.some((c) =>
            kind === 'request'
              ? c.optional === (f.option || f.skipped)
              : f.option
                ? f.skipped
                  ? c.optional || /null|unknown/.test(c.type)
                  : /null|unknown/.test(c.type) || c.optional
                : !c.optional && !/\bnull\b/.test(c.type),
          )
          if (!ok) {
            const want = kind === 'request' ? (f.option || f.skipped ? '?:' : 'required') : f.option ? (f.skipped ? '?: / | null' : '| null') : 'required, no null'
            lines.push(`    ≠ ${kind} ${st.name}.${f.wire}: server ${f.type} → client should be ${want}; client has ${found.map((c) => `${c.optional ? '?' : ''}: ${c.type}`).join(' | ')}`)
          }
        }
      }
    }
    if (lines.length) {
      console.log(`\n● ${feature}`)
      lines.forEach((l) => console.log(l))
      problems += lines.filter((l) => !l.includes('?')).length
    }
  }
  // client properties no server struct has (removed/renamed on the server?) — helper types are expected noise
  const stale = []
  for (const [feature, { file, props }] of allClient) {
    if (!props) continue
    for (const name of props.keys()) if (!allServerWire.has(name) && !sharedProps.has(name)) stale.push(`${file}: ${name}`)
  }
  if (stale.length) {
    console.log(`\n  Client properties no server request/response struct declares (verify each: removed on the server, or a client-only helper):`)
    stale.forEach((x) => console.log(`    ? ${x}`))
  }
  if (!problems) console.log('\n  ✓ every server field is declared in the client with matching optionality')
  return problems
}

if (flag('--args')) process.exit(argsReport() ? 1 : 0)

if (flag('--routes')) {
  const problems = routesReport()
  process.exit(problems ? 1 : 0)
}

// ---- drift since the stamp ----------------------------------------------------
if (!gitOk('cat-file', '-e', `${since}^{commit}`)) {
  die(`stamped commit ${since} is not in ${SERVER} — fetch it, or re-stamp (--since <sha>)`)
}
const range = source === 'master' ? [since, REF] : [since]
const names = git('diff', '--name-status', '-M', ...range, '--', ...PATHSPEC)
  .split('\n')
  .filter(Boolean)
  .map((line) => {
    const [status, ...rest] = line.split('\t')
    return { status, path: rest[rest.length - 1] }
  })
if (source === 'folder') {
  for (const p of git('ls-files', '--others', '--exclude-standard', '--', ...PATHSPEC).split('\n').filter(Boolean)) {
    names.push({ status: 'A?', path: p }) // untracked in the working tree
  }
}

console.log(`Server : ${SERVER}`)
if (source === 'master') {
  console.log(`Target : ${REF} @ ${targetSha.slice(0, 10)}`)
} else {
  const branch = git('rev-parse', '--abbrev-ref', 'HEAD').trim()
  const dirty = git('status', '--porcelain').split('\n').filter(Boolean).length
  console.log(`Target : working tree of branch "${branch}" @ ${targetSha.slice(0, 10)}${dirty ? ` (+${dirty} uncommitted files)` : ''}`)
  if (!gitOk('merge-base', '--is-ancestor', since, 'HEAD')) {
    console.log(`WARNING: stamp ${since.slice(0, 10)} is not an ancestor of this branch — the branch is behind/diverged from master, so older-master changes may show up as "removed".`)
  }
  console.log('NOTE   : this is unmerged work — do NOT --stamp from it.')
}
console.log(`Since  : ${since.slice(0, 10)}${stamp?.serverCommitDate && !value('--since') ? ` (${stamp.serverCommitDate})` : ''}`)

const relevant = names.filter((n) => categoryOf(n.path))
if (!relevant.length) {
  console.log('\n✓ No client-facing contract files changed. Nothing to sync.')
  if (source === 'master') console.log('  (run with --stamp to move the sync point to the current master)')
  console.log('\n──── route table cross-check ────')
  const rp = routesReport()
  console.log('\n──── args & responses cross-check ────')
  process.exit(rp || argsReport() ? 1 : 0)
}

const byFeature = new Map()
const shared = []
for (const n of relevant) {
  const f = featureOf(n.path)
  if (f) byFeature.set(f, [...(byFeature.get(f) ?? []), n])
  else shared.push(n)
}

const line = (n) => {
  const [, cat, why] = categoryOf(n.path)
  return `    ${n.status.padEnd(2)} ${n.path}   [${cat}: ${why}]`
}
console.log(`\n${relevant.length} contract file(s) changed in ${byFeature.size} feature(s) + ${shared.length} shared:`)
for (const [f, files] of [...byFeature].sort(([a], [b]) => a.localeCompare(b))) {
  console.log(`\n● ${f}`)
  files.forEach((n) => console.log(line(n)))
  console.log('    client →')
  clientFiles(f).forEach((c) => console.log(`      ${c}`))
}
if (shared.length) {
  console.log('\n● shared (migrations, limits, errors, auth, rate limits, main.rs)')
  shared.forEach((n) => console.log(line(n)))
  const cats = new Set(shared.map((n) => categoryOf(n.path)[1]))
  console.log('    client →')
  for (const c of cats) if (SHARED_CLIENT[c]) console.log(`      ${SHARED_CLIENT[c]}`)
}

if (wantDiff) {
  const picked = relevant.filter((n) => !diffFeature || featureOf(n.path) === diffFeature || (diffFeature === 'shared' && !featureOf(n.path)))
  if (!picked.length) console.log(`\n(no changed files match --diff ${diffFeature})`)
  for (const n of picked) {
    let out
    if (n.status === 'A?') out = `(untracked new file)\n${readFileSync(join(SERVER, n.path), 'utf8')}`
    else out = git('diff', '-U2', '--no-color', ...range, '--', n.path)
    const lines = out.split('\n')
    console.log(`\n──── ${n.path} ────`)
    console.log(lines.slice(0, maxLines).join('\n'))
    if (lines.length > maxLines) console.log(`… ${lines.length - maxLines} more lines (raise --max-lines)`)
  }
} else {
  console.log('\nNext: read the diffs — `node .claude/skills/contract-sync/check.mjs --diff <feature>` (or `--diff shared`).')
}
const routeProblems = (() => {
  console.log('\n──── route table cross-check ────')
  return routesReport()
})()
console.log('\n──── args & responses cross-check ────')
const argProblems = argsReport()
process.exit(relevant.length || routeProblems || argProblems ? 1 : 0)
