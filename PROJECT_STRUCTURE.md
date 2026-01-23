# HRM8-ATS Project Structure

**Version:** 1.0.0
**Last Updated:** 2026-01-23
**Architecture:** Modular Monolith

---

## Overview

HRM8-ATS is a standalone Applicant Tracking System (ATS) and Human Resource Management System (HRMS) application extracted from the monolithic hrm8/frontend. It follows a clean, modular architecture with clear separation of concerns.

**Key Principles:**
- **Module Independence:** Each module is self-contained
- **Clean Dependencies:** Modules depend only on shared code, not each other
- **Type Safety:** Comprehensive TypeScript coverage
- **Thin Pages:** Pages only compose module components
- **Service Layer:** Centralized API communication

---

## Directory Structure

```
hrm8-ats/
├── src/
│   ├── app/                    # Application shell
│   │   ├── layouts/            # Layout components
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── DashboardHeader.tsx
│   │   │   ├── AppSidebar.tsx
│   │   │   └── ...
│   │   ├── providers.tsx       # Context providers
│   │   ├── routes.tsx          # Route configuration
│   │   └── App.tsx             # Root component
│   │
│   ├── modules/                # Business modules (26 total)
│   │   ├── auth/               # Authentication
│   │   ├── jobs/               # Job management (ATS)
│   │   ├── candidates/         # Candidate management (ATS)
│   │   ├── applications/       # Application tracking (ATS)
│   │   ├── interviews/         # Interview scheduling (ATS)
│   │   ├── offers/             # Offer management (ATS)
│   │   ├── assessments/        # Candidate assessments (ATS)
│   │   ├── background-checks/  # Background verification (ATS)
│   │   ├── ai-interviews/      # AI-powered interviews (ATS)
│   │   ├── email/              # Email management
│   │   ├── careers-page/       # Public careers page
│   │   ├── import-export/      # Data import/export
│   │   ├── employees/          # Employee management (HRMS)
│   │   ├── performance/        # Performance reviews (HRMS)
│   │   ├── leave/              # Leave management (HRMS)
│   │   ├── attendance/         # Time & attendance (HRMS)
│   │   ├── payroll/            # Payroll processing (HRMS)
│   │   ├── benefits/           # Benefits administration (HRMS)
│   │   ├── compliance/         # Compliance tracking (HRMS)
│   │   ├── documents/          # Document management (HRMS)
│   │   ├── onboarding/         # Employee onboarding (HRMS)
│   │   ├── offboarding/        # Employee offboarding (HRMS)
│   │   ├── rpo/                # Recruitment Process Outsourcing
│   │   ├── settings/           # System settings
│   │   ├── notifications/      # Notification center
│   │   ├── wallet/             # Wallet & billing
│   │   ├── messages/           # Messaging system
│   │   ├── dashboard/          # Dashboard widgets
│   │   └── analytics/          # Analytics & reports
│   │
│   ├── shared/                 # Shared utilities
│   │   ├── components/
│   │   │   ├── ui/            # shadcn/ui components (~50)
│   │   │   ├── common/        # Common components (~30)
│   │   │   └── skeletons/     # Loading skeletons
│   │   ├── hooks/             # Shared hooks (~30)
│   │   ├── services/          # API client, auth, etc.
│   │   ├── types/             # Shared TypeScript types
│   │   └── lib/               # Utilities (cn, formatDate, etc.)
│   │
│   ├── pages/                  # Route entry points (THIN)
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── jobs/
│   │   ├── candidates/
│   │   ├── applications/
│   │   ├── interviews/
│   │   ├── offers/
│   │   ├── assessments/
│   │   ├── background-checks/
│   │   ├── ai-interviews/
│   │   ├── email/
│   │   ├── careers-page/
│   │   ├── import-export/
│   │   ├── employees/
│   │   ├── performance/
│   │   ├── leave/
│   │   ├── attendance/
│   │   ├── payroll/
│   │   ├── benefits/
│   │   ├── compliance/
│   │   ├── documents/
│   │   ├── onboarding/
│   │   ├── offboarding/
│   │   ├── rpo/
│   │   ├── settings/
│   │   ├── notifications/
│   │   ├── wallet/
│   │   ├── messages/
│   │   ├── dashboard/
│   │   └── analytics/
│   │
│   ├── assets/                 # Static assets
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   │
│   ├── main.tsx                # Application entry point
│   └── index.css               # Global styles
│
├── public/                     # Public assets
│   ├── favicon.ico
│   └── ...
│
├── PLAN.md                     # Extraction plan
├── UPDATES.md                  # Progress tracker
├── PROJECT_STRUCTURE.md        # This file
├── README.md                   # Project documentation
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── vite.config.ts              # Vite config
├── tailwind.config.ts          # Tailwind config
├── postcss.config.js           # PostCSS config
├── eslint.config.js            # ESLint config
└── .env.example                # Environment variables template
```

