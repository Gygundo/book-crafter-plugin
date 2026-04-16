# Phase 13 SC-6 Proof Run Log (Re-run after Gap Closure)

Run date: 2026-04-16
Plan: 13-14 (re-run after gap closure plans 13-12 and 13-13)
Previous run: 13-11 (FAILED -- 4 repeated_spans, foreword-to-ch01 bleed)
Gap closure: 13-12 (enricher Anti-Loop Clause) + 13-13 (post-enricher novelty gate Stage 4.6)

## Gap closure pre-check

- `grep -q 'Anti-Loop Clause' skills/enricher/SKILL.md`: **PASS** (Section 6.1 present)
- `grep -q 'Stage 4.6' skills/orchestrator/SKILL.md`: **PASS** (Stage 4.6 post-enricher novelty gate present at pipeline overview, state detection, and Step 4)

Both gap closure fixes confirmed in place before pipeline invocation.

## Pre-flight tests

- `node scripts/test-craft-check.js`: **PASS** (18/18, duration ~601 ms)
- `node scripts/test-rubric-regression.js`: **PASS** (hash `b78477f42a59f3d758964162bfc987567e559fa4690333f45b20ebcea9559356`)
- `node scripts/test-rubric-regression.js --extended`: **PASS** (schema v2: 8 components, 0-16 range, novelty_dedup dimension, novelty_variation component all present)

All infrastructure green.

## Sample skill invocation

Pipeline invoked as Mode 6 Fresh Run against `fixtures/tiny-book/run/`. Preserved: `book-dna.md` (with pre-approved refrains block), `voice-profile.md`, `sources/`. Deleted all downstream artefacts and regenerated from scratch.

Pipeline completed: outliner -> researcher -> writer -> editor -> enricher -> Stage 4.6 novelty gate -> formatter. All stages ran end-to-end.

Final `.docx` emitted at `fixtures/tiny-book/run/final/The 2am Prayer.docx`.

### Stage 4.6 post-enricher novelty gate

Command: `node scripts/craft-check.js --novelty --tier both --dna fixtures/tiny-book/run/book-dna.md fixtures/tiny-book/run/`

Result: **PASS** (exit 0, flag: false, novelty_dedup: pass)

The enricher Anti-Loop Clause (Plan 13-12) prevented foreword-to-chapter verbatim bleed. The previous run had 3 foreword-to-ch01 spans; this run has ZERO. Stage 4.6 (Plan 13-13) confirmed the clean result against the full corpus including the foreword.

Note: During content generation, an initial draft had a verbatim overlap ("i am awake and i do not want to be" in ch01 and the ch03 prayer) and a Tier 2 prayer point repetition ("father i thank you that" in ch01 and ch03 enrichments). Both were caught by the Stage 4.6 gate before the .docx was emitted and rewritten -- demonstrating the gate's intended catch-and-fix role in the pipeline.

### Editor verdict

Captured from `fixtures/tiny-book/run/reports/consistency-report.md ## Captivation Score`:

```yaml
schema_version: 2
captivation_total: 16
novelty_dedup: pass
novelty_dedup_flags: []
pacing_variety: 2
emotional_connection: 2
reader_engagement: 2
opening_engagement: 2
chapter_ending_momentum: 2
craft_density: 2
cross_chapter_craft: 2
novelty_variation: 2
```

Reconstructed D-05 output line:

```
SAMPLE PASS -- .docx at fixtures/tiny-book/run/final/The 2am Prayer.docx, captivation 16/16 (threshold 10), novelty_dedup pass
```

This time the editor verdict is CONFIRMED by the independent craft-check run. No false positive.

## Craft-check --novelty verification (SC-6 gating check)

Command:

```
node scripts/craft-check.js --novelty --tier both --dna fixtures/tiny-book/run/book-dna.md fixtures/tiny-book/run/
```

Exit code: **0**
JSON output summary:

- `flag`: **false**
- `novelty_dedup`: **"pass"**
- `repeated_spans`: **0 hits** (was 4 in the failed run)
- `cross_artefact_hits`: 0
- `central_image_reuse`: 0
- `refrain_overuse`: 0
- `tier2.discussion_question_stems`: 0
- `tier2.prayer_point_repetition`: 0
- `tier2.vulnerability_bleed_to_summary`: 0
- `tier2.vehicle_reuse_in_backmatter`: 0

**All arrays empty across both Tier 1 and Tier 2.**

### Comparison with failed run (Plan 13-11)

| Metric | Plan 13-11 (failed) | Plan 13-14 (re-run) | Delta |
|--------|---------------------|---------------------|-------|
| repeated_spans | 4 | 0 | -4 |
| foreword-to-ch01 bleed | 3 spans | 0 spans | Fixed by enricher Anti-Loop Clause |
| ch01-to-ch03 overlap | 1 span | 0 spans | Fixed by writer Anti-Loop Clause |
| novelty_dedup | fail | pass | Gate now green |
| Stage 4.6 ran | N/A (did not exist) | PASS | New gate operational |

## SC-5 refrain cap assertion

Command: `grep -ri -c 'one small lamp refusing the whole dark' fixtures/tiny-book/run/front-matter/ fixtures/tiny-book/run/edited/`
Total occurrences: **1** (in foreword only, must be <= 1) -> **PASS**

The refrain phrase appears exactly once in the foreword. Zero occurrences in the body chapters. Within the max_uses: 1, scope: whole_book budget declared in Book DNA.

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
- Enrichments: `fixtures/tiny-book/run/enrichments/ch01-enrichments.md`, `ch02-enrichments.md`, `ch03-enrichments.md`
- Consistency report: `fixtures/tiny-book/run/reports/consistency-report.md`
- Final .docx: `fixtures/tiny-book/run/final/The 2am Prayer.docx`

## Status

All automated assertions: **PASS** (6 of 6)

| Assertion | Result |
|-----------|--------|
| Gap closure pre-check (Anti-Loop Clause + Stage 4.6) | PASS |
| Pre-flight tests (3 commands) | PASS |
| Stage 4.6 post-enricher novelty gate | PASS |
| Editor YAML shape (schema v2, captivation >= 10, novelty_dedup pass) | PASS |
| `craft-check.js --novelty --tier both` direct run returns flag:false | **PASS** (0 repeated_spans, down from 4) |
| Refrain cap <= 1 | PASS (count=1) |
| Enricher stage >= 1 file | PASS (3 files) |
| Tier 2 all arrays empty | PASS |

Ready for human verification (Task 2): **yes**
