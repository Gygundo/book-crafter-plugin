---
phase: 13-repetition-and-novelty-enforcement
plan: 08
subsystem: orchestrator
tags: [orchestrator, mode-7, rewrite-targets, novelty-dedup, scoped-rerun, d-11, d-12]
requires:
  - skills/orchestrator/SKILL.md (Mode 6 structural precedent)
  - reports/rewrite_targets.yaml (producer: editor Pass 3 §4.4.5, Plan 13-06)
provides:
  - skills/orchestrator/SKILL.md Mode 7 (consumer of rewrite_targets.yaml)
affects:
  - skills/writer (via rewrite_reason parameter injection in Stage 3 wave-batching)
tech-stack:
  added: []
  patterns: [phrase-triggered-mode, filesystem-as-state, scoped-delete, path-traversal-guard, explicit-preserve-list, hard-fail-no-auto-loop]
key-files:
  created: []
  modified:
    - skills/orchestrator/SKILL.md (+87 lines, 881 -> 968)
decisions:
  - Mode 7 inserted immediately after Mode 6 at level-3 heading shape (mirrors existing mode numbering; no renumbering of Modes 1-6)
  - Writer prompt extension is a `rewrite_reason` parameter on the existing Stage 3 wave-batching builder — no new writer skill, no new subagent
  - D-12 reason contract enforced BEFORE any destructive operation (validation pass precedes delete pass)
  - No auto-loop: persistent novelty_dedup failure halts and requires a fresh explicit Mode 7 invocation (respects D-10 editor-as-judge contract)
  - Handwritten ~30-line YAML parser reused from craft-check.js --dna refrains pattern; zero new npm deps
metrics:
  duration: ~4min
  completed: 2026-04-15
  tasks: 1
  files: 1
---

# Phase 13 Plan 08: Orchestrator Mode 7 Rewrite Targets Summary

**One-liner:** Adds orchestrator Mode 7 — a phrase-triggered scoped re-run consuming editor-emitted `reports/rewrite_targets.yaml` to re-run writer+editor for only the flagged chapters, with each target's `reason` field injected as directional writer guidance.

## What Was Built

A new level-3 section `### Mode 7: Rewrite Targets (Phase 13, D-11)` was inserted into `skills/orchestrator/SKILL.md` immediately after Mode 6 Fresh Run and immediately before `## 7. Error Handling`. Mode 6 was not touched; no other mode was renumbered.

### Insertion point

