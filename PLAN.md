# Comprehensive Migration & Maintenance Plan

## Project Overview

This document provides complete guidance for migrating features from the old codebase to the new, better-structured architecture. **Read UPDATES.md alongside this document** to understand what has already been done and learn from past solutions.

---

## Directory Structure

### Old Codebase (Reference - DO NOT MODIFY)
```
OLD_PROJECT_ROOT/
├── backend/                    # Old backend
│   ├── src/
│   │   ├── controllers/       # API endpoint handlers
│   │   ├── services/          # Business logic
│   │   ├── routes/            # Route definitions
│   │   ├── models/            # Database models
│   │   └── middleware/        # Authentication, validation
│   └── prisma/schema.prisma   # Database schema
│
└── hrm8/frontend/             # Old frontend (Full monolithic app)
    └── src/
        ├── pages/             # All page components
        ├── components/        # Shared components
        ├── lib/              # Utilities and services
        ├── types/            # TypeScript types
        ├── services/         # API service clients
        └── contexts/         # React contexts
```

### New Codebase (Active Development - MODIFY HERE)
```
NEW_PROJECT_ROOT/
├── backend-template/          # New backend (Better organized)
│   └── src/
│       ├── modules/           # Feature-based modules
│       │   ├── auth/
│       │   ├── job/
│       │   ├── wallet/
│       │   └── [feature]/
│       ├── core/              # Base classes
│       ├── middlewares/       # Shared middleware
│       └── utils/             # Utilities
│
└── hrm8-ats/                  # New frontend (HR Management Module ONLY)
    └── src/
        ├── app/               # App configuration
        │   ├── layouts/       # Layout components
        │   └── routes.tsx     # Route definitions
        ├── modules/           # Feature modules
        │   ├── jobs/
        │   ├── candidates/
        │   └── [feature]/
        ├── shared/            # Shared across modules
        │   ├── components/    # UI components
        │   ├── hooks/         # Custom hooks
        │   ├── lib/           # Utilities
        │   ├── services/      # API clients
        │   └── types/         # TypeScript types
        ├── pages/             # Page components
        ├── contexts/          # React contexts
        └── utils/             # App-specific utils
```

---

## Important Context

### What is the New Frontend?
The **new frontend (hrm8-ats)** is NOT a complete replacement of the old frontend. It is:
- **Only the HR Management/ATS section** extracted from the old monolithic app
- A separate, focused application for recruitment and HR management
- Will be joined by other focused apps in the future (e.g., separate finance app, sales app)
- Uses a **modular architecture** instead of monolithic structure

### What to Migrate?
When migrating from old to new:
- ✅ **DO migrate**: HR management, ATS, recruitment, jobs, candidates, applications, interviews, offers, employees, performance, payroll, benefits, etc.
- ❌ **DON'T migrate**: Features outside HR scope (they'll be in separate apps later)

---

## Migration Process: Step-by-Step Guide

### When You Encounter an Issue/Bug

**ALWAYS follow this process:**

1. **Read UPDATES.md First**
   - Check if a similar issue was solved before
   - Look for patterns in how previous issues were resolved
   - Understand what import path fixes were already applied

2. **Understand the Issue**
   - What feature/page is broken?
   - What error message do you see?
   - Is it a missing component, wrong import, missing API, or data format mismatch?

3. **Locate in Old Codebase**
   - Find the working implementation in old frontend/backend
   - Understand the complete flow: Component → API → Service → Database

4. **Check New Codebase**
   - Is the feature partially implemented?
   - Are components/APIs already present but not wired up?
   - What's missing or incorrect?

5. **Apply Fix Following New Structure**
   - Adapt old patterns to new modular structure
   - Fix import paths
   - Test the complete flow

---

## How to Find Files in Old Codebase

### Finding Frontend Components
```bash
# Search for a page/component
find OLD_FRONTEND_PATH/src/pages -name "*FeatureName*"
find OLD_FRONTEND_PATH/src/components -name "*ComponentName*"

# Search for code that uses a specific API
grep -r "'/api/endpoint'" OLD_FRONTEND_PATH/src --include="*.tsx"

# Find service files
find OLD_FRONTEND_PATH/src/lib -name "*Service.ts"
find OLD_FRONTEND_PATH/src/services -name "*Service.ts"
```

### Finding Backend Code
```bash
# Find route definitions
grep -r "router.get\|router.post" OLD_BACKEND_PATH/src/routes --include="*.ts"

# Find controllers
find OLD_BACKEND_PATH/src/controllers -name "*Controller.ts"

# Find services
find OLD_BACKEND_PATH/src/services -name "*Service.ts"

# Find specific API endpoint
grep -r "'/api/your-endpoint'" OLD_BACKEND_PATH/src --include="*.ts"
```

