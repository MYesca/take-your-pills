# TakeYourPills - Epics and Stories

**Author:** Yesca
**Date:** 2025-11-19
**Version:** 1.0

---

## Context

This epic breakdown is derived from:
- **PRD:** `docs/prd.md` (46 Functional Requirements, 22 Non-Functional Requirements)
- **UX Design:** `docs/ux-design-specification.md` (shadcn/ui + Tailwind CSS, MyTherapy-inspired design)
- **Architecture:** `docs/architecture.md` (Next.js 15, PostgreSQL + Prisma, Microsoft Entra External ID)

---

## FR Inventory

### User Account & Access
- FR1: Users can create accounts using Microsoft Entra External ID (OpenID Connect)
- FR2: Users can log in securely and maintain authenticated sessions
- FR3: Users can log out and end their sessions
- FR4: User sessions time out after a configurable period of inactivity

### Medication Registration & Management
- FR5: Users can register new medications by providing a medication name
- FR6: Users can define medication schedules using a user-friendly form interface (not CRON syntax)
- FR7: System accepts only schedules that can be mapped to CRON expressions
- FR8: Users can register fixed time-of-day schedules (e.g., 9:00 AM, 9:00 PM)
- FR9: Users can register multiple occurrences per day for the same medication (e.g., 9:00 AM and 9:00 PM)
- FR10: Users can register daily recurring patterns
- FR11: System validates that all entered schedules are mappable to valid CRON expressions
- FR12: System stores schedules internally as CRON expressions
- FR13: Users can edit existing medication information (name, schedule)
- FR14: Users can delete medications from their account
- FR15: Users can view a list of all their registered medications

