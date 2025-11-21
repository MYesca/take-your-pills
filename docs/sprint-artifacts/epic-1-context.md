# Epic Technical Specification: Foundation & Project Setup

Date: 2025-11-19
Author: Yesca
Epic ID: 1
Status: Draft

---

## Overview

Epic 1 establishes the foundational infrastructure, development environment, and core dependencies required for the TakeYourPills medication tracking application. This epic is critical as it sets up the project structure, database schema, authentication infrastructure, and development tooling that all subsequent epics depend upon.

The epic includes four stories covering project initialization, database setup with Prisma, Microsoft Entra External ID authentication configuration, and development environment tooling. While this epic doesn't deliver direct user-facing value, it's an essential prerequisite that enables all user-facing features in later epics. The foundation must be solid, as architectural decisions made here (technology stack, project structure, development workflows) will impact the entire application lifecycle.

**Reference Context:**
- PRD Sections: Project Classification, Technical Preferences, Domain-Specific Requirements
- Architecture Sections: Project Initialization, Technology Stack, Development Environment
- Related Epics: All subsequent epics depend on Epic 1 completion

---

## Objectives and Scope

### In Scope

**Story 1.1: Project Initialization and Core Dependencies**
- Initialize Next.js 15 project with TypeScript and Tailwind CSS
- Install all core dependencies (Prisma, MSAL, CRON libraries, date utilities, validation, data fetching)
- Configure shadcn/ui component library
- Set up environment variable templates
- Verify development server runs successfully

**Story 1.2: Database Schema and Prisma Setup**
- Initialize Prisma with PostgreSQL datasource
- Define complete database schema (User, Medication, ConsumptionHistory models)
- Create initial database migration
- Generate Prisma Client
- Set up Prisma Client singleton pattern

**Story 1.3: Authentication Infrastructure (MSAL Configuration)**
- Configure MSAL React for frontend authentication
- Configure MSAL Node for backend token validation
- Set up environment variables for Azure configuration
- Create MSAL provider wrapper for application
- Implement token validation utilities

**Story 1.4: Development Environment and Tooling**
- Configure ESLint with Next.js and TypeScript rules
- Set up Vitest for unit and integration testing
- Configure TypeScript strict mode
- Set up .gitignore and .env.example
- Document all development scripts

### Out of Scope

- Actual user authentication flows (covered in Epic 2)
- User-facing features (all in later epics)
- Production deployment setup (future epic)
- CI/CD pipeline configuration (future consideration)
- Database seeding with test data (future story if needed)

---

## System Architecture Alignment

**Technology Stack Alignment:**
- **Frontend Framework:** Next.js 15 App Router (from Architecture decision table)
- **Language:** TypeScript 5.x (Architecture requirement)
- **Styling:** Tailwind CSS 3.x (UX Design + Architecture)
- **Component Library:** shadcn/ui (UX Design specification)
- **Database:** PostgreSQL 15+ with Prisma ORM (Architecture ADR-002)
- **Authentication:** Microsoft Entra External ID via MSAL (Architecture ADR-006, PRD requirement)

**Project Structure Alignment:**
Epic 1 establishes the project structure defined in Architecture document:
- `app/` directory for Next.js App Router routes
- `components/` for reusable UI components
- `lib/` for utilities, API clients, and shared code
- `prisma/` for database schema and migrations
- `__tests__/` for test files

**Integration Points:**
- Prisma schema provides data models for all future epics
- MSAL configuration enables Epic 2 authentication flows
- Development tooling supports quality standards throughout implementation
- Project initialization command from Architecture document: `npx create-next-app@latest takeyourpills --typescript --tailwind --app --no-src-dir`

**Architectural Constraints:**
- Must use external PostgreSQL server for local development (Architecture requirement)
- All times stored in UTC (Architecture pattern)
- User ID filtering required on all database queries (Architecture security pattern)
- TypeScript strict mode enabled (Architecture quality standard)

---

## Detailed Design

### Services and Modules

**Project Initialization Module (Story 1.1):**
- **Responsibility:** Set up Next.js project structure and install dependencies
- **Inputs:** None (greenfield project)
- **Outputs:** Initialized project with all dependencies installed
- **Owner:** Development team

