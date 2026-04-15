---
phase: 13-repetition-and-novelty-enforcement
plan: 05
subsystem: novelty-detection
tags: [craft-check, novelty, dedup, tier1, tier2, shingling]
requires: [13-01, 13-02, 13-03, 13-04]
provides:
  - "craft-check.js --novelty mode (Tier 1 + Tier 2 deterministic rule engine)"
  - "6-word n-gram shingler with maximal-span growth and refrain whitelist"
  - "vulnerability-beat signature extraction keyed off anchor phrases"
  - "central-image vehicle distinctness via dominant-word family detection"
  - "Tier 2 rule set for enrichments: question stems, prayer points, vulnerability bleed, back-matter vehicle reuse"
affects:
  - "editor Pass 3 §4.4.5 will invoke craft-check.js --novelty on every project"
  - "orchestrator Mode 7 gate reads novelty_dedup verdict"
  - "sample gate reads flag for ship/no-ship decision"
tech-stack:
  added: []
  patterns:
    - "zero-dependency Node stdlib (fs, path, child_process callers)"
    - "single-file executor preserved (no new modules)"
    - "maximal common substring via lock-step token extension across shared shingles"
key-files:
  created:
    - .planning/phases/13-repetition-and-novelty-enforcement/13-05-SUMMARY.md
  modified:
    - scripts/craft-check.js
decisions:
  - "Refrain off-by-one solved by counting the refrain's FIRST shingle occurrences across the corpus, then comparing to max_uses — N+1 trips the overuse flag. Refrain shingles are excluded from repeated_spans regardless of whether they overflow."
  - "Vulnerability-beat signatures emit 10 words (not 6) starting at the anchor phrase rather than the first sentence of the paragraph, because the first sentence frequently lacks the anchor itself (foreword para opens with 'There was a Tuesday...' but the duplicate lives in the third sentence)."
  - "Vehicle distinctness uses dominant-word detection (any content word appearing in ≥2 chapter vehicles collapses the family) with pairwise Jaccard ≥ 0.6 as a fallback. Chose dominant-word as primary because the adversarial fixture's three lamp vehicles share only the single word 'lamp' — a Jaccard-only pass under-counts."
  - "Discussion-question extraction parses items under `## Discussion Questions` section headings, not just `?`-terminated sentences. The adversarial fixture deliberately omits `?` on the duplicated stem so a regex-only approach misses it."
  - "Both `tier2_hits` and `tier2` keys present in output JSON as aliases so downstream readers using either name work. Tests assert either location."
metrics:
  completed: 2026-04-15
  duration_min: 12
  tasks: 1
  files_changed: 1
  commits: 1
---

# Phase 13 Plan 05: Novelty Detection Engine Summary

Deterministic Tier 1 + Tier 2 novelty/dedup rules landed in `scripts/craft-check.js` via a new `--novelty` branch. All 18 tests in `scripts/test-craft-check.js` — including the 5 Phase 13 novelty tests authored in Plan 13-03 — now pass, and the existing CRAFT-01..15 legacy path is untouched for back-compat.

## What Changed

`scripts/craft-check.js`: **127 → 669 lines** (+542). The append-only extension leaves the existing `main()` / CRAFT-01..15 path byte-identical. A dispatch conditional at the bottom of the file routes `--novelty` invocations to the new `mainNovelty()` while every other invocation reaches the legacy `main()`.

New pieces:

| Section | Purpose |
| --- | --- |
| `parseNoveltyArgs` | Parses `--tier 1\|2\|both`, `--dna <path>`, and the trailing positional project directory. Defaults DNA to `<dir>/book-dna.md`. |
| `readRefrainsFromDna` | Minimal flat YAML parser for the `refrains:` block (top-level or inside a fenced code block). Returns `[{phrase, max_uses, scope}]` or `[]` silently when the block is absent. |
| `normaliseForShingling` | Strips HTML comments, then blockquote lines (scripture), then markdown punctuation, then lowercases. Crucial ordering: `^>.*$` is stripped BEFORE lowercase so Ephesians blockquotes never reach the shingler. |
| `findCrossFileRepeats` | 6-word shingling across all files, followed by a lock-step growth pass that extends each shared shingle into a maximal common substring. Longer spans dominate shorter sub-spans via a coverage dedupe. Refrain shingles are excluded from `repeated_spans` entirely; the refrain's first shingle is counted against its `max_uses` budget independently. |
| `extractVulnParagraphs` | Splits paragraphs, checks for any VULN_ANCHORS hit, then emits a 10-word signature starting at EVERY anchor found in EVERY sentence of the paragraph — solves the foreword-first-sentence miss. |
| `findVulnerabilityBeatReuse` | Pairwise signature compare across distinct files, with a seen-set guard against duplicate emissions. |
| `parseChapterMap` | Regex scan of `- Ch N central_image: ...` lines from the Book DNA. |
| `vehicleDistinctness` | Dominant-word detection (any non-stopword appearing in ≥2 chapter vehicles) as primary; Jaccard ≥ 0.6 as fallback. Produces a single consolidated entry per dominant family. |
| `runTier2` | Rule 1 (question stems from `## Discussion Questions` sections + `?`-fallback), Rule 2 (prayer-point shingle overlap, theologically gated on `## Theological Framework` in `voice-profile.md`), Rule 3 (cross-chapter vuln signature bleed into enrichments), Rule 4 (chapter N's central_image appearing in chapter M's enrichments). |
| `mainNovelty` | Glue: reads Tier 1 files (`front-matter/*.md` + `edited/ch*-final.md`), runs whichever tier set is requested, assembles the JSON payload. |

## Output JSON Shape

```json
{
  "mode": "novelty",
  "tier": "both",
  "project_dir": "/abs/path",
  "repeated_spans": [{ "phrase": "...", "occurrences": [{"file": "...", "start": N}] }],
  "cross_artefact_hits": [{ "type": "vulnerability_beat_reuse", "source": "...", "duplicate": "...", "note": "..." }],
  "central_image_reuse": [{ "vehicle_family": "lamp", "files": ["edited/ch01-final.md", ...], "note": "..." }],
  "refrain_overuse": [{ "phrase": "...", "max_uses": 1, "actual_occurrences": 2, "files": [...] }],
  "tier2_hits": {
    "discussion_question_stems": [...],
    "prayer_point_repetition": [...],
    "vulnerability_bleed_to_summary": [...],
    "vehicle_reuse_in_backmatter": [...]
  },
  "tier2": { ... same as tier2_hits (alias) ... },
  "flag": true,
  "novelty_dedup": "fail"
}
```

Exit code: `0` when `flag: false`, `1` when `flag: true`, `2` on CLI or I/O error.

## Tuning Decisions

### Vehicle distinctness threshold

The research design suggested a pairwise Jaccard ≥ 0.6 cut. The adversarial Tier 1 fixture has three lamp vehicles (`unlit bedside lamp`, `desk lamp glowing yellow`, `reading lamp on the nightstand`) that share only the single content word `lamp`. Pair-by-pair Jaccard:

| Pair | Intersection | Union | Jaccard |
| --- | --- | --- | --- |
| Ch1 × Ch2 | `{lamp}` | `{unlit,bedside,lamp,desk,glowing,yellow}` | 0.17 |
| Ch1 × Ch3 | `{lamp}` | `{unlit,bedside,lamp,reading,nightstand}` | 0.20 |
| Ch2 × Ch3 | `{lamp}` | `{desk,glowing,yellow,lamp,reading,nightstand}` | 0.17 |

None clear the 0.6 bar. A pure Jaccard implementation would produce an empty `central_image_reuse` array and the fixture would not trip.

**Resolution:** dominant-word detection runs first. Any non-stopword appearing in ≥2 chapter vehicles collapses the family. The fixture has `lamp` in 3/3 vehicles → single consolidated entry `{ vehicle_family: "lamp", files: [ch01, ch02, ch03] }`. Jaccard remains as the fallback for vehicles that don't share a single dominant word but still overlap.

### Vulnerability-beat signature length

Plan specified 6 words. Promoted to 10 words after the first iteration because:

1. 6-word signatures from `extractVulnParagraphs` collided against unrelated paragraphs (e.g., "my hands flat on the counter" vs "my hands would not stop shaking") when the two beats happened to share the same anchor + 5 generic words.
2. The adversarial Tier 2 fixture duplicate span is specifically `my hands would not stop shaking as i tried to pray` — exactly 10 normalised tokens. A 6-word window would clip mid-phrase.

The 10-word signature eliminated false positives on the Tier 1 fixture AND aligned perfectly with the Tier 2 bleed span.

### Maximal span growth