---

## Common Migration Patterns

### Pattern 1: Page Component Migration

#### Old Frontend Structure:
```
OLD_FRONTEND/src/pages/FeatureName.tsx
```

#### New Frontend Structure:
```
NEW_FRONTEND/src/pages/feature-name/FeatureName.tsx
```

**Steps:**
1. Copy the page component from old to new location
2. Fix import paths (see Import Path Mapping below)
3. Add lazy import to `routes.tsx`
4. Add route definition with Suspense wrapper

**Example:**
```tsx
// In routes.tsx - Add lazy import
const FeatureNamePage = lazy(() => import('@/pages/feature-name/FeatureName'));

// Add route
<Route path="/feature-name" element={
    <Suspense fallback={<PageLoader />}>
        <FeatureNamePage />
    </Suspense>
} />
```

### Pattern 2: API Service Migration

#### Old Frontend:
```typescript
// OLD_FRONTEND/src/lib/api/featureService.ts
export const getFeatures = async () => {
    const response = await fetch('/api/features');
    return response.json();
}
```

#### New Frontend:
```typescript
// NEW_FRONTEND/src/shared/lib/api/featureService.ts
// OR
// NEW_FRONTEND/src/modules/feature/lib/featureService.ts
export const getFeatures = async () => {
    const response = await fetch('/api/features');
    return response.json();
}
```

### Pattern 3: Backend API Migration

#### Old Backend:
```
OLD_BACKEND/src/
├── routes/feature.ts          # Route definitions
├── controllers/featureController.ts
└── services/featureService.ts
```

#### New Backend:
```
NEW_BACKEND/src/modules/feature/
├── feature.routes.ts          # Route definitions
├── feature.controller.ts      # Controller class
└── feature.service.ts         # Service class
```

**Key Differences:**
- New backend uses **classes** instead of plain functions
- Controllers extend `BaseController` with `sendSuccess()` and `sendError()` methods
- Services are static class methods
- Better separation of concerns

**Example Migration:**

**Old Backend Controller:**
```typescript
// OLD: Plain function
export const getFeatures = async (req: Request, res: Response) => {
    const features = await FeatureService.getAll();
    res.json({ success: true, data: features });
}
```

**New Backend Controller:**
```typescript
// NEW: Class-based with BaseController
export class FeatureController extends BaseController {
    getAll = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const features = await FeatureService.getAll();
            return this.sendSuccess(res, features);
        } catch (error) {
            return this.sendError(res, error);
        }
    };
}
```

---

## Import Path Mapping

### Old Frontend → New Frontend

**CRITICAL: All imports must be updated when copying code!**

| Old Import Path | New Import Path | Notes |
|----------------|-----------------|-------|
| `@/components/` | `@/shared/components/` | Shared UI components |
| `@/hooks/` | `@/shared/hooks/` | Custom React hooks |
| `@/lib/` | `@/shared/lib/` | Utilities and helpers |
| `@/types/` | `@/shared/types/` | TypeScript types |
| `@/services/` | `@/shared/services/` | API service clients |
| `@/data/` | `@/shared/data/` | Mock data, constants |
| `@/utils/` | `@/shared/lib/utils` or `@/utils/` | Utility functions |
| N/A | `@/app/` | App-level code (layouts, routes) |
| N/A | `@/modules/` | Feature-specific modules |
| N/A | `@/pages/` | Page components |
| N/A | `@/contexts/` | React contexts |
| N/A | `@/config/` | Configuration files |
| N/A | `@/assets/` | Static assets |

**Automated Fix Command:**
```bash
# After copying a file from old to new, run:
sed -i '' \
  -e 's|@/components/|@/shared/components/|g' \
  -e 's|@/hooks/|@/shared/hooks/|g' \
  -e 's|@/lib/|@/shared/lib/|g' \
  -e 's|@/types/|@/shared/types/|g' \
  -e 's|@/services/|@/shared/services/|g' \
  -e 's|@/data/|@/shared/data/|g' \
  YOUR_FILE.tsx
```

---

## Backend API Response Format

### Old Backend Response Format:
```json
{
  "success": true,
  "data": { ... }
}
```

### New Backend Response Format:
**Same!** The new backend maintains compatibility:
```json
{
  "success": true,
  "data": { ... }
}
```