**Database Schema Module (Story 1.2):**
- **Responsibility:** Define and migrate database schema
- **Inputs:** External PostgreSQL connection string
- **Outputs:** Database tables created, Prisma Client generated
- **Owner:** Backend developer
- **Key Models:**
  - User (id, externalId, email, timezone, timestamps)
  - Medication (id, userId, name, cronExpression, timestamps)
  - ConsumptionHistory (id, medicationId, userId, scheduledTime, consumedAt, timestamps)

**Authentication Infrastructure Module (Story 1.3):**
- **Responsibility:** Configure MSAL for frontend and backend
- **Inputs:** Azure credentials (client ID, secret, tenant ID)
- **Outputs:** MSAL instances configured, auth utilities ready
- **Owner:** Full-stack developer
- **Components:**
  - Frontend: MSAL React configuration (`lib/auth/msal.ts`)
  - Backend: MSAL Node configuration for token validation
  - Provider: MSAL React provider wrapper (`app/layout.tsx`)

**Development Tooling Module (Story 1.4):**
- **Responsibility:** Configure linting, testing, and code quality tools
- **Inputs:** Project structure from Story 1.1
- **Outputs:** ESLint config, Vitest config, TypeScript strict mode, Git setup
- **Owner:** Development team

---

### Data Models and Contracts

**Prisma Schema Models:**

```prisma
// prisma/schema.prisma

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

model Medication {
  id            String    @id @default(uuid())
  userId        String    @map("user_id")
  name          String    @db.VarChar(255)
  cronExpression String   @map("cron_expression") @db.VarChar(255)
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  user              User                 @relation(fields: [userId], references: [id], onDelete: Cascade)
  consumptionHistory ConsumptionHistory[]
  
  @@unique([userId, name])
  @@map("medications")
  @@index([userId])
  @@index([userId, createdAt])
}

model ConsumptionHistory {
  id            String    @id @default(uuid())
  medicationId  String    @map("medication_id")
  userId        String    @map("user_id")
  scheduledTime DateTime  @map("scheduled_time")  // UTC
  consumedAt    DateTime  @map("consumed_at")      // UTC
  createdAt     DateTime  @default(now()) @map("created_at")
  
  medication  Medication @relation(fields: [medicationId], references: [id], onDelete: Cascade)
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([medicationId, scheduledTime])
  @@map("consumption_history")
  @@index([userId])
  @@index([medicationId])
  @@index([scheduledTime])
  @@index([userId, scheduledTime])
}
```

**Data Model Relationships:**
- User 1:N Medications (one user has many medications)
- User 1:N ConsumptionHistory (one user has many consumption records)
- Medication 1:N ConsumptionHistory (one medication has many consumption records)

**Data Isolation Pattern:**
- All database queries MUST filter by `user_id` to enforce data isolation
- Foreign key constraints ensure referential integrity
- CASCADE deletes: Deleting user deletes all their medications and consumption history

---

### APIs and Interfaces

**No API endpoints in Epic 1** - This epic sets up infrastructure only. API routes will be created in Epic 2 and beyond.

**Prisma Client Interface:**
- Location: `lib/prisma/client.ts`
- Pattern: Singleton instance to prevent multiple Prisma Client instances
- Usage: Import and use across all API routes and data access code

**MSAL Configuration Interface:**
- Frontend: `lib/auth/msal.ts` exports MSAL instance and configuration
- Backend: MSAL Node configuration for token validation (used in Epic 2)
- Environment Variables: All Azure configuration via environment variables

---

### Workflows and Sequencing

**Story Execution Sequence:**

```
1. Story 1.1: Project Initialization
   └─> Creates project structure
   └─> Installs all dependencies
   └─> Sets up shadcn/ui
   
2. Story 1.2: Database Schema (depends on 1.1)
   └─> Initializes Prisma
   └─> Defines schema models
   └─> Creates migration
   └─> Generates Prisma Client
   
3. Story 1.3: Authentication Infrastructure (depends on 1.1)
   └─> Configures MSAL React
   └─> Configures MSAL Node
   └─> Sets up environment variables
   
4. Story 1.4: Development Tooling (depends on 1.1)
   └─> Configures ESLint
   └─> Sets up Vitest
   └─> Configures TypeScript
   └─> Sets up Git
```

