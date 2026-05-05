/**
 * Keep-alive ping for Render free tier.
 * Render spins down free services after 15 minutes of inactivity.
 * This pings the /health endpoint every 4 minutes to prevent cold starts.
 */

const PING_INTERVAL_MS = 4 * 60 * 1000 // 4 minutes
const HEALTH_URL = `${import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'https://shiningstar.onrender.com'}/health`

let intervalId: ReturnType<typeof setInterval> | null = null

export function startKeepAlive(): void {
  if (intervalId) return // already running

  const ping = async () => {
    try {
      await fetch(HEALTH_URL, { method: 'GET', cache: 'no-store' })
    } catch {
      // silently ignore — network errors are expected when offline
    }
  }

  // Ping immediately on start, then every 4 minutes
  ping()
  intervalId = setInterval(ping, PING_INTERVAL_MS)
}

export function stopKeepAlive(): void {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}
