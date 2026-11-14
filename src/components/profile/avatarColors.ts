import type { AVATAR_COLORS } from '@/components/ui'

export type AvatarColor = (typeof AVATAR_COLORS)[number]

/** i18n key (`auth.avatarColors.*`) of each swatch of the palette (`AVATAR_COLORS` design tokens). */
export const AVATAR_COLOR_KEYS: Record<AvatarColor, string> = { '#4A6D8C': 'blue', '#C7613F': 'terracotta', '#4F7F5C': 'green', '#8B5A8C': 'plum', '#B8814A': 'ochre', '#1B1A17': 'ink' }
