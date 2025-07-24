---

```markdown
# Comprehensive AI Implementation Plan (SaaS Data Viz - Final Cut)

**Project:** SaaS Data Visualization Platform (PRD v1.5, Dev Playbook v4.3, Solution Architecture v1.2)
**Objective:** This document provides a step-by-step guide, including AI prompts and manual actions, to build the SaaS Data Visualization Platform. Designed for use with an AI assistant (e.g., Cline AI, GitHub Copilot + human oversight), with explicit instructions for users overseeing the process.

**Technology Stack:**
*   **Backend:** Node.js, Express.js, TypeScript
*   **Frontend:** React, TypeScript, ECharts, Tailwind CSS, Shadcn UI
*   **Database & Auth:** Supabase (PostgreSQL with schema-per-tenant, Supabase Auth, `pgvector`)
*   **State Management (FE):** Zustand, TanStack Query (React Query)
*   **Data Validation:** Zod
*   **Deployment:** Docker
*   **File Handling:** `multer` (Express.js), temporary server filesystem storage, Node.js processing.
*   **Email:** External service (e.g., AWS SES, SendGrid) via Nodemailer.
*   **NLP/AI:** External LLM (e.g., Google Gemini API).

**How to Use:**

1.  **Follow Phases Sequentially:** Complete all steps in a phase before moving to the next. Check the box `[ ]` when a step is completed.
2.  **Execute AI Prompts:** Use the prompts starting with `[ ] **Goal:** Generate...` in your AI tool. Copy the generated code/config into the specified file. Review and adapt AI output.
3.  **Perform "Action Required" Steps:** When you see `[ ] **Action Required:**`, perform the indicated task manually.
4.  **Perform "Verification Point" Steps:** When you see `[ ] **Verification Point:**`, manually check the described functionality.
5.  **Windows Compatibility:** Prompts aim for Windows-compatible commands (e.g., using semicolons or separate lines instead of `&&`). AI should be instructed to generate commands accordingly.
6.  **Contextual Documents:** The AI (and developer) should always consider PRD v1.5, Dev Playbook v4.3, Solution Architecture v1.2, and relevant `.clinerules` when generating or reviewing code.

---

## Phase 0: Prerequisites & Initial Project Setup

*   [ ] **Goal:** Ensure necessary development tools are installed. (Easy)
    *   **Action Required:** Install Node.js (v18+), npm/yarn, Git, Docker Desktop, Code Editor (VS Code recommended). Verify installations.

*   [ ] **Goal:** Set up Supabase project and obtain API keys. (Easy)
    *   **Action Required:** Create Supabase project. Securely save Database password. Copy Project URL, `anon` public key, `service_role` secret key.

*   [ ] **Goal:** Create the initial project directory structure. (Easy)
    *   **Action Required:** Root directory (`my-saas-platform`), then `backend/` and `frontend/` subdirectories.

*   [ ] **Goal:** Initialize Express.js backend project with TypeScript. (Medium)
    *   **Prompt:**
        "Generate commands and initial file content to set up a new Node.js Express.js project with TypeScript in the `backend` directory.
        1.  Navigate into `backend`. Initialize `package.json`.
        2.  Install `express`, `typescript`, `@types/express`, `@types/node`, `ts-node`, `nodemon`, `dotenv`.
        3.  Create `tsconfig.json` (target `es2020`, module `commonjs`, outDir `./dist`, rootDir `./src`, strict, esModuleInterop).
        4.  Create `backend/src/server.ts`: Initializes Express app, starts server (port from env or 3001), basic `/health` GET route.
        5.  Add npm scripts to `package.json`:
            *   `dev`: `nodemon --watch 'src/**/*.ts' --exec 'ts-node' src/server.ts`
            *   `build`: `tsc`
            *   `start`: `node dist/server.js`
        Provide commands and file contents separately. Ensure Windows-compatible commands."
    *   **Action Required:** Execute commands. Create files in `backend`.

*   [ ] **Goal:** Initialize React frontend project with TypeScript using Vite. (Medium)
    *   **Prompt:**
        "Generate commands and initial file content to create a new React project with TypeScript using Vite in the `frontend` directory.
        1.  Navigate into `frontend`. Use `npm create vite@latest . -- --template react-ts`.
        2.  Install `tailwindcss`, `postcss`, `autoprefixer`.
        3.  Initialize Tailwind: Create `tailwind.config.js` and `postcss.config.js`.
        4.  Update `frontend/src/index.css` with Tailwind directives (`@tailwind base; @tailwind components; @tailwind utilities;`).
        Provide commands and file contents separately. Ensure Windows-compatible commands."
    *   **Action Required:** Execute commands. Create/update files in `frontend`.

*   [ ] **Goal:** Set up initial environment variables for backend and frontend. (Easy)
    *   **Action Required:**
        1.  In `backend/`, create `.env` with `PORT`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY` (or other LLM key), `FRONTEND_URL`.
        2.  In `frontend/`, create `.env` with `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_BACKEND_API_URL`.
        3.  Replace placeholders. Add `.env` to `.gitignore` in both.

*   [ ] **Goal:** Basic `.gitignore` files for backend and frontend. (Easy)
    *   **Prompt:**
        "Generate two `.gitignore` files:
        1.  For `backend` (Node.js/TS): ignore `node_modules`, `dist`, `.env`, `npm-debug.log`, `uploads/`.
        2.  For `frontend` (React/Vite): ignore `node_modules`, `dist`, `.env`, `.env.local`, etc.
        Provide content for each file."
    *   **Action Required:** Create `.gitignore` files.

---

## Phase 1: Core Configuration & Libraries

*   [ ] **Goal:** Install core dependencies for backend. (Medium)
    *   **Prompt:**
        "For `backend` Express.js project, list `npm install` commands for: `@supabase/supabase-js`, `zod`, `cors`, `helmet`, `morgan`, `express-async-errors`, `jsonwebtoken`, `@types/jsonwebtoken`, `pg`, `@types/pg`, `multer`, `@types/multer`, `papaparse`, `@types/papaparse`, `short-uuid` (or `nanoid`), `nodemailer`, `@types/nodemailer`, `handlebars` (for email templates). One command per line or semicolon separated."
    *   **Action Required:** Run commands in `backend`.

*   [ ] **Goal:** Install core dependencies for frontend. (Medium)
    *   **Prompt:**
        "For `frontend` React project, list `npm install` commands for: `@supabase/supabase-js`, `zod`, `react-router-dom`, `axios`, `zustand`, `@tanstack/react-query`, `echarts`, `echarts-for-react`, `lucide-react`, `react-hook-form`, `clsx`, `tailwind-merge`, `date-fns`, `react-day-picker`. One command per line or semicolon separated."
    *   **Action Required:** Run commands in `frontend`.

