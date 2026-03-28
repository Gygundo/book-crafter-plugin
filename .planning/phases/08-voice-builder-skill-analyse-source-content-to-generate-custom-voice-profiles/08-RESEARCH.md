# Phase 8: Voice Builder Skill - Research

**Researched:** 2026-03-28
**Domain:** NLP-style text analysis via Claude, voice profile generation, Claude Code skill authoring
**Confidence:** HIGH

## Summary

Phase 8 creates a new `book-crafter:voice-builder` skill that analyses a directory of markdown files and produces a voice profile conforming to `voice-profile-spec.md`. The skill is both standalone (user-invocable) and integrated into the orchestrator as a fifth voice selection option ("Build from source material").

The technical challenge is not library selection -- there are no external dependencies. The skill runs entirely within Claude's context, using Claude itself as the analysis engine. The challenge is designing a two-pass analysis algorithm that extracts meaningful, reproducible voice characteristics from a corpus of markdown files, then synthesising those findings into a profile that matches the quality level of `spiritual-default.md`.

**Primary recommendation:** Build the skill as a single SKILL.md with a two-pass architecture (statistical extraction then synthesis), an approval gate mirroring the outliner pattern, and a lightweight orchestrator integration that adds a fifth voice selection mode. No new subagents, no external libraries, no npm packages.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01: Accept markdown files only (.md). Users convert other formats before running.
- D-02: User provides a directory path. Builder recursively scans for .md files.
- D-03: Soft minimum corpus size -- recommend 5+ files / 10,000+ words. Warn if below threshold but proceed, marking less-confident sections with INFERRED markers.
- D-04: Analyse everything in the directory. No auto-filtering of short files, outlines, or rough notes.
- D-05: Two-pass analysis. Pass 1: Read all files, extract statistical patterns. Pass 2: Synthesise findings into voice profile sections.
- D-06: Extract all four linguistic feature categories: sentence patterns & rhythm, vocabulary & word choice, tone & emotional register, structural patterns.
- D-07: Auto-detect domain framework from source content, present to user for confirmation or override.
- D-08: Calibration examples -- CORRECT examples extracted from source material; WRONG examples generated synthetically.
- D-09: Draft with review gate. Present summary, let user approve or adjust before saving.
- D-10: Auto-name the profile from detected content characteristics. User can rename during review.
- D-11: New profile only -- always creates fresh. No merge/update mode.
- D-12: Both standalone and orchestrator-integrated.
- D-13: Generated profiles saved to `references/voice-profiles/` alongside spiritual-default.md.
- D-14: Orchestrator integration: add "Build from source material" as fifth voice selection option.

### Claude's Discretion
- How to structure the two-pass analysis internally (chunking strategy, statistical extraction methods)
- What constitutes a "confident" vs "INFERRED" section when corpus is below recommended size
- How to handle contradictory voice signals across source files
- How to present the review summary -- level of detail, formatting
- The specific auto-naming algorithm

### Deferred Ideas (OUT OF SCOPE)
- Genre-specific voice profile templates
- Profile merge/update mode
- Non-markdown input support (.docx, .txt, .pdf)
- Voice comparison tool
</user_constraints>

<phase_requirements>
## Phase Requirements

This phase does not map to existing v1 requirement IDs in REQUIREMENTS.md. It was added as a post-v1 enhancement based on user feedback (memory: feedback_voice_builder.md). The implicit requirements are:

| ID | Description | Research Support |
|----|-------------|------------------|
| VB-01 | Skill analyses markdown files from a directory to extract voice characteristics | Two-pass analysis architecture, corpus scanning pattern |
| VB-02 | Output conforms to voice-profile-spec.md (5 required + 2 optional sections) | Voice profile spec validation rules, spiritual-default.md as reference |
| VB-03 | Review gate before saving -- user approves or adjusts generated profile | Outliner approval gate pattern reuse |
| VB-04 | Orchestrator integration as fifth voice selection option | Orchestrator voice selection section modification |
| VB-05 | Generated profiles immediately usable by pipeline | Save to references/voice-profiles/, same format as spiritual-default.md |
| VB-06 | INFERRED markers on low-confidence sections (small corpus) | Phase 2 inline voice handling pattern |
| VB-07 | Domain framework auto-detection with user confirmation | Phase 3 research mode auto-detection pattern |
| VB-08 | Calibration examples -- real excerpts as CORRECT, synthetic as WRONG | Phase 7 calibration example conventions |
</phase_requirements>

