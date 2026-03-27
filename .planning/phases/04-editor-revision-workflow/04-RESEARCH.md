# Phase 4: Editor + Revision Workflow - Research

**Researched:** 2026-03-27
**Domain:** Multi-agent editing orchestration, voice consistency analysis, revision management within Claude Code plugin system
**Confidence:** HIGH

## Summary

Phase 4 implements the editing pipeline (three sequential passes: voice consistency, flow/transitions, cross-chapter validation) and the user-facing revision workflow (full draft review, targeted chapter rewrites, adjacency flow checks, revision history). All infrastructure is already scaffolded: the editor skill (`skills/editor/SKILL.md`) and chapter-editor agent (`agents/chapter-editor.md`) exist as stubs from Phase 1, and the orchestrator already describes Stage 4 execution at a high level. The work is implementing the actual editing logic, the consistency report, and extending the orchestrator with revision capabilities.

The hardest technical challenge is voice consistency detection. Unlike spell-checking or reference validation, voice drift is subjective -- the editor must compare each chapter against the voice profile's concrete rules (vocabulary Use/Avoid lists, sentence pattern targets, anti-patterns) and flag measurable deviations. The approach must be prescriptive: check vocabulary violations, count sentence length distributions, detect banned phrases, and flag theological anti-patterns. Subjective "feel" checks are supplementary, not primary.

**Primary recommendation:** Implement the editor as a three-pass sequential pipeline where each pass reads all chapters (or a rolling window for 15+ chapter books), produces an annotated version with inline comments, and writes a structured report. The revision workflow extends the orchestrator with a "review gate" after Stage 4 that lets users request chapter-specific rewrites, which trigger localised re-editing of the revised chapter plus its neighbours.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| EDIT-01 | Voice consistency pass -- compares tone, sentence rhythm, vocabulary across all chapters and normalises drift | Editor skill Pass 1: vocabulary audit against Use/Avoid lists, sentence length distribution, anti-pattern detection, tone normalisation |
| EDIT-02 | Flow/transition pass -- ensures chapter endings connect to next chapter openings with natural transitions | Editor skill Pass 2: sequential chapter-pair analysis, transition rewriting, hook-to-landing continuity |
| EDIT-03 | Theological guardrail pass -- validates content against theological framework | Integrated into Pass 1 (voice consistency) since theological framework IS part of the voice profile for spiritual books; separate checklist for theological anti-patterns |
| EDIT-04 | Cross-chapter consistency validator -- terminology, theological consistency, reference consistency | Editor skill Pass 3: build term index, validate forward/backward references, detect theological contradictions |
| EDIT-05 | Editor uses rolling-window pattern for longer books (1-2 chapter overlap) | Rolling window architecture for books >15 chapters; each editor subagent gets current chapter + 1 chapter overlap on each side |
| EDIT-06 | Consistency report produced with specific flagged issues before final formatting | Structured markdown report with per-chapter findings, severity levels, and resolution status |
| ITER-02 | Full draft review -- complete book presented for holistic feedback before final formatting | Orchestrator "review gate" after Stage 4 editing, presenting compiled draft with consistency report |
| ITER-03 | Chapter-level revision -- user can request rewrite of specific chapters with targeted feedback | Orchestrator revision mode: re-invoke writer with user feedback, then re-run editor passes on affected chapters |
| ITER-04 | Revised chapters trigger flow-check on adjacent chapters | After revision, re-run Pass 2 (flow/transitions) on the revised chapter plus its immediate neighbours |
| ITER-05 | Revision history preserved in project directory (drafts not overwritten) | Versioned file naming: `revisions/ch[NN]-v[VV]-draft.md`, original drafts never overwritten |
</phase_requirements>

## Architecture Patterns

### Editor Skill: Three-Pass Sequential Pipeline

The editor skill orchestrates three distinct passes over the manuscript. Each pass has a clear, measurable purpose. Passes run sequentially because each builds on the prior pass's output.

```
Pass 1: Voice Consistency + Theological Guardrails
  Input:  drafts/ch*-draft.md + voice-profile.md + book-dna.md
  Output: edited/ch*-pass1.md (normalised chapters) + voice-report.md

Pass 2: Flow and Transitions
  Input:  edited/ch*-pass1.md (sequential, chapter pairs)
  Output: edited/ch*-pass2.md (with transitions fixed) + flow-report.md

Pass 3: Cross-Chapter Validation
  Input:  edited/ch*-pass2.md + book-dna.md (chapter map, key terms, cross-chapter continuity)
  Output: edited/ch*-final.md + consistency-report.md
```

