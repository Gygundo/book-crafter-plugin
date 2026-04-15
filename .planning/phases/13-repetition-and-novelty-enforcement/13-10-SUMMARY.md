---
phase: 13-repetition-and-novelty-enforcement
plan: 10
subsystem: fixtures
tags: [fixture, tiny-book, motif-family, refrains, fixture-bypass, sc-5]
requires: [13-07, 13-09]
provides: [rewritten-brief, pre-approved-book-dna, refrains-block, flat-chapter-map]
affects:
  - fixtures/tiny-book/brief.md
  - fixtures/tiny-book/run/book-dna.md
tech-stack:
  added: []
  patterns: [motif-family-distinct-vehicles, flat-chapter-map-for-parser, fenced-yaml-refrains-block, fixture-bypass]
key-files:
  created:
    - fixtures/tiny-book/run/book-dna.md (force-added through .gitignore per D-09 fixture bypass contract)
  modified:
    - fixtures/tiny-book/brief.md
decisions:
  - "Motif family 'light in the night' expressed with three distinct vehicles per D-19/D-20 — phone glow / yellow pool over kitchen counter / grey seam of dawn"
  - "Refrain 'one small lamp refusing the whole dark' capped at max_uses: 1 whole_book scope per D-21 — any second verbatim occurrence is a Phase 13 hard fail"
  - "Kept the existing nested-list Chapter Map for human readability and appended a separate '### Chapter Map (flat format for tool readers)' section for craft-check.js parseChapterMap — dual representation with an explicit keep-in-sync note, zero parser changes required"
  - "Refrains block uses fenced ```yaml code block and plain integer max_uses: 1 (not string '1') per D-07 and craft-check.js --dna parser expectations"
  - "Force-added fixtures/tiny-book/run/book-dna.md through .gitignore — run/ is gitignored as regenerated output but book-dna.md is the D-09 fixture bypass substrate and must be committed"
  - "Directional arc night → dawn declared in both brief §Craft Anchors and book-dna Cross-Chapter Continuity so a future swap-test catches out-of-sequence pipeline bugs"
  - "Key Terms 'The lamp' definition replaced with 'Light in the night' motif family entry — old term encouraged single-vehicle thinking that was the Phase 13 root cause"
metrics:
  duration: ~4min
  completed: 2026-04-15
---

# Phase 13 Plan 10: Fixture Brief and DNA Rewrite Summary

Rewrite the tiny-book fixture brief to stop injecting the repetition that triggered Phase 13 in the first place, and pre-populate the run-directory Book DNA with a refrains block and a distinct-vehicle Chapter Map so `/book-crafter:sample` can non-interactively bypass the Refrain Candidate Gate (D-09). The old brief mandated "one small lamp refusing the whole dark" as a central image in every chapter's opening / middle / closing — the cross-AI reviewers' root cause for the 14/14 scoring duplicate-lamp output. This plan removes that loop-mandate, declares a motif family with three distinct vehicles per D-19/D-20, caps the refrain at max_uses: 1 per D-21, and ships a pre-approved Book DNA so Plan 13-11's SC-6 proof run has a clean substrate.

## What Changed

### Task 1 — fixtures/tiny-book/brief.md

- Updated §Proposed Chapters scene beats so each chapter specifies its DISTINCT vehicle (Ch 1 phone glow over the ceiling; Ch 2 yellow pool over the counter; Ch 3 grey seam of dawn overtaking artificial light). Chapter titles and core beats preserved.
- Replaced §Craft Anchors entirely:
  - Kept time markers (2:17 / 3:04 / 4:42).
  - Added "Motif family: light in the night" declaration with D-19/D-20 provenance.
  - Added three explicit "Ch N vehicle" lines with sensory anchors.
  - Added directional arc "night → dawn" with swap-test rationale.
  - Added refrain cap: exact phrase "one small lamp refusing the whole dark" may appear AT MOST ONCE (whole_book, max_uses: 1). Any second occurrence = Phase 13 hard fail per D-21.
  - Added anti-loop clause for vulnerability beats — D-30 rule 2 (single-location detail per book).
  - Kept Reader moments list but added explicit note that cross-chapter reuse is flagged by Editor Pass 3 §4.4.5.
- Added a new bullet to §What This Brief Is NOT: "Not a loop" — calls out the motif family + distinct vehicle contract and names the D-21 verbatim cap.
- **Deleted** the old line "Central image: one small lamp refusing the whole dark — appears in opening 200 words, middle third, and closing 200 words of every chapter." — this was the single most direct cause of the Phase 13 duplicate-lamp output.
- Final length: 50 lines (plan guide said "~60-70" / "roughly 55-80"; the delta was smaller than anticipated because the original brief was already 45 lines and the planned rewrites were mostly in-place replacements, not expansions).
- Commit: `80d0054`

### Task 2 — fixtures/tiny-book/run/book-dna.md

- Rewrote all three chapters' `central_image:` lines in the nested-list Chapter Map:
  - Ch 1: `phone glow over the ceiling, bedside lamp untouched` (was: "one small lamp refusing the whole dark (bedside lamp, not yet clicked on)")
  - Ch 2: `yellow pool over the kitchen counter` (was: "one small lamp refusing the whole dark (now lit — the kitchen lamp)")
  - Ch 3: `grey seam of dawn overtaking artificial light` (was: "one small lamp refusing the whole dark (shared — lamp, Host, grey window)")
