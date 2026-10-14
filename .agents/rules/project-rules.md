# Buddhist Art MFU Project Rules

1. **Package Managers**:
   - Backend (`/backend`): Strict `pnpm`.
   - Frontend (`/frontend`): Strict `npm`.
   - Do not mix package managers.

2. **Ports**:
   - Frontend: `http://localhost:8080`
   - Backend: `http://localhost:8081`
   - MongoDB: `127.0.0.1:27017`

3. **Images**:
   - Source of truth for artwork photos: MFU Drive WebDAV (`https://mfudrive.mfu.ac.th/s/8AHrLgmZx9k6QPf`).

4. **Domain Contract**:
   - Keep student status transition (`NewStudent` -> `OldStudent`) synchronized across query hooks, update hooks, and cron jobs.

5. **Style & Code Quality**:
   - Preserve existing CoreUI Pro styles, layout, and Vue 2 Options API.
   - Favor the shortest working diff and standard library features.
