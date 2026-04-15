---
phase: 10-writing-quality-v2
plan: 09
subsystem: editor + orchestrator
tags: [craft-16, craft-17, diagnostic, revision-cap, divergent-improvement]
requires:
  - 10-04 (editor Pass 1 craft_check block)
  - 10-05 (editor Pass 2 craft_pass2 block)
  - 10-06 (extended 7-component captivation rubric)
  - 10-01 (scripts/craft-check.js)
provides:
  - editor-pass3-bestseller-diagnostic-assembly
  - orchestrator-2-revision-cap
  - orchestrator-divergent-improvement-detection
  - reports/revision-log.md (state file)
affects:
  - skills/editor/SKILL.md
  - skills/orchestrator/SKILL.md
tech-stack:
  added: []
  patterns:
    - per-chapter revision state file (revision-log.md, append-only)
    - strict sub-component regression detection (any delta < 0 trips it)
    - flag-only assembly step that re-invokes deterministic checker
key-files:
  created:
    - .planning/phases/10-writing-quality-v2/10-09-SUMMARY.md
  modified:
    - skills/editor/SKILL.md (+58 lines, §4.6 + template entry)
    - skills/orchestrator/SKILL.md (+88 lines, Revision Cap subsection in Stage 4)
decisions:
  - Bestseller Diagnostic is a read-only assembly — does not trigger new revisions
  - Strict divergent detection on ANY sub-component drop, not just total
  - Cap exhaustion tie-break order: captivation_total → fewest craft failures → earliest revision_n
  - Per-chapter revision state stored in reports/revision-log.md (survives Resume, cleared by Fresh)
  - Diagnostic section ordering in consistency-report.md: Cross-Chapter → Bestseller Diagnostic → Unresolved Issues
metrics:
  duration: 6min
  completed: 2026-04-15
---

# Phase 10 Plan 09: Bestseller Diagnostic + Revision Cap Summary

Wires the CRAFT-16 per-chapter bestseller diagnostic into editor Pass 3 §4.6 and the CRAFT-17 hard 2-revision cap with divergent-improvement detection into the orchestrator's Stage 4 chapter revision loop, closing Phase 10.

## What Shipped

### Task 1 — Editor §4.6 Bestseller Diagnostic Assembly (CRAFT-16)

Added a new sub-section §4.6 to `skills/editor/SKILL.md` at the end of Pass 3 (after §4.5 Pass 3 Output, before §5 Rolling Window). It defines a six-step assembly process the editor runs once Pass 3 cross-chapter validation finishes:

1. Re-invoke `scripts/craft-check.js` against each `edited/ch[NN]-final.md`.
2. Read the `craft_pass2:` judgment block from each chapter's `<!-- VOICE AUDIT -->` metadata.
3. Merge deterministic + judgment results into a unified PASS / FAIL / FLAG / SKIP status set.
4. Append a `## Bestseller Diagnostic` section to `reports/consistency-report.md` containing one sub-section per chapter with the locked column shape `Check | Pass/Fail | Evidence | Line` covering CRAFT-01..08 plus CRAFT-15.
5. Append a `### Revision Cap Notes` block listing chapters that hit the orchestrator's 2-revision cap or tripped divergent-improvement.
6. No auto-revise — assembly is purely read-only.

The §4.5 consistency-report template was updated to advertise `## Bestseller Diagnostic` between `## Cross-Chapter Consistency` and `## Unresolved Issues`.

### Task 2 — Orchestrator Revision Cap + Divergent Detection (CRAFT-17)

Added a new `##### Revision Cap and Divergent-Improvement Detection (CRAFT-17)` subsection inside Stage 4 of `skills/orchestrator/SKILL.md`, immediately after the Option 3 (Read full draft) block and before Stage 4.5 Content Enrichment. It defines:

- **Per-chapter revision state file** at `reports/revision-log.md` recording `revision_count`, `revision_history` (revision_n, captivation_total, the 7 component_scores, craft_check_failures, source_file), `status` (capped|converged|divergent|accepted), and `final_revision`.
- **Hard cap** — `revision_count` never exceeds 2; explicit user requests for a third revision are refused with a fixed message.
- **Strict divergent-improvement detection** — after each revision N ≥ 1, compares all 7 captivation components against revision N-1; ANY single component delta < 0 trips it, rolls back to N-1, sets `status: divergent`, and appends a flag for §4.6 to render.
- **Cap exhaustion handling** — picks the highest `captivation_total` revision (ties broken by fewest craft failures, then earliest revision_n), restores it as the final, sets `status: capped`, appends a flag, and continues the pipeline (no halt).
- **Auto-revise trigger integration** — editor's revision requests (`revisions/ch[NN]-request.md`) feed into the same loop and increment `revision_count`; flag-only checks (CRAFT-03/04/06/07/08) are explicitly excluded.
- **State persistence** — `revision-log.md` survives Resume (Mode 3) and is cleared by Fresh (Mode 6) via the existing CRAFT-14 delete list.

