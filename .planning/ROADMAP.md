# Roadmap: Book Crafter Plugin

## Overview

The Book Crafter plugin delivers a complete book-writing pipeline through six sequential phases. Phase 1 establishes the plugin skeleton and orchestrator that all skills depend on. Phase 2 builds the voice system and outliner -- the quality foundation that prevents voice drift and weak structure. Phase 3 adds research gathering and parallel chapter writing, producing full drafts. Phase 4 adds the editor and revision workflow that ensures voice consistency and narrative flow. Phase 5 converts edited manuscripts into professional .docx output. Phase 6 adds content enhancements (sermon-to-book, discussion questions, prayer points) that enrich the final product.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Plugin Foundation + Orchestrator** - Plugin scaffold, master orchestrator, project directory structure, pipeline state tracking
- [ ] **Phase 2: Voice System + Book Outliner** - Voice profiles, Book DNA master context, chapter-by-chapter outline generation with approval gate
- [ ] **Phase 3: Research + Chapter Writing** - Per-chapter research gathering, parallel chapter writer agents with wave batching
- [ ] **Phase 4: Editor + Revision Workflow** - Voice consistency auditing, flow/transition editing, cross-chapter validation, chapter-level revision cycles
- [ ] **Phase 5: Formatter + .docx Output** - Professional .docx generation with front matter, back matter, TOC, and page numbers
- [ ] **Phase 6: Content Enhancements** - Sermon-to-book input path, discussion questions, chapter summaries, prayer points, foreword generation

## Phase Details

### Phase 1: Plugin Foundation + Orchestrator
**Goal**: A working plugin skeleton with a master orchestrator that can chain pipeline stages and manage book project directories
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, FOUND-06
**Success Criteria** (what must be TRUE):
  1. User can install the plugin and see it recognised by Claude Code across CLI, desktop, web, and IDE surfaces
  2. User can invoke the orchestrator and it creates a new book project directory with organised subdirectories for each pipeline stage
  3. Orchestrator can detect an interrupted project and identify which pipeline stage to resume from based on existing artefacts
  4. Pipeline stages execute in sequence (outline -> research -> write -> edit -> format) with the orchestrator managing transitions
**Plans**: 2 plans

Plans:
- [ ] 01-01-PLAN.md — Plugin scaffold: manifest, stub skills, subagent definitions, reference documents
- [ ] 01-02-PLAN.md — Master orchestrator skill with pipeline logic, state detection, and status dashboard

### Phase 2: Voice System + Book Outliner
**Goal**: Users can define how the book sounds (voice profile) and what the book covers (outline), with an approval gate before any writing begins
**Depends on**: Phase 1
**Requirements**: VOICE-01, VOICE-02, VOICE-03, VOICE-04, VOICE-05, VOICE-06, OUTL-01, OUTL-02, OUTL-03, OUTL-04, OUTL-05, OUTL-06, ITER-01
**Success Criteria** (what must be TRUE):
  1. User can generate an outline from a topic brief and see chapter titles, hook strategies, key arguments, supporting scriptures, and momentum positions for each chapter
  2. User can generate an outline from existing content (sermon transcripts, notes) and see themes and arguments extracted into a chapter structure
  3. User can review, modify, and approve the outline before any drafting begins -- drafting does not proceed without approval
  4. Book DNA master context document is auto-generated from the approved outline + voice profile + theological framework, and is marked READ-ONLY during downstream stages
  5. User can supply a custom .md voice profile or inline voice description, and the system uses it instead of the default theological voice
**Plans**: TBD

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD
- [ ] 02-03: TBD

