# Phase 3: Research + Chapter Writing - Research

**Researched:** 2026-03-27
**Domain:** Claude Code skill authoring (researcher skill, writer skill), parallel subagent orchestration, theological research patterns
**Confidence:** HIGH

## Summary

Phase 3 replaces two stub skills (`skills/researcher/SKILL.md` and `skills/writer/SKILL.md`) with full implementations and ensures the orchestrator's Stage 2 (Research) and Stage 3 (Write) execute correctly. The orchestrator, chapter-writer subagent, Book DNA template, and voice profiles are all already in place from Phases 1-2. This phase is entirely SKILL.md authoring -- no new libraries, no new infrastructure, no code beyond markdown instructions.

The researcher skill gathers per-chapter supporting material (scripture, cross-references, Greek/Hebrew word studies, illustrations) and writes structured research artefacts to the project's `research/` directory. The writer skill produces complete chapter drafts following the Book DNA and voice profile. Chapter writing runs in parallel via the existing `chapter-writer` subagent definition, which preloads the `book-crafter:writer` skill. The orchestrator already defines the wave batching pattern (waves of chapters spawned via Agent tool calls).

The core technical challenge is NOT the skill authoring itself -- it is ensuring the researcher produces artefacts structured enough for chapter-writer subagents to consume, and ensuring the writer skill instructions are detailed enough to produce voice-consistent, revelation-driven chapters that match the Book DNA without cross-contamination between parallel agents.

**Primary recommendation:** Implement the researcher SKILL.md with a structured per-chapter research artefact format (scripture blocks, word studies, cross-references, illustrations), then implement the writer SKILL.md with comprehensive chapter-writing instructions including hook strategies, word count targeting, momentum-aware pacing, and theological depth techniques. Update the orchestrator's Stage 2 and Stage 3 sections to invoke these skills correctly with proper arguments.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| RSRCH-01 | Research skill gathers supporting material per chapter (scripture references, cross-references, word studies, illustrations) | Researcher SKILL.md must define structured output format with sections for each material type. Artefacts stored as `research/ch[NN]-research.md`. |
| RSRCH-02 | Scripture references use actual Bible text (NKJV default) -- no fabricated references | Writer and researcher instructions must emphasise: quote actual scripture text from NKJV. Include full verses. Never invent scripture. If uncertain about exact wording, note the reference and mark for verification. |
| RSRCH-03 | Research artefacts stored per chapter in the project directory for writer agents to consume | Output path pattern: `[project]/research/ch[NN]-research.md`. Already defined in orchestrator Stage 2. |
| RSRCH-04 | For theological books, research includes Greek/Hebrew word studies and cross-testament connections | Researcher instructions must include a word study section with Greek/Hebrew terms, transliterations, and theological significance. Cross-testament connections map OT types to NT fulfilment. |
| WRITE-01 | Chapter writer agent produces complete chapter drafts (2,000-4,000 words for standard books, scaled for other sizes) | Writer SKILL.md must include word count targets by size tier. Chapter-writer subagent receives target from Book DNA/outline. |
| WRITE-02 | Parallel chapter generation using wave batching (4-6 concurrent agents) | Orchestrator already defines wave batching in Stage 3. Chapter-writer subagent already exists. Wave size of 4-6 matches practical subagent concurrency limits. |
| WRITE-03 | Every chapter opens with a compelling hook (bold declaration, rhetorical question, counter-intuitive claim, tension-creating observation) | Writer SKILL.md must detail all four hook types with examples. Each chapter's outline specifies which hook strategy to use. |
| WRITE-04 | Each chapter agent reads the full Book DNA master context to maintain voice and narrative consistency | Already enforced. Chapter-writer subagent instructions say "Read the Book DNA document first". Writer skill receives Book DNA path as argument. |
| WRITE-05 | Chapter drafts are written in markdown as intermediate format, not directly as .docx | Already enforced. Chapter-writer constraints say "Write in markdown format, not .docx". Output to `drafts/ch[NN]-draft.md`. |
| WRITE-06 | Word count targeting per chapter based on book size tier and outline specifications | Writer skill must read target word count from outline and Book DNA. Size tier tables already defined in outliner. |
| WRITE-07 | Revelation-driven depth: cross-references, Greek/Hebrew word studies woven naturally, types and shadows, scripture interpreting scripture | Writer SKILL.md must include theological depth techniques section. Research artefacts provide the raw material; writer instructions show how to weave them in naturally (not as footnotes). |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Claude Code Plugin System | Current (Agent Skills spec) | Skill authoring, subagent orchestration, `${CLAUDE_PLUGIN_ROOT}` substitution | This IS the execution environment. No alternative. **Confidence: HIGH** |
| Markdown (.md) | N/A | Research artefacts, chapter drafts, all intermediate format | Claude's native format. Every skill reads/writes markdown. **Confidence: HIGH** |

