# UI QA report — 2026-10-25 (all 141 cases passed)

Cases: 141 | passed 141 | partial 0 | failed 0 | pending 0
Evidence per case: outputs/uiqa-20261024/state.json (evidence + bug ids). Nothing committed.

## Bugs found and fixed (B-001 .. B-029, see state.json)
Highlights: B-020 slip email lacked invoice; B-021 stale receipt; B-022 duplicate artworks on upload retry; B-023 MFU base-folder MKCOL best-effort; B-024 learner course field; B-025 delete-assignment warning; B-026 polish batch (touch targets 44px, post-term email link, single delete confirm, missing-fields hint); B-027 approve/reject only clicked button spins; B-028 Users Excel round-trip + update warning; B-029 owner-decided features (buyer cancel, admin replace slip).
Also fixed during the final pass: ORD-09 invoice failure now visible in the order modal and cleared on regeneration; keyboard focus ring restored in modals/forms; CIcon invalid-size warning; Users import accepts export headers.

## Features built on the owner's decision
Buyer 'Cancel order' (unpaid orders), admin 'Replace slip' (Pending orders, old slip kept in slipHistory), news 'Preview' in create/edit, learner 'หลักสูตร' field + filter/tag + import from the real learner workbook.

## Owner decisions that closed earlier gaps
No shipping feature/email; rejected order => re-book; no extra Settings tabs; filters need not persist; no artist sales view; Privacy/Terms text to be supplied by the owner; MFU Drive public share handled by the owner (B-009).

## Known test-suite item (not from this work)
backend tests/submissionImage.test.js: 1 failing assertion (expects 20 MB preview limit, code uses 50 MB) - pre-existing.
Other: admin new-order email still links to http://localhost:8080 (adminNewOrder.js) - change before production.
