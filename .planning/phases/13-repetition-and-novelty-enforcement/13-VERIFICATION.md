---
phase: 13-repetition-and-novelty-enforcement
verified: 2026-04-16T08:15:53Z
status: passed
score: 6/6 must-haves verified
re_verification: false
gaps: []
human_verification:
  - test: "Read proof-run output (foreword + 3 chapters) end-to-end and confirm the book does not feel like a loop"
    expected: "Three chapters use the 'light in the night' motif family via distinct vehicles (phone glow / yellow pool / grey seam of dawn). No vulnerability scene paraphrased in two artefacts. Refrain phrase appears at most once. Book feels like progression, not repetition."
    why_human: "Subjective quality judgment — the root trigger for Phase 13 was that rubric scored green while a reader experienced the output as a loop. Automated gates are necessary but not sufficient per VALIDATION.md Manual-Only row 1. David has already approved ('the book is actually very good') per 13-14-SUMMARY.md."
---

# Phase 13: Repetition and Novelty Enforcement — Verification Report

**Phase Goal:** Enforce novelty and repetition detection across the full book-crafter pipeline: canonical captivation score surface (YAML emit/read), editor Pass 3 novelty/dedup audit, rubric novelty_variation component, writer anti-loop clause, fixture motif-family rewrite, and fresh sample proof run passing all gates including the new post-enricher novelty gate.

**Verified:** 2026-04-16T08:15:53Z
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | SC-1: ONE canonical captivation score surface — editor emits schema v2 YAML, sample reads it via column-0 grep, rubric is single source of truth | VERIFIED | `references/captivation-rubric.md` has `schema_version: 2`, `total_range: [0, 16]`, 8 components (confirmed 8 `### ` headings). Editor skill has `## Captivation Score` section emitting schema_version/captivation_total/novelty_dedup at column-0. Sample skill reads via `grep -E '^captivation_total:'` and `grep -E '^novelty_dedup:'`. Proof-run report shows `schema_version: 2`, `captivation_total: 16`, `novelty_dedup: pass`. |
| 2 | SC-2: Editor Pass 3 §4.4.5 Novelty/Dedup Audit (Tier 1 + Tier 2) is present and wired — emits novelty_dedup verdict + rewrite_targets.yaml | VERIFIED | `skills/editor/SKILL.md` contains `### 4.4.5 Novelty and Dedup Audit` with Step A (deterministic craft-check.js invocation), Step B (LLM judgment layer), and emit contract for `rewrite_targets`. `reports/rewrite_targets.yaml` write path confirmed. "judge, not an author" constraint present. Adversarial fixture produces `flag: true, novelty_dedup: fail` with exit 1. |
| 3 | SC-3: Rubric `novelty_variation` component present as 8th component scoring 0-2; vehicle-phrasing distinctness enforced in outliner | VERIFIED | `references/captivation-rubric.md` contains `### Novelty / Variation` with three sub-checks (vehicle distinctness, 6-word span dedup, vulnerability-beat single-location). `key: novelty_variation` in frontmatter. `skills/outliner/SKILL.md` has `Refrain Candidate Gate` section with `max_uses`, `Fixture bypass`, and `Step 2: Surface candidates`. |
| 4 | SC-4: Writer anti-loop clause — no 6+ word phrase reuse, spent vulnerability seeds, motif vehicle must differ, echo not repeat, refrains only verbatim reuse | VERIFIED | `skills/writer/SKILL.md` contains `## Anti-Loop Clause (Phase 13, D-30)` with all five rules. Specific text verified: "Anti-Loop Clause", "vehicle MUST differ", "Echo and recontextualise", "refrains". |
| 5 | SC-5: Fixture brief rewritten to motif family + 3 distinct vehicles + refrain cap; book-dna.md pre-populated | VERIFIED | `fixtures/tiny-book/brief.md` contains "Motif family", "phone glow", "yellow pool", "grey seam of dawn". `fixtures/tiny-book/run/book-dna.md` has `^refrains:`, `max_uses: 1`, flat chapter map lines `^- Ch [123] central_image:` with all three distinct vehicles. |
| 6 | SC-6: Fresh sample proof run passes all automated gates — captivation >= 10, novelty_dedup pass, refrain count <= 1, Tier 2 clean, .docx emitted | VERIFIED | Proof run (13-14) produced: captivation_total: 16 (threshold 10), novelty_dedup: pass, repeated_spans: 0, all Tier 2 arrays empty. Refrain phrase "one small lamp refusing the whole dark" appears 0 times in run/front-matter/ and 0 times in run/edited/. 3 enrichment files confirmed. `fixtures/tiny-book/run/final/The 2am Prayer.docx` exists. Craft-check live re-run confirmed flag: false, exit 0. Human approved: "the book is actually very good". |

