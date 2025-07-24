# AGENTS.md - Development Guidelines

## Technology Stack
AIAlpha: Multi-tenant SaaS Data Visualization Platform (React/TypeScript, Node.js/Express, Supabase PostgreSQL)

## Build/Test Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm test -- --testNamePattern="test name"` - Run single test by name
- `npm test -- path/to/test.test.ts` - Run single test file
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checking

## Code Style Guidelines
- **Language:** TypeScript strict mode, Zod validation
- **Imports:** Absolute paths (@/components), group external/internal/relative
- **Formatting:** Prettier, 2-space indent, 100 char limit, single quotes
- **Naming:** camelCase (vars/funcs), PascalCase (components), SCREAMING_SNAKE_CASE (constants)
- **Types:** Interfaces for objects, avoid `any`, use `unknown`
- **Error Handling:** Result/Either patterns, proper error boundaries
- **Testing:** TDD mandatory, 85% coverage, `*.test.ts` naming

## Security Requirements
- **Multi-tenancy:** Schema-per-tenant isolation, qualify all DB queries with `"${tenantSchema}".table`
- **Validation:** Zod on all inputs, strict LLM-generated SQL validation
- **Auth:** Supabase Auth JWT validation in Express middleware