# AI IDE Maintenance Protocol

This document serves as the **SINGLE SOURCE OF TRUTH** for the AI IDE when performing maintenance tasks on the `hrm8-ats` codebase. Run through these steps to ensure the codebase remains clean, efficient, and aligned with `PLAN.md`.

## 1. Environment & Context Verification

Before making changes, establish the current state of the repository.

- **Check Git Status**:
  ```bash
  git status
  ```
  *Ensure the working directory is clean or understand pending changes.*

- **Check Latest Changes**:
  ```bash
  git log -n 5 --oneline
  ```
  *Understand the recent history to avoid undoing recent work.*

## 2. Structural Integrity Check (Crucial)

Refer to [PLAN.md](./PLAN.md) to ensure all new additions follow the defined architecture.

- **Module Structure**:
  Ensure every new feature is located in `src/modules/[module-name]/`.
  - **Correct**: `src/modules/jobs/components/JobCard.tsx`
  - **Incorrect**: `src/components/JobCard.tsx` (unless truly shared)

- **Shared Components**:
  Ensure reusable UI elements are in `src/shared/components/ui` (shadcn) or `src/shared/components/common`.

- **File Naming**:
  - React Components: `PascalCase.tsx`
  - Hooks: `camelCase.ts` (prefix with `use`)
  - Utilities/Services: `camelCase.ts`

## 3. Code Quality & Best Practices

Scan the codebase for "bad practices" and technically debt.

### 3.1 Code Duplication
- **Look for repeated logic**: If you see the same function in multiple files, refactor it into `src/shared/lib` or a custom hook in `src/shared/hooks`.
- **Component duplication**: If a UI pattern appears 3+ times, propose creating a reusable component.

### 3.2 Anti-Patterns to Fix
- **Console Logs**: Remove `console.log` statements used for debugging.
  ```bash
  grep -r "console.log" src
  ```
- **Type Safety**: Avoid `any`. Use specific interfaces or types associated with the module.
- **Hardcoded Values**: Move magic numbers and strings to `constants.ts` or environment variables.
- **Inline Styles**: We use **Tailwind CSS**. Avoid `style={{ ... }}` unless dynamic values are strictly necessary.

### 3.3 Linting & Formatting
Run the linter to catch syntax errors and style violations.
```bash
pnpm run lint
```
*Fix any errors reported by the linter immediately.*

### 3.4 Temporary File Cleanup
- **Shell Scripts**: Remove any temporary `.sh` files created for batch operations (e.g., `fix-imports.sh`, `auto-fix-*.sh`).
  ```bash
  # List them first
  ls *.sh
  # Remove them if they are temporary
  rm *.sh
  ```
  *Ensure you are not deleting essential project scripts (check if they are tracked in git).*


## 4. Build Verification

Always ensure the application builds successfully before finishing a session.

```bash
pnpm run build
```
*If the build fails, PRIORITY #1 is to fix the build errors.*

## 5. Maintenance Routine

When asked to "maintain the codebase" or "cleanup", perform the following sequence:

1.  **Run Git Status**: Check where we are.
2.  **Lint**: `pnpm run lint --fix`
3.  **Cleanup**: Identify and remove temporary `.sh` files.
4.  **Type Check**: Run `tsc` (or `pnpm run type-check` if available) to ensure no TypeScript errors.
5.  **Audit Structure**: Randomly sample 3 recent files and ensure they match `PLAN.md` structure.
6.  **Build**: Run `pnpm run build`.
6.  **Report**: Summarize what was fixed, what structure violations were found, and the build status.

## 6. Self-Correction

If you find yourself creating a file outside of `src/modules` or `src/shared`, **STOP**. Read `PLAN.md` again and find the correct home for that code.
