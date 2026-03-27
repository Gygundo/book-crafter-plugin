# Phase 1: Plugin Foundation + Orchestrator - Research

**Researched:** 2026-03-27
**Domain:** Claude Code plugin architecture, skill orchestration, pipeline state management
**Confidence:** HIGH

## Summary

Phase 1 builds the plugin skeleton and master orchestrator -- the foundation every subsequent phase depends on. The technical domain is the Claude Code plugin system: `.claude-plugin/plugin.json` manifests, `skills/*/SKILL.md` files with YAML frontmatter, `agents/*.md` subagent definitions, and `references/` directories for shared context documents. This is a well-documented, proven system with working examples in David's existing encounter-content-engine plugin and sermon-crafter skill.

The orchestrator is the most critical deliverable. It must chain five pipeline stages (outline, research, write, edit, format) sequentially, manage a book project directory with organised subdirectories, track pipeline state via filesystem artefacts, and detect where to resume interrupted work. The content-engine orchestrator provides a directly reusable pattern: dependency-graph-based stage sequencing, filesystem scanning for state detection, wave-based parallel execution, and status dashboard reporting.

Cross-surface compatibility (CLI, desktop, web, IDE) is inherent to the plugin system -- plugins that follow conventions work everywhere Claude Code runs. The key constraint is avoiding CLI-only dependencies (no `--plugin-dir` only patterns, no hardcoded paths). The plugin must be installable via marketplace or directory reference.

