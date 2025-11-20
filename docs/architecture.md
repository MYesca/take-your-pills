# TakeYourPills - Architecture

## Executive Summary

TakeYourPills is a web application for medication tracking with CRON-based scheduling, real-time checkbox interactions, and healthcare-grade security. The architecture supports a React-based SPA frontend with a REST API backend, Microsoft Entra External ID authentication, and timezone-aware scheduling calculations.

**Project Context:**
- **46 Functional Requirements** across 7 capability areas
- **22 Non-Functional Requirements** (security, performance, scalability, accessibility)
- **UX Design:** shadcn/ui + Tailwind CSS (React-based component system)
- **Authentication:** Microsoft Entra External ID (OpenID Connect) - specified in PRD
- **Scheduling:** CRON expressions (internal storage, user-friendly UI)
- **Timezone:** UTC storage, user timezone preference for display
- **Scale:** Initial target: dozens of users, designed to scale to thousands

---

## Project Initialization

**Starter Template:** Next.js 15 with TypeScript and Tailwind CSS

**Initialization Command:**
```bash
npx create-next-app@latest takeyourpills --typescript --tailwind --app --no-src-dir
```

**Post-Initialization Setup:**
```bash
# Install dependencies
npm install @prisma/client prisma
npm install @azure/msal-react @azure/msal-node
npm install cron-parser node-cron
npm install date-fns date-fns-tz
npm install zod                    # Validation
npm install @tanstack/react-query  # Data fetching/caching

# Install dev dependencies
npm install -D @types/node-cron
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @playwright/test    # E2E testing

# Initialize Prisma
npx prisma init

# Initialize shadcn/ui
npx shadcn-ui@latest init
```

**Starter Template Provides:**
- ✅ TypeScript configuration
- ✅ Tailwind CSS setup
- ✅ Next.js App Router structure
- ✅ Project organization
- ✅ Build tooling (Turbopack)

**Additional Setup Required:**
- Prisma schema and migrations
- MSAL authentication configuration
- shadcn/ui component installation
- Environment variables configuration
- Database setup

---

## Decision Summary

| Category | Decision | Version | Affects Epics | Rationale |
| -------- | -------- | ------- | ------------- | --------- |
| Frontend Framework | Next.js (App Router) | 15.x | All frontend epics | Full-stack framework, works with shadcn/ui, TypeScript support, API routes included |
| Styling | Tailwind CSS | 3.x | All UI epics | Specified in UX design, works with shadcn/ui |
| Component Library | shadcn/ui | Latest | All UI epics | Specified in UX design, accessible Radix UI primitives |
| Language | TypeScript | 5.x | All epics | Type safety, better DX, Next.js default |
| Backend | Next.js API Routes | 15.x | All backend epics | Same project, type sharing, simpler deployment |
| Database | PostgreSQL | 15+ | Data persistence epics | Structured data, ACID guarantees, good for time-based queries |
| ORM | Prisma | Latest | Data persistence epics | Type-safe, migrations, excellent TypeScript support |
| Authentication | Microsoft Entra External ID | Latest | Authentication epics | Specified in PRD, OpenID Connect standard |
| Auth Library (Frontend) | @azure/msal-react | Latest | Authentication epics | Official MSAL React integration |
| Auth Library (Backend) | @azure/msal-node | Latest | Authentication epics | Backend token validation |
| CRON Parsing | cron-parser | Latest | Scheduling epics | Calculate medication occurrences from CRON expressions |
| CRON Jobs | node-cron | Latest | Future reminder epics | Scheduled job execution (if needed) |
| Timezone | date-fns-tz | Latest | All time-related epics | Timezone conversion, tree-shakeable, TypeScript support |
| API Pattern | REST | - | All API epics | Standard, well-understood, simple for CRUD operations |

---

## Project Structure

