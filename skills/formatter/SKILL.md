---
name: formatter
description: "Convert edited markdown chapters into a professional .docx file with front matter, back matter, TOC, and page numbers. Called by the orchestrator during the formatting stage. Uses docx-js patterns."
user-invocable: false
allowed-tools: Read, Write, Bash, Glob, Grep
---

# Book Formatter

Converts all `edited/ch[NN]-final.md` files into a single professional .docx file with front matter (half title, full title, copyright, dedication, TOC), body chapters with consistent typography, and back matter (about the author, scripture index, glossary). Produces the final deliverable of the book pipeline.

## 1. Overview

- **Purpose:** Convert edited markdown chapters into a professional .docx document
- **Input:** Project directory path (received from orchestrator via `$ARGUMENTS`)
- **Output:** `[project_directory]/output/[Book Title].docx`
- **Prerequisites:** All `edited/ch[NN]-final.md` files exist, `book-dna.md` exists in the project directory

## 2. Pre-flight Checks

When invoked, perform these checks before generating the document:

**Step 1: Verify docx-js availability**

```bash
node -e "require('docx')" 2>/dev/null || npm install -g docx
```

**Step 2: Read Book DNA**

Read `[project_directory]/book-dna.md` and extract:
- **Title** -- from `**Title:**` in the Metadata section
- **Subtitle** -- from `**Subtitle:**` (may be empty or "[Optional subtitle]")
- **Author** -- from `**Author:**`
- **Chapter count** -- from `**Chapter count:**`
- **Key Terms table** -- from the "Key Terms and Jargon" section (Term | Definition | First Used)
- **Chapter Map table** -- from the "Chapter Map" section (Ch | Title | Core Argument | ...)
- **Style Rules** -- from the "Style Rules" section (spelling convention, scripture translation default)

**Step 3: Verify chapter files**

```bash
ls [project_directory]/edited/ch*-final.md | wc -l
```

Verify the count matches the Book DNA chapter count. If mismatched, report an error and stop.

**Step 4: Read voice profile**

Read `[project_directory]/voice-profile.md` for spelling convention rules (British/US) and any scripture translation defaults. If the voice profile contains a "Theological Framework" or "Theological/Domain Framework" section, note that the book is theological (used to determine whether to include the scripture copyright notice and scripture index).

## 3. Markdown Parsing

### parseInlineFormatting(text)

Splits paragraph text into an array of `TextRun` objects with inline formatting:

```javascript
function parseInlineFormatting(text) {
  // Smart quote conversion first
  text = convertSmartQuotes(text);

  const runs = [];
  // Match bold+italic (***), bold (**), or italic (*) markers
  const parts = text.split(/(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*)/g);

  for (const part of parts) {
    if (part.startsWith('***') && part.endsWith('***')) {
      runs.push(new TextRun({ text: part.slice(3, -3), bold: true, italics: true, font: "Georgia", size: 24 }));
    } else if (part.startsWith('**') && part.endsWith('**')) {
      runs.push(new TextRun({ text: part.slice(2, -2), bold: true, font: "Georgia", size: 24 }));
    } else if (part.startsWith('*') && part.endsWith('*')) {
      runs.push(new TextRun({ text: part.slice(1, -1), italics: true, font: "Georgia", size: 24 }));
    } else if (part) {
      runs.push(new TextRun({ text: part, font: "Georgia", size: 24 }));
    }
  }
  return runs;
}
```

### convertSmartQuotes(text)

Replaces straight quotes with typographic (smart) quotes based on position:

```javascript
function convertSmartQuotes(text) {
  // Double quotes: opening after whitespace/start, closing before whitespace/end/punctuation
  text = text.replace(/(^|[\s(])"([^"]*?)"/g, '$1\u201C$2\u201D');
  // Catch any remaining straight double quotes
  text = text.replace(/"([^"]*?)"/g, '\u201C$1\u201D');

  // Single quotes / apostrophes
  // Apostrophes within words (e.g., don't, it's, God's)
  text = text.replace(/(\w)'(\w)/g, '$1\u2019$2');
  // Opening single quote after whitespace/start
  text = text.replace(/(^|[\s(])'/g, '$1\u2018');
  // Closing single quote (remaining)
  text = text.replace(/'/g, '\u2019');

  return text;
}
```

### parseChapterMarkdown(content)

Parses an entire chapter markdown file into an array of `Paragraph` objects:

