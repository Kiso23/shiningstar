# Requirements Document

## Introduction

This document defines the requirements for the **Shining Star United Football Tournament Registration Website** — a modern, responsive web application that enables team managers to register for football tournaments, submit player details, and upload UPI payment proof. It also provides a secure admin dashboard for the tournament organizer to manage registrations, verify payments, and approve or reject teams.

The system targets two user roles: **Admin** (the tournament organizer) and **Team Manager** (a representative registering a team). The MVP must support the full registration lifecycle from team sign-up through payment verification to final approval.

---

## Glossary

- **System**: The Shining Star United Football Tournament Registration Website as a whole.
- **Registration_Service**: The backend component responsible for creating and managing team registrations.
- **Auth_Service**: The backend component responsible for authenticating and authorizing users.
- **Payment_Service**: The backend component responsible for handling payment screenshot uploads and verification status.
- **Admin_Dashboard**: The frontend interface available exclusively to the Admin role.
- **Registration_Form**: The multi-step frontend form used by Team Managers to register a team.
- **Team**: A football team submitting a registration for the tournament.
- **Team_Manager**: A user who registers and manages a Team's registration.
- **Admin**: The tournament organizer who manages all registrations via the Admin_Dashboard.
- **Player**: An individual member of a Team whose details are submitted during registration.
- **Payment_Proof**: A screenshot image uploaded by the Team_Manager as evidence of a UPI payment.
- **UPI**: Unified Payments Interface — the payment method used for tournament registration fees.
- **Registration_Status**: The current state of a Team's registration: `pending`, `payment_submitted`, `approved`, or `rejected`.
- **JWT**: JSON Web Token used for stateless authentication of the Admin.
- **QR_Code**: A scannable image encoding the organizer's UPI payment address, displayed to Team Managers.

---

## Requirements

### Requirement 1: Tournament Information Display

**User Story:** As a Team Manager, I want to view tournament details on the homepage, so that I can understand the event before deciding to register.

#### Acceptance Criteria

1. THE System SHALL display the tournament name, date, venue, and prize details on the homepage.
2. THE System SHALL display a "Register Now" call-to-action button on the homepage that navigates the Team_Manager to the Registration_Form.
3. WHEN the homepage is loaded on a mobile device, THE System SHALL render all tournament information in a single-column, mobile-responsive layout without horizontal scrolling.

---

### Requirement 2: Team Registration

**User Story:** As a Team Manager, I want to register my team by submitting team and contact details, so that my team is entered into the tournament.

#### Acceptance Criteria

1. THE Registration_Form SHALL collect the following fields: team name, manager name, contact phone number, contact email address, and number of players.
2. WHERE a Team_Manager chooses to upload a team logo, THE Registration_Form SHALL accept image files in JPEG or PNG format with a maximum size of 2 MB.
3. WHEN the Team_Manager submits the Registration_Form with all required fields populated, THE Registration_Service SHALL create a new Team record with Registration_Status set to `pending` and return a unique registration identifier.
4. WHEN the Team_Manager submits the Registration_Form with one or more required fields missing, THE Registration_Form SHALL display a descriptive validation error for each missing field without submitting the form.
5. WHEN the Team_Manager submits the Registration_Form with a contact phone number that does not match a 10-digit numeric format, THE Registration_Form SHALL display a validation error indicating the expected format.
6. WHEN the Team_Manager submits the Registration_Form with an email address that does not conform to standard email format, THE Registration_Form SHALL display a validation error indicating the expected format.
7. IF the Registration_Service fails to create a Team record due to a server error, THEN THE Registration_Form SHALL display an error message instructing the Team_Manager to retry.

---

### Requirement 3: Player Details Submission

**User Story:** As a Team Manager, I want to submit individual player details for my team, so that the organizer has a complete roster.

#### Acceptance Criteria

1. WHEN a Team record has been created, THE Registration_Form SHALL display a dynamic player details section containing one entry row per player, based on the number of players specified during team registration.
2. THE Registration_Form SHALL collect the following fields for each Player: full name and age.
3. WHEN the Team_Manager submits the player details step with any Player's required fields missing, THE Registration_Form SHALL display a descriptive validation error for each missing field without advancing to the next step.
4. WHEN the Team_Manager submits valid player details, THE Registration_Service SHALL associate all Player records with the corresponding Team record.
5. IF the number of players specified is fewer than 7 or greater than 18, THEN THE Registration_Form SHALL display a validation error stating the allowed range before the Team_Manager can proceed.

---

### Requirement 4: UPI Payment Flow

**User Story:** As a Team Manager, I want to view the UPI payment details and upload my payment screenshot, so that the organizer can verify my payment.

#### Acceptance Criteria

1. WHEN the Team_Manager reaches the payment step, THE System SHALL display the organizer's UPI QR_Code and UPI ID prominently.
2. THE System SHALL indicate which UPI apps (Google Pay, PhonePe, Paytm) are accepted on the payment step.
3. WHEN the Team_Manager uploads a Payment_Proof image, THE Payment_Service SHALL accept JPEG and PNG files with a maximum size of 5 MB.
4. WHEN the Team_Manager submits a valid Payment_Proof, THE Payment_Service SHALL store the image and update the Team's Registration_Status to `payment_submitted`.
5. WHEN the Team_Manager attempts to submit the payment step without uploading a Payment_Proof, THE Registration_Form SHALL display a validation error requiring the upload before submission.
6. IF the Payment_Service fails to store the Payment_Proof due to a server error, THEN THE System SHALL display an error message and preserve the Team_Manager's uploaded file so the Team_Manager can retry without re-selecting the file.

