# Phase 7: Captivating Writing, Modern Voice Profile, and Bestseller Formatting - Research

**Researched:** 2026-03-28
**Domain:** Writing quality, voice profile design, docx-js typography, editorial quality enforcement
**Confidence:** HIGH

## Summary

Phase 7 upgrades the book-crafter pipeline from functional-but-sermon-like output to captivating, bestselling-quality prose. The phase touches four pillars across seven existing files: (1) rewrite the spiritual-default voice profile to model bestselling Christian authors' craft, (2) enhance the writer and outliner skills with storytelling-first patterns, (3) modernise the formatter for mixed-font typography, scripture block quotes, and pull quotes, (4) add captivation enforcement checks to the editor's existing 3-pass pipeline.

All changes are modifications to existing files -- no new skills, agents, or reference documents need to be created. The voice profile system is already designed for extensibility (profiles are plain .md files, changes propagate via Book DNA automatically). The formatter already has per-style font definitions that support mixed typography. The editor already has a structured pass system where new checks can be integrated. The outliner already has per-chapter metadata fields that can be extended.

**Primary recommendation:** Structure the work in four waves matching the four pillars (voice profile, writer+outliner, formatter, editor), with the voice profile first because all downstream skills read it.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Every chapter opens with a story, anecdote, or vivid scene BEFORE any teaching. Existing 4 hook types become secondary tools within the opening story, not standalone openings.
- **D-02:** Chapter endings use a hybrid approach: some cliffhanger seeds, others reflective landing + forward hook. Outliner designs which ending style fits each chapter.
- **D-03:** Chapter body uses BOTH rhythm variation AND tension-release cycles. Mix of paragraph lengths. 2-3 tension-release cycles per chapter.
- **D-04:** Writer uses direct reader engagement language throughout: "you", "imagine this", "picture yourself", rhetorical questions woven into prose.
- **D-05:** Upgrade spiritual-default.md to model writing style of bestselling Christian authors (Eldredge, Goff, Bevere). Keep existing theological framework intact.
- **D-06:** Include 2-3 short reference excerpts from bestselling Christian books as calibration examples in the voice profile.
- **D-07:** Sentence rhythm: keep short punchy base (12-18 word average) but add more long flowing sentences for storytelling sections.
- **D-08:** Voice profile MUST instruct writer to weave personal stories and vulnerability. "I remember when..." moments. Essential, not optional.
- **D-09:** New anti-patterns: lecture tone, list-heavy structure, missing emotional connection, predictable chapter formula.
- **D-10:** Scriptures formatted as block-quoted separate paragraphs with italic text, reference right-aligned on next line. NEVER inline.
- **D-11:** Typography uses mixed style: sans-serif chapter headings (Calibri or similar) with serif body text (Georgia or Garamond).
- **D-12:** Pull quotes: key statements as centred, larger text between paragraphs. Writer/editor marks candidates, formatter renders.
- **D-13:** Four new captivation checks integrated into existing 3-pass pipeline (no new pass): opening engagement (Pass 2), chapter-ending momentum (Pass 2), pacing variety score (Pass 1), emotional connection audit (Pass 1).
- **D-14:** Consistency report includes per-chapter captivation score (1-10).

### Claude's Discretion
- Specific sans-serif font choice for headings (Calibri, Helvetica, or similar)
- Pull quote visual styling details (font size, spacing, border treatment)
- How tension-release cycles are structured within chapters
- Which specific bestselling author excerpts to use as calibration examples
- How to balance storytelling requirements with naturally teaching-heavy chapters

### Deferred Ideas (OUT OF SCOPE)
- Voice builder skill (Phase 8)
- Genre-specific voice profiles (after Phase 8)
- Non-theological voice profiles (Phase 8)
</user_constraints>

## Standard Stack

No new libraries or tools required. This phase modifies existing files only.

