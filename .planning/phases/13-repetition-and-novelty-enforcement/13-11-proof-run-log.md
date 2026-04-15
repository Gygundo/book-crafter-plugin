# Phase 13 SC-6 Proof Run Log

Run date: 2026-04-16
Plan: 13-11 (SC-6 proof run)
Orchestrator invocation: `/book-crafter:orchestrator start fresh on fixtures/tiny-book ...`
Executed by: user (Claude Code main session) for the pipeline + orchestrator (phase-executor) for Steps 4-8

## Pre-flight tests

- `node scripts/test-craft-check.js`: **PASS** (18/18, duration ~550 ms)
- `node scripts/test-rubric-regression.js`: **PASS** (hash `b78477f42a59f3d758964162bfc987567e559fa4690333f45b20ebcea9559356`)
- `node scripts/test-rubric-regression.js --extended`: **PASS** (schema v2: 8 components, 0-16 range, novelty_dedup dimension, novelty_variation component all present)

All infrastructure green.

## Sample skill invocation

Invocation route: `/book-crafter:orchestrator` with a "start fresh on fixtures/tiny-book" natural-language prompt. The dedicated `/book-crafter:sample` command is not installed in the active plugin build (sample skill was added this phase via Plan 13-09, not yet re-installed), so the orchestrator was driven directly with equivalent instructions.

Pipeline completed: outliner → writer → editor → enricher → formatter all ran. Final `.docx` emitted at `fixtures/tiny-book/run/final/The 2am Prayer.docx`.

Editor's own verdict (captured verbatim from `fixtures/tiny-book/run/reports/consistency-report.md ## Captivation Score`):

```yaml
schema_version: 2
captivation_total: 15
novelty_dedup: pass
novelty_dedup_flags: []
pacing_variety: 2
emotional_connection: 2
reader_engagement: 2
opening_engagement: 2
chapter_ending_momentum: 2
craft_density: 2
cross_chapter_craft: 2
novelty_variation: 1
```

Reconstructed D-05 output line (what `/book-crafter:sample` would have printed):

```
SAMPLE PASS — .docx at fixtures/tiny-book/run/final/The 2am Prayer.docx, captivation 15/16 (threshold 10), novelty_dedup pass
```

**However — this line is CONTRADICTED by the independent craft-check run in the next section.** The editor's LLM judgment pass is a false positive. Per SC-6 the proof run is gated on the direct-tool check, which fails.

## Craft-check --novelty verification (SC-6 gating check)

Command:

```
node scripts/craft-check.js --novelty --tier both --dna fixtures/tiny-book/run/book-dna.md fixtures/tiny-book/run/
```

Exit code: **1**
JSON output summary:

- `flag`: **true**
- `novelty_dedup`: **"fail"**
- `repeated_spans`: **4 hits**
- `cross_artefact_hits`: 0
- `central_image_reuse`: 0
- `refrain_overuse`: 0
- `tier2.discussion_question_stems`: 0
- `tier2.prayer_point_repetition`: 0
- `tier2.vulnerability_bleed_to_summary`: 0
- `tier2.vehicle_reuse_in_backmatter`: 0

### Repeated spans detected

| # | Phrase | Location A | Location B |
|---|--------|-----------|-----------|
| 1 | "he has been on the wall since the day you closed your eyes" | `front-matter/foreword.md` @564 | `edited/ch01-final.md` @571 |
| 2 | "has decided without your permission that something is wrong" | `front-matter/foreword.md` @51 | `edited/ch01-final.md` @101 |
| 3 | "the one who does not slumber is" | `front-matter/foreword.md` @436 | `edited/ch01-final.md` @683 |
| 4 | "somewhere on the other side of the" | `edited/ch01-final.md` @62 | `edited/ch03-final.md` @267 |

Three of the four hits are foreword ↔ ch01 verbatim bleed — the enricher-generated foreword is quoting ch01 (or ch01 is quoting the foreword) rather than being an independent framing piece. The fourth is a shorter connective span between ch01 and ch03.