```
takeyourpills/
├── .env.local                    # Environment variables (gitignored)
├── .env.example                  # Example environment variables
├── .gitignore
├── next.config.js                # Next.js configuration
├── package.json
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── components.json               # shadcn/ui configuration
├── prisma/
│   ├── schema.prisma             # Prisma schema
│   └── migrations/               # Database migrations
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Dashboard (home page)
│   ├── (auth)/
│   │   ├── login/
│   │   └── callback/             # OAuth callback
│   ├── dashboard/                # Dashboard route
│   ├── medications/              # Medication management
│   │   ├── page.tsx              # List medications
│   │   ├── new/                  # Add medication
│   │   └── [id]/                 # Edit medication
│   ├── reports/                  # Adherence reports
│   │   └── page.tsx
│   ├── settings/                 # User settings
│   │   └── page.tsx
│   └── api/                      # API routes
│       ├── auth/
│       │   └── route.ts          # Auth endpoints
│       ├── medications/
│       │   ├── route.ts          # GET, POST medications
│       │   └── [id]/
│       │       └── route.ts       # GET, PUT, DELETE medication
│       ├── consumption/
│       │   ├── route.ts          # Mark/unmark consumption
│       │   └── [id]/
│       │       └── route.ts       # Consumption history
│       ├── reports/
│       │   └── route.ts          # Adherence report data
│       └── user/
│           └── preferences/
│               └── route.ts      # Timezone preferences
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── medication/
│   │   ├── MedicationCard.tsx    # Medication display card
│   │   ├── MedicationCheckbox.tsx # Prominent checkbox
│   │   └── TimeGroup.tsx         # Time-grouped section
│   └── layout/
│       ├── Header.tsx            # Navigation header
│       └── Navigation.tsx        # Nav component
├── lib/
│   ├── prisma/
│   │   └── client.ts             # Prisma client singleton
│   ├── auth/
│   │   └── msal.ts              # MSAL configuration
│   ├── api/
│   │   └── client.ts            # API client functions
│   ├── cron/
│   │   ├── parser.ts             # CRON parsing utilities
│   │   └── calculator.ts         # Calculate medication occurrences
│   ├── timezone/
│   │   └── converter.ts           # UTC ↔ user timezone conversion
│   └── validations/
│       └── schemas.ts            # Zod validation schemas
├── hooks/
│   ├── useMedications.ts         # Medication data hook
│   ├── useConsumption.ts        # Consumption tracking hook
│   └── useTimezone.ts           # Timezone preference hook
├── types/
│   ├── medication.ts             # Medication types
│   ├── consumption.ts            # Consumption types
│   └── api.ts                    # API response types
└── __tests__/
    ├── unit/                     # Unit tests
    ├── integration/              # Integration tests
    └── e2e/                      # E2E tests (Playwright)
```

### FR Category to Architecture Mapping

**User Account & Access:**
- Frontend: `app/(auth)/` routes, `components/layout/Header.tsx`
- Backend: `app/api/auth/` routes
- Library: `lib/auth/msal.ts`

**Medication Registration & Management:**
- Frontend: `app/medications/` routes, `components/medication/`
- Backend: `app/api/medications/` routes
- Library: `lib/cron/` (CRON parsing/validation)

**Daily Medication Tracking:**
- Frontend: `app/dashboard/` route, `components/medication/MedicationCard.tsx`, `components/medication/MedicationCheckbox.tsx`
- Backend: `app/api/consumption/` routes
- Library: `lib/cron/calculator.ts` (calculate today's medications)

**Adherence Reporting:**
- Frontend: `app/reports/` route
- Backend: `app/api/reports/` route
- Library: `lib/cron/calculator.ts` (calculate historical occurrences)

**User Preferences:**
- Frontend: `app/settings/` route
- Backend: `app/api/user/preferences/` route
- Library: `lib/timezone/converter.ts`

**Data Isolation & Security:**
- Backend: Middleware in all API routes (extract user ID from token, enforce isolation)
- Database: Row-level security via user_id filtering

**Timezone Handling:**
- Frontend: `lib/timezone/converter.ts` (display conversion)
- Backend: `lib/timezone/converter.ts` (storage conversion)
- Database: All timestamps in UTC

---

## Technology Stack Details

### Core Technologies

**Frontend:**
- Next.js 15 (App Router) - React framework with SSR/SSG
- TypeScript 5.x - Type safety
- Tailwind CSS 3.x - Utility-first CSS
- shadcn/ui - Accessible component library (Radix UI primitives)
- React Query (@tanstack/react-query) - Data fetching and caching
- date-fns + date-fns-tz - Date/time manipulation and timezone conversion

**Backend:**
- Next.js API Routes - Backend API (same project)
- Prisma - Type-safe ORM
- PostgreSQL 15+ - Relational database
- Zod - Runtime validation and type inference

**Authentication:**
- Microsoft Entra External ID - Identity provider
- @azure/msal-react - Frontend authentication
- @azure/msal-node - Backend token validation

**Scheduling:**
- cron-parser - Parse and calculate CRON occurrences
- node-cron - Scheduled job execution (future reminders)

**Testing:**
- Vitest - Unit and integration testing
- Playwright - E2E testing
- @testing-library/react - React component testing

### Integration Points

**Frontend ↔ Backend:**
- REST API calls from React components to Next.js API routes
- Type-safe API client functions in `lib/api/client.ts`
- React Query for data fetching, caching, and synchronization

**Backend ↔ Database:**
- Prisma Client for all database operations
- Connection pooling handled by Prisma
- Migrations via Prisma Migrate

**Frontend ↔ Authentication:**
- MSAL React handles OAuth flow
- Access tokens included in API requests
- Token refresh handled automatically by MSAL

**Backend ↔ Authentication:**
- MSAL Node validates tokens on each API request
- User ID extracted from token claims
- No session storage (stateless authentication)

**CRON Calculation:**
- Backend calculates medication occurrences using cron-parser
- Results converted to user timezone for display
- Consumption records stored with UTC timestamps

---

## Implementation Patterns

These patterns ensure consistent implementation across all AI agents and prevent conflicts:

### Error Handling Strategy

**Approach:** Structured error responses with consistent format

**API Error Format:**
```typescript
{
  error: {
    code: string,        // Machine-readable error code (e.g., "MEDICATION_NOT_FOUND")
    message: string,     // User-friendly error message
    details?: object     // Optional additional context
  }
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created (POST success)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (authorization failed)
- `404` - Not Found
- `409` - Conflict (e.g., duplicate medication name)
- `500` - Internal Server Error

**Frontend Error Handling:**
- Try-catch blocks around API calls
- Display user-friendly error messages via toast notifications
- Log technical errors to console (development) / error tracking service (production)
- Retry logic for network errors (exponential backoff)

**Backend Error Handling:**
- Try-catch in all API route handlers
- Validation errors return 400 with specific field errors
- Database errors are caught and return 500 (don't expose DB details)
- Authentication errors return 401
- Authorization errors return 403

### Logging Approach

**Format:** Structured JSON logging

**Log Levels:**
- `error` - Errors that need attention
- `warn` - Warnings (e.g., validation failures, retries)
- `info` - Informational (e.g., API requests, user actions)
- `debug` - Debug information (development only)

**Log Structure:**
```typescript
{
  level: "info" | "warn" | "error" | "debug",
  timestamp: string,      // ISO 8601
  message: string,
  context?: {
    userId?: string,
    requestId?: string,
    endpoint?: string,
    [key: string]: any
  }
}
```

**Where to Log:**
- API routes: Log all requests (info), errors (error), validation failures (warn)
- Frontend: Log errors to error tracking service (Sentry, LogRocket, etc.)
- CRON calculations: Log scheduling errors (error)

### Date/Time Handling

**Storage:** All dates/times stored in UTC (ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.sssZ`)

