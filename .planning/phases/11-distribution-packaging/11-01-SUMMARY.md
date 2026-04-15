---
phase: 11-distribution-packaging
plan: 01
subsystem: fixtures
tags: [fixtures, gitignore, tiny-book, wave-0]
requires: []
provides:
  - fixtures/tiny-book/brief.md
  - fixtures/tiny-book/expected-captivation-score.txt
  - .gitignore
affects:
  - Plan 11-04 (release.sh whitelist references brief + threshold)
  - Plan 11-05 (sample skill reads brief + threshold)
tech-stack:
  added: []
  patterns:
    - "Tiny-book fixture contract: one brief + one integer threshold file"
key-files:
  created:
    - fixtures/tiny-book/brief.md
    - fixtures/tiny-book/expected-captivation-score.txt
    - .gitignore
  modified: []
decisions:
  - "Captivation threshold seeded at 8 (0-14 scale) — conservative floor, recalibrated in Plan 11-06"
  - "Topic 'The 2am Prayer' chosen to deterministically exercise CRAFT-01..08 (time-marker, central image, vulnerability, reader moments)"
  - ".gitignore ships fresh (none existed) with dist/, fixtures/tiny-book/run/, DEV-NOTES.md, .DS_Store, node_modules/"
metrics:
  duration: 2min
  completed: 2026-04-15
---

# Phase 11 Plan 01: Tiny-Book Fixture + Gitignore Summary

Wave-0 infrastructure landed: a 3-chapter booklet brief ("The 2am Prayer"), a starting captivation threshold of 8, and a new `.gitignore` so downstream Phase 11 plans can build release tooling and sample skills without polluting the repo.

## What Shipped

**Task 1 — `fixtures/tiny-book/brief.md`** (commit `fb7c89c`)
- 45-line booklet brief titled "The 2am Prayer" (subtitle: "Finding God When You Can't Sleep")
- 11 `## ` sections (Topic, Target Audience, Size Tier, Chapter Count, Total Target Length, Voice Profile, Key Themes, Proposed Chapters, Source Material, Craft Anchors, What This Brief Is NOT)
- Declares `spiritual-default` voice profile, `booklet` tier, 3 chapters, 2500-word target
- Topic deliberately built around 2am/3am/4am time-markers and a single central image (one lamp refusing the dark) so every CRAFT-01..08 rule has native provenance
- Does not contain "bestseller" or "Claude Desktop" (per D-16 and v1.1 terminology rule)

**Task 2 — Threshold + gitignore** (commit `3d06c6d`)
- `fixtures/tiny-book/expected-captivation-score.txt`: single integer `8` + trailing newline (matches 0-14 rubric scale; Plan 11-06 may recalibrate)
- `.gitignore` created fresh (none existed in repo). Entries: `dist/`, `fixtures/tiny-book/run/`, `DEV-NOTES.md`, `.DS_Store`, `node_modules/`

## Deviations from Plan

None — plan executed exactly as written. `.gitignore` did not exist at execution time (as the plan anticipated), so file was written fresh rather than appended.

## Known Stubs

None. Both fixture files are terminal artefacts, not scaffolding.

## Verification

- `test -f fixtures/tiny-book/brief.md` — pass
- `grep -c "^## " fixtures/tiny-book/brief.md` → 11 (≥7 required)
- `wc -l fixtures/tiny-book/brief.md` → 45 (≤120 required)
- No occurrences of "bestseller" or "Claude Desktop"
- Threshold file matches `^[0-9]+$` and value 8 is in [1, 14]
- `.gitignore` contains exact lines `dist/`, `fixtures/tiny-book/run/`, `DEV-NOTES.md`

## Commits

- `fb7c89c` — feat(11-01): add tiny-book fixture brief
- `3d06c6d` — feat(11-01): add captivation threshold fixture and gitignore

## Self-Check: PASSED

- FOUND: fixtures/tiny-book/brief.md
- FOUND: fixtures/tiny-book/expected-captivation-score.txt
- FOUND: .gitignore
- FOUND commit: fb7c89c
- FOUND commit: 3d06c6d
