---
phase: 3
slug: research-chapter-writing
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-27
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual validation (Claude Code plugin -- no automated test runner) |
| **Config file** | None -- plugin skills are validated by execution |
| **Quick run command** | Invoke orchestrator on a test project with a known topic brief |
| **Full suite command** | Run complete pipeline from outline through writing on a test book |
| **Estimated runtime** | ~5-10 minutes (full pipeline test) |

---

## Sampling Rate

- **After every task commit:** Read the modified SKILL.md and verify instruction completeness
- **After every plan wave:** Invoke orchestrator on test project to validate skill integration
- **Before `/gsd:verify-work`:** Full pipeline test (outline through chapter drafts) must produce valid output
- **Max feedback latency:** Manual review per commit

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | RSRCH-01 | manual | Inspect `research/ch[NN]-research.md` for required sections | N/A | pending |
| 03-01-02 | 01 | 1 | RSRCH-02 | manual | Spot-check 3-5 scripture references against NKJV source | N/A | pending |
| 03-01-03 | 01 | 1 | RSRCH-03 | manual | Check `research/ch[NN]-research.md` files exist at correct path | N/A | pending |
| 03-01-04 | 01 | 1 | RSRCH-04 | manual | Inspect for Word Studies and Types/Shadows sections | N/A | pending |
| 03-02-01 | 02 | 1 | WRITE-01 | manual | Count words in generated chapter drafts | N/A | pending |
| 03-02-02 | 02 | 1 | WRITE-02 | manual | Observe orchestrator spawning multiple Agent calls | N/A | pending |
| 03-02-03 | 02 | 1 | WRITE-03 | manual | Read first 3 sentences of each chapter for hooks | N/A | pending |
| 03-02-04 | 02 | 1 | WRITE-04 | manual | Verify chapter-writer reads book-dna.md | N/A | pending |
| 03-02-05 | 02 | 1 | WRITE-05 | manual | Check output files are .md format | N/A | pending |
| 03-02-06 | 02 | 1 | WRITE-06 | manual | Compare word counts to size tier targets | N/A | pending |
| 03-02-07 | 02 | 1 | WRITE-07 | manual | Check for Greek/Hebrew studies, cross-references in text | N/A | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. This phase produces SKILL.md files, not testable code. Validation is by execution of the pipeline.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Scripture accuracy | RSRCH-02 | Cannot automate biblical text verification | Spot-check 3-5 scripture references against a Bible app/website |
| Voice consistency across chapters | WRITE-04 | Subjective quality requiring human judgment | Read 2-3 chapter openings sequentially, check for consistent tone |
| Hook quality | WRITE-03 | Subjective quality assessment | Read opening sentences -- are they specific to the chapter's argument? |
| Theological depth | WRITE-07 | Requires domain expertise to assess | Check that word studies are woven into narrative, not dropped as footnotes |
| Research completeness | RSRCH-01 | Structural check requires reading content | Open research files, verify all sections are populated with substantive content |

---

## Validation Sign-Off

- [ ] All tasks have manual verify instructions
- [ ] Sampling continuity: every SKILL.md change reviewed before next task
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < manual review per commit
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
