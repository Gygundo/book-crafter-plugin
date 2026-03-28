---
phase: 7
slug: captivating-writing-modern-voice-profile-and-bestseller-formatting
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-28
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual content validation (no automated test framework — this phase modifies skill prompts and reference docs, not executable code) |
| **Config file** | none |
| **Quick run command** | `grep -c "story\|anecdote\|scene\|imagine\|picture" references/voice-profiles/spiritual-default.md` |
| **Full suite command** | `bash -c 'for f in references/voice-profiles/spiritual-default.md skills/writer/SKILL.md skills/outliner/SKILL.md skills/editor/SKILL.md skills/formatter/SKILL.md agents/chapter-writer.md agents/chapter-editor.md; do echo "--- $f ---"; test -f "$f" && echo "EXISTS" || echo "MISSING"; done'` |
| **Estimated runtime** | ~2 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick run command to verify voice profile changes landed
- **After every plan wave:** Run full suite command to verify all 7 target files exist and were modified
- **Before `/gsd:verify-work`:** Full suite must be green + manual content review of voice profile
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | D-05 Voice profile upgrade | content grep | `grep -c "storytelling\|vulnerability\|warmth" references/voice-profiles/spiritual-default.md` | ✅ | ⬜ pending |
| TBD | TBD | TBD | D-09 Anti-patterns | content grep | `grep -c "lecture tone\|list-heavy\|emotional connection\|predictable" references/voice-profiles/spiritual-default.md` | ✅ | ⬜ pending |
| TBD | TBD | TBD | D-01 Story-first openings | content grep | `grep -c "story\|anecdote\|scene" skills/writer/SKILL.md` | ✅ | ⬜ pending |
| TBD | TBD | TBD | D-10 Scripture formatting | content grep | `grep -c "block.quote\|scripture" skills/formatter/SKILL.md` | ✅ | ⬜ pending |
| TBD | TBD | TBD | D-13 Captivation checks | content grep | `grep -c "captivation\|opening engagement\|pacing variety\|emotional connection" skills/editor/SKILL.md` | ✅ | ⬜ pending |
| TBD | TBD | TBD | D-11 Mixed typography | content grep | `grep -c "Calibri\|sans-serif\|Georgia\|Garamond" skills/formatter/SKILL.md` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements. This phase modifies markdown skill files and reference documents — no test framework installation needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Voice profile reads like bestselling Christian author | D-05, D-06 | Subjective writing quality assessment | Read voice profile calibration examples — should evoke Eldredge/Goff/Bevere craft |
| Chapter openings feel engaging | D-01 | Creative writing quality | Generate a test chapter and verify opening 200 words contain story/scene |
| Pull quotes render correctly in .docx | D-12 | Requires .docx visual inspection | Generate test .docx, open in Word, verify pull quote styling |
| Scripture block quotes render correctly | D-10 | Requires .docx visual inspection | Generate test .docx, verify scripture is block-quoted italic with right-aligned reference |
| Mixed typography (sans-serif headings + serif body) | D-11 | Requires .docx visual inspection | Generate test .docx, verify heading font differs from body font |

*If none: "All phase behaviors have automated verification."*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