### Core (Already in Use)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| docx (docx-js) | 9.6.1 | .docx generation | Already installed globally. Verified current. |
| Node.js | v24.8.0 | Runtime for docx generation | Available on system. |
| Markdown | N/A | All intermediate artifacts | Already the pipeline format. |

**No new installations required.**

## Architecture Patterns

### Files to Modify (Complete List)

```
references/voice-profiles/spiritual-default.md   # Pillar 1: Rewrite voice profile
skills/writer/SKILL.md                            # Pillar 2: Storytelling patterns
skills/outliner/SKILL.md                          # Pillar 2: Ending styles, story hooks
skills/formatter/SKILL.md                         # Pillar 3: Scripture blocks, pull quotes, mixed fonts
skills/editor/SKILL.md                            # Pillar 4: Captivation checks
agents/chapter-writer.md                          # Minimal: reference new writer patterns
agents/chapter-editor.md                          # Minimal: reference new editor checks
```

### Pattern 1: Voice Profile Upgrade (spiritual-default.md)

**What:** Rewrite the voice profile to model bestselling Christian author craft while preserving the theological framework verbatim.

**Current structure (5 required + 2 optional sections per voice-profile-spec.md):**
1. Tone
2. Sentence Patterns
3. Vocabulary (Use / Avoid)
4. Emphasis Techniques
5. Anti-Patterns
6. Theological/Domain Framework (optional, present)
7. Scripture Handling (optional, present)

**Changes needed:**
- **Tone section:** Add storytelling warmth, vulnerability, conversational narrative style. Keep authority and revelation-driven depth. Model: "like a bestselling author who happens to be a theologian, not a theologian who writes books."
- **Sentence Patterns:** Add longer flowing sentences for narrative sections (20-30 words) alongside the existing short punchy base (12-18 words). The current profile is ALL punchy -- bestsellers mix rhythms.
- **Vocabulary > Use:** Add storytelling language ("I remember when...", "Picture this:", "There's a moment I'll never forget", "Let me tell you about...").
- **Vocabulary > Avoid:** Add lecture tone markers ("Let me explain", "It is important to note", "We must understand", "Firstly, secondly, thirdly").
- **Emphasis Techniques:** Add vulnerability, personal story, emotional connection alongside existing theological depth techniques.
- **Anti-Patterns:** Add D-09's four new anti-patterns (lecture tone, list-heavy structure, missing emotional connection, predictable chapter formula).
- **Theological Framework:** NO CHANGES. Copy verbatim.
- **Scripture Handling:** Add D-10's block-quote formatting instruction.

**New section needed:** Add calibration examples section with 2-3 excerpts modelling the target quality (D-06). These sit alongside the existing CORRECT/WRONG examples that are currently in the writer skill.

**Confidence:** HIGH -- voice profile is a plain .md file with a defined spec. Changes propagate automatically via Book DNA.

### Pattern 2: Writer Skill Enhancement (writer/SKILL.md)

**What:** Upgrade the chapter structure, hook strategies, and pacing guidance to enforce storytelling-first writing.

**Current state:**
- Section 3 (Hook Strategies): 4 hook types (bold declaration, rhetorical question, counter-intuitive claim, tension-creating observation) as standalone openers.
- Section 4 (Chapter Structure): 7-part sequential structure (hook -> bridge -> arguments -> revelation -> application).
- Section 5 (Voice Consistency): Calibration examples (CORRECT, WRONG-academic, WRONG-casual, WRONG-generic).
- Section 6 (Momentum-Aware Pacing): Table mapping position to pacing style.

