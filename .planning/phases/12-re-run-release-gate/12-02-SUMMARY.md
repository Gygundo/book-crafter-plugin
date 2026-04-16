---
phase: 12-re-run-release-gate
plan: 02
subsystem: testing
tags: [evidence, pipeline-validation, ch1-comparison]

# Dependency graph
requires:
  - phase: 12-re-run-release-gate plan 01
    provides: baseline Ch1 evidence (before file)
provides:
  - evidence/eternally-secure-ch1-after.md (v1.1 pipeline output for Ch1)
affects: [12-03 seven-gap comparison, 12-04 rubric scoring]

# Tech tracking
tech-stack:
  added: []
  patterns: [byte-identical evidence capture from external pipeline output]

key-files:
  created:
    - evidence/eternally-secure-ch1-after.md
  modified: []

key-decisions:
  - "Version stamp deviation accepted: pipeline does not emit generated-by comment; evidence validity confirmed by content diff instead"

patterns-established:
  - "Evidence capture: byte-identical copy, no modifications, diff against baseline"

requirements-completed: [GATE-02]

# Metrics
duration: 3min
completed: 2026-04-16
---

# Phase 12 Plan 02: Re-run and Capture Evidence Summary

**Captured v1.1 post-run Ch1 (141 lines, 2205 words) as evidence -- substantially different from v1.0 baseline (77 lines, 2089 words), confirming pipeline rules produced new output**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-16T20:58:45Z
- **Completed:** 2026-04-16T21:01:39Z
- **Tasks:** 2 (1 human-action, 1 auto)
- **Files modified:** 1

## Accomplishments
- Full pipeline re-run completed by David in --fresh mode (research, write, edit, enrich, format)
- Post-run Ch1 captured as byte-identical copy in evidence/eternally-secure-ch1-after.md
- Before/after diff confirmed: files differ substantially (77 vs 141 lines, different structure, different prose)

## Task Commits

Each task was committed atomically:

1. **Task 1: Run the Eternally Secure pipeline in --fresh mode** - (human action, no commit)
2. **Task 2: Capture the post-run Ch1 as evidence** - `74e2d62` (feat)

**Plan metadata:** (pending)

## Files Created/Modified
- `evidence/eternally-secure-ch1-after.md` - Post-run Ch1 from v1.1 pipeline, byte-identical copy of edited/ch01-final.md

## Decisions Made
- Version stamp (`<!-- generated-by: book-crafter v1.1.0 -->`) not present in pipeline output; accepted as deviation since content diff provides stronger evidence of v1.1 rules being active than a comment stamp would

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Missing version stamp in pipeline output**
- **Found during:** Task 2 (evidence capture verification)
- **Issue:** Plan expected `<!-- generated-by: book-crafter v1.1.0 -->` in ch01-final.md but the pipeline does not emit this comment
- **Fix:** Accepted deviation; evidence validity confirmed via content diff (141 vs 77 lines, completely different prose) rather than comment stamp
- **Files modified:** none
- **Verification:** `diff -q` confirms files differ; line count and content review confirm v1.1 rules active (pull quotes, momentum metadata, captivation score present in after file)

---

**Total deviations:** 1 (missing version stamp -- pipeline design, not a bug)
**Impact on plan:** Minimal. The core evidence requirement (different Ch1 from v1.1 rules) is satisfied. The stamp was aspirational metadata.

## Issues Encountered
None beyond the version stamp deviation documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Before and after evidence files both committed; ready for Plan 03 (seven-gap comparison)
- Plan 03 can diff the two files to score improvement across the seven quality gaps

---
*Phase: 12-re-run-release-gate*
*Completed: 2026-04-16*
