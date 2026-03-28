# Phase 7: Captivating Writing, Modern Voice Profile, and Bestseller Formatting - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Upgrade the entire pipeline's writing quality from functional-but-sermon-like output to captivating, page-turner prose that reads like a bestselling Christian book. Three pillars: (1) rewrite the spiritual-default voice profile to sound like bestselling Christian authors, (2) enhance the writer and outliner skills with storytelling-first patterns, (3) modernise the formatter for bestseller-standard .docx output, (4) add captivation enforcement to the editor.

This phase does NOT create new voice profiles for other genres or build the voice-builder skill (Phase 8). It fixes the existing default voice and upgrades the pipeline's quality floor.

</domain>

<decisions>
## Implementation Decisions

### Writing Quality
- **D-01:** Every chapter opens with a story, anecdote, or vivid scene that draws the reader in emotionally BEFORE any teaching begins. The existing 4 hook types (bold declaration, rhetorical question, counter-intuitive claim, tension-creating observation) become secondary tools within the opening story, not standalone openings.
- **D-02:** Chapter endings use a hybrid approach: some chapters end with a cliffhanger seed (question, tension, or preview that makes the reader NEED the next chapter), others end with a reflective landing followed by a 1-2 sentence forward hook. The outliner designs which ending style fits each chapter based on momentum position.
- **D-03:** Chapter body pacing uses BOTH rhythm variation AND tension-release cycles. Paragraph rhythm: short punchy paragraphs (1-2 sentences) for impact, longer paragraphs (4-6 sentences) for depth, single-sentence paragraphs for dramatic beats. Each chapter structured as 2-3 tension-release cycles: build tension through a question/problem, release through revelation/answer.
- **D-04:** Writer uses direct reader engagement language frequently throughout: "you", "imagine this", "picture yourself", rhetorical questions woven into prose. The book speaks TO the reader personally, not lectures at them.

### Modern Voice Profile
- **D-05:** Upgrade the existing spiritual-default.md voice profile to model the *writing style* of bestselling Christian authors (John Eldredge, Bob Goff, Lisa Bevere style — storytelling, warmth, vulnerability, page-turner pacing). Keep the existing theological framework intact (grace-based, New Covenant, supernatural-affirming). Borrow their *craft*, not their *theology*.
- **D-06:** Include 2-3 short reference excerpts from bestselling Christian books as "target quality" examples in the voice profile, alongside improved CORRECT/WRONG calibration examples. Gives the writer agent a concrete north star.
- **D-07:** Sentence rhythm: keep the short punchy base (12-18 word average) but add more long flowing sentences for storytelling sections. The current profile is ALL punchy — bestsellers mix short impact with longer narrative flow.
- **D-08:** Voice profile MUST instruct the writer to weave personal stories and vulnerability into theological content. "I remember when..." moments, real-life illustrations, failures and doubts shared alongside theological depth. This is essential, not optional.
- **D-09:** New anti-patterns added to the voice profile:
  - **Lecture tone:** Block "let me explain", "it is important to note", "we must understand" — anything that sounds like a classroom instead of a conversation
  - **List-heavy structure:** Block excessive bullet-point thinking disguised as prose. No "3 steps to..." or "firstly, secondly, thirdly" patterns
  - **Missing emotional connection:** Flag content that is all head (theology/logic) with no heart (story/emotion/vulnerability). Every theological point must connect to a human experience
  - **Predictable chapter formula:** Block chapters that follow the same structural template. Vary the approach — some lead with story, others with a bold claim, others with a question

### Bestseller Formatting
- **D-10:** Scriptures formatted as block-quoted separate paragraphs with italic text, reference on the next line right-aligned. Visually distinct from body text. NEVER inline within a sentence.
- **D-11:** Typography uses modern mixed style: sans-serif chapter headings (Calibri or similar) with serif body text (Georgia or Garamond). Standard modern bestseller look.
- **D-12:** Pull quotes supported: key statements pulled out as centred, larger text between paragraphs. Writer/editor marks pull-quote candidates during editing. Formatter renders them with distinct styling.

