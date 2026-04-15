---
phase: 10-writing-quality-v2
plan: 06
subsystem: rubric
tags: [rubric, calibration, craft-10, craft-12, regression-lock]
requires:
  - references/captivation-rubric.md (Plan 10-01 extraction + sha256 lock)
  - fixtures/phase10/baseline-scores.json (Plan 10-01 regression baseline)
  - scripts/test-rubric-regression.js (Plan 10-01)
  - 10-CONTEXT.md § D-23 (calibration at score levels 3/6/9)
provides:
  - rubric/craft-density-component
  - rubric/cross-chapter-craft-component
  - rubric/0-14-total-scale
  - rubric/thresholds-table
  - calibration/score-level-3-exemplar
  - calibration/score-level-6-exemplar
  - calibration/score-level-9-exemplar
  - regression/--extended-flag
affects:
  - references/captivation-rubric.md
  - references/bestseller-calibration.md
  - scripts/test-rubric-regression.js
tech-stack:
  added: []
  patterns:
    - additive-rubric-extension (new components appended; legacy bodies byte-identical)
    - regression-lock preserved via sha256 over legacy 5 components only
    - calibration anchored to Phase 7 post-mortem paraphrase, re-anchorable in Phase 12
    - --extended CLI flag pattern (base run stays green for unrelated commits)
key-files:
  created:
    - references/bestseller-calibration.md
  modified:
    - references/captivation-rubric.md
    - scripts/test-rubric-regression.js
