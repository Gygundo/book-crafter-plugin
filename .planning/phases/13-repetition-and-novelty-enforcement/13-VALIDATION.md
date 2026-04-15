---
phase: 13
slug: repetition-and-novelty-enforcement
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-15
---

# Phase 13 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | node:test (built-in, already used by `scripts/test-*.js`) |
| **Config file** | none — scripts run directly via `node scripts/test-*.js` |
| **Quick run command** | `node scripts/test-craft-check.js` |
| **Full suite command** | `node scripts/test-craft-check.js && node scripts/test-rubric-regression.js` |
| **Estimated runtime** | ~5-15 seconds |

---

## Sampling Rate

- **After every task commit:** Run the quick command relevant to the touched file (craft-check changes → test-craft-check; rubric/editor changes → test-rubric-regression)
- **After every plan wave:** Run full suite + `node scripts/craft-check.js --novelty --tier both fixtures/tiny-book/adversarial/` to smoke the fail path
- **Before `/gsd:verify-work`:** Full suite green + SC-6 proof run (`/book-crafter:sample` against rewritten fixture) must emit `SAMPLE PASS … novelty_dedup pass`
- **Max feedback latency:** ~15 seconds (test scripts) / ~2 minutes (sample run)

---

## Per-Task Verification Map

*Populated by the planner during Step 8 and verified in Step 10. Each plan task MUST map to at least one automated command below OR declare itself Manual with justification.*

| Task ID | Plan | Wave | SC / Decision | Test Type | Automated Command | File Exists | Status |
|---------|------|------|---------------|-----------|-------------------|-------------|--------|
| 13-W0-01 | test-infra | 0 | D-23, SC-2 | regression | `node scripts/test-craft-check.js` | ❌ W0 | ⬜ pending |
| 13-W0-02 | test-infra | 0 | D-27, D-29, SC-1 | regression | `node scripts/test-rubric-regression.js` | ✅ (update) | ⬜ pending |
| 13-W0-03 | fixture-adv | 0 | D-22, D-23 | fixture assertion | `node scripts/craft-check.js --novelty --tier both fixtures/tiny-book/adversarial/` | ❌ W0 | ⬜ pending |
| 13-W0-04 | fixture-adv-enr | 0 | D-18 | fixture assertion | `node scripts/craft-check.js --novelty --tier 2 fixtures/tiny-book/adversarial-enricher/` | ❌ W0 | ⬜ pending |
| 13-W1-01 | rubric-canon | 1 | SC-1, SC-3, D-24..29 | schema + regression | `node scripts/test-rubric-regression.js` (schema_version == 2, total_range [0,16], 8 components) | ✅ | ⬜ pending |
| 13-W2-01 | detection | 2 | SC-2, D-01, D-02 | regression + CLI | `node scripts/craft-check.js --novelty --tier both fixtures/tiny-book/run/` | ✅ (extend) | ⬜ pending |
| 13-W2-02 | editor-pass3 | 2 | SC-2, D-03 | consistency-report grep | `grep -E '^novelty_dedup: (pass\|fail)$' fixtures/tiny-book/run/reports/consistency-report.md` | ✅ | ⬜ pending |
| 13-W2-03 | writer-antiloop | 2 | SC-4, D-30 | skill content check | `grep -E '6\+ word|refrain' skills/writer/SKILL.md` | ✅ | ⬜ pending |
| 13-W2-04 | outliner-gate | 2 | D-08 | skill content check | `grep -iE 'refrain.*(candidate\|confirm)' skills/outliner/SKILL.md` | ✅ | ⬜ pending |
| 13-W3-01 | orch-mode7 | 3 | D-11, D-12 | skill content + dry-run | `grep -E 'rewrite-targets' skills/orchestrator/SKILL.md` | ✅ | ⬜ pending |
| 13-W3-02 | sample-yaml | 3 | SC-1, D-05 | skill content check | `grep -E 'captivation_total\|novelty_dedup' skills/sample/SKILL.md && ! grep -E 'Captivation[^0-9]*/14' skills/sample/SKILL.md` | ✅ | ⬜ pending |
| 13-W4-01 | fixture-rewrite | 4 | SC-5 | content assertion | `test $(grep -c 'one small lamp refusing the whole dark' fixtures/tiny-book/run/ -r) -le 1` | ✅ | ⬜ pending |
| 13-W4-02 | proof-run | 4 | SC-6 | end-to-end sample | `/book-crafter:sample` against rewritten fixture emits `SAMPLE PASS … novelty_dedup pass` and zero dedup flags | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

*Planner: replace task IDs above with real `{phase}-{plan}-{task}` IDs once plan files are written, and ensure every task in every plan has an entry here or an explicit Manual-Only row below.*

---

## Wave 0 Requirements

- [ ] `scripts/test-craft-check.js` — extend with adversarial-fixture assertions + Tier 2 rule regression (D-23)
- [ ] `scripts/test-rubric-regression.js` — bump ceiling 14→16, add schema_version==2 assertion, add novelty_dedup dimension assertion, regenerate sha256 baseline (research Open Q #1)
- [ ] `fixtures/tiny-book/adversarial/` — hand-authored known-bad manuscript (front-matter + ch01 + ch02) + `expected-flags.json`
- [ ] `fixtures/tiny-book/adversarial-enricher/` — three known-bad discussion-question sets + `expected-flags.json`
- [ ] `scripts/release.sh` — whitelist exclusion for both adversarial fixture directories (test-only, must never ship)

---

## Manual-Only Verifications

| Behavior | SC / Decision | Why Manual | Test Instructions |
|----------|---------------|------------|-------------------|
| Output "reads as visibly non-repetitive" to a human | SC-6 | Subjective human judgment is the root trigger for Phase 13 — the whole point is that rubric green ≠ reader green | After automated gate passes, David reads the rewritten fixture output end-to-end and confirms no loop feeling. If it still feels repetitive, fail the phase. |
| Refrain-candidate interactive gate UX | D-08 | Interactive prompt quality can only be judged by running it | David runs a non-fixture book through `/book-crafter:orchestrator`, hits the refrain gate, confirms the prompt surfaces candidate phrases with keep/demote/add options. |
| Mode 7 `--rewrite-targets` usability | D-11, D-12 | Flow across orchestrator + writer + editor only exercises end-to-end | Run `/book-crafter:orchestrator --rewrite-targets <path>` against a seeded failure and confirm only flagged chapters regenerate. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (adversarial fixtures, test harness extensions)
- [ ] No watch-mode flags (scripts run once and exit)
- [ ] Feedback latency < 15s for unit/regression; < 2min for proof run
- [ ] `nyquist_compliant: true` set in frontmatter once planner populates the task map

**Approval:** pending
