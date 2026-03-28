# Book Crafter Plugin

## What This Is

A comprehensive multi-skill Claude Code plugin that writes complete books — from a topic brief or existing content (sermons, notes, outlines) through to a professionally formatted .docx. Uses a pipeline-and-parallel architecture: sequential stages (outline, research, write, edit, format) with parallel chapter agents during writing. Ships with a spiritual/theological voice profile as default, with a swappable voice system for other genres.

## Core Value

Every chapter must read like it was written by a bestselling author — hooks that grab, revelation-driven depth that stays accessible, seamless flow between chapters, and a voice so consistent the reader forgets multiple agents touched it.

## Requirements

### Validated

- [x] Master orchestrator skill that chains all pipeline stages automatically — Validated in Phase 01
- [x] Each book project gets its own directory with all artifacts (outline, research, drafts, revisions, final .docx) — Validated in Phase 01
- [x] Swappable voice profile system: ship with spiritual/theological default, support custom .md profiles and inline voice descriptions — Validated in Phase 02
- [x] Theological framework inherited from sermon-crafter as the default spiritual voice profile — Validated in Phase 02
- [x] Book outliner skill that produces chapter-by-chapter structure with hooks, key arguments, and arc — Validated in Phase 02
- [x] Two input paths: topic brief (generate from scratch) OR existing content (synthesize from sermons/notes/outlines) — Validated in Phase 02
- [x] Three book size tiers: booklet (<100 pages), short (15-25k words), standard (40-60k words) — Validated in Phase 02
- [x] Master context document that all agents read (voice, theology, outline, character arcs, key terms, recurring themes) — Validated in Phase 02 (Book DNA)
- [x] Hybrid iteration workflow: outline approval → full draft generation → chapter-level revision cycles — Validated in Phase 02 (outline approval gate)
- [x] Research skill that gathers supporting material per chapter (scripture, references, illustrations) — Validated in Phase 03
- [x] Writer skill that produces full chapter drafts in parallel, each with a compelling opening hook — Validated in Phase 03
- [x] Editor skill that ensures voice consistency, flow between chapters, and bestselling-author quality — Validated in Phase 04
- [x] Three-pass editing pipeline (voice+theological, flow/transitions, cross-chapter validation) with rolling window for large books — Validated in Phase 04
- [x] Review gate with approve/revise/read options, chapter-level revision workflow with one-hop adjacency checks, version management — Validated in Phase 04

### Active

(None — all v1.0 requirements validated)

### Validated (Phase 06)

- [x] Sermon-to-book adapter that transforms spoken-rhythm source material into written-rhythm prose before outline generation — Validated in Phase 06
- [x] Content enrichment skill: discussion questions (with cliche test), chapter summaries, prayer points (theological only), and foreword — Validated in Phase 06
- [x] Enrichments rendered inline in .docx after each chapter body, foreword in front matter — Validated in Phase 06

### Validated (Phase 05)

- [x] Formatter skill that produces professional .docx output (TOC, page numbers, front/back matter) — Validated in Phase 05
- [x] Professional book structure: half title, title page, copyright, dedication, TOC, about the author, scripture index, glossary — Validated in Phase 05

### Out of Scope

- ePub / PDF generation — .docx is the output format; conversion tools exist externally
- Cover design or visual assets — this is a writing plugin, not a design tool
- Print-ready typesetting — .docx is for editing and hand-off to layout tools
- Fiction / narrative genres — optimized for non-fiction (theological, teaching, self-help, leadership)
- Publishing workflow (ISBN, distribution) — out of scope for the writing tool
- Audio book generation — separate concern from writing

## Context

- **Existing reference**: The sermon-crafter skill (`~/.claude/skills/sermon-crafter/SKILL.md`) provides the theological framework, voice patterns, and .docx formatting approach. The content engine plugin (`~/.claude/plugins/encounter-content-engine/`) provides the multi-skill plugin architecture pattern.
- **Brand voice reference**: `encounter-content-engine/references/brand-voice.md` and `content-guidelines.md` define the spiritual voice and theological guardrails that become the default voice profile.
- **Technical approach**: Plugin architecture with individual SKILL.md files per stage, shared reference files for voice/theology, and a master orchestrator. Uses docx-js (via the docx skill) for .docx generation.
- **Multi-agent context**: The critical challenge is maintaining voice consistency and narrative continuity across parallel chapter agents. A master context document (book DNA) must be read by every agent and updated as the book evolves.
- **User**: David, Encounter Church tech lead. Spiritual content is the primary use case. South African English (British spelling conventions).

## Constraints

- **Plugin format**: Must follow Claude Code plugin conventions (`.claude-plugin/plugin.json`, `skills/*/SKILL.md`, `references/*.md`)
- **Output format**: .docx only, using docx-js via the existing docx skill patterns
- **Voice consistency**: All chapter agents must produce output that reads as one voice — this is the hardest technical challenge
- **Context window**: Individual chapter agents have limited context; the master context document must be comprehensive but concise enough to fit
- **Theological accuracy**: Default spiritual profile must maintain the same theological framework as the sermon-crafter (grace-based, New Covenant, supernatural-affirming)
- **Cross-surface compatibility**: Must work across all Claude Code surfaces — CLI, desktop app, web app (claude.ai/code), and IDE extensions. No CLI-only dependencies.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Full plugin with orchestrator (not single skill) | Book writing has too many distinct stages for one SKILL.md to handle well. Modularity allows parallel chapter writing. | -- Pending |
| .docx only output | Keeps scope focused. ePub/PDF can be added later or handled by external tools. | -- Pending |
| Spiritual default with swappable voice | Primary use case is theological books, but architecture shouldn't be locked to one genre. | -- Pending |
| Pipeline + parallel architecture | Sequential stages ensure quality gates; parallel chapter writing enables speed for longer books. | -- Pending |
| Hybrid iteration model | Outline approval prevents wasted work; full draft enables holistic editing; chapter-level revision enables precision. | -- Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-28 after Phase 07 completion (captivating writing, modern voice profile, bestseller formatting)*
