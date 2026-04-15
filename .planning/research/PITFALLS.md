# Pitfalls Research — Writing Quality v2 + Claude Desktop Packaging

**Domain:** Multi-skill Claude Code plugin — second-pass writing quality improvements and one-click distribution
**Researched:** 2026-04-15
**Confidence:** HIGH (drawn from Phase 7 post-mortem, Claude Code plugin docs, and known multi-agent writing-system failure modes)

> **Reading order:** Start with "Phase 7 Post-Mortem" below, then Critical Pitfalls. Every pitfall here maps to a concrete prevention task in Phase 10 (Writing Quality v2), Phase 11 (Distribution), or Phase 12 (Re-run + Release).

---

## Phase 7 Post-Mortem: Why Did It Under-deliver?

Phase 7's verification report shows a 14/14 "PASSED" score and logged no gaps. Yet the Eternally Secure Ch1 output still reads like a sermon. The verification was technically correct and operationally misleading. Understanding the gap is the single most important input into v1.1.

**What Phase 7 actually verified:**
- String-match checks: `"bestselling author"` appears in `spiritual-default.md` (1 match), `"tension-release"` appears in `writer/SKILL.md` (2 matches), `"captivation_score"` appears in `editor/SKILL.md` (2 matches), etc.
- Structural checks: section headings present, styles defined in `bookStyles`, `ending_style` field wired through outliner -> writer.
- Wiring checks: the pull-quote directive flows from writer to formatter; the anti-pattern list is read dynamically by editor.

**What Phase 7 did NOT verify (and explicitly deferred to humans in section "Human Verification Required"):**
- Whether the writer agent *follows* the rules when generating real prose.
- Whether the captivation score in the editor's consistency report reflects actual captivation or is a rubber-stamp.
- Whether the new anti-patterns catch the specific failure modes present in finished chapters.
- Whether "story-first opener" produces real scenes or formulaic "Imagine a man walking into a room..." simulations.

**Root cause:** Phase 7 conflated *framework presence* with *framework enforcement*. Adding instructions to a SKILL.md does not guarantee an LLM will weight them highly during generation, especially when older theological-density instructions remain in the same document competing for attention. The writer SKILL.md is now 351 lines; the voice profile 123 lines. When both files argue for different priorities (theological depth vs. storytelling vulnerability), the model averages them — and averaging produces exactly what we got: well-argued theology dressed in a thin layer of "imagine this."

**The three structural failures inside Phase 7:**

1. **Additive, not subtractive.** Phase 7 added storytelling rules on top of existing teaching rules. Nothing was removed. The voice profile now simultaneously demands "bold declarations" and "vulnerability markers" with no hierarchy — the model defaults to the mode it was already strongest at (declarative teaching).

2. **No evidence-anchored evaluation.** Phase 7 had no captured sample of the "before" prose and no target "after" prose to compare against. The captivation_score (1-10) is an LLM self-assessment with no calibration anchors — the editor can score a sermon-flavoured chapter 8/10 because it has no reference for what an 8 looks like.

3. **Instruction shape was aspirational, not procedural.** "Open with a story, anecdote, or vivid scene before teaching begins" is a goal, not an instruction. A procedural version would be: "Write the first 150 words. These 150 words must contain zero scripture references, zero theological terms, and at least one sensory detail. If your first 150 words fail any of these, rewrite them." Phase 7 shipped the goal version.

v1.1's Writing Quality v2 exists to convert the goals into procedures, anchor them in evidence from the Eternally Secure Ch1 output, and enforce them with checks that fail loudly rather than score softly.

---

## Critical Pitfalls

### Pitfall 1: Rule Drift — Voice Profile Becomes an Unreadable Kitchen Sink

**What goes wrong:**
Each phase appends new rules to `spiritual-default.md`. Phase 7 added vulnerability markers, tension-release, bestselling-author craft, and 4 anti-patterns. v1.1 will add scene-first openers, Greek density caps, author-vulnerability beats, central-image lifting, reader-anchor specificity, and pulpit-seam detection. After two passes the profile is 300+ lines of competing imperatives with no priority ordering. The writer agent averages them and produces blandness.

**Why it happens:**
Adding feels safer than removing. Removing a rule risks losing a property we wanted. But a rule nobody follows is worse than a rule that doesn't exist, because it dilutes attention across all the rules that remain.

**How to avoid:**
- Before adding any v2 rule, explicitly remove or supersede the v1 rule it replaces. Track a per-rule kill list in `10-CONTEXT.md`.
- Cap the voice profile at 150 lines. Hard limit enforced by a line-count check in Phase 10 verification.
- Move deep reference material (theological framework, scripture handling) into a *separate* `theological-framework.md` file so the voice profile stays purely about voice.
- Introduce a priority header to each rule: `PRIORITY: MUST | SHOULD | NICE`. The writer must satisfy all MUSTs before considering SHOULDs.

**Warning signs:**
- Voice profile grows past 200 lines.
- Two rules say opposite things ("bold declarations" vs "vulnerability markers" without conditional guidance).
- Writer output reads as compromise between two modes rather than committed to one.

**Phase to address:** Phase 10 — prevention task: "Audit voice profile, remove every rule superseded by v2 additions, split theological framework to its own file, enforce 150-line cap."

---

### Pitfall 2: Over-Correction — Banning Pulpit Seams Also Bans Rhythm Fragments

**What goes wrong:**
"Pulpit seam detection" adds anti-patterns for sermon transitions ("Here's the thing...", "Now watch this...", "Listen to me..."). These phrases also happen to be exactly how the target voice's punchy fragments work. An over-zealous anti-pattern list kills the voice's strongest feature while trying to remove its weakest.

**Why it happens:**
Anti-patterns are easy to write as substrings. Voices are context-dependent. A one-line anti-pattern is a hammer; voice moves are scalpel work.

**How to avoid:**
- Pair every new anti-pattern with a "permitted usage" counter-example. Anti-pattern: `Now watch this` → Permitted: `used once per chapter at the pivot moment, never to transition between teaching points`.
- Run the Eternally Secure Ch1 *good* paragraphs through the anti-pattern list before shipping — any rule that flags a paragraph we want to keep is too broad.
- Count-based limits, not outright bans: `"Maximum 1 instance of 'Here's what most people miss' per chapter"`, not `"never use"`.

**Warning signs:**
- Writer output flattens into uniform sentence length after the rule change.
- Revised chapter reads more "correct" but less alive.
- Editor consistency report shows high scores on a chapter that feels dead.

**Phase to address:** Phase 10 — prevention task: "Before locking any pulpit-seam anti-pattern, quote one paragraph from current Ch1 that legitimately uses similar rhythm and confirm the rule doesn't flag it."

---

