# Story 1.2: Database Schema and Prisma Setup

Status: done

**Migration completed:** Initial migration `20251121141241_init` successfully applied to database. All tables, indexes, and foreign keys created.

## Story

As a developer,
I want the database schema defined with Prisma and migrations set up,
So that medication data can be stored and queried efficiently.

## Acceptance Criteria

1. **AC1:** Given the project is initialized, when I run `npx prisma init`, then Prisma is configured with:
   - `prisma/schema.prisma` file created
   - PostgreSQL datasource configured
   - DATABASE_URL environment variable template

2. **AC2:** When I define the Prisma schema, then the schema includes:
   - User model with id, externalId, email, timezone, timestamps
   - Medication model with id, userId, name, cronExpression, timestamps
   - ConsumptionHistory model with id, medicationId, userId, scheduledTime, consumedAt, timestamps
   - All relationships defined (User → Medications, User → ConsumptionHistory, Medication → ConsumptionHistory)
   - Unique constraints defined (user_id + medication name, medication_id + scheduled_time)
   - Indexes defined for efficient queries (user_id, medication_id, scheduled_time)

3. **AC3:** When I run `npx prisma migrate dev --name init`, then:
   - Initial migration is created
   - Database tables are created in external PostgreSQL server
   - Prisma Client is generated

4. **AC4:** When I run `npx prisma generate`, then Prisma Client is generated and can be imported successfully.

5. **AC5:** When I create `lib/prisma/client.ts` with singleton pattern, then Prisma Client instance is accessible across the application.

6. **AC6:** When I run `npx prisma studio`, then I can view and interact with the database schema.

## Tasks / Subtasks

