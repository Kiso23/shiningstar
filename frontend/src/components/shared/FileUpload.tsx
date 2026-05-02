import { useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react'

interface FileUploadProps {
  accept?: string
  maxSizeBytes?: number
  label?: string
  onFileSelect: (file: File | null) => void
  retainedFile?: File | null
  error?: string
}

export default function FileUpload({
  accept = 'image/jpeg,image/png',
  maxSizeBytes = 5 * 1024 * 1024,
  label = 'Upload file',
  onFileSelect,
  retainedFile,
  error,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [localFile, setLocalFile] = useState<File | null>(retainedFile || null)
  const [localError, setLocalError] = useState<string | null>(null)

  const handleFile = useCallback(
    (file: File) => {
      setLocalError(null)
      const allowedTypes = accept.split(',').map((t) => t.trim())
      if (!allowedTypes.includes(file.type)) {
        setLocalError('Invalid file type. Only JPEG and PNG are accepted.')
        return
      }
      if (file.size > maxSizeBytes) {
        setLocalError(`File too large. Maximum size is ${Math.round(maxSizeBytes / 1024 / 1024)} MB.`)
        return
      }
      setLocalFile(file)
      onFileSelect(file)
    },
    [accept, maxSizeBytes, onFileSelect]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const clearFile = () => {
    setLocalFile(null)
    setLocalError(null)
    onFileSelect(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const displayError = error || localError

  return (
    <div className="space-y-2">
      <AnimatePresence mode="wait">
        {localFile ? (
          <motion.div
            key="file-selected"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/30"
          >
            <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-300 truncate">{localFile.name}</p>
              <p className="text-xs text-green-500">{(localFile.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              type="button"
              onClick={clearFile}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Remove file"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="drop-zone"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`
              relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed
              cursor-pointer transition-all duration-200
              ${dragging
                ? 'border-orange-400 bg-orange-500/10 scale-[1.02]'
                : 'border-white/20 bg-white/5 hover:border-orange-500/50 hover:bg-orange-500/5'
              }
              ${displayError ? 'border-red-500/50' : ''}
            `}
          >
            <motion.div
              animate={{ y: dragging ? -4 : 0 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Upload className={`w-8 h-8 ${dragging ? 'text-orange-400' : 'text-gray-500'}`} />
            </motion.div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-300">{label}</p>
              <p className="text-xs text-gray-500 mt-1">
                Drag & drop or click to browse · JPEG, PNG · Max {Math.round(maxSizeBytes / 1024 / 1024)} MB
              </p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              onChange={handleChange}
              className="sr-only"
              aria-label={label}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {displayError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="error-text"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            {displayError}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
