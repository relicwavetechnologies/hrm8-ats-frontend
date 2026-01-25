# Automated Codebase Maintenance Guide

## Purpose
This guide instructs AI agents on how to maintain code quality, identify duplications, fix issues, and ensure the codebase stays clean and up-to-date.

## Pre-Maintenance Tasks

### 1. Get Latest Changes
```bash
# Check current branch
git branch --show-current

# Fetch latest changes from remote
git fetch origin

# View what changed since last commit
git log -1 --stat

# View uncommitted changes
git status

# View detailed diff
git diff
```

### 2. Review Recent Commits
```bash
# View last 5 commits
git log -5 --oneline --graph

# View changes in last commit
git show HEAD

# Compare with remote
git log HEAD..origin/main --oneline
```

## Code Quality Checks

### 1. Find Code Duplications

**Frontend (hrm8-ats):**
```bash
cd /Users/abhishekverma/Desktop/Cluster/Projects/hrm8-new/hrm8-ats

# Find duplicate functions (look for similar patterns)
grep -r "export function" src/ --include="*.ts" --include="*.tsx" | sort | uniq -d

# Find duplicate API calls
grep -r "fetch('/api" src/ --include="*.ts" --include="*.tsx" -n

# Find duplicate interfaces/types
grep -r "interface.*{" src/ --include="*.ts" --include="*.tsx" -A 5 | sort
```

**Backend (backend-template):**
```bash
cd /Users/abhishekverma/Desktop/Cluster/Projects/hrm8-new/backend-template

# Find duplicate route definitions
grep -r "router\." src/ --include="*.ts" -n

# Find duplicate service methods
grep -r "async.*(" src/modules --include="*.service.ts" -B 1
```

### 2. Identify Bad Code Patterns

**Common Issues to Check:**

1. **Unused Imports**
   - Search for imports that are never referenced
   - Use TypeScript compiler to find unused variables

2. **Console Logs (should be removed before production)**
   ```bash
   grep -r "console\." src/ --include="*.ts" --include="*.tsx" -n
   ```

3. **TODO/FIXME Comments**
   ```bash
   grep -r "TODO\|FIXME" src/ --include="*.ts" --include="*.tsx" -n
   ```

4. **Hardcoded Values**
   ```bash
   # Look for hardcoded URLs
   grep -r "http://\|https://" src/ --include="*.ts" --include="*.tsx" -n | grep -v "node_modules"
   ```

5. **Missing Error Handling**
   - Search for fetch calls without try-catch
   - Check async functions without error handling

### 3. Type Safety Issues

```bash
# Find 'any' types (should be avoided)
grep -r ": any" src/ --include="*.ts" --include="*.tsx" -n

# Find @ts-ignore comments (indicates type issues)
grep -r "@ts-ignore\|@ts-nocheck" src/ --include="*.ts" --include="*.tsx" -n
```

## Automated Fixes

### 1. Build and Test

**Frontend:**
```bash
cd /Users/abhishekverma/Desktop/Cluster/Projects/hrm8-new/hrm8-ats
npm run build
npm run lint
npm run type-check  # if available
```

**Backend:**
```bash
cd /Users/abhishekverma/Desktop/Cluster/Projects/hrm8-new/backend-template
npm run build
npm run lint  # if available
```

### 2. Fix Common Issues

**Auto-fix linting issues:**
```bash
npm run lint -- --fix
```

**Format code:**
```bash
npx prettier --write "src/**/*.{ts,tsx,js,jsx}"
```

### 3. Remove Unused Code

After identifying duplicates:
1. Extract common code into shared utilities
2. Update all usages to use the shared code
3. Remove duplicate implementations
4. Test that everything still works

## Refactoring Checklist

When refactoring code:

- [ ] Identify duplicate code blocks (3+ lines repeated)
- [ ] Extract to shared utilities/helpers
- [ ] Create proper types/interfaces
- [ ] Add JSDoc comments for exported functions
- [ ] Remove console.logs
- [ ] Replace 'any' with proper types
- [ ] Add error handling where missing
- [ ] Remove unused imports
- [ ] Test the changes
- [ ] Update relevant documentation

## Migration-Specific Tasks

### When Migrating Features from Old to New Codebase:

1. **Study Old Implementation**
   - Read old frontend component in `/hrm8/frontend`
   - Read old backend in `/backend`
   - Document the data flow

2. **Check for Existing New Code**
   - Search if component/feature already exists in new codebase
   - Many features are already implemented but not wired up

3. **Wire Up Existing Code**
   - Connect components to routes
   - Verify API endpoints exist
   - Test the integration

4. **Only Write New Code If Needed**
   - Don't duplicate - reuse existing implementations
   - Follow the new modular structure
   - Adapt old patterns to new architecture

## Commit Guidelines

After making fixes:

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "chore: [brief description]

- Fixed code duplications in [file]
- Removed unused imports
- Improved type safety
- Fixed linting issues
[... detailed list of changes]"

# Push changes
git push origin [branch-name]
```

## Maintenance Schedule

**Daily:**
- Check for TypeScript errors
- Review new TODOs
- Run linting

**Weekly:**
- Scan for code duplications
- Review and consolidate similar components
- Update dependencies (carefully)
- Clean up unused files

**Monthly:**
- Deep code review
- Refactor large duplicate blocks
- Update documentation
- Performance audit

## Tools and Commands Reference

### Useful grep patterns:
```bash
# Find all API endpoint definitions
grep -r "router\.\(get\|post\|put\|delete\)" src/ --include="*.ts" -n

# Find all React components
find src -name "*.tsx" -type f | grep -v ".test." | grep -v "node_modules"

# Find files larger than 500 lines (candidates for splitting)
find src -name "*.ts*" -type f -exec wc -l {} \; | awk '$1 > 500' | sort -rn

# Find files with many dependencies
grep -h "^import" src/**/*.ts* | sort | uniq -c | sort -rn | head -20
```

### Code Metrics:
```bash
# Count total lines of code
find src -name "*.ts*" -type f -exec wc -l {} \; | awk '{sum+=$1} END {print sum}'

# Count files by type
find src -type f | sed 's/.*\.//' | sort | uniq -c | sort -rn
```

## AI Agent Instructions

When running maintenance:

1. Execute the "Pre-Maintenance Tasks" section first
2. Run all "Code Quality Checks"
3. Document findings in UPDATES.md
4. Apply fixes systematically
5. Test after each major change
6. Build both frontend and backend
7. Only commit if builds succeed
8. Update UPDATES.md with what was fixed

**Remember:**
- Always check if code exists before writing new code
- Many features are implemented but not wired up - connect them first
- Follow the migration pattern: study old → implement in new structure
- Test thoroughly before committing
- Keep UPDATES.md current with all changes