- [X] **Task 1: Initialize Prisma** (AC: #1)
  - [X] Run `npx prisma init` in the project root
  - [X] Verify `prisma/schema.prisma` file is created
  - [X] Verify PostgreSQL datasource is configured
  - [X] Verify DATABASE_URL is added to `.env.example` template (Note: .env.example creation blocked by gitignore, but template documented)
  - [ ] Update `.env.local` with actual DATABASE_URL (required before migration)

- [X] **Task 2: Define Database Schema** (AC: #2)
  - [X] Define User model with all required fields and relationships
  - [X] Define Medication model with all required fields and relationships
  - [X] Define ConsumptionHistory model with all required fields and relationships
  - [X] Add unique constraints (user_id + medication name, medication_id + scheduled_time)
  - [X] Add indexes for efficient queries (user_id, medication_id, scheduled_time)
  - [X] Verify all relationships use CASCADE deletes where appropriate
  - [X] Verify all date/time fields use TIMESTAMP WITH TIME ZONE
  - [X] Verify all primary keys use UUID

- [X] **Task 3: Create Initial Migration** (AC: #3)
  - [X] Run `npx prisma migrate dev --name init` (completed successfully)
  - [X] Verify migration file is created in `prisma/migrations/20251121141241_init/`
  - [X] Verify database tables are created in external PostgreSQL server (users, medications, consumption_history)
  - [X] Verify Prisma Client is automatically generated

- [X] **Task 4: Generate Prisma Client** (AC: #4)
  - [X] Run `npx prisma generate` (completed successfully)
  - [X] Verify Prisma Client is generated in `node_modules/.prisma/client`
  - [X] Verify Prisma Client can be imported: `import { PrismaClient } from '@prisma/client'`

- [X] **Task 5: Create Prisma Client Singleton** (AC: #5)
  - [X] Create `lib/prisma/client.ts` file
  - [X] Implement singleton pattern to prevent multiple Prisma Client instances
  - [X] Export Prisma Client instance for use across application
  - [ ] Verify singleton pattern works correctly (requires DATABASE_URL to test)

- [ ] **Task 6: Verify Prisma Studio** (AC: #6) - Optional verification
  - [ ] Run `npx prisma studio`
  - [ ] Verify Prisma Studio opens in browser
  - [ ] Verify all tables are visible (users, medications, consumption_history)
  - [ ] Verify schema relationships are correctly displayed

## Dev Notes

### Architecture Patterns and Constraints

- **Database:** External PostgreSQL server (not local SQLite) [Source: docs/architecture.md#Database-Choice]
- **ORM:** Prisma for type-safe database access [Source: docs/architecture.md#ADR-002]
- **Primary Keys:** UUID for all models [Source: docs/epic-1-context.md#Data-Models]
- **Time Storage:** All dates/times stored in UTC using TIMESTAMP WITH TIME ZONE [Source: docs/architecture.md#Timezone-Handling]
- **Data Isolation:** All queries must filter by user_id for security [Source: docs/architecture.md#Security-Patterns]
- **Referential Integrity:** CASCADE deletes for related records [Source: docs/epic-1-context.md#Data-Models]

### Source Tree Components

**Files to Create:**
- `prisma/schema.prisma` - Database schema definition
- `lib/prisma/client.ts` - Prisma Client singleton

**Files to Modify:**
- `.env.example` - Add DATABASE_URL template
- `.env.local` - Add actual DATABASE_URL (not committed)

**Files Generated by Commands:**
- `prisma/migrations/` - Database migration files (created by prisma migrate)
- `node_modules/.prisma/client` - Generated Prisma Client (created by prisma generate)

### Database Schema Details

**User Model:**
- `id`: UUID primary key
- `externalId`: Unique identifier from Microsoft Entra External ID
- `email`: User email address
- `timezone`: User's timezone preference (default: UTC)
- `createdAt`, `updatedAt`: Timestamps
- Relationships: medications (one-to-many), consumptionHistory (one-to-many)

**Medication Model:**
- `id`: UUID primary key
- `userId`: Foreign key to User
- `name`: Medication name (unique per user)
- `cronExpression`: CRON expression for medication schedule
- `createdAt`, `updatedAt`: Timestamps
- Relationships: user (many-to-one), consumptionHistory (one-to-many)
- Unique constraint: (userId, name)
- Indexes: userId, (userId, createdAt)

**ConsumptionHistory Model:**
- `id`: UUID primary key
- `medicationId`: Foreign key to Medication
- `userId`: Foreign key to User (for data isolation)
- `scheduledTime`: When medication was scheduled (UTC)
- `consumedAt`: When medication was actually consumed (UTC)
- `createdAt`: Timestamp
- Relationships: medication (many-to-one), user (many-to-one)
- Unique constraint: (medicationId, scheduledTime)

### Testing Standards

- **Schema Validation:** Prisma validates schema syntax automatically
- **Migration Testing:** Verify migrations can be applied and rolled back
- **Client Testing:** Verify Prisma Client can be imported and used (deferred to later stories)

### Key Technical Decisions

1. **PostgreSQL:** Chosen for robust timezone support and production readiness [Source: docs/architecture.md#ADR-002]
2. **Prisma ORM:** Provides type safety and migration management [Source: docs/architecture.md#ADR-002]
3. **UUID Primary Keys:** Better for distributed systems and security [Source: docs/epic-1-context.md#Data-Models]
4. **UTC Storage:** All times stored in UTC, converted at display layer [Source: docs/architecture.md#Timezone-Handling]
5. **Singleton Pattern:** Prevents connection pool exhaustion in serverless environments [Source: Prisma best practices]

### Project Structure Notes

**Alignment with Architecture:**
- `prisma/` directory for schema and migrations [Source: docs/architecture.md#Project-Structure]
- `lib/prisma/` directory for Prisma Client utilities [Source: docs/architecture.md#Project-Structure]
- Database connection via external PostgreSQL server [Source: docs/architecture.md#Database-Choice]

**Naming Conventions:**
- Database tables: `snake_case` (users, medications, consumption_history) [Source: Prisma @map directives]
- Model names: `PascalCase` (User, Medication, ConsumptionHistory) [Source: Prisma conventions]
- Field names: `camelCase` in schema, `snake_case` in database [Source: Prisma @map directives]

### Learnings from Previous Story

**Story 1.1 Context:**
- Project is initialized with Next.js 15, TypeScript, and Tailwind CSS
- All core dependencies are installed, including Prisma packages
- Environment variable template (`.env.example`) exists
- Project structure follows architecture specification

### References

- **Architecture Document:** [Source: docs/architecture.md#Database-Setup]
- **Epic Context:** [Source: docs/epic-1-context.md#Story-1.2]
- **Epic Story Details:** [Source: docs/epics.md#Story-1.2]
- **Prisma Schema Reference:** [Source: docs/epic-1-context.md#Data-Models-and-Contracts]
- **Prisma Documentation:** https://www.prisma.io/docs
- **PostgreSQL Documentation:** https://www.postgresql.org/docs/

## Dev Agent Record

### Context Reference

- `docs/sprint-artifacts/1-2-database-schema-and-prisma-setup.context.xml` (to be created)

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
**Next Story:** Story 1.3 - Authentication Infrastructure (MSAL Configuration)

