---
name: design-system
description: UI rules for landly-client — build screens ONLY from design-system components and tokens, mobile-first with an adaptive layout, never duplicate an existing component, and always verify the mobile AND desktop layouts in the browser before handing over. Use whenever a task creates or changes anything visible — "add a screen/page", "build a component", "make X look like Y", "fix the layout", "style …", "make it responsive", "port the design". Pair with the library-first skill for packages.
---

# Design system, mobile-first, verified

Three rules, plus a mandatory check:

1. **Only design-system (DS) components and tokens.** Screens are composed of
   DS components; visual styling lives inside the DS, not in screens.
2. **Never duplicate a component.** Find the existing one first; extend it
   with a variant instead of writing a second one.
3. **Mobile-first, adaptive.** Phone layout is the base; larger breakpoints
   *change* the layout (not just stretch it).
4. **Verify mobile and desktop in the browser** (§5) — every time, before
   saying the UI is done.

## 1. Where the design system lives

| Layer | Location | Contains |
|---|---|---|
| Tokens | `tailwind.config.ts` (`theme.extend`) + the `:root` CSS variables in `src/index.css` | colours, fonts, radii, shadows — keep both files in sync |
| DS components | `src/components/ui/` | primitives (Button, TextField, Chip, Sheet, Card, …) — the **only** place with visual styling |
| Inventory | `src/components/ui/index.ts` (barrel) | every DS component is exported here; this file is the list you check first |
| Feature components | `src/components/<feature>/` | domain blocks (OrganisationCard, MapFilters, …) composed from DS components |
| Screens | `src/pages/` | routes; compose feature + DS components |

The old components were removed with the previous design, so `src/components/ui/`
starts empty: the first screens create the primitives there (with the barrel)
— never inline in a page.

Tokens available today (Tailwind class → use):

- Surfaces: `bg-bg`, `bg-bg-sunken`, `bg-surface`, `bg-surface-2`, `bg-surface-elev`
- Text: `text-ink-1` (primary) … `text-ink-4` (placeholder)
- Borders: `border-border-1`, `border-border-2`, `border-border-strong`
- Brand: `bg-accent`, `hover:bg-accent-hover`, `bg-accent-soft`, `bg-accent-tint`
- Semantic: `success`, `success-soft`, `warning`, `warning-soft`, `danger`, `info`, `info-soft`
- Org types (badges, pins): `type-embassy|business|helper|community|volunteer` and `…-soft`; prefer the server's `OrganisationType.color` when present
- Map fills: `country-1` … `country-7`, `country-water`
- Fonts: `font-sans` (Manrope), `font-display` (Instrument Serif), `font-mono`
- Radii: `rounded-r1` 6 · `r2` 10 · `r3` 14 · `r4` 20 · `rounded-full` (pill)
- Shadows: `shadow-1`, `shadow-2`, `shadow-3`, `shadow-pop`
- Opacity modifiers work on tokens: `bg-ink-1/28`, `bg-surface/85`
- **Do not use** the legacy `primary-*` palette (kept only for pre-v2 code).

## 2. Rule 1 — compose from the DS

In `src/pages/` and `src/components/<feature>/`:

- **Allowed:** DS components, plus Tailwind **layout** utilities — `flex`, `grid`,
  `gap-*`, `p-*`/`m-*`, `w-*`/`max-w-*`/`min-w-0`, `order-*`, `hidden`/`block`
  at breakpoints, `sticky`/`fixed` positioning, `overflow-*`.
- **Not allowed:** visual styling outside `src/components/ui/` — colours,
  borders, radii, shadows, font sizes/weights/families. Need a new look → it is
  a DS variant.
- No styled raw interactive HTML in screens: `<button>`, `<input>`, `<select>`,
  `<textarea>`, styled `<a>` → the DS component (`Button`, `TextField`, `Link`, …).
- Tokens only: no hex/rgb/hsl values, no arbitrary values (`text-[13px]`,
  `bg-[#fff]`, `w-[337px]`) — the one exception is `env(safe-area-inset-*)`.
  No inline `style={{ color }}`; dynamic data colours (org type from the
  server) go through a DS component prop.
