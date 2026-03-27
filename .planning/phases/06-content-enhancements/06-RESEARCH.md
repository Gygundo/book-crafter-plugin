# Phase 6: Content Enhancements - Research

**Researched:** 2026-03-27
**Domain:** Sermon-to-book conversion, reader engagement elements, content enrichment within Claude Code plugin architecture
**Confidence:** HIGH

## Summary

Phase 6 adds two major capability groups to the existing book pipeline: (1) a sermon-to-book conversion pathway that transforms spoken-rhythm content into written-rhythm prose, and (2) reader engagement elements -- discussion questions, chapter summaries, prayer points, and a foreword. All six requirements (ENH-01 through ENH-06) are content-generation tasks performed by Claude, not external library integrations. The primary challenge is ensuring these enhancements maintain voice consistency with the rest of the manuscript and integrate cleanly into the existing pipeline architecture.

The sermon-to-book conversion (ENH-01, ENH-02) is the most complex requirement. It builds on the outliner's existing Source Ingestion Mode but adds a pre-processing step that transforms spoken-language patterns into written-language patterns before the standard pipeline runs. The reader engagement elements (ENH-03 through ENH-06) are post-editing enrichments that read the final chapter content and generate supplementary material. Both groups fit naturally as new skills or extensions to existing skills within the established plugin architecture.

**Primary recommendation:** Create two new skills -- `sermon-adapter` for ENH-01/ENH-02 (pre-pipeline sermon transformation) and `enricher` for ENH-03/ENH-04/ENH-05/ENH-06 (post-edit content generation). Wire both into the orchestrator as new pipeline steps. The enricher outputs go into `front-matter/` (foreword) and inline within `edited/` chapter files (discussion questions, summaries, prayer points as appendix sections after each chapter).

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ENH-01 | Sermon-to-book input path -- converts sermon series into book chapters, adapting spoken rhythm to written rhythm | Sermon adapter skill transforms source material before the outliner runs; uses the existing `sources/` directory and Source Ingestion Mode as foundation |
| ENH-02 | Sermon adaptation transforms: spoken fragments to complete sentences, audience-specific to universal references, verbal cues to written transitions, repetition-for-emphasis to revelation-for-emphasis | Defined as a set of transformation rules applied by the sermon-adapter skill; each transform is a specific rewriting pass on source material |
| ENH-03 | Discussion questions per chapter -- specific to chapter's unique arguments, passes the cliche test | Enricher skill reads each `edited/ch[NN]-final.md` and generates 3-5 argument-specific questions; cliche test validates questions are not generic |
| ENH-04 | Chapter summaries -- concise recap of key points for each chapter | Enricher skill extracts core argument and key arguments from each chapter, producing 3-5 sentence summary |
| ENH-05 | Prayer points per chapter (for theological books) -- connected to the chapter's revelation, not generic prayers | Enricher skill reads theological framework from Book DNA; generates prayer points that reference specific chapter revelations; skipped for non-theological voices |
| ENH-06 | Foreword generation -- frames the book's purpose, written in author voice or as a draft for an endorser | Enricher skill reads Book DNA, outline arc, and chapter summaries to produce a foreword; two modes: author-voice or endorser-draft |
</phase_requirements>

## Standard Stack

### Core

No new external libraries needed. All Phase 6 work is content generation within the existing Claude Code plugin system, using skills and subagents that already exist.

| Technology | Version | Purpose | Why Standard |
|------------|---------|---------|--------------|
| Claude Code Plugin System | Current | Skill definitions, subagent orchestration | Same as all prior phases -- this is the execution environment |
| Markdown (.md) | N/A | All intermediate artefacts | Same as all prior phases -- enrichments are markdown files consumed by the formatter |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| docx (docx-js) | 9.6.1 | .docx generation | Only in formatter -- Phase 6 adds enrichment content that the formatter must render into the final .docx (discussion questions, summaries, prayer points appended after each chapter; foreword in front matter) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Separate sermon-adapter skill | Extend the outliner's Source Ingestion Mode | Extending the outliner bloats it; a separate skill keeps responsibilities clean and lets the orchestrator control when sermon adaptation happens |
| Separate enricher skill | Individual skills per enrichment type | Individual skills would create 4 separate SKILL.md files for closely related work; a single enricher with modes keeps it manageable |
| Inline enrichments in chapter files | Separate enrichment files | Separate files create filesystem complexity; inline sections (clearly delimited) at chapter end keep everything together for the formatter |