### Phase 3: Research + Chapter Writing
**Goal**: The pipeline produces complete chapter drafts -- researched, voice-consistent, and written in parallel -- for an approved outline
**Depends on**: Phase 2
**Requirements**: RSRCH-01, RSRCH-02, RSRCH-03, RSRCH-04, WRITE-01, WRITE-02, WRITE-03, WRITE-04, WRITE-05, WRITE-06, WRITE-07
**Success Criteria** (what must be TRUE):
  1. Each chapter has a research artefact in its project directory containing scripture references (actual Bible text, not fabricated), cross-references, word studies, and illustrations
  2. Chapter drafts are generated in parallel waves (4-6 concurrent agents) and each agent reads the full Book DNA for voice and narrative consistency
  3. Every chapter opens with a compelling hook (bold declaration, rhetorical question, counter-intuitive claim, or tension-creating observation)
  4. Chapter word counts match the book size tier (booklet/short/standard) and each draft is written in markdown as intermediate format
  5. Theological depth is present: Greek/Hebrew word studies woven naturally, cross-references across books, types and shadows, scripture interpreting scripture
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD
- [ ] 03-03: TBD

### Phase 4: Editor + Revision Workflow
**Goal**: The manuscript reads as one voice with seamless chapter transitions, all cross-references validated, and users can request targeted chapter revisions
**Depends on**: Phase 3
**Requirements**: EDIT-01, EDIT-02, EDIT-03, EDIT-04, EDIT-05, EDIT-06, ITER-02, ITER-03, ITER-04, ITER-05
**Success Criteria** (what must be TRUE):
  1. Voice consistency pass normalises tone, sentence rhythm, and vocabulary drift across all chapters -- the book reads as one author
  2. Flow/transition pass ensures every chapter ending connects naturally to the next chapter opening
  3. Cross-chapter validator catches inconsistencies: terminology drift, broken forward/backward references ("we will explore in chapter 7" and chapter 7 delivers), theological contradictions
  4. User can review the full draft holistically, then request rewrites of specific chapters with targeted feedback -- revised chapters trigger adjacency flow checks
  5. Consistency report is produced with specific flagged issues, and revision history is preserved (drafts are not overwritten)
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD
- [ ] 04-03: TBD

### Phase 5: Formatter + .docx Output
**Goal**: The edited manuscript becomes a professionally formatted .docx file ready for hand-off to layout tools or direct reading
**Depends on**: Phase 4
**Requirements**: FMT-01, FMT-02, FMT-03, FMT-04, FMT-05, FMT-06, FMT-07, FMT-08
**Success Criteria** (what must be TRUE):
  1. Generated .docx has consistent typography, chapter heading styles with page breaks, and page numbers in footer ("Page X of Y")
  2. Front matter is present and correctly ordered: half title, full title page, copyright page, dedication, table of contents
  3. Back matter is present: about the author section, auto-extracted scripture index, glossary of key terms
  4. .docx generation uses docx-js patterns inherited from the existing docx skill
**Plans**: TBD

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD

### Phase 6: Content Enhancements
**Goal**: The pipeline supports sermon-to-book conversion and generates reader engagement elements (discussion questions, summaries, prayer points, foreword)
**Depends on**: Phase 4
**Requirements**: ENH-01, ENH-02, ENH-03, ENH-04, ENH-05, ENH-06
**Success Criteria** (what must be TRUE):
  1. User can provide a sermon series as input and the system converts spoken rhythm to written rhythm -- fragments become complete sentences, verbal cues become written transitions, audience-specific references become universal
  2. Each chapter has specific discussion questions that pass the cliche test (not generic, tied to the chapter's unique arguments)
  3. Each chapter has a concise summary of key points and (for theological books) prayer points connected to the chapter's revelation
  4. A foreword is generated that frames the book's purpose, written in author voice or as a draft for an endorser
**Plans**: TBD

Plans:
- [ ] 06-01: TBD
- [ ] 06-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Plugin Foundation + Orchestrator | 0/2 | Not started | - |
| 2. Voice System + Book Outliner | 0/3 | Not started | - |
| 3. Research + Chapter Writing | 0/3 | Not started | - |
| 4. Editor + Revision Workflow | 0/3 | Not started | - |
| 5. Formatter + .docx Output | 0/2 | Not started | - |
| 6. Content Enhancements | 0/2 | Not started | - |
