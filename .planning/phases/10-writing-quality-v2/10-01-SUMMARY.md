---
phase: 10-writing-quality-v2
plan: 01
subsystem: testing
tags: [node-test, deterministic-checker, regression-lock, sha256, fixtures, craft-rules]

requires:
  - phase: 04-editing
    provides: editor SKILL.md captivation rubric (sections 2.4/2.5/2.5.5/3.3/3.4)
  - phase: 07-captivating-writing
    provides: 5-component captivation scoring framework
provides:
  - scripts/craft-check.js — zero-dep deterministic checker for CRAFT-01/02/05/07/15
  - 6 phase10 fixtures (1 known-good + 5 isolated known-bad)
  - scripts/test-craft-check.js — 13 node:test cases
  - fixtures/phase10/baseline-scores.json — sha256 regression anchor
  - scripts/test-rubric-regression.js — pure-move regression harness
  - references/captivation-rubric.md — extracted single source of truth
affects: [10-02, 10-03, 10-04, 10-05, 10-06, 10-07, 10-08, 10-09]

tech-stack:
  added: [node:test, node:crypto sha256, node:child_process execSync]
  patterns:
    - "Pure-move extraction with sha256 regression lock"
    - "Isolated fixture pattern (each known-bad fails one and only one check)"
    - "Reference delegation via ${CLAUDE_PLUGIN_ROOT}/references/*.md"

key-files:
  created:
    - scripts/craft-check.js
    - scripts/test-craft-check.js
    - scripts/test-rubric-regression.js
    - fixtures/phase10/baseline-scores.json
    - fixtures/phase10/known-good/ch01-draft.md
    - fixtures/phase10/known-bad/ch01-pulpit.md
    - fixtures/phase10/known-bad/ch02-greek-overflow.md
    - fixtures/phase10/known-bad/ch03-no-provenance.md
    - fixtures/phase10/known-bad/ch04-no-version-stamp.md
    - fixtures/phase10/known-bad/ch05-no-reader-thought.md
    - references/captivation-rubric.md
  modified:
    - skills/editor/SKILL.md (delegates §2.4/2.5/2.5.5/3.3/3.4/4.5 to rubric)

key-decisions:
  - "Provenance regex relaxed to /^<!-- provenance: (.+):(\\d+) -->$/ so the four D-19 path forms (sources/, sources-adapted/, book-dna.md, voice-profile.md) all match while the existence check enforces semantic validity"
  - "Version stamp check restricted to first 3 lines (per plan) instead of whole-file scan"
  - "Project root for CRAFT-01 path resolution computed from path.resolve(chapterPath) so the script works whether invoked with relative or absolute fixture paths"
  - "Fixture provenance values use folder-relative paths (e.g. known-good/ch01-draft.md) so two-dirs-up resolution lands inside fixtures/phase10/"
  - "Regression hash covers only the 5 component bodies (not §4.5 aggregation) — Plan 6 extension of aggregation does not need to preserve the same hash"

patterns-established:
  - "Pure-move with hash regression: extract bodies, sha256 the concatenation, lock in baseline JSON, regression test reproduces extraction and asserts equality"
  - "Isolated known-bad fixtures: each failing fixture passes every other check, asserted by fails-only-X test cases"
  - "Editor skill delegates measurement to references/*.md while keeping section headings as anchors"

requirements-completed: [CRAFT-09]

duration: 8min
completed: 2026-04-15
---

# Phase 10 Plan 01: Wave 0 Validation Infrastructure + Captivation Rubric Pure-Move Summary

**Zero-dep craft-check.js with 6 isolated fixtures, 13-test harness, sha256-locked rubric extraction to references/captivation-rubric.md, editor delegating all 5 captivation components.**

## Performance

- **Duration:** ~8 min
- **Tasks:** 3
- **Files created:** 11
- **Files modified:** 1

## Accomplishments

- scripts/craft-check.js runs deterministically across all 5 deterministic CRAFT rules with zero npm dependencies
- 6 fixtures committed under fixtures/phase10/ — known-good plus one isolated failure per check
- 13 node:test cases (1 passing baseline + 5 fail-only-X isolation assertions + per-check positive cases) all green
- baseline-scores.json captures sha256 b78477...59356 over the five pre-extraction component bodies as the regression anchor
- references/captivation-rubric.md is the single source of truth for the 5-component captivation rubric
- scripts/test-rubric-regression.js verifies the extracted rubric reproduces the baseline hash byte-for-byte
- skills/editor/SKILL.md delegates §2.4, §2.5, §2.5.5, §3.3, §3.4 (component checks) and §4.5 (Captivation Score Breakdown aggregation) to the rubric reference, with 6 link references

## Task Commits

1. **Task 1: Wave 0 craft-check.js + fixtures + unit tests** — `9d4a328` (feat)
2. **Task 2: Capture baseline captivation scores + regression harness** — `f994e4b` (feat)
3. **Task 3: Extract captivation rubric (pure move) + update editor skill** — `e1cd968` (feat)

## Files Created/Modified

