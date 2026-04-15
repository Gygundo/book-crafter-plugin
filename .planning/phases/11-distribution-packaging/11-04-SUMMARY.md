---
phase: 11-distribution-packaging
plan: 04
subsystem: distribution
tags: [release, packaging, build, hygiene]
requirements: [PKG-07]
dependency_graph:
  requires:
    - 11-01-PLAN.md (fixture seed)
    - 11-02-PLAN.md (README + CHANGELOG with [1.1.0] header)
    - 11-03-PLAN.md (plugin.json + marketplace.json with book-crafter-dev identity)
  provides:
    - "scripts/release.sh — whitelist-based release zip builder"
    - "dist/book-crafter-v1.1.0.zip — first clean release artefact"
  affects:
    - "Plan 11-06 (smoke test) — re-runs release.sh as a precondition"
    - "Phase 12 GATE-09 — git tag v1.1.0 will ship the same zip"
tech-stack:
  added: []
  patterns:
    - "Whitelist-not-blacklist file copy (D-27)"
    - "Fail-hard ordered gate sequence (D-26)"
    - "Pure bash + coreutils — no jq, no node, no git ops in release.sh"
    - "mktemp + trap-on-EXIT cleanup pattern"
    - "Dual-identity plugin.json: dev on disk, release in zip via sed rewrite"
key-files:
  created:
    - "scripts/release.sh (115 lines, executable)"
    - "dist/book-crafter-v1.1.0.zip (130,080 bytes, 48 entries) — gitignored artefact"
  modified: []
decisions:
  - "Strip .DS_Store stowaways with find -delete after cp -R, since cp -R drags macOS metadata files in even though they are not in the whitelist"
metrics:
  duration_minutes: 4
  tasks_completed: 1
  files_created: 1
  files_modified: 0
  completed_date: "2026-04-15"
---

# Phase 11 Plan 04: Release Builder Summary

**One-liner:** Whitelist-based release zip builder (`scripts/release.sh`) with 9 fail-hard gates produces a clean 130KB `dist/book-crafter-v1.1.0.zip` containing the dual-identity plugin (release name `book-crafter`) without touching the on-disk dev manifest.

## What Shipped

A single executable shell script, `scripts/release.sh`, plus its first successful artefact, `dist/book-crafter-v1.1.0.zip`. The script is the only Phase 11 component allowed to write to `dist/` and is the canonical builder Phase 12 GATE-09 will run before tagging.

### The 9 Gates (D-26)

| # | Gate | Mechanism | Result |
|---|------|-----------|--------|
| 1 | Extract version from plugin.json | `grep` + `sed` (no jq) | `1.1.0` |
| 2 | CHANGELOG has `## [VERSION]` | `grep -qE "^## \[${VERSION}\]"` | pass |
| 3 | Whitelist copy into staging | explicit `cp` per D-27 entry | 47 source files |
| 4 | Dev→release name rewrite (staging only) | `sed -i.bak` then verify both staging and repo | staging=`book-crafter`, repo=`book-crafter-dev` |
| 5 | `claude plugin validate` (guarded) | `command -v claude` first; warn-and-continue if absent | passed (1 marketplace description warning, non-blocking) |
| 6 | Zip with `-X` to strip xattrs | `(cd $TMPROOT && zip -rX ...)` | `dist/book-crafter-v1.1.0.zip` |
| 7 | Size check ≤ 5 MB | `stat -f%z` (macOS) / `stat -c%s` (Linux) | 130,080 bytes |
| 8 | PII grep for `/Users/David` | `unzip -p ... | grep -c` with `set +e` guard | 0 hits |
| 9 | Print manifest | `unzip -l` | 48 entries |

### D-27 Whitelist (Authoritative)

Directories: `.claude-plugin/`, `skills/`, `agents/`, `references/`.
Individual scripts: `craft-check.js`, `test-craft-check.js`, `test-rubric-regression.js` (NOT the whole `scripts/` dir — `release.sh` itself is intentionally excluded).
Individual fixtures: `fixtures/tiny-book/brief.md`, `fixtures/tiny-book/expected-captivation-score.txt` (NOT `fixtures/tiny-book/run/`, NOT `fixtures/phase10/`).
Top-level docs: `README.md`, `LICENSE`, `CHANGELOG.md`.

### Verified Excluded Paths

`.planning/`, `.git/`, `.DS_Store`, `books/`, `evidence/`, `fixtures/phase10/`, `fixtures/tiny-book/run/`, `dist/`, `DEV-NOTES.md`, `CLAUDE.md`, `scripts/release.sh` itself, `memory/`. The plan's automated verify command (the long `unzip -l | grep -qE` chain) returns `VERIFY PASS`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `.DS_Store` stowaways from `cp -R` defeated Gate 8 conceptually**
- **Found during:** Task 1, first end-to-end run
- **Issue:** macOS `.DS_Store` files inside `skills/` (and elsewhere) were dragged into staging by `cp -R skills "$STAGING/"`. The plan's automated verify command explicitly fails on `\.DS_Store` in the unzip listing, and the acceptance criteria forbid `.DS_Store` entries — but the bare skeleton in the plan had no scrub step.
- **Fix:** Added `find "$STAGING" -name '.DS_Store' -type f -delete` immediately before Gate 4 (after all `cp` operations complete). Repeat run produced a 48-entry zip with zero `.DS_Store` entries; the plan's verify command now returns clean.
- **Files modified:** `scripts/release.sh` (one new line)
- **Commit:** b211e7f (folded into the same task 1 commit)

No other deviations. Gate 5 (`claude plugin validate`) found the CLI on PATH and ran successfully on the first try, producing one non-blocking marketplace description warning that Plan 06 will see again.

## Authentication Gates

None. Pure local build, no network or auth required.

## Self-Check: PASSED

- FOUND: scripts/release.sh (executable)
- FOUND: dist/book-crafter-v1.1.0.zip (130,080 bytes)
- FOUND: commit b211e7f
- VERIFIED: zip contains `book-crafter/.claude-plugin/plugin.json` with `"name": "book-crafter"`
- VERIFIED: on-disk `.claude-plugin/plugin.json` still says `"name": "book-crafter-dev"`
- VERIFIED: zero `/Users/David` references inside zip
- VERIFIED: zero excluded-path entries in zip listing
- VERIFIED: plan's automated verify command returns `VERIFY PASS`