- DS components expose **variants/sizes as props** (`variant="accent"`,
  `size="sm"`); their `className` prop is for layout only (margins, width,
  grid placement), never to restyle them.

Inside `src/components/ui/`:

- Build from tokens only (same restrictions on hex/arbitrary values).
- Each component: one file, typed props, a one-line doc comment (purpose +
  variants), exported from `index.ts`.
- Interactive primitives handle focus-visible styles, disabled state, `aria-*`,
  and a ≥44×44 px hit area on touch.
- Complex behaviour (focus trap, popover positioning, sheet gestures, virtual
  lists, forms) comes from a package per the **library-first** skill — the DS
  component wraps it with tokens.

## 3. Rule 2 — don't duplicate

Before writing any component:

1. Read `src/components/ui/index.ts` and list `src/components/**`.
2. Search by role and synonyms, not only by name:

   ```bash
   grep -rliE "button|btn|chip|pill|tag|badge|sheet|drawer|modal|dialog|popover|tooltip|card|avatar|input|field|select|tabs|toggle|switch|toast|skeleton|spinner|empty" src/components 2>/dev/null || echo "no components yet"
   ```

3. Similar component exists → add a variant/prop to it (and update every
   use if the API changes). Don't copy it into a feature folder.
4. Nothing similar → create it **in `src/components/ui/`**, export it from
   `index.ts`, then use it. A one-off "local" button/card inside a page is a
   duplicate by definition.
5. Deleted pre-v2 components are in git history
   (`git log --diff-filter=D --name-only -- src/components`); they're
   reference for intent only — rebuild on the current tokens, don't restore.

## 4. Rule 3 — mobile-first, adaptive

**Breakpoints** (Tailwind 4 defaults, no overrides): unprefixed = phone
(from 320 px) · `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280 · `2xl` 1536.
Write the phone layout first, then add `md:` / `lg:` changes. `max-*:`
variants only for a rare phone-only exception.

**Adaptive patterns** — default unless the design says otherwise:

| Element | Phone (< `md`) | Tablet (`md`) | Desktop (`lg`+) |
|---|---|---|---|
| Navigation | bottom tab bar | bottom bar or top bar | top bar / side nav |
| Map screen | full-bleed map + draggable bottom sheet for results | map + bottom sheet or side panel | side panel (list/details) + map |
| Dialogs, pickers, filters | bottom sheet, full-width | centred modal | centred modal / popover |
| Lists of places/people | 1 column | 2 columns | 2–3 columns or list + detail |
| Primary action | sticky bottom bar (safe-area aware) | inline | inline |
| Tables | stacked cards | cards or table | table |

**Mechanics:**

- Fluid sizes: `w-full`, `max-w-*` + `mx-auto` for content width, `min-w-0`
  on flex children so long names truncate (`truncate` / `line-clamp-*`); no
  fixed pixel widths for containers.
- Full-height screens: `min-h-dvh` / `h-dvh`, never `h-screen` (100vh hides
  behind mobile browser bars).
- Fixed top/bottom bars: pad with `pt-[env(safe-area-inset-top)]` /
  `pb-[env(safe-area-inset-bottom)]`, and add `viewport-fit=cover` to the
  viewport meta in `index.html` the first time one is introduced.
- Touch: hit areas ≥ 44×44 px (`size-11` / `min-h-11`); `touch-manipulation`
  on tappable elements; `pointer-coarse:` for touch-only tweaks.
- No hover-only affordances: anything revealed on hover must also be
  reachable by tap (Tailwind 4 `hover:` only applies on hover-capable devices).
- Inputs at `text-base` (16 px) or larger — smaller text makes iOS zoom in.
- Scroll containers inside sheets: `overflow-y-auto overscroll-contain`.
- Components that sit in both narrow and wide slots (a card in the phone list
  and in the desktop side panel) use container queries: `@container` on the
  slot, `@md:` variants inside.
- Images: `w-full h-auto`, `loading="lazy"`, meaningful `alt` (or `alt=""`).
- Respect `motion-reduce:` for animations.
- Copy is translated (`en`/`ru`/`uk`); Russian/Ukrainian strings are longer —
  layouts must survive them.

### Re-check a class before using it

Tailwind silently ignores unknown classes. Confirm a token/utility exists in
the installed version with the project config (run from the repo root):

```bash
node --input-type=module -e "
import { compile } from '@tailwindcss/node'
import fs from 'node:fs'
const c = await compile(fs.readFileSync('src/index.css', 'utf8'), { base: process.cwd() + '/src', onDependency() {} })
let len = c.build([]).length
for (const cl of process.argv.slice(1)) { const n = c.build([cl]).length; console.log(cl, n > len ? 'ok' : 'NOT GENERATED'); len = n }
" bg-surface-2 rounded-r3 min-h-dvh
```

## 5. Verify mobile and desktop — mandatory

After every UI change, check each touched screen in the Browser pane.

1. **Run the app.** `npm run dev` in the background (or `preview_start` with the
   `dev` config of `.claude/launch.json` when the session's folder is
   landly-client), then open `http://localhost:5173/<route>`.
