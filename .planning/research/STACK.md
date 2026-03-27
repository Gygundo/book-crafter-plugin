# Stack Research

**Domain:** Multi-agent Claude Code plugin for AI-powered book writing
**Researched:** 2026-03-27
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Claude Code Plugin System | Current (Agent Skills spec) | Plugin architecture, skill discovery, subagent orchestration | This IS the execution environment. The plugin convention (`.claude-plugin/plugin.json`, `skills/*/SKILL.md`, `references/*.md`, `agents/*.md`) is how Claude Code discovers and loads capabilities. No alternative exists for this use case. **Confidence: HIGH** (verified via official docs at code.claude.com/docs/en/plugins) |
| docx (docx-js) | 9.6.1 | .docx document generation | The only serious JS library for programmatic .docx creation. Already proven in David's docx skill (`~/.claude/skills/docx/SKILL.md`). Declarative API, works in Node, supports TOC, headers/footers, page numbers, styles, images, bookmarks. **Confidence: HIGH** (verified: `npm show docx version` returns 9.6.1, published Feb 2026) |
| Node.js | >=18 (LTS) | Runtime for docx generation scripts | Required by docx-js. Already available on system. Claude Code executes JS via `node -e` or temporary script files. **Confidence: HIGH** |
| Markdown (.md) | N/A | All intermediate artifacts, context documents, voice profiles | Claude Code's native format. Skills read/write markdown. The entire pipeline (outline, research, drafts, edits) should produce markdown artifacts that the formatter skill converts to .docx at the end. **Confidence: HIGH** |

### Plugin Architecture Components

| Component | Type | Purpose | Why This Approach |
|-----------|------|---------|-------------------|
| `.claude-plugin/plugin.json` | Manifest | Plugin identity, namespace | Required by Claude Code plugin spec. Skills namespaced as `book-crafter:skill-name`. |
| `skills/orchestrator/SKILL.md` | Skill (user-invocable) | Master pipeline controller | Chains sequential stages, spawns parallel chapter agents. Based on proven pattern from encounter-content-engine orchestrator. |
| `skills/outliner/SKILL.md` | Skill (model-invocable) | Book structure generation | Produces chapter-by-chapter outline with hooks, arguments, arc. Called by orchestrator. |
| `skills/researcher/SKILL.md` | Skill (model-invocable) | Per-chapter research gathering | Gathers supporting material (scripture, references, illustrations). Called by orchestrator. |
| `skills/writer/SKILL.md` | Skill (model-invocable) | Chapter draft writing | Produces full chapter drafts. Multiple instances run in parallel via subagents. |
| `skills/editor/SKILL.md` | Skill (model-invocable) | Voice consistency and quality | Ensures single-voice feel, flow between chapters, bestselling-author quality. |
| `skills/formatter/SKILL.md` | Skill (model-invocable) | .docx generation | Converts final markdown chapters to professional .docx with TOC, page numbers, etc. |
| `agents/chapter-writer.md` | Subagent | Isolated chapter writing | Each chapter gets its own subagent context, preventing cross-contamination while sharing the master context document. Key constraint: subagents CANNOT spawn other subagents. |
| `agents/chapter-editor.md` | Subagent | Isolated chapter editing | Separate context for editing passes, can compare chapter against voice profile without loading all chapters. |
| `references/voice-profiles/` | Reference dir | Swappable voice profiles | `.md` files defining voice characteristics. Default spiritual profile inherits from sermon-crafter's theological framework. |
| `references/book-dna-template.md` | Reference | Master context document template | Template for the per-book "Book DNA" that every agent reads. Contains voice, theology, outline, character arcs, key terms, recurring themes. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| docx | 9.6.1 | .docx generation | Formatter skill only. Install globally: `npm install -g docx`. Already in David's environment. |
| pandoc | System | Markdown-to-docx fallback, content extraction | Only if raw XML manipulation is needed. The docx-js approach is preferred for new documents. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `python scripts/office/validate.py` | .docx validation | Already exists in David's environment. Run after every .docx generation. |
| `python scripts/office/unpack.py` | Debug .docx issues | Unpack .docx to inspect XML when validation fails. |
| `python scripts/office/pack.py` | Repack edited .docx | For post-hoc XML fixes if needed. |

## Multi-Agent Architecture Decisions

### Subagent Strategy (CRITICAL)

Claude Code's subagent system is the execution engine for parallel chapter writing. Key constraints from official docs:

1. **Subagents CANNOT spawn other subagents.** This means the orchestrator (main thread) must spawn all chapter-writer subagents directly. No nested delegation.
2. **Parallelism caps at ~10 concurrent subagents.** For a 20-chapter book, batch in waves of 8-10.
3. **Each subagent gets its own context window.** This is actually ideal -- each chapter writer loads only the Book DNA + its chapter outline + relevant research, not all 20 chapters.
4. **Subagents can use the `skills` frontmatter to preload skills.** Chapter-writer agents should preload the writer skill.

**Recommendation:** Use custom subagent definitions (`agents/chapter-writer.md`, `agents/chapter-editor.md`) rather than `context: fork` on skills. Subagent definitions give explicit control over model, tools, permissions, and preloaded skills.