**Parallelization Opportunities:**
- Stories 1.2, 1.3, and 1.4 can potentially be worked in parallel after Story 1.1 completes
- However, recommended sequence above ensures clear dependencies and easier troubleshooting

**Data Flow (Future Context):**
- Story 1.2 establishes database schema that Epic 2 will use for user records
- Story 1.3 sets up authentication that Epic 2 will use for login flows
- Story 1.4 establishes development standards that all future stories will follow

---

## Non-Functional Requirements

### Performance

**Epic 1 Performance Targets:**
- Project initialization completes without errors
- Database schema migration completes in < 30 seconds for initial setup
- Prisma Client generation completes in < 10 seconds
- Development server starts in < 5 seconds

**Future Performance Targets (from PRD NFR8-NFR11):**
- Dashboard load: < 2 seconds (Epic 4)
- Medication marking: < 500ms (Epic 4)
- Report generation: < 3 seconds (Epic 5)
- Responsive UI (all epics)

**Architecture Support:**
- Next.js 15 provides built-in optimizations (code splitting, SSR)
- Prisma query optimization through indexes (Story 1.2)
- Database indexes defined for efficient queries (user_id, medication_id, scheduled_time)

---

### Security

**Authentication Infrastructure Security (Story 1.3):**
- MSAL configuration uses secure OAuth 2.0 / OpenID Connect flows
- Tokens stored in-memory (not localStorage) per MSAL best practices
- Environment variables for sensitive credentials (not committed to git)
- HTTPS required in production (enforced by deployment platform)

**Database Security (Story 1.2):**
- Connection string stored in environment variables
- PostgreSQL connection uses TLS/SSL (managed by hosting provider)
- Database credentials never committed to version control
- Row-level security via user_id filtering (architectural pattern)

**Development Environment Security (Story 1.4):**
- .gitignore excludes sensitive files (.env.local, node_modules, etc.)
- .env.example documents required variables without values
- No secrets in code or configuration files

**PRD Security Requirements Addressed:**
- NFR1: OpenID Connect with Microsoft Entra External ID (Story 1.3)
- NFR2: TLS 1.2+ (handled by deployment platform, Epic 1 sets foundation)
- NFR3: Encryption at rest (managed by PostgreSQL hosting provider)
- NFR4: Secure session management (Epic 2 implementation, Epic 1 provides infrastructure)
- NFR5: Authentication/authorization checks (Epic 2 implementation, Epic 1 provides infrastructure)
- NFR6: HIPAA-aligned practices (architectural patterns established in Epic 1)
- NFR7: OWASP Top 10 protection (development practices in Story 1.4, runtime protection in later epics)

---

### Reliability/Availability

**Database Reliability:**
- External PostgreSQL server provides managed reliability
- Connection pooling via Prisma (handles connection management)
- Migration rollback capability (Prisma migration system)

**Development Environment Reliability:**
- Consistent tooling configuration across team members
- Version-controlled configurations (ESLint, TypeScript, etc.)
- Reproducible setup via documented commands

