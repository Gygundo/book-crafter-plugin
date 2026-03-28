---
phase: 8
slug: voice-builder-skill-analyse-source-content-to-generate-custom-voice-profiles
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-28
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual verification (skill produces .md artifacts — no unit test framework needed) |
| **Config file** | none |
| **Quick run command** | `ls references/voice-profiles/*.md` |
| **Full suite command** | `cat references/voice-profiles/voice-profile-spec.md && ls -la references/voice-profiles/` |
| **Estimated runtime** | ~2 seconds |

---

## Sampling Rate

- **After every task commit:** Run `ls references/voice-profiles/*.md`
- **After every plan wave:** Run full suite command
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 08-01-01 | 01 | 1 | D-01..D-11 | file check | `test -f skills/voice-builder/SKILL.md` | ❌ W0 | ⬜ pending |
| 08-01-02 | 01 | 1 | D-05..D-08 | content check | `grep -c "Two-Pass\|Pass 1\|Pass 2" skills/voice-builder/SKILL.md` | ❌ W0 | ⬜ pending |
| 08-01-03 | 01 | 1 | D-09 | content check | `grep -c "review\|approve\|adjust" skills/voice-builder/SKILL.md` | ❌ W0 | ⬜ pending |
| 08-02-01 | 02 | 1 | D-12..D-14 | content check | `grep -c "voice-builder\|Build from source" skills/orchestrator/SKILL.md` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `skills/voice-builder/SKILL.md` — voice builder skill file (created in Wave 1)

*Existing infrastructure covers framework needs — skill creates .md voice profiles validated against voice-profile-spec.md.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Generated profile matches voice-profile-spec structure | D-05..D-10 | Output quality requires human review | Run builder on test corpus, compare output sections to spec |
| INFERRED markers on low-confidence sections | D-03 | Requires small corpus to trigger | Run builder on <5 files, verify INFERRED markers appear |
| Orchestrator fifth option flow | D-14 | Interactive user flow | Invoke orchestrator, select "Build from source material", verify builder runs |

*All phase behaviors that produce prose quality require manual verification.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
