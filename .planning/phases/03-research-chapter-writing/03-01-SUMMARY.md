---
phase: 03-research-chapter-writing
plan: 01
subsystem: skills
tags: [researcher, scripture, word-studies, theological-research, skill-authoring]

# Dependency graph
requires:
  - phase: 02-voice-system-book-outliner
    provides: "Outliner output format, Book DNA template, voice profile spec, orchestrator Stage 1"
provides:
  - "Complete researcher SKILL.md with theological and general research modes"
  - "Orchestrator Stage 2 invocation logic for sequential per-chapter research"
  - "Structured research artefact format consumed by chapter-writer agents in Stage 3"
affects: [03-02, 04-editing, chapter-writer-agents]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Structured research artefact format (scripture refs, word studies, types/shadows, cross-references, illustrations)"
    - "Dual research mode detection (theological vs general) based on voice profile content"
    - "VERIFY marker pattern for uncertain scripture references"
    - "Momentum-based depth calibration (Foundation through Climax scaling)"

key-files:
  created: []
  modified:
    - skills/researcher/SKILL.md
    - skills/orchestrator/SKILL.md

key-decisions:
  - "Research runs sequentially (not parallel) because each chapter's research is Claude generating, not fetching from APIs"
  - "Research mode auto-detected from voice profile theological content, not user-specified"
  - "VERIFY markers on uncertain scripture rather than omitting references entirely"

patterns-established:
  - "Research artefact structure: Core Argument, Scripture References, Cross-References, Word Studies, Types and Shadows, Illustrations, Connections"
  - "General research artefact structure: Core Argument, Key Data Points, Expert Perspectives, Case Studies, Illustrations, Connections"
  - "Depth calibration by momentum position (Climax gets 3 primary passages, 2 word studies, 3 cross-references)"

requirements-completed: [RSRCH-01, RSRCH-02, RSRCH-03, RSRCH-04]

# Metrics
duration: 2min
completed: 2026-03-27
---

# Phase 3 Plan 01: Researcher Skill Summary

**Complete researcher skill with structured per-chapter artefacts (scripture, word studies, types/shadows) and orchestrator Stage 2 sequential invocation loop**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-27T19:32:52Z
- **Completed:** 2026-03-27T19:34:58Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Replaced researcher stub with full SKILL.md containing theological and general research modes
- Defined structured research artefact format that chapter-writer agents will consume in Stage 3
- Added scripture accuracy rules with VERIFY marker pattern for uncertain passages
- Implemented depth calibration scaling by chapter momentum position
- Added detailed Stage 2 orchestration notes with resume support for partial runs

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement complete researcher SKILL.md** - `3102eb9` (feat)
2. **Task 2: Update orchestrator Stage 2 with researcher invocation** - `c118b15` (feat)

## Files Created/Modified
- `skills/researcher/SKILL.md` - Full researcher skill: on invocation, theological mode, general mode, scripture accuracy rules, output rules, depth calibration
- `skills/orchestrator/SKILL.md` - Added Stage 2 sequential research loop with resume support, updated Step 3 description

## Decisions Made
- Research runs sequentially per chapter -- simpler than parallel and fast enough since Claude generates from knowledge, not external APIs
- Research mode detected automatically from voice profile content (presence of theological framework section), not user-configured
- Scripture accuracy uses VERIFY markers for uncertain passages rather than omitting references, giving the user a safety net
- Word count target for research artefacts set at 800-1500 words -- dense material for the writer to expand, not verbose prose

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Known Stubs
None - both files are fully implemented. The researcher SKILL.md contains no stub markers.

## Next Phase Readiness
- Researcher skill ready for orchestrator Stage 2 invocation
- Research artefact format defined for chapter-writer agents to consume in Plan 02 (writer skill)
- Orchestrator Stage 2 has complete invocation logic with resume support

---
*Phase: 03-research-chapter-writing*
*Completed: 2026-03-27*
