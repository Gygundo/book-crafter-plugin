# Phase 5: Formatter + .docx Output - Research

**Researched:** 2026-03-27
**Domain:** docx-js document generation, book formatting conventions, Claude Code plugin skill authoring
**Confidence:** HIGH

## Summary

Phase 5 converts the edited manuscript (a collection of `edited/ch[NN]-final.md` markdown files) into a single professional .docx file using docx-js (version 9.6.1, verified current on npm as of 2026-03-10). The formatter skill is already stubbed at `skills/formatter/SKILL.md` and needs full implementation.

The core technical challenges are: (1) structuring the document with multiple sections for different page numbering (roman numerals for front matter, arabic for body), (2) generating a Table of Contents that Word will populate on open, (3) auto-extracting a scripture index from chapter content, and (4) assembling front matter and back matter in correct publishing order. All of these are well-supported by docx-js APIs documented below.

**Primary recommendation:** Build the formatter as a single skill (no subagents needed) that reads all `edited/ch[NN]-final.md` files, parses their markdown content, and assembles a multi-section docx document using the patterns from David's existing docx skill.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FMT-01 | Professional .docx output using docx-js with consistent typography and formatting | docx-js 9.6.1 styles system with paragraph style overrides (Heading1, Heading2, Normal). Existing docx skill has proven patterns. |
| FMT-02 | Title page with book title, subtitle, author name | Single-page section with centered paragraphs, large font sizes, no header/footer. Page break via separate section. |
| FMT-03 | Auto-generated table of contents with chapter titles and page numbers | `TableOfContents` class with `headingStyleRange: "1-1"`, requires `features: { updateFields: true }` on Document. TOC populates when Word opens. |
| FMT-04 | Chapter headings with consistent formatting (page breaks, heading styles) | `pageBreakBefore: true` on chapter heading paragraphs + `HeadingLevel.HEADING_1` style with `outlineLevel: 0`. |
| FMT-05 | Page numbers in footer ("Page X of Y") | `PageNumber.CURRENT` and `PageNumber.TOTAL_PAGES` in footer TextRun children array. Note: TOTAL_PAGES counts all sections. |
| FMT-06 | Front matter: half title, full title, copyright, dedication, TOC | Multiple sections, each as separate `sections[]` entry. Front matter uses `NumberFormat.LOWER_ROMAN` for page numbers, body restarts at arabic 1. |
| FMT-07 | Back matter: about the author, scripture index, glossary | Scripture index auto-extracted from chapter METADATA blocks and inline references. Glossary from Book DNA Key Terms table. |
| FMT-08 | Formatting inherits docx-js patterns from the existing docx skill | All patterns from `~/.claude/skills/docx/SKILL.md` apply: DXA units, no unicode bullets, no WidthType.PERCENTAGE, ShadingType.CLEAR, dual table widths, explicit page size. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| docx (docx-js) | 9.6.1 (verified 2026-03-10) | .docx document generation | Only serious JS library for programmatic .docx. Already proven in David's docx skill. Supports all required features: TOC, sections, headers/footers, page numbers, styles. |
| Node.js | 24.8.0 (installed) | Runtime for docx generation | Already available on system. docx-js requires Node >= 14. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| python scripts/office/validate.py | System | .docx validation post-generation | After every .docx generation. NOTE: not present in project directory -- exists in David's global scripts. Formatter should reference it but not depend on its exact location. |

**Installation:**
```bash
npm install -g docx  # If not already installed
```

**Version verification:** `npm show docx version` returns 9.6.1 (published 2026-03-10).

**IMPORTANT:** docx is not currently installed globally or locally. The formatter skill's generation script must either `require` from the global install or include a local install step. Recommend the skill check availability and install if missing:
```bash
node -e "require('docx')" 2>/dev/null || npm install -g docx
```

## Architecture Patterns

### Formatter Input/Output Structure
```
[project_directory]/
  book-dna.md              # READ: metadata, key terms, chapter map
  voice-profile.md         # READ: style rules (spelling convention, etc.)
  chapter-outline.md       # READ: chapter titles, count
  edited/
    ch01-final.md          # READ: final chapter content
    ch02-final.md
    ...
  output/
    [Book Title].docx      # WRITE: final formatted document
```

