import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'

interface MusicPlayerProps {
  src: string
  title?: string
  artist?: string
}

const MusicPlayer = ({ src, title = 'Stadium Rock', artist = 'Pufino' }: MusicPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
    }
  }, [])

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
    if (newVolume > 0) setIsMuted(false)
  }

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume
        setIsMuted(false)
      } else {
        audioRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
    }
    setCurrentTime(newTime)
  }

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-4 right-4 z-40 w-16 h-16 rounded-full shadow-lg hover:w-72 hover:h-auto transition-all duration-300 group"
      style={{
        background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(249, 115, 22, 0.1) 100%)',
        border: '2px solid rgba(249, 115, 22, 0.4)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <audio ref={audioRef} src={src} />

      {/* Compact View - Always Visible */}
      <div className="w-full h-full flex items-center justify-center">
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={togglePlay}
          className="p-3 rounded-full bg-orange-500 hover:bg-orange-600 text-white transition-colors shadow-lg"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6" />
          )}
        </motion.button>
      </div>

      {/* Expanded View - Shows on Hover */}
      <div className="absolute bottom-0 right-0 w-72 bg-gradient-to-br from-orange-500/20 to-orange-500/10 rounded-2xl p-4 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto"
        style={{
          border: '1px solid rgba(249, 115, 22, 0.3)',
          backdropFilter: 'blur(20px)',
          transform: 'translateY(100%) translateX(-16px)',
        }}>
        
        {/* Header */}
        <div className="mb-3">
          <p className="text-orange-400 font-bold text-xs">{title}</p>
          <p className="text-gray-400 text-xs">{artist}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-2">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleProgressChange}
            className="w-full h-0.5 bg-orange-500/20 rounded-lg appearance-none cursor-pointer accent-orange-500"
            style={{
              background: `linear-gradient(to right, #f97316 0%, #f97316 ${
                duration ? (currentTime / duration) * 100 : 0
              }%, rgba(249, 115, 22, 0.2) ${duration ? (currentTime / duration) * 100 : 0}%, rgba(249, 115, 22, 0.2) 100%)`,
            }}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-2">
          {/* Play/Pause */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={togglePlay}
            className="p-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </motion.button>

          {/* Volume Control */}
          <div className="flex items-center gap-1 flex-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleMute}
              className="text-orange-400 hover:text-orange-300 transition-colors shrink-0"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3 h-3" />
              ) : (
                <Volume2 className="w-3 h-3" />
              )}
            </motion.button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-full h-0.5 bg-orange-500/20 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>

          {/* Status */}
          <span className="text-xs text-orange-400 font-semibold">
            {isPlaying ? '🎵' : '🔇'}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default MusicPlayer
