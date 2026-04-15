# Phase 10: Writing Quality v2 — Research

**Researched:** 2026-04-15
**Domain:** Procedural craft enforcement for LLM-generated book chapters (deterministic node checker + LLM judgment in editor)
**Confidence:** HIGH (all findings verified against existing repo files — this phase modifies existing code, so source-of-truth is the actual `skills/*/SKILL.md` and `references/*.md` already in the repo)

## Summary

Phase 10 layers seven procedural, countable craft rules (CRAFT-01..08) on top of the Phase 7 framework, extracts and extends the captivation rubric (CRAFT-09/10), publishes a voice-agnostic craft reference (CRAFT-11), ships a calibration exemplar file (CRAFT-12), subtractively audits the voice profile (CRAFT-13), adds `--fresh` mode and version stamps to the orchestrator (CRAFT-14/15), emits a per-chapter diagnostic report (CRAFT-16), and caps revisions at two with divergent-improvement detection (CRAFT-17). The architecture is locked by CONTEXT.md: a **hybrid enforcement model** where `scripts/craft-check.js` (pure-node, zero deps) handles deterministic checks and the editor LLM handles judgment checks. Outliner is also modified to assign a `central_image` and `vulnerability_beat_seed` per chapter, which writer then treats as constraints.

The Phase 7 failure mode this phase prevents: framework *presence* was verified without verifying output *quality*. Phase 10's verification must therefore be observable in generated prose and backed by a regression harness that proves (a) rubric extraction is score-identical and (b) craft-check rules produce deterministic pass/fail on known-good and known-bad fixtures.

**Primary recommendation:** Build craft-check.js FIRST (before updating writer/editor), because both skills will reference its JSON contract. Then extract the rubric (pure copy, no semantics change, regression-locked), then publish `bestseller-craft-rules.md`, then update writer/editor/outliner in parallel. Subtractive voice-profile audit runs in parallel with rule additions — kill list committed before any plan marks complete.

## User Constraints (from CONTEXT.md)

### Locked Decisions

**Enforcement Mechanism (CRAFT-01..08 checking)**
- **D-01:** Hybrid enforcement — `scripts/craft-check.js` (deterministic checker, node) + editor LLM judgment on top.
- **D-02:** Script lives at `scripts/craft-check.js` in the plugin root. Editor skill invokes it via Bash at the start of Pass 1 for each chapter, reads JSON output, then performs LLM judgment for craft rules that cannot be scripted.
- **D-03:** Script covers (deterministic): CRAFT-01 provenance comment presence, CRAFT-02 Greek/Hebrew term count + unpacking-sentence count, CRAFT-05 pulpit-seam phrase scan at chapter/paragraph starts, CRAFT-07 reader-thought line count (regex on italics/blockquote), CRAFT-15 version stamp presence. JSON output: `{chapter_id, checks: {CRAFT-XX: {pass, evidence, citations}}}`.
- **D-04:** Editor LLM handles (judgment): CRAFT-01 scene quality beyond presence (named human + time-marker + sensory detail), CRAFT-03 central-image dominance across opening/middle/closing, CRAFT-04 vulnerability-beat authenticity, CRAFT-06 reader-moment concreteness, CRAFT-08 concrete:abstract noun ratio over 4-paragraph windows.
- **D-05:** craft-check.js is reusable: orchestrator's CRAFT-16 diagnostic step invokes the same script against edited chapters to produce the final pass/fail matrix.

**Revision Trigger Policy (CRAFT-17 interaction)**
- **D-06:** Auto-revise on fail (hard gates): CRAFT-01 (scene-first missing/malformed), CRAFT-02 (Greek density over cap), CRAFT-05 (pulpit-seam at chapter or paragraph start). Writer asked to rewrite only failing section where possible; if rewrite scope is structural, full chapter revision.
- **D-07:** Flag-only in diagnostic report (no auto-rewrite): CRAFT-03, CRAFT-04, CRAFT-06, CRAFT-07, CRAFT-08. Rationale: forcing rewrites on judgment calls risks the divergent-improvement failure mode.
- **D-08:** 2-revision cap from CRAFT-17 applies. On exhaustion, keep the highest-scoring revision by captivation rubric total, append a flag, continue pipeline. User sees all flags at the Stage 4 review gate.
- **D-09:** Divergent-improvement detection: if revision N scores lower than revision N-1 on any sub-metric, accept N-1 and stop.

**Outliner Touch (central image + vulnerability beat assignment)**
- **D-10:** Outliner IS modified in Phase 10 — research SUMMARY.md's "outliner unchanged" claim is superseded.
- **D-11:** Outliner gains two new per-chapter fields: `central_image` (string) and `vulnerability_beat_seed` (string — pointer to source file line, voice-profile anecdote, or Book-DNA fragment).
- **D-12:** Writer reads both fields as constraints, not suggestions. `vulnerability_beat_seed` must resolve to real source material — fabricated vulnerability is a CRAFT-04 fail.
- **D-13:** Outliner must ensure `central_image` values are distinct across chapters. Cross-chapter image coordination happens in outliner, not writer.

**Voice Profile: Reader Moments Section (CRAFT-06)**
- **D-14:** spiritual-default.md MUST ship with a `Reader Moments` section — ≥12 concrete reader-life moments. Writer selects ≥2 per chapter.
- **D-15:** voice-builder skill MUST extract/synthesise a Reader Moments section from analysed source material.
- **D-16:** User-supplied custom voice profiles MAY omit the section. When absent, editor runs CRAFT-06 in flag-only mode. voice-profile-spec.md documents the section as recommended, not mandatory.

**Kill List Tracking (CRAFT-13)**
- **D-17:** Subtractive voice-profile kill list tracked inline in `10-CONTEXT.md` under `<kill_list>`.
- **D-18:** spiritual-default.md capped at 150 lines total. Every v2 addition paired with documented v1 removal. Net-zero-or-negative line count change.

**Provenance Comment Syntax (CRAFT-01)**
- **D-19:** Writer emits HTML comment as first line of each chapter: `<!-- provenance: sources/{file}.md:{line} -->` OR `<!-- provenance: book-dna.md:{line} -->`.
- **D-20:** craft-check.js verifies presence and referenced path exists (resolution only, not semantic validation).
- **D-21:** Formatter strips ALL HTML comments before .docx emission. Editor passes leave comments intact.
- **D-22:** Missing provenance = CRAFT-01 hard fail = auto-revise.

**Diagnostic Report Shape (CRAFT-16)**
- **D-23:** Per-chapter CRAFT-01..08 pass/fail matrix appended to `consistency-report.md` as new section `## Bestseller Diagnostic`. Markdown table: `Check | Pass/Fail | Evidence | Line`. Citations use `chapter:line` format.

### Claude's Discretion

- Exact JSON schema for craft-check.js output (must match D-03/D-04 split)
- Internal organisation of `bestseller-craft-rules.md` (≤200 lines per CRAFT-11, voice-agnostic)
- Exact layout of calibration before/after paragraphs at score levels 3/6/9 anchored to paraphrased Eternally Secure Ch1 output
- Extended captivation-rubric.md component weighting (must stay 0-14 total per CRAFT-10)
- Orchestrator `--fresh` flag surface (CLI arg vs mode; delete-list already locked by CRAFT-14)
- Version stamp format — HTML comment `<!-- generated-by: book-crafter v1.1.0 -->` consistent with D-19 provenance syntax (stripped by formatter at same stage)

### Deferred Ideas (OUT OF SCOPE)

