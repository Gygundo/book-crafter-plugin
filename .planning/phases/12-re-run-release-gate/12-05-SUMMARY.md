---
phase: 12-re-run-release-gate
plan: 05
subsystem: testing
tags: [smoke-test, marketplace, release-gate, docx]

requires:
  - phase: 12-03
    provides: seven-gap comparison evidence for README capability language
  - phase: 12-04
    provides: external blind review validating v1.1 quality claims
provides:
  - evidence-anchored README capability language (GATE-07)
  - fresh-install smoke test evidence (GATE-06)
affects: [12-06-ship-decision]

tech-stack:
  added: []
  patterns: [marketplace install two-step procedure]

key-files:
  created:
    - evidence/smoke-test-log.md
  modified:
    - README.md
    - .claude-plugin/plugin.json

key-decisions:
  - "plugin.json name must match release identity (book-crafter) not dev identity (book-crafter-dev) for marketplace resolution"
  - "Marketplace add + plugin install is a two-step procedure; documented in README install block"

patterns-established:
  - "Fresh-install smoke test: remove dev -> marketplace add -> plugin install -> sample -> verify"

requirements-completed: [GATE-06, GATE-07]

duration: 3min
completed: 2026-04-16
---

# Phase 12 Plan 05: README Finalisation and Smoke Test Summary

**Evidence-anchored README capability language plus fresh-install smoke test PASS (captivation 14/16, novelty_dedup pass)**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-16T21:30:00Z
- **Completed:** 2026-04-17T05:30:30Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- README capability language finalised against seven-gap comparison evidence (GATE-07 satisfied)
- Fresh-install smoke test PASS: marketplace install produces valid .docx on first attempt (GATE-06 satisfied)
- Full pipeline end-to-end: outline -> research -> write -> edit -> enrich -> novelty gate -> format -> sample gate
- Captivation score 14/16 (threshold 11) with novelty_dedup pass

## Task Commits

Each task was committed atomically:

1. **Task 1: Finalise README capability language and fixture paragraph** - `7b07590` (feat)
2. **Task 2: Push to GitHub and run fresh-install smoke test** - `8bafb71` (fix: plugin.json name)
3. **Task 3: Record smoke test evidence** - `dcd9267` (feat)

## Files Created/Modified
- `README.md` - Evidence-anchored capability language and prose sample blockquote
- `.claude-plugin/plugin.json` - Name field corrected from book-crafter-dev to book-crafter
- `evidence/smoke-test-log.md` - Full smoke test procedure, results, and issues encountered

## Decisions Made
- plugin.json name must use release identity (book-crafter) for marketplace resolution -- dev name (book-crafter-dev) causes install failure
- Marketplace add + plugin install documented as required two-step procedure in README

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] plugin.json name mismatch broke marketplace install**
- **Found during:** Task 2 (smoke test)
- **Issue:** plugin.json had "book-crafter-dev" (dev name) but marketplace install needs "book-crafter" (release name)
- **Fix:** Updated plugin.json name field to "book-crafter"
- **Files modified:** .claude-plugin/plugin.json
- **Verification:** Smoke test passed after fix
- **Committed in:** 8bafb71

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential fix for marketplace install to work. No scope creep.

## Issues Encountered
- Plugin initially failed to load due to name mismatch (resolved via deviation above)
- Marketplace add command only registers the source; explicit plugin install required to activate

## Known Stubs
None -- all evidence files contain real data from actual test execution.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- GATE-06 (smoke test) and GATE-07 (README language) both satisfied
- Ready for Plan 12-06 ship decision (GATE-08: David's explicit ship call)

---
*Phase: 12-re-run-release-gate*
*Completed: 2026-04-16*