## Verification

Acceptance criteria (all green):

Task 1:
- `grep -q "4.6 Bestseller Diagnostic Assembly" skills/editor/SKILL.md` → PASS
- `grep -c "Bestseller Diagnostic" skills/editor/SKILL.md` → 4 (≥ 2)
- `grep -q "Check | Pass/Fail | Evidence | Line" skills/editor/SKILL.md` → PASS
- `grep -q "CRAFT-01" && grep -q "CRAFT-08" skills/editor/SKILL.md` → PASS
- `grep -q "2-revision cap\|revision cap" skills/editor/SKILL.md` → PASS
- `grep -q "craft-check.js" skills/editor/SKILL.md` → PASS

Task 2:
- `grep -q "Revision Cap and Divergent-Improvement Detection" skills/orchestrator/SKILL.md` → PASS
- `grep -c "revision_count" skills/orchestrator/SKILL.md` → 8 (≥ 2)
- `grep -q "divergent improvement\|divergent-improvement" skills/orchestrator/SKILL.md` → PASS
- `grep -q "component_scores" skills/orchestrator/SKILL.md` → PASS
- `grep -q "2-revision cap\|revision_count == 2\|never exceed 2" skills/orchestrator/SKILL.md` → PASS
- `grep -q "highest-scoring\|highest_captivation" skills/orchestrator/SKILL.md` → PASS

No regressions: editor `craft_pass2` / `craft-check.js` / `VOICE AUDIT` references intact (29 hits across passes 1-3).

## Deviations from Plan

None — both tasks executed exactly as written.

## Decisions Made

- **Diagnostic is read-only.** §4.6 explicitly does NOT trigger new revisions even when it detects hard-gate FAILs. The 2-revision cap is enforced upstream by the orchestrator, so §4.6's job is purely surfacing results to the Stage 4 review gate. This prevents the assembly step from secretly extending the revision loop past the cap.
- **Strict divergent detection.** The plan said "lower on ANY sub-metric"; the implementation makes that ANY single component delta < 0 trips rollback. This matches D-09 + Pitfall 4 — the failure signature is "total went up but one dimension regressed", so even a 1-point dip in (say) Cross-Chapter Craft will roll back even if Pacing Variety jumped 2 points.
- **Tie-break order on cap exhaustion.** Highest `captivation_total` first, then lowest `craft_check_failures` length, then lowest `revision_n` (earliest wins). The earliest-wins tiebreaker prefers the original draft when scores are identical, on the theory that less churn = less drift.
- **State file location.** `reports/revision-log.md` (not `consistency-report.md`) because the revision log is append-only and grows across revisions; mixing it into the consistency report would make the report non-deterministic. The diagnostic flags get rendered into `consistency-report.md` by §4.6 — only the persistent state lives in the separate log.
- **Refusal message for 3rd revision.** Fixed message points users to manual edit or Mode 6 (Fresh). Avoids silently dropping the request and avoids prompting for confirmation (which would create a new state machine).

## Phase 10 Status

This plan closes Phase 10. All 17 CRAFT requirements are now implemented:

- CRAFT-01..08 enforcement: Plans 10-01 (script), 10-02 (rules ref), 10-04 (Pass 1), 10-05 (Pass 2)
- CRAFT-09 rubric extraction: Plan 10-01
- CRAFT-10 rubric extension: Plan 10-06
- CRAFT-11 craft rules ref: Plan 10-02
- CRAFT-12 calibration: Plan 10-06
- CRAFT-13 subtractive audit: Plan 10-07
- CRAFT-14 fresh mode: Plan 10-08
- CRAFT-15 version stamps: Plan 10-08
- CRAFT-16 diagnostic report: Plan 10-09 (this plan)
- CRAFT-17 revision cap + divergent detection: Plan 10-09 (this plan)

Phase 10 is ready for verification. Phase 11 (Distribution Packaging) can begin.

## Self-Check: PASSED

- File `skills/editor/SKILL.md` modified — verified
- File `skills/orchestrator/SKILL.md` modified — verified
- Commit `bd707db` (Task 1) — present in `git log`
- Commit `fdac7a9` (Task 2) — present in `git log`
- All acceptance criteria for both tasks pass
