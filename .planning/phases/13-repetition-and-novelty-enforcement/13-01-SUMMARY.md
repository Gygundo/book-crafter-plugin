---
phase: 13-repetition-and-novelty-enforcement
plan: 01
subsystem: fixtures/tiny-book/adversarial
tags: [fixture, tier1, novelty, dedup, release-whitelist]
dependency_graph:
  requires: []
  provides:
    - fixtures/tiny-book/adversarial/ (Tier 1 known-bad manuscript)
    - fixtures/tiny-book/adversarial/expected-flags.json (assertion baseline)
    - scripts/release.sh Gate 3b (defensive exclusion)
  affects:
    - Plan 13-03 (test-craft-check.js fail-path assertions)
    - Plan 13-05 (craft-check.js --novelty detection engine)
tech_stack:
  added: []
  patterns:
    - Hand-authored adversarial fixtures (no LLM)
    - Whitelist-exclusion sub-gates in release.sh
key_files:
  created:
    - fixtures/tiny-book/adversarial/front-matter/foreword.md
    - fixtures/tiny-book/adversarial/edited/ch01-final.md
    - fixtures/tiny-book/adversarial/edited/ch02-final.md
    - fixtures/tiny-book/adversarial/edited/ch03-final.md
    - fixtures/tiny-book/adversarial/book-dna.md
    - fixtures/tiny-book/adversarial/expected-flags.json
  modified:
    - scripts/release.sh
decisions:
  - Refrain phrase removed from ch02's final paragraph so total book occurrences land at exactly 2 (foreword+ch02), not 3. Proves off-by-one handling flags occurrence N+1.
  - All phrase strings in expected-flags.json use lowercase (normalised form craft-check.js will compare).
  - Gate 3b is a sub-assertion of existing Gate 3, not a new numbered gate, per Task 3 instructions.
metrics:
  duration: ~4 min
  completed: 2026-04-15
  tasks: 3
  files: 7
---

# Phase 13 Plan 01: Adversarial Tier 1 Fixture Summary

Hand-authored known-bad Tier 1 manuscript + expected-flags.json + release.sh Gate 3b exclusion — establishes the fail-path substrate for craft-check.js --novelty validation in later waves.

## What Was Built

A deterministic Tier 1 adversarial fixture at `fixtures/tiny-book/adversarial/` containing:

1. **foreword.md** — ~180 words of devotional prose, seeds the 11-word verbatim span `I stood at the kitchen counter with both hands flat on the wood and nothing spiritual to say` and the refrain `one small lamp refusing the whole dark` (first of two occurrences).
2. **ch01-final.md** — ~300 words with central_image vehicle `unlit bedside lamp`. Seeds the 7-word cross-artefact span `the weight of it pressed on my chest`.
3. **ch02-final.md** — ~330 words with central_image vehicle `the desk lamp glowing yellow`. Contains the foreword's 11-word span verbatim plus a near-verbatim restatement of the kitchen-counter vulnerability beat in different words. Contains the refrain phrase a second time (the max_uses+1 occurrence that must flag).
4. **ch03-final.md** — ~290 words with central_image vehicle `reading lamp on the nightstand`. Reuses the 7-word span from ch01.
5. **book-dna.md** — minimal; Chapter Map sub-list with three "lamp" vehicles + YAML refrains block at `max_uses: 1, scope: whole_book`.
6. **expected-flags.json** — assertion baseline: `flag: true`, `novelty_dedup: fail`, two repeated_spans, one vulnerability_beat_reuse, one central_image_reuse (lamp family), one refrain_overuse.

`scripts/release.sh` gains a Gate 3b sub-assertion that fails the release build if the adversarial directories ever appear in staging — a defensive guard so future widening of the fixtures copy logic cannot accidentally ship test-only material.

## Phrase / Vehicle Choices

