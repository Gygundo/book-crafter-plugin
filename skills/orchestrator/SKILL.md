---
name: orchestrator
description: "Master pipeline controller for book writing. Use this skill whenever the user wants to write a book, create a book from sermons or notes, check book project status, resume an interrupted book project, or run the full book pipeline. Triggers on: 'write a book', 'book project', 'book status', 'resume book', 'book pipeline', 'create a book from', 'book crafter', 'start a book', 'new book', 'continue book'. Coordinates all stages: outline, research, write, edit, format."
allowed-tools: Read, Write, Bash, Grep, Glob, Agent
---

# Book Crafter Orchestrator

Master pipeline controller for the book-crafter plugin. This skill manages the entire book-writing lifecycle: creating new projects, detecting pipeline state, chaining sequential stages, spawning parallel chapter agents, and displaying progress dashboards.

## 1. Pipeline Overview

```
USER INPUT (topic brief OR existing content)
    |
    v
[ORCHESTRATOR] -- Main thread, controls entire pipeline
    |
    |-- Stage 0.5: SERMON ADAPTATION (sermon-adapter skill) [CONDITIONAL]
    |   Only runs when sermon-format sources detected
    |   Output: sources-adapted/
    |
    |-- Stage 1: OUTLINE (outliner skill)
    |   Output: chapter-outline.md, book-dna.md
    |   GATE: User approves outline before proceeding
    |
    |-- Stage 2: RESEARCH (researcher skill, parallel per-chapter)
    |   Output: research/ch01-research.md, research/ch02-research.md, ...
    |
    |-- Stage 3: WRITE (writer skill + chapter-writer agents, parallel per-chapter)
    |   Output: drafts/ch01-draft.md, drafts/ch02-draft.md, ...
    |
    |-- Stage 4: EDIT (editor skill + chapter-editor agents for large books)
    |   Output: edited/ch01-final.md, edited/ch02-final.md, ...
    |
    |-- Stage 4.5: ENRICH (enricher skill)
    |   Output: enrichments/ch01-enrichments.md, ..., front-matter/foreword.md
    |
    |-- Stage 5: FORMAT (formatter skill)
    |   Output: output/[Book Title].docx
```

All inter-stage communication happens via the filesystem. Each stage reads artefacts produced by prior stages and writes artefacts for subsequent stages. Book DNA (`book-dna.md`) is the shared context document that every agent reads for voice consistency.

## 2. On Trigger: Detect or Create Project

When the orchestrator activates:

1. Check for existing book projects in `~/Documents/Books/` by listing subdirectories
2. If the user mentions a specific project name, look for a matching directory
3. If no projects exist or the user wants a new book, proceed to project creation
4. If multiple projects exist, show them and ask which one to work with

### Creating a New Project

When creating a new project:

1. **Gather project details from the user:**
   - Book title (required)
   - Topic brief or description (required) -- can be a topic, a collection of sermon transcripts, notes, or an existing outline
   - Key themes (optional)
   - Target audience (optional)
   - Book size tier: `booklet` (<100 pages, 5-8 chapters), `short` (15-25K words, 8-12 chapters), or `standard` (40-60K words, 12-20 chapters). Default: `standard`
   - Voice profile (one of four options):
     - **Named profile**: A profile name from the plugin's voice library (e.g., "spiritual-default"). Looks up `${CLAUDE_PLUGIN_ROOT}/references/voice-profiles/[name].md`
     - **Custom file path**: An absolute or relative path to a `.md` voice profile file (e.g., "~/my-voices/academic.md")
     - **Inline description**: A plain-text description of the desired voice (e.g., "casual, conversational, like talking to a friend over coffee"). Will be expanded into a full profile.
     - **Not specified**: Defaults to `spiritual-default`

2. **Create the project directory structure:**

```
~/Documents/Books/[Book Title]/
├── book-dna.md              # Copied from ${CLAUDE_PLUGIN_ROOT}/references/book-dna-template.md
├── voice-profile.md         # Copied from selected voice profile
├── sources/               # User-provided source material (sermons, notes, blog posts)
├── research/                # Empty, populated in Stage 2
├── drafts/                  # Empty, populated in Stage 3
├── edited/                  # Empty, populated in Stage 4
├── revisions/               # Empty, for revision history in Stage 4
├── front-matter/            # Empty, populated in Stage 6
└── output/                  # Empty, .docx generated in Stage 5
```

