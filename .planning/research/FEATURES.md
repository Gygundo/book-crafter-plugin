# Feature Research

**Domain:** AI-powered book writing plugin (non-fiction, theological/spiritual focus)
**Researched:** 2026-03-27
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = the plugin is not worth using over manual writing.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Book outliner with chapter structure** | Every book tool starts here. Without structured outlining, you are just generating text. Must produce chapter-by-chapter breakdown with titles, key arguments, and narrative arc. | MEDIUM | Must support both from-scratch (topic brief) and from-source (sermons/notes). Outline approval gate before drafting is critical - prevents wasted generation. |
| **Full chapter draft generation** | The core promise of an AI book tool. Each chapter must be a complete, polished draft - not bullet points or thin paragraphs. Target 2,000-4,000 words per chapter for standard books. | HIGH | Parallel generation across chapters is the performance differentiator. Each agent needs the master context (voice, theology, outline, prior chapter summaries). |
| **Voice profile system** | Without consistent voice, multi-agent output reads like a patchwork quilt. Users expect to define a voice once and have it applied everywhere. | HIGH | Ship with the Encounter Church theological voice as default (from sermon-crafter + brand-voice.md). Support custom .md profiles and inline descriptions. The voice profile is the single most important quality lever. |
| **Master context document ("Book DNA")** | All chapter agents must share: voice profile, theological framework, full outline, character arcs, key terms, recurring themes, and running summaries of completed chapters. Without this, chapters contradict each other. | HIGH | This is the hardest technical challenge. Must be comprehensive enough for consistency but concise enough to fit context windows. Needs to evolve as chapters are written. |
| **Multi-pass editing** | Raw drafts are never publishable. At minimum: (1) voice consistency pass, (2) flow/transition pass between chapters, (3) grammar/style pass. | HIGH | The voice consistency pass is the most valuable - comparing tone, sentence rhythm, vocabulary across all chapters. Flow pass ensures chapter endings connect to next chapter openings. |
| **Professional .docx output** | The deliverable. Must include proper formatting: title page, table of contents, chapter headings, page numbers, consistent typography. | MEDIUM | Use docx-js (npm `docx` package). Already proven in sermon-crafter. TOC generation, heading styles, page breaks between chapters, headers/footers all supported. |
| **Three book size tiers** | Different projects need different scales. Booklet (<100 pages / ~10-15k words), Short (15-25k words), Standard (40-60k words). Size affects chapter count, depth per chapter, and generation time. | LOW | Primarily a configuration choice that cascades through outline (chapter count) and writer (word count targets per chapter). |
| **Project directory structure** | Each book gets its own directory with all artefacts: outline, research notes, chapter drafts, revision history, final .docx. Users expect to find and manage their work. | LOW | Standard file organisation. Create on project init. Keep all intermediate artefacts for iteration. |
| **Chapter-level revision** | After full draft generation, users need to revise individual chapters without regenerating the entire book. Targeted feedback on specific chapters must produce targeted rewrites. | MEDIUM | Revision must preserve the master context and voice. Changed chapters trigger a flow-check on adjacent chapters (transitions may break). |
| **Two input paths** | (1) Topic brief: generate from scratch. (2) Existing content: synthesise from sermons, notes, outlines. Most theological books start from sermon series. | MEDIUM | The sermon-to-book path is a well-established workflow (SermonToBook.com, Preach and Publish). Key insight: sermons must be adapted for reading - spoken rhythm differs from written rhythm. Transcripts cannot become chapters directly. |

### Differentiators (Competitive Advantage)

