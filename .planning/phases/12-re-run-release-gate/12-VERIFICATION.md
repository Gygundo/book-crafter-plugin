---
phase: 12-re-run-release-gate
verified: 2026-04-16T00:00:00Z
status: passed
score: 9/9 must-haves verified
gaps: []
human_verification: []
---

# Phase 12: Re-run + Release Gate Verification Report

**Phase Goal:** Prove the v1.1 rules actually improve output by re-running Eternally Secure in `--fresh` mode, producing a seven-gap before/after comparison with quoted paragraphs, verifying the fresh-install path, and recording David's explicit ship decision — all blocking on the v1.1.0 git tag.
**Verified:** 2026-04-16
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| #  | Truth                                                                                         | Status     | Evidence                                                                                                    |
|----|-----------------------------------------------------------------------------------------------|------------|-------------------------------------------------------------------------------------------------------------|
| 1  | Phase 7 Ch1 output is frozen as immutable baseline in the repo                                | VERIFIED   | `evidence/eternally-secure-ch1-before.md` exists, 77 lines, opens with "Millions of believers..."          |
| 2  | sources-adapted checksums are captured before any re-run                                      | VERIFIED   | `evidence/sources-adapted-checksums.txt` contains 3 SHA256 lines for all 3 sources-adapted files           |
| 3  | Eternally Secure has been re-run through the shipping pipeline with --fresh mode               | VERIFIED   | `evidence/eternally-secure-ch1-after.md` exists, 141 lines, opens with scene "11:47 at night..." (differs) |
| 4  | Every one of the 7 gap areas has a before/after quoted paragraph showing measurable improvement | VERIFIED   | `evidence/seven-gap-comparison.md` has 8 sections (7 CRAFT + Novelty), each with Before/After blockquotes  |
| 5  | sources-adapted files are byte-identical before and after the --fresh re-run                  | VERIFIED   | `evidence/sermon-adapter-regression.md` records REGRESSION CHECK: PASS with matching SHA256 for all 3 files|
| 6  | A fresh Claude session ranked before vs after blind without knowing which was which            | VERIFIED   | `evidence/external-review.md` logged full prompt + response, Version A (after) wins all 5 dimensions       |
| 7  | README capability language is evidence-anchored against the seven-gap comparison               | VERIFIED   | README line 5 references scene-driven openers, controlled density, novelty enforcement, blind A/B review   |
| 8  | Fresh-install smoke-test passes: marketplace install produces a valid .docx on first attempt  | VERIFIED   | `evidence/smoke-test-log.md` records SMOKE TEST: PASS; captivation 14/16, novelty_dedup PASS              |
| 9  | David reviewed full evidence and recorded an explicit ship decision; git tag v1.1.0 applied   | VERIFIED   | `evidence/ship-decision.md` Decision: SHIP; tag v1.1.0 applied to 4fe9972 and pushed to remote             |

**Score:** 9/9 truths verified

---

### Required Artifacts

