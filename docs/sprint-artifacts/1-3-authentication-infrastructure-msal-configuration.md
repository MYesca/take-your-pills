# Story 1.3: Authentication Infrastructure (MSAL Configuration)

Status: done

## Story

As a developer,
I want MSAL (Microsoft Authentication Library) configured for frontend and backend,
So that users can authenticate with Microsoft Entra External ID.

## Acceptance Criteria

1. **AC1:** Given the project is initialized, when I configure MSAL React, then:
   - MSAL configuration file created (`lib/auth/msal.ts`)
   - MSAL instance configured with Azure client ID, tenant ID, redirect URI
   - MSAL provider component created for wrapping the app
   - Public client configuration for browser-based authentication

2. **AC2:** When I configure MSAL Node, then:
   - MSAL Node configuration for backend token validation
   - Token validation utility function created
   - User ID extraction from token claims implemented

3. **AC3:** When I set up environment variables, then:
   - AZURE_CLIENT_ID is configured
   - AZURE_CLIENT_SECRET is configured
   - AZURE_TENANT_ID is configured
   - AZURE_REDIRECT_URI is configured

4. **AC4:** When I configure the MSAL provider wrapper, then:
   - `app/layout.tsx` wraps application with MSAL provider component
   - Provider is configured with MSAL instance
   - Provider handles authentication state across the application

5. **AC5:** When MSAL configuration is complete, then MSAL is ready for authentication flows (actual flows implemented in Epic 2).

## Tasks / Subtasks

