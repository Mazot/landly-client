# Landly design system — `src/components/ui`

The only place in the app with visual styling. Screens (`src/pages`) and feature blocks
(`src/components/<feature>`) compose these components and add **layout** utilities only
(see `.claude/skills/design-system/SKILL.md`). Everything is exported from `index.ts`. **Placement:** reusable, purely visual components (no data, no product vocabulary, not a screen frame, no hard-wired product defaults) live in `DS/`; the Landly-specific ones live next to `index.ts` — rule in `.claude/skills/design-system/SKILL.md` §1.

```
src/components/ui/
├── index.ts            # barrel — the inventory; check it before writing a component
├── tokens/
│   ├── tokens.ts       # source of truth: colours, fonts, font sizes, radii, shadows, AVATAR_COLORS
│   └── tokens.css      # the same colours as CSS variables (imported by src/index.css)
├── constants/          # TONES / TONE_CLASSES, ORG_TYPE_CLASSES, STATUS_TONES
├── i18n/               # `ui` namespace (en/ru/uk) — the DS's built-in strings
├── lib/                # internal: shared class fragments, useControllableState, Field/List contexts
├── __test__/           # all DS tests, grouped by area (primitives, display, …); tokens.test.ts fails when tokens.css drifts from tokens.ts
├── DS/                 # reusable, purely visual components (Button, TextField, Sheet, Card, TabBar, Icon + iconPaths, Logo, …), one per file
│   └── stories/        # their Storybook stories: <Name>.stories.tsx
├── stories/            # stories of the product components below + Tokens.stories.tsx
└── <Component>.tsx     # product components: data-aware (Chip, ChipGroup, Tag, TypeTag, StatusBadge, TypeBar, RatingBreakdown, Dropzone, StarInput), domain-specific (CorridorFields, CorridorFlags, OpenStatus, Rating) or screen frames (AuthLayout, MapBackdrop, MapLayout) · map pieces (MapPin, CorridorPill, CorridorBubble, VerifiedMark)
```

`tailwind.config.ts` builds the theme from `tokens.ts`, so a token is added in one place
(plus its CSS variable in `tokens.css` — the test tells you if you forget).

## Conventions

- Variants and sizes are props (`variant="accent"`, `size="sm"`); `className` is for layout only.
- Inputs work controlled (`value` + `onChange`) and uncontrolled (`default*`). Group controls
  (`ChipGroup`, `Segmented`, `RadioGroup`, `ColorSwatches`, `StarInput`) call `onChange` with the value, not an event.
- Radio groups (`Segmented`, `RadioGroup`, `ColorSwatches`, `StarInput`) follow the ARIA pattern: one tab stop, arrows / Home / End move and select (`onRadioGroupKeyDown`, `radioTabIndex` in `lib/internal.ts`).
- Variants set their own border colour — never combine a base `border-transparent` with a variant `border-*` (CSS order, not class order, decides).
- Mobile-first: every interactive element has a ≥ 44 px hit area below `lg`; inputs use 16 px text on phones.
- No text under 12 px. Colours from tokens only; data colours (`avatar_color`, `OrganisationType.color`) go through props.
- Built-in strings live in the `ui` i18n namespace; product copy is passed in by the caller.
- API values come from `@/types/api`: statuses, org type slugs, `IMAGE_CONTENT_TYPES`, `MAX_IMAGE_BYTES`, `MIN_RATING`/`MAX_RATING`.

## Inventory

