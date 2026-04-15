# Project Research Summary

**Project:** Book Crafter Plugin — Milestone v1.1 (Bestseller Quality + Distribution)
**Domain:** Claude Code plugin — second-pass writing quality + one-click distribution
**Researched:** 2026-04-15
**Confidence:** HIGH (stack and distribution verified against current official docs; craft rules MEDIUM — established principles, WebSearch unavailable for named-author re-verification)

---

## Executive Summary

Milestone v1.1 has two distinct goals: lift generated prose from "well-argued teaching" to "storytelling non-fiction", and package the plugin so a non-technical recipient can install it with two Claude Code commands. Research confirms both are achievable without new runtime dependencies. Writing Quality v2 is entirely model-driven — seven concrete, countable craft rules extracted from the Eternally Secure Ch1 evidence — and distribution is a straightforward GitHub-hosted marketplace using the existing repo. No new npm packages. No new infrastructure.

The single most important finding from the research is the Phase 7 post-mortem: Phase 7 verified *framework presence*, not *framework enforcement*. Rules were added but not made procedural, the rubric had no calibration anchors, and the voice profile grew additive instead of subtractive. v1.1's Writing Quality v2 must explicitly fix each of these three structural failures: convert aspirational guidance into countable procedures, anchor the captivation rubric to before/after exemplars from the actual Eternally Secure output, and remove v1 rules that are superseded by v2 replacements before adding new ones.

The research strongly supports three phases rather than two. Phase 10 (writing quality implementation), Phase 11 (distribution packaging), and Phase 12 (re-run verification gate and release) must be sequential and gated. Phase 11 packaging cannot claim "bestseller quality" in any public README without the evidence produced by Phase 12's Eternally Secure re-run. Phase 12 is not optional — it is the proof point for the entire milestone's premise.

---

## Critical Cross-Cutting Findings

These findings appeared across multiple research files and must shape REQUIREMENTS.md directly.

1. **"Claude Desktop" is the wrong term.** Plugins live in Claude Code (CLI/IDE), not the claude.ai Desktop chat app. No plugin installer exists in claude.ai. Milestone language must be updated to "Claude Code on the recipient's machine" everywhere — including acceptance criteria in REQUIREMENTS.md.

2. **Zip side-load does not exist.** The install path is `/plugin marketplace add encounter-church/book-crafter-plugin` then `/plugin install book-crafter@book-crafter-plugin` then `/reload-plugins`. This is the verified, two-command path. A zip artefact is a secondary build output only, not the primary distribution mechanism. REQUIREMENTS.md must not promise zip-based install as the primary flow.

3. **Phase 7 verified framework presence, not output quality.** Fourteen checks passed; all were string-match or structural checks. Zero verified that the model follows the rules during generation. v1.1's acceptance criteria must be based on observable before/after evidence from the Eternally Secure artefact, not string matches in skill files.

4. **Craft rules belong in a new standalone reference file.** The captivation rubric and tension-release framework are currently inline in editor and writer SKILL.md files — they are not standalone references as some prompts implied. The first task in Phase 10 must be extracting them before extending them.

5. **Rules must be countable, not aspirational.** TS-01 through TS-08 in FEATURES.md define the hard-number shape: max 3 Greek words per chapter, central image present in opening 200 words plus middle plus closing 200 words, at least one first-person confession per chapter in the middle third, etc. Every rule in REQUIREMENTS.md must include a detection criterion the editor can execute.

6. **Three phases, not two.** Phase 12 is a hard verification gate. Phase 11 cannot complete — and the release tag cannot be applied — until Phase 12 produces a seven-gap comparison file signed off by David.

7. **The re-run requires a `--fresh` mode.** The orchestrator must have a flag or mode that deletes `book-dna.md`, `chapter-outline.md`, `research/`, `drafts/`, `revisions/`, and `final/` before starting, preserving only `sources/`, `sources-adapted/`, and `brief.md`. Without it, the re-run measures caching, not improvement.

---

## Key Findings

### Recommended Stack

Writing Quality v2 introduces zero new npm dependencies. All seven craft improvements are model-driven inside existing skills and a new reference file. The stack is intentionally unchanged: Claude Code plugin system, docx-js 9.6.1 via Node >=18, Markdown intermediates, and the existing skills/agents architecture. This is a deliberate scope discipline — prose quality rules cannot be enforced by static analysers (they cannot detect pulpit rhythm), so adding write-good, textlint, or Flesch-Kincaid would fight the voice profile rather than help it.

