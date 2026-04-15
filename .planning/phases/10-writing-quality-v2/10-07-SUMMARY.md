---
phase: 10-writing-quality-v2
plan: 07
subsystem: voice-profile
tags: [craft-13, craft-06, reader-moments, subtractive-audit]
requires: [10-02]
provides:
  - "spiritual-default.md Reader Moments section (CRAFT-06 enabler)"
  - "voice-profile-spec.md Section 8 documentation"
  - "voice-builder Reader Moments generation step"
  - "Populated kill list in 10-CONTEXT.md"
affects:
  - "CRAFT-06 editor check (consumes Reader Moments)"
  - "Writer scene selection (reads Reader Moments from Book DNA)"
tech-stack:
  added: []
  patterns:
    - "Subtractive audit — every v2 addition paired with a documented v1 removal"
    - "Byte-preserved Theological Framework (sha256 lock)"
key-files:
  created: []
  modified:
    - "references/voice-profiles/spiritual-default.md"
    - "references/voice-profiles/voice-profile-spec.md"
    - "skills/voice-builder/SKILL.md"
    - ".planning/phases/10-writing-quality-v2/10-CONTEXT.md"
decisions:
  - "spiritual-default.md net line delta: -4 (123 -> 119) — under 150-line cap"
  - "Theological Framework sha256 verified byte-identical: 6762388c6cbc4a11ef5d560db3f7a2ff2bb9987c89db0b752f2d47b536adad5d"
  - "13 reader-moments across 4 mood categories (Anxiety, Grief, Doubt, Joy) — buffer above the 12-moment minimum"
  - "voice-profile-spec.md lives at references/voice-profiles/voice-profile-spec.md, not references/ root (plan path corrected per Rule 3)"
  - "voice-builder emits partial-corpus HTML comment marker when <8 moments extracted, enabling CRAFT-06 flag-only mode downstream"
metrics:
  duration_minutes: 4
  completed_date: "2026-04-15"
  tasks: 2
  files_modified: 4
---

# Phase 10 Plan 07: Subtractive Voice Profile Audit + Reader Moments Summary

Added a Reader Moments section (13 concrete scenes, 4 moods) to spiritual-default.md to enable CRAFT-06, removed overlapping Vocabulary/Emphasis/Calibration content to keep the profile under the 150-line cap with a net -4 line delta, preserved the Theological Framework byte-for-byte, and wired the new section into voice-profile-spec.md and voice-builder SKILL.md with documented flag-only fallback behaviour.

## What Shipped

### Task 1 — Subtractive audit of spiritual-default.md

- **Added:** `## Reader Moments` section with an intro pointing to CRAFT-06, plus four mood subsections (`### Anxiety`, `### Grief`, `### Doubt`, `### Joy`) containing 13 concrete reader-life moments.
- **Removed (paired with additions):**
  - Vocabulary > Avoid duplicates already enumerated in Anti-Patterns (Lecture-tone blocked phrases expanded inline to absorb them).
  - Calibration Examples Example 2 body (Greek word study narrative).
  - Calibration Examples Example 3 body (direct reader engagement paragraph).
  - Calibration Examples "What These Examples Show" summary block.
  - Emphasis Techniques bullets duplicating Sentence Patterns (intensity building, closing declarations).
- **Kill list:** 5 paired entries committed inline in `.planning/phases/10-writing-quality-v2/10-CONTEXT.md`.
- **Cap check:** 119 / 150 lines.
- **Theological Framework integrity:** sha256 `6762388c6cbc4a11ef5d560db3f7a2ff2bb9987c89db0b752f2d47b536adad5d` unchanged from baseline (verified pre- and post-edit).
- **Commit:** `5be1b12`

### Task 2 — Spec + voice-builder integration

- **voice-profile-spec.md §8:** New "Reader Moments (recommended, optional for custom profiles)" section defining schema (≥12 moments, ≥3 moods), structure (`## Reader Moments` + `### [Mood]` subheadings), recommendation targets, and flag-only fallback behaviour when absent.
- **skills/voice-builder/SKILL.md:** New Pass 2 synthesis step generating a Reader Moments section from corpus analysis, with two fallback paths:
  - **Partial corpus (<8 moments):** Emit section with `<!-- reader_moments_partial: only N moments extracted from corpus; editor runs CRAFT-06 in flag-only mode -->` marker.
  - **No corpus (<3 moments):** Omit the section entirely; editor auto-detects absence and runs CRAFT-06 in flag-only mode per spec §8.
- **Commit:** `cf82d3c`

## Acceptance Criteria — Verification

| Criterion | Result |
|-----------|--------|
| `wc -l < references/voice-profiles/spiritual-default.md` ≤ 150 | 119 ✓ |
| `grep -c "^## Reader Moments"` = 1 | 1 ✓ |
| `grep -cE "^- "` ≥ 12 | 64 ✓ |
| `grep -c "^### "` ≥ 3 | 6 (incl. 4 mood subsections) ✓ |
| Theological Framework sha256 unchanged | ✓ (6762388c...) |
| Kill list rows ≥ 3 (`grep -c "^| [0-9] |"`) | 5 ✓ |
| spec mentions Reader Moments + recommended/optional | ✓ |
| voice-builder mentions Reader Moments + flag-only/partial | ✓ |

## Deviations from Plan

### [Rule 3 — Blocking] Corrected voice-profile-spec.md path

- **Found during:** Task 2 read-first step
- **Issue:** Plan references `references/voice-profile-spec.md`, but the actual file ships at `references/voice-profiles/voice-profile-spec.md` (inside the voice-profiles directory alongside the profiles it validates). The path in the plan would have created a new orphan file instead of updating the live spec.
- **Fix:** Edited the actual file at `references/voice-profiles/voice-profile-spec.md`. Documented the path correction in the Task 2 commit message so future plans reading this SUMMARY will see the canonical location.
- **Commit:** `cf82d3c`

No other deviations. Plan executed as written.

## Known Stubs

None. All additions are functional and wired into downstream consumers (editor CRAFT-06 check per Plan 2's `references/bestseller-craft-rules.md` § CRAFT-06, writer scene-selection step).

## Self-Check: PASSED

- File `references/voice-profiles/spiritual-default.md` — FOUND (119 lines)
- File `references/voice-profiles/voice-profile-spec.md` — FOUND (Section 8 present)
- File `skills/voice-builder/SKILL.md` — FOUND (Reader Moments step present)
- File `.planning/phases/10-writing-quality-v2/10-CONTEXT.md` — FOUND (5 kill list rows)
- Commit `5be1b12` — FOUND (Task 1)
- Commit `cf82d3c` — FOUND (Task 2)
- Theological Framework sha256 — MATCHES baseline
