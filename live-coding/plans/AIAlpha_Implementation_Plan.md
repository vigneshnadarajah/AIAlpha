# AIAlpha Implementation Plan

**Project:** AIAlpha - SaaS Data Visualization Platform  
**Version:** 1.0  
**Date:** July 24, 2025  
**Based on:** PRD v1.5, Solution Architecture v1.2, Dev Playbook v4.3, Implementation Plan (Final Cut)

## Overview

This implementation plan provides a structured approach to building the AIAlpha SaaS Data Visualization Platform using **Test-Driven Development (TDD)** methodology. The project is a multi-tenant SaaS application that enables market research firms to deliver interactive data exploration experiences to their clients.

**Development Methodology:**
- **TDD Approach:** Write tests first, then implement functionality
- **Phase Gate Requirements:** All unit and integration tests must pass before proceeding to next phase
- **Test Coverage:** Minimum 80% code coverage for critical business logic
- **Testing Strategy:** Unit tests for services/components, integration tests for API endpoints, E2E tests for critical workflows

**Technology Stack:**
- **Frontend:** React, TypeScript, Tailwind CSS, Shadcn UI, ECharts, Zustand, TanStack Query, React Hook Form, Zod
- **Backend:** Node.js, Express.js, TypeScript, Zod, papaparse, multer, Nodemailer
- **Database:** Supabase (PostgreSQL with pgvector extension)
- **Authentication:** Supabase Auth
- **File Staging:** Server Filesystem (managed by multer)
- **Email Service:** AWS SES, SendGrid, Postmark
- **Deployment:** Docker
- **NLP/AI:** External LLM provider (Google Gemini API)
- **Testing:** Jest/Vitest, React Testing Library, Supertest, Cypress/Playwright

## Phase 0: Prerequisites & Initial Project Setup

- [ ] Install development tools: Node.js (v18+), npm/yarn, Git, Docker Desktop, VS Code (Easy)
- [ ] Create Supabase project and obtain API keys (Project URL, anon key, service_role key) (Easy)
- [ ] Create project directory structure: `aialpha/backend/` and `aialpha/frontend/` (Easy)
- [ ] Initialize Express.js backend project with TypeScript in `backend/` directory (Medium)
- [ ] Initialize React frontend project with TypeScript using Vite in `frontend/` directory (Medium)
- [ ] Set up environment variables for both backend and frontend (.env files) (Easy)
- [ ] Create .gitignore files for backend and frontend (Easy)
- [ ] **Setup testing infrastructure:** Install Jest/Vitest, React Testing Library, Supertest (Medium)
- [ ] **Configure test scripts:** Add test, test:watch, test:coverage commands to package.json (Easy)
- [ ] **Create test directory structure:** __tests__, __mocks__ directories with initial setup (Easy)
- [ ] **Phase Gate:** All setup tests pass, project builds successfully (Easy)

## Phase 1: Core Configuration & Libraries

**TDD Approach:** Write tests for configuration and utility functions first

- [ ] **Write tests for Supabase client configuration** (Easy)
- [ ] Install core backend dependencies: @supabase/supabase-js, zod, cors, helmet, morgan, express-async-errors, jsonwebtoken, pg, multer, papaparse, nodemailer, handlebars (Medium)
- [ ] Install core frontend dependencies: @supabase/supabase-js, zod, react-router-dom, axios, zustand, @tanstack/react-query, echarts, echarts-for-react, lucide-react, react-hook-form, clsx, tailwind-merge (Medium)
- [ ] **Write unit tests for Supabase client initialization and error handling** (Medium)
- [ ] Setup Supabase client in backend (`lib/supabaseClient.ts`) (Easy)
- [ ] Setup Supabase client in frontend (`lib/supabaseClient.ts`) (Easy)
- [ ] **Write integration tests for Express.js middleware chain** (Medium)
- [ ] Configure Express.js middleware setup in `backend/src/app.ts` (cors, helmet, morgan, error handling) (Medium)
- [ ] Initialize Shadcn UI in frontend project (Easy)
- [ ] **Write tests for utility functions and validation schemas** (Medium)
- [ ] **Phase Gate:** All configuration tests pass, 80%+ coverage on core utilities (Medium)

