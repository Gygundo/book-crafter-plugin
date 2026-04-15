---
phase: 10-writing-quality-v2
plan: 03
subsystem: writer + outliner (bestseller craft enforcement)
tags: [craft, writer, outliner, book-dna, provenance, central-image, vulnerability-beat, reader-moments]
dependency-graph:
  requires:
    - 10-02 (bestseller-craft-rules.md exists and is the authoritative spec)
    - Book DNA template and outliner from Phase 02
  provides:
    - Writer skill that enforces CRAFT-01..06 at draft time
    - Outliner that assigns per-chapter central_image and vulnerability_beat_seed
    - Book DNA template carrying both new craft fields
  affects:
    - Plan 10-04 (editor) will rely on writer emitting provenance + METADATA craft fields
    - Plan 10-05 (craft-check.js) already built against the writer's lexicon and metadata shape
tech-stack:
  added: []
  patterns:
    - Reference-file indirection: writer cites bestseller-craft-rules.md as authoritative spec
    - HTML comment provenance (D-19, D-21) survives markdown passes, stripped by formatter
    - Outliner as data source for writer constraints (central_image, vulnerability_beat_seed)
key-files:
  created: []
  modified:
    - skills/outliner/SKILL.md
    - skills/writer/SKILL.md
    - references/book-dna-template.md
decisions:
  - Chapter Map shifts from table to sub-list in book-dna-template to accommodate two new fields without column-width blowout
  - Writer reads vulnerability_beat_seed as a hard constraint; fabrication is CRAFT-04 hard fail
  - Greek/Hebrew lexicon is cited in full inside writer SKILL.md so chapter-writer subagents don't need to cross-load craft-check.js
  - Reader Moments rule degrades to flag-only mode when voice profile has no Reader Moments section (CRAFT-06 / D-14..16)
metrics:
  duration: ~4min
  completed: 2026-04-15
---

# Phase 10 Plan 03: Writer + Outliner Craft Enforcement Summary

CRAFT-01..06 rules are now wired procedurally into the writer skill at draft time, with the outliner supplying the two new constraint fields (`central_image`, `vulnerability_beat_seed`) the writer depends on.

## What Changed

### skills/outliner/SKILL.md
- Added `central_image` and `vulnerability_beat_seed` as mandatory per-chapter outline fields in Section 3 Step 4.
- Added "Central Image Distinctness Check" subsection to the cross-chapter coherence pass — uses semantic judgment (not string match) to reject near-duplicate images, citing PITFALLS.md Pitfall 9.
- Added "Vulnerability Beat Seed Sourcing" subsection — walks `sources-adapted/`, `sources/`, `voice-profile.md`, `book-dna.md` for real fragments; leaves field empty with explicit skip note if nothing sourceable is found.
- Updated Section 5 outline output format with both new fields on every chapter entry.
- Rewrote Section 6 Step 5 (Chapter Map emission) to use a sub-list layout per chapter (table was too wide for the two new columns). Both fields are mandatory in Book DNA emission.

### skills/writer/SKILL.md (351 → 441 lines, +90)
- **Section 1 Step 5 (new):** Writer reads `central_image` and `vulnerability_beat_seed` from outline as constraints; opens the referenced seed source line before drafting. Also loads `bestseller-craft-rules.md` as authoritative spec.
- **Section 3 (new subsection):** "Scene-First Opener Requirements (CRAFT-01)" — mandates provenance comment as first line, named human/time-marker/sensory detail within first 150 words.
- **Section 4 (two new subsections):**
  - "Central Image Discipline (CRAFT-03)" — three zones (literal → metaphor → echo), never drop the image mid-chapter.
  - "Vulnerability Beat (CRAFT-04)" — exactly one sourced first-person beat in middle third; fabrication = hard fail.
- **Section 6 (new subsection):** "Reader Moments Selection (CRAFT-06)" — ≥2 concrete moments from voice profile, METADATA-tracked, degrades gracefully.
- **Section 7 (top):** "Transliterated Term Density Cap (CRAFT-02)" — ≤3 Greek/Hebrew terms per chapter with explicit 25-term lexicon and 3-sentence unpacking rule.
- **Section 8 (updated):** Every chapter draft now starts with two HTML comments on lines 1-2 (provenance + version stamp), heading on line 3+. METADATA block extended with `central_image`, `vulnerability_beat`, `vulnerability_beat_source`, `reader_moments_used`, `provenance`.
- **Section 9 (three new anti-patterns):** No pulpit-seam paragraph starts (CRAFT-05, 11 banned phrases), no fabricated vulnerability beats, no exceeding Greek lexicon cap.

### references/book-dna-template.md
- Chapter Map rewritten from table to sub-list layout, carrying `central_image` and `vulnerability_beat_seed` per chapter. Cites bestseller-craft-rules.md § CRAFT-03/04.

## Commits

- `cc5132a` — feat(10-03): add central_image and vulnerability_beat_seed to outliner and Book DNA template
- `d50aec7` — feat(10-03): enforce CRAFT-01..06 procedurally in writer skill

## Verification

Acceptance criteria (from plan):

Task 1 (outliner + book-dna-template):
- `grep -c "central_image" skills/outliner/SKILL.md` → 7 (≥ 3) ✓
- `grep -c "vulnerability_beat_seed" skills/outliner/SKILL.md` → 7 (≥ 3) ✓
- `grep -q "Central Image Distinctness" skills/outliner/SKILL.md` → true ✓
- `grep -q "Vulnerability Beat Seed Sourcing" skills/outliner/SKILL.md` → true ✓
- `grep -c "central_image" references/book-dna-template.md` → 4 (≥ 1) ✓
- `grep -c "vulnerability_beat_seed" references/book-dna-template.md` → 4 (≥ 1) ✓

Task 2 (writer):
- `grep -q "Scene-First Opener Requirements" skills/writer/SKILL.md` → true ✓
- `grep -q "Central Image Discipline" skills/writer/SKILL.md` → true ✓
- `grep -q "Vulnerability Beat" skills/writer/SKILL.md` → true ✓
- `grep -q "Reader Moments Selection" skills/writer/SKILL.md` → true ✓
- `grep -q "Transliterated Term Density Cap" skills/writer/SKILL.md` → true ✓
- `grep -c "bestseller-craft-rules.md" skills/writer/SKILL.md` → 7 (≥ 3) ✓
- `grep -q "provenance:" skills/writer/SKILL.md` → true ✓
- `grep -q "vulnerability_beat_seed" skills/writer/SKILL.md` → true ✓
- `grep -c 'charis' skills/writer/SKILL.md` → 1 (≥ 1, lexicon present) ✓
- `grep -q "reader_moments_used" skills/writer/SKILL.md` → true ✓
- Writer line count: 441 (target range 400–520) ✓

## Must-Haves Check

- Writer emits provenance comment as chapter line 1 ✓
- Writer threads central_image through opening/middle/closing ✓
- Writer caps at 3 transliterated terms with ≥3 unpacking sentences each ✓
- Writer selects ≥2 Reader Moments from voice profile ✓
- Writer places one sourced vulnerability beat in middle third ✓
- Outliner assigns central_image + vulnerability_beat_seed per chapter, distinct across chapters ✓

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. The writer and outliner both describe runtime behaviour that will be exercised the next time the pipeline runs; no hardcoded empty data flows to UI.

## Self-Check: PASSED

- skills/outliner/SKILL.md — FOUND (modified)
- skills/writer/SKILL.md — FOUND (modified, 441 lines)
- references/book-dna-template.md — FOUND (modified)
- Commit cc5132a — FOUND
- Commit d50aec7 — FOUND