## Architecture Patterns

### Recommended Project Structure Changes

```
skills/
  sermon-adapter/
    SKILL.md              # NEW: Sermon-to-book transformation
  enricher/
    SKILL.md              # NEW: Discussion questions, summaries, prayer points, foreword

# Project directory additions:
~/Documents/Books/[Title]/
  sources/                # EXISTING: Sermon files go here (already supported)
  sources-adapted/        # NEW: Transformed source files (written rhythm)
  front-matter/
    foreword.md           # NEW: Generated foreword
  enrichments/
    ch01-enrichments.md   # NEW: Discussion questions, summary, prayer points per chapter
    ch02-enrichments.md
    ...
```

### Pattern 1: Sermon Adapter as Pre-Pipeline Step

**What:** A new skill that runs BEFORE the outliner when the orchestrator detects sermon-format source material. It reads files from `sources/`, transforms spoken rhythm to written rhythm, and writes adapted files to `sources-adapted/`. The outliner's Source Ingestion Mode then reads from `sources-adapted/` instead of `sources/`.

**When to use:** Whenever the user indicates their source material is from sermons, transcripts, or spoken-word content.

**Why this pattern:** The existing Source Ingestion Mode in the outliner already handles content extraction from source files. The sermon adapter sits upstream and transforms the source format so that the outliner, researcher, and writer all work with already-adapted material. This avoids threading sermon-awareness through every downstream skill.

**Detection:** The orchestrator can detect sermon-format content in two ways:
1. User explicitly says "convert my sermons to a book" or similar
2. Source files contain sermon indicators: numbered points with ALL CAPS headings, scripture block quotes, first/second person plural ("we", "us", "you"), verbal cues ("Let me tell you", "Think about this"), audience references ("this morning", "as we gather today")

**Orchestrator integration:**
```
Stage 0.5 (conditional): SERMON ADAPTATION (sermon-adapter skill)
  -> Only runs when sermon-format sources detected
  -> Input: sources/
  -> Output: sources-adapted/
  -> Then Stage 1 (Outline) reads sources-adapted/ instead of sources/
```

### Pattern 2: Enricher as Post-Edit Step

**What:** A new skill that runs AFTER editing (Stage 4) but BEFORE formatting (Stage 5). It reads the final edited chapters and generates supplementary content.

**When to use:** Always runs as part of the pipeline. Individual enrichment types can be skipped based on Book DNA configuration.

**Pipeline position:**
```
Stage 4: EDIT -> Stage 4.5: ENRICH -> Stage 5: FORMAT
```

**Enrichment types:**
- Discussion questions (ENH-03) -- always generated
- Chapter summaries (ENH-04) -- always generated
- Prayer points (ENH-05) -- only for theological voice profiles
- Foreword (ENH-06) -- always generated

**Output format per chapter (`enrichments/ch[NN]-enrichments.md`):**
```markdown
# Enrichments: Chapter [N] - [Title]

## Discussion Questions
1. [Question tied to the chapter's core argument]
2. [Question exploring a key supporting argument]
3. [Question about practical application]
4. [Question connecting to the broader book arc]
5. [Optional: deeper theological/conceptual question]

## Chapter Summary
[3-5 sentence summary capturing the core argument, key supporting points, and the chapter's contribution to the book arc]

## Prayer Points
[Only for theological books -- 2-4 prayer points connected to specific revelations in the chapter]
- [Prayer point referencing a specific scripture or revelation from the chapter]
- [Prayer point for application of the chapter's core truth]
```

**Foreword output (`front-matter/foreword.md`):**
```markdown
# Foreword

[500-800 word foreword framing the book's purpose]

<!-- FOREWORD METADATA
mode: author | endorser-draft
voice_source: book-dna | custom
word_count: [N]
-->
```