| Artifact                                | Expected                              | Status     | Details                                                                                    |
|-----------------------------------------|---------------------------------------|------------|--------------------------------------------------------------------------------------------|
| `evidence/eternally-secure-ch1-before.md` | Phase 7 Ch1 baseline (immutable)    | VERIFIED   | 77 lines; starts with "Millions of believers..."; differs from after file                  |
| `evidence/sources-adapted-checksums.txt`  | SHA256 checksums for regression      | VERIFIED   | 3 lines; all 3 sources-adapted filenames present                                           |
| `evidence/eternally-secure-ch1-after.md`  | v1.1 pipeline output for Ch1        | VERIFIED   | 141 lines; scene-opener, pull quotes, two image families; substantively different from before |
| `evidence/seven-gap-comparison.md`        | 7+ gap sections with quoted paragraphs | VERIFIED | 8 sections (## 1–8); each has **Before:** and **After:** with blockquote prose             |
| `evidence/sermon-adapter-regression.md`   | Regression check evidence           | VERIFIED   | Contains REGRESSION CHECK: PASS; 3-file SHA256 table with YES for all three               |
| `evidence/external-review.md`             | Third-party blind quality ranking   | VERIFIED   | 250 lines; populated ## Response; ## Reveal maps A=after/B=before; no "To be filled" text |
| `README.md`                               | Evidence-anchored capability line   | VERIFIED   | No TODO(phase-12); no "bestseller" standalone claim; has prose blockquote from re-run      |
| `evidence/smoke-test-log.md`              | Fresh-install test evidence         | VERIFIED   | SMOKE TEST: PASS; captivation 14/16; .docx exists; novelty_dedup PASS                     |
| `evidence/ship-decision.md`               | David's explicit release decision   | VERIFIED   | Decision: SHIP; all 7 gates listed; no "TO BE FILLED" placeholder remaining                |

---

### Key Link Verification

| From                         | To                                      | Via                              | Status  | Details                                                                      |
|------------------------------|-----------------------------------------|----------------------------------|---------|------------------------------------------------------------------------------|
| `seven-gap-comparison.md`    | `eternally-secure-ch1-before.md`        | Exact blockquote prose extracted | WIRED   | Before sections contain verbatim text confirmed present in before file       |
| `seven-gap-comparison.md`    | `eternally-secure-ch1-after.md`         | Exact blockquote prose extracted | WIRED   | After sections contain verbatim text confirmed present in after file         |
| `external-review.md`         | `eternally-secure-ch1-before.md`        | VERSION B embedded text          | WIRED   | Before chapter embedded as Version B; ## Reveal maps B=before               |
| `external-review.md`         | `eternally-secure-ch1-after.md`         | VERSION A embedded text          | WIRED   | After chapter embedded as Version A; ## Reveal maps A=after                 |
| `ship-decision.md`           | `seven-gap-comparison.md`               | Evidence review before decision  | WIRED   | ship-decision lists GATE-03 status with gap detail drawn from comparison file|
| `git tag v1.1.0`             | `ship-decision.md`                      | Blocked on ship decision         | WIRED   | Tag applied to commit 4fe9972 after Decision: SHIP recorded; pushed to origin |
| `README.md`                  | `seven-gap-comparison.md`               | Capability language anchored     | WIRED   | README references scene-driven openers, controlled density, novelty, blind A/B — all items demonstrated in seven-gap document |

---

### Data-Flow Trace (Level 4)

Not applicable. Phase 12 is a pure evidence-gathering and release-gating phase — no components render dynamic data from a pipeline. All artifacts are written evidence documents and one README update.

---

### Behavioral Spot-Checks

| Behavior                                      | Command                                                                                         | Result                              | Status  |
|-----------------------------------------------|-------------------------------------------------------------------------------------------------|-------------------------------------|---------|
| Before and after files differ (re-run produced new content) | `diff evidence/ch1-before.md evidence/ch1-after.md` returns non-empty | Files differ from line 3 onward     | PASS    |
| Seven-gap has 7+ ## sections with blockquotes | `grep -c "^## " seven-gap-comparison.md` = 8; `grep -c "^> " = 41` | 8 sections, 41 blockquote lines     | PASS    |
| Regression check PASS                         | `grep "REGRESSION CHECK: PASS" sermon-adapter-regression.md`                                   | Found                               | PASS    |
| Ship decision filled (not placeholder)        | `grep "TO BE FILLED" ship-decision.md` returns 0 lines                                         | No placeholder text remains         | PASS    |
| v1.1.0 tag exists and pushed                  | `git tag -l v1.1.0` = v1.1.0; `git ls-remote origin refs/tags/v1.1.0` = 4fe9972               | Tag local and remote                | PASS    |
| README has no TODO(phase-12) or "bestseller"  | grep counts: 0 for TODO(phase-12), 0 for "bestseller"                                          | Both absent                         | PASS    |
| Smoke test recorded PASS                      | `grep "SMOKE TEST: PASS" smoke-test-log.md`                                                     | Found; captivation 14/16            | PASS    |

---

### Requirements Coverage

| Requirement | Source Plan | Description                                                                  | Status    | Evidence                                                       |
|-------------|-------------|------------------------------------------------------------------------------|-----------|----------------------------------------------------------------|
| GATE-01     | 12-01-PLAN  | Frozen baseline committed (immutable Phase 7 output)                         | SATISFIED | `evidence/eternally-secure-ch1-before.md` exists in repo       |
| GATE-02     | 12-02-PLAN  | Eternally Secure re-run in --fresh mode, after file produced                 | SATISFIED | `evidence/eternally-secure-ch1-after.md` exists and differs    |
| GATE-03     | 12-03-PLAN  | Seven-gap comparison with before/after quoted paragraphs for each gap        | SATISFIED | 8 sections, 19 **Before:**/**After:** pairs, 41 blockquotes    |
| GATE-04     | 12-04-PLAN  | Fresh Claude session blind ranking logged                                    | SATISFIED | `evidence/external-review.md` populated, A wins all 5 dims     |
| GATE-05     | 12-03-PLAN  | sources-adapted byte-identical before and after                              | SATISFIED | REGRESSION CHECK: PASS, SHA256 match on all 3 files            |
| GATE-06     | 12-05-PLAN  | Fresh-install smoke-test passes                                              | SATISFIED | SMOKE TEST: PASS; .docx verified; captivation 14/16            |
| GATE-07     | 12-05-PLAN  | README capability language finalised against evidence                        | SATISFIED | No overclaiming; capability line anchored to demonstrated gaps  |
| GATE-08     | 12-06-PLAN  | David's explicit ship/don't-ship call recorded                               | SATISFIED | Decision: SHIP in `evidence/ship-decision.md`                  |
| GATE-09     | 12-06-PLAN  | `git tag v1.1.0` applied and pushed                                          | SATISFIED | Tag on 4fe9972, pushed; confirmed via ls-remote                |

**Orphaned requirements:** None. All 9 GATE IDs map to plans that claimed them. REQUIREMENTS.md §Re-run + Release Gate lists GATE-01..09, all mapped to Phase 12.

---

### Anti-Patterns Found

| File                                  | Line | Pattern                          | Severity | Impact         |
|---------------------------------------|------|----------------------------------|----------|----------------|
| `evidence/eternally-secure-ch1-after.md` | —  | Missing `<!-- generated-by: book-crafter v1.1.0 -->` stamp | Info | None — pipeline does not emit this comment; deviation documented in 12-02-SUMMARY.md; content diff provides equivalent evidence |

No blockers. One informational deviation: the `generated-by` version stamp in the after file is absent because the pipeline does not emit it. The 12-02 SUMMARY explicitly documents this, and the evidence requirement is met via content diff (141 vs 77 lines, wholly different prose reflecting v1.1 rules).

---

### Human Verification Required

None. All gate outcomes are document-verifiable. The smoke test result was recorded by David during plan execution and is logged in `evidence/smoke-test-log.md`. The ship decision was made by David and is logged in `evidence/ship-decision.md`. No programmatic verification gap requires further human input.

---

### Gaps Summary

No gaps. All nine GATE requirements are satisfied by existing committed evidence:

- GATE-01/02: Baseline and after files committed and confirmed to differ.
- GATE-03: Eight-section comparison document with 41 blockquote lines of direct textual evidence.
- GATE-04: 250-line external review file with full prompt, verbatim response, and reveal section.
- GATE-05: SHA256 regression check passed; all three sources-adapted files byte-identical.
- GATE-06: Fresh-install smoke test passed; captivation 14/16 (above 11 threshold); .docx verified.
- GATE-07: README updated with evidence-anchored capability line; no overclaiming; no TODO placeholders.
- GATE-08: David's explicit SHIP decision recorded.
- GATE-09: `git tag v1.1.0` applied to 4fe9972 and pushed to origin (`refs/tags/v1.1.0` confirmed on remote).

The only deviation from plan specifications is the missing `generated-by` version stamp in the after file. This is an informational note, not a blocker — it was accepted by the executing agent and documented in the plan summary before proceeding.

---

_Verified: 2026-04-16_
_Verifier: Claude (gsd-verifier)_