A naïve 6-gram approach emits e.g. `{phrase: "i stood at the kitchen counter", occurrences: [...]}` and misses the full 19-word span the tests expect (`i stood at the kitchen counter with both hands flat on the wood and nothing spiritual to say`).

The growth pass: once a shingle is found in ≥2 distinct files, extend forward in lock-step (token N+1 identical across ALL locations, then N+2, etc). Sort by descending span length. Keep only spans whose occurrence-region is not fully covered by an already-kept longer span. This produces one row per maximal common substring, matching the test harness expectation.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Discussion-question extraction missed unpunctuated stems**
- **Found during:** Task 1 first test run
- **Issue:** The fixture's duplicated stem (`what does this chapter reveal about the character of god when you are afraid`) is rendered inside a numbered list WITHOUT a trailing `?`. The plan's `[A-Z][^.!?]*\?` regex returned zero matches.
- **Fix:** Added a section-aware parser that extracts items under `## Discussion Questions` headings (numbered or bulleted) BEFORE falling back to `?`-terminated sentences. The normaliser still runs downstream, so stems are whitespace/case-normalised identically.
- **Files modified:** scripts/craft-check.js (runTier2)

**2. [Rule 1 - Bug] Vulnerability signature picked first sentence, not anchor sentence**
- **Found during:** Task 1 third test run
- **Issue:** Plan specified "compute a 6-word signature from its first sentence". The foreword paragraph starts "There was a Tuesday I will not forget" — the anchor phrase lives in the third sentence. ch02 has a similar first-sentence mismatch. Result: zero vulnerability-beat reuse hits even though the prose was word-for-word duplicated.
- **Fix:** `extractVulnParagraphs` now walks every sentence in the paragraph, and for every VULN_ANCHOR it finds in a sentence, emits a 10-word signature starting at the anchor's offset within that sentence. Signatures are emitted per-anchor (not one-per-sentence) so a sentence containing both `my hands` and `i tried` contributes two signatures.
- **Files modified:** scripts/craft-check.js (extractVulnParagraphs)

**3. [Rule 2 - Critical functionality] Missing maximal-span growth pass**
- **Found during:** Task 1 first test run
- **Issue:** The plan's `findCrossFileRepeats` returned 6-word shingles directly. The test harness asserts that `result.repeated_spans` contains the FULL 19-word duplicated phrase with exact `s.phrase === exp.phrase` equality. A 6-word-only implementation leaves the test perpetually red.
- **Fix:** After collecting shared shingles, extend each one forward in lock-step (token N+1 identical across all locations, then N+2, …) to find the maximal common substring. Then apply a coverage-based dedupe: spans whose every (file, start) is wholly inside a kept longer span are dropped. Keeps exactly one row per maximal substring.
- **Files modified:** scripts/craft-check.js (findCrossFileRepeats)

### None (plan honoured)

- Back-compat preserved: legacy `main()` path is byte-unchanged.
- Zero new npm dependencies.
- All 5 novelty tests from Plan 13-03 flip green.
- All 13 legacy CRAFT-01..15 tests still green.

## Acceptance Criteria — Verified

- [x] `node scripts/test-craft-check.js` exits 0 (18/18 pass)
- [x] `node scripts/craft-check.js --novelty --tier both --dna fixtures/tiny-book/adversarial/book-dna.md fixtures/tiny-book/adversarial/` exits 1, prints `flag: true`, `novelty_dedup: "fail"`, non-empty `repeated_spans`, `central_image_reuse`, `refrain_overuse`, zero `tier2_hits.*`
- [x] `node scripts/craft-check.js --novelty --tier 2 --dna fixtures/tiny-book/adversarial-enricher/book-dna.md fixtures/tiny-book/adversarial-enricher/` exits 1, all four `tier2_hits.*` arrays non-empty
- [x] `node scripts/craft-check.js fixtures/phase10/known-good/ch01-draft.md` (legacy mode) runs CRAFT-01..15 without error
- [x] `grep -q -- '--novelty' && -- '--tier' && -- '--dna' scripts/craft-check.js` all succeed
- [x] `wc -l scripts/craft-check.js` == 669 (≥ 300)

## Line Count Delta

- Before: 127 lines
- After: 669 lines
- Delta: +542 lines (all appended; legacy region untouched)

## Self-Check: PASSED

- scripts/craft-check.js exists (669 lines)
- Commit 2ad88a4 found in git log
- Test harness reports 18/18 green
