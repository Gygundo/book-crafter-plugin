---
name: outliner
description: "Generate a chapter-by-chapter book outline from a topic brief or existing content. Called by the orchestrator during the outline stage of the book pipeline. Triggers on: 'outline a book', 'book outline', 'chapter outline', 'plan a book structure'."
user-invocable: false
allowed-tools: Read, Write, Bash, Grep, Glob
---

# Book Outliner

Generates a chapter-by-chapter book outline with structured metadata per chapter, designs a narrative arc, and populates the Book DNA master context document after user approval.

## 1. On Invocation

Receive the project directory path via `$ARGUMENTS`. Read the following from the project directory:

1. `book-dna.md` -- for metadata (title, subtitle, author, size tier, target word count)
2. `voice-profile.md` -- for voice characteristics to inform outline tone

Extract from `book-dna.md`:
- **Title** and **Subtitle** (from Metadata section)
- **Author** (from Metadata section)
- **Size tier** (booklet | short | standard)
- **Topic brief or description** (from Metadata or provided inline by orchestrator)

Extract from `voice-profile.md`:
- Whether the profile includes a Theological/Domain Framework section (determines if scriptures are required per chapter)
- The overall tone and voice characteristics (influences chapter title style and hook strategies)

## 2. Determine Mode

Check the project directory for source content, preferring adapted content when available:

1. If a `sources-adapted/` directory exists and contains `.md`, `.txt`, or `.docx` files: use **Source Ingestion Mode** (section 4) reading from `sources-adapted/`
2. Else if a `sources/` directory exists and contains `.md`, `.txt`, or `.docx` files: use **Source Ingestion Mode** (section 4) reading from `sources/`
3. If neither directory contains source files: use **Topic Brief Mode** (section 3)

Log which mode is being used:
- "Mode: Topic Brief" -- generating outline from topic brief and metadata
- "Mode: Source Ingestion (adapted, [N] source files from sources-adapted/)" -- using sermon-adapted content
- "Mode: Source Ingestion ([N] source files from sources/)" -- using raw source content

## 3. Topic Brief Mode

Generate a book outline from scratch using the topic brief, key themes, target audience, and optional scriptures from the project metadata.

### Step 1: Determine chapter count from size tier

| Size Tier | Chapters | Total Words | Per-Chapter Words |
|-----------|----------|-------------|-------------------|
| Booklet   | 5-8      | 15-20K      | ~2,500-3,500      |
| Short     | 8-12     | 15-25K      | ~1,800-2,500      |
| Standard  | 12-20    | 40-60K      | ~3,000-4,000      |

Choose a specific chapter count within the tier range based on the complexity and breadth of the topic. A narrow topic with deep treatment favours fewer, longer chapters. A broad topic with survey treatment favours more, shorter chapters.

### Step 2: Design the narrative arc

Before writing individual chapters, design the book's overall narrative arc:

- **Opening:** What tension or question draws the reader in? What is the status quo the book disrupts?
- **Progressive revelation:** How does understanding deepen chapter by chapter? What is the logical escalation?
- **Climax:** What is the peak revelation or turning point? The "aha moment" the entire book builds toward.
- **Resolution:** How does the book land? What does the reader walk away with? How are they changed?

Write the arc as a single line:
`[Opening tension] -> [Progressive revelation] -> [Climactic truth] -> [Resolution]`

### Step 3: Assign momentum positions

Each chapter receives a momentum position that determines its energy, pacing, and structural role:

| Position | Typical Chapters | Purpose |
|----------|-----------------|---------|
| Foundation | Chapters 1-2 | Establish the premise, hook the reader, lay groundwork. Set up the central question or tension. |
| Building | Early-middle chapters | Develop arguments, introduce complexity, deepen understanding. Each chapter adds a new layer. |
| Accelerating | Mid-late chapters | Increase intensity, connect threads, raise stakes. The reader feels momentum building. |
| Climax | 1-2 chapters near end | Peak revelation, the "aha moment", most powerful content. Everything converges here. |
| Landing | Final 1-2 chapters | Resolution, application, send-off with lasting impact. The reader knows what to do next. |

Every outline must use all five momentum positions. The distribution should feel natural -- not every chapter needs a different position, but the overall trajectory must escalate from Foundation through Landing.