**Changes needed:**
- **Section 3 (Hook Strategies):** Rewrite to make story/scene the PRIMARY opener. The existing 4 hook types become tools WITHIN the opening story, not standalone. Add guidance: "Open with a scene that puts the reader INSIDE a moment. The bold declaration, question, or tension comes as the insight that emerges FROM the story."
- **Section 4 (Chapter Structure):** Add tension-release cycle structure (D-03). Each chapter = 2-3 cycles of build-tension-then-release. Add paragraph rhythm variation guidance (short punchy for impact, longer for depth, single-sentence for dramatic beats). Add chapter ending guidance per D-02: cliffhanger seed OR reflective landing + forward hook.
- **Section 5 (Voice Calibration):** Update calibration examples to model storytelling + theology blend (not just theological voice). Add a "CORRECT voice (storytelling + theology)" example alongside existing theological-only example.
- **Section 6 (Pacing):** Add reader engagement language requirement (D-04): "you", "imagine this", "picture yourself".
- **New section or subsection:** Scripture formatting convention -- instruct writer to output scriptures in a specific markdown format the formatter can detect (e.g., `> *scripture text*` with `> -- Reference` on next line).
- **New section or subsection:** Pull quote marking -- instruct writer to mark pull-quote candidates with a specific markdown convention (e.g., `{{% pullquote %}}text{{% /pullquote %}}` or similar).

**Confidence:** HIGH -- all changes are to an existing, well-structured SKILL.md file.

### Pattern 3: Outliner Enhancement (outliner/SKILL.md)

**What:** Add chapter ending style field and story-first hook guidance.

**Changes needed:**
- **Per-chapter metadata (Section 3, Step 4):** Add new field `- **Ending style:** [cliffhanger_seed | reflective_hook]` per D-02. The outliner designs which ending fits each chapter based on momentum position.
- **Hook strategy guidance:** Update to emphasise that hooks should be story/scene based (D-01). The 4 hook types remain but are now described as techniques within the opening narrative.
- **Output format (Section 5):** Add ending style to the chapter-outline.md template.

**Confidence:** HIGH -- adding one field to existing per-chapter metadata structure.

### Pattern 4: Formatter Typography Upgrade (formatter/SKILL.md)

**What:** Add scripture block quote style, pull quote style, and mixed-font typography.

**Current state:**
- `bookStyles` defines Heading1 (Georgia 24pt bold) and Normal (Georgia 12pt).
- `parseChapterMarkdown` treats all non-heading blocks as Normal paragraphs.
- No special handling for scripture or pull quotes.

**Changes needed:**

**4a. Mixed-font typography (D-11):**
- Change Heading1 style font from `"Georgia"` to `"Calibri"` (recommended sans-serif -- widely available, renders well in .docx, standard modern bestseller look).
- Keep Normal style as `"Georgia"` 12pt.
- Update all Heading-level TextRun objects throughout the formatter to use the sans-serif font.
- Front matter title pages: keep Georgia for title text (these are display typography, not chapter headings). Or switch to Calibri for consistency -- Claude's discretion.

**Font choice recommendation:** Calibri. Rationale: (1) bundled with every Windows install since Vista, (2) default in Microsoft Word templates, (3) clean sans-serif that pairs well with Georgia, (4) available in Google Docs and LibreOffice. Helvetica is the Mac alternative but less reliably available in .docx rendering on Windows.

**4b. Scripture block quote style (D-10):**

Add new paragraph style to `bookStyles.paragraphStyles`:
```javascript
{
  id: "ScriptureBlockQuote",
  name: "Scripture Block Quote",
  basedOn: "Normal",
  run: { font: "Georgia", size: 22, italics: true }, // 11pt italic
  paragraph: {
    indent: { left: convertInchesToTwip(0.5), right: convertInchesToTwip(0.5) },
    spacing: { before: 240, after: 120, line: 360 },
  },
}
```

Add scripture reference style (right-aligned, smaller):
```javascript
{
  id: "ScriptureReference",
  name: "Scripture Reference",
  basedOn: "Normal",
  run: { font: "Georgia", size: 20 }, // 10pt
  paragraph: {
    alignment: AlignmentType.RIGHT,
    indent: { left: convertInchesToTwip(0.5), right: convertInchesToTwip(0.5) },
    spacing: { after: 240 },
  },
}
```

**Markdown convention for detection:** Writer outputs scripture as:
```markdown
> *Scripture text here*
> -- Reference (Translation)
```

