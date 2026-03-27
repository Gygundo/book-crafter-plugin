---
phase: 06-content-enhancements
plan: 01
subsystem: pipeline
tags: [sermon-adapter, spoken-to-written, pipeline-stages, orchestrator]

# Dependency graph
requires:
  - phase: 02-voice-and-outline
    provides: "Outliner Source Ingestion Mode that the adapted content feeds into"
  - phase: 04-editor-review
    provides: "Orchestrator pipeline with 5 stages that Stage 0.5 precedes"
provides:
  - "Sermon-adapter skill with 7 spoken-to-written transformation rules"
  - "Stage 0.5 conditional pipeline step wired into orchestrator"
  - "sources-adapted/ directory convention for adapted sermon content"
affects: [06-02-enricher, formatter]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Conditional pipeline stage (Stage 0.5) that runs only when sermon-format sources detected"
    - "sources-adapted/ directory as state marker for sermon adaptation completion"

key-files:
  created:
    - skills/sermon-adapter/SKILL.md
  modified:
    - skills/orchestrator/SKILL.md
    - references/pipeline-stages.md

key-decisions:
  - "Sermon adapter is a separate skill (not an outliner extension) for clean responsibility separation"
  - "3+ indicator threshold with user confirmation for sermon format detection"
  - "Stage 0.5 numbering convention (not Stage 0) to indicate conditional pre-pipeline step"

patterns-established:
  - "Conditional pipeline stages use X.5 numbering and only appear in dashboard when applicable"
  - "Pre-pipeline transformation writes to a parallel directory (sources-adapted/) rather than modifying originals"

requirements-completed: [ENH-01, ENH-02]

# Metrics
duration: 4min
completed: 2026-03-27
---

# Phase 06 Plan 01: Sermon Adapter Summary

**Sermon-adapter skill with 7 spoken-to-written transformation rules (fragment completion, audience de-personalisation, verbal cue replacement, repetition consolidation, structural de-numbering, scripture re-integration, emphasis normalisation) wired into orchestrator as conditional Stage 0.5**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-27T22:02:00Z
- **Completed:** 2026-03-27T22:06:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Created sermon-adapter skill (273 lines) with 7 transformation rules, each with concrete before/after examples
- Wired Stage 0.5 into orchestrator pipeline overview, state detection, dashboard, and stage execution
- Documented Stage 0.5 in pipeline-stages.md with completion detection criteria

## Task Commits

Each task was committed atomically:

1. **Task 1: Create sermon-adapter skill** - `7add618` (feat)
2. **Task 2: Wire Stage 0.5 into orchestrator and pipeline-stages.md** - `f5eac86` (feat)

## Files Created/Modified
- `skills/sermon-adapter/SKILL.md` - New skill with 7 transformation rules, detection heuristics, processing workflow, anti-patterns, edge cases
- `skills/orchestrator/SKILL.md` - Stage 0.5 in pipeline diagram, sermon detection in Section 2, state detection check 7.5, dashboard line, Stage 0.5 execution subsection, sources-adapted override for outliner, skill path in Section 8
- `references/pipeline-stages.md` - Stage 0.5 documentation section and completion detection table row

## Decisions Made
- Sermon adapter is a separate skill rather than an extension of the outliner, keeping responsibilities clean and letting the orchestrator control when sermon adaptation happens
- 3+ sermon indicator threshold with user confirmation before running adaptation (balances auto-detection with user control)
- Stage 0.5 numbering indicates a conditional pre-pipeline step, consistent with the research recommendation

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Sermon adapter skill ready for invocation by orchestrator when sermon-format sources detected
- Stage 0.5 state detection enables resume logic for interrupted sermon adaptation
- Ready for Plan 02 (enricher skill with discussion questions, summaries, prayer points, foreword)

---
*Phase: 06-content-enhancements*
*Completed: 2026-03-27*
