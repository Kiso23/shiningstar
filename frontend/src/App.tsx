import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import HomePage from './pages/HomePage'
import RegisterPage from './pages/RegisterPage'
import ConfirmationPage from './pages/ConfirmationPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import FixturesPage from './pages/FixturesPage'
import LeaderboardPage from './pages/LeaderboardPage'
import LivePage from './pages/LivePage'
import ProtectedRoute from './components/shared/ProtectedRoute'
import LogoWatermark from './components/shared/LogoWatermark'
import SplashScreen from './components/shared/SplashScreen'

export default function App() {
  const [showSplash, setShowSplash] = useState(
    () => !sessionStorage.getItem('splashShown')
  )

  const handleSplashDone = () => {
    sessionStorage.setItem('splashShown', '1')
    setShowSplash(false)
  }

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen onDone={handleSplashDone} />}
      </AnimatePresence>

      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        {/* Club logo watermark — fixed behind all content on every page */}
        <LogoWatermark />

        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/confirmation/:registrationId" element={<ConfirmationPage />} />
            <Route path="/fixtures" element={<FixturesPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/live" element={<LivePage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </>
  )
}