### Recommended Project Structure (Stage 4 artefacts)

```
[project]/
  edited/
    ch01-pass1.md          # After voice consistency pass
    ch01-pass2.md          # After flow/transition pass
    ch01-final.md          # After cross-chapter validation (final output)
    ...
  reports/
    voice-report.md        # Pass 1 findings
    flow-report.md         # Pass 2 findings
    consistency-report.md  # Pass 3 findings (the EDIT-06 deliverable)
  revisions/
    ch03-v01-draft.md      # Original draft (copied from drafts/ before rewrite)
    ch03-v02-draft.md      # First revision
    ch03-v02-edited.md     # Re-edited after revision
```

### Pattern 1: Voice Consistency Pass (EDIT-01, EDIT-03)

**What:** Reads each chapter against the voice profile and applies measurable checks:

1. **Vocabulary audit:** Scan for words/phrases from the Avoid list. Flag every occurrence with location.
2. **Sentence length distribution:** Count words per sentence. Compare against the target range (12-18 words average, with 3-8 word fragments). Flag chapters whose distribution skews too long or too short.
3. **Anti-pattern detection:** Check for each anti-pattern listed in the voice profile and theological framework (academic hedging, religious cliches, passive voice, performance-based guilt, cessationist framing, etc.).
4. **Tone normalisation:** For flagged passages, rewrite to match the voice profile while preserving the argument and content.
5. **Theological guardrail check (EDIT-03):** For theological books, validate against the Theological Framework section -- grace over law, identity in Christ, New Covenant lens, etc. Flag any content that contradicts the framework.

**When to use:** Always. This is the first pass because subsequent passes should work with voice-normalised text.

**Output per chapter:**
```markdown
<!-- VOICE AUDIT
vocabulary_violations: [count]
avg_sentence_length: [number]
fragment_percentage: [number]%
anti_patterns_found: [list]
theological_flags: [list or "none"]
changes_made: [count]
severity: clean | minor | significant
-->
```

### Pattern 2: Flow/Transition Pass (EDIT-02)

**What:** Reads chapter pairs sequentially (Ch1 ending + Ch2 opening, Ch2 ending + Ch3 opening, etc.) and ensures natural transitions.

**How it works:**
1. Read the final 2-3 paragraphs of Chapter N and the first 2-3 paragraphs of Chapter N+1
2. Check: Does the ending plant a seed that the opening picks up? Is there a natural bridge?
3. Check: Does the momentum position shift feel right? (Foundation -> Building should feel like escalation, not a topic change)
4. If the transition is jarring, rewrite the chapter ending and/or chapter opening to create a bridge
5. Preserve the core argument -- only modify transitional language

**When to use:** Always, sequentially. Cannot be parallelised because each transition depends on both chapters.

**Critical rule:** This pass never changes the body of a chapter -- only the final 2-3 paragraphs and first 2-3 paragraphs.

### Pattern 3: Cross-Chapter Validation (EDIT-04)

**What:** Builds indexes across all chapters and validates consistency:

1. **Term index:** Extract all key terms and jargon. Flag terms used inconsistently (different definitions, different spellings, capitalisation drift).
2. **Reference validation:** Find all forward references ("we'll explore this in chapter 7", "as we saw in chapter 3") and verify the referenced chapter delivers on the promise.
3. **Scripture consistency:** Verify the same scripture passage isn't quoted with different wording in different chapters (translation consistency).
4. **Theme tracking:** Cross-reference against the Book DNA's Running Themes section. Verify themes are introduced, developed, and climaxed in the chapters specified.

**Output:** `consistency-report.md` -- this is the EDIT-06 deliverable that the user reviews.

### Pattern 4: Rolling Window for Large Books (EDIT-05)

**What:** For books with more than 15 chapters, individual editing subagents handle windows of chapters rather than the editor reading the entire manuscript.

**Window composition:**
- Current chapter (the focus of editing)
- Previous chapter's final 500 words (for transition context)
- Next chapter's first 500 words (for transition context)
- Full voice profile and Book DNA (always included)

