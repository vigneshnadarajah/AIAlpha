
**Product Requirements Document (PRD)**

**Version:** 1.5 (Standalone Final Cut)
**Date:** 2023-11-18 (Assumed date)
**Status:** Final Draft

**Document Purpose:** This document outlines the requirements for a SaaS-based data visualization and exploration platform designed for Market Research firms and their clients.

## 1. Introduction & Goals

### 1.1 Elevator Pitch
This product is a multi-tenant SaaS data visualization platform empowering market research firms to deliver interactive data exploration experiences to their clients. It transforms complex datasets on competitors, products, features, news, and investments into dynamic dashboards, charts, and conversational insights. By integrating this tool, market research firms provide significant added value, enabling their clients (and their own analysts) to rapidly uncover competitive insights, identify market opportunities, and make data-driven strategic decisions faster.

### 1.2 Business Goals
*   Provide a competitive differentiator for market research firms.
*   Enable end-clients to self-serve insights from curated datasets.
*   Reduce the time required for analysts to generate reports and answer ad-hoc queries.
*   Establish a scalable platform for managing diverse client data projects.
*   Ensure data security and proper access control within a multi-tenant architecture.

### 1.3 Target Audience & Roles
*   **SaaS Administrator (Admin):** Manages the overall platform, tenants, top-level configurations, and user access. They interact with Projects and Versions to upload, prepare, and configure data for clients, perform in-depth analysis, create curated dashboards/views, and handle data correction requests. Has full system oversight.
*   **End Client User (Advanced User):** Analysts or managers within the client of the market research firm. They primarily consume the data through pre-configured dashboards or guided exploration within the scope defined for them. They raise change requests. They can't manipulate data or configuration changes.
*   **End Client User (Standard User):** The client of the market research firm. They primarily consume the data through pre-configured dashboards or guided exploration within the scope defined for them. They can't manipulate data or configuration changes.
*   **System (Implicit):** Represents automated processes, notifications, etc.

## 2. Glossary

*   **Tenant:** Represents a single market research firm customer organization within the SaaS platform. Each tenant has isolated data (managed via dedicated database schemas), users, and configurations.
*   **Project:** A logical grouping of related research data within a Tenant (e.g., "Q3 Competitor Analysis - Automotive Sector"). Stored within the tenant's schema.
*   **Version:** A specific instance or snapshot of data within a Project, often time-based or representing a specific deliverable (e.g., "October 2023 Data Refresh", "v1.0 Client Report"). It serves as the primary container for managing associated datasets and their configurations. Stored within the tenant's schema.
*   **Dataset:** A collection of structured data, typically uploaded as one or more files (CSV, JSON) associated with a specific Project Version. Data from these files is processed and stored in tables within the tenant's schema, linked to the Version.
*   **Common Index Configuration:** A per-version UI-driven configuration defining primary **Filterable** fields intended to apply consistently across multiple datasets *within that version*. (Metadata likely stored in a shared/public schema, linked to tenant and version).
*   **File Specific Configuration:** A per-dataset, per-version UI-driven configuration defining display names, data types, and UI behaviours (Sortable, **Filterable**, Chartable, Listable) for fields *within that specific* dataset. (Metadata likely stored in a shared/public schema, linked to tenant, version, and dataset).
*   **Data Exploration:** The core user interface/feature set for interacting with data via charts, tables, filters, and conversational queries.
*   **Conversational Query:** A feature allowing users to ask natural language questions about the data, which the system attempts to answer using integrated NLP/AI capabilities (processed by the Node.js backend).
*   **Service Request (SR):** A user-submitted request for administrative support, issue resolution, or general help related to platform usage (e.g., reporting a bug, asking for help). Managed via a defined workflow.
*   **Data Correction Request (DCR):** A user-submitted request to correct perceived factual errors or misclassifications within the *data stored in the database* itself (originating from uploaded files). Managed via a defined workflow distinct from SRs, focusing on data integrity. Approved DCRs result in auditable corrections where the corrected value becomes the default for future queries for that data version.
*   **Correction Record:** An auditable record detailing a DCR, including original value, corrected value, justification, approver, and timestamps, stored to track changes to data.
*   **Standard User:** Typically an End Client User with view/explore permissions within their assigned projects/versions. They can raise a Service Request.
*   **Advanced User:** Similar to Standard User with additional privilege to raise Data Correction Requests (DCR).

## 3. Functional Requirements

