# Stack Research — Milestone v1.1 (Writing Quality v2 + Distribution)

**Domain:** Claude Code plugin distribution + second-pass prose quality
**Researched:** 2026-04-15
**Confidence:** HIGH (marketplace schema verified against current code.claude.com/docs; quality-v2 intentionally introduces zero runtime dependencies)

> Scope discipline: this is an **additive** research pass for a shipped plugin. It deliberately does **not** re-research the core stack (plugin system, docx-js 9.6.1, Node >=18, Markdown intermediates, skills/agents architecture). Those remain as established in the v1.0 STACK and should not be re-litigated. Everything below is net-new for (a) Writing Quality v2 and (b) one-click distribution.

---

## TL;DR

1. **No new npm dependencies.** Writing Quality v2 is entirely model-driven inside skills and references. A prose linter would fight the voice profile rather than help it.
2. **Distribution = GitHub-hosted marketplace + relative-path plugin entry.** This is the only path in the current Claude Code plugin system that gives a non-technical recipient a true two-line install (`/plugin marketplace add` then `/plugin install`). There is **no zip side-load** and **no Claude Desktop (claude.ai) GUI plugin installer** at the time of research — plugins are a Claude Code feature, not a claude.ai app feature.
3. **One repo, two roles.** The existing `book-crafter-plugin` repo doubles as the marketplace by adding a single file: `.claude-plugin/marketplace.json` at the repo root that points to `./` (the repo itself, in `strict: true` mode so the existing `plugin.json` remains authoritative).
4. **Version bump to `1.1.0` in `plugin.json`.** Claude Code uses the manifest `version` to detect updates on `/plugin marketplace update`. No version field in `marketplace.json` for relative-path plugins (the docs warn against double-declaring).
5. **Smoke test = one shell script, no new runtime code.** A `scripts/smoke-test.sh` that runs `claude plugin validate .` plus a fixture-project dry run of the orchestrator. No Node test runner needed.

---

## Part A — Writing Quality v2 Stack

### Core additions

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| None (net-new) | — | — | **Quality v2 is LLM-driven inside existing skills.** Every specific gap Phase 7 missed (scene-first openers, Greek-word density cap, author vulnerability beats, central-image lifting, enforced tension-release, reader-anchor specificity, pulpit-seam detection) is a **rule the model needs to apply**, not a rule a static analyser can catch. Grammar-level tools flag passive voice and reading level; they cannot detect "this paragraph sounds like a pulpit transition." Confidence: HIGH. |

### Supporting libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None | — | — | See "What NOT to add" below for the prose-linter options explicitly rejected and why. |

### Development tools (quality v2)

| Tool | Purpose | Notes |
|------|---------|-------|
| `scripts/smoke-test.sh` (new, ~30 lines bash) | Release gate: validate plugin + dry-run orchestrator on a fixture | Calls `claude plugin validate .`, then runs a headless orchestrator pass against `tests/fixtures/eternally-secure-ch1/` and diffs the captivation score JSON against a baseline. No new runtime deps — just bash + `jq` (already assumed on Mac). |
| Existing Phase 7 captivation scorer | Reused as the v2 gate | Already emits a 5-component 0–10 score. v2 adds a second pass that must raise the score by a threshold (e.g. +1.5) before the chapter is accepted. Already in-repo. |

### Implementation pattern (no code, just structure)

The second quality pass is a **new skill** (`skills/quality-pass-2/SKILL.md`) plus a **new reference** (`references/bestseller-quality-v2.md`) that lists the seven concrete gaps and the fix rubric for each. The editor skill gains a mode switch: `editor --pass 2` loads the new reference and the evidence file (`evidence/eternally-secure-ch1.md`) and rewrites using them as a checklist. Zero new libraries; everything is markdown and prompt engineering.

---

## Part B — Distribution Stack

