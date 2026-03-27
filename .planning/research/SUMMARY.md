# Research Summary: Book Crafter Plugin

**Domain:** Multi-agent Claude Code plugin for AI-powered book writing (non-fiction, theological focus)
**Researched:** 2026-03-27
**Overall confidence:** HIGH

## Executive Summary

The Book Crafter plugin sits at the intersection of three well-understood systems: Claude Code's plugin/skill/subagent architecture, the docx-js library for document generation, and multi-agent content pipelines. None of these are novel individually, but combining them for book-length voice-consistent content is the engineering challenge.

The standard stack is surprisingly minimal: Claude Code's native plugin system provides all orchestration, skill discovery, and parallel agent capabilities. docx-js (v9.6.1) handles .docx generation and is already proven in David's existing docx skill and sermon-crafter. Markdown serves as the universal intermediate format between pipeline stages. No external frameworks (LangChain, vector databases, custom orchestrators) are needed -- Claude Code IS the orchestration layer.

The critical technical challenge is voice consistency across parallel chapter-writing subagents. Each subagent operates in an isolated context window with no awareness of other chapters. The solution is the "Book DNA" pattern: a comprehensive master context document (voice profile, theological framework, outline, running themes, style rules) that every agent reads. This document is READ-ONLY during parallel execution and updated only between pipeline stages. The existing encounter-content-engine plugin provides a proven reference for this pipeline-and-parallel-wave architecture.

The theological/spiritual voice profile -- inherited from the sermon-crafter skill and brand-voice.md -- is the default but the architecture supports swappable voice profiles for other non-fiction genres. This is achieved through plain .md reference files, not code changes. The formatter skill handles the .docx conversion at the end of the pipeline, using the same docx-js patterns already validated in the sermon-crafter.

## Key Findings

**Stack:** Claude Code native plugins + skills + subagents, docx-js 9.6.1 for .docx, markdown for all intermediate artifacts. No external dependencies needed.

**Architecture:** 5-stage pipeline (outline -> research -> write -> edit -> format) with parallel subagents for chapter writing (waves of 8-10). All inter-stage communication via filesystem.

**Critical pitfall:** Voice drift across parallel chapters. Prevention requires concrete voice exemplars in the Book DNA (not just descriptions), forbidden/required word lists, and a systematic editor voice audit.

## Implications for Roadmap

Based on research, suggested phase structure:

1. **Plugin Skeleton + Orchestrator** - Foundation that everything builds on
   - Addresses: Plugin manifest, orchestrator skill, project directory setup, pipeline state detection
   - Avoids: Building downstream skills without the orchestration framework

2. **Voice System + Book DNA + Outliner** - The quality foundation
   - Addresses: Voice profile system, Book DNA template, outline generation with approval gate
   - Avoids: Writing chapters before voice and structure are locked down (Pitfall 3: weak outline)

3. **Chapter Writer + Parallel Execution** - The core generation engine
   - Addresses: Chapter-writer subagent, parallel wave execution, word count targeting
   - Avoids: Voice drift (Pitfall 1) by depending on Phase 2's voice system

4. **Editor + Voice Auditor** - Quality assurance
   - Addresses: Voice consistency pass, flow/transition checking, continuity validation
   - Avoids: Context overflow (Pitfall 2) via two-pass editing strategy

5. **Formatter + .docx Output** - The deliverable
   - Addresses: Professional .docx with TOC, page numbers, front/back matter
   - Avoids: docx-js formatting gotchas (Pitfall: Moderate 1) by following proven patterns from docx skill

6. **Enhancements** - Source ingestion, revision cycles, reader engagement elements
   - Addresses: Sermon-to-book path, chapter-level revision, discussion questions
   - Avoids: Scope creep by deferring until core pipeline is validated

**Phase ordering rationale:**
- Phase 1 before everything: cannot test any skill without the plugin structure and orchestrator
- Phase 2 before Phase 3: voice and outline must exist before chapters can be written (strongest dependency in the system)
- Phase 3 before Phase 4: cannot edit what does not exist
- Phase 4 before Phase 5: do not format unedited content
- Phase 6 after validation: the sermon-to-book path is the primary use case but the pipeline must work end-to-end first

**Research flags for phases:**
- Phase 2: May need deeper research on voice exemplar effectiveness (how much exemplar writing is enough?)
- Phase 3: Subagent parallelism limits need empirical testing (documentation says ~10 but real-world performance may vary)
- Phase 4: Editor batching strategy for long books needs experimentation
- Phase 5: docx-js patterns are well-documented; unlikely to need additional research

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All technologies verified via official docs and local environment. docx-js version confirmed. Claude Code plugin conventions verified from official documentation. |
| Features | HIGH | Feature landscape well-mapped from PROJECT.md requirements, competitor analysis, and domain research. Theological differentiator is genuinely uncontested. |
| Architecture | HIGH | Pipeline-and-parallel pattern proven in encounter-content-engine. Subagent constraints verified from official Claude Code docs. Book DNA pattern is the logical solution to the shared context problem. |
| Pitfalls | HIGH | Voice drift is a known challenge in multi-agent writing systems (StoryWriter paper confirms). docx-js gotchas documented in existing skill. Subagent limitations verified. |

## Gaps to Address

- **Voice exemplar effectiveness**: How many paragraphs of exemplar writing are needed for reliable voice consistency? Needs empirical testing in Phase 2/3.
- **Editor context strategy for 60K-word books**: The two-pass approach is theoretically sound but needs testing. How much of the book can the editor hold before quality degrades?
- **Subagent parallelism real-world performance**: Documentation says ~10 parallel subagents. Does this hold under load with long-running chapter-writer agents?
- **Sermon-to-book adaptation specifics**: The transformation rules (spoken rhythm to written rhythm, verbal shorthand expansion) need Phase 6 research when the source ingestion skill is built.
- **Non-theological voice profiles**: The architecture supports them, but no testing has been done. Defer until there is a real non-theological use case.