### Pitfall 3: Mechanical Vulnerability Beats

**What goes wrong:**
"Insert one personal anecdote per chapter" becomes a formulaic beat. Every chapter opens with the same shape: 150-word personal story → pivot sentence → teaching. Readers notice by chapter three. The "vulnerability" starts to feel manufactured, which is worse than not having it.

**Why it happens:**
Quota-based prescriptions with no variation rules produce the sincerest form of formulaic writing: the earnestly templated memoir moment. Multi-agent systems amplify this because each chapter-writer agent reads the same rule and applies it the same way.

**How to avoid:**
- Distribute the vulnerability beats across the book outline *before* writing begins: chapter 1 gets an opening anecdote, chapter 2 gets a mid-chapter confession, chapter 3 gets none, chapter 4 gets a closing admission. The outliner (not the writer) assigns the shape.
- Forbid synthetic anecdotes: a writer agent that cannot point to a real author-experience or real source-material experience may NOT fabricate one. The rule is "draw from source or skip the beat", never "invent a scene".
- Require variation: two consecutive chapters may not use the same vulnerability-beat shape.

**Warning signs:**
- Two chapters open with the same sentence structure.
- Personal stories contain no specific detail (no names, no places, no dates).
- Anecdotes are interchangeable — you could swap them between chapters and nothing would break.

**Phase to address:** Phase 10 — outliner change: "Add `vulnerability_beat_shape` field to chapter metadata; writer reads it; writer refuses fabrication."

---

### Pitfall 4: Simulated Scene-Openers ("Sarah was sitting in a cafe...")

**What goes wrong:**
"Story-first opener" forces the writer agent to produce a scene. With no grounded source material, the agent invents generic fiction: unnamed women in unnamed cafes having unnamed realisations. Readers trained on bestsellers detect synthetic scenes immediately — the scene has no load-bearing detail, no smell, no specific city, no real name. It reads as AI.

**Why it happens:**
The writer agent is asked to produce a scene whether or not scene material exists. Its options are: (a) invent, (b) refuse, (c) rewrite the opener as observational prose. The Phase 7 rules give it only option (a).

**How to avoid:**
- Grounded-scene rule: a scene opener is only valid if it draws from (1) source material in `sources/` or `sources-adapted/`, (2) the author's known biography in `book-dna.md`, or (3) a documented public event. If none apply, the writer must use an observational or second-person opener instead ("You know that moment when...", "Picture the scene any parent will recognise...").
- Source-provenance requirement: every personal scene in writer output must cite a source file or book-dna line in a trailing comment (`<!-- source: sources-adapted/sermon-2024-03-14.md:47 -->`) that the editor strips at finalise time.
- Editor Pass 1 adds a "scene provenance" check: any scene-opener missing a source comment is flagged.

**Warning signs:**
- Unnamed protagonists, generic settings.
- Scenes that could be in any book.
- No sensory detail or detail is plausible-generic (mahogany desk, steaming coffee).
- The same "anonymous friend" appears in multiple chapters.

**Phase to address:** Phase 10 — writer skill change: "Grounded-scene rule with provenance comments; editor check for provenance."

---

### Pitfall 5: Voice Drift Across Parallel Chapter Agents — Amplified by Stricter Rules

**What goes wrong:**
Stricter rules paradoxically increase drift. Each chapter-writer subagent interprets "more vulnerability" differently — one writes confessional, another writes wry, a third writes dramatic. Because the rules are stricter, each agent pushes harder in its chosen direction, amplifying rather than averaging out variation. The book feels like five authors fighting.

**Why it happens:**
Parallel subagents with shared high-level instructions and no normalising signal diverge along whatever dimension is most ambiguous. Tightening ambiguity on axis A while leaving axis B open moves the drift to axis B.

**How to avoid:**
- Calibration exemplar: include a 500-word finished paragraph in `book-dna.md` that demonstrates the target voice applied to a theme from THIS book. Every chapter-writer opens by reading it. This is the normalising anchor.
- Single-pass pilot: write chapter 1 inline (not in a subagent), edit it to target voice, copy the edited chapter 1 into book-dna as the calibration exemplar, THEN spawn parallel writers for chapters 2+.
- Cross-chapter voice diff in editor Pass 3: compare sentence-length distribution, vocabulary diversity, and "bold declaration density" across chapters. Flag outliers.

**Warning signs:**
- Chapters read as if by different people.
- Captivation scores vary wildly (ch1: 9, ch3: 5, ch5: 8).
- Editor needs extensive rewrites on specific chapters but not others.

**Phase to address:** Phase 10 — writer + editor change: "Calibration exemplar in Book DNA; pilot-first-chapter pattern; cross-chapter voice diff in Pass 3."

---

### Pitfall 6: Evaluator Deadlock — Captivation Scorer Infinite Loop

**What goes wrong:**
v2 tightens the captivation score threshold from "editor passes if >= 6/10" to "editor passes if >= 8/10". The editor rejects chapter 3. Writer revises. Editor still rejects (the rubric is vague, the scorer is stochastic). Three revisions later, the chapter is objectively worse but the scorer finally rolls high enough to pass. Or worse, the loop runs until token budget dies.

**Why it happens:**
LLM-as-judge with no anchored rubric drifts. Each revision chases a moving target. The evaluator and the writer are both stochastic, so "pass" is a dice roll not a convergence.

**How to avoid:**
- Hard iteration cap: maximum 2 revision passes per chapter. After 2, escalate to human review, do not loop.
- Anchored rubric: the captivation rubric references specific sentences from a labelled exemplar set (e.g., "scene-openers as vivid as `book-dna-examples/ch1-opener-v3.md` = 9, vivid but generic = 6, no scene = 3"). Scoring is relative to anchors, not an abstract 1-10.
- Divergent-improvement detection: if revision N scores LOWER on any sub-metric than revision N-1, stop and accept revision N-1. Never allow a chapter to get worse in pursuit of a score.
- Budget guardrail: the orchestrator enforces a max-revisions-per-book budget (e.g., 3 x chapter_count). If exceeded, flush remaining revisions and ship.

**Warning signs:**
- Revision 2 of a chapter is shorter and blander than revision 1.
- Editor flags the same paragraph repeatedly with different framing.
- Token usage blows past expected budget during editing.

**Phase to address:** Phase 10 — editor skill change: "Anchored rubric, iteration cap, divergent-improvement detection, budget guardrail."

---

### Pitfall 7: Greek-Word Density Cap Starves Theological Depth

**What goes wrong:**
Evidence from Ch1 shows too many Greek/Hebrew word studies piled into one chapter, contributing to sermon feel. The obvious fix — a cap of "max 2 Greek words per chapter" — may starve chapters whose whole argument is built on a word study (e.g., an entire chapter on *dikaiosune*). The cap fixes the symptom and kills the strength.

