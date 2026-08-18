# Original User Request

## Initial Request — 2026-06-26T20:18:47+07:00

Fix the submission student status transition bug (NewStudent -> OldStudent) when submission ends or when artists are enrolled, solve miscellaneous bugs across frontend & backend, and write comprehensive Jest unit tests for backend and frontend features.

Working directory: c:\Users\asus\Documents\GitHub\BUDDHIST_ART_MFU
Integrity mode: development

## Requirements

### R1. Submission Student Status Transition
Upon the passing of a submission's deadline (`create.endAt`), all artists enrolled in that submission (`artist` array) must have their user status changed from "NewStudent" (นักศึกษาใหม่) to "OldStudent" (นักศึกษาเก่า), regardless of whether they have submitted any artwork. This transition must be handled automatically (e.g., triggered on queries, updates, or via a background cron job).

### R2. Codebase Quality & Bug Fixing
Identify and resolve any other minor bugs or inconsistencies in the system, specifically in the frontend UI or backend API routes and data validation.

### R3. Backend Unit Testing
Write unit tests using Jest in the backend covering models, controllers, services, and route endpoints.

### R4. Frontend Unit Testing
Write unit tests using Jest in the frontend covering Vue components and Vuex state management.

## Acceptance Criteria

### Automated Verification
- [ ] Running `npm test` in the backend runs and passes all backend Jest tests.
- [ ] Running `npm run test:unit` (or configured test command) in the frontend runs and passes all frontend Jest tests.
- [ ] Test coverage report shows correct execution of status transition logic and order status logic.

### Manual Verification
- [ ] Creating/updating a submission whose deadline has passed updates the user status of all enrolled artists to "OldStudent".