**Display:** Convert to user's timezone preference using `date-fns-tz`

**Format Standards:**
- API: ISO 8601 strings (UTC)
- Database: TIMESTAMP WITH TIME ZONE (PostgreSQL)
- Frontend display: Format based on user's locale and timezone preference
- Time inputs: 24-hour format (09:00, 14:00, 21:00) - clearer for medication scheduling

**Library:** `date-fns` + `date-fns-tz` for all date operations

### Authentication Pattern

**Flow:**
1. Frontend: User authenticates via Microsoft Entra External ID (MSAL React)
2. Frontend: Receives access token
3. Frontend: Includes token in API requests (Authorization header: `Bearer <token>`)
4. Backend: Validates token on each API request using MSAL Node
5. Backend: Extracts user ID from token claims
6. Backend: Enforces data isolation (user can only access their own data)

**Token Storage:** 
- Frontend: In-memory (MSAL handles this)
- No localStorage/sessionStorage for tokens (MSAL best practice)

**Session Management:**
- Token refresh handled by MSAL automatically
- Session timeout: Configurable (default: token expiration)

### API Response Format

**Success Response:**
```typescript
{
  data: T,              // Response payload
  meta?: {              // Optional metadata
    timestamp: string,
    requestId: string
  }
}
```

**Error Response:**
```typescript
{
  error: {
    code: string,
    message: string,
    details?: object
  }
}
```

**Pagination (if needed):**
```typescript
{
  data: T[],
  pagination: {
    page: number,
    pageSize: number,
    total: number,
    totalPages: number
  }
}
```

### Testing Strategy

**Unit Tests:**
- Framework: Vitest (fast, Vite-compatible)
- Coverage: Business logic, utilities, CRON calculations, timezone conversions
- Location: Co-located with source files (`*.test.ts`, `*.spec.ts`)

**Integration Tests:**
- Framework: Vitest + test database
- Coverage: API routes, database operations, authentication flows
- Location: `__tests__/integration/`

**E2E Tests:**
- Framework: Playwright (recommended for Next.js)
- Coverage: Critical user journeys (mark medication, register medication, view report)
- Location: `e2e/`

**Test Data:**
- Use factories for test data generation
- Clean database between tests
- Use test-specific database (separate from dev/prod)

### Code Organization Patterns

**Frontend Structure:**
```
app/
  (routes)/              # Next.js App Router routes
    dashboard/
    medications/
    reports/
    settings/
  components/            # Reusable components
    ui/                  # shadcn/ui components
    medication/          # Medication-specific components
  lib/                   # Utilities, helpers
    api/                 # API client functions
    cron/                # CRON calculation utilities
    timezone/            # Timezone conversion utilities
  hooks/                 # React hooks
  types/                 # TypeScript types
```

**Backend Structure (API Routes):**
```
app/api/
  auth/                  # Authentication routes
  medications/           # Medication CRUD
  consumption/           # Medication marking
  reports/              # Adherence reports
  user/                 # User preferences
```

**Shared:**
```
lib/
  prisma/               # Prisma client
  auth/                 # Auth utilities
  validations/          # Zod schemas for validation
```

### Naming Conventions

**REST Endpoints:**
- Plural nouns: `/api/medications`, `/api/users`
- Nested resources: `/api/medications/:id/consumption`
- Actions: `/api/medications/:id/consume` (POST)