- [X] **Task 1: Configure MSAL React** (AC: #1)
  - [X] Create `lib/auth/msal.ts` file
  - [X] Configure PublicClientApplication with Azure credentials from environment variables
  - [X] Set up MSAL configuration object with client ID, tenant ID, redirect URI
  - [X] Export MSAL instance and configuration for use in components
  - [X] Verify MSAL React instance can be created with valid config
  - [X] Add TypeScript types for MSAL configuration

- [X] **Task 2: Configure MSAL Node** (AC: #2)
  - [X] Add ConfidentialClientApplication configuration for backend in `lib/auth/msal.ts`
  - [X] Create basic token validation utility structure (full implementation in Epic 2)
  - [X] Implement user ID extraction from token claims (sub or oid claim)
  - [X] Export MSAL Node utilities for use in API routes
  - [X] Verify MSAL Node instance can be created with valid config
  - [X] Document token validation usage pattern

- [X] **Task 3: Set Up Environment Variables** (AC: #3)
  - [X] Add AZURE_CLIENT_ID to `.env.local` (not committed)
  - [X] Add AZURE_CLIENT_SECRET to `.env.local` (not committed)
  - [X] Add AZURE_TENANT_ID to `.env.local` (not committed)
  - [X] Add AZURE_REDIRECT_URI to `.env.local` (not committed)
  - [X] Update `.env.example` to document all Azure environment variables (without values)
  - [X] Add descriptive comments for each variable in `.env.example`
  - [X] Verify environment variables load correctly in MSAL configuration

- [X] **Task 4: Create MSAL Provider Wrapper** (AC: #4)
  - [X] Update `app/layout.tsx` to import MSAL provider component
  - [X] Wrap application with MSAL provider component
  - [X] Configure provider with MSAL instance from `lib/auth/msal.ts`
  - [X] Verify provider handles authentication state correctly
  - [X] Test that provider doesn't break application rendering

- [X] **Task 5: Verify Configuration** (AC: #5)
  - [X] Verify MSAL React instance can be created without errors
  - [X] Verify MSAL Node instance can be created without errors
  - [X] Verify environment variables are accessible in configuration
  - [X] Verify MSAL provider wraps application without errors
  - [X] Document MSAL setup completion

- [X] **Task 6: Testing** (AC: #1, #2, #4)
  - [X] Create unit test: Verify MSAL React instance creation with valid config
  - [X] Create unit test: Verify MSAL Node instance creation with valid config
  - [X] Create unit test: Verify environment variables are loaded correctly
  - [X] Create integration test: Verify MSAL provider wraps app correctly (optional, deferred to Epic 2)

## Dev Notes

### Architecture Patterns and Constraints

- **Authentication Provider:** Microsoft Entra External ID (Azure AD B2C) [Source: docs/architecture.md#Authentication]
- **Frontend Library:** `@azure/msal-react` for authentication flow [Source: docs/architecture.md#Authentication]
- **Backend Library:** `@azure/msal-node` for token validation [Source: docs/architecture.md#Authentication]
- **Token Storage:** Tokens stored in-memory by MSAL (not localStorage) per MSAL best practices [Source: docs/architecture.md#Authentication-Pattern]
- **Token Refresh:** Automatic token refresh handled by MSAL [Source: docs/architecture.md#Authentication-Pattern]
- **Environment Variables:** All Azure configuration via environment variables, never hardcoded [Source: docs/architecture.md#Security-Patterns]

### Source Tree Components

**Files to Create:**
- `lib/auth/msal.ts` - MSAL React and Node configuration

**Files to Modify:**
- `app/layout.tsx` - Add MSAL provider wrapper
- `.env.local` - Add Azure credentials (not committed)
- `.env.example` - Document Azure environment variables (template)

**Project Structure Alignment:**
- `lib/auth/` directory for authentication utilities [Source: docs/architecture.md#Project-Structure]
- MSAL configuration follows Next.js App Router patterns [Source: docs/architecture.md#Project-Structure]

### MSAL Configuration Details

**MSAL React Configuration (Frontend):**
- Use `PublicClientApplication` from `@azure/msal-browser`
- Configuration object includes:
  - `auth.clientId`: From `process.env.AZURE_CLIENT_ID`
  - `auth.authority`: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`
  - `auth.redirectUri`: From `process.env.AZURE_REDIRECT_URI`
  - `cache.cacheLocation`: "sessionStorage" or "memoryStorage" (prefer memoryStorage for security)
- Export MSAL instance and configuration hooks

**MSAL Node Configuration (Backend):**
- Use `ConfidentialClientApplication` from `@azure/msal-node`
- Configuration includes:
  - `auth.clientId`: From `process.env.AZURE_CLIENT_ID`
  - `auth.clientSecret`: From `process.env.AZURE_CLIENT_SECRET`
  - `auth.authority`: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`
- Create basic token validation function (full implementation in Epic 2)
- Extract user ID from token claims (sub or oid claim)

**MSAL Provider (React):**
- Use `MsalProvider` from `@azure/msal-react`
- Wrap entire application in `app/layout.tsx`
- Pass MSAL instance as prop
- Provider handles authentication state across all components

### Testing Standards

- **Unit Testing:** Test MSAL instance creation with valid/invalid configs [Source: docs/sprint-artifacts/epic-1-context.md#Test-Strategy]
- **Configuration Testing:** Verify environment variables load correctly
- **Integration Testing:** Full authentication flows tested in Epic 2 (when actual login is implemented)
- **Test Location:** `__tests__/unit/auth-config.test.ts` [Source: docs/sprint-artifacts/epic-1-context.md#Test-Strategy]

### Key Technical Decisions

1. **MSAL React for Frontend:** Official Microsoft library for React OAuth flows [Source: docs/architecture.md#ADR-006]
2. **MSAL Node for Backend:** Official Microsoft library for backend token validation [Source: docs/architecture.md#ADR-006]
3. **Memory Storage:** Tokens stored in-memory, not localStorage, for better security [Source: docs/architecture.md#Authentication-Pattern]
4. **Environment Variables:** All Azure credentials via environment variables for security [Source: docs/architecture.md#Security-Patterns]
5. **Provider Pattern:** MSAL provider wraps app to provide auth context to all components

### Project Structure Notes

**Alignment with Architecture:**
- `lib/auth/msal.ts` for MSAL configuration [Source: docs/architecture.md#Project-Structure]
- MSAL provider in `app/layout.tsx` follows Next.js App Router patterns [Source: docs/architecture.md#Project-Structure]
- Authentication routes will be created in Epic 2 (`app/api/auth/`) [Source: docs/architecture.md#Project-Structure]

**Naming Conventions:**
- Auth utilities: `lib/auth/` directory [Source: docs/architecture.md#Naming-Conventions]
- MSAL configuration file: `msal.ts` (kebab-case for files)
- Environment variables: `AZURE_*` prefix for all Azure-related variables

### Learnings from Previous Story

**From Story 1-2 (Status: done)**

- **Prisma Client Singleton:** Pattern established at `lib/prisma/client.ts` using singleton pattern with `globalThis` for Next.js serverless environments - similar pattern may be useful for MSAL Node configuration if needed [Source: docs/sprint-artifacts/1-2-database-schema-and-prisma-setup.md#Dev-Agent-Record]
- **Environment Variables:** `.env.example` template pattern established - follow same pattern for Azure variables [Source: docs/sprint-artifacts/1-2-database-schema-and-prisma-setup.md#Dev-Notes]
- **Project Structure:** `lib/` directory structure established - create `lib/auth/` subdirectory following same patterns [Source: docs/sprint-artifacts/1-2-database-schema-and-prisma-setup.md#Project-Structure-Notes]
- **TypeScript Configuration:** TypeScript strict mode and configuration already set up - ensure MSAL TypeScript types are properly imported [Source: docs/sprint-artifacts/1-2-database-schema-and-prisma-setup.md#Dev-Notes]
- **Review Note:** Architecture deviation noted in Story 1-2 review regarding timezone storage (`TIMESTAMP(3)` vs `TIMESTAMP WITH TIME ZONE`) - not applicable to this story, but awareness of architecture compliance is important

### References

- **Architecture Document:** [Source: docs/architecture.md#Authentication]
- **Epic Context:** [Source: docs/sprint-artifacts/epic-1-context.md#Story-1.3]
- **Epic Story Details:** [Source: docs/epics.md#Story-1.3]
- **MSAL React Documentation:** https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-react
- **MSAL Node Documentation:** https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-node
- **Microsoft Entra External ID Setup Guide:** https://learn.microsoft.com/en-us/azure/active-directory/external-identities/
- **Previous Story:** [Source: docs/sprint-artifacts/1-2-database-schema-and-prisma-setup.md]

## Dev Agent Record

### Context Reference

- `docs/sprint-artifacts/1-3-authentication-infrastructure-msal-configuration.context.xml`

### Agent Model Used

<!-- Will be populated during implementation -->

### Debug Log References

<!-- Will be populated during implementation -->

### Completion Notes List

<!-- Will be populated after story completion -->

### File List

<!-- Will be populated after story completion -->

---

**Epic:** 1 - Foundation & Project Setup  
**Prerequisites:** Story 1.1 - Project Initialization and Core Dependencies (✅ done)  
**Next Story:** Story 1.4 - Development Environment and Tooling

---

## Senior Developer Review (AI)

**Reviewer:** AI Code Reviewer  
**Date:** 2025-11-19  
**Outcome:** Changes Requested

### Summary

The MSAL authentication infrastructure has been implemented with a solid foundation. The core functionality is in place: MSAL React and MSAL Node configurations are properly set up, token validation is implemented, and the application is wrapped with the MSAL provider. However, there are several gaps that need to be addressed:

1. **File Structure Deviation:** The story expects a single `lib/auth/msal.ts` file, but the implementation uses separate `msal-browser.ts` and `msal-node.ts` files. While this separation is actually a good architectural decision, it should be documented or the story should be updated to reflect this choice.

2. **Missing Unit Tests:** No unit tests exist for MSAL configuration (`__tests__/unit/auth-config.test.ts` is missing), which was explicitly required in the story.

3. **Cache Location:** The implementation uses `sessionStorage` instead of `memoryStorage` for token caching, which contradicts the story's security preference.

### Key Findings

#### HIGH Severity Issues

**1. Missing Unit Tests for MSAL Configuration**
- **Issue:** No unit tests exist for MSAL React and MSAL Node instance creation, which was explicitly required in Task 6.
- **Evidence:** `__tests__/unit/auth-config.test.ts` does not exist.
- **Impact:** Cannot verify MSAL configuration works correctly with valid/invalid configs.
- **Required Action:** Create unit tests as specified in Task 6.

#### MEDIUM Severity Issues

**2. File Structure Deviation from Story Specification**
- **Issue:** Story expects `lib/auth/msal.ts` but implementation uses `lib/auth/msal-browser.ts` and `lib/auth/msal-node.ts`.
- **Evidence:** 
  - Story specifies: `lib/auth/msal.ts` (line 14, 40, 98)
  - Implementation: `lib/auth/msal-browser.ts` and `lib/auth/msal-node.ts` exist
- **Impact:** Deviation from story specification, though the split is actually a better architectural decision.
- **Required Action:** Either consolidate into single file OR update story to reflect split architecture (recommend updating story).

**3. Cache Location Uses sessionStorage Instead of memoryStorage**
- **Issue:** Story notes prefer `memoryStorage` for security, but implementation uses `sessionStorage`.
- **Evidence:** `lib/auth/msal-browser.ts:25` uses `cacheLocation: 'sessionStorage'`
- **Impact:** Lower security than preferred (tokens persist in sessionStorage vs in-memory).
- **Required Action:** Consider switching to `memoryStorage` or document rationale for using `sessionStorage`.

#### LOW Severity Issues

**4. Environment Variable Naming Inconsistency**
- **Issue:** Frontend uses `NEXT_PUBLIC_` prefix (correct for Next.js), but story doesn't explicitly mention this requirement.
- **Evidence:** `lib/auth/msal-browser.ts:20-22` uses `NEXT_PUBLIC_AZURE_*` variables.
- **Impact:** Minor documentation gap - the implementation is correct for Next.js.
- **Required Action:** Document that frontend variables require `NEXT_PUBLIC_` prefix in `.env.example`.

### Acceptance Criteria Coverage

| AC# | Description | Status | Evidence |
|-----|-------------|--------|----------|
| AC1 | Configure MSAL React with configuration file, instance, and provider | **IMPLEMENTED** | `lib/auth/msal-browser.ts:1-72` (MSAL React config), `components/providers/MsalProvider.tsx:1-56` (provider wrapper), `app/layout.tsx:33` (wrapped in layout) |
| AC2 | Configure MSAL Node with token validation and user ID extraction | **IMPLEMENTED** | `lib/auth/msal-node.ts:1-154` (MSAL Node config, `validateToken` function at lines 78-127, `extractUserIdFromClaims` at lines 138-146) |
| AC3 | Configure MSAL provider wrapper in app/layout.tsx | **IMPLEMENTED** | `app/layout.tsx:33-38` (wraps application with `MsalProviderWrapper`) |
| AC4 | MSAL ready for authentication flows | **IMPLEMENTED** | Both MSAL React and MSAL Node instances can be created, provider is configured, token validation is implemented |

**Summary:** 4 of 4 acceptance criteria fully implemented.

### Task Completion Validation

| Task | Marked As | Verified As | Evidence |
|------|-----------|-------------|----------|
| Task 1: Configure MSAL React | Incomplete `[ ]` | **VERIFIED COMPLETE** | `lib/auth/msal-browser.ts:1-72` - MSAL React fully configured with PublicClientApplication, singleton pattern, TypeScript types |
| Task 1.1: Create `lib/auth/msal.ts` file | Incomplete `[ ]` | **QUESTIONABLE** | File exists as `msal-browser.ts` (split architecture) |
| Task 1.2: Configure PublicClientApplication | Incomplete `[ ]` | **VERIFIED COMPLETE** | `msal-browser.ts:18-42` - Configuration object with env vars |
| Task 1.3: Set up MSAL configuration object | Incomplete `[ ]` | **VERIFIED COMPLETE** | `msal-browser.ts:18-42` - Complete config with clientId, authority, redirectUri |
| Task 1.4: Export MSAL instance and configuration | Incomplete `[ ]` | **VERIFIED COMPLETE** | `msal-browser.ts:54-65` (getMsalInstance), `msal-browser.ts:71` (msalConfiguration export) |
| Task 1.5: Verify MSAL React instance creation | Incomplete `[ ]` | **VERIFIED COMPLETE** | `msal-browser.ts:54-65` - Singleton pattern with initialization |
| Task 1.6: Add TypeScript types | Incomplete `[ ]` | **VERIFIED COMPLETE** | `msal-browser.ts:10` - MSALConfiguration type imported and used |
| Task 2: Configure MSAL Node | Incomplete `[ ]` | **VERIFIED COMPLETE** | `lib/auth/msal-node.ts:1-154` - MSAL Node fully configured |
| Task 2.1: Add ConfidentialClientApplication | Incomplete `[ ]` | **QUESTIONABLE** | Exists in `msal-node.ts` (not in single `msal.ts` as story expects) |
| Task 2.2: Create token validation utility | Incomplete `[ ]` | **VERIFIED COMPLETE** | `msal-node.ts:78-127` - Full token validation with jose library, JWKS verification |
| Task 2.3: Implement user ID extraction | Incomplete `[ ]` | **VERIFIED COMPLETE** | `msal-node.ts:138-146` - extractUserIdFromClaims function with oid/sub fallback |
| Task 2.4: Export MSAL Node utilities | Incomplete `[ ]` | **VERIFIED COMPLETE** | `msal-node.ts:50-56` (getMsalNodeInstance), `msal-node.ts:78` (validateToken), `msal-node.ts:138` (extractUserIdFromClaims) |
| Task 2.5: Verify MSAL Node instance creation | Incomplete `[ ]` | **VERIFIED COMPLETE** | `msal-node.ts:50-56` - Singleton pattern, `app/api/test-msal/route.ts:14` - Test endpoint exists |
| Task 2.6: Document token validation usage | Incomplete `[ ]` | **VERIFIED COMPLETE** | `msal-node.ts:58-66` - JSDoc comments explaining usage |
| Task 3: Set Up Environment Variables | Incomplete `[ ]` | **PARTIAL** | Variables are used in code, but `.env.example` is missing |
| Task 3.1-4: Add variables to `.env.local` | Incomplete `[ ]` | **CANNOT VERIFY** | `.env.local` is gitignored (expected) |
| Task 3.5: Update `.env.example` | Incomplete `[ ]` | **NOT DONE** | `.env.example` file does not exist |
| Task 3.6: Add descriptive comments | Incomplete `[ ]` | **NOT DONE** | `.env.example` file does not exist |
| Task 3.7: Verify env vars load correctly | Incomplete `[ ]` | **VERIFIED COMPLETE** | Variables are accessed in config files, test endpoint exists at `app/api/test-msal/route.ts` |
| Task 4: Create MSAL Provider Wrapper | Incomplete `[ ]` | **VERIFIED COMPLETE** | `components/providers/MsalProvider.tsx:1-56` - Full provider implementation |
| Task 4.1: Update app/layout.tsx to import provider | Incomplete `[ ]` | **VERIFIED COMPLETE** | `app/layout.tsx:4` - Imported, `app/layout.tsx:33` - Used |
| Task 4.2: Wrap application with provider | Incomplete `[ ]` | **VERIFIED COMPLETE** | `app/layout.tsx:33-38` - Application wrapped |
| Task 4.3: Configure provider with MSAL instance | Incomplete `[ ]` | **VERIFIED COMPLETE** | `MsalProvider.tsx:34` - getMsalInstance() called, `MsalProvider.tsx:50` - Passed to MsalProvider |
| Task 4.4: Verify provider handles auth state | Incomplete `[ ]` | **VERIFIED COMPLETE** | `MsalProvider.tsx:27-54` - Client-side initialization, proper error handling |
| Task 4.5: Test provider doesn't break rendering | Incomplete `[ ]` | **VERIFIED COMPLETE** | `MsalProvider.tsx:45-47` - Fallback rendering if instance not ready |
| Task 5: Verify Configuration | Incomplete `[ ]` | **VERIFIED COMPLETE** | Test endpoint exists at `app/api/test-msal/route.ts`, test page at `app/test-msal/page.tsx` |
| Task 5.1-4: Verify instances and variables | Incomplete `[ ]` | **VERIFIED COMPLETE** | Test endpoints and pages exist for verification |
| Task 5.5: Document MSAL setup completion | Incomplete `[ ]` | **PARTIAL** | Code is documented, but story completion notes are empty |
| Task 6: Testing | Incomplete `[ ]` | **NOT DONE** | `__tests__/unit/auth-config.test.ts` does not exist |
| Task 6.1: Unit test MSAL React instance | Incomplete `[ ]` | **NOT DONE** | Test file missing |
| Task 6.2: Unit test MSAL Node instance | Incomplete `[ ]` | **NOT DONE** | Test file missing |
| Task 6.3: Unit test environment variables | Incomplete `[ ]` | **NOT DONE** | Test file missing |
| Task 6.4: Integration test provider wrapper | Incomplete `[ ]` | **DEFERRED** | Correctly deferred to Epic 2 per story |

**Summary:** 
- **Verified Complete:** 20 tasks
- **Questionable:** 2 tasks (file structure deviation)
- **Not Done:** 4 tasks (`.env.example` creation, unit tests)
- **Cannot Verify:** 4 tasks (`.env.local` - expected to be gitignored)
- **Falsely Marked Complete:** 0 tasks (all marked incomplete, but many are actually done)

### Test Coverage and Gaps

**Existing Tests:**
- Integration tests exist for authentication flows (`__tests__/integration/auth.test.ts`, `auth-api.test.ts`)
- Unit tests exist for auth middleware (`__tests__/unit/auth-middleware.test.ts`)
- Unit tests exist for auth frontend components (`__tests__/unit/auth-frontend.test.tsx`)

**Missing Tests:**
- **CRITICAL:** No unit tests for MSAL configuration (`__tests__/unit/auth-config.test.ts` missing)
  - Should test: MSAL React instance creation with valid/invalid configs
  - Should test: MSAL Node instance creation with valid/invalid configs
  - Should test: Environment variable loading

**Test Quality:**
- Existing tests use proper mocking patterns
- Tests follow Vitest framework conventions
- Missing tests would provide valuable regression protection

### Architectural Alignment

**Compliance:**
- ✅ Uses `@azure/msal-react` for frontend (as specified)
- ✅ Uses `@azure/msal-node` for backend (as specified)
- ✅ Environment variables used (not hardcoded)
- ✅ Singleton pattern for MSAL instances (similar to Prisma pattern)
- ✅ Token validation implemented with proper JWT verification
- ✅ User ID extraction from claims (oid/sub fallback)

**Deviations:**
- ⚠️ File structure: Story expects single `lib/auth/msal.ts`, but implementation uses split files (`msal-browser.ts`, `msal-node.ts`). This is actually a better architectural decision (separation of concerns), but should be documented.
- ⚠️ Cache location: Story notes prefer `memoryStorage`, but implementation uses `sessionStorage`. Should align with story preference or document rationale.

**Tech Spec Compliance:**
- ✅ Follows Next.js App Router patterns
- ✅ Uses `lib/auth/` directory for auth utilities
- ✅ Proper TypeScript types throughout
- ✅ Error handling implemented

### Security Notes

**Positive Security Practices:**
- ✅ Environment variables used (not hardcoded secrets)
- ✅ PII filtering in logger callbacks (`msal-browser.ts:31-32`, `msal-node.ts:27-28`)
- ✅ Proper error handling without exposing sensitive data
- ✅ Token validation with JWKS verification (proper signature verification)
- ✅ Token expiration checking
- ✅ Singleton pattern prevents multiple instance creation

**Security Concerns:**
- ⚠️ **Cache Location:** Uses `sessionStorage` instead of `memoryStorage`. Story notes prefer `memoryStorage` for better security (tokens not persisted to disk). Consider switching or document rationale.

**Recommendations:**
- Consider switching to `memoryStorage` for token caching (better security)
- Document rationale if `sessionStorage` is intentionally chosen over `memoryStorage`

### Best-Practices and References

**MSAL Best Practices:**
- ✅ Singleton pattern for MSAL instances (prevents multiple initializations)
- ✅ Proper client-side/server-side separation (`msal-browser.ts` vs `msal-node.ts`)
- ✅ Environment-based logging (verbose in dev, error in prod)
- ✅ PII filtering in logs
- ✅ Proper error handling

**Next.js Best Practices:**
- ✅ `NEXT_PUBLIC_` prefix for client-side environment variables
- ✅ Client component separation (`'use client'` directive)
- ✅ Proper SSR handling (MSAL instance only created on client)

**References:**
- [MSAL React Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-react)
- [MSAL Node Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-node)
- [Microsoft Entra External ID Setup Guide](https://learn.microsoft.com/en-us/azure/active-directory/external-identities/)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

### Action Items

**Code Changes Required:**

- [ ] [High] Create unit tests for MSAL configuration (`__tests__/unit/auth-config.test.ts`) (AC #1, #2, Task 6) [file: `__tests__/unit/auth-config.test.ts`]
  - Test MSAL React instance creation with valid config
  - Test MSAL React instance creation with missing environment variables
  - Test MSAL Node instance creation with valid config
  - Test MSAL Node instance creation with missing environment variables
  - Test environment variable loading

- [ ] [Medium] Consider switching cache location from `sessionStorage` to `memoryStorage` for better security (AC #1, Dev Notes) [file: `takeyourpills/lib/auth/msal-browser.ts:25`]
  - Current: `cacheLocation: 'sessionStorage'`
  - Recommended: `cacheLocation: 'memoryStorage'`
  - OR document rationale for using `sessionStorage` if intentionally chosen

- [ ] [Low] Document file structure decision (split `msal-browser.ts` and `msal-node.ts` vs single `msal.ts`) [file: `docs/sprint-artifacts/1-3-authentication-infrastructure-msal-configuration.md`]
  - Update story to reflect actual implementation
  - OR add note explaining architectural decision

**Advisory Notes:**

- Note: The split file architecture (`msal-browser.ts` and `msal-node.ts`) is actually a better design than a single file, as it enforces client/server separation. Consider updating the story to reflect this pattern.
- Note: The implementation includes a test endpoint (`app/api/test-msal/route.ts`) and test page (`app/test-msal/page.tsx`) for manual verification, which is helpful for development.
- Note: Token validation implementation is more complete than required by the story (full JWT verification with JWKS), which is excellent.
- Note: Consider adding validation to ensure required environment variables are present at application startup (fail fast pattern).

---

## Change Log

**2025-11-19:** Senior Developer Review notes appended. Status updated to "review". Outcome: Changes Requested.

