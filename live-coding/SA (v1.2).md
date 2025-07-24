
```markdown
# Solution Architecture Document

**Project:** SaaS Data Visualization Platform
**Version:** 1.2 (Standalone Final Cut)
**Date:** 2023-11-18
**Authors:** AI Assistant (based on user requirements)

## 1. Introduction

### 1.1 Purpose

This document outlines the solution architecture for the multi-tenant SaaS Data Visualization Platform. It describes the major architectural components, their interactions, technologies chosen, and key design decisions. This architecture aims to meet the functional and non-functional requirements detailed in the Product Requirements Document (PRD v1.5) and align with the best practices outlined in the Dev Playbook (v4.3).

### 1.2 Scope

The scope of this architecture covers the end-to-end solution, including the frontend user interface, backend application services, database, authentication, file handling, notifications, and deployment strategy. It focuses on the technical realization of the platform's core features such as multi-tenancy, user and tenant administration, project/version management with integrated data upload and configuration, data exploration with conversational queries, service request (SR) and data correction request (DCR) workflows.

### 1.3 Goals of the Architecture

*   **Scalability:** Support a growing number of tenants, users, and data volumes, with particular attention to the schema-per-tenant model and its implications.
*   **Security:** Ensure robust tenant data isolation, secure authentication and authorization, and protection against common web vulnerabilities. Handle sensitive operations like DCR data updates securely.
*   **Maintainability:** Promote a modular design with clear separation of concerns, facilitating easier updates, extensions, and a robust tenant schema migration strategy.
*   **Performance:** Deliver a responsive user experience for dashboards, data exploration, administrative tasks, and real-time validations.
*   **Reliability:** Ensure high availability, data integrity, and auditable processes for data corrections.
*   **Usability:** Provide intuitive interfaces for all user roles, including wizards for complex setups and informative dashboards.

### 1.4 Key Architectural Principles

*   **Multi-Tenancy via Schema-per-Tenant:** Strong data isolation at the database level, with the application layer responsible for context and schema management.
*   **Service-Oriented Backend:** Express.js backend with distinct services for different business domains, including robust handling of DCR data updates and asynchronous email notifications.
*   **Component-Based Frontend:** React frontend built with reusable UI components, supporting features like role-specific dashboards and multi-step wizards.
*   **Stateless Backend APIs:** APIs designed to be stateless, relying on JWTs for authentication and authorization context.
*   **Asynchronous Processing:** Leverage asynchronous patterns in Node.js for I/O-bound operations and background tasks (e.g., email queuing).
*   **Cloud-Native Services:** Utilize Supabase for managed PostgreSQL and Authentication.
*   **Containerization:** Docker for consistent development, testing, and deployment environments.

## 2. Architecture Overview

The platform follows a three-tier architecture with a presentation tier (React Frontend), an application tier (Node.js/Express.js Backend), and a data tier (Supabase PostgreSQL & Auth, temporary file storage), supplemented by external services for NLP and email.

### 2.1 Logical Architecture Diagram

```mermaid
graph TD
    A[Users (Browser/Client)] -->|HTTPS (React App)| B(Frontend: React SPA);
    B -->|HTTPS (REST APIs)| C(Backend: Node.js/Express.js API);

    C -->|SQL/Supabase SDK| D(Data Tier: Supabase);
    D --> DB[(PostgreSQL - Schema per Tenant)];
    D --> AuthSvc[(Supabase Auth)];
    D --> StorageSvc[(Server FS / Supabase Storage - Temporary File Staging)];

    C -->|API Call| E(NLP/AI Service - e.g., Google Gemini API);
    C -->|SMTP/API| F(Email Service - e.g., AWS SES, SendGrid);

    subgraph "Supabase Cloud Platform"
        DB
        AuthSvc
        %% StorageSvc can be Supabase Storage or part of Backend server deployment
    end

    Admin[SaaS Administrator] --> B;
    ClientUser[End Client User] --> B;

    style B fill:#dae8fc,stroke:#6c8ebf,stroke-width:2px;
    style C fill:#d5e8d4,stroke:#82b366,stroke-width:2px;
    style D fill:#ffe6cc,stroke:#d79b00,stroke-width:2px;
    style E fill:#f8cecc,stroke:#b85450,stroke-width:2px;
    style F fill:#e1d5e7,stroke:#9673a6,stroke-width:2px;
