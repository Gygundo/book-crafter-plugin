---
name: editor
description: "Audit voice consistency, flow, and transitions across all chapters. Called by the orchestrator during the editing stage of the book pipeline."
user-invocable: false
allowed-tools: Read, Write, Bash, Grep, Glob
---

# Book Editor

Three-pass sequential editing pipeline that transforms individually-written chapter drafts into a cohesive manuscript. Each pass builds on the previous pass's output: voice normalisation first, then flow/transitions, then cross-chapter validation. The result is a manuscript that reads as one voice with seamless transitions and validated cross-references.

## 1. On Invocation

Receive via `$ARGUMENTS`:
- **Project directory path** -- the book project root
- **Edit mode** -- "full" (all three passes on all chapters) or "revision" (targeted re-edit of specific chapters)
- **Chapters to edit** -- (optional, for revision mode only) list of chapter numbers to re-edit

**Step 1: Read Book DNA**

Read `[project_directory]/book-dna.md` for:
- Voice profile summary (tone, sentence rhythm, vocabulary, emphasis techniques)
- Theological/domain framework (the interpretive lens for content decisions)
- Chapter map (chapter positions, connections, momentum positions)
- Running themes (themes to track across chapters)
- Key terms (terminology that must be consistent)
- Cross-chapter continuity notes (callbacks, foreshadowing, running metaphors)

**Step 2: Read Voice Profile**

Read `[project_directory]/voice-profile.md` for detailed voice rules. Pay particular attention to:
- **Tone** -- the overall tonal quality to enforce
- **Sentence Patterns** -- average sentence length target, fragment frequency, rhetorical question usage
- **Vocabulary > Use** -- words and phrases characteristic of this voice
- **Vocabulary > Avoid** -- words and phrases that break this voice (hard constraint)
- **Emphasis Techniques** -- how the voice creates impact
- **Anti-Patterns** -- behaviours that break the voice (hard constraint)
- **Theological Framework** -- (if present) the interpretive lens for theological content

**Step 3: Read Chapter Outline**

Read `[project_directory]/chapter-outline.md` for:
- Total chapter count
- Momentum positions per chapter (Foundation, Building, Accelerating, Climax, Landing)
- Cross-chapter connections specified in the outline

**Step 4: Count Chapters**

```bash
ls [project_directory]/drafts/ch*-draft.md | wc -l
```

**Step 5: Determine Editing Strategy**

- **15 or fewer chapters:** The editor reads all chapters directly. No subagents needed for Pass 1.
- **16+ chapters:** Use `chapter-editor` subagents with rolling window for Pass 1 (see Section 5).

Pass 2 and Pass 3 are ALWAYS handled by the main editor skill, regardless of chapter count.

**Step 6: Create Output Directories**

```bash
mkdir -p [project_directory]/edited [project_directory]/reports
```

## 2. Pass 1 -- Voice Consistency + Theological Guardrails

**Purpose:** Normalise each chapter's voice against the profile. This pass runs FIRST because subsequent passes need voice-normalised text.

**Requirements addressed:** EDIT-01 (voice consistency), EDIT-03 (theological guardrails)

For each chapter (parallel via subagents if 16+ chapters, sequential otherwise):

### 2.1 Vocabulary Audit

Scan the full chapter text for words and phrases from the voice profile's Avoid list. Use case-insensitive matching.

Flag every occurrence with:
- Approximate line location
- The specific phrase found
- Which Avoid rule it violates

**Common Avoid-list patterns for spiritual-default voice:**
- Academic hedging: "some scholars believe", "it could possibly mean", "there is a view that"
- Religious cliches: "God won't give you more than you can handle", "everything happens for a reason"
- Filler phrases: "In conclusion", "Furthermore", "It is important to note that"
- Passive voice: any sentence where active voice is possible
- Em dashes: replace with regular hyphens with spaces or restructure the sentence

### 2.2 Sentence Length Distribution