### Document Section Architecture

A professional book .docx requires multiple sections with different page numbering and header/footer behaviour:

```
Section 1: Half Title Page
  - No header, no footer, no page numbers
  - Centred title only

Section 2: Full Title Page
  - No header, no footer
  - Title, subtitle, author

Section 3: Copyright Page
  - No header, no footer (or minimal footer)
  - Copyright notice, rights, ISBN placeholder

Section 4: Dedication Page
  - No header, no footer
  - Centred dedication text

Section 5: Table of Contents
  - Roman numeral page numbers (i, ii, iii...)
  - TableOfContents field

Section 6+: Chapter Sections (one section for ALL chapters)
  - Arabic page numbers starting at 1
  - Header: book title or chapter title
  - Footer: "Page X of Y"
  - Chapter headings use pageBreakBefore for separation

Section N: Back Matter (about author, scripture index, glossary)
  - Continues arabic page numbering
  - Different header text possible
```

### Pattern 1: Multi-Section Page Numbering
**What:** Different NumberFormat per section with page number restart
**When to use:** Front matter needs roman numerals, body needs arabic starting at 1
**Example:**
```javascript
// Source: docx.js.org API + demo/42-restart-page-numbers.ts
// Front matter section (TOC)
{
  properties: {
    page: {
      pageNumbers: {
        start: 1,
        formatType: NumberFormat.LOWER_ROMAN,
      },
    },
  },
  footers: {
    default: new Footer({
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ children: [PageNumber.CURRENT] })],
      })],
    }),
  },
  children: [/* TOC content */],
}

// Body section (chapters) -- restart at arabic 1
{
  properties: {
    page: {
      pageNumbers: {
        start: 1,
        formatType: NumberFormat.DECIMAL,
      },
    },
  },
  footers: {
    default: new Footer({
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ children: ["Page ", PageNumber.CURRENT, " of ", PageNumber.TOTAL_PAGES] }),
        ],
      })],
    }),
  },
  children: [/* all chapters */],
}
```

### Pattern 2: Table of Contents
**What:** Auto-generated TOC that populates when Word opens
**When to use:** Required for FMT-03
**Example:**
```javascript
// Source: docx.js.org TableOfContents docs + existing docx skill
const doc = new Document({
  features: {
    updateFields: true,  // CRITICAL: required for TOC to auto-update
  },
  sections: [
    // ... front matter sections ...
    {
      // TOC section
      children: [
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun("Contents")],
        }),
        new TableOfContents("Table of Contents", {
          hyperlink: true,
          headingStyleRange: "1-1",  // Only capture chapter headings (H1)
        }),
      ],
    },
  ],
});
```

**CRITICAL caveat:** TOC content is generated by Word, not by docx-js. The .docx file contains a field code that tells Word to scan headings and build the TOC. Users see a prompt "This document contains fields that may refer to other files. Do you want to update the fields?" when opening. This is standard Word behaviour and cannot be avoided with programmatic .docx generation.

### Pattern 3: Markdown-to-Docx Paragraph Conversion
**What:** Parse chapter markdown into docx Paragraph objects
**When to use:** Converting edited chapter content to docx elements
**Key decisions:**
- Chapters have NO sub-headings (continuous narrative per Phase 3 decision)
- Each paragraph becomes a `new Paragraph({ children: [new TextRun(text)] })`
- Bold text (`**text**`) becomes `new TextRun({ text, bold: true })`
- Italic text (`*text*`) becomes `new TextRun({ text, italics: true })`
- Scripture references may need special formatting (italic or bold per style rules)
- Smart quotes should be used (docx-js handles unicode correctly in TextRun)

