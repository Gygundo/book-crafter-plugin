---
phase: 10-writing-quality-v2
plan: 02
subsystem: references
tags: [craft-rules, voice-agnostic, phase-10, bestseller]
requires:
  - 10-01
provides:
  - references/bestseller-craft-rules.md
  - voice-agnostic-craft-rules-reference
affects:
  - writer skill (Plan 10-03 will consume)
  - editor skill (Plans 10-04/10-05 will consume)
tech-stack:
  added: []
  patterns:
    - reference-file-indirection
    - single-source-of-truth-for-rules
key-files:
  created:
    - references/bestseller-craft-rules.md
  modified: []
decisions:
  - Kept file at 127 lines, well under 200-line cap, leaving room for future rule additions
  - Transliterated term lexicon inlined verbatim from craft-check.js TRANSLITERATED_TERMS (sync point documented in maintenance section)
  - Permitted-usage whitelist for CRAFT-05 documented as LLM guidance since the deterministic regex cannot distinguish dialogue/blockquote contexts
metrics:
  duration: ~2min
  completed: 2026-04-15
  tasks: 1
  files: 1
---

# Phase 10 Plan 02: Bestseller Craft Rules Reference Summary

Created `references/bestseller-craft-rules.md` (CRAFT-11) — voice-agnostic single source of truth for CRAFT-01..08 procedural rules, consumable by both writer (drafting constraints) and editor (verification checks).

## What Was Built

A 127-line voice-agnostic markdown reference defining the seven countable craft rules plus CRAFT-08, structured as:

- **Rule Summary table** — ID, rule text, enforcement mode, failure handling at-a-glance.
- **CRAFT-01 Scene-First Opener** — four permitted provenance comment forms (matching D-19), first-150-word requirements (named human, time-marker, sensory detail).
- **CRAFT-02 Transliterated Density** — ≤3-term cap, ≥3-sentence unpacking requirement, full 25-term transliterated lexicon, unpacking marker list, sync contract with craft-check.js.
- **CRAFT-03 Central Image Discipline** — three-zone threading requirement (opening 200 / middle third / closing 200), flag-only with divergent-improvement rationale.
- **CRAFT-04 Vulnerability Beat** — single middle-third first-person beat sourced from `vulnerability_beat_seed`, fabricated = fail.
- **CRAFT-05 Pulpit Seam** — 11-phrase banned-start list, authoritative regex matching craft-check.js, five permitted-usage counter-examples (dialogue, blockquote, citation, heading fragment, remembered-scene second person).
- **CRAFT-06 Reader Moments** — ≥2 concrete moments from voice profile's Reader Moments section, flag-only when section absent.
- **CRAFT-07 Reader-Thought Lines** — ≥2 italic/blockquote first-person thought lines, authoritative regex.
- **CRAFT-08 Show Don't Tell Ratio** — 4-paragraph sliding window concrete:abstract noun ratio ≥1:1, with abstract and concrete noun hint lists.
- **Cross-Rule Integration** — deterministic vs judgment split, auto-revise vs flag-only classification, 2-revision cap, divergent-improvement stop rule.
- **Maintenance** — sync contract with craft-check.js, writer SKILL.md, editor SKILL.md; 200-line cap reminder.

## Tasks Completed

| Task | Name                                | Commit  | Files                                    |
| ---- | ----------------------------------- | ------- | ---------------------------------------- |
| 1    | Create bestseller-craft-rules.md    | edaf55f | references/bestseller-craft-rules.md     |

## Verification Results

All acceptance criteria met:

- `test -f references/bestseller-craft-rules.md` → PASS
- `wc -l < references/bestseller-craft-rules.md` → 127 (≤200) PASS
- `grep -c "^## CRAFT-0" references/bestseller-craft-rules.md` → 8 (≥8) PASS
- `grep -q "craft-check.js"` → PASS (referenced in intro and Cross-Rule Integration sections)
- `grep -q "Permitted-usage"` → PASS (CRAFT-05 whitelist header)
- `grep -ci "grace-based\|new covenant\|sonship in christ"` → 0 PASS (voice-agnostic; "grace" and "sonship" appear only in the CRAFT-08 abstract-noun hint list, not as theological framing)

## Deviations from Plan

None — plan executed exactly as written. File came in at 127 lines, 73 lines under the cap, so no pruning needed.

## Self-Check: PASSED

- FOUND: references/bestseller-craft-rules.md
- FOUND: commit edaf55f
