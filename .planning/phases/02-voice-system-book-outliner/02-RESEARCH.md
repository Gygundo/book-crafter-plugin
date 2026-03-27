# Phase 2: Voice System + Book Outliner - Research

**Researched:** 2026-03-27
**Domain:** Claude Code plugin skills (voice profiles, outliner logic, Book DNA generation, approval gates)
**Confidence:** HIGH

## Summary

Phase 2 replaces two stub skills (outliner) and implements the voice profile system, Book DNA generation, and outline approval gate. The entire phase is Claude Code skill authoring -- no external libraries, no runtime dependencies, no code beyond markdown skill instructions and reference files. The "stack" is SKILL.md files, reference markdown, and the `$ARGUMENTS` / `${CLAUDE_SKILL_DIR}` / `${CLAUDE_PLUGIN_ROOT}` substitution system already proven in Phase 1.

The voice system is a reference file pattern: `.md` files in `references/voice-profiles/` loaded by the orchestrator and injected into Book DNA. The outliner skill needs two modes (topic brief and source content ingestion), must produce `chapter-outline.md` with structured per-chapter metadata, and must generate the initial `book-dna.md`. The approval gate is already scaffolded in the orchestrator (the `<!-- APPROVED -->` marker pattern) -- Phase 2 just needs to ensure the outliner produces content the orchestrator can present for review.

**Primary recommendation:** Implement the outliner SKILL.md with full instructions for both modes, create the Book DNA generation logic as part of the outliner's output step, and enhance the orchestrator's Stage 1 invocation to pass voice profile selection and inline voice descriptions to the outliner.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| VOICE-01 | Voice profile system loads .md reference files defining tone, sentence patterns, vocabulary, emphasis techniques, anti-patterns | Reference file pattern already established. `references/voice-profiles/spiritual-default.md` exists with all sections. Outliner and orchestrator read from `${CLAUDE_PLUGIN_ROOT}/references/voice-profiles/`. |
| VOICE-02 | Ship with theological/spiritual default voice profile derived from sermon-crafter and brand-voice.md | `spiritual-default.md` already exists and is comprehensive (derived from sermon-crafter + brand-voice.md). Verify completeness against brand-voice.md sections. |
| VOICE-03 | Support custom .md voice profiles for non-theological genres | Drop-in file to `references/voice-profiles/`. Orchestrator already accepts voice profile selection. Need voice profile template/spec so custom profiles have consistent structure. |
| VOICE-04 | Support inline voice descriptions in the topic brief for one-off projects | Orchestrator must accept inline voice text, outliner must generate a transient voice profile from it and embed in Book DNA. |
| VOICE-05 | Book DNA master context document synthesises voice + theology + outline + themes + key terms into a single artefact all agents read | `references/book-dna-template.md` exists with all sections. Outliner must populate it after outline generation. |
| VOICE-06 | Book DNA is READ-ONLY during parallel chapter generation and updated only between pipeline stages | Already enforced by orchestrator instructions and chapter-writer/editor agent constraints. Outliner must add READ-ONLY marker. |
| OUTL-01 | Generate chapter-by-chapter outline from a topic brief (topic, key themes, target audience, optional scriptures) | Outliner SKILL.md must include detailed instructions for topic-brief mode. |
| OUTL-02 | Each chapter includes: title, opening hook strategy, key arguments, supporting scriptures, momentum position | Outline output format must be structured markdown with all fields per chapter. |
| OUTL-03 | Outline designs a narrative arc -- chapters escalate in intensity and revelation toward a climax | Outliner instructions must include arc design guidance with momentum positioning. |
| OUTL-04 | Outline approval gate -- user reviews and approves/modifies outline before drafting begins | Orchestrator already has the gate pattern (`<!-- APPROVED -->` marker). Outliner must produce review-friendly output. |
| OUTL-05 | Support three book size tiers: booklet (<100 pages, 5-8 chapters), short (15-25k words, 8-12 chapters), standard (40-60k words, 12-20 chapters) | Outliner must use size tier to determine chapter count range and per-chapter word targets. |
| OUTL-06 | Generate outline from existing content (sermon transcripts, notes, blog posts) by extracting themes and arguments | Outliner needs a source-ingestion mode that reads provided files, extracts themes/arguments/structure, then synthesises into chapter outline. |
| ITER-01 | Outline approval gate -- user reviews outline before any drafting begins | Duplicate of OUTL-04. Same implementation. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Claude Code Plugin System | Current (Agent Skills spec) | Skill authoring, reference files, `${CLAUDE_PLUGIN_ROOT}` substitution | This IS the execution environment. No alternative. **Confidence: HIGH** |
| Markdown (.md) | N/A | Voice profiles, Book DNA, chapter outlines, all intermediate artefacts | Claude's native format. Every skill reads/writes markdown. **Confidence: HIGH** |

