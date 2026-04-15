---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: Bestseller Quality + Distribution
status: executing
stopped_at: Completed 13-07-PLAN.md
last_updated: "2026-04-15T21:10:40.000Z"
last_activity: 2026-04-15
progress:
  total_phases: 13
  completed_phases: 10
  total_plans: 45
  completed_plans: 39
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-15)

**Core value:** Every chapter must read like it was written by a bestselling author -- hooks that grab, revelation-driven depth that stays accessible, seamless flow between chapters, and a voice so consistent the reader forgets multiple agents touched it.
**Current focus:** Phase 13 — repetition-and-novelty-enforcement

## Current Position

Phase: 13 (repetition-and-novelty-enforcement) — EXECUTING
Plan: 3 of 11
Status: Ready to execute
Last activity: 2026-04-15

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**

- Total plans completed (v1.0): 25
- Total plans in v1.1: 22 (estimated)
- Average duration: ~3 min/plan (v1.0 trend)
- Total execution time: ~75 minutes (v1.0)

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 2 | 7min | 3.5min |
| 02 | 2 | 5min | 2.5min |
| 03 | 2 | 5min | 2.5min |
| 04 | 2 | 4min | 2min |
| 05 | 2 | 6min | 3min |
| 06 | 2 | 11min | 5.5min |
| 07 | 4 | 9min | 2.25min |
| 08 | 2 | ~2min | 1min |
| 09 | 1 | — | — |

**Recent Trend:**

- Last 5 plans: fast (1-3 min each)
- Trend: stable

