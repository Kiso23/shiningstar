import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, LogOut, X, ClipboardList, Calendar, Radio, BarChart2 } from 'lucide-react'
import RegistrationTable from '../components/admin/RegistrationTable'
import RegistrationDetail from '../components/admin/RegistrationDetail'
import ExportButton from '../components/admin/ExportButton'
import FixturesTab from '../components/admin/FixturesTab'
import LiveScoresTab from '../components/admin/LiveScoresTab'
import AnalyticsTab from '../components/admin/AnalyticsTab'
import { useAdminAuth } from '../hooks/useAdminAuth'
import type { TeamResponse } from '../api/registrations'

type Tab = 'registrations' | 'fixtures' | 'live' | 'analytics'

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'registrations', label: 'Registrations', icon: <ClipboardList className="w-4 h-4" /> },
  { id: 'fixtures', label: 'Fixtures', icon: <Calendar className="w-4 h-4" /> },
  { id: 'live', label: 'Live Scores', icon: <Radio className="w-4 h-4" /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-4 h-4" /> },
]

export default function AdminDashboardPage() {
  const { logout } = useAdminAuth()
  const [activeTab, setActiveTab] = useState<Tab>('registrations')
  const [selected, setSelected] = useState<TeamResponse | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleStatusChange = () => {
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/5 bg-gray-950/80 backdrop-blur-xl sticky top-0 z-30"
      >
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Shining Star United Hamren"
            className="w-10 h-10 rounded-full object-cover border-2 border-orange-500/40"
          />
          <div>
            <p className="font-bold text-white text-sm leading-none">Admin Dashboard</p>
            <p className="text-gray-500 text-xs">Shining Star United</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === 'registrations' && <ExportButton />}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={logout}
            className="btn-secondary py-2 px-3 text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </motion.button>
        </div>
      </motion.header>

      {/* Tab navigation */}
      <div className="flex border-b border-white/5 bg-gray-950/60 px-4 sm:px-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSelected(null) }}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
              ${activeTab === tab.id
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'registrations' && (
          <div className="flex h-full overflow-hidden">
            {/* Left panel */}
            <aside className={`
              w-full sm:w-80 lg:w-96 border-r border-white/5 flex flex-col p-4 overflow-hidden
              ${selected ? 'hidden sm:flex' : 'flex'}
            `}>
              <h2 className="text-white font-bold mb-4">Registrations</h2>
              <div className="flex-1 overflow-hidden">
                <RegistrationTable
                  onSelect={setSelected}
                  selectedId={selected?.registration_id}
                  refreshKey={refreshKey}
                />
              </div>
            </aside>

            {/* Right panel */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6">
              <AnimatePresence mode="wait">
                {selected ? (
                  <motion.div
                    key={selected.registration_id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <button
                      onClick={() => setSelected(null)}
                      className="sm:hidden flex items-center gap-2 text-gray-400 hover:text-white mb-4 text-sm transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Back to list
                    </button>
                    <RegistrationDetail
                      registrationId={selected.registration_id}
                      onStatusChange={() => {
                        handleStatusChange()
                        setSelected((prev) => prev ? { ...prev } : null)
                      }}
                      onDelete={() => {
                        setSelected(null)
                        handleStatusChange()
                      }}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hidden sm:flex flex-col items-center justify-center h-full text-gray-600"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                      <Star className="w-8 h-8 opacity-30" />
                    </div>
                    <p className="font-medium">Select a registration</p>
                    <p className="text-sm mt-1">Click any team from the list to view details</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          </div>
        )}

        {activeTab === 'fixtures' && (
          <div className="overflow-y-auto h-full p-4 sm:p-6">
            <FixturesTab />
          </div>
        )}

        {activeTab === 'live' && (
          <div className="overflow-y-auto h-full p-4 sm:p-6">
            <LiveScoresTab />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="overflow-y-auto h-full p-4 sm:p-6">
            <AnalyticsTab />
          </div>
        )}
      </div>
    </div>
  )
}
