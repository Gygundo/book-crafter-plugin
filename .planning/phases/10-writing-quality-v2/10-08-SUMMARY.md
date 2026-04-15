---
phase: 10-writing-quality-v2
plan: 08
subsystem: orchestrator + emitting skills + formatter
tags: [craft-14, craft-15, fresh-mode, version-stamp]
requires:
  - skills/orchestrator/SKILL.md (Mode 6 Fresh Run)
  - skills/outliner/SKILL.md (stamp on outline + book-dna)
  - skills/researcher/SKILL.md (stamp on research files)
  - skills/writer/SKILL.md (stamp on drafts — inherited from 10-03)
  - skills/editor/SKILL.md (stamp preservation/auto-fix in Pass 1/2/3)
  - skills/enricher/SKILL.md (stamp on enrichments + foreword)
  - skills/formatter/SKILL.md (HTML comment strip before .docx)
provides:
  - Mode 6 Fresh Run with locked delete/preserve lists + mandatory confirmation
  - CRAFT-15 version stamp `<!-- generated-by: book-crafter v1.1.0 -->` on every generated artefact
  - Formatter text transform stripping all HTML comments before docx-js emission
affects:
  - Phase 12 seven-gap comparison — can now invoke Mode 6 and expect every artefact to carry the regression-chain anchor
tech-stack:
  added: []
  patterns:
    - "HTML comment as stamp (D-19 consistency)"
    - "Formatter text transform pre-docx emission"
    - "Confirmation-gated destructive operation"
key-files:
  created: []
  modified:
    - skills/orchestrator/SKILL.md
    - skills/outliner/SKILL.md
    - skills/researcher/SKILL.md
    - skills/editor/SKILL.md
    - skills/enricher/SKILL.md
    - skills/formatter/SKILL.md
decisions:
  - "Fresh mode aborts to Resume (not hard exit) on non-affirmative response — preserves graceful fall-through"
  - "Version stamp occupies line 2 beneath existing provenance comment in chapter drafts (not line 1) to avoid conflict with Plan 10-03's provenance instruction"
  - "Editor auto-fixes missing stamp in place at each pass boundary instead of round-tripping to writer — preserves CRAFT-17 2-revision cap"
  - "Formatter uses single `/<!--[\\s\\S]*?-->/g` regex covering provenance, generated-by, METADATA, and VOICE AUDIT comments in one pass"
metrics:
  duration: ~6min
  tasks_completed: 2
  files_modified: 6
  completed_date: 2026-04-15
---

# Phase 10 Plan 08: Fresh Mode + Version Stamps Summary

**One-liner:** Added orchestrator Mode 6 Fresh Run (CRAFT-14) with locked delete/preserve lists and mandatory user confirmation, wired CRAFT-15 `<!-- generated-by: book-crafter v1.1.0 -->` version stamps into every artefact-emitting skill, and updated the formatter to strip all HTML comments (provenance + version stamps) before `.docx` emission.

## Objective

Ship the two prerequisites Phase 12's seven-gap comparison needs: (1) a repeatable fresh re-run path that wipes downstream artefacts while preserving source inputs, and (2) a regression-chain anchor stamp present on every generated file.

## What Changed

### Task 1 — Mode 6 Fresh Run (orchestrator)

`skills/orchestrator/SKILL.md`:

- **Section 5 Step 0 — Fresh Mode Preprocessing:** New note stating that when Mode 6 is active, preprocessing runs BEFORE normal state detection.
- **Section 6 Mode 6 — Fresh Run:** New execution mode defined alongside Guided / Full / Resume / Status / Revision. Trigger phrases as a bullet list (so `grep -c` can count them discretely): `"start fresh"`, `"rerun from scratch"`, `"fresh build"`, `"regenerate everything"`, `"--fresh"`.
- **Locked delete list:** `book-dna.md`, `chapter-outline.md`, `research/`, `drafts/`, `edited/`, `revisions/`, `enrichments/`, `front-matter/`, `reports/`, `output/`.
- **Locked preserve list:** `sources/`, `sources-adapted/`, `brief.md`, `voice-profile.md`.
- **Mandatory confirmation prompt** enumerating both lists verbatim. Affirmative responses: `yes`, `y`, `proceed`, `confirm` (case-insensitive). Any other response aborts Mode 6 and falls through to Mode 3 Resume.
- **Safety Invariants subsection:** four invariants — never delete preserved paths, never delete without confirmation, never re-prompt without showing specific paths, never delete outside the identified project directory.

### Task 2 — CRAFT-15 Version Stamps + Formatter Strip

**Locked stamp format:** `<!-- generated-by: book-crafter v1.1.0 -->`