**Database:**
- Tables: `snake_case` (e.g., `medications`, `consumption_history`)
- Columns: `snake_case` (e.g., `user_id`, `medication_name`, `cron_expression`)
- Foreign keys: `{table}_id` (e.g., `medication_id`, `user_id`)

**Frontend:**
- Components: `PascalCase` (e.g., `MedicationCard.tsx`, `TimeGroup.tsx`)
- Files: Match component name (e.g., `MedicationCard.tsx`)
- Hooks: `use` prefix (e.g., `useMedications.ts`, `useTimezone.ts`)
- Utilities: `camelCase` (e.g., `formatTime.ts`, `calculateOccurrences.ts`)

**TypeScript:**
- Types/Interfaces: `PascalCase` (e.g., `Medication`, `ConsumptionRecord`)
- Enums: `PascalCase` (e.g., `MedicationStatus`)
- Functions: `camelCase` (e.g., `getMedications`, `markAsConsumed`)

---

## Data Architecture

### Database Schema

**Database:** PostgreSQL 15+

**Tables:**

**1. users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(255) UNIQUE NOT NULL,  -- Microsoft Entra ID
  email VARCHAR(255) NOT NULL,
  timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',  -- IANA timezone (e.g., 'America/New_York')
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_external_id ON users(external_id);
```

**2. medications**
```sql
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  cron_expression VARCHAR(255) NOT NULL,  -- CRON expression (e.g., "0 9 * * *" for 9:00 AM daily)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_user_medication UNIQUE(user_id, name)
);

CREATE INDEX idx_medications_user_id ON medications(user_id);
CREATE INDEX idx_medications_user_created ON medications(user_id, created_at);
```

**3. consumption_history**
```sql
CREATE TABLE consumption_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,  -- When medication was scheduled (UTC)
  consumed_at TIMESTAMP WITH TIME ZONE NOT NULL,     -- When user marked as consumed (UTC)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_medication_scheduled_time UNIQUE(medication_id, scheduled_time)
);

CREATE INDEX idx_consumption_user_id ON consumption_history(user_id);
CREATE INDEX idx_consumption_medication_id ON consumption_history(medication_id);
CREATE INDEX idx_consumption_scheduled_time ON consumption_history(scheduled_time);
CREATE INDEX idx_consumption_user_scheduled ON consumption_history(user_id, scheduled_time);
```

**Data Relationships:**
- `users` 1:N `medications` (one user has many medications)
- `medications` 1:N `consumption_history` (one medication has many consumption records)
- `users` 1:N `consumption_history` (one user has many consumption records)

**Data Isolation:**
- All queries MUST filter by `user_id` to enforce data isolation
- Foreign key constraints ensure referential integrity
- CASCADE deletes: Deleting user deletes all their medications and consumption history

### Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

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

### Data Access Patterns

**Query Patterns:**
1. **Get user's medications:** `SELECT * FROM medications WHERE user_id = ?`
2. **Get today's scheduled medications:** Calculate from CRON expressions, filter by user_id
3. **Get consumption history:** `SELECT * FROM consumption_history WHERE user_id = ? AND scheduled_time BETWEEN ? AND ?`
4. **Mark consumption:** `INSERT INTO consumption_history (medication_id, user_id, scheduled_time, consumed_at) VALUES (...)`
5. **Check if consumed:** `SELECT * FROM consumption_history WHERE medication_id = ? AND scheduled_time = ?`

**CRON Calculation:**
- Use `cron-parser` to calculate which medications are scheduled for a given day
- Calculate all occurrences for the day in UTC
- Convert to user's timezone for display
- Store scheduled_time in UTC for consistency

---

## API Contracts

### Authentication

All API routes (except auth endpoints) require authentication:
- Header: `Authorization: Bearer <access_token>`
- Token validated using MSAL Node
- User ID extracted from token claims

### API Endpoints

**Base URL:** `/api`

#### Authentication

**POST /api/auth/login**
- Redirects to Microsoft Entra External ID login
- Returns: Redirect response

**GET /api/auth/callback**
- OAuth callback handler
- Returns: Redirects to dashboard on success

**POST /api/auth/logout**
- Logs out user
- Returns: `{ success: true }`

**GET /api/auth/me**
- Get current user info
- Returns: `{ data: { id, email, timezone } }`

#### Medications

**GET /api/medications**
- Get all medications for authenticated user
- Query params: None
- Returns: `{ data: Medication[] }`
- Example response:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Puran T4",
      "cronExpression": "0 7 * * *",
      "createdAt": "2025-11-19T10:00:00Z",
      "updatedAt": "2025-11-19T10:00:00Z"
    }
  ]
}
```

