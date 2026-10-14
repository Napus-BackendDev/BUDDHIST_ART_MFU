# Buddhist Art MFU (BAS) — Antigravity / Gemini Agent Workspace Rules

This file configures Antigravity and Gemini CLI agents for the **Buddhist Art MFU** repository.

For the authoritative operating schema, pre-flight checklist, and communication format, refer to [AGENTS.md](AGENTS.md).

## Critical Guidelines for Antigravity / Gemini Agents

1. **Package Manager Isolation**:
   - Backend (`/backend`): Always use `pnpm`.
   - Frontend (`/frontend`): Always use `npm`.
   - Never mix package managers or install unnecessary packages.

2. **Non-colliding Local Ports**:
   - Frontend: `http://localhost:8080`
   - Backend: `http://localhost:8081`
   - MongoDB: `127.0.0.1:27017`

3. **Image Storage Policy**:
   - Always use MFU Drive WebDAV as the source of truth for artwork images:
     `https://mfudrive.mfu.ac.th/s/8AHrLgmZx9k6QPf`
   - Do not switch to local uploads or mock image links without explicit user directive.

4. **Domain Contract Integrity**:
   - Enforce the student status transition (`NewStudent` -> `OldStudent`) across query hooks, update hooks, and cron jobs.
   - Preserve canonical user roles (`Admin`, `Artist`, `Buyer`, `Public`).

5. **Engineering Discipline (Ponytail)**:
   - Favor minimal diffs, standard libraries, and existing utilities over new abstractions.
   - Verify every change with real execution (`curl`, unit tests, or build commands) before reporting completion.

6. **Workspace Skills**:
   - Project skills reside in `.agents/skills/` (`dev`, `orchestrator`, `ponytail`, `bas-docker-deploy`, `ui-ux-pro-max`, `impeccable`, `code-review`).
