import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

/** Origin the tests run the API client against (`test.env.VITE_API_URL`). */
export const API = 'http://api.test'

/** MSW server shared by every test; handlers are added per test with `server.use`. */
export const server = setupServer()

export interface CapturedRequest {
  method: string
  /** Path without the origin, e.g. `/api/organisation/search`. */
  path: string
  query: URLSearchParams
  headers: Headers
  /** Parsed JSON body, `MultipartParts` for multipart, `undefined` when empty. */
  body: unknown
}

/** Multipart fields by name, as they went over the wire. */
export type MultipartParts = Record<string, { value: string; filename?: string; contentType?: string }>

/**
 * Minimal multipart/form-data reader. Node's `Request.formData()` rejects
 * bodies built by jsdom's FormData/File, so tests read the raw parts instead.
 */
function parseMultipart(raw: string, boundary: string): MultipartParts {
  const parts: MultipartParts = {}
  for (const chunk of raw.split(`--${boundary}`)) {
    const split = chunk.indexOf('\r\n\r\n')
    if (split === -1) continue
    const head = chunk.slice(0, split)
    const name = /name="([^"]*)"/.exec(head)?.[1]
    if (!name) continue
    parts[name] = {
      value: chunk.slice(split + 4).replace(/\r\n$/, ''),
      filename: /filename="([^"]*)"/.exec(head)?.[1],
      contentType: /content-type:\s*([^\r\n]+)/i.exec(head)?.[1],
    }
  }
  return parts
}

type Method = 'get' | 'post' | 'put' | 'delete'

/**
 * Registers a one-off handler that records the request and answers `response`
 * (JSON). Returns the list the captured requests are pushed into.
 */
export function capture(method: Method, path: string, response: unknown = null, status = 200) {
  const requests: CapturedRequest[] = []
  server.use(
    http[method](`${API}${path}`, async ({ request }) => {
      const url = new URL(request.url)
      const type = request.headers.get('content-type') ?? ''
      let body: unknown
      if (type.includes('multipart/form-data')) {
        body = parseMultipart(await request.text(), /boundary=(.+)$/.exec(type)?.[1] ?? '')
      } else {
        const text = await request.text()
        body = text ? JSON.parse(text) : undefined
      }
      requests.push({ method: request.method, path: url.pathname, query: url.searchParams, headers: request.headers, body })
      return HttpResponse.json(response as never, { status })
    }),
  )
  return requests
}
