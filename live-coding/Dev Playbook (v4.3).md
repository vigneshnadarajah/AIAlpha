
```markdown
# Revised Guidelines for Building Our SaaS Tool (Version 4.3)

**Node.js (Express.js) / React / Supabase (Schema-per-Tenant) Stack**

## I. Core Objective & Philosophy

*   **Goal:** To collaboratively build a robust, scalable, secure, maintainable, and user-friendly SaaS application using **Node.js (Express.js), React, Supabase (PostgreSQL Database & Auth), ECharts,** and modern best practices.
*   **Principles:** Adhere to clean code, robust architecture, performance optimization, strong security measures, and an iterative development process. Ensure a coherent and efficient user experience, especially in administrative workflows (e.g., wizards for tenant/project/version creation, role-specific dashboards) and data management (e.g., auditable Data Correction Request processing that updates live data).

## II. Architecture & Technology Choices

*   **Backend Framework:** **Node.js with Express.js**.
    *   Leverage middleware for cross-cutting concerns (authentication, authorization, error handling, tenant context).
    *   Employ clear routing patterns and service-oriented architecture for business logic. APIs must support refined UI workflows like multi-step wizards (e.g., tenant creation with initial users) and batch configuration updates. Real-time validation API endpoints (e.g., for unique schema names) should be designed for efficiency.
*   **Frontend Library:** **React**.
    *   Utilize functional components, hooks, and the Context API (or a dedicated state manager).
    *   Build a component-based architecture for a responsive and interactive user interface, including elements like role-specific dashboards, multi-step wizards, and data exploration views with tabbed dataset selection.
*   **Language:** **TypeScript** (Strongly recommended for both backend and frontend).
    *   Enable `strict` mode in `tsconfig.json`.
    *   Utilize utility types, interfaces, and enums consistently. Document team preferences on `interface` vs `type` and `enum` vs object literals if specific conventions are desired.
*   **Database & Authentication:**
    *   **Database:** **Supabase-hosted PostgreSQL** (with `pgvector` extension enabled for conversational query embeddings).
    *   **Authentication:** **Supabase Auth** (JWT-based).
        *   React frontend will interact with Supabase Auth client for user sign-up/sign-in, password reset, and logout.
        *   Express.js backend will validate Supabase-issued JWTs for API protection.
*   **Multi-Tenancy Strategy:**
    *   **Dedicated Schema per Tenant:** Each tenant will have its own isolated schema within the Supabase PostgreSQL database (e.g., `t_tenant_alpha_schema`).
    *   **Application-Layer Enforcement:** The Express.js backend is responsible for:
        1.  Identifying the tenant context for each incoming request (e.g., from a custom claim in the validated Supabase JWT).
        2.  Ensuring all database operations for that request are strictly routed to the correct tenant's schema by **explicitly qualifying table names in all SQL queries** (e.g., `SELECT * FROM "${tenantSchema}".projects;`).
        3.  Managing tenant schema creation during tenant provisioning, including the creation of initial standard tables within the new tenant schema.
        4.  **CRITICAL: A robust, well-tested, and documented strategy for applying database migrations across all existing tenant schemas must be developed and maintained.** This is a key operational consideration.
    *   **No RLS for Inter-Tenant Isolation:** Schema separation provides the primary tenant-to-tenant data isolation. Row Level Security (RLS) *may* be considered for fine-grained *intra-schema* permissions if complex needs arise later.
*   **API Style:** **RESTful APIs** built with Express.js.
    *   Follow standard conventions for resources, HTTP methods, and status codes.
    *   Design APIs to efficiently support frontend interactions, including those for dashboards, wizards, real-time validation needs, and data configuration.
*   **UI Styling (Frontend):** **Tailwind CSS**.
*   **UI Components (Frontend):** **Shadcn UI / Radix UI** as a foundation for accessible, unstyled/lightly-styled components, used in conjunction with Tailwind CSS.
*   **State Management (Frontend):**
    *   Favor local component state (`useState`, `useReducer`) where appropriate.
    *   For cross-component or complex global client-state: **Zustand**.
    *   For server-state caching, synchronization, and mutations (data fetched from Express.js APIs): **TanStack Query (React Query)**.
    *   State management for multi-step forms/wizards (e.g., tenant creation, project/version wizard) must be robust.
*   **Data Validation:** **Zod**.
    *   Define Zod schemas for validating frontend forms (integrated with React Hook Form).
    *   Use Zod schemas in the Express.js backend for validating API request bodies, query parameters, and route parameters via dedicated middleware.
    *   Implement real-time validation for critical unique fields like `SchemaName` during tenant creation, supported by efficient backend API endpoints.
*   **Data Processing (Backend):**
    *   Utilize appropriate Node.js libraries for tasks like CSV parsing (e.g., `papaparse`), JSON handling.
    *   Structure data processing logic clearly in Express.js service layers.
    *   **Data Correction Request (DCR) Handling:** The process for approved DCRs involves:
        1.  Atomically (or as close as possible with compensating transactions) updating an immutable `CorrectionRecord` in the shared `public` schema (storing original value, corrected value, timestamp, etc.).
        2.  Updating the *actual data row* in the tenant's specific dataset table (e.g., `"${tenantSchema}".ds_...`) to reflect the `corrected_value`. This makes the corrected value the default for future queries of that version's data.
        3.  This data modification requires careful implementation focusing on performance, auditability, and data integrity.
*   **File Handling (Uploads):**
    *   Files uploaded by clients will be temporarily stored on the server filesystem (e.g., using `multer` with Express.js to configure an `uploads/` directory).
    *   The Express.js backend will process these files (parse data, validate structure).
    *   Data will be inserted into the appropriate tables within the tenant's database schema, linked to the specific Project and Version context.
    *   **Original uploaded files will be deleted from temporary server storage immediately after successful processing and data insertion.**
*   **Charting Library (Frontend):** **ECharts**.
*   **Email Notifications:**
    *   Node.js backend to integrate with an external email service (e.g., AWS SES, SendGrid) using libraries like Nodemailer.
    *   Use a templating system (e.g., Handlebars) for customizable email content.
    *   Queue emails asynchronously to avoid blocking API responses.
    *   Implement user preferences for opting out of non-critical emails.
*   **Version Management (Code & Dependencies):**
    *   Use recent, stable versions. Regularly review/apply updates (`npm outdated`, Dependabot/RenovateBot). Plan major version upgrades carefully. Ensure `package-lock.json` (or `yarn.lock`) consistency across the team.
*   **Deployment:** **Docker**.
    *   Separate Dockerfiles for the Express.js backend and the React frontend (e.g., Nginx serving static build).
    *   `docker-compose.yml` for local development orchestration.

## III. Code Style, Structure & Maintainability

*   **Conciseness, Clarity, Comments:** Write clear, self-explanatory code. Add comments for non-obvious logic or complex business rules.
*   **Functional Programming (Frontend):** Favor functional components and hooks in React. Minimize side effects.
*   **Modularity & DRY (Don't Repeat Yourself):**
    *   **Backend (Express.js):**
        *   Organize into distinct layers: Routes, Controllers (Handlers), Services (business logic), and Data Access/Models.
        *   Use Express middleware effectively for cross-cutting concerns.
        *   Service logic for DCR approval must handle updates to both the shared `CorrectionRecord` and the specific tenant's dataset table in a coordinated manner.
    *   **Frontend (React):**
        *   Break down UI into small, reusable components.
        *   Create custom hooks for reusable stateful logic.
        *   Structure components to support the defined workflows: wizards (tenant creation, project/version creation), role-specific dashboards, data exploration views with tabbed dataset selection, and SR/DCR lists defaulting to "Open" items.
*   **Naming Conventions:**
    *   Use descriptive names.
    *   React: `PascalCase` for components/TS types. `camelCase` for hooks/variables/functions.
    *   Node.js/Express.js: `camelCase` for variables/functions. `PascalCase` for classes.
    *   Files: `kebab-case` for non-component files. `PascalCase.tsx` for React components.
*   **File Structure (Illustrative - from Dev Playbook v4.2, adapted):**
    *   Maintain organized `backend/` and `frontend/` structures with clear separation for routes, controllers, services, components, hooks, etc. (e.g., `backend/src/services/email.service.ts`, `frontend/src/components/features/dashboard/`).
    *   Consider a `shared/` directory for common TypeScript types if using a monorepo or shared package.
*   **Function/Method Signatures:**
    *   Use clear, descriptive parameter names. Typed parameters/returns.
    *   Consider options objects for functions with multiple parameters (RORO pattern).

## IV. Performance & Optimization

*   **Backend (Express.js):**
    *   Asynchronous operations for all I/O. Optimized DB queries (indexing, selective fetching).
    *   **DCR Update Performance:** Ensure updating data rows upon DCR approval is performant. Index relevant row identifiers in dataset tables.
    *   **Real-time Validation API:** Endpoints for checks like unique `SchemaName` must be highly responsive.
    *   Caching for frequently accessed, static data. PM2/clustering for production.
*   **Frontend (React):**
    *   Code Splitting, Memoization, Image Optimization, Virtualization for long lists.
    *   **Dashboard Performance:** Adhere to <4s load NFR, implement progressive loading for dashboard widgets.
    *   **Tab Performance:** Dataset selection tabs in Data Exploration must handle many datasets efficiently.
    *   Bundle Size Analysis. Debouncing/Throttling for frequent UI events.
*   **API Design:** Efficient, paginated APIs. Design API payloads to minimize over-fetching for dashboard widgets.
*   **Core Web Vitals:** Monitor LCP, CLS, INP.

## V. Error Handling & Validation

*   **Proactive Handling, Early Returns, Guard Clauses.**
*   **User Input Validation:**
    *   Frontend (Zod with React Hook Form) for immediate UX feedback.
    *   Backend (Zod middleware) for authoritative validation of all API inputs. Include support for real-time validation APIs (e.g., checking `SchemaName` uniqueness during tenant creation form input). File upload validation (type, size).
*   **API Error Responses (Express.js):** Standardized JSON format, appropriate HTTP status codes. Centralized error handling middleware.
*   **Async Error Handling (Node.js):** `try...catch` with `async/await`. Use `express-async-errors` for cleaner error propagation in Express route handlers.
*   **Logging:**
    *   Structured backend logging (Winston/Pino) for errors, key events, DCR data modifications, email notification successes/failures.
    *   Client-side error reporting (e.g., Sentry).

## VI. Security

*   **Authentication & Authorization:** Supabase JWT validation in Express.js. RBAC via middleware/services. User context (`req.userContext`) must include tenant ID/schema name derived securely from JWT.
*   **Tenant Data Isolation:**
    *   **CRITICAL:** All DB queries from Express.js backend must explicitly qualify table names with the correct tenant schema identifier. This is the primary defense.
    *   The DCR flow, which directly modifies data in tenant tables, requires extreme care to ensure correct schema and row targeting.
    *   Regularly audit and rigorously test all tenant isolation logic.
*   **Input Validation (Reiteration):** Prevent XSS, SQLi, etc. through comprehensive Zod validation on the backend.
*   **Common Web Vulnerabilities (OWASP Top 10):** `helmet` middleware. Be mindful of CSRF if any cookie-based auth is introduced (unlikely with pure JWT APIs). Secure file uploads.
*   **Dependencies:** `npm audit`, automated updates (Dependabot/RenovateBot).
*   **Secrets Management:** Environment variables, securely managed in deployment.
*   **Rate Limiting:** On critical endpoints (auth, tenant creation, expensive queries).
*   **Email Security:** Use reputable email services. Implement SPF, DKIM, DMARC for sending domain. Sanitize user-generated content in email templates.
*   **Conversational Query SQL Validation:** Strict validation, sanitization, and allow-listing of any SQL generated by LLMs is paramount.

## VII. SaaS-Specific Considerations

*   **Multi-Tenancy Strategy (Reiteration):** Schema-per-tenant in Supabase PostgreSQL. Express.js backend manages schema context and isolation.
    *   **Tenant Provisioning:** Automate schema creation (including all standard tables defined in PRD) and initial user setup as part of the tenant creation workflow.
    *   **Schema Migrations: CRITICAL. Develop, test, and document a robust, automatable strategy for applying database schema changes across all existing tenant schemas. This is a major operational responsibility.**
*   **Subscription/Billing:** Plan for future integration.
*   **Background Jobs/Queues (Node.js):** BullMQ/Redis or cloud services for tasks like asynchronous email sending.
*   **Email Delivery (Node.js):** Integrate with transactional email service. Use templating. Manage user opt-out preferences. Log delivery status.
*   **Analytics & Monitoring:** User analytics, APM, error tracking.

## VIII. Testing & Documentation

*   **Testing Strategy:** Balanced testing pyramid. Document and strive for test coverage goals (e.g., 80% for critical paths, especially backend services and tenant isolation logic).
*   **Unit Tests (Jest/Vitest):**
    *   Backend: Services (tenant provisioning including user creation, DCR approval logic verifying data table updates & `CorrectionRecord` creation, schema validation logic for unique names), utils, middleware. Mock DB/external services. Test email templating and queuing logic.
    *   Frontend: Components (wizards, dashboard widgets, filter components, SR/DCR default views), hooks, utils.
*   **Integration Tests (Jest/Vitest + Supertest for backend, React Testing Library + MSW for frontend):**
    *   Backend: API endpoints interacting with services and test DB (tenant creation flow, project/version/dataset CRUD, real-time validation APIs, DCR approval flow from API to DB update).
    *   Frontend: Components interacting with mock APIs.
    *   **Tenant Isolation Tests:** Explicitly design tests to ensure data access is strictly confined to the correct tenant's schema under various user contexts.
*   **End-to-End (E2E) Tests (Playwright/Cypress):** Critical user flows (admin tenant setup with initial user, data upload & config, user data exploration with DCR initiation and view of corrected data, conversational query MVP, SR submission and resolution).
*   **Performance Tests (k6, JMeter):** For key APIs, dashboard loading, data exploration with large datasets, and DCR update operations.
*   **Code Comments & JSDoc/TSDoc.**
*   **API Documentation (Express.js):** Swagger/OpenAPI (`swagger-jsdoc`, `swagger-ui-express`). Document all API endpoints, including those for refined workflows.
*   **README Files:** Comprehensive project root, backend, and frontend READMEs with setup, run, test, and deployment instructions. Include notes on the tenant schema migration strategy.

## IX. Development Process & Methodology

*   **Agile Principles:** Iterative, incremental. Sprints recommended.
*   **Task Management:** Use a project management tool.
*   **Version Control (Git):** Consistent branching (GitFlow or feature-branch). Clear commit messages.
*   **Code Reviews:** Mandatory PR reviews focusing on correctness, guidelines, security, performance, maintainability, and tenant isolation.
*   **Continuous Integration (CI):** GitHub Actions, etc. (Lint, Type Check, All Tests including tenant isolation tests, Build).
*   **Continuous Deployment (CD) (Optional but Recommended).**
*   **Communication:** Open, regular.
*   **Planning & Analysis Steps (Per Feature/Milestone):**
    1.  **Deep Dive Analysis.**
    2.  **Planning & Design:** Break down tasks. Outline architecture for new features (e.g., dashboard widget design, email notification flows, DCR data update logic). Consider modular UI layout and wizard flows from PRD. Use diagrams/ADRs for complex decisions.
    3.  **Implementation (Iterative):** Focus on one piece. Write tests concurrently.
    4.  **Review & Refinement.**
    5.  **Testing.**
    6.  **Finalization.**

---
```

This Dev Playbook (Version 4.3) should now be comprehensive and standalone, reflecting the detailed understanding from PRD v1.5.