## Standard Stack

### Core
| Technology | Version | Purpose | Why Standard |
|------------|---------|---------|--------------|
| Claude Code Plugin System | Current | Skill definition, orchestrator integration | This IS the execution environment. No alternative. |
| Markdown (.md) | N/A | Input format (source files), output format (voice profile) | Locked by D-01. Claude's native format. |

### Supporting
None. This phase requires no external libraries. All analysis is performed by Claude within the skill context. No npm packages, no Python scripts, no external tools.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Claude-native analysis | NLP libraries (natural, compromise) | Unnecessary complexity. Claude IS the NLP engine. Statistical patterns (sentence length, word frequency) can be computed with simple JS in Bash tool if needed, but Claude can estimate these from reading the text. |
| Markdown-only input | Multi-format (.docx, .txt, .pdf) | Deferred by user decision D-01. Obsidian vaults are .md. |

## Architecture Patterns

### New Files to Create

```
skills/
  voice-builder/
    SKILL.md          # The voice builder skill (user-invocable: true)
```

Plus modifications to:
```
skills/orchestrator/SKILL.md   # Add Mode 5 voice selection option + integration logic
```

### Pattern 1: Two-Pass Analysis Architecture

**What:** Pass 1 reads all source files and extracts concrete statistical patterns. Pass 2 synthesises those patterns into voice profile prose.

**When to use:** Always -- this is the locked decision (D-05).

**Pass 1 (Statistical Extraction):**

The skill reads all .md files from the provided directory, then analyses across four categories:

1. **Sentence Patterns & Rhythm:**
   - Average sentence length (word count)
   - Sentence length distribution (short/medium/long proportions)
   - Fragment usage frequency
   - Rhetorical question frequency
   - Repetition patterns (anaphora, epistrophe)
   - Intensity building patterns

2. **Vocabulary & Word Choice:**
   - Most frequent distinctive words (excluding stop words)
   - Characteristic phrases (2-3 word combinations that recur)
   - Register level (formal/conversational/mixed)
   - Domain-specific terminology
   - Words/phrases never used (notable absences)

3. **Tone & Emotional Register:**
   - Directness level (hedging vs assertion)
   - Emotional warmth (personal pronouns, vulnerability markers)
   - Authority posture (declarative vs exploratory)
   - Formality spectrum position
   - Humour/wit usage

4. **Structural Patterns:**
   - Average paragraph length
   - Argument building approach (deductive/inductive/narrative)
   - Transition patterns between ideas
   - Story/anecdote usage frequency
   - Emphasis techniques (bold, italics, repetition, short sentences)

**Implementation approach:** Claude reads the source files and performs analysis using its language understanding. For large corpora (many files), chunk into batches -- read 3-5 files at a time, extract patterns from each batch, then aggregate across batches. This avoids context window saturation.

**Pass 2 (Synthesis):**

Using the statistical evidence from Pass 1, generate each voice profile section with specific examples drawn from the source material. Every claim in the profile must be backed by evidence from Pass 1.

### Pattern 2: Corpus Size Confidence Tiers

**What:** Map corpus size to confidence levels for each profile section.

| Corpus Size | Confidence | Handling |
|-------------|------------|----------|
| 10,000+ words, 5+ files | HIGH | All sections generated without markers |
| 5,000-10,000 words or 3-4 files | MEDIUM | Sections generated, borderline ones marked <!-- INFERRED --> |
| Under 5,000 words or 1-2 files | LOW | Warn user, all sections marked <!-- INFERRED -->, recommend adding more source material |

**What triggers INFERRED:** A section is marked INFERRED when the pattern it describes was observed in fewer than 3 distinct source files, OR when the corpus is below the recommended threshold and the pattern could be an artifact of limited data.

### Pattern 3: Review Gate (Mirrors Outliner)

**What:** After generating the profile, present a summary to the user for approval before saving.

The review summary should include:
- Detected voice characteristics (bullet summary of each section)
- Detected domain (if any) -- e.g., "Theological (grace-based, charismatic)" or "Leadership/self-help"
- Confidence level per section
- Auto-generated filename
- Total corpus analysed (file count, word count)
- Any INFERRED sections flagged

