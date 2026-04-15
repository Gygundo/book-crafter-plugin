# Book DNA: The 2am Prayer

> Master context document. READ-ONLY during parallel chapter generation.

## Metadata

- **Title:** The 2am Prayer
- **Subtitle:** Finding God When You Can't Sleep
- **Author:** Encounter Church
- **Size tier:** booklet
- **Target word count:** 2500
- **Chapter count:** 3
- **Created:** 2026-04-15

## Voice Profile

Loaded from `voice-profile.md` (spiritual-default). Summary below for in-chapter reference:

### Tone
Bold, direct, revelation-driven — wrapped in story. Warm and conversational. Vulnerability is strength. Lead with human experience; theology follows.

### Sentence Patterns
Short punchy sentences and fragments for impact. Longer flowing sentences (20-30 words) for scene-setting and narrative. Vary rhythm deliberately. Rhetorical questions. Repetition for emphasis. Average 12-18 words.

### Vocabulary
**Use:** direct active verbs; "the truth is"; "here's what most people miss"; "I remember when"; "picture this"; identity language (sonship, inheritance); revelation language (unveil, uncover).
**Avoid:** academic hedging; religious cliches ("God won't give you more than you can handle"); em dashes; numbered-step framing ("3 steps to..."); passive voice; lecture phrases ("let me explain", "it is important to note", "in conclusion").

### Emphasis Techniques
Bold declarations. Personal vulnerability. Scene-setting. Scripture quoted in full as block quotes with reference on next line. Emotional connection before intellectual argument.

## Theological Framework

- Grace over Law — always
- Identity in Christ (sonship, not servanthood)
- New Covenant lens — the Cross is finished work
- The supernatural is real and active today
- Scripture is inerrant and self-interpreting
- Kingdom as present reality — here and now
- Go deep, not wide

## Book Arc

Hiding -> honesty -> hosted. A single long night from 2:17am to 4:42am. Chapter 1: fear and the instinct to pretend. Chapter 2: the body refuses to keep pretending and gets up. Chapter 3: anxiety becomes company with the God who was already awake. The book does not promise sleep — it promises Presence.

## Chapter Map

- **Ch 1: The Clock Says 2:17**
  - Core argument: Fear at 2am is not the enemy of faith; pretending is.
  - Opening hook strategy: In-scene sensory drop — dark room, phone glow at 2:17.
  - Key scriptures: Psalm 121:4, Psalm 42:8, Romans 8:26
  - Connects to: Ch 2 (the body's refusal becomes the walk to the kitchen), Ch 3 (foreshadows the God who was already awake)
  - Momentum position: Foundation
  - central_image: phone glow over the ceiling, bedside lamp untouched
  - vulnerability_beat_seed: voice-profile.md Reader Moments — "the 2am phone-check"
  - time_marker: 2:17am
- **Ch 2: The Kitchen Lamp**
  - Core argument: Getting up is a prayer the body prays when the mouth can't.
  - Opening hook strategy: Cold tile and the click of a lamp switch at 3:04am. No preamble.
  - Key scriptures: Psalm 139:11-12, 1 Kings 19:5-8, Lamentations 3:22-23
  - Connects to: Ch 1 (answers the racing heart with a walk), Ch 3 (the kitchen lamp's yellow pool becomes the thing dawn slowly overtakes)
  - Momentum position: Building
  - central_image: yellow pool over the kitchen counter
  - vulnerability_beat_seed: voice-profile.md Reader Moments — "the kitchen at 3am"
  - time_marker: 3:04am
- **Ch 3: The God Who Keeps Watch**
  - Core argument: You didn't wake up alone. Anxiety becomes company when you let God into it.
  - Opening hook strategy: Window scene at 4:42am, first grey light.
  - Key scriptures: Psalm 121 (full), Isaiah 30:15, Zephaniah 3:17
  - Connects to: Ch 1 (names the Presence already there), Ch 2 (dawn's grey seam slowly eats the kitchen lamp's yellow)
  - Momentum position: Landing
  - central_image: grey seam of dawn overtaking artificial light
  - vulnerability_beat_seed: voice-profile.md Reader Moments — "reading the same verse you read last night"
  - time_marker: 4:42am

### Chapter Map (flat format for tool readers)

> Flat-format summary for craft-check.js --novelty parseChapterMap (Plan 13-05). The parser expects `^- Ch \d+ central_image: (.+)$`. Keep in sync with the nested list above.

- Ch 1 central_image: phone glow over the ceiling
- Ch 2 central_image: yellow pool over the kitchen counter
- Ch 3 central_image: grey seam of dawn overtaking artificial light

## Refrains

> Phase 13 fixture bypass: pre-approved refrain block so `/book-crafter:sample` bypasses the orchestrator's Refrain Candidate Gate (D-09). On non-fixture runs this block is populated interactively by the outliner's gate at the outline → Book DNA handoff.

```yaml
refrains:
  - phrase: "one small lamp refusing the whole dark"
    max_uses: 1
    scope: whole_book
```

## Running Themes

- **The long night:** Introduced Ch 1 (2:17), developed Ch 2 (3:04), closed Ch 3 (4:42). A single night, three hours, three postures.
- **Light in the night (motif family):** Same family, distinct vehicle per chapter. Ch 1 is phone glow over the ceiling with the bedside lamp untouched. Ch 2 is the yellow pool over the kitchen counter from one switched-on lamp. Ch 3 is the grey seam of dawn overtaking the artificial light at the window edge. Directional arc: night → dawn. See D-19/D-20.
- **He who keeps you will not slumber:** Psalm 121:4 as running phrase. Quoted three times.
- **Pretending vs. honesty:** Hiding in Ch 1. Honesty in Ch 2. Hosted in Ch 3.

## Key Terms and Jargon

| Term | Definition | First Used |
|------|-----------|------------|
| The 2am hour | Shorthand for the sleepless window between 2am and 4am | Ch 1 |
| Light in the night | Motif family rendered with a distinct vehicle per chapter (phone glow → yellow pool → grey seam of dawn). Same family, never the same vehicle twice. | Ch 1 |
| The Host | The God who was already awake when you woke up — not summoned, welcomed | Ch 3 |

## Cross-Chapter Continuity

- Time stamps: 2:17am, 3:04am, 4:42am — one per opening.
- The "light in the night" motif family threads through all three chapters via DISTINCT vehicles (Ch 1 phone glow, Ch 2 yellow pool over the counter, Ch 3 grey seam of dawn). No chapter may reuse another chapter's vehicle. See Refrains block for the one permitted verbatim phrase reuse cap.
- Psalm 121:4 quoted once per chapter, each time with a different weight.
- "the same verse you read last night" reader-moment in Ch 1 is answered in Ch 3.
- No pulpit-seam phrasing. No "let me tell you, church." This is a book, not a sermon.

## Style Rules

- British/SA spelling (honour, colour, realise)
- Scripture default: NKJV
- Scripture as block quote + right-aligned reference on next line — never inline
- No em dashes — use hyphen with spaces, or restructure
- Target words per chapter: ~830
- Transliterated Greek/Hebrew: maximum 1 across the whole booklet
- No numbered-steps framing.
