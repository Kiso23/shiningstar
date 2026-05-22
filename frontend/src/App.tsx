import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import HomePage from './pages/HomePage'
import RegisterPage from './pages/RegisterPage'
import ConfirmationPage from './pages/ConfirmationPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import FixturesPage from './pages/FixturesPage'
import LeaderboardPage from './pages/LeaderboardPage'
import LivePage from './pages/LivePage'
import ContactPage from './pages/ContactPage'
import PlayerRecruitmentPage from './pages/PlayerRecruitmentPage'
import ProtectedRoute from './components/shared/ProtectedRoute'
import LogoWatermark from './components/shared/LogoWatermark'
import SplashScreen from './components/shared/SplashScreen'
import MusicPlayer from './components/shared/MusicPlayer'
import { ThemeProvider } from './context/ThemeContext'
import { startKeepAlive } from './utils/keepAlive'

export default function App() {
  const [showSplash, setShowSplash] = useState(
    () => !sessionStorage.getItem('splashShown')
  )

  const handleSplashDone = () => {
    sessionStorage.setItem('splashShown', '1')
    setShowSplash(false)
  }

  // Keep Render free tier alive — ping every 4 minutes
  useEffect(() => {
    startKeepAlive()
  }, [])

  return (
    <ThemeProvider>
      <AnimatePresence>
        {showSplash && <SplashScreen onDone={handleSplashDone} />}
      </AnimatePresence>

      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <LogoWatermark />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/confirmation/:registrationId" element={<ConfirmationPage />} />
            <Route path="/fixtures" element={<FixturesPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/live" element={<LivePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/join" element={<PlayerRecruitmentPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/forgot-password" element={<ForgotPasswordPage />} />
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
        {/* Global Music Player - Plays on all pages */}
        <MusicPlayer src="/stadium-music.mp3" title="Stadium Rock" artist="Pufino" />
      </BrowserRouter>
    </ThemeProvider>
  )
}
