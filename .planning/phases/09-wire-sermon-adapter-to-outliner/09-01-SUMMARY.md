---
phase: 09-wire-sermon-adapter-to-outliner
plan: 01
subsystem: skills
tags: [outliner, sermon-adapter, source-ingestion, pipeline-wiring]

# Dependency graph
requires:
  - phase: 06-sermon-adapter
    provides: "sermon adapter writes transformed content to sources-adapted/"
provides:
  - "Outliner prefers sources-adapted/ over sources/ when adapted content exists"
  - "Fallback to sources/ for non-sermon source ingestion unchanged"
  - "Sermon-to-book pipeline wired end-to-end (adapter → outliner)"
affects: [orchestrator, writer, researcher]

# Tech tracking
tech-stack:
  added: []
  patterns: ["three-step source directory resolution: adapted → raw → topic brief"]

key-files:
  created: []
  modified:
    - "skills/outliner/SKILL.md"

key-decisions:
  - "Three-step priority chain (sources-adapted/ → sources/ → Topic Brief) rather than flag-based switching"
  - "Added guidance for outliner to skip spoken-to-written transforms when reading adapted content"

patterns-established:
  - "Source directory resolution: skills that read source content should check sources-adapted/ first, then sources/"

requirements-completed: [OUTL-06, ENH-01, ENH-02]

# Metrics
duration: 3min
completed: 2026-03-28
---

# Phase 9: Wire Sermon Adapter to Outliner Summary

**Outliner now prefers sources-adapted/ over sources/ with three-step priority resolution, closing the last integration gap in the sermon-to-book pipeline**

## Performance

- **Duration:** 3 min
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Outliner Section 2 uses three-step priority: sources-adapted/ → sources/ → Topic Brief Mode
- Outliner Section 4 Step 1 reads from whichever directory Section 2 resolved (no more hardcoded sources/)
- Added guidance to skip spoken-to-written transforms when reading already-adapted content
- All `sources/` references verified — every mention is paired with adapted fallback logic

## Task Commits

1. **Task 1: Update outliner SKILL.md — source directory resolution** - `8a87901` (feat)

## Files Created/Modified
- `skills/outliner/SKILL.md` - Three-step source directory resolution in Section 2, dynamic source reading in Section 4

## Decisions Made
- Used a numbered priority chain (1. adapted, 2. raw, 3. topic brief) for clarity over conditional nesting
- Added explicit "do not apply spoken-to-written transformations" guidance for adapted content to prevent double-processing

## Deviations from Plan
None - plan executed exactly as written

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Sermon-to-book pipeline is now wired end-to-end: sermon adapter → sources-adapted/ → outliner
- Non-sermon workflows (direct sources/ usage) continue unchanged
- Ready for milestone audit or further pipeline testing

---
*Phase: 09-wire-sermon-adapter-to-outliner*
*Completed: 2026-03-28*
