import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, X, MessageCircle, Loader, CheckCheck, Check } from 'lucide-react'
import client from '../../api/client'

interface Message {
  id?: number
  type: 'user' | 'ai' | 'admin'
  content: string
  timestamp?: string
  read_status?: 'read' | 'unread'
  sender_id?: string
}

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')
  const [chatId, setChatId] = useState<number | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [pollInterval, setPollInterval] = useState<ReturnType<typeof setInterval> | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize sessionId from localStorage on mount
  useEffect(() => {
    const storedSessionId = localStorage.getItem('chat_session_id')
    if (storedSessionId) {
      setSessionId(storedSessionId)
      // Restore chat history
      restoreChatHistory(storedSessionId)
    } else {
      const newSessionId = `session_${Date.now()}_${Math.random()}`
      setSessionId(newSessionId)
      localStorage.setItem('chat_session_id', newSessionId)
    }
  }, [])

  // Restore chat history from database
  const restoreChatHistory = async (sid: string) => {
    try {
      const response = await client.get(`/chat/history/${sid}`)
      if (response.data.messages && response.data.messages.length > 0) {
        const restoredMessages = response.data.messages.map((msg: any) => ({
          id: msg.id,
          type: msg.message_type.toLowerCase() as 'user' | 'ai' | 'admin',
          content: msg.content,
          timestamp: new Date(msg.created_at).toLocaleTimeString(),
          read_status: msg.read_status,
          sender_id: msg.sender_id
        }))
        setMessages(restoredMessages)
        setChatId(response.data.chat.id)
        
        // Start polling if chat was transferred to admin
        if (response.data.chat.status === 'transferred') {
          startPolling(response.data.chat.id)
        }
      }
    } catch (error) {
      console.error('Error restoring chat history:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollInterval) clearInterval(pollInterval)
    }
  }, [pollInterval])

  const startPolling = (cid: number) => {
    if (pollInterval) clearInterval(pollInterval)
    
    const interval = setInterval(async () => {
      try {
        const response = await client.get(`/chat/history/${sessionId}`)
        const newMessages = response.data.messages

        // Check for new messages
        if (newMessages.length > messages.length) {
          const restoredMessages = newMessages.map((msg: any) => ({
            id: msg.id,
            type: msg.message_type.toLowerCase() as 'user' | 'ai' | 'admin',
            content: msg.content,
            timestamp: new Date(msg.created_at).toLocaleTimeString(),
            read_status: msg.read_status,
            sender_id: msg.sender_id
          }))
          setMessages(restoredMessages)
        }
      } catch (error) {
        console.error('Error polling for responses:', error)
      }
    }, 3000) // Poll every 3 seconds

    setPollInterval(interval)

    // Stop polling after 30 minutes
    setTimeout(() => {
      clearInterval(interval)
      setPollInterval(null)
    }, 30 * 60 * 1000)
  }

  const markMessagesAsRead = async () => {
    if (!chatId) return
    try {
      await client.post(`/chat/chat/${chatId}/mark-all-read`)
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  const sendTypingStatus = async (isTypingStatus: boolean) => {
    if (!chatId) return
    try {
      await client.post('/chat/typing', {
        chat_id: chatId,
        is_typing: isTypingStatus
      })
    } catch (error) {
      console.error('Error sending typing status:', error)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || !sessionId) return

    // Add user message
    const userMessage: Message = {
      type: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString()
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await client.post('/chat/message', {
        content: input,
        session_id: sessionId,
        team_name: 'Team',
        email: 'team@example.com',
        phone: '+91 XXXXXXXXXX'
      })

      setChatId(response.data.chat_id)

      // Add AI response
      const aiMessage: Message = {
        id: response.data.ai_response.id,
        type: response.data.requires_transfer ? 'admin' : 'ai',
        content: response.data.ai_response.content,
        timestamp: new Date().toLocaleTimeString(),
        read_status: 'unread',
        sender_id: response.data.ai_response.sender_id
      }
      setMessages(prev => [...prev, aiMessage])

      // Show transfer notification if needed
      if (response.data.requires_transfer) {
        setTimeout(() => {
          const notificationMessage: Message = {
            type: 'admin',
            content: '🔄 Your chat has been transferred to our admin team. They will respond shortly.',
            timestamp: new Date().toLocaleTimeString()
          }
          setMessages(prev => [...prev, notificationMessage])
        }, 1000)
        
        // Start polling for admin responses
        startPolling(response.data.chat_id)
      }

      // Mark messages as read
      await markMessagesAsRead()
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        type: 'ai',
        content: 'Sorry, there was an error. Please try again.',
        timestamp: new Date().toLocaleTimeString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Chat Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-6 z-30 p-4 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-32 right-6 z-30 w-96 h-96 rounded-2xl shadow-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #0e1a0e 0%, #111f11 100%)',
              border: '1px solid rgba(249, 115, 22, 0.2)',
              backdropFilter: 'blur(20px)'
            }}
          >
            {/* Header */}
            <div className="bg-orange-500 p-4 text-white font-bold">
              Tournament Support Chat
            </div>

            {/* Messages */}
            <div className="h-64 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-gray-400 text-sm mt-8">
                  <p className="mb-2">👋 Welcome!</p>
                  <p>Ask me anything about registration, fees, or tournament details.</p>
                </div>
              )}

              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                      msg.type === 'user'
                        ? 'bg-orange-500 text-white'
                        : msg.type === 'admin'
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : 'bg-gray-700 text-gray-100'
                    }`}
                  >
                    <div className="flex items-end gap-2">
                      <span>{msg.content}</span>
                      {msg.type === 'user' && msg.read_status && (
                        <span className="text-xs opacity-70">
                          {msg.read_status === 'read' ? (
                            <CheckCheck className="w-3 h-3" />
                          ) : (
                            <Check className="w-3 h-3" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-700 px-4 py-2 rounded-lg">
                    <Loader className="w-4 h-4 animate-spin text-orange-400" />
                  </div>
                </div>
              )}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-green-500/20 px-4 py-2 rounded-lg border border-green-500/30">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-orange-500/20 p-3 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  sendTypingStatus(e.target.value.length > 0)
                }}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your question..."
                className="flex-1 bg-gray-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={sendMessage}
                disabled={loading || !sessionId}
                className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default ChatWidget