### Pattern 4: Scripture Index Auto-Extraction
**What:** Parse all chapters to build a sorted scripture reference index
**When to use:** Required for FMT-07 back matter
**Approach:**
1. Read each `edited/ch[NN]-final.md` file
2. Extract scripture references from METADATA block (`scriptures_used` field)
3. Also regex-scan chapter body for common scripture patterns (e.g., "John 3:16", "Romans 8:28-29", "1 Corinthians 13:4-7")
4. Build a deduplicated, sorted index: `[Book] [Chapter]:[Verse] ... Chapter [N]`
5. Sort by canonical Bible book order (Genesis through Revelation)
6. Format as a table or list in the back matter section

### Anti-Patterns to Avoid
- **WidthType.PERCENTAGE on tables:** Breaks in Google Docs. Always use WidthType.DXA.
- **Unicode bullet characters:** Creates invalid Word documents. Use LevelFormat.BULLET.
- **\n for line breaks:** Use separate Paragraph elements.
- **PageBreak outside Paragraph:** Creates invalid XML.
- **Missing outlineLevel on heading styles:** TOC will not pick up headings without it.
- **Custom styles on TOC headings:** TOC requires HeadingLevel enum, not custom paragraph styles.
- **Hardcoding absolute paths:** Formatter must use `${CLAUDE_PLUGIN_ROOT}` for plugin paths and project directory for book paths.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Page numbering "Page X of Y" | Manual page counting | `PageNumber.CURRENT` + `PageNumber.TOTAL_PAGES` | Dynamic Word fields handle pagination automatically |
| Table of Contents | Manual chapter listing with guessed page numbers | `TableOfContents` class with `updateFields: true` | Word generates TOC from headings on open; manual TOC becomes stale |
| Section-based page number restart | XML manipulation | `pageNumbers: { start: 1, formatType: NumberFormat.LOWER_ROMAN }` | docx-js handles all the section property XML |
| Markdown parsing | Full markdown parser (marked, remark, etc.) | Simple regex-based conversion | Chapter content is plain prose with bold/italic only. No code blocks, no images, no complex structures. A full parser is overkill. |
| Bible book canonical ordering | Alphabetical sort | Hardcoded array of 66 book names in canonical order | Bible book order is fixed and well-known. A lookup array is simpler and more reliable than any sorting algorithm. |

**Key insight:** docx-js provides high-level abstractions for every Word feature this phase needs. The formatter's complexity is in orchestrating sections and parsing markdown, not in fighting the .docx format.

## Common Pitfalls

### Pitfall 1: TOC Shows "No table of contents entries found"
**What goes wrong:** TOC is empty when document opens in Word
**Why it happens:** Chapter headings don't use HeadingLevel enum, or heading styles don't include `outlineLevel`
**How to avoid:** Always use `heading: HeadingLevel.HEADING_1` on chapter heading paragraphs AND define paragraph styles with `outlineLevel: 0` for Heading1
**Warning signs:** TOC section appears but has no entries; "Update Table" in Word yields nothing

### Pitfall 2: PageNumber.TOTAL_PAGES Counts All Pages Including Front Matter
**What goes wrong:** "Page 5 of 247" where 247 includes front matter pages
**Why it happens:** `PageNumber.TOTAL_PAGES` is a document-wide field, not section-scoped
**How to avoid:** For the body section, use `PageNumber.TOTAL_PAGES` if counting the full document is acceptable (it usually is for published books). If section-only count is needed, use `PageNumber.TOTAL_PAGES_IN_SECTION` instead. Decide upfront which behaviour is wanted.
**Warning signs:** Page count seems too high for the chapter content

### Pitfall 3: Front Matter Pages Get Arabic Numbers
**What goes wrong:** Copyright page shows "3" instead of "iii"
**Why it happens:** Each section needs its own `pageNumbers` property with the correct `formatType`. If omitted, it inherits the previous section's format (or defaults to decimal).
**How to avoid:** Explicitly set `formatType: NumberFormat.LOWER_ROMAN` on all front matter sections, and `formatType: NumberFormat.DECIMAL` with `start: 1` on the body section.
**Warning signs:** Front matter pages show arabic numbers in footer