Features that set Book Crafter apart from generic AI book tools.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Revelation-driven depth engine** | Generic AI books are shallow - surface-level observations anyone could make. Book Crafter must produce content where readers feel "I've read that verse a hundred times but never saw THAT before." This means: cross-references across books, Greek/Hebrew word studies woven naturally, types and shadows from OT to NT, scripture interpreting scripture. | HIGH | This is the sermon-crafter's core strength translated to book form. Requires the theological framework (grace-based, New Covenant, supernatural-affirming) to be deeply embedded in prompts. Cannot be achieved with generic "write about this topic" instructions. |
| **Compelling hooks per chapter** | Every chapter opens with a hook that grabs - a bold statement, provocative question, or tension-creating observation. Not just the first chapter. Every. Single. One. Bestselling non-fiction authors do this consistently. | MEDIUM | Hook types: bold theological declaration, rhetorical question, counter-intuitive claim, personal/pastoral anecdote, "what if" reframe. The outline stage should define the hook strategy per chapter. |
| **Theological guardrails** | Content must never violate the theological framework: grace over law, identity in Christ, supernatural as present-tense, New Covenant lens on OT. AI tools frequently drift into generic Christian cliches, performance-based guilt, or academic hedging. Guardrails prevent this. | MEDIUM | Inherited from sermon-crafter + content-guidelines.md. The banned phrases list and theological anti-patterns become validation checks during editing. Not just "avoid bad content" but "actively produce bold, declarative, revelation-driven content." |
| **Building momentum architecture** | Chapters should escalate in intensity and revelation, not just be parallel treatments of sub-topics. Later chapters feel weightier, more revelatory. The book builds toward a climax, not a flat sequence. | MEDIUM | The outliner must design an arc - not just topics but escalating revelation. Each chapter summary in the master context includes "momentum position" (where this sits in the escalation). |
| **Reader engagement elements** | Discussion questions per chapter, chapter summaries, application points, prayer points (for theological books). These transform a book from "something you read" to "something you work through." | LOW | Generated as a post-processing step after chapter drafts are finalised. Discussion questions must be specific to the chapter's unique arguments, not generic. The cliche test from content-guidelines applies: "Could these questions have been generated without reading this specific chapter?" |
| **Sermon-to-book adaptation engine** | Purpose-built path for converting sermon series into book chapters. Not just transcription cleanup - actual adaptation: converting spoken rhythm to written rhythm, expanding verbal shorthand into full arguments, adding transitions that a live audience didn't need but readers do. | HIGH | Key transformations: (1) spoken fragments to complete sentences while preserving punch, (2) audience-specific references to universal ones, (3) verbal momentum cues ("Are you tracking with me?") to written transitions, (4) repetition-for-emphasis (great for speaking) reduced to revelation-for-emphasis (better for reading). |
| **Swappable voice profiles** | Ship with theological default but support any non-fiction voice. A leadership book, a self-help book, a teaching manual - each gets its own .md voice profile. Profiles define: tone, sentence patterns, vocabulary preferences, emphasis techniques, anti-patterns. | MEDIUM | The voice system is the plugin's extensibility story. Default profile is comprehensive (sermon-crafter + brand-voice.md). Custom profiles can be minimal (a few paragraphs describing the desired voice) or detailed. Inline voice descriptions in the topic brief are also supported. |
| **Cross-chapter consistency validator** | Post-draft automated check that scans all chapters for: terminology consistency (same concept called the same thing everywhere), theological consistency (no contradictory claims between chapters), voice drift (chapter 8 sounds different from chapter 2), reference consistency (if chapter 3 says "we'll explore this in chapter 7", chapter 7 must deliver). | HIGH | This is what separates a professional book from an obvious AI patchwork. Run after all chapters are drafted, before final editing passes. Produces a consistency report with specific flagged issues. |
| **Foreword and About the Author generation** | Professional books have these. The foreword frames the book's purpose and journey. "About the Author" establishes credibility. Both should be voice-consistent with the book. | LOW | Generated last, after the full book is complete, so they can reference actual content. Foreword can be written in author voice or framed as "to be written by [endorser]" with a draft for their reference. |
| **Professional front/back matter** | Half title page, full title page, copyright page, dedication, TOC (front). Scripture index, glossary of terms, bibliography, about the author (back). This is what makes a book feel published, not self-produced. | MEDIUM | docx-js supports all of these. The key is automating the generation - scripture index pulled from all chapters, glossary from key terms in the master context. |

### Anti-Features (Commonly Requested, Often Problematic)