### Pattern 3: Cliche Test for Discussion Questions

**What:** A validation step within the enricher that checks each discussion question against cliche patterns. Questions must be specific to the chapter's unique arguments, not generic.

**Cliche patterns to reject:**
- "What does this chapter mean to you?" (too vague)
- "How can you apply this to your life?" (generic application)
- "What stood out to you most?" (lazy engagement)
- "Have you ever experienced something similar?" (generic experience)
- Questions that could apply to ANY chapter without modification
- Questions that don't reference specific content from the chapter

**Validation rule:** Each question must contain at least one specific reference to:
- A concept, term, or argument unique to that chapter
- A specific scripture, illustration, or word study from the chapter
- A specific claim or revelation from the chapter

### Anti-Patterns to Avoid

- **Generic enrichments:** Discussion questions, summaries, and prayer points that could apply to any chapter. Every enrichment must be tied to specific chapter content.
- **Sermon-to-book as a simple find-and-replace:** Spoken-to-written transformation requires understanding context, not just pattern matching. "Let me tell you" cannot simply become "Consider this" -- the entire sentence rhythm must change.
- **Enrichments that break voice:** Discussion questions and summaries must match the book's voice profile, not default to a neutral academic tone.
- **Foreword that summarises the book:** A foreword frames PURPOSE, not content. It should answer "why does this book exist?" not "what does each chapter say?"
- **Prayer points that are just rephrased chapter content:** Prayer points should be addressed TO God, ABOUT the revelation -- not a summary of what was taught.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sermon format detection | Complex regex-based sermon detector | Simple heuristic checks (ALL CAPS headings, audience pronouns, verbal cues) + user confirmation | Sermon format varies wildly; user confirmation is more reliable than automated detection |
| Cliche question filtering | NLP-based quality scoring | Rule-based specificity check (must reference chapter-specific content) | The specificity rule is simple and effective; NLP would be overkill and unreliable |
| Scripture extraction from sermons | Custom scripture parser | Regex pattern matching for book-chapter-verse patterns (already used in researcher/editor) | Standard Bible reference patterns are well-established |

## Common Pitfalls

### Pitfall 1: Sermon Repetition Preserved in Book Form

**What goes wrong:** Sermons use repetition-for-emphasis (saying the same thing 3 times for the audience to absorb). Books use revelation-for-emphasis (going deeper each time). If sermon repetition is preserved, the book reads as padded.
**Why it happens:** The adapter treats repetition as content rather than a spoken-word technique.
**How to avoid:** The sermon adapter must identify repetition clusters (same idea restated 2-3 times) and consolidate them into a single, deeper treatment. Keep the strongest version, enhance with depth, discard the echoes.
**Warning signs:** Word count of adapted source is only slightly less than original; same phrase appears near-verbatim multiple times.

### Pitfall 2: Generic Discussion Questions

**What goes wrong:** Questions like "What did you learn from this chapter?" that could apply to any book.
**Why it happens:** Generating questions from a summary rather than from specific chapter arguments.
**How to avoid:** The enricher must read the full chapter text and reference specific arguments, scriptures, or revelations. The cliche test catches generic questions before output.
**Warning signs:** Questions that don't mention any specific concept from the chapter.

### Pitfall 3: Prayer Points as Rephrased Teaching

**What goes wrong:** Prayer points that read as "God, help me understand [concept]" rather than responding to a specific revelation.
**Why it happens:** Treating prayer points as application bullet points instead of prayers.
**How to avoid:** Prayer points must be written in prayer format (addressed to God), reference specific revelations or scriptures from the chapter, and express response (gratitude, declaration, request for deeper understanding) rather than summarising content.
**Warning signs:** Prayer points that start with "Help me to..." or "Lord, teach me about..." without referencing specific chapter content.

### Pitfall 4: Foreword That Spoils the Book

**What goes wrong:** The foreword summarises each chapter's content, removing the reader's motivation to read.
**Why it happens:** Treating the foreword as a table of contents in prose form.
**How to avoid:** The foreword frames PURPOSE and CONTEXT: why this book exists, what gap it fills, who it's for, and what transformation it promises. It teases the journey without revealing the destinations.
**Warning signs:** Foreword mentions specific chapter numbers or gives away climax revelations.