### Supporting
No additional libraries needed. Phase 2 is entirely markdown skill authoring within the existing plugin scaffold.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Plain .md voice profiles | JSON/YAML structured profiles | Markdown is more natural for Claude to read and for humans to edit. JSON adds parsing complexity for zero benefit in a prompt-based system. |
| Inline Book DNA generation in outliner | Separate book-dna-generator skill | Over-engineering. The outliner is the natural place to generate Book DNA since it has all the inputs (outline + voice + metadata). |

## Architecture Patterns

### File Structure (What Phase 2 Creates/Modifies)
```
skills/
  outliner/
    SKILL.md              # REPLACE stub with full implementation
references/
  voice-profiles/
    spiritual-default.md  # EXISTS -- verify completeness, may need minor updates
    voice-profile-spec.md # NEW -- documents required sections for custom profiles
  book-dna-template.md    # EXISTS -- verify all sections match requirements
```

### Pattern 1: Voice Profile Reference File System
**What:** Voice profiles are plain `.md` files in `references/voice-profiles/` with a consistent section structure. The orchestrator copies the selected profile into the project directory. The outliner reads it and embeds the voice sections into Book DNA.
**When to use:** Always -- this is the only voice delivery mechanism.
**Structure of a voice profile:**
```markdown
# Voice Profile: [Name]

## Tone
[Overall tone description]

## Sentence Patterns
[Rhythm, fragment usage, length targets]

## Vocabulary
### Use
[Characteristic words and phrases]
### Avoid
[Anti-patterns, banned phrases]

## Emphasis Techniques
[How to create impact]

## Theological/Domain Framework (optional)
[Interpretive lens -- only for domain-specific profiles]

## Anti-Patterns (Never Do This)
[Voice-breaking behaviours]

## Scripture Handling (optional)
[Default translation, quoting style -- only for theological profiles]
```

### Pattern 2: Two-Mode Outliner
**What:** The outliner operates in two modes based on input type:
- **Topic Brief Mode:** User provides topic, themes, audience, optional scriptures. Outliner generates structure from scratch.
- **Source Ingestion Mode:** User provides paths to existing content (sermon transcripts, notes, blog posts). Outliner reads the source material, extracts themes/arguments/key quotes, then synthesises into a chapter structure.
**When to use:** The orchestrator determines mode based on what the user provides. If file paths or content files are present, use Source Ingestion. Otherwise, use Topic Brief.

### Pattern 3: Structured Outline Output Format
**What:** The outliner produces `chapter-outline.md` in a specific format that downstream stages can parse.
**Format:**
```markdown
# Book Outline: [Title]

## Book Arc
[Opening tension] -> [Progressive revelation] -> [Climactic truth] -> [Resolution]

## Size Tier
[booklet | short | standard]
Target: [total word count], [chapter count] chapters, ~[per-chapter words] words/chapter

## Chapter 1: [Title]
- **Hook strategy:** [Bold declaration | Rhetorical question | Counter-intuitive claim | Tension-creating observation] -- [specific hook description]
- **Core argument:** [The central claim this chapter makes]
- **Key arguments:**
  1. [Argument 1]
  2. [Argument 2]
  3. [Argument 3]
- **Supporting scriptures:** [Scripture 1], [Scripture 2], ...
- **Momentum position:** [Foundation | Building | Accelerating | Climax | Landing]
- **Connects to:** Ch [X] (foreshadows...), Ch [Y] (builds on...)

## Chapter 2: [Title]
...
```

