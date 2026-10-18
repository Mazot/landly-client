#!/usr/bin/env node
// Local "patch coverage": coverage of the source files changed on this branch.
// Run `npm run coverage` first, then from the repo root:
//
//   node .claude/skills/test-after-change/changed-coverage.mjs [base]
//
// `base` defaults to origin/master. Changed = committed since the merge-base,
// staged, unstaged and untracked files under src/ (tests, test helpers and
// files excluded from coverage are skipped). Exits 1 when a changed file is
// not at 100% lines/branches/functions or has no coverage entry at all.
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const base = process.argv[2] ?? 'origin/master'
const root = process.cwd()
const summaryPath = path.join(root, 'coverage', 'coverage-summary.json')

if (!existsSync(summaryPath)) {
  console.error('coverage/coverage-summary.json not found — run `npm run coverage` first.')
  process.exit(2)
}

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).split('\n').filter(Boolean)

let mergeBase
try {
  mergeBase = git('merge-base', 'HEAD', base)[0]
} catch {
  console.error(`Cannot find the merge-base with ${base} — pass another base, e.g. HEAD.`)
  process.exit(2)
}

const changed = new Set([
  ...git('diff', '--name-only', '--diff-filter=d', mergeBase),
  ...git('ls-files', '--others', '--exclude-standard'),
])

// Same exclusions as vite.config.ts → test.coverage.exclude.
const isSource = (file) =>
  /^src\/.*\.(ts|tsx)$/.test(file) &&
  !/\.test\.tsx?$/.test(file) &&
  !file.startsWith('src/test/') &&
  file !== 'src/main.tsx' &&
  !file.endsWith('.d.ts')

const files = [...changed].filter(isSource).sort()
if (files.length === 0) {
  console.log(`No changed source files under src/ since ${base}.`)
  process.exit(0)
}

const summary = JSON.parse(readFileSync(summaryPath, 'utf8'))
const metrics = ['lines', 'branches', 'functions']
let failing = 0

for (const file of files) {
  const entry = summary[path.join(root, file)]
  if (!entry) {
    failing++
    console.log(`✗ ${file} — no coverage data (never imported by a test?)`)
    continue
  }
  const gaps = metrics.filter((m) => entry[m].total > 0 && entry[m].pct < 100)
  if (gaps.length) failing++
  const detail = metrics.map((m) => `${m} ${entry[m].covered}/${entry[m].total}`).join(', ')
  console.log(`${gaps.length ? '✗' : '✓'} ${file} — ${detail}`)
}

console.log(
  failing
    ? `\n${failing} of ${files.length} changed file(s) not fully covered — see coverage/index.html for the lines.`
    : `\nAll ${files.length} changed file(s) fully covered.`,
)
process.exit(failing ? 1 : 0)