### Core additions

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `.claude-plugin/marketplace.json` | Schema current as of 2026-04-15 (code.claude.com/docs/en/plugin-marketplaces) | Catalog file that turns the repo into a single-plugin marketplace. Required by Claude Code for `/plugin marketplace add` to work against a GitHub repo. | This is the **only** schema Claude Code recognises for plugin distribution. Verified against official docs 2026-04-15. No alternative exists. Confidence: HIGH. |
| `plugin.json` `version` bump → `1.1.0` | Semver | Tells Claude Code an update is available when recipients run `/plugin marketplace update book-crafter`. | Docs warn: if both `plugin.json` and `marketplace.json` declare a version, the manifest silently wins. For GitHub-hosted plugins, keep the version in `plugin.json` and omit it from the marketplace entry. Confidence: HIGH. |
| `CHANGELOG.md` at repo root | Keep-a-Changelog convention | Recipient-visible record of what changed between versions. | Not parsed by Claude Code; purely human-readable. Keep-a-Changelog is the dominant convention and what David already uses elsewhere. Confidence: HIGH. |
| `README.md` at repo root | Plain markdown | Non-technical recipient landing page. Contains the two install commands and a "what to type first" section. | The plugins docs explicitly call out "Add documentation: Include a README.md with installation and usage instructions" as a ship step. Confidence: HIGH. |
| `.gitattributes` + `.gitignore` hygiene | Standard | Keeps `.planning/`, `evidence/`, `books/`, `tests/fixtures/` out of the installed cache. | Plugins are copied into `~/.claude/plugins/cache` on install. Every file in the repo ships unless excluded via the `source` path scope. For a relative-path plugin the entire marketplace root ships, so we want a lean top-level. Confidence: MEDIUM (documented caching behaviour; exclusion mechanism inferred from directory-scoping guidance). |

### Supporting files (marketplace wiring)

| File | Role | Notes |
|------|------|-------|
| `.claude-plugin/marketplace.json` | Marketplace catalog | Points to `./` with `strict: true` so the existing `.claude-plugin/plugin.json` remains the authority on skills/agents/hooks. |
| `.claude-plugin/plugin.json` | Plugin manifest (already exists) | Bump `version` from `1.0.0` → `1.1.0`. Add `homepage`, `repository`, `license` fields (all optional but recommended by docs for distributed plugins). |
| `CHANGELOG.md` | Human changelog | `## [1.1.0] - 2026-04-15` section covering Writing Quality v2 and distribution. |
| `README.md` | Recipient install guide | Three-step quickstart targeted at a non-technical user (see "Install UX" below). |

### Development tools (distribution)

| Tool | Purpose | Notes |
|------|---------|-------|
| `claude plugin validate .` | Pre-release validator | Built into Claude Code. Checks `plugin.json`, `marketplace.json`, skill frontmatter, and `hooks/hooks.json`. Wire into `scripts/smoke-test.sh`. Confidence: HIGH. |
| `claude --plugin-dir ./` | Local smoke test | Lets David load the plugin in his own Claude Code without going through the marketplace path. Fastest inner loop during Phase 10/11. Confidence: HIGH. |
| `git tag v1.1.0` + GitHub release | Release mechanics | Marketplace entries can pin to `ref` (branch/tag) — tagging gives recipients a stable install target if needed later. For v1.1 ship, default branch is fine. |

---

## Installation (for David, the author)

```bash
# Bump the manifest version (manually, in .claude-plugin/plugin.json)
# 1.0.0 → 1.1.0

# Create the marketplace file (one new file, see "Marketplace.json shape" below)

# Validate locally before pushing
claude plugin validate .

# Smoke test against fixture
./scripts/smoke-test.sh

# Commit, tag, push
git tag v1.1.0
git push origin main --tags
```

No `npm install` step. No new runtime dependencies. Phase 10 and Phase 11 between them touch **zero** `node_modules`.

---

## Install UX (for the non-technical recipient)

This is the load-bearing requirement. The recipient must never open a terminal outside of Claude Code itself.

**Prerequisite (one-time, done once per machine):** Claude Code is installed. If the recipient does not have Claude Code at all, that is out of scope for this plugin — they need to install Claude Code first via the official installer. **There is no way to install a Claude Code plugin into the claude.ai desktop app.** Plugins are a Claude Code feature.

**Install flow, from inside a Claude Code session:**