User can: approve (save), adjust (modify specific sections), or regenerate (run analysis again with different parameters).

### Pattern 4: Domain Framework Auto-Detection

**What:** Scan source content for domain-specific signals and auto-detect the appropriate framework.

**Detection signals:**
- **Theological:** Scripture references, theological terms (grace, covenant, faith, salvation, kingdom), prayer language, worship references
- **Leadership:** Management terminology, team dynamics, organizational concepts, strategy language
- **Self-help:** Personal development language, habit/routine references, mindset terminology
- **Teaching/Academic:** Citation patterns, formal argument structure, hedging language
- **Conversational/Memoir:** First-person narrative, personal anecdotes, emotional language

Present the detection to the user: "I detected a [domain] framework in your writing. Should I include a [Domain] Framework section in the profile? You can also override this."

### Pattern 5: Calibration Example Selection

**What:** Extract real passages as CORRECT examples and generate synthetic WRONG examples.

**CORRECT examples (3):** Select 3 passages (100-200 words each) from the source material that best exemplify the detected voice. Choose passages that demonstrate different aspects: one showing tone, one showing vocabulary/rhythm, one showing structural approach.

**WRONG examples (3):** Generate synthetic examples showing common drift patterns that would break this specific voice:
- Academic drift (hedging, passive voice, formal register)
- Generic AI drift (balanced, neutral, hedge-everything)
- Opposite-tone drift (if voice is bold, show timid; if warm, show clinical)

### Pattern 6: Auto-Naming Algorithm

**What:** Generate a filename from detected characteristics.

Algorithm:
1. Take the detected domain (if any): "pastoral", "leadership", "teaching", etc.
2. Take the primary tone descriptor: "conversational", "bold", "reflective", etc.
3. Combine: `{domain}-{tone}.md` or just `{tone}.md` if no domain detected
4. Sanitise: lowercase, hyphens only, no special characters

Examples: `pastoral-teaching.md`, `leadership-conversational.md`, `bold-narrative.md`

### Anti-Patterns to Avoid
- **Generating a profile that looks like spiritual-default.md regardless of input:** The builder must extract ACTUAL voice characteristics, not default to the theological template. If the source material is casual blog posts, the profile should reflect that.
- **Over-abstraction in Pass 1:** Don't just say "the author uses short sentences". Quantify: "average sentence length is 14 words, with 30% fragments under 5 words."
- **Ignoring contradictions:** Source material may have inconsistent voice (formal articles mixed with casual notes). The builder should acknowledge this and either pick the dominant voice or note the range.
- **Profile inflation:** Don't make the voice sound more sophisticated than it actually is. Authenticity over polish (per CONTEXT.md specifics).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Voice profile structure | Custom profile format | voice-profile-spec.md template | Spec already defines the 5+2 sections, validation rules, and Book DNA mapping |
| Approval gate UX | New interaction pattern | Outliner approval gate pattern | Already proven in Phase 2, users understand it |
| INFERRED markers | New confidence system | Phase 2 `<!-- INFERRED -->` convention | Consistent with existing inline voice handling |
| Domain detection signals | Complex NLP classifier | Claude's language understanding | Claude can detect theological vs leadership vs teaching content natively |
| Calibration examples | Abstract descriptions | Phase 7 concrete example pattern | Calibration examples are original prose, not abstract rules |

## Common Pitfalls

### Pitfall 1: Context Window Overflow on Large Corpora
**What goes wrong:** Trying to read an entire Obsidian vault (potentially hundreds of files, millions of words) into a single context window.
**Why it happens:** Naive implementation reads all files before analysis.
**How to avoid:** Chunk the corpus. Read 3-5 files at a time, extract patterns from each batch, then aggregate. Pass 1 should produce a structured intermediate summary, not hold all text in context.
**Warning signs:** Skill failing or producing truncated output when pointed at large directories.