### Pitfall 5: Audience-Specific References Surviving Adaptation

**What goes wrong:** Phrases like "as we discussed last Sunday" or "here in our church" appearing in the book.
**Why it happens:** Incomplete scanning for audience/context-specific references.
**How to avoid:** The sermon adapter must scan for temporal references ("this morning", "last week", "tonight"), spatial references ("here in this room", "in our church"), and relational references ("as your pastor", "I've told you before") and either universalise them or remove them.
**Warning signs:** First/second person plural usage that implies a specific audience rather than a general reader.

### Pitfall 6: Enrichments Breaking the Formatter

**What goes wrong:** The formatter doesn't know how to render discussion questions, summaries, or prayer points because they weren't part of the Phase 5 formatter spec.
**Why it happens:** Enrichment output format not coordinated with the formatter's expectations.
**How to avoid:** Define the exact markdown structure the enricher outputs AND update the formatter SKILL.md to recognise and render these sections in the .docx. Discussion questions, summaries, and prayer points should follow each chapter in the .docx with consistent formatting.
**Warning signs:** Enrichment files exist but don't appear in the final .docx.

## Code Examples

### Sermon Adaptation Transform Examples

**Transform 1: Spoken fragments to complete sentences**

Source (sermon):
```
Grace. It's not what you think.
Not a license. Not a safety net.
It's the FOUNDATION.
```

Adapted (book):
```
Grace is not what most people think it is. It is neither a licence to sin nor a safety net for when things go wrong. It is the foundation -- the bedrock upon which everything else is built.
```

**Transform 2: Audience-specific to universal**

Source (sermon):
```
I want you to turn to your neighbour and say "I'm not who I used to be."
As we've been walking through this series together...
```

Adapted (book):
```
There comes a moment when a truth settles so deeply that it changes how you see yourself. You are not who you used to be.
```

**Transform 3: Verbal cues to written transitions**

Source (sermon):
```
Now watch this. Here's where it gets good.
Look at verse 15. Paul says...
```

Adapted (book):
```
This is where Paul's argument takes a decisive turn. In verse 15, he writes...
```

**Transform 4: Repetition-for-emphasis to revelation-for-emphasis**

Source (sermon):
```
You are seated with Christ. Seated! Not standing in line. Not waiting outside. SEATED.
You are IN Christ. Positioned. Established. Settled.
```

Adapted (book):
```
The word Paul uses is "seated" -- past tense, completed action. Not standing in line hoping for an audience. Not waiting outside the throne room. Seated. The Greek word kathizo carries the sense of permanent establishment -- positioned, established, settled in a place of authority. This is not a future promise. It is a present reality.
```

### Discussion Question Examples (Good vs Bad)

**Bad (generic, fails cliche test):**
```
1. What did you learn from this chapter?
2. How can you apply grace to your daily life?
3. What stood out to you most about identity?
```

**Good (specific, passes cliche test):**
```
1. The chapter argues that "seated with Christ" is past tense -- a completed action, not a future promise. How does this challenge the common teaching that believers are "working toward" their position in Christ?
2. Paul's use of "kathizo" implies permanent establishment. If this is true, what practical difference should it make when you face circumstances that suggest otherwise?
3. The author draws a distinction between "repetition for emphasis" (a sermon technique) and "revelation for emphasis" (a writing technique). Where in your own experience have you seen a truth deepen through progressive revelation rather than simple repetition?
```

### Enrichment File Structure