| Group | Component | Purpose · key props |
|---|---|---|
| Primitives | `Icon` | line icons · `name`, `size`, `filled`, `label` |
| | `Spinner` | `size`, `label` |
| | `Button` | `to` (router link looking like a button), `href` (another site, new tab); `variant` primary · accent · secondary · ghost · success · danger · whatsapp; `size` sm/md/lg; `icon`, `iconRight`, `block`, `loading`; no children → icon button |
| | `IconButton` | `icon`, `label` (required), `variant` plain · outline · floating, `size`, `pressed` |
| | `TextLink` | `to` (router) / `href` / `onClick`; `tone` accent · muted · strong · danger |
| | `Divider` | optional `label` |
| | `InlineStatus` | spinner + message announced as a status ("Signing you in…") |
| | `Logo` | mark + serif wordmark · `size`, `variant` full / mark, `to` (home link) |
| Data | `Avatar` | `name` → initials, `color`, `src`, `size` xs–2xl, `square` |
| | `Badge` / `StatusBadge` | `tone`, `icon`, `size` / `status` (OrganisationStatus · PersonStatus) |
| | `Tag` | services, languages, skills · `orgType` dot, `onRemove` |
| | `TypeTag` | org type · `slug`, `label`, `color` (server), `variant` |
| | `IconTile` | `icon` or emoji child, `tone`, `size` xs–xl, `shape` |
| | `Stars` / `Rating` | `value` / `value` + `count` (ratingAvg, reviewsCount) |
| | `OpenStatus` | `open` (openNow, null → nothing), `hours` |
| | `Meta` | icon + short text |
| | `CorridorFlags` | `from` / `to` flag emoji, `label` |
| | `ImageFrame` | `src`, `alt`, `ratio`, `badge`, `action` |
| | `MapBackdrop` | decorative, still Google world map behind landing / sign-in, a fixed view (`BACKDROP_VIEW`), in the cloud style of `VITE_GOOGLE_MAPS_MAP_ID`; mounted only while on screen · `variant` plain / hero (dimmed below `lg`, readability fade from `lg`), sized by `className`; needs the root `<APIProvider>` |
| | `MapPin` | round map marker coloured by org type · `slug`, `label` (place name), `color` (custom types), `selected` (larger, ring, name above) — a child of `<AdvancedMarker>` |
| | `CorridorPill` / `CorridorBubble` | current corridor as a pill (app bar, dark over the map) · dark summary over the map: `from` / `to` flags, `label`, `title`, `detail`, `onClick` |
| | `VerifiedMark` | the blue check after a verified place's name |
| | `TypeBar` | stacked share bar + legend by org type · `segments` (`slug`, `label`, `count`), `label` |
| | `RatingBreakdown` | reviews per rating, bars scaled to the most common one (star colour) · `rows` (`rating`, `count`, highest first), `label`, `rowLabel` |
| Forms | `Field` | `label`, `optional`, `hint`, `error` — wires id / describedby / invalid into the control · `group` for a control that names itself (ChipGroup, ColorSwatches, Segmented): the label becomes a caption |
| | `TextField` / `SearchField` | `icon`, `leading`, `trailing`, `addon`, `size`, `variant` default · filled · floating; password toggle |
| | `FormNote` | centred muted line under a form · `size` md / sm |
| | `TextArea`, `Select` | `Select`: `options`, `placeholder` (native select) |
| | `Chip` / `ChipGroup` | `selected`, `orgType`, `solid` (selected type fills dark, for filter sheets), `add` / `options`, `multiple`, `value`, `onAdd`, `scroll` (one line, no scrollbar) |
| | `Segmented` | `options` (+`count`), `block`, `size` |
| | `Switch`, `Checkbox`, `RadioGroup` | boolean / boolean + description / one of options |
| | `ColorSwatches`, `StarInput` | pick one colour from `colors` (`colorLabel` gives swatches readable names) · review rating |
| | `Dropzone` | `onFiles`, `onReject` (type / 10 MB like the server), `upload` progress |
| | `Progress`, `StepBar` | upload progress · sign-up steps |
| | `CorridorFields` | `from` / `to` slots (Fields with Selects) joined by the accent arrow · `stackOnPhone` |
| Containers | `Card` | `variant` default · selected · dashed · sunken · elevated, `padding` |
| | `ListItem` / `List` / `ToggleRow` | `leading`, `title`, `adornment`, `subtitle`, `meta`, `trailing`, `footer`, `active`, `to`/`href`/`onClick` · `List variant="divided"` |
| | `Stat`, `KeyValueList` | number tile · label → value rows |
| | `Section`, `PageHeader` (+ `Accent`) | heading row with action (`size` sm · md for a form group's heading) · eyebrow + display title + lede + actions; `size` sm · md · lg · xl · hero |
| | `Callout` | `tone`, `title`, `actions`, default icon per tone |
| | `StepList`, `Menu`, `EmptyState` | process steps · action panel · empty / error states with `code` |
| Shell | `Sheet` | bottom sheet on phones, modal from `md` (native `<dialog>`) |
| | `MobileHeader`, `TabBar`, `NavTabs` | phone header · phone bottom nav · top-bar nav (router links) |
| | `TopBar` | page banner: `brand`, `nav` (from `md`), `actions` |
| | `MapLayout` | map screen below the app bar, by size (`useBreakpoint`): desktop panel + map · tablet map + list below · phone full-bleed map with the toolbar floating and a `DockedSheet` · `toolbar`, `map`, `overlay`, `resultsHeader`, `results`, `resultsLabel`, `sheetExpanded` / `onSheetExpandedChange`, `sheetHandleLabel` |
| | `DockedSheet` | non-modal bottom sheet that stays on screen: peeks, opens on tap or swipe of the handle · `expanded`, `onExpandedChange`, `handleLabel`, `header` |
| | `AuthLayout` | sign-in / sign-up frame: plain page → form card on the map (`md`) → map panel with `aside` hero + form column (`lg`) |

## Storybook

Each component has a story next to it in a `stories/` folder (`DS/stories/<Name>.stories.tsx`, or `stories/<Name>.stories.tsx` for the product components; tokens: `stories/Tokens.stories.tsx`). Run `npm run storybook`. `__test__/stories.test.tsx` requires a story per exported component and renders every story with axe checks — a new component is not done without its story.