### Pitfall 4: docx Not Found at Runtime
**What goes wrong:** `require('docx')` fails when formatter script runs
**Why it happens:** docx is not installed globally or the Node module resolution path doesn't include the global install
**How to avoid:** Formatter skill should include a pre-check and install step. Use `npm root -g` to find the global modules path if needed, or install locally in a temp directory.
**Warning signs:** "Cannot find module 'docx'" error

### Pitfall 5: Missing Page Size Declaration
**What goes wrong:** Document renders differently on different systems
**Why it happens:** docx-js defaults to A4; if the user expects US Letter (or vice versa), layout shifts
**How to avoid:** Always set page size explicitly. Use a sensible default (US trade book size: 6" x 9" = 8640 x 12960 DXA) but allow override from Book DNA style rules.
**Warning signs:** Margins look wrong, text is wider/narrower than expected

### Pitfall 6: Bold/Italic Markdown Not Converted
**What goes wrong:** Literal asterisks appear in the .docx output
**Why it happens:** Chapter content is in markdown; the formatter must parse inline formatting
**How to avoid:** Parse each paragraph for `**bold**` and `*italic*` patterns, splitting into separate TextRun objects with appropriate formatting properties
**Warning signs:** `**text**` appears literally in Word document

### Pitfall 7: Smart Quote Handling
**What goes wrong:** Straight quotes in output instead of curly quotes
**Why it happens:** Markdown content may contain straight quotes; docx-js preserves whatever you give it
**How to avoid:** Run a smart-quote conversion pass on text before creating TextRun objects. Replace `"` with left/right double quotes and `'` with left/right single quotes based on context.
**Warning signs:** Unprofessional typography with straight quotes

## Code Examples

### Complete Footer with "Page X of Y"
```javascript
// Source: docx demo/39-page-numbers.ts + demo/14-page-numbers.ts
new Footer({
  children: [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          children: ["Page ", PageNumber.CURRENT, " of ", PageNumber.TOTAL_PAGES],
          font: "Georgia",
          size: 18, // 9pt
        }),
      ],
    }),
  ],
})
```

### Book-Appropriate Styles Definition
```javascript
// Source: existing docx skill patterns
const bookStyles = {
  default: {
    document: {
      run: { font: "Georgia", size: 24 }, // 12pt body
    },
  },
  paragraphStyles: [
    {
      id: "Heading1", name: "Heading 1",
      basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { size: 48, bold: true, font: "Georgia" }, // 24pt chapter titles
      paragraph: {
        spacing: { before: 480, after: 240 },
        outlineLevel: 0, // REQUIRED for TOC
      },
    },
    {
      id: "Normal", name: "Normal",
      run: { font: "Georgia", size: 24 }, // 12pt
      paragraph: {
        spacing: { line: 360, after: 120 }, // 1.5 line spacing, 6pt after
      },
    },
  ],
};
```

### Section Without Headers/Footers (for Title Pages)
```javascript
// Source: docx-js section properties
{
  properties: {
    page: {
      size: { width: 8640, height: 12960 }, // 6x9 trade book
      margin: { top: 2160, right: 1440, bottom: 2160, left: 1440 }, // 1.5" top/bottom, 1" sides
    },
  },
  // No headers or footers properties = no headers/footers displayed
  children: [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 4320 }, // Push title down ~3 inches
      children: [new TextRun({ text: "Book Title", bold: true, size: 72, font: "Georgia" })],
    }),
  ],
}
```

### Scripture Reference Regex Pattern
```javascript
// Extract scripture references from chapter text
// Matches patterns like: John 3:16, 1 Corinthians 13:4-7, Psalm 23:1-6, Genesis 1:1
const scriptureRegex = /(?:\d\s+)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\s+\d+:\d+(?:-\d+)?/g;

// Canonical Bible book order for sorting
const BIBLE_BOOKS = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
  "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles",
  "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Psalm",
  "Proverbs", "Ecclesiastes", "Song of Solomon",
  "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel",
  "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah",
  "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi",
  "Matthew", "Mark", "Luke", "John", "Acts",
  "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
  "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians",
  "1 Timothy", "2 Timothy", "Titus", "Philemon",
  "Hebrews", "James", "1 Peter", "2 Peter",
  "1 John", "2 John", "3 John", "Jude", "Revelation",
];
```

