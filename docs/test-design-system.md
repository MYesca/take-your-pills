# System-Level Test Design - TakeYourPills

**Generated:** 2025-11-19  
**Project:** TakeYourPills  
**Project Type:** Web Application (Greenfield)  
**Mode:** System-Level Testability Review (Phase 3)

---

## Executive Summary

This document provides a comprehensive testability assessment of the TakeYourPills architecture and defines the testing strategy before implementation begins. The assessment evaluates controllability, observability, and reliability of the proposed system design, identifies architecturally significant requirements (ASRs), and recommends test levels and NFR testing approaches.

**Key Findings:**
- **Testability Rating:** PASS with minor recommendations
- **Primary Test Strategy:** 40% Unit, 30% Integration/API, 30% E2E
- **Critical Risks:** 4 high-priority risks identified (security, data isolation, timezone handling, CRON calculation accuracy)
- **Recommendations:** Establish test framework early, implement NFR testing infrastructure, prioritize security test coverage

---

## Testability Assessment

### Controllability: PASS with Recommendations

**Assessment:** The architecture provides good controllability for testing with some areas requiring attention.

**Strengths:**
- ✅ **Database Control:** Prisma ORM enables easy test database setup/teardown via migrations
- ✅ **API Isolation:** Next.js API routes can be tested in isolation with mock authentication
- ✅ **Dependency Injection Ready:** Utilities (CRON parser, timezone converter) are isolated in `lib/` directories, enabling easy mocking
- ✅ **External Service Mockability:** Microsoft Entra External ID authentication can be mocked via MSAL configuration for testing environments
- ✅ **Test Data Management:** Prisma's factory pattern can be used for test data generation

**Recommendations:**
- 🔧 **Authentication Testing:** Implement test authentication utilities that bypass MSAL in test environments
- 🔧 **Database Fixtures:** Create Prisma seed scripts and test factories for consistent test data
- 🔧 **CRON Calculation Control:** Consider dependency injection for `cron-parser` to enable deterministic time-based testing
- 🔧 **Timezone Testing:** Ensure timezone conversion utilities are testable with fixed time inputs

**Implementation Notes:**
- Use Prisma's test database URL environment variable for isolated test runs
- Implement MSAL mock configurations for development/testing environments
- Create test utilities for overriding timezone preferences in tests

---

### Observability: PASS with Recommendations

**Assessment:** The architecture defines observability patterns, but implementation details need validation.

**Strengths:**
- ✅ **Structured Logging:** Architecture defines JSON logging format with levels (error, warn, info, debug)
- ✅ **Error Handling:** Consistent error response format enables test assertion validation
- ✅ **API Response Metadata:** Structured API responses include metadata (timestamp, requestId) for traceability
- ✅ **Database Audit Trail:** `consumption_history` table stores timestamps enabling behavior verification
- ✅ **Status Indicators:** Visual UI states (consumed/pending) are testable via component state inspection

**Recommendations:**
- 🔧 **Logging Implementation:** Ensure logging is implemented consistently across all API routes before E2E testing
- 🔧 **Performance Metrics:** Implement performance monitoring hooks for NFR validation (dashboard load time, marking response time)
- 🔧 **Security Audit Logs:** Log all authentication attempts and authorization checks for security testing
- 🔧 **Test Observability:** Implement test-specific logging/debugging utilities for failure analysis

**Implementation Notes:**
- Add request correlation IDs to all API routes for test traceability
- Implement performance timing utilities for NFR validation
- Create test helpers for extracting and validating log outputs

---

### Reliability: PASS with Minor Concerns

**Assessment:** The architecture supports reliable testing, but parallel execution and state management need attention.

**Strengths:**
- ✅ **Stateless Design:** Token-based authentication (no server-side sessions) enables parallel test execution
- ✅ **Database Isolation:** User-based data filtering (`user_id`) enables test isolation
- ✅ **UTC Storage:** All timestamps in UTC prevent timezone-related test flakiness
- ✅ **Idempotent Operations:** Medication marking operations can be safely retried

**Minor Concerns:**
- ⚠️ **CRON Calculation Determinism:** Need to ensure CRON occurrence calculations are deterministic for test reproducibility
- ⚠️ **Timezone Edge Cases:** DST transitions and timezone changes could introduce flakiness - need explicit test coverage
- ⚠️ **Database State Management:** Test cleanup/disposal strategy needed to prevent test pollution