Count words per sentence (split on `.`, `!`, `?` boundaries). Calculate:
- **Average sentence length** across the chapter
- **Fragment percentage** -- sentences with 8 or fewer words as a percentage of all sentences

Compare against voice profile targets:
- Target average: 12-18 words (for spiritual-default)
- Frequent shorter fragments: 3-8 words

Flag chapters whose average sentence length deviates by more than 4 words from the profile target range (i.e., average below 8 or above 22 for spiritual-default).

### 2.3 Anti-Pattern Detection

Check for each anti-pattern listed in the voice profile's Anti-Patterns section AND the Theological Framework section (for theological books).

**Specific checks for spiritual-default:**

| Anti-Pattern | Detection | Example |
|-------------|-----------|---------|
| Academic hedging | Phrases that qualify or soften claims unnecessarily | "some scholars believe", "it could possibly mean", "there is a view that", "it is important to note" |
| Religious cliches | Overused phrases that lack depth | "God won't give you more than you can handle", "everything happens for a reason", "let go and let God" |
| Passive voice | Sentences where the subject receives the action | "was established by God" instead of "God established" |
| Performance-based guilt | Language that places the burden on human effort | "you need to pray more", "you should be doing", "if you just had enough faith" |
| Cessationist framing | Implying spiritual gifts have ceased | "in Bible times", "gifts were for the early church", "those things don't happen anymore" |
| AI voice indicators | Overly balanced, hedged, or neutral tone | "various perspectives", "many Christians believe", "some would argue", "it's important to consider" |
| Surface-level observations | Stating what a verse says without uncovering deeper meaning | Simply restating the verse text without word studies, cross-references, or revelation |

For non-theological voice profiles, skip the theological-specific patterns (performance-based guilt, cessationist framing) and check only the patterns listed in that profile's Anti-Patterns section.

### 2.4 Pacing Variety Score

Measure paragraph length distribution across the chapter. Count the number of sentences per paragraph and categorise:
- **Short** (1-2 sentences): impact paragraphs, dramatic beats
- **Medium** (3-4 sentences): explanation, argument development
- **Long** (5-6 sentences): storytelling, scene-setting, extended illustrations

Calculate the dominant category percentage. Flag the chapter if 80% or more paragraphs fall in a single category.

**Scoring:**
- 2 points: Good mix (no category exceeds 60%)
- 1 point: Some variety (dominant category 60-80%)
- 0 points: Monotone (dominant category 80%+)

**Detection approach:** Split chapter text on blank lines to get paragraphs. Count sentences per paragraph (split on `.`, `!`, `?`). Categorise each paragraph. Calculate distribution.

### 2.5 Emotional Connection Audit

Check for the presence of personal stories, anecdotes, or vulnerability markers in the chapter. Look for indicators:
- Personal pronouns in narrative context: "I remember", "I recall", "I was", "I felt"
- Vulnerability phrases: "I didn't understand", "I failed", "I struggled", "I was wrong"
- Story markers: "there was a time", "picture this", "let me tell you about", "imagine"
- Scene-setting language: specific places, times, sensory details

Flag the chapter if NO vulnerability or personal story markers are found. Every chapter needs at least one human-experience moment per D-13.

**Scoring:**
- 2 points: Personal story/vulnerability present with specific detail
- 1 point: Some emotional connection (general references but no specific story)
- 0 points: No personal stories, anecdotes, or vulnerability markers found

**Soft threshold for teaching-heavy chapters:** A chapter in a "Building" momentum position with complex theological content may score 1 point here without triggering a rewrite. Only score 0 triggers a "significant" flag.

### 2.5.5 Reader Engagement Scoring

Count instances of direct reader engagement language in the chapter:
- "you" / "your" / "yourself" used in direct address (not quoting scripture)
- Rhetorical questions (sentences ending in `?` that are not scripture)
- "imagine" / "picture" / "consider" as direct invitations

