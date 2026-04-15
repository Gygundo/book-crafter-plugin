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
- [ ] **OUTL-06**: Generate outline from existing content (sermon transcripts, notes, blog posts) by extracting themes and arguments

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

- [ ] **ENH-01**: Sermon-to-book input path — converts sermon series into book chapters, adapting spoken rhythm to written rhythm
- [ ] **ENH-02**: Sermon adaptation transforms: spoken fragments to complete sentences, audience-specific to universal references, verbal cues to written transitions, repetition-for-emphasis to revelation-for-emphasis
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
| OUTL-06 | Phase 9 | Pending |
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
| ENH-01 | Phase 9 | Pending |
| ENH-02 | Phase 9 | Pending |
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
- Complete: 46
- Pending (gap closure): 3 (OUTL-06, ENH-01, ENH-02)
- Unmapped: 0

---

## Milestone v1.1 Requirements (Bestseller Quality + Distribution)

**Defined:** 2026-04-15
**Goal:** Lift generated books from "well-argued teaching" to "bestseller-quality prose a reader devours", and package the plugin for one-click install on Claude Code (not claude.ai Desktop — claude.ai has no plugin installer).

**Evidence base:** Eternally Secure Ch1 diagnostic — statistical opener, buried central image, 11 transliterated Greek words, zero author vulnerability, pulpit-seam transitions ("So let us handle it"), generic reader anchors.

**Phase 7 post-mortem driver:** Phase 7 verified framework *presence*, not output *quality*. v1.1 rules must be procedural and countable, not aspirational, and every acceptance criterion must be observable in generated output.

### Writing Quality v2