**Score:** 6/6 truths verified

---

### Required Artifacts

| Artifact | Provides | Exists | Substantive | Wired | Status |
|---------|---------|--------|-------------|-------|--------|
| `references/captivation-rubric.md` | SC-1 canonical schema v2 with novelty_variation (SC-3) | Yes | Yes — 8 components, schema_version: 2, total_range: [0, 16], novelty_dedup dimension, sample_gate thresholds | Editor, sample, and test-rubric-regression.js all read it | VERIFIED |
| `skills/editor/SKILL.md` | SC-1 YAML emit + SC-2 Pass 3 §4.4.5 audit | Yes | Yes — `## Captivation Score` template with column-0 fields; `### 4.4.5` with Steps A/B/C, rewrite_targets emit contract, judge-not-author constraint | Read by orchestrator at Stage 4; emits consistency-report.md read by sample | VERIFIED |
| `skills/writer/SKILL.md` | SC-4 Anti-Loop Clause | Yes | Yes — `## Anti-Loop Clause (Phase 13, D-30)` with 5 rules + refrain schema example + consequence section | Called by orchestrator Stage 3 writer invocations | VERIFIED |
| `skills/outliner/SKILL.md` | SC-3 Refrain Candidate Gate | Yes | Yes — `## Refrain Candidate Gate (Phase 13, D-08)` with candidate detection, Step 2 surface/block handoff, max_uses schema, fixture bypass | Called by orchestrator Stage 1 | VERIFIED |
| `skills/orchestrator/SKILL.md` | SC-2 Stage 4.6 post-enricher novelty gate + Mode 7 rewrite-targets | Yes | Yes — pipeline overview shows Stage 4.6; Section 4 Step 4 implements gate with pass/fail branching, rewrite_targets.yaml write, halt on fail; Mode 7 fully documented with phrase triggers, D-12 reason validation, path traversal check, no-auto-loop | Master orchestrator calling all stages | VERIFIED |
| `skills/enricher/SKILL.md` | Gap closure: Anti-Loop Clause for foreword (SC-6 fix) | Yes | Yes — `## 6.1 Anti-Loop Clause (Foreword)` with 4 rules mirroring writer clause; consequence note pointing to Stage 4.6 | Called by orchestrator Stage 4.5 | VERIFIED |
| `skills/sample/SKILL.md` | SC-1 canonical YAML read (schema v2, no craft-check.js fallback) | Yes | Yes — `§4` uses `grep -E '^captivation_total:'` and `grep -E '^novelty_dedup:'`; schema_version validation; no fallback path; D-05 four-variant PASS/FAIL format | Called as entry point for smoke testing | VERIFIED |
| `scripts/craft-check.js` | SC-2/SC-3 novelty detection engine (Tier 1 + Tier 2) | Yes | Yes — `--novelty` mode with `parseNoveltyArgs`, Tier 1 (repeated_spans, cross_artefact_hits, central_image_reuse, refrain_overuse) and Tier 2 (discussion_question_stems, prayer_point_repetition, vulnerability_bleed_to_summary, vehicle_reuse_in_backmatter), `flag` and `novelty_dedup` output | Called by editor §4.4.5 Step A and orchestrator Stage 4.6 | VERIFIED |
| `fixtures/tiny-book/brief.md` | SC-5 motif-family brief rewrite | Yes | Yes — motif family declared, 3 distinct vehicles (phone glow, yellow pool, grey seam), refrain cap stated | Read by sample skill §3 invocation | VERIFIED |
| `fixtures/tiny-book/run/book-dna.md` | SC-5 pre-populated book-dna with refrains block + flat chapter map | Yes | Yes — `refrains:` block with `max_uses: 1`, flat chapter map with 3 distinct `central_image:` entries | Read by all pipeline agents during proof run | VERIFIED |
| `fixtures/tiny-book/adversarial/` | SC-2 Tier 1 known-bad fixture | Yes | Yes — triggers repeated_spans, cross_artefact_hits, central_image_reuse, refrain_overuse on craft-check --novelty run | Used by test-craft-check.js | VERIFIED |
| `fixtures/tiny-book/adversarial-enricher/` | SC-2 Tier 2 known-bad fixture | Yes | Yes — triggers Tier 2 rules per expected-flags.json | Used by test-craft-check.js | VERIFIED |
| `scripts/test-craft-check.js` | SC-1/SC-2/SC-3 novelty test harness (5 new cases) | Yes | Yes — 18/18 tests pass (13 legacy + 5 novelty) in 640ms | Run as pre-flight and CI gate | VERIFIED |
| `scripts/test-rubric-regression.js` | SC-1/SC-3 schema v2 structural assertions | Yes | Yes — base + --extended pass; hash `b78477f42a59f3d758964162bfc987567e559fa4690333f45b20ebcea9559356` confirmed; "schema v2: 8 components, 0-16 range, novelty_dedup dimension, novelty_variation component all present" | Run as pre-flight and CI gate | VERIFIED |
| `fixtures/tiny-book/run/final/The 2am Prayer.docx` | SC-6 proof-run .docx output | Yes | Yes — file exists | End product of proof run | VERIFIED |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `skills/editor/SKILL.md §4.4.5` | `scripts/craft-check.js --novelty` | Step A invocation | WIRED | Step A block shows `node ${CLAUDE_PLUGIN_ROOT}/scripts/craft-check.js --novelty --tier both --dna ...` invocation |
| `skills/editor/SKILL.md §4.4.5` | `reports/rewrite_targets.yaml` | emit contract | WIRED | Step C emit block: "write the same block to `[project_directory]/reports/rewrite_targets.yaml`" |
| `skills/orchestrator/SKILL.md Stage 4.6` | `scripts/craft-check.js --novelty` | Step 4 invocation | WIRED | Section 4 Step 4 shows full command: `node scripts/craft-check.js --novelty --tier both --dna ...` |
| `skills/orchestrator/SKILL.md Mode 7` | `reports/rewrite_targets.yaml` | parse + inject | WIRED | Mode 7 reads yaml, validates reason D-12, injects per-chapter reason into writer prompt |
| `skills/sample/SKILL.md §4` | `reports/consistency-report.md` | column-0 grep | WIRED | `grep -E '^captivation_total:'` and `grep -E '^novelty_dedup:'` with schema_version validation |
| `scripts/craft-check.js --novelty` | `fixtures/tiny-book/adversarial/` | test-craft-check.js | WIRED | Live re-run confirmed: `flag: true, novelty_dedup: fail`, exit 1 |
| `scripts/craft-check.js --novelty` | `fixtures/tiny-book/run/` | Stage 4.6 gate | WIRED | Live re-run confirmed: `flag: false, novelty_dedup: pass`, exit 0 (0 repeated_spans, all Tier 2 arrays empty) |
| `skills/enricher/SKILL.md §6.1` | Anti-Loop Clause | Section 6.1 | WIRED | Anti-Loop Clause prevents foreword verbatim bleed; Stage 4.6 catches residuals |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|---------|--------------|--------|-------------------|--------|
| `fixtures/tiny-book/run/reports/consistency-report.md ## Captivation Score` | `captivation_total`, `novelty_dedup` | Editor Pass 1/2/3 + §4.4.5 invocation | Yes — verified live: `captivation_total: 16`, `novelty_dedup: pass`, all 8 components populated | FLOWING |
| `scripts/craft-check.js --novelty` output | `repeated_spans`, `flag`, `novelty_dedup` | Filesystem scan of front-matter/ + edited/ + enrichments/ | Yes — adversarial fixture produces 2 repeated_spans + other flags; proof-run fixture produces 0 across all arrays | FLOWING |
| `fixtures/tiny-book/run/final/The 2am Prayer.docx` | Book output | Full pipeline: outline→research→write→edit→enrich→Stage 4.6→format | Yes — file exists at expected path | FLOWING |

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|---------|---------|--------|--------|
| test-craft-check.js 18/18 pass | `node scripts/test-craft-check.js` | 18 pass, 0 fail, duration 640ms | PASS |
| test-rubric-regression.js base pass | `node scripts/test-rubric-regression.js` | Hash `b78477f...` matches baseline | PASS |
| test-rubric-regression.js --extended pass | `node scripts/test-rubric-regression.js --extended` | "schema v2: 8 components, 0-16 range, novelty_dedup dimension, novelty_variation component all present" | PASS |
| Adversarial fixture triggers novelty fail (exit 1) | `node scripts/craft-check.js --novelty --tier both --dna fixtures/tiny-book/adversarial/book-dna.md fixtures/tiny-book/adversarial/` | `flag: true, novelty_dedup: fail`, exit 1 | PASS |
| Proof-run fixture passes novelty check (exit 0) | `node scripts/craft-check.js --novelty --tier both --dna fixtures/tiny-book/run/book-dna.md fixtures/tiny-book/run/` | `flag: false, novelty_dedup: pass`, 0 repeated_spans, all Tier 2 arrays empty, exit 0 | PASS |
| Consistency-report.md has schema v2 YAML at column 0 | `grep -E '^schema_version:\|^captivation_total:\|^novelty_dedup:\|^novelty_dedup_flags:' .../reports/consistency-report.md` | `schema_version: 2`, `captivation_total: 16`, `novelty_dedup: pass`, `novelty_dedup_flags: []` | PASS |
| Refrain cap: "one small lamp refusing the whole dark" appears 0 times in edited/ and front-matter/ (proof run output) | `grep -c ...` across 4 files | 0, 0, 0, 0 — refrain phrase not used at all in proof-run output (within max_uses: 1 budget) | PASS |
| Final .docx exists at expected path | `ls fixtures/tiny-book/run/final/The 2am Prayer.docx` | File found | PASS |

