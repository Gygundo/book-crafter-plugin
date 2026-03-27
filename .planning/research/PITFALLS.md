# Domain Pitfalls

**Domain:** Multi-agent Claude Code plugin for AI-powered book writing
**Researched:** 2026-03-27

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: Voice Drift Across Parallel Chapters

**What goes wrong:** Each chapter-writer subagent subtly shifts voice. Chapter 1 sounds punchy and direct, Chapter 5 sounds academic, Chapter 12 sounds like a different author. The reader can feel it even if they cannot articulate why.

**Why it happens:** Each subagent starts fresh with no memory of other chapters. Without explicit, concrete voice constraints, Claude defaults to its "helpful assistant" voice -- polished, neutral, slightly formal. Vague instructions like "write in a bold, direct style" are insufficient.

**Consequences:** The book reads like an anthology, not a single-author work. Complete rewrite of drifted chapters required.

**Prevention:**
- Book DNA must include 3-5 paragraphs of EXEMPLAR writing in the target voice, not just descriptions of the voice
- Include a "words the author NEVER uses" list (e.g., "Furthermore", "It is important to note", "In conclusion")
- Include a "words the author ALWAYS uses" list
- Specify quantifiable style metrics: average sentence length, fragment frequency, question frequency
- The editor skill runs a systematic voice audit before any chapter is finalised

**Detection:** Read Chapter 1 and Chapter 10 back-to-back. If they feel like different authors, voice drift has occurred.

### Pitfall 2: Context Window Exhaustion in Editor Stage

**What goes wrong:** The editor skill tries to load all 20 chapters plus Book DNA plus its instructions, exceeding the context window. Either the model truncates (losing early chapters) or quality degrades as attention spreads thin.

**Why it happens:** The editor needs cross-chapter awareness for continuity checking, but a 60K-word book is ~80K tokens -- a significant portion of even large context windows, leaving little room for reasoning.

**Consequences:** Editor misses continuity issues. Chapters that reference each other contain contradictions. Themes introduced in early chapters are forgotten in later ones.

**Prevention:**
- Two-pass editing: Pass 1 processes each chapter individually (voice audit). Pass 2 reads chapter boundaries only (last 500 words of Ch N + first 500 words of Ch N+1) for flow checking.
- Book DNA tracks all cross-references, callbacks, and running metaphors so the editor does not need to hold the entire book in memory.
- For standard-length books, consider using editor subagents per chapter (parallel voice audit) followed by a single continuity pass.

**Detection:** Read chapter transitions. If Chapter 7 ends with a cliffhanger that Chapter 8 ignores, continuity failed.

### Pitfall 3: Outline Approval Skipped or Weak

**What goes wrong:** User approves a thin outline ("looks fine") without scrutinising it. The resulting book has structural problems: redundant chapters, missing key arguments, no narrative arc.

**Why it happens:** Outlining feels like a formality when you are eager to see the actual writing. The outline looks reasonable at a glance but lacks the specificity needed to guide 20 independent chapter agents.

**Consequences:** Chapters repeat each other's arguments. The book feels flat -- no escalation, no climax. Restructuring requires regenerating the entire book.

**Prevention:**
- The outliner must produce a DETAILED outline: each chapter has a title, core argument, opening hook strategy, key supporting evidence, and explicit connections to other chapters.
- The orchestrator should present the outline with diagnostic questions: "Does the arc build? Are any chapters redundant? Is the climax in the right place?"
- Include word count targets per chapter in the outline so the user can see the balance.

**Detection:** Two chapters with nearly identical core arguments in the outline.

### Pitfall 4: Subagent Spawning Limitations Not Accounted For

**What goes wrong:** The orchestrator tries to spawn 20 chapter-writer subagents simultaneously and either hits the ~10 parallelism cap (causing failures or queueing) or tries to have subagents spawn sub-subagents (which silently fails).

**Why it happens:** Developer assumes unlimited parallelism or nested delegation. Claude Code documentation is clear about these limits but they are easy to overlook.

**Consequences:** Some chapters never get written. Pipeline stalls. User sees incomplete output with no clear error.

**Prevention:**
- Batch chapters into waves of 8-10 maximum.
- Never design for nested subagent spawning. The orchestrator (main thread) must directly spawn ALL subagents.
- Build wave completion checks into the orchestrator: verify all chapter files exist before proceeding to the next stage.

**Detection:** Missing draft files in the project directory after the writing stage.

## Moderate Pitfalls

### Pitfall 1: docx-js Formatting Gotchas

**What goes wrong:** The .docx output has broken tables (percentage widths), unicode bullets instead of proper lists, missing TOC entries, or black-filled table cells.

**Prevention:**
- Follow the docx skill's rules exactly: WidthType.DXA only (never PERCENTAGE), LevelFormat.BULLET (never unicode), HeadingLevel for TOC, ShadingType.CLEAR (never SOLID).
- Run `python scripts/office/validate.py` on every generated .docx.
- The formatter skill should contain a checklist of known docx-js pitfalls extracted from the docx skill.

### Pitfall 2: Book DNA Grows Too Large