### Context Sharing Pattern: Book DNA Document

The critical challenge is voice consistency across parallel chapter agents. The solution is a **Book DNA document** -- a comprehensive but concise master context file that every agent reads.

**Book DNA contains:**
- Voice profile (tone, rhythm, vocabulary, what to avoid)
- Theological framework (for spiritual books) or domain framework
- Book outline with chapter summaries and arc
- Character/concept tracking (recurring themes, key terms, defined jargon)
- Cross-chapter continuity notes (callbacks, foreshadowing, running metaphors)
- Style rules (British spelling, formatting conventions, sentence length targets)

**How it flows:**
1. Outliner produces initial Book DNA from the topic brief + voice profile
2. Researcher enriches Book DNA with per-chapter research notes
3. Each chapter-writer subagent reads Book DNA + its chapter assignment
4. Editor reads Book DNA + all drafted chapters, flags inconsistencies
5. Book DNA is updated between pipeline stages (not during parallel execution)

**Size target:** Book DNA must fit comfortably in a subagent's context alongside the chapter writing task. Target: 3,000-5,000 words max for the DNA document, with per-chapter research in separate files.

### Voice Consistency Techniques

Based on research into multi-agent writing systems and the StoryWriter framework:

1. **Explicit voice profile documents** -- not vague guidelines but concrete examples of good/bad writing in the target voice. Include 3-5 paragraphs of "exemplar writing" that chapter agents can pattern-match against.
2. **Voice-locked vocabulary lists** -- words/phrases the author uses vs. words they would NEVER use. Prevents "AI voice" leaking through.
3. **Sentence rhythm specifications** -- average sentence length, fragment frequency, question frequency. Quantifiable metrics the editor can check.
4. **Opening hook patterns** -- each chapter needs a compelling opening. Provide 3-4 hook templates (bold statement, rhetorical question, story/anecdote, counter-intuitive claim).
5. **Post-write voice audit** -- the editor skill runs a systematic voice consistency check across all chapters, scoring each against the voice profile and flagging drift.

## Installation

```bash
# docx-js (if not already installed globally)
npm install -g docx

# Verify
node -e "const d = require('docx'); console.log('docx loaded, version check OK')"

# Validation tools (already in David's environment)
# python scripts/office/validate.py [file.docx]
```

No additional npm packages are needed. The plugin is pure SKILL.md files, reference documents, and subagent definitions. The docx-js library handles all document generation.

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| docx (docx-js) for .docx generation | docxtemplater | Only if you have pre-designed Word templates to fill in. docxtemplater is template-based (fill placeholders in existing .docx). docx-js is programmatic (build from scratch). Book chapters are generated content, not template fills. |
| Custom subagents (`agents/*.md`) | `context: fork` on skills | Only for simple, stateless forked tasks. Subagent definitions are better because they support `skills` preloading, `model` selection, `permissionMode`, `maxTurns`, and persistent memory. |
| Markdown intermediate format | Direct .docx writing per chapter | Never. Writing .docx inside each chapter subagent would mean each agent needs the full docx-js formatting knowledge. Markdown is universally understood by Claude, and a single formatter skill handles the .docx conversion. |
| Single orchestrator skill | Multiple orchestrator skills per stage | Never for this use case. One orchestrator manages the full pipeline and knows which stage to run next. This matches the encounter-content-engine pattern that is already proven. |
| `references/` directory for voice profiles | Inline voice instructions in each SKILL.md | Never. Voice profiles must be shared across all skills and subagents. Duplicating voice instructions across 6+ skill files guarantees drift. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| docxtemplater | Template-based, not programmatic. You'd need pre-built Word templates for every book layout. Books have variable chapter counts, variable section structures. docx-js builds dynamically. | docx (docx-js) 9.6.1 |
| officegen | Abandoned/unmaintained. Last meaningful update was years ago. | docx (docx-js) 9.6.1 |
| LangChain / LangGraph for orchestration | Massive dependency for zero benefit. Claude Code IS the orchestration layer. Skills and subagents handle all the multi-agent patterns natively. Adding LangChain would fight the Claude Code architecture. | Claude Code native skills + subagents |
| External vector DB for context | Overkill for book-length content. A 60,000-word book is ~80K tokens -- well within Claude's context window when chunked by chapter. The Book DNA pattern handles context sharing without infrastructure. | Book DNA markdown document + per-chapter files |
| PDF output | Out of scope per PROJECT.md. .docx is the format; external tools handle conversion. Don't add pdf-lib or puppeteer. | .docx only via docx-js |
| Fiction/narrative-specific frameworks (e.g., NovelAI patterns) | Project is optimized for non-fiction (theological, teaching, self-help, leadership). Fiction requires character state tracking, dialogue systems, and plot graph management that are out of scope. | Non-fiction pipeline with outline -> research -> write -> edit |
| `WidthType.PERCENTAGE` in docx-js tables | Breaks in Google Docs. The docx skill explicitly warns against this. | `WidthType.DXA` always |
| Unicode bullet characters in docx-js | Creates invalid Word documents. Use `LevelFormat.BULLET` with numbering config. | Proper numbering config per docx skill |