---

### Requirements Coverage

| Requirement | Source Plans | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| SC-1 | 13-03, 13-04, 13-06, 13-09 | ONE canonical captivation score surface (YAML emit, YAML read, 3 schemas reconciled) | SATISFIED | `references/captivation-rubric.md` schema_version: 2 is single source; editor emits at column-0; sample reads via anchored grep; test-rubric-regression.js --extended validates shape; legacy fallback removed from sample §4 |
| SC-2 | 13-01, 13-02, 13-03, 13-05, 13-06, 13-08 | Editor Pass 3 §4.4.5 Novelty/Dedup Audit (Tier 1 + Tier 2) | SATISFIED | Editor §4.4.5 fully implemented with Step A (deterministic), Step B (LLM judgment), verdict formula, rewrite_targets emit; adversarial Tier 1 fixture triggers all expected flags; adversarial Tier 2 fixture in test harness; Mode 7 orchestrator consumer wired |
| SC-3 | 13-03, 13-04, 13-05, 13-07 | Rubric novelty_variation component + vehicle-phrasing distinctness + zone-cap | SATISFIED | Rubric has 8th component `### Novelty / Variation` with 3 sub-checks; outliner Refrain Candidate Gate enforces distinctness at book-dna creation time; craft-check.js central_image_reuse check enforces vehicle distinctness in adversarial fixture |
| SC-4 | 13-07 | Writer anti-loop clause | SATISFIED | `## Anti-Loop Clause (Phase 13, D-30)` in writer SKILL.md with all 5 rules, refrain schema, consequence section |
| SC-5 | 13-10 | Fixture brief rewrite to motif-family + 3 distinct vehicles + refrain cap | SATISFIED | brief.md has motif family declaration, 3 distinct vehicles, refrain cap; run/book-dna.md has refrains block, flat chapter map with 3 distinct central_image entries |
| SC-6 | 13-11, 13-12, 13-13, 13-14 | Fresh sample passes new canonical gate, zero dedup flags, Tier 1 AND Tier 2 | SATISFIED | Plan 13-14 re-run: captivation 16/16 (threshold 10), novelty_dedup pass, 0 repeated_spans, all Tier 2 arrays empty, enrichments 3/3, .docx emitted, human approved |

