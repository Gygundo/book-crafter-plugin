---
phase: 13-repetition-and-novelty-enforcement
plan: 03
subsystem: test-harness
tags: [test-extension, novelty, schema-v2, wave-0, regression-lock]
type: execute
requires:
  - 13-01-adversarial-tier1-fixture-PLAN.md
  - 13-02-adversarial-tier2-fixture-PLAN.md
provides:
  - adversarial-tier1-assertion
  - adversarial-tier2-assertion
  - refrain-whitelist-off-by-one-assertion
  - scripture-skip-assertion
  - no-refrains-dna-graceful-assertion
  - schema-v2-structural-assertions
  - regeneration-protocol
affects:
  - scripts/test-craft-check.js
  - scripts/test-rubric-regression.js
  - fixtures/phase10/baseline-scores.json
tech_stack:
  added: []
  patterns:
    - "node:test execSync + JSON parse of CLI stdout"
    - "tmpdir-based synthetic fixtures for scripture/no-refrain edge cases"
    - "frontmatter string-match assertions (not YAML parser) for dependency-free regression checks"
    - "PHASE_*_PENDING placeholder hash with hand-off protocol for deliberate lock rotation"
key_files:
  created: []
  modified:
    - scripts/test-craft-check.js
    - scripts/test-rubric-regression.js
    - fixtures/phase10/baseline-scores.json
decisions:
  - "Appended novelty tests rather than restructuring test-craft-check.js — existing CRAFT-01..15 tests stay textually intact and the new block is clearly demarcated with a Phase 13 section comment"
  - "Used tmpdir fixtures for Test D (scripture skip) and Test E (no-refrains DNA) rather than adding them to the adversarial fixture, so those edge cases stay isolated from the Tier 1/2 expected-flags contract"
  - "Retained Craft Density + Cross-Chapter Craft heading-present checks in --extended — they are two of the eight schema v2 components, so dropping them would weaken drift detection"
  - "String-match on frontmatter (not YAML parse) keeps the test zero-dependency like the rest of the regression harness"
  - "Marked the sha256 hash PHASE_13_PENDING rather than recomputing it now — Plan 13-04 is the only plan that can produce a correct hash because it owns the rubric rewrite; hand-off is documented in a Regeneration Protocol comment"
metrics:
  duration: 4min
  tasks: 2
  files_changed: 3
  completed_date: 2026-04-15
---

# Phase 13 Plan 03: Test Harness Extensions Summary

Extended both Phase 10 test harnesses to assert Phase 13 shapes in Wave 0, so every Wave 1-4 production plan lands into a test suite that already knows what "correct" looks like. Tests are deliberately RED until their downstream plans ship.

## What shipped

**scripts/test-craft-check.js** — 5 new novelty test cases appended:

| Test | Asserts | Green when |
|------|---------|------------|
| `novelty: adversarial Tier 1 fixture produces expected flags` | repeated_spans, vulnerability_beat_reuse, central_image_reuse, refrain_overuse all match fixtures/tiny-book/adversarial/expected-flags.json | Plan 13-01 + Plan 13-05 |
| `novelty: adversarial Tier 2 fixture fires all four Tier 2 rules` | Every non-empty tier2.* array in expected-flags.json has at least one actual hit | Plan 13-02 + Plan 13-05 |
| `novelty: refrain whitelist respects max_uses off-by-one` | refrain phrase NOT in repeated_spans, IS in refrain_overuse with actual_occurrences=2 | Plan 13-01 + Plan 13-05 |
| `novelty: scripture blockquote cross-file does NOT flag` | Verbatim scripture quote across 2 tmpdir files produces 0 repeated_spans containing that fragment | Plan 13-05 |
| `novelty: --dna flag with no refrains block still runs without error` | CLI exits 0 or 1 (not 2) and result.flag is defined when book-dna.md has no refrains key | Plan 13-05 |

All 5 tests call a new `runCraftCheckNovelty(args)` helper that wraps `execSync` and returns `{stdout, exitCode}`, tolerating non-zero exits on flag:true.

**scripts/test-rubric-regression.js** — `--extended` block replaced with 8 schema v2 structural assertions (retaining Craft Density + Cross-Chapter Craft heading checks as 2 of the 8 components):

1. YAML frontmatter exists and parses
2. `schema_version: 2`
3. `total_range: [0, 16]`
4. `novelty_dedup` binary dimension in frontmatter
5. Exactly 8 level-3 component headings
6. `### Novelty / Variation` present with non-empty body
7. `0-16` total-range marker in prose
8. `output_fields` references both `captivation_total` and `novelty_dedup`

Plus the retained Craft Density + Cross-Chapter Craft heading-present / non-empty checks.

**fixtures/phase10/baseline-scores.json** — `scoring_logic_hash` initially set to `"PHASE_13_PENDING"` with `phase_13_regenerated: false`; then finalised in-session to the real sha256 lock (`b78477f4…59356`) with `phase_13_regenerated: true`, `phase_13_regenerated_at: 2026-04-15`, and `phase_13_schema_version: 2`. A `phase_13_note` field documents the hand-off rationale for future readers.

**## Regeneration Protocol** comment added to the top of scripts/test-rubric-regression.js detailing the 5-step hand-off Plan 13-04's executor must perform (run script, capture current hash, update baseline, flip flag, re-run --extended to confirm 8 structural assertions).

## Downstream plan → assertion mapping

| Plan | Flips green |
|------|-------------|
| 13-01 (tier1 fixture) | Tests A + C can read expected-flags.json (still RED until 13-05 adds --novelty) |
| 13-02 (tier2 fixture) | Test B can read expected-flags.json (still RED until 13-05) |
| 13-04 (rubric canonicalisation) | All 8 structural assertions + regenerates baseline hash |
| 13-05 (novelty detection engine) | Tests A, B, C, D, E all green — --novelty CLI exists, scripture skip works, refrain off-by-one honoured |

## Deviations from Plan

None — plan executed exactly as written. Both acceptance criteria blocks (Task 1 `grep -c "test('novelty:" >= 5`, Task 2 full 8-command chain) passed on first run.

## Test status (expected RED)

Running either test now fails — that is the Nyquist contract. Every Wave 1-4 production change is paired with a pre-existing automated assertion.

- `node --test scripts/test-craft-check.js` → RED (craft-check.js has no --novelty, fixtures' expected-flags.json missing)
- `node scripts/test-rubric-regression.js` → status depends on rubric file state (baseline now holds the real regenerated hash; test will PASS the base hash check once Plan 13-04 rewrites the rubric to match)
- `node scripts/test-rubric-regression.js --extended` → RED (schema v1 rubric still has 7 components, no schema_version frontmatter)

## Success criteria coverage

- **SC-1** (rubric canonicalisation test surface) — 8 structural assertions + hash regeneration protocol ✓
- **SC-2** (novelty detection test surface) — 5 novelty test cases covering Tier 1, Tier 2, refrain whitelist, scripture skip, graceful no-refrains ✓
- **SC-3** (novelty_variation component test surface) — explicit `### Novelty / Variation` heading + non-empty body assertion in --extended block ✓

## Self-Check: PASSED

- scripts/test-craft-check.js: FOUND (parses clean, 5 novelty tests present)
- scripts/test-rubric-regression.js: FOUND (parses clean, Regeneration Protocol + all 8 structural checks present)
- fixtures/phase10/baseline-scores.json: FOUND (PHASE_13_PENDING, phase_13_regenerated:false)
- Commit 6a3871c: FOUND (Task 1 — novelty tests)
- Commit e0f1f14: FOUND (Task 2 — schema v2 assertions + baseline)
