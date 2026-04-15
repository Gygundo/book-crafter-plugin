---
phase: 13-repetition-and-novelty-enforcement
plan: 06
subsystem: editor
tags: [editor, novelty, dedup, schema-v2, yaml-emit, rewrite-targets]
requires:
  - captivation-rubric.md schema v2 (Plan 13-04)
  - craft-check.js --novelty mode (Plan 13-05, Wave 2 sibling)
provides:
  - Canonical schema v2 YAML emit block in editor consistency report
  - §4.4.5 Novelty and Dedup Audit (hybrid deterministic + LLM)
  - rewrite_targets contract with mandatory reason field
affects:
  - skills/sample/SKILL.md §4 (Plan 13-09 reads the YAML block)
  - skills/orchestrator/SKILL.md Mode 7 (Plan 13-08 consumes rewrite_targets.yaml)
tech-stack:
  added: []
  patterns:
    - Column-0 YAML anchors for pure-bash grep readers (Pattern 5)
    - Layered deterministic + LLM judgment (Pattern 1, CRAFT-02/05/07 shape)
key-files:
  created: []
  modified:
    - skills/editor/SKILL.md
decisions:
  - Single canonical scoring surface — one fenced yaml block, no duplication
  - Editor is judge, not author — no auto-rewrite; Mode 7 owns that path
  - Hard-fail semantics: novelty_dedup fail is a gate, not a warning
  - rewrite_targets mirrored to reports/rewrite_targets.yaml for machine consumption
metrics:
  duration: 4min
  tasks: 2
  files: 1
  completed: 2026-04-15
---

# Phase 13 Plan 06: Editor Pass 3 + Schema v2 YAML Emit Summary

Land the editor-side contract for the repetition blindspot: canonical schema v2 captivation YAML block at column 0 (bash-grep readable), and a new Pass 3 §4.4.5 Novelty and Dedup Audit that layers LLM paraphrase judgment on top of the craft-check.js --novelty deterministic scan, emitting rewrite_targets with a mandatory reason field for orchestrator Mode 7 consumption.

## What Was Built

### Edit 1 — `## Captivation Score` YAML emit block (lines ~502–532)

New top-level heading inserted immediately after `**Overall assessment:**` and before `## Voice Consistency (Pass 1)`. Contains a fenced ```yaml block with all four column-0 anchors the bash reader targets:

- `schema_version: 2`
- `captivation_total: <INT 0-16>`
- `novelty_dedup: <pass|fail>`
- `novelty_dedup_flags: []`

Plus the 8-component flat object matching `references/captivation-rubric.md` frontmatter keys: `pacing_variety`, `emotional_connection`, `reader_engagement`, `opening_engagement`, `chapter_ending_momentum`, `craft_density`, `cross_chapter_craft`, `novelty_variation`.

Field contract documented inline including the bash grep reader guarantee: fence characters sit on their own lines so `grep -E '^captivation_total:'` is unaffected.

### Edit 2 — Pass 1 table cell refresh (line 544)

`| Ch 1    | 0         | 15.2               | 22%        | 14/16       | clean    |` — example row updated from `8/10` to `14/16` to match schema v2 range.

### Edit 3 — Captivation Score Breakdown addendum (lines ~548–550)

New paragraph added under `### Captivation Score Breakdown` declaring the YAML block at `## Captivation Score` as the single canonical machine-readable surface, noting prose references to N/10 / N/14 are legacy.

### Edit 4 — §7 Output Summary cleanup (line ~759)

`Captivation: avg [X.X]/10` → `Captivation: avg [X.X]/16` — last stale `/10` prose reference purged.

### Edit 5 — §4.4.5 Novelty and Dedup Audit (lines 487–564)

New level-3 section inserted between §4.4 Theme Tracking and §4.5 Pass 3 Output. Structured as three steps following the CRAFT-02/05/07 layering pattern:

**Step A — Deterministic invocation.** Calls `node ${CLAUDE_PLUGIN_ROOT}/scripts/craft-check.js --novelty --tier both --dna [project_directory]/book-dna.md [project_directory]` and parses the JSON shape `{mode, tier, project_dir, repeated_spans, cross_artefact_hits, central_image_reuse, refrain_overuse, tier2_hits, flag, novelty_dedup}`.