*Updated after each plan completion*
| Phase 01 P01 | 5min | 2 tasks | 11 files |
| Phase 01 P02 | 2min | 1 tasks | 1 files |
| Phase 02 P01 | 2min | 2 tasks | 3 files |
| Phase 02 P02 | 3min | 2 tasks | 2 files |
| Phase 03 P01 | 2min | 2 tasks | 2 files |
| Phase 03 P02 | 3min | 2 tasks | 3 files |
| Phase 04 P01 | 3min | 2 tasks | 2 files |
| Phase 04 P02 | 1min | 2 tasks | 2 files |
| Phase 05 P01 | 4min | 1 tasks | 1 files |
| Phase 05 P02 | 2min | 2 tasks | 2 files |
| Phase 06 P01 | 4min | 2 tasks | 3 files |
| Phase 06 P02 | 7min | 2 tasks | 4 files |
| Phase 07 P01 | 2min | 2 tasks | 2 files |
| Phase 07 P02 | 2min | 1 tasks | 1 files |
| Phase 07 P03 | 2min | 1 tasks | 1 files |
| Phase 07 P04 | 3min | 2 tasks | 3 files |
| Phase 08 P02 | 1min | 1 tasks | 1 files |
| Phase 10-writing-quality-v2 P01 | 8min | 3 tasks | 12 files |
| Phase 10-writing-quality-v2 P02 | 2min | 1 tasks | 1 files |
| Phase 10-writing-quality-v2 P07 | 4min | 2 tasks | 4 files |
| Phase 10-writing-quality-v2 P03 | 4min | 2 tasks | 3 files |
| Phase 10-writing-quality-v2 P04 | 6min | 1 tasks | 1 files |
| Phase 10-writing-quality-v2 P05 | 3min | 1 tasks | 1 files |
| Phase 10-writing-quality-v2 P08 | 6min | 2 tasks | 6 files |
| Phase 10-writing-quality-v2 P06 | 5min | 2 tasks | 3 files |
| Phase 10-writing-quality-v2 P09 | 6min | 2 tasks | 2 files |
| Phase 11-distribution-packaging P01 | 2min | 2 tasks | 3 files |
| Phase 11-distribution-packaging P03 | 2min | 2 tasks | 2 files |
| Phase 11-distribution-packaging P02 | 11min | 3 tasks | 3 files |
| Phase 11-distribution-packaging P05 | 3min | 1 tasks | 1 files |
| Phase 11-distribution-packaging P04 | 4min | 1 tasks | 1 files |
| Phase 13-repetition-and-novelty-enforcement P02 | 4min | 2 tasks | 8 files |
| Phase 13-repetition-and-novelty-enforcement P01 | 4min | 3 tasks | 7 files |
| Phase 13-repetition-and-novelty-enforcement P03 | 4min | 2 tasks | 3 files |
| Phase 13-repetition-and-novelty-enforcement P04 | 6min | 2 tasks | 2 files |
| Phase 13-repetition-and-novelty-enforcement P07 | 5min | 2 tasks | 2 files |
| Phase 13-repetition-and-novelty-enforcement P06 | 4min | 2 tasks | 1 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [v1.1 Roadmap]: Three phases (10, 11, 12) derived directly from research SUMMARY.md decomposition — Writing Quality v2 → Distribution Packaging → Re-run + Release Gate
- [v1.1 Roadmap]: Phase 12 is a HARD GATE on release. Phase 11 cannot mark complete until Phase 12 signs off. `git tag v1.1.0` blocks on GATE-03 (seven-gap comparison) + GATE-08 (David's explicit ship call).
- [v1.1 Roadmap]: Phase 10 subtractive audit (CRAFT-13) runs in parallel with rule additions, not after — structural prevention against Phase 7's additive-only failure mode.
- [v1.1 Roadmap]: Phase 10 internal ordering: extract captivation rubric (CRAFT-09) before extending (CRAFT-10); create `references/bestseller-craft-rules.md` (CRAFT-11) before updating writer/editor skills that read it.
- [v1.1 Roadmap]: Phase 11 start requires marketplace schema doc re-fetch (PKG-10) before writing marketplace.json.
- [v1.1 Roadmap]: "Claude Desktop" terminology forbidden in all v1.1 artefacts — plugins live in Claude Code, not claude.ai.
- [v1.1 Roadmap]: Zero new npm dependencies — Writing Quality v2 is entirely model-driven.
- [v1.1 Roadmap]: 100% requirement coverage — 36/36 v1.1 requirements mapped (17 CRAFT → P10, 10 PKG → P11, 9 GATE → P12).
- Roadmap: 6 phases derived from 49 requirements, following pipeline dependency chain
- Roadmap: ITER-01 mapped to Phase 2 (outliner approval gate) since it duplicates OUTL-04 functionality
- Roadmap: Phase 6 depends on Phase 4 (not Phase 5) -- enhancements enrich content, not formatting
- [Phase 01]: Skills at plugin root, only plugin.json inside .claude-plugin/
- [Phase 01]: All pipeline skills user-invocable: false, orchestrator calls them
- [Phase 01]: Subagents use model: inherit, no hooks/mcpServers/permissionMode
- [Phase 01]: Orchestrator uses filesystem state detection (artefact existence = stage completion)
- [Phase 01]: Outline approval gate never skipped, even in Full Pipeline mode
- [Phase 02]: Voice profile spec defines 5 required sections and 2 optional sections with validation rules
- [Phase 02]: Inline voice descriptions expanded with INFERRED markers for transparency
- [Phase 02]: Outliner uses auto-detection for mode selection (sources/ directory presence)
- [Phase 02]: All five momentum positions mandatory in every outline (Foundation through Landing)
- [Phase 02]: Source ingestion explicitly transforms structure rather than mirroring source layout
- [Phase 03]: Research runs sequentially per chapter (not parallel) -- simpler and fast enough
- [Phase 03]: Research mode auto-detected from voice profile theological content, not user-specified
- [Phase 03]: VERIFY markers on uncertain scripture rather than omitting references
- [Phase 03]: Voice calibration uses 3 concrete examples rather than abstract descriptions for parallel agent consistency
- [Phase 03]: Wave size 4-6 chapters (not 8-10) to avoid rate limits and context saturation
- [Phase 03]: Chapter body uses continuous narrative with no sub-headings for seamless reading
- [Phase 04]: Theological guardrails integrated into Pass 1 (not separate pass) since theological framework is part of voice profile
- [Phase 04]: Pass 3 findings flagged for user decision rather than auto-fixed (except unambiguous capitalisation drift)
- [Phase 04]: Review gate presents three options: approve, revise chapters, read full draft
- [Phase 04]: Revision marker in consistency-report.md (not separate state file) following filesystem-as-state pattern
- [Phase 04]: One-hop adjacency limit: revised chapter + immediate neighbours only, no recursive cascade
- [Phase 05]: US Letter default page size, TOTAL_PAGES for footer, Book DNA Key Terms as sole glossary source
- [Phase 05]: Validation script invocation optional (do not fail if not found)
- [Phase 06]: Sermon adapter as separate skill (not outliner extension) for clean responsibility separation
- [Phase 06]: Enrichments processed sequentially per chapter, not parallel, since each reads full chapter text
- [Phase 06]: No approval gate for enrichments -- users revise via Mode 5 after .docx review
- [Phase 06]: Formatter backward compatible -- has_enrichments flag skips rendering for pre-Phase 6 projects
- [Phase 07]: Voice profile models bestselling author CRAFT (storytelling, warmth, vulnerability) while preserving theological framework verbatim
- [Phase 07]: Calibration examples are original prose in target style, not quotes from published books
- [Phase 07]: Hook types become tools within opening stories, not standalone openers (D-01)
- [Phase 07]: Tension-release cycles (2-3 per chapter) replace linear 7-part chapter structure (D-03)
- [Phase 07]: Scripture uses block-quote markdown (> *text* + > -- Reference), pull quotes use :::pullquote fenced directives (D-10, D-12)
- [Phase 07]: Calibri for headings, Georgia for body (D-11 mixed-font typography)
- [Phase 07]: Scripture detection: two-line pattern (> *text* + > -- Reference) prevents false positives on regular blockquotes
- [Phase 07]: Captivation score uses 5 components at 0-2 points each for 1-10 scale with momentum-aware thresholds
- [Phase 08]: Mode 5 inserted before Mode 4 (fallback) to maintain correct detection order; orchestrator delegates all analysis to voice-builder skill
- [Phase 10-writing-quality-v2]: Plan 10-01: craft-check.js uses path.dirname(path.dirname(resolve(chapterPath))) for project root resolution; works with relative or absolute fixture paths
- [Phase 10-writing-quality-v2]: Plan 10-01: Regression hash covers only the 5 captivation component bodies, not §4.5 aggregation, leaving Plan 6 free to extend aggregation without breaking the lock
- [Phase 10-writing-quality-v2]: Plan 10-01: Each known-bad fixture isolates a single failure; 13 node:test cases include explicit fails-only-X assertions to prevent cross-check bleed
- [Phase 10-writing-quality-v2]: Plan 10-02: bestseller-craft-rules.md is voice-agnostic single source of truth for CRAFT-01..08; writer and editor both read it to prevent Phase-7-style duplication drift
- [Phase 10-writing-quality-v2]: Plan 10-07: Subtractive audit pattern works — spiritual-default.md net -4 lines (123->119) with Reader Moments added and Theological Framework byte-preserved (sha256 lock verified)
- [Phase 10-writing-quality-v2]: Plan 10-03: Book DNA Chapter Map shifts from table to sub-list layout to accommodate central_image + vulnerability_beat_seed without column-width blowout
- [Phase 10-writing-quality-v2]: Plan 10-03: Writer cites full 25-term Greek/Hebrew lexicon inline so chapter-writer subagents don't need to cross-load craft-check.js
- [Phase 10-writing-quality-v2]: Plan 10-04: Editor Pass 1 gets deterministic craft-check.js at §2.0 + LLM judgment sub-sections §2.9-§2.12; craft_check field merged into VOICE AUDIT for Pass 2/CRAFT-16 reuse
- [Phase 10-writing-quality-v2]: Plan 10-04: Revision requests written to revisions/ch[NN]-request.md (stateless editor); CRAFT-15 stamp auto-fixed in place to preserve CRAFT-17 2-revision cap
- [Phase 10-writing-quality-v2]: Plan 10-05: Editor Pass 2 gets CRAFT-01 scene-first strictness inside §3.3 plus §3.7/3.8/3.9 flag-only audits; craft_pass2 block in VOICE AUDIT for CRAFT-16 reuse
- [Phase 10-writing-quality-v2]: Plan 10-08: Mode 6 aborts to Resume on non-affirmative; version stamp is line 2 beneath provenance in chapter drafts; editor auto-fixes stamp in place to preserve CRAFT-17 cap; formatter uses single regex for all HTML comment types
- [Phase 10-writing-quality-v2]: Plan 10-06: Rubric extended by appending 2 components (Craft Density, Cross-Chapter Craft); legacy 5-component sha256 lock from Plan 10-01 preserved via append-only edit
- [Phase 10-writing-quality-v2]: Plan 10-06: Cross-Chapter Craft is manuscript-level but stamped per-chapter so CRAFT-16 diagnostic reads don't need special-case logic
- [Phase 10-writing-quality-v2]: Plan 10-06: test-rubric-regression.js --extended flag keeps base run green for branches that haven't touched Plan 10-06
- [Phase 10-writing-quality-v2]: Plan 10-09: Bestseller Diagnostic is read-only assembly; strict divergent-improvement detection trips on ANY sub-component delta < 0; revision state stored in reports/revision-log.md surviving Resume but cleared by Fresh
- [Phase 11-distribution-packaging]: Plan 11-01: Tiny-book fixture seeded with captivation threshold 8; topic 'The 2am Prayer' chosen for deterministic CRAFT-01..08 coverage
- [Phase 11-distribution-packaging]: Plan 11-03: repository field uses string URL shape (Claude Code schema), not {type,url} npm shape; plugin.json keeps book-crafter-dev identity on disk while marketplace.json carries release identity book-crafter
- [Phase 11-distribution-packaging]: Plan 11-02: README uses lowercase gygundo in install block even though canonical repo owner is Gygundo — GitHub is case-insensitive, verify regex literal, no functional impact
- [Phase 11-distribution-packaging]: Plan 11-02: CHANGELOG [1.1.0] header format locked to '## [1.1.0] - 2026-04-15' for release.sh Gate 2 regex (^## \[1\.1\.0\])
- [Phase 11-distribution-packaging]: Plan 11-05: Sample skill owns the .docx output path override (fixtures/tiny-book/run/final/) via §3 invocation prompt; orchestrator stays unmodified
- [Phase 11-distribution-packaging]: Plan 11-05: Captivation primary source is consistency-report.md N/14; craft-check.js is degraded fallback only (5 of 14 components)
- [Phase 11-distribution-packaging]: Plan 11-04: cp -R drags .DS_Store stowaways; release.sh strips them post-copy via find -delete before Gate 4 to keep zip listings clean
- [Phase 13-repetition-and-novelty-enforcement]: Plan 13-03: Wave 0 test harness extensions written BEFORE production — 5 novelty tests in test-craft-check.js + 8 schema v2 structural assertions in test-rubric-regression.js --extended, deliberately RED until Plans 13-01/02/04/05 land (Nyquist contract)
- [Phase 13-repetition-and-novelty-enforcement]: Plan 13-03: Zero-dependency frontmatter assertions use string-match not YAML parser, matching the rest of the regression harness
- [Phase 13-repetition-and-novelty-enforcement]: Plan 13-04: schema_version 2 locked in references/captivation-rubric.md frontmatter as single source of captivation scoring; 8 components + binary novelty_dedup dimension + sample_gate threshold captivation_total_min: 10
- [Phase 13-repetition-and-novelty-enforcement]: Plan 13-04: regenerated rubric sha256 baseline matches Phase 10 hash byte-identically because all Phase 13 edits landed outside the 5 legacy component bodies; schema v2 structural assertions in --extended are the primary drift detector going forward
- [Phase 13-repetition-and-novelty-enforcement]: Plan 13-07: Writer Anti-Loop Clause lands between CRAFT-04 and §5 Voice Consistency, deliberately outside CRAFT-* numbering so Phase 10 legacy hash lock stays intact; Refrain Candidate Gate is a SECOND outliner gate (separate from outline approval), blocks book-dna.md emission until author confirms each candidate, with fixtures/tiny-book/ bypass detecting pre-populated refrain block
- [Phase 13-repetition-and-novelty-enforcement]: Plan 13-06: Editor emits single canonical schema v2 YAML block at column 0 (## Captivation Score); §4.4.5 hybrid deterministic + LLM novelty audit with rewrite_targets.yaml mirror for Mode 7; editor is judge not author; novelty_dedup fail is a hard gate, no soft-warn

### Roadmap Evolution

- Phase 7 added: Captivating writing, modern voice profile, and bestseller formatting
- Phase 8 added: Voice builder skill - analyse source content to generate custom voice profiles
- Phase 9 added: Wire sermon adapter output to outliner (v1.0 gap closure)
- Milestone v1.1 added: Phases 10, 11, 12 — Bestseller Quality + Distribution
- Phase 13 added: Repetition and novelty enforcement (cross-AI review of first real sample run — Codex + Gemini consensus that rubric rewards presence without penalising variation; ship canonical score + editor dedup audit + writer anti-loop + fixture rewrite)

### Pending Todos

- Discuss and plan Phase 10 (Writing Quality v2)
- At Phase 11 start: re-fetch Claude Code marketplace schema docs (PKG-10 gate)

### Blockers/Concerns

None yet. Phase 12 is a pre-declared gate, not a blocker.

## Session Continuity

Last session: 2026-04-15T21:10:17.032Z
Stopped at: Completed 13-07-PLAN.md
Resume file: None