---

## Module Architecture

Every module follows this **consistent structure**:

```
modules/[module-name]/
├── components/          # UI components for this module
│   ├── ComponentA.tsx
│   ├── ComponentB.tsx
│   └── subfolder/      # Max 1 level deep for organization
│       └── SpecializedComponent.tsx
├── hooks/              # Custom hooks for this module (optional)
│   ├── useModuleData.ts
│   └── useModuleAction.ts
├── services.ts         # API calls and business logic
├── types.ts            # TypeScript types for this module
└── index.ts            # Public API exports
```

### Module Responsibilities

#### `components/`
- **Purpose:** Contains all UI components specific to this module
- **Organization:** Can have 1 level of subfolders for complex modules
- **Example:** `modules/jobs/components/JobCard.tsx`
- **Rule:** Components should be focused and reusable within the module

#### `hooks/`
- **Purpose:** Custom React hooks for module-specific logic
- **Organization:** Flat structure, no subfolders
- **Example:** `modules/jobs/hooks/useJobs.ts`
- **Pattern:** Typically wraps services with React Query

```typescript
// modules/jobs/hooks/useJobs.ts
import { useQuery } from '@tanstack/react-query'
import { jobsApi } from '../services'

export function useJobs() {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: jobsApi.getJobs
  })
}
```

#### `services.ts`
- **Purpose:** ALL API calls and data transformations
- **Organization:** Single file, exported as namespace/object
- **Example:** `modules/jobs/services.ts`
- **Pattern:** Uses shared API client

```typescript
// modules/jobs/services.ts
import { api } from '@/shared/services/api'
import { Job, CreateJobDTO } from './types'

export const jobsApi = {
  getJobs: () => api.get<Job[]>('/jobs'),
  getJobById: (id: string) => api.get<Job>(`/jobs/${id}`),
  createJob: (data: CreateJobDTO) => api.post<Job>('/jobs', data),
  updateJob: (id: string, data: Partial<Job>) =>
    api.patch<Job>(`/jobs/${id}`, data),
  deleteJob: (id: string) => api.delete(`/jobs/${id}`)
}
```

#### `types.ts`
- **Purpose:** TypeScript types and interfaces for this module
- **Organization:** Single file, all exports
- **Example:** `modules/jobs/types.ts`
- **Rule:** Only module-specific types; shared types go in `shared/types/`

```typescript
// modules/jobs/types.ts
export interface Job {
  id: string
  title: string
  status: JobStatus
  // ... other fields
}

export type JobStatus = 'draft' | 'active' | 'closed' | 'archived'

export interface CreateJobDTO {
  title: string
  description: string
  // ... other fields
}
```

#### `index.ts`
- **Purpose:** Public API of the module
- **Organization:** Barrel exports
- **Rule:** Only export what other parts of the app should use

```typescript
// modules/jobs/index.ts
// Export components
export * from './components/JobCard'
export * from './components/JobFilters'
export * from './components/JobsList'

// Export hooks
export * from './hooks/useJobs'
export * from './hooks/useCreateJob'

// Export types (if needed by other modules)
export type { Job, JobStatus } from './types'

// DO NOT export:
// - Internal components
// - Services (use hooks instead)
// - Internal utilities
```

---

## Page Architecture

Pages are **THIN** - they only compose module components and handle routing.