```javascript
function parseChapterMarkdown(content) {
  // Strip the METADATA block but extract scriptures_used first
  const metadataMatch = content.match(/<!--\s*METADATA[\s\S]*?-->/);
  let scripturesUsed = [];
  if (metadataMatch) {
    const scripturesMatch = metadataMatch[0].match(/scriptures_used:\s*(.+)/);
    if (scripturesMatch) {
      scripturesUsed = scripturesMatch[1].split(',').map(s => s.trim()).filter(Boolean);
    }
    content = content.replace(/<!--\s*METADATA[\s\S]*?-->/, '').trim();
  }

  // Split on blank lines to get paragraphs
  const blocks = content.split(/\n\s*\n/).filter(block => block.trim());

  const paragraphs = [];
  for (const block of blocks) {
    const trimmed = block.trim();

    // Skip the chapter heading line (# Chapter N: Title)
    if (/^#\s+Chapter\s+\d+/.test(trimmed)) continue;

    // Create a Normal paragraph with parsed inline formatting
    paragraphs.push(new Paragraph({
      style: "Normal",
      spacing: { line: 360, after: 120 },
      children: parseInlineFormatting(trimmed),
    }));
  }

  return { paragraphs, scripturesUsed };
}
```

## 4. Document Styles

Define the complete styles object for the Document:

```javascript
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
        outlineLevel: 0, // REQUIRED for TOC pickup
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

## 5. Document Assembly

Assemble the document in order. Each sub-section below defines one `sections[]` entry in the final Document.

### 5a. Half Title Page

Single page with only the book title, centred, pushed down approximately 3 inches. No headers, no footers.

```javascript
{
  properties: {
    page: {
      size: { width: 12240, height: 15840 }, // US Letter
      margin: { top: 2160, right: 1440, bottom: 2160, left: 1440 },
    },
  },
  children: [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 4320 }, // Push title down ~3 inches
      children: [new TextRun({
        text: bookTitle,
        bold: true,
        size: 72, // 36pt
        font: "Georgia",
      })],
    }),
  ],
}
```

### 5b. Full Title Page

Title, subtitle (if present), and author name. Centred. No headers, no footers.

```javascript
{
  properties: {
    page: {
      size: { width: 12240, height: 15840 },
      margin: { top: 2160, right: 1440, bottom: 2160, left: 1440 },
    },
  },
  children: [
    // Book title
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 3600, after: 480 }, // Push down ~2.5 inches
      children: [new TextRun({
        text: bookTitle,
        bold: true,
        size: 72, // 36pt
        font: "Georgia",
      })],
    }),
    // Subtitle (include only if present and not a placeholder)
    ...(bookSubtitle ? [new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 960 },
      children: [new TextRun({
        text: bookSubtitle,
        italics: true,
        size: 36, // 18pt
        font: "Georgia",
      })],
    })] : []),
    // Author name
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: bookSubtitle ? 0 : 960 },
      children: [new TextRun({
        text: authorName,
        size: 28, // 14pt
        font: "Georgia",
      })],
    }),
  ],
}
```

### 5c. Copyright Page

Left-aligned, Georgia 10pt. No headers, no footers.

```javascript
{
  properties: {
    page: {
      size: { width: 12240, height: 15840 },
      margin: { top: 2160, right: 1440, bottom: 2160, left: 1440 },
    },
  },
  children: [
    new Paragraph({ children: [new TextRun({ text: `Copyright \u00A9 ${currentYear} ${authorName}`, font: "Georgia", size: 20 })] }),
    new Paragraph({ children: [new TextRun({ text: "All rights reserved.", font: "Georgia", size: 20 })] }),
    new Paragraph({ children: [] }), // blank line
    new Paragraph({ children: [new TextRun({ text: "No part of this publication may be reproduced, distributed, or transmitted in any form or by any means without the prior written permission of the author.", font: "Georgia", size: 20 })] }),
    new Paragraph({ children: [] }), // blank line
    // Scripture copyright notice -- include only if theological book
    ...(isTheological ? [
      new Paragraph({ children: [new TextRun({ text: `Unless otherwise indicated, all Scripture quotations are taken from the ${scriptureTranslation}. Copyright \u00A9 1982 by Thomas Nelson. Used by permission. All rights reserved.`, font: "Georgia", size: 20 })] }),
      new Paragraph({ children: [] }),
    ] : []),
    new Paragraph({ children: [new TextRun({ text: "ISBN: [To be assigned]", font: "Georgia", size: 20 })] }),
    new Paragraph({ children: [new TextRun({ text: `First edition, ${currentYear}`, font: "Georgia", size: 20 })] }),
  ],
}
```

The `scriptureTranslation` defaults to "New King James Version (NKJV)" unless the Style Rules in book-dna.md specify a different translation. `isTheological` is `true` if the voice profile contains a theological framework section.

### 5d. Dedication Page

Centred, italic, Georgia 14pt. Placeholder text. No headers, no footers.

```javascript
{
  properties: {
    page: {
      size: { width: 12240, height: 15840 },
      margin: { top: 2160, right: 1440, bottom: 2160, left: 1440 },
    },
  },
  children: [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 4320 }, // Push down ~3 inches
      children: [new TextRun({
        text: "[Dedication to be added]",
        italics: true,
        size: 28, // 14pt
        font: "Georgia",
      })],
    }),
  ],
}
```

### 5e. Table of Contents

Roman numeral page numbers in footer. This is the first section with page numbers.

**CRITICAL:** The Document must set `features: { updateFields: true }` for the TOC to auto-populate when opened in Word.

```javascript
{
  properties: {
    page: {
      size: { width: 12240, height: 15840 },
      margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
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
        children: [new TextRun({
          children: [PageNumber.CURRENT],
          font: "Georgia",
          size: 18, // 9pt
        })],
      })],
    }),
  },
  children: [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun("Contents")],
    }),
    new TableOfContents("Table of Contents", {
      hyperlink: true,
      headingStyleRange: "1-1",
    }),
  ],
}
```

### 5f. Body Section -- All Chapters

ONE section containing ALL chapters. Chapters are separated by `pageBreakBefore: true` on each chapter heading. Arabic page numbers restart at 1.

```javascript
{
  properties: {
    page: {
      size: { width: 12240, height: 15840 },
      margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      pageNumbers: {
        start: 1,
        formatType: NumberFormat.DECIMAL,
      },
    },
  },
  headers: {
    default: new Header({
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({
          text: bookTitle,
          italics: true,
          font: "Georgia",
          size: 18, // 9pt
        })],
      })],
    }),
  },
  footers: {
    default: new Footer({
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({
          children: ["Page ", PageNumber.CURRENT, " of ", PageNumber.TOTAL_PAGES],
          font: "Georgia",
          size: 18, // 9pt
        })],
      })],
    }),
  },
  children: buildChapterContent(chapterFiles, chapterTitles),
}
```

The `buildChapterContent` function iterates over each chapter file in order:

```javascript
function buildChapterContent(chapterFiles, chapterTitles) {
  const children = [];
  for (let i = 0; i < chapterFiles.length; i++) {
    const chapterContent = fs.readFileSync(chapterFiles[i], 'utf-8');
    const chapterTitle = chapterTitles[i];

    // Chapter heading with page break
    children.push(new Paragraph({
      heading: HeadingLevel.HEADING_1,
      pageBreakBefore: true,
      children: [new TextRun(chapterTitle)],
    }));

    // Parsed chapter content
    const { paragraphs } = parseChapterMarkdown(chapterContent);
    children.push(...paragraphs);
  }
  return children;
}
```

### 5g. Back Matter -- About the Author

Continues arabic page numbering (new section, no page number restart).

```javascript
{
  properties: {
    page: {
      size: { width: 12240, height: 15840 },
      margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
    },
  },
  headers: {
    default: new Header({
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({
          text: bookTitle,
          italics: true,
          font: "Georgia",
          size: 18,
        })],
      })],
    }),
  },
  footers: {
    default: new Footer({
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({
          children: ["Page ", PageNumber.CURRENT, " of ", PageNumber.TOTAL_PAGES],
          font: "Georgia",
          size: 18,
        })],
      })],
    }),
  },
  children: [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      pageBreakBefore: true,
      children: [new TextRun("About the Author")],
    }),
    new Paragraph({
      style: "Normal",
      children: [new TextRun({
        text: authorBio || "[Author bio to be added]",
        font: "Georgia",
        size: 24,
      })],
    }),
  ],
}
```

The `authorBio` is extracted from Book DNA's Metadata section (`author_bio` field). If absent or empty, the placeholder text is used.

### 5h. Back Matter -- Scripture Index

**Only include this section if scripture references are found.** For non-theological books with no scripture references, omit entirely.

Auto-extraction process:

1. Read each `edited/ch[NN]-final.md`
2. Extract from the METADATA block `scriptures_used` field (comma-separated list)
3. Also regex-scan the chapter body with: `/(?:\d\s+)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\s+\d+:\d+(?:-\d+)?/g`
4. Build a Map of scripture reference -> Set of chapter numbers
5. Sort by canonical Bible book order using the BIBLE_BOOKS array (see Section 9)
6. Format as paragraphs with dot leaders

```javascript
function buildScriptureIndex(scriptureMap, chapterNumbers) {
  const children = [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      pageBreakBefore: true,
      children: [new TextRun("Scripture Index")],
    }),
  ];

  // Sort references by canonical book order
  const sortedRefs = Array.from(scriptureMap.entries()).sort((a, b) => {
    const bookA = getBookName(a[0]);
    const bookB = getBookName(b[0]);
    const indexA = BIBLE_BOOKS.indexOf(bookA);
    const indexB = BIBLE_BOOKS.indexOf(bookB);
    if (indexA !== indexB) return indexA - indexB;
    return a[0].localeCompare(b[0]);
  });

  for (const [reference, chapters] of sortedRefs) {
    const chapterList = Array.from(chapters).sort((a, b) => a - b).join(", ");
    children.push(new Paragraph({
      children: [
        new TextRun({ text: reference, font: "Georgia", size: 22 }),
        new TextRun({ children: [
          new PositionalTab({
            alignment: PositionalTabAlignment.RIGHT,
            relativeTo: PositionalTabRelativeTo.MARGIN,
            leader: PositionalTabLeader.DOT,
          }),
          `Chapter ${chapterList}`,
        ], font: "Georgia", size: 22 }),
      ],
    }));
  }

  return children;
}
```

### 5i. Back Matter -- Glossary

**Only include this section if the Book DNA Key Terms table has entries.** If the table is empty or absent, omit this section.

Source: Book DNA "Key Terms and Jargon" table. Format as a two-column table.

```javascript
function buildGlossary(keyTerms) {
  const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
  const borders = { top: border, bottom: border, left: border, right: border };

  const rows = [
    // Header row
    new TableRow({
      children: [
        new TableCell({
          borders,
          width: { size: 2800, type: WidthType.DXA },
          shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: "Term", bold: true, font: "Georgia", size: 22 })] })],
        }),
        new TableCell({
          borders,
          width: { size: 6560, type: WidthType.DXA },
          shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: "Definition", bold: true, font: "Georgia", size: 22 })] })],
        }),
      ],
    }),
    // Data rows
    ...keyTerms.map(term => new TableRow({
      children: [
        new TableCell({
          borders,
          width: { size: 2800, type: WidthType.DXA },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: term.name, bold: true, font: "Georgia", size: 22 })] })],
        }),
        new TableCell({
          borders,
          width: { size: 6560, type: WidthType.DXA },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: term.definition, font: "Georgia", size: 22 })] })],
        }),
      ],
    })),
  ];

  return [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      pageBreakBefore: true,
      children: [new TextRun("Glossary")],
    }),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [2800, 6560], // Must sum to 9360
      rows,
    }),
  ];
}
```

## 6. Assembly and Output

Build the complete document:

1. Construct all sections in order: Half Title (5a), Full Title (5b), Copyright (5c), Dedication (5d), TOC (5e), Body (5f), About the Author (5g), Scripture Index (5h -- if applicable), Glossary (5i -- if applicable)
2. Create the Document:
   ```javascript
   const doc = new Document({
     features: { updateFields: true }, // CRITICAL for TOC
     styles: bookStyles,
     sections: allSections,
   });
   ```
3. Generate the .docx:
   ```javascript
   const outputDir = path.join(projectDirectory, 'output');
   if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

   const outputPath = path.join(outputDir, `${bookTitle}.docx`);
   const buffer = await Packer.toBuffer(doc);
   fs.writeFileSync(outputPath, buffer);
   ```
4. Output path: `[project_directory]/output/[Book Title].docx` (title from Book DNA metadata, spaces preserved)

## 7. Generation Script Template

Write the following Node.js script to a temporary file and execute it with `node`. This is the complete generation script the formatter writes and runs.

```javascript
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun,
  Table, TableRow, TableCell,
  Header, Footer,
  AlignmentType, HeadingLevel, NumberFormat, PageNumber,
  TableOfContents, BorderStyle, WidthType, ShadingType,
  LevelFormat,
  PositionalTab, PositionalTabAlignment, PositionalTabRelativeTo, PositionalTabLeader,
} = require('docx');

