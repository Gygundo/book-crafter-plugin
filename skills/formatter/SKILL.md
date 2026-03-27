---
name: formatter
description: "Convert edited markdown chapters into a professional .docx file with front matter, back matter, TOC, and page numbers. Called by the orchestrator during the formatting stage. Uses docx-js patterns."
user-invocable: false
---

# Book Formatter

[STUB - Full implementation in Phase 5]

This skill will generate professional .docx output including:
- Front matter (half title, full title, copyright, dedication, TOC)
- Chapter headings with page breaks and consistent formatting
- Page numbers (Page X of Y)
- Back matter (about the author, scripture index, glossary)
- Uses docx-js patterns from the existing docx skill

Currently returns a placeholder message. The orchestrator will skip this stage until Phase 5.
