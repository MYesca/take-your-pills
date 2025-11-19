# TakeYourPills - Product Requirements Document

**Author:** Yesca
**Date:** 2025-11-19
**Version:** 1.0

---

## Executive Summary

TakeYourPills is a web application designed to help users track their daily medication consumption with flexible scheduling capabilities. The solution addresses the critical problem of medication non-adherence by providing users with a simple, reliable way to track whether they've taken their scheduled medications, reducing the risk of missed doses or accidental double-dosing.

### What Makes This Special

TakeYourPills combines the simplicity of a checkbox-based tracking interface with the power of CRON-based scheduling behind the scenes. Unlike generic reminder apps, it's purpose-built for medication adherence with:

- **Zero-confusion tracking**: Simple checkbox interface eliminates the question "Did I take this?"
- **Flexible scheduling**: CRON-based system handles complex medication schedules while presenting a friendly UI
- **Timezone-aware precision**: Explicit user timezone preferences ensure medication times are accurate regardless of server location or travel
- **Healthcare-grade privacy**: HIPAA-aligned practices and complete data isolation for sensitive medication information
- **Patient safety focus**: Every feature designed to prevent medication errors (missed doses, double-dosing)

The core innovation is hiding scheduling complexity (CRON expressions) behind an intuitive interface, allowing users to track medications with complex schedules as easily as simple daily pills.

---

## Project Classification

**Technical Type:** web_app
**Domain:** healthcare
**Complexity:** medium (simplified healthcare - medication tracking only, not medical device)

### Classification Details

**Project Type: web_app**
- Single Page Application (SPA) accessible via web browsers
- Responsive design for desktop and mobile browsers
- Real-time medication tracking interface
- Browser-based application (no native mobile app in MVP)

**Domain: healthcare (simplified)**
- Healthcare domain with medication tracking focus
- NOT a medical device or diagnostic tool (reduces FDA complexity)
- Handles sensitive health information (medication data)
- Requires HIPAA-compliant data handling practices
- Focus on patient safety (preventing medication errors)

**Complexity Level: medium**
- Simplified from high-complexity healthcare (no FDA approval needed)
- Still requires healthcare-grade data privacy and security
- Patient safety considerations (error prevention)
- Data compliance requirements (HIPAA alignment)

---

## Success Criteria

Success for TakeYourPills means users can reliably track their medication consumption with confidence, preventing both missed doses and accidental double-dosing.

**Primary Success Metrics:**
- Users consistently use the application to track their daily medications
- Users can quickly verify whether they've taken scheduled medications
- Users can identify patterns of missed medications through reporting
- Zero critical medication errors due to tracking failures

**User Experience Success:**
- Users can register medications with complex schedules easily
- Daily medication checking takes less than 30 seconds
- Users can retroactively mark missed medications for the same day
- Reporting helps users identify adherence patterns

**Technical Success:**
- Application is accessible when users need it (high availability)
- User data is securely stored and isolated per user
- Timezone handling works correctly across different user locations
- Scheduling system accurately calculates medication occurrences

---

## Product Scope

### MVP - Minimum Viable Product

**Core Capabilities:**
1. **Medication Registration & Scheduling**
   - Register medication names
   - Define schedules using CRON-mappable patterns (friendly UI, CRON backend)
   - Support fixed times, multiple daily occurrences, daily recurrence
   - Users convert relative prescriptions to concrete times

2. **Daily Medication Tracking**
   - Dashboard showing today's scheduled medications
   - Simple checkbox interface for marking medications as consumed
   - Visual indicators for consumed vs. pending medications
   - Retroactive marking for same day

3. **Adherence Reporting**
   - Grid view: medications (rows) × time periods (columns)
   - Configurable history window (e.g., last 7 or 30 days)
   - Clear visual indicators: ✓ consumed, ✗ missed, ○ future

4. **User Authentication & Data Isolation**
   - OpenID Connect with Microsoft Entra External ID
   - Secure session management
   - Complete data isolation per user (no cross-user access)

5. **User Preferences**
   - Timezone setting (explicit user preference, not browser-inferred)
   - User can update timezone preference anytime
   - All times displayed in user's selected timezone

