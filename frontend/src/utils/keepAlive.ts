/**
 * Keep-alive ping for Render free tier.
 * Render spins down free services after 15 minutes of inactivity.
 * This pings the /health endpoint every 4 minutes to prevent cold starts.
 * Only runs in production — skipped in local dev to avoid CORS errors.
 */

const PING_INTERVAL_MS = 4 * 60 * 1000 // 4 minutes
const BACKEND_URL = 'https://shiningstar.onrender.com'
const IS_PROD = !window.location.hostname.includes('localhost') &&
                !window.location.hostname.includes('127.0.0.1')

let intervalId: ReturnType<typeof setInterval> | null = null

export function startKeepAlive(): void {
  if (!IS_PROD) return // skip in local dev
  if (intervalId) return // already running

  const ping = async () => {
    try {
      await fetch(`${BACKEND_URL}/health`, { method: 'GET', cache: 'no-store' })
    } catch {
      // silently ignore
    }
  }

  ping()
  intervalId = setInterval(ping, PING_INTERVAL_MS)
}

export function stopKeepAlive(): void {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}
