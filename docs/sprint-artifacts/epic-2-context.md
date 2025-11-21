# Epic Technical Specification: User Authentication

Date: 2025-11-19
Author: Yesca
Epic ID: 2
Status: Draft

---

## Overview

Epic 2 implements user authentication and session management for the TakeYourPills medication tracking application. This epic enables users to securely access the application using their Microsoft Entra External ID accounts, establishing the authentication foundation required for all subsequent user-facing features. The epic includes four stories covering frontend authentication integration, backend token validation, protected routes with session management, and logout functionality.

This epic is critical as it enforces data isolation and security from the start - all medication data will be associated with authenticated user accounts, and all API routes will require valid authentication tokens. The authentication infrastructure established in Epic 1 (Story 1.3) is leveraged here to create the complete authentication flow, from user login through session management to secure logout.

**Reference Context:**
- PRD Sections: User Account & Access (FR1-FR4), Data Isolation & Security (FR37-FR41)
- Architecture Sections: Authentication Pattern, Security Architecture, API Authentication
- Related Epics: Epic 1 (provides MSAL infrastructure), Epic 3+ (all require authentication)

---

## Objectives and Scope

### In Scope

**Story 2.1: Microsoft Entra External ID Integration (Frontend)**
- Create login page with Microsoft authentication button
- Implement MSAL React authentication flow (loginRedirect or loginPopup)
- Handle OAuth callback from Microsoft Entra External ID
- Extract user information from ID token (email, external ID)
- Create or update user record in database on first login
- Redirect authenticated users to dashboard
- Handle authentication errors gracefully

**Story 2.2: Authentication API Routes and Token Validation**
- Create authentication middleware for API route protection
- Implement token validation using MSAL Node
- Extract user ID from token claims (sub or oid)
- Create user record on first login if doesn't exist
- Implement `/api/auth/me` endpoint for current user info
- Return 401 Unauthorized for invalid/missing tokens
- Enforce user context on all protected API routes

**Story 2.3: Protected Routes and Session Management**
- Implement Next.js middleware for route protection
- Check authentication status on page loads
- Redirect unauthenticated users to login
- Maintain session across page navigations
- Handle token refresh automatically via MSAL
- Configure session timeout (default: token expiration)
- Handle session expiration gracefully

**Story 2.4: Logout Functionality**
- Implement logout button in header/user menu
- Use MSAL logoutRedirect or logoutPopup method
- Clear all user session data
- Redirect to login page after logout
- Ensure no sensitive data remains in browser storage
- Prevent access to protected routes after logout

### Out of Scope

- User registration (handled by Microsoft Entra External ID)
- Password management (handled by Microsoft Entra External ID)
- Multi-factor authentication configuration (handled by Microsoft Entra External ID)
- User profile management (future epic)
- Remember me functionality (MSAL handles this)
- Social login providers beyond Microsoft (not in scope)

---

## System Architecture Alignment

**Authentication Stack Alignment:**
- **Identity Provider:** Microsoft Entra External ID (from PRD requirement, Architecture ADR-006)
- **Frontend Library:** @azure/msal-react (Architecture decision)
- **Backend Library:** @azure/msal-node (Architecture decision)
- **Protocol:** OpenID Connect (PRD NFR1 requirement)
- **Token Storage:** In-memory via MSAL (Architecture pattern, not localStorage)

**Security Architecture Alignment:**
- **Token Flow:** Frontend receives token → Includes in API requests → Backend validates → Extracts user ID → Enforces data isolation
- **Data Isolation:** All database queries filter by user_id (Architecture security pattern)
- **Session Management:** Token refresh handled by MSAL automatically (Architecture pattern)
- **TLS:** All data encrypted in transit (PRD NFR2, handled by deployment platform)

**API Architecture Alignment:**
- **Authentication Middleware:** Reusable middleware for all protected API routes
- **Error Responses:** Standard error format (401 Unauthorized for auth failures)
- **User Context:** Authenticated user ID available in all protected route handlers

**Integration Points:**
- Epic 1 Story 1.3 provides MSAL configuration infrastructure
- Epic 1 Story 1.2 provides User model in database schema
- Epic 3+ will use authentication middleware for all medication-related API routes
- All future epics depend on authenticated user context