### Supporting
No additional libraries needed. Phase 3 is entirely markdown skill authoring within the existing plugin scaffold. The only runtime dependency (docx-js) is for Phase 5 (formatting), not this phase.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Sequential per-chapter research | Parallel research subagents | Research is fast enough sequentially since each chapter's research is lightweight (the researcher is Claude generating content, not fetching from APIs). Sequential is simpler and avoids race conditions. Parallel only needed for writing. |
| Inline research in writer skill | Separate researcher skill | Separated research gives the user visibility into what material is gathered before writing begins. Also allows the user to review/edit research before committing to chapter drafts. |
| Single monolithic writer prompt | Structured writer skill with sections | Structured skill with explicit sections (hook, body, depth, transitions) produces more consistent output across parallel agents. |

## Architecture Patterns

### File Structure (What Phase 3 Creates/Modifies)
```
skills/
  researcher/
    SKILL.md              # REPLACE stub with full implementation
  writer/
    SKILL.md              # REPLACE stub with full implementation
  orchestrator/
    SKILL.md              # UPDATE Stage 2 and Stage 3 invocation details
```

### Pattern 1: Research Artefact Structure
**What:** Each chapter gets a structured research file with consistent sections
**When to use:** Every chapter, regardless of voice profile

The research artefact must have a predictable structure so the chapter-writer subagent can reliably find and use the material:

```markdown
# Research: Chapter [N] - [Title]

## Core Argument
[Copied from outline -- the single central claim this chapter makes]

## Scripture References
### Primary Passages
[Full scripture text, NKJV, with book/chapter/verse reference]

### Supporting Passages
[Additional scripture that reinforces the core argument]

## Cross-References
[Connections between scriptures across books/testaments that build the argument]

## Word Studies
### [Greek/Hebrew term] ([transliteration])
- **Meaning:** [Full semantic range]
- **Context:** [How it's used in the primary passage]
- **Significance:** [Why this matters for the chapter's argument]

## Types and Shadows
[Old Testament patterns that foreshadow New Testament fulfilment relevant to this chapter]

## Illustrations and Examples
[Real-world analogies, historical examples, or narrative illustrations that make the argument accessible]

## Connections to Other Chapters
[How this chapter's research connects to adjacent chapters -- for continuity]
```

For non-theological voice profiles, the Word Studies, Types and Shadows, and Scripture sections are replaced with domain-appropriate research sections (data points, expert quotes, case studies, etc.).

### Pattern 2: Parallel Chapter Writing via Subagents
**What:** The orchestrator spawns multiple chapter-writer subagents simultaneously
**When to use:** Stage 3 of the pipeline

The orchestrator issues multiple Agent tool calls in a single message. Each subagent:
1. Reads Book DNA (shared, READ-ONLY)
2. Reads its chapter-specific research from `research/ch[NN]-research.md`
3. Reads its chapter assignment from the outline
4. Writes its chapter to `drafts/ch[NN]-draft.md`
5. Returns a completion summary

Wave batching (from orchestrator SKILL.md):
- **Wave size:** 4-6 chapters per wave (conservative to avoid rate limits and context saturation)
- **Wave 1:** Chapters 1-6 (or 1-4 for smaller books)
- **Wave 2:** Remaining chapters after Wave 1 completes
- **Booklets (5-8 chapters):** Single wave, all chapters at once
- **Short books (8-12 chapters):** Two waves
- **Standard books (12-20 chapters):** Three to four waves

Each chapter-writer subagent uses `agents/chapter-writer.md` which:
- Preloads `book-crafter:writer` skill
- Has `maxTurns: 50`
- Uses `model: inherit`
- Has tools: Read, Write, Bash, Grep, Glob

