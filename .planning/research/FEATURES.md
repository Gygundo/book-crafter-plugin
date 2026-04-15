# Feature Research — Milestone v1.1 (Bestseller Quality + Distribution)

**Domain:** Christian/spiritual non-fiction book generation plugin (Claude Code) — second-pass writing quality + one-click distribution
**Researched:** 2026-04-15
**Confidence:** MEDIUM overall
- Install UX (Part B): **HIGH** — verified against current code.claude.com docs (plugins, plugin-marketplaces, discover-plugins pages fetched 2026-04-15)
- Bestseller craft (Part A): **MEDIUM** — principles drawn from training-data knowledge of published trade non-fiction and craft pedagogy. WebSearch access was denied during this research session, so individual author-specific claims could not be re-verified against current sources. Principles themselves are well-established in writing craft literature; named-author examples should be treated as illustrative rather than forensic.

> This file supersedes the v1.0 FEATURES research (original dated 2026-03-27). It is scoped to the v1.1 milestone only: Writing Quality v2 (Phase 10) and Packaging (Phase 11). Earlier validated features are catalogued in `.planning/PROJECT.md`.

---

## Part A — Bestseller Writing Craft (Phase 10 scope)

### The evidence we are answering to

The existing build (Phase 7) shipped captivation scoring, tension-release framework, storytelling-first hooks, block-quoted scripture, and mixed typography. Yet the Eternally Secure Ch1 sample still reads like a sermon. The concrete failures observed:

| Symptom in Ch1 | What a bestseller would have done instead |
|---|---|
| Opens "Millions of believers will go to bed tonight unsure…" — a statistic, not a scene | Named a specific person in a specific room at a specific hour |
| Central image (drowning man) first appears in paragraph 22 | Opened with the drowning man; returned to him at the pivot and the close |
| 11 transliterated Greek words in one chapter | 1-3 Greek words, each earned, each isolated for weight |
| Zero author vulnerability — no "I" anywhere | One first-person confession placed at the tension-release pivot |
| Pulpit transitions ("So let us handle it", "Here's where it gets even better") | Written-prose transitions; spoken-word seams scrubbed |
| Generic application ("what this means for you") | Named a specific reader moment — "the 2am phone-check after the argument" |

Phase 7's framework was structural (cycles, scores, typography). Phase 10 needs to be **diagnostic and prescriptive at the sentence and paragraph level** — rules the editor skill can *count* and *fix*, not just aesthetic guidance.

### Feature Landscape

#### Table Stakes (Phase 10 fails without these)

