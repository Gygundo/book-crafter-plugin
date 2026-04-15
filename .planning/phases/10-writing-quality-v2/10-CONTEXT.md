# Phase 10: Writing Quality v2 - Context

**Gathered:** 2026-04-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Enforce bestseller-quality craft in generated chapters via seven countable, procedural rules (CRAFT-01..08), a standalone craft-rules reference, an extracted + extended captivation rubric (CRAFT-09/10), calibration exemplars (CRAFT-12), a subtractively-audited voice profile (CRAFT-13), an orchestrator `--fresh` mode (CRAFT-14), version stamps on all artefacts (CRAFT-15), a per-chapter bestseller diagnostic report (CRAFT-16), and a hard 2-revision cap with divergent-improvement detection (CRAFT-17).

Writer, editor, **and outliner** are touched. Research summary previously said outliner unchanged — Area 3 below revises that.

</domain>

<decisions>
## Implementation Decisions

### Enforcement Mechanism (CRAFT-01..08 checking)
- **D-01:** Hybrid enforcement — `scripts/craft-check.js` (deterministic checker, node) + editor LLM judgment on top.
- **D-02:** Script lives at `scripts/craft-check.js` in the plugin root. Editor skill invokes it via Bash at the start of Pass 1 for each chapter, reads JSON output, then performs LLM judgment for craft rules that cannot be scripted.
- **D-03:** Script covers (deterministic): CRAFT-01 provenance comment presence, CRAFT-02 Greek/Hebrew term count + unpacking-sentence count, CRAFT-05 pulpit-seam phrase scan at chapter/paragraph starts, CRAFT-07 reader-thought line count (regex on italics/blockquote), CRAFT-15 version stamp presence. JSON output: `{chapter_id, checks: {CRAFT-XX: {pass, evidence, citations}}}`.
- **D-04:** Editor LLM handles (judgment): CRAFT-01 scene quality beyond presence (named human + time-marker + sensory detail), CRAFT-03 central-image dominance across opening/middle/closing, CRAFT-04 vulnerability-beat authenticity, CRAFT-06 reader-moment concreteness, CRAFT-08 concrete:abstract noun ratio over 4-paragraph windows.
- **D-05:** craft-check.js is reusable: orchestrator's CRAFT-16 diagnostic step invokes the same script against edited chapters to produce the final pass/fail matrix.

### Revision Trigger Policy (CRAFT-17 interaction)
- **D-06:** Auto-revise on fail (hard gates): CRAFT-01 (scene-first missing/malformed), CRAFT-02 (Greek density over cap), CRAFT-05 (pulpit-seam at chapter or paragraph start). Writer is asked to rewrite only the failing section where possible; if rewrite scope is structural, full chapter revision.
- **D-07:** Flag-only in diagnostic report (no auto-rewrite): CRAFT-03 central image, CRAFT-04 vulnerability beat, CRAFT-06 reader moments, CRAFT-07 reader-thought lines, CRAFT-08 noun ratio. Rationale: forcing rewrites on judgment calls risks the divergent-improvement failure mode (Pitfall 6).
- **D-08:** 2-revision cap from CRAFT-17 applies. On exhaustion, keep the highest-scoring revision by captivation rubric total, append a flag to the diagnostic report with line citations, continue the pipeline (no pipeline halt, no user intervention required). User sees all flags at the Stage 4 review gate.
- **D-09:** Divergent-improvement detection: if revision N scores lower than revision N-1 on any sub-metric, accept N-1 and stop.

### Outliner Touch (central image + vulnerability beat assignment)
- **D-10:** Outliner IS modified in Phase 10 — research SUMMARY.md's "outliner unchanged" claim is superseded here.
- **D-11:** Outliner gains two new per-chapter fields written into the chapter outline and propagated into Book DNA: `central_image` (string — the dominant sensory anchor the writer must thread through opening/middle/closing) and `vulnerability_beat_seed` (string — a pointer to a source file line, voice-profile anecdote, or Book-DNA fragment the writer must draw from).
- **D-12:** Writer reads both fields as constraints, not suggestions. `vulnerability_beat_seed` must resolve to real source material — fabricated vulnerability is a CRAFT-04 fail.
- **D-13:** Outliner must ensure central_image values are distinct enough across chapters that they don't blur. Cross-chapter image coordination happens in the outliner, not the writer.