---

### Requirement 5: Registration Confirmation

**User Story:** As a Team Manager, I want to receive a confirmation after submitting my registration, so that I know my submission was received.

#### Acceptance Criteria

1. WHEN the Team_Manager successfully submits the Payment_Proof, THE System SHALL display a confirmation screen showing the unique registration identifier and the current Registration_Status.
2. THE System SHALL display a message on the confirmation screen informing the Team_Manager that the Admin will review the payment and update the status.
3. WHERE the optional team dashboard feature is enabled, THE System SHALL provide the Team_Manager with a link to a status-tracking page using the unique registration identifier.

---

### Requirement 6: Admin Authentication

**User Story:** As an Admin, I want to log in securely, so that only I can access the Admin_Dashboard.

#### Acceptance Criteria

1. THE Auth_Service SHALL expose a login endpoint that accepts an email address and password.
2. WHEN the Admin submits valid credentials, THE Auth_Service SHALL return a signed JWT with an expiry of no more than 24 hours.
3. WHEN the Admin submits invalid credentials, THE Auth_Service SHALL return an error response and SHALL NOT return a JWT.
4. WHILE a valid JWT is present in the request, THE Admin_Dashboard SHALL be accessible.
5. WHEN a request to the Admin_Dashboard is made without a valid JWT, THE System SHALL redirect the requester to the login page.
6. IF the JWT has expired, THEN THE Auth_Service SHALL reject the request and THE System SHALL redirect the Admin to the login page.
7. THE Auth_Service SHALL store Admin passwords as salted cryptographic hashes and SHALL NOT store plaintext passwords.

---

### Requirement 7: Admin Dashboard — Registration Management

**User Story:** As an Admin, I want to view and manage all team registrations, so that I can oversee the tournament sign-up process.

#### Acceptance Criteria

1. WHILE the Admin is authenticated, THE Admin_Dashboard SHALL display a paginated list of all registered Teams, showing team name, manager name, contact details, number of players, Registration_Status, and registration timestamp.
2. WHEN the Admin selects a Team from the list, THE Admin_Dashboard SHALL display the full team details including all associated Player records and the uploaded Payment_Proof image.
3. WHEN the Admin approves a Team, THE Registration_Service SHALL update the Team's Registration_Status to `approved`.
4. WHEN the Admin rejects a Team, THE Registration_Service SHALL update the Team's Registration_Status to `rejected`.
5. THE Admin_Dashboard SHALL display the Payment_Proof image inline so the Admin can verify it without downloading the file.
6. THE Admin_Dashboard SHALL allow the Admin to filter the team list by Registration_Status.
7. THE Admin_Dashboard SHALL allow the Admin to search the team list by team name or manager name.

---

### Requirement 8: Data Export

**User Story:** As an Admin, I want to export registration data, so that I can use it in external tools for reporting and planning.

#### Acceptance Criteria

1. WHEN the Admin requests a data export, THE Admin_Dashboard SHALL generate a downloadable file containing all Team and Player records.
2. THE Admin_Dashboard SHALL support export in CSV format.
3. WHERE the Excel export option is enabled, THE Admin_Dashboard SHALL support export in XLSX format.
4. THE exported file SHALL include the following fields for each Team: registration identifier, team name, manager name, contact phone, contact email, number of players, Registration_Status, and registration timestamp.
5. THE exported file SHALL include the following fields for each Player: registration identifier (of the associated Team), player full name, and player age.

---

### Requirement 9: Security and Data Integrity

**User Story:** As an Admin, I want the system to be secure, so that registration data and admin access are protected.

#### Acceptance Criteria

1. THE System SHALL transmit all data between the client and server over HTTPS.
2. THE Auth_Service SHALL enforce JWT-based authorization on all Admin API endpoints.
3. WHEN a Team_Manager accesses any Admin API endpoint, THE Auth_Service SHALL return a 403 Forbidden response.
4. THE Registration_Service SHALL validate all incoming request payloads on the server side and SHALL reject requests with invalid or missing required fields with a 400 Bad Request response.
5. WHEN a file upload is received, THE Payment_Service SHALL validate the file MIME type and reject files that are not JPEG or PNG with a 400 Bad Request response.
6. THE System SHALL sanitize all user-supplied text inputs before persisting them to the database to prevent injection attacks.

---

### Requirement 10: Responsive and Accessible UI

**User Story:** As a Team Manager, I want the website to work well on my phone, so that I can register from any device.

#### Acceptance Criteria

1. THE System SHALL render all pages correctly on viewport widths from 320 px to 1920 px without loss of functionality.
2. THE System SHALL achieve a Lighthouse mobile performance score of 70 or above on the homepage and Registration_Form pages.
3. THE Registration_Form SHALL be completable end-to-end on a mobile device without requiring a desktop browser.
4. THE System SHALL use sufficient color contrast ratios meeting WCAG 2.1 AA standards for all text and interactive elements.
5. THE System SHALL provide descriptive alt text for all non-decorative images, including the UPI QR_Code.