```text
/plugin marketplace add encounter-church/book-crafter-plugin
/plugin install book-crafter@book-crafter-plugin
/reload-plugins
```

Then to start writing a book:

```text
/book-crafter:orchestrator
```

That is the entire UX. Three slash commands, copy-pasted from the README. No zip files, no folder browsing, no Node install, no npm, no terminal commands outside Claude Code's own prompt.

**Updates:** the recipient runs `/plugin marketplace update book-crafter-plugin` then `/reload-plugins`. Auto-update can be enabled per-marketplace via the `/plugin` Marketplaces tab UI, which is the recommended setting for a non-technical user so they never have to remember.

---

## Marketplace.json shape (ready to copy)

Exact schema, verified against https://code.claude.com/docs/en/plugin-marketplaces on 2026-04-15:

```json
{
  "name": "book-crafter-plugin",
  "owner": {
    "name": "David, Encounter Church",
    "email": "david@encounterchurch.co.za"
  },
  "metadata": {
    "description": "Single-plugin marketplace for the Book Crafter Claude Code plugin."
  },
  "plugins": [
    {
      "name": "book-crafter",
      "source": "./",
      "description": "Write complete books from topic or sermon source to professional .docx. Pipeline architecture with swappable voice profiles.",
      "homepage": "https://github.com/encounter-church/book-crafter-plugin",
      "repository": "https://github.com/encounter-church/book-crafter-plugin",
      "license": "MIT",
      "keywords": ["book", "writing", "theology", "docx", "sermon", "multi-agent"],
      "category": "writing",
      "strict": true
    }
  ]
}
```

Key decisions, each verified against the docs:

- **`source: "./"`** — a relative path that resolves to the marketplace root (the repo root, which contains `.claude-plugin/plugin.json`). Docs: "Paths resolve relative to the marketplace root, which is the directory containing `.claude-plugin/`." This pattern is the documented way to ship a single-plugin-per-repo marketplace.
- **`strict: true`** — the default, but stated explicitly. Keeps the existing `plugin.json` as the single source of truth for skills/agents/hooks. Prevents the marketplace entry from having to re-declare every skill path. Docs: "`plugin.json` is the authority for component definitions."
- **No `version` field in the plugins array** — docs warn: "When possible, avoid setting the version in both places. The plugin manifest always wins silently." Version lives in `plugin.json`.
- **`name: "book-crafter-plugin"`** for the marketplace and **`name: "book-crafter"`** for the plugin — matches the existing `plugin.json` name and avoids collision with the "reserved names" list (docs prohibit `claude-plugins-official`, `anthropic-marketplace`, etc., none of which conflict with our naming).
- **`category: "writing"`** — optional but improves discoverability if David ever submits to the official Anthropic marketplace later. No ship-blocking effect.

---

## `plugin.json` v1.1 shape (ready to copy)

Add these optional fields to the existing manifest at the same time as the version bump:

```json
{
  "name": "book-crafter",
  "version": "1.1.0",
  "description": "Write complete books from topic brief or source material to professional .docx. Pipeline architecture: outline, research, write, edit, quality-v2, format. Ships with a theological voice profile, supports custom voices.",
  "author": {
    "name": "David",
    "email": "david@encounterchurch.co.za"
  },
  "homepage": "https://github.com/encounter-church/book-crafter-plugin",
  "repository": "https://github.com/encounter-church/book-crafter-plugin",
  "license": "MIT",
  "keywords": ["book", "writing", "publishing", "theology", "docx", "sermon", "multi-agent"]
}
```