**Architectural Constraints:**
- Must use Microsoft Entra External ID (PRD requirement, no alternatives)
- Tokens must be validated on every API request (security requirement)
- User records must be created on first login (database schema requirement)
- All protected routes must check authentication (security requirement)
- Session timeout must be configurable (PRD FR4 requirement)

---

## Detailed Design

### Services and Modules

**Frontend Authentication Module (Story 2.1):**
- **Responsibility:** Handle user login flow via Microsoft Entra External ID
- **Inputs:** User interaction (click login button)
- **Outputs:** Authenticated user session, user record in database
- **Owner:** Frontend developer
- **Components:**
  - Login page component (`app/(auth)/login/page.tsx`)
  - OAuth callback handler (`app/api/auth/callback/route.ts`)
  - MSAL React integration (uses `lib/auth/msal.ts` from Epic 1)

**Backend Authentication Module (Story 2.2):**
- **Responsibility:** Validate tokens and provide authenticated user context
- **Inputs:** API requests with Bearer tokens
- **Outputs:** Authenticated user context, user information
- **Owner:** Backend developer
- **Components:**
  - Authentication middleware (`lib/auth/middleware.ts`)
  - Token validation utilities (uses MSAL Node from Epic 1)
  - User info endpoint (`app/api/auth/me/route.ts`)

**Route Protection Module (Story 2.3):**
- **Responsibility:** Protect routes and manage sessions
- **Inputs:** Page navigation requests
- **Outputs:** Protected pages or login redirect
- **Owner:** Full-stack developer
- **Components:**
  - Next.js middleware (`middleware.ts`)
  - Route guards in page components
  - Session state management (via MSAL)

**Logout Module (Story 2.4):**
- **Responsibility:** Handle user logout and session cleanup
- **Inputs:** User logout action
- **Outputs:** Cleared session, redirect to login
- **Owner:** Frontend developer
- **Components:**
  - Logout button component (`components/layout/Header.tsx`)
  - Logout handler (uses MSAL logout methods)

---

### Data Models and Contracts

**User Model (from Epic 1, used in Epic 2):**

```prisma
model User {
  id          String    @id @default(uuid())
  externalId  String    @unique @map("external_id") @db.VarChar(255)
  email       String    @db.VarChar(255)
  timezone    String    @default("UTC") @db.VarChar(50)
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  
  medications          Medication[]
  consumptionHistory   ConsumptionHistory[]
  
  @@map("users")
  @@index([externalId])
}
```

**Token Claims Structure (from Microsoft Entra External ID):**

```typescript
interface TokenClaims {
  sub: string;           // Subject (user ID from Microsoft)
  oid: string;           // Object ID (alternative user identifier)
  email: string;         // User email address
  name?: string;         // User display name (optional)
  aud: string;           // Audience (client ID)
  iss: string;           // Issuer (Microsoft Entra ID)
  exp: number;           // Expiration timestamp
  iat: number;           // Issued at timestamp
}
```

**User Context Interface (for authenticated requests):**

```typescript
interface AuthenticatedUser {
  id: string;            // Internal user ID (UUID from database)
  externalId: string;    // Microsoft Entra ID user ID
  email: string;         // User email
  timezone: string;       // User timezone preference
}
```

**API Request with Authentication:**

```typescript
// Request header
Authorization: Bearer <access_token>

// Authenticated request context
interface AuthenticatedRequest {
  user: AuthenticatedUser;
  token: string;
}
```

---

### APIs and Interfaces

**POST /api/auth/callback**
- **Purpose:** Handle OAuth callback from Microsoft Entra External ID
- **Method:** POST
- **Request:** OAuth callback with authorization code
- **Response:** Redirect to dashboard or login page
- **Authentication:** Not required (public endpoint)
- **Flow:**
  1. Receive authorization code from Microsoft
  2. Exchange code for tokens (handled by MSAL)
  3. Extract user info from ID token
  4. Create or update user record in database
  5. Redirect to dashboard