// ---- Configuration (filled by formatter from Book DNA) ----
const PROJECT_DIR = '__PROJECT_DIR__';
const BOOK_TITLE = '__BOOK_TITLE__';
const BOOK_SUBTITLE = '__BOOK_SUBTITLE__'; // empty string if none
const AUTHOR_NAME = '__AUTHOR_NAME__';
const AUTHOR_BIO = '__AUTHOR_BIO__'; // empty string for placeholder
const IS_THEOLOGICAL = __IS_THEOLOGICAL__; // true or false
const SCRIPTURE_TRANSLATION = '__SCRIPTURE_TRANSLATION__';
const CURRENT_YEAR = new Date().getFullYear();

// Chapter titles in order (extracted from Book DNA chapter map)
const CHAPTER_TITLES = __CHAPTER_TITLES_JSON__;

// Key terms for glossary (extracted from Book DNA)
const KEY_TERMS = __KEY_TERMS_JSON__; // [{ name: "Term", definition: "Def" }, ...]

// ---- Canonical Bible Books (66 books) ----
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

// ---- Smart Quote Conversion ----
function convertSmartQuotes(text) {
  text = text.replace(/(^|[\s(])"([^"]*?)"/g, '$1\u201C$2\u201D');
  text = text.replace(/"([^"]*?)"/g, '\u201C$1\u201D');
  text = text.replace(/(\w)'(\w)/g, '$1\u2019$2');
  text = text.replace(/(^|[\s(])'/g, '$1\u2018');
  text = text.replace(/'/g, '\u2019');
  return text;
}

// ---- Inline Formatting Parser ----
function parseInlineFormatting(text) {
  text = convertSmartQuotes(text);
  const runs = [];
  const parts = text.split(/(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*)/g);
  for (const part of parts) {
    if (part.startsWith('***') && part.endsWith('***')) {
      runs.push(new TextRun({ text: part.slice(3, -3), bold: true, italics: true, font: "Georgia", size: 24 }));
    } else if (part.startsWith('**') && part.endsWith('**')) {
      runs.push(new TextRun({ text: part.slice(2, -2), bold: true, font: "Georgia", size: 24 }));
    } else if (part.startsWith('*') && part.endsWith('*')) {
      runs.push(new TextRun({ text: part.slice(1, -1), italics: true, font: "Georgia", size: 24 }));
    } else if (part) {
      runs.push(new TextRun({ text: part, font: "Georgia", size: 24 }));
    }
  }
  return runs;
}

// ---- Chapter Markdown Parser ----
function parseChapterMarkdown(content) {
  const metadataMatch = content.match(/<!--\s*METADATA[\s\S]*?-->/);
  let scripturesUsed = [];
  if (metadataMatch) {
    const sm = metadataMatch[0].match(/scriptures_used:\s*(.+)/);
    if (sm) scripturesUsed = sm[1].split(',').map(s => s.trim()).filter(Boolean);
    content = content.replace(/<!--\s*METADATA[\s\S]*?-->/, '').trim();
  }

  const blocks = content.split(/\n\s*\n/).filter(b => b.trim());
  const paragraphs = [];
  for (const block of blocks) {
    const trimmed = block.trim();
    if (/^#\s+Chapter\s+\d+/.test(trimmed)) continue;
    paragraphs.push(new Paragraph({
      style: "Normal",
      spacing: { line: 360, after: 120 },
      children: parseInlineFormatting(trimmed),
    }));
  }
  return { paragraphs, scripturesUsed };
}

// ---- Scripture Extraction ----
const scriptureRegex = /(?:\d\s+)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\s+\d+:\d+(?:-\d+)?/g;

function getBookName(ref) {
  // Extract the book name portion from a reference like "1 Corinthians 13:4-7"
  const match = ref.match(/^((?:\d\s+)?[A-Za-z]+(?:\s+[A-Za-z]+(?:\s+[A-Za-z]+)?)?)\s+\d/);
  return match ? match[1] : ref;
}

function extractScriptures(chapterFiles) {
  const scriptureMap = new Map(); // reference -> Set of chapter numbers

  for (let i = 0; i < chapterFiles.length; i++) {
    const chapterNum = i + 1;
    const content = fs.readFileSync(chapterFiles[i], 'utf-8');

    // Extract from METADATA block
    const metaMatch = content.match(/<!--\s*METADATA[\s\S]*?-->/);
    if (metaMatch) {
      const sm = metaMatch[0].match(/scriptures_used:\s*(.+)/);
      if (sm) {
        sm[1].split(',').map(s => s.trim()).filter(Boolean).forEach(ref => {
          if (!scriptureMap.has(ref)) scriptureMap.set(ref, new Set());
          scriptureMap.get(ref).add(chapterNum);
        });
      }
    }

    // Regex scan body text
    const bodyText = content.replace(/<!--\s*METADATA[\s\S]*?-->/, '');
    const matches = bodyText.match(scriptureRegex);
    if (matches) {
      matches.forEach(ref => {
        const trimRef = ref.trim();
        if (!scriptureMap.has(trimRef)) scriptureMap.set(trimRef, new Set());
        scriptureMap.get(trimRef).add(chapterNum);
      });
    }
  }

  return scriptureMap;
}

// ---- Document Styles ----
const bookStyles = {
  default: {
    document: {
      run: { font: "Georgia", size: 24 },
    },
  },
  paragraphStyles: [
    {
      id: "Heading1", name: "Heading 1",
      basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { size: 48, bold: true, font: "Georgia" },
      paragraph: {
        spacing: { before: 480, after: 240 },
        outlineLevel: 0,
      },
    },
    {
      id: "Normal", name: "Normal",
      run: { font: "Georgia", size: 24 },
      paragraph: {
        spacing: { line: 360, after: 120 },
      },
    },
  ],
};

// ---- Build Document ----
async function main() {
  // Discover chapter files
  const editedDir = path.join(PROJECT_DIR, 'edited');
  const chapterFiles = fs.readdirSync(editedDir)
    .filter(f => /^ch\d+-final\.md$/.test(f))
    .sort()
    .map(f => path.join(editedDir, f));

  console.log(`Found ${chapterFiles.length} chapters`);

  // Build chapter content for body section
  const bodyChildren = [];
  for (let i = 0; i < chapterFiles.length; i++) {
    const content = fs.readFileSync(chapterFiles[i], 'utf-8');
    bodyChildren.push(new Paragraph({
      heading: HeadingLevel.HEADING_1,
      pageBreakBefore: true,
      children: [new TextRun(CHAPTER_TITLES[i] || `Chapter ${i + 1}`)],
    }));
    const { paragraphs } = parseChapterMarkdown(content);
    bodyChildren.push(...paragraphs);
  }

  // Build scripture index
  const scriptureMap = extractScriptures(chapterFiles);
  const hasScriptures = scriptureMap.size > 0;

  // Build sections array
  const allSections = [];

  // 5a: Half Title Page
  allSections.push({
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 2160, right: 1440, bottom: 2160, left: 1440 },
      },
    },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 4320 },
        children: [new TextRun({ text: BOOK_TITLE, bold: true, size: 72, font: "Georgia" })],
      }),
    ],
  });

  // 5b: Full Title Page
  const titlePageChildren = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 3600, after: 480 },
      children: [new TextRun({ text: BOOK_TITLE, bold: true, size: 72, font: "Georgia" })],
    }),
  ];
  if (BOOK_SUBTITLE) {
    titlePageChildren.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 960 },
      children: [new TextRun({ text: BOOK_SUBTITLE, italics: true, size: 36, font: "Georgia" })],
    }));
  }
  titlePageChildren.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: BOOK_SUBTITLE ? 0 : 960 },
    children: [new TextRun({ text: AUTHOR_NAME, size: 28, font: "Georgia" })],
  }));

  allSections.push({
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 2160, right: 1440, bottom: 2160, left: 1440 },
      },
    },
    children: titlePageChildren,
  });

  // 5c: Copyright Page
  const copyrightChildren = [
    new Paragraph({ children: [new TextRun({ text: `Copyright \u00A9 ${CURRENT_YEAR} ${AUTHOR_NAME}`, font: "Georgia", size: 20 })] }),
    new Paragraph({ children: [new TextRun({ text: "All rights reserved.", font: "Georgia", size: 20 })] }),
    new Paragraph({ children: [] }),
    new Paragraph({ children: [new TextRun({ text: "No part of this publication may be reproduced, distributed, or transmitted in any form or by any means without the prior written permission of the author.", font: "Georgia", size: 20 })] }),
    new Paragraph({ children: [] }),
  ];
  if (IS_THEOLOGICAL) {
    copyrightChildren.push(
      new Paragraph({ children: [new TextRun({ text: `Unless otherwise indicated, all Scripture quotations are taken from the ${SCRIPTURE_TRANSLATION}. Copyright \u00A9 1982 by Thomas Nelson. Used by permission. All rights reserved.`, font: "Georgia", size: 20 })] }),
      new Paragraph({ children: [] }),
    );
  }
  copyrightChildren.push(
    new Paragraph({ children: [new TextRun({ text: "ISBN: [To be assigned]", font: "Georgia", size: 20 })] }),
    new Paragraph({ children: [new TextRun({ text: `First edition, ${CURRENT_YEAR}`, font: "Georgia", size: 20 })] }),
  );

  allSections.push({
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 2160, right: 1440, bottom: 2160, left: 1440 },
      },
    },
    children: copyrightChildren,
  });

  // 5d: Dedication Page
  allSections.push({
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 2160, right: 1440, bottom: 2160, left: 1440 },
      },
    },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 4320 },
        children: [new TextRun({ text: "[Dedication to be added]", italics: true, size: 28, font: "Georgia" })],
      }),
    ],
  });

  // 5e: Table of Contents
  allSections.push({
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        pageNumbers: { start: 1, formatType: NumberFormat.LOWER_ROMAN },
      },
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ children: [PageNumber.CURRENT], font: "Georgia", size: 18 })],
        })],
      }),
    },
    children: [
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("Contents")],
      }),
      new TableOfContents("Table of Contents", {
        hyperlink: true,
        headingStyleRange: "1-1",
      }),
    ],
  });

  // 5f: Body Section -- All Chapters
  allSections.push({
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: BOOK_TITLE, italics: true, font: "Georgia", size: 18 })],
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({
            children: ["Page ", PageNumber.CURRENT, " of ", PageNumber.TOTAL_PAGES],
            font: "Georgia", size: 18,
          })],
        })],
      }),
    },
    children: bodyChildren,
  });

  // Back matter header/footer (shared)
  const backMatterHeader = new Header({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: BOOK_TITLE, italics: true, font: "Georgia", size: 18 })],
    })],
  });
  const backMatterFooter = new Footer({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({
        children: ["Page ", PageNumber.CURRENT, " of ", PageNumber.TOTAL_PAGES],
        font: "Georgia", size: 18,
      })],
    })],
  });

  // 5g: About the Author
  allSections.push({
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: BOOK_TITLE, italics: true, font: "Georgia", size: 18 })],
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({
            children: ["Page ", PageNumber.CURRENT, " of ", PageNumber.TOTAL_PAGES],
            font: "Georgia", size: 18,
          })],
        })],
      }),
    },
    children: [
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: true,
        children: [new TextRun("About the Author")],
      }),
      new Paragraph({
        style: "Normal",
        children: [new TextRun({ text: AUTHOR_BIO || "[Author bio to be added]", font: "Georgia", size: 24 })],
      }),
    ],
  });

  // 5h: Scripture Index (only if references found)
  if (hasScriptures && IS_THEOLOGICAL) {
    const sortedRefs = Array.from(scriptureMap.entries()).sort((a, b) => {
      const bookA = getBookName(a[0]);
      const bookB = getBookName(b[0]);
      const indexA = BIBLE_BOOKS.findIndex(bk => bk === bookA || bk + 's' === bookA || bookA + 's' === bk);
      const indexB = BIBLE_BOOKS.findIndex(bk => bk === bookB || bk + 's' === bookB || bookB + 's' === bk);
      if (indexA !== indexB) return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
      return a[0].localeCompare(b[0]);
    });

    const scriptureChildren = [
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: true,
        children: [new TextRun("Scripture Index")],
      }),
    ];

    for (const [reference, chapters] of sortedRefs) {
      const chapterList = Array.from(chapters).sort((a, b) => a - b).join(", ");
      scriptureChildren.push(new Paragraph({
        children: [
          new TextRun({ text: reference, font: "Georgia", size: 22 }),
          new TextRun({ children: [
            new PositionalTab({
              alignment: PositionalTabAlignment.RIGHT,
              relativeTo: PositionalTabRelativeTo.MARGIN,
              leader: PositionalTabLeader.DOT,
            }),
            `Chapter ${chapterList}`,
          ], font: "Georgia", size: 22 }),
        ],
      }));
    }

    allSections.push({
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: BOOK_TITLE, italics: true, font: "Georgia", size: 18 })],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({
              children: ["Page ", PageNumber.CURRENT, " of ", PageNumber.TOTAL_PAGES],
              font: "Georgia", size: 18,
            })],
          })],
        }),
      },
      children: scriptureChildren,
    });
  }

  // 5i: Glossary (only if key terms exist)
  if (KEY_TERMS.length > 0) {
    const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
    const borders = { top: border, bottom: border, left: border, right: border };

    const glossaryRows = [
      new TableRow({
        children: [
          new TableCell({
            borders,
            width: { size: 2800, type: WidthType.DXA },
            shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: "Term", bold: true, font: "Georgia", size: 22 })] })],
          }),
          new TableCell({
            borders,
            width: { size: 6560, type: WidthType.DXA },
            shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: "Definition", bold: true, font: "Georgia", size: 22 })] })],
          }),
        ],
      }),
      ...KEY_TERMS.map(term => new TableRow({
        children: [
          new TableCell({
            borders,
            width: { size: 2800, type: WidthType.DXA },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: term.name, bold: true, font: "Georgia", size: 22 })] })],
          }),
          new TableCell({
            borders,
            width: { size: 6560, type: WidthType.DXA },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: term.definition, font: "Georgia", size: 22 })] })],
          }),
        ],
      })),
    ];

    allSections.push({
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: BOOK_TITLE, italics: true, font: "Georgia", size: 18 })],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({
              children: ["Page ", PageNumber.CURRENT, " of ", PageNumber.TOTAL_PAGES],
              font: "Georgia", size: 18,
            })],
          })],
        }),
      },
      children: [
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          pageBreakBefore: true,
          children: [new TextRun("Glossary")],
        }),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [2800, 6560],
          rows: glossaryRows,
        }),
      ],
    });
  }

  // Create the document
  const doc = new Document({
    features: { updateFields: true },
    styles: bookStyles,
    sections: allSections,
  });

  // Generate output
  const outputDir = path.join(PROJECT_DIR, 'output');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, `${BOOK_TITLE}.docx`);
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);

  const fileSizeKB = Math.round(buffer.length / 1024);
  const backMatterSections = (hasScriptures && IS_THEOLOGICAL ? 1 : 0) + (KEY_TERMS.length > 0 ? 1 : 0) + 1; // +1 for About the Author
  console.log(`Generated ${BOOK_TITLE}.docx (${fileSizeKB} KB) with ${chapterFiles.length} chapters, 5 front matter pages, ${backMatterSections} back matter sections`);
}