### Pattern 3: Voice Consistency Through Book DNA
**What:** All chapter agents produce consistent output by reading the same Book DNA document
**When to use:** Every chapter, enforced by the chapter-writer subagent definition

Voice consistency is the hardest technical challenge. The solution is already architected:
1. Book DNA contains the full voice profile (tone, sentence patterns, vocabulary, emphasis)
2. Book DNA contains theological framework and anti-patterns
3. Book DNA contains chapter map with cross-references
4. Book DNA is READ-ONLY during parallel writing
5. Each subagent reads Book DNA first, before anything else

The writer SKILL.md must reinforce these patterns with specific, actionable instructions rather than abstract guidelines.

### Pattern 4: Momentum-Aware Pacing
**What:** Chapter writing adapts pacing based on the chapter's momentum position
**When to use:** Every chapter

| Momentum Position | Pacing Guidance |
|---|---|
| Foundation | Measured, establishing. Build trust with the reader. Hook hard but don't rush. |
| Building | Developing, layering. Each section adds depth. More scripture integration. |
| Accelerating | Intensifying. Shorter sentences. More declarations. Less explanation, more revelation. |
| Climax | Peak energy. The "aha moment". Everything converges. Most powerful hooks and declarations. |
| Landing | Resolution. Application. Send-off. Warm but weighty. Leave the reader changed. |

### Anti-Patterns to Avoid
- **Cross-contamination:** Chapter agents must NEVER read other chapter drafts. They work from Book DNA and their own research only.
- **Shared file mutation:** No agent modifies Book DNA, voice-profile.md, or chapter-outline.md during parallel execution.
- **Generic hooks:** Every hook must be specific to the chapter's core argument, not a generic attention-grabber.
- **Footnote theology:** Greek/Hebrew word studies must be woven into the narrative flow, not dropped as academic footnotes.
- **Word count padding:** If a chapter's argument is complete before the target word count, the writer should deepen existing points rather than adding filler.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Parallel chapter execution | Custom parallelism logic | Claude Code Agent tool (multiple calls in one message) | The Agent tool already handles concurrent subagent execution. The orchestrator just issues N Agent calls simultaneously. |
| Voice consistency enforcement | Post-processing voice normaliser in this phase | Book DNA + consistent SKILL.md instructions | Voice normalisation is Phase 4 (editor). This phase achieves consistency through shared context (Book DNA), not post-processing. |
| Scripture lookup | External Bible API or database | Claude's training data for NKJV text with explicit verification instructions | Claude knows NKJV text. The researcher skill must instruct: quote actual text, include full verses, flag any uncertainty. No external API needed. |
| Research orchestration | Separate research-orchestrator skill | Orchestrator Stage 2 sequential loop | Research per chapter is fast (Claude generating, not fetching). Sequential invocation from the orchestrator is simpler than parallel research subagents. |

**Key insight:** This phase writes two SKILL.md files and updates one. There is no code, no infrastructure, no libraries. The entire implementation is prompt engineering -- writing instructions detailed enough that Claude (as the researcher or writer agent) produces the right output consistently.

## Common Pitfalls

### Pitfall 1: Fabricated Scripture
**What goes wrong:** Claude generates plausible-sounding but incorrect or nonexistent Bible verses
**Why it happens:** Claude's training data includes scripture but can confuse references, merge verses, or generate text that sounds biblical but is not actual scripture
**How to avoid:** Researcher skill must instruct: "Quote actual NKJV text. Include the full verse. If you are uncertain about the exact wording, write the reference and add <!-- VERIFY --> marker. Never paraphrase scripture and present it as a direct quote."
**Warning signs:** Verses that sound "almost right" but use unusual word choices, references to obscure verse numbers that don't exist (e.g., John 3:36 exists but John 3:40 does not)

### Pitfall 2: Voice Drift Across Parallel Agents
**What goes wrong:** Chapter 1 reads like a sermon, Chapter 5 reads like a textbook, Chapter 8 reads like a blog post
**Why it happens:** Each subagent has its own context and may interpret voice instructions differently. Subtle prompt interpretation differences across parallel instances compound across chapters.
**How to avoid:** Writer SKILL.md must include CONCRETE examples of the voice, not just abstract descriptions. Include a "Voice Calibration" section with 2-3 paragraph-length examples of the target voice. The Book DNA's Voice Profile section must be specific enough to constrain output.
**Warning signs:** Inconsistent use of sentence fragments, varying levels of academic language, different approaches to scripture integration

