# Changelog

All notable changes to Book Crafter will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-07-03

### Added
- CRAFT-18 AI-slop scan: deterministic auto-revise gate blocking em dashes in author prose, negation-pivot overuse (cap 1 per chapter), 30-phrase AI-ism ban list (delve, furthermore, embark on, etc.), and emoji. Blockquote lines (scripture, reader-thought) are exempt. Mirrors DAG-09 from the sibling dag-book-crafter-plugin.
- `scripts/craft-check.js` — EM_DASH_RE, NEGATION_PIVOT_RES, SLOP_PHRASES/SLOP_RE, EMOJI_RE constants plus `checkCraft18()` with overlap-dedup pivot counting and `getBodyText`/`getAuthorProseText` helpers.
- 7 CRAFT-18 unit tests in `scripts/test-craft-check.js` covering all failure modes and exemptions.
- CRAFT-18 spec section in `references/bestseller-craft-rules.md` (rule summary, full section, Cross-Rule Integration update).
- CRAFT-18 AI-ism list and negation-pivot cap note in `references/voice-profiles/spiritual-default.md`.
- CRAFT-18 anti-pattern bullets in `skills/writer/SKILL.md` § 9.
- CRAFT-18 row in `skills/editor/SKILL.md` § 2.0 enforcement table.

### Changed
- `fixtures/phase10/known-good/ch01-draft.md` — replaced em dash in author prose with spaced hyphen (required for CRAFT-18 gate).
- `references/bestseller-calibration.md` — replaced em dash in Score Level 9 exemplar prose with spaced hyphen.

## [1.1.1] - 2026-04-17

### Added
- Novelty detection engine (`craft-check.js --novelty`) — deterministic Tier 1 (cross-chapter) and Tier 2 (enricher) rules catch repeated 6+ word spans, vulnerability-beat duplication, and metaphor-vehicle reuse
- Editor Pass 3 §4.4.5 Novelty and Dedup Audit — manuscript-level scan with structured `rewrite_targets.yaml` emit
- Captivation rubric v2: 8 components (0–16 scale) with new `novelty_variation` dimension
- Writer anti-loop clause: no 6+ word phrase reuse, spent vulnerability seeds, distinct motif vehicles per chapter
- Enricher anti-loop clause: foreword generation branch prevents verbatim copies from chapters
- Post-enricher novelty gate (orchestrator Stage 4.6) — catches overlaps after foreword generation
- Orchestrator Mode 7 (`--rewrite-targets`) — scoped re-run for novelty-flagged chapters only
- Adversarial test fixtures for Tier 1 and Tier 2 rule validation

### Changed
- Captivation rubric schema bumped to v2 (YAML frontmatter, 8 components, total range 0–16)
- Sample skill reads captivation score via structured YAML instead of prose grep
- Outliner gains refrain candidate gate with `max_uses` enforcement
- Tiny-book fixture rewritten from single repeated image to motif family with 3 distinct vehicles

## [1.1.0] - 2026-04-15

### Added
- Seven procedural craft rules (CRAFT-01..08) enforced by writer and editor — scene-first openers, Greek density cap, central image, vulnerability beat, pulpit-seam detection, reader moments, reader-thought lines, concrete:abstract ratio
- `references/bestseller-craft-rules.md` — voice-agnostic craft reference read by both writer and editor
- `references/bestseller-calibration.md` — paraphrased before/after exemplars at score levels 3, 6, 9
- Extended captivation rubric (7 components, 0–14 scale) with Craft Density and Cross-Chapter Craft components
- Orchestrator Mode 6 (Fresh Run) for clean re-runs — deletes prior artefacts while preserving sources
- Version stamps (`<!-- generated-by: book-crafter v1.1.0 -->`) on all generated artefacts
- Per-chapter bestseller diagnostic report appended to `consistency-report.md`
- Two-revision cap per chapter with divergent-improvement detection
- `/book-crafter:sample` skill — one-command end-to-end demo on the built-in fixture
- `fixtures/tiny-book/` — 3-chapter smoke-test fixture (*The 2am Prayer*)
- `.claude-plugin/marketplace.json` — single-plugin marketplace for one-click install via `/plugin marketplace add gygundo/book-crafter-plugin`
- Plugin manifest metadata: `homepage`, `repository`, `license`, expanded `author`
- `scripts/release.sh` — whitelist-based release builder with version, CHANGELOG, size, and personal-path gates
- `README.md`, `LICENSE` (MIT), `CHANGELOG.md`
- Voice profile subtractive audit — `spiritual-default.md` capped at 150 lines with committed kill list

### Changed
- Voice profile rewritten: new *Reader Moments* section, v2 craft additions each paired with a v1 removal
- Writer skill: scene-first openers with provenance comments citing source or Book DNA line
- Editor skill: Pass 1 invokes `craft-check.js`; Pass 2 enforces scene-first strictness + cross-chapter craft audit
- Orchestrator: Mode 6 (Fresh Run) added alongside existing modes

## [1.0.0] - 2026-03-27

### Added
- Initial release
- Plugin foundation: master orchestrator, skills directory, chapter-writer and chapter-editor subagents
- Voice system with theological/spiritual default profile + custom profile support
- Book outliner with two-mode generation (from topic or from source content)
- Researcher: per-chapter research artefacts with scripture, word studies, cross-references
- Parallel chapter writer with wave batching (4–6 concurrent agents)
- Editor: three-pass pipeline (voice consistency, flow/transitions, cross-chapter validation)
- Formatter: professional `.docx` output with front matter, back matter, TOC, page numbers
- Sermon adapter for sermon-to-book conversion
- Enricher: discussion questions, chapter summaries, prayer points, foreword
- Voice builder skill for generating custom profiles from source content
