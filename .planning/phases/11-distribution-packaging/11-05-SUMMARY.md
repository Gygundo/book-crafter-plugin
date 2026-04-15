---
phase: 11-distribution-packaging
plan: 05
subsystem: distribution
tags: [sample, smoke-test, fixture, orchestrator, packaging]
requires:
  - 11-01  # tiny-book fixture (brief + expected-captivation-score)
  - skills/orchestrator/SKILL.md  # invoked programmatically via Agent
  - scripts/craft-check.js  # degraded fallback path
provides:
  - skills/sample/SKILL.md  # /book-crafter:sample end-to-end demo
affects:
  - release.sh  # Plan 04: skills/ whitelist will ship sample skill
  - 11-06  # Plan 06 will run the sample skill as final smoke-test
tech-stack:
  added: []
  patterns:
    - "Filesystem-as-state re-invocation (run/ existence triggers Mode 6 fresh)"
    - "Phrase-triggered fresh run ('start fresh' in invocation prompt, not CLI flag)"
    - "Locked machine-greppable PASS/FAIL output line for release-gate parsing"
key-files:
  created:
    - skills/sample/SKILL.md
  modified: []
decisions:
  - Sample skill owns the .docx output path override (fixtures/tiny-book/run/final/) — orchestrator default ~/Documents/Books/ is overridden via the explicit project path in §3 invocation prompt, not via orchestrator config
  - Primary captivation source is consistency-report.md N/14; craft-check.js is a degraded fallback only (covers 5 of 14 components)
  - Failure-reason ordering is locked in §5 (first-match-wins) so future release.sh grep gating sees stable strings
metrics:
  duration: ~3 min
  completed: 2026-04-15
---

# Phase 11 Plan 05: Sample Skill — /book-crafter:sample End-to-End Demo Summary

Created `skills/sample/SKILL.md`, a one-command end-to-end smoke-test skill that runs the full Book Crafter pipeline against the built-in `fixtures/tiny-book/` fixture and emits a single machine-greppable PASS/FAIL line with the captivation score, satisfying PKG-09 and contracts D-09..D-13 + D-22.

## What Was Built

A 149-line `SKILL.md` with:

1. **Frontmatter** matching the orchestrator skill convention (`name: sample`, broad trigger `description`, `allowed-tools: Read, Write, Bash, Grep, Glob, Agent`).
2. **§1 Locate the fixture** — resolves brief + threshold via `${CLAUDE_PLUGIN_ROOT}/fixtures/tiny-book/`, fails fast with `SAMPLE FAIL — fixture brief|threshold missing` if either is absent.
3. **§2 Detect re-invocation** — checks for `fixtures/tiny-book/run/` directory. Absent → first run, normal invocation. Present → re-run, inject the literal phrase **"start fresh"** into the orchestrator invocation prompt (Mode 6 trigger per research finding #5; phrase-based, not CLI flag).
4. **§3 Invoke the orchestrator** — uses the `Agent` tool to spawn `book-crafter:orchestrator` with project path `fixtures/tiny-book/run/`, brief from the fixture, voice `spiritual-default`, tier `booklet`, **Full Pipeline no review gates**, and an explicit instruction to write the final `.docx` to `fixtures/tiny-book/run/final/` (overrides the orchestrator default `~/Documents/Books/`).
5. **§4 Compute captivation** — reads `reports/consistency-report.md` for the `N/14` total, with `craft-check.js` as a degraded fallback (and an explicit caveat that craft-check covers only 5 of 14 components).
6. **§5 Compare and emit** — reads threshold integer `M`, locks the PASS/FAIL formats verbatim, lists six ordered failure reasons (first-match-wins).
7. **§6 Exit code** — PASS → 0, FAIL → 1 for future `release.sh` integration.
8. **Non-Negotiables** — restates D-09 (no gates), D-11 (no auto-fresh on first run), D-10 (no output outside run/), D-22 (release identity only), D-12 (single PASS/FAIL line).

## Deviations from Plan

None — plan executed exactly as written. One trivial in-flight catch during self-verification: an early draft used the literal string `book-crafter-dev` inside the Non-Negotiables paragraph to describe what MUST NOT appear, which itself tripped the `! grep -q 'book-crafter-dev'` automated check. Reworded to "the dev-time on-disk identifier" without changing the intent. Recorded here for completeness, not as a Rule deviation (the verification check correctly caught the contradiction before commit).

## Verification

Plan-defined automated check:

```
test -f skills/sample/SKILL.md
head -20 SKILL.md grep ^name: sample$
head -20 SKILL.md grep ^description:
head -20 SKILL.md grep ^allowed-tools:
grep fixtures/tiny-book/brief.md
grep fixtures/tiny-book/expected-captivation-score.txt
grep fixtures/tiny-book/run/
grep spiritual-default
grep "start fresh"
grep SAMPLE PASS
grep SAMPLE FAIL
grep captivation
grep book-crafter:orchestrator
! grep book-crafter-dev
wc -l >= 60   (actual: 149)
```

All 15 acceptance criteria green.

## Acceptance Criteria

- [x] `skills/sample/SKILL.md` exists
- [x] Frontmatter has `name: sample`, `description:`, `allowed-tools:`
- [x] Body references `fixtures/tiny-book/brief.md` and `fixtures/tiny-book/expected-captivation-score.txt`
- [x] Body references `fixtures/tiny-book/run/` (output location + re-invocation detection)
- [x] Body references `spiritual-default` voice profile
- [x] Body includes the phrase `start fresh` (Mode 6 re-run trigger per research finding #5)
- [x] Body includes `SAMPLE PASS` and `SAMPLE FAIL` format templates
- [x] Body references `book-crafter:orchestrator`
- [x] Body does NOT contain `book-crafter-dev`
- [x] File is ≥ 60 lines (actual: 149)

## Key Decisions

- **Path-override ownership.** The sample skill, not the orchestrator, owns the `.docx` output path override. The invocation prompt in §3 instructs the formatter to write to `fixtures/tiny-book/run/final/` in plain language. This keeps the orchestrator unmodified and confines all fixture-specific behaviour to the sample skill.
- **Captivation source-of-truth hierarchy.** Primary = `consistency-report.md` `N/14` total (covers all 14 components, written by the editor). Fallback = `craft-check.js` (deterministic, but only covers 5 of 14 components). The skill body documents this asymmetry explicitly so future maintainers don't replace the report read with craft-check.
- **Locked failure-reason ordering.** The six failure-reason strings are listed in priority order (fixture missing → orchestrator failure → docx missing → report missing → score below threshold). First-match-wins so release.sh grep patterns are stable.
- **Phrase, not flag.** Mode 6 fresh-run is triggered by the literal phrase "start fresh" in the orchestrator invocation prompt — not a CLI argument. The skill encodes this as a conditional inclusion in §2/§3 so first runs never accidentally trigger a fresh wipe.

## Downstream Impact

- **Plan 11-04 (release.sh):** `skills/sample/` is now eligible for inclusion in the `skills/` whitelist. Plan 04's release.sh tarball will pick up the new directory automatically.
- **Plan 11-06 (release smoke-test):** Plan 06 will run `/book-crafter:sample` end-to-end as the final acceptance test. The PASS/FAIL contract defined here is the input to that gate.
- **Phase 12 (release gate):** Future `release.sh` Gate 3+ integration can grep `^SAMPLE PASS` / `^SAMPLE FAIL` directly without parsing JSON.

## Self-Check: PASSED

- `skills/sample/SKILL.md` — FOUND (149 lines)
- Commit `407e722` — FOUND in `git log`
- All 15 plan acceptance criteria green
- Frontmatter conforms to orchestrator skill convention
- D-09..D-13 and D-22 contract points all present in body
- No `book-crafter-dev` references
- No stubs (skill is fully specified, no placeholders or TODOs)