For distribution, the only stack addition is a single new file: `.claude-plugin/marketplace.json`. The existing repo becomes a single-plugin marketplace by pointing `source: "./"` at itself with `strict: true`. The `plugin.json` version field is bumped to `1.1.0`. No separate marketplace repo. No release tooling beyond a bash smoke-test script.

**Core technologies:**
- Claude Code Plugin System (current): execution environment, skill discovery, subagent orchestration. No alternative for this use case.
- docx-js 9.6.1: .docx generation. Already on-system. Formatter skill only.
- Node.js >=18: runtime for docx. Already available. Must be documented as a prerequisite for recipients.
- Markdown (.md): all intermediate artefacts, craft rules reference, voice profile, Book DNA.
- `.claude-plugin/marketplace.json`: the single new file that unlocks `/plugin marketplace add` install. Schema verified from code.claude.com/docs/en/plugin-marketplaces, 2026-04-15.

### Expected Features

**Must have — Writing Quality v2 (Phase 10):**
- TS-01: Scene-first opener with named human, time-marker, and sensory detail. Flag and rewrite if absent.
- TS-02: Greek/Hebrew density cap — max 3 transliterated terms per chapter, each requiring at least 3 sentences of unpacking. Per-chapter density field set by outliner, not writer.
- TS-03: Central image architecture — one dominant image per chapter, present in opening 200 words, middle third, and closing 200 words.
- TS-04: Author vulnerability beat — one first-person confession per chapter, placed in the middle third, drawing from source material not fabricated. Outliner assigns per-chapter beat shape.
- TS-05: Pulpit-seam scrubber — ban list for chapter-opening and paragraph-start phrases ("So", "Now", "Let us", "Here's where", etc.). Every ban paired with a permitted-usage counter-example.
- TS-06: Reader-anchor specificity — at least two named, concrete reader-moments per chapter. Voice profile gains a Reader Moments list.
- TS-07: Psychological tension — reader-objection phrasing in writer prompt; at least two quoted or italicised reader-thought lines per chapter.
- TS-08: Show-don't-tell detector — concrete:abstract noun ratio at least 1:1 over any 4-paragraph window.
- DIFF-06: Bestseller diagnostic report — per-chapter matrix of TS-01..TS-08 pass/fail with line citations.
- DIFF-08: Bestseller calibration examples file — `references/bestseller-calibration.md` with paraphrased before/after paragraphs. Concrete examples outperform abstract rules.

**Must have — Distribution (Phase 11):**
- PKG-01..PKG-09: GitHub-hosted public repo, marketplace.json, plugin.json v1.1.0, recipient README with exact copy-paste install block, LICENSE, CHANGELOG, claude plugin validate clean pass, smoke-test checklist, plugin manifest metadata.
- PKG-DIFF-02: `/book-crafter:sample` — one-command demo that runs the full pipeline on a pre-canned brief.

**Defer to v1.2:**
- DIFF-01 Sentence-length variance targeting
- DIFF-02 Chapter ending echo
- DIFF-03 Dialogue breaks requirement
- DIFF-07 Targeted single-chapter rewrite mode
- PKG-DIFF-01 Pre-flight doctor skill
- Official Anthropic marketplace submission

### Architecture Approach

Writing Quality v2 touches exactly two skill files (writer and editor) and adds two new reference files. The orchestrator, outliner, sermon-adapter, enricher, formatter, and all agent definitions remain unchanged. This is the minimum viable footprint that delivers the seven craft improvements without destabilising the pipeline.

