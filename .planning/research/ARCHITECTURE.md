# Architecture Patterns

**Domain:** Multi-agent Claude Code plugin for AI-powered book writing
**Researched:** 2026-03-27

## Recommended Architecture

### Pipeline-and-Parallel Architecture

```
USER INPUT (topic brief OR existing content)
    |
    v
[ORCHESTRATOR] ---- Main thread, controls entire pipeline
    |
    |-- Stage 1: OUTLINE (sequential, single agent)
    |   +-- Produces: book-dna.md, chapter-outline.md
    |   +-- GATE: User approves outline before proceeding
    |
    |-- Stage 2: RESEARCH (parallel per-chapter)
    |   +-- Subagent: research ch1
    |   +-- Subagent: research ch2
    |   +-- ... (batched in waves of 8-10)
    |   +-- Produces: research/ch01-research.md, ...
    |
    |-- Stage 3: WRITE (parallel per-chapter)
    |   +-- Subagent: write ch1  <- reads book-dna.md + ch01-research.md
    |   +-- Subagent: write ch2  <- reads book-dna.md + ch02-research.md
    |   +-- ... (batched in waves of 8-10)
    |   +-- Produces: drafts/ch01-draft.md, ...
    |
    |-- Stage 4: EDIT (sequential, reads all chapters)
    |   +-- Reads: book-dna.md + all drafts
    |   +-- Produces: edited/ch01-final.md, ...
    |   +-- Updates: book-dna.md with continuity notes
    |
    |-- Stage 5: FORMAT (sequential, single agent)
    |   +-- Reads: all final chapters + formatting guide
    |   +-- Produces: [Book Title].docx
    |   +-- Validates: python scripts/office/validate.py
    |
    +-- COMPLETE: Book saved to project directory
```

### Component Boundaries

| Component | Responsibility | Communicates With | Context Needs |
|-----------|---------------|-------------------|---------------|
| Orchestrator (skill) | Pipeline control, stage sequencing, approval gates, progress reporting | All other skills, spawns subagents | Full session context. Tracks pipeline state via filesystem. |
| Outliner (skill) | Generate book structure, initial Book DNA | Orchestrator (invoked by), voice profile (reads) | Topic brief + voice profile. ~5K tokens input. |
| Researcher (subagent) | Gather supporting material per chapter | Orchestrator (spawned by), outline (reads) | Chapter outline + topic context. ~3K tokens input per chapter. |
| Writer (subagent) | Produce full chapter draft | Orchestrator (spawned by), Book DNA (reads), research (reads) | Book DNA (~4K) + chapter outline (~500) + chapter research (~2K) = ~7K tokens input. |
| Editor (skill) | Voice consistency, flow, continuity | Orchestrator (invoked by), all drafts (reads), Book DNA (reads/updates) | ALL chapters must be accessible. Most context-heavy stage. May need batched processing for long books. |
| Formatter (skill) | .docx generation | Orchestrator (invoked by), all final chapters (reads), formatting guide (reads) | Reads final markdown files, generates single .docx. |

### Data Flow

All inter-stage communication happens via the filesystem. No in-memory state sharing. Each stage reads files produced by prior stages and writes files for subsequent stages. This is the natural pattern for Claude Code -- skills and subagents communicate through file I/O.

```
voice-profile.md -----------------------------------------------+
                                                                 |
topic-brief (user input) --> Outliner --> book-dna.md -----------+
                                    +--> chapter-outline.md      |
                                              |                  |
                                              v                  |
                                         Researcher --> research/ch*.md
                                              |                  |
                                              v                  v
                                           Writer --> drafts/ch*.md
                                              |
                                              v
                                           Editor --> edited/ch*.md
                                              |         +--> book-dna.md (updated)
                                              v
                                          Formatter --> [Book Title].docx
```

### Project Directory Structure

```
~/Documents/Books/[Book Title]/
+-- book-dna.md                    # Master context document
+-- chapter-outline.md             # Approved outline
+-- voice-profile.md               # Copy of selected voice profile
+-- research/
|   +-- ch01-research.md
|   +-- ch02-research.md
+-- drafts/
|   +-- ch01-draft.md
|   +-- ch02-draft.md
+-- edited/
|   +-- ch01-final.md
|   +-- ch02-final.md
+-- front-matter/
|   +-- foreword.md
|   +-- about-author.md
+-- output/
    +-- [Book Title].docx
```

## Patterns to Follow

### Pattern 1: Book DNA as Shared Context

**What:** A single markdown document that encodes everything a chapter-writer needs to know about the book's identity, without needing to read other chapters.

**When:** Every time a subagent is spawned for writing or editing.

**Why:** Subagents have isolated context windows. They cannot see the main conversation or other subagents. The Book DNA is the sole mechanism for maintaining coherence.

**Structure:**
```markdown
# Book DNA: [Book Title]

## Voice Profile
[Extracted from voice-profile.md -- tone, rhythm, vocabulary]

## Theological/Domain Framework
[Core beliefs, interpretive lens, what to emphasise, what to avoid]

## Book Arc
[Opening tension -> progressive revelation -> climactic truth -> resolution]

## Chapter Map
| Ch | Title | Core Argument | Key Hook | Connects To |
|----|-------|---------------|----------|-------------|
| 1  | ...   | ...           | ...      | Ch 3, Ch 7  |

## Running Themes
- [Theme 1]: First introduced Ch 2, developed Ch 5, climax Ch 12

## Key Terms and Jargon
| Term | Definition | First Used |
|------|-----------|------------|

## Style Rules
- British/SA spelling (favour, honour)
- NKJV default for scripture
- No em dashes
- Short sentences. Fragments for emphasis.
- Target: [X] words per chapter
```