Features to deliberately NOT build.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Real-time co-writing / interactive drafting** | Feels collaborative, like working "with" the AI | Destroys voice consistency. Every interruption resets context. Produces a franken-book of different tones and depths. The plugin's value is in the pipeline - sequential stages with quality gates. | Hybrid iteration model: outline approval, then full draft generation, then chapter-level revision cycles. User steers at gates, not mid-generation. |
| **ePub / PDF generation** | Users want the final format | Scope explosion. ePub has its own formatting nightmares. PDF requires typesetting. .docx is the industry standard hand-off format - publishers, editors, and layout tools all accept it. External tools (Calibre, Reedsy, InDesign) handle conversion better than we ever will. | .docx only. Include a note in output about recommended conversion tools. |
| **Fiction / narrative support** | "Can it write novels too?" | Completely different problem domain. Fiction needs character arcs, dialogue, scene blocking, pacing, subplots, POV management. Non-fiction structure (arguments, evidence, application) is fundamentally different. Trying to do both means doing neither well. | Explicitly scope to non-fiction: theological, teaching, self-help, leadership. The voice and theological systems are designed for declarative, argument-driven content. |
| **Built-in plagiarism / AI detection** | Fear of being flagged as AI-written | These tools are unreliable and create false confidence. The actual solution is voice authenticity - content so deeply rooted in the author's specific arguments, illustrations, and theology that it couldn't have been generated from topic keywords alone. The cliche test is better than any detector. | Voice fidelity system + the cliche test from content-guidelines: "Could this have been generated without ever reading this specific source material?" |
| **Automated publishing pipeline** | "Just publish it to Amazon" | Publishing involves ISBN registration, cover design, pricing strategy, metadata, category selection, marketing copy - all outside the writing domain. Mixing concerns creates a brittle, low-quality experience. | Output a publication-ready .docx with all front/back matter. The user takes it to their publishing workflow. |
| **Chapter-by-chapter streaming output** | "Show me each chapter as it's written" | Creates pressure to approve incomplete work. Users start editing chapter 1 while chapter 10 hasn't been written yet, then chapter 10 contradicts their edits. The book is a system - it must be seen as a whole before revision. | Generate all chapters, run consistency checks, then present the complete draft. Progress indicators show generation status without exposing incomplete work. |
| **Cover design / visual assets** | Books need covers | Completely different skillset (graphic design, not writing). AI image generation for covers is its own complex domain with different tools. | Out of scope. Mention in documentation that cover design is a separate step. |
| **Auto-research from the internet** | "The AI should find supporting material" | Hallucination risk is extreme. AI-generated "research" that cites non-existent sources destroys credibility. For theological content especially, fabricated scripture references or misattributed quotes are dangerous. | Research skill gathers and organises material the USER provides or that comes from verified sources (sermon transcripts, the pastor's existing content). Scripture references use the actual Bible text. No invented citations. |
| **Citation management (Zotero/EndNote style)** | Academic publishing expectation | Non-fiction teaching books use informal references, not academic citation formats. Adding citation management is scope creep into academic publishing. | Simple footnotes via docx-js for scripture references and key sources. |

## Feature Dependencies

```
[Voice Profile System]
    |
    +--required-by--> [Chapter Draft Generation]
    |                      |
    |                      +--required-by--> [Multi-Pass Editing]
    |                      |                      |
    |                      |                      +--required-by--> [Cross-Chapter Consistency Validator]
    |                      |
    |                      +--required-by--> [Reader Engagement Elements]
    |
    +--required-by--> [Master Context Document]
                           |
                           +--required-by--> [Chapter Draft Generation]

[Book Outliner]
    |
    +--required-by--> [Master Context Document]
    +--required-by--> [Chapter Draft Generation]
    +--required-by--> [Building Momentum Architecture]

[Two Input Paths]
    |
    +--enhances--> [Book Outliner]
    +--"sermon path" requires--> [Sermon-to-Book Adaptation Engine]

[Theological Guardrails]
    |
    +--enhances--> [Voice Profile System]
    +--enhances--> [Multi-Pass Editing]
    +--enhances--> [Cross-Chapter Consistency Validator]

[Professional .docx Output]
    |
    +--required-by--> [Front/Back Matter]
    +--required-by--> [Reader Engagement Elements] (formatting)

[Chapter-Level Revision]
    +--requires--> [Master Context Document] (to maintain consistency during revision)
    +--requires--> [Multi-Pass Editing] (revision triggers re-editing)
```

### Dependency Notes

- **Voice Profile requires nothing but must exist first:** Every downstream feature depends on the voice being defined. Build and test the voice system before anything else.
- **Master Context Document is the integration layer:** It consumes the outline and voice profile and feeds every chapter agent. Its quality determines the book's coherence.
- **Editing depends on drafting:** Cannot edit what doesn't exist. But the editing passes are where quality happens - budget significant effort here.
- **Cross-Chapter Validator is the capstone:** Requires all chapters to be drafted and edited. This is the final quality gate before formatting.
- **Sermon-to-Book Adaptation is an enhancement to the input path:** Not required for topic-brief books, but critical for the primary use case (converting sermon series).
- **Theological Guardrails enhance rather than block:** They make voice, editing, and validation better, but the pipeline works without them (just produces less theologically precise output).

## MVP Definition

### Launch With (v1)

Minimum viable product - enough to produce a complete book from a topic brief.

- [ ] **Voice profile system** - load .md voice profiles, ship with theological default derived from sermon-crafter
- [ ] **Book outliner** - topic brief to chapter-by-chapter structure with hooks and arc, with approval gate
- [ ] **Master context document generation** - synthesise voice + outline + theological framework into a single context doc all agents read
- [ ] **Chapter draft generation** - parallel chapter writing with voice consistency, targeting 2,000-4,000 words per chapter
- [ ] **Basic editing pass** - voice consistency + flow between chapters (single pass, not full multi-pass suite)
- [ ] **Professional .docx output** - title page, TOC, chapter headings, page numbers, basic front/back matter
- [ ] **Three book size tiers** - booklet, short, standard configurations
- [ ] **Project directory structure** - organised artefact storage per book

### Add After Validation (v1.x)

Features to add once the core pipeline produces good books.

- [ ] **Sermon-to-book input path** - trigger: David wants to convert a sermon series (the primary real-world use case, but the pipeline must work first)
- [ ] **Multi-pass editing (full suite)** - voice pass, flow pass, theological guardrail pass, grammar/style pass as separate stages
- [ ] **Cross-chapter consistency validator** - trigger: first full book reveals inconsistencies that manual review catches
- [ ] **Chapter-level revision cycles** - trigger: user wants to iterate on specific chapters without regenerating the whole book
- [ ] **Reader engagement elements** - discussion questions, chapter summaries, application/prayer points
- [ ] **Compelling hooks engine** - dedicated hook generation with multiple hook types per chapter

### Future Consideration (v2+)

Features to defer until the pipeline is proven.

- [ ] **Revelation-driven depth engine** - advanced cross-referencing, Greek/Hebrew word studies, types-and-shadows connections. Defer because: requires sophisticated theological knowledge integration that should be tuned based on v1 output quality
- [ ] **Building momentum architecture** - chapter escalation design in the outliner. Defer because: need to see how well flat outlines work first before adding arc complexity
- [ ] **Professional front/back matter (full suite)** - scripture index, glossary, bibliography. Defer because: requires post-processing all chapters to extract references
- [ ] **Foreword and About the Author generation** - defer because: low complexity but low priority; easy to add once the core book is solid
- [ ] **Swappable voice profiles for non-theological genres** - defer because: the primary user is David writing theological content. Generic voice support is architecturally supported from v1 but doesn't need testing until there's a second use case

## Feature Prioritisation Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Voice profile system | HIGH | MEDIUM | P1 |
| Book outliner | HIGH | MEDIUM | P1 |
| Master context document | HIGH | HIGH | P1 |
| Chapter draft generation | HIGH | HIGH | P1 |
| Basic editing pass | HIGH | MEDIUM | P1 |
| Professional .docx output | HIGH | MEDIUM | P1 |
| Three book size tiers | MEDIUM | LOW | P1 |
| Project directory structure | MEDIUM | LOW | P1 |
| Sermon-to-book input path | HIGH | HIGH | P2 |
| Multi-pass editing (full) | HIGH | MEDIUM | P2 |
| Cross-chapter consistency validator | HIGH | HIGH | P2 |
| Chapter-level revision | MEDIUM | MEDIUM | P2 |
| Reader engagement elements | MEDIUM | LOW | P2 |
| Hooks engine | MEDIUM | LOW | P2 |
| Theological guardrails (formal) | MEDIUM | MEDIUM | P2 |
| Revelation depth engine | HIGH | HIGH | P3 |
| Momentum architecture | MEDIUM | MEDIUM | P3 |
| Full front/back matter suite | MEDIUM | MEDIUM | P3 |
| Foreword / About Author | LOW | LOW | P3 |
| Non-theological voice profiles | LOW | LOW | P3 |

**Priority key:**
- P1: Must have for launch - the minimum pipeline to produce a complete book
- P2: Should have, add when possible - quality and workflow improvements
- P3: Nice to have, future consideration - depth and extensibility

## Competitor Feature Analysis

| Feature | Squibler | Sudowrite | WordWriter | Scrivener | Book Crafter (Ours) |
|---------|----------|-----------|------------|-----------|---------------------|
| Outlining | Template-based, generic | Story-focused, fiction-oriented | AI research-integrated | Manual but powerful (corkboard, binder) | AI-generated from topic brief OR sermon source, with hooks and arc per chapter |
| Chapter generation | AI-assisted, one at a time | Scene-level, fiction-focused | Full chapters with research | Manual (writing tool, not generator) | Parallel multi-agent with shared master context |
| Voice consistency | Basic tone settings | Style model trained on user writing | Narrative consistency engine | N/A (manual) | Deep voice profiles (.md), theological framework, cross-chapter validation |
| Editing | AI rewrite suggestions | "Describe" and "Rewrite" tools | Built-in revision | Manual with snapshots | Multi-pass: voice, flow, theology, grammar as separate automated stages |
| Theological handling | None | None | None | None | First-class: grace-based framework, banned cliches, theological anti-patterns, scripture handling (NKJV default, full quotes) |
| Output format | Multiple (web, export) | In-app + export | .docx, .pdf | Compile to multiple formats | Professional .docx with full front/back matter via docx-js |
| Sermon input | None | None | None | None | Purpose-built sermon-to-book adaptation pipeline |
| Discussion questions | None | None | None | None | Auto-generated, chapter-specific, passes the cliche test |
| Non-fiction focus | Generic | Fiction-focused | Generic | Genre-agnostic | Purpose-built for non-fiction teaching/theological content |

**Key insight from competitor analysis:** No existing tool handles theological content with any sophistication. They are all genre-agnostic (or fiction-focused). Book Crafter's theological framework, voice fidelity system, and sermon-to-book pipeline are genuinely uncontested territory. The risk is not competition - it is execution quality.

## Sources

- [Kindlepreneur - AI Writing Tools for Authors](https://kindlepreneur.com/best-ai-writing-tools/)
- [Kindlepreneur - Parts of a Book](https://kindlepreneur.com/parts-of-a-book/)
- [Cascadia Author Services - Hook Writing Guide](https://cascadiaauthorservices.com/hook-writing/)
- [Cascadia Author Services - Parts of a Nonfiction Book](https://cascadiaauthorservices.com/parts-of-a-book-in-order/)
- [BookClub - Non-Fiction Book Structure](https://bookclb.com/non-fiction-book-structure-reader-engagement/)
- [MinistryPass - Turn Sermon Series into a Book](https://ministrypass.com/how-to-turn-your-sermon-series-into-a-book/)
- [SermonToBook.com](https://www.sermontobook.com/)
- [Good Comma Editing - Sermon-Sourced Books](https://goodcommaediting.com/sermon-sourced-books)
- [Preach and Publish - Sermons into a Book](https://preachandpublish.org/how-to-turn-your-sermons-into-a-life-changing-book/)
- [Monday.com - Best AI for Writing a Book 2026](https://monday.com/blog/ai-agents/best-ai-for-writing-a-book/)
- [Squibler](https://www.squibler.io/)
- [Scrivener](https://www.literatureandlatte.com/scrivener/overview)
- [WordWriter](https://www.wordwriter.co/best-ai-book-writing-tools/)
- [SidekickWriter - AI Book Writing Software 2026](https://www.sidekickwriter.com/blog/best-ai-book-writing-software-2026)
- [Inkfluence AI - Smart Continue](https://www.inkfluenceai.com/blog/smart-continue-ai-book-writing-assistant-2026)
- [Novelmage - Claude for Writers](https://novelmage.com/blog/claude-4-for-writers-the-complete-ai-writing-assistant-guide-that-actually-works)
- [docx npm package](https://www.npmjs.com/package/docx)
- [docx TOC documentation](https://github.com/dolanmiu/docx/blob/master/docs/usage/table-of-contents.md)
- [Trinka - Consistency Checkers](https://www.trinka.ai/blog/how-consistency-checkers-improve-writing-uniformity-across-draft-iterations/amp/)
- [Google Developers - Multi-Agent Patterns in ADK](https://developers.googleblog.com/developers-guide-to-multi-agent-patterns-in-adk/)
- [Reedsy - Parts of a Book](https://blog.reedsy.com/guide/parts-of-a-book/)

---
*Feature research for: AI-powered book writing plugin (non-fiction, theological/spiritual focus)*
*Researched: 2026-03-27*