**Recommendations:**
- 🔧 **Test Isolation:** Use database transactions or test database reset between test suites
- 🔧 **Deterministic Time:** Use time mocking utilities (e.g., `date-fns` with fixed dates) for time-sensitive tests
- 🔧 **Parallel Test Safety:** Ensure all tests use unique user IDs to prevent cross-test contamination

**Implementation Notes:**
- Implement test database cleanup utilities (truncate tables or use transactions)
- Use test time utilities (mock current date/time) for CRON calculation tests
- Create test user factory that generates unique identifiers per test run

---

## Architecturally Significant Requirements (ASRs)

These are quality requirements from the PRD that drive architecture decisions and pose testability challenges.

### ASR-001: Microsoft Entra External ID Authentication (Security-Critical)

**Requirement:** NFR1 - All authentication must use OpenID Connect standard with Microsoft Entra External ID

**Architecture Impact:**
- Drives use of MSAL React (frontend) and MSAL Node (backend)
- Requires OAuth flow implementation
- Token-based authentication (no session storage)

**Testability Challenges:**
- External dependency on Microsoft Entra service
- OAuth redirect flow complexity
- Token validation requires mock infrastructure

**Risk Score:** 6 (Probability: 2, Impact: 3)
- **Probability:** Medium - OAuth flows are complex, integration testing requires careful setup
- **Impact:** Critical - Authentication failure blocks all user access

**Mitigation Strategy:**
- Mock MSAL configuration for unit/integration tests
- Use test authentication utilities that bypass OAuth in test environments
- Implement E2E tests with test Azure AD tenant or OAuth flow mocks
- Security audit: Validate token validation logic independently

**Testing Approach:**
- **Unit:** Mock MSAL authentication, test token extraction utilities
- **Integration:** Test API route authentication middleware with mock tokens
- **E2E:** Test full OAuth flow with test Azure AD tenant (Playwright with OAuth mocking)

**Owner:** Dev + QA  
**Timeline:** Implement in Epic 2 (User Authentication)

---

### ASR-002: Data Isolation Per User (Security-Critical)

**Requirement:** NFR19, NFR20 - All user medication data must be completely isolated per user account

**Architecture Impact:**
- All database queries MUST filter by `user_id`
- No cross-user access allowed (even for administrators in MVP)
- Foreign key constraints ensure referential integrity

**Testability Challenges:**
- Proving absence of cross-user data leaks
- Testing authorization boundaries comprehensively
- Validating all API routes enforce user_id filtering

**Risk Score:** 9 (Probability: 3, Impact: 3)
- **Probability:** High - Data isolation bugs are common in multi-tenant systems
- **Impact:** Critical - Data breach violates HIPAA-aligned practices, patient safety concern

**Mitigation Strategy:**
- Implement authorization test suite covering all API routes
- Create negative tests: Attempt to access other users' data, verify 403/404 responses
- Database-level testing: Verify all queries include user_id filter
- Code review checklist: Validate user_id filtering in all data access code

**Testing Approach:**
- **Unit:** Test Prisma query builders enforce user_id filtering
- **Integration:** Negative authorization tests for all API routes (attempt cross-user access)
- **E2E:** Test complete user isolation scenarios (create two users, verify data separation)

**Owner:** Dev + QA + Security Review  
**Timeline:** Implement across all epics, validate in Epic 2 (Authentication)

---

### ASR-003: Sub-500ms Medication Marking Response (Performance-Critical)

**Requirement:** NFR9 - Medication marking interaction must respond in less than 500ms

**Architecture Impact:**
- Drives optimistic UI updates pattern
- Requires efficient API endpoint design
- Database write operations must be fast

**Testability Challenges:**
- Measuring sub-500ms response requires performance test infrastructure
- Optimistic UI updates complicate failure scenario testing
- Network latency simulation needed for realistic testing

**Risk Score:** 6 (Probability: 2, Impact: 3)
- **Probability:** Medium - Performance targets can be missed without careful optimization
- **Impact:** Critical - User experience requirement, affects product perception

**Mitigation Strategy:**
- Implement performance test suite for medication marking API
- Load testing: Validate API performance under concurrent user load
- E2E performance testing: Measure actual UI update time with Playwright timing
- Monitoring: Implement performance metrics collection for production validation

**Testing Approach:**
- **Unit:** Test API route performance with timing utilities (should complete <100ms server-side)
- **Integration:** Load testing medication marking endpoint (k6 or similar)
- **E2E:** Measure checkbox click to UI update time (Playwright performance timing)

**Owner:** Dev + Performance Engineer  
**Timeline:** Validate in Epic 4 (Daily Medication Tracking)

---