```typescript
// pages/jobs/JobsPage.tsx
import { JobsFilterBar, JobsList, useJobs } from '@/modules/jobs'
import { PageHeader } from '@/shared/components/common'

export default function JobsPage() {
  const { jobs, isLoading } = useJobs()

  return (
    <div className="space-y-6">
      <PageHeader title="Jobs" />
      <JobsFilterBar />
      <JobsList jobs={jobs} loading={isLoading} />
    </div>
  )
}
```

**Rules:**
- ✅ Import from modules
- ✅ Handle routing/navigation
- ✅ Compose components
- ❌ No business logic
- ❌ No direct API calls
- ❌ No complex state management

---

## Shared Code Organization

### `shared/components/ui/`
- **Purpose:** shadcn/ui components
- **Source:** Extracted from hrm8/frontend
- **Count:** ~50 components
- **Examples:** Button, Dialog, Card, Table, Form, etc.

### `shared/components/common/`
- **Purpose:** Common reusable components
- **Source:** Extracted from hrm8/frontend
- **Count:** ~30 components
- **Categories:**
  - Authentication: AuthGuard, ProtectedRoutes
  - Permissions: PermissionGate, ModuleAccessGuard
  - Search: GlobalSearch, SearchInput
  - Forms: FormWizard, FormBuilder
  - Export: ExportButton, ExportDialog
  - UI: PageHeader, FilterDropdown, ThemeToggle

### `shared/hooks/`
- **Purpose:** Shared React hooks
- **Count:** ~30 hooks
- **Categories:**
  - Utilities: use-debounce, use-mobile, useMediaQuery
  - Auth: useAuthAdapter, useRBAC, useRole
  - State: useDashboardLayout, useSidebarState
  - Notifications: useNotifications, useToast
  - Data: useRecentRecords, useCompanyProfile

### `shared/services/`
- **Purpose:** Core services used across the app
- **Files:**
  - `api.ts` - Axios instance with interceptors
  - `authService.ts` - Authentication logic
  - `notificationService.ts` - Notification management
  - `messagingService.ts` - WebSocket messaging

### `shared/types/`
- **Purpose:** Types shared across multiple modules
- **Examples:**
  - `user.ts` - User types
  - `company.ts` - Company types
  - `notification.ts` - Notification types
  - `rbac.ts` - Role-based access control types
  - `audit.ts` - Audit logging types

### `shared/lib/`
- **Purpose:** Utility functions
- **Files:**
  - `utils.ts` - Common utilities (cn, formatDate, etc.)
  - `constants.ts` - Application constants

---

## Import Paths

### TypeScript Path Aliases

Configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/app/*": ["./src/app/*"],
      "@/modules/*": ["./src/modules/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/pages/*": ["./src/pages/*"],
      "@/assets/*": ["./src/assets/*"]
    }
  }
}
```

### Import Patterns

```typescript
// ✅ Good - Use path aliases
import { Button } from '@/shared/components/ui'
import { PageHeader } from '@/shared/components/common'
import { JobCard, useJobs } from '@/modules/jobs'
import { useAuth } from '@/shared/hooks'
import type { User } from '@/shared/types'

// ❌ Bad - Relative imports for cross-module
import { Button } from '../../../shared/components/ui/button'

// ✅ OK - Relative imports within same module
import { JobCard } from './JobCard'
import { jobsApi } from '../services'
```

---

## Data Flow

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         User Interface                       │
│                     (Pages + Components)                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ uses
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Custom Hooks                            │
│              (useJobs, useCreateJob, etc.)                   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ wraps with React Query
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                             │
│               (jobsApi, candidatesApi, etc.)                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ uses
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Client                                │
│                  (axios instance)                            │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ HTTP requests
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API                               │
│              (Same as hrm8/frontend)                         │
└─────────────────────────────────────────────────────────────┘
```

### Example Flow: Creating a Job

1. **User Action:**
   ```typescript
   // pages/jobs/CreatePage.tsx
   <JobWizard onSubmit={handleSubmit} />
   ```

2. **Component Uses Hook:**
   ```typescript
   // modules/jobs/components/JobWizard.tsx
   const { mutate: createJob } = useCreateJob()
   ```

3. **Hook Wraps Service:**
   ```typescript
   // modules/jobs/hooks/useCreateJob.ts
   export function useCreateJob() {
     return useMutation({
       mutationFn: jobsApi.createJob
     })
   }
   ```

4. **Service Calls API:**
   ```typescript
   // modules/jobs/services.ts
   export const jobsApi = {
     createJob: (data: CreateJobDTO) =>
       api.post<Job>('/jobs', data)
   }
   ```

5. **API Client Handles Request:**
   ```typescript
   // shared/services/api.ts
   const api = axios.create({
     baseURL: import.meta.env.VITE_API_URL
   })
   ```

---

## State Management

### Server State (React Query)
- **Purpose:** All server data (jobs, candidates, etc.)
- **Library:** @tanstack/react-query
- **Pattern:** Hooks wrap services

```typescript
// Query
const { data: jobs } = useJobs()

// Mutation
const { mutate: createJob } = useCreateJob()
```

### Client State (Zustand)
- **Purpose:** UI state (sidebar open, theme, etc.)
- **Library:** zustand
- **Pattern:** Minimal usage, prefer local state

```typescript
// shared/hooks/useSidebarState.ts
import { create } from 'zustand'

export const useSidebarState = create((set) => ({
  isOpen: true,
  toggle: () => set((state) => ({ isOpen: !state.isOpen }))
}))
```

### Form State (React Hook Form)
- **Purpose:** Form handling
- **Library:** react-hook-form + zod
- **Pattern:** Schema validation

```typescript
const form = useForm<CreateJobDTO>({
  resolver: zodResolver(createJobSchema),
  defaultValues: {...}
})
```

---

## Routing

### Route Structure

```typescript
// app/routes.tsx
import { Routes, Route } from 'react-router-dom'

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route element={<AuthGuard><DashboardLayout /></AuthGuard>}>
        <Route path="/" element={<HomePage />} />

        {/* ATS */}
        <Route path="/jobs/*" element={<JobsRoutes />} />
        <Route path="/candidates/*" element={<CandidatesRoutes />} />
        <Route path="/applications/*" element={<ApplicationsRoutes />} />

        {/* HRMS */}
        <Route path="/employees/*" element={<EmployeesRoutes />} />
        <Route path="/performance/*" element={<PerformanceRoutes />} />

        {/* System */}
        <Route path="/settings/*" element={<SettingsRoutes />} />
      </Route>
    </Routes>
  )
}
```

### Nested Routes Pattern

```typescript
// pages/jobs/routes.tsx
export function JobsRoutes() {
  return (
    <Routes>
      <Route index element={<JobsPage />} />
      <Route path="new" element={<CreatePage />} />
      <Route path=":id" element={<DetailPage />} />
      <Route path=":id/edit" element={<EditPage />} />
      <Route path="templates" element={<TemplatesPage />} />
      <Route path="analytics" element={<AnalyticsPage />} />
    </Routes>
  )
}
```

---

## Styling

### Tailwind CSS
- **Utility-first** CSS framework
- **Configuration:** `tailwind.config.ts`
- **Theme:** Custom colors, fonts, spacing

### Component Styles
```typescript
// Use cn() utility for conditional classes
import { cn } from '@/shared/lib/utils'

<div className={cn(
  "base-class",
  isActive && "active-class",
  className // Allow override
)} />
```

### CSS Variables
```css
/* index.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  /* ... */
}
```

---

## Environment Configuration

### Environment Variables

```env
# .env.example
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=HRM8 ATS
VITE_WS_URL=ws://localhost:3000
```

### Usage

```typescript
const apiUrl = import.meta.env.VITE_API_URL
const appName = import.meta.env.VITE_APP_NAME
```

---

## Build & Development

### Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx",
    "type-check": "tsc --noEmit"
  }
}
```

### Development Server
```bash
pnpm dev
# Opens at http://localhost:5173
```

### Production Build
```bash
pnpm build
# Output: dist/
```

---

## Module Dependency Graph

```
┌─────────────┐
│   Pages     │ ─┐
└─────────────┘  │
                 │
┌─────────────┐  │  Import
│  Modules    │ ◄┘  from
└─────────────┘  ┐
                 │
┌─────────────┐  │  Import
│   Shared    │ ◄┘  from
└─────────────┘

Rules:
- Pages can import from Modules and Shared
- Modules can import from Shared
- Modules CANNOT import from other Modules
- Shared CANNOT import from Modules or Pages
```