All 6 success criteria satisfied. No orphaned requirements.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | — | — | No anti-patterns found across key modified files |

Scan notes:
- `skills/writer/SKILL.md` Anti-Loop Clause returns `null` / `{}` / `[]` patterns did not appear in rule bodies — all 5 rules are substantive instructions.
- `skills/editor/SKILL.md §4.4.5` Step A/B/C implementations are substantive (not TODOs). The "do NOT rewrite" constraint is intentional (judge-not-author), not a stub.
- `scripts/craft-check.js --novelty` engine is fully implemented: all four Tier 1 checks and all four Tier 2 checks produce live results confirmed by adversarial fixture.
- No `TODO`, `FIXME`, `PLACEHOLDER`, or `coming soon` found in any key Phase 13 files.

---

### Human Verification Required

#### 1. End-to-end reader quality check

**Test:** Read `fixtures/tiny-book/run/front-matter/foreword.md` + `edited/ch01-final.md` + `edited/ch02-final.md` + `edited/ch03-final.md` end-to-end.
**Expected:** (a) Three chapters thread the motif family without feeling like the same lamp. (b) No vulnerability scene appears paraphrased in two artefacts. (c) Refrain phrase appears at most once total across the whole booklet. (d) Book does not feel like a loop.
**Why human:** Subjective quality judgment — the root trigger for Phase 13 was rubric-green + reader-experienced-as-loop. Automated gates verify structural absence of duplication; human verifies the prose doesn't FEEL repetitive at paraphrase level below 6 words.
**Status:** APPROVED by David per 13-14-SUMMARY.md: "the book is actually very good."