**Scoring:**
- 2 points: Frequent engagement (10+ instances per chapter)
- 1 point: Occasional engagement (3-9 instances)
- 0 points: Absent or rare (0-2 instances)

### 2.6 Tone Normalisation

For each flagged passage:
1. Rewrite to match the voice profile while preserving the argument and scripture references
2. Replace Avoid-list vocabulary with Use-list alternatives
3. Convert passive voice to active voice
4. Sharpen hedged language into direct declarations
5. Maintain the original meaning -- change the voice, not the content

### 2.7 Theological Guardrail Check

If the voice profile contains a Theological Framework section, validate each chapter against it:

- **Grace over Law:** Flag content that frames the Christian life as performance-based
- **Identity in Christ:** Flag content that defines the believer by behaviour rather than position
- **New Covenant lens:** Flag content that treats the Cross as the beginning of a process rather than a finished work
- **Authority of the believer:** Flag content that positions believers as begging rather than seated with Christ
- **Kingdom as present reality:** Flag content that relegates Kingdom power to the future only
- **Sonship over servanthood:** Flag content that positions believers as anxious servants rather than confident sons
- **Supernatural is active today:** Flag cessationist framing
- **Scripture is inerrant:** Flag content that suggests biblical contradictions rather than puzzles to solve

For non-theological books, skip this sub-check entirely.

### 2.8 Pass 1 Output

Save each edited chapter to `[project_directory]/edited/ch[NN]-pass1.md` with the voice audit metadata block appended at the end:

```markdown
<!-- VOICE AUDIT
chapter: [N]
vocabulary_violations: [count]
  - Line ~[N]: "[phrase]" ([Avoid rule])
avg_sentence_length: [number]
fragment_percentage: [number]%
anti_patterns_found:
  - Line ~[N]: [description] ([pattern name])
theological_flags: [list or "none"]
pacing_variety: [score 0-2, with dominant category and percentage]
emotional_connection: [present|absent, with markers found or "none"]
captivation_score: [1-10]
changes_made: [count]
severity: clean | minor | significant
-->
```

**Severity scale:**
- **clean** -- 0 violations, sentence length within range, no anti-patterns, captivation score 5+
- **minor** -- 1-3 total issues (vocabulary + anti-patterns), sentence length within range, captivation score 5+
- **significant** -- 4+ total issues, OR sentence length outside range, OR theological flags present, OR captivation score below 4

## 3. Pass 2 -- Flow and Transitions

**Purpose:** Ensure every chapter ending connects naturally to the next chapter opening. This pass is ALWAYS sequential because each transition depends on both chapters.

**Requirement addressed:** EDIT-02 (flow/transitions)

**Critical rule:** This pass ONLY modifies the final 2-3 paragraphs of the current chapter and the first 2-3 paragraphs of the next chapter. Never change the body.

For each consecutive chapter pair (Ch1->Ch2, Ch2->Ch3, ...):

### 3.1 Read Transition Zone

1. Read the final 2-3 paragraphs of Chapter N from `edited/ch[NN]-pass1.md`
2. Read the first 2-3 paragraphs of Chapter N+1 from `edited/ch[N+1]-pass1.md`
3. Read both chapters' momentum positions from the outline

### 3.2 Evaluate Transition Quality

Check:
- Does the ending of Chapter N plant a seed that the opening of Chapter N+1 picks up?
- Does the momentum position shift feel right?
  - Foundation -> Building = escalation (deepening, not topic change)
  - Building -> Accelerating = intensification (arguments gaining force)
  - Accelerating -> Climax = convergence (everything coming together)
  - Climax -> Landing = resolution (practical application, send-off)
- Is there a natural bridge or does the reader feel a jarring disconnect?

### 3.3 Opening Engagement Check

For each chapter, validate that the first 200 words contain a story, anecdote, or vivid scene -- not a teaching statement, definition, or theological declaration.

