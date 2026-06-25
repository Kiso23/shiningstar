/**
 * Football News Feed Component
 * Displays latest football news in a scrollable vertical list with auto-refresh
 * Styled to match the dark theme with green accents
 */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, RefreshCw, AlertCircle } from 'lucide-react'
import { fetchFootballNews, refreshFootballNews, NewsResponse } from '../../api/news'

interface NewsFeedProps {
  title?: string
  autoRefreshInterval?: number // in milliseconds, default 30 minutes
  maxItems?: number
  showHeader?: boolean
  compact?: boolean // More condensed layout for sidebars
}

export default function NewsFeed({
  title = 'Football News',
  autoRefreshInterval = 30 * 60 * 1000, // 30 minutes
  maxItems = 10,
  showHeader = true,
  compact = false,
}: NewsFeedProps) {
  const [news, setNews] = useState<NewsResponse>({ items: [], count: 0, cached: false })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  // Color palette (dark theme with green accents)
  const bgCard = 'rgba(17,31,17,0.85)'
  const bgHover = 'rgba(34,197,94,0.1)'
  const border = 'rgba(255,255,255,0.06)'
  const textMain = '#f0f4f0'
  const textMute = '#6b7a6b'
  const accentGreen = '#22c55e'

  // Load news on component mount
  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchFootballNews(true)
        setNews(data)
        setLastRefresh(new Date())
      } catch (err) {
        console.error('Failed to load news:', err)
        setError('Failed to load football news')
      } finally {
        setLoading(false)
      }
    }

    loadNews()
  }, [])

  // Auto-refresh news at specified interval
  useEffect(() => {
    if (autoRefreshInterval <= 0) return

    const interval = setInterval(async () => {
      try {
        const data = await fetchFootballNews(true)
        setNews(data)
        setLastRefresh(new Date())
      } catch (err) {
        console.error('Auto-refresh failed:', err)
      }
    }, autoRefreshInterval)

    return () => clearInterval(interval)
  }, [autoRefreshInterval])

  // Manual refresh handler
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true)
      const data = await refreshFootballNews()
      setNews(data)
      setLastRefresh(new Date())
      setError(null)
    } catch (err) {
      console.error('Manual refresh failed:', err)
      setError('Failed to refresh news')
    } finally {
      setIsRefreshing(false)
    }
  }

  // Format published date to relative time
  const getRelativeTime = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      if (diffMins < 1) return 'just now'
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      if (diffDays < 7) return `${diffDays}d ago`

      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      })
    } catch {
      return 'recently'
    }
  }

  // Display items limited by maxItems
  const displayItems = news.items.slice(0, maxItems)

  return (
    <div
      className={`${compact ? 'rounded-lg' : 'rounded-2xl'} border overflow-hidden backdrop-blur-sm transition-colors duration-300`}
      style={{ backgroundColor: bgCard, borderColor: border }}
    >
      {/* Header */}
      {showHeader && (
        <div
          className={`flex items-center justify-between ${compact ? 'px-3 py-2' : 'px-4 sm:px-6 py-3 sm:py-4'} border-b`}
          style={{ borderBottomColor: border }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <div>
              <h3
                style={{ color: textMain }}
                className={`font-bold ${compact ? 'text-sm' : 'text-base sm:text-lg'} uppercase tracking-wide`}
              >
                {title}
              </h3>
              {lastRefresh && !compact && (
                <p style={{ color: textMute }} className="text-xs mt-0.5">
                  Updated {getRelativeTime(lastRefresh.toISOString())}
                </p>
              )}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`p-2 rounded-lg transition-colors ${
              isRefreshing
                ? 'bg-green-500/20 opacity-50 cursor-not-allowed'
                : 'hover:bg-white/5'
            }`}
            title="Refresh news"
          >
            <RefreshCw
              size={compact ? 16 : 18}
              style={{ color: accentGreen }}
              className={isRefreshing ? 'animate-spin' : ''}
            />
          </motion.button>
        </div>
      )}

      {/* Content */}
      <div className={compact ? 'max-h-96' : 'max-h-[600px]'} style={{ overflowY: 'auto' }}>
        <AnimatePresence>
          {loading ? (
            // Loading state
            <div className={`flex items-center justify-center ${compact ? 'py-6' : 'py-12'}`}>
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
                <p style={{ color: textMute }} className="text-xs">
                  Loading news...
                </p>
              </div>
            </div>
          ) : error ? (
            // Error state
            <div className={`flex items-center justify-center ${compact ? 'py-6' : 'py-8 px-4'}`}>
              <div className="flex flex-col items-center gap-2 text-center">
                <AlertCircle size={24} style={{ color: '#ef4444' }} />
                <p style={{ color: textMute }} className="text-xs sm:text-sm">
                  {error}
                </p>
              </div>
            </div>
          ) : displayItems.length === 0 ? (
            // Empty state
            <div className={`flex items-center justify-center ${compact ? 'py-6' : 'py-12'}`}>
              <p style={{ color: textMute }} className="text-xs sm:text-sm text-center">
                No football news available
              </p>
            </div>
          ) : (
            // News items list
            <div>
              {displayItems.map((item, index) => (
                <motion.a
                  key={`${item.url}-${index}`}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ backgroundColor: bgHover }}
                  className={`block border-t transition-colors duration-200 ${compact ? 'px-3 py-2' : 'px-4 sm:px-6 py-3 sm:py-4'}`}
                  style={{ borderTopColor: border }}
                >
                  <div className="flex gap-3 items-start">
                    {/* Thumbnail */}
                    {item.image && !compact && (
                      <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Source */}
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          style={{
                            backgroundColor: 'rgba(34,197,94,0.15)',
                            color: accentGreen,
                          }}
                          className="text-xs font-semibold px-2 py-0.5 rounded leading-none"
                        >
                          {item.source}
                        </span>
                        <span style={{ color: textMute }} className="text-xs whitespace-nowrap">
                          {getRelativeTime(item.published_date)}
                        </span>
                      </div>

                      {/* Title */}
                      <h4
                        style={{ color: textMain }}
                        className={`font-bold leading-tight mb-1 line-clamp-2 hover:text-green-400 transition-colors ${
                          compact ? 'text-xs' : 'text-sm'
                        }`}
                      >
                        {item.title}
                      </h4>

                      {/* Description - only show on non-compact */}
                      {!compact && item.description && (
                        <p
                          style={{ color: textMute }}
                          className="text-xs leading-relaxed line-clamp-2 mb-2"
                        >
                          {item.description}
                        </p>
                      )}

                      {/* Read more link */}
                      <div className="flex items-center gap-1 text-xs font-semibold text-green-400 hover:text-green-300">
                        Read more
                        <ExternalLink size={12} />
                      </div>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer - show count and cache status */}
      {showHeader && !compact && displayItems.length > 0 && (
        <div
          className="px-4 sm:px-6 py-2 sm:py-3 border-t flex items-center justify-between text-xs"
          style={{ borderTopColor: border, color: textMute }}
        >
          <span>
            Showing {displayItems.length} of {news.count} items
          </span>
          {news.cached && <span className="text-green-400">✓ Cached</span>}
        </div>
      )}
    </div>
  )
}
