---
phase: 6
slug: content-enhancements
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-27
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual validation (Claude Code plugin -- no automated test runner) |
| **Config file** | None -- plugin is SKILL.md-based, validated by execution |
| **Quick run command** | Manual: invoke orchestrator with test sermon sources |
| **Full suite command** | Manual: full pipeline run with sermon source material |
| **Estimated runtime** | ~5-10 minutes (full pipeline with enrichments) |

---

## Sampling Rate

- **After every task commit:** Read generated enrichment files and verify content quality
- **After every plan wave:** Full pipeline run with sermon source material
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** Manual review

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | ENH-01 | manual | Provide sermon .md files in sources/, verify sources-adapted/ generated | N/A | ⬜ pending |
| 06-01-02 | 01 | 1 | ENH-02 | manual | Compare sources/ and sources-adapted/ for transformation evidence | N/A | ⬜ pending |
| 06-02-01 | 02 | 1 | ENH-03 | manual | Read enrichments/ch[NN]-enrichments.md, verify questions reference specific chapter content | N/A | ⬜ pending |
| 06-02-02 | 02 | 1 | ENH-04 | manual | Read enrichments/ch[NN]-enrichments.md, compare summary to chapter content | N/A | ⬜ pending |
| 06-02-03 | 02 | 1 | ENH-05 | manual | Read enrichments/ch[NN]-enrichments.md, verify prayer points reference specific revelations; verify skipped for non-theological | N/A | ⬜ pending |
| 06-02-04 | 02 | 1 | ENH-06 | manual | Read front-matter/foreword.md, verify no chapter-specific spoilers | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `skills/sermon-adapter/SKILL.md` -- new skill for ENH-01, ENH-02
- [ ] `skills/enricher/SKILL.md` -- new skill for ENH-03, ENH-04, ENH-05, ENH-06
- [ ] Orchestrator updates to wire sermon-adapter and enricher into pipeline
- [ ] Formatter updates to render enrichment content in .docx
- [ ] Pipeline-stages.md updates to document Stage 0.5 and Stage 4.5

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Sermon fragments become complete sentences | ENH-02 | Content quality judgment -- no automated metric for "reads like written prose" | Compare sources/ and sources-adapted/ side by side; verify fragments expanded to complete sentences |
| Discussion questions pass cliche test | ENH-03 | Specificity judgment -- each question must reference unique chapter content | Read questions, verify each references a specific concept/scripture/argument from that chapter |
| Prayer points connected to chapter revelation | ENH-05 | Theological accuracy -- prayer must respond to specific revelations | Read prayer points, verify each references specific chapter content and is addressed to God |
| Foreword frames purpose without spoiling | ENH-06 | Creative judgment -- foreword must tease without revealing | Read foreword, verify it answers "why this book exists" not "what each chapter says" |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < manual review
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