- Updated `vulnerability_beat_seed` for each chapter to cite voice-profile.md Reader Moments (per plan instructions).
- Added `time_marker` sub-bullets for each chapter (2:17am / 3:04am / 4:42am).
- Updated each chapter's "Connects to" clause to reflect the vehicle hand-off (yellow pool eaten by grey seam of dawn in Ch 3, etc.) — removes "lamp becomes a witness" framing that implied the same vehicle.
- Added a new `### Chapter Map (flat format for tool readers)` subsection with three lines matching the `^- Ch \d+ central_image: (.+)$` regex that craft-check.js --novelty's parseChapterMap (Plan 13-05) expects. Kept the nested format for human readability; kept-in-sync note references Plan 13-05.
- Added a new `## Refrains` section between Chapter Map and Running Themes, containing:
  - A preamble explaining the D-09 fixture bypass contract.
  - A fenced ```yaml code block with `refrains:` list — one entry, phrase `"one small lamp refusing the whole dark"`, `max_uses: 1` (plain integer, not string), `scope: whole_book`.
- Rewrote the `## Running Themes` "One small lamp..." bullet into a "Light in the night (motif family)" bullet describing the three distinct vehicles and the night → dawn directional arc. Old framing of "Unclicked → clicked → shared" removed (implied single-vehicle progression).
- Updated `## Key Terms and Jargon`: removed "The lamp" row (old definition "The small physical act of refusing the whole dark — a parable of surrender" encouraged single-vehicle thinking); added "Light in the night" row defining the motif family and the anti-reuse contract.
- Updated `## Cross-Chapter Continuity`: replaced the old bullet "The lamp appears in opening 200 words, middle third, and closing 200 words of every chapter" with a motif-family bullet naming the three distinct vehicles and referencing the Refrains block for the one permitted verbatim phrase reuse.
- **Force-added through .gitignore**: `fixtures/tiny-book/run/` is gitignored as regenerated output, but book-dna.md is the D-09 fixture bypass substrate and must be committed. Used `git add -f`.
- Commit: `1b2213e`

## Deviations from Plan

### Brief length

The plan's action block said "The entire file should end up ~60-70 lines" while the acceptance criteria said "roughly 55-80 lines". The rewritten brief is 50 lines — five lines below the acceptance range. Reason: the plan's content spec was largely in-place replacements rather than additions. The original brief was 45 lines; the rewrite added the three "Ch N vehicle" lines, the motif-family declaration, the refrain cap, the anti-loop NOT bullet, and the directional arc, which netted +5. All acceptance-criteria grep assertions pass and no content was dropped. Not a deviation in substance, only in the soft line-count target.

### Dual Chapter Map representation

Plan's action block offered two options: (a) if the current file uses the flat `- Ch N central_image:` format, keep it; (b) if it uses nested format, append a flat-format summary. The current file used nested format, so I took option (b): kept the nested Chapter Map for human readability and appended a separate `### Chapter Map (flat format for tool readers)` subsection with a keep-in-sync note and a cross-reference to Plan 13-05. This matches the plan's guidance verbatim — documented here because it is a visible structural choice.

No auto-fixes (Rules 1-3) were needed. No architectural decisions (Rule 4) were raised. No authentication gates occurred.

## Verification

Task 1 automated verify (from plan):
```
grep -q 'Motif family'                                   OK
grep -q 'phone glow'                                     OK
grep -q 'yellow pool'                                    OK
grep -q 'grey seam of dawn'                              OK
grep -q 'Ch 1 vehicle'                                   OK
grep -q 'max_uses: 1'                                    OK
grep -c 'appears in opening 200 words, ...' == 0         OK
```

Task 2 automated verify (from plan):
```
grep -q 'phone glow over the ceiling'                    OK
grep -q 'yellow pool over the kitchen counter'           OK
grep -q 'grey seam of dawn overtaking artificial light'  OK
grep -q '^refrains:'                                     OK
grep -q 'max_uses: 1'                                    OK
grep -q 'scope: whole_book'                              OK
grep -cE '^- Ch [123] central_image:' >= 3               OK (3)
```

Stale-reference scan (body prose): `grep -n 'same central image|same lamp across|single shared lamp|lamp refusing'` returns only line 90 — the `phrase:` field inside the refrains YAML block, which is correct.

## Handoff to Plan 13-11 (SC-6 Proof Run)

This plan delivers the substrate Plan 13-11 consumes:

1. **Brief substrate**: The rewritten brief no longer mandates the loop. A fresh `/book-crafter:sample` run against this brief should produce three chapters with distinct central images because:
   - The writer reads the brief's §Craft Anchors and honours the motif family + vehicle assignments per chapter.
   - The outliner reads the brief and emits a fresh book-dna.md (for non-fixture runs) — but for fixture runs, the pre-populated book-dna.md below is used as the fixture bypass.
2. **Book DNA substrate**: `fixtures/tiny-book/run/book-dna.md` now ships pre-approved with:
   - Three distinct central_images in the Chapter Map (both nested and flat formats).
   - A pre-approved refrains block that the orchestrator's Refrain Candidate Gate (Plan 13-07) detects and bypasses non-interactively (D-09).
3. **What Plan 13-11 will do**: Run Mode 6 Fresh Run against the rewritten fixture. Expected outcome: SAMPLE PASS with `captivation_total >= 10/16` and `novelty_dedup: pass` (zero flags). If the proof run still fails, the failure is downstream of the fixture (writer, editor, or pipeline bug) — this plan has eliminated the fixture as the variable.

## Self-Check: PASSED

- fixtures/tiny-book/brief.md: FOUND
- fixtures/tiny-book/run/book-dna.md: FOUND
- Commit 80d0054: FOUND
- Commit 1b2213e: FOUND