**Why it happens:**
Blanket numerical caps ignore chapter-level variance. Non-fiction chapters have legitimately different information densities.

**How to avoid:**
- Per-chapter cap set by outliner, not writer: the outliner assigns each chapter a `greek_density` field (low / medium / high). Low = 0-1 terms, medium = 2-3, high = 4-6 with dedicated treatment. The book-level average must come in under target.
- Presentation rule separate from count rule: even in a high-density chapter, no more than one Greek term per 800 words of continuous prose. Cluster them in a dedicated section instead of sprinkling.
- Reader-friendly format: Greek term must appear inline only with English first, Greek second, definition third (`righteousness — *dikaiosune* — rightness of standing before God`). Never Greek-first.

**Warning signs:**
- Chapter reads as a word-study tour rather than an argument.
- Multiple Greek terms in the same paragraph.
- Greek appears before English equivalent.

**Phase to address:** Phase 10 — outliner skill change: "Add `greek_density` field; writer enforces per-chapter and per-800-words caps."

---

### Pitfall 8: Editor Passes That Rewrite Instead of Revise

**What goes wrong:**
The captivation-driven editor, given a chapter scored 5/10, rewrites entire paragraphs in its own voice. The revised chapter scores 9/10 on captivation but no longer sounds like the author — it sounds like the editor agent. Voice is murdered in pursuit of score.

**Why it happens:**
"Revise" and "rewrite" are adjacent tasks; LLM editors default to rewriting because generating new prose is what they're best at. Without a diff constraint, there's no force pulling them toward minimal edits.

