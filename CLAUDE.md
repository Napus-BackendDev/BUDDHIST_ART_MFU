# BUDDHIST_ART_MFU

Admin/user portal for the Mae Fah Luang University Buddhist Art program.
- **Frontend** (`/frontend`): Vue 2 + Vuex + Vue Router + CoreUI Pro. Options API.
- **Backend** (`/backend`): Express + Mongoose 5 + node-cron on MongoDB. CommonJS.

## Commands
| Task | Dir | Command |
|------|-----|---------|
| Run backend (dev) | `backend` | `pnpm start` |
| Backend tests | `backend` | `pnpm test` |
| Backend coverage | `backend` | `pnpm test:coverage` |
| Run frontend (dev) | `frontend` | `npm run serve` |
| Frontend unit tests | `frontend` | `npm run test:unit` |
| Frontend build | `frontend` | `npm run build` |

<!-- Backend uses pnpm; frontend uses npm (CoreUI template). Do not mix package managers. -->

## Domain contract (can't be inferred from code)
The core workflow is the student status transition. When a submission's deadline
passes — or when artists are enrolled — every user ID in the submission's `artist`
array must flip `User.status` from **NewStudent** to **OldStudent**.
- `NewStudent` = `นักศึกษาใหม่`, `OldStudent` = `นักศึกษาเก่า` (status is stored by ID, not string).
- The transition is enforced in three places, keep them in sync: query hooks
  (`onQuery`/`onQuerys`), `onUpdate`, and the cron job in `backend/server/crons/`.

## System map — read on demand (don't guess)
Detailed reference docs live in `.claude/docs/` (not auto-loaded, so zero token cost until you open them). Open the relevant one before working on that area:
- [`.claude/docs/ARCHITECTURE.md`](.claude/docs/ARCHITECTURE.md) — what the system is, the 4 user types (Admin/Artist/Buyer/Public), how frontend↔backend talk, auth lifecycle, module maps, deploy.
- [`.claude/docs/BACKEND.md`](.claude/docs/BACKEND.md) — Express modular pattern (`routes→service→controller→model`), `base.service.js` CRUD factory, every domain, crons, mail, PDF/cert, "where to change X" index.
- [`.claude/docs/FRONTEND.md`](.claude/docs/FRONTEND.md) — Vue/Vuex/Router, 3 portals + storefront, view→store→API flow, `api.js` wrappers, mixins, dead code.
- [`.claude/docs/DATA_MODEL.md`](.claude/docs/DATA_MODEL.md) — every Mongoose model + relationships, the `[{key,value}]` i18n pattern, `Setting_*`-by-ID, the status-transition contract in detail.
- [`.claude/docs/API.md`](.claude/docs/API.md) — full REST endpoint inventory by module (method, path, auth).

Heads-up (verified during the audit): passwords are **plaintext**; auth checks signature only (**no role/ownership checks**, IDOR); frontend has **no route guards** (backend is the only gate); several list/stat endpoints are public; socket.io is scaffolding only. Treat these as current-state facts, not targets.

## Specialist subagents (`.claude/agents/`)
Delegate to these instead of doing everything in the main thread; each is scoped and reads the docs above on demand:
- **backend-engineer** — Express/Mongoose changes (endpoints, models, crons, the status transition).
- **frontend-engineer** — Vue 2 / Vuex / CoreUI features and fixes.
- **test-engineer** — Jest/supertest + Vue Test Utils; owns comprehensive/regression coverage.
- **security-auditor** (read-only) — vulnerability sweeps (IDOR, secrets, injection). Use proactively.
- **code-reviewer** (read-only) — reviews the current diff for bugs + lazy-senior-dev discipline. Use proactively.

## How to work here (lazy senior dev — saves tokens)
Before writing any code, walk this ladder and STOP at the first hit:
1. Does this need to exist? → No: skip it (YAGNI).
2. Already in this codebase? → Reuse the helper, don't rewrite.
3. Standard library does it? → Use it.
4. Native platform / framework feature? → Use it (Vue/Express/Mongoose built-ins).
5. Already-installed dependency does it? → Use it (see package.json before adding one).
6. Fits in one line? → One line.
7. Only then: write the minimum that works.

Non-negotiable even when lazy: input validation at trust boundaries, error handling,
security, and accessibility. "Lazy" means less code, never less safety.

Fix bugs at the root: patch the shared function all callers use, not each call site.

## Response & context rules (saves tokens)
- Be terse. Give the answer first; explain only what was asked. No filler preamble or recap.
- Search wide with the **Explore** subagent instead of reading whole files into context.
- Match existing style. Do NOT introduce TypeScript, new frameworks, or new deps without asking.
- Prefer editing an existing file over creating a new one.

<!-- Prompt patterns for the human: see .claude/PROMPTING.md (not auto-loaded, zero token cost). -->