- [x] **CRAFT-01**: Writer produces a scene-first opener — named human + time-marker + sensory detail — in the first 150 words of every chapter, cited to a source file or Book DNA line via provenance comment
- [x] **CRAFT-02**: Editor enforces Greek/Hebrew density cap of ≤3 transliterated terms per chapter, each with ≥3 sentences of unpacking
- [x] **CRAFT-03**: Writer places one dominant central image in the opening 200 words, middle third, and closing 200 words of every chapter
- [x] **CRAFT-04**: Writer includes one first-person author vulnerability beat per chapter in the middle third, sourced from voice profile or source material (never fabricated)
- [x] **CRAFT-05**: Editor detects and rewrites pulpit-seam phrases ("So", "Now", "Let us", "Here's where", "And so") at chapter and paragraph starts, with a permitted-usage counter-example list
- [x] **CRAFT-06**: Writer names ≥2 concrete reader-moments per chapter (e.g. "the 2am phone-check"), sourced from a Voice Profile *Reader Moments* section
- [x] **CRAFT-07**: Editor enforces ≥2 quoted/italicised reader-thought lines per chapter (psychological tension, not structural)
- [x] **CRAFT-08**: Editor enforces a concrete:abstract noun ratio ≥1:1 over any 4-paragraph window (show-don't-tell detector)
- [x] **CRAFT-09**: Captivation rubric extracted from inline editor/writer sections into standalone `references/captivation-rubric.md`, unchanged scores on regression check
- [x] **CRAFT-10**: Captivation rubric extended from 5 components (0-10) to 7 components (0-14), with Craft Density and Cross-Chapter Craft components anchored to before/after exemplars from Eternally Secure
- [x] **CRAFT-11**: New `references/bestseller-craft-rules.md` reference file, read by both writer and editor, voice-agnostic, cap 200 lines
- [x] **CRAFT-12**: New `references/bestseller-calibration.md` with paraphrased before/after paragraphs at score levels 3, 6, and 9
- [x] **CRAFT-13**: Voice profile audited and subtractively edited — every v2 addition paired with a v1 removal, cap 150 lines, tracked kill list committed
- [x] **CRAFT-14**: Orchestrator gains `--fresh` mode that deletes Book DNA, chapter-outline, research/, drafts/, revisions/, edited/, enrichments/, front-matter/, reports/, output/ before starting (preserves only `sources/`, `sources-adapted/`, `brief.md`, `voice-profile.md`)
- [x] **CRAFT-15**: All generated artefacts carry a version stamp (`<!-- generated-by: book-crafter v1.1.0 -->`)
- [x] **CRAFT-16**: Per-chapter bestseller diagnostic report (CRAFT-01..CRAFT-08 pass/fail matrix with line citations) appended to `consistency-report.md`
- [x] **CRAFT-17**: Hard 2-revision cap per chapter with divergent-improvement detection (if revision N scores lower than N-1 on any sub-metric, accept N-1 and stop)

### Distribution Packaging

- [x] **PKG-01**: `.claude-plugin/marketplace.json` created with `source: "./"`, `strict: true`, no version field (plugin.json authoritative)
- [x] **PKG-02**: `plugin.json` bumped to `1.1.0`, plus `homepage`, `license`, `author`, `repository` metadata fields populated
- [ ] **PKG-03**: Recipient-facing `README.md` with 3-line copy-paste install block (`/plugin marketplace add …`, `/plugin install …`, `/reload-plugins`) — zero terminal commands for recipient, prerequisite note for Claude Code + Node ≥18
- [ ] **PKG-04**: `LICENSE` file (MIT)
- [ ] **PKG-05**: `CHANGELOG.md` with v1.0.0 and v1.1.0 entries, Keep-a-Changelog format
- [x] **PKG-06**: `fixtures/tiny-book/` — 3-chapter booklet fixture (`brief.md` + `expected-captivation-score.txt`) that smoke-test runs against in ≤5 minutes
- [ ] **PKG-07**: `scripts/release.sh` — whitelist-based zip builder (explicit allow-list, never `zip -r .`), version gate, CHANGELOG gate, size check (fail >5MB), personal-path grep gate (fail if output contains `/Users/David`)
- [ ] **PKG-08**: `claude plugin validate .` passes cleanly on the packaged plugin
- [ ] **PKG-09**: `/book-crafter:sample` skill — one-command end-to-end demo that runs the full pipeline on the fixture brief
- [x] **PKG-10**: Marketplace schema re-verified at Phase 11 start (doc re-fetch) before writing marketplace.json

### Re-run + Release Gate

- [ ] **GATE-01**: Frozen baseline `evidence/eternally-secure-ch1-before.md` committed (immutable Phase 7 output)
- [ ] **GATE-02**: Eternally Secure re-run through updated pipeline in `--fresh` mode, `evidence/eternally-secure-ch1-after.md` produced
- [ ] **GATE-03**: Seven-gap comparison file `evidence/seven-gap-comparison.md` — scene opener, Greek density, vulnerability, central image, tension-release, reader anchor, pulpit seams — with before/after quoted paragraphs for each
- [ ] **GATE-04**: Third-party review — fresh Claude session ranks before vs after blind, logged to `evidence/external-review.md`
- [ ] **GATE-05**: Sermon-adapter regression check — `sources-adapted/` byte-diff against pre-change baseline (must be unchanged)
- [ ] **GATE-06**: Fresh-install smoke-test — dev plugin removed, cache cleared, marketplace install via README commands, fixture brief run, .docx verified
- [ ] **GATE-07**: README capability language finalised against comparison evidence (no "bestseller quality" claim without matching evidence rows)
- [ ] **GATE-08**: David's explicit "ship / don't ship" call recorded in `evidence/ship-decision.md`
- [ ] **GATE-09**: `git tag v1.1.0` applied and pushed — blocked on GATE-03 + GATE-08

### Decisions locked before roadmap

- **Repo owner:** David's personal GitHub account. Exact username to be confirmed when PKG-03 README is written (Phase 11). Placeholder in marketplace URL: `davidencounter/book-crafter-plugin` (update before release).
- **License:** MIT.
- **"Claude Desktop" terminology correction:** All v1.1 artefacts must say "Claude Code" (not "Claude Desktop") when referring to the plugin host.

### Future Requirements (deferred to v1.2)

- DIFF-01: Sentence-length variance targeting
- DIFF-02: Chapter-ending echo (close-ring rule)
- DIFF-03: Dialogue breaks requirement
- DIFF-07: Targeted single-chapter rewrite mode
- PKG-DIFF-01: Pre-flight doctor skill (Node/Claude-Code version check)
- Official Anthropic marketplace submission
- Windows-host smoke-test (add to Phase 12 checklist but not blocking v1.1)

### Out of Scope (v1.1)

- Zip-based install as primary distribution path — Claude Code has no zip side-load (zip is secondary air-gapped artefact only)
- claude.ai Desktop plugin install — claude.ai has no plugin system
- Prose linters (write-good, textlint, retext) — cannot detect pulpit rhythm
- LLM-as-quality-judge scoring — rewards blandness
- New npm runtime dependencies
- Fiction/narrative craft — preserved v1.0 exclusion

### v1.1 Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CRAFT-01 | Phase 10 | Complete |
| CRAFT-02 | Phase 10 | Complete |
| CRAFT-03 | Phase 10 | Complete |
| CRAFT-04 | Phase 10 | Complete |
| CRAFT-05 | Phase 10 | Complete |
| CRAFT-06 | Phase 10 | Complete |
| CRAFT-07 | Phase 10 | Complete |
| CRAFT-08 | Phase 10 | Complete |
| CRAFT-09 | Phase 10 | Complete |
| CRAFT-10 | Phase 10 | Complete |
| CRAFT-11 | Phase 10 | Complete |
| CRAFT-12 | Phase 10 | Complete |
| CRAFT-13 | Phase 10 | Complete |
| CRAFT-14 | Phase 10 | Complete |
| CRAFT-15 | Phase 10 | Complete |
| CRAFT-16 | Phase 10 | Complete |
| CRAFT-17 | Phase 10 | Complete |
| PKG-01 | Phase 11 | Complete |
| PKG-02 | Phase 11 | Complete |
| PKG-03 | Phase 11 | Pending |
| PKG-04 | Phase 11 | Pending |
| PKG-05 | Phase 11 | Pending |
| PKG-06 | Phase 11 | Complete |
| PKG-07 | Phase 11 | Pending |
| PKG-08 | Phase 11 | Pending |
| PKG-09 | Phase 11 | Pending |
| PKG-10 | Phase 11 | Complete |
| GATE-01 | Phase 12 | Pending |
| GATE-02 | Phase 12 | Pending |
| GATE-03 | Phase 12 | Pending |
| GATE-04 | Phase 12 | Pending |
| GATE-05 | Phase 12 | Pending |
| GATE-06 | Phase 12 | Pending |
| GATE-07 | Phase 12 | Pending |
| GATE-08 | Phase 12 | Pending |
| GATE-09 | Phase 12 | Pending |

**v1.1 Coverage:**
- v1.1 requirements: 36 total (17 CRAFT + 10 PKG + 9 GATE)
- Mapped to phases: 36
- Unmapped: 0
- Orphaned: 0

---
*Requirements defined: 2026-03-27 (v1.0) / 2026-04-15 (v1.1)*
*Last updated: 2026-04-15 after v1.1 roadmap creation*