### Simple Markdown Paragraph Parser
```javascript
// Parse a paragraph's inline formatting into TextRun objects
function parseInlineFormatting(text) {
  const runs = [];
  // Split on bold (**) and italic (*) markers
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  for (const part of parts) {
    if (part.startsWith('**') && part.endsWith('**')) {
      runs.push(new TextRun({ text: part.slice(2, -2), bold: true }));
    } else if (part.startsWith('*') && part.endsWith('*')) {
      runs.push(new TextRun({ text: part.slice(1, -1), italics: true }));
    } else if (part) {
      runs.push(new TextRun(part));
    }
  }
  return runs;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual TOC with page numbers | `TableOfContents` field + `updateFields: true` | docx-js v7+ | TOC auto-updates on open in Word |
| officegen for .docx | docx (docx-js) 9.6.1 | officegen abandoned ~2020 | docx-js is the only maintained option |
| Template-based (docxtemplater) | Programmatic (docx-js) | N/A -- different use case | Programmatic is better for variable-structure documents like books |

## Open Questions

1. **Page size: US Letter vs. Trade Book (6x9)**
   - What we know: David's docx skill defaults to US Letter (8.5x11). Trade books are typically 6x9 or 5.5x8.5.
   - What's unclear: Which page size should the formatter default to?
   - Recommendation: Default to US Letter (12240 x 15840 DXA) for compatibility. Add a `page_size` option in Book DNA style rules for override. Trade book sizing is a formatting preference the user can set.

2. **"Page X of Y" scope: whole document or section-only?**
   - What we know: `PageNumber.TOTAL_PAGES` counts all pages including front matter. `PageNumber.TOTAL_PAGES_IN_SECTION` counts only the current section.
   - What's unclear: Whether "Page 5 of 247" or "Page 5 of 230" (body only) is preferred
   - Recommendation: Use `PageNumber.TOTAL_PAGES` (whole document) since this matches the FMT-05 requirement literally ("Page X of Y") and is standard for most books.

3. **Glossary source: Book DNA only or also extracted from chapters?**
   - What we know: Book DNA has a Key Terms table. Chapters may introduce terms not in that table.
   - What's unclear: Whether glossary should be limited to Book DNA entries or also auto-extracted
   - Recommendation: Use Book DNA Key Terms table as the glossary source. It was curated during the pipeline and is authoritative. Auto-extraction risks including noise.

4. **About the Author content**
   - What we know: FMT-07 requires an "about the author" section. Book DNA has author name but no bio.
   - What's unclear: Where the author bio comes from
   - Recommendation: Add an optional `author_bio` field to Book DNA metadata. If empty, generate a placeholder: "[Author bio to be added]". The formatter should not fabricate biographical content.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | docx-js runtime | Yes | 24.8.0 | -- |
| docx (npm) | .docx generation | No (not installed globally) | 9.6.1 on registry | Install via `npm install -g docx` |
| python3 | validate.py | Yes | 3.14.3 | -- |
| validate.py | .docx validation | No (not in project) | -- | Skip validation or add as optional step |

**Missing dependencies with no fallback:**
- docx npm package must be installed before formatter can run. The formatter skill should include installation instructions or an auto-install check.

**Missing dependencies with fallback:**
- validate.py not in project directory. Formatter can reference it as an optional post-generation step: "Run `python scripts/office/validate.py output.docx` if available."

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual validation (no automated test framework in project) |
| Config file | None |
| Quick run command | `python scripts/office/validate.py [output.docx]` (if available) |
| Full suite command | Manual: generate .docx, open in Word, verify TOC, page numbers, formatting |

### Phase Requirements to Test Map
| Req ID | Behaviour | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FMT-01 | .docx generates without errors | smoke | `node -e "require('docx')" && echo "docx available"` | N/A |
| FMT-02 | Title page has title, subtitle, author | manual | Open .docx, check first pages | N/A |
| FMT-03 | TOC present and updates in Word | manual | Open .docx, verify TOC field | N/A |
| FMT-04 | Chapter headings with page breaks | manual | Open .docx, check chapter starts on new page | N/A |
| FMT-05 | Footer shows "Page X of Y" | manual | Open .docx, check footer | N/A |
| FMT-06 | Front matter order and completeness | manual | Open .docx, verify half title -> title -> copyright -> dedication -> TOC | N/A |
| FMT-07 | Back matter present (about author, scripture index, glossary) | manual | Open .docx, check after last chapter | N/A |
| FMT-08 | Uses docx skill patterns (no banned patterns) | code review | Grep generated script for WidthType.PERCENTAGE, unicode bullets | N/A |

### Sampling Rate
- **Per task commit:** Verify .docx generation script runs without error (`node generate-book.js`)
- **Per wave merge:** Generate a test .docx and spot-check structure
- **Phase gate:** Full manual review of generated .docx in Word

### Wave 0 Gaps
- None -- this phase produces a skill definition (.md) and reference patterns, not executable test code. Validation is manual (.docx opened in Word).

## Project Constraints (from CLAUDE.md)

### From Technology Stack (Locked)
- **docx-js 9.6.1** is the only approved library for .docx generation
- **No PDF output** -- out of scope
- **No docxtemplater** -- programmatic generation only
- **No WidthType.PERCENTAGE** -- breaks Google Docs
- **No unicode bullets** -- use LevelFormat.BULLET
- **Formatter is model-invocable only** (`user-invocable: false`) -- called by orchestrator
- **Markdown intermediate format** -- formatter receives markdown, converts to .docx
- **Cross-surface compatibility** -- must work on CLI, desktop, web, IDE extensions

### From Project Decisions (STATE.md)
- Filesystem-as-state pattern: formatter completion detected by `output/*.docx` existence
- Orchestrator calls formatter as Stage 5 after Stage 4 review gate approval
- Book DNA is READ-ONLY during formatting (no modifications to shared files)
- `${CLAUDE_PLUGIN_ROOT}` for all plugin paths, never hardcoded absolute paths

## Sources

### Primary (HIGH confidence)
- David's existing docx skill (`~/.claude/skills/docx/SKILL.md`) -- proven docx-js patterns, validation workflow, critical rules
- [npm: docx 9.6.1](https://www.npmjs.com/package/docx) -- version verified 2026-03-10
- [docx.js.org PageNumber API](https://docx.js.org/api/variables/PageNumber.html) -- CURRENT, TOTAL_PAGES, TOTAL_PAGES_IN_SECTION
- [docx.js.org NumberFormat API](https://docx.js.org/api/variables/NumberFormat.html) -- LOWER_ROMAN, DECIMAL confirmed
- [docx.js.org TableOfContents](https://docx.js.org/api/classes/TableOfContents.html) -- hyperlink, headingStyleRange, updateFields
- [docx demo/39-page-numbers.ts](https://github.com/dolanmiu/docx/blob/master/demo/39-page-numbers.ts) -- Page X of Y pattern
- [docx demo/42-restart-page-numbers.ts](https://github.com/dolanmiu/docx/blob/master/demo/42-restart-page-numbers.ts) -- section page number restart
- [docx docs/usage/table-of-contents.md](https://github.com/dolanmiu/docx/blob/master/docs/usage/table-of-contents.md) -- TOC caveats and configuration

### Secondary (MEDIUM confidence)
- WebSearch verification of PageNumber.TOTAL_PAGES and NumberFormat.LOWER_ROMAN availability

### Tertiary (LOW confidence)
- None -- all findings verified against primary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- docx-js 9.6.1 is the locked decision, version verified, all APIs confirmed
- Architecture: HIGH -- multi-section document pattern is well-documented in docx-js, existing docx skill provides proven patterns
- Pitfalls: HIGH -- derived from existing docx skill critical rules and confirmed API behaviour
- Scripture index extraction: MEDIUM -- regex approach is straightforward but edge cases in scripture reference formats may need refinement during implementation

**Research date:** 2026-03-27
**Valid until:** 2026-04-27 (stable -- docx-js releases are infrequent)