The `parseChapterMarkdown` function needs updating to detect `>` prefixed blocks and render them with the ScriptureBlockQuote/ScriptureReference styles instead of Normal.

**4c. Pull quote style (D-12):**

Add new paragraph style:
```javascript
{
  id: "PullQuote",
  name: "Pull Quote",
  basedOn: "Normal",
  run: { font: "Georgia", size: 28, italics: true }, // 14pt italic
  paragraph: {
    alignment: AlignmentType.CENTER,
    spacing: { before: 480, after: 480 },
    border: { top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" }, bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" } },
  },
}
```

**Markdown convention for detection:** Writer marks pull quotes as:
```markdown
:::pullquote
Key statement text here
:::
```

The `parseChapterMarkdown` function detects `:::pullquote` blocks and renders with PullQuote style.

**Confidence:** HIGH -- docx-js supports per-style font definitions, paragraph borders, indentation, and alignment. All demonstrated in existing formatter patterns.

### Pattern 5: Editor Captivation Checks (editor/SKILL.md)

**What:** Add four captivation checks to existing Pass 1 and Pass 2, plus a per-chapter captivation score to the consistency report.

**Integration points (per D-13):**

**Pass 1 additions (voice consistency):**
- **Pacing variety score:** Measure paragraph length distribution. Flag chapters where 80%+ of paragraphs are similar length. Require mix of short (1-2 sentences), medium (3-4 sentences), and long (5-6 sentences).
- **Emotional connection audit:** Flag chapters with no personal stories, anecdotes, or vulnerability markers. Detection: look for "I remember", "I recall", "there was a time", "picture this", personal pronouns in narrative context, story-like paragraph structures.

**Pass 2 additions (flow):**
- **Opening engagement check:** Validate first 200 words contain a story/anecdote/scene, not a teaching statement. Flag chapters that open with theology, definitions, or declarations instead of narrative.
- **Chapter-ending momentum:** Check every chapter ending has either a cliffhanger seed (question, tension, preview) or a reflective landing + forward hook. Flag chapters that just stop without forward momentum.

**Consistency report addition (D-14):**
Add a captivation score column to the Voice Consistency table:

| Chapter | Violations | Avg Sentence Length | Fragment % | Captivation | Severity |
|---------|-----------|--------------------|-----------:|:-----------:|----------|
| Ch 1    | 0         | 15.2               | 22%        | 8/10        | clean    |

Captivation score (1-10) based on: opening hook quality (story present?), ending momentum (forward hook?), pacing variety (paragraph length mix?), emotional connection (vulnerability markers?), reader engagement language ("you", rhetorical questions).

**Voice audit metadata block update:**
```markdown
<!-- VOICE AUDIT
chapter: [N]
vocabulary_violations: [count]
avg_sentence_length: [number]
fragment_percentage: [number]%
anti_patterns_found: [list]
theological_flags: [list or "none"]
pacing_variety: [score 1-10]
emotional_connection: [present|absent]
captivation_score: [1-10]
changes_made: [count]
severity: clean | minor | significant
-->
```

**Confidence:** HIGH -- editor already has structured passes with clear integration points. New checks follow the same pattern as existing vocabulary audit and anti-pattern detection.

### Markdown Conventions for New Content Types

The writer produces markdown; the formatter consumes it. New content types need unambiguous markdown conventions:

| Content Type | Markdown Convention | Formatter Detection |
|-------------|--------------------|--------------------|
| Scripture block quote | `> *text*` + `> -- Reference` | Lines starting with `>` |
| Pull quote | `:::pullquote` ... `:::` | Fenced directive blocks |
| Normal paragraph | Plain text | Default (no prefix) |

