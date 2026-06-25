/* Landly icon set — stroke-based, 1.6px default (mirror of design_files/components.jsx). */
import type { CSSProperties, ReactNode } from 'react'

export type IconName =
  | 'search' | 'pin' | 'arrowRight' | 'arrowLeft' | 'chevronDown' | 'chevronRight'
  | 'check' | 'plus' | 'close' | 'menu' | 'filter' | 'list' | 'grid' | 'user'
  | 'users' | 'heart' | 'bookmark' | 'globe' | 'settings' | 'phone' | 'mail'
  | 'link' | 'chat' | 'star' | 'flag' | 'verified' | 'sparkle' | 'building'
  | 'home' | 'google' | 'clock' | 'upload' | 'edit' | 'layers' | 'languages'
  | 'eye' | 'eyeOff' | 'pencil' | 'chart' | 'zoomIn' | 'zoomOut' | 'locate'
  | 'sliders' | 'flame' | 'sun' | 'moon' | 'bell' | 'drag'

const PATHS: Record<IconName, ReactNode> = {
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
  filter: <path d="M4 6h16M7 12h10M10 18h4" />,
  list: <path d="M4 6h16M4 12h16M4 18h16" />,
  grid: <><rect x="4" y="4" width="7" height="7" rx="1" /><rect x="13" y="4" width="7" height="7" rx="1" /><rect x="4" y="13" width="7" height="7" rx="1" /><rect x="13" y="13" width="7" height="7" rx="1" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1.6-4 4.6-6 8-6s6.4 2 8 6" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><circle cx="17" cy="9" r="2.8" /><path d="M3 20c1-3.2 3.4-5 6-5s5 1.8 6 5" /><path d="M14 20c.7-2.4 2.4-3.8 4-3.8 1.4 0 2.6.9 3 2.3" /></>,
  heart: <path d="M12 20s-7-4.4-7-10A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7 3c0 5.6-7 10-7 10Z" />,
  bookmark: <path d="M6 4h12v17l-6-4-6 4Z" />,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c2.8 3 4 5.8 4 9s-1.2 6-4 9c-2.8-3-4-5.8-4-9s1.2-6 4-9Z" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 14a1.6 1.6 0 0 0 .3 1.7l.1.1a1.8 1.8 0 1 1-2.6 2.6l-.1-.1a1.6 1.6 0 0 0-1.7-.3 1.6 1.6 0 0 0-1 1.5V20a1.8 1.8 0 0 1-3.6 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.7.3l-.1.1A1.8 1.8 0 1 1 5.4 16.2l.1-.1a1.6 1.6 0 0 0 .3-1.7 1.6 1.6 0 0 0-1.5-1H4a1.8 1.8 0 0 1 0-3.6h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.7l-.1-.1A1.8 1.8 0 1 1 7.8 4.4l.1.1a1.6 1.6 0 0 0 1.7.3H10a1.6 1.6 0 0 0 1-1.5V3a1.8 1.8 0 0 1 3.6 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.7-.3l.1-.1a1.8 1.8 0 1 1 2.6 2.6l-.1.1a1.6 1.6 0 0 0-.3 1.7V9a1.6 1.6 0 0 0 1.5 1h.1a1.8 1.8 0 0 1 0 3.6H21a1.6 1.6 0 0 0-1.5 1Z" /></>,
  phone: <path d="M5 4h3l2 5-2.4 1.2a12 12 0 0 0 5.2 5.2L14 13l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  link: <><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 1 0 5.7 5.7l1-1" /></>,
  chat: <path d="M21 12a8 8 0 0 1-11.4 7.3L4 21l1.7-5.6A8 8 0 1 1 21 12Z" />,
  star: <path d="m12 3 2.7 5.7 6.3.9-4.6 4.4 1.1 6.3L12 17.5 6.5 20.3l1.1-6.3L3 9.6l6.3-.9L12 3Z" />,
  flag: <><path d="M4 22V4" /><path d="M4 4h11l-1.5 4L15 12H4" /></>,
  verified: <><path d="M12 2 9.5 4 6 4.5 5 8l-2.5 3 1.5 3.5L4 18l3.5 1L9 22l3-2 3 2 1.5-3 3.5-1-.5-3.5L21 11l-2.5-3-1-3.5L14 4Z" /><path d="m9 12 2 2 4-4" /></>,
  sparkle: <path d="M12 3v6m0 6v6M3 12h6m6 0h6M6 6l3 3m6 6 3 3M18 6l-3 3m-6 6-3 3" />,
  building: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M9 8h2M9 12h2M9 16h2M13 8h2M13 12h2M13 16h2" /></>,
  home: <path d="M4 11 12 4l8 7v9a1 1 0 0 1-1 1h-5v-7h-4v7H5a1 1 0 0 1-1-1v-9Z" />,
  google: <><path d="M21 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.1a4.4 4.4 0 0 1-1.9 2.9v2.4h3.1c1.8-1.7 2.7-4.1 2.7-7.2Z" fill="#4285F4" stroke="none" /><path d="M12 21c2.6 0 4.7-.9 6.3-2.4l-3.1-2.4c-.9.6-2 1-3.2 1-2.5 0-4.5-1.6-5.3-3.9H3.5v2.4A9 9 0 0 0 12 21Z" fill="#34A853" stroke="none" /><path d="M6.7 13.3a5.4 5.4 0 0 1 0-3.4V7.5H3.5a9 9 0 0 0 0 8l3.2-2.2Z" fill="#FBBC05" stroke="none" /><path d="M12 6.6c1.4 0 2.7.5 3.7 1.4l2.7-2.7A9 9 0 0 0 3.5 7.5l3.2 2.4C7.5 7.6 9.5 6.6 12 6.6Z" fill="#EA4335" stroke="none" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  upload: <><path d="M12 16V4m0 0-4 4m4-4 4 4" /><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" /></>,
  edit: <path d="M4 20h4l10.5-10.5a2.5 2.5 0 0 0-3.5-3.5L4.5 16.5V20Z" />,
  layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5" /></>,
  languages: <><path d="M3 5h12" /><path d="M9 3v2c0 5-3.3 9-6 10" /><path d="M5 9c0 4 4.4 7 8 8" /><path d="M13 21h7l-3.5-9-3.5 9Z" /><path d="M14.5 17h5" /></>,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
  eyeOff: <><path d="m4 4 16 16" /><path d="M9.5 9.5A3 3 0 0 0 14.5 14.5" /><path d="M6.1 6.1C3.7 7.7 2 12 2 12s3.5 7 10 7c2 0 3.8-.6 5.3-1.4" /><path d="M21.9 12s-1.4-2.8-4-4.7" /></>,
  pencil: <path d="M4 20h4l11-11-4-4L4 16v4Zm9-13 4 4" />,
  chart: <path d="M4 19V5m0 14h16M8 16V11m4 5V7m4 9v-3" />,
  zoomIn: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5M11 8v6M8 11h6" /></>,
  zoomOut: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5M8 11h6" /></>,
  locate: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3m0 14v3M2 12h3m14 0h3" /></>,
  sliders: <><path d="M4 6h11M4 12h7M4 18h13" /><circle cx="18" cy="6" r="2" /><circle cx="14" cy="12" r="2" /><circle cx="20" cy="18" r="2" /></>,
  flame: <path d="M12 22a6 6 0 0 0 6-6c0-3-2-5-3-7-.6-1.3-.5-3 .5-4-3 .8-5 2.5-6 5-.4 1-1.5 1.4-2.3.7C6 9.6 5 11.6 5 14a7 7 0 0 0 7 8Z" />,
  sun: <><circle cx="12" cy="12" r="3.5" /><path d="M12 3v2m0 14v2M3 12h2m14 0h2m-2.6-6.4-1.4 1.4M6.4 17 5 18.4m12.4 0L16 17M6.4 7 5 5.6" /></>,
  moon: <path d="M21 13a8 8 0 1 1-10-10 7 7 0 0 0 10 10Z" />,
  bell: <><path d="M6 8a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7Z" /><path d="M10 20a2 2 0 0 0 4 0" /></>,
  drag: <><circle cx="9" cy="6" r="1.2" /><circle cx="15" cy="6" r="1.2" /><circle cx="9" cy="12" r="1.2" /><circle cx="15" cy="12" r="1.2" /><circle cx="9" cy="18" r="1.2" /><circle cx="15" cy="18" r="1.2" /></>,
}

interface IconProps {
  name: IconName
  size?: number
  stroke?: number
  className?: string
  style?: CSSProperties
}

export default function Icon({ name, size = 18, stroke = 1.6, className, style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  )
}