**Detection approach:** Read the first 200 words. Check for:
- Story/scene indicators: past tense narrative ("I was sitting", "She walked into"), sensory details, dialogue, specific places/times
- Teaching indicators: present tense declarative statements, definitions ("Grace is..."), "In this chapter" openings, thesis statements

**Scoring:**
- 2 points: Clear story/scene in first 200 words
- 1 point: Some narrative elements but mixed with teaching
- 0 points: Opens with pure theology, definition, or declaration (no narrative)

Flag chapters that score 0 -- they open with teaching instead of story per D-01.

### 3.4 Chapter-Ending Momentum Check

For each chapter, check that the ending has either a cliffhanger seed or a reflective landing + forward hook. Read the chapter outline's ending_style field and validate the chapter delivers it.

**Detection approach:** Read the final 150 words. Check for:
- **cliffhanger_seed indicators:** Questions ("But what if...?"), tension points ("There's something we haven't addressed"), preview language ("What comes next changes everything"), unresolved threads
- **reflective_hook indicators:** Reflective/applicational tone in penultimate paragraph, followed by forward-looking language in the final 1-2 sentences ("And that truth? It's just the beginning")

**Scoring:**
- 2 points: Clear ending momentum matching the outline's ending_style
- 1 point: Some forward momentum but doesn't match the specified style
- 0 points: Chapter just stops -- no forward hook, no reflection, no momentum

Flag chapters that score 0 -- they end without any forward momentum per D-02.

### 3.5 Rewrite Transitions (If Needed)

If the transition is jarring:
1. **Re-read the voice profile** before rewriting any text. Transition rewrites MUST match the voice.
2. Rewrite the chapter ending and/or opening to create a bridge
3. Preserve the core argument of both chapters
4. Only modify transitional language -- do not alter the substance of arguments

### 3.6 Pass 2 Output

Save each chapter to `[project_directory]/edited/ch[NN]-pass2.md`.

If no changes were needed for a chapter, copy the pass1 file as-is to pass2.

Write `[project_directory]/reports/flow-report.md`:

```markdown
# Flow Report: [Book Title]

| Transition | Status | Action Taken |
|-----------|--------|--------------|
| Ch 1 -> Ch 2 | smooth | none |
| Ch 2 -> Ch 3 | jarring | rewrote Ch 2 ending to bridge to Ch 3's argument |
```

## 4. Pass 3 -- Cross-Chapter Validation

**Purpose:** Build indexes across all chapters and validate consistency. This pass reads all chapters but works primarily from extracted indexes, not full text (important for context limits).

**Requirement addressed:** EDIT-04 (cross-chapter validation)

### 4.1 Term Index

Extract key terms and jargon from all chapters (`edited/ch*-pass2.md`). Cross-reference against Book DNA Key Terms section.

Flag:
- Terms used with inconsistent definitions
- Spelling variations (e.g., "sonship" vs "Sonship")
- Capitalisation drift (e.g., "Kingdom authority" vs "kingdom authority")
- Terms defined in Book DNA but not introduced before first use

### 4.2 Reference Validation

Find all forward and backward references using pattern matching:
- "we'll explore this in chapter [N]"
- "as we saw in chapter [N]"
- "later in the book"
- "as we discussed earlier"
- "in the next chapter"
- "in the previous chapter"
- "chapter [N]" (general mentions)

For each reference:
- Verify the referenced chapter delivers on the promise
- Flag vague references ("as we saw earlier") and recommend specifying the chapter number
- Flag broken references (pointing to non-existent content)

### 4.3 Scripture Consistency