### Pitfall 2: Producing a Generic Profile Regardless of Input
**What goes wrong:** The generated profile reads like a templated response rather than reflecting the actual source material's voice.
**Why it happens:** Claude's tendency to generate "helpful, balanced" content overrides the specific patterns found in the source.
**How to avoid:** Pass 2 must reference specific evidence from Pass 1. Every profile section should cite concrete examples from the source corpus. The review summary should show the user "here's what I found in YOUR writing."
**Warning signs:** Generated profile sounds similar regardless of wildly different input corpora.

### Pitfall 3: INFERRED Markers Everywhere
**What goes wrong:** Even with a large corpus, too many sections get marked INFERRED because the thresholds are too aggressive.
**Why it happens:** Overly strict confidence criteria.
**How to avoid:** INFERRED should only trigger below the recommended corpus size OR when a specific pattern genuinely has insufficient evidence. With 10,000+ words and 5+ files, most sections should be HIGH confidence.
**Warning signs:** User provides a substantial corpus and sees INFERRED on most sections.

### Pitfall 4: Orchestrator Integration Breaking Existing Modes
**What goes wrong:** Adding the fifth voice selection option accidentally changes the logic for the existing four modes.
**Why it happens:** Editing the orchestrator voice selection section without careful attention to the existing flow.
**How to avoid:** The fifth option is additive only. It triggers the voice builder, which produces a profile file, then the orchestrator continues with Mode 1 logic (using the generated profile as a named profile). The existing four modes must remain untouched.
**Warning signs:** Existing voice selection (default, custom, inline, project) stops working after the integration.

### Pitfall 5: Scanning Non-Content Markdown Files
**What goes wrong:** The builder picks up template files, configuration files, or other non-prose markdown in the directory.
**Why it happens:** D-04 says "analyse everything" -- but some .md files in a vault may be Obsidian configuration, templates, or metadata.
**How to avoid:** Per D-04, the builder analyses ALL .md files. This is intentional. The statistical analysis should be robust enough that a few outlier files don't skew results. The review gate is the safety net -- the user sees what was detected and can adjust.
**Warning signs:** Profile reflects formatting patterns from template files rather than prose content.

## Code Examples

### SKILL.md Frontmatter Pattern
```yaml
---
name: voice-builder
description: "Analyse a directory of markdown files to generate a custom voice profile. Can be invoked standalone or through the orchestrator during voice selection. Triggers on: 'build voice profile', 'analyse my writing', 'extract voice', 'voice from my content', 'generate voice profile'."
user-invocable: true
allowed-tools: Read, Write, Bash, Grep, Glob
---
```
Source: Consistent with all existing skills in the plugin (researcher, outliner, etc.)

### Orchestrator Voice Selection Extension
The orchestrator currently supports 4 modes in Section 2 (Voice Profile Selection). The fifth option adds:

```markdown
**Mode 5: Build from source material** (user wants to analyse existing writing):
1. Ask for the directory path containing source material
2. Invoke the `book-crafter:voice-builder` skill with the directory path
3. The voice builder analyses the content and presents a profile for review
4. On approval, the generated profile is saved to `${CLAUDE_PLUGIN_ROOT}/references/voice-profiles/[auto-name].md`
5. Copy the approved profile to `[project]/voice-profile.md`
6. Continue with pipeline (proceed to outline stage)
```

### Corpus Statistics Collection (Pass 1 Helper)
```bash
# Count .md files and total word count in a directory
find [directory] -name "*.md" -type f | wc -l
find [directory] -name "*.md" -type f -exec cat {} + | wc -w
```
Source: Standard Unix tools, used for corpus size assessment before analysis begins.

