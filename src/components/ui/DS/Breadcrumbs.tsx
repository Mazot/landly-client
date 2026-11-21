import type { ReactNode } from 'react'
import { Icon } from './Icon'

export interface BreadcrumbsProps {
  /** Names the navigation ("Breadcrumbs"). */
  label: string
  /** From the top level to the current page; empty entries are skipped. The last one is the current page. */
  items: ReactNode[]
}

/** A strip under the top bar: "← Map › Germany › Kyiv Coffee", the current page last and truncated. */
export function Breadcrumbs({ label, items }: BreadcrumbsProps) {
  const crumbs = items.filter((item) => item !== null && item !== undefined && item !== false && item !== '')
  return (
    <nav aria-label={label} className="flex h-13 items-center border-b border-border-1 bg-surface px-8 text-label font-medium text-ink-3">
      <ol className="m-0 flex min-w-0 list-none items-center gap-2.5 p-0">
        {crumbs.map((item, index) => {
          const current = index === crumbs.length - 1
          return (
            <li key={index} className={current ? 'flex min-w-0 items-center gap-2.5' : 'flex shrink-0 items-center gap-2.5'}>
              {index > 0 && <Icon name="chevronRight" size={11} />}
              {current ? (
                <span aria-current="page" className="min-w-0 truncate text-ink-1">
                  {item}
                </span>
              ) : (
                item
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