### ASR-004: CRON-Based Medication Scheduling with Timezone Awareness (Business Logic-Critical)

**Requirement:** FR16-FR18, FR42-FR46 - System calculates medication occurrences from CRON expressions with user timezone preferences

**Architecture Impact:**
- Requires `cron-parser` library integration
- UTC storage with user timezone conversion
- Complex date/time calculation logic

**Testability Challenges:**
- CRON expression validation and calculation correctness
- Timezone conversion accuracy (DST transitions, timezone changes)
- Edge cases: Timezone boundaries, midnight crossings, multiple timezones

**Risk Score:** 9 (Probability: 3, Impact: 3)
- **Probability:** High - Date/time logic is notoriously error-prone, especially with timezones
- **Impact:** Critical - Incorrect medication scheduling could lead to missed doses or medication errors (patient safety)

**Mitigation Strategy:**
- Comprehensive unit test suite for CRON calculation utilities
- Timezone conversion test matrix: Test all IANA timezones, DST transitions, edge cases
- Integration tests: Validate today's medication calculation for various schedules
- E2E tests: Verify dashboard displays correct medications at correct times for different timezones

**Testing Approach:**
- **Unit:** Test CRON parser with various expressions, test timezone converter with DST scenarios
- **Integration:** Test today's medication calculation API with fixed dates and multiple timezones
- **E2E:** Test dashboard display for users in different timezones (mock timezone preferences)

**Owner:** Dev + QA  
**Timeline:** Implement in Epic 4 (Daily Medication Tracking) and Epic 6 (Timezone Configuration)

---

### ASR-005: Optimistic UI Updates with Error Handling (User Experience-Critical)

**Requirement:** Architecture decision (ADR-005) - Optimistic UI updates for <500ms response time

**Architecture Impact:**
- Frontend updates UI immediately before API confirmation
- Requires rollback logic on API failure
- React Query mutations with optimistic updates

**Testability Challenges:**
- Testing optimistic update rollback on failure
- Verifying UI never gets stuck in incorrect state
- Network failure simulation for realistic error testing

**Risk Score:** 4 (Probability: 2, Impact: 2)
- **Probability:** Medium - Optimistic updates can introduce UI inconsistency bugs
- **Impact:** Degraded - Affects user experience, but workaround exists (refresh page)

**Mitigation Strategy:**
- E2E tests: Verify optimistic update behavior (success and failure scenarios)
- Error simulation: Test network failures, API errors, timeout scenarios
- State validation: Verify UI state consistency after API failures

**Testing Approach:**
- **E2E:** Test medication marking with network failure simulation (Playwright route interception)
- **Component:** Test React Query optimistic update hooks with error scenarios

**Owner:** Frontend Dev + QA  
**Timeline:** Validate in Epic 4 (Daily Medication Tracking)

---

## Test Levels Strategy

Based on the Next.js web application architecture with API routes and React frontend:

### Recommended Split: 40% Unit / 30% Integration-API / 30% E2E

**Rationale:**
- **Unit (40%):** High business logic complexity (CRON calculations, timezone conversions, validation schemas) benefits from fast, isolated unit tests
- **Integration-API (30%):** Next.js API routes can be tested efficiently without full browser, good balance of speed and coverage
- **E2E (30%):** User-facing medication tracking requires E2E validation of critical paths (marking medications, viewing dashboard, authentication flow)

### Unit Testing (40%)

**Scope:**
- CRON parsing and calculation utilities (`lib/cron/parser.ts`, `lib/cron/calculator.ts`)
- Timezone conversion utilities (`lib/timezone/converter.ts`)
- Validation schemas (`lib/validations/schemas.ts`)
- Business logic functions
- React hooks (medication data fetching, consumption tracking)
- React components (isolated, with testing-library)

**Framework:** Vitest  
**Location:** Co-located with source files (`*.test.ts`, `*.spec.ts`)

**Coverage Target:** 80% for business logic, 60% for utilities

---

### Integration/API Testing (30%)

**Scope:**
- Next.js API routes (authentication, medications, consumption, reports)
- Database operations (Prisma queries with test database)
- Authentication middleware (token validation, user extraction)
- API contract validation (request/response schemas)

**Framework:** Vitest + test database  
**Location:** `__tests__/integration/` or `__tests__/api/`

**Coverage Target:** All API routes, authentication flows

**Test Environment:** Local test database (PostgreSQL), MSAL mocked

---

### E2E Testing (30%)