### Step 4: Generate per-chapter metadata

For each chapter, generate:

- **Title:** Compelling and specific, not generic. "The Anatomy of Breakthrough" not "Chapter 3: More About Faith". The title should intrigue, not merely describe.
- **Hook strategy:** Choose ONE of the following and write the specific hook in 1-2 sentences:
  - **Bold declaration** -- a confident, provocative statement that demands engagement
  - **Rhetorical question** -- a question that makes the reader stop and think before reading on
  - **Counter-intuitive claim** -- a statement that contradicts common wisdom and creates curiosity
  - **Tension-creating observation** -- an observation that exposes a gap between reality and expectation
  **Story-first hooks (preferred):** Wherever possible, the hook should be wrapped in a story, anecdote, or vivid scene. The bold declaration, question, or tension emerges FROM the opening narrative rather than standing alone. Example: Instead of just "Your weakest moment wasn't a failure", open with a 2-3 sentence scene of someone experiencing that moment, then deliver the declaration as the insight that emerges from the story.
- **Core argument:** The single central claim this chapter makes, in one sentence. Every paragraph in the chapter should serve this argument.
- **Key arguments:** 3-5 supporting arguments that build the core argument. These become the chapter's structural backbone.
- **Supporting scriptures:** 2-5 scripture references relevant to the chapter's argument. For theological books (voice profile has a Theological/Domain Framework section), this is mandatory. For non-theological voice profiles, write "[N/A -- non-theological voice profile]".
- **Momentum position:** Foundation | Building | Accelerating | Climax | Landing
- **Connects to:** Which other chapters this chapter foreshadows, builds on, or callbacks to. Use the format: "Ch [X] (foreshadows [concept])", "Ch [Y] (builds on [concept])". Every chapter must connect to at least one other chapter.
- **Target word count:** Calculated from the size tier's per-chapter range. Can vary by +/- 20% based on the chapter's role (climax chapters tend to be longer, foundation chapters moderate).
- **Ending style:** Choose ONE:
  - **cliffhanger_seed** -- end with a question, tension point, or preview that makes the reader NEED the next chapter. Best for Foundation and Building chapters where you want forward momentum.
  - **reflective_hook** -- end with a reflective landing that lets the insight settle, followed by a 1-2 sentence forward hook. Best for Accelerating, Climax, and Landing chapters where the content needs to breathe before moving on.
  The outliner designs which ending fits each chapter based on momentum position and content. Not every chapter should use the same ending style.

### Step 5: Cross-chapter coherence check

After generating all chapters, review the complete outline for coherence:

1. **Progression check:** Does each chapter build on the previous one? Is there a logical flow?
2. **Gap analysis:** Are there gaps in the argument progression? Missing links between ideas?
3. **Momentum check:** Do the momentum positions actually escalate? Is there a clear build toward climax?
4. **Connection density:** Are there enough cross-chapter connections (foreshadowing, callbacks)? Aim for at least 2 connections per chapter on average.
5. **Climax delivery:** Does the climax chapter deliver on the tension set up in chapter 1?
6. **Landing satisfaction:** Does the landing chapter resolve what was opened, without introducing new unresolved threads?

If any check fails, revise the affected chapters before writing the output file.

## 4. Source Ingestion Mode

Generate a book outline from existing content (sermon transcripts, notes, blog posts, outlines).

### Step 1: Read and analyse all source files

Read all files from the source directory identified in Section 2 (either `sources-adapted/` or `sources/`). Accept `.md`, `.txt`, or `.docx` files.

When reading from `sources-adapted/`, these files have already been transformed from spoken to written rhythm by the sermon adapter. The outliner should treat them as written prose -- do not apply any additional spoken-to-written transformations.

### Step 2: Extract themes and arguments

Across all source material, identify:
- **Major themes:** Recurring topics that appear across multiple sources
- **Core arguments:** Key claims or positions consistently made
- **Key quotes and illustrations:** Memorable phrases, stories, or examples worth preserving
- **Structural patterns:** How the source material is organised (chronological, topical, progressive)
- **Existing voice:** The tone and style already present in the source material

### Step 3: Transform, do not mirror

**Critical instruction: Do NOT mirror the source structure.** A sermon series and a book have fundamentally different rhythms. Sermons are standalone talks; a book is a progressive argument.

