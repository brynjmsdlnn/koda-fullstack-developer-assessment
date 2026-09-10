# Client Project Tracker - Technical Documentation & Submission Guide

This document provides complete instructions, architecture explanations, API documentation, testing details, and technical reflections for the **Client Project Tracker** assessment.

---

## 1. Quick Start & Setup Instructions

Full setup guide (Docker + local development, troubleshooting): [SETUP.md](./SETUP.md).
It covers prerequisites, environment + `APP_KEY` configuration, starting the
stack, seeding `test_data.json`, and running without Docker.

### Access the Services
* **Frontend Application**: [http://localhost:3000](http://localhost:3000)
* **Backend API Base**: [http://localhost:8000/api/projects](http://localhost:8000/api/projects)
* **Interactive OpenAPI Docs (Stoplight Elements UI)**: [http://localhost:8000/docs/api](http://localhost:8000/docs/api)
* **OpenAPI 3.1 JSON Specification**: [http://localhost:8000/docs/api.json](http://localhost:8000/docs/api.json)

---

## 2. Architecture & Technology Stack

```text
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (React 19)                         │
│  - TanStack Router (File-based routing)                         │
│  - TanStack Query (Server state management & caching)           │
│  - Tailwind CSS v4 & Lucide Icons                               │
│  - Axios with custom mutator (`src/api/custom-instance.ts`)     │
│  - Orval (Auto-generates TS types & hooks from OpenAPI spec)    │
└────────────────────────────────┬────────────────────────────────┘
                                 │ HTTP / JSON
                                 │ (Vite Proxy: /api -> backend:8000)
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Backend (Laravel 13)                        │
│  - PHP 8.4.15 + SQLite Database                                 │
│  - Dedicated Form Requests with NormalizesProjectInput trait    │
│  - Eloquent ORM with Query Scopes (search, filter, sort)        │
│  - Resource layer with dual-casing support                      │
│  - Dedoc Scramble 0.13 (OpenAPI 3.1.0 automated generation)     │
│  - Pest PHP 5.1 (25 automated feature & unit tests)             │
└─────────────────────────────────────────────────────────────────┘
```

### Backend (Laravel 13 / PHP 8.4)
* **Framework**: Laravel 13 (`13.31.0`) on PHP 8.4 (`8.4.15`).
* **Database**: SQLite (`database/database.sqlite`), mounted via Docker volume.
* **OpenAPI Generator**: `dedoc/scramble` (`0.13.43`) automatically generates OpenAPI 3.1.0 spec from route signatures, controller attributes, and form requests.
* **Code Styling**: Laravel Pint (`1.32.0`) PSR-12 standard.
* **Testing**: Pest PHP (`5.1.4`) automated test framework (24 feature tests).

### Frontend (React 19 / TypeScript)
* **Framework**: React 19 (`19.3.0`) SPA bundled with Vite 8 (`8.2.2`).
* **Language**: TypeScript (`6.0.3`).
* **Routing**: `@tanstack/react-router` (`1.170.34`) with file-based routing.
* **Data Fetching & Cache**: `@tanstack/react-query` (`5.102.8`).
* **API Client & Codegen**: `axios` (`1.20.0`) configured with `orval` (`8.30.0`) to auto-generate fully typed React Query hooks (`useProjectsIndex`, `useProjectsStore`, `useProjectsUpdate`, `useProjectsDestroy`).
* **Styling**: Tailwind CSS v4 (`4.3.3`) and Lucide React icons (`0.577.0`).

---

## 3. REST API Reference

The API is accessible at both `/api/projects` and `/projects` (via route aliasing).

### Endpoints Summary

| Method | Endpoint | Description | Query Parameters / Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/projects` | List projects (paginated or all) | `search`, `status`, `priority`, `sort_by`, `sort_order`, `per_page`, `all` |
| `GET` | `/api/projects/{id}` | Get single project | None |
| `POST` | `/api/projects` | Create new project | JSON body (see fields below) |
| `PUT` | `/api/projects/{id}` | Update existing project | JSON body (supports partial or full update) |
| `DELETE`| `/api/projects/{id}` | Delete project | None (returns `204 No Content`) |

### Request Payload & Dual-Casing Support

To ensure seamless frontend integration while adhering to backend conventions, the API accepts and returns both **camelCase** and **snake_case**:

| Field (camelCase) | Field (snake_case) | Type | Required (POST) | Description |
| :--- | :--- | :--- | :--- | :--- |
| `clientName` | `client_name` | String | Yes | Name of the client (max 255) |
| `projectName` | `project_name` | String | Yes | Name of the project (max 255) |
| `description` | `description` | String | No | Project scope or notes (nullable) |
| `status` | `status` | String | Yes | `Planning`, `In Progress`, `On Hold`, `Completed` |
| `priority` | `priority` | String | Yes | `Low`, `Medium`, `High` |
| `startDate` | `start_date` | Date | No | Format: `YYYY-MM-DD` |
| `dueDate` | `due_date` | Date | No | Format: `YYYY-MM-DD` (must be >= Start Date) |

### Sample Response (`GET /api/projects/1`)
```json
{
  "data": {
    "id": 1,
    "clientName": "Acme Corporation",
    "projectName": "Corporate Website Redesign",
    "description": "Redesign and modernize the company's corporate website.",
    "status": "In Progress",
    "priority": "High",
    "startDate": "2026-06-01",
    "dueDate": "2026-07-15",
    "client_name": "Acme Corporation",
    "project_name": "Corporate Website Redesign",
    "start_date": "2026-06-01",
    "due_date": "2026-07-15",
    "createdAt": "2026-09-10T09:11:31.000000Z",
    "updatedAt": "2026-09-10T09:11:31.000000Z"
  }
}
```

---

## 4. Validation & Edge Case Handling

1. **Required Fields**: `client_name`, `project_name`, `status`, and `priority` are mandatory on creation.
2. **Enum Enforcement**: `status` and `priority` strictly enforce valid domain enum values via backed PHP enums (`ProjectStatus` and `ProjectPriority`).
3. **Cross-Field Date Invariant (`due_date >= start_date`)**:
   * **On Create (`StoreProjectRequest`)**: Validated via Laravel's `after_or_equal:start_date` rule.
   * **On Partial Update (`UpdateProjectRequest`)**: When updating only `due_date` without providing `start_date` (or vice versa), the validator inspects the existing project instance from the database route parameter to verify the invariant against stored dates.
4. **Input Normalization (`NormalizesProjectInput`)**:
   * Incoming camelCase keys (`clientName`, `startDate`, etc.) are converted to snake_case in `prepareForValidation()` prior to rule evaluation.
   * Empty string dates (`""`) are converted to `null` to avoid database type conflicts.
5. **Error Formatting**:
   * Unprocessable entities return standard HTTP 422 JSON with field-specific validation errors:
   ```json
   {
     "message": "The given data was invalid.",
     "errors": {
       "client_name": ["Client Name is required."],
       "due_date": ["Due Date cannot be earlier than Start Date."]
     }
   }
   ```

---

## 5. Automated Testing & Verification

### Backend Automated Test Suite (Pest PHP)
A comprehensive Pest test suite covers all CRUD endpoints, validations, edge cases, query scopes, seeding, and dual casing:
```bash
docker compose exec backend php artisan test --compact
```
**Results**:
```text
Tests:    24 passed (95 assertions)
Duration: 3.29s
```

#### Test Breakdown:
* `it returns a paginated list of projects`
* `it returns an unpaginated collection when all=true`
* `it filters projects by status`
* `it filters projects by priority`
* `it searches projects across client_name, project_name, and description`
* `it sorts projects by date, string, and id in asc and desc`
* `it creates a project with snake_case parameters`
* `it creates a project with camelCase parameters`
* `it validates required fields on creation`
* `it validates enum status and priority values`
* `it rejects dueDate earlier than startDate on create`
* `it updates an existing project with partial fields`
* `it enforces dueDate constraint against existing startDate during partial update`
* `it deletes a project and returns 204`
* `it returns 404 for non-existent project id`
* `it seeds 12 projects from test_data.json accurately`
* ...and additional boundary tests.

### Code Style Checks
```bash
# Backend Pint formatting
docker compose exec backend ./vendor/bin/pint --test

# Frontend code checks and build (from frontend/ directory)
cd frontend
npm run check          # Prettier formatting check
npm run lint           # ESLint check
npx tsc --noEmit       # TypeScript compilation check
npm run generate-api   # Orval API client code generation
npm run build          # Vite production build
```

---

## 6. Technical Decisions & Reflections

### 1. Architectural Strategy & Type Safety
Rather than manually maintaining a disconnected `openapi.yaml` file, we introduced **Dedoc Scramble** on the backend and **Orval** on the frontend.
* **Dedoc Scramble** dynamically reads Laravel FormRequests, models, and controller annotations to generate accurate OpenAPI 3.1 documentation without tedious PHPDoc boilerplate.
* **Orval** consumes `http://localhost:8000/docs/api.json` and automatically outputs typed TanStack Query hooks, query keys, and models directly into `frontend/src/api/generated/`.
* Whenever the backend API contract evolves, executing `npm run generate-api` instantly updates frontend types, catching contract breaks at compile time.

### 2. Dual-Casing Normalization
Frontend JavaScript ecosystems conventionally use `camelCase`, while Laravel conventions and database columns utilize `snake_case`. Rather than imposing one standard at the expense of the other:
* Incoming payloads accept either casing seamlessly.
* Outgoing API resources serialize both casings (`clientName` and `client_name`).
* Controller annotations explicitly declare both variants in the OpenAPI schema, giving frontend developers clean autocomplete and compile-time type checking.

### 3. Frontend UX Decisions
* **Debounced Search**: Implemented `useDeferredValue` on the search filter to ensure rapid typing remains buttery-smooth without triggering jittery layout thrashing.
* **Inline + Modal Error Mapping**: Server-side 422 errors returned by Laravel are mapped back into camelCase field errors and rendered inline below the corresponding inputs in the modal.
* **Responsive Views**: The dashboard automatically switches between a high-density table for desktop screens and clean, touch-friendly cards on mobile devices.

### 4. AI Tooling Disclosure
* In compliance with the assessment guidelines, the following AI tools were used:
  * **Antigravity** (Google DeepMind's advanced agentic coding pair programmer) — scaffolding boilerplate, synchronizing the OpenAPI pipeline, and generating the Pest automated test matrix. All architecture, database schemas, normalization logic, and components were reviewed, customized, and verified end-to-end.
  * **OpenCode** — agentic assistance with tooling tasks: codebase exploration, cleanup refactors, and verification.
  * **ChatGPT** — brainstorming and researching the tools used in the project (e.g. Docker behavior).
