# Ship Decision (GATE-08)

**Date:** 2026-04-17
**Milestone:** v1.1.0 -- Bestseller Quality + Distribution

## Evidence Summary

### GATE-01: Baseline Frozen

- **Status:** PASS
- **File:** evidence/eternally-secure-ch1-before.md
- **Detail:** Byte-identical copy of Phase 7 Ch1 output preserved as immutable baseline (12,746 bytes).

### GATE-02: Pipeline Re-run

- **Status:** PASS
- **File:** evidence/eternally-secure-ch1-after.md
- **Detail:** Mode 6 Fresh Run produced a complete Ch1 through the v1.1 pipeline. Version stamp deviation accepted (pipeline does not emit generated-by comment); content diff confirms a materially different output.

### GATE-03: Seven-Gap Comparison

- **Status:** PASS -- all 8 gaps show clear improvement
- **File:** evidence/seven-gap-comparison.md
- **Gaps improved:**
  1. Scene Opener (CRAFT-01) -- abstract statistic replaced with 11:47pm bedroom scene with sensory detail
  2. Greek Density (CRAFT-02) -- 11 distinct terms reduced to approximately 2 (soter, sozo), within cap of 3
  3. Author Vulnerability (CRAFT-04) -- absent in baseline; re-run adds "you have had a version of that night yourself" identification bridge
  4. Central Image (CRAFT-03) -- single late-paragraph metaphor replaced with two interlocking images (lifeguard + Noah's ark) threaded through opening, middle, and closing zones
  5. Tension-Release (CRAFT-07) -- linear teaching replaced with italicised reader-thought questions, pull-quote tension lines, and second-person confrontation
  6. Reader Anchor (CRAFT-06) -- "Millions of believers" abstract collective replaced with specific woman's concrete details ("thirty-two years", sharp word at breakfast, forgotten prayer)
  7. Pulpit Seams (CRAFT-05) -- banned-start phrases ("So let us", "Now here is") eliminated; remaining constructions function as narrative reveals
  8. Novelty/Dedup (Phase 13) -- single extended drowning metaphor replaced with two distinct vehicle families (lifeguard rescue, Noah's ark)
- **Gaps unchanged or unclear:** None

### GATE-04: External Blind Review

- **Status:** PASS -- blind reviewer ranked v1.1 output (Version A) winner across all 5 dimensions
- **File:** evidence/external-review.md
- **Reviewer preferred:** Version A = after (v1.1 pipeline output)
- **Dimension results:**
  - Opening engagement: A wins decisively
  - Prose quality: A wins
  - Concrete imagery: A wins by a wide margin
  - Reader connection: A wins
  - Would keep reading: A
- **Caveat noted by reviewer:** Version B (before) has tighter exegetical apparatus and specific technical observations (dokimos, perfect-tense, 1 John 2:19) that could be grafted into A sparingly

### GATE-05: Sermon-Adapter Regression

- **Status:** PASS
- **File:** evidence/sermon-adapter-regression.md
- **Detail:** SHA256 checksums for all 3 sources-adapted files are byte-identical before and after the Mode 6 Fresh Run. The sermon adapter was not affected by v1.1 pipeline changes.

### GATE-06: Fresh-Install Smoke Test

- **Status:** PASS
- **File:** evidence/smoke-test-log.md
- **Detail:** Fresh marketplace install produced a valid .docx on first attempt (after plugin.json name fix in commit 8bafb71). Full pipeline completed with captivation 14/16 (threshold 11) and novelty_dedup pass. All 8 pipeline stages executed end-to-end.
- **Issue encountered and resolved:** plugin.json name field required update from book-crafter-dev to book-crafter for marketplace resolution.

### GATE-07: README Capability Language

- **Status:** PASS
- **File:** README.md (line 5)
- **Current capability line:** "Writes non-fiction books with scene-driven openers, controlled theological density, voice-consistent prose, and novelty-enforced imagery -- backed by 8 countable craft rules and a blind A/B review."

## Decision

**Decision:** [TO BE FILLED BY DAVID]

**Notes:** [TO BE FILLED BY DAVID]

---
*This decision blocks `git tag v1.1.0`. No tag will be applied without an explicit "ship" recorded above.*