## Phase 2: Authentication & User Management

**TDD Approach:** Write authentication tests first, focusing on security edge cases

- [ ] **Write unit tests for authMiddleware.ensureAuthenticated** (Medium)
- [ ] **Write integration tests for auth API endpoints** (Medium)
- [ ] **Write unit tests for AuthContextProvider state management** (Medium)
- [ ] **Write component tests for LoginForm and SignupForm** (Medium)
- [ ] Implement backend authMiddleware.ensureAuthenticated for Express.js routes (Medium)
- [ ] Create backend API endpoint GET /api/users/me for user profile fetching (Medium)
- [ ] Create Auth UI components: LoginForm.tsx, SignupForm.tsx using Shadcn UI (Medium)
- [ ] Create AuthContextProvider.tsx for frontend session management (Medium)
- [ ] Setup frontend routing with react-router-dom and ProtectedRoute.tsx (Medium)
- [ ] **Write E2E tests for complete auth flow** (Medium)
- [ ] Create Supabase Auth Hooks (DB Triggers) for user_profiles creation/update (Medium)
- [ ] **Phase Gate:** All auth tests pass, security edge cases covered, 85%+ coverage (Medium)

## Phase 3: Database Schema & Tenant Management

**TDD Approach:** Critical tenant isolation tests - write comprehensive tenant boundary tests first

- [ ] **Write unit tests for tenant schema provisioning service** (Complex)
- [ ] **Write integration tests for tenant isolation (CRITICAL SECURITY)** (Complex)
- [ ] **Write unit tests for tenantContextMiddleware** (Medium)
- [ ] **Write tests for tenant creation API with edge cases** (Complex)
- [ ] Define public.tenants table in Supabase (Easy)
- [ ] Update public.user_profiles table to link to tenants (Easy)
- [ ] Define core tables DDL templates for tenant schemas (projects, versions, datasets, configs) (Medium)
- [ ] Implement tenantContextMiddleware for managing tenant context in requests (Medium)
- [ ] Create backend API endpoint for admin tenant creation with schema provisioning (Complex)
- [ ] **Write component tests for tenant management UI** (Medium)
- [ ] Create frontend UI for admin tenant listing and creation with real-time schema validation (Medium)
- [ ] **Write E2E tests for complete tenant provisioning workflow** (Complex)
- [ ] **Phase Gate:** All tenant isolation tests pass, no cross-tenant data leakage, 90%+ coverage (Complex)

## Phase 4: Project & Version Management

**TDD Approach:** Test CRUD operations and tenant context validation

- [ ] **Write unit tests for Project service CRUD operations** (Medium)
- [ ] **Write unit tests for Version service CRUD operations** (Medium)
- [ ] **Write integration tests for Project/Version APIs with tenant context** (Medium)
- [ ] **Write component tests for Project/Version Creation Wizard** (Medium)
- [ ] Implement backend APIs for Project CRUD within tenant schema (Medium)
- [ ] Implement backend APIs for Version CRUD within tenant schema (Medium)
- [ ] Create Project/Version Creation Wizard UI component (Medium)
- [ ] **Write component tests for admin pages** (Medium)
- [ ] Create ProjectsAdminPage.tsx for listing projects (Medium)
- [ ] Create TenantProjectVersionsPage.tsx for listing versions (Medium)
- [ ] Create VersionManagementPage.tsx with tabbed interface (Overview, Datasets, Config) (Medium)
- [ ] **Write E2E tests for project/version management workflow** (Medium)
- [ ] **Phase Gate:** All CRUD tests pass, tenant context properly validated, 85%+ coverage (Medium)

## Phase 5: Data Upload & Configuration