### Pattern 4: Book DNA Generation (Outliner Output Step)
**What:** After the outline is approved, the outliner populates `book-dna.md` from the template. This is a synthesis step that combines: outline metadata, voice profile content, chapter map, running themes, key terms, and cross-chapter continuity notes.
**When:** Immediately after outline approval, before the orchestrator advances to Stage 2.
**Critical:** The orchestrator already has the flow: outline -> approval -> proceed. The outliner must include Book DNA generation as its final step post-approval. The orchestrator's Stage 1 section already references "Output: chapter-outline.md, book-dna.md".

### Pattern 5: Inline Voice Description Handling
**What:** When the user provides an inline voice description instead of a profile file, the orchestrator writes it to `voice-profile.md` in the project directory with a standardised header. The outliner reads this file the same way it reads any voice profile.
**Implementation:** The orchestrator already copies the voice profile to the project's `voice-profile.md`. For inline descriptions, the orchestrator wraps the user's text in the voice profile structure (Tone, Sentence Patterns, Vocabulary sections), marking sections the user didn't specify as "[Not specified -- use neutral, clear prose]".

### Anti-Patterns to Avoid
- **Hardcoding voice into skills:** Voice must come from the profile file, never baked into SKILL.md instructions. This is already decided (STACK.md: "Never. Voice profiles must be shared across all skills and subagents.")
- **Outline without structured fields:** Free-form outlines break downstream parsing. Every chapter MUST have the fields listed in OUTL-02.
- **Generating Book DNA before approval:** Book DNA should only be populated after the user approves the outline. Generating it prematurely wastes work if the outline changes.
- **Skipping momentum positioning:** Each chapter needs an explicit momentum position (Foundation/Building/Accelerating/Climax/Landing) to enforce OUTL-03's narrative arc requirement.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Voice profile loading | Custom file-reading logic in each skill | `${CLAUDE_PLUGIN_ROOT}/references/voice-profiles/` + orchestrator copies to project | Already decided in Phase 1. Orchestrator handles profile selection and copying. |
| Outline format parsing | Regex or structured parsing of outline | Consistent markdown heading convention (`## Chapter N: Title`) | Claude reads markdown natively. Downstream skills grep for `## Chapter` headings. Already established in orchestrator's chapter count detection. |
| Approval gate mechanism | Custom approval tracking | `<!-- APPROVED -->` marker in `chapter-outline.md` | Already implemented in orchestrator's state detection algorithm. |
| Book DNA template | Inline template strings | `${CLAUDE_PLUGIN_ROOT}/references/book-dna-template.md` | Template already exists. Outliner reads and populates it. |

## Common Pitfalls

### Pitfall 1: Voice Profile Drift Between Template and Implementation
**What goes wrong:** The voice profile sections in `spiritual-default.md` don't match the sections expected in `book-dna-template.md`, causing the outliner to miss fields or produce inconsistent Book DNA.
**Why it happens:** Two files maintained separately with no validation that their structures align.
**How to avoid:** Create a `voice-profile-spec.md` reference document that defines the required sections. Both the default profile and custom profiles must follow this spec. The outliner validates against it.
**Warning signs:** Book DNA has empty voice sections or sections that don't match the profile.

