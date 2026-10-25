---
name: buddhistart-dev
description: >-
  Comprehensive guide and runbook for developing, testing, debugging, and maintaining the BUDDHIST_ART_MFU portal.
  Use this skill when developing backend APIs (Express/Mongoose), frontend features (Vue 2/Vuex/CoreUI),
  implementing student status transitions, running test suites, or working with database seeds and TOR docs.
---

# BUDDHIST_ART_MFU Development & Workflow Skill

This skill provides step-by-step procedures, architectural rules, domain contracts, and verification commands for the **Mae Fah Luang University Buddhist Art** portal.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology | Directory | Package Manager |
| :--- | :--- | :--- | :--- |
| **Backend** | Express + Mongoose 5 + node-cron (CommonJS) | `backend/` | **`pnpm`** (Do NOT use npm/yarn) |
| **Frontend** | Vue 2 + Vuex + Vue Router + CoreUI Pro (Options API) | `frontend/` | **`npm`** (Do NOT mix package managers) |
| **Database** | MongoDB | configured in `backend/.env` | - |

---

## ⚡ Essential Development Commands

### Backend Commands (Run inside `backend/` using `pnpm`)
```bash
# Start backend in development mode
pnpm start

# Run all backend Jest unit & integration tests
pnpm test

# Run backend tests with coverage report
pnpm test:coverage

# Run specific test file
npx jest tests/systemSettings.test.js --runInBand

# Seed & migration scripts
node scripts/seedCategories.js
node scripts/seedSettings.js
node scripts/ensureSettingDefaults.js
node scripts/migrateSettingCodes.js
```

### Frontend Commands (Run inside `frontend/` using `npm`)
```bash
# Start frontend dev server (usually http://localhost:8080)
npm run serve

# Run Vue unit tests
npm run test:unit

# Build for production
npm run build
```

---

## 📜 Domain Contracts & Business Logic (CRITICAL)

### 1. Student Status Transition Contract
* **Rule**: When a submission deadline passes OR when artists are enrolled, every user ID in the submission's `artist` array must flip `User.status` from **`NewStudent`** to **`OldStudent`**.
* **Status Mapping**:
  * English: `NewStudent` ↔ Thai: `นักศึกษาใหม่`
  * English: `OldStudent` ↔ Thai: `นักศึกษาเก่า`
* **Status Storage**: Stored as MongoDB `ObjectId` reference to `Setting_Status`, NOT raw strings.
* **Sync Requirement**: The transition logic must be kept synchronized across all 3 trigger points:
  1. `backend/server/Project/Submission/service/submission.js` (`onQuery` / `onQuerys`)
  2. `backend/server/Project/Submission/service/submission.js` (`onUpdate`)
  3. `backend/server/crons/submissionDeadline.js` (background cron task)

### 2. Multi-Lingual Pattern (`[{ key, value }]`)
* Localized fields (e.g., titles, descriptions, status names) follow the array pattern:
  `[{ key: "th", value: "..." }, { key: "en", value: "..." }]`
* Always maintain both `th` and `en` values when seeding or modifying model data.

### 3. Setting Codes & System Defaults
* Settings (Statuses, Roles, Categories, Groups) use unique machine codes (e.g., `SETTING_STATUS_NEW_STUDENT`, `SETTING_STATUS_OLD_STUDENT`).
* Reference helper: `backend/server/Project/Settings/helpers.js` and `backend/server/Project/Settings/statusCodes.js`.

---

## 📂 Key Code Structure & Locations

```text
BUDDHIST_ART_MFU/
├── backend/
│   ├── server.js                          # Express entry point
│   ├── middleware/adminMiddleware.js      # Admin authorization
│   ├── server/Project/
│   │   ├── Artwork/                       # Artwork catalog & post-term sales
│   │   ├── Submission/                    # Submissions, artist enrollments & status triggers
│   │   ├── User/                          # Users, profiles, artist portfolios
│   │   ├── Order/                         # Cart, checkout, payment processing
│   │   ├── Settings/                      # Roles, statuses, groups, system settings
│   │   └── Dashboard/                     # Admin & artist metrics
│   ├── server/crons/                      # Scheduled tasks (deadlines, cart timeouts)
│   └── tests/                             # Jest test suites
├── frontend/
│   ├── src/
│   │   ├── views/                         # Admin, Artist, Customer, Public pages
│   │   ├── containers/                    # Layout containers (Sidebar, Header, Nav)
│   │   ├── store/                         # Vuex modules (Artwork, Setting, User, etc.)
│   │   ├── service/api.js                 # Axios API client & endpoints
│   │   └── router/                        # Vue Router configuration
│   └── tests/unit/                        # Vue Test Utils unit test files
└── docs/tor/                              # TOR specifications & screenshot assets
```

---

## 🛠️ Step-by-Step Workflow Guides

### Step 1: Adding or Modifying Backend API Endpoints
1. Define / update Mongoose model in `backend/server/Project/<Module>/models/<name>.model.js`.
2. Implement business logic in `backend/server/Project/<Module>/service/<name>.js`.
3. Register Express route in `backend/server/Project/<Module>/<module>.routes.js`.
4. Add unit / integration test in `backend/tests/<module>.test.js`.
5. Run `pnpm test` to verify.

### Step 2: Updating Frontend Vue Components & Vuex State
1. Update API method in `frontend/src/service/api.js`.
2. Add actions/mutations in corresponding Vuex module under `frontend/src/store/modules/`.
3. Update or create view component in `frontend/src/views/`.
4. Check i18n keys in `frontend/src/store/lang/th.js` and `en.js`.
5. Run `npm run test:unit` and `npm run serve` to verify layout and reactivity.

### Step 3: Verifying Status Transitions & Cron Jobs
1. Ensure test database or mock correctly populates `Setting_Status` for both `NewStudent` and `OldStudent`.
2. Trigger the submission update or query action and assert `user.status` matches the `OldStudent` ID.
3. Test cron manually or via unit tests: `npx jest tests/submissionDeadline.test.js`.

---

## 🎯 Lazy Senior Dev Best Practices
1. **Reuse Existing Utilities**: Check `backend/server/Project/Settings/helpers.js` and `frontend/src/service/api.js` before writing new helpers.
2. **Minimal Diff**: Make precise, non-breaking changes.
3. **Verify Boundary Validation**: Ensure request body sanitization and proper error responses (`status(400)`, `status(500)` with clean message objects).