**Primary recommendation:** Model the orchestrator directly on the content-engine orchestrator pattern (filesystem state detection, dependency graph, status dashboard), adapted for the five-stage book pipeline. Use `SKILL.md` frontmatter conventions exactly as documented in official Claude Code docs. Create stub skills for stages 2-5 that the orchestrator can detect but not yet execute.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FOUND-01 | Plugin scaffold follows Claude Code conventions (.claude-plugin/plugin.json, skills/*/SKILL.md, references/*.md) | Full plugin manifest schema documented below; proven pattern from encounter-content-engine; official docs verified 2026-03-27 |
| FOUND-02 | Master orchestrator skill chains all pipeline stages automatically (outline -> research -> write -> edit -> format) | Content-engine orchestrator provides proven dependency graph + sequential chaining pattern; architecture patterns section details the pipeline flow |
| FOUND-03 | Each book project gets its own directory with organised artefacts (outline, research, chapter drafts, revisions, final .docx) | Project directory structure defined in architecture research; orchestrator creates and manages this structure |
| FOUND-04 | Pipeline state tracking persists progress across stages so interrupted work can resume | Filesystem-based state detection pattern from content-engine; artefact existence = stage completion; no external state store needed |
| FOUND-05 | Orchestrator detects which pipeline stage to resume from based on existing artefacts | Content-engine "Detect Pipeline State" pattern: scan directory, check for stage output files, identify first incomplete stage |
| FOUND-06 | Plugin works across all Claude Code surfaces -- CLI, desktop app, web app (claude.ai/code), and IDE extensions | Inherent to plugin system; no special handling needed if conventions are followed; verified via official docs |
</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Claude Code Plugin System | Current (v1.0.33+) | Plugin architecture, skill discovery, namespacing | This IS the execution environment. `.claude-plugin/plugin.json` + `skills/*/SKILL.md` + `agents/*.md` + `references/*.md`. No alternative exists. **Confidence: HIGH** (official docs verified 2026-03-27) |
| Markdown (.md) | N/A | All skill definitions, reference documents, project artefacts | Claude Code's native format for skills, agents, references, and all intermediate book artefacts. **Confidence: HIGH** |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Node.js | >=18 (LTS) | Runtime for future docx generation (Phase 5) | Not needed in Phase 1, but the plugin directory structure should account for it |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `skills/` directory with SKILL.md | `commands/` directory with .md files | Commands are legacy; skills support supporting files, frontmatter config, and model invocation control. Use skills. |
| Custom subagents (`agents/*.md`) | `context: fork` on skills | Subagent definitions give explicit control over model, tools, permissions, maxTurns, skills preloading. Better for Phase 3+ parallel chapter writing. Define agent definitions now for future use. |
| Filesystem-based state tracking | JSON state file | Filesystem is simpler, more debuggable, and matches the content-engine pattern. A JSON file adds complexity with no benefit -- the artefact files ARE the state. |

## Architecture Patterns

### Recommended Plugin Structure

```
book-crafter-plugin/
+-- .claude-plugin/
|   +-- plugin.json                    # Plugin manifest (name, version, description)
+-- skills/
|   +-- orchestrator/
|   |   +-- SKILL.md                   # Master pipeline controller (user-invocable)
|   +-- outliner/
|   |   +-- SKILL.md                   # Stub for Phase 2
|   +-- researcher/
|   |   +-- SKILL.md                   # Stub for Phase 3
|   +-- writer/
|   |   +-- SKILL.md                   # Stub for Phase 3
|   +-- editor/
|   |   +-- SKILL.md                   # Stub for Phase 4
|   +-- formatter/
|       +-- SKILL.md                   # Stub for Phase 5
+-- agents/
|   +-- chapter-writer.md             # Subagent definition for Phase 3
|   +-- chapter-editor.md             # Subagent definition for Phase 4
+-- references/
|   +-- voice-profiles/
|   |   +-- spiritual-default.md      # Placeholder for Phase 2
|   +-- book-dna-template.md          # Master context template (placeholder for Phase 2)
|   +-- pipeline-stages.md            # Reference doc describing all 5 stages
+-- .planning/                         # Development planning (not shipped)
```

### Recommended Book Project Directory Structure

```
~/Documents/Books/[Book Title]/
+-- pipeline-state.md                 # Human-readable state tracker (optional, orchestrator can derive from files)
+-- book-dna.md                       # Master context document (Phase 2+)
+-- chapter-outline.md                # Approved outline (Phase 2+)
+-- voice-profile.md                  # Copy of selected voice profile (Phase 2+)
+-- research/
|   +-- ch01-research.md              # Per-chapter research (Phase 3+)
+-- drafts/
|   +-- ch01-draft.md                 # Chapter drafts (Phase 3+)
+-- edited/
|   +-- ch01-final.md                 # Edited chapters (Phase 4+)
+-- revisions/
|   +-- ch01-draft-v1.md              # Revision history (Phase 4+)
+-- front-matter/
|   +-- foreword.md                   # Front matter content (Phase 6+)
+-- output/
    +-- [Book Title].docx             # Final output (Phase 5+)
```

### Pattern 1: Plugin Manifest (plugin.json)

**What:** The `.claude-plugin/plugin.json` file that identifies this as a Claude Code plugin.

**Source:** Official Claude Code Plugin docs (verified 2026-03-27)

```json
{
  "name": "book-crafter",
  "version": "1.0.0",
  "description": "Write complete books from topic brief to professional .docx. Pipeline architecture: outline, research, write, edit, format. Ships with theological voice profile, supports custom voices.",
  "author": {
    "name": "David",
    "email": "david@encounterchurch.co.za"
  },
  "keywords": ["book", "writing", "publishing", "theology", "docx", "multi-agent"]
}
```

**Key facts from official docs:**
- `name` is the ONLY required field if manifest is present
- `name` becomes the skill namespace prefix: skills are invoked as `/book-crafter:orchestrator`
- `name` must be kebab-case, no spaces
- All component directories (skills/, agents/, commands/) must be at the plugin ROOT, NOT inside .claude-plugin/
- The manifest is actually optional -- Claude Code auto-discovers components from default locations. But including it provides metadata and namespacing.

### Pattern 2: Orchestrator Skill (Master Pipeline Controller)

**What:** The user-invocable skill that controls the entire book pipeline.

**When:** User invokes `/book-crafter:orchestrator` or says "write a book about X".

**Key frontmatter fields (from official docs, verified 2026-03-27):**

| Field | Value | Why |
|-------|-------|-----|
| `name` | orchestrator | Display name, becomes `/book-crafter:orchestrator` |
| `description` | Long, keyword-rich description | Claude uses this to decide when to auto-load the skill |
| `disable-model-invocation` | false (default) | Allow Claude to load it when user mentions book writing |
| `user-invocable` | true (default) | Appears in `/` menu |
| `allowed-tools` | Read, Write, Bash, Grep, Glob, Agent | Full tool access needed for pipeline control |

**Orchestrator behaviour (modelled on content-engine):**

1. **Detect or create project** -- scan `~/Documents/Books/` for existing projects or create new one
2. **Scan pipeline state** -- check which stage artefacts exist
3. **Display status dashboard** -- show what's done, what's next
4. **Execute next stage** or **resume from interruption point**
5. **Manage stage transitions** -- pass outputs from one stage as inputs to the next

```yaml
---
name: orchestrator
description: "Master pipeline controller for book writing. Use this skill whenever the user wants to write a book, create a book from sermons or notes, check book project status, resume an interrupted book project, or run the full book pipeline. Triggers on: 'write a book', 'book project', 'book status', 'resume book', 'book pipeline', 'create a book from', 'book crafter'. Coordinates all stages: outline, research, write, edit, format."
allowed-tools: Read, Write, Bash, Grep, Glob, Agent
---
```

### Pattern 3: Filesystem-Based Pipeline State Detection

**What:** Determine which pipeline stage to resume from by scanning for output artefacts.

**Source:** Directly adapted from content-engine orchestrator's "Detect Pipeline State" pattern.

**Stage completion detection logic:**

| Stage | Complete When | Key Artefact |
|-------|---------------|--------------|
| Outline | `chapter-outline.md` exists AND contains approval marker | `chapter-outline.md` |
| Research | `research/` dir exists AND contains `ch*-research.md` files matching outline chapter count | `research/ch01-research.md` |
| Write | `drafts/` dir exists AND contains `ch*-draft.md` files matching outline chapter count | `drafts/ch01-draft.md` |
| Edit | `edited/` dir exists AND contains `ch*-final.md` files matching outline chapter count | `edited/ch01-final.md` |
| Format | `output/` dir contains `.docx` file | `output/[Title].docx` |

**Resume algorithm:**
1. Scan project directory
2. Find the LAST completed stage (most advanced artefacts present)
3. Check if that stage is fully complete (all chapters processed, not just some)
4. If partially complete, resume within that stage
5. If fully complete, advance to next stage

### Pattern 4: Stage Stub Skills

**What:** Placeholder SKILL.md files for stages that will be implemented in later phases.

**Why:** The orchestrator needs to reference these stages by name. Stub skills ensure the pipeline structure is testable end-to-end even before all stages are implemented.

```yaml
---
name: outliner
description: "Generate a chapter-by-chapter book outline from a topic brief or existing content. Called by the orchestrator during Stage 1 of the book pipeline."
user-invocable: false
---

# Book Outliner

[STUB - Implementation in Phase 2]

This skill will generate a chapter-by-chapter outline including:
- Chapter titles and hook strategies
- Key arguments and supporting scriptures per chapter
- Narrative arc with momentum positioning
- Book DNA master context document

Currently returns a placeholder message. Full implementation coming in Phase 2.
```

### Pattern 5: Status Dashboard

**What:** Visual pipeline status display, adapted from content-engine dashboard.

```
## Book Pipeline: [Book Title]
Directory: ~/Documents/Books/[Book Title]/

### Pipeline Status

[x] Outline (outliner)
    Generated: [date] | Chapters: [n] | Approved: Yes

[ ] Research (researcher) -- 0/[n] chapters
    [ ] Chapter 1 research
    [ ] Chapter 2 research
    ...

[ ] Writing (writer) -- 0/[n] chapters
    [ ] Chapter 1 draft
    [ ] Chapter 2 draft
    ...

[ ] Editing (editor)
    [ ] Voice consistency pass
    [ ] Flow/transition pass
    [ ] Cross-chapter validation

[ ] Formatting (formatter)
    [ ] .docx generation

### Progress: [x]/5 stages complete
```

### Anti-Patterns to Avoid

- **Putting component directories inside .claude-plugin/**: Only `plugin.json` goes in `.claude-plugin/`. Skills, agents, commands, hooks go at the plugin root. This is explicitly called out as a "common mistake" in official docs.
- **Hardcoded absolute paths in skills**: Use `${CLAUDE_PLUGIN_ROOT}` for referencing plugin files. Use `${CLAUDE_SKILL_DIR}` for referencing files relative to the skill directory.
- **Building a custom state management system**: The filesystem IS the state store. Artefact presence = stage completion. No database, no JSON state file, no external tracking. This is the proven pattern from content-engine.
- **Creating CLI-only features**: Everything must work through the skill system, which is surface-agnostic. No `--plugin-dir` only patterns.
- **Nested subagent spawning**: Subagents CANNOT spawn other subagents. The orchestrator (main thread) must directly spawn all subagents. Flat hierarchy only.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Plugin manifest schema | Custom config format | `.claude-plugin/plugin.json` with standard fields | Plugin system requires this exact format and location |
| Skill discovery | Custom registration system | `skills/*/SKILL.md` convention with YAML frontmatter | Claude Code auto-discovers skills from this structure |
| Cross-surface compatibility | Platform-specific code | Standard plugin conventions | Plugin system handles all surfaces automatically |
| Pipeline state persistence | Database, JSON state file, external service | Filesystem artefact scanning | Simpler, more debuggable, proven in content-engine |
| Stage orchestration framework | Custom event system, state machine library | Orchestrator SKILL.md with sequential logic | Claude Code IS the orchestration engine |

**Key insight:** The Claude Code plugin system handles all the infrastructure (discovery, loading, namespacing, cross-surface compatibility). Phase 1's job is to create the right files in the right places with the right content, not to build infrastructure.

## Common Pitfalls

### Pitfall 1: Component Directories in Wrong Location
**What goes wrong:** Skills, agents, or commands placed inside `.claude-plugin/` instead of at plugin root.
**Why it happens:** Intuitive assumption that all plugin files go in the plugin metadata directory.
**How to avoid:** Only `plugin.json` goes in `.claude-plugin/`. Everything else at root level.
**Warning signs:** Plugin loads but skills/agents/commands are missing.

### Pitfall 2: Missing or Weak Skill Descriptions
**What goes wrong:** Claude doesn't auto-invoke the orchestrator when user says "write a book".
**Why it happens:** Skill `description` field is too vague or missing trigger keywords.
**How to avoid:** Write verbose, keyword-rich descriptions. Include all likely trigger phrases. The description is how Claude decides when to load the skill.
**Warning signs:** User has to explicitly type `/book-crafter:orchestrator` instead of natural language.

### Pitfall 3: State Detection Race Conditions
**What goes wrong:** Orchestrator misidentifies pipeline state when a stage is partially complete.
**Why it happens:** Checking only for directory existence instead of validating completeness (e.g., `research/` exists but only has 3 of 12 chapter files).
**How to avoid:** Always count artefacts against expected chapter count from the outline. Partial completion = resume within stage, not advance to next.
**Warning signs:** Orchestrator skips chapters or repeats completed work.

### Pitfall 4: Assuming Plugin Installation Method
**What goes wrong:** Plugin only works with `--plugin-dir` flag, not when installed via marketplace.
**Why it happens:** Hardcoded paths, relying on development-time directory structure.
**How to avoid:** Use `${CLAUDE_PLUGIN_ROOT}` for all internal file references. Test with both `--plugin-dir` and installed methods.
**Warning signs:** Works in development, breaks when shared.

### Pitfall 5: Over-Engineering the Orchestrator for Phase 1
**What goes wrong:** Trying to implement full parallel execution, wave batching, and all stage logic in Phase 1.
**Why it happens:** Excitement about the full architecture; not respecting phase boundaries.
**How to avoid:** Phase 1 orchestrator creates directories, detects state, and chains stages. Actual stage implementations come in Phases 2-6. Use stub skills.
**Warning signs:** Phase 1 taking too long, touching concerns that belong to later phases.

## Code Examples

### plugin.json (Verified Pattern from Official Docs)

```json
// Source: https://code.claude.com/docs/en/plugins-reference
{
  "name": "book-crafter",
  "version": "1.0.0",
  "description": "Write complete books from topic brief to professional .docx. Pipeline architecture: outline, research, write, edit, format. Ships with theological voice profile, supports custom voices.",
  "author": {
    "name": "David",
    "email": "david@encounterchurch.co.za"
  },
  "keywords": ["book", "writing", "publishing", "theology", "docx", "multi-agent"]
}
```

### Orchestrator SKILL.md (Adapted from Content-Engine)

```yaml
---
name: orchestrator
description: "Master pipeline controller for book writing. Use this skill whenever the user wants to write a book, create a book from sermons or notes, check book project status, resume an interrupted book project, or run the full book pipeline. Triggers on: 'write a book', 'book project', 'book status', 'resume book', 'book pipeline', 'create a book from', 'book crafter'. Coordinates all stages: outline, research, write, edit, format."
allowed-tools: Read, Write, Bash, Grep, Glob, Agent
---

# Book Crafter Orchestrator

[Full orchestrator instructions would go here -- pipeline overview,
state detection logic, stage sequencing, dashboard display, etc.]
```

### Stub Skill SKILL.md Pattern

```yaml
---
name: outliner
description: "Generate a chapter-by-chapter book outline from a topic brief or existing content. Called by the orchestrator during the outline stage of the book pipeline."
user-invocable: false
---

# Book Outliner

[STUB - Full implementation in Phase 2]

This skill will be implemented in Phase 2 to generate book outlines.
```

### SKILL.md Frontmatter Reference (All Valid Fields)

```yaml
# Source: https://code.claude.com/docs/en/skills (verified 2026-03-27)
---
name: my-skill                        # Display name, becomes /namespace:name
description: What this skill does     # Claude uses this for auto-invocation decisions
argument-hint: [book-title]           # Shown during autocomplete
disable-model-invocation: true        # Prevent Claude auto-loading (default: false)
user-invocable: false                 # Hide from / menu (default: true)
allowed-tools: Read, Write, Bash      # Tools allowed without per-use approval
model: sonnet                         # Model override (optional)
effort: high                          # Effort level override (optional)
context: fork                         # Run in forked subagent context (optional)
agent: Explore                        # Which subagent type for context: fork (optional)
hooks: ...                            # Hooks scoped to skill lifecycle (optional)
paths: "*.md, src/**"                 # Glob patterns limiting when skill activates (optional)
shell: bash                           # Shell for !`command` blocks (default: bash)
---
```

### Subagent Definition Reference (All Valid Fields)

```yaml
# Source: https://code.claude.com/docs/en/sub-agents (verified 2026-03-27)
---
name: chapter-writer                  # Required: unique identifier
description: When Claude should use   # Required: delegation trigger
tools: Read, Write, Bash, Grep, Glob  # Optional: inherits all if omitted
disallowedTools: Edit                 # Optional: deny specific tools
model: inherit                        # Optional: sonnet|opus|haiku|inherit|full-model-id
permissionMode: default               # NOT supported in plugin agents (security)
maxTurns: 50                          # Optional: cap agentic turns
skills:                               # Optional: preload skill content at startup
  - book-crafter:writer
mcpServers: []                        # NOT supported in plugin agents (security)
hooks: {}                             # NOT supported in plugin agents (security)
memory: user                          # Optional: persistent memory scope (user|project|local)
background: false                     # Optional: run as background task
effort: high                          # Optional: effort level override
isolation: worktree                   # Optional: git worktree isolation
---

System prompt content goes here...
```

**Critical note for plugin agents:** `hooks`, `mcpServers`, and `permissionMode` are NOT supported for plugin-shipped agents (security restriction). If needed, copy agent files to `.claude/agents/` instead.

### String Substitution Variables Available in Skills

```
$ARGUMENTS           -- All arguments passed when invoking the skill
$ARGUMENTS[N]        -- Specific argument by 0-based index
$N                   -- Shorthand for $ARGUMENTS[N]
${CLAUDE_SESSION_ID} -- Current session ID
${CLAUDE_SKILL_DIR}  -- Directory containing this SKILL.md
${CLAUDE_PLUGIN_ROOT} -- Plugin installation directory (in plugin context)
${CLAUDE_PLUGIN_DATA} -- Persistent data directory surviving updates
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `commands/*.md` only | `skills/*/SKILL.md` with supporting files | Agent Skills spec (current) | Skills support frontmatter, supporting files, model invocation control. Commands still work but are legacy. |
| No plugin system | `.claude-plugin/plugin.json` with full manifest | v1.0.33+ | Plugins can be shared via marketplaces, namespaced, versioned |
| Manual subagent prompting | `agents/*.md` with YAML frontmatter | Current | Subagent definitions with model, tools, maxTurns, skills preloading |
| No persistent agent memory | `memory` field in agent definitions | Current | Agents can accumulate knowledge across sessions |

**Key current-state facts (verified 2026-03-27):**
- Plugin agents do NOT support `hooks`, `mcpServers`, or `permissionMode` (security restriction)
- Subagents CANNOT spawn other subagents (flat hierarchy enforced)
- Skill descriptions are loaded into context so Claude knows what's available; full skill content loads only when invoked
- `${CLAUDE_PLUGIN_ROOT}` and `${CLAUDE_PLUGIN_DATA}` are available for path references in all plugin components
- `/reload-plugins` reloads plugins without restarting Claude Code

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Manual validation (no automated test framework for Claude Code plugins) |
| Config file | none -- plugin validation is structural |
| Quick run command | `claude --plugin-dir /Users/David/Development/book-crafter-plugin` then invoke `/book-crafter:orchestrator` |
| Full suite command | Test all skills listed in `/help`, create a test project, verify state detection |

### Phase Requirements -> Test Map

| Req ID | Behaviour | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUND-01 | Plugin recognised by Claude Code | smoke | `claude --plugin-dir . -p "list your skills" --output-format json` | N/A - structural |
| FOUND-02 | Orchestrator chains pipeline stages | manual | Invoke orchestrator, verify it references all 5 stages in sequence | N/A - Wave 0 |
| FOUND-03 | Book project directory created with subdirs | smoke | Invoke orchestrator with test topic, verify directory structure with `ls -R` | N/A - Wave 0 |
| FOUND-04 | Pipeline state persists across sessions | manual | Create partial project, restart Claude, invoke orchestrator, verify state detected | N/A - manual |
| FOUND-05 | Resume detection from existing artefacts | manual | Place artefacts in project dir, invoke orchestrator, verify correct stage identified | N/A - manual |
| FOUND-06 | Works across CLI, desktop, web, IDE | manual | Test on CLI with `--plugin-dir`, install as user plugin, test on desktop app | N/A - manual-only |

### Sampling Rate
- **Per task commit:** `claude --plugin-dir . -p "list skills from book-crafter plugin" --output-format json` (verify plugin loads)
- **Per wave merge:** Full manual test: create project, verify directory structure, test state detection
- **Phase gate:** All 6 requirements verified manually before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `.claude-plugin/plugin.json` -- plugin manifest
- [ ] `skills/orchestrator/SKILL.md` -- master orchestrator
- [ ] Stub SKILL.md files for outliner, researcher, writer, editor, formatter
- [ ] `agents/chapter-writer.md` -- subagent definition (placeholder)
- [ ] `agents/chapter-editor.md` -- subagent definition (placeholder)
- [ ] `references/pipeline-stages.md` -- pipeline stage reference document
- [ ] `references/book-dna-template.md` -- placeholder template
- [ ] `references/voice-profiles/spiritual-default.md` -- placeholder voice profile

## Open Questions

1. **Default book project location**
   - What we know: Content-engine uses `~/Documents/Encounter/Content-Pipeline/`. Books should go somewhere similar.
   - What's unclear: Should it be `~/Documents/Books/` or should the user choose? What about cloud-synced directories?
   - Recommendation: Default to `~/Documents/Books/` but allow the user to specify a custom location when creating a project. Store the active project path so the orchestrator can find it on resume.

2. **Plugin installation method for sharing**
   - What we know: `--plugin-dir` works for development. Marketplace installation works for distribution.
   - What's unclear: Whether David wants to publish to a marketplace or keep as a local plugin.
   - Recommendation: Build as a proper plugin with marketplace-compatible structure. Can always use `--plugin-dir` for now and publish later.

3. **How deep should stub skills go?**
   - What we know: The orchestrator needs to reference stage names. Stubs need to exist for the pipeline structure to be testable.
   - What's unclear: Should stubs be completely empty or contain partial logic?
   - Recommendation: Stubs should contain a description of what they WILL do (for context when Claude loads them) but no implementation. Mark clearly as `[STUB - Implementation in Phase N]`.

## Sources

### Primary (HIGH confidence)
- [Claude Code Plugins documentation](https://code.claude.com/docs/en/plugins) -- Plugin creation, manifest, directory structure. Fetched and verified 2026-03-27.
- [Claude Code Plugins Reference](https://code.claude.com/docs/en/plugins-reference) -- Full manifest schema, component specifications, CLI commands, environment variables. Fetched and verified 2026-03-27.
- [Claude Code Skills documentation](https://code.claude.com/docs/en/skills) -- Complete SKILL.md frontmatter reference, invocation control, supporting files, string substitutions. Fetched and verified 2026-03-27.
- [Claude Code Subagents documentation](https://code.claude.com/docs/en/sub-agents) -- Subagent definitions, all frontmatter fields, parallelism constraints, plugin agent restrictions. Fetched and verified 2026-03-27.
- Encounter Content Engine plugin (`~/.claude/plugins/encounter-content-engine/`) -- Proven plugin structure, orchestrator pattern, dependency graph, wave execution, state detection. LOCAL, verified.
- Sermon Crafter skill (`~/.claude/skills/sermon-crafter/SKILL.md`) -- Proven skill pattern, voice profile approach, document formatting conventions. LOCAL, verified.

### Secondary (MEDIUM confidence)
- Architecture research (`.planning/research/ARCHITECTURE.md`) -- Pipeline-and-parallel architecture, project directory structure, Book DNA pattern. Internal research doc.
- Stack research (`.planning/research/STACK.md`) -- Technology choices, subagent strategy, voice consistency techniques. Internal research doc.

### Tertiary (LOW confidence)
- None. All findings verified against primary sources.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- Claude Code plugin system is the only option; fully documented
- Architecture: HIGH -- Directly adapted from proven content-engine orchestrator; verified against official docs
- Pitfalls: HIGH -- Based on official docs' explicit warnings (directory structure, common mistakes) and practical experience with content-engine
- Plugin agent restrictions: HIGH -- Officially documented that hooks, mcpServers, permissionMode are not supported for plugin agents

**Research date:** 2026-03-27
**Valid until:** 2026-04-27 (plugin system is stable; 30-day validity)