**When to use:** Only when chapter count exceeds 15. Below that threshold, the main editor skill can hold all chapters in context.

**How subagents are used:**
- Pass 1 (voice consistency): Can be parallel -- each chapter-editor subagent gets one chapter + voice profile
- Pass 2 (flow/transitions): Must be sequential -- each subagent gets a chapter pair
- Pass 3 (cross-chapter validation): Done by the main editor skill reading all chapters' metadata blocks and a term/reference index built during passes 1-2

### Pattern 5: Revision Workflow (ITER-02 through ITER-05)

**What:** After editing completes, the orchestrator presents a review gate. The user can approve or request revisions.

**Review gate flow:**
```
Stage 4 completes
    |
    v
Present full draft (compiled or chapter-by-chapter) + consistency report
    |
    v
User choice:
  A) Approve -> proceed to Stage 5 (Format)
  B) Request revision on specific chapters with feedback
       |
       v
    For each chapter to revise:
      1. Copy current draft to revisions/ch[NN]-v[VV]-draft.md (ITER-05)
      2. Re-invoke writer with user feedback + original Book DNA
      3. Save new draft to drafts/ch[NN]-draft.md
      4. Re-run Pass 1 (voice) on revised chapter
      5. Re-run Pass 2 (flow) on revised chapter + adjacent chapters (ITER-04)
      6. Re-run Pass 3 (cross-ref) validation on affected references
      7. Update consistency report
    Return to review gate
```

**Revision history (ITER-05):**
- Original draft: `drafts/ch[NN]-draft.md` (overwritten by revision)
- Version backup: `revisions/ch[NN]-v01-draft.md` (copy of original before overwrite)
- Second revision: `revisions/ch[NN]-v02-draft.md` (copy of v01 before second overwrite)
- Version numbering is sequential, auto-incremented by scanning existing revision files

**Adjacency flow check (ITER-04):**
When chapter N is revised, automatically re-run the flow/transition pass on:
- Chapter N-1 ending + Chapter N opening (if N > 1)
- Chapter N ending + Chapter N+1 opening (if N < last chapter)

This is critical because rewriting a chapter may break the transitions that were crafted in Pass 2.

### Anti-Patterns to Avoid

- **Editing body text during flow pass:** Pass 2 should only touch transitions (final/first paragraphs), never core arguments. Mixing passes leads to uncontrolled rewrites.
- **Running all passes in parallel:** Passes must be sequential. Pass 2 needs voice-normalised text from Pass 1. Pass 3 needs transition-fixed text from Pass 2.
- **Overwriting without versioning:** Never write directly to `drafts/ch[NN]-draft.md` during editing. Always write to `edited/` directory. Never overwrite revision history.
- **Subjective-only voice checking:** "This doesn't feel right" is not actionable. Every voice flag must cite a specific rule from the voice profile (vocabulary violation, anti-pattern match, sentence length deviation).
- **Editing the Book DNA during revision:** Book DNA remains READ-ONLY during editing and revision. It may only be updated by the orchestrator between full pipeline re-runs.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sentence length counting | Custom tokeniser | Simple word count per sentence (split on `.!?` boundaries) | Good enough for voice rhythm checking. Sentence boundary detection doesn't need to be perfect -- approximate is fine for style analysis |
| Vocabulary scanning | Regex pattern per word | Case-insensitive substring matching against Avoid/Use lists from voice profile | The Avoid list is human-curated phrases, not regex. Simple string matching catches violations. |
| Reference validation | NLP entity extraction | Pattern matching for "chapter [N]", "we'll explore", "as we saw in chapter" | Forward/backward references follow predictable natural language patterns in non-fiction |
| Revision version numbering | Database/state file | Filesystem scan of `revisions/ch[NN]-v*` files, increment highest | Filesystem IS the state. No need for a separate tracking mechanism. |

## Common Pitfalls

### Pitfall 1: Context Window Overflow on Large Books
**What goes wrong:** A 20-chapter standard book at 3,000-4,000 words per chapter is 60,000-80,000 words (~80K-100K tokens). Loading all chapters simultaneously for editing exceeds practical context limits.
**Why it happens:** The editor tries to read all chapters at once for comprehensive analysis.
**How to avoid:** Use the rolling-window pattern (EDIT-05) for books with >15 chapters. For smaller books, load all chapters but be aware of the limit. Pass 3 (cross-chapter validation) should work from extracted indexes and metadata, not full chapter text.
**Warning signs:** Editor subagent producing truncated or incomplete output; missing later chapters in the consistency report.