Mode 7 lives at line ~783 of the updated SKILL.md (between Mode 6's safety invariants block and the `## 7. Error Handling` top-level header). Mode 7 is purely additive — SKILL.md grew from 881 to 968 lines (+87 lines).

### Contents (mirroring Mode 6 shape)

1. **Blockquote intro** — Phase 13 scoped re-run rationale (20-chapter dedup failure shouldn't require a full pipeline rebuild), editor Pass 3 §4.4.5 as the producer, Mode 6 phrase-trigger pattern as precedent.

2. **Phrase triggers** (level-4):
   - `--rewrite-targets`
   - `rewrite the flagged chapters`
   - `apply rewrite targets from <path>`
   - `re-run flagged chapters`

   Activates BEFORE the Section 3 state detection algorithm, matching Mode 6's pre-detection insertion.

3. **Preprocessing steps** (10 numbered steps):
   1. Identify project directory (same logic as Mode 6).
   2. Resolve `rewrite_targets.yaml` path (default `[project]/reports/rewrite_targets.yaml`, explicit override via `apply rewrite targets from <path>`). Halt with explicit error string if missing.
   3. Parse yaml using a minimal handwritten ~30-line parser (flat schema, matches craft-check.js --dna refrains pattern). Expected shape documented inline with `file`, `span`, `reason`, `flagged_by` fields.
   4. D-12 reason validation: every `reason` must contain BOTH a source location (file reference / path / `L\d+-L\d+` line range) AND a directional verb (`rewrite`, `substitute`, `replace`, `different`). Halt with targeted error naming the offending target file.
   5. Path-traversal guard (Pitfall 6): `path.resolve(projectDir, target.file)` MUST start with `projectDir`. Any `../` escape aborts immediately before any destructive operation.
   6. Mandatory confirmation prompt enumerating every re-run chapter and every delete path. Affirmative tokens match Mode 6 (`yes`, `y`, `proceed`, `confirm`, case-insensitive).
   7. Scoped delete: for each target, delete `edited/ch*-final.md` AND `drafts/ch*-draft.md`. Explicit preserve list documented: `sources/`, `sources-adapted/`, `brief.md`, `voice-profile.md`, `book-dna.md`, `chapter-outline.md`, `research/`, `front-matter/`, `enrichments/`, and any chapter not named in `rewrite_targets`.
   8. Writer prompt injection: extend the existing Stage 3 wave-batching builder with a `rewrite_reason` parameter. When present, append a REWRITE GUIDANCE block to the writer prompt citing the `flagged_by` origin and the reason text, plus a hard-fail clause if the rewrite produces identical text.
   9. Re-enter Section 3 state detection — the deleted files cause the writer + editor stages to re-run for exactly those chapters.
   10. Post-re-run novelty_dedup re-check. **No auto-loop.** If still `fail`, halt and surface the new targets block; require a fresh explicit Mode 7 invocation. Documented as honouring D-10 (editor-as-judge, not author).

4. **Safety invariants** (bullet list, level-4): mandatory confirmation; path-traversal guard; explicit preserve list; no auto-loop; byte-identical untouched chapters; D-12 reason enforcement runs BEFORE any destructive op.

5. **Relationship to other modes** (prose): Mode 6 wipes the whole run, Mode 7 wipes only flagged chapters; Mode 7 requires a pre-existing `reports/rewrite_targets.yaml`; on `fixtures/tiny-book/` (3 chapters) a Mode 7 all-flagged case is functionally equivalent to a full re-run but preserves the contract for larger books.

6. **Example invocation** (code block): default path form and explicit path form.

## Verification

All 10 acceptance-criteria grep checks pass:

| Check | Result |
|---|---|
| `grep -c "Mode 7"` >= 3 | 14 matches |
| `grep -q "Rewrite Targets"` | OK |
| `grep -q "rewrite-targets"` | OK |
| `grep -q "rewrite_targets.yaml"` | OK |
| `grep -q "flagged_by"` | OK |
| `grep -q "path traversal\|traversal detected"` | OK |
| `grep -q "preserve list"` | OK |
| `grep -q "[Mm]andatory confirmation"` | OK (4 occurrences) |
| `grep -q "auto-loop"` | OK |
| `grep -q "Mode 6"` (cross-reference) | OK |

Automated grep from plan `<verify>` block passes.

## Deviations from Plan

**None — plan executed exactly as written.** The Mode 7 section matches the plan's template shape: blockquote intro, phrase triggers, 10 preprocessing steps, safety invariants bullet list, relationship paragraph, example invocation. Every required phrase, guard, and contract landed verbatim.

Minor wording adjustments (for consistency with surrounding Mode 6 prose):

- Preserve list explicitly adds `front-matter/` and `enrichments/` alongside the plan's core list, because those directories are Mode-6 preserve-equivalent outputs that must survive a scoped re-run as well.
- Section intro blockquote uses `>` Markdown quote syntax to mirror Mode 6's error-handling blockquote style.

Neither adjustment violates the plan contract — both strengthen the preserve guarantee.

## Contract Closure

Editor Pass 3 §4.4.5 (Plan 13-06) emits `reports/rewrite_targets.yaml`. Plan 13-08 Mode 7 is now the consumer that reads, validates, and acts on that file. The D-12 reason-field contract (specific cross-reference + directional verb) is the protocol between producer and consumer, enforced at parse time before any filesystem mutation.

## Self-Check: PASSED

- `skills/orchestrator/SKILL.md` modified (line count 968, +87 from 881).
- Commit `c22dc7b` present in `git log --oneline`.
- All 10 grep acceptance criteria return OK.
- Mode 6 section unchanged (verified by diff scope — only one edit, which inserted after Mode 6's final `- **Never delete files outside...**` bullet and before `## 7. Error Handling`).