*   [ ] **Goal:** Setup Supabase client in backend. (Easy)
    *   **Prompt:**
        "Create `backend/src/lib/supabaseClient.ts`.
        1.  Import `createClient` from `@supabase/supabase-js`.
        2.  Load `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` from env.
        3.  Export `supabaseAdmin` (client with service role key).
        4.  Export `getSupabaseClientForUser(accessToken: string)` (returns client with user's auth context).
        Throw error on startup if essential env vars missing."
    *   **Action Required:** Create `backend/src/lib/supabaseClient.ts`.

*   [ ] **Goal:** Setup Supabase client in frontend. (Easy)
    *   **Prompt:**
        "Create `frontend/src/lib/supabaseClient.ts`.
        1.  Import `createClient` from `@supabase/supabase-js`.
        2.  Load `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` from `import.meta.env`.
        3.  Export `supabase` (client with public anon key).
        Throw error if env vars missing."
    *   **Action Required:** Create `frontend/src/lib/supabaseClient.ts`.

*   [ ] **Goal:** Basic Express.js middleware setup in `backend/src/app.ts`. (Medium)
    *   **Prompt:**
        "Create `backend/src/app.ts`. Configure Express app:
        1.  Import `express`, `cors`, `helmet`, `morgan`. Import `express-async-errors` at the top.
        2.  Use `cors` (allow `process.env.FRONTEND_URL`). Use `helmet()`. Use `express.json()`, `express.urlencoded({ extended: true })`.
        3.  Use `morgan('dev')` in development.
        4.  Basic `/health` GET route.
        5.  Placeholder for API routes.
        6.  Global error handling middleware (log error, send JSON response with `err.message`, `err.stack` in dev, `err.statusCode || 500`).
        7.  Export `app`.
        Modify `backend/src/server.ts` to import and use this `app`."
    *   **Action Required:** Create/update files.

*   [ ] **Goal:** Initialize Shadcn UI in frontend. (Easy)
    *   **Action Required:** In `frontend/`, run `npx shadcn-ui@latest init`. Follow prompts (Style: Default, Color: Slate, globals.css/index.css, tailwind.config.js, alias `@/*`, utils `@/lib/utils`).

---

## Phase 2: Authentication & User Management (Supabase Auth)

*   [ ] **Goal:** Create basic Auth UI components in React (`LoginForm.tsx`, `SignupForm.tsx`). (Medium)
    *   **Prompt:**
        "In `frontend/src/components/auth/`:
        1.  `LoginForm.tsx`: Inputs for email/password. Submit calls `supabase.auth.signInWithPassword()`. Handles loading/errors (Shadcn `toast`). Navigates to `/dashboard` on success. Uses `react-hook-form` and Zod for validation.
        2.  `SignupForm.tsx`: Inputs for email/password/confirm password. Submit calls `supabase.auth.signUp()`. Handles loading/errors. Shows success message. Uses `react-hook-form` and Zod.
        Use Shadcn UI components (`Input`, `Button`, `Card`, `Label`)."
    *   **Action Required:** Create components.

*   [ ] **Goal:** Create `AuthContextProvider.tsx` for frontend session management. (Medium)
    *   **Prompt:**
        "Create `frontend/src/context/AuthContextProvider.tsx`.
        1.  React Context for `session: Session | null`, `userProfile: UserProfile | null` (define `UserProfile` type: id, email, role, tenant_id, full_name, avatar_url, notification_preferences), `isLoadingAuth: boolean`.
        2.  Provider subscribes to `supabase.auth.onAuthStateChange`.
        3.  On session change, updates `session`. If session exists, fetches profile from backend `/api/users/me` (to be created) and updates `userProfile`. Clears `userProfile` if no session.
        4.  Expose context values via a custom hook `useAuth()`. "
    *   **Action Required:** Create context provider. Wrap `App.tsx` root with it.

*   [ ] **Goal:** Setup basic frontend routing (`App.tsx` or `Router.tsx`) and `ProtectedRoute.tsx`. (Medium)
    *   **Prompt:**
        "In `frontend/src/App.tsx` (or `Router.tsx`):
        1.  Use `react-router-dom` for routes: `/login`, `/signup`, `/auth/callback` (simple `AuthCallback.tsx` component).
        2.  Create `frontend/src/components/auth/ProtectedRoute.tsx`: Uses `useAuth()`. Shows loading if `isLoadingAuth`. Renders `Outlet` if `session` exists. Redirects to `/login` if no `session`.
        3.  Protected routes: `/dashboard` (placeholder `DashboardPage.tsx`), `/admin` (placeholder `AdminLayout.tsx` with `Outlet`)."
    *   **Action Required:** Create/update files.

*   [ ] **Goal:** Backend: `authMiddleware.ensureAuthenticated` to protect Express.js routes. (Medium)
    *   **Prompt:**
        "Create `backend/src/middleware/auth.mw.ts`.
        Function `ensureAuthenticated(req, res, next)`:
        1.  Extracts Bearer token from `Authorization` header. 401 if no token.
        2.  Validates token using `supabaseAdmin.auth.getUser(accessToken)`. 401/403 if invalid.
        3.  Attaches Supabase user object (`data.user`) to `req.authUser`.
        4.  Calls `next()`."
    *   **Action Required:** Create middleware.

*   [ ] **Goal:** Backend: API endpoint `GET /api/users/me` to fetch current user's profile. (Medium)
    *   **Prompt:**
        "Backend:
        1.  Create `src/api/user.routes.ts`. Define `GET /users/me`, protected by `ensureAuthenticated`.
        2.  Create `src/controllers/user.controller.ts`. Implement `getCurrentUserProfileHandler(req, res)`: Uses `req.authUser.id` to fetch profile from `public.user_profiles` via `supabaseAdmin`. Returns profile or 404.
        3.  Mount `userRoutes` under `/api` in `app.ts`."
    *   **Action Required:** Create/update files.

*   [ ] **Goal:** Backend: Supabase Auth Hook (DB Trigger/Function) for `user_profiles` creation/update. (Medium)
    *   **Prompt:**
        "Generate SQL for Supabase Database:
        1.  Function `public.handle_new_user()`: Triggered `AFTER INSERT ON auth.users`. Inserts into `public.user_profiles` (id, email from `NEW` object, default role 'standard_user', tenant_id from `NEW.raw_user_meta_data->>'tenant_id'` if provided).
        2.  Trigger `on_auth_user_created` for this function.
        3.  Function `public.handle_user_email_update()`: Triggered `AFTER UPDATE OF email ON auth.users`. Updates `public.user_profiles.email` if `OLD.email IS DISTINCT FROM NEW.email`.
        4.  Trigger `on_auth_user_email_updated` for this function."
    *   **Action Required:** Execute SQL in Supabase SQL Editor.

*   [ ] **Verification Point:** Basic Auth Flow & Profile. (Medium)
    *   Start backend & frontend. Sign up. Check `auth.users` & `public.user_profiles`. Log in. Verify redirect. Check `AuthContext`. Test `/api/users/me` with JWT.

---

## Phase 3: Tenant Management & Schema Provisioning

*   [ ] **Goal:** Define `public.tenants` table. (Easy)
    *   **Prompt:**
        "Generate SQL DDL for `public.tenants`: `id` (UUID PK), `name` (TEXT UNIQUE NOT NULL), `schema_name` (TEXT UNIQUE NOT NULL, lowercase, underscore, letter start), `status` (TEXT DEFAULT 'active'), `owner_id` (UUID FK `auth.users(id)` nullable), `created_at`, `updated_at` (with auto-update trigger `public.update_modified_column()`)."
    *   **Action Required:** Create `update_modified_column()` if not exists. Execute DDL.

*   [ ] **Goal:** Update `public.user_profiles` table to link to `tenants`. (Easy)
    *   **Prompt:**
        "Generate SQL `ALTER TABLE public.user_profiles`:
        1.  Add `tenant_id` (UUID, nullable).
        2.  Add FK constraint: `tenant_id` REFERENCES `public.tenants(id)` ON DELETE SET NULL.
        3.  Add index on `tenant_id`."
    *   **Action Required:** Execute SQL.

*   [ ] **Goal:** Define core tables DDL templates for tenant schemas. (Medium)
    *   **Prompt:**
        "Generate SQL DDL templates for tables to be created within each tenant schema (replace `{{tenant_schema}}` placeholder with actual schema name during creation):
        1.  `{{tenant_schema}}.projects`: `id` (UUID PK), `name` (TEXT UNIQUE NOT NULL), `description`, `status`, `created_by_user_id` (UUID), `created_at`, `updated_at`.
        2.  `{{tenant_schema}}.versions`: `id` (UUID PK), `project_id` (UUID FK `projects(id)`), `name` (TEXT NOT NULL), `description`, `status`, `created_by_user_id`, `created_at`, `updated_at`. UNIQUE (`project_id`, `name`).
        3.  `{{tenant_schema}}.version_datasets_metadata`: `id` (UUID PK), `version_id` (UUID FK `versions(id)`), `original_file_name`, `processed_table_name` (TEXT UNIQUE, e.g., `ds_xyz`), `is_primary`, `upload_status`, `error_message`, `row_count`, `created_at`, `updated_at`.
        4.  `{{tenant_schema}}.common_index_configs`: `id` (UUID PK), `version_id` (UUID FK `versions(id)`), `field_name`, `is_filterable`, `created_at`, `updated_at`. UNIQUE (`version_id`, `field_name`).
        5.  `{{tenant_schema}}.file_specific_configs`: `id` (UUID PK), `dataset_metadata_id` (UUID FK `version_datasets_metadata(id)`), `original_field_name`, `display_name`, `data_type`, `is_sortable`, `is_filterable`, `is_chartable`, `is_listable`, `created_at`, `updated_at`. UNIQUE (`dataset_metadata_id`, `original_field_name`).
        Include `updated_at` triggers for all (e.g., using a generic `{{tenant_schema}}.update_modified_column()` if schemas can have own functions, or rely on app-level updates for `updated_at`)."
    *   **Action Required:** Save this SQL template.

*   [ ] **Goal:** Backend API endpoint for admin to create a new tenant and its schema. (Complex)
    *   **Breakdown into Medium steps:**
        *   [ ] **Goal 3.1:** Express.js route/controller for tenant creation. (Medium)
            *   **Prompt:**
                "Backend:
                1.  `src/api/admin.routes.ts`: `POST /admin/tenants` (protected by `ensureAuthenticated` and placeholder `ensureAdminRole` middleware).
                2.  `src/controllers/admin.controller.ts`: `createTenantHandler(req, res)`:
                    *   Validates `req.body` (Zod: `tenantName: string`, `ownerEmail: string`, `initialUsers: array(object({email, role}))` (optional array, max 5)).
                    *   Generates unique, SQL-safe `schemaName` from `tenantName`.
                    *   Calls `tenantService.provisionTenant(tenantName, schemaName, ownerEmail, initialUsers, req.authUser.id)`.
                    *   Returns 201 with tenant details."
            *   **Action Required:** Create/update files. Create placeholder `ensureAdminRole.mw.ts`. Define Zod schema in `src/validations/admin.validations.ts`.

        *   [ ] **Goal 3.2:** Service function `provisionTenant`. (Complex - break further)
            *   [ ] **Goal 3.2.1:** Create tenant record, schema, and initial owner. (Medium)
                *   **Prompt:**
                    "Backend `src/services/tenant.service.ts`: `provisionTenant(tenantName, schemaName, ownerEmail, initialUsers, adminUserId)`:
                    1.  Use `supabaseAdmin`.
                    2.  Find or invite owner user via `ownerEmail` using `supabaseAdmin.auth.admin.listUsers()` / `createUser()`. Get `ownerId`.
                    3.  Insert into `public.tenants` (name, schemaName, owner_id). Get `newTenantId`.
                    4.  Execute `CREATE SCHEMA IF NOT EXISTS "${schemaName}";`.
                    5.  Update `public.user_profiles` for `ownerId`: set `tenant_id = newTenantId`, set role (e.g., 'tenant_admin')."
                *   **Action Required:** Implement in `tenant.service.ts`.

            *   [ ] **Goal 3.2.2:** Create tables within the new tenant schema. (Medium)
                *   **Prompt:**
                    "Continue `provisionTenant` in `tenant.service.ts`.
                    After schema creation:
                    1.  Use the SQL DDL templates (from Goal: Define core tables DDL templates).
                    2.  For each template, replace `{{tenant_schema}}` with the actual `schemaName`.
                    3.  Execute these modified DDLs using `supabaseAdmin.sql()` to create tables within the new tenant's schema."
                *   **Action Required:** Implement in `tenant.service.ts`.

            *   [ ] **Goal 3.2.3:** Create additional initial users for the tenant. (Medium)
                *   **Prompt:**
                    "Continue `provisionTenant` in `tenant.service.ts`.
                    After core tenant setup, if `initialUsers` array is provided:
                    1.  Iterate through `initialUsers`. For each user ({email, role}):
                        *   Find or invite user via `supabaseAdmin.auth.admin`. Get their `userId`.
                        *   Update their `public.user_profiles` record: set `tenant_id = newTenantId` and the specified `role`.
                    2.  Return the created tenant object."
                *   **Action Required:** Implement in `tenant.service.ts`.

*   [ ] **Goal:** Backend: `tenantContextMiddleware` to manage tenant context. (Medium)
    *   **Prompt:**
        "Create `backend/src/middleware/tenantContext.mw.ts`. Function `setTenantContext(req, res, next)`:
        1.  Runs after `ensureAuthenticated`.
        2.  If `req.authUser` exists, fetch their `tenant_id` from `public.user_profiles`.
        3.  If `tenant_id`, fetch `schema_name` from `public.tenants`.
        4.  If valid `schema_name` found, store as `req.tenantSchema = schema_name;`.
        5.  **All subsequent service layer DB queries will use this `req.tenantSchema` to explicitly qualify table names.** (No `SET search_path` for now).
        6.  If no tenant context required for route or user not in tenant, `next()`. If tenant context IS required and not found, return 403.
        7.  Call `next()`."
    *   **Action Required:** Create middleware. Apply to tenant-specific routes.

*   [ ] **Goal:** Frontend UI for Admin to list and create tenants (with initial users & schema name validation). (Medium)
    *   **Prompt:**
        "Frontend:
        1.  `src/pages/admin/TenantsAdminPage.tsx`: Lists tenants. Button to open `CreateTenantDialog.tsx`.
        2.  `src/components/admin/tenants/TenantList.tsx`: Shadcn Table for tenants (Name, Status, Owner, User Count). Actions: Edit, Manage Users for Tenant, Manage Projects for Tenant.
        3.  `src/components/admin/tenants/CreateTenantDialog.tsx`: Form (using `react-hook-form`, Zod) for Tenant Name, Owner Email, and a `useFieldArray` for adding 1-5 initial users (Email, Role).
            *   **Real-time validation for a user-suggested Schema Name part (e.g., based on Tenant Name, debounced API call to backend `GET /api/admin/tenants/validate-schema-name?name=xxx`).**
        API client in `frontend/src/services/admin.api.ts` for `fetchTenants()`, `createTenant(data)`, `validateSchemaName(name)`."
    *   **Action Required:** Create components & API client. Add route. Backend needs `GET /api/admin/tenants/validate-schema-name`.

*   [ ] **Verification Point:** Tenant Creation & Schema Provisioning. (Complex)
    *   Log in as super admin. Create tenant with initial users.
    *   Verify: `public.tenants` record, new schema with tables (`projects`, `versions` etc.), `public.user_profiles` updated for owner and initial users with correct `tenant_id` and roles. Schema name validation UI works.

---

## Phase 4: Project & Version Management (Integrated Workflow)

*All operations use `req.tenantSchema` for explicit table qualification.*

*   [ ] **Goal:** Backend APIs for Project CRUD within tenant schema. (Medium)
    *   **Prompt:**
        "Backend: `src/api/project.routes.ts`, `controllers/project.controller.ts`, `services/project.service.ts`.
        Routes: `POST /projects`, `GET /projects`, `GET /projects/:projectId`, `PUT /projects/:projectId`, `DELETE /projects/:projectId`.
        Protected by `ensureAuthenticated` & `setTenantContext`.
        Services use `req.tenantSchema` to query `"${tenantSchema}".projects`.
        Zod validation. Focus on `createProject` and `listProjects` service functions with explicit schema qualification."
    *   **Action Required:** Implement. Mount in `app.ts`.

*   [ ] **Goal:** Backend APIs for Version CRUD within tenant schema. (Medium)
    *   **Prompt:**
        "Backend: `src/api/version.routes.ts`, `controllers/version.controller.ts`, `services/version.service.ts`.
        Routes: `POST /projects/:projectId/versions`, `GET /projects/:projectId/versions`, `GET /versions/:versionId`, `PUT /versions/:versionId`, `DELETE /versions/:versionId`.
        Protected. Services use `req.tenantSchema`.
        Zod validation. Focus on `createVersion` and `listVersionsForProject`."
    *   **Action Required:** Implement. Mount in `app.ts`.

*   [ ] **Goal:** Frontend UI for Project & Version Wizard and Management (Admin). (Complex)
    *   **Breakdown into Medium steps:**
        *   [ ] **Goal 4.1:** Project/Version Creation Wizard UI. (Medium)
            *   **Prompt:**
                "Frontend `src/components/admin/creation-wizards/ProjectVersionWizard.tsx`:
                Multi-step dialog (Shadcn `Dialog` or custom).
                Step 1: Create/Select Project (Input for new Project Name/Desc, or Select existing).
                Step 2: Create Version (Input for Version Name/Desc). Option 'Save & Add Data Later' or 'Save & Go to Version Management'.
                Submits data to backend `POST /api/projects` then `POST /api/projects/:newProjectId/versions`.
                Manages wizard state."
            *   **Action Required:** Create component. Trigger from admin dashboard or projects page.

        *   [ ] **Goal 4.2:** `ProjectsAdminPage.tsx` listing projects for tenant. (Medium)
            *   **Prompt:**
                "Frontend `src/pages/admin/ProjectsAdminPage.tsx`:
                Fetches projects for current admin's tenant (`GET /api/projects`).
                Lists projects (Shadcn Table). Each links to `/admin/tenants/:tenantId/projects/:projectId/versions` (`TenantProjectVersionsPage.tsx`).
                Button to launch `ProjectVersionWizard.tsx`."
            *   **Action Required:** Create page. Add route.

        *   [ ] **Goal 4.3:** `TenantProjectVersionsPage.tsx` listing versions for a project. (Medium)
            *   **Prompt:**
                "Frontend `src/pages/admin/TenantProjectVersionsPage.tsx`:
                Takes `projectId` from route. Fetches project details and its versions (`GET /api/projects/:projectId/versions`).
                Lists versions (Shadcn Table). Each links to `/admin/versions/:versionId/manage` (`VersionManagementPage.tsx`).
                Button to launch `ProjectVersionWizard.tsx` pre-filled with current project to add a new version."
            *   **Action Required:** Create page. Add route.

        *   [ ] **Goal 4.4:** `VersionManagementPage.tsx` structure with Overview Tab. (Medium)
            *   **Prompt:**
                "Frontend `src/pages/admin/VersionManagementPage.tsx`:
                Takes `versionId` from route. Fetches version details (`GET /api/versions/:versionId`).
                Shadcn `Tabs`: 'Overview', 'Datasets', 'Common Index', 'File Specific Config'.
                'Overview' tab: Displays version name, desc, status. Form (React Hook Form, Zod) to edit these, submits to `PUT /api/versions/:versionId`."
            *   **Action Required:** Create page. Add route.

*   [ ] **Verification Point:** Project & Version CRUD via Wizard and Management pages. (Medium)
    *   Admin logs in, selects/creates tenant context. Uses wizard to create Project & Version.
    *   Edits Project details. Edits Version overview details.
    *   Verify data saved in correct tenant schema. UI updates.

---

## Phase 5: Data Upload & Configuration (within Version Management)

*All operations use `req.tenantSchema` and are context-aware of the current `versionId`.*

*   [ ] **Goal:** Backend API for Dataset Upload and Processing to a Version. (Complex)
    *   **Breakdown into Medium steps:**
        *   [ ] **Goal 5.1:** Express.js route for file upload to Version. (Medium)
            *   **Prompt:**
                "Backend `src/api/version.routes.ts`: Add `POST /versions/:versionId/datasets`.
                Use `multer` for `multipart/form-data` (single file `datasetFile`). Temporary server FS storage.
                Handler in `version.controller.ts` gets `versionId`, `req.file`, `isPrimary` (from `req.body`).
                Calls `versionService.uploadAndProcessDataset(versionId, req.tenantSchema, file, isPrimary)`."
            *   **Action Required:** Update routes. Ensure `uploads/` gitignored.

        *   [ ] **Goal 5.2:** Service `uploadAndProcessDataset`. (Complex - break further)
            *   [ ] **Goal 5.2.1:** Create metadata, parse file, create dynamic table in tenant schema. (Medium)
                *   **Prompt:**
                    "Backend `src/services/version.service.ts`: `uploadAndProcessDataset(versionId, tenantSchema, file, isPrimary)`:
                    1.  Generate unique `processed_table_name` (e.g., `ds_<uuid>`).
                    2.  Insert into `"${tenantSchema}".version_datasets_metadata` (status 'processing').
                    3.  Read/parse CSV (`papaparse`, `header: true`). Derive sanitized column names & basic SQL types (default TEXT).
                    4.  `CREATE TABLE "${tenantSchema}"."${processedTableName}" (...cols...)` DDL. Execute via `supabaseAdmin.sql()`."
                *   **Action Required:** Implement.

            *   [ ] **Goal 5.2.2:** Insert data into dynamic table, finalize metadata, delete temp file. (Medium)
                *   **Prompt:**
                    "Continue `uploadAndProcessDataset`:
                    1.  Batch insert parsed data rows into `"${tenantSchema}"."${processedTableName}"`.
                    2.  If success, update `version_datasets_metadata`: status 'completed', `row_count`.
                    3.  **Delete temporary uploaded file: `fs.unlinkSync(file.path)`**.
                    4.  Handle errors: update status to 'failed', log."
                *   **Action Required:** Implement.

*   [ ] **Goal:** Frontend UI for Dataset Upload & Listing in `VersionManagementPage` ('Datasets' Tab). (Medium)
    *   **Prompt:**
        "Frontend `src/components/admin/versions/` (for `VersionManagementPage` 'Datasets' tab):
        1.  `DatasetList.tsx`: Fetches datasets for `versionId` (`GET /api/versions/:versionId/datasets` - create backend route/service). Displays in Shadcn Table (name, status, primary, actions: Delete, Configure Fields).
        2.  `DatasetUploader.tsx`: Form (`<input type="file">`, 'Is Primary' checkbox). Submits `FormData` to `POST /api/versions/:versionId/datasets`. Shows progress. Refetches list on success.
        Backend needs `versionService.listDatasetsForVersion(versionId, tenantSchema)`."
    *   **Action Required:** Create FE components. Implement BE route/service. Integrate into `VersionManagementPage`.

*   [ ] **Goal:** Backend APIs & Frontend UI for Common Index Config. (Medium)
    *   **Prompt:**
        "Backend: `version.routes.ts` (or `config.routes.ts`), `config.controller.ts`, `config.service.ts`.
        Routes for `common_index_configs` scoped to version: `GET /versions/:versionId/common-index-configs`, `POST /versions/:versionId/common-index-configs` (batch save/upsert).
        Services interact with `"${tenantSchema}".common_index_configs`.
        Frontend `src/components/admin/versions/CommonIndexEditor.tsx` (for 'Common Index' tab): Fetches, displays (field name, is_filterable), allows add/edit/delete. Saves all to backend. Suggests field names from version's datasets."
    *   **Action Required:** Implement BE & FE. Integrate into `VersionManagementPage`.

*   [ ] **Goal:** Backend APIs & Frontend UI for File Specific Config. (Medium)
    *   **Prompt:**
        "Backend: Routes scoped to dataset: `GET /datasets/:datasetMetaId/file-specific-configs`, `POST /datasets/:datasetMetaId/file-specific-configs` (batch save).
        Services interact with `"${tenantSchema}".file_specific_configs`.
        Frontend `src/components/admin/versions/FileSpecificConfigEditor.tsx`: Triggered from `DatasetList`. Fetches fields for the dataset. Allows editing display name, data type, and flags (sortable, filterable, chartable, listable). Saves all to backend."
    *   **Action Required:** Implement BE & FE. Integrate into `VersionManagementPage`.

*   [ ] **Verification Point:** Data Upload & Full Configuration. (Complex)
    *   Admin: Upload CSV to a version. Verify dynamic table created in tenant schema, data inserted.
    *   Verify dataset listed. Configure Common Index and File Specific fields. Verify saved to DB.

---

## Phase 6: User Portal - Data Exploration Setup

*   [ ] **Goal:** Frontend: `ProjectVersionSelector.tsx` for users. (Medium)
    *   **Prompt:**
        "Frontend `src/components/explore/ProjectVersionSelector.tsx`:
        Uses `useAuth()` for `tenant_id`. Fetches active projects for tenant (`GET /api/projects` - ensure it's usable by non-admins, filtered by tenant and active status).
        On project select, fetches its active versions (`GET /api/projects/:projectId/versions` - filtered by active status).
        Uses Shadcn `Select`. Updates Zustand store `useExploreStore` (`currentProjectId`, `currentVersionId`)."
    *   **Action Required:** Create component & store. Adapt backend APIs if needed.

*   [ ] **Goal:** Frontend: Main `DataExplorePage.tsx` structure. (Medium)
    *   **Prompt:**
        "Frontend `src/pages/explore/DataExplorePage.tsx`:
        Protected route. Includes `ProjectVersionSelector`. Subscribes to `currentVersionId` from `useExploreStore`.
        On `currentVersionId` change, triggers data fetch.
        Layout: `FilterPane.tsx` (left), `DataDisplayArea.tsx` (main, with tabs for datasets), `ConversationalQueryInput.tsx` (top/bottom). Placeholders for now."
    *   **Action Required:** Create page. Set up routing.

*   [ ] **Goal:** Backend API to fetch combined exploration data for a version (`GET /api/explore/versions/:versionId/view`). (Complex)
    *   **Breakdown:**
        *   [ ] **Goal 6.1:** Endpoint definition & service structure. (Medium)
            *   **Prompt:**
                "Backend: `src/api/explore.routes.ts`, `controllers/explore.controller.ts`, `services/explore.service.ts`.
                Route `GET /explore/versions/:versionId/view`. Protected, uses `setTenantContext`.
                Controller calls `exploreService.getExplorationViewData(versionId, tenantSchema, req.query)`. `req.query` can have `datasetMetaId`, filters, sort, page."
            *   **Action Required:** Create files. Mount routes.

        *   [ ] **Goal 6.2:** Service `getExplorationViewData` logic. (Medium)
            *   **Prompt:**
                "Backend `explore.service.ts` `getExplorationViewData()`:
                1.  Fetch all `"${tenantSchema}".version_datasets_metadata` for `versionId`. Determine `activeDatasetMeta` (primary or from `datasetMetaId` query param).
                2.  Fetch `"${tenantSchema}".common_index_configs` for `versionId`.
                3.  Fetch `"${tenantSchema}".file_specific_configs` for `activeDatasetMeta.id`.
                4.  Construct SQL: `SELECT * FROM "${tenantSchema}"."${activeDatasetMeta.processed_table_name}"`. (Later: add WHERE for filters, ORDER BY, LIMIT/OFFSET). Execute.
                5.  Return `{ datasetsMetadataForVersion, activeDatasetMeta, commonIndexConfigs, fileSpecificConfigsForActiveDataset, dataRows, paginationInfo }`."
            *   **Action Required:** Implement service.

*   [ ] **Verification Point:** Basic Exploration Data Loading. (Medium)
    *   Upload data for a version. Configure some fields.
    *   Log in as user. Select project/version. Verify `DataExplorePage` calls backend & receives composite data object with sample rows from correct tenant table.

---

## Phase 7: Data Exploration Interactivity (Filters, Table, Basic Charts)

*   [ ] **Goal:** Frontend: `FilterPane.tsx` component. (Medium)
    *   **Prompt:**
        "Frontend `src/components/explore/FilterPane.tsx`:
        Receives/fetches configs (`commonIndexConfigs`, `fileSpecificConfigsForActiveDataset`).
        Renders filter controls (Shadcn `Input`, `Select`, `Slider`, `DatePicker` from `react-day-picker`) for `is_filterable` fields.
        Manages local filter state. On change, updates `useExploreStore`'s filter state, triggering re-fetch in `DataExplorePage`."
    *   **Action Required:** Create. Integrate into `DataExplorePage`.

*   [ ] **Goal:** Backend: Enhance `getExplorationViewData` to apply filters, sorting, pagination. (Medium)
    *   **Prompt:**
        "Modify `backend/src/services/explore.service.ts` `getExplorationViewData()`:
        Accept `filters`, `sortBy`, `sortDir`, `page`, `pageSize` from `queryParams`.
        Dynamically build `WHERE`, `ORDER BY`, `LIMIT`, `OFFSET` clauses for the SQL query against `"${tenantSchema}"."${activeDatasetMeta.processed_table_name}"`.
        Use Supabase client's query builder methods (`.match()`, `.order()`, `.range()`) for safety and ease."
    *   **Action Required:** Update service.

*   [ ] **Goal:** Frontend: `DataTable.tsx` component using TanStack Table. (Medium)
    *   **Prompt:**
        "Frontend `src/components/explore/DataTable.tsx`:
        Receives `dataRows`, `fileSpecificConfigsForActiveDataset`, `paginationInfo`.
        Uses `@tanstack/react-table`. Columns from `is_listable` fields. Headers from `display_name`.
        Implement server-side pagination controls that update `useExploreStore` (page, pageSize).
        Implement server-side sorting controls that update `useExploreStore` (sortBy, sortDir)."
    *   **Action Required:** Create. Integrate into `DataDisplayArea`.

*   [ ] **Goal:** Frontend: Basic ECharts Integration (`BarChart.tsx`). (Medium)
    *   **Prompt:**
        "Frontend `src/components/explore/charts/BarChart.tsx`:
        Receives `dataRows`, `fileSpecificConfigsForActiveDataset`.
        User selects categorical X-axis, numerical Y-axis from `is_chartable` fields (Shadcn `Select`).
        Processes/aggregates `dataRows`. Renders `echarts-for-react` bar chart."
    *   **Action Required:** Create. Add to `DataDisplayArea`.

*   [ ] **Goal:** Frontend: Dataset selection using Tabs in `DataDisplayArea.tsx`. (Medium)
    *   **Prompt:**
        "Modify `frontend/src/components/explore/DataDisplayArea.tsx`:
        Receives `datasetsMetadataForVersion` and `activeDatasetMetaId` (from `useExploreStore` or props).
        Renders Shadcn `Tabs` where each tab represents a dataset from `datasetsMetadataForVersion`.
        Tab value is `datasetMetaId`. `onValueChange` updates `activeDatasetMetaId` in `useExploreStore`, triggering re-fetch in `DataExplorePage`.
        Content of active tab shows `DataTable` and charts for that dataset."
    *   **Action Required:** Update component.

*   [ ] **Verification Point:** Filters, Table, Basic Chart, Dataset Tabs. (Complex)
    *   Select version. Apply filters. Verify `DataTable`/`BarChart` update.
    *   Verify table pagination/sorting (server-side) works.
    *   Switch datasets using tabs, verify content updates.

---

## Phase 8: Service Requests (SR) & Data Correction Requests (DCR)

*   [ ] **Goal:** Define SR/DCR related tables in `public` schema. (Medium)
    *   **Prompt:**
        "Generate SQL DDL for `public` schema:
        1.  `service_requests`: `id`, `title`, `description`, `status`, `priority`, `created_by_user_id` (FK `auth.users`), `tenant_id` (FK `public.tenants`), `project_id_context`, `version_id_context`, `assigned_to_admin_id` (FK `auth.users`), `created_at`, `updated_at`.
        2.  `sr_comments`: `id`, `sr_id` (FK `service_requests`), `comment_text`, `user_id` (FK `auth.users`), `created_at`.
        3.  `data_correction_requests`: `id`, `tenant_id` (FK `public.tenants`), `version_id_context`, `dataset_name_context` (e.g., `ds_xyz`), `row_identifier_context` (JSONB), `field_name_context`, `original_value` (JSONB), `corrected_value` (JSONB), `justification`, `status`, `created_by_user_id` (FK `auth.users`), `approved_or_rejected_by_admin_id` (FK `auth.users`), `admin_comments`, `change_timestamp`, `created_at`, `updated_at`.
        Include `updated_at` triggers."
    *   **Action Required:** Execute SQL.

*   [ ] **Goal:** Backend APIs for SR Workflow (User & Admin). (Complex)
    *   [ ] **Goal 8.1.1:** User: `POST /api/service-requests` (Create), `GET /api/service-requests/my` (List own, default open). (Medium)
    *   [ ] **Goal 8.1.2:** Admin: `GET /api/admin/service-requests` (List all/filtered), `PUT /api/admin/service-requests/:srId/assign`, `PUT /api/admin/service-requests/:srId/status`, `POST /api/admin/service-requests/:srId/comments`. (Medium)
    *   **Prompt (Combined for brevity):** "Implement backend SR routes, controllers, services. User routes link to `req.authUser.id` and `tenant_id`. Admin routes require admin role. Services interact with `public.service_requests` and `public.sr_comments`."
    *   **Action Required:** Implement backend.

*   [ ] **Goal:** Frontend UI for SR Management (User & Admin views). (Complex)
    *   [ ] **Goal 8.2.1:** User: `CreateSRForm.tsx`, `MySRList.tsx` (defaults to open SRs). (Medium)
    *   [ ] **Goal 8.2.2:** Admin: `AdminSRDashboard.tsx` (lists all SRs, filters, actions), `SRDetailView.tsx` (shows comments, allows updates). (Medium)
    *   **Prompt (Combined):** "Implement frontend SR components. Forms use React Hook Form/Zod. Lists use Shadcn Table. Integrate with backend APIs."
    *   **Action Required:** Implement frontend. Add to respective dashboards.

*   [ ] **Goal:** Backend APIs for DCR Workflow. (Complex)
    *   [ ] **Goal 8.3.1:** User (Advanced): `POST /api/data-correction-requests` (Initiate DCR). (Medium)
    *   [ ] **Goal 8.3.2:** User (Adv/Std): `GET /api/data-correction-requests/my` (List own DCRs, default open/pending). (Medium)
    *   [ ] **Goal 8.3.3:** Admin: `GET /api/admin/data-correction-requests` (List all/filtered), `PUT /api/admin/data-correction-requests/:dcrId/approve`, `PUT /api/admin/data-correction-requests/:dcrId/decline`. Admin can also initiate. (Medium)
    *   **Prompt (Combined):** "Implement backend DCR routes, controllers, services.
        `initiateDCR` service: creates DCR in `public.data_correction_requests` (status 'pending').
        `approveDCR` service: updates DCR status to 'approved', stores `change_timestamp`, AND **updates the actual data row in `\"${tenantSchema}\".\"${dcr.dataset_name_context}\"` with `dcr.corrected_value`**.
        `declineDCR` service: updates status to 'declined'.
        All services log to audit trail."
    *   **Action Required:** Implement backend.

*   [ ] **Goal:** Frontend UI for DCR Management. (Complex)
    *   [ ] **Goal 8.4.1:** DCR Initiation from `DataTable.tsx` / `DetailPanel.tsx` (Advanced User). (Medium)
        *   **Prompt:** "Add 'Request Correction' action to data table rows/detail panel. Opens `DCRForm.tsx` pre-filled with context (versionId, dataset_name_context, row_identifier, field_name, original_value). Submits to `POST /api/data-correction-requests`."
    *   [ ] **Goal 8.4.2:** User DCR List (`MyDCRList.tsx` - defaults to open/pending). (Medium)
    *   [ ] **Goal 8.4.3:** Admin DCR Dashboard/List (`AdminDCRDashboard.tsx`) & Detail/Approval View. (Medium)
        *   **Prompt (Combined for 8.4.2 & 8.4.3):** "Implement frontend DCR components. Lists show original/corrected values. Admin view allows approve/decline with comments."
    *   **Action Required:** Implement frontend.

*   [ ] **Goal:** Frontend: Display DCR indicators and history in Data Exploration. (Medium)
    *   **Prompt:** "Modify `DataTable.tsx` and `DetailPanel.tsx`:
        If a data cell has an approved DCR (backend API `getExplorationViewData` needs to include DCR info for rows), display an indicator.
        Allow viewing DCR history for a cell (original value, corrected value, timestamp, justification from `public.data_correction_requests`)."
    *   **Action Required:** Update frontend. Backend API needs to augment rows with DCR status/data.

*   [ ] **Goal:** Implement Email Notifications for SR/DCR events. (Medium)
    *   **Prompt:**
        "Backend: Create `src/services/email.service.ts` using Nodemailer and Handlebars for templates.
        Modify SR and DCR services to call `emailService.sendSREventNotification()` or `sendDCREventNotification()` upon relevant events (submission, status change, approval, rejection, new comment).
        Queue emails asynchronously (e.g., simple `setImmediate` or a proper queue if many emails).
        Implement basic user profile setting (in `public.user_profiles.notification_preferences` JSONB column) for opting out of non-critical emails. `emailService` should check this preference. Log email send status."
    *   **Action Required:** Implement email service and integrate calls. Frontend: Add UI for notification preferences in user profile page.

*   [ ] **Verification Point:** SR & DCR Full Workflows with Notifications and Data Update. (Complex)
    *   User creates SR. Admin updates. User sees update & email.
    *   Adv. User initiates DCR. Admin approves. Verify data in tenant table is updated. User sees corrected data & email. Indicator shown.
    *   Admin declines DCR. User sees status & email.

---

## Phase 9: Conversational Query Feature (MVP)

*   [ ] **Goal:** Enable `pgvector` extension in Supabase. (Easy)
    *   **Action Required:** Supabase Dashboard > Database > Extensions. Search for `vector` and enable it.

*   [ ] **Goal:** Define `public.schema_embeddings` table. (Easy)
    *   **Prompt:**
        "SQL DDL for `public.schema_embeddings`: `id`, `tenant_id` (FK `public.tenants`), `version_id_context` (TEXT), `table_name_context` (e.g., `ds_xyz`), `column_name`, `column_description`, `embedding` (VECTOR(768) for Google `embedding-001`), `created_at`. HNSW index on `embedding` (`USING hnsw (embedding vector_cosine_ops)`)."
    *   **Action Required:** Execute SQL.

*   [ ] **Goal:** Backend: Schema Indexing Process for a Version (`POST /api/admin/versions/:versionId/index-schema`). (Complex)
    *   [ ] **Goal 9.1.1:** Admin API endpoint to trigger indexing. (Easy)
    *   [ ] **Goal 9.1.2:** Service `indexVersionSchema(versionId, tenantSchema, tenantId)`: (Medium)
        *   **Prompt:** "Backend `indexing.service.ts`: `indexVersionSchema()`:
            1.  Fetch `file_specific_configs` for all datasets in the version from `"${tenantSchema}".file_specific_configs`.
            2.  For each field: create descriptive string ("Table [dataset table name] has column [column name] displayed as [display name] of type [data type].").
            3.  Create `llm.client.ts` with `generateEmbedding(text: string)` function using Google Gemini API (`@google/generative-ai`, `embedding-001` model).
            4.  Generate embeddings for these strings.
            5.  Save into `public.schema_embeddings` (tenant_id, version_id_context, table_name_context from `version_datasets_metadata.processed_table_name`, column_name, description, embedding)."
        *   **Action Required:** Implement.

*   [ ] **Goal:** Backend: Conversational Query Orchestration API (`POST /api/explore/versions/:versionId/query`). (Very Complex)
    *   [ ] **Goal 9.2.1:** API endpoint definition. (Easy)
    *   [ ] **Goal 9.2.2:** Service `processConversationalQuery(versionId, tenantSchema, tenantId, userQuery)`: User query to embedding. (Easy)
    *   [ ] **Goal 9.2.3:** Service: Semantic search `public.schema_embeddings` (filtered by `tenantId`, `versionId_context`) using `vector_cosine_similarity` to find relevant schema context (table/column names and descriptions). (Medium)
    *   [ ] **Goal 9.2.4:** Service: Construct LLM prompt for SQL generation: Include user query, retrieved schema context, examples of queries ("Show sales for Product X", "Compare IP filings for Nokia vs Motorola", "What is the title of IP record 123?"), instructions to query only specific tables (from `version_datasets_metadata` for that version) within `"${tenantSchema}"`. (Medium)
    *   [ ] **Goal 9.2.5:** Service: Call LLM (Gemini) via `llm.client.ts` to generate SQL. (Medium)
    *   [ ] **Goal 9.2.6:** Service: **CRITICAL: Validate and Sanitize LLM-generated SQL.** Use `sql-parser-cst` (or similar Node.js SQL parser). Allowlist SELECT only. Ensure table names in SQL are from the `version_datasets_metadata.processed_table_name` for the current version and are correctly qualified with `tenantSchema`. Disallow joins to `public` tables other than explicitly allowed ones (if any). Reject complex subqueries or DML/DDL. (Complex)
    *   [ ] **Goal 9.2.7:** Service: Execute validated SQL against tenant data using `supabaseAdmin.sql()`. (Medium)
    *   [ ] **Goal 9.2.8:** Service: Format results. Optionally pass to LLM for natural language summary. Cache results. (Medium)
    *   **Prompt (Overall):** "Outline the structure for `explore.service.ts` `processConversationalQuery()` covering these sub-steps. Emphasize the SQL validation logic."
    *   **Action Required:** Implement.

*   [ ] **Goal:** Frontend: `ConversationalQueryInput.tsx` and result display. (Medium)
    *   **Prompt:** "Frontend `src/components/explore/ConversationalQueryInput.tsx`:
        Input bar. Submits query to `POST /api/explore/versions/:versionId/query`.
        Displays results (text summary, or if structured data, updates a dedicated chart/table area).
        Shows loading/error states. Includes query template buttons."
    *   **Action Required:** Implement. Integrate into `DataExplorePage`.

*   [ ] **Verification Point:** MVP Conversational Query. (Complex)
    *   Admin: Index a version's schema.
    *   User: Ask simple questions ("show all X where Y", "what is title for Z"). Verify relevant data returned.
    *   User: Ask a "why is..." question. Verify a comparative/descriptive result is returned.
    *   Inspect backend logs: verify query embedding, context retrieval, LLM prompt, generated SQL, validation outcome, and final executed SQL.

---

## Phase 10: Dockerization & Deployment Prep

*   [ ] **Goal:** `Dockerfile` for Backend (Express.js). (Medium)
    *   **Prompt:** "Generate multi-stage `backend/Dockerfile`: Builder (Node, install deps, copy src, `npm run build`). Runner (slim Node, copy `node_modules` (prod only), `dist`, `package.json`). Expose port. `CMD ["npm", "start"]`."
    *   **Action Required:** Create.

*   [ ] **Goal:** `Dockerfile` for Frontend (React/Vite). (Medium)
    *   **Prompt:** "Generate multi-stage `frontend/Dockerfile`: Builder (Node, install deps, copy src, `npm run build`). Runner (Nginx, copy `frontend/dist` to Nginx HTML dir). Include `frontend/nginx.conf` to serve app and handle client-side routing (`try_files $uri /index.html`)."
    *   **Action Required:** Create `frontend/Dockerfile` and `nginx.conf`.

*   [ ] **Goal:** `docker-compose.yml` for local development. (Medium)
    *   **Prompt:** "Generate root `docker-compose.yml`:
        `backend` service (builds `backend/Dockerfile`, maps port, mounts `./backend:/usr/src/app`, `env_file: ./backend/.env`).
        `frontend` service (builds `frontend/Dockerfile`, maps port, (optional: mounts `./frontend:/app` if dev server used in Docker, otherwise no mount for prod build), `env_file: ./frontend/.env`).
        Assumes Supabase Cloud for Auth/DB during dev."
    *   **Action Required:** Create.

*   [ ] **Verification Point:** Dockerized Local Environment. (Medium)
    *   Run `docker-compose up --build`. Access frontend & backend health. Verify basic app functionality.

---

## Phase 11: Testing, CI/CD & Final Touches

*   [ ] **Goal:** Setup Basic Unit & Integration Test Structure (Jest/Vitest, RTL, Supertest). (Medium)
    *   **Prompt:** "Provide example structure for:
        1.  Backend unit test for a service function in `project.service.test.ts` (mock Supabase).
        2.  Backend integration test for an API endpoint in `project.routes.test.ts` (using Supertest, setup/teardown test DB if possible).
        3.  Frontend unit test for a React component in `MyComponent.test.tsx` (using RTL)."
    *   **Action Required:** Setup test runners, create example tests.

*   [ ] **Goal:** CI Workflow (GitHub Actions). (Medium)
    *   **Prompt:** "Generate `.github/workflows/ci.yml`: Trigger on push/PR (main/develop). Jobs for backend & frontend: Lint, Type Check, Unit & Integration Tests, Build. For backend, can include starting Supabase local dev environment for integration tests if using Supabase CLI."
    *   **Action Required:** Create workflow file.

*   [ ] **Goal:** Implement Admin Role Protection properly (`ensureAdminRole.mw.ts`). (Medium)
    *   **Prompt:** "Implement `backend/src/middleware/adminRole.mw.ts` `ensureAdminRole(req, res, next)`:
        Checks `req.authUser.role` (or a custom claim from JWT indicating platform admin status). If not admin, return 403. Otherwise, `next()`."
    *   **Action Required:** Implement. Apply to admin-only routes.

*   [ ] **Goal:** Comprehensive API Documentation (Swagger/OpenAPI for backend). (Medium)
    *   **Prompt:** "Setup `swagger-jsdoc` and `swagger-ui-express` in backend. Add JSDoc annotations to a few key API routes (e.g., tenant creation, project list) to generate basic OpenAPI spec. Serve Swagger UI on an admin-only route (e.g., `/api-docs`)."
    *   **Action Required:** Install packages. Implement.

*   [ ] **Goal:** Implement User Profile Page (Frontend) for managing notification preferences. (Medium)
    *   **Prompt:** "Create `frontend/src/pages/UserProfilePage.tsx`.
        Fetches current user's profile (`GET /api/users/me`).
        Form (React Hook Form) to update `full_name`, `avatar_url` (future), and `notification_preferences` (JSONB object with boolean flags like `sr_updates_email_enabled`, `dcr_updates_email_enabled`).
        Submits to `PUT /api/users/me` (create backend endpoint)."
    *   **Action Required:** Implement frontend page and backend `PUT /api/users/me` endpoint.

*   [ ] **Goal:** Review and Refine UI/UX based on full flow (especially dashboard, wizards, dataset tabs). (Complex)
    *   **Action Required:** Team review and usability testing. Iterate on design.

*   [ ] **Goal:** Security Audit & Hardening (manual review & automated tools if possible). (Complex)
    *   **Action Required:** Review against OWASP Top 10, check tenant isolation thoroughly, analyze dependencies.

*   [ ] **Goal:** Performance Testing & Optimization across key user flows. (Complex)
    *   **Action Required:** Use tools like k6/JMeter. Test dashboard load, data exploration with large data, DCR updates.

*   [ ] **Goal:** Finalize READMEs (root, backend, frontend) and Deployment Documentation. (Medium)
    *   **Action Required:** Update documentation with setup, config, run, test, deployment instructions. Include details on tenant schema migration strategy.
