# Phase 11 Smoke Test Log

**Run:** 2026-04-15
**Executor:** Claude Code session (plan 11-06)
**Purpose:** PKG-08 — record the three final gates of Phase 11 (validate, release.sh, sample).

## Gate 1: `claude plugin validate .`

**Command:** `claude plugin validate .`
**Exit code:** 0
**Warnings:** 0 (after fix)
**Errors:** 0

**Deviation (Rule 2 — missing critical metadata):**
First run emitted one warning: `metadata.description: No marketplace description provided.`
Phase 11 SC-2 requires zero warnings, so `metadata.description` was added to
`.claude-plugin/marketplace.json` before proceeding. Second run is clean.

<details><summary>Full output (post-fix)</summary>

```
Validating marketplace manifest: /Users/David/Development/book-crafter-plugin/.claude-plugin/marketplace.json

✔ Validation passed
```

</details>

<details><summary>First run (pre-fix, for the record)</summary>

```
Validating marketplace manifest: /Users/David/Development/book-crafter-plugin/.claude-plugin/marketplace.json

⚠ Found 1 warning:

  ❯ metadata.description: No marketplace description provided. Adding a description helps users understand what this marketplace offers

✔ Validation passed with warnings
```

</details>

**Result:** PASS

## Gate 2: `bash scripts/release.sh`

**Command:** `rm -rf dist/ && bash scripts/release.sh`
**Exit code:** 0
**Zip:** `dist/book-crafter-v1.1.0.zip`
**Size:** 130187 bytes (~127 KB, ~2.5% of 5 MB cap)
**Gate results:**
  - Gate 1 (version parse): OK (1.1.0)
  - Gate 2 (CHANGELOG [1.1.0]): OK
  - Gate 3 (whitelist copy to staging): OK
  - Gate 4 (name rewrite, staging=book-crafter, repo=book-crafter-dev): OK
  - Gate 5 (claude plugin validate on staging): OK
  - Gate 6 (zip): OK
  - Gate 7 (size <= 5 MB): OK
  - Gate 8 (no /Users/David refs): OK
  - Gate 9 (manifest print): OK (48 files)

**Zip spot-check:**
- Staging `plugin.json`: `"name": "book-crafter"` ✓
- Repo `plugin.json` (untouched): `"name": "book-crafter-dev"` ✓
- Staging `marketplace.json` top-level: `"name": "book-crafter-plugin"` ✓, plugin entry: `"name": "book-crafter"` ✓
- README begins with `# Book Crafter` and `> **Requires:** Claude Code + Node ≥18` ✓

<details><summary>Full release.sh output</summary>

```
Gate 1 OK: version = 1.1.0
Gate 2 OK: CHANGELOG has [1.1.0]
Gate 3 OK: whitelist copied to /var/folders/8b/39qxzn4j1cs5nc3__bvz91hw0000gp/T/book-crafter-release.XXXXXX.5SDpd0JO23/book-crafter
Gate 4 OK: staging=book-crafter, repo=book-crafter-dev
Validating marketplace manifest: /var/folders/8b/39qxzn4j1cs5nc3__bvz91hw0000gp/T/book-crafter-release.XXXXXX.5SDpd0JO23/book-crafter/.claude-plugin/marketplace.json

✔ Validation passed
Gate 5 OK: claude plugin validate passed
Gate 6 OK: /Users/David/development/book-crafter-plugin/dist/book-crafter-v1.1.0.zip
Gate 7 OK: size 130187 bytes (<= 5MB)
Gate 8 OK: no /Users/David references in zip

=== Manifest ===
(48 files listed — see /tmp/phase11-release.log for full archive listing)

SUCCESS: /Users/David/development/book-crafter-plugin/dist/book-crafter-v1.1.0.zip built (130187 bytes, version 1.1.0)
```

</details>

**Result:** PASS
