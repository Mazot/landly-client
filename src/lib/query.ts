/**
 * Serializes query params the way landly-server reads them: arrays are joined
 * with commas (`types=embassy,community`), and `undefined`, `null`, empty
 * strings and empty arrays are omitted.
 */
export function toQueryString(params: object): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue
    const serialized = Array.isArray(value) ? value.join(',') : String(value)
    if (serialized !== '') search.append(key, serialized)
  }
  return search.toString()
}

/**
 * `getNextPageParam` of an offset-paged list whose server answers at most `pageSize` items: a
 * shorter page is the last one (landly-server's `total` is the page size, not the table's).
 */
export const nextOffset =
  (pageSize: number) =>
  (lastPage: { items: unknown[] }, _allPages: unknown, lastOffset: number): number | undefined =>
    lastPage.items.length < pageSize ? undefined : lastOffset + pageSize