- DIFF-01: Sentence-length variance targeting — judgement-heavy, deferred to v1.2
- DIFF-02: Chapter ending echo pattern — v1.2 after calibration exemplars exist
- DIFF-03: Dialogue breaks requirement — genre-specific, belongs in non-theological profiles later
- DIFF-07: Targeted single-chapter rewrite mode — nice-to-have, not on critical path
- New npm runtime dependencies (hard ban — craft-check.js MUST be pure-node-stdlib)
- LLM-as-quality-judge scoring (rewards blandness — explicitly banned in REQUIREMENTS §"Out of Scope v1.1")
- Prose linters (write-good, textlint, retext — cannot detect pulpit rhythm)

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CRAFT-01 | Scene-first opener + provenance comment in first 150 words | Provenance detection: § "Provenance Comment Format" below. Scene quality = LLM judgment in editor. |
| CRAFT-02 | ≤3 transliterated Greek/Hebrew terms per chapter, ≥3 sentences unpacking each | Deterministic: Greek-term detector § "Countable Rule Specifications" (fixed term lexicon + unpacking-window counter). |
| CRAFT-03 | Central image in opening 200 words, middle third, closing 200 words | Outliner assigns (D-11); writer threads; editor LLM judges presence in all three zones. |
| CRAFT-04 | First-person vulnerability beat in middle third, sourced not fabricated | Writer reads `vulnerability_beat_seed` (D-12); craft-check.js verifies first-person markers in middle third; LLM judges authenticity/sourcing. |
| CRAFT-05 | No pulpit-seam phrases at chapter/paragraph starts | Deterministic: regex lexicon (ban list from FEATURES.md TS-05). Auto-revise (D-06). |
| CRAFT-06 | ≥2 concrete reader-moments per chapter, sourced from voice profile Reader Moments section | Voice profile has new section (D-14); writer selects; LLM judges concreteness. Flag-only if section absent (D-16). |
| CRAFT-07 | ≥2 quoted/italicised reader-thought lines per chapter | Deterministic: regex for italics or blockquote containing reader-voice markers (*"But what if..."*, *"If this is true, why..."*). |
| CRAFT-08 | Concrete:abstract noun ratio ≥1:1 over any 4-paragraph window | LLM judgment with noun lexicons (abstract-spiritual list + concrete-object list from FEATURES.md TS-08). |
| CRAFT-09 | Extract captivation rubric to `references/captivation-rubric.md`, regression-check scores unchanged | Pure copy extraction — see § "Captivation Rubric Current Location" for line ranges. |
| CRAFT-10 | Extend rubric from 5 components (0-10) to 7 components (0-14), add Craft Density + Cross-Chapter Craft | Extension work happens AFTER regression lock on extract. Components scored 0-2 each. |
| CRAFT-11 | `references/bestseller-craft-rules.md`, voice-agnostic, ≤200 lines | New file. Read by writer and editor. Content = TS-01..TS-08 distilled into procedural rules without theological framing. |
| CRAFT-12 | `references/bestseller-calibration.md` with before/after at score levels 3/6/9 | New file. Paraphrased (never copyrighted) before/after paragraphs anchored to Eternally Secure Ch1. |
| CRAFT-13 | Voice profile subtractively audited, ≤150 lines, kill list committed | Current spiritual-default.md is 123 lines (see § "Voice Profile Current State"). |
| CRAFT-14 | Orchestrator `--fresh` mode deletes listed dirs, preserves sources/, sources-adapted/, brief.md, voice-profile.md | New mode in § 6 of orchestrator SKILL.md. |
| CRAFT-15 | Version stamp on all generated artefacts | HTML comment `<!-- generated-by: book-crafter v1.1.0 -->`. Stamped at each stage's emission point. |
| CRAFT-16 | Per-chapter bestseller diagnostic in consistency-report.md | See § "Diagnostic Report Schema" below. |
| CRAFT-17 | Hard 2-revision cap + divergent-improvement detection | Orchestrator revision loop tracks revision count + per-component scores. |

## Project Constraints (from CLAUDE.md)

- Plugin format — must follow Claude Code plugin conventions; skills namespaced `book-crafter:*`.
- Cross-surface compatibility — no CLI-only dependencies. craft-check.js runs via `node` in Bash, which all Claude Code surfaces support.
- Theological accuracy — spiritual-default.md's Theological Framework section is byte-preserved during subtractive audit (Phase 7 VERIFICATION confirmed this as hard constraint).
- Voice consistency — all chapter agents must read same source-of-truth. Reference-file indirection (`references/*.md`) is the established pattern; Phase 10 extends it cleanly.
- GSD workflow enforcement — file edits must go through GSD commands.
- Zero new npm dependencies — craft-check.js pure-node-stdlib only.

## Research Questions Answered

### Q1: Where exactly does the captivation rubric currently live in the editor skill?

**File:** `skills/editor/SKILL.md` (511 lines)

**Inline rubric components are distributed across three Pass sections:**

| Component | Section | Lines | What it measures |
|---|---|---|---|
| Pacing Variety Score | 2.4 | ~121-135 | Paragraph length distribution, 0-2 points |
| Emotional Connection Audit | 2.5 | ~137-152 | Personal stories/vulnerability markers, 0-2 points |
| Reader Engagement Scoring | 2.5.5 | ~154-165 | "you"/rhetorical questions/direct address, 0-2 points |
| Opening Engagement Check | 3.3 | ~243-256 | Story/scene in first 200 words, 0-2 points |
| Chapter-Ending Momentum Check | 3.4 | ~258-272 | Cliffhanger seed or reflective hook, 0-2 points |
| **Rubric aggregation/thresholds** | 4.5 (consistency report template) | ~360-383 | Component table, threshold table, momentum-aware threshold |
| **Score appears in output** | 2.8 VOICE AUDIT block | ~192-209 | `captivation_score: [1-10]` field |

**Extract plan for CRAFT-09 (regression-locked):** Create `references/captivation-rubric.md` containing:
1. The 5-component table (from Section 4.5 lines ~366-374)
2. The threshold table (lines ~376-383)
3. Detection approaches for each of the 5 components (copied verbatim from §§ 2.4, 2.5, 2.5.5, 3.3, 3.4)
4. Scoring math (sum 0-2 per component = 0-10 total)

**Editor skill then replaces the detailed rubric instructions in §§ 2.4, 2.5, 2.5.5, 3.3, 3.4 with:** "Apply the [Component Name] check as defined in `${CLAUDE_PLUGIN_ROOT}/references/captivation-rubric.md`." (Keep the section headings and scoring invocation — only the measurement details move.)

**Regression test (CRAFT-09):** Run editor Pass 1 + Pass 2 on a known fixture chapter pre-extract and post-extract, diff the `captivation_score` field in both VOICE AUDIT blocks. Must be byte-identical.

### Q2: What is the current writer skill's chapter-generation instruction structure?

**File:** `skills/writer/SKILL.md` (351 lines)

**Section map and where Phase 10 additions land:**

| Section | Lines | Current Purpose | Phase 10 Insertion |
|---|---|---|---|
| 1. On Invocation | 12-61 | Read Book DNA, voice profile, outline, research | Add step to read new `central_image` + `vulnerability_beat_seed` from chapter outline |
| 2. Word Count Targets | 63-74 | Target word count math | No change |
| 3. Hook Strategies | 76-108 | Story-first hook framing (4 hook types) | **CRAFT-01 insertion:** Add "Scene-First Opener Requirements" subsection mandating named human + time-marker + sensory detail in first 150 words, plus provenance comment as first line of chapter. New sub-rule: cite source (`sources/` or `book-dna.md`) by file:line. |
| 4. Chapter Structure (tension-release) | 110-146 | 2-3 tension-release cycles | **CRAFT-03 insertion:** "Central Image Discipline" — thread `central_image` from outline into opening 200 words, middle-third, closing 200 words. **CRAFT-04 insertion:** "Vulnerability Beat" — place one first-person confession in middle third, sourced from `vulnerability_beat_seed`. |
| 5. Voice Consistency | 148-189 | Mandatory voice rules + calibration examples | Reference `bestseller-craft-rules.md`. Add bullet linking to `bestseller-calibration.md`. |
| 6. Momentum-Aware Pacing | 191-213 | Per-momentum-position pacing + reader engagement | **CRAFT-06 insertion:** "Reader Moments" sub-rule — select ≥2 from voice profile's Reader Moments section per chapter. Cite which ones chosen in metadata. |
| 7. Theological Depth | 216-254 | Greek word studies, cross-references | **CRAFT-02 insertion:** Hard cap. "Maximum 3 transliterated Greek/Hebrew terms per chapter. Each must get ≥3 sentences of unpacking." Link to craft-check.js rule. |
| 7.5. Scripture Formatting | 256-281 | Block-quote markdown convention | No change |
| 7.6. Pull Quote Marking | 283-306 | :::pullquote directive | No change |
| 8. Output Format | 308-338 | METADATA block | **CRAFT-15 insertion:** Version stamp as first line after provenance (or merged). **New METADATA fields:** `central_image`, `vulnerability_beat`, `reader_moments_used`. |
| 9. Anti-Patterns | 340-351 | What NOT to do | **CRAFT-05 insertion:** Add "No pulpit-seam phrases at chapter/paragraph starts" referencing banned list. |

**Critical:** All insertions are additive into existing sections — no structural reorganisation. Writer skill grows from 351 to ~450 lines estimated.

### Q3: Voice profile current structure and line count

**File:** `references/voice-profiles/spiritual-default.md` (123 lines)

**Section-by-section line count:**

| Section | Lines | Line Count |
|---|---|---|
| Header + preamble | 1-5 | 5 |
| Tone | 7-9 | 3 |
| Sentence Patterns | 11-20 | 10 |
| Vocabulary (Use + Avoid) | 22-47 | 26 |
| Emphasis Techniques | 49-59 | 11 |
| Anti-Patterns | 61-71 | 11 |
| Theological Framework (BYTE-PRESERVED per Phase 7) | 73-83 | 11 |
| Scripture Handling | 85-97 | 13 |
| Calibration Examples | 99-123 | 25 |
| **Total** | | **123** |

**Budget for Phase 10:** 150 lines cap = **27 lines headroom** for new Reader Moments section (D-14 requires ≥12 items).

**Subtractive audit targets (CRAFT-13 kill list candidates — NOT DECISIONS, suggestions for Plan 7):**
- Vocabulary > Avoid: 14 bullets. Some duplicate Anti-Patterns (e.g., "let me explain", "it is important to note"). Consolidation candidate: ~5 lines recoverable.
- Calibration Examples: 25 lines containing 3 long examples. If calibration moves to `bestseller-calibration.md` (CRAFT-12), voice profile can keep 1 compact example: ~15 lines recoverable.
- Emphasis Techniques: some overlap with Sentence Patterns and Scripture Handling: ~3 lines recoverable.

**Minimum Reader Moments section budget:** 12 items × 1 line each + 3 lines heading/intro = 15 lines. Subtraction must yield ≥15 recoverable lines.

**HARD CONSTRAINT:** Theological Framework (lines 73-83, 11 lines) is byte-preserved per Phase 7 lock. Cannot be touched.

