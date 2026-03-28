# Phase 8: Voice Builder Skill - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-28
**Phase:** 08-voice-builder-skill-analyse-source-content-to-generate-custom-voice-profiles
**Areas discussed:** Source input handling, Analysis approach, Profile output & refinement, Integration model

---

## Source Input Handling

### Source Formats

| Option | Description | Selected |
|--------|-------------|----------|
| Markdown only | Accept .md files only. Obsidian vaults are already .md. Simplest to parse. | ✓ |
| Markdown + plain text | Accept .md and .txt files. Slightly broader. | |
| Markdown + text + docx | Also accept .docx via text extraction. Adds complexity. | |

**User's choice:** Markdown only
**Notes:** None

### Source Discovery

| Option | Description | Selected |
|--------|-------------|----------|
| Directory path | User provides a directory path. Builder recursively scans. | ✓ |
| Directory + glob filter | Directory path plus optional glob pattern for filtering. | |
| Explicit file list | User provides specific file paths. | |

**User's choice:** Directory path
**Notes:** None

### Corpus Size

| Option | Description | Selected |
|--------|-------------|----------|
| Soft minimum with warning | Recommend 5+ files / 10k+ words. Warn but proceed with INFERRED markers. | ✓ |
| Hard minimum | Refuse to generate below threshold. | |
| No minimum | Accept any amount. | |

**User's choice:** Soft minimum with warning
**Notes:** None

### Mixed Content

| Option | Description | Selected |
|--------|-------------|----------|
| Analyse everything | Treat all .md files as representative. | ✓ |
| Length/quality filter | Auto-skip short files and outlines. | |
| Let user preview and select | Show files, let user deselect before analysis. | |

**User's choice:** Analyse everything
**Notes:** None

---

## Analysis Approach

### Processing Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Two-pass analysis | Pass 1: statistical patterns. Pass 2: synthesise into profile. | ✓ |
| Sample-based analysis | Select 5-10 representative files, analyse deeply. | |
| Single-pass synthesis | Read everything once, generate profile directly. | |

**User's choice:** Two-pass analysis
**Notes:** None

### Linguistic Features

| Option | Description | Selected |
|--------|-------------|----------|
| Sentence patterns & rhythm | Lengths, fragments, rhetorical questions, rhythm variation. | ✓ |
| Vocabulary & word choice | Characteristic phrases, domain terms, formality level. | ✓ |
| Tone & emotional register | Warmth, authority, vulnerability, humour. | ✓ |
| Structural patterns | Argument building, transitions, stories, paragraphs, emphasis. | ✓ |

**User's choice:** All four features selected
**Notes:** None

### Domain Detection

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-detect + confirm | Detect domain, propose framework, user confirms. | ✓ |
| Always ask user | No auto-detection, always ask. | |
| Extract from content only | No user confirmation needed. | |

**User's choice:** Auto-detect + confirm
**Notes:** None

### Calibration Examples

| Option | Description | Selected |
|--------|-------------|----------|
| Extract from source | Actual passages as CORRECT, synthetic WRONG examples. | ✓ |
| All synthetic | Both CORRECT and WRONG generated synthetically. | |
| Source excerpts only | Source passages only, no WRONG examples. | |

**User's choice:** Extract from source
**Notes:** None

---

## Profile Output & Refinement

### Output Mode

| Option | Description | Selected |
|--------|-------------|----------|
| Draft with review gate | Generate, present summary, user approves/adjusts before saving. | ✓ |
| Ready to use | Generate and save directly. | |
| Interactive refinement loop | Present each section one at a time for feedback. | |

**User's choice:** Draft with review gate
**Notes:** None

### Profile Naming

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-name from content | Derive name from detected characteristics. | ✓ |
| Ask user for name | Prompt for a name. | |
| Use source folder name | Name after the source directory. | |

**User's choice:** Auto-name from content
**Notes:** None

### Update Support

| Option | Description | Selected |
|--------|-------------|----------|
| New profile only | Always creates fresh. Re-run for new profile. | ✓ |
| Merge mode | Take existing profile + new material, produce updated profile. | |
| Both modes | Support create-new and update-existing. | |

**User's choice:** New profile only
**Notes:** None

---

## Integration Model

### Invocation

| Option | Description | Selected |
|--------|-------------|----------|
| Standalone user-invocable | User runs directly, outside pipeline. | |
| Orchestrator-integrated | Orchestrator offers during setup. | |
| Both | Standalone AND orchestrator can suggest. | ✓ |

**User's choice:** Both
**Notes:** None

### Save Location

| Option | Description | Selected |
|--------|-------------|----------|
| Plugin references directory | Save to references/voice-profiles/. Immediately available. | ✓ |
| Book project directory | Project-specific, not reusable. | |
| User-specified path | Ask where to save. | |

**User's choice:** Plugin references directory
**Notes:** None

### Orchestrator Trigger Point

| Option | Description | Selected |
|--------|-------------|----------|
| During voice selection | Add as fifth option alongside existing four. | ✓ |
| Before pipeline starts | Offer as pre-pipeline step, always asked. | |
| Only when no custom profile exists | Suggest only when no profile provided. | |

**User's choice:** During voice selection
**Notes:** None

---

## Claude's Discretion

- Two-pass internal chunking strategy
- Confidence thresholds for INFERRED markers
- Handling contradictory voice signals across files
- Review summary detail level and formatting
- Auto-naming algorithm

## Deferred Ideas

- Genre-specific profile templates — after builder exists
- Profile merge/update mode — future enhancement
- Non-markdown input support — users convert before running
- Voice comparison tool — not in scope
