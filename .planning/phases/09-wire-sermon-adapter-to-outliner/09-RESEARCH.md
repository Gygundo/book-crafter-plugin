# Phase 9: Wire Sermon Adapter Output to Outliner - Research

**Researched:** 2026-03-28
**Domain:** Plugin skill integration (outliner SKILL.md text edits)
**Confidence:** HIGH

## Summary

This phase closes the last integration gap in the v1.0 pipeline: the outliner skill hardcodes `sources/` as its source directory in two places (Section 2 mode detection and Section 4.1 source reading), ignoring the `sources-adapted/` directory that the sermon adapter writes to in Stage 0.5. The orchestrator already passes a plain-text override instruction, but the outliner's SKILL.md has no logic to honour it.

The fix is a small, surgical edit to the outliner's SKILL.md -- adding `sources-adapted/` preference logic to Section 2 (mode detection) and Section 4 Step 1 (source file reading). No new files, no new skills, no new dependencies. The orchestrator already handles the full sermon-to-outliner handoff correctly; the outliner just ignores the adapted directory.

**Primary recommendation:** Edit two sections of `skills/outliner/SKILL.md` to check for `sources-adapted/` first, falling back to `sources/` when adapted content does not exist.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| OUTL-06 | Generate outline from existing content (sermon transcripts, notes, blog posts) by extracting themes and arguments | Outliner Section 2 + Section 4.1 must read from `sources-adapted/` when present so that sermon-adapted content feeds the outline generation |
| ENH-01 | Sermon-to-book input path -- converts sermon series into book chapters, adapting spoken rhythm to written rhythm | The full path (sermon adapter -> outliner -> writer) requires the outliner to consume `sources-adapted/` output, currently broken |
| ENH-02 | Sermon adaptation transforms: spoken fragments to complete sentences, audience-specific to universal references, verbal cues to written transitions, repetition-for-emphasis to revelation-for-emphasis | All 7 transformation rules are implemented in the sermon adapter; this phase ensures the outliner actually reads the transformed output |
</phase_requirements>

## Architecture Patterns

### Current Integration Flow (Broken)

```
Orchestrator Stage 0.5
  -> sermon-adapter reads sources/*.md
  -> sermon-adapter writes sources-adapted/*.md
  -> orchestrator passes text instruction to outliner: "read from sources-adapted/"

Orchestrator Stage 1
  -> outliner Section 2: checks sources/ directory (HARDCODED)
  -> outliner Section 4.1: reads from sources/ (HARDCODED)
  -> sources-adapted/ is IGNORED
```

### Target Integration Flow (Fixed)

```
Orchestrator Stage 0.5
  -> sermon-adapter reads sources/*.md
  -> sermon-adapter writes sources-adapted/*.md

Orchestrator Stage 1
  -> outliner Section 2: checks sources-adapted/ FIRST, falls back to sources/
  -> outliner Section 4.1: reads from sources-adapted/ if present, else sources/
  -> sermon-adapted content feeds the outline
```

### Exact Lines Requiring Change

**Section 2 (Mode Detection) -- lines 29-38 of outliner SKILL.md:**

Current:
```markdown
Check the project directory for source content:

- If a `sources/` directory exists and contains `.md`, `.txt`, or `.docx` files: use **Source Ingestion Mode** (section 4)
- If no source files are present: use **Topic Brief Mode** (section 3)

Log which mode is being used:
- "Mode: Topic Brief" -- generating outline from topic brief and metadata
- "Mode: Source Ingestion ([N] source files found)" -- synthesising outline from existing content
```

Must become a three-step check:
1. Check `sources-adapted/` first -- if it exists and contains files, use Source Ingestion Mode reading from `sources-adapted/`
2. Else check `sources/` -- if it exists and contains files, use Source Ingestion Mode reading from `sources/`
3. Else use Topic Brief Mode

Log must indicate which directory is being used:
- "Mode: Source Ingestion (adapted) ([N] files from sources-adapted/)" -- when adapted content exists
- "Mode: Source Ingestion ([N] files from sources/)" -- when only raw sources exist
- "Mode: Topic Brief" -- when no source files present

**Section 4 Step 1 (Source Reading) -- lines 119-121 of outliner SKILL.md:**

Current:
```markdown
### Step 1: Read and analyse all source files

Read all files from the `sources/` directory (`.md`, `.txt`, `.docx` files).
```

Must reference whichever directory was selected in Section 2 mode detection. Use a variable reference like "the source directory identified in Section 2" rather than hardcoding either path.

### Anti-Patterns to Avoid

- **Do NOT add a new skill or agent for this.** It is a text edit to an existing SKILL.md.
- **Do NOT change the orchestrator.** The orchestrator already passes the correct override instruction AND already checks for `sources-adapted/` in its state detection (Section 3, item 7). The only broken component is the outliner.
- **Do NOT change the sermon adapter.** It correctly writes to `sources-adapted/` with the `<!-- SERMON ADAPTED` metadata marker.
- **Do NOT change the directory structure or naming.** `sources-adapted/` is already the established convention used by both the orchestrator and the sermon adapter.
- **Do NOT make `sources-adapted/` the ONLY source.** The fallback to `sources/` is essential for the non-sermon path where users provide written content directly.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Source directory resolution | Complex directory-scanning logic | Simple two-line preference check (sources-adapted/ exists? use it : use sources/) | The pattern is trivially simple; overcomplicating it adds failure modes |

