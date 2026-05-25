import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, ChevronDown, FileText, Table } from 'lucide-react'

export default function ExportButton() {
  const [open, setOpen] = useState(false)

  const download = (format: 'csv' | 'xlsx') => {
    const base = import.meta.env.VITE_API_BASE_URL || '/api/v1'
    const token = localStorage.getItem('admin_token') || ''
    // Create a temporary link with auth header workaround via query param
    const url = `${base}/admin/export?format=${format}`
    // Use fetch to download with auth header
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Export failed with status ${res.status}`)
        }
        return res.blob()
      })
      .then((blob) => {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = `registrations.${format}`
        a.click()
        URL.revokeObjectURL(a.href)
      })
      .catch((err) => {
        console.error('Export error:', err)
        alert(`Failed to export ${format.toUpperCase()}. Please try again.`)
      })
      .finally(() => {
        setOpen(false)
      })
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(!open)}
        className="btn-secondary py-2 px-4 text-sm gap-1.5"
      >
        <Download className="w-4 h-4" />
        Export
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 z-20 w-44 glass-card py-1 shadow-xl"
            >
              <button
                onClick={() => download('csv')}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <FileText className="w-4 h-4 text-green-400" />
                Download CSV
              </button>
              <button
                onClick={() => download('xlsx')}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Table className="w-4 h-4 text-blue-400" />
                Download Excel
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