2. **Viewports** (`resize_window`):

   | Viewport | How | Required |
   |---|---|---|
   | 375×812 phone | `preset: "mobile"` | yes |
   | 320×640 smallest phone | `width: 320, height: 640` | yes for new screens |
   | 768×1024 tablet (`md`) | `preset: "tablet"` | yes when the layout changes at `md` |
   | 1024×768 (`lg` boundary) | `width: 1024, height: 768` | yes when the layout changes at `lg` |
   | 1440×900 desktop | `width: 1440, height: 900` | yes — `preset: "desktop"` is only the pane's width |

3. **At each viewport:**
   - take a screenshot and look at it (spacing, alignment, truncation, nothing hidden or overlapping);
   - run [layout-check.js](layout-check.js) via `javascript_tool` — `pageScrollsHorizontally` must be `false` and every list empty (tap targets and input sizes are enforced below 1024 px);
   - `read_console_messages` with `onlyErrors: true` — no new errors;
   - open the interactive states: sheets/modals/menus, focus a field, loading/empty/error states, long names, and switch the language to `ru`/`uk` (`localStorage.setItem('i18nextLng', 'ru')` + reload).
4. Finish with `resize_window` `preset: "desktop"` to reset the emulation.
5. **Report** per screen × viewport what was checked and what was fixed. If the
   browser could not be used or a viewport was skipped, say so explicitly —
   never describe an unverified layout as working.

### Components: verify in Storybook

DS components have no route — check them in Storybook: `npm run storybook` in the
background, then open a single story at
`http://localhost:6006/iframe.html?id=<story-id>&viewMode=story` (ids are in
`http://localhost:6006/index.json`; add `&globals=locale:ru` for Russian). Use the same
viewports and `layout-check.js` as above. To sweep every story at once, load each id in
an `<iframe>` of the target width on that page and run the layout-check logic on
`iframe.contentWindow` (a story is rendered when its `<body>` has `sb-show-main`).
`stories.test.tsx` already guards rendering errors and axe; the browser pass catches
layout (overflow, tap targets, wrapping of long ru/uk copy).

## 6. Checklist before handing over

- [ ] Screen built only from DS components; visual styling only in `src/components/ui/`.
- [ ] No hex/arbitrary values, no `primary-*`, no inline visual styles; new classes re-checked (§4).
- [ ] No duplicate component — existing one reused or extended; new primitives live in `src/components/ui/` and are exported from `index.ts`.
- [ ] Phone layout is the base; `md`/`lg` change the layout per §4.
- [ ] 375, 320 (new screens), 1440 (+768/1024 when relevant) checked with screenshots, `layout-check.js` clean, console clean, viewport reset.
- [ ] Components and screens have tests per the **test-after-change** skill (render, interactions, loading/empty/error states); every new DS component has a story.