### Editor Enforcement
- **D-13:** Four new captivation checks integrated into the existing 3-pass pipeline (no new pass):
  - **Opening engagement check** (Pass 2 — flow): Validate first 200 words contain a story/anecdote/scene, not a teaching statement. Flag chapters that open with theology instead of narrative.
  - **Chapter-ending momentum** (Pass 2 — flow): Check every chapter ending has either a cliffhanger seed or reflection-plus-forward-hook. Flag chapters that just stop.
  - **Pacing variety score** (Pass 1 — voice): Measure paragraph length distribution — flag chapters where 80%+ of paragraphs are the same length. Require mix of short and long.
  - **Emotional connection audit** (Pass 1 — voice): Flag chapters with no personal stories, anecdotes, or vulnerability markers. Every chapter needs at least one human-experience moment.
- **D-14:** Editor's consistency report includes a per-chapter captivation score (1-10) based on: opening hook quality, ending momentum, pacing variety, emotional connection, reader engagement language. Makes weak chapters visible at a glance.

### Claude's Discretion
- Specific sans-serif font choice for headings (Calibri, Helvetica, or similar — pick what renders best in .docx)
- Pull quote visual styling details (font size, spacing, border treatment)
- How tension-release cycles are structured within chapters (number of cycles, length of each)
- Which specific bestselling author excerpts to use as calibration examples
- How to balance the new storytelling requirements with chapters that are naturally more teaching-heavy

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Voice System
- `references/voice-profiles/spiritual-default.md` — Current voice profile to be upgraded (tone, rhythm, vocabulary, anti-patterns, theological framework)
- `references/voice-profile-spec.md` — Voice profile structure specification (required/optional sections, validation rules)
- `references/book-dna-template.md` — Master context document template that propagates voice to all agents

### Writing Pipeline
- `skills/writer/SKILL.md` — Writer skill with hook strategies, chapter structure, voice consistency rules, momentum-aware pacing, calibration examples
- `skills/outliner/SKILL.md` — Outliner skill with chapter map, hook strategy assignment, momentum positions, book arc design
- `skills/editor/SKILL.md` — Editor skill with 3-pass pipeline (voice, flow, cross-chapter), rolling window, severity ratings
- `agents/chapter-writer.md` — Chapter writer subagent definition
- `agents/chapter-editor.md` — Chapter editor subagent definition

### Formatting
- `skills/formatter/SKILL.md` — Formatter skill with document assembly, typography, front/back matter, enrichment rendering
- `references/pipeline-stages.md` — Full pipeline stage documentation

### Orchestrator
- `skills/orchestrator/SKILL.md` — Master orchestrator that chains all stages

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Voice profile system is fully extensible — new profiles are just .md files in `references/voice-profiles/`
- Writer skill already reads voice profile dynamically — upgraded profile will be used automatically
- Editor anti-pattern detection reads from voice profile, not hard-coded — new anti-patterns will be enforced automatically
- Book DNA template propagates voice to all parallel agents — voice changes cascade without code changes

### Established Patterns
- Voice profile spec defines 5 required + 2 optional sections with validation rules
- Writer skill uses 3 concrete calibration examples (CORRECT, WRONG-academic, WRONG-casual, WRONG-generic)
- Editor produces severity ratings (clean/minor/significant) per chapter per pass
- Formatter uses docx-js with Georgia 12pt throughout, 1.5 line spacing, 6pt paragraph spacing

### Integration Points
- Outliner chapter map needs new field: chapter ending style (cliffhanger vs reflection+hook)
- Writer skill needs expanded pacing guidance and storytelling requirements
- Editor Pass 1 and Pass 2 need new check integrations
- Formatter needs new paragraph styles: scripture block quote, pull quote, sans-serif heading
- Consistency report needs new captivation score column

</code_context>

<specifics>
## Specific Ideas

- Model writing craft after bestselling Christian authors (Eldredge, Goff, Bevere) but keep the existing grace-based, New Covenant theological framework — borrow craft, not theology
- Every theological point must connect to a human experience — no purely intellectual chapters
- Scripture MUST be block-quoted as separate paragraphs, NEVER inline
- Books should feel like something people want to read cover-to-cover, not reference material or teaching notes reformatted as chapters

</specifics>

<deferred>
## Deferred Ideas

- Voice builder skill (interview user to create custom profiles) — Phase 8
- Genre-specific voice profiles (leadership, memoir, teaching, narrative) — after voice builder exists
- Non-theological voice profiles — Phase 8 enables this through the builder

None beyond existing Phase 8 scope — discussion stayed within phase scope.

</deferred>

---

*Phase: 07-captivating-writing-modern-voice-profile-and-bestseller-formatting*
*Context gathered: 2026-03-28*
