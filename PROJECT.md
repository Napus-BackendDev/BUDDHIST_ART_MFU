# Project: BUDDHIST_ART_MFU

## Architecture
The system consists of a Vue.js 2 frontend admin/user portal and a Node.js/Express backend API connected to MongoDB.
- **Frontend**: Vue.js + Vuex + Vue Router + CoreUI. Located in `/frontend`.
- **Backend**: Express.js + Mongoose + Node-cron. Located in `/backend`.
- **Database**: MongoDB (local or configured via `.env`).
- **Core Workflow Focus**: Student status transitions (NewStudent -> OldStudent) based on submission deadlines.

## Code Layout
- `backend/server.js` - Main entry point.
- `backend/server/Project/Submission/` - Submission models, controllers, and services.
- `backend/server/Project/User/` - User models, controllers, and services.
- `backend/server/Project/Settings/` - Role and Status models/services.
- `backend/server/crons/` - Cron jobs for periodic tasks.
- `frontend/src/views/` - Vue pages.
- `frontend/src/store/` - Vuex state.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Exploration & Test Infra Setup | Configure Jest for backend, verify local environment and frontend tests | none | DONE |
| 2 | Backend Status Transition Logic & Cron | Fix `processStudentStatus` to update all enrolled artists to OldStudent when submission deadline passes (automatic checks on query/update & cron) | M1 | DONE |
| 3 | Backend Miscellaneous Fixes & Unit Tests | Identify other backend bugs, write comprehensive Jest unit tests covering models, controllers, services, and routes | M2 | IN_PROGRESS |
| 4 | Frontend Status Transition & Unit Tests | Fix frontend bugs (status display, enrolled status) and write Vue component & Vuex unit tests | M3 | PLANNED |
| 5 | E2E & Final Verification | Final integration validation, run Forensic Auditor, confirm all tests pass | M4 | PLANNED |

## Interface Contracts
### Submission ↔ User Status Transition
- **Trigger**: When a submission's deadline passes, or when artists are enrolled.
- **Status Mapping**:
  - English: `NewStudent` ↔ Thai: `นักศึกษาใหม่`
  - English: `OldStudent` ↔ Thai: `นักศึกษาเก่า`
- **Actions**:
  - Automatically update `User.status` to the `OldStudent` status ID for all user IDs listed in the submission's `artist` array.
  - Apply transition automatically during queries (onQuery, onQuerys), updates (onUpdate), and a background cron job.