The architectural decision of highest consequence: craft rules go into a new standalone `references/bestseller-craft-rules.md`, read by both writer and editor at runtime. They do not go into the voice profile (which would bloat it and force every custom profile to carry universal rules), into Book DNA (which would blow chapter agents' context budget), or inline in the skill files (which would drift across two files). The voice profile stays about voice; the craft rules file stays about bestseller prose mechanics.

Before extending the captivation rubric, extract it. The rubric is currently scattered across four sections of `skills/editor/SKILL.md`. Extract it to `references/captivation-rubric.md` with no logic changes, verify scores are unchanged on existing output, then extend with two new components (craft density, cross-chapter craft) to produce a 7-component 0-14 scale.

**Major components and changes:**

1. `references/bestseller-craft-rules.md` — NEW. ~200 lines. Seven craft rules, overridable subset tagged for voice profiles. Read by writer at Step 2.5, by editor at Step 1.
2. `references/captivation-rubric.md` — NEW (extracted from editor inline sections). Extended to 7 components. Thresholds: 11-14 Captivating, 7-10 Acceptable, 4-6 Weak, 0-3 Significant issues.
3. `skills/writer/SKILL.md` — MODIFIED. Reads craft rules reference. Scene-first rule at section 3. Greek density cap at section 7. Anti-patterns list expanded at section 9.
4. `skills/editor/SKILL.md` — MODIFIED. Reads both new references. Three new Pass 1 sub-sections (craft density, tension-release detection, pulpit-seam detection). Two Pass 2 changes (scene-first strictness, cross-chapter craft). Captivation table extended to 7 components.
5. `.claude-plugin/marketplace.json` — NEW. Single-plugin marketplace pointing `source: "./"`. Enables `/plugin marketplace add encounter-church/book-crafter-plugin`.
6. `scripts/release.sh` and `fixtures/tiny-book/` — NEW. Release gate: version check, changelog check, smoke-test, whitelist-based zip with size and path checks.

**Unchanged:** orchestrator, outliner, sermon-adapter, enricher, formatter, all agent definitions, pipeline-stages.md (one-line Stage 4 update only).

### Critical Pitfalls

The research surfaced 23 numbered pitfalls plus a Phase 7 post-mortem. The highest-priority prevention tasks:

1. **Rule drift — voice profile becomes a kitchen sink.** Every v2 addition must pair with an explicit removal of the v1 rule it supersedes. Cap the voice profile at 150 lines. Track the kill list in the Phase 10 context file. Without this, the model averages competing signals and produces blandness.

2. **Phase 7 recurrence — aspirational instructions not enforced.** Every new craft rule must be procedural and countable. "Write the first 150 words. These words must contain zero scripture references, zero theological terms, and at least one sensory detail. If they fail, rewrite them." Goals are not instructions.

3. **Simulated scene-openers.** The writer agent, required to produce a scene opener with no grounded source material, will invent generic fiction. Every scene opener must cite a source file or book-dna line in a provenance comment. Editor verifies provenance and strips comments at finalise time. No provenance = flag.

4. **Stale Book DNA on re-run.** The orchestrator must have a `--fresh` flag. Version stamps on every generated artefact. The Eternally Secure re-run must use `--fresh`.

5. **Phase 11 ships without Phase 12 evidence.** The README must not claim "bestseller quality" until the seven-gap comparison file exists. Phase 12 produces that file. The release tag blocks on David's explicit sign-off.

6. **Evaluator deadlock — infinite revision loop.** Hard 2-revision cap per chapter. Divergent-improvement detection: if revision N scores lower on any sub-metric than revision N-1, accept N-1 and stop. Anchored rubric with specific exemplar paragraphs at score levels 3, 6, and 9.

7. **Zip ships hidden files.** Never `zip -r .`. Build script uses an explicit whitelist. Size check: fail if output exceeds 5MB. Build-time grep: fail if any shipped file contains `/Users/David`.

---

## Implications for Roadmap

Based on the combined research, the milestone requires three sequential phases, each gated on the previous.

### Phase 10: Writing Quality v2

**Rationale:** Foundation of the milestone. Converts Phase 7's aspirational framework into procedural, countable rules. Must complete before packaging so the packaged plugin is actually improved.

**Delivers:** Seven new craft rules enforced in writer and editor, extracted captivation rubric extended to 7 components, `--fresh` re-run mode, version stamps on all artefacts, voice profile audit with kill list.

**Implements:** TS-01..TS-08, DIFF-06 (diagnostic report), DIFF-08 (calibration examples file).

**Build order inside Phase 10:**
1. Extract captivation rubric (no logic change, regression test first)
2. Create `references/bestseller-craft-rules.md`
3. Update writer skill (preventive — cheaper to write right than fix later)
4. Update editor Pass 1 (new sub-sections, all flag-only, no auto-fail)
5. Update editor Pass 2 (scene-first strictness, cross-chapter craft)
6. Extend captivation rubric with components 6 and 7
7. Update pipeline-stages.md Stage 4 description
8. Audit and subtractive-edit spiritual-default.md voice profile
9. Add `--fresh` mode to orchestrator
10. Add version stamps to all generated artefacts

**Avoids:** Rule drift (Pitfall 1), aspirational instructions (Phase 7 root cause), simulated scene-openers (Pitfall 4), evaluator deadlock (Pitfall 6), stale Book DNA on re-run (Pitfall 10).

**Research flag:** No additional research needed. Architecture fully specified with section-level precision. Confidence HIGH.

### Phase 11: Distribution Packaging

**Rationale:** Packaging work is independent of prose quality mechanics. Phase 11 can begin once Phase 10 is merged, but the release tag cannot be applied until Phase 12 completes. Phase 11 delivers the distribution infrastructure; Phase 12 decides whether it ships.

**Delivers:** GitHub-hosted marketplace, marketplace.json, version-bumped plugin.json, recipient README, LICENSE, CHANGELOG, smoke-test script and fixture, release.sh with whitelist zip builder.

**Key tasks:**
1. Create `fixtures/tiny-book/` and integrate smoke-test into `scripts/release.sh` first
2. Create CHANGELOG.md, README.md, LICENSE
3. Create `.claude-plugin/marketplace.json` (verified schema, `source: "./"`, `strict: true`, no version field)
4. Bump `plugin.json` to `1.1.0` (version in plugin.json only)
5. Create `scripts/release.sh` — whitelist zip, version gate, changelog gate, size check, personal-path grep gate
6. Release dry-run: verify zip contents and size
7. Verify `claude plugin validate .` passes cleanly

**Re-verify at Phase 11 start:** fetch `code.claude.com/docs/en/plugins` and `plugin-marketplaces` on the day Phase 11 begins. The plugin spec is actively evolving; the schema verified 2026-04-15 should be re-checked before writing the actual marketplace.json.

**Avoids:** Zip ships hidden files (Pitfall 12), marketplace manifest schema drift (Pitfall 13), dev vs marketplace install collision (Pitfall 14), non-technical README (Pitfall 16), personal paths in shipped files (Pitfall 19), cross-platform path assumptions (Pitfall 20).

**Research flag:** No deeper research needed. Distribution mechanics fully verified. The one-day schema re-check at phase start is precautionary, not a research gap.

### Phase 12: Re-run + Release Gate

**Rationale:** This phase exists solely to prevent repeating Phase 7's mistake. The Eternally Secure re-run through the v1.1 pipeline is the proof that the rules work. No re-run, no release.

**Delivers:** Frozen before-sample, seven-gap comparison file, third-party review log, verified smoke-test on fresh install, finalized README language, signed release tag.

**Key tasks:**
1. Save frozen baseline `evidence/eternally-secure-ch1-before.md` (Phase 7 output, immutable)
2. Re-run Eternally Secure in `--fresh` mode
3. Produce seven-gap comparison file — scene, Greek density, vulnerability, central image, tension-release, reader anchor, pulpit seams — with before/after quoted paragraphs for each
4. Third-party pass: fresh Claude session reads both versions and ranks them, logged to `evidence/external-review.md`
5. Verify sermon-adapter artefacts unchanged: byte-diff `sources-adapted/` against pre-change baseline
6. Finalise README capability language against comparison evidence
7. Fresh-profile smoke-test install (uninstall dev, clear cache, install via marketplace flow, run test book, verify .docx)
8. David's explicit "ship / don't ship" call
9. Apply `git tag v1.1.0` and push

**Gate condition:** Phase 12 cannot mark verified until the comparison file has a row for all seven gap areas AND David's explicit sign-off exists. The release tag blocks on this gate.

**Avoids:** Skipping re-run (Pitfall 21), README overclaiming (Pitfall 22), smoke test skipped (Pitfall 23), unverifiable improvement (Pitfall 11).

**Research flag:** Phase 12 is a verification phase, not an implementation phase. No research needed.

### Phase Ordering Rationale

- Phase 10 implements the quality rules. Phase 11 packages the plugin. Phase 12 verifies and releases. This order cannot be inverted.
- Phase 10 and Phase 11 can overlap if desired (packaging infrastructure is independent of prose mechanics), but Phase 11 must be complete before Phase 12 begins.
- The Phase 12 gate is non-negotiable. Releasing without Phase 12 evidence is exactly Pitfall 21 and defeats the stated goal of evidence-driven improvement.
- The roadmapper must model Phase 12 sign-off as a blocking dependency on the release tag, not an optional quality check.

### Research Flags

Phases needing no additional research — all three phases have high-confidence, fully-specified implementation plans.

At Phase 11 start — re-verify the Claude Code marketplace schema against current docs on the day work begins. One document, five minutes, closes the schema-drift gap (Pitfall 13) before it can bite.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Distribution schema verified against official docs 2026-04-15. Zero new dependencies. Docx-js and Node patterns established from v1.0. |
| Features | MEDIUM-HIGH | Install UX features HIGH (verified against current docs). Craft rules MEDIUM — principles established across craft literature, named-author specifics not re-verified via web access this session. |
| Architecture | HIGH | All file paths verified against live repo files. Absence of supposed reference files confirmed by directory inspection. File-level change specifications with section references. |
| Pitfalls | HIGH | Drawn from Phase 7 post-mortem (local, authoritative), official plugin docs, and direct evidence from the Eternally Secure Ch1 output. Highest-quality pitfall source possible for this project. |

**Overall confidence: HIGH**

### Gaps to Address

- **Named-author craft claims (MEDIUM):** TS-01..TS-08 cite Lamott, King, Zinsser, Miller, Keller, Manning, Yancey, Nouwen, Eldredge, McKee. Attribution is training-data recall, not re-verified this session (WebSearch access was denied). Craft principles themselves are not in doubt. If REQUIREMENTS.md needs forensic citations, re-run FEATURES research with web access. Not blocking.

- **Windows compatibility (partially addressed):** Pitfall 20 flags cross-platform path assumptions. Research recommends no .sh files in the release whitelist and path abstraction in skill instructions. A Windows smoke-test is recommended but not yet scheduled. Add to Phase 12 checklist.

- **Plugin spec evolution (low risk, easy to close):** Re-verify marketplace schema at Phase 11 start. One doc-read closes this gap.

---

## Sources

### Primary (HIGH confidence)

- [Claude Code Plugins documentation](https://code.claude.com/docs/en/plugins) — manifest schema, `--plugin-dir`, ship checklist. Fetched 2026-04-15.
- [Claude Code Plugin Marketplaces documentation](https://code.claude.com/docs/en/plugin-marketplaces) — marketplace.json schema, relative-path source, strict mode, version-resolution warning. Fetched 2026-04-15.
- [Claude Code Discover Plugins documentation](https://code.claude.com/docs/en/discover-plugins) — end-user install flow, /plugin TUI, auto-update. Confirmed: no plugin installer in claude.ai Desktop.
- `skills/writer/SKILL.md` (352 lines, live repo, 2026-04-15) — tension-release architecture inline, not in standalone reference.
- `skills/editor/SKILL.md` (512 lines, live repo, 2026-04-15) — captivation rubric inline across four sections, not in standalone reference.
- `skills/orchestrator/SKILL.md` (751 lines, live repo, 2026-04-15) — stage flow, dashboard, state detection.
- `references/pipeline-stages.md` (147 lines, live repo, 2026-04-15) — stage descriptions.
- `.claude-plugin/plugin.json` (10 lines, live repo, 2026-04-15) — minimal manifest, missing homepage/license fields.
- `.planning/phases/07-*/07-VERIFICATION.md` — Phase 7 post-mortem. 14/14 string-match pass. Primary evidence of framework-presence vs. enforcement gap.
- David's docx skill (`~/.claude/skills/docx/SKILL.md`) — WidthType.DXA and LevelFormat.BULLET constraints.

### Secondary (MEDIUM confidence)

- Anne Lamott, *Bird by Bird* (Anchor, 1994) — scene-first concreteness (TS-01)
- Stephen King, *On Writing* (Scribner, 2000) — concrete noun dominance (TS-08)
- William Zinsser, *On Writing Well* (HarperCollins) — clutter removal, pulpit transitions (TS-05)
- Donald Miller, *Blue Like Jazz* (Thomas Nelson, 2003); *A Million Miles in a Thousand Years* (2009) — scene-first openers, specific place-names (TS-01, DIFF-05)
- Timothy Keller, *The Prodigal God* (Dutton, 2008) — central-image discipline (TS-03)
- Brennan Manning, *The Ragamuffin Gospel* (Multnomah, 1990) — author vulnerability as trust currency (TS-04)
- Philip Yancey, *What's So Amazing About Grace?* (Zondervan, 1997) — disciplined Greek/Hebrew density (TS-02)
- Henri Nouwen, *The Return of the Prodigal Son* (Doubleday, 1992) — surfacing unspoken reader objections (TS-07)
- John Eldredge, *Wild at Heart* (Thomas Nelson, 2001) — specific reader-moments (TS-06)
- Robert McKee, *Story* (Regan Books, 1997) — structural vs. psychological conflict (TS-07)
- StoryWriter: A Multi-Agent Framework for Long Story Generation (ACM, 2025) — parallel agent divergence patterns (Pitfall 5)

---

*Research completed: 2026-04-15*
*Ready for roadmap: yes*
*Three phases: Phase 10 (writing quality) → Phase 11 (packaging) → Phase 12 (re-run + release gate)*