**TDD Approach:** Test file processing, data validation, and dynamic table creation

- [ ] **Write unit tests for file upload validation and processing** (Complex)
- [ ] **Write unit tests for CSV parsing service with edge cases** (Complex)
- [ ] **Write unit tests for dynamic table creation in tenant schemas** (Complex)
- [ ] **Write integration tests for complete upload workflow** (Complex)
- [ ] Implement backend API for dataset upload to versions using multer (Complex)
- [ ] Create service for processing uploaded files (CSV parsing, dynamic table creation) (Complex)
- [ ] Implement data insertion into tenant-specific dynamic tables (Medium)
- [ ] **Write component tests for DatasetUploader with file validation** (Medium)
- [ ] Create frontend DatasetUploader.tsx and DatasetList.tsx components (Medium)
- [ ] **Write unit tests for configuration services** (Medium)
- [ ] Implement backend APIs and frontend UI for Common Index Configuration (Medium)
- [ ] Implement backend APIs and frontend UI for File Specific Configuration (Medium)
- [ ] **Write E2E tests for complete data upload and configuration workflow** (Complex)
- [ ] **Phase Gate:** All file processing tests pass, data integrity verified, 85%+ coverage (Complex)

## Phase 6: User Portal - Data Exploration Setup

**TDD Approach:** Test data fetching, user permissions, and component state management

- [ ] **Write unit tests for exploration service data fetching** (Medium)
- [ ] **Write integration tests for exploration API with user permissions** (Complex)
- [ ] **Write component tests for ProjectVersionSelector** (Medium)
- [ ] Create ProjectVersionSelector.tsx for users to select project/version (Medium)
- [ ] **Write component tests for DataExplorePage layout** (Medium)
- [ ] Create main DataExplorePage.tsx structure with layout components (Medium)
- [ ] Implement backend API GET /api/explore/versions/:versionId/view for exploration data (Complex)
- [ ] Create exploration service to fetch combined data (datasets, configs, rows) (Medium)
- [ ] **Write E2E tests for user data exploration access** (Medium)
- [ ] **Phase Gate:** All exploration tests pass, user permissions verified, 80%+ coverage (Medium)

## Phase 7: Data Exploration Interactivity

**TDD Approach:** Test interactive components, filtering logic, and chart rendering

- [ ] **Write unit tests for filtering service logic** (Medium)
- [ ] **Write unit tests for pagination and sorting functionality** (Medium)
- [ ] **Write component tests for FilterPane with dynamic controls** (Medium)
- [ ] Create FilterPane.tsx component with dynamic filter controls (Medium)
- [ ] Enhance backend getExplorationViewData to apply filters, sorting, pagination (Medium)
- [ ] **Write component tests for DataTable with server-side features** (Medium)
- [ ] Create DataTable.tsx component using TanStack Table with server-side features (Medium)
- [ ] **Write component tests for ECharts integration** (Medium)
- [ ] Implement basic ECharts integration with BarChart.tsx component (Medium)
- [ ] **Write component tests for dataset tab functionality** (Medium)
- [ ] Add dataset selection using tabs in DataDisplayArea.tsx (Medium)
- [ ] **Write E2E tests for complete data exploration workflow** (Complex)
- [ ] **Phase Gate:** All interactivity tests pass, performance targets met, 85%+ coverage (Complex)

## Phase 8: Service Requests (SR) & Data Correction Requests (DCR)

**TDD Approach:** Test workflow state transitions, data updates, and audit trails