### Pitfall 2: Source Ingestion Mode Produces Thin Outlines
**What goes wrong:** When generating outlines from existing content (sermons, notes), the outliner simply mirrors the source structure instead of synthesising a proper book structure. A 6-sermon series becomes 6 chapters that read like sermon transcripts, not a book.
**Why it happens:** Claude tends to preserve source structure unless explicitly instructed to transform it.
**How to avoid:** Outliner instructions must explicitly state: "Extract themes and arguments from source material, then design a NEW book structure. Do not mirror the source's organisation. A sermon series and a book have different rhythms."
**Warning signs:** Chapter titles that match sermon titles exactly, chapters that feel like standalone talks rather than parts of a narrative arc.

### Pitfall 3: Outline Approval Gate Gets Bypassed in Full Pipeline Mode
**What goes wrong:** When running the full pipeline, the approval gate is skipped and the system proceeds to research/writing with an unreviewed outline.
**Why it happens:** Orchestrator's Full Pipeline mode auto-advances between stages.
**How to avoid:** Already handled -- the orchestrator explicitly states "Always pause at the outline approval gate -- this is never skipped." Verify this is preserved when updating the orchestrator.
**Warning signs:** Research or draft files exist without `<!-- APPROVED -->` marker in `chapter-outline.md`.

### Pitfall 4: Inline Voice Descriptions Are Too Vague
**What goes wrong:** User provides "write it casually" as an inline voice description. The resulting voice profile has no sentence patterns, no vocabulary guidance, no anti-patterns. Downstream chapters have inconsistent voice.
**Why it happens:** Inline descriptions are inherently less detailed than curated profiles.
**How to avoid:** When the outliner receives an inline voice description, it should expand it into a full voice profile by inferring reasonable defaults for missing sections. The outliner should note which sections were inferred vs. specified.
**Warning signs:** Book DNA voice section is sparse (under 100 words).

### Pitfall 5: Book Size Tier Not Propagated to Chapter Word Counts
**What goes wrong:** Outline says "standard book" but doesn't calculate per-chapter word targets. Chapter writers later have no word count guidance.
**Why it happens:** Size tier is set at project level but not translated into actionable per-chapter targets.
**How to avoid:** Outliner must calculate and include per-chapter word targets based on size tier:
- Booklet: 15-20K total, 5-8 chapters = ~2,500-3,500 words/chapter
- Short: 15-25K total, 8-12 chapters = ~1,800-2,500 words/chapter
- Standard: 40-60K total, 12-20 chapters = ~3,000-4,000 words/chapter
**Warning signs:** Chapter outline has no word count targets.

## Code Examples

### Outliner SKILL.md Structure (Key Sections)

The outliner is a model-invocable skill called by the orchestrator. It receives context via `$ARGUMENTS` (project directory path and mode indicator).

```markdown
---
name: outliner
description: "Generate a chapter-by-chapter book outline..."
user-invocable: false
allowed-tools: Read, Write, Bash, Grep, Glob
---

# Book Outliner

## 1. On Invocation

Read the following from the project directory ($ARGUMENTS):
1. `book-dna.md` -- for metadata (title, size tier, author)
2. `voice-profile.md` -- for voice characteristics

## 2. Determine Mode

- If source content files exist in the project directory, use Source Ingestion Mode
- Otherwise, use Topic Brief Mode

## 3. Topic Brief Mode
[Detailed instructions for generating from scratch]

## 4. Source Ingestion Mode
[Detailed instructions for reading, extracting, synthesising]

## 5. Output: chapter-outline.md
[Structured format specification]

## 6. Post-Approval: Generate Book DNA
[Instructions for populating book-dna.md after user approval]
```

### Voice Profile Spec Reference Document

```markdown
# Voice Profile Specification

Every voice profile (.md file in references/voice-profiles/) MUST contain these sections:

## Required Sections
1. **Tone** -- Overall tonal quality (bold/gentle, direct/reflective, etc.)
2. **Sentence Patterns** -- Rhythm, average length, fragment usage, repetition patterns
3. **Vocabulary** -- Use (characteristic words) and Avoid (banned words/phrases)
4. **Emphasis Techniques** -- How to create impact (declarations, questions, repetition, etc.)
5. **Anti-Patterns** -- Behaviours that break this voice

## Optional Sections
6. **Theological/Domain Framework** -- Interpretive lens for domain-specific content
7. **Scripture Handling** -- Translation defaults, quoting style (theological only)

## Validation
A voice profile is valid if sections 1-5 are present and non-empty.
```

