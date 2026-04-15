# Architecture Research — Writing Quality v2 + Packaging (Milestone v1.1)

**Domain:** Claude Code plugin (book-crafter) — subsequent milestone v1.1
**Researched:** 2026-04-15
**Confidence:** HIGH (all findings verified against live files in the repo)

> This document supersedes the v1.0 architecture research for the purposes of Milestone v1.1. It focuses only on what changes to support Writing Quality v2 and Packaging. The v1.0 pipeline architecture is treated as established fact.

---

## 0. Ground Truth: What Actually Exists Today

Before proposing changes, the research had to reconcile the REQUIREMENTS-level language in `CLAUDE.md` / `PROJECT.md` with the actual file system. The picture is narrower than the README suggests, and two files the milestone prompt referenced do **not** exist as standalone references:

| Referenced in prompt | Actual status |
|----------------------|---------------|
| `references/captivation-rubric.md` | **Does not exist.** The captivation rubric is embedded inline in `skills/editor/SKILL.md` §2.4, §2.5, §2.5.5, §3.3, §3.4 and rendered in the report at §4.5. It is not a standalone reference. |
| `references/tension-release-framework.md` | **Does not exist.** Tension-release guidance is embedded inline in `skills/writer/SKILL.md` §4 ("Tension-Release Architecture"). |
| `references/pipeline-stages.md` | Exists (147 lines). Stage descriptions + completion detection matrix. |
| `references/book-dna-template.md` | Exists (65 lines). |
| `references/voice-profiles/` | Exists. Contains `spiritual-default.md`, `voice-profile-spec.md`. |

**Implication for Writing Quality v2:** there is no existing "rubric reference" to extend. The new craft rules either (a) get folded into the existing `skills/editor/SKILL.md` and `skills/writer/SKILL.md` inline, or (b) get extracted into new standalone references that the skills read at runtime. The current pattern is "inline in the skill", so introducing a new standalone reference is a deliberate architectural shift — it needs justification, which this document gives below.

**Implication for Packaging:** the plugin manifest at `.claude-plugin/plugin.json` is minimal (10 lines) — no `files`, no `entry_points`, no marketplace metadata. Packaging work is net-new; it does not have to preserve existing marketplace structure.

---

## 1. System Overview (After v1.1)

```
┌──────────────────────────────────────────────────────────────────────┐
│                       Plugin Root (packaged)                         │
│   .claude-plugin/plugin.json   .claude-plugin/marketplace.json       │
│   README.md  INSTALL.md  CHANGELOG.md                                │
│   scripts/release.sh           fixtures/tiny-book/                   │
├──────────────────────────────────────────────────────────────────────┤
│                           Skills Layer                               │
│  orchestrator  outliner  researcher  writer  editor  enricher        │
│                     formatter  sermon-adapter  voice-builder         │
├──────────────────────────────────────────────────────────────────────┤
│                   References (read at runtime)                       │
│  voice-profiles/*.md        book-dna-template.md                     │
│  pipeline-stages.md         bestseller-craft-rules.md   ◄── NEW      │
│  captivation-rubric.md      ◄── NEW (extracted, not new logic)       │
├──────────────────────────────────────────────────────────────────────┤
│                       Subagents (context forks)                      │
│  agents/chapter-writer.md    agents/chapter-editor.md                │
├──────────────────────────────────────────────────────────────────────┤
│                       Per-Book Project State                         │
│  book-dna.md  voice-profile.md  sources/  sources-adapted/           │
│  chapter-outline.md  research/  drafts/  edited/  revisions/         │
│  enrichments/  front-matter/  reports/  output/                      │
│                  reports/craft-report.md  ◄── NEW (optional)         │
└──────────────────────────────────────────────────────────────────────┘
```

Two new artefacts land in `references/`. Zero new skills. One new optional project-state file (`reports/craft-report.md`). One new release-tooling directory (`scripts/` + `fixtures/`) at plugin root.

---

## 2. Writing Quality v2 — Where the New Rules Live

### 2.1 The Core Architectural Question

Craft rules (scene-first openers, Greek density cap, author vulnerability, central-image lifting, pulpit-seam detection, reader-anchor specificity, enforced tension-release) can live in one of four places:

| Option | Where | Pros | Cons | Verdict |
|--------|-------|------|------|---------|
| A | Inside each voice profile (`spiritual-default.md` etc.) | Single source of truth per voice | Turns voice profiles into kitchen-sink docs; craft rules are mostly voice-agnostic; custom profiles (Mode 2/3/5) would lack them | **Reject** |
| B | Inline in `writer/SKILL.md` and `editor/SKILL.md` | Matches current pattern; no new files | Duplicated across two skills; drift risk; both skills already ~350 and ~500 lines | **Reject** |
| C | Inline in `book-dna.md` (per project) | Per-book tunability | Book DNA is already the hot context document; bloating it hurts every chapter agent's context budget; rules are universal, not per-book | **Reject** |
| D | **New standalone reference `references/bestseller-craft-rules.md`, loaded by writer + editor** | Single source of truth; voice-agnostic; small (~200 lines); writer reads once, editor reads once; avoids Book DNA bloat | One new file to maintain; establishes a new pattern | **ADOPT** |

**Decision: Option D.** Craft rules are voice-agnostic bestseller-prose rules. They apply equally to spiritual-default, an academic voice, or a source-material-built voice. Putting them in the voice profile would force every profile (including auto-generated ones) to carry them and would invite voice-specific overrides that blur the distinction between "how this author sounds" and "what makes prose captivating".

### 2.2 Division of Responsibility: Voice Profile vs Craft Rules

| Concern | Belongs in Voice Profile | Belongs in Craft Rules |
|---------|:------------------------:|:----------------------:|
| Tone, sentence rhythm targets | ✓ | |
| Vocabulary Use/Avoid | ✓ | |
| Emphasis techniques (stacking, declarations) | ✓ | |
| Anti-patterns (cliches, hedging) | ✓ | |
| Theological framework | ✓ (optional §6) | |
| Scripture handling rules | ✓ (optional §7) | |
| Scene-first opener requirement | | ✓ |
| Greek/Hebrew density cap (max per chapter) | | ✓ (threshold may be voice-tunable) |
| Author vulnerability beat per chapter | | ✓ |
| Central-image lifting (one image per chapter becomes recurring motif) | | ✓ |
| Pulpit-seam detection (audience-address residue: "this morning", "here in this room") | | ✓ (though sermon-adapter should catch most upstream) |
| Reader-anchor specificity (concrete nouns over abstractions) | | ✓ |
| Enforced tension-release architecture | | ✓ |
| Paragraph rhythm variance | | ✓ (currently in writer §4, move to craft rules) |

**Rule of thumb for the future:** if swapping to a new voice profile (academic, self-help, leadership) would make the rule invalid, it's a voice rule. If a bestseller in any genre would follow it, it's a craft rule.

### 2.3 Should Craft Rules Become a Writer Update, an Editor Pass, or a New Validator Skill?

**Not a new skill.** A dedicated "craft-check" skill would add an orchestration step, a new state marker, and duplicate half of what Pass 1 already does (reading chapters, scoring them, producing a report). It would also mean two places to read voice profile and Book DNA. **Reject new skill.**

**Both writer and editor update, with different intents:**

- **Writer (preventive):** Reads `references/bestseller-craft-rules.md` at Step 2.5 (new step between "Read Voice Profile" and "Read Chapter Outline") and applies the rules while drafting. Cheaper to write a chapter right than to fix it in edit. This is where the majority of the lift happens.
- **Editor (detective + enforcement):** Pass 1 gains new sub-checks that **detect** craft-rule violations and either auto-fix (for low-risk ones like a missing paragraph-rhythm variance) or flag as "significant" severity (for high-risk ones like a missing scene-first opener or no author vulnerability).

This matches the existing philosophy: writer is the first line of voice fidelity, editor is the enforcer. Craft rules slot into the same split.

### 2.4 "Craft-Check Pass" vs Stricter Existing Passes — The Decision

**Reject** inserting a Pass 1.5 or Pass 4. Three passes is already the mental model users learn in the dashboard. Adding a fourth would force edits to the orchestrator dashboard, the pipeline-stages reference, the editor's pass-ordering logic, and the report structure.

**Adopt** making Pass 1 and Pass 2 stricter, scoped cleanly:

- **Pass 1 (voice + craft-local)** — owns craft rules that can be judged from a single chapter in isolation: scene-first opener, author vulnerability beat, reader-anchor specificity, Greek density cap, pulpit-seam detection, tension-release cycle count, paragraph rhythm variance.
- **Pass 2 (flow + craft-global)** — owns craft rules that need two chapters: central-image lifting (is the image from Ch N echoed in Ch N+1?), repeated-image drift across chapter pairs, opener/ending style variety across consecutive chapters.
- **Pass 3** — untouched. Term and reference validation stay as-is.

