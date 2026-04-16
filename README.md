# Book Crafter

> **Requires:** Claude Code + Node ≥18. Check with `node -v`.

Writes non-fiction books with scene-driven openers, controlled theological density, voice-consistent prose, and novelty-enforced imagery -- backed by 8 countable craft rules and a blind A/B review.

> It is 11:47 at night. The house is quiet. The lamp is off. And somewhere in the dark of a bedroom you have never seen, a woman is lying on her back with her hands folded across her chest, staring at a ceiling she cannot quite make out, running a mental inventory of the day. The sharp word to her husband at breakfast. The thought she should not have entertained at lunchtime. The prayer she meant to pray and forgot. And underneath all of it, the low hum of a question that never fully goes away.
>
> *-- Generated sample (Eternally Secure, Ch 1)*

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