- `skills/outliner/SKILL.md` — stamp prepended as line 1 of `chapter-outline.md`; stamp added as line 1 of `book-dna.md` (above the existing READ-ONLY marker which moves to line 2).
- `skills/researcher/SKILL.md` — stamp prepended as line 1 of every `research/ch[NN]-research.md`.
- `skills/writer/SKILL.md` — **already compliant from Plan 10-03.** Writer emits line 1 provenance + line 2 generated-by. Verified via `grep -c` (returns 2: one in the Section 8 output spec, one in the file-layout example).
- `skills/editor/SKILL.md`:
  - Pass 1 (§2.8): preserves/auto-fixes the two header comments inherited from the writer's draft; CRAFT-15 auto-fix performed in place (not round-tripped).
  - Pass 2 (§3.6): preserves the stamp; prepends the stamp as line 1 of `reports/flow-report.md` (flow report has no provenance, so stamp occupies line 1).
  - Pass 3 (§4.5): preserves the stamp on `edited/ch[NN]-final.md`; prepends the stamp as line 1 of `reports/consistency-report.md`.
- `skills/enricher/SKILL.md` — stamp prepended as line 1 of every `enrichments/ch[NN]-enrichments.md` and of `front-matter/foreword.md`.
- `skills/formatter/SKILL.md`:
  - New documentation section **"Strip HTML Comments (CRAFT-15 / D-21)"** above `parseChapterMarkdown(content)`. Documents the rule, the regex, and the post-condition assertion that the final `.docx` contains zero occurrences of `generated-by` or `provenance:` in any text run.
  - Both `parseChapterMarkdown` implementations (doc-level example at line ~120 and the generation-script copy at line ~975) now include an explicit `content.replace(/<!--[\s\S]*?-->/g, '').trim()` call after the targeted METADATA and VOICE AUDIT strips. Single regex handles provenance, generated-by, METADATA, and VOICE AUDIT in one pass.

## Verification

Task 1 acceptance:

```
Mode 6: Fresh Run         -> present
Proceed? (yes/no)         -> present
Safety Invariants         -> present
voice-profile.md          -> present (preserve list)
book-dna.md               -> present (delete list)
sources-adapted           -> present (preserve list)
start fresh|rerun...|--fresh  grep -c -> 3  (trigger phrases on separate lines)
```

Task 2 acceptance (`grep -c "generated-by: book-crafter v1.1.0"`):

```
outliner   : 2  (chapter-outline instruction + book-dna marker block)
researcher : 1
writer     : 2  (Section 8 instruction + layout example — from Plan 10-03)
editor     : 5  (§2.8 Pass 1, §3.6 Pass 2 × 2, §4.5 Pass 3 × 2)
enricher   : 4  (enrichments instruction + enrichments example + foreword instruction + foreword example)
formatter  : Strip HTML Comments section + both parseChapterMarkdown code paths updated
```

## Deviations from Plan

None — plan executed exactly as written. Two small clarifications beyond the minimum plan spec:

1. **Trigger phrases as a bullet list** — the plan's acceptance criterion `grep -c "start fresh\|rerun from scratch\|--fresh"` counts matching lines. The first draft put all trigger phrases on a single comma-separated sentence (grep -c returned 1). Reformatted as a bullet list so each phrase occupies its own line and `grep -c` returns 3 as required. No semantic change.
2. **Formatter post-condition assertion documented** — plan says "Verify by asserting the final .docx contains zero occurrences of the literal string `generated-by` or `provenance:`". Documented this as an explicit post-condition assertion in the new "Strip HTML Comments" section so the expectation is discoverable during formatter runtime.

## Key Decisions

- **Mode 6 aborts to Mode 3 Resume on non-affirmative response** — graceful fall-through preserves user intent (they wanted to work on the project, just not wipe it).
- **Version stamp placement is line 2 in chapter drafts** (beneath provenance comment from Plan 10-03). Line 1 reserved for provenance so CRAFT-01 scene-first strictness can key off a fixed position.
- **Editor auto-fixes missing stamps in place** rather than round-tripping to the writer. This preserves the CRAFT-17 2-revision cap — a missing stamp is a CRAFT-15 tag-only fix, not a content revision.
- **Single regex covers all HTML comment types** in the formatter. `/<!--[\s\S]*?-->/g` handles provenance, generated-by, METADATA, VOICE AUDIT, and any future comment type without needing per-type targeting.

## Known Stubs

None. All instructions reference artefacts that already exist or will be produced in the normal pipeline flow.

## Impact on Phase 12

Phase 12's seven-gap comparison can now:

1. Invoke Mode 6 on the `Eternally Secure` project with a natural-language trigger (e.g. "rerun from scratch").
2. Confirm the delete list and preserve list match expectations.
3. Expect every regenerated artefact (outline, book DNA, research, drafts, edited chapters, reports, enrichments, foreword) to carry the `generated-by: book-crafter v1.1.0` stamp as an unambiguous regression-chain anchor.
4. Verify the final `.docx` contains zero HTML-comment leakage (no `generated-by` or `provenance:` in any text run).

## Self-Check: PASSED

- `.planning/phases/10-writing-quality-v2/10-08-SUMMARY.md` — will exist after this write
- `skills/orchestrator/SKILL.md` — modified (Mode 6 added)
- `skills/outliner/SKILL.md` — modified
- `skills/researcher/SKILL.md` — modified
- `skills/editor/SKILL.md` — modified
- `skills/enricher/SKILL.md` — modified
- `skills/formatter/SKILL.md` — modified
- Commit `6b94f5e` (Task 1) — verified via `git log --oneline`
- Commit `863ca6b` (Task 2) — verified via `git log --oneline`