### Q4: How does the editor currently split Pass 1 vs Pass 2?

**Pass 1 (Section 2, lines 66-215)** — per-chapter, parallel-safe, runs via chapter-editor subagents for 16+ chapters:
- 2.1 Vocabulary Audit
- 2.2 Sentence Length Distribution
- 2.3 Anti-Pattern Detection
- 2.4 Pacing Variety Score (captivation component)
- 2.5 Emotional Connection Audit (captivation component)
- 2.5.5 Reader Engagement Scoring (captivation component)
- 2.6 Tone Normalisation (rewrites based on flags)
- 2.7 Theological Guardrail Check
- 2.8 Pass 1 Output (writes `edited/ch[NN]-pass1.md` + VOICE AUDIT metadata)

**Pass 2 (Section 3, lines 216-296)** — sequential by chapter pair, modifies only final/first 2-3 paragraphs:
- 3.1 Read Transition Zone
- 3.2 Evaluate Transition Quality
- 3.3 Opening Engagement Check (captivation component — story/scene in first 200 words)
- 3.4 Chapter-Ending Momentum Check (captivation component)
- 3.5 Rewrite Transitions
- 3.6 Pass 2 Output

**Pass 3 (Section 4, lines 298-411)** — global cross-chapter:
- 4.1 Term Index
- 4.2 Reference Validation
- 4.3 Scripture Consistency
- 4.4 Theme Tracking
- 4.5 Pass 3 Output (writes `reports/consistency-report.md`)

**Phase 10 insertion map:**

| CRAFT | Pass | New sub-section | Mode |
|---|---|---|---|
| CRAFT-02 Greek density | 1 | **2.9 Craft Density Check** | Deterministic (craft-check.js) + LLM judgment on unpacking sufficiency |
| CRAFT-05 Pulpit seam | 1 | **2.10 Pulpit Seam Detection** | Deterministic regex; auto-revise trigger |
| CRAFT-07 Reader-thought lines | 1 | **2.11 Tension-Release Enforcement** | Deterministic regex on italics/blockquote with reader-voice markers |
| CRAFT-01 Scene-first strictness | 2 | **3.3 (extended)** | Deterministic (provenance) + LLM judgment (named human + time + sensory). Auto-revise on fail. |
| CRAFT-03 Central image | 2 | **3.7 Central Image Audit** | LLM judgment (presence in 3 zones). Flag-only. |
| CRAFT-04 Vulnerability | 2 | **3.8 Vulnerability Beat Audit** | LLM judgment + `vulnerability_beat_seed` resolution. Flag-only. |
| CRAFT-06 Reader moments | 2 | **3.9 Reader Moment Audit** | LLM judgment against voice profile Reader Moments list. Flag-only (or skip if absent — D-16). |
| CRAFT-08 Concrete:abstract ratio | 2 | **3.10 Show-Don't-Tell Audit** | LLM judgment over 4-paragraph windows. Flag-only. |
| CRAFT-16 Diagnostic report | 3 | **4.6 Bestseller Diagnostic Assembly** | Invoke craft-check.js on each edited chapter, assemble matrix, append to consistency-report.md |

**Wiring Principle (matches CONTEXT.md integration notes):** Pass 1 INVOKES craft-check.js at the start via Bash: `node ${CLAUDE_PLUGIN_ROOT}/scripts/craft-check.js [chapter-path]`. Parses JSON. Merges into existing `<!-- VOICE AUDIT -->` block.

### Q5: How are generated artefacts currently written?

**File discovery (grep for "Write" tool calls and `reports/`/`edited/`/`drafts/` paths):**

| Artefact | Created by | Section |
|---|---|---|
| `chapter-outline.md` | outliner skill | outliner §5 |
| `book-dna.md` | outliner skill (§6) | outliner |
| `research/ch[NN]-research.md` | researcher skill | researcher |
| `drafts/ch[NN]-draft.md` | chapter-writer subagent via writer skill | writer §8 |
| `edited/ch[NN]-pass1.md` / `-pass2.md` / `-final.md` | editor skill | editor §§2.8, 3.6, 4.5 |
| `reports/consistency-report.md` | editor skill | editor §4.5 (lines ~351-411) |
| `reports/flow-report.md` | editor skill | editor §3.6 |
| `enrichments/ch[NN]-enrichments.md` | enricher skill | enricher |
| `front-matter/foreword.md` | enricher skill | enricher |
| `output/[Book Title].docx` | formatter skill | formatter |

**Version stamp insertion strategy (CRAFT-15):** Each write site emits `<!-- generated-by: book-crafter v1.1.0 -->` as the first line of the file (OR second line, if provenance comment comes first). The stamp is:
- Written by each skill at its emission point.
- Stripped by the formatter at .docx generation (already stripping HTML comments per D-21).
- Verified by craft-check.js for drafts (CRAFT-15 listed in deterministic checks per D-03).

**Diagnostic report wiring (CRAFT-16):** `reports/consistency-report.md` already has a defined structure with `## Voice Consistency (Pass 1)`, `## Flow and Transitions (Pass 2)`, `## Cross-Chapter Consistency (Pass 3)`, `## Unresolved Issues`. New section `## Bestseller Diagnostic` appends at end (or before "Unresolved Issues" — planner decides). Table schema locked by D-23.

### Q6: How does the orchestrator currently handle existing output?

**File:** `skills/orchestrator/SKILL.md` (750 lines)

**Current state detection (Section 3, lines 156-222):** Works backwards from `output/*.docx` → `enrichments/` → `edited/` → `drafts/` → `research/` → `chapter-outline.md` → `sources-adapted/`. Detects partial completion within each stage.

**`--fresh` mode insertion point (CRAFT-14):**

The simplest wiring is to intercept at **Section 5 Step 1** ("Identify the Next Stage") with a `--fresh` check that runs BEFORE detection. Proposed location: new **Section 5.0 Fresh Mode Preprocessing** (runs only when `--fresh` flag is set on orchestrator invocation).

**Delete list (LOCKED by CRAFT-14):**
```
[project]/book-dna.md
[project]/chapter-outline.md
[project]/research/
[project]/drafts/
[project]/edited/
[project]/revisions/
[project]/enrichments/
[project]/front-matter/
[project]/reports/
[project]/output/
```

**Preserve list (LOCKED by CRAFT-14):**
```
[project]/sources/
[project]/sources-adapted/
[project]/brief.md   (if present)
[project]/voice-profile.md
```