```markdown
# Enrichments: Chapter 3 - The Anatomy of Breakthrough

## Discussion Questions

1. The chapter presents breakthrough not as a sudden event but as the culmination of unseen preparation. Paul's "suddenly" in Acts 16:26 -- the earthquake in the Philippian jail -- came after hours of worship in chains. What does this suggest about the relationship between faithfulness in difficulty and breakthrough?

2. The Greek word "rhegnumi" (to burst forth) appears in both the Philippian jail narrative and in Isaiah's prophecy of the barren woman. How does this cross-testament connection strengthen the chapter's argument that breakthrough follows a divine pattern?

3. The author distinguishes between "breakthrough TO something" and "breakthrough FROM something." Which framing is more consistent with New Covenant theology, and why does the distinction matter?

## Chapter Summary

Breakthrough is not random favour but the fruit of a divine pattern: preparation in hiddenness, pressure that builds purpose, and a moment of rupture where everything God has been building becomes visible. The Greek word "rhegnumi" -- to burst forth -- connects Paul's Philippian jail experience to Isaiah's prophecy, revealing that breakthrough is woven into the fabric of God's redemptive design. The chapter challenges the prosperity-gospel framing of breakthrough as reward for performance, instead positioning it as the inevitable outcome of identity rightly understood.

## Prayer Points

- Father, I thank You that breakthrough is not something I earn through performance but something that emerges from who I already am in Christ. I declare that the preparation You are doing in me right now -- even what I cannot see -- is leading to a "rhegnumi" moment of bursting forth.
- Lord, I receive the truth that faithfulness in difficulty is not a test I might fail but a pattern You are weaving into my story. Like Paul and Silas in that jail, I choose worship over worry, knowing that the earthquake is already on its way.
- I pray for eyes to see that my current season of hiddenness is not abandonment but preparation. You are the God who brings forth from barrenness, and I trust Your timing.
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Sermon transcripts used directly as book chapters | Sermon-to-book requires explicit rhythm adaptation (spoken to written) | Publishing best practice | Without adaptation, books from sermons read like transcripts, not literature |
| Generic study guide questions at book end | Per-chapter discussion questions tied to specific arguments | Current non-fiction publishing trend | Reader engagement and small group usability dramatically improved |
| Prayer at end of book only | Per-chapter prayer points connected to specific revelations | Contemporary devotional publishing | Deepens reader engagement with each chapter's content |

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Manual validation (Claude Code plugin -- no automated test runner) |
| Config file | None -- plugin is SKILL.md-based, validated by execution |
| Quick run command | Manual: invoke orchestrator with test sermon sources |
| Full suite command | Manual: full pipeline run with sermon source material |

### Phase Requirements to Test Map

| Req ID | Behaviour | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ENH-01 | Sermon source files detected and adapted before outliner runs | manual | Provide sermon .md files in sources/, verify sources-adapted/ generated | N/A |
| ENH-02 | Specific transforms applied: fragments to sentences, audience-specific to universal, verbal cues to transitions, repetition to revelation | manual | Compare sources/ and sources-adapted/ for transformation evidence | N/A |
| ENH-03 | Discussion questions per chapter pass cliche test | manual | Read enrichments/ch[NN]-enrichments.md, verify questions reference specific chapter content | N/A |
| ENH-04 | Chapter summaries accurately capture key points | manual | Read enrichments/ch[NN]-enrichments.md, compare summary to chapter content | N/A |
| ENH-05 | Prayer points connected to chapter revelation (theological only) | manual | Read enrichments/ch[NN]-enrichments.md, verify prayer points reference specific revelations; verify skipped for non-theological | N/A |
| ENH-06 | Foreword frames purpose without spoiling content | manual | Read front-matter/foreword.md, verify no chapter-specific spoilers | N/A |

### Sampling Rate

- **Per task commit:** Read generated enrichment files and verify content quality
- **Per wave merge:** Full pipeline run with sermon source material
- **Phase gate:** Complete pipeline execution producing .docx with all enrichments rendered

### Wave 0 Gaps

- [ ] `skills/sermon-adapter/SKILL.md` -- new skill for ENH-01, ENH-02
- [ ] `skills/enricher/SKILL.md` -- new skill for ENH-03, ENH-04, ENH-05, ENH-06
- [ ] Orchestrator updates to wire sermon-adapter and enricher into pipeline
- [ ] Formatter updates to render enrichment content in .docx
- [ ] Pipeline-stages.md updates to document Stage 0.5 and Stage 4.5

## Orchestrator Integration Details

### Pipeline Stage Changes

The orchestrator currently has 5 stages. Phase 6 adds two conditional/new stages:

**Stage 0.5: Sermon Adaptation (conditional)**
- Triggers when: source files detected AND sermon-format indicators present (or user explicitly states sermon input)
- Skill: `book-crafter:sermon-adapter`
- Input: `sources/` directory
- Output: `sources-adapted/` directory
- State detection: `sources-adapted/` exists with files -> sermon adaptation complete
- After completion: Stage 1 (Outline) uses `sources-adapted/` as its source directory instead of `sources/`

**Stage 4.5: Content Enrichment (always runs)**
- Triggers after: Stage 4 complete (all `edited/ch[NN]-final.md` exist, no revision marker)
- Skill: `book-crafter:enricher`
- Input: `edited/ch[NN]-final.md` files + `book-dna.md`
- Output: `enrichments/ch[NN]-enrichments.md` per chapter + `front-matter/foreword.md`
- State detection: `enrichments/` exists with file count matching chapter count AND `front-matter/foreword.md` exists
- After completion: Stage 5 (Format) runs

### State Detection Updates

The orchestrator's detection algorithm (Section 3) needs expansion:

```
Current: Check edited/ -> Check drafts/ -> Check research/ -> Check outline
Updated: Check output/ -> Check enrichments/ + front-matter/foreword.md -> Check edited/ -> Check drafts/ -> Check research/ -> Check outline -> Check sources-adapted/
```

New checks:
1. Between "output/*.docx" check and "edited/ch*-final.md" check:
   - Check `enrichments/ch*-enrichments.md` count matches chapter count AND `front-matter/foreword.md` exists
   - If both: Stage 4.5 COMPLETE
   - If partial: Stage 4.5 PARTIALLY COMPLETE
2. After "none of the above" but before "Pipeline NOT STARTED":
   - Check `sources-adapted/` directory exists with files
   - If exists: Stage 0.5 COMPLETE (proceed to Stage 1)

### Dashboard Updates

```
[ ] Stage 0.5: Sermon Adaptation (sermon-adapter) [only shown when sources/ contains sermon-format content]
    Adapted: [date] | Source files: [N]