3. **Populate book-dna.md:** Copy the template from `${CLAUDE_PLUGIN_ROOT}/references/book-dna-template.md` and fill in the Metadata section with:
   - Title from user input
   - Size tier from user selection
   - Created date (today)
   - Author name if provided

### Voice Profile Selection

Determine which voice input mode the user specified and process accordingly:

**Mode 1: Named profile** (user provides a name like "spiritual-default"):
1. Read `${CLAUDE_PLUGIN_ROOT}/references/voice-profiles/[name].md`
2. If file not found, list available profiles from `${CLAUDE_PLUGIN_ROOT}/references/voice-profiles/` (exclude `voice-profile-spec.md`) and ask user to choose
3. Copy file contents to `[project]/voice-profile.md`

**Mode 2: Custom file path** (user provides a file path ending in `.md`):
1. Read the file at the provided path
2. Validate against `${CLAUDE_PLUGIN_ROOT}/references/voice-profiles/voice-profile-spec.md`:
   - Check for required sections: Tone, Sentence Patterns, Vocabulary (with Use and Avoid subsections), Emphasis Techniques, Anti-Patterns
   - If any required section is missing: WARN the user which sections are missing, fill each missing section with "[Not specified -- using neutral, clear prose]" marked with <!-- DEFAULT -->
3. Write the (possibly augmented) profile to `[project]/voice-profile.md`

**Mode 3: Inline description** (user provides plain text that is not a file path):
1. Generate a full voice profile from the user's description by expanding it into the required sections:
   - **Tone**: Infer from the description (e.g., "casual" -> "Relaxed, conversational, approachable")
   - **Sentence Patterns**: Infer rhythm (e.g., "casual" -> shorter sentences, contractions, informal fragments)
   - **Vocabulary > Use**: Extract characteristic language from the description
   - **Vocabulary > Avoid**: Infer what breaks the described voice
   - **Emphasis Techniques**: Infer from the tone
   - **Anti-Patterns**: Infer what would violate the described voice
2. Mark each section with <!-- INFERRED --> to indicate it was generated, not user-specified
3. Write the generated profile to `[project]/voice-profile.md`
4. Show the generated profile to the user: "I've expanded your voice description into a full profile. Here's what I've inferred -- let me know if you'd like to adjust anything before we continue."

**Mode 4: Not specified** (user did not mention voice):
1. Use `${CLAUDE_PLUGIN_ROOT}/references/voice-profiles/spiritual-default.md`
2. Copy to `[project]/voice-profile.md`
3. Inform the user: "Using the default spiritual/theological voice profile. You can change this later by providing a different voice profile."

4. **Handle source material:** If the user provides source content (file paths, sermon transcripts, notes), copy or save them to `[project]/sources/`. If the user provides file paths, copy the files. If the user provides inline content, save each piece as a numbered file (source-01.md, source-02.md, etc.). The outliner will auto-detect source files and switch to Source Ingestion Mode.

5. **Confirm creation:** Show the user the created directory structure and the populated book-dna.md metadata, then proceed to the status dashboard.

6. **Detect sermon format (conditional):** After source files are saved, scan the source files for sermon format indicators:
   - ALL CAPS headings
   - Audience-directed pronouns ("we", "us", "you" as congregation address)
   - Verbal cues ("Let me tell you", "Watch this", "Here's where it gets good")
   - Temporal references ("this morning", "last Sunday")
   - Spatial references ("here in this room", "in our church")
   If 3+ indicators found across all source files, ask the user:
   "These source files appear to be sermon transcripts. Should I adapt them from spoken to written rhythm before generating the outline?"
   If confirmed, flag the project for Stage 0.5 execution.
   If the user explicitly stated the source is a sermon series (e.g., "convert my sermons to a book"), skip detection and flag directly.

### Detecting an Existing Project

If a project directory already exists, scan for pipeline state using the detection algorithm in section 3.

## 3. Pipeline State Detection

Scan the project directory to determine the current pipeline state. This is the resume logic that allows interrupted work to continue.

### Detection Algorithm

Work backwards from the most advanced stage:

```
1. Check for output/*.docx
   -> If exists: pipeline is COMPLETE

1.5. Check for enrichments/ch*-enrichments.md AND front-matter/foreword.md
   -> If enrichment file count matches chapter count AND foreword.md exists: Stage 4.5 COMPLETE
   -> If enrichment count > 0 but less than chapter count: Stage 4.5 PARTIALLY COMPLETE
   -> If no enrichments but edited files exist with no revision marker: Stage 4.5 NOT STARTED (proceed to Stage 4.5)

2. Check for edited/ch*-final.md
   -> If count matches outline chapter count:
      -> Check reports/consistency-report.md for <!-- REVISION IN PROGRESS --> marker:
         -> If marker present: Stage 4 IN REVIEW (revisions in progress)
         -> If no marker: Stage 4 COMPLETE
   -> If count > 0 but less than expected: Stage 4 PARTIALLY COMPLETE

3. Check for drafts/ch*-draft.md
   -> If count matches outline chapter count: Stage 3 COMPLETE
   -> If count > 0 but less than expected: Stage 3 PARTIALLY COMPLETE

4. Check for research/ch*-research.md
   -> If count matches outline chapter count: Stage 2 COMPLETE
   -> If count > 0 but less than expected: Stage 2 PARTIALLY COMPLETE

5. Check for chapter-outline.md with <!-- APPROVED --> marker
   -> If marker present: Stage 1 COMPLETE

6. Check for chapter-outline.md without <!-- APPROVED --> marker
   -> Stage 1 IN PROGRESS (outline exists but needs user approval)

7. Check for sources-adapted/ directory with files
   -> If exists AND sources/ also exists: Stage 0.5 COMPLETE (proceed to Stage 1 using sources-adapted/)
   -> If sources/ exists with sermon indicators but no sources-adapted/: Stage 0.5 NEEDED

8. None of the above
   -> Pipeline NOT STARTED (proceed to Stage 1)
```

### Chapter Count Extraction

To determine the expected chapter count, read `chapter-outline.md` and count lines matching the pattern `## Chapter` (chapter heading markers). This count is used to verify whether a stage has processed all chapters or only some.

### Partial Completion Handling

When a stage directory exists but the file count does not match the outline's chapter count:

1. The stage is **PARTIALLY COMPLETE**
2. Identify which specific chapters are missing by comparing existing filenames against the expected sequence (ch01, ch02, ..., chNN)
3. Report the gap: e.g., "Research: 8/12 chapters complete, missing ch09, ch10, ch11, ch12"
4. When resuming, only process the missing chapters -- do not redo completed ones

### Determining Next Action

After scanning, the orchestrator identifies the **first incomplete stage** and offers to continue from there:

- If a stage is PARTIALLY COMPLETE, resume within that stage (process missing chapters)
- If a stage is fully COMPLETE, advance to the next stage
- If the pipeline is COMPLETE, report finished status

## 4. Status Dashboard

Display the current pipeline status using this format:

```
## Book Pipeline: [Book Title]
Directory: ~/Documents/Books/[Book Title]/

### Pipeline Status

[ ] Stage 0.5: Sermon Adaptation (sermon-adapter) [only shown when sources/ contains sermon-format content]
    Adapted: [date] | Source files: [N]

[x] Stage 1: Outline (outliner)
    Generated: [date] | Chapters: [n] | Approved: Yes/No

[~] Stage 2: Research (researcher) -- [x]/[n] chapters
    [x] ch01-research.md
    [x] ch02-research.md
    [ ] ch03-research.md
    ...

[ ] Stage 3: Writing (writer) -- 0/[n] chapters

[ ] Stage 4: Editing (editor)
    [ ] Voice consistency pass
    [ ] Flow/transition pass
    [ ] Cross-chapter validation
    [ ] Review gate

When Stage 4 is in review (revisions requested), display:

[~] Stage 4: Editing (editor) -- IN REVIEW
    [x] Voice consistency pass
    [x] Flow/transition pass
    [x] Cross-chapter validation
    [~] Revision requested: Ch 3, Ch 7

[ ] Stage 4.5: Content Enrichment (enricher)
    [ ] Discussion questions: 0/[N] chapters
    [ ] Chapter summaries: 0/[N] chapters
    [ ] Prayer points: 0/[N] chapters [or "N/A -- non-theological"]
    [ ] Foreword: pending

[ ] Stage 5: Formatting (formatter)
    [ ] .docx generation

### Progress: [x]/5 stages complete
### Next: [Next stage name and what it will do]
```