### 3.1 Admin Portal (SaaS Administrator Role)

*   **Tenant Management:**
    *   List all Tenants (with search/filter by name, status).
    *   Create Tenant:
        *   Input: Tenant Name, initial Owner User(s) details (Email, Name, Role - limit to a small number, e.g., 1-5, with an option to "Add More Later").
        *   System generates a unique Schema Name. **UI must provide real-time validation to ensure SchemaName (or a user-editable version of it) is unique before submission, alerting immediately if a duplicate is detected.**
        *   Backend (Node.js) provisions a new PostgreSQL schema in Supabase for this tenant, creates the tenant record, creates initial owner user(s) in Supabase Auth and `user_profiles` (assigning them to this new tenant and sending activation emails).
        *   Log tenant and initial user creation as a single audit event.
    *   Update Tenant Status (Active/Inactive). Deactivation prevents logins for tenant users and hides tenant data.
    *   Delete Tenant (Logical delete initially. Physical data purging involves dropping the tenant's schema and deleting associated metadata).
*   **User Management (All Tenants):** (Users managed by Supabase Auth, profiles in shared schema linked to Supabase Auth UID and tenant).
    *   List users across all tenants (with filtering/search by email, tenant, status, role).
    *   Add individual user: When adding a user from a general user management screen, Admin selects Tenant. If adding from within a specific Tenant's context/dashboard, that Tenant should be pre-selected. Assign Email, Status, Role.
    *   Trigger account activation email for new users (via Supabase Auth).
    *   Bulk Upload Users via CSV (Define required columns: Email, Tenant Name/ID, Role, Status). Provide template and validation feedback.
    *   Update User details (Role, Status). Tenant assignment change requires careful consideration/process.
    *   Trigger user password reset email (via Supabase Auth).
    *   Deactivate/Activate User.
    *   Delete User (Logical delete).
*   **Project & Version Creation Workflow (Wizard):**
    *   **Step 1: Create/Select Project:**
        *   Option to select an existing Project for the current Tenant or create a new Project (Name, Description). Validate unique project names within the tenant.
    *   **Step 2: Create Version:**
        *   Input Version Name/Identifier for the selected/newly created Project.
        *   Option to immediately proceed to upload datasets (see Version Management Screen) or "Save and Add Data Later."
        *   If no version name is specified, a default (e.g., "v1.0") can be auto-created.
*   **Version Management Screen (Per Version):**
    *   Upon selecting or creating a Version, the Admin is taken to a dedicated "Version Management" screen. This screen serves as the central hub for all activities related to this specific version.
    *   **Overview Tab/Section:**
        *   Display/Edit Version Name/Identifier, Description, Status (Active/Inactive).
        *   View key dates (Created, Last Updated).
        *   Activate/Deactivate this Version (Hides/shows it in selection lists for end-users).
        *   Delete this Version (Logical delete, potentially requires confirmation. Deletes associated datasets and configurations).
    *   **Datasets Tab/Section (within Version Management screen):**
        *   List datasets processed and associated with *this* Version (e.g., File Name, Upload Date, Is Primary, Status, row count).
        *   **Upload New Dataset(s):**
            *   **Project/Version selection is implicitly this current version.**
            *   UI to select and upload one or more data files (CSV, JSON) specifically for *this* Version.
            *   Provide upload progress indicators.
            *   Specify if an uploaded file should be marked as the "primary" dataset for this version (can be changed later).
            *   **Processing:** Files are temporarily stored (e.g., Supabase Storage or server filesystem), then processed by the Node.js backend. This includes:
                *   Parsing data (e.g., using `papaparse` for CSVs).
                *   Basic validation of file structure.
                *   Insertion of data into relevant, dynamically created or pre-defined tables within the tenant's schema, linked to *this* Project and Version.
                *   Original uploaded files are deleted from temporary storage after successful processing.
            *   System provides feedback on processing success or errors.
        *   **Actions per Dataset:**
            *   Set/Unset as "Primary Dataset" for this version.
            *   View basic metadata or a preview of the dataset.
            *   Access/Edit **File Specific Configuration** for this dataset (see below).
            *   Re-process dataset (if applicable, e.g., after a schema change or fixing an upload issue).
            *   Delete processed dataset (removes its data from the database and its association with this version).
    *   **Configuration Tab/Section (within Version Management screen):**
        *   **Common Index Configuration (for *this* Version):**
            *   UI to define and manage `Filterable` flags for fields expected to be common across multiple datasets *within this specific Version*.
            *   System should assist by suggesting common field names from all datasets currently associated with *this Version*.
        *   **File Specific Configuration (accessed per dataset, or as a list for *this* Version):**
            *   For each dataset associated with *this Version*, UI to:
                *   Define user-friendly Display Names for fields.
                *   Specify/confirm Data Types for fields (e.g., Text, Number, Date, Boolean).
                *   Set UI behavior flags: Sortable, **Filterable** (in addition to common index filters), Chartable, Listable.
            *   System assists by suggesting fields from the actual dataset.
        *   **Validation (for *this* Version):**
            *   System validates data (within tables for this version) against the defined Common Index and File Specific Configurations (e.g., data types). Report errors or inconsistencies clearly.
*   **Service Request Management:**
    *   View all SRs across tenants (Filter by Tenant, Project, Status).
    *   Assign SRs to self or other Admins (if applicable).
    *   Update SR status and add comments (as the designated 'Approver'/Resolver).
*   **Data Correction Request (DCR) Management:**
    *   View all DCRs across tenants (Filter by Tenant, Project, Status). Admins can also initiate DCRs.
    *   Act as the final Approver/Rejector for DCRs.
*   **Platform Configuration (Examples - may expand):**
    *   Manage notification templates.
    *   Configure system-wide settings (if any). Define Tenant contact email for admin notifications.
*   **System Monitoring & Analytics:**
    *   Access dashboards for platform health, tenant usage, storage, API consumption.

### 3.2 User Portal (Standard & Advanced Users)

*   **Authentication:**
    *   Login Page with inputs for email/password and a clearly visible **"Reset Password" option/link**.
    *   Password Reset Request mechanism (via Supabase Auth).
    *   Clear **"Logout" option** accessible from main navigation/user menu.
*   **Dashboard / Landing Page (Post-Login):**
    *   A dedicated dashboard as the primary landing page after successful login.
    *   **Content Ideas (Modular Layout, e.g., cards, tables):**
        *   **All Users:** Welcome message, list of accessible (active) projects/versions (clickable for navigation to Data Exploration), summary of recent activity relevant to the user (e.g., last viewed dataset/version, count of new SRs/DCRs related to their accessible data).
        *   **SaaS Admins/Tenant Admins:** Key platform/tenant health metrics (e.g., storage usage if tracked, number of active tenants/users), list of pending SRs/DCRs requiring attention, quick links to tenant/user management.
        *   **Advanced/Standard Users:** Shortcuts to recently accessed/favorite projects/versions, list of their **open SRs and DCRs**.
    *   **"Quick Start" Section:** Links to common actions based on role (e.g., "Explore Data," "View My Projects," "Submit Service Request," "Manage Tenants" for Admins).
    *   **Performance:** Optimized for fast load time (<4 seconds), potentially with progressive loading for non-critical widgets.
*   **Data Exploration (Standard & Advanced Users):**
    *   *Access controlled by assigned projects/versions.*
    *   Details expanded in Section 3.5.
*   **Service Request (SR) Management (Standard & Advanced Users):**
    *   Create SR (Title, Description, associated Project/Version if applicable).
    *   View SRs *they created*. **By default, show only "Open" SRs**, with options to filter by other statuses (e.g., "Closed," "All").
    *   View updates/comments from Admin on their SRs.
    *   Update/Add comments to their *own* open SRs.
*   **Data Correction Request (DCR) Management (Advanced Users initiate, Both view):**
    *   **Initiate DCR (Advanced User):** Select data point(s) in exploration view -> Initiate DCR -> Propose correction/reclassification -> Add justification -> Submit.
    *   View DCRs related to data they can access, including status (Pending, Approved, Rejected) and justification/comments. **By default, show only "Open" (Pending) DCRs**, with options to filter by other statuses (e.g., "Approved," "Rejected," "All").

### 3.3 Service Request (SR) Workflow & Management

*   **Roles:**
    *   **Requester:** Standard User, Advanced User, Admin.
    *   **Resolver/Approver:** Admin (or designated support role).
*   **Workflow:**
    1.  **Submission:** Requester initiates SR via form (Title, Description, Priority (Optional), Associated Project/Version (Optional)). System validates required fields, assigns unique ID, sets status to "Submitted", assigns to default Admin/Support Queue for the Tenant.
    2.  **Assignment (Admin):** Admin views unassigned SRs, assigns to self or relevant resolver. Status changes to "Assigned" or "In Progress".
    3.  **Processing (Admin):** Admin investigates, adds comments, potentially requests more info from Requester.
    4.  **Resolution:** Admin resolves the issue/request, adds final comments, sets status to "Resolved" or "Closed".
    5.  **Rejection/Cannot Resolve:** Admin sets status to "Rejected" or "Closed - Unresolved" with explanation.
*   **Tracking & Visibility:**
    *   Requesters see status & history of their own SRs.
    *   Admins see all SRs within tenants they manage.
    *   Audit trail logs all status changes, assignments, comments with user/timestamp.
*   **Notifications (Email & In-App):**
    *   SR Submitted: Notify Admin/Queue.
    *   SR Assigned: Notify Requester.
    *   SR Status Change (e.g., In Progress, Resolved, Rejected): Notify Requester.
    *   SR Resolution/Rejection: Notify Requester with details/comments.
    *   New Comment Added (by Admin or Requester): Notify the other party.
    *   Emails sent asynchronously by Node.js backend. Use a templating system (e.g., Nodemailer with Handlebars).
    *   Users can manage email notification preferences for non-critical updates (e.g., new comments) via profile settings.
    *   For Admin notifications, use Tenant's designated contact email (if set in Tenant config), otherwise use resolver's email or a default admin group email.
    *   Log email sending attempts and failures in Audit Log.

### 3.4 Data Correction Request (DCR) Workflow & Management

*   **Purpose:** To flag and propose corrections for factual errors or misclassifications identified in the *data stored in the database* (originating from uploaded files). This maintains data integrity while acknowledging source data immutability within a given version.
*   **Roles:**
    *   **Initiator:** Advanced User, Admin.
    *   **Approver:** Admin.
*   **Workflow:**
    1.  **Initiation:** Initiator identifies specific data point(s) in the Data Exploration view -> Right-click / Action menu -> "Request Data Correction" -> Form pre-populates context (Project, Version, Dataset, Row ID/Identifier, Field) -> Initiator proposes corrected value(s) and provides mandatory justification -> Submit.
    2.  **Submission:** System assigns unique DCR ID, sets status to "Pending Approval", links DCR to the specific data record(s) within the tenant's schema for that version.
    3.  **Review (Admin):** Admin views Pending DCRs (filterable by project/version/user). Reviews proposed change and justification.
    4.  **Decision (Admin):**
        *   **Approve:** Admin approves the change. Status -> "Approved". Admin may add comments.
        *   **Reject:** Admin rejects the change, providing mandatory rejection comments. Status -> "Rejected".
    5.  **Correction Application (Upon Approval):**
        *   A **Correction Record** is created/updated in `public.data_correction_requests`, explicitly storing: `original_value`, `corrected_value`, `justification`, `approver_id`, `change_timestamp` (timestamp of approval/application), and context (tenant, version, dataset, row, field). This record is immutable post-creation for audit purposes.
        *   **The `corrected_value` from the approved DCR updates the corresponding data in the actual dataset table (e.g., `"${tenant_schema}".ds_...`) for the specific row and field.** This ensures future queries on this version of the data reflect the correction by default. (Performance impact of updating RowData for large datasets must be validated).
        *   A versioning mechanism for the data row itself (e.g., a `DataRowVersion` field or a separate history table for data points) should be considered to track the evolution of a specific data point if multiple DCRs might affect the same row over time.
*   **Tracking & Visibility:**
    *   Initiators see status & history of their submitted DCRs (including original/corrected values from Correction Record displayed in the UI’s DCR history view).
    *   All users exploring the data see the *corrected* value by default if a DCR is approved, with an indicator that the value has been corrected. Users should be able to optionally view the original value and the DCR history for that data point.
    *   Admins see all DCRs.
    *   Full audit trail of DCR lifecycle.
*   **Notifications (Email & In-App):**
    *   DCR Submitted: Notify Admin/Queue.
    *   DCR Approved/Rejected: Notify Initiator with Admin comments/rejection reason.
    *   Emails sent asynchronously by Node.js backend with templating and opt-out options as per SR notifications.

### 3.5 Data Exploration (Core User Experience)

*   **Access:** Users select an accessible Project and then an active Version within that project.
*   **Data Selection:** If multiple datasets are part of the selected Version (as per `version_datasets_metadata`), use **tabs** for users to switch between them. Style tabs prominently, with the primary dataset highlighted (e.g., bold or colored). Ensure responsive design for many datasets (e.g., scrollable tabs on tablets).
*   **Integrated View:** Present data through a combination of:
    *   **Configurable Dashboards:** Areas where combinations of charts, KPIs, and tables can be arranged and saved (Advanced users create/save, Standard users view).
    *   **Data Grid/Table:** Display raw(ish) data rows from the selected `processed_table_name` with pagination, sorting (per 'Sortable' flag defined in the **File Specific Configuration** for that dataset), and filtering.
    *   **Visualizations (ECharts):**
        *   Standard Charts: Bar, Line, Pie, Scatter, Area, Table Summary. Render based on 'Chartable' fields from File Specific Config.
        *   Specialized Charts: Sunburst, Heatmap, Treemap (as required/feasible). Consider library extensibility.
        *   Interactivity: Clicking chart segments should filter the main data grid/table and potentially other linked charts (cross-filtering).
    *   **Filtering Pane:** Visible controls (dropdowns, sliders, date ranges) based on **Common Index 'Filterable' fields** (for the selected Version) AND **File Specific 'Filterable' fields** (for the currently viewed dataset within that Version). Allow multi-select and clearing filters.
    *   **Conversational Query Input:**
        *   **Technology:** Node.js backend integrates with an NLP/AI service (e.g., Google Gemini API). The backend constructs prompts (including schema context of tables within the selected version), sends queries to the LLM, receives SQL/intent, validates SQL, executes against the tables related to the selected Version in the tenant's schema in Supabase, and returns results. Embeddings for schema context (related to table structures within versions) might be stored in a shared schema in Supabase (using `pgvector`).
        *   **MVP Scope Refined:**
            *   Direct lookups ("Show all products by Manufacturer X").
            *   Simple aggregations ("What is the total investment in Q3?").
            *   Basic comparisons ("Compare sales of Product A vs Product B").
            *   **Interpretive "Why" Questions (MVP approach):** For a query like "Why is the number of intellectual property filings more for Nokia?", the system may interpret this as a request for comparative data or contributing factors, e.g., by showing IP filings by company with Nokia highlighted, or listing Nokia's IP filings by date and category side-by-side with general trends. Avoid attempting deep causal analysis in MVP.
            *   **Specific Field Lookups:** "What is the title for the selected intellectual property?" (Maps to direct lookup of a 'title' column for a contextually selected item/row).
        *   **UI Aids:** Provide query templates or suggested questions in the UI (e.g., "Ask about filings for [Company]," "Get details for IP [Identifier]") to guide users and showcase capabilities.
        *   **Interaction:** User types question -> System processes -> Display results.
        *   **Ambiguity Handling:** If query is unclear, system should respond by: a) Asking for clarification, b) Suggesting alternative interpretations, or c) Stating it cannot understand the request.
        *   **Result Presentation:** Display results as: appropriate auto-generated ECharts chart, a summary table, or a concise textual answer. Link back to the underlying data rows where applicable.
        *   Cache query results (both from LLM and final data) to reduce NLP API costs and improve response time for repeated/similar questions.
        *   Test NLP accuracy for domain-specific queries (e.g., IP-specific terms) with sample datasets during development.