The captivation score in §4.5 gains two new score components rather than being replaced. See §2.6.

### 2.5 The Captivation Rubric — Extract Then Extend

The current captivation rubric is 5 components × 0-2 points = 10-point score, scattered across editor §2.4, §2.5, §2.5.5, §3.3, §3.4. **Before extending it, extract it.**

**Sub-task order inside Phase 10:**

1. Extract the current rubric into `references/captivation-rubric.md`. No logic change. Editor §4.5 continues to render the same table but with a pointer: "Rubric defined in `${CLAUDE_PLUGIN_ROOT}/references/captivation-rubric.md`. Components: Opening engagement, Ending momentum, Pacing variety, Emotional connection, Reader engagement."
2. Editor reads the rubric reference once at §1 alongside Book DNA and voice profile. The Pass 1/2 detection logic stays in the skill (it's procedural, not declarative) — only the definitions, thresholds, and scoring tables move.
3. Extend the rubric file (not the editor skill) with the v2 components.

**Why extract first?** Three reasons: (a) it gives Writing Quality v2 a single destination for new score components, (b) future voice profiles or book sizes can specify rubric overrides without editing skill files, (c) the rubric becomes inspectable by users without wading through a 512-line editor skill.

### 2.6 Captivation Score v2 — Additive, Not Replacement

Keep all five existing components. Add two. Recalibrate thresholds.

| # | Component | Score | Source | Status |
|---|-----------|:-----:|--------|--------|
| 1 | Opening engagement (scene in first 200 words) | 0-2 | Pass 2 §3.3 | **Extended** — add scene-first strictness (0 if first sentence is teaching, 1 if scene appears after teaching lead, 2 if first sentence is scene). |
| 2 | Ending momentum (cliffhanger/reflective hook) | 0-2 | Pass 2 §3.4 | unchanged |
| 3 | Pacing variety (paragraph length distribution) | 0-2 | Pass 1 §2.4 | unchanged |
| 4 | Emotional connection (vulnerability markers) | 0-2 | Pass 1 §2.5 | **Extended** — must be first-person author vulnerability at least once, not just any "I" reference. |
| 5 | Reader engagement ("you", rhetorical questions) | 0-2 | Pass 1 §2.5.5 | unchanged |
| 6 | **Craft density** (Greek cap + reader-anchor specificity) | 0-2 | Pass 1 (new §2.9) | **NEW** |
| 7 | **Cross-chapter craft** (central-image lifting + pulpit-seam cleanliness) | 0-2 | Pass 2 (new §3.7) | **NEW** |

Max score becomes 14. Thresholds recalibrated: 11-14 Captivating, 7-10 Acceptable, 4-6 Weak, 0-3 Significant issues. Momentum-aware softening still applies.

**Why additive, not replacement?** Phase 7 shipped the original rubric and the user has a baseline (Eternally Secure). Replacing components would make v1 vs v2 comparisons impossible. Additive components let the milestone's re-run of Eternally Secure show "same scores on 1-5, new scores on 6-7, total improved".

### 2.7 Tension-Release Enforcement — Flag, Don't Fail

Tension-release is currently aspirational guidance in `writer/SKILL.md` §4. Upgrading it to hard enforcement creates a regression risk: the editor would start "failing" chapters that the user already approved in v1.

**Decision:** Pass 1 gains sub-check §2.10 "Tension-release cycle detection" that counts cycles heuristically (story/scene openings + "but here's where it gets deeper" style pivots + landing resolutions). Output a count and flag as **significant severity** if count is 0. Do not auto-rewrite. Do not block Stage 5. The user sees it in the consistency report and decides.

This preserves the "editor reports, user decides" model already established in Pass 3 anti-pattern §8: "Do NOT treat Pass 3 findings as auto-fixable".

### 2.8 Sermon-Adapter Regression Risk

The sermon-adapter runs at Stage 0.5 and transforms source material **before** the writer sees it. Its transformations overlap with two Writing Quality v2 concerns:

- **Pulpit-seam detection** — sermon-adapter already removes "this morning", "here in this room", verbal cues. If the editor's new pulpit-seam check flags chapters built from sermon-adapted sources, something has regressed upstream. Useful: the editor's pulpit-seam check doubles as a **regression alarm** for the sermon-adapter.
- **Repetition-for-emphasis → revelation-for-emphasis** — sermon-adapter already collapses repeated restatements. The editor's "surface-level observations" anti-pattern check (§2.3 already exists) covers this.

**Mitigation:** neither the writer update nor the editor update touches sermon-adapter logic, inputs, or outputs. Sermon-adapter writes `sources-adapted/`, outliner reads that, writer reads `research/`, editor reads `drafts/`. The chain is preserved. Risk: **LOW**.

**Verification step in Phase 10:** re-run Eternally Secure (which uses the sermon path) and confirm Stage 0.5 outputs are identical to the pre-change run. Diff `sources-adapted/` before and after the v2 changes — zero bytes changed proves sermon-adapter is untouched.

### 2.9 File-Level Integration Points

| File | Change Type | Specific Location | What Changes |
|------|-------------|-------------------|--------------|
| `references/bestseller-craft-rules.md` | **NEW** | create file | ~200 lines: scene-first opener, Greek density cap formula, author vulnerability requirement, central-image lifting, pulpit-seam patterns, reader-anchor specificity, tension-release cycle definition, paragraph rhythm variance (lifted from writer §4). |
| `references/captivation-rubric.md` | **NEW** | create file | Extract existing rubric from editor §2.4/§2.5/§2.5.5/§3.3/§3.4/§4.5. Add new components 6 and 7. |
| `skills/writer/SKILL.md` | MODIFIED | §1 Step 2.5 (new) | Add "Read craft rules: `${CLAUDE_PLUGIN_ROOT}/references/bestseller-craft-rules.md`". |
| `skills/writer/SKILL.md` | MODIFIED | §3 "Hook Strategies" | Add explicit rule: "First sentence must be inside a scene — no teaching lead-in." Reference craft rules. |
| `skills/writer/SKILL.md` | MODIFIED | §4 "Chapter Structure" | Shorten: link to craft rules for tension-release and paragraph rhythm instead of duplicating. |
| `skills/writer/SKILL.md` | MODIFIED | §7 "Theological Depth" | Add Greek density cap (from craft rules): max N Greek/Hebrew word studies per chapter, scale with target word count. |
| `skills/writer/SKILL.md` | MODIFIED | §9 "Anti-Patterns" | Add: no pulpit seams, no central image appearing only once, author must be visible at least once per chapter. |
| `skills/editor/SKILL.md` | MODIFIED | §1 Step 2.5 (new) | Add "Read craft rules and captivation rubric references". |
| `skills/editor/SKILL.md` | MODIFIED | §2.4 / §2.5 / §2.5.5 | Replace inline rubric definitions with "per `references/captivation-rubric.md`". Keep the detection logic. |
| `skills/editor/SKILL.md` | MODIFIED | §2.9 (NEW sub-section) | Craft density check — Greek/Hebrew count per chapter against cap, reader-anchor concrete-noun ratio. |
| `skills/editor/SKILL.md` | MODIFIED | §2.10 (NEW sub-section) | Tension-release cycle detection. Flag if zero cycles. |
| `skills/editor/SKILL.md` | MODIFIED | §2.11 (NEW sub-section) | Pulpit-seam detection (regex: "this morning", "here in this room", "as we heard", etc.). |
| `skills/editor/SKILL.md` | MODIFIED | §3.3 | Scene-first strictness upgrade (first sentence vs first 200 words). |
| `skills/editor/SKILL.md` | MODIFIED | §3.7 (NEW sub-section) | Cross-chapter craft check — central-image lifting detection across chapter pairs. |
| `skills/editor/SKILL.md` | MODIFIED | §4.5 | Rewrite captivation breakdown to reference the extracted rubric file; extend table to 7 components. |
| `agents/chapter-writer.md` | MODIFIED | skill preloading / context block | Confirm `bestseller-craft-rules.md` is reachable via `${CLAUDE_PLUGIN_ROOT}`. No logic change. |
| `references/pipeline-stages.md` | MODIFIED | Stage 4 description | Add sentence: "Pass 1 and Pass 2 now enforce bestseller craft rules per `references/bestseller-craft-rules.md`." |
| `skills/orchestrator/SKILL.md` | **UNCHANGED** | — | Stage flow, approval gates, and dashboard remain identical. |
| `skills/sermon-adapter/SKILL.md` | **UNCHANGED** | — | Preserved to protect the sermon→book pipeline. |
| `skills/outliner/SKILL.md` | **UNCHANGED** | — | Craft rules apply at write/edit time. Outline structure is voice-dependent, not craft-dependent. |
| `skills/enricher/SKILL.md` | **UNCHANGED** | — | |
| `skills/formatter/SKILL.md` | **UNCHANGED** | — | |

### 2.10 Regression Risks — Named with Mitigations

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Editor starts failing previously-approved Eternally Secure chapters | HIGH | All new Pass 1/2 checks **flag**, never fail. Severity can rise to "significant" but pipeline does not block. |
| Captivation score changes break downstream consistency reports | MEDIUM | Rubric change is additive. Keep components 1-5 identical; only add 6-7. Old reports stay comparable by reading the first five components. |
| Craft rules contradict voice profile (e.g., Greek density cap vs spiritual-default's word-study emphasis) | MEDIUM | Craft rules file includes an "Overridable by voice profile" sub-section listing rules voice profiles may relax (Greek cap is one). Writer checks voice profile for an explicit override before applying the cap. |
| Writer's context budget blows up from reading another reference | LOW | Craft rules target ~200 lines (~2-3KB). Writer already reads Book DNA + voice profile + outline + research. Adding one more small file is negligible. |
| Sermon-adapter path regresses because pulpit-seam detection shifts behaviour | LOW | Run verification: diff `sources-adapted/` from re-run of Eternally Secure against the pre-change baseline. Mitigation also: pulpit-seam check in editor is a **report**, not an auto-rewrite. |
| Chapter-writer subagent preload misses the new reference | LOW | `agents/chapter-writer.md` preloads the writer skill via `${CLAUDE_PLUGIN_ROOT}`. Reference files are read by the skill at runtime, not preloaded. No subagent change needed beyond verifying the skill reads correctly inside the subagent context. |
| Non-theological voice profiles don't need Greek cap or scripture rules | LOW | Craft rules file marks certain rules as "Theology-aware (skip if voice profile lacks theological framework section)". Editor already does similar gating in §2.3 / §2.7. |

---

## 3. Packaging Architecture

### 3.1 `marketplace.json` Location

Claude Code plugin conventions place marketplace metadata alongside `plugin.json` under `.claude-plugin/`. The marketplace file is optional for `--plugin-dir` local installs but required for catalogue-style distribution.

**Decision:** `.claude-plugin/marketplace.json` (sibling of `plugin.json`). Keeps plugin-adjacent config co-located. Do not put it at the repo root — the repo root contains non-plugin assets (`.planning/`, `.git/`, dev scripts) that should not pollute the plugin namespace.

### 3.2 `plugin.json` Extensions

Current file is 10 lines with only `name`, `version`, `description`, `author`, `keywords`. v1.1 bumps `version` to `1.1.0`. No other required changes — skill discovery is directory-convention-based, not manifest-listed. Optionally add:

- `homepage` — GitHub URL (once pushed) for Claude Desktop's plugin detail pane
- `license` — if the user decides one

### 3.3 Release Tooling — Script vs Manual Zip

A one-liner `zip -r book-crafter-v1.1.0.zip book-crafter-plugin` *works* but introduces failure modes: forgetting to stamp the version, forgetting to update CHANGELOG, zipping `.git`, zipping `.planning/`, zipping `.DS_Store`, packaging a broken state.

**Decision:** `scripts/release.sh` at plugin root. Responsibilities:

1. Read version from `.claude-plugin/plugin.json` (source of truth).
2. Require a clean git working tree (exit if `git status` non-empty) — prevents shipping uncommitted changes.
3. Validate that `CHANGELOG.md` has an entry for the current version (grep for the version string).
4. Run smoke-test against `fixtures/tiny-book/` — invoke orchestrator in a temp directory, verify the pipeline produces a `.docx`, run `python scripts/office/validate.py` against it if available, fail on any error.
5. Build zip with explicit excludes: `.git`, `.planning`, `.DS_Store`, `scripts/release.sh` itself, `fixtures/`, `node_modules`, `.claude`.
6. Write `releases/book-crafter-v{VERSION}.zip` at repo root.
7. Print install instructions the user can paste into an email.

This is a ~80-line bash script. Keep it simple — no Node, no Python, no npm scripts.

### 3.4 Skill Structure — Does Packaging Require Moves?

**No.** The current layout (`skills/` and `agents/` at plugin root, `.claude-plugin/plugin.json` in a subdirectory) is already the canonical Claude Code plugin layout. The orchestrator already uses `${CLAUDE_PLUGIN_ROOT}` everywhere, which resolves correctly whether installed via marketplace, `--plugin-dir`, or user plugin directory. **No files move.**

### 3.5 README vs INSTALL Placement

Two audiences, two documents:

- **`README.md` (plugin root)** — technical overview for someone browsing GitHub. What the plugin does, requirements, voice profiles, example invocations. Written for developers. Already partly exists as the content in the project's `CLAUDE.md`; needs extraction.
- **`INSTALL.md` (plugin root)** — non-technical recipient guide. Written like a step-by-step pamphlet: download this file, open Claude Desktop, click here, drag the zip, restart. Plain language, zero terminal commands. This is the file the v1.1 milestone explicitly targets.

Both live at plugin root (not under `.claude-plugin/`) because Claude Desktop and marketplace browsers look for `README.md` at the package root.

### 3.6 `CHANGELOG.md` Location

Plugin root. Standard Keep-a-Changelog format. Version bumps happen in `plugin.json` and `CHANGELOG.md` in lockstep — `release.sh` enforces this.

### 3.7 Smoke-Test `fixtures/` Directory

**Yes, needed.** Without it, the release script has nothing to verify and shipping a broken plugin is trivially easy.

**Layout:**

```
fixtures/
└── tiny-book/
    ├── brief.md                 # Topic brief, 2-paragraph description
    ├── expected/                # Golden files (optional, for diff-based tests)
    │   └── outline-skeleton.md  # Minimum outline structure the pipeline should produce
    └── README.md                # Explains what this fixture tests
```

**Minimum test:** 3-chapter booklet generated from `brief.md` using `spiritual-default`, full pipeline through Stage 5, producing a valid `.docx`. Total runtime target: <5 minutes. The release script invokes this as a non-interactive end-to-end check and exits non-zero if any stage fails or if the .docx is <10KB (proxy for "content actually generated").

**Excluded from the release zip** — users don't need the fixture bundle in their install.

### 3.8 File-Level Packaging Changes

| File | Change Type | What Changes |
|------|-------------|--------------|
| `.claude-plugin/plugin.json` | MODIFIED | Version bump to `1.1.0`; optional `homepage`, `license` fields. |
| `.claude-plugin/marketplace.json` | **NEW** | Marketplace metadata: name, version, description, zip URL placeholder, screenshot list (optional), install instructions link. |
| `README.md` | **NEW** | Plugin overview for developers. Extracted/rewritten from CLAUDE.md. |
| `INSTALL.md` | **NEW** | Non-technical Claude Desktop install walkthrough. Zero terminal. |
| `CHANGELOG.md` | **NEW** | Keep-a-Changelog format. Entry for 1.0.0 (from Phase 1-9) and 1.1.0 (this milestone). |
| `scripts/release.sh` | **NEW** | Release automation: version check, changelog check, smoke-test, zip build. |
| `scripts/smoke-test.sh` | **NEW** (optional, can fold into release.sh) | Runs the tiny-book fixture through the pipeline. |
| `fixtures/tiny-book/` | **NEW** | Minimal test book project. |
| `fixtures/tiny-book/brief.md` | **NEW** | 2-paragraph topic brief. |
| `fixtures/tiny-book/README.md` | **NEW** | Fixture documentation. |
| `.gitignore` | MODIFIED (if exists) or NEW | Add `releases/`, `fixtures/**/output/`, `fixtures/**/drafts/`, `fixtures/**/edited/` (all pipeline outputs). |
| `skills/*` | **UNCHANGED** | Skills are not moved or restructured. |
| `agents/*` | **UNCHANGED** | |
| `references/*` | **UNCHANGED** by packaging work (but changed by Writing Quality v2). |

---

## 4. Build Order (Dependency-Driven)

The milestone prompt is explicit: **Writing Quality v2 must be verified before Packaging**, otherwise the shared plugin is stale prose with a nice wrapper. The dependency chain:

```
Phase 10: Writing Quality v2
  │
  ├── 10.1 Extract captivation rubric to references/captivation-rubric.md (no logic change)
  │       → editor reads from reference instead of inline
  │       → regression test: re-run existing sample, scores unchanged
  │
  ├── 10.2 Create references/bestseller-craft-rules.md
  │       → define all seven craft rules + overridable subset
  │       → no skill changes yet
  │
  ├── 10.3 Update writer to read and apply craft rules (preventive)
  │       → writer §1 Step 2.5, §3 hooks, §4 structure, §7 theology, §9 anti-patterns
  │
  ├── 10.4 Update editor Pass 1 (§2.9, §2.10, §2.11 new sub-sections)
  │       → craft density, tension-release detection, pulpit-seam detection
  │       → all flag-only, no auto-fail
  │
  ├── 10.5 Update editor Pass 2 (§3.3 strictness, §3.7 new)
  │       → scene-first strictness, cross-chapter craft (central image lifting)
  │
  ├── 10.6 Extend captivation rubric with components 6-7
  │       → editor §4.5 report extends to 7-component table
  │       → thresholds recalibrated
  │
  ├── 10.7 Update references/pipeline-stages.md Stage 4 description
  │
  └── 10.8 VERIFICATION: Re-run Eternally Secure through updated pipeline
          → Compare captivation scores: components 1-5 should be stable, 6-7 new
          → Compare sources-adapted/: byte-identical (sermon-adapter untouched)
          → Compare outline: identical (outliner untouched)
          → Compare output/.docx: formatter untouched, only edited/ content differs
          → If regression detected, do NOT proceed to Phase 11

Phase 11: Packaging  (GATED on Phase 10 verification passing)
  │
  ├── 11.1 Create fixtures/tiny-book/ and smoke-test logic
  │       → must pass before anything else
  │
  ├── 11.2 Create CHANGELOG.md, README.md, INSTALL.md
  │
  ├── 11.3 Create .claude-plugin/marketplace.json
  │
  ├── 11.4 Bump plugin.json to 1.1.0
  │
  ├── 11.5 Create scripts/release.sh
  │       → integrate smoke-test
  │       → git-clean check, changelog check, version stamp, zip build
  │
  ├── 11.6 First release dry-run: scripts/release.sh
  │       → verify zip contents: no .git, no .planning, no .DS_Store, no fixtures
  │       → verify zip size is reasonable (<1MB)
  │
  └── 11.7 Smoke-test install flow
          → fresh directory, unzip, claude --plugin-dir, run orchestrator
          → confirm INSTALL.md steps work for a non-technical user (readability review)
```

**Why 10.1 before 10.2:** extracting the rubric first (with no logic change) creates a safe reference file that 10.6 can extend without a simultaneous skill refactor. Smaller diffs, clearer bisect if something breaks.

**Why 11.1 before everything else in Phase 11:** a smoke-test that doesn't exist can't catch a broken release. Build the test fixture first so every subsequent packaging change is validated automatically.

**Why the Phase 10 → 11 gate matters:** the re-run of Eternally Secure is the proof point for the entire v1.1 milestone. If it regresses, shipping a zip would mean shipping regression to the recipient. The gate is not negotiable.

---

## 5. Data Flow Changes

### 5.1 New Files Loaded at Pipeline Start

The writer skill currently reads four files: Book DNA, voice profile, chapter outline, research notes. After v1.1 it reads **one more**: `${CLAUDE_PLUGIN_ROOT}/references/bestseller-craft-rules.md`.

The editor skill currently reads three files: Book DNA, voice profile, chapter outline (then drafts per chapter). After v1.1 it reads **two more**: `${CLAUDE_PLUGIN_ROOT}/references/bestseller-craft-rules.md` and `${CLAUDE_PLUGIN_ROOT}/references/captivation-rubric.md`.

**Both references are plugin-root files, not per-project files.** They are NOT copied into the book project directory. They are read directly from `${CLAUDE_PLUGIN_ROOT}/references/` each time a skill runs. This matches the existing pattern for `book-dna-template.md` (copied at project creation) vs `voice-profile-spec.md` (read at runtime). Craft rules are runtime, not project-scoped.

### 5.2 New Files in Book Project Directory

Effectively **none**. The editor already writes `reports/consistency-report.md` at Pass 3. The v2 craft scores land in that same file. Proposed extension: add a new section `## Craft Rules Audit` in `consistency-report.md` between "Voice Consistency" and "Flow and Transitions". This is a content addition, not a new file.

**Optional:** if the craft audit becomes verbose enough to clutter `consistency-report.md`, extract to `reports/craft-report.md` (sibling). Start by extending the existing file; only split if the report length exceeds usability.

### 5.3 New State Markers

**None.** Pipeline state detection in `skills/orchestrator/SKILL.md` §3 is unchanged. Stage 4 completion is still "all `edited/ch*-final.md` exist AND no `<!-- REVISION IN PROGRESS -->` marker in `consistency-report.md`". The craft audit lives inside that report and does not introduce a new gate.

**Why no new marker:** introducing a state marker would require orchestrator dashboard changes, resume-logic changes, and documentation changes. The milestone is about prose quality, not pipeline topology. Keep the topology identical and the user-facing dashboard identical.

### 5.4 Chapter Metadata Block Changes

The `<!-- VOICE AUDIT -->` metadata block at the bottom of each `edited/ch[NN]-pass1.md` file currently contains: `vocabulary_violations`, `avg_sentence_length`, `fragment_percentage`, `anti_patterns_found`, `theological_flags`, `pacing_variety`, `emotional_connection`, `captivation_score`, `changes_made`, `severity`.

**Extend with:**

```yaml
greek_density: [count] (cap: [N], status: ok|over)
author_vulnerability: present|absent
central_image: [extracted phrase or "none detected"]
pulpit_seams: [count] (flagged: [count])
tension_release_cycles: [count]
craft_density_score: [0-2]
cross_chapter_craft_score: [0-2]
```

This is purely additive. Existing consumers of the metadata block (only the editor itself reads it, for Pass 3 index building) are not affected.

### 5.5 Packaging Data Flow — Release Artifacts

Release tooling introduces a new output path outside the plugin's runtime data flow:

```
repo root
  ├── scripts/release.sh (reads plugin.json, CHANGELOG.md, fixtures/)
  └── releases/          (NEW, git-ignored)
      └── book-crafter-v1.1.0.zip
```

This has **zero runtime impact**. Releases live at repo root, not inside the plugin package. Users never see this directory.

---

## 6. What the Roadmapper Needs to Decompose

| Roadmap Concern | Answer |
|-----------------|--------|
| Phase 10 must finish and verify before Phase 11 starts | ✓ — Gate is "Eternally Secure re-run passes with no regression on components 1-5 and produces non-zero scores on 6-7". |
| Craft rules location decision | Standalone reference `references/bestseller-craft-rules.md`. NOT in voice profile. NOT in Book DNA. NOT inline in skills. |
| Captivation rubric approach | Extract first (10.1), extend second (10.6). Additive 5→7 components, not a replacement. |
| New skills needed | Zero. |
| Skills modified | `writer`, `editor`. That's it. |
| Orchestrator changes | None. Dashboard, stage flow, and state detection are untouched. |
| Sermon-adapter regression protection | Byte-diff `sources-adapted/` before/after. Pulpit-seam detection is report-only, not auto-rewrite. |
| Tension-release enforcement | Detect + flag, do not fail. Consistent with Pass 3 philosophy. |
| Packaging file locations | `marketplace.json` in `.claude-plugin/`. `README.md`, `INSTALL.md`, `CHANGELOG.md`, `scripts/`, `fixtures/` at plugin root. `releases/` git-ignored at repo root. |
| Release automation | `scripts/release.sh` (bash, ~80 lines). Version check, changelog check, smoke-test, zip with explicit excludes. |
| Smoke-test fixture | `fixtures/tiny-book/` — 3-chapter booklet from brief, full pipeline, .docx validation. Excluded from zip. |

---

## 7. Sources

- `/Users/David/Development/book-crafter-plugin/skills/orchestrator/SKILL.md` (751 lines, verified 2026-04-15) — HIGH confidence
- `/Users/David/Development/book-crafter-plugin/skills/writer/SKILL.md` (352 lines, verified 2026-04-15) — HIGH confidence
- `/Users/David/Development/book-crafter-plugin/skills/editor/SKILL.md` (512 lines, verified 2026-04-15) — HIGH confidence
- `/Users/David/Development/book-crafter-plugin/references/pipeline-stages.md` (147 lines, verified 2026-04-15) — HIGH confidence
- `/Users/David/Development/book-crafter-plugin/references/voice-profiles/voice-profile-spec.md` (61 lines, verified 2026-04-15) — HIGH confidence
- `/Users/David/Development/book-crafter-plugin/.claude-plugin/plugin.json` (10 lines, verified 2026-04-15) — HIGH confidence
- `/Users/David/Development/book-crafter-plugin/.planning/PROJECT.md` (validated requirements + v1.1 milestone scope) — HIGH confidence
- Claude Code Plugins documentation (`code.claude.com/docs/en/plugins`) — HIGH confidence (training + CLAUDE.md context)
- Absence of `references/captivation-rubric.md` and `references/tension-release-framework.md` verified by `ls` and `find` — HIGH confidence (these files do not exist; prompt's mention was aspirational)