## SC-5 refrain cap assertion

Command: `grep -r -c 'one small lamp refusing the whole dark' fixtures/tiny-book/run/front-matter/ fixtures/tiny-book/run/edited/`
Total occurrences: **0** (must be ≤ 1) → **PASS**

The writer's Anti-Loop Clause held on the refrain phrase. Tier 1 refrain-overuse check is clean.

## Tier 2 proof (enricher stage ran)

```
ls fixtures/tiny-book/run/enrichments/*.md
```

File count: **3** (ch01, ch02, ch03). Tier 2 was exercised end-to-end. Tier 2 rule results: all four arrays empty. Tier 2 is clean.

## Inspected artefacts

- Foreword: `fixtures/tiny-book/run/front-matter/foreword.md`
- Ch1: `fixtures/tiny-book/run/edited/ch01-final.md`
- Ch2: `fixtures/tiny-book/run/edited/ch02-final.md`
- Ch3: `fixtures/tiny-book/run/edited/ch03-final.md`
- Consistency report: `fixtures/tiny-book/run/reports/consistency-report.md`
- Final .docx: `fixtures/tiny-book/run/final/The 2am Prayer.docx`

## Status

All automated assertions: **FAIL** (1 of 6 failed — `craft-check.js --novelty` direct run)

| Assertion | Result |
|-----------|--------|
| Pre-flight tests | PASS |
| Editor YAML shape (schema v2, captivation ≥ 10, novelty_dedup pass) | PASS |
| `craft-check.js --novelty --tier both` direct run returns flag:false | **FAIL** (4 `repeated_spans`) |
| Refrain cap ≤ 1 | PASS (count=0) |
| Enricher stage ≥ 1 file | PASS (3 files) |
| Tier 2 all arrays empty | PASS |

Ready for human verification (Task 2): **no**

Per Plan 13-11 Step 8: "If any assertion failed, halt. Do NOT proceed to the human-verify checkpoint."

## Root cause hypothesis

This is the EXACT scenario Phase 13 was created to detect — a rubric scoring 15/16 with `novelty_dedup: pass` on prose that, by deterministic n-gram analysis, has verbatim repetition between foreword and ch01. The editor's LLM judgment in §4.4.5 said pass. The deterministic tool disagreed.

Two independent problems:

1. **Editor Pass 3 §4.4.5 Step A may not have actually run `craft-check.js --novelty` against the emitted foreword.** Step A (Plan 13-06) specifies running the script and merging its verdict with the LLM judgment. If the script had run, `novelty_dedup` would have been `fail` and the editor would not have emitted `pass`. Either the editor skipped Step A, or it ran the script before the foreword was emitted (the foreword is generated in Stage 3.5 by the enricher — AFTER the editor's first pass — and a second editor pass over front-matter may not exist in the current orchestrator flow).

2. **Enricher foreword generation is copy-heavy.** The enricher is reaching into ch01 for sentences rather than composing original framing prose. Three verbatim spans from ch01 is not a craft issue you can catch after the fact — it's a writer-side contract gap: the enricher skill needs its own Anti-Loop Clause against the already-edited chapters it reads for context.

Both are real integration gaps between Plan 13-06 (editor YAML emit) and Plan 13-07 (writer-side contracts) that the SC-6 end-to-end test just surfaced. This is the first time the full chain was exercised.

## Next step

File gap-closure plans via `/gsd:plan-phase 13 --gaps`. The gap plan should cover:

- Confirm/restore editor Pass 3 §4.4.5 Step A deterministic check runs against the full corpus including `front-matter/foreword.md` after the enricher emits it, not only against the body chapters before foreword generation.
- Add an Anti-Loop Clause to the enricher skill (foreword generation branch) mirroring the writer Anti-Loop Clause in `skills/writer/SKILL.md` — no 6+ word verbatim spans copied from any chapter it reads for context.
- Re-run the SC-6 proof after the gap closure lands.

Phase 13 is NOT complete. Status: blocked on gap closure.