*   **Row Details:** Allow viewing all fields for a single selected row from the grid.
*   **Saving Views (Advanced User):** Allow Advanced Users to save the current state (filters, chart configurations, layout) as a named view for easy recall by themselves or Standard Users. (Saved view configurations stored, linked to user and version).
*   **Data Correction Indicator:** Clearly flag data points in tables/details that have an associated Approved DCR. Allow viewing original value/DCR history.

### 3.6 Access & Authentication

*   Role-based access control (RBAC) enforced by the Node.js backend (Express.js middleware and service logic) and potentially Supabase Auth custom claims.
*   Users are scoped to their assigned Tenant. Node.js backend ensures all operations are confined to the user's tenant schema by managing the `search_path` or qualifying table names.
*   Standard/Advanced users only see Projects/Versions explicitly shared with them or their Tenant (and marked as Active).
*   Secure authentication using **Supabase Auth**.
*   Password complexity rules (managed by Supabase Auth) and reset mechanism.
*   A clear and accessible **Logout** mechanism must be provided in the UI, terminating the user's session.

### 3.7 Error Handling

*   User Input Validation: Provide immediate, clear feedback for invalid form inputs (React frontend). Authoritative validation in Node.js backend for all API inputs.
*   Graceful Error Display: User-friendly messages for unexpected errors. Avoid showing technical stack traces to end-users.
*   Logging: Comprehensive server-side logging of errors in Node.js backend.
*   API Responses: Node.js backend (Express.js) to use standard HTTP status codes with meaningful JSON error bodies.
*   Connectivity Issues: Handle database (Supabase) or external API (LLM, email service) connection failures gracefully in the Node.js backend.
*   Authorization Errors: Prevent unauthorized access attempts and log them. Node.js backend to return 403 Forbidden or 401 Unauthorized. Display a clear "Access Denied" message on the frontend.

