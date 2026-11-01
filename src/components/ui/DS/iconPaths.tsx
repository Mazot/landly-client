import type { ReactNode } from 'react'

/** Artwork of the Landly line icons (24-unit grid) — rendered by `Icon`. */
export const ICON_PATHS = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  pin: <><path d="M12 21s-7-6.2-7-12a7 7 0 1 1 14 0c0 5.8-7 12-7 12Z" /><circle cx="12" cy="9" r="2.5" /></>,
  arrowRight: <path d="M5 12h14m-6-6 6 6-6 6" />,
  arrowLeft: <path d="M19 12H5m6 6-6-6 6-6" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  chevronRight: <path d="m9 6 6 6-6 6" />,
  check: <path d="m5 12.5 4 4 10-10" />,
  plus: <path d="M12 5v14M5 12h14" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1.6-4 4.6-6 8-6s6.4 2 8 6" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><circle cx="17" cy="9" r="2.8" /><path d="M3 20c1-3.2 3.4-5 6-5s5 1.8 6 5" /><path d="M14 20c.7-2.4 2.4-3.8 4-3.8 1.4 0 2.6.9 3 2.3" /></>,
  heart: <path d="M12 20s-7-4.4-7-10A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7 3c0 5.6-7 10-7 10Z" />,
  bookmark: <path d="M6 4h12v17l-6-4-6 4Z" />,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c2.8 3 4 5.8 4 9s-1.2 6-4 9c-2.8-3-4-5.8-4-9s1.2-6 4-9Z" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3m0 14v3M2 12h3m14 0h3M4.9 4.9l2.1 2.1m10 10 2.1 2.1M4.9 19.1l2.1-2.1m10-10 2.1-2.1" /></>,
  phone: <path d="M5 4h3l2 5-2.4 1.2a12 12 0 0 0 5.2 5.2L14 13l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  link: <><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 1 0 5.7 5.7l1-1" /></>,
  star: <path d="m12 3 2.7 5.7 6.3.9-4.6 4.4 1.1 6.3L12 17.5 6.5 20.3l1.1-6.3L3 9.6l6.3-.9L12 3Z" />,
  flag: <><path d="M4 22V4" /><path d="M4 4h11l-1.5 4L15 12H4" /></>,
  verified: <><path d="M12 2 9.5 4 6 4.5 5 8l-2.5 3 1.5 3.5L4 18l3.5 1L9 22l3-2 3 2 1.5-3 3.5-1-.5-3.5L21 11l-2.5-3-1-3.5L14 4Z" /><path d="m9 12 2 2 4-4" /></>,
  sparkle: <path d="M12 3v6m0 6v6M3 12h6m6 0h6M6 6l3 3m6 6 3 3M18 6l-3 3m-6 6-3 3" />,
  building: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M9 8h2M9 12h2M9 16h2M13 8h2M13 12h2M13 16h2" /></>,
  google: (
    <>
      <path className="fill-google-blue" stroke="none" d="M21 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.1a4.4 4.4 0 0 1-1.9 2.9v2.4h3.1c1.8-1.7 2.7-4.1 2.7-7.2Z" />
      <path className="fill-google-green" stroke="none" d="M12 21c2.6 0 4.7-.9 6.3-2.4l-3.1-2.4c-.9.6-2 1-3.2 1-2.5 0-4.5-1.6-5.3-3.9H3.5v2.4A9 9 0 0 0 12 21Z" />
      <path className="fill-google-yellow" stroke="none" d="M6.7 13.3a5.4 5.4 0 0 1 0-3.4V7.5H3.5a9 9 0 0 0 0 8l3.2-2.2Z" />
      <path className="fill-google-red" stroke="none" d="M12 6.6c1.4 0 2.7.5 3.7 1.4l2.7-2.7A9 9 0 0 0 3.5 7.5l3.2 2.4C7.5 7.6 9.5 6.6 12 6.6Z" />
    </>
  ),
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  upload: <><path d="M12 16V4m0 0-4 4m4-4 4 4" /><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" /></>,
  image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m21 16-5-5-9 9" /></>,
  languages: <><path d="M3 5h12" /><path d="M9 3v2c0 5-3.3 9-6 10" /><path d="M5 9c0 4 4.4 7 8 8" /><path d="M13 21h7l-3.5-9-3.5 9Z" /><path d="M14.5 17h5" /></>,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
  eyeOff: <><path d="m4 4 16 16" /><path d="M9.5 9.5A3 3 0 0 0 14.5 14.5" /><path d="M6.1 6.1C3.7 7.7 2 12 2 12s3.5 7 10 7c2 0 3.8-.6 5.3-1.4" /><path d="M21.9 12s-1.4-2.8-4-4.7" /></>,
  pencil: <path d="M4 20h4l11-11-4-4L4 16v4Zm9-13 4 4" />,
  zoomIn: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5M11 8v6M8 11h6" /></>,
  zoomOut: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5M8 11h6" /></>,
  locate: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3m0 14v3M2 12h3m14 0h3" /></>,
  sliders: <><path d="M4 6h11M4 12h7M4 18h13" /><circle cx="18" cy="6" r="2" /><circle cx="14" cy="12" r="2" /><circle cx="20" cy="18" r="2" /></>,
} satisfies Record<string, ReactNode>

export type IconName = keyof typeof ICON_PATHS
export const ICON_NAMES = Object.keys(ICON_PATHS) as IconName[]