| Feature | Why Expected | Complexity | Notes |
|---|---|---|---|
| **TS-01 Scene-first opener with named human** | The opener sets whether the chapter reads like a sermon or a book. Phase 7 required "a story" but did not enforce concreteness; the model defaulted to the safer statistical opener. | LOW (rule + detector) | Editor Pass 1 must detect: sentences 1-3 must contain (a) a proper noun OR a first-person "I" narrator, (b) a time-marker ("at 2am", "last Tuesday", "the summer I turned 30"), and (c) a sensory or physical detail. A chapter that fails all three must be flagged as "significant" severity and rewritten. |
| **TS-02 Greek/Hebrew word density cap** | The Eternally Secure sample had 11 Greek words in one chapter — a sermon density, not a book density. Readers of trade Christian non-fiction (Keller, Yancey, Manning) tolerate at most 2-3 word studies per chapter. | LOW (regex count) | **Hard rule: max 3 transliterated ancient-language words per chapter.** Each word study must get at least 3 sentences of unpacking (i.e., "earned", not "scattered"). Editor detects both (a) total count and (b) the word-to-unpacking ratio. Violations demote captivation score. |
| **TS-03 Central metaphor / one-image architecture** | Bestsellers give each chapter one dominant image and return to it. Phase 7 allowed multiple images to compete; the Ch1 sample buried the drowning man. | MEDIUM (Book DNA field + writer prompt + editor check) | The outliner already picks a chapter hook; add a **Central Image** field to each chapter in the outline. The writer must (a) open on or near the image, (b) reference it at the tension-release pivot, and (c) close the chapter with a beat that resolves or echoes it. Editor Pass 1 detects: does the image appear in first 200 words, middle third, AND final 200 words? If not in all three zones → flag. |
| **TS-04 Author vulnerability beat** | Trust in non-fiction comes from the author being a fellow-sufferer, not a distant teacher. Phase 7 asked for "personal stories" generically; the editor already scores for this but the threshold is too soft (1/2 passes with no actual story). | LOW | Tighten the rule: **every chapter must contain at least one first-person confession** where the author admits doubt, failure, or not knowing. Pattern markers: "I didn't know", "I was wrong about", "I used to think", "I spent years believing", followed by a specific scene. Placement rule: the confession should land in the middle third of the chapter, adjacent to the tension-release pivot — not the opening (that's the reader's scene) and not the close (that's the landing). |
| **TS-05 Pulpit-seam scrubber** | Spoken-rhythm transitions survived the sermon adapter and editor. They are detectable and removable. | LOW (regex + rewrite) | **Ban list for chapter openings and paragraph starts:** "So", "Now", "And so", "Let us", "Let me", "Here's where", "Here's the thing", "You see", "Listen", "Church", "Friend". **Conditional ban list (ok mid-paragraph, banned at sentence start):** "But", "And", "Yet" — unless used for deliberate fragment emphasis (≤1 per 500 words). Editor Pass 1 counts; writer prompt lists the bans explicitly. |
| **TS-06 Reader-anchor specificity rule** | Generic application ("what this means in your life") reads as sermon filler. Bestsellers anchor abstraction to one concrete, nameable moment from the reader's real life. | MEDIUM | **Rule: every chapter must name at least 2 specific reader-moments.** A specific reader-moment is a scene the reader has actually lived: "the 2am phone-check", "the argument in the car on the way home", "the cursor blinking on a job application you can't send". The voice profile gets a **Reader Moments** list (~30-50 authored examples) that the writer samples from. Editor detects generic phrases ("in your life", "in your situation", "in your walk") and demotes. |
| **TS-07 Psychological tension (not structural)** | Phase 7's tension-release cycles are mechanical (opener → insight → next). A bestseller surfaces the reader's own doubt and answers *that specific doubt*. The reader should think "how did the author know I was thinking that?" | MEDIUM | Writer prompt addition: each tension beat must be phrased as an objection the reader would actually raise, in the reader's voice: *"But what if my past is too much?"* / *"If this is true, why don't I feel it?"* The editor checks for at least 2 quoted or italicised reader-thought lines per chapter. |
| **TS-08 Show-don't-tell detector for spiritual abstractions** | The Eternally Secure sample talked *about* grace rather than *showing* grace. Bestsellers dramatise the abstraction. | MEDIUM | Editor Pass 1 flags a paragraph as "telling" if it contains ≥2 abstract spiritual nouns (grace, identity, righteousness, sonship, authority, kingdom, glory, anointing) and zero concrete nouns (chair, coffee, phone, car, door, hospital, kitchen, etc.) in the same paragraph. Goal: concrete:abstract ratio ≥1:1 over any 4-paragraph window. |

#### Differentiators (what lifts the output beyond "fine")

| Feature | Value Proposition | Complexity | Notes |
|---|---|---|---|
| **DIFF-01 Sentence-length variance targeting** | Bestseller prose breathes. Sermon prose is uniformly mid-length. Phase 7 already scores paragraph variety; sentence variety is different and more granular. | LOW | Add sentence-length standard deviation check. Target: σ ≥ 8 words over any 500-word window. Flag chapters with σ < 6 as monotone. Pair with a "fragment density" rule: 1-2 sentence-fragment impacts per 1000 words. |
| **DIFF-02 Chapter ending echo** | The best chapter endings call back a specific phrase or image from the opening, making the chapter feel like a closed loop. | LOW | Writer prompt addition; editor Pass 2 detection: does any phrase from the final 200 words echo a phrase from the opening 200 words? If yes → captivation +1. |
| **DIFF-03 Dialogue breaks** | Actual dialogue (even one-line exchanges) dramatically raises readability scores. Phase 7 has no dialogue requirement. | LOW | Target: at least 1 short dialogue exchange per chapter — a remembered line from a friend, a family member, a stranger, or the author's own self-talk rendered as dialogue. Trade non-fiction (Miller, Lamott, Manning) uses this heavily. |
| **DIFF-04 Quotable pull-quote *authoring*** | Phase 7 already supports `:::pullquote` marking but writers default to restating the nearest declaration. Bestseller pull quotes are authored as standalone units — they don't appear verbatim in prose until the pull quote lifts them out. | LOW | Writer prompt rule: pull quotes must be **composed as separate lines**, ≤15 words, with a stress pattern (often a contrast: *"X isn't Y — it's Z"*). Editor Pass 1 detects pull quotes >20 words or pull quotes that repeat verbatim in a nearby paragraph and flags. |
| **DIFF-05 Specific place-names** | Keller names Manhattan. Miller names Portland. Manning names New Orleans. Naming real places buys credibility for free. | LOW | Voice profile adds optional **Author Geography** field — places the author has lived/visited. Writer samples from it for scene-setting. For the Encounter Church default, this becomes Durban, Johannesburg, Cape Town, specific neighbourhoods. |
| **DIFF-06 Bestseller diagnostic report** | Beyond the existing consistency-report, emit a "Bestseller Diagnostic" with per-chapter scores on the 8 table-stakes rules, so the user can see exactly which chapters need rework and why. | MEDIUM | New report file `reports/bestseller-diagnostic.md` with a matrix: chapter × rule × pass/fail + line-number citations for failures. |
| **DIFF-07 Re-run mode: "Rewrite this chapter for bestseller quality"** | A targeted, user-invoked rewrite that takes a single existing chapter and applies all 8 table-stakes rules in one pass. Enables iterative refinement. | MEDIUM | New skill or orchestrator mode. Reads the existing chapter, runs the diagnostic, rewrites only failing sections while preserving voice and argument. |
| **DIFF-08 "Before/After" calibration page** | Ship a one-page markdown example showing a sermon-voice paragraph next to its bestseller-voice rewrite, so the writer subagent has a concrete calibration target for *this specific transformation*. | LOW | Add to `references/voice-profiles/` as `bestseller-calibration.md`. Read by writer AND editor. Small cost, disproportionate gain (concrete examples trump rules). |

#### Anti-Features (tempting traps specific to this plugin)

| Feature | Why Tempting | Why Problematic | Alternative |
|---|---|---|---|
| **AF-01 Ban all Greek/Hebrew words** | The sample was drowning in them; "just remove them" is the easy fix. | Scripture-engaged readers expect *some* linguistic depth — that's why they bought a theological book. Zero word studies would make the book feel lightweight next to Keller/Yancey. | Density cap (TS-02) with unpacking ratio, not a blanket ban. |
| **AF-02 Force a single story-hook formula on every chapter opening** | Uniformity is easy to detect and easy to enforce, so the editor would score well. | Uniform openings across 15 chapters read as mechanical. The reader feels the template. The named-human/time/sensory rule (TS-01) enforces concreteness *without* enforcing a single template. | Three opener templates the outliner rotates: (a) named-person-in-moment, (b) first-person-memory, (c) specific-question-from-a-real-conversation. Let the outliner pick per chapter. |
| **AF-03 Run every chapter through a generic "simplify" LLM pass** | Would lower Flesch reading level, which correlates loosely with readability. | Destroys voice. Bestseller voice is not "simpler" — it's more specific. The sermon adapter already strips spoken padding; a second simplification pass would flatten the deliberate cadence that makes Miller/Manning *feel* like them. | Target sentence-length *variance* (DIFF-01), not mean sentence length. |
| **AF-04 Add a "literary quality score" LLM judge that rates chapters 1-10** | Seductive because it's one number the user can watch move. | LLM judges are unstable across runs (same text, different scores) and they reward blandness — they punish fragments, punctuation risks, and voice. Phase 7's captivation scoring is already rule-based and reliable; an LLM judge would undermine it. | Keep the rule-based captivation score and add the 8 table-stakes binary checks. Deterministic. Auditable. |
| **AF-05 Store long copyrighted voice samples as few-shot exemplars in every writer subagent prompt** | More calibration = better voice, so load 20 full paragraphs of Manning/Miller into the prompt. | Legal risk (copyrighted text) + context bloat (every chapter burns 2-3k tokens on exemplars) + it trains the voice toward the sample author, not the book's own author. | Use *paraphrased* calibration examples (authored by the plugin) in `bestseller-calibration.md`. Reference specific craft techniques ("note how sentence 3 is a fragment") without quoting copyrighted text. |
| **AF-06 Auto-insert fabricated "I remember…" openings when a chapter lacks an anecdote** | Fastest way to satisfy the vulnerability rule. | Fabricating memories for a real author is a trust violation — especially in a book meant to be delivered under a specific pastor's name. The plugin has no access to the author's actual life. | **Fail the chapter and return to the user** with a prompt: *"Ch4 needs a personal story from your life. Can you give me a 2-3 sentence memory about [topic]?"* Human-in-the-loop for memory input, not fabrication. |

### Craft sources (principles cited — confidence MEDIUM)

Every rule above maps to craft principles from named authors or craft pedagogy. Named-author claims are **MEDIUM confidence** (drawn from training-data recall, not re-verified in this session because WebSearch access was denied).

- **Anne Lamott, *Bird by Bird* (Anchor, 1994)** — the "one-inch picture frame" principle: write the smallest specific scene, not the concept. Source for TS-01 and the named-human/time-marker/sensory-detail rule.
- **Stephen King, *On Writing* (Scribner, 2000)** — "the road to hell is paved with adverbs"; lean on nouns and verbs. Source for the show-don't-tell detector (TS-08) — concrete nouns win.
- **William Zinsser, *On Writing Well* (HarperCollins)** — ruthless-cutting discipline and the clutter hitlist (pulpit transitions map to Zinsser's clutter list). Source for TS-05.
- **Donald Miller, *Blue Like Jazz* (Thomas Nelson, 2003); *A Million Miles in a Thousand Years* (Thomas Nelson, 2009)** — scene-first chapter openers with named people and specific Portland/Reed College locations. Dialogue breaks. Source for TS-01, DIFF-03, DIFF-05.
- **Timothy Keller, *The Prodigal God* (Dutton, 2008)** — central-image/one-metaphor-per-chapter discipline; the whole book is organised around re-reading one parable. Source for TS-03.
- **Brennan Manning, *The Ragamuffin Gospel* (Multnomah, 1990)** — author vulnerability as trust currency; Manning opens with his own alcoholism, failures, and doubts. Source for TS-04 and its middle-third placement rule.
- **Philip Yancey, *What's So Amazing About Grace?* (Zondervan, 1997)** — disciplined Greek/Hebrew density. Yancey uses charis, agape, and a handful of others — never 11 in a single chapter. Source for TS-02.
- **Henri Nouwen, *The Return of the Prodigal Son* (Doubleday, 1992)** — psychological tension (surfacing the reader's own unspoken objection). Nouwen models "you are probably thinking X, and I thought X too". Source for TS-07.
- **John Eldredge, *Wild at Heart* (Thomas Nelson, 2001)** — specific reader-moments ("the Monday morning commute", "the silence after the kids are in bed"). Source for TS-06.
- **Robert McKee, *Story* (Regan Books, 1997)** — structural vs psychological conflict. Source for the TS-07 distinction between mechanical and earned tension-release.

---

## Part B — Claude Code Plugin Install UX (Phase 11 scope)

### Key finding that changes scope

**There is no "zip file + drag to Claude Desktop" install path.** Claude Code plugins install via the Claude Code CLI using the `/plugin` command family, against a marketplace that Claude Code fetches via git. This matters because the milestone's framing ("one-click Claude Desktop install") needs to be reconciled with how the runtime actually works.

Confirmed via official docs (code.claude.com/docs/en/plugins, /plugin-marketplaces, /discover-plugins, fetched 2026-04-15, confidence HIGH):

- Plugins are loaded by **Claude Code** (the CLI and IDE extensions), not by the Claude Desktop chat app or claude.ai browser client.
- Install requires running commands inside a Claude Code session: `/plugin marketplace add <source>` then `/plugin install <plugin>@<marketplace>`.
- Supported marketplace sources: GitHub `owner/repo`, git URL, local path, remote URL to `marketplace.json`, npm package. **Zip file is not a supported source.**
- `claude.ai/settings/plugins/submit` and `platform.claude.com/plugins/submit` are submission portals for the **official** marketplace; they are not browser-based install flows for third-party marketplaces.
- Claude Code must be installed first (Homebrew, npm, or native installer). The recipient needs a terminal at least once.

**Implication for the milestone:** literal "one-click" is not achievable. The realistic goals are:
1. **Shortest possible command sequence** for a recipient who has Claude Code installed — four commands (marketplace add, install, reload, invoke).
2. **A README with copy-pasteable commands** that handles the entire path from "I have Claude Code" to "the plugin works".
3. **Clear prerequisite onboarding** for a recipient who does *not* have Claude Code installed yet.

### The actual install flow (verified, HIGH confidence)

**Flow A — recipient already has Claude Code installed and authenticated:**

1. Open a terminal.
2. Run `claude` to start Claude Code in any directory.
3. Inside the Claude Code session, type: `/plugin marketplace add encounter-church/book-crafter-plugin` *(assumes the plugin repo lives at that GitHub path).* Claude Code clones the repo into `~/.claude/plugins/marketplaces/` and reports success.
4. Type: `/plugin install book-crafter@book-crafter` *(exact ids come from `marketplace.json` → see PKG-02).* Claude Code copies the plugin into `~/.claude/plugins/cache/`.
5. Type: `/reload-plugins` to activate skills without restarting the session.
6. Type: `/book-crafter:orchestrator` (or the invocation name decided in Phase 11) to launch the book pipeline.

That is 4 `/plugin`-family commands in Claude Code plus a terminal launch. Everything else is Claude Code doing its normal job.

**Flow B — recipient has never installed Claude Code:**

0a. Install Claude Code: `brew install --cask claude-code` on macOS, or `npm install -g @anthropic-ai/claude-code` on any OS with Node.
0b. Run `claude` once. It opens a browser for Anthropic authentication.
0c. Proceed with steps 3-6 from Flow A.

**Flow C — recipient in Claude Code's `/plugin` TUI (mouse-friendly alternative):**

Instead of typing commands, the recipient can run `/plugin` to open the tabbed plugin manager, go to **Marketplaces → Add**, paste `encounter-church/book-crafter-plugin`, go to **Discover**, select **book-crafter**, press **Enter**, choose **User scope**, press **Enter** to install, then `/reload-plugins`. Same underlying commands; slightly less typing, still terminal-based.

### Feature Landscape — Packaging

#### Table Stakes (Phase 11 fails without these)

| Feature | Why Expected | Complexity | Notes |
|---|---|---|---|
| **PKG-01 GitHub-hosted marketplace at a public repo** | The install path *requires* a git-accessible marketplace. No zip shortcut exists. | LOW | The repo itself becomes the distribution artefact. Must contain `.claude-plugin/marketplace.json` at repo root and a `plugin.json` at the plugin root. |
| **PKG-02 `marketplace.json` with one plugin entry pointing at `./`** | Required by the marketplace loader. Without it, `/plugin marketplace add` fails. | LOW | Minimal schema: `name`, `owner`, `plugins[]` with a relative-path source. Verified against the documented schema. |
| **PKG-03 `plugin.json` with semver `version: 1.1.0`** | Required for the plugin to load AND for Claude Code to detect an update. | LOW | Already partially in place. Bump the version at milestone completion. Set `version` in `plugin.json` only — never duplicate it in `marketplace.json` (the docs warn that `plugin.json` wins silently). |
| **PKG-04 Recipient README with exact copy-paste install block** | Non-technical recipients will not reconstruct the command sequence from docs. | LOW | README must contain: (a) prerequisites (Claude Code install one-liners for macOS/Windows/Linux), (b) the 4-command install block in a ```shell fenced code block, (c) a first-invocation example with expected output, (d) where the generated .docx lands, (e) a "troubleshooting" section with the three most likely failures (`/plugin` command not recognised → update Claude Code; marketplace not loading → check repo URL; `node` not found → install Node 18+). |
| **PKG-05 LICENSE file (MIT or Apache-2.0)** | GitHub and the marketplace validator both expect an SPDX license. Recipients may be cautious about unlicensed code. | LOW | Single-file drop. MIT is simplest. |
| **PKG-06 CHANGELOG.md with v1.1.0 entry** | Update detection and recipient trust — they need to see what changed from v1.0. | LOW | Keep a Changelog format. List the 8 bestseller-quality rules (TS-01..TS-08) and the packaging changes. |
| **PKG-07 `claude plugin validate .` passes cleanly** | The validator catches the common fatal errors: bad JSON, malformed frontmatter, missing files, non-kebab-case names. Silent validation failure is the #1 reason a recipient's install fails. | LOW | Run pre-release. Also documented as the first command in the contributor section of the README. |
| **PKG-08 Release smoke-test checklist** | Without a checklist, the "does it actually work end-to-end on a fresh machine" question is answered by the recipient, not the author. | LOW | Markdown checklist: (a) fresh user-scope install on a clean laptop, (b) run orchestrator on a booklet-tier project end-to-end, (c) verify .docx output opens in Word AND Google Docs, (d) run voice builder on a sample vault, (e) run sermon adapter on a sample transcript, (f) re-run Eternally Secure Ch1 and verify all 8 TS rules pass. |
| **PKG-09 Plugin manifest metadata for discoverability** | `keywords`, `category`, `homepage`, `repository`, `description` all feed the `/plugin` Discover UI. Without them the plugin looks orphaned. | LOW | One-time edit to `plugin.json`. |

#### Differentiators (Phase 11)

| Feature | Value Proposition | Complexity | Notes |
|---|---|---|---|
| **PKG-DIFF-01 Pre-flight check skill** | `/book-crafter:doctor` verifies Node.js ≥18, docx package importable, write permissions on the project dir. Prevents silent failures on day 1. | LOW | Invoked once after install. Returns a green/red report with specific fix instructions. |
| **PKG-DIFF-02 One-command starter sample** | `/book-crafter:sample` writes a 3-chapter booklet from a pre-canned brief and produces a .docx in under 5 minutes. Recipient sees the plugin work before committing to a real project. | MEDIUM | Ships with a fixed topic (e.g., "Grace for the 3am", booklet tier). Runs the entire pipeline automatically. This is the demo that sells the tool. |
| **PKG-DIFF-03 Release notes skill** | `/book-crafter:whats-new` prints the CHANGELOG for the installed version. Reduces "what did I just upgrade to" friction. | LOW | Trivial — reads the CHANGELOG file from `${CLAUDE_PLUGIN_ROOT}`. |
| **PKG-DIFF-04 Screenshots + demo asciinema/Loom in README** | Most README readers scan images before text. A screenshot of the .docx output and a 60-second demo clip buys trust cheaply. | LOW | Author-time cost only. |
| **PKG-DIFF-05 Plugin version stamped into Book DNA** | Every generated book records the plugin version that produced it. Useful for diagnosing "my old books look different from my new books" reports. | LOW | Add `plugin_version: 1.1.0` field to the `book-dna.md` template. |
| **PKG-DIFF-06 Auto-update enabled documentation** | Recipients should not have to manually `/plugin marketplace update` every time. Third-party marketplaces default to auto-update-off; README must tell them how to flip it on via the `/plugin` UI. | LOW | Documentation-only change. |

#### Anti-Features (Phase 11)

| Feature | Why Tempting | Why Problematic | Alternative |
|---|---|---|---|
| **PKG-AF-01 Ship as a downloadable .zip** | "Drag and drop" feels user-friendly. | Claude Code cannot load a plugin from a zip. The recipient would have to unzip, navigate terminal, and `--plugin-dir` it anyway — more friction than the git path, not less. | Ship via public GitHub marketplace. The git clone happens automatically inside Claude Code. |
| **PKG-AF-02 Write a custom install.sh that does everything** | Looks like one-click. | Adds a second runtime (shell), breaks cross-platform (Windows PowerShell vs WSL vs macOS), hides what's happening from the recipient, and Claude Code is *already* the installer — a shell script can't bypass that layer. | Two `/plugin` commands inside Claude Code. Document them in the README's ```shell block. |
| **PKG-AF-03 Bundle docx-js inline in the plugin repo** | Avoids the "you need Node.js and docx" prerequisite. | Plugin repos bloat; updates are harder; `${CLAUDE_PLUGIN_ROOT}` path handling for `node_modules` is fragile across Windows/macOS/Linux; every plugin update re-ships megabytes. | Document `npm install -g docx` as a prerequisite in README. Pre-flight doctor skill (PKG-DIFF-01) checks for it and prints the exact install command if missing. |
| **PKG-AF-04 Auto-submit to the official Anthropic marketplace** | Maximum reach. | (a) Submission gates on Anthropic review, which is out of scope for this milestone. (b) Submission locks the plugin into the official-marketplace namespace rules, slowing iteration. (c) A public failure during review is reputationally expensive for an untested release. | Ship as a **public GitHub repo** under `encounter-church` (or private with the recipient added as a collaborator). Keep official-marketplace submission as a future milestone after v1.1 has been validated on 2-3 real books. |
| **PKG-AF-05 Require the recipient to sign into Anthropic again inside the plugin** | Feels like a "trusted install" polish step. | The `claude` CLI already handles authentication. Any extra auth the plugin adds is pure friction with zero security gain. | Rely on Claude Code's existing auth. |

### Feature Dependencies

```
Phase 10 (Bestseller Quality)
  TS-01 scene-first opener ──requires──> voice-profile: Reader Moments list (TS-06)
  TS-03 central image ──requires──> outliner: Central Image field per chapter
  TS-07 psychological tension ──requires──> TS-06 (reader anchors are the same concreteness axis)
  DIFF-06 diagnostic report ──requires──> TS-01..TS-08 detectors all built
  DIFF-07 targeted rewrite mode ──requires──> DIFF-06 diagnostic (tells it what to rewrite)
  DIFF-08 calibration examples ──enhances──> writer skill + editor skill (both read it)

Phase 11 (Packaging)
  PKG-04 README ──requires──> PKG-01 GitHub repo + PKG-02 marketplace.json
  PKG-07 validator ──requires──> PKG-02 + PKG-03 (JSON files to validate)
  PKG-08 smoke test ──requires──> Phase 10 complete (so the smoke test exercises v1.1 features)
  PKG-DIFF-02 sample skill ──requires──> Phase 10 voice rules (so the demo is a *good* demo)
  PKG-DIFF-05 version stamp ──requires──> PKG-03 (reads version from plugin.json)

Cross-milestone:
  Phase 11 smoke test ──validates──> Phase 10 output quality
  Phase 10 rule changes ──block──> Phase 11 v1.1.0 release (must be merged first)
```

### MVP Definition

#### Launch With (v1.1.0)

Phase 10 — bestseller quality v2:
- [x] TS-01 Scene-first opener with named human + time + sensory rule
- [x] TS-02 Greek/Hebrew word density cap (max 3 per chapter, with unpacking ratio)
- [x] TS-03 Central image architecture (Book DNA field + three-zone presence check)
- [x] TS-04 Author vulnerability beat (middle-third placement rule)
- [x] TS-05 Pulpit-seam scrubber (ban list in writer + detector in editor)
- [x] TS-06 Reader-anchor specificity (Reader Moments voice-profile field)
- [x] TS-07 Psychological tension (reader-objection phrasing in writer prompt)
- [x] TS-08 Show-don't-tell detector (concrete:abstract noun ratio)
- [x] DIFF-06 Bestseller diagnostic report (makes the rules visible per chapter)
- [x] DIFF-08 Bestseller calibration examples file

Phase 11 — packaging:
- [x] PKG-01..PKG-09 all table stakes
- [x] PKG-DIFF-02 `/book-crafter:sample` one-command starter (it's the demo that *is* the marketing)
- [x] PKG-DIFF-04 Screenshots + demo clip in README

#### Add After Validation (v1.2)

- [ ] DIFF-01 Sentence-length variance targeting — add once the 8 table-stakes rules have been validated on a re-run of Eternally Secure
- [ ] DIFF-02 Chapter ending echo — nice polish, not critical for the first re-run proof
- [ ] DIFF-03 Dialogue breaks requirement — add if the v1.1 re-run still reads as "monologue"
- [ ] DIFF-04 Pull-quote authoring rules — current `:::pullquote` support is usable
- [ ] DIFF-05 Author-geography place-names — add once the voice-builder can extract place names from the source vault
- [ ] DIFF-07 Targeted rewrite mode — build once DIFF-06 diagnostic has been in use for a book or two
- [ ] PKG-DIFF-01 Pre-flight doctor skill — high value but can wait until first install-support issue surfaces
- [ ] PKG-DIFF-03 What's-new skill — nice to have
- [ ] PKG-DIFF-05 Version stamping in Book DNA — add once v1.2 exists and version-drift is a real concern
- [ ] PKG-DIFF-06 Auto-update instructions — documentation polish

#### Future Consideration (v2+)

- [ ] Official Anthropic marketplace submission — after 2-3 milestones of stabilisation
- [ ] Non-spiritual voice profile packs (leadership, self-help, memoir) — once Book Crafter has proven on multiple spiritual books
- [ ] Audio-narration metadata export — separate concern
- [ ] Browser-based install — only if/when Claude.ai adds a browser plugin runtime (currently doesn't exist)

### Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---|---|---|---|
| TS-01 scene-first opener | HIGH | LOW | P1 |
| TS-02 Greek density cap | HIGH | LOW | P1 |
| TS-03 central image | HIGH | MEDIUM | P1 |
| TS-04 vulnerability beat | HIGH | LOW | P1 |
| TS-05 pulpit-seam scrubber | HIGH | LOW | P1 |
| TS-06 reader-anchor specificity | HIGH | MEDIUM | P1 |
| TS-07 psychological tension | HIGH | MEDIUM | P1 |
| TS-08 concrete:abstract ratio | MEDIUM | MEDIUM | P1 |
| DIFF-01 sentence variance | MEDIUM | LOW | P2 |
| DIFF-02 chapter echo | MEDIUM | LOW | P2 |
| DIFF-03 dialogue breaks | MEDIUM | LOW | P2 |
| DIFF-04 pull-quote authoring | LOW | LOW | P2 |
| DIFF-05 author geography | LOW | LOW | P2 |
| DIFF-06 diagnostic report | HIGH | MEDIUM | P1 |
| DIFF-07 targeted rewrite | HIGH | MEDIUM | P2 |
| DIFF-08 calibration examples | HIGH | LOW | P1 |
| PKG-01..PKG-09 table stakes | HIGH | LOW each | P1 |
| PKG-DIFF-01 doctor skill | MEDIUM | LOW | P2 |
| PKG-DIFF-02 sample skill | HIGH | MEDIUM | P1 |
| PKG-DIFF-03 whats-new | LOW | LOW | P2 |
| PKG-DIFF-04 screenshots/demo | MEDIUM | LOW | P1 |
| PKG-DIFF-05 version stamp | LOW | LOW | P2 |
| PKG-DIFF-06 auto-update note | LOW | LOW | P2 |

**P1** = launch with v1.1.0. **P2** = v1.2 or later. **P3** = future.

### Reference Comparison

| Dimension | Sermon-crafter (existing) | encounter-content-engine (existing) | Book Crafter v1.0 (shipped) | Book Crafter v1.1 (target) |
|---|---|---|---|---|
| Voice consistency | Single-skill, single-voice | Multi-skill, shared brand-voice.md | Multi-agent, Book DNA + voice-profile.md | Book DNA + voice-profile.md + **bestseller-calibration.md** |
| Greek/Hebrew handling | Unlimited (sermon delivery forgives density) | N/A | Unlimited | **Capped at 3 per chapter with unpacking ratio** |
| Author vulnerability | Pastoral "we" — no personal confessions | Brand voice only | Soft score (passable with zero confession) | **Required first-person confession per chapter, middle-third placement** |
| Pulpit transitions | Welcomed ("church", "let us") | Neutral | Uncaught | **Banned — regex detector + rewriter** |
| Opener enforcement | N/A | N/A | "Story" required but not concrete | **Named-human + time + sensory detail, or rewrite** |
| Distribution | Local skill file | Local plugin | Local plugin | **Public GitHub marketplace + README + smoke test** |

---

## Sources

### HIGH confidence (verified 2026-04-15)
- [Claude Code plugins documentation](https://code.claude.com/docs/en/plugins) — plugin manifest, directory layout, `--plugin-dir`, `plugin.json` schema
- [Claude Code plugin marketplaces documentation](https://code.claude.com/docs/en/plugin-marketplaces) — `marketplace.json` schema, source types, `claude plugin validate`, release channels, hosting options, troubleshooting
- [Claude Code discover-plugins documentation](https://code.claude.com/docs/en/discover-plugins) — end-user install flow, `/plugin` TUI, scopes, `/reload-plugins`, troubleshooting
- Existing repo files: `.planning/PROJECT.md`, `skills/writer/SKILL.md`, `skills/editor/SKILL.md` — current pipeline state

### MEDIUM confidence (training-data knowledge; WebSearch was denied this session)
- Anne Lamott, *Bird by Bird* (Anchor, 1994)
- Stephen King, *On Writing* (Scribner, 2000)
- William Zinsser, *On Writing Well* (HarperCollins)
- Donald Miller, *Blue Like Jazz* (Thomas Nelson, 2003); *A Million Miles in a Thousand Years* (Thomas Nelson, 2009)
- Timothy Keller, *The Prodigal God* (Dutton, 2008)
- Brennan Manning, *The Ragamuffin Gospel* (Multnomah, 1990)
- Philip Yancey, *What's So Amazing About Grace?* (Zondervan, 1997)
- Henri Nouwen, *The Return of the Prodigal Son* (Doubleday, 1992)
- John Eldredge, *Wild at Heart* (Thomas Nelson, 2001)
- Robert McKee, *Story* (Regan Books, 1997)

### Known gaps
- Individual named-author claims in Part A could not be re-verified against current web sources in this research session (WebSearch permission was denied). If REQUIREMENTS.md needs forensic citations for any specific rule, re-run this research with web access enabled. The craft *principles* themselves (scene-first concreteness, density caps, vulnerability placement, central image, psychological tension) are well-established across the craft pedagogy above.
- Whether claude.ai gains a browser-based plugin installer before v1.1 ships — not currently documented. Monitor the Claude Code changelog before release.
- Whether a non-GitHub-hosted packaging path emerges (e.g., npm-only or zip) — not currently supported as of the docs fetched today.

---
*Feature research for: Book Crafter Plugin v1.1 — Bestseller Quality + Distribution*
*Researched: 2026-04-15*
