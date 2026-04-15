---
phase: 10-writing-quality-v2
plan: 04
subsystem: editor
tags: [editor, craft-check, pass1, craft-01, craft-02, craft-05, craft-07, craft-08, craft-15]
requirements: [CRAFT-01, CRAFT-02, CRAFT-05, CRAFT-07, CRAFT-08, CRAFT-15]
dependency-graph:
  requires:
    - 10-01 (scripts/craft-check.js)
    - 10-02 (references/bestseller-craft-rules.md)
    - 10-03 (writer/outliner central_image + vulnerability_beat_seed contract)
  provides:
    - "Editor Pass 1 deterministic + LLM hybrid craft enforcement (§2.0, §2.9-2.12)"
    - "VOICE AUDIT craft_check field consumed by Pass 2 and CRAFT-16 diagnostic step"
    - "Revision request contract at revisions/ch[NN]-request.md for Plan 10-09 orchestrator wiring"
  affects:
    - 10-05 (Pass 2 reads craft_check from VOICE AUDIT)
    - 10-06 (CRAFT-16 diagnostic reuses craft_check without re-invoking script)
    - 10-08 (version stamp wiring lands in §2.8 — coexists with craft_check field added here)
    - 10-09 (CRAFT-17 2-revision cap consumes revisions/ch[NN]-request.md)
tech-stack:
  added: []
  patterns:
    - "Hybrid deterministic + LLM enforcement: bash script at Pass 1 entry, LLM sub-sections for judgment-only rules"
    - "JSON-merge pattern: craft-check.js output merged into VOICE AUDIT craft_check field, consumed downstream without re-invocation"
    - "Permitted-usage whitelist override: LLM §2.10 can convert craft-check.js CRAFT-05 fails to passes when whitelist matches"
key-files:
  created: []
  modified:
    - skills/editor/SKILL.md (+119 / -2 lines)
decisions:
  - "§2.0 slots BEFORE §2.1 as first Pass 1 step; existing §2.1-§2.8 numbering preserved (additive only)"
  - "Severity scale extended: any unoverridden CRAFT-01/02/05 fail maps to 'significant' so it shows up in consistency-report aggregation"
  - "Revision requests written to revisions/ch[NN]-request.md rather than inline in VOICE AUDIT — Plan 10-09 orchestrator picks them up; editor stays stateless about the 2-revision cap"
  - "CRAFT-15 auto-fix (stamp prepend) does NOT round-trip to writer — editor fixes in-place per D-06 (stamp is not a content defect)"
  - "§2.11 candidate insertion points are Pass 1 annotations only; actual insertion is deferred to Pass 2 rewrite windows to avoid Pass 1 body edits"
metrics:
  duration: ~6 min
  completed: 2026-04-15
---

# Phase 10 Plan 04: Editor Pass 1 Craft-Check Wiring Summary

