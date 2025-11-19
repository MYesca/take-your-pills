# Product Brief: TakeYourPills

**Date:** 2025-11-19
**Author:** Yesca
**Context:** Greenfield Web Application

---

## Executive Summary

TakeYourPills is a web application designed to help users track their daily medication consumption with flexible scheduling capabilities. The core problem being solved is the common issue of forgetting whether medications have been taken, which can lead to missed doses or accidental double-dosing with serious health consequences. The solution provides a simple, user-friendly interface for registering medicines with complex recurring schedules (using CRON-like expressions behind a friendly UI), marking medications as consumed in real-time, and tracking missed occurrences through a clear dashboard and reporting interface. The application supports multiple users through OpenID Connect authentication with Microsoft Entra External ID, with each user managing their own medications independently.

---

## Core Vision

### Problem Statement

Users frequently forget whether they took their medications, creating uncertainty about whether they should take another dose. This is particularly problematic with complex medication schedules that may include:

- Multiple medications throughout the day
- Medications with specific times (e.g., 9 AM, 9 PM)
- Medications that were originally prescribed with relative times (e.g., "30 minutes before breakfast", "after lunch") but need to be converted to concrete times by the user
- Multiple doses of the same medication at different times

**Example Scenario**: A typical user might take:
- Puran T4 in the morning (user would register this as a concrete time like 7:00 AM, accommodating the "30 minutes before breakfast" requirement)
- Aradois and Hidroclorotiazida at 9 AM
- Plenance after lunch (user would register this as a concrete time like 2:00 PM)
- Aradois again at 9 PM

Without a reliable tracking system, users face the risk of either missed medication occurrences (reducing treatment effectiveness) or accidental double-dosing (potentially causing adverse reactions), both of which can have serious health consequences.

### Proposed Solution

A web application with a simple, intuitive interface that enables users to:

1. **Register medications** with flexible recurring schedules:
   - User-friendly interface for defining when medications must be taken
   - Accepts only schedules that can be mapped to CRON expressions
   - Supports scheduling patterns: fixed times (e.g., 7:00 AM, 9:00 PM), multiple occurrences per day, daily recurring patterns
   - Users must provide concrete times (e.g., if a medication is prescribed as "30 minutes before breakfast", the user stipulates the concrete time such as 7:00 AM)
   - Internally stores schedules as CRON expressions for maximum flexibility
   - Users interact with a friendly form-based interface, not CRON syntax

2. **Track daily consumption**:
   - Main dashboard showing all medications scheduled for the current day
   - Simple checkboxes to mark medications as consumed
   - Visual indication of which medications have been taken and which are pending

3. **Monitor adherence**:
   - Reporting page with a grid view showing medications and their consumption history
   - Display last X occurrences (configurable) with clear consumed/missed indicators
   - Helps users identify patterns of missed medications

4. **Multi-user support**:
   - User authentication via OpenID Connect with Microsoft Entra External ID
   - Each user manages their own medications independently
   - No caregiver/multi-user management features in MVP (each user is responsible for their own medications)

**Optional future feature**: Reminder notifications when it's time to consume medications (acknowledged as secondary feature, not the main objective for MVP).

---

## Target Users

### Primary Users

The application is designed for individuals who need to manage daily medications with potentially complex schedules. Key characteristics:

- **Primary persona**: Adults managing their own medication regimens
- **Schedule complexity**: Users with multiple medications throughout the day, some with specific timing requirements
- **Tech comfort**: Users comfortable with web applications (basic computer/smartphone literacy)
- **Independence**: Users who manage their own medications (not relying on caregivers in the MVP scope)

**Example user**: An individual taking 5-6 medications throughout the day with varying schedules. While prescriptions may reference relative times (e.g., "before breakfast", "after lunch"), the user converts these to concrete times (e.g., 7:00 AM, 2:00 PM) during registration. They need a simple way to track whether each dose has been taken.

### User Journey

**Typical daily flow**:
1. Morning: User wakes up and opens the web app to check today's medications
2. 7:00 AM: User sees "Puran T4 - 7:00 AM" (registered as concrete time to accommodate "30 minutes before breakfast" requirement) and marks it as consumed after taking it
3. 9:00 AM: User checks app, marks Aradois and Hidroclorotiazida as consumed
4. 2:00 PM: User marks Plenance as consumed (registered as concrete time to accommodate "after lunch" requirement)
5. 9:00 PM: User marks evening Aradois as consumed
6. Throughout the day: User can check the main dashboard to see what's been taken and what's pending
7. Weekly/monthly review: User accesses the reporting page to review adherence patterns

**Key interactions**:
- Quick checkbox marking from the main dashboard (primary use case)
- Medication registration/scheduling (one-time setup or when prescriptions change)
- Periodic review of adherence reports to identify missed doses

---

## MVP Scope

### Core Features

1. **Medication Registration**
   - User-friendly form to register medication name
   - Scheduling interface that accepts only schedules mappable to CRON expressions:
     - Fixed times (e.g., 9:00 AM, 9:00 PM)
     - Multiple occurrences per day (e.g., 9:00 AM and 9:00 PM)
     - Daily recurrence patterns
   - **Edge case handling**: Users must convert relative/contextual prescriptions (e.g., "30 minutes before breakfast", "after lunch") to concrete times during registration (e.g., 7:00 AM, 2:00 PM)
   - Internally converts user-friendly input to CRON expressions for storage
   - Users never see or interact with CRON syntax directly
   - Validation ensures all entered schedules can be mapped to valid CRON expressions