For theological books:
- Verify the same scripture passage is not quoted with different wording in different chapters
- All quotes should use the same translation (default NKJV per the voice profile's Scripture Handling section)
- Flag translation mismatches

### 4.4 Theme Tracking

Cross-reference against Book DNA Running Themes section:
- Verify each theme is introduced in its designated chapter
- Verify each theme is developed through its designated chapters
- Verify each theme reaches its climax in the designated chapter
- Flag themes that appear to be dropped or never resolved

### 4.5 Pass 3 Output

Save final edited chapters to `[project_directory]/edited/ch[NN]-final.md`. If no changes were needed for a chapter in this pass, copy from pass2.

Write `[project_directory]/reports/consistency-report.md` with this exact structure:

```markdown
# Consistency Report: [Book Title]

**Generated:** [date]
**Chapters analysed:** [N]
**Overall assessment:** [Clean / Minor Issues / Significant Issues]

## Voice Consistency (Pass 1)

| Chapter | Violations | Avg Sentence Length | Fragment % | Captivation | Severity |
|---------|-----------|--------------------|-----------:|:-----------:|----------|
| Ch 1    | 0         | 15.2               | 22%        | 8/10        | clean    |

### Captivation Score Breakdown

Each chapter receives a `captivation_score` (1-10) based on five components (0-2 points each):

| Component | What it measures | Source |
|-----------|-----------------|--------|
| Opening engagement | Story/scene in first 200 words | Pass 2 |
| Ending momentum | Cliffhanger or reflective hook | Pass 2 |
| Pacing variety | Paragraph length distribution | Pass 1 |
| Emotional connection | Personal stories/vulnerability markers | Pass 1 |
| Reader engagement | "you", rhetorical questions, direct address | Pass 1 |

**Thresholds:**
- 8-10: Captivating -- reads like a bestseller
- 5-7: Acceptable -- some areas could improve
- 3-4: Weak -- specific areas need attention
- 1-2: Significant issues -- chapter needs substantial rework

**Momentum-aware threshold:** A chapter in a "Building" momentum position with teaching-heavy content can score 5-6 without triggering a rewrite recommendation. Only chapters scoring below 4 trigger a "significant" severity flag for captivation specifically.

### Flagged Issues
1. **Ch [N], ~line [N]:** "[description]"

## Flow and Transitions (Pass 2)

| Transition | Status | Action Taken |
|-----------|--------|--------------|
| Ch 1 -> Ch 2 | smooth | none |

## Cross-Chapter Consistency (Pass 3)

### Term Consistency
| Term | Chapters Used | Consistent | Issue |
|------|--------------|------------|-------|

### Reference Validation
| Reference | Source | Target | Validated |
|-----------|--------|--------|-----------|

### Theological Consistency
[Any contradictions between chapters]

### Scripture Consistency
[Any translation mismatches]

## Unresolved Issues (Requires User Decision)
[Issues the editor could not auto-resolve]
```

## 5. Rolling Window Pattern (16+ Chapters)

**Requirement addressed:** EDIT-05 (rolling window for large books)

For books with 16 or more chapters, use `chapter-editor` subagents for Pass 1 to avoid context overflow.

### 5.1 Window Composition Per Subagent

Each chapter-editor subagent receives:
- **Current chapter** (full text) -- the focus of editing
- **Previous chapter's final 500 words** (for context) -- or "none" if first chapter
- **Next chapter's first 500 words** (for context) -- or "none" if last chapter
- **Full voice profile** (always included)
- **Full Book DNA** (always included)

### 5.2 Subagent Invocation

Use the `chapter-editor` subagent from `${CLAUDE_PLUGIN_ROOT}/agents/chapter-editor.md`. Each receives:
- Project directory path
- Chapter number to edit
- Edit pass: "voice" (Pass 1 only for subagents)
- Voice profile path: `[project_directory]/voice-profile.md`
- Book DNA path: `[project_directory]/book-dna.md`
- Current chapter path: `[project_directory]/drafts/ch[NN]-draft.md`
- Previous chapter overlap (final 500 words of ch[N-1], or "none")
- Next chapter overlap (first 500 words of ch[N+1], or "none")

### 5.3 Parallelisation Rules

- **Pass 1 subagents** can run in parallel -- each chapter is independent for voice checking
- **Pass 2** is ALWAYS handled by the main editor skill sequentially (transitions need chapter pairs)
- **Pass 3** is ALWAYS handled by the main editor skill (needs cross-chapter indexes built from all chapters)

### 5.4 Collecting Subagent Output

After all Pass 1 subagents complete, verify that each chapter has a corresponding `edited/ch[NN]-pass1.md` file with a `<!-- VOICE AUDIT -->` metadata block. If any subagent failed to produce output, re-run that specific subagent before proceeding to Pass 2.

## 6. Revision Mode

When invoked with mode "revision" and a list of chapter numbers:

### 6.1 Targeted Pass 1

For each chapter to revise:
1. Read the new draft from `drafts/ch[NN]-draft.md`
2. Run the full Pass 1 voice consistency audit (Section 2) on the revised chapter only
3. Save to `edited/ch[NN]-pass1.md` (overwriting the previous pass1 file for this chapter)

### 6.2 Targeted Pass 2

Run Pass 2 (flow/transitions) on the revised chapter AND its immediate neighbours:
- If revising Chapter N, check transitions for:
  - Ch[N-1] -> Ch[N] (if N > 1)
  - Ch[N] -> Ch[N+1] (if N < last chapter)
- Read the neighbour chapters from `edited/ch[NN]-pass2.md` (their previously edited versions)
- Save updated chapters to `edited/ch[NN]-pass2.md`

**One-hop limit:** Do NOT recursively check beyond immediate neighbours. If the Ch[N-1] ending was changed to accommodate the revised Ch[N], do NOT then check Ch[N-2] -> Ch[N-1]. Flag for the user if significant changes were made to adjacent chapters.

### 6.3 Targeted Pass 3

Run Pass 3 (cross-chapter validation) on affected references only:
- Scan the revised chapter for forward and backward references
- Validate those specific references against the referenced chapters
- Check term consistency for any new terms introduced in the revision
- Do NOT rebuild the full cross-chapter index -- only validate the changed chapter's references

### 6.4 Update Reports

Update `reports/consistency-report.md` with the revision results:
- Replace the row for the revised chapter in the Voice Consistency table
- Update transition rows involving the revised chapter in the Flow table
- Update affected entries in Cross-Chapter Consistency tables

## 7. Output Summary

After all passes complete (or after revision mode completes), return a summary to the orchestrator:

```
Editing complete for [Book Title].
Chapters edited: [N]
Voice consistency: [Clean/Minor/Significant] ([X] issues found, [Y] auto-resolved)
Captivation: avg [X.X]/10 ([N] chapters below threshold)
Transitions: [X]/[N-1] smooth
Cross-references: [X] validated, [Y] flagged
Report: [project_directory]/reports/consistency-report.md
```

## 8. Anti-Patterns

- Do NOT edit body text during the flow pass (Pass 2) -- only touch final/first paragraphs of chapters
- Do NOT run passes in parallel -- passes MUST be sequential (Pass 2 needs Pass 1 output, Pass 3 needs Pass 2 output)
- Do NOT overwrite original drafts -- always write to the `edited/` directory
- Do NOT produce subjective voice flags -- every flag must cite a specific rule from the voice profile (vocabulary violation, anti-pattern match, sentence length deviation)
- Do NOT modify Book DNA, voice-profile.md, chapter-outline.md, or any shared file
- Do NOT spawn subagents from within subagents -- if running as a chapter-editor subagent, work directly
- Do NOT recursively check beyond one hop during revision adjacency checks
- Do NOT run the entire manuscript through all three passes when in revision mode -- only process the affected chapters and their immediate neighbours
- Do NOT treat Pass 3 findings as auto-fixable -- term inconsistencies and broken references should be flagged in the report for the user to decide, unless the fix is unambiguous (e.g., capitalisation drift)