**Flag surface (Claude's Discretion):** Since orchestrator is invoked via Claude Code skill activation, "--fresh" is not a literal CLI arg. Realistic options:
1. **User intent parsing:** "start fresh", "rerun from scratch", "fresh build" in user utterance → orchestrator detects and runs fresh preprocessing.
2. **Execution Mode 6 (Fresh):** Add as a 6th mode in §6 Execution Modes. Triggered by the same keywords.
3. **Project-directory marker:** User places empty file `.fresh` in project dir → orchestrator picks it up on next invocation. Less user-friendly.

**Recommendation:** Option 2 (Mode 6: Fresh Run) — consistent with existing modes (Guided/Full/Resume/Status/Revision). Trigger phrases: "start fresh", "rerun from scratch", "fresh build", "regenerate everything", "--fresh".

**Critical safety rule (prevent Pitfall 10):** Before deleting, orchestrator MUST confirm with user: "Fresh mode will delete [list N directories/files] in [project path]. Preserved: sources, voice-profile.md, brief.md. Proceed? (yes/no)". No silent delete.

**Version stamp wiring (CRAFT-15):** Orchestrator does NOT stamp directly. Each skill stamps its own output. Orchestrator only verifies stamps exist during post-stage verification steps.

### Q7: Provenance comment format (procedurally checkable)

**LOCKED by D-19/D-20/D-22:**

```
<!-- provenance: sources/{file}.md:{line} -->
```
OR
```
<!-- provenance: book-dna.md:{line} -->
```
OR
```
<!-- provenance: voice-profile.md:{line} -->
```
OR
```
<!-- provenance: sources-adapted/{file}.md:{line} -->
```

**Must be FIRST line of chapter draft** (before version stamp, or merged with it — planner decides).

**craft-check.js regex (proposed):**
```javascript
/^<!-- provenance: (sources|sources-adapted|book-dna\.md|voice-profile\.md)[^:]*:\d+ -->$/m
```

**Resolution check:** Parse path, split file:line, resolve relative to project dir, `fs.existsSync(path)` + `fs.readFileSync(path).split('\n').length >= lineNumber`. No semantic validation — only "referenced line exists".

**Interaction with version stamp (D-23 + CRAFT-15):** Two HTML comments on first two lines:
```markdown
<!-- provenance: sources/sermon-2024-03-15.md:42 -->
<!-- generated-by: book-crafter v1.1.0 -->
# Chapter 3: The Drowning Man
```
Formatter strips both when converting to .docx (D-21).

### Q8: Countable procedural rules — proposed thresholds and detection regex

#### CRAFT-01 Scene-first opener (provenance = deterministic; scene quality = LLM)

- **Deterministic (craft-check.js):** First line matches provenance regex; resolved path exists.
- **LLM judgment (editor Pass 2 §3.3 extended):** First 150 words (count via whitespace split) must contain:
  1. A proper noun (person) OR first-person "I"/"me"/"my" narrator
  2. A time-marker phrase (see regex below)
  3. A sensory/physical detail (see regex below)

**Time-marker regex (loose match — used for LLM guidance, not strict gate):**
```
/\b(at (2|3|4|5|6|7|8|9|10|11|12) ?(am|pm|o'clock)|last (Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Monday|week|month|year|summer|winter|spring|autumn|fall)|the (morning|night|evening|afternoon) (I|he|she|we|they)|the (summer|winter|spring|autumn|fall) (I|he|she|we|they)|when I was \d+|(\d+ years ago))\b/i
```

**Sensory-detail hint (used by LLM as "at least one of"):**
Light ("sunlight", "streetlight", "dim", "bright"), sound ("hum", "click", "silence", "rustle"), texture ("cold", "damp", "rough"), smell ("coffee", "rain", "smoke"), specific object ("chair", "phone", "coffee cup", "window", "door", "car").

#### CRAFT-02 Greek/Hebrew density cap (deterministic)

**Term lexicon (seed — planner expands):** `charis`, `agape`, `phileo`, `eros`, `storge`, `dunamis`, `exousia`, `logos`, `rhema`, `pneuma`, `sarx`, `kairos`, `chronos`, `sunergeo`, `pas`, `shalom`, `hesed`, `chesed`, `ruach`, `yada`, `ahavah`, `tzedakah`, `teshuvah`, `tikkun`, `nephesh`, `chayah`, `echad`.

**Detection:**
```javascript
// Count distinct transliterated terms (italicised OR standalone)
const terms = ['charis', 'agape', /* ... */];
const regex = new RegExp(`\\b(?:\\*)?(${terms.join('|')})(?:\\*)?\\b`, 'gi');
const matches = [...content.matchAll(regex)];
const distinct = new Set(matches.map(m => m[1].toLowerCase()));
const termCount = distinct.size;
// CRAFT-02 rule: distinct <= 3
```

**Unpacking check (deterministic approximation):** For each matched term, find sentence containing it, count sentences in same paragraph AFTER that sentence containing contextual markers ("means", "carries", "literally", "in Greek", "the word", "this is", "it's"). Require ≥3 unpacking sentences.

**Fail modes:**
- `distinct > 3` → auto-revise (D-06)
- `distinct <= 3` but any term has < 3 unpacking sentences → flag (LLM judgment on adequacy)

#### CRAFT-05 Pulpit-seam detection (deterministic regex)

**Banned-at-start lexicon (LOCKED by FEATURES.md TS-05):**
```
["So", "Now", "And so", "Let us", "Let me", "Here's where", "Here's the thing", "You see", "Listen", "Church", "Friend"]
```

**Detection:** Split content on blank lines (paragraphs). For each paragraph, check if first 1-2 words match any banned phrase (case-insensitive, word-boundary):
```javascript
const paragraphs = content.split(/\n\n+/);
const bannedStarts = /^(So|Now|And so|Let us|Let me|Here'?s where|Here'?s the thing|You see|Listen|Church|Friend)[\s,.!?]/i;
const seamHits = paragraphs
  .map((p, i) => ({ paragraph: i, match: p.trim().match(bannedStarts) }))
  .filter(x => x.match);
// CRAFT-05 rule: seamHits.length === 0 (fail if any)
```

**Permitted-usage counter-example list (LOCKED by CRAFT-05):** Planner must produce a whitelist of 5-10 intentional usages (e.g., dialogue, quotation, deliberate fragment) that don't trigger. Stored in `references/bestseller-craft-rules.md`.

#### CRAFT-07 Reader-thought lines (deterministic regex)

**Detection:** Count italic or blockquote-wrapped first-person reader-voice lines:
```javascript
// Matches: *"But what if..."* or > *"If this is true..."*
const readerThought = /(?:^>\s*\*"|^\*")[^"*]{5,200}\?["*]/gm;
const hits = [...content.matchAll(readerThought)];
// CRAFT-07 rule: hits.length >= 2
```

Heuristic markers for stronger detection: line must end with `?`, contain at least one of {`but what if`, `if this is`, `why don't`, `how can`, `what about`, `how do`}.

**Fail:** count < 2 → flag (D-07).

#### CRAFT-08 Concrete:abstract noun ratio (LLM judgment)

**Abstract-spiritual lexicon (from FEATURES.md TS-08):** `grace`, `identity`, `righteousness`, `sonship`, `authority`, `kingdom`, `glory`, `anointing`, `faith`, `hope`, `love`, `peace`, `joy`, `salvation`, `redemption`, `sanctification`, `justification`, `mercy`.

**Concrete-object lexicon (seed):** `chair`, `coffee`, `phone`, `car`, `door`, `hospital`, `kitchen`, `window`, `table`, `street`, `bed`, `room`, `cup`, `hand`, `face`, `eye`, `voice`, `book`, `letter`, `rain`, `sunlight`.

**Rule:** Over any 4-paragraph sliding window, `(count of concrete) / (count of abstract) >= 1.0`. Split content into paragraphs; for each window of 4, count matches. Flag windows where ratio < 1.0.

**Why LLM and not deterministic:** Lexicon coverage is incomplete — grounding the rule in two fixed word lists would miss most prose. Craft-check.js can provide **hints** (list of abstract nouns found per window), but the editor LLM judges whether the surrounding prose is "telling" or "showing".

#### CRAFT-15 Version stamp (deterministic)

```javascript
/^<!-- generated-by: book-crafter v\d+\.\d+\.\d+ -->$/m
```
Must appear within the first 3 lines of the file.

### Q9: Validation architecture — regression testing rubric extraction

**Framework:** Pure-Node-stdlib test runner (consistent with craft-check.js dependency constraint). Proposed: `scripts/test-craft-check.js` using Node's built-in `node:test` module (available Node 18+, no install).

**Fixtures directory:** `fixtures/phase10/`
- `fixtures/phase10/known-good/ch01-draft.md` — passes all CRAFT-01..08 + CRAFT-15. Used for false-positive regression.
- `fixtures/phase10/known-bad/ch01-pulpit.md` — starts with "So let us". CRAFT-05 must fail.
- `fixtures/phase10/known-bad/ch02-greek-overflow.md` — 11 Greek terms. CRAFT-02 must fail.
- `fixtures/phase10/known-bad/ch03-no-provenance.md` — missing provenance. CRAFT-01 must fail.
- `fixtures/phase10/known-bad/ch04-no-version-stamp.md` — missing version stamp. CRAFT-15 must fail.
- `fixtures/phase10/known-bad/ch05-no-reader-thought.md` — zero reader-thought lines. CRAFT-07 must fail.
- `fixtures/phase10/eternally-secure-ch1.md` — actual Phase 7 output (copy of `evidence/eternally-secure-ch1-before.md` once Phase 12 creates it). Baseline for rubric regression.

**Rubric regression test (CRAFT-09 — THE CRITICAL ONE):**

1. **Pre-extract snapshot:** Before Plan 1 starts, run editor Pass 1 + Pass 2 on `fixtures/phase10/eternally-secure-ch1.md` (or any known-good fixture) and capture the `captivation_score` from the VOICE AUDIT block. Store in `fixtures/phase10/baseline-captivation-scores.json`:
   ```json
   { "eternally-secure-ch1": { "pacing_variety": 1, "emotional_connection": 0, "reader_engagement": 2, "opening_engagement": 0, "ending_momentum": 1, "total": 4 } }
   ```
2. **Post-extract verification:** After Plan 1 (CRAFT-09 extraction) completes, re-run the editor on the same fixture. Diff the new scores against baseline. MUST be byte-identical per component.
3. **Extended rubric verification (CRAFT-10):** After Plan 6 extends rubric to 7 components (0-14), re-run. New components added (Craft Density, Cross-Chapter Craft) but existing 5 components must score identically.

**Because the editor's component scoring is LLM-driven (not deterministic), achieving byte-identical scores requires:**
- Fixed fixture (no randomness)
- Same model + same prompt text before/after extraction
- Extraction is a PURE MOVE operation (no semantic edits)

If scores drift despite pure move, the extract introduced prompt-context changes. Plan 1 must catch this.

**Sampling rate for Nyquist validation:**
- Per task commit: run `scripts/test-craft-check.js` (all fixture cases) — target <30s.
- Per wave merge: run rubric regression (invokes editor Pass 1/2 on fixture) — target <5min.
- Phase gate: full eternally-secure-ch1 regression + all craft-check.js fixtures.

### Q10: Minimal bestseller diagnostic report schema

**Locked by D-23.** Proposed rendered form:

```markdown
## Bestseller Diagnostic

Generated: 2026-04-15 by craft-check.js v1.1.0

### Ch 1: The Drowning Man

| Check | Pass/Fail | Evidence | Line |
|---|---|---|---|
| CRAFT-01 Scene-first opener | PASS | Provenance resolves; named human "Sarah" at "2am"; sensory "dim kitchen light" | ch01:1-8 |
| CRAFT-02 Greek density | PASS | 2 terms (charis, dunamis), each with 4+ unpacking sentences | ch01:42, ch01:118 |
| CRAFT-03 Central image | FLAG | Image "drowning man" present in opening (ch01:5) and closing (ch01:342) but absent in middle third | ch01:150-240 |
| CRAFT-04 Vulnerability beat | PASS | First-person confession at ch01:178, resolves to voice-profile.md:89 | ch01:178 |
| CRAFT-05 Pulpit seam | PASS | 0 banned phrases detected at chapter/paragraph starts | — |
| CRAFT-06 Reader moments | PASS | 2 selected: "the 2am phone-check", "the grocery-aisle grief flash" | ch01:62, ch01:201 |
| CRAFT-07 Reader-thought lines | PASS | 3 italicised reader-voice objections | ch01:95, ch01:167, ch01:240 |
| CRAFT-08 Concrete:abstract ratio | FLAG | Window ch01:p12-p15 ratio 0.6 (3 concrete : 5 abstract) | ch01:p12-p15 |
| CRAFT-15 Version stamp | PASS | `<!-- generated-by: book-crafter v1.1.0 -->` at line 2 | ch01:2 |

**Severity:** 2 flags (judgment-only, no auto-revise). Chapter meets hard gates.

### Ch 2: ...
```

**Append location:** After Pass 3's `## Cross-Chapter Consistency` section, before `## Unresolved Issues`.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---|---|---|---|
| Node.js | ≥18 (system: v24.8.0) | craft-check.js runtime, test harness | Already required by formatter. No new dep. |
| node:test (stdlib) | Node 18+ built-in | Test runner for craft-check.js + rubric regression | Zero dependencies. Sufficient for pass/fail fixture validation. |
| node:fs, node:path (stdlib) | Node 18+ built-in | File IO, path resolution for provenance checker | Only APIs craft-check.js needs. |

**Hard constraint:** NO npm installs. `scripts/craft-check.js` and `scripts/test-craft-check.js` MUST be pure-node-stdlib. Zero dependencies shipped in `package.json` (which doesn't exist yet).

### Supporting

None. Phase 10 adds zero libraries. All work is either markdown-reference files, skill-instruction updates, or pure-Node scripts.

### Alternatives Considered

| Instead of | Could Use | Tradeoff | Rejected because |
|---|---|---|---|
| Pure-node craft-check.js | Python regex tool | More mature regex + unicode | No — Node is already required by formatter; adding Python dep violates cross-surface compat |
| Pure-node craft-check.js | LLM-in-the-loop for CRAFT-02/05/07 | No regex maintenance | No — D-03 LOCKED deterministic checks; LLM-in-loop rewards blandness (AF-04) |
| node:test | Vitest, Jest, Mocha | Richer assertions | No — zero-dep constraint; node:test is sufficient for this scope |
| Extend Phase 7 captivation rubric in-place | Full rewrite | Keeps existing logic | No — CRAFT-09 explicitly requires extraction FIRST with regression lock before extending |

**Installation:** None. System-level verification only:
```bash
node --version   # must be ≥18
```

## Architecture Patterns

### Recommended File Additions

```
book-crafter-plugin/
├── scripts/
│   ├── craft-check.js          # NEW — deterministic checker (CRAFT-01/02/05/07/15)
│   └── test-craft-check.js     # NEW — fixture test harness
├── fixtures/
│   └── phase10/                # NEW
│       ├── known-good/
│       │   └── ch01-draft.md
│       ├── known-bad/
│       │   ├── ch01-pulpit.md
│       │   ├── ch02-greek-overflow.md
│       │   ├── ch03-no-provenance.md
│       │   ├── ch04-no-version-stamp.md
│       │   └── ch05-no-reader-thought.md
│       ├── eternally-secure-ch1.md
│       └── baseline-captivation-scores.json
├── references/
│   ├── bestseller-craft-rules.md    # NEW (CRAFT-11, ≤200 lines)
│   ├── bestseller-calibration.md    # NEW (CRAFT-12)
│   ├── captivation-rubric.md        # NEW (CRAFT-09, extracted)
│   ├── book-dna-template.md         # MODIFY — add central_image + vulnerability_beat_seed columns to Chapter Map
│   └── voice-profiles/
│       ├── spiritual-default.md     # MODIFY — add Reader Moments section, subtractive audit, ≤150 lines
│       └── voice-profile-spec.md    # MODIFY — document Reader Moments as recommended optional section
└── skills/
    ├── writer/SKILL.md              # MODIFY — scene-first, Greek cap, reader moments, central image, vulnerability beat, provenance
    ├── editor/SKILL.md              # MODIFY — craft-check.js invocation, new sub-sections in Pass 1 & 2
    ├── outliner/SKILL.md            # MODIFY — central_image + vulnerability_beat_seed fields
    ├── orchestrator/SKILL.md        # MODIFY — Mode 6 Fresh Run, version stamp verification, diagnostic step
    └── voice-builder/SKILL.md       # MODIFY — generate Reader Moments section in output
```

### Pattern 1: Skill-Invoked Bash Checker

**What:** Skill SKILL.md instructs the agent to invoke `node scripts/craft-check.js [chapter-path]` via Bash, parse JSON output, merge results into its own analysis.

**When to use:** When a check must be deterministic AND reusable across skills AND benefits from shared maintenance.

**Example:**
```markdown
### 2.9 Craft Density Check

Before running LLM judgment, invoke the deterministic craft checker:

\`\`\`bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/craft-check.js [project]/drafts/ch[NN]-draft.md
\`\`\`

The script emits JSON to stdout:
\`\`\`json
{
  "chapter_id": "ch01",
  "checks": {
    "CRAFT-01": { "pass": true, "evidence": "provenance resolves to sources/sermon-2024-03-15.md:42", "citations": ["ch01:1"] },
    "CRAFT-02": { "pass": false, "evidence": "4 distinct Greek terms (cap: 3): charis, agape, dunamis, exousia", "citations": ["ch01:42", "ch01:89", "ch01:118", "ch01:201"] },
    "CRAFT-05": { "pass": true, "evidence": "0 pulpit-seam starts detected", "citations": [] },
    "CRAFT-07": { "pass": true, "evidence": "3 reader-thought lines detected", "citations": ["ch01:95", "ch01:167", "ch01:240"] },
    "CRAFT-15": { "pass": true, "evidence": "version stamp present at line 2", "citations": ["ch01:2"] }
  }
}
\`\`\`

If CRAFT-02 fails, trigger auto-revise. Otherwise, proceed to LLM judgment for CRAFT-03/04/06/08.
```

### Pattern 2: Reference-File Indirection (already established)

**What:** Voice-agnostic craft rules live in `references/bestseller-craft-rules.md`. Writer and editor both read it at runtime. Single source of truth for the seven rules.

**When to use:** Any time ≥2 skills need the same procedural rules. Prevents Phase-7-style duplication drift.

### Pattern 3: Pure Move Extraction (CRAFT-09)

**What:** Extract captivation rubric from editor SKILL.md sections to `references/captivation-rubric.md` WITHOUT altering any measurement logic. Editor sections become one-line invocations.

**When to use:** CRAFT-09 specifically. The regression test relies on this being a pure move — any semantic change breaks the score-identity guarantee.

### Anti-Patterns to Avoid

- **Phase 7 kitchen-sink additive evolution:** Every v2 addition to voice profile MUST pair with a v1 removal. Kill list committed.
- **Aspirational rules:** "write vividly" is banned. Every rule must be countable ("if first 150 words contain zero sensory details, rewrite").
- **Fabricated scene openers:** An agent asked to invent a scene with no source will hallucinate generic fiction. CRAFT-01 auto-revise on missing provenance prevents this.
- **LLM-as-judge for deterministic checks:** CRAFT-02 term counting is a regex, not a judgment. Do not punt deterministic rules to the LLM.
- **Silent `--fresh` delete:** Orchestrator must confirm before deleting. Pitfall 10 (stale Book DNA) worsens if users accidentally wipe approved work.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---|---|---|---|
| Markdown parsing | Custom regex for heading + list + blockquote structure | Paragraph-split on `\n\n+` + heading on `^#` | craft-check.js scope is paragraph-level counting, not AST. Full parser (remark/unified) is overkill and adds deps. |
| Test assertions | Custom assert helpers | `node:test` + `node:assert/strict` | Built-in, zero-dep, sufficient for pass/fail. |
| Greek transliteration detection | Unicode normalization + fuzzy matching | Fixed lexicon of common transliterations | Scope = 20-30 terms. Lexicon is simpler, auditable, maintainable. |
| Concrete/abstract noun classification | NLP library + POS tagger | LLM judgment with lexicon hints | POS taggers add dep; LLM is already in the loop for CRAFT-08. |
| Sentence tokenization | Full NLP sentence splitter | Split on `[.!?]+` | Good enough for counting. Edge cases (Mr., Dr.) are rare in long-form prose. |
| YAML/JSON frontmatter parsing | Custom parser | HTML comments (already in use) | Formatter already strips HTML comments (D-21). Version stamp + provenance as HTML comments reuses the stripping logic. |

**Key insight:** Phase 10 is deliberately low-tech. Every problem has a "use a simple heuristic + LLM judgment on top" answer. Adding libraries fights the plugin's zero-dep ethos and complicates cross-surface compat.

## Common Pitfalls

### Pitfall 1: Rubric Extraction Introduces Silent Score Drift (CRAFT-09)
**What goes wrong:** Moving rubric text from editor SKILL.md to `references/captivation-rubric.md` subtly rewords thresholds, and scores change.
**Why it happens:** "Tightening" or "clarifying" during move feels harmless.
**How to avoid:** Plan 1 is a PURE MOVE. No semantic edits. Regression test (Q9 baseline comparison) must pass before Plan 1 closes.
**Warning signs:** Any rephrased threshold, added example, or merged bullet.

### Pitfall 2: Voice Profile Kitchen Sink (Phase 7 Replay)
**What goes wrong:** Reader Moments section adds 15 lines, but no v1 removal happens. Profile grows to 138 lines. Eventually 180.
**Why it happens:** "One more section won't hurt" is always true in isolation; catastrophic in aggregate.
**How to avoid:** Kill list committed in `10-CONTEXT.md` BEFORE Plan 7 finishes. Cap enforced at ≤150 lines via `wc -l` verification.
**Warning signs:** Line count >140. Kill list has fewer rows than additions. Any "reconsidered — keeping the v1 rule" entry without a paired new removal.

### Pitfall 3: craft-check.js Dependency Creep
**What goes wrong:** "Just add `remark` for markdown parsing" → npm install → plugin now requires `npm install` on recipient machines.
**Why it happens:** Regex feels clumsy next to proper parsers.
**How to avoid:** Zero-dep is a hard constraint. If regex can't do it, delegate to LLM judgment in editor, not to a library.
**Warning signs:** Any `require()` of a non-stdlib module. Any `package.json` additions.

### Pitfall 4: Auto-Revise Infinite Loop (CRAFT-17 interaction)
**What goes wrong:** CRAFT-01 fails → auto-revise → revision still fails → another revise → etc.
**Why it happens:** No cap enforced, or divergent-improvement not detected.
**How to avoid:** D-08 caps at 2 revisions. D-09 divergent-improvement detection: if revision N scores lower than N-1 on any sub-metric, stop and keep N-1. Orchestrator must track per-chapter revision count + per-component score history.
**Warning signs:** Revision count >2 for any chapter. Same CRAFT-XX failing on both revisions with no score progression.

### Pitfall 5: Fabricated Vulnerability (CRAFT-04)
**What goes wrong:** Writer invents a "time I struggled with doubt" scene that never happened.
**Why it happens:** The rule says "first-person vulnerability beat required", so model fills the slot.
**How to avoid:** D-12 requires `vulnerability_beat_seed` to resolve to real source material. Editor Pass 2 §3.8 verifies resolution. If seed doesn't resolve, CRAFT-04 fails and diagnostic flags for human-in-the-loop (not auto-revise — would loop back to fabrication).
**Warning signs:** Any chapter draft with first-person story markers but no matching source file line.

### Pitfall 6: Pulpit-Seam False Positives (TS-05 over-correction)
**What goes wrong:** "So" appears mid-paragraph as a fragment for emphasis and gets flagged.
**Why it happens:** Regex doesn't understand intent.
**How to avoid:** Detection restricted to **chapter and paragraph starts** only. Mid-paragraph "So" is never flagged. Permitted-usage counter-example list in `bestseller-craft-rules.md` documents 5-10 cases where starts are intentional (dialogue, quoted speech, etc.).
**Warning signs:** Any false positive in known-good fixture. Writers complaining the rule is too strict.

### Pitfall 7: Greek Lexicon Gaps (CRAFT-02 under-detection)
**What goes wrong:** Lexicon has `charis` but not `eleos`. Chapter uses 5 terms including `eleos` — craft-check passes at 4 distinct.
**Why it happens:** No one maintained the lexicon.
**How to avoid:** Seed with 20-30 common terms. Document extension process in `bestseller-craft-rules.md` for when new terms appear in output. Phase 12 regression will catch systematic gaps.
**Warning signs:** Chapter with ≥5 italicised non-English words passing CRAFT-02.

### Pitfall 8: Version Stamp Stripping Failure (CRAFT-15 + formatter)
**What goes wrong:** Version stamp shows up in the final .docx.
**Why it happens:** Formatter's HTML-comment stripper doesn't match the exact pattern.
**How to avoid:** Planner verifies formatter's comment-strip regex matches both `<!-- provenance: ... -->` AND `<!-- generated-by: ... -->` formats. Fixture .docx verification in Plan 9 (version stamps plan) must include opening the .docx and grep'ing for "generated-by".
**Warning signs:** Any `<!--` survives .docx emission.

### Pitfall 9: Outliner central_image Collisions
**What goes wrong:** Three chapters all use "drowning man" as central_image. Reader feels repetition.
**Why it happens:** Outliner picks images per-chapter without cross-chapter coordination.
**How to avoid:** D-13 requires outliner to ensure distinctness. Plan 3 (outliner update) must include a post-generation dedupe pass.
**Warning signs:** Any two chapters in the same outline with identical or near-identical central_image strings.

### Pitfall 10: Fresh-Mode Accidental Data Loss (CRAFT-14)
**What goes wrong:** User says "start fresh", orchestrator deletes everything including approved outline they've been iterating on.
**Why it happens:** Silent delete.
**How to avoid:** Mandatory confirmation prompt listing exactly what will be deleted and what's preserved. No `--yes-i-really-mean-it` flag.
**Warning signs:** Any fresh-mode invocation path without explicit user confirmation.

## Runtime State Inventory

> Skipped. Phase 10 modifies instruction documents (SKILL.md, references/*.md) and adds new scripts/fixtures. No renames, no stored data, no OS-registered state, no secrets, no build artefacts. Category answers:

| Category | Items Found | Action Required |
|---|---|---|
| Stored data | None — no databases or persistent stores in plugin. Book projects live in `~/Documents/Books/` but Phase 10 does not rename or restructure them. | None |
| Live service config | None — no external services. | None |
| OS-registered state | None — no scheduled tasks or daemons. | None |
| Secrets/env vars | None — plugin has no secrets. | None |
| Build artefacts | None — plugin has no build step. craft-check.js runs from source. | None |

Fresh-mode (CRAFT-14) deletes per-project artefacts but this is user-controlled runtime behaviour, not migration state.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|---|---|---|---|---|
| Node.js | craft-check.js, test harness, docx-js (existing) | ✓ | v24.8.0 (exceeds ≥18) | — |
| Python 3 | Optional docx validator (existing) | ✓ | 3.14.3 | Skip validation (existing behavior) |
| npm packages | None in Phase 10 (zero-dep constraint) | n/a | — | — |

**Missing dependencies with no fallback:** None.
**Missing dependencies with fallback:** None — zero new deps.

## Validation Architecture

### Test Framework

| Property | Value |
|---|---|
| Framework | `node:test` (Node 18+ stdlib built-in) + `node:assert/strict` |
| Config file | none — pure stdlib, no config needed |
| Quick run command | `node --test scripts/test-craft-check.js` |
| Full suite command | `node --test scripts/test-craft-check.js && node scripts/test-rubric-regression.js` |
| Phase gate command | Full suite + `scripts/craft-check.js` run on all fixtures + (once Phase 12 exists) eternally-secure-ch1 regression |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|---|---|---|---|---|
| CRAFT-01 | craft-check.js detects missing/malformed provenance comment | unit | `node --test scripts/test-craft-check.js -- --grep=CRAFT-01` | ❌ Wave 0 |
| CRAFT-02 | craft-check.js counts Greek/Hebrew terms correctly (fail at >3, pass at ≤3) | unit | `node --test scripts/test-craft-check.js -- --grep=CRAFT-02` | ❌ Wave 0 |
| CRAFT-03 | Editor LLM flags central image not present in all 3 zones | integration (manual-LLM) | Manual: run editor on `fixtures/phase10/known-bad/ch01-missing-middle.md`, verify flag | ❌ Wave 0 |
| CRAFT-04 | Editor flags unresolved vulnerability_beat_seed | integration (manual-LLM) | Manual: run editor on fixture with invalid seed, verify flag | ❌ Wave 0 |
| CRAFT-05 | craft-check.js detects pulpit-seam at para starts only (not mid-paragraph) | unit | `node --test scripts/test-craft-check.js -- --grep=CRAFT-05` | ❌ Wave 0 |
| CRAFT-06 | Editor flags chapters with <2 reader-moments when voice profile has Reader Moments section | integration (manual-LLM) | Manual | ❌ Wave 0 |
| CRAFT-07 | craft-check.js counts ≥2 italic reader-thought lines | unit | `node --test scripts/test-craft-check.js -- --grep=CRAFT-07` | ❌ Wave 0 |
| CRAFT-08 | Editor flags 4-para window with concrete:abstract <1:1 | integration (manual-LLM) | Manual | ❌ Wave 0 |
| CRAFT-09 | Rubric extraction produces byte-identical scores on baseline fixture | regression | `node scripts/test-rubric-regression.js` | ❌ Wave 0 |
| CRAFT-10 | Extended rubric preserves original 5-component scores, adds 2 new components | regression | `node scripts/test-rubric-regression.js --extended` | ❌ Wave 0 |
| CRAFT-11 | `bestseller-craft-rules.md` exists, ≤200 lines, no theological terms | smoke | `wc -l references/bestseller-craft-rules.md \| awk '{ exit ($1>200) }'` | ❌ Wave 0 |
| CRAFT-12 | `bestseller-calibration.md` exists with sections for score levels 3, 6, 9 | smoke | `grep -c '^## Score Level [369]' references/bestseller-calibration.md` must equal 3 | ❌ Wave 0 |
| CRAFT-13 | spiritual-default.md ≤150 lines, kill list has equal or more removals than additions | smoke | `wc -l references/voice-profiles/spiritual-default.md \| awk '{ exit ($1>150) }'` | existing file |
| CRAFT-14 | `--fresh` mode deletes locked list, preserves locked list | integration | Manual: create fixture project, invoke fresh mode, verify file presence | ❌ Wave 0 |
| CRAFT-15 | Version stamp present in all generated artefacts | unit + integration | craft-check.js CRAFT-15 check on fixtures; manual check on live run artefacts | partial |
| CRAFT-16 | consistency-report.md contains `## Bestseller Diagnostic` section with per-chapter matrix | smoke | `grep -q '^## Bestseller Diagnostic' reports/consistency-report.md` | post-run |
| CRAFT-17 | Orchestrator revision loop caps at 2 revisions, detects divergent improvement | manual-integration | Manual: force fixture to fail CRAFT-01 on all revisions, verify stop at 2 | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `node --test scripts/test-craft-check.js` (<30s — all unit fixtures)
- **Per wave merge:** Full suite + rubric regression (<5min)
- **Phase gate:** Full suite + all fixtures + manual integration checks for CRAFT-03/04/06/08/14/17 before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `scripts/craft-check.js` — subject under test (created in Plan 2)
- [ ] `scripts/test-craft-check.js` — unit test harness using node:test
- [ ] `scripts/test-rubric-regression.js` — rubric regression runner (CRAFT-09/10)
- [ ] `fixtures/phase10/known-good/ch01-draft.md` — all-pass fixture
- [ ] `fixtures/phase10/known-bad/ch01-pulpit.md` — CRAFT-05 failure
- [ ] `fixtures/phase10/known-bad/ch02-greek-overflow.md` — CRAFT-02 failure (≥4 distinct terms)
- [ ] `fixtures/phase10/known-bad/ch03-no-provenance.md` — CRAFT-01 failure
- [ ] `fixtures/phase10/known-bad/ch04-no-version-stamp.md` — CRAFT-15 failure
- [ ] `fixtures/phase10/known-bad/ch05-no-reader-thought.md` — CRAFT-07 failure
- [ ] `fixtures/phase10/baseline-captivation-scores.json` — baseline captured BEFORE Plan 1 rubric extract
- [ ] Framework install: none (node:test is stdlib, Node v24 already present)

## State of the Art

| Old Approach (Phase 7) | Current Approach (Phase 10) | When Changed | Impact |
|---|---|---|---|
| Captivation rubric inline in editor SKILL.md | Extracted to `references/captivation-rubric.md` + extended 5→7 components | Plan 1, Plan 6 | Other skills can reference; voice-agnostic reusable. |
| Aspirational voice guidance ("write vividly") | Procedural countable rules (CRAFT-01..08) with regex/thresholds | Plans 2-5 | Enforceable. Auditable. |
| Voice profile as kitchen sink | Subtractive audit + ≤150 line cap | Plan 7 | Competing signals reduced. |
| Additive rule evolution | Pair every v2 addition with v1 removal | Plan 7 | Prevents Phase 7 failure mode. |
| Framework presence = done | Output quality is observable and deterministically checkable | All plans | Phase 7 post-mortem solved. |
| "Fresh run" = manual rm -rf | Orchestrator `--fresh` mode with locked delete/preserve lists + confirmation | Plan 8 | Re-run safety. |
| No version stamps | HTML comment on all artefacts, stripped by formatter | Plan 9 | Regression detection; Phase 12 evidence chain. |
| No auto-revise cap | Hard 2-revision cap + divergent-improvement detection | Plan 9 | Prevents infinite loops. |

**Deprecated/outdated:**
- Phase 7 claim "framework present = phase done" — superseded by Phase 10 post-mortem (REQUIREMENTS.md §v1.1 line 196).
- Any rule phrased aspirationally — replaced by procedural rules throughout.

## Open Questions

1. **Exact Greek term lexicon**
   - What we know: Seed list of ~25 common transliterations (see Q8 CRAFT-02 section). Voice profile mentions `charis`, `dunamis`, `sunergeo`, `pas`, `agape`, `phileo`, `eros`, `sonship` (English), `shalom`.
   - What's unclear: Full lexicon. Should we include less-common terms like `eleos`, `koinonia`, `hypostasis`?
   - Recommendation: Planner (Plan 2) ships ~30 common terms in `bestseller-craft-rules.md` section "Transliterated Term Lexicon"; Phase 12 regression surfaces gaps; lexicon is living.

2. **Baseline fixture for CRAFT-09 regression test**
   - What we know: Phase 12 will commit `evidence/eternally-secure-ch1-before.md` as immutable Phase 7 output. Phase 10 needs this fixture BEFORE it can run the extraction regression.
   - What's unclear: Does Phase 10 re-use a snapshot of current Phase 7 output, or generate its own baseline?
   - Recommendation: Plan 1 captures a temporary baseline at Phase 10 start (before any Phase 10 edits) using the current Phase 7 pipeline. Phase 12 later creates the formal evidence file. These are separate artefacts.

3. **Outliner central_image distinctness algorithm**
   - What we know: D-13 requires distinct central_images across chapters. No algorithm specified.
   - What's unclear: Is similarity string-exact, stem-match, or LLM-judged semantic?
   - Recommendation: Plan 3 uses LLM-judged semantic check ("are these two images too similar to feel different in prose?") — too mechanical a check (Levenshtein) will false-positive on "flickering candle" vs "dim candle". Ship as a judgment step in outliner's cross-chapter coherence pass (existing §3.5).

4. **Reader Moments section schema in voice-profile-spec.md**
   - What we know: spiritual-default.md gets ≥12 concrete reader-moments. Custom profiles MAY omit (D-16).
   - What's unclear: What format? One per line? Bulleted with category? With example usage?
   - Recommendation: Plan 7 defines schema as bulleted list, one line per moment, optionally grouped under mood categories (anxiety, grief, joy, doubt). Example in Q10 below.

5. **craft-check.js JSON output schema finalisation (Claude's discretion)**
   - What we know: D-03 specifies `{chapter_id, checks: {CRAFT-XX: {pass, evidence, citations}}}`.
   - What's unclear: Whether to include `severity`, `auto_revise_triggered`, or keep it minimal.
   - Recommendation: Plan 2 uses minimal schema per D-03. Editor skill derives severity/auto-revise from D-06/D-07 policy, not from craft-check output. Keeps script purely descriptive.

6. **Fresh-mode trigger surface**
   - What we know: CRAFT-14 locks delete/preserve lists. CLI flag vs mode surface is Claude's discretion.
   - What's unclear: "--fresh" as literal syntax vs natural language trigger.
   - Recommendation: Plan 8 adds Mode 6 Fresh Run to orchestrator §6 Execution Modes, triggered by natural-language keywords ("start fresh", "rerun from scratch", "fresh build", "regenerate everything") AND explicit `--fresh` in user utterance. Consistent with existing mode detection patterns.

## Code Examples

### Example 1: craft-check.js skeleton (pure node stdlib)

```javascript
#!/usr/bin/env node
// scripts/craft-check.js — deterministic craft rule checker for CRAFT-01/02/05/07/15
// Zero dependencies. Usage: node scripts/craft-check.js <chapter-path>

const fs = require('node:fs');
const path = require('node:path');

const TRANSLITERATED_TERMS = [
  'charis', 'agape', 'phileo', 'eros', 'storge',
  'dunamis', 'exousia', 'logos', 'rhema', 'pneuma',
  'sarx', 'kairos', 'chronos', 'sunergeo', 'pas',
  'shalom', 'hesed', 'chesed', 'ruach', 'yada',
  'ahavah', 'nephesh', 'echad', 'koinonia', 'metanoia'
];

const PULPIT_SEAM_REGEX = /^(So|Now|And so|Let us|Let me|Here'?s where|Here'?s the thing|You see|Listen|Church|Friend)[\s,.!?]/i;
const PROVENANCE_REGEX = /^<!-- provenance: (sources|sources-adapted|book-dna\.md|voice-profile\.md)[^:]*:\d+ -->$/m;
const VERSION_STAMP_REGEX = /^<!-- generated-by: book-crafter v\d+\.\d+\.\d+ -->$/m;
const READER_THOUGHT_REGEX = /(?:^>\s*\*"|^\*")[^"*]{5,200}\?["*]/gm;

function checkCraft01(content, chapterPath) {
  const firstLine = content.split('\n')[0];
  const match = firstLine.match(/^<!-- provenance: (.+):(\d+) -->$/);
  if (!match) return { pass: false, evidence: 'missing or malformed provenance comment', citations: ['line 1'] };
  const [, refPath, refLine] = match;
  const projectRoot = path.dirname(path.dirname(chapterPath));
  const resolved = path.resolve(projectRoot, refPath);
  if (!fs.existsSync(resolved)) return { pass: false, evidence: `provenance path does not exist: ${refPath}`, citations: ['line 1'] };
  const lines = fs.readFileSync(resolved, 'utf8').split('\n');
  if (lines.length < parseInt(refLine)) return { pass: false, evidence: `provenance line ${refLine} beyond end of ${refPath} (${lines.length} lines)`, citations: ['line 1'] };
  return { pass: true, evidence: `provenance resolves to ${refPath}:${refLine}`, citations: ['line 1'] };
}

function checkCraft02(content) {
  const regex = new RegExp(`\\b(?:\\*)?(${TRANSLITERATED_TERMS.join('|')})(?:\\*)?\\b`, 'gi');
  const matches = [...content.matchAll(regex)];
  const distinct = new Set(matches.map(m => m[1].toLowerCase()));
  const citations = matches.slice(0, 5).map(m => `offset ${m.index}`);
  if (distinct.size > 3) return { pass: false, evidence: `${distinct.size} distinct terms (cap 3): ${[...distinct].join(', ')}`, citations };
  return { pass: true, evidence: `${distinct.size} distinct terms: ${[...distinct].join(', ') || 'none'}`, citations };
}

function checkCraft05(content) {
  const paragraphs = content.split(/\n\n+/);
  const hits = [];
  paragraphs.forEach((p, i) => {
    const trimmed = p.trim();
    if (trimmed.startsWith('#') || trimmed.startsWith('<!--')) return;
    if (PULPIT_SEAM_REGEX.test(trimmed)) hits.push({ paragraph: i, phrase: trimmed.split(/\s/).slice(0, 2).join(' ') });
  });
  if (hits.length) return { pass: false, evidence: `${hits.length} pulpit-seam starts detected`, citations: hits.map(h => `para ${h.paragraph}: "${h.phrase}"`) };
  return { pass: true, evidence: '0 pulpit-seam starts detected', citations: [] };
}

function checkCraft07(content) {
  const matches = [...content.matchAll(READER_THOUGHT_REGEX)];
  if (matches.length < 2) return { pass: false, evidence: `${matches.length} reader-thought lines (need ≥2)`, citations: matches.map(m => `offset ${m.index}`) };
  return { pass: true, evidence: `${matches.length} reader-thought lines`, citations: matches.map(m => `offset ${m.index}`) };
}

function checkCraft15(content) {
  if (VERSION_STAMP_REGEX.test(content)) return { pass: true, evidence: 'version stamp present', citations: [] };
  return { pass: false, evidence: 'version stamp missing', citations: [] };
}

function main() {
  const chapterPath = process.argv[2];
  if (!chapterPath) { console.error('Usage: node craft-check.js <chapter-path>'); process.exit(2); }
  const content = fs.readFileSync(chapterPath, 'utf8');
  const chapterId = path.basename(chapterPath, path.extname(chapterPath));
  const result = {
    chapter_id: chapterId,
    checks: {
      'CRAFT-01': checkCraft01(content, chapterPath),
      'CRAFT-02': checkCraft02(content),
      'CRAFT-05': checkCraft05(content),
      'CRAFT-07': checkCraft07(content),
      'CRAFT-15': checkCraft15(content)
    }
  };
  console.log(JSON.stringify(result, null, 2));
  const anyFail = Object.values(result.checks).some(c => !c.pass);
  process.exit(anyFail ? 1 : 0);
}

main();
```

### Example 2: node:test fixture harness

```javascript
// scripts/test-craft-check.js — unit tests for craft-check.js
// Usage: node --test scripts/test-craft-check.js

const test = require('node:test');
const assert = require('node:assert/strict');
const { execSync } = require('node:child_process');
const path = require('node:path');

const CHECKER = path.join(__dirname, 'craft-check.js');
const FIXTURES = path.join(__dirname, '..', 'fixtures', 'phase10');

function runChecker(fixturePath) {
  try {
    const out = execSync(`node ${CHECKER} ${fixturePath}`, { encoding: 'utf8' });
    return { exitCode: 0, result: JSON.parse(out) };
  } catch (err) {
    return { exitCode: err.status, result: JSON.parse(err.stdout) };
  }
}

test('CRAFT-01: known-good chapter has valid provenance', () => {
  const { result } = runChecker(path.join(FIXTURES, 'known-good', 'ch01-draft.md'));
  assert.equal(result.checks['CRAFT-01'].pass, true);
});

test('CRAFT-01: missing provenance fails', () => {
  const { exitCode, result } = runChecker(path.join(FIXTURES, 'known-bad', 'ch03-no-provenance.md'));
  assert.equal(result.checks['CRAFT-01'].pass, false);
  assert.equal(exitCode, 1);
});

test('CRAFT-02: 4 distinct Greek terms fails cap of 3', () => {
  const { result } = runChecker(path.join(FIXTURES, 'known-bad', 'ch02-greek-overflow.md'));
  assert.equal(result.checks['CRAFT-02'].pass, false);
});

test('CRAFT-05: "So let us..." at paragraph start fails', () => {
  const { result } = runChecker(path.join(FIXTURES, 'known-bad', 'ch01-pulpit.md'));
  assert.equal(result.checks['CRAFT-05'].pass, false);
});

test('CRAFT-05: mid-paragraph "So" does not trigger', () => {
  const { result } = runChecker(path.join(FIXTURES, 'known-good', 'ch01-draft.md'));
  assert.equal(result.checks['CRAFT-05'].pass, true);
});

test('CRAFT-07: <2 reader-thought lines fails', () => {
  const { result } = runChecker(path.join(FIXTURES, 'known-bad', 'ch05-no-reader-thought.md'));
  assert.equal(result.checks['CRAFT-07'].pass, false);
});

test('CRAFT-15: missing version stamp fails', () => {
  const { result } = runChecker(path.join(FIXTURES, 'known-bad', 'ch04-no-version-stamp.md'));
  assert.equal(result.checks['CRAFT-15'].pass, false);
});
```

### Example 3: Voice Profile Reader Moments section (proposed shape)

```markdown
## Reader Moments

> Concrete, everyday scenes the reader has actually lived. Writer selects ≥2 per chapter to anchor abstractions. Not prescriptive — these are anchors, not scripts.

### Anxiety
- The 2am phone-check after an argument
- The Sunday-night dread before Monday morning
- The tight-chest silence in the car outside a hospital
- The cursor blinking on an unfinished job application
- The deep breath before opening a bank statement

### Grief
- The grocery-aisle grief flash when their favourite cereal appears
- The first Christmas with their chair empty at the table
- The moment you reach for the phone to tell them, and remember

### Doubt
- The pew you can't stay seated in
- The prayer that dies halfway through the sentence
- The worship song you can't sing the chorus of

### Joy
- The kitchen-dance with kids underfoot
- The first bite of coffee on a morning that finally feels clear
```

12 items minimum across 4 mood categories. Cap contribution to voice profile: ~20 lines. Leaves headroom for subtraction elsewhere.

## Sources

### Primary (HIGH confidence — repo files verified directly)
- `skills/editor/SKILL.md` (511 lines) — captivation rubric current location, Pass 1/2/3 structure
- `skills/writer/SKILL.md` (351 lines) — insertion points for scene-first, Greek cap, central image
- `skills/orchestrator/SKILL.md` (750 lines) — pipeline state detection, mode surface, fresh-mode insertion point
- `skills/outliner/SKILL.md` (317 lines) — per-chapter metadata structure, central_image insertion point
- `references/voice-profiles/spiritual-default.md` (123 lines) — current content and section line counts
- `references/voice-profiles/voice-profile-spec.md` (61 lines) — required vs optional section rules
- `references/book-dna-template.md` (65 lines) — Chapter Map schema for central_image field addition
- `.planning/REQUIREMENTS.md` — CRAFT-01..17 full definitions
- `.planning/ROADMAP.md` — Phase 10 build order and anti-pattern reminders
- `.planning/phases/10-writing-quality-v2/10-CONTEXT.md` — user decisions D-01..D-23, kill list placeholder
- `.planning/phases/07-*/07-VERIFICATION.md` — Phase 7 post-mortem evidence that framework ≠ quality
- `.planning/research/FEATURES.md` — TS-01..TS-08 procedural rule details
- `.planning/research/PITFALLS.md` — 23 pitfalls (Phase 7 post-mortem, rule drift, evaluator deadlock)
- `.planning/research/ARCHITECTURE.md` — file-level integration points

### Secondary (MEDIUM confidence — repo docs referencing external craft pedagogy)
- `.planning/research/FEATURES.md` § "Craft sources" — Lamott *Bird by Bird*, King *On Writing*, Zinsser *On Writing Well*, Miller *Blue Like Jazz*, Keller *Prodigal God*, Manning *Ragamuffin Gospel*, Yancey *What's So Amazing About Grace?*, Nouwen *Return of the Prodigal Son*, Eldredge *Wild at Heart*, McKee *Story*. These underpin TS-01..TS-08. Confidence medium because this session did not re-verify against primary sources.

### Tertiary (LOW confidence — none in this research)
- None. All findings are sourced from repo files or locked CONTEXT.md decisions.

## Metadata

**Confidence breakdown:**
- Current file locations and line counts: HIGH — read directly from repo, line-accurate
- Insertion points for new rules in existing skills: HIGH — section boundaries are explicit in SKILL.md files
- craft-check.js detection regexes: HIGH (syntax), MEDIUM (completeness of lexicons — will need Phase 12 regression feedback)
- Fresh-mode wiring: HIGH — orchestrator mode pattern is well-established
- Rubric regression test design: MEDIUM — depends on LLM determinism across runs; may need multiple-sample averaging if single-shot scores vary
- Central-image distinctness algorithm: LOW — left as LLM judgment call, no deterministic spec yet
- Reader Moments section schema: MEDIUM — proposed shape in Example 3 but final schema is Plan 7's call

**Research date:** 2026-04-15
**Valid until:** 2026-05-15 (30 days — Phase 10 is stable-scope modification of existing files; no external doc dependencies to drift)