**What goes wrong:** As the pipeline adds research notes, cross-references, and continuity tracking to the Book DNA, it bloats beyond 5K words. Subagents now spend significant context on the DNA, leaving less room for actual chapter writing.

**Prevention:**
- Hard limit: Book DNA must stay under 5,000 words.
- Per-chapter research goes in SEPARATE files (research/ch01-research.md), not in the DNA.
- The DNA contains summaries and pointers, not full content.
- Periodically compress: the orchestrator can ask Claude to summarise and condense the DNA between stages.

### Pitfall 3: Chapter Length Inconsistency

**What goes wrong:** Some chapters come out at 1,500 words, others at 6,000 words. The book feels unbalanced. Short chapters feel thin; long chapters feel bloated.

**Prevention:**
- Include explicit word count targets in each chapter assignment: "Target: 3,000 words (+/- 500)."
- The editor flags chapters that deviate more than 30% from the target.
- The outline should distribute content evenly, not overload some chapters and starve others.

### Pitfall 4: Scripture Handling Inconsistency (Spiritual Books)

**What goes wrong:** Some chapters use NKJV, others default to NIV or ESV. Some quote scripture in full, others just reference it. Some use red text for Jesus' words, others do not.

**Prevention:**
- The Book DNA's style rules must specify: "Default translation: NKJV. Quote in full, never just reference. Red text for key revelation passages."
- The voice profile for spiritual books inherits these rules from the sermon-crafter's theological framework.
- The editor checks scripture handling as part of its voice audit.

### Pitfall 5: Source Material Ingestion Loses Key Content

**What goes wrong:** When converting existing sermons/notes into a book, the ingestion step summarises too aggressively, losing the pastor's specific phrasings, word studies, and unique insights that make the content valuable.

**Prevention:**
- The source ingestion step should extract and PRESERVE verbatim quotes, word studies, and unique illustrations -- not just summarise themes.
- Present extracted content to the user for validation before the outline stage.
- Keep source material accessible to chapter writers (as reference files), not just the summary.

## Minor Pitfalls

### Pitfall 1: File Naming Collisions

**What goes wrong:** Two book projects with similar titles overwrite each other's directories.

**Prevention:** Include a date stamp or unique identifier in the project directory name. e.g., `~/Documents/Books/2026-03-The-Authority-Of-The-Believer/`

### Pitfall 2: Approval Fatigue in Long Books

**What goes wrong:** User approves outline, then is asked to approve 20 individual chapter drafts, then review editor changes. They stop paying attention.

**Prevention:** Approval gates should be minimal: outline approval (required), then full book review (optional). Per-chapter review should be available but not mandated.

### Pitfall 3: Markdown-to-Docx Formatting Loss

**What goes wrong:** Markdown conventions (bold, italic, headers) do not map perfectly to the desired docx formatting (specific colours, highlight shading, font sizes).

**Prevention:** The formatter skill must have explicit mapping rules, not rely on generic markdown-to-docx conversion. The mapping should be documented in `references/formatting-guide.md`.

### Pitfall 4: Stale Book DNA After Revisions

**What goes wrong:** User requests chapter-level revisions after the editor pass. The revised chapters diverge from what the Book DNA describes, but the DNA is not updated.

**Prevention:** When a chapter is revised, the orchestrator should update the Book DNA's chapter map and continuity notes to reflect the changes.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Plugin skeleton + orchestrator | Orchestrator too rigid, cannot handle interruptions or partial reruns | Design orchestrator to detect pipeline state from filesystem (which files exist) rather than tracking state in memory. Allow resuming from any stage. |
| Outliner + Book DNA | Outline too thin, DNA too sparse for voice consistency | Require detailed outline template with mandatory fields. DNA must include voice exemplars, not just descriptions. |
| Parallel chapter writing | Voice drift, length inconsistency, missing chapters | Concrete voice examples in DNA. Explicit word targets. Wave completion verification. |
| Editor integration | Context overflow, superficial editing | Two-pass approach. Per-chapter voice audit + boundary continuity check. |
| Formatter + .docx output | docx-js formatting bugs, broken TOC, invalid XML | Follow docx skill rules exactly. Validate after generation. Test with Word, Google Docs, and LibreOffice. |
| Source ingestion (existing content) | Over-summarisation loses unique content | Preserve verbatim quotes and word studies. User validation step. |
| Custom voice profiles | Insufficient voice specification leads to generic output | Voice profile template with mandatory sections: exemplar writing, forbidden words, required patterns, sentence metrics. |

## Sources

- David's docx skill (`~/.claude/skills/docx/SKILL.md`) -- Known docx-js pitfalls and validation approach
- encounter-content-engine orchestrator -- Pipeline state detection patterns
- [Claude Code Subagents documentation](https://code.claude.com/docs/en/sub-agents) -- Parallelism limits, no nested spawning
- [StoryWriter framework](https://dl.acm.org/doi/10.1145/3746252.3761616) -- Coherence challenges in multi-agent story generation
- sermon-crafter SKILL.md -- Voice consistency patterns and scripture handling conventions
