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

**Input:** `book-dna.md` + `voice-profile.md` + all `drafts/ch*-draft.md` files
**Output:** `edited/ch01-final.md`, `edited/ch02-final.md`, etc. + `reports/consistency-report.md`
**Parallel:** Partially -- Pass 1 voice audit can use parallel subagents for 16+ chapter books; Passes 2-3 are sequential

Editing passes (sequential):
1. **Pass 1: Voice consistency + theological guardrails** -- audits vocabulary, sentence rhythm, anti-patterns, and theological framework compliance against the voice profile. Normalises drift.
2. **Pass 2: Flow/transitions** -- reads chapter pairs sequentially, ensures endings connect to next openings. Only modifies final/first paragraphs.
3. **Pass 3: Cross-chapter validation** -- builds term index, validates forward/backward references, checks scripture translation consistency, tracks theme development.

Intermediate artefacts: `edited/ch[NN]-pass1.md`, `edited/ch[NN]-pass2.md` (kept for debugging, not used by pipeline state detection)

**Reports:** `reports/consistency-report.md` with per-chapter findings, severity levels, and specific locations.

**Review gate:** After editing completes, the orchestrator presents the consistency report and offers: approve (proceed to Stage 5), revise specific chapters, or read the full draft.

**Revision workflow:** User requests chapter rewrites with targeted feedback. For each revised chapter:
1. Original draft backed up to `revisions/ch[NN]-v[VV]-draft.md` (version auto-incremented)
2. Chapter re-written by writer agent with user feedback
3. Editor re-runs Pass 1 on revised chapter, Pass 2 on revised chapter + immediate neighbours, Pass 3 on affected references
4. Consistency report updated

**Rolling window:** For books with 16+ chapters, Pass 1 uses chapter-editor subagents. Each receives the current chapter plus 500 words overlap from adjacent chapters.

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
| Edit | `edited/` dir has `ch*-final.md` files matching outline chapter count AND no `<!-- REVISION IN PROGRESS -->` marker in `reports/consistency-report.md` | `edited/ch01-final.md` + `reports/consistency-report.md` |
| Format | `output/` dir contains `.docx` file | `output/[Title].docx` |