### Voice Profile: Reader Moments Section (CRAFT-06)
- **D-14:** spiritual-default.md MUST ship with a `Reader Moments` section — a curated list of ≥12 concrete reader-life moments (e.g. "the 2am phone-check", "the Sunday-night dread", "the grocery-aisle grief flash"). Writer selects ≥2 per chapter.
- **D-15:** voice-builder skill MUST extract/synthesise a Reader Moments section from analysed source material. Output conforms to the same section shape.
- **D-16:** User-supplied custom voice profiles MAY omit the section. When absent, editor runs CRAFT-06 in flag-only mode (no auto-revise, no hard fail). voice-profile-spec.md documents the section as recommended, not mandatory for custom profiles.

### Kill List Tracking (CRAFT-13)
- **D-17:** Subtractive voice-profile kill list is tracked inline in THIS context file under the `<kill_list>` section below, with before/after rule text for every v1 removal paired with a v2 addition.
- **D-18:** Editor pass of spiritual-default.md in Plan 7 must cap the profile at 150 lines total. Every v2 craft-driven addition requires a documented v1 removal. Net-zero-or-negative line count change.

### Provenance Comment Syntax (CRAFT-01)
- **D-19:** Writer emits an HTML comment as the first line of each chapter referencing the source file+line the scene opener was derived from. Four permitted provenance forms (any one of):
  - `<!-- provenance: sources/{file}.md:{line} -->` — raw source material
  - `<!-- provenance: sources-adapted/{file}.md:{line} -->` — sermon-adapter output (adapted source content)
  - `<!-- provenance: book-dna.md:{line} -->` — book DNA pointer (when scene derives from cross-chapter DNA fragment)
  - `<!-- provenance: voice-profile.md:{line} -->` — voice-profile anecdote (required path for vulnerability beats per D-12, since voice-profile is a permitted seed source for vulnerability_beat_seed)
- **D-20:** craft-check.js verifies presence and that the referenced path exists (resolution only, not semantic validation).
- **D-21:** Formatter strips ALL HTML comments before .docx emission. Editor passes leave comments intact for verification. This makes stripping the formatter's responsibility, not the editor's.
- **D-22:** Missing provenance = CRAFT-01 hard fail = auto-revise (per D-06).

### Diagnostic Report Shape (CRAFT-16) — Claude's Discretion with guardrails
- **D-23:** Per-chapter CRAFT-01..08 pass/fail matrix appended to `consistency-report.md` as a new section `## Bestseller Diagnostic`, with one subsection per chapter. Markdown table with columns: `Check | Pass/Fail | Evidence | Line`. Citations use chapter:line format. This is Claude's discretion to refine at plan time.

### Claude's Discretion
- Exact JSON schema for craft-check.js output (match D-03/D-04 split)
- Internal organisation of bestseller-craft-rules.md (must stay ≤200 lines per CRAFT-11, voice-agnostic)
- Exact layout of calibration before/after paragraphs (CRAFT-12) — score levels 3/6/9 anchored to paraphrased Eternally Secure Ch1 output
- Extended captivation-rubric.md component weighting (must stay 0-14 total per CRAFT-10)
- Orchestrator `--fresh` flag surface (CLI arg vs mode; delete-list already locked by CRAFT-14)
- Version stamp format — HTML comment `<!-- generated-by: book-crafter v1.1.0 -->` consistent with D-19 provenance syntax (stripped by formatter at the same stage)