Wired `scripts/craft-check.js` as the first step of editor Pass 1 and added four LLM judgment sub-sections (craft density, pulpit seam override, tension-release, show-don't-tell) so deterministic hard gates and judgment-only flags share a single `craft_check` field in the VOICE AUDIT block.

## What Was Built

- **§2.0 Craft Check Invocation** — first step of Pass 1. Calls `node ${CLAUDE_PLUGIN_ROOT}/scripts/craft-check.js`, parses JSON, merges every check into the chapter VOICE AUDIT `craft_check` field. Enforcement table wires D-06/D-07 policy: CRAFT-01/02/05 auto-revise, CRAFT-07 flag-only, CRAFT-15 auto-fix in place. Revision requests flow to `revisions/ch[NN]-request.md` for Plan 10-09's CRAFT-17 orchestrator to route.
- **§2.9 Craft Density Check (CRAFT-02 unpacking adequacy)** — LLM judgment on whether the 3 sentences after a transliterated term actually unpack it (meaning, etymology, concrete illustration) or just rephrase surrounding abstraction. Flag-only; updates `craft_check.CRAFT-02` with inline nuance.
- **§2.10 Pulpit Seam Detection (CRAFT-05 override pass)** — LLM reviews each craft-check.js CRAFT-05 fail against the 5 permitted-usage whitelist cases (dialogue, blockquote, citation, titled section, second-person remembered scene) and either overrides to pass or confirms fail. Overrides cancel the queued auto-revise.
- **§2.11 Tension-Release Enforcement (CRAFT-07)** — flag-only LLM pass on top of craft-check.js's regex count. Optional candidate-insertion-point annotation for Pass 2 consumption.
- **§2.12 Show-Don't-Tell Audit (CRAFT-08)** — pure LLM sliding 4-paragraph window scoring concrete:abstract noun ratio with hint lexicons pulled verbatim from bestseller-craft-rules.md. Flag-only.
- **§2.8 VOICE AUDIT block** — extended with a `craft_check:` sub-block showing the five deterministic checks plus CRAFT-08 from §2.12. Severity scale clause added so unoverridden hard-gate fails promote a chapter to 'significant'.

## Key Files Modified

- `skills/editor/SKILL.md` — +119 / -2 lines. Additive only; §2.1-§2.8 numbering and content preserved so Plan 10-05 (Pass 2), Plan 10-06 (CRAFT-16), and Plan 10-08 (version stamp at §2.8) can still land cleanly.

## Verification

**Automated acceptance checks (all pass):**

| Check | Result |
|---|---|
| `grep -q "2.0 Craft Check Invocation"` | PASS |
| `grep -q "2.9 Craft Density"` | PASS |
| `grep -q "2.10 Pulpit Seam"` | PASS |
| `grep -q "2.11 Tension-Release"` | PASS |
| `grep -q "2.12 Show-Don't-Tell"` | PASS |
| `grep -c "craft-check.js"` ≥3 | 6 |
| `grep -c "bestseller-craft-rules.md"` ≥4 | 7 |
| `grep -q "craft_check:"` | PASS |
| permitted-usage whitelist present | PASS |
| `grep -c "captivation-rubric.md"` ≥5 | 6 |

**Plan 10-01 infrastructure regression check:**

- `node scripts/craft-check.js fixtures/phase10/known-bad/ch01-pulpit.md` still emits `CRAFT-05: pass: false` with `"para 4: \"So let\""` citation. Script behaviour unaffected by editor skill edits.

**Line-count delta:** 441 → 557 (+116 lines; within planned 80-120 window).

## Deviations from Plan

None — plan executed exactly as written. All six action items in Task 1 landed without scope changes or deviation-rule invocations.

The Plan 10-08 regression guard (`grep -q "generated-by: book-crafter"`) was noted as an acceptance criterion but Plan 10-08 has not yet executed, so the string is legitimately absent at this time. The §2.8 insertion point was left intact (craft_check field added inside the existing VOICE AUDIT example rather than restructuring §2.8), so Plan 10-08 will be able to add its version-stamp instruction without collision.

## Decisions Made

- **Revision request file vs inline VOICE AUDIT** — chose `revisions/ch[NN]-request.md` so the orchestrator (Plan 10-09) can route and cap revisions without the editor having to track state across Pass 1 invocations. Keeps editor stateless; matches Plan 10-09 CRAFT-17 wiring direction.
- **CRAFT-15 auto-fix in place** — per D-06, stamp is metadata not content; round-tripping through the writer would waste a revision slot against the CRAFT-17 2-revision cap. Editor prepends the stamp and continues.
- **§2.11 candidate insertion points deferred to Pass 2** — prevents Pass 1 from editing body text, preserving the skill's Pass-1=voice / Pass-2=flow separation.
- **Severity scale extension** — unoverridden auto-revise-class fails promote to 'significant' so the consistency report surfaces them alongside existing voice flags without a new dimension.

## Known Stubs

None. No placeholder data, no TODO markers, no unwired references. `revisions/` directory does not need to exist yet — Plan 10-09 creates it.

## Self-Check: PASSED

- FOUND: skills/editor/SKILL.md (modified, +119 lines)
- FOUND: commit fbba938 (`feat(10-04): wire craft-check.js + LLM judgment sub-sections into editor Pass 1`)
- FOUND: scripts/craft-check.js (unaffected, Plan 10-01 infrastructure intact)
- FOUND: references/bestseller-craft-rules.md (unchanged reference target)

Commit: fbba938