**Future Availability Requirements:**
- High availability (Epic 1 doesn't address this, but sets foundation)
- Database backups (managed by PostgreSQL hosting provider)
- Error handling patterns (established in Story 1.4, implemented in later epics)

---

### Observability

**Development-Time Observability (Story 1.4):**
- ESLint provides code quality visibility
- TypeScript provides type error visibility
- Vitest provides test results visibility

**Runtime Observability (Future Stories):**
- Structured logging pattern (defined in Architecture, implemented in later epics)
- Error tracking setup (future story or deployment phase)
- Performance monitoring (future consideration)

**Logging Strategy (From Architecture):**
- Structured JSON logging format
- Log levels: error, warn, info, debug
- Context includes: userId, requestId, endpoint (when applicable)
- Implementation deferred to Epic 2+ when API routes are created

---

## Dependencies and Integrations

### Core Dependencies

**Next.js and React Ecosystem:**
- `next@^15.0.0` - React framework with App Router
- `react@^18.0.0` - React library
- `react-dom@^18.0.0` - React DOM renderer
- `typescript@^5.0.0` - TypeScript language

**Styling:**
- `tailwindcss@^3.0.0` - Utility-first CSS framework
- `@tailwindcss/typography` - Typography plugin (if needed)
- `autoprefixer@^10.0.0` - CSS vendor prefixing
- `postcss@^8.0.0` - CSS processing

**Component Library:**
- `shadcn/ui` components (installed via CLI, continuously updated)
- `@radix-ui/*` - Radix UI primitives (installed automatically with shadcn/ui)
- `class-variance-authority` - Variant management for shadcn/ui
- `clsx` - Conditional class names
- `tailwind-merge` - Tailwind class merging

**Database:**
- `@prisma/client@latest` - Prisma ORM client
- `prisma@latest` - Prisma CLI for migrations and generation
- `pg` - PostgreSQL driver (installed automatically by Prisma)

**Authentication:**
- `@azure/msal-react@latest` - MSAL React library for frontend
- `@azure/msal-node@latest` - MSAL Node library for backend
- `@azure/msal-browser@latest` - MSAL Browser library (dependency of msal-react)

**Scheduling and Time:**
- `cron-parser@latest` - CRON expression parsing and calculation
- `node-cron@latest` - CRON job scheduling (for future reminders)
- `date-fns@latest` - Date utility library
- `date-fns-tz@latest` - Timezone support for date-fns

**Data Fetching and Validation:**
- `@tanstack/react-query@latest` - Data fetching, caching, and synchronization
- `zod@latest` - Runtime validation and type inference

**Development Dependencies:**
- `@types/node` - TypeScript types for Node.js
- `@types/react` - TypeScript types for React
- `@types/react-dom` - TypeScript types for React DOM
- `@types/node-cron` - TypeScript types for node-cron
- `vitest@latest` - Unit and integration testing framework
- `@testing-library/react@latest` - React component testing utilities
- `@testing-library/jest-dom@latest` - DOM testing matchers
- `@playwright/test@latest` - E2E testing framework (future use)
- `eslint@latest` - Linting tool
- `eslint-config-next@latest` - Next.js ESLint configuration

### External Services

**Microsoft Entra External ID:**
- Identity provider for user authentication
- Requires Azure account setup
- Configuration via environment variables:
  - `AZURE_CLIENT_ID`
  - `AZURE_CLIENT_SECRET`
  - `AZURE_TENANT_ID`
  - `AZURE_REDIRECT_URI`

**External PostgreSQL Server:**
- Database hosting (for local development)
- Connection via `DATABASE_URL` environment variable
- Format: `postgresql://user:password@host:port/database`

### Integration Points

**Story 1.1 → Story 1.2:**
- Project structure enables Prisma initialization
- Installed Prisma packages enable schema definition

**Story 1.1 → Story 1.3:**
- Project structure enables MSAL configuration files
- Installed MSAL packages enable authentication setup

**Story 1.1 → Story 1.4:**
- Project structure enables tooling configuration
- Installed dev dependencies enable ESLint, Vitest setup

**Epic 1 → Epic 2:**
- MSAL infrastructure (Story 1.3) enables user authentication (Epic 2)
- Database schema (Story 1.2) provides User model for authentication

**Epic 1 → Epic 3:**
- Database schema (Story 1.2) provides Medication model
- Project structure enables medication management pages

**Epic 1 → All Future Epics:**
- Project structure, database schema, and development tooling are foundations for all features

---

## Acceptance Criteria (Authoritative)

**AC1: Project Initialization (Story 1.1)**
Given a clean directory
When I run `npx create-next-app@latest takeyourpills --typescript --tailwind --app --no-src-dir`
Then Next.js 15 project is created with App Router structure, TypeScript configuration, and Tailwind CSS configuration

And when I install additional dependencies from architecture document
Then all required packages are installed and project structure matches architecture specification

And when I initialize shadcn/ui
Then shadcn/ui is configured with Tailwind CSS and components can be installed

And when I run `npm run dev`
Then development server starts successfully without errors

**AC2: Database Schema Setup (Story 1.2)**
Given project is initialized
When I run `npx prisma init`
Then Prisma is configured with PostgreSQL datasource and DATABASE_URL template

And when I define Prisma schema with User, Medication, and ConsumptionHistory models
Then schema includes all required fields, relationships, unique constraints, and indexes as specified in architecture

And when I run `npx prisma migrate dev --name init`
Then initial migration is created and applied to external PostgreSQL database

And when I run `npx prisma generate`
Then Prisma Client is generated and can be imported successfully

And when I create `lib/prisma/client.ts` with singleton pattern
Then Prisma Client instance is accessible across the application

**AC3: Authentication Infrastructure (Story 1.3)**
Given project is initialized
When I configure MSAL React
Then `lib/auth/msal.ts` exports MSAL instance with Azure configuration from environment variables

And when I configure MSAL Node
Then backend token validation utilities are ready for Epic 2 implementation

And when I set up MSAL provider wrapper
Then `app/layout.tsx` wraps application with MSAL provider component

And when environment variables are configured
Then AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID, AZURE_REDIRECT_URI are available (not committed to git)

**AC4: Development Tooling (Story 1.4)**
Given project is initialized
When I configure ESLint
Then `.eslintrc.json` exists with Next.js and TypeScript rules, and `npm run lint` works

And when I configure Vitest
Then `vitest.config.ts` exists with React testing library configuration, and `npm test` works

And when I configure TypeScript
Then `tsconfig.json` has strict mode enabled and `npm run type-check` works

And when I configure Git
Then `.gitignore` excludes sensitive files and `.env.example` documents all required environment variables

---

## Traceability Mapping

| Acceptance Criteria | Spec Section | Component/API | Test Idea |
|---------------------|--------------|---------------|-----------|
| AC1: Project Initialization | Story 1.1 | Project root, package.json, Next.js config | Verify project structure exists, dependencies installed, dev server starts |
| AC1: shadcn/ui Setup | Story 1.1 | components.json, shadcn/ui CLI | Verify shadcn/ui initialized, test component installation |
| AC2: Prisma Init | Story 1.2 | prisma/schema.prisma, DATABASE_URL | Verify Prisma config file created |
| AC2: Schema Definition | Story 1.2 | prisma/schema.prisma | Verify all models, fields, relationships, constraints defined correctly |
| AC2: Migration | Story 1.2 | prisma/migrations/, database tables | Verify migration created, tables exist in database, schema matches models |
| AC2: Prisma Client | Story 1.2 | lib/prisma/client.ts | Verify Prisma Client generated, singleton pattern works, can query database |
| AC3: MSAL React Config | Story 1.3 | lib/auth/msal.ts | Verify MSAL instance created, configuration loaded from env vars |
| AC3: MSAL Node Config | Story 1.3 | lib/auth/msal.ts (Node export) | Verify MSAL Node configuration ready for token validation |
| AC3: Provider Wrapper | Story 1.3 | app/layout.tsx | Verify MSAL provider wraps application correctly |
| AC3: Environment Variables | Story 1.3 | .env.local, .env.example | Verify Azure env vars exist, documented in .env.example |
| AC4: ESLint Config | Story 1.4 | .eslintrc.json | Verify ESLint config exists, linting works, no errors in project |
| AC4: Vitest Config | Story 1.4 | vitest.config.ts | Verify Vitest config exists, test command works, example test runs |
| AC4: TypeScript Config | Story 1.4 | tsconfig.json | Verify TypeScript strict mode, type checking works, no type errors |
| AC4: Git Config | Story 1.4 | .gitignore, .env.example | Verify .gitignore excludes sensitive files, .env.example documents variables |

---

## Risks, Assumptions, Open Questions

### Risks

**R1: External PostgreSQL Server Availability**
- **Risk:** External PostgreSQL server may not be available or configured incorrectly
- **Impact:** High - Blocks Story 1.2 completion
- **Mitigation:** Verify database connection before starting Story 1.2, provide clear connection string format in documentation

**R2: Azure Credentials Setup**
- **Risk:** Microsoft Entra External ID may not be configured or credentials may be incorrect
- **Impact:** Medium - Blocks Story 1.3 completion
- **Mitigation:** Document Azure setup requirements, verify credentials before starting Story 1.3

**R3: Dependency Version Conflicts**
- **Risk:** Package version conflicts may arise during installation
- **Impact:** Medium - May block Story 1.1 completion
- **Mitigation:** Use exact versions from architecture document, test installation in clean environment

**R4: Database Migration Failures**
- **Risk:** Initial migration may fail due to database permissions or existing schema
- **Impact:** High - Blocks Story 1.2 completion
- **Mitigation:** Verify database permissions, ensure clean database for initial migration, provide rollback instructions

### Assumptions

**A1: External PostgreSQL Server Access**
- Assumption: User has access to external PostgreSQL server for local development
- Validation: Verify connection string works before Story 1.2
- **Status:** Confirmed by user (architecture document states external PostgreSQL for local dev)

**A2: Azure Account Setup**
- Assumption: User has Microsoft Entra External ID tenant configured or can create one
- Validation: Verify Azure credentials before Story 1.3
- **Status:** Needs verification

**A3: Development Environment**
- Assumption: User has Node.js 20+ installed, npm/yarn package manager, Git
- Validation: Check Node.js version before Story 1.1
- **Status:** Standard development setup

**A4: Database Schema Completeness**
- Assumption: Prisma schema defined in Epic 1 will support all future epic requirements
- Validation: Schema reviewed against all FRs requiring data storage
- **Status:** Schema reviewed and complete for MVP scope

### Open Questions

**Q1: Azure Tenant Setup**
- Question: Does user have existing Microsoft Entra External ID tenant, or should setup instructions be provided?
- Impact: Story 1.3 completion
- Next Step: Verify Azure tenant status before Story 1.3

**Q2: Database Hosting Provider**
- Question: Which external PostgreSQL provider will be used? (Supabase, Neon, Railway, etc.)
- Impact: Connection string format, specific provider features
- Next Step: Document provider-specific setup if needed

**Q3: Development Team Size**
- Question: Will multiple developers be working on this project?
- Impact: Development environment consistency, .env.example documentation
- Next Step: Current assumption: single developer, but tooling supports team

---

## Test Strategy Summary

### Unit Testing

**Framework:** Vitest (configured in Story 1.4)

**Test Coverage for Epic 1:**

**Story 1.1 - Project Initialization:**
- Test: Verify project structure exists
- Test: Verify all dependencies are installed (check package.json)
- Test: Verify Next.js configuration files exist
- Test: Verify Tailwind CSS configuration works
- **Location:** `__tests__/unit/project-setup.test.ts`

**Story 1.2 - Database Schema:**
- Test: Verify Prisma schema is valid (syntax check)
- Test: Verify Prisma Client can be instantiated
- Test: Verify database connection works (integration test)
- Test: Verify models have correct relationships
- **Location:** `__tests__/unit/database.test.ts`, `__tests__/integration/prisma.test.ts`

**Story 1.3 - Authentication Infrastructure:**
- Test: Verify MSAL React instance can be created with valid config
- Test: Verify MSAL Node instance can be created with valid config
- Test: Verify environment variables are loaded correctly
- **Location:** `__tests__/unit/auth-config.test.ts`

**Story 1.4 - Development Tooling:**
- Test: Verify ESLint configuration works (lint test file)
- Test: Verify TypeScript strict mode catches type errors
- Test: Verify Vitest can run tests
- **Location:** `__tests__/unit/tooling.test.ts`

### Integration Testing

**Database Integration Tests:**
- Test: Prisma migration applies successfully
- Test: Prisma Client can query database
- Test: Database constraints work (unique constraints, foreign keys)
- Test: CASCADE deletes work correctly
- **Location:** `__tests__/integration/database.test.ts`

**Authentication Integration Tests (Future):**
- MSAL integration tests deferred to Epic 2 (when actual auth flows are implemented)

### E2E Testing

**E2E Tests:** Deferred to Epic 2+ when user-facing features exist

**Framework:** Playwright (configured in Story 1.4 for future use)

### Test Data Strategy

**Database Test Data:**
- Use separate test database (different DATABASE_URL for tests)
- Clean database between test runs
- Use factories for test data generation (future story)

**Environment Variables for Testing:**
- Separate .env.test file for test-specific configuration
- Mock Azure credentials for auth testing (Epic 2)

---

## Implementation Guide

### Story 1.1 Implementation Steps

1. **Initialize Next.js Project**
   ```bash
   npx create-next-app@latest takeyourpills --typescript --tailwind --app --no-src-dir
   cd takeyourpills
   ```

2. **Install Core Dependencies**
   ```bash
   npm install @prisma/client prisma
   npm install @azure/msal-react @azure/msal-node
   npm install cron-parser node-cron
   npm install date-fns date-fns-tz
   npm install zod @tanstack/react-query
   ```

3. **Install Dev Dependencies**
   ```bash
   npm install -D @types/node-cron
   npm install -D vitest @testing-library/react @testing-library/jest-dom
   npm install -D @playwright/test
   ```

4. **Initialize shadcn/ui**
   ```bash
   npx shadcn-ui@latest init
   # Follow prompts to configure with Tailwind CSS
   ```

5. **Create .env.example**
   ```bash
   # Copy from architecture document
   # Document all required environment variables
   ```

6. **Verify Setup**
   ```bash
   npm run dev  # Should start successfully
   ```

### Story 1.2 Implementation Steps

1. **Initialize Prisma**
   ```bash
   npx prisma init
   ```

2. **Configure DATABASE_URL**
   - Update `.env` with external PostgreSQL connection string
   - Update `.env.example` with connection string format

3. **Define Prisma Schema**
   - Create `prisma/schema.prisma` with User, Medication, ConsumptionHistory models
   - Follow schema from architecture document exactly
   - Include all indexes, unique constraints, relationships

4. **Create Initial Migration**
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

6. **Create Prisma Client Singleton**
   - Create `lib/prisma/client.ts`
   - Export singleton Prisma Client instance
   - Prevent multiple instances in development

7. **Verify Database Setup**
   ```bash
   npx prisma studio  # Should open database GUI
   ```

### Story 1.3 Implementation Steps

1. **Configure MSAL React**
   - Create `lib/auth/msal.ts`
   - Configure PublicClientApplication with Azure credentials from env vars
   - Export MSAL instance and configuration

2. **Configure MSAL Node**
   - Add ConfidentialClientApplication configuration for backend
   - Create token validation utility (basic structure, full implementation in Epic 2)

3. **Set Up MSAL Provider**
   - Update `app/layout.tsx` to wrap app with MSAL provider
   - Configure provider with MSAL instance

4. **Set Up Environment Variables**
   - Add Azure credentials to `.env.local`
   - Document in `.env.example` (without actual values)

5. **Verify Configuration**
   - Verify MSAL instance can be created
   - Verify environment variables load correctly

### Story 1.4 Implementation Steps

1. **Configure ESLint**
   - Create `.eslintrc.json` with Next.js recommended config
   - Add TypeScript rules
   - Test with `npm run lint`

2. **Configure Vitest**
   - Create `vitest.config.ts`
   - Configure React testing library
   - Create example test file
   - Test with `npm test`

3. **Configure TypeScript**
   - Update `tsconfig.json` with strict mode
   - Test with `npm run type-check`

4. **Configure Git**
   - Update `.gitignore` with Next.js defaults + .env.local
   - Create `.env.example` with all required variables

5. **Update package.json Scripts**
   - Add `lint`, `test`, `type-check` scripts
   - Verify all scripts work

---

## Success Criteria

**Epic 1 is complete when:**
- ✅ All 4 stories are marked as `done` in sprint-status.yaml
- ✅ Project can be initialized by any developer following instructions
- ✅ Database schema is created and accessible via Prisma Client
- ✅ MSAL is configured and ready for authentication flows (Epic 2)
- ✅ Development tooling works and enforces quality standards
- ✅ All acceptance criteria for all 4 stories are met
- ✅ No blocking issues preventing Epic 2 from starting

**Quality Gates:**
- All tests pass (unit tests for Epic 1 stories)
- ESLint passes with no errors
- TypeScript compiles with no errors
- Database migration applies successfully
- Development server starts without errors

---

_This Epic Technical Specification provides comprehensive implementation guidance for Epic 1: Foundation & Project Setup. It serves as the authoritative technical reference for developers implementing stories in this epic._

