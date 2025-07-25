# AGENTS.md - Development Guidelines

## Technology Stack
AIAlpha: Multi-tenant SaaS Data Visualization Platform (React/TypeScript, Node.js/Express, Supabase PostgreSQL)

## Build/Test Commands
- `npm run dev` - Start both backend and frontend development servers
- `npm run build` - Build both backend and frontend for production  
- `npm run test` - Run all tests (backend + frontend)
- `npm run test:watch` - Run tests in watch mode
- `npm run test:backend` - Run backend tests only
- `npm run test:frontend` - Run frontend tests only
- `cd backend && npm test -- --testNamePattern="test name"` - Run single backend test by name
- `cd frontend && npm test -- path/to/test.test.tsx` - Run single frontend test file
- `npm run lint` - Run ESLint on both projects
- `npm run typecheck` - Run TypeScript checking on both projects

## Project Structure
- `backend/` - Express.js API (port 3001)
- `frontend/` - React app (port 5173)  
- `shared/` - Shared TypeScript types

## 🚨 CRITICAL: Test-Driven Development (TDD) Methodology

**MANDATORY PROCESS - NO EXCEPTIONS:**

### Red-Green-Refactor Cycle
1. **🔴 RED:** Write failing test FIRST - before any implementation
2. **🟢 GREEN:** Write minimal code to make test pass
3. **🔄 REFACTOR:** Improve code while keeping tests green
4. **REPEAT:** Add more tests following same cycle

### TDD Rules (STRICTLY ENFORCED)
- **NEVER write implementation before tests**
- **ALWAYS start with failing test**
- **do not comment out tests and do not write mock tests or functions**
- **Refactor only with green tests**
- **Achieve 85%+ coverage naturally**
- **all issues to be raised as git issues and documented in /plans/defects.md**

### Example TDD Workflow
```bash
# 1. Write failing test
npm test -- --testPathPattern="feature.test.ts"  # Should FAIL

# 2. Write minimal implementation
npm test -- --testPathPattern="feature.test.ts"  # Should PASS

# 3. Refactor and verify
npm test -- --testPathPattern="feature.test.ts"  # Should STILL PASS

# 4. Check coverage
npm test -- --coverage --testPathPattern="feature.test.ts"
```

### TDD Benefits Realized
- **Better Design:** Tests drive API contracts
- **Higher Coverage:** Natural 90%+ coverage without forcing
- **Fewer Bugs:** Comprehensive edge case testing
- **Easier Refactoring:** Safety net of tests
- **Living Documentation:** Tests describe expected behavior

## Code Style Guidelines
- **Language:** TypeScript strict mode, explicit return types required, Zod validation
- **Imports:** Absolute paths (@/), group external/internal/relative, no unused imports
- **Formatting:** Prettier (2-space indent, 100 char limit, single quotes, semicolons, trailing commas)
- **Naming:** camelCase (vars/funcs), PascalCase (components/classes), SCREAMING_SNAKE_CASE (constants)
- **Types:** Interfaces for objects, explicit function return types, avoid `any` (ESLint error), prefer `unknown`
- **Error Handling:** Zod validation, custom error classes, proper HTTP status codes, structured ApiResponse
- **Testing:** TDD mandatory, Jest (backend) + Vitest (frontend), 85% coverage threshold, `*.test.ts/.tsx` naming
- **Classes:** Use class syntax for controllers/services, arrow functions for methods to preserve `this`

## Security Requirements
- **Multi-tenancy:** Schema-per-tenant isolation, qualify all DB queries with `"${tenantSchema}".table`
- **Validation:** Zod on all inputs, strict LLM-generated SQL validation
- **Auth:** Supabase Auth JWT validation in Express middleware

## Development Quality Gates
- **Phase Gate 1:** All tests must pass before proceeding
- **Phase Gate 2:** 85%+ test coverage required
- **Phase Gate 3:** TypeScript strict mode compliance
- **Phase Gate 4:** ESLint and Prettier compliance
- **Phase Gate 5:** Security validation (tenant isolation, input validation)