These conventions must be documented in: (1) writer SKILL.md (output instructions), (2) formatter SKILL.md (parsing instructions), (3) editor SKILL.md (validation -- check scriptures are block-quoted, not inline).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Mixed-font document | Custom XML manipulation | docx-js `paragraphStyles` with different `run.font` per style | Already supported, just change the font string |
| Scripture block quotes | Manual indent calculation | docx-js paragraph `indent` + `italics` style properties | Built-in paragraph formatting |
| Pull quote borders | Raw OOXML border XML | docx-js `border` paragraph property | Supported in the paragraph options API |
| Captivation scoring | Complex NLP analysis | Simple heuristic markers (word counts, keyword detection, paragraph length distribution) | Full NLP is overkill; Claude-as-agent already understands prose quality |

## Common Pitfalls

### Pitfall 1: Voice Profile Changes Not Propagating
**What goes wrong:** Voice profile is updated but Book DNA still contains old voice data from a previous pipeline run.
**Why it happens:** Book DNA is populated from the voice profile during the outliner's post-approval step (Section 6). If a book project was already past outlining, the old voice profile was already baked into its Book DNA.
**How to avoid:** Document that voice profile changes only affect NEW book projects or projects that re-run the outline stage. Existing in-progress projects need their book-dna.md manually updated.
**Warning signs:** New anti-patterns not being caught; old voice patterns persisting in output.

### Pitfall 2: Scripture Detection False Positives
**What goes wrong:** The markdown `>` convention for scripture block quotes also matches regular blockquotes or indented content.
**Why it happens:** Markdown `>` is overloaded -- it's used for many types of quoted content.
**How to avoid:** Use a more specific convention. Require `> *italic text*` followed by `> -- Reference` as the full pattern. The formatter should detect BOTH lines together, not just `>` alone. Solo `>` blocks without the reference line remain Normal paragraphs.
**Warning signs:** Non-scripture quoted content rendered in italic scripture style.

### Pitfall 3: Calibri Not Available on Target System
**What goes wrong:** Calibri renders as a fallback font (usually Times New Roman) on systems without Microsoft fonts.
**Why it happens:** Calibri is a Microsoft proprietary font. macOS includes it if Office is installed, but Linux/bare systems may not have it.
**How to avoid:** The .docx file embeds the font NAME, not the font file. When opened in Word (which always has Calibri) or Google Docs (which substitutes it cleanly), this is not an issue. For the rare case of rendering in LibreOffice on Linux, the substitution is acceptable -- this is a church context where Word and Google Docs are the primary consumers.
**Warning signs:** Headings appearing in serif font when opened on non-Windows systems.

### Pitfall 4: Pull Quote Styling in Google Docs
**What goes wrong:** Paragraph borders may not render identically in Google Docs vs. Word.
**Why it happens:** Google Docs has limited support for some OOXML paragraph border properties.
**How to avoid:** Use minimal border styling (top and bottom single lines only). Avoid side borders, shadow effects, or complex border art. Test with Google Docs after implementation.
**Warning signs:** Pull quotes appearing as plain centred text without visual distinction.

### Pitfall 5: Captivation Checks Being Too Strict
**What goes wrong:** Some chapters are naturally more teaching-heavy (e.g., a chapter explaining a complex theological concept) and may legitimately score lower on "storytelling" metrics.
**Why it happens:** Blanket rules applied to all chapters regardless of content type.
**How to avoid:** D-13 checks should use soft thresholds, not hard failures. A teaching-heavy chapter in a "Building" momentum position can have a lower captivation score (5-6) without triggering a rewrite. Only flag as "significant" when a chapter scores below 4/10. The outliner already assigns momentum positions -- use these to contextualise the score.
**Warning signs:** Every teaching-oriented chapter flagged for rewrite, creating a cycle.

### Pitfall 6: Existing Writer Calibration Examples Becoming Inconsistent
**What goes wrong:** The writer skill has 3 calibration examples (CORRECT, WRONG-academic, WRONG-casual, WRONG-generic). If the voice profile is upgraded but the writer's examples are not updated to match, agents get conflicting signals.
**Why it happens:** Calibration examples live in two places: the voice profile AND the writer SKILL.md.
**How to avoid:** Update both simultaneously. The writer's calibration section should add a new "CORRECT voice (storytelling + theology blend)" example that demonstrates the upgraded standard. Keep the existing WRONG examples.
**Warning signs:** Chapters matching old "CORRECT" pattern but failing new captivation checks.

