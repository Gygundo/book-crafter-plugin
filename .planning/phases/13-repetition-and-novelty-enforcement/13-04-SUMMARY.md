---
phase: 13-repetition-and-novelty-enforcement
plan: 04
subsystem: captivation-rubric
tags: [rubric, schema-v2, canonicalisation, novelty, SC-1, SC-3]
requires:
  - 13-03 (test harness extensions: schema v2 structural assertions in test-rubric-regression.js)
provides:
  - "references/captivation-rubric.md as canonical schema v2 rubric (YAML frontmatter + 8 components + novelty_dedup dimension + sample_gate thresholds)"
  - "Regenerated sha256 baseline locking schema v2 body"
  - "Stable contract for editor Pass 3 YAML emit (Plan 13-06) and sample skill YAML reader (Plan 13-09)"
affects:
  - skills/editor/SKILL.md (Plan 13-06 will align §504 template to these output_fields)
  - skills/sample/SKILL.md (Plan 13-09 will wire a YAML reader against output_fields)
  - craft-check.js --novelty (Plan 13-05 reads captivation_total_min threshold)
tech-stack:
  added: []
  patterns:
    - YAML frontmatter on reference documents (Research Pattern 3)
    - Append-only component extension preserving legacy semantic bodies
key-files:
  created: []
  modified:
    - references/captivation-rubric.md
    - fixtures/phase10/baseline-scores.json
decisions:
  - "schema_version: 2 locked via frontmatter as the single source of truth for captivation scoring"
  - "novelty_variation (0-2 gradient) and novelty_dedup (binary pass/fail) are independent fields — both read by sample gate"
  - "captivation_total_min: 10 set per D-28 starting recommendation (out of 16)"
  - "Legacy 5-component bodies left byte-identical; aggregation text (outside body blocks) rewritten for 0-16"
metrics:
  duration: ~6 min
  tasks: 2
  files_modified: 2
  completed: 2026-04-15
---

# Phase 13 Plan 04: Rubric Canonicalisation Summary

**One-liner:** Canonicalised `references/captivation-rubric.md` as schema v2 — YAML frontmatter declaring 8 components, [0,16] range, binary `novelty_dedup` dimension, and `sample_gate` thresholds — then regenerated the sha256 baseline so `test-rubric-regression.js --extended` is green.

## What Shipped

### Task 1 — Rubric file rewritten to schema v2

`references/captivation-rubric.md` now starts with a YAML frontmatter block that declares:

- `schema_version: 2`
- `total_range: [0, 16]`
- 8 components: `pacing_variety`, `emotional_connection`, `reader_engagement`, `opening_engagement`, `chapter_ending_momentum`, `craft_density`, `cross_chapter_craft`, `novelty_variation`
- A binary `dimensions` entry: `novelty_dedup` (values `[pass, fail]`)
- `thresholds.sample_gate`: `captivation_total_min: 10` + `novelty_dedup: pass`
- `output_fields`: `captivation_total`, `components`, `novelty_dedup`, `novelty_dedup_flags`, `rewrite_targets`

Body edits:

1. Intro blockquote rewritten: "8 components × 0-2 points = 0-16 total. Schema version 2 (Phase 13 — adds Novelty / Variation component and binary novelty_dedup dimension)."
2. CRAFT-10 history blockquote appended with Phase 13 extension note.
3. New `### Novelty / Variation` component body appended after `### Cross-Chapter Craft` documenting three sub-checks (central-image vehicle distinctness, cross-artefact 6+ word span dedup, vulnerability-beat single-location), 0/1/2 scoring, and the independence of the binary `novelty_dedup` dimension.
4. Scoring aggregation table rewritten with the 8th row (Novelty / Variation, Pass 3 source) and the prose updated to "0-16 based on eight components".
5. Thresholds table updated to four bands (0-6 below floor, 7-9 weak, 10-12 competent, 13-16 strong).
6. Sample release gate paragraph appended: requires both `captivation_total >= 10` AND `novelty_dedup == pass`.
7. Legacy 0-10 reference paragraph kept but updated to note the sha256 hash has been regenerated for the Phase 13 body rewrite (aggregation prose is the byte source of drift, not the component bodies themselves).

Commit: `85c9a71`.

### Task 2 — Baseline sha256 hash regenerated

Running `node scripts/test-rubric-regression.js` after Task 1 emitted:

```
FAIL: rubric hash drifted from baseline.
  baseline: PHASE_13_PENDING
  current:  b78477f42a59f3d758964162bfc987567e559fa4690333f45b20ebcea9559356
```

(Interesting discovery: the 5-component legacy body text under the locked headings was already byte-identical to Phase 10 because all Phase 13 rewrites landed in the intro blockquote, `## Scoring Aggregation`, and the new 8th component — all outside the five legacy heading bodies the `extractBody` helper iterates over. So the regenerated hash `b78477f4…` matches the Phase 10 hash bit-for-bit. The lock is still "regenerated" in the bookkeeping sense — the baseline now declares `phase_13_regenerated: true` and the schema v2 structural assertions are the primary drift detector going forward.)

`fixtures/phase10/baseline-scores.json` now carries:

- `scoring_logic_hash: "b78477f42a59f3d758964162bfc987567e559fa4690333f45b20ebcea9559356"` (no longer `PHASE_13_PENDING`)
- `phase_13_regenerated: true`
- `phase_13_regenerated_at: "2026-04-15"`
- `phase_13_schema_version: 2`

Re-runs both exit 0:

```
$ node scripts/test-rubric-regression.js
NOTE: baseline regenerated for Phase 13 schema v2
PASS: rubric hash matches baseline (b78477f4…)

$ node scripts/test-rubric-regression.js --extended
NOTE: baseline regenerated for Phase 13 schema v2
PASS: rubric hash matches baseline (b78477f4…)
PASS: extended rubric checks (schema v2: 8 components, 0-16 range, novelty_dedup dimension, novelty_variation component)
```

Commit: `f1fc3be`.

## Verification

| Check | Result |
|-------|--------|
| `grep -c '^schema_version: 2$' references/captivation-rubric.md` | 1 |
| `grep -c '^total_range: \[0, 16\]$' references/captivation-rubric.md` | 1 |
| `grep -c 'key: novelty_variation' references/captivation-rubric.md` | 1 |
| `grep -c 'key: novelty_dedup' references/captivation-rubric.md` | 1 |
| `grep -c 'type: binary' references/captivation-rubric.md` | 1 |
| `grep -c 'captivation_total_min: 10' references/captivation-rubric.md` | 1 |
| `grep -c '^### Novelty / Variation$' references/captivation-rubric.md` | 1 |
| `grep -c '^### ' references/captivation-rubric.md` | 8 |
| `grep -c '0-16' references/captivation-rubric.md` | 6 |
| `node scripts/test-rubric-regression.js` | exit 0 |
| `node scripts/test-rubric-regression.js --extended` | exit 0 |

## Downstream Contract Unblocked

Plan 13-04 was the first production change of Phase 13. With schema v2 landed, the following now have a stable target contract:

| Downstream plan | What it can now target |
|-----------------|------------------------|
| 13-05 (novelty detection engine) | Reads `captivation_total_min` via thresholds; produces `novelty_dedup` verdict matching the binary dimension |
| 13-06 (editor Pass 3 + YAML emit) | §504 YAML emit template aligns to `output_fields` exactly (`captivation_total`, `components`, `novelty_dedup`, `novelty_dedup_flags`, `rewrite_targets`) |
| 13-09 (sample skill YAML reader) | Bash grep reader targets `output_fields` keys as top-level YAML fields |
| 13-10 (fixture brief + DNA rewrite) | Consistency-report fixture aligns to the 8-component shape and 0-16 range |

Three schemas were drifted before this plan (rubric, editor §504 template, fixture consistency-report). The rubric leg is now the canonical anchor; Plans 13-06 and 13-10 close the other two legs.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocking] Plan 13-03 outputs were present in the working tree but uncommitted**

- **Found during:** Task 2 baseline regeneration
- **Issue:** `scripts/test-rubric-regression.js` and `fixtures/phase10/baseline-scores.json` already contained Plan 13-03 Task 2 edits (schema v2 structural assertions, `PHASE_13_PENDING` sentinel, Regeneration Protocol comment block) as unstaged changes in the working tree, but had not been committed on main. A first read of `scripts/test-rubric-regression.js` returned stale cached content showing the CRAFT-10 era (7-heading / 0-14) assertions; the on-disk file already matched the Plan 13-03 expected shape.
- **Fix:** Verified on-disk content matches Plan 13-03 acceptance criteria (schema_version: 2 assertion, level-3 count == 8, novelty_dedup check, Regeneration Protocol comment) then regenerated the baseline hash exactly as Plan 13-04 Task 2 specified. Plan 13-03's outputs were left as-is in the working tree — Plan 13-03's executor owns committing them.
- **Files modified:** None by this plan beyond what was already in scope.
- **Commits:** n/a (no extra commits produced)

### Note on byte-identical 5-component body

The regenerated hash matches the Phase 10 hash exactly. This is correct: the `extractBody` helper only iterates the five legacy component heading bodies, and none of Plan 13-04's edits touched those bodies. All Phase 13 drift lives in the intro blockquote, the `## Scoring Aggregation` section, and the appended 8th component — none of which participate in the sha256 lock. The regeneration is still meaningful as a book-keeping operation (flipping `phase_13_regenerated` + recording `phase_13_schema_version: 2`) so downstream executors can query the baseline for schema version without re-parsing the rubric frontmatter.

## Known Stubs

None. The rubric file is complete per schema v2; downstream plans consume it as a stable contract.

## Self-Check: PASSED

- `references/captivation-rubric.md` — FOUND (modified file, schema v2 frontmatter + 8 components)
- `fixtures/phase10/baseline-scores.json` — FOUND (schema v2 baseline fields present)
- Commit `85c9a71` — FOUND (feat(13-04) rubric canonicalisation)
- Commit `f1fc3be` — FOUND (chore(13-04) baseline regenerated)
- `node scripts/test-rubric-regression.js --extended` — exit 0
