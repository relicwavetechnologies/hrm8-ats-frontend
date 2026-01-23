# HRM8-ATS

**Modern Applicant Tracking System (ATS) and Human Resource Management System (HRMS)**

## Overview

HRM8-ATS is a standalone application extracted from the monolithic hrm8/frontend. It provides comprehensive recruitment and HR management capabilities with a clean, modular architecture.

## Features

### ATS (Applicant Tracking System)
- 📋 **Job Management** - Create, publish, and manage job postings
- 👥 **Candidate Tracking** - Manage candidate profiles and applications
- 📝 **Application Processing** - Review, screen, and process applications
- 📅 **Interview Scheduling** - Schedule and manage interviews
- 💼 **Offer Management** - Create and track job offers
- ✅ **Assessments** - Conduct candidate assessments
- 🔍 **Background Checks** - Automated background verification
- 🤖 **AI Interviews** - AI-powered interview capabilities

### HRMS (Human Resource Management)
- 👔 **Employee Management** - Comprehensive employee records
- 🎯 **Performance Reviews** - Goal tracking and performance management
- 🏖️ **Leave Management** - Leave requests and approvals
- ⏰ **Time & Attendance** - Clock in/out and timesheet management
- 💰 **Payroll** - Payroll processing and compensation management
- 🏥 **Benefits** - Benefits administration
- 📜 **Compliance** - Compliance tracking and reporting
- 📁 **Documents** - Document management
- 🚀 **Onboarding/Offboarding** - Employee lifecycle management

### Additional Modules
- 🤝 **RPO** - Recruitment Process Outsourcing
- 📊 **Analytics** - Advanced analytics and reporting
- ⚙️ **Settings** - System configuration
- 🔔 **Notifications** - Real-time notifications
- 💳 **Wallet** - Billing and payments
- 💬 **Messages** - Internal messaging

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** React Query + Zustand
- **Routing:** React Router v6
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Calendar:** FullCalendar
- **Rich Text:** TipTap

## Project Structure

```
hrm8-ats/
├── src/
│   ├── app/                    # App shell (routing, providers, layouts)
│   ├── modules/                # 26 business modules
│   │   ├── auth/               # Authentication
│   │   ├── jobs/               # Job management
│   │   ├── candidates/         # Candidate management
│   │   ├── applications/       # Application tracking
│   │   ├── employees/          # Employee management
│   │   ├── performance/        # Performance reviews
│   │   └── ...                 # And 20 more modules
│   ├── shared/                 # Shared utilities
│   │   ├── components/         # UI & common components
│   │   ├── hooks/              # Shared hooks
│   │   ├── services/           # API client & services
│   │   ├── types/              # Shared types
│   │   └── lib/                # Utilities
│   ├── pages/                  # Route entry points
│   └── assets/                 # Static assets
├── PLAN.md                     # Extraction plan
├── UPDATES.md                  # Progress tracker
├── PROJECT_STRUCTURE.md        # Architecture docs
└── package.json
```

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Start development server
pnpm dev
```

The application will be available at `http://localhost:8080`

### Available Scripts

```bash
# Development
pnpm dev              # Start dev server

# Build
pnpm build            # Production build
pnpm build:dev        # Development build
pnpm preview          # Preview production build

# Code Quality
pnpm lint             # Run ESLint
pnpm type-check       # TypeScript type checking
```

## Environment Variables

```env
# API Configuration
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000

# Application
VITE_APP_NAME=HRM8 ATS
VITE_APP_ENV=development
```

## Development Guidelines

### Module Structure

Each module follows this structure:

```
modules/[module-name]/
├── components/          # UI components
├── hooks/              # Custom hooks
├── services.ts         # API calls
├── types.ts            # TypeScript types
└── index.ts            # Public exports
```

### Import Paths

Use path aliases for clean imports:

```typescript
// UI components
import { Button } from '@/shared/components/ui'

// Common components
import { PageHeader } from '@/shared/components/common'

// Module components
import { JobCard, useJobs } from '@/modules/jobs'

// Shared utilities
import { cn } from '@/shared/lib/utils'
```

### Code Style

- **TypeScript:** Strict mode enabled
- **Formatting:** Prettier (automatic)
- **Linting:** ESLint
- **Naming:**
  - Components: PascalCase
  - Hooks: camelCase with 'use' prefix
  - Files: Match main export

## Architecture

### Data Flow

```
Pages → Custom Hooks → Services → API Client → Backend
```

### State Management

- **Server State:** React Query (for API data)
- **Client State:** Zustand (for UI state)
- **Form State:** React Hook Form + Zod

### Routing

Route-based code splitting with React Router v6. All routes are protected with authentication guards.

## Documentation

- **PLAN.md** - Complete extraction plan with 1,055+ files
- **PROJECT_STRUCTURE.md** - Detailed architecture documentation
- **UPDATES.md** - Implementation progress tracker

## Backend API

This application uses the same backend API as the monolithic hrm8/frontend. No backend changes are required.

**API Base URL:** `http://localhost:3000`

## Contributing

This is an internal project. For questions or issues, refer to the documentation files.

## License

Proprietary - HRM8

---

**Status:** ✅ Phase 0 Complete (Project Setup)
**Next:** Phase 1 - Shared Foundation Layer (Extract UI & Common Components)

For detailed implementation progress, see `UPDATES.md`.