2. **Main Dashboard (Today's Medications)**
   - Lists all medications scheduled for the current day
   - Shows scheduled time for each medication
   - Checkbox interface for marking medications as consumed
   - Visual indicators for consumed vs. pending medications
   - Ability to mark medications as consumed retroactively (for same day)

3. **Adherence Reporting**
   - Grid view showing:
     - List of all registered medications (rows)
     - Last X occurrences as columns (configurable, e.g., last 7 or 30 days)
   - Clear visual indicators for each occurrence:
     - ✓ Consumed (marked by user)
     - ✗ Missed (scheduled but not marked)
     - ○ Not yet scheduled (future dates)
   - Helps users identify patterns of missed medications

4. **User Authentication**
   - OpenID Connect integration with Microsoft Entra External ID
   - User signup/signin functionality
   - Secure session management
   - Each user's data is isolated and private

5. **User Preferences**
   - Timezone setting: Users explicitly set their timezone preference in app settings
   - Timezone preference is stored per user account
   - Frontend uses this preference for all timezone conversions (inputs/outputs)
   - Users can update their timezone preference at any time

6. **User Data Management**
   - Users can only view and manage their own medications
   - No cross-user access or caregiver features in MVP

### Interface Design

**Page Structure**:
- **Main Page (Dashboard)**: Today's medications list with checkboxes - primary interaction point
- **Medication Registration Page**: Form-based interface for adding/editing medications and schedules
- **Reporting Page**: Grid-based adherence report showing medication history
- **Settings Page**: User preferences including timezone selection

**Design Principles**:
- Simple, intuitive interface (users shouldn't need training)
- Fast, responsive interaction (checkbox marking should be quick)
- Clear visual feedback (knowing what's done vs. pending)

### Out of Scope for MVP

- **Reminder notifications**: Acknowledged as a future enhancement but not the primary objective
- **Caregiver/multi-user management**: No features for one user managing another's medications
- **Offline capability**: Deferred to backlog, not required for MVP
- **Advanced medication management**: 
  - Refills tracking
  - Pharmacy integration
  - Medication interaction warnings
  - Prescription scanning
- **Mobile app**: Web application only (responsive design for mobile browsers is acceptable)

## Technical Preferences

### Platform
- **Web application**: Primary platform, accessible via web browsers
- **Responsive design**: Should work well on desktop and mobile browsers (but native mobile app is out of scope for MVP)

### Authentication
- **OpenID Connect**: Standard for user authentication
- **Identity Provider**: Microsoft Entra External ID (Azure AD B2C)
- **User management**: Handled by identity provider (no custom user management needed in application)

### Scheduling System
- **Internal storage**: CRON expressions for maximum flexibility in scheduling
- **User interface**: Friendly form-based interface that hides CRON complexity
- **Scheduling limitations**: Only accepts schedules that can be mapped to CRON expressions
  - Fixed time-of-day schedules (e.g., 7:00 AM, 9:00 PM)
  - Multiple occurrences per day (e.g., 9:00 AM and 9:00 PM)
  - Daily recurring patterns
  - Users must provide concrete times for all medications (relative/contextual prescriptions like "before breakfast" must be converted to concrete times by the user during registration)

### Timezone Handling
- **System timezone**: All dates and times stored and processed in UTC timezone internally
- **User timezone preference**: Users explicitly define their timezone as a user preference in the app settings
  - Timezone is not inferred from the browser or device
  - Users can set and update their timezone preference at any time
  - Timezone preference is stored per user account
- **User experience**: Frontend converts:
  - User inputs from their selected timezone to UTC for storage
  - System outputs from UTC to user's selected timezone for display
- **Rationale**: Ensures consistent behavior regardless of server location or user travel, addressing timezone issues that arise when websites are hosted in servers across different timezones. Explicit user preference ensures accuracy even when users access the app from different devices or locations.
- **Implementation**: User sets timezone preference in app settings; frontend uses this preference for all timezone conversions

### Data Storage
- User-specific medication data
- User preferences (including timezone preference)
- Scheduling information (CRON expressions) - all times in UTC
- Consumption history (tracking when medications were marked as consumed) - timestamps in UTC

### Offline Capability
- **MVP**: Not required (online-only application)
- **Future**: Offline capability is in backlog for future consideration

---

## Risks and Assumptions

### Key Assumptions
1. Users have reliable internet access (online-only MVP)
2. Users are comfortable with basic web application usage
3. Users have Microsoft Entra External ID accounts or are willing to create them
4. Users remember to check the application and mark medications (reminders are future feature)
5. Scheduling complexity can be adequately represented with CRON expressions and simplified through UI
6. Users can convert relative/contextual medication prescriptions (e.g., "before breakfast", "after lunch") to concrete times for registration
7. Users will set their timezone preference explicitly in the app settings (timezone is not inferred from browser/device)

### Potential Risks
1. **User adoption**: If users forget to check the app, it won't solve the core problem
   - *Mitigation*: Keep interface extremely simple; reminder feature planned for future
2. **Scheduling complexity**: Some medication schedules might not map well to CRON
   - *Mitigation*: System accepts only CRON-mappable schedules; users convert relative prescriptions (e.g., "before breakfast") to concrete times during registration
3. **Timezone handling**: Users traveling or in different timezones, or servers in different timezones
   - *Mitigation*: **Addressed in MVP** - System uses UTC internally, frontend handles all timezone conversions transparently for users
4. **Data privacy**: Medication data is sensitive health information
   - *Mitigation*: Secure authentication, data isolation per user, compliance considerations

---

_This Product Brief captures the vision and requirements for TakeYourPills._

_It was created through collaborative discovery and reflects the unique needs of this Greenfield Web Application project._

_Next: Use the PRD workflow to create detailed product requirements from this brief._

