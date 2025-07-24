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

## Code Style Guidelines
- **Language:** TypeScript strict mode, Zod validation
- **Imports:** Absolute paths (@/components), group external/internal/relative
- **Formatting:** Prettier, 2-space indent, 100 char limit, single quotes
- **Naming:** camelCase (vars/funcs), PascalCase (components), SCREAMING_SNAKE_CASE (constants)
- **Types:** Interfaces for objects, avoid `any`, use `unknown`
- **Error Handling:** Result/Either patterns, proper error boundaries
- **Testing:** TDD mandatory, 85% coverage, `*.test.ts/.tsx` naming

## Security Requirements
- **Multi-tenancy:** Schema-per-tenant isolation, qualify all DB queries with `"${tenantSchema}".table`
- **Validation:** Zod on all inputs, strict LLM-generated SQL validation
- **Auth:** Supabase Auth JWT validation in Express middleware