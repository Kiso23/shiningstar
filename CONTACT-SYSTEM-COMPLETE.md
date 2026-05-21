# Contact/Support System - Complete Implementation

## Overview
A complete contact/support system has been implemented allowing players to submit questions/doubts and admins to manage and reply to them via email.

## What Players See

### Contact Form Page (`/contact`)
- Beautiful contact form with validation
- Fields: Name, Email, Phone (10-digit), Subject, Message
- Success message with 3-second auto-redirect to home
- Responsive design for mobile and desktop
- Smooth animations with Framer Motion

**Access**: Players can navigate to `/contact` from the app

## What Admins See

### Admin Dashboard - Support Tab
Located in the admin dashboard alongside Registrations, Fixtures, Live Scores, Analytics, and Settings.

**Features**:
1. **Contact List** (Left panel)
   - All player support messages
   - Status filtering: All, New, Read, Responded, Closed
   - Shows player name, email, and subject
   - Visual status badges with color coding
   - Real-time updates

2. **Contact Details** (Right panel)
   - Player information: Name, Email, Phone
   - Original message from player
   - Subject line
   - Current status with icon

3. **Reply Interface**
   - Text area to compose reply
   - Send Reply button (auto-sends email to player)
   - Delete button to remove contact
   - Shows previous admin reply if exists

4. **Status Tracking**
   - **New**: Unread message from player
   - **Read**: Admin has viewed the message
   - **Responded**: Admin has sent a reply (email sent to player)
   - **Closed**: Contact is archived

## Backend Implementation

### Database Model (`app/models/contact.py`)
```python
- id: UUID (primary key)
- name: String (player name)
- email: String (player email)
- phone: String (10-digit phone)
- subject: String (message subject)
- message: Text (full message)
- status: Enum (new, read, responded, closed)
- admin_reply: Text (optional admin response)
- created_at: DateTime
- updated_at: DateTime
```

### API Endpoints (`app/routers/contact.py`)

**Public Endpoints**:
- `POST /api/v1/contact` - Submit contact form
  - Triggers admin notification email
  - Returns contact ID and confirmation

**Admin Endpoints** (require authentication):
- `GET /api/v1/contact/admin/contacts` - List all contacts with filtering
- `GET /api/v1/contact/admin/contacts/{id}` - Get contact details
- `PATCH /api/v1/contact/admin/contacts/{id}/reply` - Send reply to player
  - Triggers email to player with admin response
  - Updates status to "responded"
- `PATCH /api/v1/contact/admin/contacts/{id}/status` - Update status
- `DELETE /api/v1/contact/admin/contacts/{id}` - Delete contact
- `GET /api/v1/contact/admin/contacts-count` - Get count by status

### Email Notifications (`app/services/email_service.py`)

**Two new functions**:
1. `send_contact_notification()` - Sent to admin when player submits form
   - Includes player name, email, phone, subject, and message
   - Allows admin to quickly see new inquiries

2. `send_contact_reply()` - Sent to player when admin replies
   - Includes admin's response
   - Professional email template
   - Helps resolve player doubts about tournament

## Frontend Implementation

### Contact Form Page (`frontend/src/pages/ContactPage.tsx`)
- Standalone page with beautiful UI
- Form validation (email format, 10-digit phone)
- Loading state with spinner
- Success message with auto-redirect
- Error handling with user-friendly messages
- Responsive design

### Admin Contacts Tab (`frontend/src/components/admin/ContactsTab.tsx`)
- Two-panel layout (list + details)
- Status filtering with quick buttons
- Real-time updates after actions
- Loading states and error messages
- Success notifications
- Delete confirmation dialog
- Smooth animations

### API Client (`frontend/src/api/contact.ts`)
- `submitContact()` - Public form submission
- `listContacts()` - Get all contacts with filtering
- `getContact()` - Get single contact details
- `replyToContact()` - Send admin reply
- `updateContactStatus()` - Change status
- `deleteContact()` - Remove contact
- `getContactsCount()` - Get count by status

### Routing (`frontend/src/App.tsx`)
- Added `/contact` route for public contact form
- Accessible from anywhere in the app

### Admin Dashboard (`frontend/src/pages/AdminDashboardPage.tsx`)
- Added "Support" tab with MessageSquare icon
- Integrated ContactsTab component
- Maintains existing tab structure and styling

## How It Works

### Player Flow
1. Player navigates to `/contact`
2. Fills out form with name, email, phone, subject, message
3. Clicks "Send Message"
4. Form submits to backend
5. Admin receives email notification
6. Success message shows with 3-second countdown
7. Auto-redirects to home page

### Admin Flow
1. Admin logs into dashboard
2. Clicks "Support" tab
3. Sees list of all player messages
4. Can filter by status (New, Read, Responded, Closed)
5. Clicks on a message to view details
6. Reads player's question/doubt
7. Types reply in text area
8. Clicks "Send Reply"
9. Email automatically sent to player
10. Status updates to "Responded"
11. Can delete or close contact as needed

## Build Status
✅ **Frontend**: Compiles successfully with no errors
✅ **Backend**: Python files compile without syntax errors
✅ **Deployment**: Pushed to GitHub - auto-deploy triggered

## Files Created/Modified

### Created
- `backend/app/models/contact.py`
- `backend/app/schemas/contact.py`
- `backend/app/services/contact_service.py`
- `backend/app/routers/contact.py`
- `frontend/src/pages/ContactPage.tsx`
- `frontend/src/api/contact.ts`
- `frontend/src/components/admin/ContactsTab.tsx`

### Modified
- `backend/app/main.py` - Added contact model import and router registration
- `backend/app/services/email_service.py` - Added 2 new email functions
- `frontend/src/App.tsx` - Added /contact route
- `frontend/src/pages/AdminDashboardPage.tsx` - Added Support tab

## Testing the Feature

### Test Contact Submission
1. Go to `http://localhost:5173/contact`
2. Fill out form with test data
3. Submit
4. Check admin email for notification
5. Verify success message and redirect

### Test Admin Reply
1. Log into admin dashboard
2. Go to Support tab
3. Click on a contact
4. Type a reply
5. Click "Send Reply"
6. Check player email for reply
7. Verify status changed to "Responded"

## Next Steps (Optional)
- Add contact form link to homepage/navbar
- Add notification badge to Support tab showing unread count
- Add export contacts feature
- Add search functionality for contacts
- Add date range filtering
- Add bulk actions (mark as read, delete multiple)

## Support
For questions about the contact system implementation, refer to:
- Backend: `backend/app/routers/contact.py`
- Frontend: `frontend/src/components/admin/ContactsTab.tsx`
- Email: `backend/app/services/email_service.py`
