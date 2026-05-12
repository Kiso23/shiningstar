import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, MessageSquare, Clock, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import client from '../../api/client'

interface Chat {
  id: number
  session_id: string
  team_name?: string
  email?: string
  phone?: string
  status: 'OPEN' | 'TRANSFERRED' | 'CLOSED'
  assigned_admin?: string
  created_at: string
  closed_at?: string
}

interface ChatMessage {
  id: number
  chat_id: number
  message_type: 'USER' | 'AI' | 'ADMIN'
  content: string
  created_at: string
}

export default function ChatSupportTab() {
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [replyText, setReplyText] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingChats, setLoadingChats] = useState(true)

  // Fetch pending chats
  useEffect(() => {
    fetchPendingChats()
    const interval = setInterval(fetchPendingChats, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchPendingChats = async () => {
    try {
      const response = await client.get('/chat/admin/pending')
      setChats(response.data.pending_chats)
      setLoadingChats(false)
    } catch (error) {
      console.error('Error fetching chats:', error)
      setLoadingChats(false)
    }
  }

  // Fetch messages for selected chat
  useEffect(() => {
    if (selectedChat) {
      fetchChatMessages()
    }
  }, [selectedChat])

  const fetchChatMessages = async () => {
    if (!selectedChat) return
    try {
      const response = await client.get(`/chat/history/${selectedChat.session_id}`)
      setMessages(response.data.messages)
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const sendReply = async () => {
    if (!replyText.trim() || !selectedChat) return

    setLoading(true)
    try {
      const response = await client.post('/chat/admin/respond', {
        chat_id: selectedChat.id,
        admin_id: 'admin', // In production, use actual admin ID from auth
        message: replyText
      })

      // Add the new message to the list
      setMessages([...messages, response.data.message])
      setReplyText('')
    } catch (error) {
      console.error('Error sending reply:', error)
    } finally {
      setLoading(false)
    }
  }

  const closeChat = async (chatId: number) => {
    try {
      await client.post(`/chat/close/${chatId}`)
      setChats(chats.filter(c => c.id !== chatId))
      if (selectedChat?.id === chatId) {
        setSelectedChat(null)
      }
    } catch (error) {
      console.error('Error closing chat:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'TRANSFERRED':
        return <Clock className="w-4 h-4 text-blue-500" />
      case 'CLOSED':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      default:
        return null
    }
  }

  return (
    <div className="flex h-full gap-4">
      {/* Chat List */}
      <div className="w-80 border-r border-white/10 flex flex-col">
        <h3 className="text-white font-bold mb-4">Pending Chats ({chats.length})</h3>
        
        {loadingChats ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-5 h-5 animate-spin text-orange-500" />
          </div>
        ) : chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No pending chats</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2">
            {chats.map((chat) => (
              <motion.button
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                whileHover={{ x: 4 }}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedChat?.id === chat.id
                    ? 'bg-orange-500/20 border border-orange-500/50'
                    : 'bg-white/5 hover:bg-white/10 border border-white/10'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">
                      {chat.team_name || 'Unknown Team'}
                    </p>
                    <p className="text-gray-400 text-xs truncate">{chat.email}</p>
                  </div>
                  {getStatusIcon(chat.status)}
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Chat View */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-bold">{selectedChat.team_name || 'Unknown Team'}</h3>
                  <p className="text-gray-400 text-sm">{selectedChat.email}</p>
                  {selectedChat.phone && (
                    <p className="text-gray-400 text-sm">{selectedChat.phone}</p>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => closeChat(selectedChat.id)}
                  className="btn-secondary py-2 px-4 text-sm"
                >
                  Close Chat
                </motion.button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-3">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>No messages yet</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.message_type === 'USER' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                        msg.message_type === 'USER'
                          ? 'bg-gray-700 text-gray-100'
                          : msg.message_type === 'ADMIN'
                          ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      <div className="flex items-end gap-2">
                        <span>{msg.content}</span>
                        {msg.read_status === 'read' && (
                          <span className="text-xs opacity-70">✓✓</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Reply Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendReply()}
                placeholder="Type your reply..."
                className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={sendReply}
                disabled={loading || !replyText.trim()}
                className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </motion.button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Select a chat to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
