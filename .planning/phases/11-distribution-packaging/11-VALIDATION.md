---
phase: 11
slug: distribution-packaging
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-15
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> See `11-RESEARCH.md` §Validation Architecture for the authoritative test design.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | bash + node + `claude plugin validate` (no unit test framework — this phase is infrastructure + docs) |
| **Config file** | none — gates are shell scripts |
| **Quick run command** | `bash scripts/release.sh --dry-run` (once implemented) |
| **Full suite command** | `claude plugin validate . && bash scripts/release.sh && unzip -l dist/book-crafter-v1.1.0.zip` |
| **Estimated runtime** | ~30 seconds (excl. `/book-crafter:sample` which is ≤5 min) |

---

## Sampling Rate

- **After every task commit:** Run `claude plugin validate .` if plugin.json / marketplace.json / skills / agents changed
- **After every plan wave:** Run full release.sh dry-run (once script exists) + validate
- **Before `/gsd:verify-work`:** Full release.sh must produce zip, all 9 gates green, `/book-crafter:sample` must PASS end-to-end
- **Max feedback latency:** 30 seconds for schema/zip gates; 5 minutes for sample-skill smoke test

---

## Per-Task Verification Map

Filled by planner. Every task must map to one of:
- **schema**: `claude plugin validate .` exits 0 with no warnings
- **grep**: literal string present/absent in a known file (README, plugin.json, marketplace.json, CHANGELOG)
- **release-gate**: one of the 9 D-26 gates in release.sh exits non-zero on failure fixture
- **smoke**: `/book-crafter:sample` PASS line appears in run log with captivation ≥ threshold
- **manual**: David runs three install commands in fresh Claude Code session (Phase 12 GATE-06 scope, logged here only)

---

## Wave 0 Requirements

- [ ] `fixtures/tiny-book/brief.md` — exists before sample skill can run
- [ ] `fixtures/tiny-book/expected-captivation-score.txt` — single integer threshold
- [ ] `.gitignore` entries for `dist/`, `fixtures/tiny-book/run/`, `DEV-NOTES.md`
- [ ] No new test framework install — phase uses bash + existing `scripts/craft-check.js`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| GitHub repo `gygundo/book-crafter-plugin` exists, public, README install commands resolve | D-01..D-03, PKG-03 | Requires GitHub account action — not scriptable from plan | David runs `gh repo create gygundo/book-crafter-plugin --public` or creates via UI; verify `curl -sI https://github.com/gygundo/book-crafter-plugin` returns 200 |
| Three-command install works in a fresh Claude Code session | PKG-03, SC-1 | Requires a separate Claude Code process — cannot self-test | Phase 12 GATE-06 owns the fresh-install smoke test; Phase 11 only ensures the commands are syntactically correct against the live docs |
| `/book-crafter:sample` first-run vs re-invocation flip (fresh mode phrase) | D-11 | Requires two sequential runs | Run sample once on empty state → expect no "start fresh"; run again with `fixtures/tiny-book/run/` present → expect "start fresh" phrase in orchestrator invocation |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify (schema/grep/release-gate/smoke) or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers fixture creation before sample skill task runs
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s for non-smoke tasks
- [ ] `nyquist_compliant: true` set in frontmatter after planner fills the Per-Task Verification Map

**Approval:** pending