### Daily Medication Tracking
- FR16: System calculates which medications are scheduled for the current day based on stored CRON expressions
- FR17: Dashboard displays all medications scheduled for the current day
- FR18: Dashboard displays the scheduled time for each medication (in user's timezone)
- FR19: Users can mark medications as consumed using a checkbox interface
- FR20: Users can unmark medications (mark as not consumed) if marked incorrectly
- FR21: Dashboard shows visual indicators distinguishing consumed vs. pending medications
- FR22: Users can mark medications as consumed retroactively for the current day (before end of day)
- FR23: System records the timestamp (UTC) when a medication is marked as consumed

### Adherence Reporting
- FR24: Users can view an adherence report showing medication consumption history
- FR25: Report displays a grid view with medications as rows and time periods as columns
- FR26: Report shows last X occurrences (configurable, e.g., last 7 or 30 days)
- FR27: Report displays clear visual indicators for each occurrence (✓ consumed, ✗ missed, ○ future)
- FR28: Users can configure the time window for the adherence report (e.g., last 7, 14, or 30 days)
- FR29: Report helps users identify patterns of missed medications

### User Preferences
- FR30: Users can set their timezone preference in app settings
- FR31: Users can update their timezone preference at any time
- FR32: System stores timezone preference per user account
- FR33: System does not infer timezone from browser or device
- FR34: All medication times displayed to users are shown in their selected timezone
- FR35: All user time inputs are converted from their selected timezone to UTC for storage
- FR36: All system outputs are converted from UTC to user's selected timezone for display

### Data Isolation & Security
- FR37: Users can only view and manage their own medications
- FR38: Users cannot access other users' medication data
- FR39: System enforces complete data isolation between users
- FR40: All user data is associated with authenticated user accounts
- FR41: System prevents unauthorized access to medication data

### Timezone Handling
- FR42: System stores all dates and times internally in UTC timezone
- FR43: System processes all date/time calculations in UTC
- FR44: Frontend converts user time inputs from user's timezone to UTC before storage
- FR45: Frontend converts system time outputs from UTC to user's timezone for display
- FR46: System correctly handles medication scheduling across different user timezones

---

## Epic Structure

### Epic 1: Foundation & Project Setup
**Goal:** Establish project infrastructure, development environment, and core dependencies to enable all subsequent development work.

**FR Coverage:** Infrastructure needs for all FRs

**Stories:**
1. Project initialization and core dependencies
2. Database schema and Prisma setup
3. Authentication infrastructure (MSAL configuration)
4. Development environment and tooling

---

### Epic 2: User Authentication
**Goal:** Users can securely access the application with their Microsoft Entra External ID account, maintaining authenticated sessions.

**FR Coverage:** FR1, FR2, FR3, FR4

**Stories:**
1. Microsoft Entra External ID integration (frontend)
2. Authentication API routes and token validation
3. Protected routes and session management
4. Logout functionality

---

### Epic 3: Medication Registration & Management
**Goal:** Users can register, edit, and manage their medications with flexible scheduling using a user-friendly interface that hides CRON complexity.

**FR Coverage:** FR5, FR6, FR7, FR8, FR9, FR10, FR11, FR12, FR13, FR14, FR15

**Stories:**
1. Medication registration form with schedule input
2. CRON expression conversion and validation
3. Medication list view
4. Edit medication functionality
5. Delete medication functionality

---

### Epic 4: Daily Medication Tracking (Primary Value Epic)
**Goal:** Users can quickly check and mark their daily medications as consumed, preventing missed doses and double-dosing.

**FR Coverage:** FR16, FR17, FR18, FR19, FR20, FR21, FR22, FR23

**Stories:**
1. Dashboard page with time-grouped medication display
2. CRON-based occurrence calculation for today
3. Medication marking (checkbox interaction)
4. Optimistic UI updates and error handling
5. Retroactive marking for same day
6. Visual status indicators (consumed vs pending)

---

### Epic 5: Adherence Reporting
**Goal:** Users can review their medication adherence patterns over time to identify missed medication patterns.

**FR Coverage:** FR24, FR25, FR26, FR27, FR28, FR29

**Stories:**
1. Adherence report page with grid layout
2. Historical occurrence calculation
3. Configurable time window selector
4. Visual indicators (consumed/missed/future)

---

### Epic 6: User Preferences & Timezone Configuration
**Goal:** Users can configure their timezone preference for accurate medication time display regardless of server location or travel.

**FR Coverage:** FR30, FR31, FR32, FR33, FR34, FR35, FR36

**Stories:**
1. Settings page with timezone selector
2. Timezone preference storage and retrieval
3. Timezone conversion utilities (UTC ↔ user timezone)
4. Timezone-aware time display across application

---

## Detailed Story Breakdown

### Epic 1: Foundation & Project Setup

#### Story 1.1: Project Initialization and Core Dependencies

**User Story:**
As a developer,
I want the project initialized with Next.js 15, TypeScript, and Tailwind CSS,
So that I have a solid foundation for building the medication tracking application.

**Acceptance Criteria:**
Given I am setting up the project for the first time
When I run `npx create-next-app@latest takeyourpills --typescript --tailwind --app --no-src-dir`
Then the project structure is created with:
- Next.js 15 App Router structure
- TypeScript configuration (`tsconfig.json`)
- Tailwind CSS configuration (`tailwind.config.ts`)
- Base project files (package.json, .gitignore, etc.)

And when I install additional dependencies:
- Prisma and @prisma/client are installed
- @azure/msal-react and @azure/msal-node are installed
- cron-parser and node-cron are installed
- date-fns and date-fns-tz are installed
- zod is installed for validation
- @tanstack/react-query is installed for data fetching
- shadcn/ui is initialized with `npx shadcn-ui@latest init`

And the development server starts successfully with `npm run dev`

**Prerequisites:** None (first story)

**Technical Notes:**
- Follow architecture document initialization commands
- Ensure all dependencies match versions specified in architecture
- Configure shadcn/ui with Tailwind CSS integration
- Set up environment variable template (.env.example)

**Affected Components:**
- Project root structure
- package.json
- Configuration files

---

#### Story 1.2: Database Schema and Prisma Setup

**User Story:**
As a developer,
I want the database schema defined with Prisma and migrations set up,
So that medication data can be stored and queried efficiently.

**Acceptance Criteria:**
Given the project is initialized
When I run `npx prisma init`
Then Prisma is configured with:
- `prisma/schema.prisma` file created
- PostgreSQL datasource configured
- DATABASE_URL environment variable template

And when I define the Prisma schema:
- User model with id, externalId, email, timezone, timestamps
- Medication model with id, userId, name, cronExpression, timestamps
- ConsumptionHistory model with id, medicationId, userId, scheduledTime, consumedAt, timestamps
- All relationships defined (User → Medications, User → ConsumptionHistory, Medication → ConsumptionHistory)
- Unique constraints defined (user_id + medication name, medication_id + scheduled_time)
- Indexes defined for efficient queries (user_id, medication_id, scheduled_time)

And when I run `npx prisma migrate dev --name init`
Then:
- Initial migration is created
- Database tables are created in external PostgreSQL server
- Prisma Client is generated

And when I run `npx prisma studio`
Then I can view and interact with the database schema

**Prerequisites:** Story 1.1

**Technical Notes:**
- Follow Prisma schema from architecture document (section 6.1)
- Use UUID for all primary keys
- Use TIMESTAMP WITH TIME ZONE for all date/time fields
- Ensure CASCADE deletes for referential integrity
- All queries must filter by user_id for data isolation

**Affected Components:**
- `prisma/schema.prisma`
- `prisma/migrations/`
- `lib/prisma/client.ts` (Prisma Client singleton)

---

#### Story 1.3: Authentication Infrastructure (MSAL Configuration)

**User Story:**
As a developer,
I want MSAL (Microsoft Authentication Library) configured for frontend and backend,
So that users can authenticate with Microsoft Entra External ID.

**Acceptance Criteria:**
Given the project is initialized
When I configure MSAL React:
- MSAL configuration file created (`lib/auth/msal.ts`)
- MSAL instance configured with Azure client ID, tenant ID, redirect URI
- MSAL provider component created for wrapping the app
- Public client configuration for browser-based authentication

And when I configure MSAL Node:
- MSAL Node configuration for backend token validation
- Token validation utility function created
- User ID extraction from token claims implemented

And when I set up environment variables:
- AZURE_CLIENT_ID is configured
- AZURE_CLIENT_SECRET is configured
- AZURE_TENANT_ID is configured
- AZURE_REDIRECT_URI is configured

Then MSAL is ready for authentication flows

**Prerequisites:** Story 1.1

**Technical Notes:**
- Use @azure/msal-react for frontend (PublicClientApplication)
- Use @azure/msal-node for backend (ConfidentialClientApplication)
- Follow Microsoft Entra External ID setup guide
- Store configuration in environment variables
- Implement token refresh handling

**Affected Components:**
- `lib/auth/msal.ts`
- `app/layout.tsx` (MSAL provider wrapper)
- Environment variables

---

#### Story 1.4: Development Environment and Tooling

**User Story:**
As a developer,
I want development tooling configured (linting, testing, type checking),
So that code quality is maintained throughout development.

**Acceptance Criteria:**
Given the project is initialized
When I configure ESLint:
- ESLint configuration file created
- Next.js ESLint plugin configured
- TypeScript ESLint rules enabled

And when I configure Prettier (optional):
- Prettier configuration file created
- Format on save configured in IDE

And when I configure testing:
- Vitest configuration file created
- @testing-library/react configured
- Test utilities and helpers set up
- Example test file created

And when I configure type checking:
- TypeScript strict mode enabled
- `npm run type-check` script works

And when I configure Git:
- .gitignore includes node_modules, .env.local, .next, etc.
- .env.example file created with all required variables

Then the development environment is ready for coding

**Prerequisites:** Story 1.1

**Technical Notes:**
- Follow Next.js recommended ESLint configuration
- Use Vitest for unit and integration tests
- Configure Playwright for E2E tests (future)
- Ensure all environment variables are documented in .env.example

**Affected Components:**
- `.eslintrc.json`
- `vitest.config.ts`
- `.gitignore`
- `.env.example`
- `package.json` scripts

---

### Epic 2: User Authentication

#### Story 2.1: Microsoft Entra External ID Integration (Frontend)

**User Story:**
As a user,
I want to log in using my Microsoft Entra External ID account,
So that I can securely access my medication tracking data.

**Acceptance Criteria:**
Given I am on the login page
When I click "Sign in with Microsoft"
Then:
- I am redirected to Microsoft Entra External ID login page
- I can enter my Microsoft account credentials
- After successful authentication, I am redirected back to the application
- My access token is stored by MSAL (in-memory, not localStorage)
- I am redirected to the dashboard

And when authentication fails:
- I see an error message explaining the issue
- I can retry the login process

And when I am already authenticated:
- I am automatically redirected to the dashboard
- I don't see the login page

**Prerequisites:** Story 1.3

**Technical Notes:**
- Use MSAL React loginRedirect or loginPopup method
- Handle OAuth callback in `/api/auth/callback` route
- Extract user info from ID token (email, external ID)
- Create or update user record in database on first login
- Store user ID in session/token for subsequent requests

**Affected Components:**
- `app/(auth)/login/page.tsx`
- `app/api/auth/callback/route.ts`
- `lib/auth/msal.ts`
- `components/layout/Header.tsx` (login button)

**FR Coverage:** FR1, FR2

---

#### Story 2.2: Authentication API Routes and Token Validation

**User Story:**
As a system,
I want to validate authentication tokens on API requests,
So that only authenticated users can access their medication data.

**Acceptance Criteria:**
Given a user makes an API request
When the request includes an Authorization header with Bearer token
Then:
- The token is validated using MSAL Node
- User ID is extracted from token claims
- User record is verified in database (create if first login)
- Request proceeds with authenticated user context

And when the token is invalid or expired:
- Request returns 401 Unauthorized
- Error response includes clear message
- Frontend handles 401 by redirecting to login

And when no token is provided:
- Request returns 401 Unauthorized
- Frontend redirects to login page

And when I create the `/api/auth/me` endpoint:
- It returns current user information (id, email, timezone)
- It uses authenticated user context from token

**Prerequisites:** Story 2.1

**Technical Notes:**
- Create authentication middleware for API routes
- Use MSAL Node ConfidentialClientApplication for token validation
- Extract user ID from token claims (sub or oid claim)
- Create user record on first login if doesn't exist
- Store external_id from Microsoft Entra ID for user lookup

**Affected Components:**
- `lib/auth/middleware.ts` (authentication middleware)
- `app/api/auth/me/route.ts`
- All protected API routes (use middleware)

**FR Coverage:** FR2, FR40, FR41

---

#### Story 2.3: Protected Routes and Session Management

**User Story:**
As a user,
I want my session to be maintained while I use the application,
So that I don't have to log in repeatedly.

**Acceptance Criteria:**
Given I am logged in
When I navigate between pages:
- I remain authenticated
- My session persists across page navigations
- I don't see login prompts

And when I access a protected route:
- If authenticated, I see the page content
- If not authenticated, I am redirected to login

And when my session expires:
- I am automatically redirected to login
- I see a message explaining the session expired
- I can log in again to continue

And when I configure session timeout:
- Session timeout is configurable (default: token expiration)
- MSAL handles token refresh automatically
- User is notified before session expires (optional, future)

**Prerequisites:** Story 2.2

**Technical Notes:**
- Use Next.js middleware for route protection
- Check authentication status on each page load
- Use MSAL's token refresh capabilities
- Store session state in MSAL (handled automatically)
- Implement route guards for protected pages

**Affected Components:**
- `middleware.ts` (Next.js middleware)
- `app/layout.tsx` (authentication check)
- All protected page components

**FR Coverage:** FR2, FR4

---

#### Story 2.4: Logout Functionality

**User Story:**
As a user,
I want to log out of the application,
So that I can securely end my session.

**Acceptance Criteria:**
Given I am logged in
When I click the logout button (in header/user menu)
Then:
- I am logged out of the application
- My session is ended
- I am redirected to the login page
- I cannot access protected routes without logging in again

And when I log out:
- MSAL clears the token from memory
- All user session data is cleared
- No sensitive data remains in browser storage

**Prerequisites:** Story 2.3

**Technical Notes:**
- Use MSAL logoutRedirect or logoutPopup method
- Clear any application state on logout
- Redirect to login page after logout
- Ensure no data leakage between sessions

**Affected Components:**
- `components/layout/Header.tsx` (logout button)
- `app/api/auth/logout/route.ts` (optional API endpoint)
- `lib/auth/msal.ts` (logout method)

**FR Coverage:** FR3

---

### Epic 3: Medication Registration & Management

#### Story 3.1: Medication Registration Form with Schedule Input

**User Story:**
As a user,
I want to register a new medication with a schedule using a simple form,
So that I can track when I need to take my medications.

**Acceptance Criteria:**
Given I am on the Medications page
When I click "Add Medication"
Then:
- A form page loads with "Add Medication" header
- Medication Name field is displayed (text input, required)
- Schedule section is displayed with user-friendly interface
- Help text explains: "Convert 'before breakfast' to concrete time like 7:00 AM"
- Save button is displayed
- Cancel button is displayed

And when I enter medication information:
- Medication Name field accepts text input (max 255 characters)
- Schedule interface allows selecting:
  - Single time option (e.g., "9:00 AM")
  - Multiple times option (e.g., "9:00 AM and 9:00 PM")
- Time pickers display times in my selected timezone (or UTC if not set)
- I can add multiple time slots for the same medication
- I can remove time slots I've added

And when I click Save:
- Form validates that medication name is provided
- Form validates that at least one schedule time is provided
- If valid, medication is saved and I'm redirected to Medications list
- Success toast notification appears: "Medication added successfully"
- If invalid, inline error messages show specific issues

**Prerequisites:** Story 2.3 (authenticated routes), Story 6.2 (timezone preference)

**Technical Notes:**
- Use shadcn/ui Form components (Input, Button, Select)
- Create custom time picker component (or use shadcn/ui time picker)
- Form validation using Zod schemas
- API endpoint: POST `/api/medications`
- Convert user-friendly schedule to CRON expression on backend
- Store CRON expression in database (UTC-based)
- All times converted from user timezone to UTC before storage

**Affected Components:**
- `app/medications/new/page.tsx`
- `components/medication/MedicationForm.tsx`
- `lib/validations/schemas.ts` (Zod schema for medication)
- `app/api/medications/route.ts` (POST endpoint)

**FR Coverage:** FR5, FR6, FR8, FR9, FR10, FR35

---

#### Story 3.2: CRON Expression Conversion and Validation

**User Story:**
As a system,
I want to convert user-friendly schedule inputs to CRON expressions and validate them,
So that medication schedules are stored consistently and accurately.

**Acceptance Criteria:**
Given a user submits a medication schedule
When the schedule contains one or more times (e.g., ["09:00", "21:00"])
Then:
- Times are converted from user's timezone to UTC
- Each time is converted to CRON expression format (e.g., "0 9 * * *" for 9:00 AM daily)
- Multiple times are combined into single CRON expression or stored as separate occurrences
- CRON expression is validated using cron-parser library
- If valid, medication is saved with CRON expression
- If invalid, error is returned: "Invalid schedule format"

And when validating schedules:
- System accepts only schedules mappable to CRON expressions
- Fixed time-of-day schedules are supported (e.g., 9:00 AM daily)
- Multiple occurrences per day are supported (e.g., 9:00 AM and 9:00 PM)
- Daily recurring patterns are supported
- Invalid schedules are rejected with clear error messages

**Prerequisites:** Story 3.1

**Technical Notes:**
- Use cron-parser library for CRON validation
- Create utility function: `lib/cron/parser.ts` for conversion
- Convert user time inputs (user timezone) → UTC → CRON expression
- For multiple times per day, consider storing as separate CRON expressions or using complex CRON
- Validate CRON syntax before saving to database

**Affected Components:**
- `lib/cron/parser.ts` (CRON conversion utilities)
- `app/api/medications/route.ts` (validation logic)
- `lib/validations/schemas.ts` (schedule validation)

**FR Coverage:** FR7, FR11, FR12, FR35, FR44

---

#### Story 3.3: Medication List View

**User Story:**
As a user,
I want to view a list of all my registered medications,
So that I can see what medications I'm tracking and manage them.

**Acceptance Criteria:**
Given I am on the Medications page
When the page loads
Then:
- I see a list of all my registered medications
- Each medication shows:
  - Medication name
  - Schedule information (displayed in user-friendly format, not CRON)
  - Edit button
  - Delete button
- "Add Medication" button is displayed
- If I have no medications, I see empty state: "No medications registered yet"

And when I view the medication list:
- Medications are sorted by creation date (newest first) or alphabetically
- Each medication is displayed in a card or list item
- Schedule times are displayed in my selected timezone
- I can click on a medication to edit it (or use Edit button)

**Prerequisites:** Story 3.1

**Technical Notes:**
- API endpoint: GET `/api/medications`
- Filter medications by authenticated user_id
- Convert CRON expressions to user-friendly display format
- Use shadcn/ui Card component for medication items
- Use React Query for data fetching and caching

**Affected Components:**
- `app/medications/page.tsx`
- `components/medication/MedicationList.tsx`
- `components/medication/MedicationCard.tsx`
- `app/api/medications/route.ts` (GET endpoint)
- `hooks/useMedications.ts`

**FR Coverage:** FR15

---

#### Story 3.4: Edit Medication Functionality

**User Story:**
As a user,
I want to edit an existing medication's name or schedule,
So that I can update my medication information when prescriptions change.

**Acceptance Criteria:**
Given I am viewing my medication list
When I click Edit on a medication
Then:
- Edit form page loads with medication details pre-filled
- Medication name field shows current name
- Schedule section shows current schedule times (in my timezone)
- I can modify the medication name
- I can modify the schedule (add/remove times)
- Save and Cancel buttons are displayed

And when I save changes:
- Form validates input (same as registration form)
- If valid, medication is updated in database
- I am redirected to Medications list
- Success toast appears: "Medication updated successfully"
- Updated medication appears in list with new information

And when I cancel:
- I am redirected back to Medications list
- No changes are saved

**Prerequisites:** Story 3.3

**Technical Notes:**
- API endpoint: PUT `/api/medications/:id`
- Validate that medication belongs to authenticated user
- Convert updated schedule to CRON expression
- Update medication record in database
- Handle case where medication doesn't exist or doesn't belong to user (404)

**Affected Components:**
- `app/medications/[id]/edit/page.tsx`
- `components/medication/MedicationForm.tsx` (reusable for edit)
- `app/api/medications/[id]/route.ts` (PUT endpoint)

**FR Coverage:** FR13

---

#### Story 3.5: Delete Medication Functionality

**User Story:**
As a user,
I want to delete a medication from my account,
So that I can remove medications I'm no longer taking.

**Acceptance Criteria:**
Given I am viewing my medication list
When I click Delete on a medication
Then:
- Confirmation dialog appears: "Are you sure you want to delete [Medication Name]? This cannot be undone."
- Dialog shows Cancel and Delete buttons
- If I click Cancel, dialog closes and no action is taken
- If I click Delete, medication is deleted from database

And when medication is deleted:
- Medication record is removed from database
- All consumption history for this medication is also deleted (CASCADE)
- Success toast appears: "Medication deleted successfully"
- Medication list updates to remove deleted medication
- I am redirected to Medications list if on edit page

**Prerequisites:** Story 3.3

**Technical Notes:**
- API endpoint: DELETE `/api/medications/:id`
- Validate that medication belongs to authenticated user
- Database CASCADE delete handles consumption_history cleanup
- Use shadcn/ui Dialog component for confirmation
- Handle case where medication doesn't exist (404)

**Affected Components:**
- `components/medication/MedicationCard.tsx` (delete button)
- `components/medication/DeleteMedicationDialog.tsx`
- `app/api/medications/[id]/route.ts` (DELETE endpoint)

**FR Coverage:** FR14

---

### Epic 4: Daily Medication Tracking (Primary Value Epic)

#### Story 4.1: Dashboard Page with Time-Grouped Medication Display

**User Story:**
As a user,
I want to see all my medications scheduled for today, grouped by time,
So that I can quickly see what I need to take and when.

**Acceptance Criteria:**
Given I am logged in and on the Dashboard
When the page loads
Then:
- Page header shows "Today's Medications" or "Today"
- Medications are grouped by scheduled time (e.g., "Morning", "09:00 AM", "Afternoon", "21:00 PM")
- Each time group shows as a section with:
  - Time heading (e.g., "09:00 AM")
  - List of medications scheduled for that time
  - Optional "Confirm all" button for batch marking
- Medications are displayed in cards (MyTherapy-inspired design)
- If no medications are scheduled for today, I see empty state: "No medications scheduled for today"

And when viewing medications:
- Medication name is displayed prominently
- Scheduled time is displayed in my selected timezone
- Each medication has a large, circular checkbox on the right
- Visual state shows consumed (green checkmark, greyed text) vs pending (red text, empty checkbox)

**Prerequisites:** Story 2.3 (authenticated routes), Story 3.1 (medications exist), Story 6.2 (timezone)

**Technical Notes:**
- API endpoint: GET `/api/consumption/today`
- Calculate today's medication occurrences from CRON expressions
- Group medications by scheduled time
- Use shadcn/ui Card components
- Create custom TimeGroup component for time sections
- Use React Query for data fetching with automatic refetch

**Affected Components:**
- `app/page.tsx` or `app/dashboard/page.tsx`
- `components/medication/TimeGroup.tsx`
- `components/medication/MedicationCard.tsx`
- `app/api/consumption/today/route.ts`
- `lib/cron/calculator.ts` (calculate today's occurrences)

**FR Coverage:** FR17, FR18, FR21

---

#### Story 4.2: CRON-Based Occurrence Calculation for Today

**User Story:**
As a system,
I want to calculate which medications are scheduled for today based on CRON expressions,
So that users see accurate medication schedules.

**Acceptance Criteria:**
Given today's date and user's medications with CRON expressions
When calculating today's scheduled medications
Then:
- System retrieves all user's medications from database
- For each medication, CRON expression is parsed using cron-parser
- All occurrences for today (00:00:00 - 23:59:59 UTC) are calculated
- Each occurrence includes:
  - Medication ID
  - Scheduled time (UTC)
  - Display time (converted to user's timezone)
- Occurrences are checked against consumption_history to determine consumed status
- Results are returned grouped by scheduled time

And when handling timezone conversion:
- Scheduled times are calculated in UTC
- Display times are converted to user's selected timezone
- DST transitions are handled correctly by date-fns-tz

**Prerequisites:** Story 4.1

**Technical Notes:**
- Use cron-parser library to parse CRON expressions
- Create utility: `lib/cron/calculator.ts` for occurrence calculation
- Calculate occurrences for entire day (start of day to end of day in UTC)
- Filter occurrences to today's date range
- Check consumption_history table for each occurrence
- Use date-fns-tz for timezone conversions

**Affected Components:**
- `lib/cron/calculator.ts` (occurrence calculation)
- `app/api/consumption/today/route.ts` (uses calculator)
- `lib/timezone/converter.ts` (timezone conversion)

**FR Coverage:** FR16, FR18, FR34, FR42, FR43, FR45, FR46

---

#### Story 4.3: Medication Marking (Checkbox Interaction)

**User Story:**
As a user,
I want to mark a medication as consumed by clicking a checkbox,
So that I can quickly track whether I've taken my medications.

**Acceptance Criteria:**
Given I am on the Dashboard viewing today's medications
When I click the checkbox next to a medication
Then:
- Checkbox immediately shows green checkmark (optimistic UI update)
- Medication name changes from red to grey (consumed state)
- Checkmark icon appears on left side of medication card
- No page reload occurs - update is instant
- API call is made in background to save consumption record

And when the API call succeeds:
- Consumption record is saved with:
  - Medication ID
  - Scheduled time (UTC)
  - Consumed at timestamp (UTC, actual time marked)
- UI remains in consumed state
- Success is logged (no visible feedback needed for successful mark)

And when the API call fails:
- Checkbox reverts to unchecked state
- Error toast appears: "Failed to mark medication. Please try again."
- User can retry by clicking checkbox again

**Prerequisites:** Story 4.1

**Technical Notes:**
- Use optimistic UI updates for < 500ms response time (NFR9)
- API endpoint: POST `/api/consumption/:medicationId/consume`
- Request body: `{ scheduledTime: string }` (ISO 8601 UTC timestamp)
- Store both scheduled_time and consumed_at in consumption_history
- Use React Query mutations with optimistic updates
- Handle network errors gracefully

**Affected Components:**
- `components/medication/MedicationCheckbox.tsx`
- `components/medication/MedicationCard.tsx`
- `app/api/consumption/[medicationId]/consume/route.ts`
- `hooks/useConsumption.ts`

**FR Coverage:** FR19, FR23

---

#### Story 4.4: Optimistic UI Updates and Error Handling

**User Story:**
As a user,
I want medication marking to feel instant and handle errors gracefully,
So that the tracking experience is fast and reliable.

**Acceptance Criteria:**
Given I mark a medication as consumed
When the checkbox is clicked
Then:
- UI updates immediately (optimistic update)
- API call happens in background
- If API succeeds, UI stays in consumed state
- If API fails, UI reverts to unchecked state
- Error message appears with retry option

And when handling errors:
- Network errors show: "Network error. Please check your connection and try again."
- Server errors show: "Unable to save. Please try again."
- Validation errors show specific message
- User can retry by clicking checkbox again
- Error state doesn't persist after successful retry

And when handling loading states:
- No loading spinner needed (optimistic update)
- If needed, subtle loading indicator can appear during retry
- UI remains responsive during API calls

**Prerequisites:** Story 4.3

**Technical Notes:**
- Use React Query's optimistic updates feature
- Implement error boundaries for API errors
- Use shadcn/ui Toast component for error messages
- Retry logic with exponential backoff (optional)
- Ensure UI never gets stuck in incorrect state

**Affected Components:**
- `hooks/useConsumption.ts` (React Query mutation)
- `components/ui/toast.tsx` (error notifications)
- Error handling utilities

**FR Coverage:** FR19 (performance requirement)

---

#### Story 4.5: Retroactive Marking for Same Day

**User Story:**
As a user,
I want to mark medications I forgot to mark earlier in the day,
So that I can correct my tracking record.

**Acceptance Criteria:**
Given I am on the Dashboard
When I realize I forgot to mark a morning medication
Then:
- I can scroll to the earlier time group (e.g., "08:00 AM")
- I can click the checkbox for that medication
- Medication is marked as consumed
- System records the actual time I marked it (consumed_at), not the scheduled time
- Medication appears in correct time position (not moved to current time)

And when marking retroactively:
- I can mark any medication scheduled for today, regardless of current time
- Marking is allowed until end of day (23:59:59 in user's timezone)
- After end of day, retroactive marking is no longer allowed (future story: allow past-day editing)

**Prerequisites:** Story 4.3

**Technical Notes:**
- Same API endpoint as regular marking: POST `/api/consumption/:medicationId/consume`
- Validate that scheduled_time is for today (UTC)
- Store actual consumed_at timestamp (when user marked it)
- UI shows medication in correct time group position
- No special handling needed - same flow as regular marking

**Affected Components:**
- `app/api/consumption/[medicationId]/consume/route.ts` (validation logic)
- Same components as Story 4.3

**FR Coverage:** FR22

---

#### Story 4.6: Visual Status Indicators (Consumed vs Pending)

**User Story:**
As a user,
I want clear visual indicators showing which medications I've taken,
So that I can instantly see my medication status.

**Acceptance Criteria:**
Given I am on the Dashboard
When viewing medications
Then:
- Pending medications show:
  - Red text for medication name
  - Empty circular checkbox (white/light grey background, dark border)
  - No checkmark icon
- Consumed medications show:
  - Grey text for medication name (muted appearance)
  - Green checkmark in circular checkbox (green background, white checkmark)
  - Checkmark icon on left side of card
- Visual distinction is immediately obvious
- Color contrast meets WCAG 2.1 AA standards (4.5:1 ratio)

And when medications are grouped by time:
- Time group header is visible and clear
- All medications in group are visually consistent
- Status indicators are prominent and easy to see

**Prerequisites:** Story 4.1

**Technical Notes:**
- Use shadcn/ui Checkbox component (customized for large size)
- Implement custom styling for consumed vs pending states
- Use Tailwind CSS for color classes
- Ensure accessibility: ARIA labels, keyboard navigation
- Test color contrast with accessibility tools

**Affected Components:**
- `components/medication/MedicationCard.tsx` (status styling)
- `components/medication/MedicationCheckbox.tsx` (custom checkbox)
- Tailwind CSS classes for states

**FR Coverage:** FR21, NFR18

---

### Epic 5: Adherence Reporting

#### Story 5.1: Adherence Report Page with Grid Layout

**User Story:**
As a user,
I want to view an adherence report showing my medication consumption history,
So that I can identify patterns of missed medications.

**Acceptance Criteria:**
Given I am on the Reports page
When the page loads
Then:
- Page header shows "Adherence Report"
- Grid layout displays with:
  - Rows: All my registered medications (medication names)
  - Columns: Time periods (default: last 7 days)
  - Each cell shows medication status for that occurrence
- Time window selector is displayed (dropdown: 7, 14, 30 days)
- Grid is responsive (scrollable on mobile, full view on desktop)

And when viewing the grid:
- Medication names are displayed in first column
- Date columns show dates (e.g., "Nov 19", "Nov 20")
- Each cell contains visual indicator (✓, ✗, or ○)
- Grid is easy to scan and identify patterns

**Prerequisites:** Story 2.3 (authenticated routes), Story 3.1 (medications exist)

**Technical Notes:**
- API endpoint: GET `/api/reports/adherence?days=7`
- Use shadcn/ui Table component or custom grid
- Responsive design: horizontal scroll on mobile, full table on desktop
- Default time window: 7 days
- Use React Query for data fetching

**Affected Components:**
- `app/reports/page.tsx`
- `components/reports/AdherenceGrid.tsx`
- `app/api/reports/adherence/route.ts`
- `hooks/useAdherenceReport.ts`

**FR Coverage:** FR24, FR25

---

#### Story 5.2: Historical Occurrence Calculation

**User Story:**
As a system,
I want to calculate historical medication occurrences for the adherence report,
So that users can see their consumption patterns over time.

**Acceptance Criteria:**
Given a time window (e.g., last 7 days) and user's medications
When calculating adherence data
Then:
- System retrieves all user's medications
- For each medication, CRON expression is parsed
- All occurrences for the time window are calculated (start date to end date in UTC)
- Each occurrence is checked against consumption_history:
  - If consumed_at exists → status: "consumed" (✓)
  - If scheduled but no consumed_at → status: "missed" (✗)
  - If scheduled_time is in future → status: "future" (○)
- Results are organized by medication and date
- Data is returned in format suitable for grid display

And when handling timezone:
- All calculations are done in UTC
- Display dates are converted to user's timezone for column headers
- Scheduled times are converted for display

**Prerequisites:** Story 5.1

**Technical Notes:**
- Use same CRON calculator as Story 4.2
- Calculate occurrences for entire date range
- Query consumption_history efficiently (use indexes)
- Group results by medication and date
- Use date-fns for date range calculations

**Affected Components:**
- `lib/cron/calculator.ts` (extend for date ranges)
- `app/api/reports/adherence/route.ts` (calculation logic)
- Database queries with date range filters

**FR Coverage:** FR26, FR42, FR43, FR45

---

#### Story 5.3: Configurable Time Window Selector

**User Story:**
As a user,
I want to select different time windows for my adherence report,
So that I can view different periods of my medication history.

**Acceptance Criteria:**
Given I am on the Reports page
When I view the time window selector
Then:
- Dropdown shows options: "Last 7 Days", "Last 14 Days", "Last 30 Days"
- Current selection is highlighted
- Default selection is "Last 7 Days"

And when I select a different time window:
- Grid updates to show selected time period
- Column headers update to show correct dates
- Data is recalculated for new time window
- Loading state appears during recalculation (if needed)
- Grid displays new data

**Prerequisites:** Story 5.1

**Technical Notes:**
- Use shadcn/ui Select component
- Update API query parameter: `?days=7|14|30`
- Use React Query to refetch data on selection change
- Cache data for each time window to avoid unnecessary recalculations

**Affected Components:**
- `components/reports/TimeWindowSelector.tsx`
- `app/reports/page.tsx` (handles selection)
- `app/api/reports/adherence/route.ts` (query parameter)

**FR Coverage:** FR28

---

#### Story 5.4: Visual Indicators (Consumed/Missed/Future)

**User Story:**
As a user,
I want clear visual indicators in the adherence grid showing medication status,
So that I can quickly identify which medications I've taken, missed, or are upcoming.

**Acceptance Criteria:**
Given I am viewing the adherence report grid
When I look at each cell
Then:
- Consumed medications show:
  - Green checkmark (✓) icon
  - Green background or green border
  - Tooltip on hover: "Consumed on [date]"
- Missed medications show:
  - Red X (✗) icon
  - Red background or red border
  - Tooltip on hover: "Missed on [date]"
- Future medications show:
  - Grey circle (○) icon
  - Grey background or grey border
  - Tooltip on hover: "Scheduled for [date]"

And when viewing the grid:
- Visual indicators are consistent across all cells
- Icons are large enough to see clearly
- Color contrast meets WCAG 2.1 AA standards
- Patterns of missed medications are easy to identify

**Prerequisites:** Story 5.1

**Technical Notes:**
- Use shadcn/ui Badge or custom icon components
- Implement tooltips using shadcn/ui Tooltip component
- Use consistent color scheme (green=success, red=error, grey=neutral)
- Ensure accessibility: ARIA labels, keyboard navigation

**Affected Components:**
- `components/reports/AdherenceCell.tsx`
- `components/reports/AdherenceGrid.tsx`
- Icon components or Badge components

**FR Coverage:** FR27, FR29, NFR18

---

### Epic 6: User Preferences & Timezone Configuration

#### Story 6.1: Settings Page with Timezone Selector

**User Story:**
As a user,
I want to set my timezone preference in the settings,
So that medication times are displayed correctly for my location.

**Acceptance Criteria:**
Given I am on the Settings page
When the page loads
Then:
- Page header shows "Settings"
- Timezone section is displayed with:
  - Label: "Timezone"
  - Current timezone displayed (or "Not set" if first time)
  - Timezone selector (dropdown or autocomplete)
  - Save button
- Help text explains: "Select your timezone to ensure medication times are displayed correctly"

And when I select a timezone:
- Dropdown shows list of IANA timezones (e.g., "America/New_York", "Europe/London")
- I can search for timezones by typing
- Preview shows: "Times will be displayed in: [Timezone Name]"
- Current local time is shown as helper text

**Prerequisites:** Story 2.3 (authenticated routes)

**Technical Notes:**
- Use shadcn/ui Select or Combobox component
- Populate with IANA timezone list
- API endpoint: GET `/api/user/preferences` (get current timezone)
- API endpoint: PUT `/api/user/preferences` (update timezone)
- Store timezone in users table (timezone column)

**Affected Components:**
- `app/settings/page.tsx`
- `components/settings/TimezoneSelector.tsx`
- `app/api/user/preferences/route.ts`
- `hooks/useTimezone.ts`

**FR Coverage:** FR30, FR32, FR33

---

#### Story 6.2: Timezone Preference Storage and Retrieval

**User Story:**
As a system,
I want to store and retrieve user timezone preferences,
So that medication times can be displayed correctly.

**Acceptance Criteria:**
Given a user sets their timezone preference
When they save the preference
Then:
- Timezone is validated as valid IANA timezone identifier
- Timezone is stored in users table (timezone column)
- Success message appears: "Timezone updated successfully"
- Preference is associated with user account

And when retrieving timezone:
- System retrieves timezone from user record
- Default timezone is "UTC" if not set
- Timezone is returned in API responses for user preferences

And when timezone is updated:
- All displayed medication times immediately update to new timezone
- Existing schedules remain correct (converted automatically)
- No data is lost or corrupted

**Prerequisites:** Story 6.1

**Technical Notes:**
- Validate IANA timezone using date-fns-tz or similar library
- Update users table: `UPDATE users SET timezone = ? WHERE id = ?`
- Return timezone in user preferences API
- Use timezone in all time display conversions

**Affected Components:**
- `app/api/user/preferences/route.ts` (GET and PUT)
- `lib/validations/schemas.ts` (timezone validation)
- Database: users table timezone column

**FR Coverage:** FR31, FR32

---

#### Story 6.3: Timezone Conversion Utilities (UTC ↔ User Timezone)

**User Story:**
As a system,
I want to convert times between UTC and user timezone,
So that medication times are displayed and stored correctly.

**Acceptance Criteria:**
Given a time in UTC and user's timezone preference
When converting for display
Then:
- UTC time is converted to user's timezone using date-fns-tz
- Display format shows time in user's timezone (e.g., "09:00 AM")
- Date is also converted if timezone difference crosses midnight
- Conversion handles DST transitions correctly

And when converting for storage:
- User input time (in user's timezone) is converted to UTC
- UTC time is stored in database
- Conversion is accurate regardless of DST

And when timezone utilities are used:
- All medication times displayed to users use conversion
- All user time inputs are converted to UTC before storage
- System calculations remain in UTC internally

**Prerequisites:** Story 6.2

**Technical Notes:**
- Create utility: `lib/timezone/converter.ts`
- Use date-fns-tz functions: `utcToZonedTime`, `zonedTimeToUtc`
- Handle edge cases: DST transitions, timezone changes
- Use user's timezone preference from database
- Test with various timezones and DST scenarios

**Affected Components:**
- `lib/timezone/converter.ts` (conversion utilities)
- All components displaying times (use converter)
- All API endpoints receiving time inputs (use converter)

**FR Coverage:** FR34, FR35, FR36, FR44, FR45, FR46

---

#### Story 6.4: Timezone-Aware Time Display Across Application

**User Story:**
As a user,
I want all medication times displayed in my selected timezone throughout the application,
So that times are consistent and accurate.

**Acceptance Criteria:**
Given I have set my timezone preference
When I view medication times anywhere in the application
Then:
- Dashboard shows scheduled times in my timezone
- Medication registration form shows time picker in my timezone
- Medication list shows schedule times in my timezone
- Adherence report shows dates/times in my timezone
- All times are consistently displayed in my selected timezone

And when my timezone changes:
- All displayed times update immediately
- No manual refresh needed
- Times remain accurate

**Prerequisites:** Story 6.3

**Technical Notes:**
- Use timezone converter utility throughout application
- Create React hook: `useTimezone()` for accessing user timezone
- Use converter in all time display components
- Ensure consistent timezone usage across all pages

**Affected Components:**
- `hooks/useTimezone.ts` (timezone hook)
- All components displaying times:
  - `components/medication/MedicationCard.tsx`
  - `components/medication/TimeGroup.tsx`
  - `app/medications/new/page.tsx`
  - `app/reports/page.tsx`
- Timezone conversion applied consistently

**FR Coverage:** FR34, FR45

---

## FR Coverage Matrix

### Epic 1: Foundation & Project Setup
- Infrastructure for all FRs

### Epic 2: User Authentication
- FR1: Story 2.1
- FR2: Stories 2.1, 2.2, 2.3
- FR3: Story 2.4
- FR4: Story 2.3

### Epic 3: Medication Registration & Management
- FR5: Story 3.1
- FR6: Story 3.1
- FR7: Story 3.2
- FR8: Story 3.1
- FR9: Story 3.1
- FR10: Story 3.1
- FR11: Story 3.2
- FR12: Story 3.2
- FR13: Story 3.4
- FR14: Story 3.5
- FR15: Story 3.3

### Epic 4: Daily Medication Tracking
- FR16: Story 4.2
- FR17: Story 4.1
- FR18: Stories 4.1, 4.2
- FR19: Stories 4.3, 4.4
- FR20: Story 4.3 (unmark functionality)
- FR21: Story 4.6
- FR22: Story 4.5
- FR23: Story 4.3

### Epic 5: Adherence Reporting
- FR24: Story 5.1
- FR25: Story 5.1
- FR26: Story 5.2
- FR27: Story 5.4
- FR28: Story 5.3
- FR29: Story 5.4

### Epic 6: User Preferences & Timezone Configuration
- FR30: Story 6.1
- FR31: Story 6.2
- FR32: Story 6.2
- FR33: Story 6.1
- FR34: Stories 6.3, 6.4
- FR35: Story 6.3
- FR36: Stories 6.3, 6.4

### Cross-Cutting Concerns (Implemented Across All Epics)
- **Data Isolation & Security (FR37-FR41):** Enforced in all API routes via authentication middleware and user_id filtering
- **Timezone Handling (FR42-FR46):** Implemented in Stories 6.2, 6.3, 6.4, and used throughout all time-related features

---

## Summary

**Total Epics:** 6
**Total Stories:** 24

**Epic Sequencing:**
1. Foundation → 2. Authentication → 3. Medication Registration → 4. Daily Tracking → 5. Reporting → 6. Preferences

**FR Coverage:** All 46 functional requirements are covered by at least one story.

**Context Incorporated:**
- ✅ PRD requirements (all 46 FRs mapped)
- ✅ UX interaction patterns (MyTherapy-inspired design, time-grouped layout, checkbox interactions)
- ✅ Architecture technical decisions (Next.js API routes, Prisma, MSAL, CRON parsing, timezone conversion)

**Status:** COMPLETE - Ready for Phase 4 Implementation!

---

_This epic breakdown provides implementable stories with detailed acceptance criteria, incorporating all context from PRD, UX Design, and Architecture documents._