## Code Examples

### Scripture Block Quote Markdown Convention (Writer Output)

```markdown
The truth lands differently when you see the original language. Paul writes:

> *And we know that all things work together for good to those who love God, to those who are the called according to His purpose.*
> -- Romans 8:28 (NKJV)

That word "all" -- in the Greek it's *pas*. It means exactly what you think it means.
```

### Scripture Block Quote Parsing (Formatter)

```javascript
// Detect scripture block quotes: > *text* followed by > -- Reference
function isScriptureBlock(lines, startIndex) {
  if (!lines[startIndex].startsWith('> ')) return false;
  // Check if any subsequent > line starts with "-- " (reference line)
  for (let i = startIndex; i < lines.length && lines[i].startsWith('> '); i++) {
    if (lines[i].match(/^>\s*--\s*.+/)) return true;
  }
  return false;
}
```

### Pull Quote Markdown Convention (Writer/Editor Output)

```markdown
The argument builds for three paragraphs, then:

:::pullquote
Grace isn't a safety net -- it's the foundation.
:::

And the chapter continues with the next point.
```

### Mixed Typography Heading Style (Formatter)

```javascript
{
  id: "Heading1", name: "Heading 1",
  basedOn: "Normal", next: "Normal", quickFormat: true,
  run: { size: 48, bold: true, font: "Calibri" }, // Sans-serif for headings
  paragraph: {
    spacing: { before: 480, after: 240 },
    outlineLevel: 0,
  },
}
```

### Captivation Score Heuristic (Editor)

```
Score components (each 0-2 points, total /10):
1. Opening engagement: 2 = story/scene in first 200 words, 1 = some narrative, 0 = pure teaching
2. Ending momentum: 2 = clear cliffhanger or forward hook, 1 = partial, 0 = just stops
3. Pacing variety: 2 = good mix of paragraph lengths, 1 = some variety, 0 = 80%+ same length
4. Emotional connection: 2 = personal story + vulnerability, 1 = some connection, 0 = all intellectual
5. Reader engagement: 2 = frequent "you"/questions/direct address, 1 = occasional, 0 = absent
```

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual validation (no automated test framework in project) |
| Config file | None -- plugin is a collection of .md skill files |
| Quick run command | Manual: run orchestrator on a test brief, inspect output |
| Full suite command | Manual: full pipeline run on test content |

### Phase Requirements to Test Map
| Req ID | Behaviour | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| D-01 | Chapters open with story/scene | manual-only | Inspect first 200 words of each chapter draft | N/A |
| D-02 | Hybrid chapter endings | manual-only | Inspect chapter endings for cliffhanger/reflective+hook | N/A |
| D-03 | Rhythm variation + tension-release | manual-only | Check paragraph length distribution in output | N/A |
| D-04 | Reader engagement language | manual-only | Search for "you", rhetorical questions in output | N/A |
| D-05 | Voice profile upgraded | manual | Diff spiritual-default.md, verify theological framework unchanged | N/A |
| D-06 | Reference excerpts in voice profile | manual | Read updated spiritual-default.md | N/A |
| D-07 | Mixed sentence rhythm | manual-only | Check sentence length distribution in output | N/A |
| D-08 | Personal stories/vulnerability | manual-only | Search for vulnerability markers in output | N/A |
| D-09 | New anti-patterns | manual | Read updated anti-patterns section | N/A |
| D-10 | Scripture block quotes | smoke | Generate .docx, open in Word, verify scripture formatting | N/A |
| D-11 | Mixed typography | smoke | Generate .docx, verify Calibri headings + Georgia body | N/A |
| D-12 | Pull quotes | smoke | Generate .docx, verify pull quote rendering | N/A |
| D-13 | Captivation checks in editor | manual | Run editor on test chapters, verify checks execute | N/A |
| D-14 | Captivation score in report | manual | Run editor, check consistency-report.md for score column | N/A |