- A 6-sermon series should NOT automatically become 6 chapters
- A collection of blog posts should NOT become one chapter per post
- Notes with 10 bullet points should NOT become 10 chapters

Instead:
- Group related themes across multiple source files
- Identify the natural progressive argument that emerges from the combined material
- Design a NEW book structure that serves the reader's journey, not the speaker's delivery schedule
- Some source material may be split across multiple chapters; other material may be condensed into a single chapter

### Step 4: Apply the standard outline generation process

Follow the same process as Topic Brief Mode (section 3, steps 1-5), but informed by the extracted themes, arguments, and voice from the source material.

### Step 5: Preserve key quotes and source material

For each chapter, add a **Source Material Notes** entry listing:
- Specific quotes or illustrations from the source material that should appear in this chapter
- Which source file(s) the material comes from
- Any key phrases or terminology from the source that should be preserved verbatim

This gives the writer agent concrete material to weave in, maintaining continuity with the original content.

## 5. Output: chapter-outline.md

Write the outline to `[project]/chapter-outline.md` in this exact format:

```markdown
# Book Outline: [Title]

## Book Arc
[Opening tension] -> [Progressive revelation] -> [Climactic truth] -> [Resolution]

## Size Tier
[booklet | short | standard]
Target: [total word count] words, [chapter count] chapters, ~[per-chapter words] words/chapter

## Chapter 1: [Title]
- **Hook strategy:** [Type] -- [Specific hook description in 1-2 sentences]
- **Core argument:** [Single sentence central claim]
- **Key arguments:**
  1. [Argument 1]
  2. [Argument 2]
  3. [Argument 3]
- **Supporting scriptures:** [Scripture 1], [Scripture 2], ...
- **Momentum position:** [Foundation | Building | Accelerating | Climax | Landing]
- **Connects to:** Ch [X] (foreshadows...), Ch [Y] (builds on...)
- **Target word count:** ~[N] words
- **Ending style:** [cliffhanger_seed | reflective_hook]

## Chapter 2: [Title]
- **Hook strategy:** [Type] -- [Specific hook description in 1-2 sentences]
- **Core argument:** [Single sentence central claim]
- **Key arguments:**
  1. [Argument 1]
  2. [Argument 2]
  3. [Argument 3]
- **Supporting scriptures:** [Scripture 1], [Scripture 2], ...
- **Momentum position:** [Foundation | Building | Accelerating | Climax | Landing]
- **Connects to:** Ch [X] (foreshadows...), Ch [Y] (builds on...)
- **Target word count:** ~[N] words
- **Ending style:** [cliffhanger_seed | reflective_hook]

[... continue for all chapters ...]
```

Every chapter MUST have all fields present. No field may be omitted for any chapter.

The "Supporting scriptures" field may be "[N/A -- non-theological voice profile]" if the voice profile does not have a Theological/Domain Framework section.

For Source Ingestion Mode, add a "Source Material Notes" bullet after "Ending style" for each chapter:
```markdown
- **Ending style:** [cliffhanger_seed | reflective_hook]
- **Source Material Notes:** [Key quotes, illustrations, or source references for this chapter]
```

After writing `chapter-outline.md`, report to the orchestrator:
- "Outline generated: [N] chapters, [size tier] tier, ~[total word count] words target"
- "Momentum distribution: [N] Foundation, [N] Building, [N] Accelerating, [N] Climax, [N] Landing"
- Mode used (Topic Brief or Source Ingestion)

## 6. Post-Approval: Generate Book DNA

This section executes ONLY after the orchestrator confirms the user has approved the outline. The orchestrator adds `<!-- APPROVED -->` to `chapter-outline.md` and then re-invokes the outliner for Book DNA generation.

### Inputs

Read the following:
1. `[project]/chapter-outline.md` -- the approved outline
2. `[project]/voice-profile.md` -- the voice profile
3. `${CLAUDE_PLUGIN_ROOT}/references/book-dna-template.md` -- the template

### Populate book-dna.md

Populate `[project]/book-dna.md` by filling in every section of the template:

#### 1. Metadata
Already partially populated by the orchestrator during project creation. Update:
- **Chapter count** from the outline
- **Target word count** from the outline's Size Tier section