**POST /api/medications**
- Create new medication
- Body: `{ name: string, schedule: { times: string[] } }` (times in user's timezone, e.g., ["09:00", "21:00"])
- Returns: `{ data: Medication }`
- Validates: Name required, schedule must be CRON-mappable
- Converts user-friendly schedule to CRON expression

**GET /api/medications/:id**
- Get specific medication
- Returns: `{ data: Medication }`
- Error: 404 if not found or not user's medication

**PUT /api/medications/:id**
- Update medication
- Body: `{ name?: string, schedule?: { times: string[] } }`
- Returns: `{ data: Medication }`
- Error: 404 if not found or not user's medication

**DELETE /api/medications/:id**
- Delete medication
- Returns: `{ success: true }`
- Error: 404 if not found or not user's medication
- Cascades: Deletes all consumption history for this medication

#### Consumption Tracking

**GET /api/consumption/today**
- Get today's medications with consumption status
- Returns: `{ data: MedicationWithStatus[] }`
- Example response:
```json
{
  "data": [
    {
      "medication": {
        "id": "uuid",
        "name": "Puran T4",
        "cronExpression": "0 7 * * *"
      },
      "scheduledTime": "2025-11-19T07:00:00Z",  // UTC
      "displayTime": "07:00",                    // User's timezone
      "consumed": true,
      "consumedAt": "2025-11-19T07:05:00Z"       // UTC
    }
  ]
}
```

**POST /api/consumption/:medicationId/consume**
- Mark medication as consumed
- Body: `{ scheduledTime: string }` (ISO 8601 UTC timestamp)
- Returns: `{ data: { id, medicationId, scheduledTime, consumedAt } }`
- Allows retroactive marking for same day

**DELETE /api/consumption/:medicationId/consume**
- Unmark medication (mark as not consumed)
- Body: `{ scheduledTime: string }` (ISO 8601 UTC timestamp)
- Returns: `{ success: true }`
- Deletes consumption record

#### Reports

**GET /api/reports/adherence**
- Get adherence report
- Query params: `?days=7|14|30` (default: 7)
- Returns: `{ data: AdherenceReport }`
- Example response:
```json
{
  "data": {
    "medications": [
      {
        "id": "uuid",
        "name": "Puran T4"
      }
    ],
    "periods": [
      {
        "date": "2025-11-19",
        "medications": [
          {
            "medicationId": "uuid",
            "status": "consumed" | "missed" | "future"
          }
        ]
      }
    ]
  }
}
```

#### User Preferences

**GET /api/user/preferences**
- Get user preferences (timezone)
- Returns: `{ data: { timezone: string } }`

**PUT /api/user/preferences**
- Update user preferences
- Body: `{ timezone: string }` (IANA timezone, e.g., "America/New_York")
- Returns: `{ data: { timezone: string } }`
- Validates: Timezone must be valid IANA timezone

### API Response Format

**Success:**
```typescript
{
  data: T,
  meta?: {
    timestamp: string,
    requestId: string
  }
}
```

**Error:**
```typescript
{
  error: {
    code: string,        // e.g., "MEDICATION_NOT_FOUND", "INVALID_SCHEDULE"
    message: string,     // User-friendly message
    details?: {
      field?: string,    // For validation errors
      [key: string]: any
    }
  }
}
```

### Validation

**Use Zod schemas** for all API request/response validation:
- Request body validation
- Query parameter validation
- Response type safety
- Location: `lib/validations/schemas.ts`

---

## Security Architecture

### Authentication & Authorization

**Authentication Provider:** Microsoft Entra External ID (Azure AD B2C)
- **Protocol:** OpenID Connect
- **Frontend:** `@azure/msal-react` for authentication flow
- **Backend:** `@azure/msal-node` for token validation

**Token Flow:**
1. User authenticates via Microsoft Entra External ID
2. MSAL React receives access token + ID token
3. Frontend includes access token in API requests: `Authorization: Bearer <token>`
4. Backend API routes validate token using MSAL Node
5. Backend extracts user ID from token claims
6. All database queries filter by user ID (data isolation)

**Session Management:**
- Tokens stored in-memory by MSAL (not localStorage)
- Automatic token refresh handled by MSAL
- Session timeout: Token expiration (configurable)

### Data Isolation

**Enforcement:**
- **Database Level:** All queries MUST include `WHERE user_id = ?` filter
- **API Level:** User ID extracted from token, enforced in all routes
- **Application Level:** Prisma queries always filter by user ID

**Example Pattern:**
```typescript
// All medication queries
const medications = await prisma.medication.findMany({
  where: { userId: authenticatedUserId }  // Always filter by user
});
```

**No Cross-User Access:**
- Users cannot access other users' medications
- No admin override in MVP (each user manages only their data)
- Foreign key constraints ensure referential integrity

### Data Encryption

**In Transit:**
- TLS 1.2+ for all API communication
- HTTPS only (no HTTP in production)
- Secure WebSocket if real-time features added (future)

**At Rest:**
- Database: PostgreSQL encryption at rest (managed by hosting provider)
- Application: No additional encryption needed (database handles it)
- Environment variables: Encrypted secrets management

### Security Headers

**Next.js Security Headers:**
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];
```

### Input Validation

**All User Input Validated:**
- **Frontend:** Zod schemas for form validation
- **Backend:** Zod schemas for API request validation
- **Database:** Prisma schema enforces types

**Validation Rules:**
- Medication names: Required, max 255 chars, sanitized
- CRON expressions: Validated against CRON syntax
- Timezone: Valid IANA timezone identifier
- UUIDs: Validated format for IDs

### OWASP Top 10 Protection

**NFR7 Compliance:**
1. **Injection:** Parameterized queries (Prisma), input validation (Zod)
2. **Broken Authentication:** MSAL handles OAuth securely, token validation
3. **Sensitive Data Exposure:** HTTPS, encrypted at rest, no sensitive data in logs
4. **XML External Entities:** Not applicable (JSON only)
5. **Broken Access Control:** User ID filtering on all queries, no admin bypass
6. **Security Misconfiguration:** Security headers, environment variables, secure defaults
7. **XSS:** React escapes by default, Content-Security-Policy headers
8. **Insecure Deserialization:** JSON only, validated schemas
9. **Using Components with Known Vulnerabilities:** Regular dependency updates
10. **Insufficient Logging:** Structured logging, error tracking

### HIPAA-Aligned Practices

**While not a covered entity, follow best practices:**
- **Access Controls:** Role-based (user-only in MVP), audit logging
- **Encryption:** Data encrypted in transit and at rest
- **Audit Logs:** Log all medication marking actions (consumption_history table)
- **Data Minimization:** Only collect necessary data
- **User Rights:** Data export capability (future feature)
- **Breach Response:** Incident response plan (future)

### Environment Variables

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Application URL
- `AZURE_CLIENT_ID` - Microsoft Entra application ID
- `AZURE_CLIENT_SECRET` - Microsoft Entra client secret
- `AZURE_TENANT_ID` - Microsoft Entra tenant ID
- `NODE_ENV` - Environment (development/production)

**Security:**
- Never commit `.env.local` to git
- Use `.env.example` as template
- Rotate secrets regularly
- Use managed secrets service in production (Azure Key Vault, AWS Secrets Manager, etc.)

---

## Deployment Architecture

### Deployment Target

**Recommended: Vercel (Next.js optimized)**
- **Rationale:** Built for Next.js, automatic deployments, edge network
- **Alternative:** Any Node.js hosting (Railway, Render, AWS, Azure)

**Database Hosting:**
- **Recommended:** Managed PostgreSQL (Vercel Postgres, Supabase, Neon, Railway)
- **Alternative:** Self-hosted PostgreSQL (if needed)

### Environment Setup

**Development:**
- Local Next.js dev server (`npm run dev`)
- External PostgreSQL server (for local development)
- Environment variables in `.env.local`

**Production:**
- Next.js application deployed to hosting platform
- Managed PostgreSQL database
- Environment variables in hosting platform secrets

### Build Process

**Next.js Build:**
```bash
npm run build    # Builds optimized production bundle
npm start        # Starts production server
```

**Database Migrations:**
```bash
npx prisma migrate dev    # Development migrations
npx prisma migrate deploy # Production migrations
npx prisma generate       # Generate Prisma Client
```

### CI/CD Pipeline

**Recommended: GitHub Actions (if using GitHub)**
- **On push to main:** Run tests, build, deploy
- **On PR:** Run tests, linting
- **Database migrations:** Run automatically on deploy (or manual)

**Pipeline Steps:**
1. Install dependencies
2. Run linting (`npm run lint`)
3. Run type checking (`npm run type-check`)
4. Run tests (`npm test`)
5. Build application (`npm run build`)
6. Deploy to hosting platform
7. Run database migrations

### Environment Variables

**Development (.env.local):**
```
DATABASE_URL="postgresql://user:password@external-server:5432/takeyourpills"
# Connect to external PostgreSQL server for local development
NEXTAUTH_URL="http://localhost:3000"
AZURE_CLIENT_ID="..."
AZURE_CLIENT_SECRET="..."
AZURE_TENANT_ID="..."
NODE_ENV="development"
```

**Production:**
- Set in hosting platform environment variables
- Use managed secrets service
- Never commit production secrets

### Database Migrations

**Strategy:**
- Prisma migrations for schema changes
- Version control migrations in `prisma/migrations/`
- Run migrations automatically on deploy (or manual step)
- Backup database before migrations in production

### Monitoring & Logging

**Application Monitoring:**
- Error tracking: Sentry, LogRocket, or similar
- Performance monitoring: Vercel Analytics, or custom solution
- Uptime monitoring: External service (UptimeRobot, etc.)

**Logging:**
- Structured JSON logs
- Log levels: error, warn, info, debug
- Log aggregation: Hosting platform logs or external service

### Backup Strategy

**Database Backups:**
- Automated daily backups (managed PostgreSQL providers handle this)
- Retention: 30 days (adjust based on needs)
- Test restore process periodically

**Application Backups:**
- Code: Git repository (version control)
- Environment variables: Documented in secure location
- Database: Automated by hosting provider

## Novel Architectural Patterns

### CRON-Based Medication Scheduling Calculation

**Pattern Name:** Dynamic Medication Occurrence Calculation

**Purpose:** Calculate which medications are scheduled for a given day based on CRON expressions stored in the database, accounting for user timezone preferences.

**Core Challenge:** 
- Medications stored with CRON expressions (UTC-based)
- Need to calculate occurrences for a specific day
- Display times in user's timezone
- Handle multiple medications with different schedules efficiently

**Components:**

1. **CRON Parser (`lib/cron/parser.ts`)**
   - Parse CRON expressions
   - Validate CRON syntax
   - Convert user-friendly schedule input to CRON expression

2. **Occurrence Calculator (`lib/cron/calculator.ts`)**
   - Calculate all occurrences for a given day (UTC)
   - Filter by date range
   - Handle edge cases (timezone boundaries, DST transitions)

3. **Timezone Converter (`lib/timezone/converter.ts`)**
   - Convert UTC scheduled times to user's timezone for display
   - Convert user timezone inputs to UTC for storage
   - Handle timezone changes (user updates timezone preference)

**Data Flow:**

```
1. User registers medication with schedule (e.g., "9:00 AM and 9:00 PM")
   → Frontend converts to user's timezone
   → Backend validates and converts to CRON expression
   → Store CRON expression in database (UTC-based)