- [ ] **Write unit tests for SR service workflow logic** (Complex)
- [ ] **Write unit tests for DCR service with data update logic (CRITICAL)** (Complex)
- [ ] **Write integration tests for SR/DCR APIs with state transitions** (Complex)
- [ ] Define SR/DCR related tables in public schema (service_requests, sr_comments, data_correction_requests) (Medium)
- [ ] Implement backend APIs for SR workflow (user create/list, admin manage/update) (Complex)
- [ ] **Write component tests for SR management UI** (Complex)
- [ ] Create frontend UI for SR management (CreateSRForm, MySRList, AdminSRDashboard) (Complex)
- [ ] Implement backend APIs for DCR workflow (initiate, approve/decline with data updates) (Complex)
- [ ] **Write component tests for DCR management UI** (Complex)
- [ ] Create frontend UI for DCR management (DCR initiation from data table, lists, admin approval) (Complex)
- [ ] **Write unit tests for DCR indicators and audit trail** (Medium)
- [ ] Add DCR indicators and history display in data exploration (Medium)
- [ ] **Write unit tests for email notification service** (Medium)
- [ ] Implement email notifications for SR/DCR events using Nodemailer (Medium)
- [ ] **Write E2E tests for complete SR/DCR workflows** (Complex)
- [ ] **Phase Gate:** All workflow tests pass, data integrity verified, audit trails complete, 90%+ coverage (Complex)

## Phase 9: Conversational Query Feature (MVP)

**TDD Approach:** Test LLM integration, SQL validation (CRITICAL SECURITY), and query processing

- [ ] **Write unit tests for schema indexing service** (Complex)
- [ ] **Write unit tests for LLM client with mocked responses** (Medium)
- [ ] **Write comprehensive unit tests for SQL validation (CRITICAL SECURITY)** (Very Complex)
- [ ] **Write integration tests for conversational query API** (Very Complex)
- [ ] Enable pgvector extension in Supabase database (Easy)
- [ ] Define public.schema_embeddings table for storing field descriptions (Easy)
- [ ] Implement backend schema indexing process for versions (Complex)
- [ ] Create LLM client service for Google Gemini API integration (Medium)
- [ ] Implement conversational query orchestration API with SQL validation (Very Complex)
- [ ] **Write component tests for ConversationalQueryInput** (Medium)
- [ ] Create ConversationalQueryInput.tsx component and result display (Medium)
- [ ] **Write E2E tests for conversational query workflow** (Complex)
- [ ] **Write security penetration tests for SQL injection attempts** (Very Complex)
- [ ] **Phase Gate:** All query tests pass, SQL injection prevention verified, 95%+ coverage on security-critical code (Very Complex)

## Phase 10: Dockerization & Deployment Prep

**TDD Approach:** Test containerized environment and deployment configurations

- [ ] **Write integration tests for dockerized backend** (Medium)
- [ ] **Write integration tests for dockerized frontend** (Medium)
- [ ] Create Dockerfile for backend (Express.js) with multi-stage build (Medium)
- [ ] Create Dockerfile for frontend (React/Vite) with Nginx serving (Medium)
- [ ] **Write docker-compose tests for service communication** (Medium)
- [ ] Create docker-compose.yml for local development environment (Medium)
- [ ] **Write E2E tests in containerized environment** (Medium)
- [ ] **Phase Gate:** All containerized tests pass, deployment ready, environment parity verified (Medium)

## Phase 11: Final Testing, CI/CD & Production Readiness

**TDD Approach:** Comprehensive test suite validation and production hardening

- [ ] **Validate complete test suite coverage (minimum 80% overall, 90% critical paths)** (Complex)
- [ ] **Run comprehensive security test suite** (Complex)
- [ ] **Execute performance test suite against targets** (Complex)
- [ ] Create CI workflow with GitHub Actions (lint, type check, test, build) (Medium)
- [ ] **Write unit tests for admin role protection** (Medium)
- [ ] Implement proper admin role protection middleware (Medium)
- [ ] Add comprehensive API documentation with Swagger/OpenAPI (Medium)
- [ ] **Write component tests for user profile management** (Medium)
- [ ] Create user profile page for notification preferences management (Medium)
- [ ] **Execute full regression test suite** (Complex)
- [ ] Conduct UI/UX review and refinement (Complex)
- [ ] **Run automated security scanning tools** (Complex)
- [ ] Perform security audit and hardening (Complex)
- [ ] **Execute load testing and performance optimization** (Complex)
- [ ] Execute performance testing and optimization (Complex)
- [ ] Finalize documentation (READMEs, deployment guides) (Medium)
- [ ] **Final Phase Gate:** All tests pass, security audit complete, performance targets met, production ready (Complex)

