import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Phone, User, MessageSquare, Send, Loader2, AlertCircle, CheckCircle, X, Clock, Eye } from 'lucide-react'
import { listContacts, getContact, replyToContact, deleteContact, type ContactResponse } from '../../api/contact'

export default function ContactsTab() {
  const [contacts, setContacts] = useState<ContactResponse[]>([])
  const [selectedContact, setSelectedContact] = useState<ContactResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [replyLoading, setReplyLoading] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Load contacts
  useEffect(() => {
    loadContacts()
  }, [statusFilter])

  const loadContacts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await listContacts(0, 100, statusFilter || undefined)
      setContacts(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load contacts')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectContact = async (contact: ContactResponse) => {
    try {
      const fullContact = await getContact(contact.id)
      setSelectedContact(fullContact)
      setReplyText('')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load contact details')
    }
  }

  const handleReply = async () => {
    if (!selectedContact || !replyText.trim()) return

    try {
      setReplyLoading(true)
      setError(null)
      
      const updated = await replyToContact(selectedContact.id, {
        status: 'responded',
        admin_reply: replyText,
      })
      
      setSelectedContact(updated)
      setReplyText('')
      setSuccessMessage('Reply sent successfully!')
      
      // Reload contacts list
      await loadContacts()
      
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send reply')
    } finally {
      setReplyLoading(false)
    }
  }

  const handleDelete = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return

    try {
      setError(null)
      await deleteContact(contactId)
      setSelectedContact(null)
      await loadContacts()
      setSuccessMessage('Contact deleted successfully!')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete contact')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'read':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'responded':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'closed':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <Clock className="w-4 h-4" />
      case 'read':
        return <Eye className="w-4 h-4" />
      case 'responded':
        return <CheckCircle className="w-4 h-4" />
      case 'closed':
        return <X className="w-4 h-4" />
      default:
        return null
    }
  }

  return (
    <div className="flex h-full gap-6">
      {/* Left panel - Contacts list */}
      <div className="w-full lg:w-96 flex flex-col border-r border-white/5">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-white font-bold mb-4">Support Messages</h2>
          
          {/* Status filter */}
          <div className="flex gap-2 flex-wrap">
            {['all', 'new', 'read', 'responded', 'closed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status === 'all' ? null : status)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  (status === 'all' && !statusFilter) || statusFilter === status
                    ? 'bg-orange-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </motion.div>
        )}

        {/* Success message */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4 shrink-0" />
            {successMessage}
          </motion.div>
        )}

        {/* Contacts list */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {loading ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : contacts.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
              No contacts found
            </div>
          ) : (
            contacts.map((contact) => (
              <motion.button
                key={contact.id}
                onClick={() => handleSelectContact(contact)}
                whileHover={{ x: 4 }}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedContact?.id === contact.id
                    ? 'bg-orange-500/20 border border-orange-500/30'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{contact.name}</p>
                    <p className="text-gray-500 text-xs truncate">{contact.email}</p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium border flex items-center gap-1 shrink-0 ${getStatusColor(contact.status)}`}>
                    {getStatusIcon(contact.status)}
                    {contact.status}
                  </div>
                </div>
                <p className="text-gray-400 text-xs truncate">{contact.subject}</p>
              </motion.button>
            ))
          )}
        </div>
      </div>

      {/* Right panel - Contact details */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {selectedContact ? (
            <motion.div
              key={selectedContact.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-full overflow-hidden"
            >
              {/* Contact header */}
              <div className="mb-6 pb-4 border-b border-white/5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white font-bold text-lg">{selectedContact.name}</h3>
                    <p className="text-gray-500 text-sm mt-1">{selectedContact.subject}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-lg text-sm font-medium border flex items-center gap-2 ${getStatusColor(selectedContact.status)}`}>
                    {getStatusIcon(selectedContact.status)}
                    {selectedContact.status}
                  </div>
                </div>

                {/* Contact info */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Mail className="w-4 h-4 text-orange-500" />
                    <span className="truncate">{selectedContact.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Phone className="w-4 h-4 text-orange-500" />
                    <span>{selectedContact.phone}</span>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="mb-6 pb-4 border-b border-white/5">
                <p className="text-gray-500 text-xs mb-2">Player's Message</p>
                <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{selectedContact.message}</p>
              </div>

              {/* Admin reply (if exists) */}
              {selectedContact.admin_reply && (
                <div className="mb-6 pb-4 border-b border-white/5">
                  <p className="text-gray-500 text-xs mb-2">Your Reply</p>
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                    <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{selectedContact.admin_reply}</p>
                  </div>
                </div>
              )}

              {/* Reply form */}
              {selectedContact.status !== 'closed' && !selectedContact.admin_reply && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <p className="text-gray-500 text-xs mb-2">Send Reply</p>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply here..."
                    className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-colors resize-none mb-3"
                  />
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleReply}
                      disabled={replyLoading || !replyText.trim()}
                      className="flex-1 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {replyLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Reply
                        </>
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDelete(selectedContact.id)}
                      className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-semibold hover:bg-red-500/20 transition-colors"
                    >
                      Delete
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Delete button for replied/closed contacts */}
              {(selectedContact.status === 'closed' || selectedContact.admin_reply) && (
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDelete(selectedContact.id)}
                    className="flex-1 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-semibold hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Delete Message
                  </motion.button>
                </div>
              )}

              {/* Closed state */}
              {selectedContact.status === 'closed' && (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">This contact is closed</p>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full text-gray-600"
            >
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">Select a contact</p>
                <p className="text-sm mt-1">Click any message from the list to view details and reply</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
