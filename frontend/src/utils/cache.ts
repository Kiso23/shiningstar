/**
 * Simple in-memory cache with TTL (Time To Live) support
 * Improves user experience by reducing API calls
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class Cache {
  private store = new Map<string, CacheEntry<any>>()

  /**
   * Get cached data if it exists and hasn't expired
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key)
    if (!entry) return null

    const now = Date.now()
    const age = now - entry.timestamp

    // Check if cache has expired
    if (age > entry.ttl) {
      this.store.delete(key)
      return null
    }

    return entry.data as T
  }

  /**
   * Set cache data with TTL in milliseconds
   */
  set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    this.store.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    })
  }

  /**
   * Clear specific cache entry
   */
  clear(key: string): void {
    this.store.delete(key)
  }

  /**
   * Clear all cache
   */
  clearAll(): void {
    this.store.clear()
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    const entry = this.store.get(key)
    if (!entry) return false

    const now = Date.now()
    const age = now - entry.timestamp

    if (age > entry.ttl) {
      this.store.delete(key)
      return false
    }

    return true
  }
}

export const cache = new Cache()

/**
 * Cache TTL constants (in milliseconds)
 */
export const CACHE_TTL = {
  SHORT: 1 * 60 * 1000,      // 1 minute
  MEDIUM: 5 * 60 * 1000,     // 5 minutes
  LONG: 15 * 60 * 1000,      // 15 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 hour
}

/**
 * Cache key generators for consistency
 */
export const cacheKeys = {
  contacts: (statusFilter?: string) => `contacts:${statusFilter || 'all'}`,
  contact: (id: string) => `contact:${id}`,
  contactsCount: (statusFilter?: string) => `contacts-count:${statusFilter || 'all'}`,
  registrations: (page?: number) => `registrations:${page || 0}`,
  registration: (id: string) => `registration:${id}`,
  fixtures: () => 'fixtures',
  leaderboard: () => 'leaderboard',
  settings: () => 'settings',
}