**Important Notes:**
- `BaseController.sendSuccess(res, data)` automatically wraps data in `{ success: true, data: ... }`
- **DON'T double-wrap**: Use `sendSuccess(res, array)` not `sendSuccess(res, { array })`
- Frontend expects direct data in the `data` field

**Common Mistake:**
```typescript
// ❌ WRONG - Double wrapping
return this.sendSuccess(res, { subscriptions: subscriptions });
// Frontend gets: { success: true, data: { subscriptions: [...] } }

// ✅ CORRECT
return this.sendSuccess(res, subscriptions);
// Frontend gets: { success: true, data: [...] }
```

---

## Common Issues and Solutions

### Issue 1: Page Shows "Under Construction"

**Diagnosis:**
```tsx
// In routes.tsx
<Route path="/feature" element={<ComingSoon title="Feature" />} />
```

**Solution:**
1. Check if page component exists: `find NEW_FRONTEND/src/pages -name "*Feature*"`
2. If NOT exists: Copy from old frontend
3. If exists: Wire it up in routes.tsx
4. Always wrap in Suspense with PageLoader

### Issue 2: Import Path Errors

**Diagnosis:**
```
Failed to resolve import "@/components/ui/card"
```

**Solution:**
1. Check the import path
2. Update to new modular path: `@/shared/components/ui/card`
3. Verify file exists at that location
4. Check `vite.config.ts` and `tsconfig.json` for path aliases

### Issue 3: API Not Returning Data

**Diagnosis:**
- Frontend receives empty response or wrong format

**Investigation Steps:**
1. Check browser Network tab - what's the actual response?
2. Find the API endpoint in new backend: `grep -r "'/api/endpoint'" NEW_BACKEND/src`
3. Compare with old backend implementation
4. Check response format - is data double-wrapped?

**Common Solutions:**
- Fix response format (remove double wrapping)
- Add missing fields to response
- Update service layer to return correct data shape

### Issue 4: Component Not Found

**Diagnosis:**
```
Module not found: Can't resolve '@/components/FeatureComponent'
```

**Solution:**
1. Search in new frontend: `find NEW_FRONTEND/src -name "FeatureComponent*"`
2. If not found, search in old: `find OLD_FRONTEND/src -name "FeatureComponent*"`
3. Copy to appropriate location in new structure
4. Fix import paths in the copied file
5. Update import in the file that's trying to use it

### Issue 5: Missing Types/Interfaces

**Diagnosis:**
```
Cannot find name 'FeatureType'
```

**Solution:**
1. Search old frontend: `grep -r "interface FeatureType\|type FeatureType" OLD_FRONTEND/src`
2. Copy to `NEW_FRONTEND/src/shared/types/`
3. Update imports to use new path
4. Ensure it's exported properly

---

## Database Schema Considerations

Both old and new backends use **Prisma** with the **same database schema**.

**Important:**
- Database models are compatible between old and new
- Field names may differ (snake_case in DB, camelCase in code)
- New backend uses Prisma client at `src/utils/prisma.ts`
- Check `prisma/schema.prisma` for current schema

**Mapping Example:**
```typescript
// Database field: company_id
// Old backend code: companyId
// New backend code: companyId (same)

// When querying:
const company = await prisma.company.findUnique({
    where: { company_id: id }  // DB uses snake_case
});
// Returns: { company_id: "...", ... }

// Service layer maps to camelCase for API response
```

---

## Testing Your Changes

### 1. Frontend Testing
```bash
cd NEW_FRONTEND
npm run dev
```

**Checklist:**
- [ ] Page loads without errors
- [ ] No console errors in browser
- [ ] Data displays correctly
- [ ] UI interactions work
- [ ] Navigation doesn't reload sidebar/navbar

### 2. Backend Testing
```bash
cd NEW_BACKEND
npm run dev
```