## 4. Non-Functional Requirements (NFRs)

### 4.1 Performance

*   Dashboard initial load (with charts & data for a version): < 4 seconds.
*   Chart rendering / update after interaction (ECharts): < 1.5 seconds.
*   Data grid pagination/sorting (within a version's dataset): < 1 second.
*   Conversational Query response time (simple queries): < 5 seconds (acknowledging NLP latency).
*   File upload feedback (initial response from backend): < 200ms.
*   API response time (standard data retrieval from Node.js backend): < 750ms for 95th percentile.

### 4.2 Scalability

*   Concurrent users per tenant: Designed for 100, testable target 50 initially.
*   Maximum file size per upload: 100MB.
*   Maximum rows per dataset within a version (for interactive exploration): Target 1-2 million rows.
*   Horizontally scalable backend services (Node.js/Express.js). Supabase handles database scaling.
*   Tenant Scalability: System should support a growing number of tenants.

### 4.3 Reliability & Availability

*   Target Uptime: 99.5% (excluding scheduled maintenance).
*   Regular backups (Supabase handles database backups).
*   Disaster recovery plan outline. Define RPO/RTO.

### 4.4 Security

*   Data Encryption: At rest (Supabase default) and in transit (HTTPS).
*   Input Sanitization: Rigorous input validation in Node.js backend. Use parameterized queries or ORM/query builders that prevent SQL injection.
*   Dependency Management: Regularly scan and update dependencies.
*   Authentication & Authorization: Secure RBAC via Supabase Auth and Node.js backend. Node.js backend **must** correctly manage database context to ensure tenant data isolation.
*   Secrets Management: Use environment variables, securely managed in deployment.
*   Audit Trails: Log critical actions.
*   OWASP Top 10: Be mindful of common web vulnerabilities and mitigate them.

### 4.5 Maintainability

*   Code Quality: Adhere to coding standards for Node.js (Express.js) and React. Use linters/formatters.
*   Modularity: Design Node.js backend with separate layers. Design React frontend with reusable components/hooks.
*   Documentation: Document Node.js APIs, React components, and architecture.
*   Configuration Management: Manage environment-specific configurations effectively.
*   Migration Strategy: Develop a clear strategy for database migrations across all tenant schemas.
*   **Testing:**
    *   **Unit Tests:** Cover critical business logic in Node.js services (e.g., tenant provisioning, data processing, schema validation, RBAC checks, DCR update logic), utility functions, and React component logic/hooks. (e.g., using Jest/Vitest).
    *   **Integration Tests:** Validate interactions between components:
        *   Backend: API endpoints interacting with services and a test database (e.g., Supertest with Jest/Vitest).
        *   Frontend: Components interacting with mock API services (e.g., MSW).
        *   Key flows: Authentication, tenant creation, project/version/dataset lifecycle, data exploration, NLP query path.
    *   **End-to-End (E2E) Tests:** For critical user workflows using tools like Cypress or Playwright.
    *   **Tenant Isolation Tests:** Specific tests to verify that data from one tenant is not accessible to another.
    *   **Performance Tests:** For key APIs and data loading, especially with large datasets (e.g., 1 million rows) and DCR updates.
    *   **Test Coverage:** Aim for a documented test coverage goal (e.g., 80% line/branch coverage for critical backend services and frontend components).

## 5. Data Management

### 5.1 Data Model (Conceptual)
*   Tenants (metadata in `public.tenants`).
*   Users (`Supabase Auth` users; profiles in `public.user_profiles` with notification preferences).
*   **Tenant-Specific Data (within each tenant's dedicated PostgreSQL schema):**
    *   `projects`, `versions`, `version_datasets_metadata` (referencing `processed_table_name`).
    *   `ds_...` (Dynamically created tables holding actual, potentially DCR-corrected, data).
    *   `common_index_configs`, `file_specific_configs`.
*   **Shared Data (in `public` schema):**
    *   `service_requests`, `sr_comments`.
    *   `data_correction_requests` (with `original_value`, `corrected_value`, `change_timestamp`).
    *   `schema_embeddings`, `audit_logs`.

### 5.2 Data Retention
*   Active Project/Version Data: Retained in tenant schema tables.
*   **Uploaded Raw Files: Not retained after successful processing into database tables.** Deleted from temporary storage.
*   Data Correction Records: Retained for audit (e.g., 7 years).
*   Service Requests: Retain for 2 years after closure.
*   Audit logs: 7 years.
*   User activity logs: 1 year.
*   Conversational Query history: 6 months.
*   Schema Embeddings: Retained while corresponding version is active/indexed.

### 5.3 Export Capabilities
*   From Data Exploration: CSV, Excel for table data; CSV for chart data; PNG/JPG for chart image; PDF for dashboard view.
*   Bulk Export (Admin/Advanced User): Full datasets from a version (CSV, JSON).
*   Permissions control export capabilities.
*   Audit export actions.

## 6. Notifications

*   **User-Triggered & System Events (SR & DCR):**
    *   SR Events: Submission (to Admin), Assignment (to Requester), Status Change (to Requester), Resolution/Rejection (to Requester), New Comment (to other party).
    *   DCR Events: Submission (to Admin), Approval/Rejection (to Initiator).
*   **Authentication Related (Handled by Supabase Auth).**
*   **Other System-Triggered Events** (Maintenance, Feature Release, Security Alert).
*   **Method:** In-App notifications and **Email**.
    *   Emails sent asynchronously by Node.js backend using a templating system (e.g., Nodemailer with Handlebars).
    *   Users can opt-out of non-critical emails (e.g., new comments on SR/DCR) via profile settings.
    *   Log email delivery status in Audit Log.
    *   For Admin notifications, use Tenant's designated contact email (if available), otherwise use resolver's email or a default admin group email.

## 7. Accessibility & Internationalization

### 7.1 Accessibility
*   Target WCAG 2.1 Level AA. Screen reader compatibility, keyboard navigation, color contrast, logical focus, alt text. ECharts accessibility features to be utilized.

### 7.2 Internationalization (i18n) / Localization (L10n) - *Future Consideration*
*   **Phase 1 (MVP):** English only. Design for future translation (resource files, i18n libraries).
*   **Phase 2:** Multi-language UI, RTL support if needed, localized formats.

## 8. Analytics & Reporting

### 8.1 User Analytics (For Platform Improvement)
*   Track active users, feature usage, session duration, query patterns, UI bottlenecks, error rates. Access for SaaS Admins.

### 8.2 Business Intelligence (For Market Research Firm/Tenant)
*   Track dataset usage, popular dashboards, common filters within their tenant. Access for Advanced Users.

### 8.3 Admin Reporting (Platform Oversight)
*   Track tenant resource consumption, API usage, DCR/SR metrics, user adoption. Access for SaaS Admins.

## 9. Offline Capabilities - *Deferred/Scoped*

*   **MVP Scope:** Primarily online.
*   **Initial Offline Support:** Robust Export capabilities.
*   **Future Consideration:** PWA features, cached dashboards.

## 10. User Stories

*   **As a SaaS Admin,** I want to create a new Tenant, providing a name and initial owner user details, and have the system validate that the proposed unique schema identifier is available in real-time, so I can set up new clients efficiently and without naming conflicts.
*   **As a SaaS Admin,** I want to create a Project and its initial Version in a single, guided workflow (wizard), with the option to upload datasets immediately or later, to streamline the setup of new research deliverables.
*   **As a SaaS Admin,** when uploading a dataset, I want the system to require me to select the target Project and Version, defaulting if only one appropriate context exists, to ensure data is correctly associated.
*   **As a SaaS Admin,** when configuring a dataset's fields within a version, I want to specify its display name, data type, and whether it's filterable, sortable, or chartable, so I can control how users interact with the data.
*   **As a Standard User,** when viewing my Service Requests or Data Correction Requests, I want to see only "Open" or "Pending" items by default, with clear options to filter for other statuses, so I can quickly focus on active issues.
*   **As an Advanced User,** after submitting a DCR and it gets approved by an Admin, I expect the data I see during exploration for that version to reflect the corrected value, while an audit trail of the change (original, new, who, when) is maintained and viewable.
*   **As a Standard User,** after logging in, I want to see a dashboard with a welcome message, a list of my accessible projects/versions, and a summary of my recent activity, so I can quickly orient myself and resume my work.
*   **As a Standard User,** when exploring data with multiple datasets in a version, I want to use clear tabs to switch between them, so I can easily navigate the available information.
*   **As a Standard User,** I want to ask questions like "Why is the number of intellectual property filings more for Nokia?" or "What is the title for the selected intellectual property?" using the conversational query, and receive relevant data or comparative insights.
*   **As a User,** I want to receive email notifications for important updates to my SRs and DCRs, with the ability to opt-out of less critical email updates via my profile settings.

## 11. User Interface (UI) / User Experience (UX)
*   **Style:** Clean, professional, minimal. React with Tailwind CSS and Shadcn UI.
*   **Key Components (React):**
    *   Unified Login Page (with "Reset Password"). Clear "Logout" in main app.
    *   **Dashboard / Landing Page (Post-Login):** Modular layout with role-specific widgets.
    *   **Admin Portal:**
        *   Tenant Management (real-time schema name validation, initial user creation).
        *   User Management (with tenant pre-selection if in tenant context).
        *   **Integrated Project/Version Creation Wizard.**
        *   **Version Management Screen:** Hub with tabs for Overview, Datasets (dataset selection via **tabs**), Common Index Config, File Specific Config (detailed field attributes editor).
        *   SR/DCR oversight.
    *   **User Portal:** Project/Version selection, Data Exploration (dataset selection via **tabs**, conversational query with templates), SR/DCR management (defaulting to open items). User profile settings for email preferences.
    *   Responsive Design.
*   Deliverables: Wireframes, mockups for key workflows and new UI elements like dashboard and wizards.

## 12. Tech Stack (Proposed)

*   **Backend Framework:** Node.js with **Express.js**.
*   **Frontend Library:** **React**.
*   **Language:** **TypeScript** (for both backend and frontend).
*   **Database:** **Supabase (PostgreSQL backend)** with `pgvector` extension.
    *   **Multi-Tenancy Strategy:** Separate schema in PostgreSQL for each tenant. Tenant isolation enforced by the Node.js backend. **RLS is not the primary mechanism for tenant-to-tenant data isolation.**
*   **Authentication:** **Supabase Auth**.
*   **Data Processing (in backend):** Node.js libraries (e.g., `papaparse`).
*   **Charting Library (Frontend):** **ECharts**.
*   **Styling (Frontend):** **Tailwind CSS** with **Shadcn UI / Radix UI**.
*   **State Management (Frontend):** **Zustand** and **TanStack Query (React Query)**.
*   **Form Handling (Frontend):** **React Hook Form** with **Zod**.
*   **File Storage (Temporary for Uploads):** Server filesystem (managed by `multer`). **Original files deleted after processing.**
*   **Email Service:** External provider (e.g., AWS SES, SendGrid) accessed via Node.js backend (e.g., Nodemailer).
*   **API Style:** RESTful APIs built with Express.js.
*   **Deployment:** **Docker**.
*   **NLP/AI Service (for Conversational Query):** External provider (e.g., Google Gemini API) via Node.js backend.

## 13. Open Issues / Questions
*   Detailed data validation rules upon upload.
*   Specific list of "Specialized" chart types.
*   Policy for purging inactive tenant schemas and their data.
*   CSV format for bulk user upload.
*   Detailed design for Conversational Query (LLM, prompt, SQL validation, schema context for "why" questions).
*   Cost implications (NLP, Supabase, Email Service).
*   **Strategy and tooling for database migrations across all tenant schemas (CRITICAL).**
*   UX for managing many datasets (scrollable tabs) or many fields in File Specific Config.
*   Performance implications and strategy for updating RowData upon DCR approval for large datasets.
*   Specifics of user profile settings for email notification opt-outs.
*   Definition of "Tenant contact email" for admin notifications.
*   Exact mechanism for "view original value" after a DCR is applied.
*   Handling of potential race conditions or locking if multiple admins try to configure the same version/dataset simultaneously (optimistic/pessimistic locking considerations for config entities).
*   Specific content and layout details for the role-based dashboards.

---

This PRD v1.5 should now be a complete, standalone document incorporating all the detailed refinements.