**How to avoid:**
- Diff budget: editor may change at most 25% of tokens per chapter per pass. Enforced by a post-edit diff count; if exceeded, revert and flag for human review.
- Preserve signature phrases: the writer marks signature sentences with `<!-- voice:keep -->` comments (drawn from voice profile's "signature moves"). Editor cannot alter sentences inside those markers.
- Track-changes mode: editor produces a change list (`delete "X", replace with "Y", reason: "list-heavy anti-pattern"`) rather than a rewritten file. Orchestrator applies changes.
- Voice fingerprint check: after editing, compare bigram distribution and sentence-length histogram against pre-edit chapter. Large divergence = rewrite masquerading as revision = reject.

**Warning signs:**
- Edited chapter has different vocabulary distribution than original.
- Signature phrases from the voice profile disappear.
- Author reading the edit says "this doesn't sound like me".

**Phase to address:** Phase 10 — editor skill change: "Diff budget, signature-phrase preservation, track-changes mode, voice fingerprint check."

---

### Pitfall 9: Writer v2 Rules Conflict With Sermon Adapter Rules (Phase 9 Wiring)

**What goes wrong:**
The sermon adapter (Phase 6/9) already transforms spoken-rhythm text to written-rhythm, applying its own list of rules: remove audience addresses, replace "Here's what I love about that" seams, convert vocal emphasis to italics, etc. v2 writer rules may duplicate some transformations (creating double-edits) or conflict with others (adapter adds a callback phrase that the writer's pulpit-seam detector then flags and removes). The pipeline fights itself.

**Why it happens:**
Two independently-developed rule sets touch the same territory with no explicit handoff contract.

**How to avoid:**
- Single source of truth for sermon-to-written transformations: adapter owns them. Writer v2 rules explicitly state "the adapter has already handled X, Y, Z — do not re-apply."
- Document the handoff contract in `references/adapter-writer-contract.md`: what the adapter guarantees, what the writer assumes, what neither touches.
- End-to-end test: run one adapted sermon through adapter then writer, diff intermediate stages. If the writer "corrects" something the adapter produced, the contract is broken.
- Rule-owner tag on every anti-pattern: `owner: adapter` or `owner: writer`, not both.

**Warning signs:**
- Writer strips phrases the adapter just added.
- Editor flags patterns that only exist because of adapter output.
- Different-looking output when running the same source twice (non-idempotent).

**Phase to address:** Phase 10 — cross-skill change: "Adapter-writer contract file; writer v2 rules tagged with owner; end-to-end diff test."

---

### Pitfall 10: Stale Book DNA — Re-run Produces Worse Output Than Original

**What goes wrong:**
Re-running Eternally Secure through the updated pipeline fails because the original run left a `book-dna.md` with the v1 voice profile baked in. The new writer skill reads the same stale file, applies v2 rules on top, and produces Frankenstein output — v1 voice anchors fighting v2 rules. Or the outliner skips outline regeneration because `chapter-outline.md` already exists, so the new ending_style and vulnerability_beat fields never get populated. Or the `.planning/phases/09*` sources-adapted artefacts are reused without re-running the adapter against current rules.

**Why it happens:**
The pipeline is designed to be resumable, which means it caches. Cached artefacts carry the *assumptions of the version that produced them* as silent configuration.

**How to avoid:**
- Explicit clean-re-run mode in orchestrator: a new `--fresh` flag (or orchestrator Mode 6: "Re-run from scratch") that deletes `book-dna.md`, `chapter-outline.md`, `research/`, `drafts/`, `revisions/`, `final/` before starting, preserving only `sources/`, `sources-adapted/`, and user-authored `brief.md`.
- Version stamp in every generated artefact: `<!-- generated-by: book-crafter v1.1.0 -->`. On re-run, orchestrator refuses to reuse any artefact from a prior plugin version unless user passes `--reuse-stale`.
- Separate output directory per run: `runs/2026-04-15-v1.1/` rather than overwriting `final/`. Preserves evidence for diffing.
- Adapter re-run contract: re-running the book re-runs the adapter if `sources/` or the adapter SKILL.md has changed since last adaptation.

**Warning signs:**
- Re-run finishes in half the expected time (skipped stages).
- New metadata fields (ending_style, vulnerability_beat_shape) missing from chapter-outline.md.
- Output contains v1 phrasing that the v2 anti-patterns explicitly forbid.
- Diff between run 1 and run 2 is suspiciously small.

**Phase to address:** Phase 10 (orchestrator change) + Phase 12 (used during Eternally Secure re-run) — task: "Add `--fresh` re-run mode, version stamps on all artefacts, separate run directories, adapter re-run contract."

---

### Pitfall 11: Re-run Produces Different Output But No One Can Tell If It's Better

**What goes wrong:**
Eternally Secure is re-run. Output is different from the Phase 7 result. Nobody can articulate *why* it's better — "it feels less sermon-y" is not verifiable, and the captivation score is a self-assessment from the same system that just produced the output. Without evidence-anchored evaluation, shipping v1.1 is pure vibes.

**Why it happens:**
Writing quality is subjective, AI self-assessment is unreliable, and human reading of a whole book is expensive. The path of least resistance is to trust the captivation score and ship.

**How to avoid:**
- Frozen "before" sample: save `evidence/eternally-secure-ch1-before.md` (the Phase 7 output) as an immutable baseline. Do not edit it.
- Paired evaluation artefact: after re-run, produce `evidence/eternally-secure-ch1-comparison.md` with before/after paragraphs side-by-side against the seven specific gap areas (scene-openers, Greek density, vulnerability, central image, tension-release, reader anchor, pulpit seams). Each gap gets a specific quoted line from "before" and "after" plus a one-line improvement description.
- Third-party pass: use a separate Claude session (fresh context, no plugin access) to read both versions and rank them. Log the output into `evidence/external-review.md`.
- Hard gate: Phase 12 cannot mark "verified" until the comparison file has a line for every one of the seven gap areas AND an explicit "ship / don't ship" call from David.

**Warning signs:**
- Re-run "feels better" but nobody can point to specific improvements.
- Captivation score goes up but no specific sentences are cited as evidence.
- Comparison file skips some of the seven gap areas.

**Phase to address:** Phase 12 (Re-run + Release) — task: "Frozen before-sample, seven-gap comparison file, third-party pass, hard gate."

---

### Pitfall 12: Zip Ships Hidden Files — .DS_Store, .planning/, node_modules, .git

**What goes wrong:**
The release zip built with a casual `zip -r book-crafter.zip .` ships: 240MB of `.git` history, the entire `.planning/` folder with its strategy docs and internal notes, macOS `.DS_Store` files, stale `node_modules` if docx was ever installed locally, screenshot caches, editor swap files. Zip balloons from 2MB to 300MB. Worse: `.planning/` may contain unreleased feedback, internal reviews, or confidential file paths.

**Why it happens:**
Developer machines are messy. The default behaviour of zip/tar is "include everything". There is no safety net.

**How to avoid:**
- `.plugin-ignore` file checked into the repo listing exact exclusions:
  - `.git/`, `.gitignore`, `.gitattributes`
  - `.planning/`, `.omc/`, `.claude/` (local workspace state)
  - `.DS_Store`, `Thumbs.db`, `desktop.ini`
  - `node_modules/`, `*.log`, `npm-debug.log`
  - `.vscode/`, `.idea/`, `*.swp`, `*~`
  - `evidence/`, `runs/`, `drafts/` (output artefacts from test runs)
  - `memory/`, `feedback_*.md` (personal notes)
  - `*.zip`, `*.tar.gz` (previous build outputs)
  - `.env`, `.env.*`
- Build script (`scripts/build-release.sh`) that uses an explicit whitelist — only copies `.claude-plugin/`, `skills/`, `agents/`, `references/`, `commands/`, `README.md`, `LICENSE`, `CHANGELOG.md` into a temp build dir, then zips from there. Never zips the repo root.
- Size check in build script: if output zip > 5MB, fail with list of 10 largest files for inspection.
- Manifest check: unzip the output to a temp directory and list contents to `build/manifest.txt`, review before release.

**Warning signs:**
- Release zip > 5MB.
- `unzip -l book-crafter.zip` shows any file starting with `.`.
- Any path containing `planning`, `evidence`, `memory`, or `David`.

**Phase to address:** Phase 11 (Distribution) — task: "Build script with whitelist, size check, manifest review."

---

### Pitfall 13: Marketplace Manifest Schema Drift

**What goes wrong:**
Claude Code's plugin/marketplace manifest schema evolved between the plugin's start and v1.1. Fields that existed in early docs (e.g., hypothetical `entry_point`, `permissions`) are removed or renamed. The submitted marketplace.json is rejected, or worse, silently ignored, and the plugin installs as "unknown plugin".

**Why it happens:**
Claude Code is young. Plugin spec is evolving. The `.claude-plugin/plugin.json` written in Phase 1 is from a version of the spec that may not be current.

**How to avoid:**
- Re-verify the schema against current official docs at the start of Phase 11 — do NOT trust the Phase 1 manifest. Fetch `https://code.claude.com/docs/en/plugins` and `https://code.claude.com/docs/en/plugin-marketplaces` (or current equivalents) and diff against current plugin.json.
- Schema-validate plugin.json with whatever validator exists (or at minimum, a JSON schema check against the documented shape).
- Smoke-install into a fresh Claude Desktop profile (or test directory) before publishing. If the plugin doesn't appear or errors on load, fix before release.
- Pin the spec version: include a `spec_version` comment in plugin.json noting which docs date it was validated against.

**Warning signs:**
- Fields in plugin.json that don't appear in current docs.
- Plugin loads but skills don't show up in `/help`.
- Install completes but namespace is wrong.

**Phase to address:** Phase 11 — task: "Re-verify current plugin spec, schema-validate manifest, smoke-install to fresh profile."

---

### Pitfall 14: Dev Install Conflicts with Marketplace Install on Same Machine

**What goes wrong:**
David develops the plugin at `/Users/David/Development/book-crafter-plugin`. Claude Code loads it from that path as a dev plugin. The marketplace version, once installed, lands at `~/.claude/plugins/book-crafter/`. Both are loaded. Skills collide. Commands fire twice. David can't tell which version is actually running when testing.

**Why it happens:**
Claude Code's plugin loader may load both dev paths and installed plugins. No conflict detection.

**How to avoid:**
- During development, use a clearly different name in dev vs. release: dev `plugin.json` uses `"name": "book-crafter-dev"`, release uses `"name": "book-crafter"`.
- Document the dev→release switch in a `DEV-NOTES.md` (internal, not shipped) that says: "Before building release, the build script rewrites `name` from `book-crafter-dev` to `book-crafter`. Never ship a zip with `-dev` suffix."
- Pre-release checklist: "Uninstall dev version from Claude Desktop, install release zip from fresh, confirm skills resolve correctly."
- If Claude Code supports plugin source priority, document which wins and why.

**Warning signs:**
- Skills fire twice or output is duplicated.
- Fixes in dev don't appear in Claude (because installed version is running).
- `/help` shows two copies of the same command.

**Phase to address:** Phase 11 — task: "Dev vs release naming; build script name rewrite; pre-release uninstall check."

---

### Pitfall 15: Skill Namespace Collisions With Other Plugins

**What goes wrong:**
The plugin defines `skills/writer/SKILL.md`. The recipient already has another plugin with a `writer` skill. Claude Code either overrides one, prompts the user, or errors. If our skill names are generic (`writer`, `editor`, `formatter`) the collision is likely.

**Why it happens:**
Generic skill names are common. Without namespacing discipline, collisions are inevitable.

**How to avoid:**
- Confirm Claude Code's namespace handling: read current docs to see whether `plugin_name:skill_name` is automatic or manual. If automatic, verify it actually works by installing alongside a test plugin with a colliding skill name.
- Name skills distinctively in documentation: expose as `book-crafter:writer` in all READMEs and example commands.
- Test against a recipient who has at least 2 other plugins installed — collision detection must include real-world plugin combinations, not isolation testing.

**Warning signs:**
- `/help` shows "writer" without plugin prefix and it's not ours.
- Invocation produces unexpected behaviour (another plugin's skill ran).
- Plugin install warns about conflicts.

**Phase to address:** Phase 11 — task: "Verify namespace handling; smoke-test against installed plugins."

---

### Pitfall 16: README Assumes Terminal Familiarity — Recipient Is Non-Technical

**What goes wrong:**
The README says: "Clone the repo, run `npm install -g docx`, drop the folder into `~/.claude/plugins/`, restart Claude." The recipient does not have a terminal, has never run `npm`, does not know what `~/.claude/plugins/` is or how to find it. They give up. The plugin ships but is un-installable by the intended user.

**Why it happens:**
Developer empathy gap. "Simple" means different things to developers and non-technical users.

**How to avoid:**
- Write the README for a user who has never opened Terminal in their life. Primary install path is Claude Desktop's in-app marketplace — no file operations at all.
- Zero-terminal install path: user clicks "Install" in Claude Desktop marketplace, plugin appears, done.
- If any manual step is unavoidable (e.g., one-time docx install), provide: (a) a screenshot walkthrough, (b) a one-command installer script that Claude Code itself can run on first use, (c) a clear fallback that links to a support email.
- Test the README with a real non-technical person before release. If they can't install it in 5 minutes, rewrite.
- Replace every instance of `/Users/David/...` with a generic path or, better, no path at all (plugin should be location-independent).

**Warning signs:**
- README contains words like "terminal", "cd", "npm", "chmod" in the install section.
- Install steps reference absolute paths.
- Recipient can't complete install without asking a developer.

**Phase to address:** Phase 11 — task: "Non-technical README with zero-terminal install path; test with non-developer reader."

---

### Pitfall 17: Missing Node / docx-js on Recipient Machine

**What goes wrong:**
The formatter skill executes `node` to run docx-js. The recipient's machine has no Node.js, or an ancient version, or no `docx` package. The first time the recipient runs "write a book", the final stage crashes with `command not found: node` or `Cannot find module 'docx'`. The recipient gets no book and doesn't know why.

**Why it happens:**
Plugin assumes runtime dependencies are ambient. They aren't.

**How to avoid:**
- Preflight check skill (`skills/doctor/SKILL.md` or similar) that runs on orchestrator start: verifies `node --version` >= 18, verifies `node -e "require('docx')"` succeeds, verifies `python --version` if validate.py is used. Fails loudly with remediation steps.
- In-plugin vendoring: ship `docx` inside `skills/formatter/lib/` and call it with an absolute path. Recipient needs Node but not npm. Check the docx licence allows redistribution (MIT — yes).
- Node install instructions in README with direct download links (nodejs.org LTS), platform-specific, with a "Got stuck? Email me" line.
- Graceful degradation: if `docx` is not present, formatter falls back to writing `book.md` and tells the user to convert manually. A broken formatter stage must not lose the generated chapters.

**Warning signs:**
- Plugin crashes on first run on a clean recipient machine.
- Error messages mention `require`, `node_modules`, or file paths.
- Recipient produces chapters but never gets a .docx.

**Phase to address:** Phase 11 — task: "Doctor skill preflight; vendor docx in zip; graceful fallback."

---

### Pitfall 18: Missing or Wrong LICENSE, CHANGELOG, Version Stamp

**What goes wrong:**
Marketplace rejects the plugin for missing LICENSE. Or recipient doesn't know what they're allowed to do with it. Or plugin.json still says `"version": "0.1.0"` from Phase 1 and recipients have no way to know if they're running v1.1 or the original alpha. CHANGELOG is missing so nobody knows what changed between v1.0 and v1.1.

**Why it happens:**
These feel like paperwork and get deferred until release day, when they're forgotten.

**How to avoid:**
- LICENSE file at repo root with an explicit open-source licence (MIT recommended for a Claude Code plugin — minimal friction).
- Version stamping: the build script REFUSES to build if `plugin.json` version doesn't match the CHANGELOG's top entry and the release tag. Enforce `semver` format.
- CHANGELOG.md with v1.1.0 entry listing: new writer v2 features, the seven captivation gaps addressed, the packaging changes, breaking changes (if any re-run behaviour changed), upgrade notes.
- README prominently shows current version and a "What's new" link to CHANGELOG.
- Git tag `v1.1.0` before build — the build script reads the tag as the source of truth.

**Warning signs:**
- `plugin.json` version unchanged since Phase 1.
- No CHANGELOG.md file, or CHANGELOG missing v1.1 entry.
- No LICENSE.

**Phase to address:** Phase 11 — task: "LICENSE, CHANGELOG, version-stamp build gate."

---

### Pitfall 19: Docs Reference David's Personal File Paths

**What goes wrong:**
Orchestrator SKILL.md or examples say "save to `/Users/David/Documents/Books/`" or "the sermon source lives in `~/Library/Application Support/...`". A non-David recipient pastes the example, gets an error, is confused. Worse, exposes David's personal directory structure.

**Why it happens:**
Examples get written during development using real paths and never generalised.

**How to avoid:**
- Grep pass in Phase 11: search all files in the release whitelist for `/Users/David`, `/Users/`, `~/Development`, `~/Documents`, `/Volumes/`. Zero matches allowed in shipped files.
- Replace with generic: `<your project directory>`, `~/my-books/`, or — better — make the orchestrator prompt for paths interactively so examples aren't path-dependent.
- Scrub author-specific references: "David's preaching style" in voice profile becomes "the author's preaching style" unless it's a genuine bio field.
- CI/check in build script: fail build if any shipped file contains the literal string `/Users/David`.

**Warning signs:**
- `grep -r "/Users" skills/ references/ agents/ commands/` returns matches.
- Recipient asks "where is David's Documents folder?"
- Example paths don't work on Windows (forward-slash assumptions).

**Phase to address:** Phase 11 — task: "Personal-path scrub, build-time grep gate."

---

### Pitfall 20: Cross-Platform Path Assumptions (Windows Recipient)

**What goes wrong:**
Plugin uses `/` path separators, `~` for home, shell-style quoting, `.sh` scripts. A Windows recipient installs it. Skills that shell out break. Paths like `~/.claude/plugins/book-crafter/skills/formatter/lib/` don't resolve. Build scripts `./scripts/build-release.sh` can't run.

**Why it happens:**
Mac-only development blindness.

**How to avoid:**
- Let Claude Code handle all path resolution — never construct paths with string concatenation and separators in skill instructions. Tell the agent "read the voice profile file" not "read `$PLUGIN_ROOT/references/voice-profiles/spiritual-default.md`".
- All runtime scripts are `.js` or `.py`, not `.sh`. Build scripts can be `.sh` because they're developer-only, but must not ship.
- Test the installed plugin on at least one Windows machine (or WSL) before release. Include "tested on: macOS 14, Windows 11" in CHANGELOG.
- Use `node path.join`, `python pathlib`, or equivalent — never hand-written `/`-separated strings — in any file that ships.

**Warning signs:**
- `.sh` files in the release whitelist.
- Hardcoded `/` separators in skill instructions that construct paths.
- Tilde `~` expansion assumed.
- Windows recipient reports "file not found" on install.

**Phase to address:** Phase 11 — task: "No shell scripts in release; path abstraction check; Windows smoke test."

---

## Process Pitfalls

### Pitfall 21: Skipping Re-Run of Eternally Secure Between Phase 10 and Phase 11

**What goes wrong:**
Writer v2 ships in Phase 10. Packaging ships in Phase 11. Release happens. Nobody ran the Eternally Secure book through the updated pipeline because "the rules are in the files, the verification passed". Recipients install v1.1 and produce books that still read like sermons. The entire premise of v1.1 ("evidence-driven fix for Phase 7 gaps") is unverified at release time.

**Why it happens:**
Writing tests (a re-run) is expensive. Verification passing feels sufficient. Calendar pressure favours shipping over re-running.

**How to avoid:**
- Hard phase ordering: Phase 12 exists specifically as the re-run gate. Phase 11 packaging cannot be marked complete until Phase 12 produces a signed comparison file with all seven gaps addressed.
- The release zip Git tag waits on Phase 12's sign-off — technically enforceable if build script reads from a `RELEASE-READY` marker file that Phase 12 writes.
- Phase 12 is not skippable; roadmap explicitly names it "Re-run + Release" and makes re-run a prerequisite for release.

**Warning signs:**
- Phase 11 marked complete without any reference to Eternally Secure output.
- Release tag applied before comparison file exists.
- Release zip contains writer v2 changes but no evidence the changes improved output.

**Phase to address:** Phase 12 — enforced by roadmap: "Phase 11 cannot complete until Phase 12 re-run evidence is signed off."

---

### Pitfall 22: README Claims "Bestseller Quality" When Output Is Still Teaching-Shaped

**What goes wrong:**
Marketing copy written during planning becomes README text during packaging. The README says "generates books that read like they were written by a bestselling author". The actual output, even after v1.1, is a significant improvement over Phase 7 but still recognisably teaching-shaped. First reviewers call it out. Trust damage.

**Why it happens:**
Internal language ("core value: every chapter reads like a bestseller") ports verbatim into external language without calibration against what the tool actually produces.

**How to avoid:**
- Write README claims AFTER Phase 12 re-run is complete. Phase 11 README draft is a placeholder; Phase 12 finalises language based on evidence.
- Honest capability language: "teaching books with storytelling craft, scriptural depth, and a consistent voice across chapters" is more defensible than "bestseller quality".
- The comparison file from Phase 12 is the source of truth for README capability claims. Every claim in README must be supportable by a specific line in the comparison file.
- Peer review: David or a trusted reader sanity-checks README against actual output before release.

**Warning signs:**
- README uses superlatives ("bestseller", "professional", "publication-ready") without qualification.
- No direct link between README claims and Phase 12 evidence.
- Reviewer reads README and expected output, then reads actual output, and the gap is visible.

**Phase to address:** Phase 12 — task: "Finalise README language against Phase 12 comparison evidence; remove unsupportable claims."

---

### Pitfall 23: Skipping Smoke-Test, Marketplace Ships Broken

**What goes wrong:**
Release zip is built. Marketplace entry is submitted. Nobody installed the zip on a fresh machine first. Recipients install, plugin fails to load because of a typo in plugin.json, or because a skill references a file that was accidentally excluded by the build whitelist. First install crashes. Plugin is pulled.

**Why it happens:**
Smoke-testing requires disciplined environment hygiene (fresh Claude Desktop profile, no dev install). It's tempting to test in the dev environment where everything is already working.

**How to avoid:**
- Mandatory fresh-profile smoke test before marketplace submission:
  1. Uninstall dev version.
  2. Clear `~/.claude/plugins/book-crafter/` completely.
  3. Install release zip via marketplace (or manual drop-in simulating marketplace install).
  4. Restart Claude Desktop.
  5. Run: "Write a 3-chapter booklet on [topic]" end-to-end.
  6. Verify .docx output exists and opens in Word.
  7. Verify all skills resolve via `/help` and show book-crafter namespace.
- Smoke-test checklist in `RELEASE-CHECKLIST.md` that must be ticked before tagging.
- Log smoke-test output to `evidence/smoke-test-<date>.md` as a release artefact.

**Warning signs:**
- No smoke-test log exists for the current release candidate.
- Dev install was not uninstalled before testing.
- No evidence that the zip was unpacked and installed fresh, not just loaded from the repo path.

**Phase to address:** Phase 12 — task: "Fresh-profile smoke-test before tagging; signed checklist; smoke-test evidence log."

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Additive voice-profile rules (never remove) | Faster iteration, nothing "lost" | Profile bloats, model averages conflicting signals, voice flattens | Never — every addition must be paired with a removal or supersession note |
| LLM-as-judge captivation score without anchors | Free, fast quality signal | Score drifts, infinite edit loops, false confidence | Never in production; acceptable only for internal telemetry if clearly labelled unreliable |
| Cache Book DNA across runs | Faster re-runs | Stale assumptions silently override new rules | Only with explicit version-stamp match; never across plugin minor versions |
| `zip -r .` to build release | 30 seconds faster than a build script | Ships secrets, bloats to 300MB, risks PII leak | Never — always whitelist build |
| Ship with "install docx globally" instructions | Avoids vendoring | Breaks for non-technical users, ambient-dependency fragility | Only if recipient is a developer; never for the current v1.1 target |
| Reuse Phase 7 chapter-outline.md on re-run | Saves outline regeneration | New metadata fields missing, v1.1 features silently disabled | Never on a version bump; always regenerate |
| Generic skill names (`writer`, `editor`) | Easier to remember | Collide with other plugins | Only if namespacing is verified automatic |
| Self-approval of captivation quality in editor | No human in the loop | Rubber-stamps mediocrity | Never for release runs; internal dev iterations only |
| "It passed verification, ship it" | Saves re-run cost | Verification only checks framework presence, not output quality | Never for quality-critical phases |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Claude Code plugin spec | Trusting Phase 1 manifest is still current | Re-verify against current docs at start of Phase 11 |
| docx-js (9.6.1) | `WidthType.PERCENTAGE` breaks in Google Docs; unicode bullet chars break Word | Use `WidthType.DXA`, proper `LevelFormat.BULLET` numbering |
| Subagent system (parallel chapter writing) | Assuming shared instructions = shared output | Calibration exemplar in Book DNA; pilot first chapter inline; per-chapter voice diff after |
| Sermon adapter handoff | Two skills touching the same transformations | Explicit contract file; rule-owner tags; end-to-end idempotency test |
| Marketplace install | Dev install + marketplace install collision | Suffixed dev name; build script name rewrite; pre-release uninstall |
| Cross-platform node shell-out | `.sh` scripts, `~` paths, forward-slash assumptions | Node-only runtime scripts, no shell, path abstraction |
| Claude Code namespacing | Skill name collisions between plugins | Verify `plugin:skill` prefix works; test against real installed plugins |
| Python validate.py dependency | Assuming recipient has python | Doctor-skill preflight with graceful degradation to node-based validation |
| Git tag vs plugin.json version | Version numbers drift between sources of truth | Build script REFUSES build if git tag != plugin.json version != CHANGELOG top entry |

## Performance Traps

Book Crafter is low-scale — one book at a time, parallelism bounded by chapter count. Most "performance" concerns here are token budget and revision loops, not throughput.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Unbounded revision loop between writer and editor | Token usage exceeds plan; chapters get worse with each pass | Hard 2-revision cap per chapter; divergent-improvement detection | First re-run of a long book under v2 stricter thresholds |
| Large voice profile read by every parallel agent | Each chapter burns tokens re-reading 300-line profile | 150-line cap, priority tags, move theology to separate reference | Standard-size book with 12 chapters and bloated profile |
| Full Book DNA re-read per revision | Revision round duplicates initial read cost | Revision agents receive diff + targeted context, not full DNA | Revision-heavy runs (>5 revisions total) |
| Giant final docx script with all chapters inlined | node process OOMs or times out on standard-size book | Streaming / chapter-by-chapter docx assembly | Books > 60k words |
| Re-adapting sources on every re-run | Adapter cost duplicated even when sources unchanged | Hash-based adapter cache invalidation (hash of source file + adapter SKILL.md) | Re-runs without source changes |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Shipping `.planning/` or `memory/` in release zip | Leaks internal notes, feedback, personal workflow details | Build-time whitelist excludes these directories |
| Shipping `evidence/` folder with book drafts | Leaks unreleased author material, third-party source text | Whitelist excludes; separate repo for evidence if ever needed |
| `/Users/David/...` paths in shipped files | Reveals developer's directory structure and username | Grep gate at build time |
| `.env` or API keys in repo | Credential leak | `.env*` in `.plugin-ignore`; grep for common secret patterns at build time |
| Recipient executes arbitrary node code from plugin | Plugin could run unexpected code on recipient machine | Keep node usage limited to the formatter; document exactly what runs and why; use allowlist of node calls |
| Reuse of other authors' source material without attribution | Copyright / plagiarism risk in generated books | Sources folder is user-supplied; README notes responsibility is on user; adapter respects user's source files as authoritative |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Generated book "reads like a sermon" despite captivation score of 9/10 | User trusts AI, ships mediocre book, reputation risk | Anchored rubric + comparison-based evaluation in Phase 12 |
| Install instructions assume terminal | Non-technical recipient cannot install | Zero-terminal path via Claude Desktop marketplace |
| No indication when re-run is using stale artefacts | User thinks v2 improvements applied, they didn't | Version stamps on artefacts + refuse-reuse on version mismatch |
| Revision loop takes 20 minutes with no feedback | User assumes crash, kills process | Orchestrator prints per-chapter status and budget remaining |
| .docx opens in Word with missing fonts (Calibri on Mac, Georgia on Windows) | Fonts fall back silently, layout differs from preview | Embed font fallback chain; note font requirement in README |
| "Your book is ready" when captivation score is 5/10 | User ships blind | Editor refuses to mark "ready" below threshold; explicit "ship anyway" override |
| Reader opens generated .docx and sees obvious AI tells | Trust damage, reader stops reading | Grounded-scene rule; provenance checks; no synthetic personal stories |

## "Looks Done But Isn't" Checklist

- [ ] **Writer v2 rules:** Often missing procedural enforcement — verify each rule is phrased as "do X and check Y", not "try to do X".
- [ ] **Voice profile:** Often missing a kill list of superseded v1 rules — verify `10-CONTEXT.md` has explicit before/after for each removed rule.
- [ ] **Captivation rubric:** Often missing anchored exemplars — verify each score level (3/6/9) cites a specific paragraph from a labelled exemplar file.
- [ ] **Scene-opener rule:** Often missing provenance requirement — verify writer refuses synthetic scenes and editor flags missing provenance comments.
- [ ] **Cross-chapter voice diff:** Often missing actual comparison logic — verify Pass 3 produces a numerical diff, not a free-form "looks consistent" note.
- [ ] **Iteration cap:** Often missing divergent-improvement detection — verify revision N is rejected if any sub-score drops below revision N-1.
- [ ] **Re-run mode:** Often missing — verify orchestrator has `--fresh` flag that deletes everything except sources/brief.
- [ ] **Version stamps:** Often missing on outputs — verify every generated artefact contains `<!-- generated-by: book-crafter v1.1.0 -->`.
- [ ] **Eternally Secure comparison:** Often missing all seven gap areas — verify `evidence/eternally-secure-ch1-comparison.md` has a row for each of scene, Greek, vulnerability, central image, tension-release, reader anchor, pulpit seam.
- [ ] **Release zip:** Often includes `.planning/` or `.DS_Store` — verify `unzip -l` output contains only whitelisted paths.
- [ ] **Release zip size:** Often 10x expected — verify < 5MB and top-10 file list reviewed.
- [ ] **plugin.json:** Often unchanged since Phase 1 — verify version matches `v1.1.0` git tag and CHANGELOG top entry.
- [ ] **LICENSE:** Often missing entirely — verify LICENSE file at repo root.
- [ ] **CHANGELOG.md:** Often missing v1.1 entry — verify top entry lists all v1.1 changes with upgrade notes.
- [ ] **README install:** Often assumes terminal — verify a non-developer can follow it without asking questions.
- [ ] **Personal paths:** Often leak in examples — verify `grep -r "/Users/David"` against release whitelist returns zero.
- [ ] **Node dependency:** Often ambient-assumed — verify doctor skill checks node + docx before writing stage starts.
- [ ] **Dev vs release name:** Often same — verify dev plugin.json has suffix and build script rewrites it.
- [ ] **Smoke test:** Often skipped — verify fresh-profile install completes and a test book generates end-to-end before release tag.
- [ ] **Marketplace manifest:** Often uses stale fields — verify against current Claude Code plugins docs fetched on release day.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Voice profile kitchen sink after shipping | MEDIUM | Revert to last known-good profile, re-apply v1.1 changes one at a time with eval between each |
| Infinite revision loop in production | LOW | Kill process, enforce iteration cap, accept last stable revision, ship with warning |
| Stale Book DNA produced wrong output | LOW | Delete cached artefacts, re-run in `--fresh` mode, diff |
| Released zip contains `.planning/` | HIGH (trust damage) | Pull release immediately, audit what was exposed, release v1.1.1 with same content minus leak, notify recipients |
| Namespace collision post-install | MEDIUM | Rename skills in next patch release, document workaround for affected users |
| Non-technical recipient stuck on install | LOW | Screen-share walkthrough, log issue, rewrite README section, release v1.1.1 |
| Missing LICENSE flagged at marketplace submission | LOW | Add MIT LICENSE, rebuild, resubmit |
| Node missing on recipient machine | LOW (if doctor skill exists) | Doctor skill output tells user to install; provide direct link to nodejs.org LTS |
| Eternally Secure re-run worse than original | HIGH | Block release, bisect which v2 rule regressed, fix or revert, re-run |
| "Bestseller quality" claim in README but output still sermon-like | HIGH (trust damage) | Soften claim to "teaching books with storytelling craft", ship with honest capability description |
| Smoke test fails on fresh profile | LOW | Fix issue, rebuild zip, re-run smoke test, DO NOT skip |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| 1. Rule drift / kitchen sink voice profile | Phase 10 | Voice profile line count < 150; kill list in 10-CONTEXT.md |
| 2. Over-correction bans rhythm fragments | Phase 10 | Anti-pattern rules paired with permitted-usage counter-examples |
| 3. Mechanical vulnerability beats | Phase 10 | Outliner assigns per-chapter beat shape; writer forbidden from synthesising |
| 4. Simulated scene-openers | Phase 10 | Writer requires source provenance; editor flags missing comments |
| 5. Voice drift across parallel agents | Phase 10 | Calibration exemplar in Book DNA; pilot first chapter pattern; cross-chapter voice diff in Pass 3 |
| 6. Evaluator deadlock / infinite loop | Phase 10 | 2-revision cap, anchored rubric, divergent-improvement detection, budget guardrail |
| 7. Greek density cap starves depth | Phase 10 | Per-chapter density field in outliner; per-800-words cap in writer |
| 8. Editor rewrites instead of revises | Phase 10 | Diff budget 25%, signature-phrase preservation, voice fingerprint check |
| 9. Writer v2 vs sermon adapter rule conflict | Phase 10 | Adapter-writer contract file; rule-owner tags; end-to-end diff test |
| 10. Stale Book DNA on re-run | Phase 10 (implementation) + Phase 12 (used) | `--fresh` flag, version stamps, separate run directories |
| 11. Re-run better but unverifiable | Phase 12 | Frozen baseline + seven-gap comparison file + third-party pass + David ship gate |
| 12. Zip ships hidden files | Phase 11 | Build script whitelist, < 5MB size check, manifest review |
| 13. Marketplace manifest schema drift | Phase 11 | Re-verify docs at phase start, schema-validate, smoke-install |
| 14. Dev vs marketplace install collision | Phase 11 | Suffixed dev name, build script name rewrite, pre-release uninstall check |
| 15. Skill namespace collision | Phase 11 | Verify namespacing; smoke-test against installed plugins |
| 16. README assumes terminal | Phase 11 | Non-technical reviewer walkthrough test |
| 17. Missing node/docx on recipient | Phase 11 | Doctor skill preflight, vendor docx, graceful fallback |
| 18. Missing LICENSE/CHANGELOG/version stamp | Phase 11 | Build-time gate: refuses build if any missing or version mismatches |
| 19. Personal paths in shipped files | Phase 11 | Grep gate: build fails if `/Users/David` present |
| 20. Cross-platform path assumptions | Phase 11 | No `.sh` in release, path abstraction, Windows smoke test |
| 21. Skipping Eternally Secure re-run | Phase 12 | Phase 11 cannot complete until Phase 12 re-run evidence signed off |
| 22. README claims bestseller quality without evidence | Phase 12 | README language finalised against Phase 12 comparison evidence |
| 23. Skipping smoke test | Phase 12 | Fresh-profile smoke-test logged to `evidence/smoke-test-<date>.md` before tagging |

## Sources

- **Phase 7 Verification Report** (`.planning/phases/07-*/07-VERIFICATION.md`) — string-match-based verification that passed 14/14 but deferred quality assessment to humans. Primary evidence of the framework-presence vs. framework-enforcement gap. **Confidence: HIGH** (local, authoritative).
- **Phase 7 writer/voice-profile artefacts** (`skills/writer/SKILL.md`, `references/voice-profiles/spiritual-default.md`) — direct evidence of aspirational-not-procedural instruction shape and additive-not-subtractive rule evolution. **Confidence: HIGH** (local, read directly).
- **Claude Code Plugins documentation** (https://code.claude.com/docs/en/plugins) — plugin manifest, distribution model, namespace rules. Cited in STACK.md. **Confidence: HIGH** but schema evolves — must re-verify at start of Phase 11.
- **Claude Code Subagents documentation** (https://code.claude.com/docs/en/sub-agents) — parallelism constraints informing voice-drift pitfall. **Confidence: HIGH**.
- **docx-js 9.6.1 known issues** — `WidthType.PERCENTAGE` and unicode bullets documented in David's existing docx skill (`~/.claude/skills/docx/SKILL.md`). **Confidence: HIGH** (local, verified).
- **David's sermon-crafter** — voice profile drift pattern across long-running content systems. **Confidence: HIGH** (local).
- **User feedback** (`memory/feedback_book_quality.md`, `memory/feedback_voice_builder.md`) — direct statement that first output was too sermon-like; primary input to Phase 7 post-mortem framing. **Confidence: HIGH** (user-authored).
- **LLM-as-judge failure modes** — general knowledge of stochastic evaluator divergence and score-chasing loops. **Confidence: MEDIUM** (training-data-backed).
- **Multi-agent writing system drift** — pattern from "StoryWriter" paper cited in STACK.md: parallel generators diverge without normalising signal. **Confidence: MEDIUM**.

---
*Pitfalls research for: book-crafter-plugin v1.1 (Writing Quality v2 + Distribution)*
*Researched: 2026-04-15*
