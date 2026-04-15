---
phase: 10-writing-quality-v2
plan: 05
subsystem: editor
tags: [editor, pass-2, craft-rules, llm-judgment]
requires:
  - skills/editor/SKILL.md (Plan 10-04 Pass 1 craft_check integration)
  - references/bestseller-craft-rules.md (Plan 10-02)
  - references/captivation-rubric.md (Plan 10-01)
  - 10-CONTEXT.md § D-04, D-07, D-11, D-12, D-16
provides:
  - editor/pass-2/scene-first-strictness
  - editor/pass-2/central-image-audit
  - editor/pass-2/vulnerability-beat-audit
  - editor/pass-2/reader-moment-audit
  - voice-audit/craft_pass2 block
affects:
  - skills/editor/SKILL.md
tech-stack:
  added: []
  patterns:
    - flag-only vs auto-revise policy per D-06/D-07
    - word-count-based zone definition (opening/middle/closing)
    - craft_pass2 VOICE AUDIT aggregation for CRAFT-16 reuse
key-files:
  created: []
  modified:
    - skills/editor/SKILL.md
decisions:
  - Scene-first strictness sits inside §3.3 (Opening Engagement) rather than a new section to keep rubric + CRAFT-01 quality judgment co-located
  - §3.7 middle-third zone uses word-count math (floor(total/3) .. floor(2*total/3)) so §3.8 can reuse the same definition without re-deriving
  - craft_pass2 block emitted in §3.6 (Pass 2 Output) so Plan 10-09 CRAFT-16 diagnostic reads both craft_check (Pass 1) and craft_pass2 (Pass 2) from one VOICE AUDIT location
  - Vulnerability beat failure mode kept flag-only even for `fabricated` because auto-revise on judgment loops back to fabrication (Pitfall 5)
  - Reader Moment audit reads writer's METADATA `reader_moments_used` field rather than re-deriving moments from chapter text
metrics:
  duration: 3min
  completed: 2026-04-15
  tasks: 1
  files: 1
requirements: [CRAFT-01, CRAFT-03, CRAFT-04, CRAFT-06]
---

# Phase 10 Plan 05: Editor Pass 2 Scene-First + Cross-Chapter Audits Summary

**One-liner:** Editor Pass 2 gains CRAFT-01 scene quality judgment plus flag-only audits for central image (CRAFT-03), vulnerability beat authenticity (CRAFT-04), and reader moments (CRAFT-06), all emitting a `craft_pass2` VOICE AUDIT block for the CRAFT-16 diagnostic.

## What Was Built

### Scene-First Strictness (extends §3.3)
Appended a new block to the existing Opening Engagement sub-section. Pass 1's `craft-check.js` only verifies provenance comment presence/resolution; this Pass 2 block performs LLM judgment on the first 150 words of each chapter, requiring (1) a proper-noun human or first-person narrator, (2) a time-marker phrase, and (3) a sensory/physical detail. Missing elements trigger an opener-only auto-revise per D-06, preserving the rest of the chapter and respecting the 2-revision cap from CRAFT-17.

### §3.7 Central Image Audit (CRAFT-03)
Reads `central_image` from outline/Book DNA, locates three zones (opening 200 words, middle third computed by word count, closing 200 words), and confirms the image appears in all three — allowing register shifts (literal → metaphor → echo). Flag-only, never auto-revise, per D-07 and Pitfall 4.

### §3.8 Vulnerability Beat Audit (CRAFT-04)
Reads `vulnerability_beat_seed` from outline/Book DNA. Three-way branch: `skipped_no_seed`, `seed_unresolved` (path:line does not resolve), or locate a first-person vulnerability beat in the middle third and confirm it traces to the seed. Failure modes: `missing`, `fabricated`, `seed_unresolved`. All flag-only — fabricated beats are the most serious but still not auto-revised because auto-revise on fabrication loops back to fabrication (Pitfall 5).

### §3.9 Reader Moment Audit (CRAFT-06)
Reads the voice profile's `Reader Moments` section. If absent, skips with `skipped_no_section` (D-16 honours custom profiles). If present, validates the writer's `reader_moments_used` metadata field: ≥2 claimed, each claimed moment appears in chapter text, each claimed moment exists in the voice profile's list. Flag-only with specific failure variants (`count: N < 2`, `missing: [...]`, `unlisted: [...]`).

### §3.6 Extension: `craft_pass2` VOICE AUDIT block
Pass 2 now appends a `craft_pass2` block to each chapter's VOICE AUDIT, aggregating scene-first strictness + §3.7/§3.8/§3.9 results. Plan 10-09 (CRAFT-16 diagnostic) will read both `craft_check` (Pass 1) and `craft_pass2` (Pass 2) from the same VOICE AUDIT to build the per-chapter Bestseller Diagnostic matrix.

## Acceptance Criteria — Verification

| Check | Result |
|---|---|
| `grep -q "Scene-First Strictness" skills/editor/SKILL.md` | pass |
| `grep -q "3.7 Central Image Audit" skills/editor/SKILL.md` | pass |
| `grep -q "3.8 Vulnerability Beat Audit" skills/editor/SKILL.md` | pass |
| `grep -q "3.9 Reader Moment Audit" skills/editor/SKILL.md` | pass |
| `grep -q "vulnerability_beat_seed" skills/editor/SKILL.md` | pass |
| `grep -q "middle third" skills/editor/SKILL.md` | pass |
| `grep -q "craft_pass2:" skills/editor/SKILL.md` | pass |
| `grep -qE "skipped_no_seed|seed_unresolved"` | pass |
| `grep -c "captivation-rubric.md"` ≥ 5 | 6 (pass) |

## Deviations from Plan

None — plan executed exactly as written.

## Commits

- `a1184bf` feat(10-05): extend editor Pass 2 with CRAFT-01/03/04/06 audits

## Cross-References

- Pass 1 CRAFT integration lives in Plan 10-04 summary — reuses §2.8 VOICE AUDIT block pattern
- CRAFT-16 diagnostic consumer lives in Plan 10-09 (not yet built) — will read `craft_check` + `craft_pass2`
- `vulnerability_beat_seed` and `central_image` outline fields are written by Plan 10-03 outliner update
- Writer's `reader_moments_used` metadata field is written by Plan 10-03 writer update

## Known Stubs

None. All four audit sub-sections have fully specified procedures and failure modes. Downstream consumers (CRAFT-16 diagnostic in Plan 10-09) are the only remaining integration point and are explicitly scoped to future plans.

## Self-Check: PASSED

- skills/editor/SKILL.md exists
- .planning/phases/10-writing-quality-v2/10-05-SUMMARY.md exists
- Commit a1184bf exists in git log