**GET /api/auth/me**
- **Purpose:** Get current authenticated user information
- **Method:** GET
- **Request:** None (uses authenticated user context)
- **Response:**
```typescript
{
  data: {
    id: string;
    email: string;
    timezone: string;
  }
}
```
- **Authentication:** Required (Bearer token)
- **Error Responses:**
  - 401 Unauthorized: Invalid or missing token

**Authentication Middleware Interface:**

```typescript
// lib/auth/middleware.ts
export async function authenticateRequest(
  request: NextRequest
): Promise<AuthenticatedUser | null> {
  // 1. Extract Bearer token from Authorization header
  // 2. Validate token using MSAL Node
  // 3. Extract user ID from token claims
  // 4. Look up or create user record in database
  // 5. Return authenticated user context
  // 6. Return null if authentication fails
}
```

**Protected Route Pattern:**

```typescript
// app/api/example/route.ts
import { authenticateRequest } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  const user = await authenticateRequest(request);
  
  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }
  
  // Use user.id for data isolation
  // ... route logic
}
```

**Next.js Middleware Pattern:**

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // 1. Check if route requires authentication
  // 2. Check if user has valid session (via MSAL)
  // 3. Redirect to login if not authenticated
  // 4. Allow request to proceed if authenticated
}
```

---

### Workflows and Sequencing

**Story Execution Sequence:**

```
1. Story 2.1: Frontend Authentication Integration
   └─> Creates login page
   └─> Implements MSAL React login flow
   └─> Handles OAuth callback
   └─> Creates/updates user record
   └─> Redirects to dashboard
   
2. Story 2.2: Backend Token Validation (depends on 2.1)
   └─> Creates authentication middleware
   └─> Implements token validation
   └─> Creates /api/auth/me endpoint
   └─> Enforces authentication on protected routes
   
3. Story 2.3: Protected Routes (depends on 2.2)
   └─> Implements Next.js middleware
   └─> Adds route guards
   └─> Handles session management
   └─> Manages token refresh
   
4. Story 2.4: Logout (depends on 2.3)
   └─> Implements logout button
   └─> Clears session
   └─> Redirects to login
```

**Authentication Flow Sequence:**

```
1. User clicks "Sign in with Microsoft"
   └─> MSAL React initiates loginRedirect/loginPopup
   
2. User authenticates with Microsoft Entra External ID
   └─> Microsoft redirects back with authorization code
   
3. OAuth callback handler receives code
   └─> MSAL exchanges code for tokens
   └─> ID token contains user claims (email, sub/oid)
   
4. Backend creates/updates user record
   └─> Look up user by externalId
   └─> Create new user if doesn't exist
   └─> Update email if changed
   
5. User redirected to dashboard
   └─> MSAL stores tokens in memory
   └─> Session established
   
6. Subsequent API requests
   └─> Frontend includes Bearer token in Authorization header
   └─> Backend middleware validates token
   └─> Extracts user ID from token claims
   └─> Provides authenticated user context
   
7. Token refresh (automatic)
   └─> MSAL detects token expiration
   └─> Automatically refreshes token
   └─> User session continues seamlessly
   
8. User logout
   └─> MSAL clears tokens from memory
   └─> User redirected to login
   └─> Protected routes require re-authentication
```

**Data Flow:**

```
Microsoft Entra External ID
    ↓ (OAuth flow)
MSAL React (Frontend)
    ↓ (ID token with claims)
OAuth Callback Handler
    ↓ (extract email, externalId)
Database (create/update User)
    ↓ (user record created)
Dashboard (authenticated)
    ↓ (subsequent requests)
API Routes (with Bearer token)
    ↓ (token validation)
Authentication Middleware
    ↓ (extract user ID)
Protected Route Handlers
    ↓ (user context available)
