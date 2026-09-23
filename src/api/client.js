/**
 * Thin fetch wrapper shared by every endpoint module.
 *
 * In dev, Vite proxies `/api` to the Rust backend on :3000 (see
 * vite.config.js), so the default empty base gives same-origin relative URLs
 * and no CORS setup is needed.
 *
 * Deployed, the two halves sit on different hosts, so `VITE_API_URL` points at
 * the backend — e.g. `https://my-api.up.railway.app`. Vite inlines it at build
 * time, which means it has to be set before `npm run build`, not after.
 */
const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

/** Error carrying the HTTP status, so callers can branch on it. */
export class ApiError extends Error {
  constructor(status, message) {
    super(message || `Request failed with status ${status}`)
    this.name = 'ApiError'
    this.status = status
  }
}

const JSON_HEADERS = { 'Content-Type': 'application/json' }

async function request(path, { method = 'GET', body } = {}) {
  let res
  try {
    res = await fetch(`${BASE}/api${path}`, {
      method,
      headers: body === undefined ? undefined : JSON_HEADERS,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Is the backend running?')
  }

  if (!res.ok) {
    throw new ApiError(res.status, (await res.text()) || res.statusText)
  }

  // 204 No Content has no body to parse.
  return res.status === 204 ? undefined : res.json()
}

export const get = (path) => request(path)
export const post = (path, body) => request(path, { method: 'POST', body })
export const patch = (path, body) => request(path, { method: 'PATCH', body })
export const del = (path) => request(path, { method: 'DELETE' })