- `scripts/craft-check.js` — Deterministic CRAFT-01/02/05/07/15 checker, zero deps, JSON output, exit 0/1/2
- `scripts/test-craft-check.js` — 13 node:test cases including 5 fails-only-X isolation tests
- `scripts/test-rubric-regression.js` — Reads baseline-scores.json, re-extracts rubric bodies from references/captivation-rubric.md, sha256 compare
- `fixtures/phase10/baseline-scores.json` — 5 component metadata + sha256 regression hash + extraction algorithm description
- `fixtures/phase10/known-good/ch01-draft.md` — All 5 checks pass; mid-paragraph "So" proves false-positive safety
- `fixtures/phase10/known-bad/ch01-pulpit.md` — Fails CRAFT-05 only ("So let us..." paragraph)
- `fixtures/phase10/known-bad/ch02-greek-overflow.md` — Fails CRAFT-02 only (charis, agape, dunamis, exousia)
- `fixtures/phase10/known-bad/ch03-no-provenance.md` — Fails CRAFT-01 only (no provenance comment line 1)
- `fixtures/phase10/known-bad/ch04-no-version-stamp.md` — Fails CRAFT-15 only (no generated-by stamp in first 3 lines)
- `fixtures/phase10/known-bad/ch05-no-reader-thought.md` — Fails CRAFT-07 only (zero italic reader-thought lines)
- `references/captivation-rubric.md` — Extracted 5-component rubric + Scoring Aggregation section
- `skills/editor/SKILL.md` — §2.4/2.5/2.5.5/3.3/3.4/4.5 collapsed to single delegation lines pointing at the rubric

## Decisions Made

- **Provenance regex relaxed:** Skeleton's PROVENANCE_REGEX was anchored to specific D-19 prefixes; replaced with `/^<!-- provenance: (.+):(\d+) -->$/` so all four D-19 path forms (sources/, sources-adapted/, book-dna.md, voice-profile.md) parse uniformly. Existence check via `fs.existsSync` enforces semantic validity.
- **Version stamp scope:** Plan said "must appear within first 3 lines"; implemented as `split('\n').slice(0,3).join('\n')` then regex-test, instead of whole-file `^...$/m`.
- **Project root resolution:** Used `path.dirname(path.dirname(path.resolve(chapterPath)))` so relative invocations from the project root still resolve to absolute paths correctly.
- **Fixture provenance form:** Self-referencing folder-relative paths (e.g. `known-good/ch01-draft.md`) — when chapter is at `fixtures/phase10/known-good/ch01-draft.md`, two-dirs-up = `fixtures/phase10`, joining yields the same file. Lets fixtures be self-contained without a fake sources/ tree.
- **Hash scope:** Regression hash only covers the 5 component bodies, not §4.5 aggregation. Plan 6 extends the rubric and the aggregation section can evolve without breaking Plan 1's lock; the components themselves remain frozen by the hash.

## Deviations from Plan

None - plan executed exactly as written.

The two regex/scope adjustments above are implementation choices the plan explicitly delegated ("any one of" in D-19, "must appear within first 3 lines" in CRAFT-15 spec). All acceptance criteria satisfied without scope changes.

## Issues Encountered

None. Single iteration on craft-check.js + fixtures, single iteration on rubric extraction, regression hash matched on first attempt.

## Verification Evidence

- `node --test scripts/test-craft-check.js` → 13 pass / 0 fail
- `node scripts/craft-check.js fixtures/phase10/known-good/ch01-draft.md` → exit 0, all 5 checks pass with evidence strings
- `node scripts/craft-check.js fixtures/phase10/known-bad/ch02-greek-overflow.md` → exit 1, CRAFT-02 pass:false, others pass:true
- `node scripts/test-rubric-regression.js` → `PASS: rubric hash matches baseline (b78477f42a59f3d758964162bfc987567e559fa4690333f45b20ebcea9559356)`
- `grep -c "captivation-rubric.md" skills/editor/SKILL.md` → 6 (≥5 required)
- `head -1 scripts/craft-check.js` → `#!/usr/bin/env node`
- `grep -c "require('node:" scripts/craft-check.js` → 2; `grep -c "require('[^n]" scripts/craft-check.js` → 0

## Next Phase Readiness

- Plan 2+ can invoke `scripts/craft-check.js` from editor Pass 1 against any chapter and parse the JSON output
- Plan 6 can extend `references/captivation-rubric.md` (Components section) and the regression test guards against accidental drift in the existing 5 components
- Downstream rule-addition plans can add CRAFT-03/04/06/08 (judgment) without touching the deterministic checker
- No blockers

## Self-Check: PASSED

- scripts/craft-check.js: FOUND
- scripts/test-craft-check.js: FOUND
- scripts/test-rubric-regression.js: FOUND
- fixtures/phase10/baseline-scores.json: FOUND
- fixtures/phase10/known-good/ch01-draft.md: FOUND
- fixtures/phase10/known-bad/ch01-pulpit.md: FOUND
- fixtures/phase10/known-bad/ch02-greek-overflow.md: FOUND
- fixtures/phase10/known-bad/ch03-no-provenance.md: FOUND
- fixtures/phase10/known-bad/ch04-no-version-stamp.md: FOUND
- fixtures/phase10/known-bad/ch05-no-reader-thought.md: FOUND
- references/captivation-rubric.md: FOUND
- Commit 9d4a328: FOUND
- Commit f994e4b: FOUND
- Commit e1cd968: FOUND

---
*Phase: 10-writing-quality-v2*
*Plan: 01*
*Completed: 2026-04-15*