**Step B — LLM judgment layer.** Three semantic checks the regex shingler cannot see:
1. Vulnerability-beat scene reuse (paraphrase-level) across foreword ↔ chapters and chapter pairs
2. Central-image vehicle semantic collision (dominant vehicle family matches even when `central_image` field values differ)
3. Reader-moment reuse in adjacent chapters (same-chapter reuse is legitimate, adjacent is a flag)

Emits a parallel `llm_flags` array with structured entries.

**Step C — Combined verdict and emit.** Verdict = `(script_flag || llm_flag) ? "fail" : "pass"`. On `pass`: set `novelty_dedup_flags: []`, continue to §4.5. On `fail`: populate `novelty_dedup_flags` in the Captivation Score YAML block AND emit a `rewrite_targets` block both inline in consistency-report.md and as a separate `[project_directory]/reports/rewrite_targets.yaml` file.

### Rewrite Targets Contract (D-12)

```yaml
rewrite_targets:
  - file: edited/ch02-final.md
    span: "L21-L28"
    reason: "verbatim overlap with front-matter/foreword.md:L12-L18 — rewrite the vulnerability beat using a different sourced detail from the author notes at voice-profile.md:45"
    flagged_by: craft-check
  - file: edited/ch03-final.md
    span: "L40-L47"
    reason: "same central-image vehicle ('reading lamp') dominates ch01 and ch03 — substitute with a distinct vehicle from the motif family (grey seam of dawn per brief.md:37)"
    flagged_by: editor-pass3
```

**Mandatory reason field rule:** every target must include both a source location reference and one of the directional verbs `rewrite` / `substitute` / `replace` / `different`. Orchestrator Mode 7 will refuse to run if a target's reason fails this check.

`flagged_by:` is either `craft-check` (Step A) or `editor-pass3` (Step B).

### Hard-Fail Semantics (D-10)

`novelty_dedup: fail` is a hard gate. The consistency report emits it, the sample skill's gate (Plan 13-09) reads it and emits `SAMPLE FAIL — novelty_dedup fail: K flags`, and release.sh (Phase 12+) will refuse to build. No `--strict` override, no soft-warn mode, no "ship anyway" escape hatch. Soft gates become invisible — that's the phase 13 premise.

## Commits

- `8ba6fb0` — feat(13-06): emit schema v2 captivation YAML block in editor report template
- `4d287f4` — feat(13-06): insert editor Pass 3 §4.4.5 novelty and dedup audit

## Deviations from Plan

None - plan executed exactly as written. The verbatim YAML block, field contract prose, §4.4.5 Steps A/B/C, and rewrite_targets example were all inserted without modification.

## Verification

All acceptance criteria for both tasks passed:

**Task 1:**
- `grep -c '^## Captivation Score$'` = 1
- `grep -c '^schema_version: 2$'` ≥ 1
- `grep -c '^captivation_total:'` ≥ 1
- `grep -c '^novelty_dedup:'` ≥ 1
- `grep -c 'novelty_variation'` ≥ 1
- `grep -cE 'Captivation[^0-9]*/10'` = 0 (stale purged)
- All 8 component keys present

**Task 2:**
- `grep -c '^### 4.4.5 Novelty and Dedup Audit'` = 1
- craft-check.js --novelty invocation present
- llm_flags emit shape present
- rewrite_targets appears 5 times (Step C prose + example + reports file + file contract + Mode 7 reference)
- reports/rewrite_targets.yaml contract present
- "judge, not an author" present (D-10)
- `flagged_by: craft-check` present
- Section order: line 479 §4.4 → line 487 §4.4.5 → line 566 §4.5 ✓

## Key Links

- `skills/editor/SKILL.md` §504 emit template → `skills/sample/SKILL.md §4` bash grep reader (Plan 13-09)
- `skills/editor/SKILL.md §4.4.5 Step C` → `reports/rewrite_targets.yaml` → `skills/orchestrator/SKILL.md Mode 7` (Plan 13-08)
- `skills/editor/SKILL.md` schema keys ↔ `references/captivation-rubric.md` frontmatter components (Plan 13-04)

## Self-Check: PASSED

- FOUND: skills/editor/SKILL.md (modified, 776 lines)
- FOUND: commit 8ba6fb0
- FOUND: commit 4d287f4
- FOUND: .planning/phases/13-repetition-and-novelty-enforcement/13-06-SUMMARY.md
