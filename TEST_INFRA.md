# E2E Test Infra: BUDDHIST_ART_MFU

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation design.
- Methodology: Category-Partition + BVA + Pairwise + Workload Testing.

## Feature Inventory
| # | Feature | Source (requirement) | Tier 1 | Tier 2 | Tier 3 |
|---|---------|---------------------|:------:|:------:|:------:|
| 1 | Student Status Transition on Deadline | ORIGINAL_REQUEST R1 | 5      | 5      | ✓      |
| 2 | Backend User Status & Role Queries | ORIGINAL_REQUEST R2 | 5      | 5      | ✓      |
| 3 | Submission CRUD Operations | ORIGINAL_REQUEST R2 | 5      | 5      | ✓      |

## Test Architecture
- Test runner: `jest` (integrated in both frontend and backend)
- Test case format: Jest standard test blocks checking API endpoints and Vue component behavior
- Directory layout:
  - Backend: `/backend/tests/` (unit and integration tests)
  - Frontend: `/frontend/tests/unit/` (Vue components and store specs)

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Full Student Lifecycle | Register as NewStudent -> Enrolled in Submission -> Deadline Passes -> Transitioned to OldStudent | Medium |
| 2 | Artist Portfolio & Submission | Artist joins -> Submits artwork -> Admin reviews and approves/rejects -> Checks status | High |

## Coverage Thresholds
- Tier 1: ≥5 per feature (Total: 15+)
- Tier 2: ≥5 per feature (Total: 15+)
- Tier 3: Pairwise coverage of major feature interactions
- Tier 4: ≥5 realistic application scenarios