```

**Diagram Description:**

*   **Users (SaaS Administrators, End Client Users):** Interact with the platform via web browsers.
*   **Frontend (React SPA):** Renders UI, handles user interactions, client-side state, communicates with backend.
*   **Backend (Node.js/Express.js API):** Handles business logic, API requests, tenant context, data processing (including DCR updates), interaction with data tier, NLP, and Email services.
*   **Data Tier (Supabase & Temporary Storage):**
    *   **PostgreSQL Database (via Supabase):** Stores application data, with each tenant having a dedicated schema for their projects, versions, and processed datasets. Shared `public` schema for common metadata.
    *   **Supabase Auth:** Manages user authentication and JWTs.
    *   **Temporary File Staging (Server FS / Supabase Storage):** Used for temporary staging of uploaded files before processing by the backend. Original files are deleted after processing.
*   **NLP/AI Service:** External service for conversational query.
*   **Email Service:** External service for transactional email notifications (SR/DCR updates).

### 2.2 Technology Stack Summary

*   **Frontend:** React, TypeScript, Tailwind CSS, Shadcn UI, ECharts, Zustand, TanStack Query, React Hook Form, Zod.
*   **Backend:** Node.js, Express.js, TypeScript, Zod, `papaparse`, `multer`, Nodemailer (or SDK for email service).
*   **Database:** Supabase (PostgreSQL with `pgvector` extension).
*   **Authentication:** Supabase Auth.
*   **File Staging:** Server Filesystem (managed by `multer`).
*   **Email Service:** AWS SES, SendGrid, Postmark (or similar).
*   **Deployment:** Docker.
*   **NLP/AI:** External LLM provider (e.g., Google Gemini API).

## 3. Detailed Component Design

### 3.1 Frontend Application (React SPA)

*   **Responsibilities:**
    *   User interface rendering and user interaction.
    *   Client-side routing (`react-router-dom`).
    *   State management (local, Zustand for global, TanStack Query for server state).
    *   Form handling (including wizards for tenant/project/version creation) and client-side validation.
    *   Integration with Supabase Auth (login, signup, password reset, logout).
    *   API communication with the backend Express.js API.
    *   Data visualization using ECharts.
    *   Displaying role-specific dashboards and SR/DCR lists (defaulting to open items).
    *   Presenting DCR correction history and option to view original vs. corrected data.
    *   UI for managing email notification preferences in user profiles.
*   **Key Modules/Features:**
    *   **Auth Module:** Login, Signup, Password Reset components. `AuthContextProvider` for session management.
    *   **Dashboard Module:** Dynamically renders role-specific dashboards with widgets (project lists, SR/DCR summaries, admin metrics, quick start links).
    *   **Admin Portal:**
        *   Tenant Management (with real-time schema name validation, initial user creation in wizard).
        *   User Management.
        *   Integrated Project/Version Creation Wizard.
        *   `VersionManagementPage`: Central hub for a selected version, with tabs for:
            *   Overview (Version details, status, edit form).
            *   Datasets (Dataset listing, `DatasetUploader` component, actions per dataset, configuration access).
            *   Common Index Config (`CommonIndexEditor` component).
            *   File Specific Config (`FileSpecificConfigEditor` component per dataset).
        *   SR/DCR Management Views.
    *   **User Portal (Data Exploration):**
        *   `ProjectVersionSelector`: Allows users to select a project and version.
        *   `DataExplorePage`: Main layout containing:
            *   `FilterPane`: Dynamically renders filters.
            *   `DataDisplayArea`: Renders `DataTable` and ECharts visualizations (using tabs for dataset selection if multiple exist in a version).
            *   `ConversationalQueryInput` (with query templates).
    *   **Notification System:** In-app display for SR/DCR updates.
*   **API Client:** A dedicated service layer (e.g., using Axios or Fetch wrapper) to interact with backend APIs, handling request/response formatting and error handling.

### 3.2 Backend Application (Node.js/Express.js API)

*   **Responsibilities:**
    *   Exposing RESTful APIs for the frontend.
    *   Request validation (Zod middleware).
    *   Authentication/Authorization (Supabase JWT validation, RBAC).
    *   Tenant Context Management (explicit schema qualification for all DB queries).
    *   Business Logic (services for tenants, users, projects, versions, datasets, SR/DCR, exploration, indexing).
    *   Database Interaction (Supabase client).
    *   **File Upload Processing:** Parsing, dynamic table creation in tenant schema, data insertion, temp file deletion.
    *   **DCR Processing:** Validating DCRs, updating `public.data_correction_requests`, and **updating the corresponding data row in the tenant's specific dataset table** to reflect the correction.
    *   **Email Notification Management:** Asynchronously queuing and sending emails via an external service for SR/DCR events. Managing user notification preferences.
    *   Integration with NLP/AI service.
    *   Error handling and structured logging.
*   **Key Modules/Structure:** Routes, Controllers, Services, Middleware, DB access layer, Utils, Validations (as outlined in Dev Playbook v4.3).
    *   `EmailService`: Module for interacting with the chosen email provider, including template rendering.
    *   `QueueService` (if using BullMQ/Redis for emails): For managing background email jobs.

### 3.3 Data Tier (Supabase & Temporary Storage)

*   **3.3.1 Supabase PostgreSQL Database:**
    *   **Shared `public` Schema:** `tenants`, `user_profiles` (with email notification preferences), `service_requests`, `sr_comments`, `data_correction_requests` (explicitly storing original and corrected values, timestamps), `schema_embeddings`, `audit_logs`.
    *   **Tenant-Specific Schemas:** Dynamically created. Contain `projects`, `versions`, `version_datasets_metadata`, `common_index_configs`, `file_specific_configs`, and dynamically created dataset tables (`ds_...`). **These `ds_...` tables store the current, potentially DCR-corrected, data.**
    *   **Indexing:** Proper indexing is crucial for performance, including on DCR context fields if queries need to find original values. `pgvector` extension enabled for `schema_embeddings`.
    *   **Migrations:** A robust strategy for applying schema changes to the `public` schema and, critically, to **all tenant schemas** is paramount.
*   **3.3.2 Supabase Auth:** Handles user lifecycle (signup, login, password reset, email confirmation), JWT issuance. Auth Hooks (DB Triggers on `auth.users` table) are used to create corresponding entries in `public.user_profiles`. Custom JWT claims may be used to embed `tenant_id` and `role`.
*   **3.3.3 Temporary File Staging (Server FS):** `multer` manages temporary files on the backend server's filesystem during uploads. Original files are deleted after successful processing.

### 3.4 External Services

*   **NLP/AI Service (e.g., Google Gemini API):**
    *   Used for the conversational query feature. The Express.js backend manages context, prompt engineering (including schema of current version's datasets), calling the LLM, and **critically validating/sanitizing any SQL output from the LLM** before execution against tenant data.
*   **Email Service (e.g., AWS SES, SendGrid):**
    *   Used for transactional email notifications (SR/DCR updates, etc.). The Express.js backend interacts with this service via SDK/API.

## 4. Data Flow Examples

This section illustrates the sequence of interactions for key operations within the platform.

### 4.1 User Login
1.  User enters credentials in React `LoginForm`.
2.  React app calls `supabase.auth.signInWithPassword()`.
3.  Supabase Auth validates credentials, issues JWT.
4.  Supabase client in React stores JWT.
5.  `AuthContextProvider` detects session change, fetches user profile from backend (`GET /api/users/me`, sending JWT).
6.  Backend `authMiddleware` validates JWT, `userController` fetches profile from `public.user_profiles`.
7.  React app receives profile, updates context, navigates to dashboard.

### 4.2 Admin Creates a New Tenant
1.  Admin fills "Create Tenant" form in React frontend (tenant name, owner email).
2.  React app sends `POST /api/admin/tenants` to Express.js backend.
3.  Backend `authMiddleware` & `adminRoleMiddleware` validate admin.
4.  `adminController` calls `tenantService.provisionTenant()`.
5.  `tenantService` (using Supabase Admin client):
    *   Verifies owner email exists in `auth.users`.
    *   Inserts new row into `public.tenants`.
    *   Executes `CREATE SCHEMA "t_new_tenant_schema";`.
    *   Executes DDL to create standard tables (`projects`, `versions`, etc.) within `"t_new_tenant_schema"`.
    *   Updates `public.user_profiles` for the owner, setting `tenant_id` and tenant-specific role.
6.  Backend responds. React frontend updates UI.

### 4.3 Admin Updates Tenant Details
1.  Admin navigates to Tenant listing/details page in React Admin Portal, selects a tenant, clicks "Edit."
2.  Admin modifies tenant information (e.g., name, status).
3.  React app sends `PUT /api/admin/tenants/:tenantId` with updated data.
4.  Backend `authMiddleware` & `adminRoleMiddleware`.
5.  `adminController` calls `tenantService.updateTenant(tenantId, updateData)`.
6.  `tenantService` updates the specified tenant's record in `public.tenants`.
7.  Backend responds. React UI reflects changes.

### 4.4 Admin Creates a User (within a Tenant Context)
1.  Admin is viewing a specific Tenant's details or user list in the React Admin Portal and clicks "Add User."
2.  "Create User" form appears. **The Tenant field is pre-filled or implicitly set to the current Tenant context.** Admin enters email, password, role.
3.  React app sends `POST /api/admin/users` with user data, including the `tenantId`.
4.  Backend `authMiddleware` & `adminRoleMiddleware`.
5.  `adminController` calls `adminUserService.createUser(userData)`.
6.  `adminUserService` (using Supabase Admin client):
    *   Calls `supabaseAdmin.auth.admin.createUser()` (email, password, user_metadata for initial role).
    *   Auth Hook `handle_new_user` creates basic `public.user_profiles` entry.
    *   `adminUserService` explicitly updates this new `public.user_profiles` record with the provided `tenant_id` and specific `role`.
7.  Backend responds. React UI updates user list for the tenant. (New user receives confirmation/welcome email from Supabase Auth).

### 4.5 Admin Updates User Details
1.  Admin navigates to User listing, selects a user, clicks "Edit."
2.  Admin modifies user information (e.g., role, status, assigned tenant - if re-assigning).
3.  React app sends `PUT /api/admin/users/:userId` with updated data.
4.  Backend `authMiddleware` & `adminRoleMiddleware`.
5.  `adminController` calls `adminUserService.updateUser(userId, updateData)`.
6.  `adminUserService`:
    *   Updates `public.user_profiles` (role, status, tenant_id).
    *   If necessary, calls `supabaseAdmin.auth.admin.updateUserById()` for changes to auth-level attributes (e.g., email, ban status).
7.  Backend responds. React UI reflects changes.

### 4.6 Admin Creates a Project within a Tenant
1.  Admin navigates to tenant's project management area in React. Fills "Create Project" form (name, description) as part of the Project/Version creation wizard.
2.  React app sends `POST /api/projects`.
3.  Backend `authMiddleware` validates JWT. `tenantContextMiddleware` identifies `req.tenantSchema` based on Admin's `tenant_id`.
4.  `projectController` calls `projectService.createProject(data, req.tenantSchema, req.authUser.id)`.
5.  `projectService` inserts a new row into `"${req.tenantSchema}".projects`.
6.  Backend responds. React frontend updates project list or proceeds to version creation step in wizard.

### 4.7 Admin Updates Project Details
1.  Admin selects a project, navigates to its edit view/form. Modifies name, description, status.
2.  React app sends `PUT /api/projects/:projectId` with updated data.
3.  Backend `authMiddleware` & `tenantContextMiddleware`.
4.  `projectController` calls `projectService.updateProject(projectId, updateData, req.tenantSchema)`.
5.  `projectService` updates the record in `"${req.tenantSchema}".projects`.
6.  Backend responds. React UI reflects changes.

### 4.8 Admin Creates a Version for a Project
1.  Admin, within a project's context (possibly as part of the Project/Version creation wizard), fills "Create Version" form (name, description).
2.  React app sends `POST /api/projects/:projectId/versions`.
3.  Backend `authMiddleware` & `tenantContextMiddleware` (deriving `req.tenantSchema`).
4.  `versionController` calls `versionService.createVersion(projectId, versionData, req.tenantSchema, req.authUser.id)`.
5.  `versionService` inserts a new row into `"${req.tenantSchema}".versions`.
6.  Backend responds. React frontend updates version list or navigates to Version Management screen.

### 4.9 Admin Updates Version Details (Overview)
1.  Admin on `VersionManagementPage` ('Overview' tab) edits version name, description, or status.
2.  React app sends `PUT /api/versions/:versionId` with updated data.
3.  Backend `authMiddleware` & `tenantContextMiddleware`.
4.  `versionController` calls `versionService.updateVersion(versionId, updateData, req.tenantSchema)`.
5.  `versionService` updates the record in `"${req.tenantSchema}".versions`.
6.  Backend responds. React UI reflects changes.

### 4.10 Admin Deletes a Project Version
1.  Admin on `VersionsAdminPage` or `VersionManagementPage` clicks "Delete Version" for a specific version. Confirmation dialog.
2.  React app sends `DELETE /api/versions/:versionId`.
3.  Backend `authMiddleware` & `tenantContextMiddleware`.
4.  `versionController` calls `versionService.deleteVersion(versionId, req.tenantSchema)`.
5.  `versionService`:
    *   Deletes related configurations (common index, file specific configs) from `"${req.tenantSchema}".common_index_configs` and `"${req.tenantSchema}".file_specific_configs` associated with the version.
    *   For each entry in `"${req.tenantSchema}".version_datasets_metadata` linked to the version, it **drops the dynamically created data table** (e.g., `DROP TABLE "${req.tenantSchema}"."${datasetMeta.processed_table_name}";`).
    *   Deletes entries from `"${req.tenantSchema}".version_datasets_metadata`.
    *   Finally, deletes the record from `"${req.tenantSchema}".versions`.
6.  Backend responds with success. React frontend updates UI.

### 4.11 Admin Uploads Dataset to a Version
1.  Admin on `VersionManagementPage` ('Datasets' tab), uses `DatasetUploader`. Project and Version context is implicit.
2.  File selected, `isPrimary` flag set. Form submitted to `POST /api/versions/:versionId/datasets`.
3.  Express.js backend (`versionController` via `multer`):
    *   `authMiddleware` & `tenantContextMiddleware` set context.
    *   File saved temporarily by `multer` to server filesystem.
    *   `versionService.uploadAndProcessDataset(versionId, req.tenantSchema, file, isPrimary)` called.
4.  `versionService`:
    *   Creates metadata in `"${req.tenantSchema}".version_datasets_metadata`.
    *   Parses file. Dynamically creates table `"${req.tenantSchema}".ds_...`. Inserts data.
    *   Updates metadata status. Deletes temporary file from server.
5.  Backend responds. React frontend updates `DatasetList`.

### 4.12 Admin Updates Common Index Configuration (Batch Update for a Version)
1.  Admin on `VersionManagementPage` ('Common Index' tab) modifies the list of common index fields (field name, is_filterable) for the current version.
2.  React app sends `POST /api/versions/:versionId/common-index-configs` (with an array of all current config objects for that version).
3.  Backend `authMiddleware` & `tenantContextMiddleware`.
4.  `versionController` calls `versionService.saveCommonIndexConfigs(versionId, req.tenantSchema, configs)`.
5.  `versionService` performs a "delete all existing for this version and insert new" or a more granular upsert/delete logic on `"${req.tenantSchema}".common_index_configs`.
6.  Backend responds. React UI reflects changes.

### 4.13 Admin Updates File Specific Configuration for a Dataset
1.  Admin on `VersionManagementPage` ('Datasets' tab), selects a specific dataset, and chooses to "Configure Fields."
2.  React `FileSpecificConfigEditor` shows current field configurations (listing field name, allowing edits to display name, data type, and flags: is_filterable, is_sortable, is_chartable, is_listable). Admin makes changes.
3.  React app sends `POST /api/datasets/:datasetMetaId/file-specific-configs` (with an array of all field config objects for that dataset). `datasetMetaId` is the ID from `version_datasets_metadata`.
4.  Backend `authMiddleware` & `tenantContextMiddleware`.
5.  `versionController` (or a new `datasetController`) calls `versionService.saveFileSpecificConfigs(datasetMetaId, req.tenantSchema, fieldConfigs)`.
6.  `versionService` performs upsert/delete logic on `"${req.tenantSchema}".file_specific_configs` for the given `datasetMetaId`.
7.  Backend responds. React UI reflects changes.

### 4.14 User Submits a Service Request (SR)
1.  User fills SR form in React frontend (Title, Description, etc.).
2.  React app sends `POST /api/service-requests` with SR details.
3.  Backend `authMiddleware` & `tenantContextMiddleware`.
4.  `srController` calls `srService.createSR(data, req.authUser.id, req.authUser.tenant_id)`.
5.  `srService` inserts into `public.service_requests`, linking `created_by_user_id` and `tenant_id`.
6.  Backend responds. React UI shows confirmation. Email notification sent to Admins.

### 4.15 Admin Updates a Service Request (SR)
1.  Admin views an SR in their dashboard, adds a comment, and changes status (e.g., to "In Progress" or "Resolved").
2.  React app sends `PUT /api/admin/service-requests/:srId/status` (with new status) and/or `POST /api/admin/service-requests/:srId/comments` (with comment text).
3.  Backend `authMiddleware` & `adminRoleMiddleware`.
4.  `srController` calls appropriate `srService` functions (e.g., `updateSRStatus`, `addSRComment`).
5.  `srService` updates `public.service_requests` or inserts into `public.sr_comments`.
6.  Backend responds. React UI (for both Admin and the original Requester) reflects changes. Email notifications may be triggered for status changes/new comments.

### 4.16 Advanced User Requests a Data Correction Request (DCR)
1.  Advanced User exploring data in React frontend identifies an error in a table/chart.
2.  User right-clicks/uses action menu on the data point, selects "Request Data Correction."
3.  React `DCRForm` (pre-filled with context: version, dataset, row identifier, field name, original value) opens. User enters proposed value and justification.
4.  React app sends `POST /api/data-correction-requests` with DCR details.
5.  Backend `authMiddleware` & `tenantContextMiddleware`. User's role (Advanced User) is also checked by the service.
6.  `dcrController` calls `dcrService.initiateDCR(dcrData, req.authUser.id, req.authUser.tenant_id)`.
7.  `dcrService` inserts a new record into `public.data_correction_requests` with status 'pending'.
8.  Backend responds. React UI shows confirmation. Email notification sent to Admins.

### 4.17 Admin Initiates a Data Correction Request (DCR)
1.  Admin, while exploring data or via a dedicated DCR management interface, initiates a DCR.
2.  Flow similar to 4.16, but the backend DCR creation endpoint might handle Admin-initiated DCRs differently (e.g., by allowing direct approval or setting a different initial status).

### 4.18 Admin Approves a Data Correction Request (DCR)
1.  Admin views pending DCRs in React Admin Portal, selects one, reviews details, clicks "Approve."
2.  React app sends `PUT /api/admin/data-correction-requests/:dcrId/approve`.
3.  Backend `authMiddleware` & `adminRoleMiddleware`.
4.  `dcrController` calls `dcrService.approveDCR(dcrId, adminUserId, adminComments)`.
5.  `dcrService`:
    *   Updates status in `public.data_correction_requests` to 'approved', stores admin comments, `approved_by_admin_id`, and `change_timestamp`. Explicitly stores `original_value` and `corrected_value`.
    *   **Updates the actual data row in the tenant's dataset table** (`"${req.tenantSchema}".ds_...`) with the `corrected_value`.
6.  Backend responds. React UI updates DCR status. Email notification sent to DCR initiator.

### 4.19 Admin Declines a Data Correction Request (DCR)
1.  Admin views pending DCRs, selects one, reviews details, clicks "Decline." Enters mandatory rejection reason.
2.  React app sends `PUT /api/admin/data-correction-requests/:dcrId/decline`.
3.  Backend `authMiddleware` & `adminRoleMiddleware`.
4.  `dcrController` calls `dcrService.declineDCR(dcrId, adminUserId, rejectionReason)`.
5.  `dcrService` updates status in `public.data_correction_requests` to 'declined', stores `rejectionReason`, and `admin_id`.
6.  Backend responds. React UI updates DCR status. Email notification sent to DCR initiator.

### 4.20 User Applies a Filter in Data Exploration
1.  User interacts with `FilterPane` in React. Filter state (Zustand store) updates.
2.  `DataExplorePage` (subscribed to filter state) re-fetches data: `GET /api/explore/versions/:versionId/view` with filter query params.
3.  Backend `exploreService` uses filter params to build dynamic `WHERE` clause for query against the dataset table `"${req.tenantSchema}".ds_...`.
4.  Backend responds with filtered data. React UI (`DataTable`, ECharts) updates.

### 4.21 User Initiates Conversational Query
1.  User types question in `ConversationalQueryInput` (React). UI may offer query templates.
2.  React app sends `POST /api/explore/versions/:versionId/query` with the question.
3.  Backend `authMiddleware` & `tenantContextMiddleware`.
4.  `exploreController` calls `exploreService.processConversationalQuery(versionId, req.tenantSchema, questionText)`.
5.  `exploreService` orchestrates:
    *   Embeds question.
    *   Finds relevant schema context from `public.schema_embeddings` (for the current version).
    *   Prompts LLM (with question, schema context, instructions for specific query types like "why is..." or "what is title...").
    *   Receives SQL from LLM.
    *   **CRITICAL: Validates and Sanitizes LLM-generated SQL.**
    *   Executes validated SQL against `"${req.tenantSchema}".ds_...`.
    *   Formats results (data or natural language summary via LLM if needed). Caches results.
6.  Backend responds. React frontend displays results.

### 4.22 Admin Deletes a Project
1.  Admin clicks "Delete Project" in React UI. Confirmation dialog.
2.  React app sends `DELETE /api/projects/:projectId`.
3.  Backend `authMiddleware` & `tenantContextMiddleware` (and possibly admin role check).
4.  `projectController` calls `projectService.deleteProject(projectId, req.tenantSchema)`.
5.  `projectService`:
    *   Iterates through all versions associated with the project in `"${req.tenantSchema}".versions`. For each version, invokes logic equivalent to "Admin Deletes a Project Version" (flow 4.10) to ensure all datasets, dynamic tables, and configurations are cleaned up.
    *   After all associated versions and their data are deleted, deletes the record from `"${req.tenantSchema}".projects`.
6.  Backend responds with success. React frontend updates UI.

## 5. Security Considerations

*   **Authentication:** Handled by Supabase Auth. JWTs for API authentication.
*   **Authorization:** Implemented in Express.js backend (middleware, service-layer logic) based on user roles and tenant association.
*   **Tenant Data Isolation:**
    *   **Primary Mechanism:** Schema-per-tenant in PostgreSQL.
    *   **Enforcement Point:** Express.js backend **must** ensure all database queries explicitly qualify table names with the authenticated user's tenant schema. This is a critical security boundary, especially for operations like DCR updates that modify tenant data directly.
    *   Input validation and parameterized queries prevent SQL injection.
*   **Input Validation:** Zod schemas on frontend (UX) and backend (security) for all external inputs, including real-time validation for unique schema names.
*   **API Security:** `helmet` for security headers, rate limiting, HTTPS enforcement.
*   **Secrets Management:** Environment variables, securely managed in deployment.
*   **File Uploads:** Validate file types, content, and sizes. Delete temporary files promptly.
*   **Dependencies:** Regular auditing (`npm audit`) and updates (Dependabot/RenovateBot).
*   **Conversational Query SQL Validation:** **CRITICAL.** Rigorous parsing, allow-listing (SELECT only, specific table/column names derived from current version's context), and sanitization of any SQL generated by the LLM.
*   **Email Security:** Proper domain authentication (SPF, DKIM, DMARC). Sanitize user input in email templates. User opt-out for non-critical emails.
*   **Audit Trails:** Comprehensive logging of sensitive operations, DCR changes, email sending attempts/failures.

## 6. Scalability and Performance

*   **Backend (Node.js/Express.js):** Stateless, allowing horizontal scaling. Asynchronous I/O. PM2/clustering.
*   **Frontend (React):** Static assets, CDN delivery. Code splitting, memoization. Dashboard loading NFR (<4s) with progressive loading.
*   **Database (Supabase PostgreSQL):** Supabase managed scaling. Proper indexing within all schemas. Monitor performance of schema-per-tenant model, DCR updates, and schema migrations at scale.
*   **Email Notifications:** Asynchronous queuing via background jobs to prevent blocking API responses.
*   **File Processing:** For very large files or computationally intensive transformations post-upload, consider offloading to dedicated background workers/queues.

## 7. Deployment Strategy

*   **Containerization:** Docker for Express.js backend and React frontend (static build served by Nginx).
*   **Orchestration (Optional for larger scale):** Kubernetes.
*   **Hosting:** Cloud platforms (AWS, Google Cloud, Azure) or PaaS (Heroku, Render). Supabase is cloud-hosted.
*   **CI/CD:** GitHub Actions (or similar) for automated linting, testing (unit, integration, tenant isolation, performance), building Docker images, and deploying to staging/production.
*   **Environment Configuration:** Securely managed environment variables per environment.
*   **Tenant Schema Migration Deployment:** A critical part of the deployment process must include a reliable, tested mechanism for running migration scripts against all existing tenant schemas.

## 8. Monitoring and Logging

*   **Backend:** Structured logging (Winston/Pino) for requests, errors, DCR data updates, email status. Log aggregation service (ELK, Datadog, Logtail).
*   **Frontend:** Client-side error tracking (Sentry).
*   **Application Performance Monitoring (APM):** Tools like Sentry, New Relic for monitoring API performance, database query times, identifying bottlenecks.
*   **Supabase Monitoring:** Utilize Supabase's built-in dashboard for database performance, query analysis, and usage metrics.
*   **Platform Analytics:** Admin dashboards for monitoring tenant activity, resource usage, etc., with data collected by the backend.

## 9. Risks and Mitigation

| Risk                                         | Mitigation                                                                                                                                                                                          |
| :------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Security: Tenant Data Leakage**            | Rigorous backend schema qualification logic. Extensive testing (including specific tenant isolation tests). Code reviews. Security audits.                                                            |
| **Security: LLM SQL Injection/Abuse**        | Strict validation/sanitization/allow-listing of LLM-generated SQL. Parse and reconstruct SQL if possible, or use highly constrained generation. Rate limit conversational queries. Monitor usage.    |
| **Scalability: Tenant Schema Migrations**    | Develop and thoroughly test a robust script/tool to apply DDL changes across all tenant schemas reliably and efficiently. Perform migrations during low-traffic periods. Backup before migration.       |
| **Data Integrity: DCR Updates**              | Use database transactions if possible for updating `CorrectionRecord` and dataset table (or implement compensating transactions). Strong auditing. Test DCR logic for edge cases and concurrency.       |
| **Performance: DCR Updates on Large Tables** | Optimize update queries. Index relevant columns for identifying rows. Evaluate impact during performance testing.                                                                                         |
| **Complexity: Dynamic Table & Schema Mgmt.** | Standardized processes for creation, querying, migration, and deletion of tenant schemas and their dynamic `ds_...` tables. Automation is key.                                                         |
| **Email Deliverability & SPAM**              | Use reputable email service. Proper domain authentication. Monitor bounce/complaint rates. Provide clear opt-out mechanisms.                                                                        |
| **Wizard UI Complexity & State Mgmt.**       | Break down wizards into logical, manageable steps. Robust client-side state management. Thorough UX testing.                                                                                          |
| **Operational Overhead: Tenant Migrations**  | Automate migration process as much as possible. Version control for migration scripts. Logging and monitoring of migration runs.                                                                         |

## 10. Future Considerations / Evolution
*   Advanced Chart Types & Customization.
*   True Offline Capabilities (PWA).
*   Real-time Collaboration features.
*   Enhanced AI/ML Insights (anomaly detection, trends).
*   More sophisticated Data Export/Import options.
*   Webhook Integrations for tenants.
*   More Granular Notification Preferences and channels.
*   Self-service tenant schema backup/restore options (advanced).

This Solution Architecture Document provides a blueprint for developing the SaaS Data Visualization Platform, reflecting the detailed requirements from PRD v1.5 and development practices from Dev Playbook v4.3. It will be a living document, subject to revisions as the project evolves and new insights are gained.
```

---

This should now be the complete, standalone **Solution Architecture Document (Version 1.2, Final Cut)**.

