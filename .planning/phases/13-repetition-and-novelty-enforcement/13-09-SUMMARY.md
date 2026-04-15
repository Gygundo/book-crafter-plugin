---
phase: 13-repetition-and-novelty-enforcement
plan: 09
subsystem: sample-gate
tags: [sample, release-gate, captivation, novelty, schema-v2]
requires: [13-04, 13-06]
provides: [canonical-yaml-consumer, d05-four-variant-output, threshold-0-16]
affects: [skills/sample/SKILL.md, fixtures/tiny-book/expected-captivation-score.txt]
tech-stack:
  added: []
  patterns: [column-0-yaml-grep, binary-gate-both-conditions, four-variant-output-format]
key-files:
  created: []
  modified:
    - skills/sample/SKILL.md
    - fixtures/tiny-book/expected-captivation-score.txt
decisions:
  - "§4 reads schema_version, captivation_total, novelty_dedup via column-0 anchored grep — no jq dependency, no prose grep"
  - "Phase 11 craft-check.js fallback removed from §4 — canonical YAML is single source of truth per D-24"
  - "Threshold bumped 8 → 10 (D-28 recommendation for 0-16 scale)"
  - "D-12 single-line format superseded by D-05 four-variant format (PASS, FAIL captivation, FAIL novelty, FAIL both)"
  - "PASS requires BOTH captivation_total >= threshold AND novelty_dedup == pass (binary gate, no soft-warn)"
metrics:
  duration: ~6min
  completed: 2026-04-15
---

# Phase 13 Plan 09: Sample Skill YAML Reader Summary

Replace sample skill's prose grep with structured column-0 YAML read against the editor's canonical `## Captivation Score` block; implement the D-05 four-variant PASS/FAIL output format; bump the release threshold to 10/16. This closes the "14/14 with duplicates ships" failure mode on the consumer side — plans 13-04 (rubric schema v2) and 13-06 (editor emit) made canonical YAML available; this plan makes the release gate READ it.

## What Changed

### Task 1 — skills/sample/SKILL.md §4

- Replaced the Phase 11 prose grep (`grep -Eo 'Captivation[^0-9]*([0-9]+)/14'`) with three column-0 anchored greps:
  - `SCHEMA=$(grep -E '^schema_version:' ...)`
  - `N=$(grep -E '^captivation_total:' ...)`
  - `DEDUP=$(grep -E '^novelty_dedup:' ...)`
- Added four hard-fail validation steps: missing report, schema_version != 2, unparseable captivation_total, novelty_dedup not pass/fail.
- Added `FLAG_COUNT` awk extraction from `novelty_dedup_flags` block (used in §5 FAIL messages).
- Removed the Phase 11 `craft-check.js` degraded fallback entirely — no fallback, canonical YAML or hard-fail.
- Added §4.1 "Column-0 contract" documenting that all four anchor lines must live at column 0 (Pitfall 4: early failure over silent drift).
- Commit: `e585181`

### Task 2 — skills/sample/SKILL.md §5 + fixture

- Bumped `fixtures/tiny-book/expected-captivation-score.txt` from `8` to `10` to match D-28 recommendation on the 0-16 scale.
- Rewrote §5 gate to evaluate BOTH conditions:
  - `CAPTIVATION_OK=1` iff `N >= M`
  - `NOVELTY_OK=1` iff `DEDUP == pass`
- Emits the four D-05 variants:
  - PASS: `SAMPLE PASS — .docx at <path>, captivation N/16 (threshold M), novelty_dedup pass`
  - FAIL captivation only: `SAMPLE FAIL — captivation N/16 below threshold M (see ...)`
  - FAIL novelty only: `SAMPLE FAIL — novelty_dedup fail: K flags (see ... §novelty_dedup_flags)`
  - FAIL both: `SAMPLE FAIL — captivation N/16 below threshold M AND novelty_dedup fail: K flags`
- Updated the failure reason list to 10 entries (added schema_version mismatch, parse failure, novelty_dedup parse failure, captivation below threshold, novelty_dedup fail).
- Updated D-12 references to D-05 (Phase 13 supersedes Phase 11 format).
- Commit: `8299bd6`

## Verification

- `grep -c "grep -E '\^captivation_total:'" skills/sample/SKILL.md` = 1
- `grep -c "grep -E '\^novelty_dedup:'" skills/sample/SKILL.md` = 1
- `grep -c 'FLAG_COUNT' skills/sample/SKILL.md` passes
- `grep -cE "Captivation\[\^0-9\]\*\(\[0-9\]\+\)/14" skills/sample/SKILL.md` = 0 (stale prose grep purged)
- `grep -c 'SAMPLE PASS — .docx at' skills/sample/SKILL.md` = 2 (bash + prose spec)
- `grep -c 'SAMPLE FAIL — captivation' skills/sample/SKILL.md` = 4 (appears in FAIL captivation + FAIL both bash and prose)
- `grep -c 'SAMPLE FAIL — novelty_dedup fail:' skills/sample/SKILL.md` = 2
- `cat fixtures/tiny-book/expected-captivation-score.txt` = `10`
- `/14` references in §4-§5 range: 0 (verified via awk-bounded grep)
- `D-05` appears 7 times in skills/sample/SKILL.md

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- skills/sample/SKILL.md exists and contains expected YAML grep anchors, D-05 variants, FLAG_COUNT, §4.1 column-0 contract, and /16 references.
- fixtures/tiny-book/expected-captivation-score.txt contains `10`.
- Both commits present in `git log`: `e585181`, `8299bd6`.
- Zero remaining `/14` references in §4–§5.
- craft-check.js fallback invocation removed from §4 (one remaining mention is the explanatory prose saying it was removed — not an invocation).
