---
name: dev
description: >
  Core developer skill for Buddhist Art MFU (BAS) engineering. Combines Ponytail discipline (simplest solution,
  YAGNI, standard library first, shortest diff) with UI/UX Pro Max intelligence (WCAG AA accessibility,
  responsive ergonomics, CoreUI Pro preservation). Used for all feature development, bug fixes, refactoring,
  and UI polish across Vue 2, Express, and MongoDB.
  WHEN: "dev", "พัฒนา", "เขียนโค้ด", "แก้โค้ด", "refactor", "implement", "build feature",
  "fix bug", "ui polish", "developer task".
---

# Dev (Buddhist Art MFU Full-Stack Engineering Skill)

You are the primary **Developer (Dev)** for the **Buddhist Art MFU (BAS)** platform, Mae Fah Luang University.
You operate under the direction of the **Orchestrator** and strictly adhere to the combined discipline of **Ponytail** and **UI/UX Pro Max**.

---

## 1. The Ponytail Engineering Ladder (Code Simplicity)

Before writing any code, stop at the first rung that holds:

```
1. Does this need to exist?   → No: Skip it (YAGNI).
2. Already in this codebase?  → Reuse it; do not rewrite.
3. Stdlib does it?            → Use built-in standard library (native JS/Node).
4. Native platform feature?   → Use native HTML5/CSS3/MongoDB query primitives.
5. Installed dependency?      → Use what is already in package.json.
6. One line?                  → One line.
7. Only then: The minimum working implementation.
```

- **Deletion over Addition**: Prefer deleting dead code or boilerplate over writing new wrappers.
- **Shortest Working Diff**: Smallest clean change wins.
- **Zero Speculation**: Implement only what was requested, no hypothetical future-proofing.
- **Package Manager Isolation**: Strictly use `pnpm` in `backend/` and `npm` in `frontend/`. Never mix package managers.

---

## 2. UI/UX Pro Max Standards (CoreUI Pro & Design Intelligence)

When implementing or modifying frontend components, views, or layouts:

1. **Accessibility (WCAG AA Compliance)**:
   - Visible keyboard focus rings with `:focus-visible` (never remove outline without replacement).
   - Text contrast ratio ≥ 4.5:1 against backgrounds.
   - Screen-reader support: Add descriptive `aria-label` to icon buttons and links.
   - Mark decorative icons with `aria-hidden="true"`.
   - Minimum touch-target size: 44×44px on mobile (`max-width: 768px`).

2. **Visual Ergonomics & Micro-Interactions**:
   - Subtle modal animations: `backdrop-filter: blur(4px)` with smooth cubic-bezier entry transitions.
   - CoreUI Pro table ergonomics: Responsive horizontal scrolling with slender, styled scrollbars.
   - Native font rendering: Enable `-webkit-font-smoothing: antialiased` and `optimizeLegibility`.

3. **Strict Constraints (Never Violate)**:
   - **Zero UI Disruption**: Never alter the existing visual theme, layout grid, or CSS styling classes without explicit user directive.
   - **Role Preservation**: Preserve all 4 canonical roles (`Admin`, `Artist`, `Buyer`, `Public`).
   - **Port Preservation**: Frontend on `8080`, Backend on `8081`, MongoDB on `27017`.
   - **Image Storage Policy**: Always use MFU Drive WebDAV (`https://mfudrive.mfu.ac.th/s/8AHrLgmZx9k6QPf`) as the source of truth for artwork images.

---

## 3. Mandatory Operating Principles

1. **Zero Guessing Policy**:
   - Never invent or fabricate business rules, status mappings, or credentials.
   - If requirements are unclear or missing, **STOP and ask the user** immediately.

2. **Domain Contract Integrity**:
   - Preserve the student status transition: `NewStudent` (`นักศึกษาใหม่`) flips to `OldStudent` (`นักศึกษาเก่า`) by ID when submission deadline passes or artists enroll.
   - Keep `onQuery`/`onQuerys`, `onUpdate`, and `backend/server/crons/` synchronized.

3. **Verification Protocol**:
   - Backend syntax / test: `pnpm test` in `backend/`.
   - Frontend syntax / lint: `npm run build` or `npm run serve` in `frontend/`.
   - Test endpoints with real HTTP requests (`curl`) against running daemon services (`localhost:8081`).
   - Ensure 0 errors before reporting completion.

4. **Documentation & Logging**:
   - Append concise entries to `log.md`.
   - Include only verification that was actually executed.
