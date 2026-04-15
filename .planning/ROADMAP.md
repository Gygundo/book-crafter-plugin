# Roadmap: Book Crafter Plugin

## Overview

The Book Crafter plugin delivers a complete book-writing pipeline through six sequential phases. Phase 1 establishes the plugin skeleton and orchestrator that all skills depend on. Phase 2 builds the voice system and outliner -- the quality foundation that prevents voice drift and weak structure. Phase 3 adds research gathering and parallel chapter writing, producing full drafts. Phase 4 adds the editor and revision workflow that ensures voice consistency and narrative flow. Phase 5 converts edited manuscripts into professional .docx output. Phase 6 adds content enhancements (sermon-to-book, discussion questions, prayer points) that enrich the final product.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Plugin Foundation + Orchestrator** - Plugin scaffold, master orchestrator, project directory structure, pipeline state tracking (completed 2026-03-27)
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
- [x] 01-01-PLAN.md — Plugin scaffold: manifest, stub skills, subagent definitions, reference documents
- [x] 01-02-PLAN.md — Master orchestrator skill with pipeline logic, state detection, and status dashboard

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
**Plans**: 2 plans

Plans:
- [x] 02-01-PLAN.md — Voice profile system: spec document, default profile validation, orchestrator voice selection with 4 input modes
- [x] 02-02-PLAN.md — Complete outliner skill with two-mode generation, structured output, narrative arc, Book DNA generation, and orchestrator wiring

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
**Plans**: 2 plans

Plans:
- [x] 03-01-PLAN.md — Researcher skill: structured per-chapter research artefacts with scripture, word studies, cross-references, and orchestrator Stage 2 wiring
- [x] 03-02-PLAN.md — Writer skill: chapter drafting with hooks, voice consistency, momentum pacing, theological depth, and orchestrator Stage 3 wave batching

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
**Plans**: 2 plans

Plans:
- [x] 04-01-PLAN.md — Editor skill: three-pass pipeline (voice consistency, flow/transitions, cross-chapter validation), rolling window for large books, chapter-editor subagent
- [x] 04-02-PLAN.md — Orchestrator Stage 4 detail, review gate, chapter-level revision workflow with adjacency checks and version history

### Phase 5: Formatter + .docx Output
**Goal**: The edited manuscript becomes a professionally formatted .docx file ready for hand-off to layout tools or direct reading
**Depends on**: Phase 4
**Requirements**: FMT-01, FMT-02, FMT-03, FMT-04, FMT-05, FMT-06, FMT-07, FMT-08
**Success Criteria** (what must be TRUE):
  1. Generated .docx has consistent typography, chapter heading styles with page breaks, and page numbers in footer ("Page X of Y")
  2. Front matter is present and correctly ordered: half title, full title page, copyright page, dedication, table of contents
  3. Back matter is present: about the author section, auto-extracted scripture index, glossary of key terms
  4. .docx generation uses docx-js patterns inherited from the existing docx skill
**Plans**: 2 plans

Plans:
- [x] 05-01-PLAN.md — Complete formatter skill: document assembly pipeline with front matter, body chapters, back matter, TOC, page numbers, scripture index
- [x] 05-02-PLAN.md — Orchestrator Stage 5 wiring and pipeline-stages.md documentation update

