# Changelog

All notable changes to Book Crafter will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