### Pitfall 2: Transition Rewrites Breaking Voice Consistency
**What goes wrong:** Pass 2 (flow/transitions) rewrites chapter endings and openings, but the rewritten text drifts from the voice profile because the flow pass focuses on logical connection, not voice.
**Why it happens:** The flow pass prioritises narrative connection over voice matching.
**How to avoid:** The flow pass must re-read the voice profile before rewriting any text. Alternatively, run a lightweight voice check on any text modified during Pass 2.
**Warning signs:** Transitions that sound different from the rest of the chapter.

### Pitfall 3: Revision Loop Never Converging
**What goes wrong:** User requests revision on Chapter 5. Revision triggers adjacency checks on Ch 4-5 and Ch 5-6 transitions. Transition fixes change Ch 4 ending, which triggers another adjacency check on Ch 3-4. Cascade never ends.
**Why it happens:** Each edit can affect neighbours, creating a chain reaction.
**How to avoid:** Limit adjacency checks to ONE hop. When Chapter N is revised, check N-1/N and N/N+1 transitions only. If those transitions are changed, do NOT recursively check N-2/N-1 or N+1/N+2. Flag for the user if changes were made to adjacent chapters.
**Warning signs:** More than two rounds of adjacency checking for a single chapter revision.

### Pitfall 4: Consistency Report Being Too Generic
**What goes wrong:** The report says "voice inconsistency detected" without specific locations, making it useless for the user.
**Why it happens:** Editor skill produces high-level summaries instead of specific, actionable findings.
**How to avoid:** Every finding in the consistency report must include: chapter number, paragraph number or quote, the specific rule violated, and the resolution applied (or recommended if not auto-fixed).
**Warning signs:** Report contains no quotes or specific locations.

### Pitfall 5: Revision History Eating Disk Space
**What goes wrong:** Multiple rounds of revision create many copies of large chapter files.
**Why it happens:** Full chapter text is copied for each version.
**How to avoid:** This is actually fine for the expected scale. A 4,000-word chapter is ~20KB of markdown. Even 10 revisions of all 20 chapters is only ~4MB. Do not optimise for this. Simple file copies are the correct approach.

## Code Examples

### Editor Skill Voice Audit Metadata Block

```markdown
<!-- VOICE AUDIT
chapter: 3
vocabulary_violations: 2
  - Line ~45: "Furthermore" (Avoid list: filler phrase)
  - Line ~112: "it could possibly mean" (Avoid list: academic hedging)
avg_sentence_length: 16.3
fragment_percentage: 18%
anti_patterns_found:
  - Line ~78: passive voice ("was established by God" -> "God established")
theological_flags: none
changes_made: 3
severity: minor
-->
```

### Consistency Report Structure

```markdown
# Consistency Report: [Book Title]

**Generated:** [date]
**Chapters analysed:** [N]
**Overall assessment:** [Clean / Minor Issues / Significant Issues]

## Voice Consistency (Pass 1)

| Chapter | Violations | Avg Sentence Length | Fragment % | Severity |
|---------|-----------|--------------------|-----------:|----------|
| Ch 1    | 0         | 15.2               | 22%        | clean    |
| Ch 2    | 1         | 14.8               | 19%        | minor    |
| ...     |           |                    |            |          |

### Flagged Issues
1. **Ch 2, ~line 45:** "Furthermore" replaced with direct statement
2. ...

## Flow and Transitions (Pass 2)

| Transition | Status | Action Taken |
|-----------|--------|--------------|
| Ch 1 -> Ch 2 | smooth | none |
| Ch 2 -> Ch 3 | jarring | rewrote Ch 2 ending to plant seed for Ch 3's argument |
| ...     |        |              |

## Cross-Chapter Consistency (Pass 3)

### Term Consistency
| Term | Chapters Used | Consistent | Issue |
|------|--------------|------------|-------|
| "sonship" | Ch 1, 4, 7, 12 | yes | - |
| "Kingdom authority" / "kingdom authority" | Ch 3, 8 | no | Capitalisation inconsistent |

### Reference Validation
| Reference | Source | Target | Validated |
|-----------|--------|--------|-----------|
| "we'll explore this in chapter 7" | Ch 3, para 8 | Ch 7 | yes -- Ch 7 covers the topic |
| "as we saw earlier" | Ch 9, para 2 | unclear | no -- vague reference, recommend specifying chapter |

### Theological Consistency
[Any contradictions between chapters in theological claims]

## Unresolved Issues (Requires User Decision)
1. [Issue that the editor could not auto-resolve]
```