**Status markers:**
- `[x]` -- stage fully complete
- `[~]` -- stage partially complete (some chapters done)
- `[ ]` -- stage not started

For partially complete stages, list each chapter's status individually so the user can see exactly what remains.

## 5. Stage Execution

When executing the next stage in the pipeline:

### Step 1: Identify the Next Stage

Use the state detection algorithm (section 3) to determine which stage to run next.

### Step 2: Check Skill Implementation Status

Before invoking a stage skill, read its SKILL.md and check for the `[STUB` marker. If the skill contains `[STUB`:

> "Stage [N]: [Name] is not yet implemented. It will be available in a future phase. The pipeline pauses here until that skill is built."

Do not attempt to execute a stub skill. Report which stage is blocking and what it will do when implemented.

### Step 3: Invoke the Stage Skill

For implemented stages, invoke the appropriate skill with the project directory path as context:

- **Stage 1 (Outline):** Invoke the outliner skill with the topic brief and voice profile
- **Stage 2 (Research):** Loop through chapters sequentially, invoking the researcher skill per chapter (see Stage 2 notes below)
- **Stage 3 (Write):** Spawn chapter-writer subagents in parallel (see below)
- **Stage 4 (Edit):** Invoke the editor skill with all drafted chapters
- **Stage 5 (Format):** Invoke the formatter skill with all edited chapters

### Step 4: Post-Stage Update

After a stage completes:

1. Re-scan pipeline state to confirm completion
2. Display the updated status dashboard
3. If in Full Pipeline mode, automatically proceed to the next stage
4. If in Guided mode, ask the user before proceeding

### Stage-Specific Orchestration Notes

#### Stage 0.5: Sermon Adaptation (Conditional)

This stage only runs when the project has source files flagged as sermon format (either by auto-detection or explicit user indication).

**Step 1: Verify sermon adaptation is needed**

Check if `sources-adapted/` already exists with files:
- If exists and file count matches `sources/`: Stage 0.5 already complete, skip to Stage 1
- If not: proceed with adaptation

**Step 2: Invoke the sermon adapter**

Invoke the `book-crafter:sermon-adapter` skill with argument:
- Project directory path: `[project_directory]`

The sermon adapter will read all `.md` files from `sources/`, apply spoken-to-written transformations, and write adapted files to `sources-adapted/`.

**Step 3: Verify adaptation output**

1. Check that `sources-adapted/` directory exists: `ls [project_directory]/sources-adapted/ 2>/dev/null`
2. Count adapted files and compare to source file count
3. Verify each adapted file contains the `<!-- SERMON ADAPTED` metadata marker
4. Display: "Stage 0.5 complete: [N] sermon source files adapted for book format"

**Step 4: Update outliner source path**

When proceeding to Stage 1, the outliner's Source Ingestion Mode will auto-detect `sources/`. However, when `sources-adapted/` exists, the orchestrator must tell the outliner to read from `sources-adapted/` instead. Pass this as an additional argument to the outliner invocation:
- Source directory override: `[project_directory]/sources-adapted/`

Update the Stage 1 outliner invocation to include:
"Source material is in `sources-adapted/` (sermon-adapted versions). Use these files instead of the raw `sources/` directory."

#### Stage 1: Outline

**Step 1: Invoke the outliner**

Invoke the `book-crafter:outliner` skill with the project directory path. The outliner will:
- Read book-dna.md metadata and voice-profile.md from the project directory
- Auto-detect mode (Topic Brief if no sources/ directory, Source Ingestion if sources/ exists)
- Generate chapter-outline.md with structured per-chapter metadata

If `sources-adapted/` exists in the project directory, include in the outliner invocation:
"Source material has been adapted from sermon format. Read from sources-adapted/ instead of sources/."

**Step 2: Present outline for review**

After the outliner produces `chapter-outline.md`:

1. Present the full outline to the user, highlighting:
   - Book arc (the narrative progression)
   - Size tier and calculated word targets
   - Chapter count and momentum position distribution
   - Any cross-chapter connections
2. Ask explicitly: "Does this outline look good? I can adjust specific chapters, change the structure, or regenerate entirely. Once approved, I'll generate the Book DNA and proceed to research."

**Step 3: Approval gate**

