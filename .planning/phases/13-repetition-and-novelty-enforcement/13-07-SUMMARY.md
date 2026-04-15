---
phase: 13-repetition-and-novelty-enforcement
plan: 07
subsystem: skills/writer + skills/outliner
tags: [anti-loop, refrains, novelty, dedup, phase-13, SC-3, SC-4, D-08, D-09, D-30]
requires:
  - .planning/phases/13-repetition-and-novelty-enforcement/13-04-rubric-canonicalisation-SUMMARY.md
provides:
  - skills/writer/SKILL.md §Anti-Loop Clause (Phase 13, D-30)
  - skills/outliner/SKILL.md §Refrain Candidate Gate (Phase 13, D-08)
affects:
  - skills/writer/SKILL.md
  - skills/outliner/SKILL.md
tech-stack:
  added: []
  patterns:
    - "Additive contract insertion — new level-2 section alongside existing CRAFT-* rules, no existing content removed"
    - "Single-source-of-truth refrains block in book-dna.md consumed by writer + editor + craft-check.js"
    - "Fixture bypass pattern mirrors Phase 11 D-09 outline-approval bypass"
key-files:
  created:
    - .planning/phases/13-repetition-and-novelty-enforcement/13-07-SUMMARY.md
  modified:
    - skills/writer/SKILL.md
    - skills/outliner/SKILL.md
decisions:
  - "Writer Anti-Loop Clause lands as standalone ## section between §4 CRAFT-04 and §5 Voice Consistency — kept outside existing CRAFT-* numbering so Phase 10 lock stays intact"
  - "Refrain Candidate Gate lands immediately before §6 Post-Approval: Generate Book DNA so the gate fires after outline approval but before book-dna.md is written — two separate gates, both must pass"
  - "Reinforcement paragraph cross-links to the existing §3 Central Image Distinctness Check by name rather than line number — names survive edits, line numbers do not"
metrics:
  duration: ~5min
  completed: 2026-04-15
---

# Phase 13 Plan 07: Writer + Outliner Contracts Summary

Landed the skill-level contracts that make the writer refuse to loop and the outliner block handoff until the author has confirmed each refrain candidate phrase.

## What Shipped

### Writer Anti-Loop Clause — `skills/writer/SKILL.md`

Inserted new level-2 section **`## Anti-Loop Clause (Phase 13, D-30)`** at line 196, between the CRAFT-04 Vulnerability Beat section (ends line 194) and `## 5. Voice Consistency` (now line 233). Five rules enforced verbatim per plan wording:

1. **No 6 plus word phrase reuse across chapters or foreword unless whitelisted as a refrain** — editor Pass 3 §4.4.5 fails the release on any non-whitelisted 6+ word span appearing in 2+ artefacts.
2. **Spent vulnerability seeds cannot be reused** — once a `vulnerability_beat_seed` is spent by foreword or earlier chapter, later chapters pick a different sourced detail or skip the beat.
3. **Motif family may be shared, but image vehicle MUST differ per chapter** — worked example in the rule body: phone glow (ch1) → yellow pool on kitchen counter (ch2) → grey seam of dawn (ch3), all "light in the night" family, none a lamp.
4. **Echo and recontextualise — do not repeat** — callbacks must rephrase with different words/metaphors/context.
5. **Refrains are the ONLY permitted verbatim cross-artefact reuse** — pointer to the refrains YAML block in `book-dna.md`.

Refrain schema shown inline as a fenced yaml code block:

```yaml
refrains:
  - phrase: "one small lamp refusing the whole dark"
    max_uses: 1
    scope: whole_book
```

Scope vocabulary locked: `whole_book`, `chapter_endings`, `front_matter_only`, `body_only`. `max_uses` is integer OR string `unlimited`.

Consequence paragraph references editor Pass 3 §4.4.5 `novelty_dedup: fail` and orchestrator Mode 7 `--rewrite-targets` rewrite loop.