### Pitfall 3: Thin Research Artefacts
**What goes wrong:** Research files contain only surface-level observations -- a scripture reference and a one-line summary, but no depth
**Why it happens:** Without explicit depth requirements, the researcher defaults to breadth over depth
**How to avoid:** Researcher SKILL.md must specify minimum content per section: at least 2 primary passages with full text, at least 1 word study per chapter, at least 2 cross-references. The structured artefact format (Pattern 1) enforces this.
**Warning signs:** Research files under 500 words, word studies that only provide a dictionary definition without theological significance

### Pitfall 4: Context Window Saturation in Writer Subagents
**What goes wrong:** The chapter-writer subagent runs out of effective context because Book DNA + research + outline + skill instructions consume too much
**Why it happens:** Book DNA for a standard book (12-20 chapters) can be 3,000-5,000 words. Research artefact can be 1,000-2,000 words. Skill instructions add more. The subagent needs room to actually write a 3,000-4,000 word chapter.
**How to avoid:** Keep Book DNA concise -- the template is already well-structured. Research artefacts should be dense, not verbose (key quotes and terms, not essays). The writer skill should be focused instructions, not sprawling guidelines. `maxTurns: 50` on the subagent gives plenty of generation room.
**Warning signs:** Chapters that trail off or become repetitive near the end, subagents hitting maxTurns

### Pitfall 5: Missing Hook Specificity
**What goes wrong:** Chapters open with generic hooks that could apply to any topic ("Have you ever wondered about God's plan for your life?")
**Why it happens:** The outline specifies a hook STRATEGY (e.g., "bold declaration") but if the writer doesn't read the outline's specific hook text, it generates a generic one
**How to avoid:** Writer skill must instruct: "Read the Hook Strategy field from your chapter's outline section. The outline contains the SPECIFIC hook for your chapter. Use it as written or enhance it, but do not replace it with a generic alternative."
**Warning signs:** Hooks that don't mention the chapter's core argument

### Pitfall 6: Sequential vs Parallel Research Confusion
**What goes wrong:** Someone tries to parallelise the research stage unnecessarily, adding complexity
**Why it happens:** If writing is parallel, research "should" be too
**How to avoid:** Research is sequential in the orchestrator. Each chapter's research is fast (Claude generating from its knowledge, not making API calls). Sequential is simpler, avoids needing a separate research subagent definition, and lets the orchestrator track progress chapter by chapter.
**Warning signs:** Unnecessary subagent definitions for research, race conditions in research/ directory

## Code Examples

### Research Artefact Example (Theological)

```markdown
# Research: Chapter 3 - The Anatomy of Breakthrough

## Core Argument
Every breakthrough in scripture follows the same anatomy: a word from God, a period of impossibility, and a moment of manifestation -- and understanding this pattern transforms how you approach your own impossible situations.

## Scripture References

### Primary Passages

**Genesis 22:1-14 (NKJV)**
> Now it came to pass after these things that God tested Abraham, and said to him, "Abraham!" And he said, "Here I am." Then He said, "Take now your son, your only son Isaac, whom you love, and go to the land of Moriah, and offer him there as a burnt offering on one of the mountains of which I shall tell you." [...]
> And Abraham said, "My son, God will provide for Himself the lamb for a burnt offering." So the two of them went together.

**Hebrews 11:17-19 (NKJV)**
> By faith Abraham, when he was tested, offered up Isaac, and he who had received the promises offered up his only begotten son, of whom it was said, "In Isaac your seed shall be called," concluding that God was able to raise him up, even from the dead, from which he also received him in a figurative sense.

### Supporting Passages
- Romans 4:17-21 -- Abraham's faith against hope
- 2 Corinthians 4:17-18 -- light affliction working eternal weight of glory

## Cross-References
- Genesis 22:14 (Jehovah Jireh) connects to Philippians 4:19 (God shall supply all your need) -- the Provider identity of God spans testaments
- Abraham's "impossibility period" (25 years waiting for Isaac) mirrors Israel's wilderness wandering -- both are preparation, not punishment

## Word Studies

### Nisah (Hebrew: נָסָה)
- **Meaning:** To test, prove, try. Not temptation (that would be a different word). This is the refiner's test -- designed to reveal what's already inside, not to cause failure.
- **Context:** Genesis 22:1 -- "God tested Abraham." The word implies God already knew the outcome. The test was for Abraham's benefit, not God's information.
- **Significance:** Every "impossibility period" is a nisah -- a proving ground, not a punishment. This reframes the reader's current struggle.

## Types and Shadows
- Isaac on the altar is a type of Christ on the cross -- the only beloved son, offered on a mountain, with the father's hand raised
- The ram caught in the thicket foreshadows substitutionary atonement
- Moriah is the same mountain range where Solomon's temple would later stand (2 Chronicles 3:1)

## Illustrations and Examples
- A diamond only becomes valuable under extreme pressure -- the carbon was always there, but the pressure revealed its beauty
- Athletes don't get stronger by avoiding resistance; they get stronger by pushing through it systematically

## Connections to Other Chapters
- Builds on Ch 2's foundation of "God's word as the starting point" (the word came before the test)
- Foreshadows Ch 5's exploration of "the moment of manifestation" (the ram appeared at the precise moment of obedience)
```