---

## Testing Strategy

### Unit Tests
- **Framework:** Vitest
- **Location:** `*.test.tsx` next to component
- **Coverage:** Components, hooks, utilities

### Integration Tests
- **Framework:** Vitest + Testing Library
- **Location:** `*.integration.test.tsx`
- **Coverage:** User flows, API integration

### E2E Tests (Future)
- **Framework:** Playwright
- **Location:** `e2e/`
- **Coverage:** Critical user journeys

---

## Performance Considerations

### Code Splitting
- **Route-based:** Automatic with React Router
- **Component-based:** Use `React.lazy()` for heavy components

```typescript
const HeavyComponent = React.lazy(() =>
  import('./HeavyComponent')
)
```

### React Query Optimization
- **Stale Time:** Configure per query
- **Cache Time:** Configure per query
- **Prefetching:** On navigation

### Bundle Size
- **Tree Shaking:** Vite handles automatically
- **Lazy Loading:** For large modules
- **Asset Optimization:** Images, fonts

---

## Security

### Authentication
- **JWT tokens** stored in httpOnly cookies
- **Refresh token** rotation
- **Auto logout** on token expiration

### Authorization
- **Route guards:** `<AuthGuard>` component
- **Permission gates:** `<PermissionGate>` component
- **API level:** Backend enforces permissions

### XSS Prevention
- **React escaping:** Built-in
- **DOMPurify:** For user HTML content
- **CSP headers:** Configured in backend

---

## Conventions

### Naming

```typescript
// Components: PascalCase
JobCard.tsx
CreateJobDialog.tsx

// Hooks: camelCase with 'use' prefix
useJobs.ts
useCreateJob.ts

// Services: camelCase
jobsApi
candidatesApi

// Types: PascalCase
Job, CreateJobDTO, JobStatus

// Files: Match main export
JobCard.tsx exports JobCard component
useJobs.ts exports useJobs hook
```

### File Organization

```
✅ Group by feature (module), not by type
modules/jobs/components/JobCard.tsx
modules/jobs/hooks/useJobs.ts

❌ Not by type
components/JobCard.tsx
hooks/useJobs.ts
```

### Code Style

- **Prettier:** Automatic formatting
- **ESLint:** Code quality rules
- **TypeScript:** Strict mode enabled

---

## Documentation Standards

### Component Documentation

```typescript
/**
 * JobCard displays a summary of a job posting.
 *
 * @param job - The job object to display
 * @param onEdit - Callback when edit button is clicked
 * @param onDelete - Callback when delete button is clicked
 */
export function JobCard({ job, onEdit, onDelete }: JobCardProps) {
  // ...
}
```

### Hook Documentation

```typescript
/**
 * Hook for fetching and managing jobs list.
 *
 * @returns Query result with jobs data, loading state, and error
 *
 * @example
 * const { data: jobs, isLoading } = useJobs()
 */
export function useJobs() {
  // ...
}
```

---

## Migration Notes

### Source Application
- **Path:** `/Users/abhishekverma/Desktop/Cluster/Projects/hrm8-new/hrm8/frontend`
- **Type:** Monolithic React application
- **Shared Backend:** No backend changes required

### Extraction Strategy
1. **Preserve Functionality:** 100% feature parity
2. **Improve Structure:** Modular architecture
3. **Same Routes:** Keep all route patterns
4. **Same API:** Use existing backend API

### Key Changes
- **Before:** All code in single app
- **After:** Separated into modules
- **Before:** Inconsistent structure
- **After:** Consistent module pattern
- **Before:** Mixed concerns
- **After:** Clear separation of concerns

---

## Additional Resources

### Documentation
- See `PLAN.md` for extraction plan
- See `UPDATES.md` for progress tracking
- See `README.md` for getting started

### External Dependencies
- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [React Query](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)

---

**For Questions or Issues:**
Refer to PLAN.md for detailed extraction instructions or UPDATES.md for current progress.
