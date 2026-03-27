---
phase: 1
slug: plugin-foundation-orchestrator
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-27
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual verification (plugin skill files, no runtime code) |
| **Config file** | none — no test framework needed for skill/config files |
| **Quick run command** | `node -e "JSON.parse(require('fs').readFileSync('.claude-plugin/plugin.json','utf8'))"` |
| **Full suite command** | `ls skills/*/SKILL.md && cat .claude-plugin/plugin.json \| node -e "JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'))"` |
| **Estimated runtime** | ~1 second |

---

## Sampling Rate

- **After every task commit:** Run quick validation (JSON parse check)
- **After every plan wave:** Run full suite (all skill files exist + valid JSON)
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 1 second

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | FOUND-01 | file check | `test -f .claude-plugin/plugin.json` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | FOUND-01 | json parse | `node -e "JSON.parse(require('fs').readFileSync('.claude-plugin/plugin.json','utf8'))"` | ❌ W0 | ⬜ pending |
| 01-01-03 | 01 | 1 | FOUND-06 | file check | `ls skills/*/SKILL.md` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | FOUND-02 | file check | `test -f skills/book-orchestrator/SKILL.md` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 1 | FOUND-03 | grep | `grep -q "book-projects" skills/book-orchestrator/SKILL.md` | ❌ W0 | ⬜ pending |
| 01-02-03 | 02 | 1 | FOUND-04 | grep | `grep -q "status" skills/book-orchestrator/SKILL.md` | ❌ W0 | ⬜ pending |
| 01-02-04 | 02 | 1 | FOUND-05 | grep | `grep -q "resume" skills/book-orchestrator/SKILL.md` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `.claude-plugin/plugin.json` — plugin manifest
- [ ] `skills/book-orchestrator/SKILL.md` — orchestrator skill

*Phase 1 creates the foundational files — Wave 0 is effectively the phase itself.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Plugin recognised across Claude Code surfaces | FOUND-06 | Requires running Claude Code on different surfaces | Install plugin, verify skill appears in CLI + desktop + web |
| Orchestrator chains pipeline stages | FOUND-02 | Requires invoking the skill and observing pipeline flow | Run orchestrator with a test topic, verify it attempts each stage |
| Resume from interrupted state | FOUND-05 | Requires simulating interruption mid-pipeline | Start a book, interrupt, re-invoke, verify correct stage detected |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 1s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
