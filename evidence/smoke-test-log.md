# Fresh-Install Smoke Test (GATE-06)

**Date:** 2026-04-16
**Machine:** David's Mac (dev machine)
**Method:** Remove dev plugin -> clear cache -> marketplace install -> /book-crafter:sample -> verify .docx

## Procedure

1. Removed `book-crafter-dev` dev plugin
2. Cleared Claude Code plugin cache
3. Installed from marketplace:
   - `/plugin marketplace add gygundo/book-crafter-plugin`
   - `/plugin install book-crafter@book-crafter-plugin`
   - `/reload-plugins`
4. Ran `/book-crafter:sample`
5. Verified output

## Results

- Sample skill exit: **PASS**
- Captivation score: **14/16** (threshold 11)
- Novelty/dedup: **PASS**
- .docx exists: **YES** (`fixtures/tiny-book/run/final/The 2am Prayer.docx`)
- First attempt (after fix): **YES**

## Pipeline Stages Completed

Full pipeline executed end-to-end:

1. Outline
2. Research
3. Write
4. Edit
5. Enrich
6. Novelty gate
7. Format
8. Sample gate

## Issues Encountered During Test

### Issue 1: plugin.json name mismatch

Plugin initially failed to load because `plugin.json` had `"book-crafter-dev"` (the dev name) instead of `"book-crafter"` (the release name). The marketplace add command registered the repo, but the plugin install step could not resolve the plugin identity.

**Fix:** Commit 8bafb71 updated `plugin.json` name field from `book-crafter-dev` to `book-crafter`.

### Issue 2: marketplace add vs plugin install

The `/plugin marketplace add` command registers the marketplace source but does not enable the plugin. An explicit `/plugin install book-crafter@book-crafter-plugin` is required after the marketplace add to activate the plugin. This two-step procedure is already documented in the README install block.

### Novelty Enforcement Notes

- Refrain budget honoured: used once in ch02
- One in-audit repair: ch03 "only light in the room" replaced with "whole story of the kitchen"
- Prayer-stem diversification resolved one tier-2 flag before the post-enricher gate

## SMOKE TEST: PASS

Fresh install from marketplace produces a valid .docx on first attempt (after plugin.json name fix). Full pipeline completes with captivation 14/16 and novelty_dedup pass. GATE-06 satisfied.