## Key Implementation Notes

### Multi-Tenancy Strategy
- **Schema-per-tenant:** Each tenant gets isolated PostgreSQL schema
- **Application-layer enforcement:** Backend explicitly qualifies all table names
- **Critical:** Robust tenant schema migration strategy required

### Data Correction Requests (DCR)
- **Approved DCRs update actual data:** Corrected values become default for queries
- **Audit trail:** Immutable correction records in public schema
- **Performance consideration:** Optimize updates for large datasets

### Security Priorities
- **Tenant isolation:** Rigorous testing of schema qualification logic
- **SQL injection prevention:** Strict validation of LLM-generated SQL
- **Input validation:** Comprehensive Zod validation on all inputs

### Performance Targets
- Dashboard load: < 4 seconds
- Chart rendering: < 1.5 seconds
- Data grid operations: < 1 second
- Conversational queries: < 5 seconds

## Success Criteria

- [ ] Multi-tenant SaaS platform with complete tenant isolation (verified by tests)
- [ ] Admin can create tenants, upload data, configure fields (E2E tested)
- [ ] Users can explore data with filters, charts, and conversational queries (E2E tested)
- [ ] SR/DCR workflows with email notifications (workflow tested)
- [ ] Data corrections update live data with audit trail (integrity tested)
- [ ] Dockerized deployment ready (container tested)
- [ ] **Comprehensive test coverage: 80%+ overall, 90%+ critical paths, 95%+ security code**
- [ ] **All unit tests pass (>500 tests expected)**
- [ ] **All integration tests pass (>100 tests expected)**
- [ ] **All E2E tests pass (>50 scenarios expected)**
- [ ] **Security audit passed with no critical vulnerabilities**
- [ ] **Performance targets met under load testing**
- [ ] **Zero test failures in CI/CD pipeline**

## Risk Mitigation

- **Tenant data leakage:** Extensive testing of schema isolation
- **LLM SQL injection:** Strict validation and allow-listing
- **Schema migrations:** Develop robust cross-tenant migration tools
- **DCR performance:** Index optimization and transaction handling
- **Email deliverability:** Use reputable service with proper authentication

## TDD Implementation Guidelines

### Test-First Development Process
1. **Red:** Write failing test that describes desired functionality
2. **Green:** Write minimal code to make test pass
3. **Refactor:** Improve code while keeping tests green
4. **Repeat:** Continue cycle for each feature

### Phase Gate Requirements
- **No phase progression without:** All tests passing, coverage targets met
- **Critical security phases:** Require additional security-focused testing
- **Performance phases:** Must meet defined performance benchmarks
- **Integration phases:** Require cross-component testing

### Test Categories & Coverage Targets
- **Unit Tests:** 85% coverage minimum, 95% for security-critical code
- **Integration Tests:** All API endpoints, database operations, external services
- **Component Tests:** All React components with user interactions
- **E2E Tests:** Complete user workflows, critical business processes
- **Security Tests:** SQL injection, XSS, tenant isolation, authentication bypass
- **Performance Tests:** Load testing, stress testing, benchmark validation

### Testing Tools & Standards
- **Backend:** Jest/Vitest, Supertest, database mocking
- **Frontend:** React Testing Library, Jest, MSW for API mocking
- **E2E:** Cypress or Playwright for full workflow testing
- **Security:** Custom security test suites, penetration testing tools
- **Performance:** k6 or Artillery for load testing

This implementation plan provides a structured, test-driven approach to building the AIAlpha platform while maintaining focus on security, performance, and scalability requirements through comprehensive testing at every phase.