3. On **approval**:
   a. Add `<!-- APPROVED -->` marker to the top of `chapter-outline.md`
   b. Re-invoke the outliner for Book DNA generation (the outliner's Section 6 handles this)
   c. Verify `book-dna.md` has been populated (check that Chapter Map table has rows)
   d. Proceed to Stage 2
4. On **rejection with feedback**:
   a. Pass the user's specific feedback to the outliner
   b. The outliner revises the outline (it reads the existing chapter-outline.md and applies changes)
   c. Return to Step 2 to present the revised outline
5. On **request to modify specific chapters**:
   a. The user may ask to change specific chapters without regenerating the entire outline
   b. Pass the modification request to the outliner
   c. Return to Step 2

The outline approval gate prevents wasting time and tokens generating content from a flawed structure. This gate is NEVER skipped, even in Full Pipeline mode.

#### Stage 2: Research (Sequential Per-Chapter)

Research runs sequentially -- one chapter at a time -- because each chapter's research is fast (Claude generating from knowledge, not fetching from external APIs). Sequential execution is simpler and avoids race conditions.

**Step 1: Read the approved outline**

Read `chapter-outline.md` and extract the chapter count and per-chapter metadata. Verify the `<!-- APPROVED -->` marker is present.

**Step 2: Identify chapters needing research**

Check `research/` directory for existing `ch[NN]-research.md` files. If resuming a partial run, only process chapters without existing research files.

**Step 3: Loop through each chapter sequentially**

For each chapter that needs research:

1. Invoke the `book-crafter:researcher` skill with arguments:
   - Project directory path
   - Chapter number
2. Verify the output file exists at `research/ch[NN]-research.md`
3. Verify the file contains the `<!-- RESEARCH COMPLETE: Chapter [N] -->` marker
4. Report progress: "Research complete: [current]/[total] chapters"

**Step 4: Verify research completeness**

After all chapters are processed:
1. Count `research/ch[NN]-research.md` files
2. Confirm count matches the chapter count from the outline
3. Display: "Stage 2 complete: Research gathered for all [N] chapters"
4. Proceed to Stage 3 (or show dashboard in Guided mode)

#### Stage 3: Write (Parallel Chapter Writing)

Spawn chapter-writer subagents in parallel using the Agent tool.

**Batching strategy by book size:**
- **Booklet (5-8 chapters):** Single wave, all chapters at once
- **Short (8-12 chapters):** Two waves of 4-6 chapters each
- **Standard (12-20 chapters):** Three to four waves of 4-6 chapters each

Wave 1: First 4-6 chapters (spawn agents simultaneously)
Wave 2: Next batch after Wave 1 completes
Continue until all chapters are written.

**Agent invocation:** Each chapter-writer subagent receives this prompt:

```
Write Chapter [N] of "[Book Title]"

Project directory: [project_directory]
Book DNA: [project_directory]/book-dna.md
Voice profile: [project_directory]/voice-profile.md
Chapter outline section: [paste the specific ## Chapter N section from chapter-outline.md]
Research notes: [project_directory]/research/ch[NN]-research.md
Output path: [project_directory]/drafts/ch[NN]-draft.md
Target word count: ~[N] words
Momentum position: [Foundation/Building/Accelerating/Climax/Landing]
```

Each chapter-writer agent uses the `chapter-writer` subagent definition from `${CLAUDE_PLUGIN_ROOT}/agents/chapter-writer.md`, which preloads the `book-crafter:writer` skill.

**Post-wave verification:** After each wave completes, verify all expected `drafts/ch[NN]-draft.md` files exist and contain the `<!-- METADATA` block. Report any missing chapters and retry them before starting the next wave.

**Completion check:** After all waves, count draft files and confirm they match the outline chapter count. Display: "Stage 3 complete: [N]/[N] chapters drafted. Proceeding to Stage 4."

**Critical:** Book DNA is READ-ONLY during parallel writing. No agent updates shared files. Updates happen between stages only.

#### Stage 4: Edit (Voice Consistency + Flow + Validation + Review)

**Step 1: Invoke the editor**

Invoke the `book-crafter:editor` skill with arguments:
- Project directory path
- Edit mode: "full"

The editor performs three sequential passes:
1. Pass 1: Voice consistency + theological guardrails (each chapter audited against voice profile)
2. Pass 2: Flow/transitions (sequential chapter-pair analysis, only modifies endings/openings)
3. Pass 3: Cross-chapter validation (term index, reference validation, scripture consistency, theme tracking)

For books with 16+ chapters, the editor uses chapter-editor subagents with rolling window for Pass 1. Passes 2 and 3 are always handled by the main editor skill.

**Step 2: Verify editing output**

After the editor returns:
1. Verify `edited/ch[NN]-final.md` files exist for all chapters (count matches outline)
2. Verify `reports/consistency-report.md` exists
3. Read the editor's return summary for the overview metrics

**Step 3: Review gate (ITER-02)**

Present the draft review to the user:

```
## Draft Review: [Book Title]

Your manuscript is ready for review.

### Summary
- **Chapters:** [N]
- **Total words:** [sum of word counts from METADATA blocks in edited files]
- **Voice consistency:** [Clean/Minor/Significant] ([X] issues found, [Y] auto-resolved)
- **Transitions:** [X]/[N-1] transitions smooth
- **Cross-references:** [X] validated, [Y] flagged

### Consistency Report
See: [project_directory]/reports/consistency-report.md

### Options
1. **Approve** -- proceed to formatting (Stage 5)
2. **Revise chapters** -- tell me which chapters need rewriting and what to change
3. **Read full draft** -- I'll compile all chapters for you to read through

Which would you like?
```

**On Option 1 (Approve):** Proceed to Stage 4.5 (Content Enrichment).

**On Option 2 (Revise chapters -- ITER-03, ITER-04, ITER-05):**

For each chapter the user wants revised:

a. **Version backup (ITER-05):** Before overwriting, copy the current draft to `revisions/`:
   - Scan `revisions/` for existing `ch[NN]-v*-draft.md` files using `ls revisions/ch[NN]-v*-draft.md 2>/dev/null | sort -V | tail -1`
   - If no existing versions, this is v01. If highest is v02, next is v03.
   - Copy `drafts/ch[NN]-draft.md` to `revisions/ch[NN]-v[VV]-draft.md`

b. **Re-invoke writer:** Spawn a chapter-writer subagent with the user's feedback appended to the standard arguments. The writer produces a new `drafts/ch[NN]-draft.md`.

c. **Re-invoke editor in revision mode:** Invoke `book-crafter:editor` with:
   - Project directory path
   - Edit mode: "revision"
   - Chapters to edit: [the revised chapter number]
   The editor runs Pass 1 on the revised chapter, Pass 2 on the revised chapter + its immediate neighbours (one hop only -- ITER-04), and targeted Pass 3 validation.

d. **Update consistency report:** The editor updates `reports/consistency-report.md` with revision results.

e. **Add revision marker:** If revisions are in progress, add `<!-- REVISION IN PROGRESS -->` to the top of `reports/consistency-report.md`. Remove the marker when all requested revisions are complete.

f. **Return to review gate:** After all requested revisions complete, present the updated review summary. The user can approve, request more revisions, or read the full draft.

**On Option 3 (Read full draft):**
Compile all `edited/ch[NN]-final.md` files into a single markdown document and present it to the user (or tell them the file paths to read). Then return to the review gate.

#### Stage 4.5: Content Enrichment

**Step 1: Verify readiness**

1. Confirm Stage 4 is COMPLETE: all `edited/ch[NN]-final.md` files exist AND `reports/consistency-report.md` exists AND no `<!-- REVISION IN PROGRESS -->` marker
2. Check if `enrichments/` already has all expected files (resume logic)

**Step 2: Invoke the enricher**

Invoke the `book-crafter:enricher` skill with argument:
- Project directory path: `[project_directory]`

The enricher will:
1. Read all `edited/ch[NN]-final.md` files and `book-dna.md`
2. Determine if the book is theological (from voice profile)
3. Generate per-chapter enrichments (discussion questions, summaries, prayer points if theological)
4. Generate a foreword in `front-matter/foreword.md`

**Step 3: Verify enrichment output**

After the enricher returns:
1. Count `enrichments/ch[NN]-enrichments.md` files -- must match chapter count
2. Verify each enrichment file contains the `<!-- ENRICHMENT METADATA` marker
3. Verify `front-matter/foreword.md` exists and contains `<!-- FOREWORD METADATA` marker
4. Display: "Stage 4.5 complete: [N] chapter enrichments + foreword generated"

**Step 4: Proceed to Stage 5**

Proceed to Stage 5 (Format). No approval gate for enrichments -- users can request revision through Mode 5 after reviewing the .docx.

#### Stage 5: Format

**Step 1: Verify readiness**

1. Confirm Stage 4 is COMPLETE: all `edited/ch[NN]-final.md` files exist AND `reports/consistency-report.md` exists AND no `<!-- REVISION IN PROGRESS -->` marker
2. Confirm `book-dna.md` exists in the project directory
3. Create `output/` directory if it does not exist: `mkdir -p [project_directory]/output`
4. Confirm Stage 4.5 is COMPLETE: `enrichments/` has files matching chapter count AND `front-matter/foreword.md` exists

**Step 2: Invoke the formatter**

Invoke the `book-crafter:formatter` skill with argument:
- Project directory path: `[project_directory]`

The formatter will:
1. Read `book-dna.md` for metadata (title, subtitle, author, chapter count, key terms, style rules)
2. Read `voice-profile.md` for spelling conventions
3. Read all `edited/ch[NN]-final.md` files
4. Generate a Node.js script using docx-js that assembles the complete .docx
5. Execute the script to produce `output/[Book Title].docx`
6. Read all `enrichments/ch[NN]-enrichments.md` files for per-chapter discussion questions, summaries, and prayer points
7. Read `front-matter/foreword.md` for the foreword

**Step 3: Verify output**

After the formatter returns:
1. Check that `output/` directory contains a `.docx` file: `ls output/*.docx 2>/dev/null`
2. Verify the file is > 0 bytes: `test -s output/*.docx`
3. Report file size: `ls -lh output/*.docx`
4. If validation script is available, run it: `python scripts/office/validate.py output/*.docx` (optional -- do not fail if script not found)

**Step 4: Report completion**

Display:
```
## Pipeline Complete: [Book Title]

Your book has been formatted and exported.

Output: [project_directory]/output/[Book Title].docx
Size: [file size]
Chapters: [N]

Front matter: Half title, Title page, Copyright, Dedication, Foreword, Table of Contents
Per chapter: Discussion Questions, Chapter Summary, Prayer Points (theological only)
Back matter: About the Author, Scripture Index, Glossary

Note: When you open the .docx in Word, you may see "Update fields?" -- click Yes to populate the Table of Contents.

The book pipeline is now complete. You can:
1. Open the .docx in Microsoft Word or Google Docs
2. Request revisions to specific chapters (use Mode 5)
3. Start a new book project
```

Update the **Status Dashboard** (Section 4) to show the completed format:
```
[x] Stage 5: Formatting (formatter)
    Generated: [date] | File: [filename] | Size: [size]
```

No changes needed to Section 3 (State Detection) since `output/*.docx` detection is already implemented.

## 6. Execution Modes

### Mode 1: Guided (Default)

The default interaction mode. The orchestrator:

1. Shows the status dashboard
2. Explains what the next stage does and what it will produce
3. Asks for confirmation before proceeding
4. Reports results after each stage completes
5. Pauses at approval gates (outline review)

Use this mode when the user wants oversight of each stage.

### Mode 2: Full Pipeline ("write the whole book")

Triggered when the user says "write the whole book", "full pipeline", "run everything", or "generate the complete book":

1. Create project if needed (gather details first)
2. Execute each stage in sequence, automatically advancing
3. **Always pause** at the outline approval gate -- this is never skipped
4. Report progress after each stage completes
5. Stop at the first stub skill encountered (do not skip stages)
6. Display final dashboard when complete or blocked

### Mode 3: Resume ("continue", "resume", "pick up where we left off")

Triggered when the user wants to continue interrupted work:

1. Detect pipeline state via the detection algorithm
2. Show the status dashboard with current progress
3. Identify the next incomplete stage or partially complete stage
4. Offer to continue: "You're at Stage [N]. Would you like me to continue from here?"
5. If a stage is partially complete, specify which chapters remain

### Mode 4: Status Only ("book status", "where am I", "show progress")

Show the dashboard only. Do not execute anything.

1. Detect pipeline state
2. Display the full status dashboard
3. Report the next action that would be taken if the user chooses to continue

### Mode 5: Revision ("revise chapter 3", "rewrite chapters 5 and 7")

Triggered when the user requests revision of specific chapters on an existing project:

1. Detect pipeline state -- verify Stage 4 is COMPLETE or IN REVIEW
2. Parse chapter numbers from the user's request (e.g., "revise chapter 3" -> [3], "rewrite chapters 5 and 7" -> [5, 7])
3. Gather the user's feedback for each chapter (what to change, what's wrong, what they want instead)
4. Execute the revision workflow for each chapter:
   a. Version backup: copy current `drafts/ch[NN]-draft.md` to `revisions/ch[NN]-v[VV]-draft.md`
   b. Re-invoke writer: spawn chapter-writer subagent with user feedback appended to standard arguments
   c. Re-invoke editor in revision mode: `book-crafter:editor` with mode "revision" and the revised chapter numbers
   d. Editor runs Pass 1 on revised chapters, Pass 2 on revised chapters + immediate neighbours (one hop), targeted Pass 3
   e. Update `reports/consistency-report.md` with revision results