### Sampling Rate
- **Per task commit:** Visual diff of changed .md files
- **Per wave merge:** Manual review of all modified skills for consistency
- **Phase gate:** Full pipeline test run on a sample brief, inspect .docx output quality

### Wave 0 Gaps
None -- this phase modifies existing .md files only. No test infrastructure needed.

**Justification for manual-only:** This is a Claude Code plugin composed entirely of .md instruction files. The "tests" are running the pipeline and inspecting output quality. There is no executable code to unit test -- the skills are natural language instructions that Claude interprets at runtime. The formatter's JavaScript is embedded in a SKILL.md file, not a standalone module. Smoke tests (generate .docx, open, verify) are the most meaningful validation.

## Open Questions

1. **Bestselling author excerpt selection**
   - What we know: D-06 requires 2-3 short reference excerpts from bestselling Christian books as calibration examples.
   - What's unclear: Which specific passages to use. Must be short enough to fit in a voice profile, representative enough to set the quality bar, and ideally from different authors to show range.
   - Recommendation: Claude's discretion per CONTEXT.md. Select passages that demonstrate (a) opening with story/vulnerability, (b) weaving theology into narrative, (c) direct reader engagement. Authors named: John Eldredge, Bob Goff, Lisa Bevere.

2. **Pull quote markdown convention**
   - What we know: Writer needs a convention to mark pull quotes that the formatter can detect.
   - What's unclear: Whether `:::pullquote` fenced directives are familiar enough to Claude agents or whether a simpler convention would be more reliable.
   - Recommendation: Use `:::pullquote` ... `:::` -- this follows the CommonMark generic directives proposal and is unambiguous. Alternative: `<!-- PULLQUOTE -->text<!-- /PULLQUOTE -->` using HTML comments, which Claude handles reliably.

3. **Calibration example placement**
   - What we know: Writer SKILL.md has CORRECT/WRONG examples. Voice profile currently has no examples.
   - What's unclear: Whether calibration examples should live in the voice profile (accessible to all agents) or remain in the writer skill (writer-specific).
   - Recommendation: Put the NEW storytelling-quality examples in the voice profile (they define the voice standard). Keep the writer skill's existing examples as writer-specific craft guidance. Both locations serve different purposes.

## Sources

### Primary (HIGH confidence)
- `references/voice-profiles/spiritual-default.md` -- Current voice profile structure (local, verified)
- `references/voice-profiles/voice-profile-spec.md` -- Voice profile spec with required/optional sections (local, verified)
- `skills/writer/SKILL.md` -- Current writer skill with hook strategies, calibration examples (local, verified)
- `skills/outliner/SKILL.md` -- Current outliner with per-chapter metadata fields (local, verified)
- `skills/editor/SKILL.md` -- Current editor with 3-pass pipeline structure (local, verified)
- `skills/formatter/SKILL.md` -- Current formatter with styles, parseChapterMarkdown, document assembly (local, verified)
- `references/book-dna-template.md` -- Master context document template (local, verified)
- [docx-js styling documentation](https://github.com/dolanmiu/docx/blob/master/docs/usage/styling-with-js.md) -- Per-style font definitions supported
- `npm view docx version` -- 9.6.1 confirmed current (verified 2026-03-28)

### Secondary (MEDIUM confidence)
- Bestselling Christian author writing style analysis -- based on training data knowledge of Eldredge/Goff/Bevere's published works. Excerpts should be verified against actual books.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies, all existing tools
- Architecture: HIGH -- all files exist, modification points clearly identified, patterns established
- Pitfalls: HIGH -- based on direct analysis of existing code and docx-js capabilities
- Voice profile design: MEDIUM -- bestselling author craft modelling relies on training data

**Research date:** 2026-03-28
**Valid until:** 2026-04-28 (stable -- no external dependency changes expected)