### Orchestrator Review Gate Flow

```
## Draft Review: [Book Title]

Your manuscript is ready for review.

### Summary
- **Chapters:** [N]
- **Total words:** [sum]
- **Voice consistency:** [Clean/Minor/Significant] ([X] issues found, [Y] auto-resolved)
- **Transitions:** [X]/[N-1] transitions smooth
- **Cross-references:** [X] validated, [Y] flagged

### Consistency Report
See: [project]/reports/consistency-report.md

### Options
1. **Approve** -- proceed to formatting (Stage 5)
2. **Revise chapters** -- tell me which chapters need rewriting and what to change
3. **Read full draft** -- I'll compile all chapters for you to read through

Which would you like?
```

### Revision Version Detection

```bash
# Find highest existing version for a chapter
# Pattern: revisions/ch03-v01-draft.md, ch03-v02-draft.md, etc.
ls revisions/ch03-v*-draft.md 2>/dev/null | sort -V | tail -1
# If no files: version is 01 (first backup)
# If ch03-v02-draft.md is highest: next version is 03
```

## Orchestrator Changes Required

The orchestrator (skills/orchestrator/SKILL.md) needs these additions for Phase 4:

### Stage 4 Execution Detail
The current orchestrator describes Stage 4 at a high level. It needs:
1. Explicit three-pass invocation sequence
2. Report generation and presentation
3. Review gate implementation (ITER-02)
4. Revision mode handling (ITER-03, ITER-04)

### New Orchestrator Capabilities
1. **Review gate after Stage 4:** Present consistency report + compiled draft, offer approve/revise/read options
2. **Revision mode:** Accept user feedback on specific chapters, re-invoke writer, re-run targeted editing
3. **Adjacency detection:** After revision, identify which adjacent chapters need flow re-checks
4. **Version management:** Before overwriting a draft for revision, copy to `revisions/` with incremented version number
5. **Pipeline state for revisions:** The state detection algorithm needs to handle the case where `edited/` files exist but the user requested revisions (Stage 4 is IN_REVIEW, not COMPLETE)

### New State Detection
```
2.5. Check for edited/ch*-final.md + reports/consistency-report.md
   -> If edited files match chapter count AND no <!-- REVISION REQUESTED --> marker:
      Stage 4 COMPLETE
   -> If edited files exist AND <!-- REVISION REQUESTED --> marker in consistency-report.md:
      Stage 4 IN REVIEW (user requested changes, revision in progress)
```

## Key Design Decisions for Planner

These decisions affect task structure and should be explicitly planned:

1. **Intermediate pass files (pass1, pass2, final):** Keep all three or only keep final? Recommendation: Keep all three during editing for debugging, but the orchestrator only checks for `*-final.md` files for pipeline state detection.

2. **Reports directory:** Create `reports/` in the project directory (new directory not in the original scaffold). The orchestrator's project creation step should be updated to include this directory, OR the editor skill creates it on first run.

3. **Revision marker mechanism:** Use a marker in `consistency-report.md` (e.g., `<!-- REVISION REQUESTED -->` / `<!-- REVISION COMPLETE -->`) rather than a separate state file, keeping with the project's existing filesystem-as-state pattern.

4. **Theological guardrails as separate pass vs. integrated:** EDIT-03 (theological guardrails) maps naturally into Pass 1 (voice consistency) because the theological framework IS part of the voice profile for spiritual books. For non-theological books, this pass simply has no theological checks. Do not create a separate fourth pass.

5. **Editor skill vs. chapter-editor subagent division of labour:**
   - Books with 15 or fewer chapters: Editor skill handles all three passes directly (no subagents needed)
   - Books with 16+ chapters: Editor skill orchestrates chapter-editor subagents for Pass 1 (parallel), handles Pass 2 itself (sequential), and handles Pass 3 itself (works from indexes)

