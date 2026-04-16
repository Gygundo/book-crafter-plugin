# Phase 11 Smoke Test Log

**Run:** 2026-04-16
**Executor:** Claude Code session (plan 11-06)
**Purpose:** PKG-08 — record the three final gates of Phase 11 (validate, release.sh, sample).

## Gate 1: `claude plugin validate .`

**Command:** `claude plugin validate .`
**Exit code:** 0
**Warnings:** 0
**Errors:** 0

<details><summary>Full output</summary>

```
Validating marketplace manifest: /Users/David/Development/book-crafter-plugin/.claude-plugin/marketplace.json

Validation passed
```

</details>

**Result:** PASS

## Gate 2: `bash scripts/release.sh`

**Command:** `rm -rf dist/ && bash scripts/release.sh`
**Exit code:** 0
**Zip:** `dist/book-crafter-v1.1.0.zip`
**Size:** 153878 bytes (~150 KB, ~2.9% of 5 MB cap)
**Gate results:**
  - Gate 1 (version parse): OK (1.1.0)
  - Gate 2 (CHANGELOG [1.1.0]): OK
  - Gate 3 (whitelist copy to staging): OK
  - Gate 3b (adversarial fixture exclusion): OK
  - Gate 4 (name rewrite, staging=book-crafter, repo=book-crafter-dev): OK
  - Gate 5 (claude plugin validate on staging): OK
  - Gate 6 (zip): OK
  - Gate 7 (size <= 5 MB): OK
  - Gate 8 (no /Users/David refs): OK
  - Gate 9 (manifest print): OK (48 files)

**Zip spot-check:**
- Staging `plugin.json`: `"name": "book-crafter"` -- correct
- Repo `plugin.json` (untouched): `"name": "book-crafter-dev"` -- correct
- Staging `marketplace.json` top-level: `"name": "book-crafter-plugin"` -- correct; plugin entry: `"name": "book-crafter"` -- correct
- README begins with `# Book Crafter` and `> **Requires:** Claude Code + Node >=18` -- correct

<details><summary>Full release.sh output</summary>

```
Gate 1 OK: version = 1.1.0
Gate 2 OK: CHANGELOG has [1.1.0]
Gate 3b OK: adversarial fixtures excluded
Gate 3 OK: whitelist copied to staging
Gate 4 OK: staging=book-crafter, repo=book-crafter-dev
Validation passed
Gate 5 OK: claude plugin validate passed
Gate 6 OK: dist/book-crafter-v1.1.0.zip
Gate 7 OK: size 153878 bytes (<= 5MB)
Gate 8 OK: no /Users/David references in zip
=== Manifest === (48 files)
SUCCESS: dist/book-crafter-v1.1.0.zip built (153878 bytes, version 1.1.0)
```

</details>

**Result:** PASS

## Gate 3: `/book-crafter:sample` end-to-end

**First run:**
- Duration: < 5 minutes
- PASS/FAIL: PASS
- Captivation: 16/16 (threshold 10)
- Novelty/dedup: pass (0 flags)
- Schema v2: validated
- .docx path: `fixtures/tiny-book/run/final/The 2am Prayer.docx`

**Threshold recalibration:**
- Starting value: 10
- First-run captivation: 16
- Decision: bump to 11 (captivation >= 13, leaves regression headroom per D-07)

**Result:** PASS

## Phase 11 Verification Summary

| Gate | Requirement | Status |
|------|-------------|--------|
| 1 | `claude plugin validate .` clean (PKG-08, SC-2) | PASS |
| 2 | `scripts/release.sh` produces <5MB zip with no PII (PKG-07, SC-3) | PASS |
| 3 | `/book-crafter:sample` runs end-to-end in ≤5 min (PKG-09, SC-4) | PASS |
| — | README has 3-command install block (PKG-03, SC-1) | PASS (Plan 02 Task 2) |
| — | README zero "Claude Desktop" references (SC-5) | PASS (Plan 02 Task 2) |

All Phase 11 success criteria observable in the shipped repo state.

**Phase 11 → Phase 12 handoff:**
- `evidence/eternally-secure-ch1-before.md` baseline freeze — Phase 12 GATE-01
- Fresh-install smoke test (uninstall dev, install from marketplace) — Phase 12 GATE-06
- README capability language evidence-anchoring — Phase 12 GATE-07
- `git tag v1.1.0` — Phase 12 GATE-09 (blocked on GATE-08 ship decision)

Phase 11 does NOT tag, does NOT finalise README capability line, does NOT run the Eternally Secure re-run. Those are Phase 12 owned.