### Voice Profile Output Structure
The generated profile must match this structure (from voice-profile-spec.md):
```markdown
# Voice Profile: [Auto-Generated Name]

> Built from [N] source files ([M] words) in [directory path].
> Generated by book-crafter:voice-builder on [date].

<!-- Validated against voice-profile-spec.md. All required sections (1-5) present. -->

## Tone
[Generated from Pass 2 synthesis]

## Sentence Patterns
[Generated from Pass 1 statistics + Pass 2 synthesis]

## Vocabulary

### Use
[Extracted characteristic words/phrases with examples from source]

### Avoid
[Inferred anti-patterns -- what would break this voice]

## Emphasis Techniques
[Detected emphasis patterns with source examples]

## Anti-Patterns (Never Do This)
[Generated guardrails based on what the source voice is NOT]

## [Domain] Framework (optional)
[Only if domain detected and user confirmed]

## Calibration Examples (optional)

### Target Quality
[3 real excerpts from source material]

### What to Avoid
[3 synthetic counter-examples]
```

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual validation (no automated test framework in this plugin) |
| Config file | None -- plugin is a collection of SKILL.md files, not executable code |
| Quick run command | Manual: invoke `book-crafter:voice-builder` with a test corpus |
| Full suite command | Manual: run voice builder, then run full pipeline with generated profile |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| VB-01 | Analyses .md files from directory | manual | Point at test corpus, verify analysis | N/A |
| VB-02 | Output conforms to voice-profile-spec | manual | Check generated profile has 5 required sections | N/A |
| VB-03 | Review gate before saving | manual | Verify skill pauses for approval | N/A |
| VB-04 | Orchestrator fifth option works | manual | Create project, select "Build from source material" | N/A |
| VB-05 | Generated profile usable by pipeline | integration | Run pipeline with generated profile, verify Book DNA populates | N/A |
| VB-06 | INFERRED markers on small corpus | manual | Run with < 5 files, check for markers | N/A |
| VB-07 | Domain auto-detection | manual | Run on theological content, verify detection | N/A |
| VB-08 | Calibration examples present | manual | Check CORRECT examples are real excerpts, WRONG are synthetic | N/A |

### Sampling Rate
- **Per task:** Read generated SKILL.md, verify structure and completeness
- **Per wave:** Verify orchestrator integration does not break existing voice selection modes
- **Phase gate:** Full manual test: point builder at a real Obsidian vault or content directory

### Wave 0 Gaps
None -- this phase produces SKILL.md files (declarative instructions), not executable code. No test infrastructure needed.

## Open Questions

1. **Chunking strategy for very large corpora**
   - What we know: Claude's context window can handle several .md files at once, but an entire Obsidian vault could be 500+ files
   - What's unclear: Optimal batch size for reading files while maintaining analysis quality
   - Recommendation: Start with 3-5 files per batch. Read file list first, calculate total size, determine batch count. Each batch produces an intermediate findings document. Final synthesis reads all intermediate findings.

2. **Handling contradictory voice signals**
   - What we know: A vault might contain formal articles, casual notes, and stream-of-consciousness drafts all mixed together
   - What's unclear: Whether to average across everything (D-04 says "analyse everything") or weight by file characteristics
   - Recommendation: Analyse everything per D-04, but in the review summary, flag if significant voice variation was detected. Let the user decide if the mixed profile is what they want or if they should point to a specific subdirectory.

3. **Calibration examples section in spec**
   - What we know: spiritual-default.md has a Calibration Examples section (added in Phase 7), but voice-profile-spec.md lists only 5 required + 2 optional sections (Theological Framework, Scripture Handling)
   - What's unclear: Whether Calibration Examples is a third optional section or should be added to the spec
   - Recommendation: Include Calibration Examples in the generated profile as a de facto standard section (spiritual-default.md sets the precedent). Do not modify voice-profile-spec.md in this phase -- treat it as an established optional section.

## Sources

### Primary (HIGH confidence)
- `references/voice-profiles/voice-profile-spec.md` -- Defines the 5 required + 2 optional sections, validation rules
- `references/voice-profiles/spiritual-default.md` -- Reference implementation of a complete profile with calibration examples
- `skills/orchestrator/SKILL.md` -- Voice selection logic (4 current modes)
- `skills/outliner/SKILL.md` -- Approval gate pattern to replicate
- `08-CONTEXT.md` -- All 14 locked decisions

### Secondary (MEDIUM confidence)
- Memory files: `feedback_voice_builder.md`, `feedback_book_quality.md` -- User motivation and expectations
- Phase 7 STATE.md decisions on calibration examples and voice profile upgrades

### Tertiary (LOW confidence)
None -- this phase is entirely within the existing plugin system with no external dependencies to verify.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no external dependencies, pure skill authoring
- Architecture: HIGH -- follows established plugin patterns, all reference implementations exist
- Pitfalls: HIGH -- based on concrete analysis of the existing codebase and known Claude limitations

**Research date:** 2026-03-28
**Valid until:** 2026-04-28 (stable -- plugin system and voice spec are unlikely to change)