## Common Pitfalls

### Pitfall 1: Forgetting the Fallback

**What goes wrong:** Updating the outliner to read ONLY from `sources-adapted/`, breaking the non-sermon source ingestion path.
**Why it happens:** Focusing on the fix without considering the default case.
**How to avoid:** The logic must be: prefer `sources-adapted/` IF it exists AND contains files, ELSE fall back to `sources/`. Both paths must work.
**Warning signs:** Topic Brief or raw Source Ingestion Mode stops working after the edit.

### Pitfall 2: Inconsistent Directory Reference in Section 4

**What goes wrong:** Section 2 correctly resolves the source directory, but Section 4 still hardcodes `sources/` in other steps beyond Step 1.
**Why it happens:** Only fixing the obvious mention without checking the rest of Section 4.
**How to avoid:** Audit ALL references to `sources/` within the outliner SKILL.md. The Section 4 Step 5 "Source Material Notes" also references source files -- ensure it uses the correct directory.
**Warning signs:** Source Material Notes in the outline reference filenames from `sources/` when the actual content came from `sources-adapted/`.

### Pitfall 3: Breaking the Log Message Contract

**What goes wrong:** The mode detection log format changes in a way the orchestrator doesn't expect.
**Why it happens:** Changing the log format without checking what the orchestrator parses.
**How to avoid:** The orchestrator does NOT parse the log message programmatically -- it is informational text. But the log should still clearly indicate which directory is being used so debugging is straightforward.

## Code Examples

### Mode Detection Logic (Section 2 replacement)

```markdown
Check the project directory for source content, preferring adapted content when available:

1. If a `sources-adapted/` directory exists and contains `.md`, `.txt`, or `.docx` files: use **Source Ingestion Mode** (section 4) reading from `sources-adapted/`
2. Else if a `sources/` directory exists and contains `.md`, `.txt`, or `.docx` files: use **Source Ingestion Mode** (section 4) reading from `sources/`
3. If neither directory contains source files: use **Topic Brief Mode** (section 3)

Log which mode is being used:
- "Mode: Topic Brief" -- generating outline from topic brief and metadata
- "Mode: Source Ingestion (adapted, [N] source files from sources-adapted/)" -- using sermon-adapted content
- "Mode: Source Ingestion ([N] source files from sources/)" -- using raw source content
```

### Source Reading Logic (Section 4 Step 1 replacement)

```markdown
### Step 1: Read and analyse all source files

Read all files from the source directory identified in Section 2 (either `sources-adapted/` or `sources/`). Accept `.md`, `.txt`, or `.docx` files.

When reading from `sources-adapted/`, these files have already been transformed from spoken to written rhythm by the sermon adapter. The outliner should treat them as written prose -- do not apply any additional spoken-to-written transformations.
```

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual inspection (SKILL.md is a markdown instruction file, not executable code) |
| Config file | N/A |
| Quick run command | `grep -n "sources" skills/outliner/SKILL.md` |
| Full suite command | Visual diff of SKILL.md before/after |

### Phase Requirements to Test Map
| Req ID | Behaviour | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| OUTL-06 | Outliner reads from sources-adapted/ when present | manual-only | `grep "sources-adapted" skills/outliner/SKILL.md` | N/A -- text verification |
| ENH-01 | Sermon-to-book pipeline wired end-to-end | manual-only | Read outliner Section 2 + 4.1 for sources-adapted/ references | N/A |
| ENH-02 | Adapted content consumed by outliner | manual-only | Same as OUTL-06 -- if outliner reads from sources-adapted/, all 7 transforms are consumed | N/A |

### Sampling Rate
- **Per task commit:** `grep -c "sources-adapted" skills/outliner/SKILL.md` (should return >= 2 matches)
- **Per wave merge:** Visual review of full Section 2 and Section 4
- **Phase gate:** Verify the complete sermon flow narrative: orchestrator Stage 0.5 -> sources-adapted/ -> outliner reads sources-adapted/

### Wave 0 Gaps
None -- this is a SKILL.md text edit, not executable code. No test framework needed.

## Sources

### Primary (HIGH confidence)
- `skills/outliner/SKILL.md` -- Current outliner implementation, lines 29-38 (Section 2) and lines 119-121 (Section 4.1) hardcode `sources/`
- `skills/sermon-adapter/SKILL.md` -- Confirms adapter writes to `sources-adapted/` with `<!-- SERMON ADAPTED` metadata
- `skills/orchestrator/SKILL.md` -- Confirms orchestrator already handles `sources-adapted/` in state detection (Section 3 item 7) and Stage 0.5 notes (lines 319-350)
- `.planning/v1.0-MILESTONE-AUDIT.md` (in git at dc65388) -- Documents this exact gap as the sole broken integration point

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - no new dependencies, pure SKILL.md text edit
- Architecture: HIGH - both the problem and solution are fully documented in the audit report and existing skill files
- Pitfalls: HIGH - the pitfalls are straightforward and verifiable by text inspection

**Research date:** 2026-03-28
**Valid until:** Indefinite -- this is a one-time integration fix with no external dependencies