**Test API directly:**
```bash
# Test endpoint
curl http://localhost:3000/api/endpoint

# With authentication (copy token from browser)
curl http://localhost:3000/api/endpoint \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Full Flow Testing
1. Login to the app
2. Navigate to the feature you modified
3. Perform all user actions
4. Check Network tab for API calls
5. Verify data is correct
6. Check for console errors

---

## Debugging Strategies

### Frontend Debugging

**1. Check Browser Console**
- React component errors
- Network request failures
- Import/module errors

**2. Check Network Tab**
- API request/response
- Status codes
- Response format

**3. React DevTools**
- Component props
- State values
- Context values

**4. Add Debug Logs**
```tsx
console.log('Component rendered with props:', props);
console.log('API response:', data);
```

### Backend Debugging

**1. Check Server Logs**
- Look for error stack traces
- Check which route is being hit
- Verify middleware execution

**2. Add Debug Logs**
```typescript
console.log('[FeatureController] getAll called');
console.log('[FeatureService] data:', data);
```

**3. Test Prisma Queries**
```typescript
// Add logging to see generated SQL
const result = await prisma.feature.findMany();
console.log('Query result:', result);
```

---

## Architectural Differences Summary

| Aspect | Old Codebase | New Codebase |
|--------|-------------|--------------|
| **Frontend Structure** | Monolithic, all features together | Modular, feature-based organization |
| **Backend Controllers** | Plain functions | Classes extending BaseController |
| **Backend Services** | Mixed approaches | Static class methods |
| **Import Paths** | Flat structure (@/components) | Organized (@/shared/components) |
| **Route Organization** | Single routes folder | Module-based routes |
| **Type Definitions** | Scattered | Centralized in @/shared/types |
| **Code Splitting** | Limited | Lazy loading for all pages |
| **Layout Persistence** | May reload | Persistent sidebar/navbar |

---

## Quick Reference Commands

### Finding Code
```bash
# Find a page in old frontend
find OLD_FRONTEND/src/pages -name "*PageName*"

# Find API usage in old frontend
grep -r "'/api/endpoint'" OLD_FRONTEND/src --include="*.tsx"

# Find controller in old backend
grep -r "export.*PageName" OLD_BACKEND/src/controllers --include="*.ts"

# Find component in new frontend
find NEW_FRONTEND/src -name "*ComponentName*"
```

### Fixing Imports
```bash
# Fix imports in a single file
sed -i '' 's|@/components/|@/shared/components/|g' file.tsx

# Fix imports in all files in a directory
find src/pages/feature -name "*.tsx" -exec \
  sed -i '' 's|@/components/|@/shared/components/|g' {} +
```

### Adding New Routes
```typescript
// 1. Create lazy import
const NewPage = lazy(() => import('@/pages/new/NewPage'));

// 2. Add route inside DashboardLayout Route
<Route path="/new-feature" element={
    <Suspense fallback={<PageLoader />}>
        <NewPage />
    </Suspense>
} />
```

---

## Working with AI Agents

### What to Provide to AI
When asking AI to fix an issue, provide:
1. **This PLAN.md file** (for context)
2. **UPDATES.md file** (for past solutions)
3. **The specific issue/error message**
4. **Which feature/page is affected**

### What AI Should Do
The AI agent should automatically:
1. Read PLAN.md and UPDATES.md first
2. Search for the feature in old codebase
3. Compare with new codebase
4. Identify what's missing or broken
5. Apply fix following new structure patterns
6. Update UPDATES.md with the solution
7. Test the fix

### AI Guidelines
**When you (AI) encounter an issue:**

1. ✅ **DO:**
   - Search old codebase for working implementation
   - Adapt patterns to new structure
   - Fix import paths automatically
   - Check if feature already exists but isn't wired up
   - Update UPDATES.md with your solution
   - Use generic paths (OLD_FRONTEND, NEW_BACKEND)

2. ❌ **DON'T:**
   - Copy code blindly without adapting imports
   - Create new implementations when old one exists
   - Modify old codebase
   - Use hardcoded absolute paths
   - Skip checking UPDATES.md for similar past issues

---

## Logging Your Work in UPDATES.md

**Every time you fix something, add an entry:**

```markdown
### [Date] - [Feature/Issue Name]
**Status**: ✅ Completed / 🔄 In Progress / ⚠️ Blocked

**Problem**:
Brief description of the issue

**Root Cause**:
What was wrong

**Solution**:
What you did to fix it

**Files Modified**:
- path/to/file1.tsx
- path/to/file2.ts

**Files Created**:
- path/to/newfile.tsx

**Learnings**:
Any patterns or insights for future reference
```

---

## Conclusion

This plan ensures consistency and quality in the migration process. By following these guidelines:
- Any developer/AI can understand the codebase structure
- Migration is systematic and repeatable
- Issues are documented for future reference
- Code quality remains high
- The new architecture benefits are preserved

**Remember:** Always check UPDATES.md before starting new work - someone may have already solved a similar problem!

---

## Quick Start Checklist for New Issues

- [ ] Read this PLAN.md completely
- [ ] Check UPDATES.md for similar issues
- [ ] Identify the affected feature/page
- [ ] Find working implementation in old codebase
- [ ] Check if feature exists in new codebase
- [ ] Apply fix following new structure patterns
- [ ] Fix all import paths
- [ ] Test the complete flow
- [ ] Update UPDATES.md with solution
- [ ] Commit changes with clear message
