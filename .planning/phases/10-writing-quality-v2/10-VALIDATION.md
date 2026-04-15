---
phase: 10
slug: writing-quality-v2
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-15
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | node:test (stdlib, zero-deps) |
| **Config file** | none — Wave 0 installs `scripts/test-craft-check.js` and `scripts/test-rubric-regression.js` |
| **Quick run command** | `node --test scripts/test-craft-check.js` |
| **Full suite command** | `node --test scripts/` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `node --test scripts/test-craft-check.js`
- **After every plan wave:** Run `node --test scripts/`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

*Populated by planner during Step 8. Every task must map to an automated command or a Wave 0 fixture dependency. Manual-only verification reserved for LLM-judgment tasks (CRAFT-03/04/06/08).*

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | CRAFT-XX | TBD | TBD | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `scripts/craft-check.js` — deterministic CRAFT-01/02/05/07/15 checker (research: ~100 lines, zero-deps)
- [ ] `scripts/test-craft-check.js` — node:test unit tests for craft-check.js
- [ ] `scripts/test-rubric-regression.js` — rubric extraction regression harness (CRAFT-09 score identity)
- [ ] `fixtures/phase10/` — 6 fixture files covering deterministic checks (CRAFT-01/02/05/07/15). CRAFT-03/04/06/08 are LLM judgment rules verified manually — no deterministic fixtures.
- [ ] `fixtures/phase10/baseline-scores.json` — captured rubric scores BEFORE CRAFT-09 extraction (regression lock)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Central image distinctness across chapters | CRAFT-03 | LLM semantic judgment; no deterministic Levenshtein spec | Run editor Pass 2 on 3-chapter fixture set; verify distinct central images in report |
| Author vulnerability beat sourcing | CRAFT-04 | Requires semantic check that beat is NOT fabricated (traces to source) | Editor flags unsourced vulnerability beats in diagnostic report |
| Tension-release rhythm | CRAFT-06 | Pacing judgment | Editor Pass 1 sub-section review on fixtures |
| Craft density scoring | CRAFT-08 | LLM rubric scoring calibrated against bestseller-calibration.md | Editor runs rubric, scores compared to calibration exemplars |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (craft-check.js, fixtures, baseline-scores.json)
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