### Phase 6: Content Enhancements
**Goal**: The pipeline supports sermon-to-book conversion and generates reader engagement elements (discussion questions, summaries, prayer points, foreword)
**Depends on**: Phase 4
**Requirements**: ENH-01, ENH-02, ENH-03, ENH-04, ENH-05, ENH-06
**Success Criteria** (what must be TRUE):
  1. User can provide a sermon series as input and the system converts spoken rhythm to written rhythm -- fragments become complete sentences, verbal cues become written transitions, audience-specific references become universal
  2. Each chapter has specific discussion questions that pass the cliche test (not generic, tied to the chapter's unique arguments)
  3. Each chapter has a concise summary of key points and (for theological books) prayer points connected to the chapter's revelation
  4. A foreword is generated that frames the book's purpose, written in author voice or as a draft for an endorser
**Plans**: 2 plans

Plans:
- [x] 06-01-PLAN.md — Sermon-adapter skill with 7 transformation rules and orchestrator Stage 0.5 wiring
- [x] 06-02-PLAN.md — Enricher skill (discussion questions, summaries, prayer points, foreword), orchestrator Stage 4.5 wiring, and formatter enrichment rendering

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Plugin Foundation + Orchestrator | 2/2 | Complete   | 2026-03-27 |
| 2. Voice System + Book Outliner | 0/2 | Not started | - |
| 3. Research + Chapter Writing | 0/2 | Not started | - |
| 4. Editor + Revision Workflow | 0/2 | Not started | - |
| 5. Formatter + .docx Output | 0/2 | Not started | - |
| 6. Content Enhancements | 1/2 | In Progress|  |

### Phase 7: Captivating writing, modern voice profile, and bestseller formatting

**Goal:** Upgrade the pipeline's writing quality from functional-but-sermon-like output to captivating, page-turner prose by rewriting the voice profile for bestseller-quality craft, enhancing the writer and outliner with storytelling-first patterns, modernising the formatter for mixed-font typography with scripture block quotes and pull quotes, and adding captivation enforcement to the editor
**Requirements**: D-01, D-02, D-03, D-04, D-05, D-06, D-07, D-08, D-09, D-10, D-11, D-12, D-13, D-14
**Depends on:** Phase 6
**Plans:** 4/4 plans executed

Plans:
- [x] 07-01-PLAN.md — Voice profile rewrite for bestseller-quality craft + outliner ending style field
- [x] 07-02-PLAN.md — Writer skill with storytelling-first hooks, tension-release pacing, and markdown conventions
- [x] 07-03-PLAN.md — Formatter typography upgrade: scripture block quotes, pull quotes, mixed-font (Calibri headings + Georgia body)
- [x] 07-04-PLAN.md — Editor captivation checks (4 checks in existing 3-pass pipeline) + subagent updates

### Phase 8: Voice builder skill - analyse source content to generate custom voice profiles

**Goal:** A new voice-builder skill that analyses a directory of markdown files (e.g. an Obsidian vault) and generates a custom voice profile conforming to voice-profile-spec.md, with a review gate before saving and integration into the orchestrator as a fifth voice selection option
**Requirements**: VB-01, VB-02, VB-03, VB-04, VB-05, VB-06, VB-07, VB-08
**Depends on:** Phase 7
**Plans:** 2 plans

Plans:
- [x] 08-01-PLAN.md — Voice builder skill: two-pass analysis, corpus assessment, domain detection, calibration examples, and review gate
- [x] 08-02-PLAN.md — Orchestrator integration: Mode 5 ("Build from source material") voice selection option

### Phase 9: Wire Sermon Adapter Output to Outliner

**Goal:** Fix the broken sermon-to-book pipeline by updating the outliner to prefer `sources-adapted/` over `sources/` when adapted content exists, closing the integration gap between the sermon adapter (Stage 0.5) and the outliner (Stage 1)
**Requirements**: OUTL-06, ENH-01, ENH-02
**Depends on:** Phase 8
**Gap Closure:** Closes gaps from v1.0 milestone audit
**Plans:** 1 plan

Plans:
- [x] 09-01-PLAN.md — Update outliner SKILL.md Section 2 mode detection and Section 4.1 source reading to prefer `sources-adapted/` when present


## Milestone v1.1: Bestseller Quality + Distribution

**Defined:** 2026-04-15
**Goal:** Lift generated books from "well-argued teaching" to "bestseller-quality prose a reader devours", and package the plugin for one-click install on Claude Code (the plugin host — not claude.ai Desktop, which has no plugin installer).
**Evidence base:** Eternally Secure Ch1 diagnostic — statistical opener, buried central image, 11 transliterated Greek words, zero author vulnerability, pulpit-seam transitions, generic reader anchors.
**Phase 7 post-mortem driver:** Phase 7 verified framework *presence*, not output *quality*. v1.1 rules must be procedural and countable, not aspirational. Every acceptance criterion must be observable in generated output.

### v1.1 Phases

- [x] **Phase 10: Writing Quality v2** — Seven countable craft rules, extracted/extended captivation rubric, voice profile subtractive audit, `--fresh` orchestrator mode, version stamps, per-chapter diagnostic report (completed 2026-04-15)
- [ ] **Phase 11: Distribution Packaging** — Marketplace.json, plugin.json v1.1.0 metadata, recipient README, LICENSE, CHANGELOG, fixture, release.sh with whitelist zip, sample skill
- [ ] **Phase 12: Re-run + Release Gate** — Frozen baseline, `--fresh` re-run, seven-gap comparison, external review, sermon-adapter regression check, fresh-install smoke-test, ship decision, git tag

### Phase 10: Writing Quality v2
**Goal:** Generated chapters read as bestseller-quality prose — scene-first openers, disciplined Greek density, one dominant central image, an author vulnerability beat, and zero pulpit seams — enforced by procedural, countable rules rather than aspirational guidance.
**Depends on:** Phase 9
**Requirements:** CRAFT-01, CRAFT-02, CRAFT-03, CRAFT-04, CRAFT-05, CRAFT-06, CRAFT-07, CRAFT-08, CRAFT-09, CRAFT-10, CRAFT-11, CRAFT-12, CRAFT-13, CRAFT-14, CRAFT-15, CRAFT-16, CRAFT-17
**Success Criteria** (what must be TRUE — observable in generated output):
  1. Every generated chapter opens with a named human + time-marker + sensory detail in the first 150 words, with a provenance comment citing a source file or Book DNA line
  2. No generated chapter contains more than 3 transliterated Greek/Hebrew terms, and each term receives at least 3 sentences of unpacking
  3. Every generated chapter contains one dominant central image visible in the opening 200 words, middle third, and closing 200 words
  4. Every generated chapter contains one first-person author vulnerability beat in the middle third, sourced (not fabricated) from voice profile or source material
  5. No generated chapter starts paragraphs with pulpit-seam phrases ("So", "Now", "Let us", "Here's where", "And so") except via the permitted-usage counter-example list; every chapter ships with a bestseller diagnostic report showing CRAFT-01..CRAFT-08 pass/fail with line citations

**Build order (from SUMMARY.md — do not reorder):**
  1. Extract captivation rubric from inline editor sections (CRAFT-09) — regression-check scores unchanged
  2. Create `references/bestseller-craft-rules.md` (CRAFT-11) BEFORE updating writer/editor skills that read it
  3. Update writer skill (scene-first, Greek density, provenance comments)
  4. Update editor Pass 1 sub-sections (craft density, tension-release, pulpit-seam detection — flag-only first)
  5. Update editor Pass 2 (scene-first strictness, cross-chapter craft)
  6. Extend captivation rubric with Craft Density + Cross-Chapter Craft components (CRAFT-10) — anchored to before/after exemplars
  7. Create `references/bestseller-calibration.md` with paraphrased before/after at score levels 3, 6, 9 (CRAFT-12)
  8. Subtractive voice-profile audit (CRAFT-13) — **runs in parallel with rule additions, not after**. Every addition paired with a v1 removal. Kill list tracked.
  9. Add `--fresh` mode to orchestrator (CRAFT-14)
  10. Add version stamps to all generated artefacts (CRAFT-15)
  11. Add per-chapter bestseller diagnostic report to consistency-report.md (CRAFT-16)
  12. Add 2-revision cap with divergent-improvement detection (CRAFT-17)

**Anti-pattern reminder (from PITFALLS.md + Phase 7 post-mortem):** Do NOT repeat the Phase 7 failure mode — additive-only rule evolution where the voice profile becomes a kitchen sink and the model averages competing signals into blandness. Every v2 addition MUST pair with an explicit v1 removal; the voice profile is capped at 150 lines; the kill list is committed. Rules must be procedural ("if first 150 words contain zero sensory details, rewrite") not aspirational ("write vividly"). Scene openers without provenance comments must be flagged — an agent asked to invent a scene with no source material will hallucinate generic fiction.

**Plans:** 9/9 plans complete

Plans:
- [x] 10-01-PLAN.md — Wave 0 infrastructure + rubric extraction (craft-check.js, fixtures, baseline, captivation-rubric.md)
- [x] 10-02-PLAN.md — Create bestseller-craft-rules.md (voice-agnostic CRAFT-01..08 reference, ≤200 lines)
- [x] 10-03-PLAN.md — Writer + outliner updates (scene-first, Greek cap, central image, vulnerability, reader moments, pulpit avoidance)
- [x] 10-04-PLAN.md — Editor Pass 1 craft-check invocation + new sub-sections (craft density, pulpit seam, tension-release, show-don't-tell)
- [x] 10-05-PLAN.md — Editor Pass 2 scene-first strictness + central image/vulnerability/reader moment audits
- [x] 10-06-PLAN.md — Captivation rubric extended 5→7 components + bestseller-calibration.md (score levels 3/6/9)
- [x] 10-07-PLAN.md — Voice profile subtractive audit + Reader Moments section + kill list (PARALLEL wave 3)
- [x] 10-08-PLAN.md — Orchestrator Mode 6 Fresh Run + version stamps wired into all emitting skills
- [x] 10-09-PLAN.md — Bestseller diagnostic report in consistency-report.md + 2-revision cap with divergent-improvement detection

### Phase 11: Distribution Packaging
**Goal:** A non-technical recipient can install the plugin into their Claude Code in three copy-paste slash commands, with all supporting release infrastructure (marketplace, manifest metadata, README, LICENSE, CHANGELOG, fixture, release script) in place.
**Depends on:** Phase 10 (packaging must ship the quality improvements — cannot ship unverified prose)
**Requirements:** PKG-01, PKG-02, PKG-03, PKG-04, PKG-05, PKG-06, PKG-07, PKG-08, PKG-09, PKG-10
**Success Criteria** (what must be TRUE — observable installability outcomes):
  1. Recipient can install the plugin into Claude Code using exactly three slash commands from the README (`/plugin marketplace add …`, `/plugin install …`, `/reload-plugins`) — zero terminal commands outside Claude Code
  2. `claude plugin validate .` passes cleanly on the packaged plugin with no warnings
  3. `scripts/release.sh` produces a zip artefact under 5MB with zero `/Users/David` personal-path matches, gated on CHANGELOG entry and plugin.json version match
  4. `/book-crafter:sample` runs the full pipeline on the `fixtures/tiny-book/` brief end-to-end in ≤5 minutes and produces a valid .docx
  5. Recipient README contains no "Claude Desktop" references — all plugin-host language says "Claude Code"

**Build order (from SUMMARY.md):**
  1. **Phase 11 Start gate: re-fetch `code.claude.com/docs/en/plugins` and `plugin-marketplaces` (PKG-10)** before writing marketplace.json — spec is actively evolving
  2. Create `fixtures/tiny-book/` (PKG-06) and wire smoke-test path first
  3. Create CHANGELOG.md (PKG-05), README.md (PKG-03), LICENSE (PKG-04)
  4. Create `.claude-plugin/marketplace.json` — `source: "./"`, `strict: true`, no version field (PKG-01)
  5. Bump `plugin.json` to 1.1.0 + add homepage/license/author/repository (PKG-02)
  6. Create `scripts/release.sh` — explicit whitelist (never `zip -r .`), version gate, CHANGELOG gate, size check, personal-path grep gate (PKG-07)
  7. Create `/book-crafter:sample` skill (PKG-09)
  8. Verify `claude plugin validate .` passes (PKG-08) — dry-run before Phase 12

**Anti-pattern reminder (from PITFALLS.md):** Do NOT `zip -r .` — always build from an explicit allow-list. The release script MUST fail-hard if the output exceeds 5MB, contains `/Users/David`, or ships `.planning/`, `evidence/`, or `books/`. Do NOT declare version in both `plugin.json` AND `marketplace.json` — the manifest silently wins and the marketplace version is ignored. Do NOT claim "bestseller quality" in the README until Phase 12 evidence exists (Phase 12 finalises README capability language). Do NOT use the term "Claude Desktop" anywhere — plugins live in Claude Code; claude.ai has no plugin installer.

**Plans:** 5/6 plans executed

Plans:
- [x] 11-01-PLAN.md — Tiny-book fixture (brief.md + threshold) and .gitignore additions
- [x] 11-02-PLAN.md — GitHub repo creation, README, LICENSE, CHANGELOG
- [x] 11-03-PLAN.md — plugin.json v1.1.0 bump (dev name) + marketplace.json (repo-as-marketplace)
- [x] 11-04-PLAN.md — scripts/release.sh with 9 fail-hard gates and D-27 whitelist
- [x] 11-05-PLAN.md — /book-crafter:sample skill (end-to-end fixture demo)
- [ ] 11-06-PLAN.md — Final validate + release.sh + sample smoke-test and threshold calibration

### Phase 12: Re-run + Release Gate
**Goal:** Prove the v1.1 rules actually improve output by re-running Eternally Secure in `--fresh` mode, producing a seven-gap before/after comparison with quoted paragraphs, verifying the fresh-install path, and recording David's explicit ship decision — all blocking on the v1.1.0 git tag.
**Depends on:** Phase 11 (packaging must be complete before fresh-install smoke-test can run)
**Requirements:** GATE-01, GATE-02, GATE-03, GATE-04, GATE-05, GATE-06, GATE-07, GATE-08, GATE-09
**Success Criteria** (what must be TRUE — observable evidence outcomes):
  1. `evidence/seven-gap-comparison.md` exists and every one of the seven gap areas (scene opener, Greek density, vulnerability, central image, tension-release, reader anchor, pulpit seams) shows a before/after quoted paragraph with measurable improvement
  2. A fresh-install smoke-test (dev plugin removed, cache cleared, install via README commands, fixture brief run) produces a valid .docx on first attempt
  3. `sources-adapted/` output byte-matches the pre-change baseline — sermon adapter regression is zero
  4. `evidence/ship-decision.md` contains David's explicit "ship / don't ship" call, and `git tag v1.1.0` is applied only after that call is "ship"
  5. `evidence/external-review.md` contains a fresh-Claude blind ranking of before vs after

**Build order (from SUMMARY.md):**
  1. Freeze baseline: commit `evidence/eternally-secure-ch1-before.md` as immutable Phase 7 output (GATE-01)
  2. Re-run Eternally Secure in `--fresh` mode → `evidence/eternally-secure-ch1-after.md` (GATE-02)
  3. Produce seven-gap comparison file (GATE-03) with before/after quoted paragraphs for every gap
  4. Third-party fresh-Claude blind review (GATE-04) → `evidence/external-review.md`
  5. Sermon-adapter regression byte-diff against pre-change baseline (GATE-05)
  6. Fresh-install smoke-test: uninstall dev, clear cache, marketplace install via README commands, run fixture, verify .docx (GATE-06)
  7. Finalise README capability language against comparison evidence — no claim without a matching evidence row (GATE-07)
  8. David's explicit ship decision recorded (GATE-08) — **HARD GATE**
  9. Apply and push `git tag v1.1.0` (GATE-09) — blocked on GATE-03 AND GATE-08

**Anti-pattern reminder (from PITFALLS.md):** Phase 12 is the structural prevention against Phase 7's failure. Do NOT skip the re-run ("the rules look good, ship it") — Phase 7 shipped on that reasoning and produced the Eternally Secure Ch1 evidence this milestone exists to fix. Do NOT allow the README to claim capabilities that the comparison file does not substantiate (README overclaiming, Pitfall 22). Do NOT allow `git tag v1.1.0` to be applied before GATE-08 — the ship decision is David's explicit call, not an implicit "all plans green" inference. Phase 11 cannot mark complete until Phase 12 signs off.

**Plans:** TBD (estimated 7 plans — baseline freeze, fresh re-run, seven-gap comparison, external review, adapter regression + smoke-test, README finalisation, ship decision + tag)

### v1.1 Progress

**Execution Order:** 10 → 11 → 12 (sequential, Phase 12 is a hard gate on release)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 10. Writing Quality v2 | 9/9 | Complete    | 2026-04-15 |
| 11. Distribution Packaging | 5/6 | In Progress|  |
| 12. Re-run + Release Gate | 0/7 | Not started | - |

### v1.1 Coverage

- Total v1.1 requirements: 36 (CRAFT-01..17 + PKG-01..10 + GATE-01..09)
- Mapped: 36 / 36 (100%)
- Orphaned: 0

### Phase 13: Repetition and novelty enforcement

**Goal:** Close the repetition blindspot surfaced by the first real sample run. The system scored 14/14 on its own captivation rubric while the human reader experienced the output as a loop (central image "one small lamp refusing the whole dark" hit in every zone of every chapter; author's kitchen-counter vulnerability beat near-verbatim in both foreword and Ch 2). Ship structural fixes so outputs are judged on variation, not just presence, and the release gate trusts a single canonical score.

**Requirements**: Cross-AI consensus (Codex + Gemini 2.5 Flash — see `.planning/phases/11-distribution-packaging/11-REVIEWS.md`).

**Depends on:** Phase 11

**UI hint:** no

**Success criteria (goal-backward):**
1. Exactly ONE canonical captivation score surface. Editor emits structured YAML fields (`captivation_total:`, `novelty_dedup:`, per-component scores). Sample skill gate reads YAML, not a prose grep. The three existing schemas (`references/captivation-rubric.md`, `skills/editor/SKILL.md:504` template, sample report checklist) are reconciled.
2. Editor Pass 3 runs a manuscript-level "Novelty and Dedup Audit" across `front-matter/*.md` + `edited/ch*-final.md`. Flags and fails the score when it finds: repeated 6+ word spans outside scripture and declared refrains; reuse of a vulnerability scene across foreword and chapter; reuse of a reader-moment in adjacent chapters; reuse of a metaphor vehicle as dominant image across chapters.
3. Captivation rubric gains a Novelty / Variation dimension. Central-image distinctness extends from concept to descriptive phrasing. Same-phrase reuse across zones of a single chapter is capped, not rewarded.
4. Writer skill prompt adds an anti-loop clause: no 6+ word phrase reuse across chapters or foreword unless whitelisted as a refrain; spent vulnerability seeds cannot be reused; motif family may be shared but image vehicle must differ per chapter; echo and recontextualise, not repeat.
5. Tiny-book fixture brief rewritten from "same exact central image every chapter" to "one motif family, three distinct vehicles" (phone glow / kitchen counter / grey dawn). The phrase "one small lamp refusing the whole dark" appears at most once in the whole booklet.
6. A fresh `/book-crafter:sample` run against the rewritten fixture passes the new canonical gate, produces zero dedup flags, and reads as visibly non-repetitive.

**Plans:** 3/11 plans executed

Plans:
- [ ] TBD (run /gsd:plan-phase 13 to break down — consensus fix list is in 11-REVIEWS.md)
