# Book Crafter Pipeline Stages

Reference document describing the five stages of the book-writing pipeline. The orchestrator uses this to guide the user through the process and to determine which stage to execute next.

## Stage 1: Outline (outliner skill)

**Input:** Topic brief (topic, key themes, target audience, optional scriptures) OR existing content (sermon transcripts, notes, blog posts)
**Output:** `chapter-outline.md` + initial `book-dna.md`
**Approval gate:** User must review and approve the outline before Stage 2 begins.

The outliner generates a chapter-by-chapter structure including:
- Chapter titles and opening hook strategies
- Key arguments and supporting scriptures per chapter
- Narrative arc with momentum positioning (chapters escalate toward a climax)
- Book size tier: booklet (<100 pages, 5-8 chapters), short (15-25K words, 8-12 chapters), standard (40-60K words, 12-20 chapters)

## Stage 2: Research (researcher skill)

**Input:** Approved `chapter-outline.md` + `book-dna.md`
**Output:** `research/ch01-research.md`, `research/ch02-research.md`, etc.
**Parallel:** Yes -- one researcher subagent per chapter, batched in waves of 8-10

Per-chapter research includes:
- Scripture references (actual Bible text, NKJV default)
- Cross-references across Old and New Testaments
- Greek/Hebrew word studies
- Illustrations and supporting material

## Stage 3: Write (writer skill + chapter-writer subagent)

**Input:** `book-dna.md` + `research/ch*-research.md` per chapter
**Output:** `drafts/ch01-draft.md`, `drafts/ch02-draft.md`, etc.
**Parallel:** Yes -- one chapter-writer subagent per chapter, batched in waves of 8-10

Each chapter agent reads the full Book DNA for voice consistency and its chapter-specific research. Chapters are written in markdown as intermediate format.

## Stage 4: Edit (editor skill + chapter-editor subagent)

**Input:** `book-dna.md` + all `drafts/ch*-draft.md` files
**Output:** `edited/ch01-final.md`, `edited/ch02-final.md`, etc. + consistency report
**Parallel:** Partially -- voice audit per chapter can be parallel, flow/transition checks are sequential

Editing passes:
1. Voice consistency -- normalise tone, rhythm, vocabulary across all chapters
2. Flow/transition -- ensure chapter endings connect to next chapter openings
3. Cross-chapter validation -- terminology, theological consistency, reference consistency
4. Consistency report with specific flagged issues

## Stage 5: Format (formatter skill)

**Input:** All `edited/ch*-final.md` files + formatting guide
**Output:** `output/[Book Title].docx`
**Parallel:** No -- single document generation

Produces professional .docx with:
- Front matter (half title, full title page, copyright, dedication, TOC)
- Chapter headings with page breaks
- Page numbers (Page X of Y)
- Back matter (about the author, scripture index, glossary)

## Stage Completion Detection

| Stage | Complete When | Key Artefact |
|-------|---------------|--------------|
| Outline | `chapter-outline.md` exists AND contains `<!-- APPROVED -->` marker | `chapter-outline.md` |
| Research | `research/` dir has `ch*-research.md` files matching outline chapter count | `research/ch01-research.md` |
| Write | `drafts/` dir has `ch*-draft.md` files matching outline chapter count | `drafts/ch01-draft.md` |
| Edit | `edited/` dir has `ch*-final.md` files matching outline chapter count | `edited/ch01-final.md` |
| Format | `output/` dir contains `.docx` file | `output/[Title].docx` |
