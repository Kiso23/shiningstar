# Complete Chat System Flow Documentation

## 🎯 Full User Journey

### Step 1: User Opens Website
```
User visits https://shiningstarunited.netlify.app
↓
Chat widget loads in bottom-right corner
↓
Frontend checks localStorage for existing sessionId
  - If exists: Restore previous chat history
  - If new: Generate new sessionId and store in localStorage
```

### Step 2: Chat History Restoration (On Page Refresh)
```
Frontend retrieves sessionId from localStorage
↓
Calls: GET /api/v1/chat/history/{sessionId}
↓
Backend returns:
  - All previous messages
  - Chat status (open/transferred/closed)
  - Message metadata (timestamps, read status, sender)
↓
Frontend displays restored conversation
↓
If chat was transferred to admin:
  - Start polling for admin responses every 3 seconds
```

### Step 3: User Sends Message
```
User types message in chat input
↓
Frontend sends typing status: POST /api/v1/chat/typing
  - Notifies admin that user is typing
↓
User presses Enter or clicks Send
↓
Frontend adds message to UI immediately (optimistic update)
↓
Calls: POST /api/v1/chat/message
  {
    "content": "How much is registration fee?",
    "session_id": "session_1234567890",
    "team_name": "My Team",
    "email": "team@example.com",
    "phone": "+91 XXXXXXXXXX"
  }
```

### Step 4: Backend Processing
```
Backend receives message
↓
Stores in PostgreSQL:
  - chat_messages table
  - Fields: id, chat_id, message_type, sender_id, content, 
            created_at, read_status, is_typing, etc.
↓
Analyzes message content:
  - Checks against COMMON_QUESTIONS dictionary
  - Checks for SENSITIVE_KEYWORDS
↓
Decision Tree:
  ├─ Basic Question (e.g., "registration fee")
  │  └─ AI responds immediately
  │     └─ Response saved to database
  │     └─ Sent back to frontend
  │
  └─ Advanced/Sensitive Question
     └─ Transfer to admin
     └─ Chat status changed to "TRANSFERRED"
     └─ Admin dashboard notified
```

### Step 5A: AI Response Flow
```
Backend generates AI response
↓
Saves to database:
  - message_type: "AI"
  - sender_id: "ai-bot"
  - content: "The registration fee is ₹801 per team"
  - read_status: "unread"
  - created_at: timestamp
↓
Returns to frontend:
  {
    "chat_id": 123,
    "ai_response": {
      "id": 456,
      "content": "The registration fee is ₹801 per team",
      "message_type": "AI",
      "sender_id": "ai-bot",
      "created_at": "2026-05-13T10:30:00Z"
    },
    "requires_transfer": false
  }
↓
Frontend displays AI response immediately
↓
Frontend marks message as read:
  POST /api/v1/chat/message/read
  { "message_id": 456 }
```

### Step 5B: Admin Transfer Flow
```
Backend detects sensitive question
↓
Saves user message to database
↓
Generates AI response:
  "Thank you for your question. This requires attention from 
   our admin team. I'm transferring you to a live agent..."
↓
Saves AI response to database
↓
Transfers chat to admin:
  - Chat status: "TRANSFERRED"
  - assigned_admin: "pending"
↓
Returns to frontend:
  {
    "requires_transfer": true,
    "chat_id": 123,
    "status": "transferred"
  }
↓
Frontend shows notification:
  "🔄 Your chat has been transferred to our admin team. 
   They will respond shortly."
↓
Frontend starts polling every 3 seconds:
  GET /api/v1/chat/history/{sessionId}
```

### Step 6: Admin Dashboard
```
Admin logs into dashboard
↓
Clicks "Chat Support" tab
↓
Sees list of pending chats:
  - Team name
  - Email
  - Phone
  - Status badge
↓
Admin clicks on a chat
↓
Sees full conversation history:
  - All user messages
  - AI responses
  - Timestamps
  - Read status indicators
↓
Admin types reply in input field
↓
Admin presses Send
↓
Calls: POST /api/v1/chat/admin/respond
  {
    "chat_id": 123,
    "admin_id": "admin@example.com",
    "message": "The registration deadline is June 30, 2026."
  }
```

### Step 7: Admin Reply Processing
```
Backend receives admin response
↓
Saves to database:
  - message_type: "ADMIN"
  - sender_id: "admin@example.com"
  - content: "The registration deadline is June 30, 2026."
  - read_status: "unread"
  - created_at: timestamp
↓
Returns success response to admin dashboard
↓
Admin dashboard updates to show message sent
```