All fields verified against the plugin manifest schema at https://code.claude.com/docs/en/plugins on 2026-04-15. `name`, `version`, `description`, and `author` are the quickstart-listed fields; `homepage`, `repository`, `license`, and `keywords` are listed under "additional fields" in the full manifest schema reference.

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| GitHub-hosted marketplace with relative-path source | Zip file emailed to recipient + `unzip` + `/plugin marketplace add ./path` | Never for this milestone. Requires the recipient to touch a terminal outside Claude Code, which violates the "non-technical recipient" constraint. Only reasonable if the recipient is airgapped, which they are not. |
| Single-plugin marketplace in the same repo (`source: "./"`) | Separate marketplace repo that points at `book-crafter-plugin` via `github` source | Only if David later ships a second plugin. For one plugin, a separate repo is overhead with no upside — every change needs coordination across two repos and the marketplace version has to be kept in lockstep. |
| `strict: true` (default) | `strict: false` with full component declaration in marketplace.json | Only for marketplace operators curating third-party plugins. We are the author; our `plugin.json` is canonical. |
| Keep version only in `plugin.json` | Version in both files | Never. Docs explicitly warn the manifest wins silently, leading to ignored marketplace versions. |
| Model-driven writing quality v2 | write-good / textlint / retext-* prose linters | Only if we wanted **generic** prose rules (passive voice, weasel words). We want **specific** rules like "this paragraph has pulpit rhythm" and "central image must be lifted into chapter title" — no static linter can detect those. |
| LLM-in-the-skill captivation scoring | Programmatic readability scoring (Flesch-Kincaid via text-readability) | Flesch-Kincaid measures syllables per sentence. Bestseller non-fiction voice is not a readability score. Would add a dependency for a metric that's actively misleading for this domain. |
| Bash smoke-test script | Jest / Vitest / Node test runner | Overkill. Smoke test is a validation gate, not a unit test suite. Skills and markdown don't unit-test meaningfully — the meaningful test is "does the orchestrator produce a chapter that scores >= X." That's an integration run, best expressed as a script. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **Zip-based distribution** | Claude Code has no zip side-load path. The only documented local-install modes are `/plugin marketplace add <local-path>` (a directory, not a zip) and `claude --plugin-dir <path>` (for developers). A recipient receiving a zip would still need to extract it and paste a local path — worse UX than a GitHub URL. | GitHub-hosted marketplace, `/plugin marketplace add encounter-church/book-crafter-plugin`. |
| **Claude Desktop (claude.ai) app plugin install** | Not a thing. The plugin system is Claude **Code**, not Claude **Desktop**. The milestone wording "Claude Desktop" should be read as "Claude Code, installed on the recipient's desktop" — verified by the absence of any plugin UI in claude.ai and the presence of `/plugin` only in Claude Code docs. | Claude Code + official marketplace commands. Update the milestone language in REQUIREMENTS.md to "Claude Code on the recipient's machine" to avoid confusion. |
| **write-good** (npm prose linter) | Rules target generic business writing (passive voice, weasel words, "so"-starts). Would flag legitimate voice choices in the theological profile as errors. Maintenance has been sporadic and its ruleset is frozen to a 2015-era style guide. | Model-driven quality-pass-2 with a domain-specific rubric in `references/bestseller-quality-v2.md`. |
| **textlint** / **retext** ecosystem | Heavier configuration burden for the same wrong-tool-for-the-job problem as write-good. Each rule needs a plugin, each plugin needs tuning, and at the end we'd have a linter that still can't detect "pulpit seam." | Same as above: model-driven v2 pass. |
| **text-readability / Flesch-Kincaid scorers** | Measures syllables per sentence. Captures readability, not voice. Bestseller non-fiction frequently has Flesch scores identical to sermons — the difference is rhythm, image, hook, and specificity, none of which the metric sees. | Keep the existing captivation scorer; extend its rubric in v2. |
| **Prettier / markdownlint for the .md artefacts** | Would reflow prose and destroy the line-break decisions the writer and editor skills make deliberately. Markdown generated by LLMs is not source code. | Leave markdown artefacts alone. The formatter skill is the only thing that transforms them. |
| **GitHub Releases as the primary install mechanism** | Recipients would need to download, extract, and locate the directory. Works as a **fallback** but not the primary path. | GitHub default branch + `ref` pinning if a release channel is needed later. |
| **Separate marketplace repo** | Doubles the release surface for a one-plugin project. Every version bump needs commits in two repos and they can drift. | Single-repo marketplace with `source: "./"`. |
| **`plugin.json` + `marketplace.json` both declaring version** | Docs explicitly warn: "The plugin manifest always wins silently, which can cause the marketplace version to be ignored." | Version only in `plugin.json` for this (relative-path) setup. |
| **`WidthType.PERCENTAGE` in docx-js tables** (inherited from v1.0 warning) | Still true. Breaks in Google Docs. | `WidthType.DXA`. No change in v1.1. |

