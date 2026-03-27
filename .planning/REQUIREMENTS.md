# Requirements: Book Crafter Plugin

**Defined:** 2026-03-27
**Core Value:** Every chapter must read like it was written by a bestselling author — hooks that grab, revelation-driven depth that stays accessible, seamless flow between chapters, and a voice so consistent the reader forgets multiple agents touched it.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Plugin Foundation

- [x] **FOUND-01**: Plugin scaffold follows Claude Code conventions (.claude-plugin/plugin.json, skills/*/SKILL.md, references/*.md)
- [x] **FOUND-02**: Master orchestrator skill chains all pipeline stages automatically (outline → research → write → edit → format)
- [x] **FOUND-03**: Each book project gets its own directory with organised artefacts (outline, research, chapter drafts, revisions, final .docx)
- [x] **FOUND-04**: Pipeline state tracking persists progress across stages so interrupted work can resume
- [x] **FOUND-05**: Orchestrator detects which pipeline stage to resume from based on existing artefacts
- [x] **FOUND-06**: Plugin works across all Claude Code surfaces — CLI, desktop app, web app (claude.ai/code), and IDE extensions

### Voice System

- [x] **VOICE-01**: Voice profile system loads .md reference files defining tone, sentence patterns, vocabulary, emphasis techniques, anti-patterns
- [x] **VOICE-02**: Ship with theological/spiritual default voice profile derived from sermon-crafter and brand-voice.md
- [x] **VOICE-03**: Support custom .md voice profiles for non-theological genres
- [x] **VOICE-04**: Support inline voice descriptions in the topic brief for one-off projects
- [x] **VOICE-05**: Book DNA master context document synthesises voice + theology + outline + themes + key terms into a single artefact all agents read
- [x] **VOICE-06**: Book DNA is READ-ONLY during parallel chapter generation and updated only between pipeline stages

### Book Outliner

- [x] **OUTL-01**: Generate chapter-by-chapter outline from a topic brief (topic, key themes, target audience, optional scriptures)
- [x] **OUTL-02**: Each chapter in outline includes: title, opening hook strategy, key arguments, supporting scriptures, momentum position
- [x] **OUTL-03**: Outline designs a narrative arc — chapters escalate in intensity and revelation toward a climax
- [x] **OUTL-04**: Outline approval gate — user reviews and approves/modifies outline before drafting begins
- [x] **OUTL-05**: Support three book size tiers: booklet (<100 pages, 5-8 chapters), short (15-25k words, 8-12 chapters), standard (40-60k words, 12-20 chapters)
- [x] **OUTL-06**: Generate outline from existing content (sermon transcripts, notes, blog posts) by extracting themes and arguments

### Research

- [x] **RSRCH-01**: Research skill gathers supporting material per chapter (scripture references, cross-references, word studies, illustrations)
- [x] **RSRCH-02**: Scripture references use actual Bible text (NKJV default) — no fabricated references
- [x] **RSRCH-03**: Research artefacts stored per chapter in the project directory for writer agents to consume
- [x] **RSRCH-04**: For theological books, research includes Greek/Hebrew word studies and cross-testament connections

### Chapter Writing

- [x] **WRITE-01**: Chapter writer agent produces complete chapter drafts (2,000-4,000 words for standard books, scaled for other sizes)
- [x] **WRITE-02**: Parallel chapter generation using wave batching (4-6 concurrent agents)
- [x] **WRITE-03**: Every chapter opens with a compelling hook (bold declaration, rhetorical question, counter-intuitive claim, tension-creating observation)
- [x] **WRITE-04**: Each chapter agent reads the full Book DNA master context to maintain voice and narrative consistency
- [x] **WRITE-05**: Chapter drafts are written in markdown as intermediate format, not directly as .docx
- [x] **WRITE-06**: Word count targeting per chapter based on book size tier and outline specifications
- [x] **WRITE-07**: Revelation-driven depth: cross-references across books, Greek/Hebrew word studies woven naturally, types and shadows, scripture interpreting scripture (for theological voice)

### Editing

- [x] **EDIT-01**: Voice consistency pass — compares tone, sentence rhythm, vocabulary across all chapters and normalises drift
- [x] **EDIT-02**: Flow/transition pass — ensures chapter endings connect to next chapter openings with natural transitions
- [x] **EDIT-03**: Theological guardrail pass — validates content against theological framework (grace over law, identity in Christ, no banned cliches, no academic hedging)
- [x] **EDIT-04**: Cross-chapter consistency validator — checks terminology consistency, theological consistency, reference consistency ("we'll explore this in chapter 7" → chapter 7 delivers)
- [x] **EDIT-05**: Editor uses rolling-window pattern for longer books to handle context limits (1-2 chapter overlap)
- [x] **EDIT-06**: Consistency report produced with specific flagged issues before final formatting

### Formatting

- [x] **FMT-01**: Professional .docx output using docx-js with consistent typography and formatting
- [x] **FMT-02**: Title page with book title, subtitle, author name
- [x] **FMT-03**: Auto-generated table of contents with chapter titles and page numbers
- [x] **FMT-04**: Chapter headings with consistent formatting (page breaks, heading styles)
- [x] **FMT-05**: Page numbers in footer ("Page X of Y")
- [x] **FMT-06**: Front matter: half title, full title page, copyright page, dedication, TOC
- [x] **FMT-07**: Back matter: about the author, scripture index (auto-extracted from chapters), glossary of key terms
- [x] **FMT-08**: Formatting inherits docx-js patterns from the existing docx skill

### Content Enhancements

- [x] **ENH-01**: Sermon-to-book input path — converts sermon series into book chapters, adapting spoken rhythm to written rhythm
- [x] **ENH-02**: Sermon adaptation transforms: spoken fragments to complete sentences, audience-specific to universal references, verbal cues to written transitions, repetition-for-emphasis to revelation-for-emphasis
- [x] **ENH-03**: Discussion questions per chapter — specific to the chapter's unique arguments, passes the cliche test
- [x] **ENH-04**: Chapter summaries — concise recap of key points for each chapter
- [x] **ENH-05**: Prayer points per chapter (for theological books) — connected to the chapter's revelation, not generic prayers
- [x] **ENH-06**: Foreword generation — frames the book's purpose, written in author voice or as a draft for an endorser

### Iteration

- [x] **ITER-01**: Outline approval gate — user reviews outline before any drafting begins
- [x] **ITER-02**: Full draft review — complete book presented for holistic feedback before final formatting
- [x] **ITER-03**: Chapter-level revision — user can request rewrite of specific chapters with targeted feedback
- [x] **ITER-04**: Revised chapters trigger flow-check on adjacent chapters (transitions may break)
- [x] **ITER-05**: Revision history preserved in project directory (drafts are not overwritten)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Advanced Features

- **ADV-01**: Building momentum architecture — chapter escalation designed in outliner with momentum position metadata
- **ADV-02**: Non-theological voice profile library — curated profiles for leadership, self-help, teaching genres
- **ADV-03**: Book series support — shared voice and theological framework across multiple books with cross-referencing
- **ADV-04**: Collaborative review — multiple reviewers can provide feedback on different chapters

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| ePub / PDF generation | .docx is the output format; external tools handle conversion better |
| Fiction / narrative support | Completely different domain (character arcs, dialogue, scene blocking). Purpose-built for non-fiction. |
| Cover design / visual assets | Different skillset (graphic design, not writing) |
| Real-time co-writing | Destroys voice consistency. Pipeline with quality gates is the model. |
| Automated publishing pipeline | Publishing (ISBN, pricing, distribution) is outside the writing domain |
| Plagiarism / AI detection | Unreliable tools. Voice fidelity is the actual solution. |
| Auto-research from internet | Hallucination risk too high for theological content. User provides or verifies sources. |
| Chapter-by-chapter streaming | Creates pressure to approve incomplete work. Book is a system -- present as a whole. |
| Citation management (Zotero/EndNote) | Non-fiction teaching books use informal references, not academic citation formats |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Complete |
| FOUND-02 | Phase 1 | Complete |
| FOUND-03 | Phase 1 | Complete |
| FOUND-04 | Phase 1 | Complete |
| FOUND-05 | Phase 1 | Complete |
| FOUND-06 | Phase 1 | Complete |
| VOICE-01 | Phase 2 | Complete |
| VOICE-02 | Phase 2 | Complete |
| VOICE-03 | Phase 2 | Complete |
| VOICE-04 | Phase 2 | Complete |
| VOICE-05 | Phase 2 | Complete |
| VOICE-06 | Phase 2 | Complete |
| OUTL-01 | Phase 2 | Complete |
| OUTL-02 | Phase 2 | Complete |
| OUTL-03 | Phase 2 | Complete |
| OUTL-04 | Phase 2 | Complete |
| OUTL-05 | Phase 2 | Complete |
| OUTL-06 | Phase 2 | Complete |
| RSRCH-01 | Phase 3 | Complete |
| RSRCH-02 | Phase 3 | Complete |
| RSRCH-03 | Phase 3 | Complete |
| RSRCH-04 | Phase 3 | Complete |
| WRITE-01 | Phase 3 | Complete |
| WRITE-02 | Phase 3 | Complete |
| WRITE-03 | Phase 3 | Complete |
| WRITE-04 | Phase 3 | Complete |
| WRITE-05 | Phase 3 | Complete |
| WRITE-06 | Phase 3 | Complete |
| WRITE-07 | Phase 3 | Complete |
| EDIT-01 | Phase 4 | Complete |
| EDIT-02 | Phase 4 | Complete |
| EDIT-03 | Phase 4 | Complete |
| EDIT-04 | Phase 4 | Complete |
| EDIT-05 | Phase 4 | Complete |
| EDIT-06 | Phase 4 | Complete |
| FMT-01 | Phase 5 | Complete |
| FMT-02 | Phase 5 | Complete |
| FMT-03 | Phase 5 | Complete |
| FMT-04 | Phase 5 | Complete |
| FMT-05 | Phase 5 | Complete |
| FMT-06 | Phase 5 | Complete |
| FMT-07 | Phase 5 | Complete |
| FMT-08 | Phase 5 | Complete |
| ENH-01 | Phase 6 | Complete |
| ENH-02 | Phase 6 | Complete |
| ENH-03 | Phase 6 | Complete |
| ENH-04 | Phase 6 | Complete |
| ENH-05 | Phase 6 | Complete |
| ENH-06 | Phase 6 | Complete |
| ITER-01 | Phase 2 | Complete |
| ITER-02 | Phase 4 | Complete |
| ITER-03 | Phase 4 | Complete |
| ITER-04 | Phase 4 | Complete |
| ITER-05 | Phase 4 | Complete |

**Coverage:**
- v1 requirements: 49 total
- Mapped to phases: 49
- Unmapped: 0

---
*Requirements defined: 2026-03-27*
*Last updated: 2026-03-27 after roadmap creation*