**Scope:**
- Critical user journeys:
  - User authentication flow (Microsoft Entra login)
  - Medication registration with schedule
  - Daily medication marking (dashboard checkbox interaction)
  - Adherence report viewing
  - Timezone preference configuration
- Cross-browser compatibility (Chrome, Firefox, Safari)

**Framework:** Playwright  
**Location:** `e2e/` or `tests/e2e/`

**Coverage Target:** All critical user paths (P0 and P1 scenarios)

**Test Environment:** Local development server or staging environment

---

## NFR Testing Approach

### Security Testing

**Requirements:** NFR1-NFR7, OWASP Top 10 protection

**Testing Approach:**
- **Authentication Tests (E2E):**
  - Test Microsoft Entra OAuth flow (Playwright)
  - Test token validation on API routes
  - Test session timeout behavior
- **Authorization Tests (Integration + E2E):**
  - Test data isolation (attempt cross-user access) - CRITICAL
  - Test protected routes (redirect to login when unauthenticated)
  - Test API route authorization (all routes require authentication)
- **Security Vulnerability Tests:**
  - Input validation tests (SQL injection attempts, XSS attempts)
  - OWASP Top 10 checklist validation
  - Security headers validation (HTTPS, CSP, etc.)

**Tools:**
- Playwright for E2E security flows
- Manual security audit checklist
- OWASP ZAP (optional, for vulnerability scanning)

**Test Coverage:** All authentication/authorization flows, all user input validation points

---

### Performance Testing

**Requirements:** NFR8-NFR11

**Performance Targets:**
- Dashboard load: < 2 seconds (NFR8)
- Medication marking: < 500ms (NFR9)
- Adherence report: < 3 seconds for typical data (NFR10)
- Responsive design: Mobile and desktop viewports (NFR11)

**Testing Approach:**
- **API Performance (Integration):**
  - Load testing medication marking endpoint (target: <100ms server-side)
  - Dashboard data retrieval performance (CRON calculation efficiency)
  - Adherence report generation performance
- **E2E Performance (Playwright):**
  - Measure dashboard load time (first paint to interactive)
  - Measure medication marking response time (checkbox click to UI update)
  - Measure report page load time
  - Lighthouse performance audits (mobile and desktop)

**Tools:**
- k6 or Artillery for API load testing
- Playwright performance timing API
- Lighthouse CI for performance audits

**Test Coverage:** All performance-critical user paths (dashboard, marking, reports)

---

### Reliability Testing

**Requirements:** System reliability, error handling, data consistency

**Testing Approach:**
- **Error Handling Tests (Integration + E2E):**
  - Test API error responses (400, 401, 403, 404, 500)
  - Test optimistic UI update rollback on API failure
  - Test network failure scenarios
- **Data Consistency Tests (Integration):**
  - Test CRON calculation consistency (same input, same output)
  - Test timezone conversion consistency (DST transitions)
  - Test database transaction integrity (CASCADE deletes)
- **Resilience Tests:**
  - Test system behavior under database connection failures
  - Test authentication service unavailability handling

**Tools:**
- Vitest for integration tests
- Playwright route interception for network failure simulation

**Test Coverage:** All error paths, critical data operations

---

### Maintainability Testing

**Requirements:** Code quality, test coverage, documentation

**Testing Approach:**
- **Code Quality Gates:**
  - ESLint checks (CI pipeline)
  - TypeScript type checking (strict mode)
  - Code coverage thresholds (80% for business logic)
- **Test Quality:**
  - Test coverage reports (unit, integration, E2E)
  - Flaky test detection (retry logic, test stability monitoring)
- **Documentation:**
  - API documentation validation
  - Test documentation (README in tests/ directory)

**Tools:**
- ESLint, TypeScript compiler
- Coverage tools (Vitest coverage, Playwright coverage)
- CI/CD pipeline (GitHub Actions)

**Test Coverage:** All code quality gates, coverage thresholds

---

## Test Environment Requirements

### Local Development Environment

**Infrastructure:**
- Node.js 20+ (LTS)
- PostgreSQL 15+ (external server for local development)
- Next.js development server (`npm run dev`)

**Test Tools:**
- Vitest for unit/integration tests
- Playwright for E2E tests
- Test database (separate from dev database)

**Configuration:**
- `.env.test.local` - Test environment variables
- Test database URL (separate PostgreSQL database)
- MSAL mock configuration for test authentication

---

### CI/CD Environment

**Infrastructure:**
- GitHub Actions (or similar CI platform)
- PostgreSQL test database (containerized or managed)
- Test environment deployment (optional, for E2E)