### Orchestrator Update: Inline Voice Handling

The orchestrator's project creation flow (Section 2 of the existing SKILL.md) needs an addition for inline voice descriptions:

```markdown
### Voice Profile Selection

When the user specifies a voice:

1. **Named profile** (e.g., "spiritual-default"):
   Read from `${CLAUDE_PLUGIN_ROOT}/references/voice-profiles/[name].md`
   Copy to `[project]/voice-profile.md`

2. **Custom file path** (e.g., "/path/to/my-voice.md"):
   Read the file, validate it has the required sections (Tone, Sentence Patterns, Vocabulary, Emphasis Techniques, Anti-Patterns)
   Copy to `[project]/voice-profile.md`

3. **Inline description** (e.g., "casual, conversational, like talking to a friend"):
   Generate a voice profile from the description:
   - Expand the description into Tone, Sentence Patterns, Vocabulary, Emphasis Techniques, Anti-Patterns
   - Mark inferred sections with <!-- INFERRED -->
   - Write to `[project]/voice-profile.md`

4. **No voice specified**:
   Use `${CLAUDE_PLUGIN_ROOT}/references/voice-profiles/spiritual-default.md`
   Copy to `[project]/voice-profile.md`
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Inline voice instructions per skill | Shared voice profile reference files | Phase 1 decision | Voice profiles are swappable without code changes |
| Single-mode outliner | Two-mode outliner (topic brief + source ingestion) | STACK.md decision | Supports both greenfield books and sermon-to-book conversion |
| Manual Book DNA creation | Auto-generated from outline + voice profile | Phase 2 design | Reduces manual work, ensures consistency |

## Open Questions

1. **Source Ingestion: How are source files provided?**
   - What we know: The orchestrator gathers "Topic brief or description -- can be a collection of sermon transcripts, notes, or an existing outline" from the user.
   - What's unclear: Are source files provided as file paths, pasted inline, or placed in a specific directory? The orchestrator's project creation asks for a "topic brief or description" but doesn't specify file handling.
   - Recommendation: Accept both. If the user provides file paths, read them. If they paste content inline, save it to a `sources/` directory in the project. The orchestrator should create `sources/` during project setup and the outliner should check it for content.

2. **Book DNA: When exactly is it fully populated?**
   - What we know: The orchestrator says "Output: chapter-outline.md, book-dna.md" for Stage 1. The template exists.
   - What's unclear: Should the outliner generate a partial Book DNA before approval (metadata + voice only) and then complete it after approval (adding chapter map, themes, continuity)? Or generate everything after approval?
   - Recommendation: Two-step approach. During project creation, the orchestrator already populates Book DNA metadata. After outline approval, the outliner completes the remaining sections (Chapter Map, Running Themes, Key Terms, Cross-Chapter Continuity, Style Rules). This matches the orchestrator's existing flow.

3. **Voice profile validation: How strict?**
   - What we know: Custom profiles need consistent structure to work with Book DNA generation.
   - What's unclear: Should missing sections cause a hard failure or should the system fill defaults?
   - Recommendation: Warn but proceed. If a custom profile is missing required sections, the outliner should warn the user and fill missing sections with sensible defaults marked `<!-- DEFAULT -->`. Hard failures would break the flow for users who provide minimal profiles.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual validation (Claude Code plugin skills are prompt-based, not unit-testable) |
| Config file | None -- skills are markdown instructions executed by Claude |
| Quick run command | Invoke orchestrator with a test book project |
| Full suite command | Run through full pipeline to Stage 1 completion with outline approval |

### Phase Requirements to Test Map
| Req ID | Behaviour | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| VOICE-01 | Voice profile loads from references/voice-profiles/ | manual | Invoke orchestrator, verify voice-profile.md copied to project | N/A |
| VOICE-02 | Default theological voice profile is comprehensive | manual | Read spiritual-default.md, verify all spec sections present | N/A |
| VOICE-03 | Custom .md voice profiles work | manual | Create custom profile, invoke orchestrator with it, verify Book DNA reflects custom voice | N/A |
| VOICE-04 | Inline voice descriptions generate a profile | manual | Provide inline description during project creation, verify voice-profile.md generated | N/A |
| VOICE-05 | Book DNA synthesises voice + outline + themes | manual | Complete outline + approval, verify book-dna.md has all sections populated | N/A |
| VOICE-06 | Book DNA is READ-ONLY during parallel generation | manual | Verify chapter-writer.md and chapter-editor.md contain "Do NOT modify the Book DNA" constraint | Exists (agents/) |
| OUTL-01 | Generate outline from topic brief | manual | Invoke orchestrator with topic brief, verify chapter-outline.md created | N/A |
| OUTL-02 | Each chapter has required fields | manual | Inspect chapter-outline.md for title, hook, arguments, scriptures, momentum | N/A |
| OUTL-03 | Narrative arc with escalation | manual | Verify momentum positions escalate (Foundation -> Building -> Accelerating -> Climax -> Landing) | N/A |
| OUTL-04 | Approval gate blocks drafting | manual | Verify orchestrator pauses for approval, verify `<!-- APPROVED -->` marker added only after approval | N/A |
| OUTL-05 | Three size tiers produce appropriate chapter counts | manual | Test each tier, verify chapter count within range and word targets calculated | N/A |
| OUTL-06 | Generate outline from existing content | manual | Provide sermon transcripts, verify themes extracted and synthesised into book structure | N/A |
| ITER-01 | Outline approval gate | manual | Same as OUTL-04 | N/A |

### Sampling Rate
- **Per task commit:** Read modified SKILL.md files, verify structure and completeness
- **Per wave merge:** Invoke orchestrator with a test book to verify end-to-end Stage 1 flow
- **Phase gate:** Full Stage 1 run (topic brief mode + source ingestion mode) with outline approval

### Wave 0 Gaps
None -- this phase produces markdown skill files, not testable code. Validation is human verification of skill instructions and reference file structure.

## Sources

### Primary (HIGH confidence)
- [Claude Code Skills documentation](https://code.claude.com/docs/en/skills) -- Skill authoring conventions, frontmatter fields, supporting files, `${CLAUDE_PLUGIN_ROOT}` substitution, `${CLAUDE_SKILL_DIR}` substitution. Fetched 2026-03-27.
- Existing plugin codebase (Phase 1 output) -- `skills/orchestrator/SKILL.md`, `skills/outliner/SKILL.md` (stub), `references/voice-profiles/spiritual-default.md`, `references/book-dna-template.md`, `references/pipeline-stages.md`, `agents/chapter-writer.md`, `agents/chapter-editor.md`. All verified locally.
- David's sermon-crafter skill (`~/.claude/skills/sermon-crafter/SKILL.md`) -- Voice patterns, theological framework, sermon structure that informs book outliner design. Verified locally.
- Encounter content-engine brand-voice.md (`~/.claude/plugins/encounter-content-engine/references/brand-voice.md`) -- Source for theological framework, tone levels, anti-patterns. Verified locally.

### Secondary (MEDIUM confidence)
- Phase 1 STACK.md decisions (embedded in CLAUDE.md) -- Two-mode outliner, voice profile swap pattern, Book DNA context sharing. These are project decisions, not external sources.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No external dependencies, all Claude Code native patterns
- Architecture: HIGH - Building on proven Phase 1 patterns, extending existing files
- Pitfalls: HIGH - Derived from direct inspection of existing code and known Claude behaviour patterns

**Research date:** 2026-03-27
**Valid until:** Indefinite (no external dependencies that change; Claude Code plugin spec is stable)
