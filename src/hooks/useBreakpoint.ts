import { useState, useEffect } from 'react'

// Mirrors tailwind.config.ts screens
const QUERIES = {
  mobile:  '(max-width: 833px)',
  tablet:  '(min-width: 834px) and (max-width: 1279px)',
  desktop: '(min-width: 1280px)',
} as const

type BreakpointName = keyof typeof QUERIES

export function useBreakpoint(bp: BreakpointName): boolean {
  const query = QUERIES[bp]
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  )
  useEffect(() => {
    const mq = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mq.addEventListener('change', handler)
    setMatches(mq.matches)
    return () => mq.removeEventListener('change', handler)
  }, [query])
  return matches
}
