---
phase: 4
slug: editor-revision-workflow
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-27
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual verification via SKILL.md acceptance criteria + file existence checks |
| **Config file** | none — plugin skills are validated by artifact inspection |
| **Quick run command** | `ls .planning/phases/04-editor-revision-workflow/` |
| **Full suite command** | `bash -c 'for f in skills/editor/SKILL.md agents/chapter-editor.md; do test -f "$f" && echo "OK: $f" || echo "MISSING: $f"; done'` |
| **Estimated runtime** | ~2 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick file existence check
- **After every plan wave:** Run full suite command
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 2 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | EDIT-01 | file+content | `grep 'voice consistency' skills/editor/SKILL.md` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | EDIT-02 | file+content | `grep 'transition' skills/editor/SKILL.md` | ❌ W0 | ⬜ pending |
| 04-01-03 | 01 | 1 | EDIT-03 | file+content | `grep 'theological' skills/editor/SKILL.md` | ❌ W0 | ⬜ pending |
| 04-01-04 | 01 | 1 | EDIT-04 | file+content | `grep 'cross-chapter' skills/editor/SKILL.md` | ❌ W0 | ⬜ pending |
| 04-01-05 | 01 | 1 | EDIT-05 | file+content | `grep 'rolling.window\|rolling window' skills/editor/SKILL.md` | ❌ W0 | ⬜ pending |
| 04-01-06 | 01 | 1 | EDIT-06 | file+content | `grep 'consistency report' skills/editor/SKILL.md` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 1 | ITER-02 | file+content | `grep 'review\|draft review' skills/orchestrator/SKILL.md` | ❌ W0 | ⬜ pending |
| 04-02-02 | 02 | 1 | ITER-03 | file+content | `grep 'revision\|rewrite' skills/editor/SKILL.md` | ❌ W0 | ⬜ pending |
| 04-02-03 | 02 | 1 | ITER-04 | file+content | `grep 'adjacen' skills/editor/SKILL.md` | ❌ W0 | ⬜ pending |
| 04-02-04 | 02 | 1 | ITER-05 | file+content | `ls */revisions/ 2>/dev/null` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `skills/editor/SKILL.md` — editor skill with three-pass pipeline
- [ ] `agents/chapter-editor.md` — chapter-editor subagent definition
- [ ] Orchestrator Stage 4 wiring in `skills/orchestrator/SKILL.md`

*Existing infrastructure covers plugin scaffold and prior skills.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Voice reads as one author | EDIT-01 | Subjective quality assessment | Read 3 consecutive chapters and assess voice consistency |
| Transitions feel natural | EDIT-02 | Subjective reading flow | Read chapter endings → next chapter openings for 3 pairs |
| Theological accuracy | EDIT-03 | Requires domain knowledge | Review flagged passages against theological framework |
| Revision quality | ITER-03 | Requires human judgment | Request a chapter rewrite and assess improvement |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 2s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