**Interface Pages:**
- Main Dashboard (today's medications with checkboxes)
- Medication Registration/Editing Page
- Adherence Reporting Page
- Settings Page (timezone and preferences)

### Growth Features (Post-MVP)

- Reminder notifications (push notifications, email, SMS)
- Offline capability for medication tracking
- Medication refill tracking
- Pharmacy integration
- Medication interaction warnings
- Prescription scanning/import
- Caregiver/multi-user management features
- Advanced analytics and insights

### Vision (Future)

- AI-powered medication adherence insights
- Integration with healthcare providers
- Smart scheduling suggestions based on adherence patterns
- Mobile native apps (iOS/Android)
- Wearable device integration
- Integration with electronic health records (EHR)

---

## Domain-Specific Requirements

**Healthcare Data Privacy & Security:**
- All medication data must be encrypted at rest and in transit
- User data must be completely isolated (no cross-user access, even for system administrators)
- HIPAA-aligned privacy practices (while not technically required for non-covered entity, best practices apply)
- Secure authentication via industry-standard OpenID Connect
- Session management with appropriate timeout policies

**Patient Safety Considerations:**
- System must accurately calculate scheduled medication occurrences
- Timezone handling must be precise to prevent medication timing errors
- Users must be able to retroactively mark medications to correct mistakes
- Clear visual indicators must prevent confusion about medication status
- Reporting must help users identify patterns that could indicate medication issues

**Data Retention & Backup:**
- Medication consumption history should be retained for user benefit
- Regular backups to prevent data loss
- User ability to export their data (future consideration)

---

## Web App Specific Requirements

### Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge - last 2 major versions)
- Responsive design for desktop and mobile browsers
- Progressive Web App (PWA) capabilities for future offline support (post-MVP)

### Performance Targets

- Dashboard load time: < 2 seconds on standard broadband connection
- Medication marking interaction: < 500ms response time
- Responsive UI suitable for mobile and desktop viewports

### Accessibility

- WCAG 2.1 Level AA compliance (web accessibility standards)
- Keyboard navigation support
- Screen reader compatibility for medication tracking
- High contrast mode support for medication status indicators

### SEO Strategy

- SEO not critical for MVP (user-specific authenticated application)
- Focus on user experience over search engine optimization
- Consider basic SEO for public pages (login, about) if any

---

## User Experience Principles

### Visual Personality

- **Clean and Medical**: Professional, trustworthy appearance appropriate for healthcare context
- **Minimalist**: Simple interface that doesn't overwhelm users managing complex medication schedules
- **Clear Visual Hierarchy**: Medication status (consumed/pending) must be immediately obvious

### Key Interaction Patterns

1. **Quick Check Pattern**: Primary use case - user opens app, sees today's medications, quickly checks/unchecks boxes
2. **Registration Pattern**: Secondary use case - user sets up new medication with schedule (one-time or when prescription changes)
3. **Review Pattern**: Periodic use case - user reviews adherence report to identify missed medication patterns

### Design Principles

- **Simplicity First**: Users shouldn't need training or documentation
- **Speed**: Medication marking must be fast and frictionless
- **Clarity**: Visual feedback must be unambiguous (consumed vs. pending vs. missed)
- **Trust**: Healthcare context requires professional, reliable appearance

---

## Functional Requirements

### User Account & Access

FR1: Users can create accounts using Microsoft Entra External ID (OpenID Connect)
FR2: Users can log in securely and maintain authenticated sessions
FR3: Users can log out and end their sessions
FR4: User sessions time out after a configurable period of inactivity

### Medication Registration & Management

FR5: Users can register new medications by providing a medication name
FR6: Users can define medication schedules using a user-friendly form interface (not CRON syntax)
FR7: System accepts only schedules that can be mapped to CRON expressions
FR8: Users can register fixed time-of-day schedules (e.g., 9:00 AM, 9:00 PM)
FR9: Users can register multiple occurrences per day for the same medication (e.g., 9:00 AM and 9:00 PM)
FR10: Users can register daily recurring patterns
FR11: System validates that all entered schedules are mappable to valid CRON expressions
FR12: System stores schedules internally as CRON expressions
FR13: Users can edit existing medication information (name, schedule)
FR14: Users can delete medications from their account
FR15: Users can view a list of all their registered medications

### Daily Medication Tracking

FR16: System calculates which medications are scheduled for the current day based on stored CRON expressions
FR17: Dashboard displays all medications scheduled for the current day
FR18: Dashboard displays the scheduled time for each medication (in user's timezone)
FR19: Users can mark medications as consumed using a checkbox interface
FR20: Users can unmark medications (mark as not consumed) if marked incorrectly
FR21: Dashboard shows visual indicators distinguishing consumed vs. pending medications
FR22: Users can mark medications as consumed retroactively for the current day (before end of day)
FR23: System records the timestamp (UTC) when a medication is marked as consumed

### Adherence Reporting

FR24: Users can view an adherence report showing medication consumption history
FR25: Report displays a grid view with medications as rows and time periods as columns
FR26: Report shows last X occurrences (configurable, e.g., last 7 or 30 days)
FR27: Report displays clear visual indicators for each occurrence:
  - ✓ for consumed (marked by user)
  - ✗ for missed (scheduled but not marked)
  - ○ for future dates (not yet scheduled)
FR28: Users can configure the time window for the adherence report (e.g., last 7, 14, or 30 days)
FR29: Report helps users identify patterns of missed medications

### User Preferences

FR30: Users can set their timezone preference in app settings
FR31: Users can update their timezone preference at any time
FR32: System stores timezone preference per user account
FR33: System does not infer timezone from browser or device
FR34: All medication times displayed to users are shown in their selected timezone
FR35: All user time inputs are converted from their selected timezone to UTC for storage
FR36: All system outputs are converted from UTC to user's selected timezone for display

### Data Isolation & Security

FR37: Users can only view and manage their own medications
FR38: Users cannot access other users' medication data
FR39: System enforces complete data isolation between users
FR40: All user data is associated with authenticated user accounts
FR41: System prevents unauthorized access to medication data

### Timezone Handling

FR42: System stores all dates and times internally in UTC timezone
FR43: System processes all date/time calculations in UTC
FR44: Frontend converts user time inputs from user's timezone to UTC before storage
FR45: Frontend converts system time outputs from UTC to user's timezone for display
FR46: System correctly handles medication scheduling across different user timezones

---

## Non-Functional Requirements

### Security

NFR1: All authentication must use OpenID Connect standard with Microsoft Entra External ID
NFR2: All user data must be encrypted in transit using TLS 1.2 or higher
NFR3: All medication data must be encrypted at rest
NFR4: User sessions must use secure session management with appropriate timeout policies
NFR5: System must prevent unauthorized access through proper authentication and authorization checks
NFR6: System must follow HIPAA-aligned privacy practices (best practices for healthcare data)
NFR7: System must protect against common web security vulnerabilities (OWASP Top 10)

### Performance

NFR8: Dashboard must load in less than 2 seconds on standard broadband connection (3G equivalent)
NFR9: Medication marking interaction must respond in less than 500ms
NFR10: Adherence report generation must complete in less than 3 seconds for typical user data
NFR11: Application must be responsive on both desktop and mobile browser viewports

### Scalability

NFR12: System must support multiple concurrent users
NFR13: System must handle user growth without degradation (initial target: dozens of users)
NFR14: Database must support efficient querying of user-specific medication data

### Accessibility

NFR15: Application must comply with WCAG 2.1 Level AA accessibility standards
NFR16: Application must support keyboard navigation for all core features
NFR17: Application must be compatible with screen readers for medication tracking
NFR18: Visual indicators must have sufficient color contrast for accessibility

### Data Privacy & Compliance

NFR19: All user medication data must be completely isolated per user account
NFR20: System must not share or expose user medication data to other users or unauthorized parties
NFR21: System must implement appropriate data retention policies
NFR22: System must allow for user data export (future feature consideration)

---

## PRD Summary

This PRD defines TakeYourPills, a web-based medication tracking application designed to help users maintain medication adherence through reliable scheduling and tracking capabilities.

### Key Metrics

- **46 Functional Requirements** covering all user-facing and system capabilities
- **22 Non-Functional Requirements** defining security, performance, scalability, accessibility, and compliance standards
- **MVP Scope**: Core medication registration, tracking, reporting, authentication, and user preferences
- **Domain**: Healthcare (simplified - medication tracking only, not medical device)
- **Technical Type**: Web application (SPA) with responsive design

### Product Value Summary

TakeYourPills delivers reliable medication tracking that prevents both missed doses and accidental double-dosing. The product's value comes from:

1. **Simplicity**: Checkbox-based interface requires no training
2. **Flexibility**: Handles complex medication schedules through CRON-based system with friendly UI
3. **Reliability**: Timezone-aware scheduling and precise tracking reduce medication errors
4. **Privacy**: Healthcare-grade security and complete data isolation protect sensitive medication information
5. **Insight**: Adherence reporting helps users identify patterns and improve medication compliance

### Next Steps

With this PRD complete, the next phase involves:

1. **UX Design** (if UI needed): Design user interface and interaction patterns for the web application
2. **Architecture**: Define technical architecture, technology stack, and system design
3. **Epic Breakdown**: Create implementable epics and user stories from the functional requirements

The PRD serves as the complete capability contract - every feature, requirement, and constraint needed for UX design, architecture, and implementation planning.

---

_This PRD captures the essence of TakeYourPills - a reliable medication tracking solution that helps users maintain medication adherence through simple, effective scheduling and tracking capabilities._

_Created through collaborative discovery between Yesca and AI facilitator._