5. Return to the review gate (present updated summary with approve/revise/read options)

## 7. Error Handling

Handle these common situations gracefully:

### Project Not Found
> "No book project found at ~/Documents/Books/[name]. Would you like to create a new project?"

### Outline Not Approved
> "The outline for '[Book Title]' hasn't been approved yet. Please review chapter-outline.md and let me know if you'd like to approve it or request changes."

### Stub Skill Encountered
> "Stage [N] ([skill name]) is not yet implemented. It will be available in a future phase. The pipeline pauses here."

List which stages are currently implemented and which are stubs.

### Partial Stage Completion
> "Stage [N] is partially complete: [x]/[n] chapters processed. Missing: [list of missing chapter numbers]. Would you like to resume and complete the remaining chapters?"

### Missing Dependencies
If a stage's expected input files are missing (e.g., trying to write without research):

> "Cannot start Stage [N] ([name]). Required input files are missing:
> - Expected: [list of expected files]
> - Found: [list of existing files]
> - Missing: [list of missing files]
>
> You may need to re-run Stage [N-1] first."

### Revision Without Editing
If the user requests revision but Stage 4 has not yet run:

> "The manuscript hasn't been edited yet. Let me run the editing passes first, and then you can review and request revisions."

### No Books Directory
If `~/Documents/Books/` does not exist, create it when the user starts a new project. Do not require the user to create it manually.