### Writer Skill Invocation Pattern (Orchestrator Stage 3)

The orchestrator passes these arguments to each chapter-writer subagent:

```
Write Chapter [N] of "[Book Title]"

Project directory: ~/Documents/Books/[Book Title]/
Book DNA: ~/Documents/Books/[Book Title]/book-dna.md
Voice profile: ~/Documents/Books/[Book Title]/voice-profile.md
Chapter outline section: [paste the specific ## Chapter N section from chapter-outline.md]
Research notes: ~/Documents/Books/[Book Title]/research/ch[NN]-research.md
Output path: ~/Documents/Books/[Book Title]/drafts/ch[NN]-draft.md
Target word count: ~[N] words
Momentum position: [Foundation/Building/Accelerating/Climax/Landing]
```

### Chapter Draft Output Format

```markdown
# Chapter [N]: [Title]

[Opening hook -- 1-3 sentences, matching the hook strategy from the outline]

[Body content -- structured sections flowing naturally, not with visible section breaks]

[Scripture integrated inline with commentary]

[Word studies woven as revelation moments]

[Chapter closing -- connects to the book's broader arc]

<!-- METADATA
word_count: [actual word count]
target_count: [target from outline]
momentum: [position]
hook_type: [bold_declaration|rhetorical_question|counter_intuitive|tension_creating]
scriptures_used: [comma-separated list of references]
-->
```

The metadata block at the end allows the orchestrator and editor to quickly audit chapters without reading full content.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single-agent book writing | Multi-agent parallel chapter writing with shared context | 2025-2026 (Claude Code subagents) | Each chapter gets full context window attention; parallelism reduces wall-clock time proportionally |
| Generic "write a chapter" prompts | Structured skill instructions with voice calibration, hook strategies, momentum pacing | Current best practice | Dramatically more consistent output across parallel agents |
| Post-hoc voice correction | Pre-baked voice via Book DNA + explicit anti-patterns | Current | Prevention is cheaper than correction; editor phase becomes polish, not repair |

## Open Questions

1. **Research depth for non-theological books**
   - What we know: The theological research pattern (scriptures, word studies, types/shadows) is well-defined
   - What's unclear: What replaces these sections for non-theological voice profiles? (e.g., a leadership book, a self-help book)
   - Recommendation: Create a conditional structure in the researcher SKILL.md -- if the voice profile has a Theological/Domain Framework section, use the full theological research format; otherwise, use a general research format (key data points, expert quotes, case studies, examples). This is a Claude's Discretion area.

2. **Optimal wave size**
   - What we know: The orchestrator says "waves of 8-10" but practical subagent concurrency suggests 4-6 is safer
   - What's unclear: Whether Claude Code has hard limits on concurrent Agent tool calls
   - Recommendation: Use 4-6 as the default wave size. The orchestrator SKILL.md should be updated from "8-10" to "4-6" to match the requirement. This is conservative but reliable.