#### 2. Voice Profile
Copy the following sections from `voice-profile.md` into the Voice Profile section of `book-dna.md`:
- **Tone** -> Voice Profile > Tone
- **Sentence Patterns** -> Voice Profile > Sentence Patterns
- **Vocabulary** (both Use and Avoid subsections) -> Voice Profile > Vocabulary
- **Emphasis Techniques** -> Voice Profile > Emphasis Techniques

#### 3. Theological/Domain Framework
Copy from `voice-profile.md` if present. If the voice profile has no Theological/Domain Framework section, write:
"[No domain framework specified -- use general knowledge]"

#### 4. Book Arc
Copy the Book Arc line from `chapter-outline.md`.

#### 5. Chapter Map
Build a table from the outline with one row per chapter:

| Ch | Title | Core Argument | Opening Hook Strategy | Key Scriptures | Connects To |
|----|-------|---------------|-----------------------|----------------|-------------|

Data is extracted directly from each chapter's structured fields in the outline.

#### 6. Running Themes
Analyse the outline and identify 3-7 themes that recur across multiple chapters. For each theme, note:
- Which chapter **introduces** the theme
- Which chapters **develop** it
- Which chapter provides the **climax** of that theme

Format: `- [Theme name]: Introduced Ch [X], developed Ch [Y, Z], climax Ch [W]`

#### 7. Key Terms and Jargon
Extract key terms from the outline that need consistent definition across chapters. For each term:
- **Term:** The word or phrase
- **Definition:** Brief, clear definition
- **First Used:** Which chapter introduces this term

These terms must be used consistently by every chapter agent. A term defined in Chapter 2 must mean the same thing in Chapter 14.

#### 8. Cross-Chapter Continuity
Based on the "Connects to" fields in the outline, write explicit continuity notes:

- **Foreshadowing:** "Chapter [X] sets up [concept] that pays off in Chapter [Y]"
- **Callbacks:** "Chapter [X] references back to the illustration from Chapter [Y]"
- **Running metaphors:** Any metaphor that should recur across chapters, with the chapters where it appears
- **Recurring imagery:** Visual or conceptual imagery that builds throughout the book

#### 9. Style Rules
Derive from voice profile and outline:
- **Spelling convention:** Default to British/SA English unless voice profile specifies otherwise
- **Scripture translation default:** From voice profile's Scripture Handling section, or NKJV if not specified
- **Target words per chapter:** From the outline's Size Tier section
- **Formatting rules:** Any specific formatting instructions from the voice profile (e.g., "no em dashes", "bold for emphasis")

#### 10. Add READ-ONLY marker
At the very top of `book-dna.md`, before the title, add:

```
<!-- READ-ONLY: Do NOT modify this document during parallel chapter generation. Updates happen between pipeline stages only. -->
```

This marker is critical. During Stage 3 (parallel chapter writing), multiple chapter agents read this document simultaneously. Any modification during parallel execution would create race conditions and voice drift.

### Completion Confirmation

After writing `book-dna.md`, confirm completion:
"Book DNA generated. [N] chapters mapped, [M] running themes identified, [K] key terms defined."

## 7. Important Constraints

- **Never skip the narrative arc design step.** Chapters without momentum positioning produce flat books that feel like a collection of blog posts rather than a progressive argument.
- **Source Ingestion Mode must TRANSFORM source structure, not mirror it.** A sermon series has standalone talks; a book has a progressive argument. These are fundamentally different structures.
- **All outline fields are mandatory.** Do not omit any field for any chapter. If a field is not applicable (e.g., scriptures for non-theological books), use the explicit N/A notation.
- **Per-chapter word targets must be calculated from the size tier.** Never leave word counts as placeholders or "TBD".
- **Book DNA generation happens ONLY after outline approval.** If the outline has not been approved (no `<!-- APPROVED -->` marker in `chapter-outline.md`), do not generate Book DNA. The outliner's Section 6 is only invoked by the orchestrator after the user approves.
- **The Book DNA READ-ONLY marker is critical.** It prevents parallel chapter agents from modifying the shared context document, which would cause voice drift and data corruption. Never omit it.
- **Cross-chapter connections are not optional.** Every chapter must reference at least one other chapter. Isolated chapters produce disjointed books.
- **The climax must deliver on the opening.** During the coherence check, verify that the climax chapter resolves the tension established in the foundation chapters.