### Empty Project
If a project directory exists but contains no artefacts (no outline, no book-dna.md):

> "The project '[Book Title]' exists but has no content yet. Starting from Stage 1 (Outline)."

## 8. Reference File Paths

The orchestrator uses these paths for plugin resources and project files:

```
Plugin root:         ${CLAUDE_PLUGIN_ROOT}
Pipeline stages ref: ${CLAUDE_PLUGIN_ROOT}/references/pipeline-stages.md
Book DNA template:   ${CLAUDE_PLUGIN_ROOT}/references/book-dna-template.md
Voice profiles dir:  ${CLAUDE_PLUGIN_ROOT}/references/voice-profiles/
Default voice:       ${CLAUDE_PLUGIN_ROOT}/references/voice-profiles/spiritual-default.md
Subagent defs:       ${CLAUDE_PLUGIN_ROOT}/agents/chapter-writer.md
                     ${CLAUDE_PLUGIN_ROOT}/agents/chapter-editor.md
Stage skills:        ${CLAUDE_PLUGIN_ROOT}/skills/sermon-adapter/SKILL.md
                     ${CLAUDE_PLUGIN_ROOT}/skills/outliner/SKILL.md
                     ${CLAUDE_PLUGIN_ROOT}/skills/researcher/SKILL.md
                     ${CLAUDE_PLUGIN_ROOT}/skills/writer/SKILL.md
                     ${CLAUDE_PLUGIN_ROOT}/skills/editor/SKILL.md
                     ${CLAUDE_PLUGIN_ROOT}/skills/enricher/SKILL.md
                     ${CLAUDE_PLUGIN_ROOT}/skills/formatter/SKILL.md
Default project dir: ~/Documents/Books/
```

When referencing plugin files, always use `${CLAUDE_PLUGIN_ROOT}` -- never hardcode absolute paths. This ensures the plugin works regardless of installation method (marketplace, --plugin-dir, or user plugin directory).