**Test Execution:**
- Unit tests: Run on every commit (fast feedback)
- Integration tests: Run on PR to main
- E2E tests: Run on PR to main (or nightly)
- Performance tests: Run on schedule (nightly or weekly)

**Configuration:**
- CI environment variables (test database URL, Azure AD test tenant)
- Test parallelization (unit tests in parallel, E2E tests serial or limited parallel)
- Test reporting (coverage reports, test results artifacts)

---

### Staging Environment (Optional, Future)

**Infrastructure:**
- Staging deployment (Vercel or similar)
- Staging PostgreSQL database
- Test Azure AD tenant (for authentication testing)

**Test Execution:**
- Full E2E test suite (production-like environment)
- Performance tests (realistic network conditions)
- Security penetration testing (optional)

---

## Testability Concerns

### Minor Concerns (Non-Blocking)

1. **CRON Calculation Determinism:**
   - **Concern:** CRON occurrence calculations may vary based on current time, making tests non-deterministic
   - **Impact:** Low - Can be addressed with time mocking utilities
   - **Recommendation:** Use fixed date/time mocking in CRON calculation tests

2. **Timezone Edge Cases:**
   - **Concern:** DST transitions and timezone changes could introduce test flakiness
   - **Impact:** Medium - Needs explicit test coverage but architecture handles it correctly
   - **Recommendation:** Create comprehensive timezone test matrix covering DST transitions

3. **OAuth Flow Testing Complexity:**
   - **Concern:** Full OAuth flow testing requires test Azure AD tenant setup
   - **Impact:** Low - Can be mocked for most tests, E2E can use test tenant
   - **Recommendation:** Use MSAL mock configuration for unit/integration tests, test tenant for E2E

### No Critical Blockers Identified

The architecture is well-designed for testability. All concerns are addressable with standard testing practices and utilities.

---

## Recommendations for Sprint 0 / Test Framework Setup

### Immediate Actions (Before Implementation Begins)

1. **Initialize Test Framework (`*framework` workflow):**
   - Set up Vitest for unit/integration testing
   - Set up Playwright for E2E testing
   - Create test directory structure (`tests/e2e/`, `tests/support/`, etc.)
   - Configure test database connection

2. **Implement Test Authentication Utilities:**
   - Create MSAL mock configuration for test environments
   - Implement test authentication helpers (bypass OAuth in tests)
   - Create test user factory utilities

3. **Create Test Data Infrastructure:**
   - Implement Prisma test factories (user, medication, consumption)
   - Create test database seed scripts
   - Implement test database cleanup utilities (transactions or truncate)

4. **Set Up CI/CD Test Pipeline (`*ci` workflow):**
   - Configure GitHub Actions (or similar) for test execution
   - Set up test database in CI environment
   - Configure test reporting and coverage collection

### Medium-Term Actions (During Early Epics)

5. **Implement Time Mocking Utilities:**
   - Create test time utilities for fixed date/time testing
   - Implement timezone override utilities for tests

6. **Create Performance Testing Infrastructure:**
   - Set up k6 or Artillery for API load testing
   - Implement Playwright performance timing utilities
   - Create performance test baseline measurements

7. **Implement Security Testing Utilities:**
   - Create authorization test helpers (negative tests for cross-user access)
   - Set up OWASP security audit checklist validation

### Long-Term Actions (As Needed)

8. **Set Up Test Environment Monitoring:**
   - Implement test stability monitoring (flaky test detection)
   - Set up test performance tracking (test execution time trends)

---

## Summary

The TakeYourPills architecture demonstrates strong testability characteristics with good controllability, observability, and reliability foundations. The primary testing strategy balances unit tests for business logic, integration tests for API contracts, and E2E tests for critical user journeys.

**Key Recommendations:**
1. **Prioritize Security Testing:** Data isolation and authentication are critical - implement comprehensive authorization tests early
2. **Establish Test Framework Early:** Set up test infrastructure (Vitest, Playwright) before implementation begins
3. **Focus on Business Logic Testing:** CRON calculations and timezone conversions require extensive unit test coverage
4. **Implement Performance Testing:** Validate sub-500ms medication marking requirement with performance tests
5. **Create Test Data Infrastructure:** Prisma factories and test utilities are essential for maintainable tests

**Next Steps:**
1. Run `*framework` workflow to initialize test framework
2. Run `*ci` workflow to set up CI/CD test pipeline
3. Begin implementation with test-driven approach (TDD recommended for critical business logic)

---

**Document Status:** Complete  
**Ready for:** Implementation phase (Epic 1: Foundation & Project Setup)