- **11-word span** (foreword ↔ ch02): `I stood at the kitchen counter with both hands flat on the wood and nothing spiritual to say` — long enough to beat a 6-word threshold comfortably, naturally phrasable as devotional prose, uses no scripture or refrain to avoid skip-list false negatives.
- **7-word span** (ch01 ↔ ch03): `the weight of it pressed on my chest` — realistic devotional somatic description; second repeated-span case demonstrates the engine flags multiple independent spans, not just the longest.
- **Lamp vehicle family**: bedside lamp / desk lamp / reading lamp — three nouns with identical head (`lamp`), different modifiers. A correctly written manuscript would diverge to phone glow / yellow kitchen pool / dawn seam (per D-20). The deliberate collapse to one head noun is what the vehicle-distinctness check MUST flag.
- **Vulnerability beat reuse**: ch02's second paragraph ("I planted both palms on the butcher block...") restates the foreword's kitchen-counter scene with the same named moment and the same "nothing spiritual/devotional/holy" beat, in slightly different words. This exercises Step B LLM judgment beyond the deterministic 11-word span.

## Refrain Off-By-One Test Construction

The refrain `one small lamp refusing the whole dark` is specified as `max_uses: 1, scope: whole_book`. The fixture places it:
- Foreword, paragraph 3 (occurrence #1 — ALLOWED, the first use)
- Ch02, second-to-last paragraph (occurrence #2 — MUST FLAG as max_uses+1)

The correct off-by-one behaviour under test is that occurrence #1 is permitted (it IS the refrain being established) and occurrence #2 exceeds the cap. A naive implementation that flags occurrence #1 would be wrong because it would always flag even legitimate refrains.

Ch01 and ch03 do not contain the refrain at all — this keeps the test minimal and deterministic (total occurrences == 2 exactly, not "at least 2").

## Deviations from Plan

### Task 1 Prose Tweak

**1. [Plan constraint adjustment] Removed second refrain occurrence from ch02's final line**
- **Found during:** Task 1 acceptance-criteria verification
- **Issue:** First draft of ch02 had the refrain appear twice in ch02 alone (paragraph 4 and the closing line), making total book occurrences == 3, not the 2 the plan specified.
- **Fix:** Rewrote ch02's closing line from `a kitchen counter, a desk lamp, and one small lamp refusing the whole dark.` to `a kitchen counter, and a desk lamp, and an underlined sentence on a page.`
- **Files modified:** fixtures/tiny-book/adversarial/edited/ch02-final.md
- **Commit:** b10182d (Task 1 commit — fix was made before commit)
- **Rule:** Rule 3 (blocking issue — acceptance criterion `grep -c "one small lamp refusing the whole dark" ch02-final.md == 1` was failing)

No other deviations. Plan executed exactly as written.

## Authentication Gates

None.

## Acceptance Criteria Verification

All grep counts verified before each commit:
- 11-word span: 1 in foreword.md, 1 in ch02-final.md ✓
- 7-word span: 1 in ch01-final.md, 1 in ch03-final.md ✓
- Refrain: 1 in foreword.md, 1 in ch02-final.md, 0 elsewhere ✓
- Chapter Map: 3 lines matching `^- Ch [123] central_image:` ✓
- book-dna.md contains YAML `refrains:` block with `max_uses: 1`, `scope: whole_book` ✓
- expected-flags.json: `node -e` assertion exits 0 ✓
- release.sh: `bash -n` passes, `grep -c 'Gate 3b'` == 2, `grep -q 'adversarial fixture'` matches ✓

## Commits

- `b10182d` — test(13-01): add adversarial Tier 1 manuscript fixture
- `68e7019` — test(13-01): add expected-flags.json for Tier 1 adversarial fixture
- `e451e6a` — chore(13-01): add release.sh Gate 3b adversarial fixture exclusion

## Known Stubs

None. The fixture is inert until Plans 13-03 and 13-05 land, but that is by design (Wave 0) and documented in the plan's verification section — not a stub, a staged dependency.

## Self-Check: PASSED

All files confirmed present on disk, all three commits confirmed in git log.