3. **Scripture verification**
   - What we know: Claude's NKJV knowledge is generally accurate but not infallible
   - What's unclear: How often Claude fabricates or misquotes scripture, especially for less common passages
   - Recommendation: The `<!-- VERIFY -->` marker pattern gives the user a safety net. The researcher should be instructed to favour well-known passages and to mark any less-common references for verification.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual validation (Claude Code plugin -- no automated test runner) |
| Config file | None -- plugin skills are validated by execution |
| Quick run command | Invoke orchestrator on a test project with a known topic brief |
| Full suite command | Run complete pipeline from outline through formatting on a test book |

### Phase Requirements to Test Map
| Req ID | Behaviour | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| RSRCH-01 | Research artefacts contain all required sections | manual | Run orchestrator Stage 2 on test project, inspect research files | N/A |
| RSRCH-02 | Scripture references are actual NKJV text | manual | Spot-check 3-5 references against NKJV source | N/A |
| RSRCH-03 | Research artefacts at correct path | manual | Check `research/ch[NN]-research.md` files exist | N/A |
| RSRCH-04 | Word studies and cross-testament connections present | manual | Inspect research files for Word Studies and Types/Shadows sections | N/A |
| WRITE-01 | Chapter drafts 2,000-4,000 words (standard) | manual | Count words in generated drafts | N/A |
| WRITE-02 | Parallel generation in waves | manual | Observe orchestrator spawning multiple Agent calls | N/A |
| WRITE-03 | Compelling opening hooks | manual | Read first 3 sentences of each chapter | N/A |
| WRITE-04 | Agents read Book DNA | manual | Verify chapter-writer subagent reads book-dna.md (in agent instructions) | N/A |
| WRITE-05 | Markdown intermediate format | manual | Check output files are .md, not .docx | N/A |
| WRITE-06 | Word count matches size tier | manual | Compare actual word counts to targets from outline | N/A |
| WRITE-07 | Theological depth present | manual | Check for Greek/Hebrew word studies, cross-references in chapter text | N/A |

### Sampling Rate
- **Per task commit:** Read the modified SKILL.md and verify instruction completeness
- **Per wave merge:** N/A (single skill files)
- **Phase gate:** Run a complete test pipeline (outline through writing) on a sample topic brief

### Wave 0 Gaps
None -- this phase produces SKILL.md files, not testable code. Validation is by execution of the pipeline.

## Sources

### Primary (HIGH confidence)
- Existing codebase: `skills/orchestrator/SKILL.md` -- full pipeline orchestration with Stage 2 and Stage 3 patterns already defined
- Existing codebase: `agents/chapter-writer.md` -- subagent definition with skills preloading, maxTurns, model inheritance
- Existing codebase: `references/book-dna-template.md` -- master context template all agents read
- Existing codebase: `references/voice-profiles/spiritual-default.md` -- theological voice profile with all required sections
- Existing codebase: `skills/outliner/SKILL.md` -- outline format that researcher and writer consume
- [Claude Code Skills documentation](https://code.claude.com/docs/en/skills) -- Skill frontmatter, supporting files, subagent execution patterns. **Confidence: HIGH** (official docs)

### Secondary (MEDIUM confidence)
- [Claude Code Sub-Agents: Parallel vs Sequential Patterns](https://claudefa.st/blog/guide/agents/sub-agent-best-practices) -- Practical concurrency guidance, wave batching patterns
- [How to Use Claude Code Sub-Agents for Parallel Work](https://timdietrich.me/blog/claude-code-parallel-subagents/) -- Practical limits: 4-6 concurrent agents, no nesting, read-heavy preferred
- David's existing content-engine orchestrator (`~/.claude/plugins/encounter-content-engine/skills/content-orchestrator/SKILL.md`) -- Proven parallel wave pattern with dependency graph

### Tertiary (LOW confidence)
- None -- all findings verified against existing codebase and official docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies, pure skill authoring within existing scaffold
- Architecture: HIGH -- orchestrator, subagent, and Book DNA patterns already proven in Phases 1-2
- Pitfalls: HIGH -- drawn from practical experience with Claude's scripture knowledge and multi-agent voice consistency challenges

**Research date:** 2026-03-27
**Valid until:** 2026-04-27 (stable -- Claude Code plugin system is mature, no breaking changes expected)