## Stack Patterns by Variant

**If writing a booklet (<100 pages, ~15K words):**
- Skip parallel chapter writing. Sequential is fine for 5-8 chapters.
- Single subagent for all chapters, or even inline writing in the main thread.
- Book DNA can be simpler (voice + outline only).
- Skip the research stage if the user provides sufficient source material.

**If writing a standard book (40-60K words, 15-25 chapters):**
- Full parallel pipeline. Batch chapters in waves of 8-10 subagents.
- Comprehensive Book DNA with per-chapter research files.
- Editor makes two passes: first for voice consistency, second for flow/continuity.
- Consider using `maxTurns` on chapter-writer subagents to prevent runaway generation.

**If the source is existing content (sermons/notes) vs. topic brief:**
- Add a "source ingestion" step before outlining that extracts key themes, quotes, and structure from the source material.
- The outliner skill needs two modes: "generate from topic" and "synthesise from sources."
- Voice profile can be partially auto-generated from the source material's existing voice.

**If swapping voice profiles (non-spiritual genre):**
- The voice profile in `references/voice-profiles/` is a plain .md file.
- The orchestrator reads whichever profile the user specifies (or defaults to spiritual).
- All downstream skills and subagents receive the selected profile via the Book DNA.
- No code changes needed -- it's a reference file swap.

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| docx@9.6.1 | Node.js >= 14 | Works with all current LTS versions. Tested in David's environment. |
| docx@9.6.1 | Claude Code plugin system | docx-js is called via `node -e` or temp scripts in Bash tool. No compatibility issues -- it's a standalone npm package. |
| Claude Code subagents | Skills with `context: fork` | Both use the same underlying Task/Agent tool. Subagent definitions take precedence when both specify the same name. |

## File Structure Summary

```
book-crafter-plugin/
├── .claude-plugin/
│   └── plugin.json                    # Plugin manifest
├── skills/
│   ├── orchestrator/
│   │   └── SKILL.md                   # Master pipeline controller
│   ├── outliner/
│   │   └── SKILL.md                   # Book structure generation
│   ├── researcher/
│   │   └── SKILL.md                   # Per-chapter research
│   ├── writer/
│   │   └── SKILL.md                   # Chapter draft writing
│   ├── editor/
│   │   └── SKILL.md                   # Voice consistency + quality
│   └── formatter/
│   │   └── SKILL.md                   # .docx generation
│   │   └── docx-reference.md          # Extracted docx-js patterns from docx skill
├── agents/
│   ├── chapter-writer.md              # Subagent for parallel chapter writing
│   └── chapter-editor.md              # Subagent for chapter editing
├── references/
│   ├── voice-profiles/
│   │   ├── spiritual-default.md       # Default theological voice (from sermon-crafter)
│   │   └── example-custom.md          # Template for custom voice profiles
│   ├── book-dna-template.md           # Master context document template
│   └── formatting-guide.md            # .docx formatting conventions
└── .planning/                         # Development planning (not shipped)
```

## Sources

- [Claude Code Skills documentation](https://code.claude.com/docs/en/skills) -- Plugin/skill conventions, frontmatter fields, supporting files pattern. **Confidence: HIGH** (official docs, fetched 2026-03-27)
- [Claude Code Subagents documentation](https://code.claude.com/docs/en/sub-agents) -- Subagent definitions, parallelism constraints, `skills` preloading, `maxTurns`, `permissionMode`. **Confidence: HIGH** (official docs, fetched 2026-03-27)
- [Claude Code Plugins documentation](https://code.claude.com/docs/en/plugins) -- Plugin manifest schema, directory structure, namespacing. **Confidence: HIGH** (official docs, fetched 2026-03-27)
- [npm: docx 9.6.1](https://www.npmjs.com/package/docx) -- Current version verified. **Confidence: HIGH**
- [StoryWriter: A Multi-Agent Framework for Long Story Generation](https://dl.acm.org/doi/10.1145/3746252.3761616) -- Outline Agent -> Planning Agent -> Writing Agent architecture, ReIO pattern for maintaining coherence. **Confidence: MEDIUM** (academic paper, fiction-focused but architecture patterns apply)
- David's existing docx skill (`~/.claude/skills/docx/SKILL.md`) -- Proven docx-js patterns, validation workflow, formatting rules. **Confidence: HIGH** (local, verified)
- David's existing content-engine orchestrator (`~/.claude/plugins/encounter-content-engine/skills/content-orchestrator/SKILL.md`) -- Proven pipeline + parallel wave pattern, dependency graph, agent spawning conventions. **Confidence: HIGH** (local, verified)
- David's existing sermon-crafter (`~/.claude/skills/sermon-crafter/SKILL.md`) -- Voice profile patterns, theological framework, .docx formatting conventions. **Confidence: HIGH** (local, verified)

---
*Stack research for: Multi-agent Claude Code plugin for AI-powered book writing*
*Researched: 2026-03-27*