## Environment Availability

Step 2.6: SKIPPED (no external dependencies identified). Phase 4 is purely Claude Code skill and agent definition work -- markdown files, no external tools or libraries needed.

## Validation Architecture

### Test Framework

This is a Claude Code plugin. There is no traditional test framework. Validation is manual: run the plugin against a test book project and verify the editor produces correct output.

| Property | Value |
|----------|-------|
| Framework | Manual validation via Claude Code plugin execution |
| Config file | none |
| Quick run command | Invoke `book-crafter:orchestrator` on a test project at Stage 4 |
| Full suite command | Run full pipeline on a booklet-size project (5-8 chapters) |

### Phase Requirements to Test Map

| Req ID | Behaviour | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| EDIT-01 | Voice consistency pass normalises vocabulary, rhythm, anti-patterns | manual | Run editor on test drafts, inspect edited output for vocabulary corrections | N/A |
| EDIT-02 | Flow/transition pass connects chapter endings to openings | manual | Compare chapter-pair boundaries before and after editing | N/A |
| EDIT-03 | Theological guardrails flag framework violations | manual | Insert known anti-pattern (e.g., cessationist framing) in test draft, verify it is flagged | N/A |
| EDIT-04 | Cross-chapter validator catches terminology drift and broken references | manual | Insert inconsistent term and broken forward reference in test drafts, verify report catches them | N/A |
| EDIT-05 | Rolling window for 15+ chapter books | manual | Test with a 16+ chapter project (or verify the threshold logic in the skill) | N/A |
| EDIT-06 | Consistency report with specific flagged issues | manual | Verify report contains per-chapter findings, specific locations, and severity levels | N/A |
| ITER-02 | Full draft review gate presented to user | manual | Run Stage 4 to completion, verify orchestrator presents review options | N/A |
| ITER-03 | Chapter-level revision with targeted feedback | manual | Request revision of a specific chapter, verify writer re-invoked with feedback | N/A |
| ITER-04 | Revised chapters trigger adjacency flow checks | manual | Revise a middle chapter, verify adjacent transitions re-checked | N/A |
| ITER-05 | Revision history preserved (drafts not overwritten) | manual | Revise a chapter, verify original copied to revisions/ with version number | N/A |

### Sampling Rate
- **Per task:** Review the affected skill/agent file for completeness against requirements
- **Per wave:** Run a dry read of all skill files to verify consistency
- **Phase gate:** Execute full pipeline on a booklet-size test project

### Wave 0 Gaps
None -- this phase produces Claude Code skill definitions (markdown files), not code that requires a test framework.

## Sources

### Primary (HIGH confidence)
- Project codebase: `skills/editor/SKILL.md` (stub), `agents/chapter-editor.md` (stub), `skills/orchestrator/SKILL.md` (Stage 4 section), `skills/writer/SKILL.md` (output format for editor input)
- Project codebase: `references/voice-profiles/spiritual-default.md` (voice profile structure that the editor audits against)
- Project codebase: `references/voice-profiles/voice-profile-spec.md` (validation rules for voice profiles)
- Project codebase: `references/book-dna-template.md` (master context document structure)
- Project codebase: `references/pipeline-stages.md` (Stage 4 specification)
- Project codebase: `.planning/REQUIREMENTS.md` (EDIT-01 through EDIT-06, ITER-02 through ITER-05)

### Secondary (MEDIUM confidence)
- CLAUDE.md technology stack: Editor architecture decisions, subagent constraints, rolling-window pattern recommendation
- Prior phase patterns: Phase 3 established wave batching, Book DNA read-only during parallel execution, filesystem-as-state detection

## Metadata

**Confidence breakdown:**
- Architecture (three-pass pipeline): HIGH -- follows directly from requirements and existing codebase patterns
- Rolling window pattern: HIGH -- explicitly specified in CLAUDE.md and orchestrator SKILL.md
- Revision workflow: HIGH -- requirements are clear and the filesystem-as-state pattern is well established
- Voice consistency detection: MEDIUM -- the approach (vocabulary scanning, sentence length, anti-pattern matching) is sound but the quality of detection depends on implementation detail in the skill instructions

**Research date:** 2026-03-27
**Valid until:** 2026-04-27 (stable -- no external dependencies or fast-moving libraries)