2. Dashboard loads (GET /api/consumption/today)
   → Backend: Get all user's medications with CRON expressions
   → For each medication: Calculate occurrences for today using cron-parser
   → Filter occurrences to today's date range (00:00:00 - 23:59:59 UTC)
   → Check consumption_history for each occurrence (consumed or not)
   → Convert scheduled times from UTC to user's timezone
   → Return to frontend with display times

3. User marks medication as consumed
   → Frontend sends scheduledTime (UTC) to backend
   → Backend stores consumption record with scheduledTime (UTC) and consumedAt (UTC)
   → Frontend optimistically updates UI
```

**Implementation Guide:**

**Calculate Today's Medications:**
```typescript
// lib/cron/calculator.ts
import { parseExpression } from 'cron-parser';
import { startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';

function calculateTodayOccurrences(cronExpression: string, userTimezone: string): Date[] {
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);
  
  const parser = parseExpression(cronExpression, {
    tz: 'UTC'  // CRON expressions are UTC-based
  });
  
  const occurrences: Date[] = [];
  let nextDate = parser.next();
  
  // Calculate occurrences for today (UTC)
  while (nextDate.toDate() <= todayEnd) {
    if (isWithinInterval(nextDate.toDate(), { start: todayStart, end: todayEnd })) {
      occurrences.push(nextDate.toDate());
    }
    nextDate = parser.next();
  }
  
  return occurrences;
}
```

**Timezone Conversion:**
```typescript
// lib/timezone/converter.ts
import { format, zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';

function convertToUserTimezone(utcDate: Date, userTimezone: string): string {
  return format(utcToZonedTime(utcDate, userTimezone), 'HH:mm', {
    timeZone: userTimezone
  });
}

function convertFromUserTimezone(userTime: string, userTimezone: string): Date {
  // Parse user time (e.g., "09:00") and convert to UTC
  const [hours, minutes] = userTime.split(':').map(Number);
  const userDate = new Date();
  userDate.setHours(hours, minutes, 0, 0);
  
  return zonedTimeToUtc(userDate, userTimezone);
}
```

**Affects FR Categories:**
- Medication Registration & Management (FR7, FR11, FR12)
- Daily Medication Tracking (FR16, FR17, FR18)
- Adherence Reporting (FR24, FR25, FR26)
- Timezone Handling (FR42-FR46)

**Edge Cases Handled:**
- DST transitions (timezone library handles automatically)
- Timezone changes (user updates timezone, recalculate display times)
- Multiple occurrences per day (CRON supports this)
- Retroactive marking (store actual consumedAt, not just scheduledTime)

---

## Development Environment

### Prerequisites

**Required:**
- Node.js 20+ (LTS recommended)
- npm or yarn package manager
- Access to external PostgreSQL 15+ server (for local development)
- Git

**Optional:**
- VS Code (recommended IDE)
- PostgreSQL client (pgAdmin, DBeaver, or CLI) for database management

### Setup Commands

**Initial Setup:**
```bash
# Clone repository (if applicable)
git clone <repository-url>
cd takeyourpills

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Set up database
npx prisma migrate dev
npx prisma generate

# Initialize shadcn/ui components (as needed)
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add checkbox
# ... add other components as needed

# Start development server
npm run dev
```

**Database Setup:**
```bash
# Connect to external PostgreSQL server
# Ensure DATABASE_URL in .env.local points to your external PostgreSQL server

# Run migrations (creates tables in external database)
npx prisma migrate dev

# Seed database (if seed file exists)
npx prisma db seed
```

**Note:** For local development, connect to an external PostgreSQL server. The `DATABASE_URL` environment variable should point to your external PostgreSQL instance (e.g., managed service like Supabase, Neon, Railway, or a remote server).

**Development Workflow:**
```bash
# Start dev server
npm run dev          # Runs on http://localhost:3000

# Run tests
npm test             # Unit tests
npm run test:e2e     # E2E tests

# Type checking
npm run type-check   # TypeScript validation

# Linting
npm run lint         # ESLint

# Database management
npx prisma studio    # Open Prisma Studio (database GUI)
npx prisma migrate dev    # Create and apply migration
npx prisma generate       # Regenerate Prisma Client
```

**Environment Variables (.env.local):**
```
# Database (external PostgreSQL server for local development)
DATABASE_URL="postgresql://user:password@external-server:5432/takeyourpills"
# Example: "postgresql://user:password@db.example.com:5432/takeyourpills"
# Or for managed services: "postgresql://user:password@host.region.provider.com:5432/dbname"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"

# Microsoft Entra External ID
AZURE_CLIENT_ID="your-client-id"
AZURE_CLIENT_SECRET="your-client-secret"
AZURE_TENANT_ID="your-tenant-id"
AZURE_REDIRECT_URI="http://localhost:3000/api/auth/callback"
```

---

## Architecture Decision Records (ADRs)

### ADR-001: Next.js App Router Architecture

**Decision:** Use Next.js 15 App Router with API Routes for full-stack application

**Context:** Need React-based frontend with backend API, single codebase for simplicity

**Options Considered:**
- Next.js App Router (chosen)
- Vite + React + separate Express backend
- Remix

**Consequences:**
- ✅ Single codebase, simpler deployment
- ✅ Type sharing between frontend/backend
- ✅ Built-in optimizations (SSR, code splitting)
- ⚠️ Monolithic architecture (can extract API later if needed)

**Status:** Accepted

---

### ADR-002: PostgreSQL + Prisma for Data Persistence

**Decision:** Use PostgreSQL with Prisma ORM

**Context:** Structured medication data, time-based queries, need for ACID guarantees

**Options Considered:**
- PostgreSQL + Prisma (chosen)
- MongoDB + Mongoose
- Supabase (PostgreSQL managed)

**Consequences:**
- ✅ Strong type safety with Prisma
- ✅ Excellent for time-based queries
- ✅ ACID guarantees for healthcare data
- ✅ Migration system built-in
- ⚠️ Requires managed PostgreSQL hosting

**Status:** Accepted

---

### ADR-003: CRON Expression Storage with User-Friendly UI

**Decision:** Store schedules as CRON expressions internally, present user-friendly form interface

**Context:** Need flexible scheduling, but users shouldn't see CRON syntax

**Options Considered:**
- CRON expressions + friendly UI (chosen)
- Custom scheduling format
- Fixed time slots only

**Consequences:**
- ✅ Maximum flexibility (any CRON-mappable schedule)
- ✅ Standard format (CRON is well-understood)
- ✅ Users convert relative prescriptions to concrete times (acceptable tradeoff)
- ⚠️ Requires CRON parsing library

**Status:** Accepted

---

### ADR-004: UTC Storage with User Timezone Preference

**Decision:** Store all times in UTC, convert to user's explicit timezone preference for display

**Context:** Server may be in different timezone, users may travel, need consistency

**Options Considered:**
- UTC storage + user timezone (chosen)
- Browser timezone detection
- Server timezone

**Consequences:**
- ✅ Consistent regardless of server location
- ✅ Handles user travel correctly
- ✅ Explicit user control (no browser inference issues)
- ⚠️ User must set timezone (one-time setup)

**Status:** Accepted

---

### ADR-005: Optimistic UI Updates for Medication Marking

**Decision:** Update UI immediately on checkbox click, sync with backend asynchronously

**Context:** NFR9 requires < 500ms response, user expects instant feedback

**Options Considered:**
- Optimistic updates (chosen)
- Wait for API response
- Skeleton loading states

**Consequences:**
- ✅ Meets < 500ms requirement (instant visual feedback)
- ✅ Better user experience (feels fast)
- ⚠️ Requires rollback logic if API fails
- ⚠️ Need to handle race conditions

**Status:** Accepted

---

### ADR-006: Microsoft Entra External ID for Authentication

**Decision:** Use Microsoft Entra External ID (Azure AD B2C) via OpenID Connect

**Context:** Specified in PRD, enterprise-grade authentication, no custom user management needed

**Options Considered:**
- Microsoft Entra External ID (chosen - specified)
- Auth0
- Clerk
- NextAuth.js

**Consequences:**
- ✅ No custom user management code
- ✅ Enterprise-grade security
- ✅ Handles OAuth flow
- ⚠️ Requires Azure account setup
- ⚠️ Vendor lock-in (acceptable for MVP)

**Status:** Accepted (PRD requirement)

---

_Generated by BMAD Decision Architecture Workflow v1.0_
_Date: 2025-11-19_
_For: Yesca_