decisions:
  - Extended the rubric by appending two new level-3 headings; original five component bodies remain byte-identical so the Plan 10-01 sha256 lock still passes
  - Scoring Aggregation rewritten to 0-14 scale with three-band thresholds (0-6 revise / 7-10 ship / 11-14 strong); legacy 0-10 interpretation noted for downstream readers
  - Craft Density uses two binary sub-checks (central-image zonal presence + seeded vulnerability beat in middle third) that map directly onto CRAFT-02/03/04 per D-04
  - Cross-Chapter Craft is computed once per manuscript in Pass 2 and stamped onto every chapter scorecard — the one rubric component that is not chapter-isolated
  - Calibration file anchors each score level with per-component commentary (including the two new CRAFT-10 columns) rather than just prose + prose — editor LLM gets explicit per-column reasoning
  - --extended flag added to regression harness so commits that touch only the legacy five components (or commits on branches where Plan 10-06 hasn't landed) still have a green base run
metrics:
  duration: 5min
  completed: 2026-04-15
  tasks: 2
  files: 3
requirements: [CRAFT-10, CRAFT-12]
---

# Phase 10 Plan 06: Extend Rubric + Calibration Exemplars Summary

Extended the extracted captivation rubric from 5 components (0-10) to 7 components (0-14) by appending Craft Density and Cross-Chapter Craft without mutating the original five component bodies, and created `references/bestseller-calibration.md` with paraphrased before/after exemplars at score levels 3/6/9 anchored to Phase 7 post-mortem patterns. The Plan 10-01 sha256 regression lock remains green and a new `--extended` CLI flag on the regression harness asserts the CRAFT-10 additions exist.

## What Was Built

### Task 1: Rubric Extension (CRAFT-10)

**`references/captivation-rubric.md`** — Appended two new level-3 component blocks after the existing five:

- **Craft Density** — Two binary sub-checks worth 1 point each: (a) central image present in at least two of the three chapter zones (opening / middle third / closing 200 words), (b) author vulnerability beat in the middle third with a resolved `vulnerability_beat_seed` pointer. Scores 0/1/2.
- **Cross-Chapter Craft** — Two manuscript-level sub-checks: (a) central images distinct across chapters (no two chapters share the same metaphor vehicle), (b) transliterated Greek/Hebrew terms don't fatigue (same 3 terms appearing in ≥3 chapters fails). Computed once per manuscript in Pass 2 and stamped on every chapter scorecard.

The Scoring Aggregation section was rewritten to reflect the 0-14 scale with three bands:
- **0-6:** below craft floor — chapter requires revision
- **7-10:** competent — chapter ships if no auto-revise triggers fired
- **11-14:** strong — bestseller-track quality

A note at the top of the file records that "Rubric extended from 5 to 7 components in CRAFT-10. Original 5-component scores must remain byte-identical on the baseline fixture per CRAFT-09" and explicitly marks the first five component blocks as locked.

**`scripts/test-rubric-regression.js`** — Extended with a `--extended` CLI flag. The base run still computes the sha256 of the original five component bodies and compares it against `baseline.scoring_logic_hash` — unchanged semantics. With `--extended`, the script additionally asserts:
- Craft Density and Cross-Chapter Craft headings exist with non-empty bodies
- The string `0-14` appears in the rubric file (total-range marker)
- The file has exactly 7 level-3 headings

This keeps downstream commits that haven't touched Plan 10-06 green on the base invocation while letting this plan's harness exercise the new components.

### Task 2: Calibration Exemplars (CRAFT-12)

**`references/bestseller-calibration.md`** — 78-line reference with three top-level sections: `## Score Level 3`, `## Score Level 6`, `## Score Level 9`. Each section contains:

- A paraphrased opening paragraph written in the target style for that score
- A per-component breakdown explaining why the exemplar scores what it scores, including the two new CRAFT-10 columns (Craft Density, Cross-Chapter Craft) so editor LLM runs can anchor all seven rubric components
- Cross-reference back to `captivation-rubric.md`
- Maintenance notes pointing to Phase 12 `evidence/eternally-secure-ch1-before.md` for re-anchoring once that artefact exists

All prose is paraphrased — never verbatim from any copyrighted source. The Score Level 3 exemplar reflects the Phase 7 post-mortem patterns (statistical opener, buried central image, Greek overflow, zero vulnerability, pulpit-seam "Let us consider" transition). Score Level 6 hits named-human + time-marker + sensory but still fails Craft Density on seeded vulnerability. Score Level 9 is scene-first with zonal central image and vulnerability beat, though the commentary notes that a true 11+ chapter would land the vulnerability beat inside the middle third rather than front-loading it.

## Verification

```bash
$ node scripts/test-rubric-regression.js
PASS: 5-component rubric hash matches baseline (b78477f42a59f3d758964162bfc987567e559fa4690333f45b20ebcea9559356)

$ node scripts/test-rubric-regression.js --extended
PASS: 5-component rubric hash matches baseline (b78477f42a59f3d758964162bfc987567e559fa4690333f45b20ebcea9559356)
PASS: extended rubric checks (CRAFT-10 additions present, 0-14 documented, 7 components)

$ grep -c "^### " references/captivation-rubric.md
7

$ grep -c "^## Score Level [369]" references/bestseller-calibration.md
3

$ wc -l < references/bestseller-calibration.md
78
```

All acceptance criteria for both tasks pass.

## Deviations from Plan

None — plan executed exactly as written. The Craft Density and Cross-Chapter Craft component blocks were appended verbatim to the specification, the Scoring Aggregation thresholds were updated to the three-band table from the plan, and `bestseller-calibration.md` followed the template in Task 2 including the three score levels, cross-reference, and maintenance section.

## Key Decisions Made

1. **Legacy 5-component hash preservation is achieved by append-only editing.** The original component bodies were not touched; the two new headings are appended after Chapter-Ending Momentum and before Scoring Aggregation. This keeps the sha256 lock from Plan 10-01 green without requiring a hash bump.
2. **Cross-Chapter Craft is manuscript-level but stamped per-chapter.** This is the only rubric component that doesn't score a single chapter in isolation. The commentary in the rubric explicitly notes that editor Pass 2 computes it once and stamps the same value onto every chapter scorecard, so CRAFT-16 diagnostic reads don't need special-case logic.
3. **Calibration commentary includes per-column reasoning for the new CRAFT-10 components.** Rather than just showing paraphrased prose and letting the LLM infer the score, each exemplar spells out why Craft Density and Cross-Chapter Craft score what they score. This gives editor LLM runs an explicit anchor for the two judgment-heavy components.
4. **`--extended` flag keeps base regression green for other branches.** The Plan 10-01 baseline fixture only locks the legacy five components; the base run (no flags) checks only that hash. The extended run asserts the new components exist with non-empty bodies and the 0-14 marker is present. Commits on branches that haven't touched Plan 10-06 continue to pass the base invocation without modification.

## Files Modified

| File | Change | Commit |
|------|--------|--------|
| `references/captivation-rubric.md` | Extended from 5 to 7 components, rewrote Scoring Aggregation to 0-14 scale, added lock notice | 5845a98 |
| `scripts/test-rubric-regression.js` | Added `--extended` flag with new assertions; base run unchanged | 5845a98 |
| `references/bestseller-calibration.md` | Created (78 lines) with score levels 3/6/9 | f5b500c |

## Self-Check: PASSED

- FOUND: references/captivation-rubric.md (7 level-3 headings; 0-14 marker present)
- FOUND: references/bestseller-calibration.md (78 lines; three score levels)
- FOUND: scripts/test-rubric-regression.js (extended mode works)
- FOUND commit: 5845a98 (Task 1 — rubric extension + test harness)
- FOUND commit: f5b500c (Task 2 — bestseller-calibration.md)
- Regression harness: green in both modes