### Folded Todos
_None — Phase 10 requirements are already comprehensive; no backlog todos folded._

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 10 Requirements & Research
- `.planning/REQUIREMENTS.md` §v1.1 CRAFT-01..CRAFT-17 — full countable-rule definitions
- `.planning/ROADMAP.md` §"Phase 10: Writing Quality v2" — goal, success criteria, locked build order
- `.planning/research/SUMMARY.md` — executive summary, build order, architecture decisions, pitfalls
- `.planning/research/FEATURES.md` — TS-01..TS-08 craft rule details (these became CRAFT-01..08)
- `.planning/research/ARCHITECTURE.md` — file-level change specifications
- `.planning/research/PITFALLS.md` — 23 pitfalls including Phase 7 post-mortem, evaluator deadlock, rule drift
- `.planning/phases/07-captivating-writing-modern-voice-profile-and-bestseller-formatting/07-VERIFICATION.md` — Phase 7 post-mortem evidence (framework presence ≠ output quality)

### Existing Skills That Get Modified
- `skills/writer/SKILL.md` — scene-first, Greek density, provenance, central image usage, vulnerability beat usage
- `skills/editor/SKILL.md` — Pass 1 new sub-sections (craft density, tension-release, pulpit-seam), Pass 2 scene-first strictness + cross-chapter craft, extended captivation rubric
- `skills/outliner/SKILL.md` — NEW fields central_image + vulnerability_beat_seed per chapter
- `skills/orchestrator/SKILL.md` — `--fresh` mode, version stamp wiring, CRAFT-16 diagnostic step
- `references/voice-profiles/spiritual-default.md` — subtractive audit, Reader Moments section
- `references/voice-profile-spec.md` — Reader Moments section documentation (recommended for custom profiles)
- `references/book-dna-template.md` — accommodate central_image + vulnerability_beat_seed fields
- `skills/voice-builder/SKILL.md` — generate Reader Moments section in output

### New Files (to create in Phase 10)
- `references/bestseller-craft-rules.md` (CRAFT-11, cap 200 lines, voice-agnostic)
- `references/captivation-rubric.md` (CRAFT-09, extracted from editor inline — no logic change on extract pass)
- `references/bestseller-calibration.md` (CRAFT-12, before/after at score levels 3/6/9)
- `scripts/craft-check.js` (deterministic checker, invoked by editor Pass 1 and orchestrator diagnostic step)

### External Docs (no new ones needed)
- No external specs — requirements fully captured in local planning and research artefacts above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **docx-js formatter**: already strips structural content at render — extending it to strip HTML comments is a small add, not a rewrite.
- **Editor Pass 1/2/3 structure**: already exists in `skills/editor/SKILL.md` — new sub-sections slot into Pass 1 without restructuring.
- **Subagent pattern (chapter-editor, chapter-writer)**: already handles per-chapter isolation. craft-check.js can be invoked from the subagent Bash context without new infrastructure.
- **Book DNA template**: already a per-book markdown artefact — adding central_image + vulnerability_beat_seed is a field addition, not a shape change.

### Established Patterns
- **Reference-file indirection**: writer + editor already read `references/*.md` at runtime. bestseller-craft-rules.md slots into this pattern cleanly.
- **Intermediate markdown chapters**: HTML comments survive markdown passes untouched, making provenance + version stamps feasible without touching the editor's text-manipulation logic.
- **Pipeline stage gates**: orchestrator already has clean stage transitions (Stage 0.5 → 1 → 2 → 3 → 4 → 4.5 → 5). `--fresh` mode intercepts before Stage 1 and version stamps attach at each stage's artefact emission.

### Integration Points
- Editor Pass 1 start: invoke `scripts/craft-check.js {chapter-path}` via Bash, parse JSON, merge into existing consistency report structure.
- Orchestrator `--fresh` flag: intercepts at project-init step, runs delete-list from CRAFT-14, preserves sources/, sources-adapted/, brief.md, voice-profile.md.
- Formatter `.docx` emission: new step strips `<!--...-->` patterns from chapter markdown before docx-js conversion.

</code_context>

<specifics>
## Specific Ideas

- Provenance citation format matches version stamp format — both HTML comments, both stripped at formatter stage. Consistent surface.
- Reader Moments in spiritual-default.md should be sourced from pastoral-experience anecdotes (the 2am phone-check, the Sunday-night dread) — concrete enough to pass CRAFT-06's specificity bar.
- craft-check.js should be pure-node, no dependencies beyond Node stdlib. No npm install at user's machine on plugin install.
- Diagnostic report per-chapter subsection should surface at the Stage 4 review gate so the user sees CRAFT failures alongside editor consistency flags in one place.

