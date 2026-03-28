---
phase: 9
slug: wire-sermon-adapter-to-outliner
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-28
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual inspection (SKILL.md is a markdown instruction file, not executable code) |
| **Config file** | N/A |
| **Quick run command** | `grep -n "sources-adapted" skills/outliner/SKILL.md` |
| **Full suite command** | `grep -n "sources" skills/outliner/SKILL.md` (visual review of all source directory references) |
| **Estimated runtime** | ~1 second |

---

## Sampling Rate

- **After every task commit:** Run `grep -n "sources-adapted" skills/outliner/SKILL.md`
- **After every plan wave:** Run `grep -n "sources" skills/outliner/SKILL.md` and verify all references are correct
- **Before `/gsd:verify-work`:** Full visual review of Section 2, Section 4.1, and Section 4.5
- **Max feedback latency:** 1 second

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 09-01-01 | 01 | 1 | OUTL-06, ENH-01, ENH-02 | manual-only | `grep -c "sources-adapted" skills/outliner/SKILL.md` (>= 3) | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. This is a SKILL.md text edit — no test framework needed.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Outliner Section 2 prefers sources-adapted/ | OUTL-06 | SKILL.md is instruction text, not executable code | Read Section 2: verify three-step check (sources-adapted/ -> sources/ -> Topic Brief) |
| Outliner Section 4.1 reads resolved directory | ENH-01 | Same | Read Section 4 Step 1: verify it references "source directory identified in Section 2" |
| Fallback to sources/ still works | ENH-02 | Same | Read Section 2: verify step 2 falls back to sources/ when sources-adapted/ absent |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 1s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