---

## Stack Patterns by Variant

**If David ships a second plugin later (e.g. `sermon-crafter-plugin` as a sibling):**
- Split the marketplace into its own repo (`encounter-church/claude-plugins`).
- `book-crafter-plugin` and `sermon-crafter-plugin` become `github` sources in that repo's `marketplace.json`.
- Each plugin keeps its own `plugin.json` and version cadence.
- **Do not do this in v1.1.** Only trigger it if/when plugin #2 is real.

**If the recipient is fully offline / airgapped (not the current case):**
- Pre-populate `~/.claude/plugins` via `CLAUDE_CODE_PLUGIN_SEED_DIR` (docs: "Pre-populate plugins for containers").
- Out of scope for v1.1 but a clean path if it ever comes up.

**If a stable/latest channel is needed (not the current case):**
- Two tagged refs (`stable`, `latest`) with two marketplace entries pointing at the same repo at different refs. Docs: "Set up release channels."
- For v1.1, default branch is fine; there is one recipient and one channel.

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `marketplace.json` schema (current) | Claude Code with `/plugin` command | If the recipient's Claude Code predates the plugin system, `/plugin` returns "unknown command." README must tell them to upgrade Claude Code first. Verified via docs troubleshooting section 2026-04-15. |
| `plugin.json` v1.1.0 | `marketplace.json` with `strict: true` | Marketplace entry supplements but does not override. No conflict. Confidence: HIGH. |
| Existing docx@9.6.1 | Plugin cache directory | Plugins ship bundled with their own `node_modules`? **No** — the docx skill pattern calls docx via the system-installed `node` + a temp script, so the recipient still needs `node >= 18` available on `PATH`. This must be called out in the README as a prerequisite alongside Claude Code itself. Confidence: HIGH (matches v1.0 STACK, unchanged). |
| Book-crafter plugin cache location | `~/.claude/plugins/cache/book-crafter-plugin/book-crafter/1.1.0/` | Verified via marketplace docs: "Plugin versions determine cache paths." Means the recipient's old 1.0.0 cache coexists with 1.1.0 until they explicitly uninstall the old one — harmless. |

---

## Sources

- **Create and distribute a plugin marketplace** — https://code.claude.com/docs/en/plugin-marketplaces — fetched 2026-04-15. Source of the marketplace.json schema, plugin sources table, `strict` mode, version-resolution warning, `/plugin marketplace add ./local-path` behaviour, reserved-names list. **Confidence: HIGH** (official, current).
- **Create plugins** — https://code.claude.com/docs/en/plugins — fetched 2026-04-15. Source of the plugin.json manifest schema (`name`, `version`, `description`, `author`, `homepage`, `repository`, `license`, `keywords`), `--plugin-dir` local testing flag, `/reload-plugins` command, "ship your plugin" checklist. **Confidence: HIGH** (official, current).
- **Discover and install prebuilt plugins** — https://code.claude.com/docs/en/discover-plugins — fetched 2026-04-15. Source of the end-user install UX, `/plugin` tabbed UI, auto-update configuration, scope options. Used to verify that claude.ai desktop has no plugin installer and that `/plugin marketplace add owner/repo` is the non-technical path. **Confidence: HIGH** (official, current).
- **Existing `.planning/PROJECT.md`** (read 2026-04-15) — milestone goals and the "non-technical recipient" constraint. **Confidence: HIGH** (local, verified).
- **Existing `.claude-plugin/plugin.json`** (read 2026-04-15) — current manifest shape, confirmed missing `homepage`/`repository`/`license` fields that v1.1 should add. **Confidence: HIGH** (local, verified).
- **v1.0 STACK section in repo CLAUDE.md** (read 2026-04-15) — baseline for docx@9.6.1, Node >=18, plugin architecture decisions that remain unchanged. **Confidence: HIGH** (local, verified).

---

*Stack research for: Book Crafter Plugin v1.1 — Writing Quality v2 + Distribution*
*Researched: 2026-04-15*