### Outliner Refrain Candidate Gate — `skills/outliner/SKILL.md`

Inserted new level-2 section **`## Refrain Candidate Gate (Phase 13, D-08)`** at line 242, immediately before `## 6. Post-Approval: Generate Book DNA`. Three steps plus fixture bypass plus reinforcement:

- **Step 1: Extract refrain candidates** — heuristics for finding signature phrases (explicit markers, ≥6 word phrases repeated in 2+ outline beats, tagline/subtitle, tempting callbacks). Empty list is allowed — Step 2 still runs.
- **Step 2: Surface candidates to the author and block handoff** — three options per candidate (keep as refrain with `max_uses`+`scope`, demote to normal prose, ignore) plus "Add a refrain I missed". Gate blocks outline-to-Book-DNA handoff until every candidate is answered. Separate from the existing outline approval gate — both gates fire.
- **Step 3: Write refrains YAML block into Book DNA** — YAML block under a `## Refrains` heading in `book-dna.md`, consumed by all downstream skills via the single-source-of-truth pattern.
- **Fixture bypass (D-09)** — detection signal: project path under `fixtures/tiny-book/` AND `book-dna.md` already contains a refrains block. Under both conditions the gate skips non-interactively. Mirrors Phase 11 D-09 outline-approval fixture bypass.
- **Reinforcement** — cross-links by name to the existing §3 Central Image Distinctness Check. Tightens the old "distinct central images" rule: same motif family allowed, same descriptive vehicle forbidden. Near-identical `central_image` values must be proposed as refrain candidates with `max_uses ≥ 2` or rewritten to use a distinct vehicle.

## Deviations from Plan

None — plan executed exactly as written. No existing CRAFT-* content was removed or reworded in the writer; the existing §3 Central Image Distinctness Check and Vulnerability Beat Seed Sourcing subsections of the outliner were preserved byte-identical and referenced by name.

## Verification

Task 1 acceptance greps (all passing):
- `grep -c "^## Anti-Loop Clause" skills/writer/SKILL.md` → `1`
- All five rule lead-ins present (`6 plus word`, `Spent vulnerability seeds`, `vehicle MUST differ`, `Echo and recontextualise`, `ONLY permitted verbatim`)
- `refrains:`, `max_uses`, `whole_book`, `rewrite_targets` all present
- `CRAFT-03` and `CRAFT-04` headings still present (7 matches total, unchanged)

Task 2 acceptance greps (all passing):
- `grep -c "^## Refrain Candidate Gate" skills/outliner/SKILL.md` → `1`
- `Step 1: Extract refrain candidates`, `Step 2: Surface candidates`, `Step 3: Write refrains YAML block`, `Fixture bypass`, `max_uses`, `whole_book`, `Central Image Distinctness Check` all present

## Commits

- `32a2c00` feat(13-07): add Anti-Loop Clause to writer SKILL.md
- `adac23c` feat(13-07): add Refrain Candidate Gate to outliner SKILL.md

## Success Criteria Addressed

- **SC-3** (vehicle descriptive distinctness) — outliner now proposes near-identical central_images as refrain candidates or forces a vehicle rewrite; writer Rule 3 enforces at draft time.
- **SC-4** (writer anti-loop clause) — writer Anti-Loop Clause locks down 6+ word cross-artefact reuse, spent seeds, motif vehicles, echo-not-repeat, and refrains-only whitelist.

## Known Stubs

None. The refrain block contract is declarative — actual enforcement mechanics land in Plan 13-05 (`craft-check.js --novelty`) and Plan 13-06 (editor Pass 3 §4.4.5). This plan is purely the skill-level contract layer.

## Self-Check: PASSED

- skills/writer/SKILL.md modified — FOUND (line 196 inserts Anti-Loop Clause)
- skills/outliner/SKILL.md modified — FOUND (line 242 inserts Refrain Candidate Gate)
- Commit 32a2c00 — FOUND
- Commit adac23c — FOUND
