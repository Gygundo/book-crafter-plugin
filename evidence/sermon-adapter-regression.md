# Sermon-Adapter Regression Check (GATE-05)

**Date:** 2026-04-16
**Project:** Eternally Secure
**Method:** SHA256 checksum comparison (pre-run vs post-run)

## Results

| File | Pre-Run SHA256 | Post-Run SHA256 | Match |
|------|----------------|-----------------|-------|
| source-01-20-reasons.md | bbdb5e73532b8aee257ad8d811437f070e4ad586fe33a34224c5ce114907361c | bbdb5e73532b8aee257ad8d811437f070e4ad586fe33a34224c5ce114907361c | YES |
| source-02-4-signs.md | bf353f6446fec8f5716a9e5b4774adbba82049f7bb8255753eeee488168eeaf5 | bf353f6446fec8f5716a9e5b4774adbba82049f7bb8255753eeee488168eeaf5 | YES |
| source-03-can-you-lose.md | 03e8fbee86a39400c509de267c3c02ea4213a5bda99c4c3b98401bf7456156e9 | 03e8fbee86a39400c509de267c3c02ea4213a5bda99c4c3b98401bf7456156e9 | YES |

## Verdict

**REGRESSION CHECK: PASS** -- all 3 sources-adapted files are byte-identical before and after the --fresh re-run. The sermon adapter was not affected by v1.1 pipeline changes.

## Method Details

- Pre-run checksums recorded in `evidence/sources-adapted-checksums.txt` before the Mode 6 Fresh Run (Plan 12-02).
- Post-run checksums computed from `/Users/David/Documents/Books/Eternally Secure/sources-adapted/` after the re-run completed.
- `--fresh` mode preserves `sources-adapted/` per CRAFT-14 contract (Phase 10).