### Step 8: User Receives Admin Reply
```
Frontend polling detects new message:
  GET /api/v1/chat/history/{sessionId}
  ↓
  Returns updated message list with admin reply
↓
Frontend adds admin message to chat:
  - Type: "admin"
  - Content: "The registration deadline is June 30, 2026."
  - Timestamp: "10:35 AM"
  - Read status: "unread"
↓
Chat updates instantly (within 3 seconds)
↓
User sees admin reply with green styling
↓
Frontend marks message as read:
  POST /api/v1/chat/message/read
  { "message_id": 789 }
↓
Admin dashboard shows read receipt:
  ✓✓ (double checkmark)
```

### Step 9: Conversation Continues
```
User can reply to admin message
↓
Same flow repeats:
  - Message sent to backend
  - Stored in database
  - Admin sees new message in dashboard
  - Admin replies
  - User sees reply via polling
↓
Conversation persists in database
```

### Step 10: Page Refresh - Chat Restored
```
User refreshes page
↓
Frontend loads
↓
Checks localStorage for sessionId
  ✓ Found: "session_1234567890"
↓
Calls: GET /api/v1/chat/history/session_1234567890
↓
Backend returns all messages:
  [
    { id: 1, type: "USER", content: "How much is registration fee?", ... },
    { id: 2, type: "AI", content: "The registration fee is ₹801...", ... },
    { id: 3, type: "USER", content: "What's the deadline?", ... },
    { id: 4, type: "ADMIN", content: "The deadline is June 30...", ... }
  ]
↓
Frontend displays complete conversation
↓
User can continue chatting
↓
All history preserved
```

## 📊 Database Schema

### chats table
```sql
id (PK)
session_id (unique)
team_name
email
phone
status (open/transferred/closed)
assigned_admin
created_at
updated_at
closed_at
```

### chat_messages table
```sql
id (PK)
chat_id (FK)
message_type (user/ai/admin)
sender_id (session_id or admin_id)
content
is_sensitive
requires_transfer
read_status (read/unread)
read_at
is_typing
created_at
updated_at
```

## 🔄 API Endpoints

### User Endpoints
- `POST /api/v1/chat/message` - Send message
- `GET /api/v1/chat/history/{session_id}` - Get chat history
- `POST /api/v1/chat/message/read` - Mark message as read
- `POST /api/v1/chat/typing` - Send typing status

### Admin Endpoints
- `GET /api/v1/chat/admin/pending` - Get pending chats
- `POST /api/v1/chat/admin/respond` - Send admin reply
- `POST /api/v1/chat/close/{chat_id}` - Close chat
- `POST /api/v1/chat/chat/{chat_id}/mark-all-read` - Mark all as read

## 🎨 Frontend Features

### ChatWidget Component
- ✅ Persistent sessionId in localStorage
- ✅ Restore chat history on page refresh
- ✅ Real-time message polling (3 seconds)
- ✅ Read receipts (✓ and ✓✓)
- ✅ Typing indicators
- ✅ Optimistic UI updates
- ✅ Error handling
- ✅ Auto-scroll to latest message

### Admin Dashboard
- ✅ Chat Support tab
- ✅ Pending chats list
- ✅ Full conversation history
- ✅ Send replies
- ✅ Read receipts
- ✅ Close chats
- ✅ Real-time updates

## 🚀 Performance Optimizations

1. **Polling Strategy**
   - 3-second interval (configurable)
   - Stops after 30 minutes
   - Reduces server load

2. **Database Indexing**
   - `chat_id` indexed for fast lookups
   - `session_id` unique indexed
   - `created_at` indexed for sorting

3. **Message Batching**
   - Fetch all messages in one query
   - Compare locally to detect new messages
   - Reduce API calls

4. **LocalStorage Caching**
   - SessionId persisted
   - Reduces database queries on refresh

## 🔐 Security Features

1. **Session Isolation**
   - Each user has unique sessionId
   - Can only access their own chat

2. **Message Validation**
   - Content length limits
   - XSS prevention
   - Input sanitization

3. **Admin Authentication**
   - Admin dashboard requires login
   - Admin ID tracked in messages
   - Audit trail maintained

## 📈 Monitoring & Analytics

Track in database:
- Total chats created
- AI vs Admin transfer ratio
- Average response time
- Chat resolution rate
- User satisfaction

## 🔮 Future Enhancements

1. **WebSocket Support**
   - Replace polling with real-time WebSocket
   - Instant message delivery
   - Typing indicators in real-time

2. **File Sharing**
   - Upload payment proofs
   - Share documents
   - Image support

3. **Chat Transcripts**
   - Email conversation history
   - PDF export
   - Archive old chats

4. **AI Improvements**
   - Machine learning for better routing
   - Sentiment analysis
   - Automated escalation

5. **Multi-language Support**
   - Translate messages
   - Support multiple languages
   - Regional customization

---

**Status**: ✅ Complete and Production Ready
**Last Updated**: May 13, 2026
**Version**: 1.0.0