</specifics>

<kill_list>
## Voice Profile Kill List (CRAFT-13)

Subtractive audit tracker. Every v2 addition to `references/voice-profiles/spiritual-default.md` MUST pair with a v1 removal documented here before Phase 10 verification passes.

| # | V2 Addition | V1 Removal | Rationale |
|---|-------------|------------|-----------|
| 1 | `## Reader Moments` heading + CRAFT-06 intro line (3 lines) | Vocabulary > Avoid duplicate bullets: `"Let me explain"`, `"It is important to note"`, `"We must understand"`, `"Firstly, secondly, thirdly"`, `"In this chapter, we will..."`, `"The following points illustrate..."`, `"As previously mentioned"`, plus `"Filler phrases ("In conclusion", "Furthermore", "It is important to note that")"` (8 lines) | CRAFT-06 needs concrete reader scenes to anchor abstract claims. The removed Avoid bullets are already enumerated as blocked phrases inside the Lecture-tone Anti-Pattern, which was expanded inline to absorb them (`"in conclusion"`, `"furthermore"`, `"as previously mentioned"`, `"firstly, secondly, thirdly"`, `"in this chapter, we will"` added to the blocked-phrases list). Net: duplicates collapsed into one canonical location. |
| 2 | `### Anxiety` + 4 reader-moment bullets (5 lines) | Calibration Examples Example 2 body (6 lines) — "Greek word study woven into narrative with vulnerability" paragraph | Calibration body moves to `references/bestseller-calibration.md` Score Level 6 exemplar (Plan 6 creates that file). Voice profile keeps one compact example that still demonstrates the blend. |
| 3 | `### Grief` + 3 bullets (4 lines) | Calibration Examples Example 3 body (6 lines) — "Direct reader engagement with conversational theological depth" paragraph | Calibration body moves to `references/bestseller-calibration.md` Score Level 9 exemplar (Plan 6). |
| 4 | `### Doubt` + 3 bullets (4 lines) | Calibration Examples "What These Examples Show" summary block (8 lines — heading + 5 bullets + blank lines) | That summary duplicated what the rest of the voice profile already teaches (story-before-theology, vulnerability as trust, rhythm variation). Redundant once bestseller-calibration.md exists as the authoritative calibration source. |
| 5 | `### Joy` + 2 bullets (3 lines) + Reader Moments heading spacing | Emphasis Techniques overlap: `"Building momentum -- later points carry more weight than earlier ones"` and `"Closing declarations that land with force"` (2 lines) duplicated Sentence Patterns entries `"Building intensity through a section, with later sentences carrying more weight"` and `"Bold declarations -- confident theological statements..."`. Also trimmed Calibration Examples pointer prose from 2 lines to 1. | Overlap removed — Sentence Patterns is the canonical home for rhythm/intensity rules. |

**Line delta verification:** v1 = 123 lines; v2 = 119 lines; net = **-4 lines** (≤ 0 constraint satisfied).
**Theological Framework sha256:** `6762388c6cbc4a11ef5d560db3f7a2ff2bb9987c89db0b752f2d47b536adad5d` — verified byte-identical in v2 (lines 87-97).

**Cap:** spiritual-default.md ≤150 lines post-audit. Line delta must be ≤ 0.

</kill_list>

<deferred>
## Deferred Ideas

### From Research (v1.2 backlog, not Phase 10)
- DIFF-01: Sentence-length variance targeting — judgement-heavy, deferred
- DIFF-02: Chapter ending echo pattern — add in v1.2 after bestseller-calibration exemplars exist
- DIFF-03: Dialogue breaks requirement — genre-specific, belongs in non-theological voice profiles later
- DIFF-07: Targeted single-chapter rewrite mode — nice-to-have, not on milestone critical path

### Reviewed Todos (not folded)
_None — no backlog todos matched Phase 10 scope._

### Scope-creep candidates raised during discussion
_None — all four discussed areas stayed within Phase 10's enforcement/quality boundary._

</deferred>

---

*Phase: 10-writing-quality-v2*
*Context gathered: 2026-04-15*