Database Queries (filtered by user_id)
```

---

## Non-Functional Requirements

### Performance

**Epic 2 Performance Targets:**
- Login flow completion: < 5 seconds (including Microsoft redirect)
- Token validation: < 100ms per API request
- Session check (middleware): < 50ms per page load
- Logout completion: < 1 second

**Future Performance Targets (from PRD):**
- Dashboard load: < 2 seconds (Epic 4, requires authentication)
- API response times: < 500ms for medication operations (Epic 3+)

**Architecture Support:**
- MSAL handles token caching automatically (reduces validation overhead)
- Authentication middleware is lightweight (token validation only)
- Database user lookup is indexed (externalId index from Epic 1)
- Next.js middleware runs at edge (fast route protection)

---

### Security

**Authentication Security (All Stories):**
- OpenID Connect standard (PRD NFR1 requirement)
- Microsoft Entra External ID provides enterprise-grade security
- Tokens stored in-memory only (not localStorage, Architecture pattern)
- HTTPS required (TLS 1.2+, PRD NFR2, handled by deployment)
- Token validation on every API request (no token caching on backend)

**Token Security (Story 2.2):**
- Bearer token in Authorization header (standard OAuth pattern)
- Token expiration enforced (Microsoft Entra ID manages)
- Token refresh handled securely by MSAL
- Invalid tokens rejected immediately (401 response)

**Session Security (Story 2.3):**
- Session timeout configurable (PRD FR4 requirement)
- Token refresh automatic (no user interruption)
- Session state managed by MSAL (secure in-memory storage)
- No sensitive data in browser storage (Architecture pattern)

**Data Isolation Security (Story 2.2):**
- All API routes enforce user context (authentication middleware)
- Database queries filter by user_id (Architecture security pattern)
- User cannot access other users' data (PRD FR37-FR39)
- Unauthorized access prevented (PRD FR41, NFR5)

**PRD Security Requirements Addressed:**
- NFR1: OpenID Connect with Microsoft Entra External ID ✅
- NFR2: TLS 1.2+ (handled by deployment platform) ✅
- NFR4: Secure session management ✅
- NFR5: Authentication/authorization checks ✅
- NFR6: HIPAA-aligned practices (secure authentication) ✅
- NFR7: OWASP Top 10 protection (authentication prevents unauthorized access) ✅

**Vulnerability Mitigation:**
- **OWASP A01: Broken Access Control** - Prevented by authentication middleware and user_id filtering
- **OWASP A02: Cryptographic Failures** - Prevented by TLS and secure token storage
- **OWASP A07: Identification and Authentication Failures** - Prevented by Microsoft Entra ID and token validation

---

### Reliability/Availability

**Authentication Reliability:**
- Microsoft Entra External ID provides high availability (SLA managed by Microsoft)
- Token validation failures handled gracefully (401 response, redirect to login)
- User record creation is idempotent (externalId unique constraint prevents duplicates)
- Session persistence across page navigations (MSAL handles)

**Error Handling:**
- Authentication failures return clear error messages
- Network errors during login show user-friendly messages
- Token expiration handled automatically (MSAL refresh)
- Invalid tokens rejected with 401 (standard HTTP status)

**Availability Considerations:**
- Application depends on Microsoft Entra External ID availability
- Degradation: If Microsoft auth is down, users cannot log in (expected)
- No fallback authentication method (Microsoft Entra ID is required)

---

### Observability

**Authentication Logging (Story 2.2):**
- Log successful authentications (info level)
- Log authentication failures (warn level, no sensitive data)
- Log token validation errors (error level)
- Include user ID in logs (for debugging, not PII)

**Session Logging (Story 2.3):**
- Log session timeouts (info level)
- Log unauthorized access attempts (warn level)
- Log logout events (info level)

**Logging Format (from Architecture):**
```json
{
  "level": "info",
  "message": "User authenticated",
  "userId": "uuid",
  "timestamp": "2025-11-19T10:00:00Z",
  "endpoint": "/api/auth/callback"
}
```

**Metrics to Track (Future):**
- Authentication success rate
- Average login time
- Token validation latency
- Session duration
- Logout frequency

---

## Dependencies and Integrations

### Core Dependencies

**Authentication Libraries (from Epic 1):**
- `@azure/msal-react@latest` - MSAL React for frontend authentication
- `@azure/msal-node@latest` - MSAL Node for backend token validation
- `@azure/msal-browser@latest` - MSAL Browser (dependency of msal-react)

**Database (from Epic 1):**
- `@prisma/client@latest` - Prisma ORM client for user record operations
- `prisma@latest` - Prisma CLI (for migrations if schema changes)

**Framework (from Epic 1):**
- `next@^15.0.0` - Next.js framework (middleware, API routes)
- `react@^18.0.0` - React library (for login page components)
- `typescript@^5.0.0` - TypeScript (type safety for auth code)

### External Services

**Microsoft Entra External ID:**
- Identity provider for user authentication
- Requires Azure account and tenant configuration
- Configuration via environment variables (from Epic 1):
  - `AZURE_CLIENT_ID` - Application client ID
  - `AZURE_CLIENT_SECRET` - Application client secret
  - `AZURE_TENANT_ID` - Azure tenant ID
  - `AZURE_REDIRECT_URI` - OAuth callback URL

**External PostgreSQL Server (from Epic 1):**
- Database for user record storage
- Connection via `DATABASE_URL` environment variable
- User model already defined in Prisma schema (Epic 1)

### Integration Points

**Epic 1 → Epic 2:**
- MSAL configuration (`lib/auth/msal.ts`) from Story 1.3 enables authentication flows
- User model from Story 1.2 provides database schema for user records
- Prisma Client from Story 1.2 enables user record creation/updates

**Epic 2 → Epic 3+:**
- Authentication middleware enables all future API routes to be protected
- User context provides user_id for data isolation in all future features
- Protected routes pattern enables secure medication management features

**Microsoft Entra External ID → Epic 2:**
- Provides user authentication and token issuance
- Handles user registration and password management
- Manages token expiration and refresh

---

## Acceptance Criteria (Authoritative)

**AC1: Frontend Authentication Integration (Story 2.1)**
Given I am on the login page
When I click "Sign in with Microsoft"
Then I am redirected to Microsoft Entra External ID login page
And I can enter my Microsoft account credentials
And after successful authentication, I am redirected back to the application
And my access token is stored by MSAL (in-memory, not localStorage)
And I am redirected to the dashboard

And when authentication fails:
Then I see an error message explaining the issue
And I can retry the login process

And when I am already authenticated:
Then I am automatically redirected to the dashboard
And I don't see the login page

And when I log in for the first time:
Then a user record is created in the database with my email and external ID
And my user ID is available for subsequent requests

**AC2: Backend Token Validation (Story 2.2)**
Given a user makes an API request with a Bearer token
When the request includes a valid Authorization header
Then the token is validated using MSAL Node
And user ID is extracted from token claims (sub or oid)
And user record is verified in database (created if first login)
And request proceeds with authenticated user context

And when the token is invalid or expired:
Then request returns 401 Unauthorized
And error response includes clear message: "Authentication required"
And frontend handles 401 by redirecting to login

And when no token is provided:
Then request returns 401 Unauthorized
And frontend redirects to login page

And when I call GET /api/auth/me:
Then it returns current user information (id, email, timezone)
And it uses authenticated user context from token

**AC3: Protected Routes and Session Management (Story 2.3)**
Given I am logged in
When I navigate between pages:
Then I remain authenticated
And my session persists across page navigations
And I don't see login prompts

And when I access a protected route:
Then if authenticated, I see the page content
And if not authenticated, I am redirected to login

And when my session expires:
Then I am automatically redirected to login
And I see a message explaining the session expired
And I can log in again to continue

And when token refresh occurs:
Then MSAL handles token refresh automatically
And I don't notice any interruption
And my session continues seamlessly

**AC4: Logout Functionality (Story 2.4)**
Given I am logged in
When I click the logout button (in header/user menu)
Then I am logged out of the application
And my session is ended
And I am redirected to the login page
And I cannot access protected routes without logging in again

And when I log out:
Then MSAL clears the token from memory
And all user session data is cleared
And no sensitive data remains in browser storage
And I must log in again to access the application

---

## Traceability Mapping

| Acceptance Criteria | Spec Section | Component/API | Test Idea |
|---------------------|--------------|---------------|-----------|
| AC1: Login Page | Story 2.1 | `app/(auth)/login/page.tsx` | Verify login page renders, button triggers MSAL login |
| AC1: OAuth Callback | Story 2.1 | `app/api/auth/callback/route.ts` | Verify callback handles OAuth code, creates user record |
| AC1: User Record Creation | Story 2.1 | Database User model | Verify user created with correct email and externalId |
| AC1: Dashboard Redirect | Story 2.1 | Login flow | Verify authenticated users redirected to dashboard |
| AC1: Error Handling | Story 2.1 | Login page | Verify error messages displayed on auth failure |
| AC2: Token Validation | Story 2.2 | `lib/auth/middleware.ts` | Verify token validated, user ID extracted correctly |
| AC2: 401 Response | Story 2.2 | Authentication middleware | Verify 401 returned for invalid/missing tokens |
| AC2: /api/auth/me | Story 2.2 | `app/api/auth/me/route.ts` | Verify endpoint returns user info for authenticated users |
| AC2: User Context | Story 2.2 | Protected API routes | Verify user context available in route handlers |
| AC3: Route Protection | Story 2.3 | `middleware.ts` | Verify protected routes redirect unauthenticated users |
| AC3: Session Persistence | Story 2.3 | MSAL session management | Verify session persists across page navigations |
| AC3: Token Refresh | Story 2.3 | MSAL token refresh | Verify token refresh happens automatically |
| AC3: Session Expiration | Story 2.3 | Session timeout handling | Verify expired sessions redirect to login |
| AC4: Logout Button | Story 2.4 | `components/layout/Header.tsx` | Verify logout button exists and functional |
| AC4: Logout Flow | Story 2.4 | MSAL logout methods | Verify logout clears session and redirects |
| AC4: Post-Logout Access | Story 2.4 | Protected routes | Verify protected routes inaccessible after logout |

---

## Risks, Assumptions, Open Questions

### Risks

**R1: Microsoft Entra External ID Configuration Issues**
- **Risk:** Azure tenant or application registration may be misconfigured
- **Impact:** High - Blocks all authentication flows
- **Mitigation:** Verify Azure configuration before starting Epic 2, document setup requirements clearly, test with sample tenant

**R2: Token Validation Performance**
- **Risk:** Token validation on every API request may add latency
- **Impact:** Medium - Could slow down API responses
- **Mitigation:** MSAL Node caches token validation results, middleware is lightweight, monitor performance in testing

**R3: User Record Creation Race Condition**
- **Risk:** Multiple simultaneous logins from same user could cause duplicate user creation attempts
- **Impact:** Low - Database unique constraint on externalId prevents duplicates
- **Mitigation:** Use database unique constraint, handle constraint violation gracefully (upsert pattern)

**R4: Session Timeout User Experience**
- **Risk:** Users may lose work if session expires unexpectedly
- **Impact:** Medium - Frustrating user experience
- **Mitigation:** MSAL handles token refresh automatically, show clear message on session expiration, consider warning before expiration (future enhancement)

**R5: Microsoft Entra External ID Availability**
- **Risk:** Microsoft authentication service may be unavailable
- **Impact:** High - Users cannot log in
- **Mitigation:** This is expected dependency, monitor Microsoft status, no fallback authentication (by design)

### Assumptions

**A1: Azure Tenant Setup**
- Assumption: User has Microsoft Entra External ID tenant configured or can create one
- Validation: Verify Azure credentials before starting Epic 2
- **Status:** Needs verification (same as Epic 1)

**A2: User Email Availability**
- Assumption: Microsoft Entra External ID provides email in token claims
- Validation: Verify token claims structure during Story 2.1 implementation
- **Status:** Standard Microsoft Entra ID behavior

**A3: External ID Consistency**
- Assumption: Microsoft Entra ID external ID (sub/oid) is stable and doesn't change
- Validation: Verify Microsoft documentation on ID stability
- **Status:** Standard Microsoft Entra ID behavior (IDs are stable)

**A4: Token Expiration Handling**
- Assumption: MSAL automatically handles token refresh without user intervention
- Validation: Test token refresh flow during Story 2.3 implementation
- **Status:** MSAL library feature (documented behavior)

### Open Questions

**Q1: Token Refresh Strategy**
- Question: Should we implement custom token refresh logic or rely entirely on MSAL?
- Impact: Story 2.3 implementation approach
- Next Step: Use MSAL automatic refresh (simpler, recommended approach)

**Q2: Session Timeout Configuration**
- Question: What should be the default session timeout value?
- Impact: Story 2.3 configuration
- Next Step: Use token expiration as default (configurable later)

**Q3: Error Message Localization**
- Question: Should error messages be localized or English-only for MVP?
- Impact: Story 2.1 and 2.2 error handling
- Next Step: English-only for MVP (localization future consideration)

**Q4: Logout Redirect URL**
- Question: Should logout redirect to login page or home page?
- Impact: Story 2.4 implementation
- Next Step: Redirect to login page (clearer UX)

---

## Test Strategy Summary

### Unit Testing

**Framework:** Vitest (configured in Epic 1)

**Test Coverage for Epic 2:**

**Story 2.1 - Frontend Authentication:**
- Test: Verify login page renders correctly
- Test: Verify MSAL login method is called on button click
- Test: Verify OAuth callback handler processes authorization code
- Test: Verify user record creation logic (mock database)
- Test: Verify error handling for authentication failures
- **Location:** `__tests__/unit/auth-frontend.test.tsx`

**Story 2.2 - Backend Token Validation:**
- Test: Verify token extraction from Authorization header
- Test: Verify token validation using MSAL Node (mock)
- Test: Verify user ID extraction from token claims
- Test: Verify user record lookup/creation logic
- Test: Verify 401 response for invalid tokens
- Test: Verify /api/auth/me endpoint returns user info
- **Location:** `__tests__/unit/auth-backend.test.ts`

**Story 2.3 - Route Protection:**
- Test: Verify middleware redirects unauthenticated users
- Test: Verify middleware allows authenticated users
- Test: Verify session persistence logic (mock MSAL)
- Test: Verify token refresh handling
- **Location:** `__tests__/unit/auth-middleware.test.ts`

**Story 2.4 - Logout:**
- Test: Verify logout button triggers MSAL logout
- Test: Verify session is cleared on logout
- Test: Verify redirect to login after logout
- **Location:** `__tests__/unit/auth-logout.test.tsx`

### Integration Testing

**Authentication Integration Tests:**
- Test: End-to-end login flow (mock Microsoft Entra ID)
- Test: Token validation with real MSAL Node (test environment)
- Test: User record creation on first login
- Test: Protected API route access with valid token
- Test: Protected API route rejection with invalid token
- **Location:** `__tests__/integration/auth.test.ts`

**Database Integration Tests:**
- Test: User record creation with correct fields
- Test: User record lookup by externalId
- Test: User record update on subsequent logins
- Test: Unique constraint prevents duplicate users
- **Location:** `__tests__/integration/user-model.test.ts`

### E2E Testing

**E2E Authentication Tests:**
- Test: Complete login flow (if test Microsoft Entra ID tenant available)
- Test: Session persistence across page navigations
- Test: Logout flow
- Test: Protected route access after login
- Test: Protected route rejection when logged out
- **Framework:** Playwright (configured in Epic 1)
- **Location:** `__tests__/e2e/auth.test.ts`

**Note:** E2E tests may require test Microsoft Entra ID tenant setup. Consider mocking for CI/CD pipeline.

### Test Data Strategy

**Authentication Test Data:**
- Mock Microsoft Entra ID tokens for unit tests
- Use test database for integration tests
- Create test users with known externalIds
- Clean up test users after test runs

**Mock Strategy:**
- Mock MSAL React methods for frontend tests
- Mock MSAL Node token validation for backend tests
- Use real Prisma Client with test database for integration tests

---

## Implementation Guide

### Story 2.1 Implementation Steps

1. **Create Login Page**
   - Create `app/(auth)/login/page.tsx`
   - Add "Sign in with Microsoft" button
   - Use shadcn/ui Button component
   - Style with Tailwind CSS

2. **Implement MSAL Login Flow**
   - Import MSAL instance from `lib/auth/msal.ts`
   - Call `loginRedirect()` or `loginPopup()` on button click
   - Handle login errors with try/catch

3. **Create OAuth Callback Handler**
   - Create `app/api/auth/callback/route.ts`
   - Handle OAuth callback from Microsoft
   - Extract authorization code
   - MSAL handles token exchange automatically

4. **Extract User Information**
   - Get ID token from MSAL after authentication
   - Extract email and external ID (sub/oid) from token claims
   - Use these values for user record creation

5. **Create/Update User Record**
   - Check if user exists by externalId
   - Create new user if doesn't exist
   - Update email if changed (optional)
   - Store user ID for session

6. **Redirect to Dashboard**
   - Redirect authenticated users to dashboard (`/`)
   - Handle redirect state (where user wanted to go)

7. **Handle Errors**
   - Display error messages on login page
   - Handle network errors gracefully
   - Allow retry on failure

### Story 2.2 Implementation Steps

1. **Create Authentication Middleware**
   - Create `lib/auth/middleware.ts`
   - Export `authenticateRequest()` function
   - Extract Bearer token from Authorization header

2. **Implement Token Validation**
   - Use MSAL Node ConfidentialClientApplication
   - Validate token signature and expiration
   - Extract token claims

3. **Extract User ID**
   - Get sub or oid from token claims
   - Use as externalId for user lookup

4. **Look Up or Create User**
   - Query database for user by externalId
   - Create user if doesn't exist
   - Return user record with internal ID

5. **Create /api/auth/me Endpoint**
   - Create `app/api/auth/me/route.ts`
   - Use authentication middleware
   - Return user information (id, email, timezone)

6. **Handle Authentication Errors**
   - Return 401 for invalid/missing tokens
   - Include clear error message
   - Use standard error response format

7. **Test Middleware**
   - Test with valid tokens
   - Test with invalid tokens
   - Test with missing tokens
   - Verify user context is correct

### Story 2.3 Implementation Steps

1. **Create Next.js Middleware**
   - Create `middleware.ts` in project root
   - Define protected route patterns
   - Check authentication status

2. **Implement Route Protection**
   - Check if route requires authentication
   - Verify user has valid session (via MSAL)
   - Redirect to login if not authenticated

3. **Handle Session State**
   - Use MSAL to check if user is authenticated
   - Maintain session across page navigations
   - Handle token refresh automatically

4. **Add Route Guards**
   - Protect dashboard and medication pages
   - Allow public access to login page
   - Handle redirect after login

5. **Configure Session Timeout**
   - Use token expiration as default timeout
   - Make timeout configurable (environment variable)
   - Handle session expiration gracefully

6. **Test Route Protection**
   - Test authenticated user access
   - Test unauthenticated user redirect
   - Test session persistence
   - Test token refresh

### Story 2.4 Implementation Steps

1. **Add Logout Button**
   - Add logout button to `components/layout/Header.tsx`
   - Use shadcn/ui Button component
   - Position in user menu or header

2. **Implement Logout Handler**
   - Call MSAL `logoutRedirect()` or `logoutPopup()`
   - Clear any application state
   - Handle logout errors

3. **Clear Session Data**
   - Ensure MSAL clears tokens
   - Clear any cached user data
   - Remove any application state

4. **Redirect to Login**
   - Redirect to login page after logout
   - Clear any navigation state
   - Ensure clean logout experience

5. **Verify Logout**
   - Test that protected routes are inaccessible
   - Test that user must log in again
   - Test that no sensitive data remains

---

## Success Criteria

**Epic 2 is complete when:**
- ✅ All 4 stories are marked as `done` in sprint-status.yaml
- ✅ Users can log in using Microsoft Entra External ID
- ✅ Authentication tokens are validated on all API requests
- ✅ Protected routes require authentication
- ✅ Sessions persist across page navigations
- ✅ Users can log out securely
- ✅ All acceptance criteria for all 4 stories are met
- ✅ No blocking issues preventing Epic 3 from starting

**Quality Gates:**
- All unit tests pass
- Integration tests pass (authentication flow)
- ESLint passes with no errors
- TypeScript compiles with no errors
- Authentication middleware works correctly
- Protected routes redirect unauthenticated users
- Logout clears session completely

**Security Validation:**
- Tokens validated on every API request
- No sensitive data in browser storage
- User data isolated by user_id
- 401 responses for invalid tokens
- Session timeout enforced

---

_This Epic Technical Specification provides comprehensive implementation guidance for Epic 2: User Authentication. It serves as the authoritative technical reference for developers implementing stories in this epic._

