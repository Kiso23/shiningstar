/**
 * Extract a human-readable error message from an Axios error response.
 * Handles both string details and FastAPI's array-of-{loc,msg,type} format.
 */
export function extractErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const detail = (err as any)?.response?.data?.detail
  if (!detail) return fallback

  // FastAPI validation error: array of {loc, msg, type}
  if (Array.isArray(detail)) {
    return detail
      .map((e: any) => {
        const field = Array.isArray(e.loc) ? e.loc.filter((l: any) => l !== 'body').join(' → ') : ''
        return field ? `${field}: ${e.msg}` : String(e.msg)
      })
      .join(', ')
  }

  // Plain string detail
  if (typeof detail === 'string') return detail

  return fallback
}
