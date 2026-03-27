---
phase: 5
slug: formatter-docx-output
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-27
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | node -e (inline scripts) + python scripts/office/validate.py |
| **Config file** | none — validation via docx inspection scripts |
| **Quick run command** | `python scripts/office/validate.py [output.docx]` |
| **Full suite command** | `python scripts/office/validate.py [output.docx] && python scripts/office/unpack.py [output.docx]` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `python scripts/office/validate.py [output.docx]`
- **After every plan wave:** Run full suite command
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | FMT-01 | integration | `python scripts/office/validate.py` | ✅ | ⬜ pending |
| 05-01-02 | 01 | 1 | FMT-04 | integration | `python scripts/office/unpack.py` + grep heading styles | ✅ | ⬜ pending |
| 05-01-03 | 01 | 1 | FMT-05 | integration | `python scripts/office/unpack.py` + grep footer PageNumber | ✅ | ⬜ pending |
| 05-01-04 | 01 | 1 | FMT-08 | manual | Review docx-js patterns match existing docx skill | N/A | ⬜ pending |
| 05-02-01 | 02 | 1 | FMT-02 | integration | `python scripts/office/unpack.py` + verify title page elements | ✅ | ⬜ pending |
| 05-02-02 | 02 | 1 | FMT-03 | integration | `python scripts/office/unpack.py` + verify TOC field | ✅ | ⬜ pending |
| 05-02-03 | 02 | 1 | FMT-06 | integration | `python scripts/office/unpack.py` + verify front matter order | ✅ | ⬜ pending |
| 05-02-04 | 02 | 1 | FMT-07 | integration | `python scripts/office/unpack.py` + verify back matter sections | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- Existing infrastructure covers all phase requirements. `python scripts/office/validate.py` and `python scripts/office/unpack.py` already exist in David's environment.
- docx-js must be installed (`npm install -g docx`) before execution — already documented as prerequisite in CLAUDE.md.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Typography consistency across chapters | FMT-01 | Visual inspection required to judge typographic quality | Open .docx in Word/LibreOffice, scan chapter headings and body text for consistent fonts/sizes |
| docx-js patterns match existing skill | FMT-08 | Pattern comparison requires reading both implementations | Compare formatter skill's docx-js usage against ~/.claude/skills/docx/SKILL.md patterns |
| TOC populates correctly | FMT-03 | TOC is a Word field that renders on open | Open .docx in Word, accept "Update fields" prompt, verify TOC lists all chapters with page numbers |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
