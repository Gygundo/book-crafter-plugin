---
phase: 13-repetition-and-novelty-enforcement
plan: 02
subsystem: fixtures
tags: [tier2, adversarial-fixture, novelty-dedup, theological-gating]
requires: []
provides:
  - fixtures/tiny-book/adversarial-enricher/ (Tier 2 fail-path substrate)
  - voice-profile.md with ## Theological Framework heading (gating signal)
  - expected-flags.json (Tier 2 assertion baseline)
affects:
  - Plan 13-03 (test harness will load this fixture for Tier 2 fail assertions)
  - Plan 13-05 (novelty detection engine — Tier 2 rules must fire on this fixture)
tech-stack:
  added: []
  patterns:
    - Hand-authored known-bad fixture with single-rule substrates
    - Theological gating via ## Theological Framework heading detection (Phase 10 §2.7 precedent)
    - Clean negative control (ch03) to catch over-triggering
key-files:
  created:
    - fixtures/tiny-book/adversarial-enricher/voice-profile.md
    - fixtures/tiny-book/adversarial-enricher/book-dna.md
    - fixtures/tiny-book/adversarial-enricher/edited/ch01-final.md
    - fixtures/tiny-book/adversarial-enricher/edited/ch02-final.md
    - fixtures/tiny-book/adversarial-enricher/enrichments/ch01-enrichments.md
    - fixtures/tiny-book/adversarial-enricher/enrichments/ch02-enrichments.md
    - fixtures/tiny-book/adversarial-enricher/enrichments/ch03-enrichments.md
    - fixtures/tiny-book/adversarial-enricher/expected-flags.json
  modified: []
decisions:
  - Ch3 is a clean negative control (distinct stem, distinct prayer point, distinct vehicle)
  - Prayer point and discussion question stems are copied verbatim across ch01/ch02 to keep assertions deterministic
  - vulnerability-beat span lives in edited/ch01-final.md middle third and reappears inside ch02's Chapter Summary block
  - voice-profile.md is intentionally minimal — only exists to flip theological gating on
  - book-dna.md uses 3 distinct central images so Tier 1 vehicle rule does NOT fire (scope is Tier 2 only)
metrics:
  duration: ~4min
  tasks: 2
  files_created: 8
  completed: 2026-04-15
---

# Phase 13 Plan 02: Adversarial Tier 2 Enricher Fixture Summary

Hand-authored known-bad Tier 2 (enricher) fixture that deterministically triggers every Tier 2 rule from D-15 while leaving Tier 1 rules silent, establishing the fail-path assertion baseline that Plan 13-03's test harness and Plan 13-05's novelty detection engine will exercise.

## File Layout

```
fixtures/tiny-book/adversarial-enricher/
├── voice-profile.md             # minimal, contains `## Theological Framework`
├── book-dna.md                  # 3 distinct central images (Tier 1 silent)
├── expected-flags.json          # Tier 2 fail assertion baseline
├── edited/
│   ├── ch01-final.md            # 150 words; vulnerability beat in middle third
│   └── ch02-final.md            # 150 words; distinct prose + vehicle
└── enrichments/
    ├── ch01-enrichments.md      # stem + prayer + own-chapter vehicle echo
    ├── ch02-enrichments.md      # ALL 4 Tier 2 rule substrates
    └── ch03-enrichments.md      # clean negative control
```

## Tier 2 Rule Substrates

| Rule | Source | Duplicate | Detection |
| ---- | ------ | --------- | --------- |
| R1 discussion_question_stems | ch01-enrichments.md | ch02-enrichments.md | Exact stem `what does this chapter reveal about the character of god when you are afraid` (14 words, ≥8 trigger) |
| R2 prayer_point_repetition | ch01-enrichments.md | ch02-enrichments.md | Exact phrase `father i ask you to meet me in the dark` (10 words, ≥6 trigger). Theologically gated. |
| R3 vulnerability_bleed_to_summary | edited/ch01-final.md (vulnerability beat) | ch02-enrichments.md Chapter Summary | Verbatim span `my hands would not stop shaking as I tried to pray` (12 words, ≥6 trigger) |
| R4 vehicle_reuse_in_backmatter | Ch1 central_image `phone glow over the ceiling` | ch02-enrichments.md Central Image Call-out | Cross-chapter vehicle token repeated in back-matter field |

## Theological Gating Mechanism

Tier 2 rule 2 (prayer-point repetition) only fires when the active voice profile contains a `## Theological Framework` heading — Phase 10 §2.7 precedent. The fixture's `voice-profile.md` is deliberately reduced to two sections: a title line and the gating heading. Plan 13-05's detector will key off the heading presence, not the content below it.

## Negative Control

`enrichments/ch03-enrichments.md` contains:
- A distinct discussion question (no reveal-about-god stem)
- A distinct prayer point (no father-meet-me phrase)
- A distinct central image vehicle (grey seam of dawn)

Any Tier 2 hit against ch03 in Plan 13-05 is a false positive and must fail the test harness.

## Deviations from Plan

None — plan executed exactly as written.

## Verification

- 8 files exist under `fixtures/tiny-book/adversarial-enricher/`
- `grep -q '## Theological Framework' voice-profile.md` → pass
- All four Tier 2 rule substrate greps → pass
- `node -e` assertion against expected-flags.json → exit 0
- ch03 negative control grep for all duplicated phrases → 0 matches

## Self-Check: PASSED

- Files created: verified via ls + grep
- Commits exist:
  - c1ffa03 test(13-02): author adversarial Tier 2 enricher fixture
  - 58cf048 test(13-02): add expected-flags.json for Tier 2 adversarial fixture