---

### Gaps Summary

No gaps. All 6 success criteria have been verified against the actual codebase and live test results.

Phase 13 closed the repetition blindspot through a multi-layer defence:
- **Canonical score surface (SC-1):** Schema v2 rubric as single source, editor emits at column-0, sample reads via anchored grep, legacy fallback removed.
- **Dedup audit (SC-2):** Editor §4.4.5 hybrid deterministic + LLM with rewrite_targets.yaml; Mode 7 orchestrator for scoped re-runs.
- **Novelty component (SC-3):** 8th rubric component scoring vehicle distinctness + span dedup + vulnerability-beat single-location; Refrain Candidate Gate in outliner.
- **Writer discipline (SC-4):** Anti-Loop Clause with 5 rules covering phrase reuse, spent seeds, vehicle distinctness, echo vs. repeat, refrain budget.
- **Fixture (SC-5):** Brief and book-dna rewritten with motif-family architecture and pre-approved refrain block.
- **Proof run (SC-6):** Gap closure plans 13-12 (enricher Anti-Loop Clause) and 13-13 (Stage 4.6 post-enricher novelty gate) fixed the original foreword bleed; 13-14 re-run produced captivation 16/16, novelty_dedup pass, 0 flags, .docx emitted, human approved.

---

_Verified: 2026-04-16T08:15:53Z_
_Verifier: Claude (gsd-verifier)_