main().catch(err => { console.error('Error generating .docx:', err); process.exit(1); });
```

**Placeholder replacement:** Before writing the script to a temp file, replace the `__PLACEHOLDER__` values with actual data extracted from book-dna.md:
- `__PROJECT_DIR__` -- the project directory path
- `__BOOK_TITLE__` -- from Book DNA Metadata > Title
- `__BOOK_SUBTITLE__` -- from Book DNA Metadata > Subtitle (empty string if none or placeholder)
- `__AUTHOR_NAME__` -- from Book DNA Metadata > Author
- `__AUTHOR_BIO__` -- from Book DNA Metadata > author_bio (empty string if absent)
- `__IS_THEOLOGICAL__` -- `true` if voice profile has theological framework, `false` otherwise
- `__SCRIPTURE_TRANSLATION__` -- from Style Rules (default: "New King James Version (NKJV)")
- `__CHAPTER_TITLES_JSON__` -- JSON array of chapter titles from the Chapter Map table
- `__KEY_TERMS_JSON__` -- JSON array of `{ name, definition }` objects from Key Terms table

## 8. Post-Generation

After the script runs:

1. Verify the .docx file exists and is > 0 bytes:
   ```bash
   [ -f "[output_path]" ] && [ -s "[output_path]" ] && echo "OK" || echo "FAILED"
   ```
2. Report file size:
   ```bash
   ls -lh "[output_path]"
   ```
3. Note: "Run `python scripts/office/validate.py [output.docx]` if available for .docx validation"
4. Report: "Generated [Book Title].docx ([size] KB) with [N] chapters, 5 front matter pages, [M] back matter sections"

## 9. Canonical Bible Books Array

The full 66-book canonical order for scripture index sorting. "Psalm" is included as an alias for "Psalms".

```javascript
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

