---
phase: 2
slug: voice-system-book-outliner
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-27
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual validation (Claude Code plugin skills are prompt-based markdown, not unit-testable) |
| **Config file** | None — skills are markdown instructions executed by Claude |
| **Quick run command** | Invoke orchestrator with a test book project |
| **Full suite command** | Run through full pipeline to Stage 1 completion with outline approval |
| **Estimated runtime** | ~5 minutes (human-in-the-loop) |

---

## Sampling Rate

- **After every task commit:** Read modified SKILL.md files, verify structure and completeness
- **After every plan wave:** Invoke orchestrator with a test book to verify end-to-end Stage 1 flow
- **Before `/gsd:verify-work`:** Full Stage 1 run (topic brief + source ingestion) with outline approval
- **Max feedback latency:** N/A (manual verification)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | VOICE-01 | manual | Read `references/voice-profiles/spiritual-default.md`, verify all spec sections | ✅ | ⬜ pending |
| 02-01-02 | 01 | 1 | VOICE-02 | manual | Verify spiritual-default.md sections match brand-voice.md framework | ✅ | ⬜ pending |
| 02-01-03 | 01 | 1 | VOICE-03 | manual | Create custom profile, verify orchestrator accepts it | ❌ W0 | ⬜ pending |
| 02-01-04 | 01 | 1 | VOICE-04 | manual | Provide inline description, verify voice-profile.md generated | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 1 | OUTL-01 | manual | Invoke orchestrator with topic brief, verify chapter-outline.md created | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 1 | OUTL-02 | manual | Inspect chapter-outline.md for title, hook, arguments, scriptures, momentum | ❌ W0 | ⬜ pending |
| 02-02-03 | 02 | 1 | OUTL-03 | manual | Verify momentum positions escalate across chapters | ❌ W0 | ⬜ pending |
| 02-02-04 | 02 | 1 | OUTL-05 | manual | Test each size tier, verify chapter count within range | ❌ W0 | ⬜ pending |
| 02-02-05 | 02 | 1 | OUTL-06 | manual | Provide sermon transcripts, verify themes extracted into structure | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 2 | VOICE-05 | manual | Complete outline + approval, verify book-dna.md has all sections | ❌ W0 | ⬜ pending |
| 02-03-02 | 03 | 2 | VOICE-06 | manual | Verify agents contain READ-ONLY constraints | ✅ | ⬜ pending |
| 02-03-03 | 03 | 2 | OUTL-04/ITER-01 | manual | Verify orchestrator pauses for approval, `<!-- APPROVED -->` marker added | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

None — this phase produces markdown skill files, not testable code. Validation is human verification of skill instructions and reference file structure.

*Existing infrastructure covers all phase requirements (manual verification only).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Voice profile loads correctly | VOICE-01 | Skills are prompt-based; no programmatic test harness | Invoke orchestrator, verify voice-profile.md copied to project dir |
| Custom profile accepted | VOICE-03 | Requires human to create a custom .md and observe orchestrator behavior | Create custom profile, invoke orchestrator with it, verify Book DNA reflects custom voice |
| Inline voice generates profile | VOICE-04 | Requires human to provide inline text at project creation | Provide inline description, verify voice-profile.md generated in project |
| Outline generated from topic | OUTL-01 | Requires human to invoke orchestrator and inspect output | Invoke with topic brief, verify chapter-outline.md has all chapters |
| Narrative arc escalates | OUTL-03 | Requires human judgement on momentum escalation | Verify momentum positions: Foundation → Building → Accelerating → Climax → Landing |
| Approval gate blocks drafting | OUTL-04 | Requires human to verify orchestrator pauses | Verify orchestrator stops after outline, `<!-- APPROVED -->` added only after approval |
| Source ingestion extracts themes | OUTL-06 | Requires human to provide sermon files and judge extraction quality | Provide transcripts, verify themes extracted and synthesised into structure |
| Book DNA is READ-ONLY | VOICE-06 | Requires inspection of agent constraint instructions | Verify chapter-writer.md and chapter-editor.md contain "Do NOT modify the Book DNA" |

---

## Validation Sign-Off

- [ ] All tasks have manual verification instructions
- [ ] Sampling continuity: every wave has a verification checkpoint
- [ ] No automated test gaps (all are manual by nature of the phase)
- [ ] Feedback latency acceptable for manual checks
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
