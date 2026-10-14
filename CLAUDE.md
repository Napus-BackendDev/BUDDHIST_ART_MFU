# BUDDHIST_ART_MFU (BAS)

Admin and User portal for the Mae Fah Luang University Buddhist Art program.
- **Frontend** (`/frontend`): Vue 2.6 + Vuex + Vue Router + CoreUI Pro. Options API. Port `8080`.
- **Backend** (`/backend`): Node.js + Express + Mongoose 5 + node-cron on MongoDB. CommonJS. Port `8081`.
- **Image Storage**: MFU Drive WebDAV (`https://mfudrive.mfu.ac.th/s/8AHrLgmZx9k6QPf`).

Authoritative Agent Policy & Guidelines: See [AGENTS.md](AGENTS.md) and [GEMINI.md](GEMINI.md).

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

## Domain Contract (Can't be inferred from code)
The core workflow is the student status transition. When a submission's deadline
passes — or when artists are enrolled — every user ID in the submission's `artist`
array must flip `User.status` from **NewStudent** to **OldStudent**.
- `NewStudent` = `นักศึกษาใหม่`, `OldStudent` = `นักศึกษาเก่า` (status is stored by ID, not string).
- The transition is enforced in three places, keep them in sync: query hooks
  (`onQuery`/`onQuerys`), `onUpdate`, and the cron job in `backend/server/crons/`.

## System Documentation
Reference docs located in the repository:
- [`AGENTS.md`](AGENTS.md) — Universal AI Agent policy, pre-flight checklist, and communication format.
- [`Design.md`](Design.md) — System design, module structure, and database contracts.
- [`system_specification.md`](system_specification.md) — Functional specifications and workflows.
- [`docs/tor/TOR_Buddhist_Art_MFU_PostTermSale.md`](docs/tor/TOR_Buddhist_Art_MFU_PostTermSale.md) — Official TOR requirements.
- [`log.md`](log.md) — Chronological activity and development log.

## Specialist Subagents & Skills (`.agents/skills/`)
- **dev** — Buddhist Art MFU full-stack developer (Vue 2 + Express + MongoDB + MFU Drive).
- **orchestrator** — Lead development coordinator enforcing Ponytail simplicity.
- **ponytail** — Complexity & over-engineering hunter (stdlib first, YAGNI, shortest diff).
- **bas-docker-deploy** — Beta release to `bas.beta.mfu.ac.th` (192.168.11.90:8082).
- **ui-ux-pro-max** & **impeccable** — WCAG AA accessibility, CoreUI Pro preservation, micro-interactions.
- **code-review** — Automated diff review against standards and specs.

## How to Work Here (Ponytail Discipline)
Before writing any code, walk this ladder and STOP at the first hit:
1. Does this need to exist? → No: skip it (YAGNI).
2. Already in this codebase? → Reuse the helper, don't rewrite.
3. Standard library does it? → Use it.
4. Native platform / framework feature? → Use it (Vue/Express/Mongoose built-ins).
5. Already-installed dependency does it? → Use it (see package.json before adding one).
6. Fits in one line? → One line.
7. Only then: write the minimum that works.

Fix bugs at the root: patch the shared function all callers use, not each call site.