### Pattern 2: Subagent-per-Chapter with Preloaded Skills

**What:** Each chapter gets a dedicated subagent with the writer skill preloaded.

**When:** Stage 3 (writing) and optionally Stage 2 (research).

**Example subagent definition (`agents/chapter-writer.md`):**
```yaml
---
name: chapter-writer
description: Writes a single book chapter following the Book DNA and voice profile
tools: Read, Write, Bash, Grep, Glob
skills:
  - book-crafter:writer
model: inherit
maxTurns: 50
---

You are a chapter writer for a book project. You will receive:
1. The Book DNA document (voice, themes, outline)
2. Your specific chapter assignment (number, title, outline)
3. Research notes for your chapter

Write the complete chapter in markdown. Follow the voice profile exactly.
Save to the drafts directory specified in your assignment.
```

**How the orchestrator spawns parallel writers:**
The orchestrator issues multiple Agent tool calls in a single message. Claude Code executes them concurrently (up to ~10 parallel). Each receives a task prompt specifying which chapter to write, which files to read, and where to save output.

### Pattern 3: Approval Gate Between Stages

**What:** The orchestrator pauses and presents the outline to the user before proceeding to writing.

**When:** After Stage 1 (outline) completes.

**Why:** Generating 40K+ words based on a bad outline wastes significant time and tokens. The outline is the cheapest point to course-correct.

**Implementation:** The orchestrator skill simply presents the outline and asks for confirmation. No special tooling needed -- this is a natural conversation turn.

### Pattern 4: Wave-Based Parallel Execution

**What:** For books with more chapters than the parallelism cap (~10), batch chapters into waves.

**When:** Standard books (15-25 chapters).

- Wave 1: Chapters 1-10 (parallel subagents) -> wait for all to complete
- Wave 2: Chapters 11-20 (parallel subagents) -> wait for all to complete

**Why not sequential?** A 20-chapter book at ~5 minutes per chapter = ~100 minutes. With 10-way parallelism in 2 waves = ~10 minutes.

### Pattern 5: Editor as Voice Auditor

**What:** The editor skill systematically compares each chapter against the voice profile, scoring consistency.

**When:** Stage 4, after all chapters are drafted.

**Implementation:**
1. Read Book DNA (voice section)
2. For each chapter: check sentence length distribution, forbidden vocabulary, required patterns (rhetorical questions, bold declarations), opening hook quality, scripture handling
3. Produce edit report with per-chapter scores
4. Rewrite flagged sections to match voice

## Anti-Patterns to Avoid

### Anti-Pattern 1: Shared Mutable State During Parallel Execution

**What:** Updating Book DNA or any shared file while chapter-writers are running in parallel.

**Why bad:** Race conditions. If chapter-writer-3 updates book-dna.md while chapter-writer-7 is reading it, you get inconsistency.

**Instead:** Book DNA is READ-ONLY during parallel stages. Updates happen BETWEEN stages only.

### Anti-Pattern 2: Cramming All Chapters Into One Context

**What:** Having the writer or editor load all 20 chapters simultaneously.

**Why bad:** Context window overflow. 20 chapters at 3K words each = 60K words = ~80K tokens. Plus instructions. Quality degrades.

**Instead:** Writer subagents load only their chapter. Editor processes in batches or uses a two-pass approach (first pass: voice audit per chapter; second pass: continuity check across chapter boundaries).

### Anti-Pattern 3: Duplicating Voice Instructions Across Skills

**What:** Copying voice profile content into each SKILL.md file.

**Why bad:** When the voice profile changes, you must update 6+ files. Drift is inevitable.

**Instead:** Single source of truth in `references/voice-profiles/`. The Book DNA contains the active voice profile, populated at project initialisation.

### Anti-Pattern 4: Generating .docx Per Chapter

**What:** Each chapter-writer subagent produces its own .docx file instead of markdown.

**Why bad:** Merging multiple .docx files is painful. TOC requires all content in one document. Each subagent would need full docx-js knowledge.

**Instead:** All intermediate artifacts are markdown. A single formatter skill produces one .docx at the end.

### Anti-Pattern 5: Nested Subagent Spawning

**What:** Having the orchestrator spawn a "research manager" subagent that then spawns per-chapter research subagents.

**Why bad:** Claude Code explicitly prevents this. Subagents CANNOT spawn other subagents.

**Instead:** The orchestrator (main thread) directly spawns all subagents. Flat hierarchy only.

## Scalability Considerations

| Concern | Booklet (<100 pages) | Short (15-25K words) | Standard (40-60K words) |
|---------|---------------------|---------------------|------------------------|
| Chapter writing | Sequential or 1 wave | 1 wave of 8-10 subagents | 2-3 waves of 8-10 subagents |
| Book DNA size | Minimal (~1K words) | Standard (~3K words) | Full (~5K words) |
| Editor approach | Single pass, inline | Two-pass (voice + continuity) | Two-pass, batched chapter loading |
| Total generation time | ~10-15 min | ~20-30 min | ~40-60 min |
| Context pressure | None | Moderate (editor stage) | High (editor needs batching) |

## Sources

- [Claude Code Subagents documentation](https://code.claude.com/docs/en/sub-agents) -- Parallelism constraints, subagent definitions, skills preloading
- encounter-content-engine orchestrator SKILL.md -- Pipeline + wave pattern, dependency graph
- [StoryWriter framework](https://dl.acm.org/doi/10.1145/3746252.3761616) -- Outline -> Planning -> Writing agent architecture
- [Claude Code Skills documentation](https://code.claude.com/docs/en/skills) -- context: fork, supporting files, frontmatter reference
