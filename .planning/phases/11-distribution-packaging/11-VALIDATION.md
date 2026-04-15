---
phase: 11
slug: distribution-packaging
status: draft
nyquist_compliant: true
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
| **Quick run command** | `bash scripts/release.sh` |
| **Full suite command** | `claude plugin validate . && bash scripts/release.sh && unzip -l dist/book-crafter-v1.1.0.zip` |
| **Estimated runtime** | ~30 seconds (excl. `/book-crafter:sample` which is ≤5 min) |

---

## Sampling Rate

- **After every task commit:** Run `claude plugin validate .` if plugin.json / marketplace.json / skills / agents changed
- **After every plan wave:** Run full release.sh + validate
- **Before `/gsd:verify-work`:** Full release.sh must produce zip, all 9 gates green, `/book-crafter:sample` must PASS end-to-end
- **Max feedback latency:** 30 seconds for schema/zip gates; 5 minutes for sample-skill smoke test

---

## Per-Task Verification Map

| Plan | Task | Requirement | Verify Type | Automated Command |
|------|------|-------------|-------------|-------------------|
| 11-01 | T1 Fixture brief | PKG-06 | grep | `grep -q 'The 2am Prayer' fixtures/tiny-book/brief.md && grep -q 'spiritual-default' fixtures/tiny-book/brief.md` |
| 11-01 | T2 Threshold + gitignore | PKG-06 | grep | `grep -qE '^[0-9]+$' fixtures/tiny-book/expected-captivation-score.txt && grep -qx 'dist/' .gitignore && grep -qx 'fixtures/tiny-book/run/' .gitignore` |
| 11-02 | T1 GitHub repo creation | PKG-03 precondition | manual | `curl -sI https://github.com/gygundo/book-crafter-plugin \| head -1` returns 200 |
| 11-02 | T2 README.md | PKG-03 | grep | `grep -qxF 'Writes structured non-fiction books with enforced craft rules.' README.md && ! grep -q 'Claude Desktop' README.md` |
| 11-02 | T3 LICENSE + CHANGELOG | PKG-04, PKG-05 | grep | `grep -q 'MIT License' LICENSE && grep -qE '^## \[1\.1\.0\]' CHANGELOG.md` |
| 11-03 | T1 plugin.json bump | PKG-02 | schema+grep | `node -e 'const m=require("./.claude-plugin/plugin.json");if(m.name!=="book-crafter-dev"\|\|m.version!=="1.1.0"\|\|typeof m.repository!=="string")throw 0'` |
| 11-03 | T2 marketplace.json | PKG-01, PKG-10 | schema+grep | `node -e 'const m=require("./.claude-plugin/marketplace.json");if(m.plugins[0].source!=="./"\|\|m.plugins[0].name!=="book-crafter"\|\|"version" in m)throw 0'` |
| 11-04 | T1 release.sh | PKG-07 | release-gate | `bash scripts/release.sh && test -f dist/book-crafter-v1.1.0.zip && ! unzip -p dist/book-crafter-v1.1.0.zip \| grep -q '/Users/David'` |
| 11-05 | T1 sample skill | PKG-09 | grep | `grep -q 'SAMPLE PASS' skills/sample/SKILL.md && grep -q 'start fresh' skills/sample/SKILL.md && grep -q 'fixtures/tiny-book/brief.md' skills/sample/SKILL.md` |
| 11-06 | T1 validate run | PKG-08 | schema | `claude plugin validate .` exits 0 |
| 11-06 | T2 release.sh run | PKG-07 (SC-3) | release-gate | `rm -rf dist && bash scripts/release.sh && test -f dist/book-crafter-v1.1.0.zip` |
| 11-06 | T3 sample run | PKG-09 (SC-4) | smoke | `/book-crafter:sample` prints `SAMPLE PASS` with captivation ≥ threshold |
| 11-06 | T4 smoke log finalise | all SC | grep | `grep -q 'Phase 11 Verification Summary' .planning/phases/11-distribution-packaging/11-SMOKE-TEST.md` |

---

## Wave 0 Requirements

- [x] `fixtures/tiny-book/brief.md` — Plan 11-01 T1 (before sample skill can run in Plan 11-05/11-06)
- [x] `fixtures/tiny-book/expected-captivation-score.txt` — Plan 11-01 T2
- [x] `.gitignore` entries for `dist/`, `fixtures/tiny-book/run/`, `DEV-NOTES.md` — Plan 11-01 T2
- [x] No new test framework install — phase uses bash + existing `scripts/craft-check.js`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| GitHub repo `gygundo/book-crafter-plugin` exists, public | D-01..D-03, PKG-03 | Requires GitHub account action — not scriptable from plan | Plan 11-02 T1 checkpoint; David runs `gh repo create gygundo/book-crafter-plugin --public`; verify `curl -sI https://github.com/gygundo/book-crafter-plugin` returns 200 |
| Three-command install works in a fresh Claude Code session | PKG-03, SC-1 | Requires a separate Claude Code process | Phase 12 GATE-06 owns the fresh-install smoke test; Phase 11 only ensures the commands are syntactically correct against the live docs |
| `/book-crafter:sample` end-to-end PASS | PKG-09, SC-4 | Runs the full pipeline (≤5 min) | Plan 11-06 T3 checkpoint; requires David to invoke `/book-crafter:sample` in Claude Code and confirm PASS line + .docx existence |
| `/book-crafter:sample` first-run vs re-invocation flip (fresh mode phrase) | D-11 | Requires two sequential runs | Plan 11-06 T3 optional second run — invoke again with `fixtures/tiny-book/run/` present → expect "start fresh" phrase in orchestrator invocation |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify (schema/grep/release-gate/smoke) or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers fixture creation before sample skill task runs (Plan 11-01 is Wave 1; sample skill Plan 11-05 is Wave 3, depends_on includes 11-01)
- [x] No watch-mode flags
- [x] Feedback latency < 30s for non-smoke tasks
- [x] `nyquist_compliant: true` set in frontmatter — Per-Task Verification Map filled

**Approval:** ready
