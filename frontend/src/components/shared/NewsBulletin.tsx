import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Newspaper, ExternalLink, AlertCircle, Loader2, Globe, MapPin } from 'lucide-react'
import { fetchFootballNews, type NewsItem } from '../../api/news'

export default function NewsBulletin() {
  const [articles, setArticles] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  useEffect(() => {
    fetchNews()
    // Refresh news every 1 hour (60 minutes)
    const interval = setInterval(fetchNews, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchNews = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchFootballNews()
      setArticles(data.items)
    } catch (err) {
      console.error('Failed to fetch news:', err)
      setError('Unable to load football news')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="w-full lg:w-80 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Newspaper className="w-5 h-5 text-green-400" />
        <h3 className="text-white font-bold text-lg">Football News</h3>
      </div>

      {/* News Container */}
      <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-hide">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-green-400" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-gray-500 text-sm text-center py-8">No news available</div>
        ) : (
          <AnimatePresence>
            {articles.map((article, idx) => (
              <motion.button
                key={`${article.url}-${idx}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                className="w-full text-left"
              >
                <div
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    expandedIndex === idx
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-white/5 border-white/10 hover:border-green-500/20'
                  }`}
                >
                  {/* Category Badge + Source */}
                  <div className="flex items-center gap-2 mb-2">
                    {article.category === 'local' ? (
                      <MapPin className="w-3 h-3 text-orange-400 shrink-0" />
                    ) : (
                      <Globe className="w-3 h-3 text-blue-400 shrink-0" />
                    )}
                    <span className="text-xs font-semibold text-gray-400 uppercase">
                      {article.source}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(article.published_date).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Title */}
                  <p className="text-sm font-bold text-white line-clamp-2 hover:text-green-400 transition-colors">
                    {article.title}
                  </p>

                  {/* Description (Expanded) */}
                  <AnimatePresence>
                    {expandedIndex === idx && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 space-y-2"
                      >
                        {article.image && (
                          <img
                            src={article.image}
                            alt={article.title}
                            className="w-full h-32 object-cover rounded-lg"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                        )}
                        <p className="text-xs text-gray-400 leading-relaxed">
                          {article.description}
                        </p>
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs text-green-400 hover:text-green-300 font-semibold mt-2"
                        >
                          Read More <ExternalLink className="w-3 h-3" />
                        </a>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Refresh Info */}
      <p className="text-xs text-gray-600 text-center">
        Updates every 5 minutes
      </p>
    </motion.div>
  )
}