[x] Stage 1: Outline (outliner)
...
[x] Stage 4: Editing (editor)
[ ] Stage 4.5: Content Enrichment (enricher)
    [ ] Discussion questions: 0/[N] chapters
    [ ] Chapter summaries: 0/[N] chapters
    [ ] Prayer points: 0/[N] chapters [or "N/A -- non-theological"]
    [ ] Foreword: pending
[ ] Stage 5: Formatting (formatter)
```

### Formatter Integration

The formatter SKILL.md needs updates to handle enrichment content:

1. **Per-chapter enrichments:** After each chapter's body text in the .docx, add:
   - A "Discussion Questions" section with a styled heading (Heading 2 or 3)
   - Numbered questions
   - A "Chapter Summary" section with styled heading
   - Summary text
   - A "Prayer Points" section (theological books only) with styled heading
   - Bulleted prayer points

2. **Foreword in front matter:** Insert the foreword between the Dedication page and the Table of Contents. Styled with the same body font as chapters.

3. **Typography for enrichment sections:**
   - Section headings: 16pt bold Georgia (Heading 2 level)
   - Questions: 12pt Georgia, numbered list
   - Summary: 12pt Georgia, italic
   - Prayer points: 12pt Georgia, bulleted list

## Sermon Adapter Transformation Rules

### Rule 1: Fragment Completion
**Input pattern:** Short fragments, incomplete sentences, one-word emphatic statements
**Transform:** Complete into full sentences that preserve the emphasis without relying on spoken delivery

### Rule 2: Audience De-personalisation
**Input pattern:** "Turn to your neighbour", "This morning", "As your pastor", "Here in our church", "Last Sunday we talked about"
**Transform:** Remove or universalise. Replace temporal references with timeless framing. Replace spatial references with universal context.

### Rule 3: Verbal Cue Replacement
**Input pattern:** "Watch this", "Here's what I love about this", "Now look at this", "Let me tell you something", "Are you tracking with me?"
**Transform:** Replace with written transitions that serve the same function (building anticipation, flagging importance) but in prose form.

### Rule 4: Repetition Consolidation
**Input pattern:** Same idea stated 2-3 times in slightly different words within a paragraph or section
**Transform:** Keep the strongest version, enhance with depth (add word study, cross-reference, or implication), discard the echoes. The book version goes DEEPER once instead of WIDER three times.

### Rule 5: Structural De-numbering
**Input pattern:** Numbered points with ALL CAPS headings (sermon structure)
**Transform:** Convert to flowing prose with natural transitions between ideas. The numbered-point structure is a speaking aid, not a literary device. Preserve the logical progression but let it flow as narrative.

### Rule 6: Scripture Re-integration
**Input pattern:** Block-quoted scripture followed by "Now look at what this says..."
**Transform:** Weave scripture into narrative flow per the writer skill's Scripture Integration pattern. The verse should emerge as part of the argument, not precede it as a reading assignment.

### Rule 7: Exclamation and Emphasis Normalisation
**Input pattern:** Multiple exclamation marks, ALL CAPS for emphasis, bold/italic overuse
**Transform:** Replace with prose-based emphasis techniques from the voice profile. Sentence structure and word choice create emphasis in writing, not formatting.

## Open Questions

1. **Enrichment approval gate?**
   - What we know: The outline has an approval gate. The draft review has an approval gate. Enrichments are supplementary content.
   - What's unclear: Should the user review and approve enrichments before formatting, or are they auto-generated and included?
   - Recommendation: No separate approval gate. Show enrichment generation in the dashboard. Users can request revision of enrichments through the existing revision workflow (Mode 5). This keeps the pipeline flowing without adding another pause point.

2. **Sermon detection confidence**
   - What we know: Heuristic detection (ALL CAPS headings, audience pronouns, verbal cues) can identify sermon format with reasonable accuracy.
   - What's unclear: What if source material is ambiguous (e.g., teaching notes that share some sermon characteristics)?
   - Recommendation: When heuristic detection finds sermon indicators, ask the user: "These source files appear to be sermon transcripts. Should I adapt them from spoken to written rhythm before generating the outline?" Let the user confirm. Default to "no adaptation" if unsure.

3. **Enrichment content in the .docx layout**
   - What we know: Discussion questions, summaries, and prayer points need to appear in the final .docx.
   - What's unclear: Should they appear inline after each chapter, or collected in a "Study Guide" section at the back of the book?
   - Recommendation: Inline after each chapter. This is the modern publishing convention for non-fiction teaching books and devotionals. It keeps engagement material close to the content it references. A back-of-book study guide forces the reader to flip back and forth.

## Sources

### Primary (HIGH confidence)
- Existing orchestrator SKILL.md -- pipeline architecture, state detection, stage execution patterns
- Existing outliner SKILL.md -- Source Ingestion Mode, chapter outline format
- Existing writer SKILL.md -- voice consistency patterns, scripture integration, chapter structure
- Existing editor SKILL.md -- three-pass editing, voice audit, cross-chapter validation
- Existing formatter SKILL.md -- .docx generation, front/back matter structure
- Existing sermon-crafter SKILL.md -- sermon voice patterns, structure, and formatting (source for understanding sermon format)
- Existing voice-profile/spiritual-default.md -- theological framework and voice characteristics
- Existing book-dna-template.md -- master context document structure
- REQUIREMENTS.md -- ENH-01 through ENH-06 specifications

### Secondary (MEDIUM confidence)
- Non-fiction publishing conventions for study guide placement (inline vs back-of-book) -- based on mainstream publishing practice
- Sermon-to-book transformation patterns -- based on established publishing methodology for spoken-to-written conversion

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new libraries needed; all work is Claude Code skill authoring
- Architecture: HIGH -- extends proven patterns from Phases 1-5 (new skills, orchestrator updates, formatter updates)
- Pitfalls: HIGH -- derived from direct analysis of existing skill implementations and common sermon-to-book publishing challenges
- Sermon transformation rules: HIGH -- derived from comparing sermon-crafter SKILL.md voice patterns against writer SKILL.md voice patterns

**Research date:** 2026-03-27
**Valid until:** Indefinite (architecture is stable; no external dependencies with version drift)
