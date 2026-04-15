# Book Crafter

> **Requires:** Claude Code + Node ≥18. Check with `node -v`.

Writes structured non-fiction books with enforced craft rules.

<!-- TODO(phase-12): replace with fixture paragraph from first successful /book-crafter:sample run -->
> *A 3–4 line quoted prose sample will be inserted here after the tiny-book fixture runs for the first time. Phase 12 GATE-07 finalises this block against real output.*

## Install

Run these three commands in Claude Code:

    /plugin marketplace add gygundo/book-crafter-plugin
    /plugin install book-crafter@book-crafter-plugin
    /reload-plugins

That's it. You're ready to write a book.

## How to run it

Ask Claude Code to write you a book. A natural prompt like *"write me a short book on finding hope in hard seasons"* is enough. Book Crafter will ask for a topic, a voice, and a length, then work through outline, drafting, editing, and formatting. You stay in control at each approval gate.

## What this makes

A professionally formatted `.docx` file with a title page, a table of contents, one chapter per page, page numbers, and a short back-matter section — ready to open in Microsoft Word, Google Docs, or Pages.

Output lands in `~/Documents/Books/<your book title>/output/`.

## Try the built-in sample

Run `/book-crafter:sample` in Claude Code to exercise the full pipeline on a short built-in fixture. The sample prints a one-line PASS or FAIL summary when it finishes — useful as a quick smoke-test after install.

## Licence

MIT. See [LICENSE](./LICENSE).

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