## 10. Critical Rules

These rules are inherited from the existing docx skill and MUST be followed in every generation:

- **ALWAYS** use `WidthType.DXA` -- NEVER use `WidthType.PERCENTAGE` (breaks in Google Docs)
- **NEVER** use unicode bullet characters -- use `LevelFormat.BULLET` with numbering config if lists are needed
- **ALWAYS** use `ShadingType.CLEAR` for table shading -- NEVER use `ShadingType.SOLID`
- **ALWAYS** set page size explicitly: 12240 x 15840 DXA (US Letter)
- **ALWAYS** include `outlineLevel: 0` on Heading1 paragraph style -- required for TOC pickup
- **PageBreak** must be inside a Paragraph (use `pageBreakBefore: true` on the paragraph)
- **Tables need dual widths:** `columnWidths` on the Table AND `width` on each TableCell, both in DXA
- **Table width** must equal the sum of `columnWidths`
- Use `HeadingLevel` enum for headings -- no custom styles that break TOC
- **ALWAYS** set `features: { updateFields: true }` on the Document for TOC auto-population
- Never use `\n` for line breaks -- use separate Paragraph elements
- Cell `margins` are internal padding -- they reduce content area, not add to cell width

## 11. Anti-Patterns

- Do NOT modify Book DNA, voice-profile.md, chapter-outline.md, or any shared file
- Do NOT fabricate author biographical content -- use the placeholder if no bio is provided
- Do NOT hardcode absolute paths -- use `${CLAUDE_PLUGIN_ROOT}` for plugin paths and the project directory for book paths
- Do NOT use tables as dividers or rules in headers/footers -- use tab stops instead
- Do NOT include the Scripture Index section if no scripture references are found
- Do NOT include the Glossary section if the Key Terms table is empty
- Do NOT use `WidthType.PERCENTAGE` anywhere in the document
- Do NOT use unicode bullet characters (no `\u2022`, no `"* "` prefix)
- Do NOT spawn subagents -- the formatter runs as a single skill
