# Phase 11: Distribution Packaging - Research

**Researched:** 2026-04-15
**Domain:** Claude Code plugin packaging, marketplace publishing, release automation
**Confidence:** HIGH (schemas re-fetched live from official docs 2026-04-15 per PKG-10)

## Summary

Phase 11 packages the Book Crafter plugin for one-click install by a non-technical recipient via Claude Code's marketplace system. The live re-fetch of `code.claude.com/docs/en/plugins`, `plugin-marketplaces`, and `plugins-reference` (2026-04-15) resolves every open schema question in CONTEXT.md: the `plugin.json` schema requires only `name`, with `version`, `description`, `author`, `homepage`, `repository`, `license`, `keywords` all optional; `repository` is a **string** (URL), not an object; `license` is a free-form SPDX identifier; `author` is an object with required `name` and optional `email`/`url`. `marketplace.json` requires `name`, `owner` (object with required `name`), and `plugins[]`; each plugin entry requires only `name` and `source`. Relative-path source `"./"` resolves to the marketplace root (the directory containing `.claude-plugin/`), making the repo-as-marketplace single-plugin pattern a one-liner. `strict: true` (the default) means `plugin.json` is the authority and the marketplace entry can supplement it — D-23's "no version field in marketplace.json" is correct and reinforced by an explicit warning in the docs ("plugin manifest always wins silently").

The install-flow questions also resolve cleanly. `/plugin marketplace add gygundo/book-crafter-plugin` accepts GitHub `owner/repo` shorthand automatically. `/plugin install book-crafter@book-crafter-plugin` uses the correct `<plugin-name>@<marketplace-name>` form — note that `book-crafter-plugin` here is the **marketplace** name (the `name` field in `marketplace.json`), not the repo name. The reload command is `/reload-plugins` (not `/plugin reload`) — verified directly in the official quickstart. Dev-loaded plugins via `claude --plugin-dir` take precedence over marketplace-installed plugins of the **same name** for that session, but D-19's rename of the dev copy to `book-crafter-dev` means both coexist cleanly without precedence games — the dev copy is a wholly separate plugin identity.

`claude plugin validate <path>` exists as an out-of-session CLI (also `/plugin validate` inside a session). It validates `plugin.json`, skill/agent/command frontmatter, and `hooks/hooks.json` syntax/schema. Warnings are non-blocking (missing description, non-kebab-case names); errors are blocking (missing required fields, bad JSON, path traversal in `source`). Exit code 0 = pass, non-zero = fail. Release.sh can safely call it on the staging directory per D-26 gate 5.

**Primary recommendation:** Use the repo-as-marketplace single-plugin pattern with `source: "./"` and `strict: true`. Ship `plugin.json` v1.1.0 with all seven metadata fields populated (name, version, description, author, homepage, repository, license, keywords). Rename dev to `book-crafter-dev`; release.sh flips the staging copy back to `book-crafter`. Skill naming `/book-crafter:sample` is collision-free against the existing 9 skills. Validate via `claude plugin validate <staging>` before zipping.

## User Constraints (from CONTEXT.md)

<user_constraints>

### Locked Decisions

**GitHub Repo Identity**
- **D-01:** GitHub owner/repo = `gygundo/book-crafter-plugin`. All marketplace URLs, README install commands, and `plugin.json.repository` use this exact path.
- **D-02:** Repo does NOT exist yet — creating it is an explicit Phase 11 task. Must be created BEFORE writing README.md and BEFORE `plugin.json` metadata bump.
- **D-03:** Repo visibility: public at creation. Required for `/plugin marketplace add gygundo/book-crafter-plugin` to resolve without auth.

**Fixture Content (PKG-06)**
- **D-04:** Claude drafts `fixtures/tiny-book/brief.md` at plan time; topic must exercise every CRAFT-01..08 rule deterministically (sensory scene openers, vulnerability beat anchors, ≥2 reader-moment opportunities, tension-release beats, a central-image candidate).
- **D-05:** Fixture uses `spiritual-default.md` voice profile. Secular voice swap deferred.
- **D-06:** 3-chapter booklet, ≤2,500 words total, ≤5 minutes full pipeline time (SC-4).
- **D-07:** `expected-captivation-score.txt` contains a single minimum threshold integer on the 0–14 scale. Starting recommendation `>= 8`, calibrate on first run.
- **D-08:** Smoke-test pass condition = `.docx` exists AND captivation rubric total ≥ threshold. Nothing else.

**Sample Skill UX (PKG-09)**
- **D-09:** `/book-crafter:sample` runs non-interactive, full pipeline end-to-end. No gates — fixture is pre-approved by existing in the repo. Orchestrator invoked programmatically against the fixture brief.
- **D-10:** Sample writes output to `fixtures/tiny-book/run/`. Gitignored AND excluded from `release.sh` whitelist.
- **D-11:** Sample does NOT auto-enable `--fresh` mode. First run is normal; re-invocation triggers fresh only when `fixtures/tiny-book/run/` already exists.
- **D-12:** Sample prints exactly one summary line:
  - PASS: `SAMPLE PASS — .docx at fixtures/tiny-book/run/final/<name>.docx, captivation N/14 (threshold M)`
  - FAIL: `SAMPLE FAIL — <specific reason> (see fixtures/tiny-book/run/consistency-report.md)`
- **D-13:** Sample exit code reflects pass/fail.

**README Tone + Claim Discipline (PKG-03)**
- **D-14:** Plain, friendly, zero-jargon. No "multi-agent", "pipeline", "orchestrator" in body.
- **D-15:** Node ≥18 callout at top: `> **Requires:** Claude Code + Node ≥18. Check with \`node -v\`.`
- **D-16:** Pre-Phase-12 capability line = **"Writes structured non-fiction books with enforced craft rules."** — verbatim, only capability sentence allowed at Phase 11 close.
- **D-17:** README includes 3–4 line quoted prose block under capability line. Source: tiny-book fixture output after first successful sample run. Ship `<!-- TODO(phase-12): replace with fixture paragraph -->` placeholder if Phase 11 closes before fixture run. Never fabricate.
- **D-18:** "What this makes" section = one sentence describing .docx output.

**Dev / Release Plugin Isolation (Pitfall 14 prevention)**
- **D-19:** Dev `plugin.json.name = "book-crafter-dev"`.
- **D-20:** `scripts/release.sh` rewrites name `book-crafter-dev` → `book-crafter` in staging only. Staging dir is wiped after each build.
- **D-21:** Name rewrite happens AFTER whitelist copy into staging, never in-place.
- **D-22:** Skill identifiers in README/CHANGELOG/examples always use `book-crafter:*`, never `book-crafter-dev:*`. Dev-only notes live in `DEV-NOTES.md` (gitignored).

**Release Script Scope (PKG-07)**
- **D-23:** `release.sh` does NOT git-tag. Tagging is Phase 12 GATE-09.
- **D-24:** Zip output path `dist/book-crafter-v1.1.0.zip`. `dist/` gitignored. Version parsed from `plugin.json`.
- **D-25:** Version/CHANGELOG gate = pure bash + grep, no `jq`, no node.
- **D-26:** Release.sh gate order (all fail-hard):
  1. `plugin.json` version present and parseable
  2. `CHANGELOG.md` has `## [VERSION]` section
  3. Whitelist copy into staging (explicit list, never `cp -r .`)
  4. Dev→release name rewrite in staging
  5. `claude plugin validate <staging>` passes (if available; otherwise warn, don't block)
  6. Zip staging into `dist/book-crafter-v${VERSION}.zip`
  7. Size check: fail if > 5MB
  8. Personal-path grep: fail on any `/Users/David` match
  9. Print manifest: `unzip -l dist/book-crafter-v${VERSION}.zip`
- **D-27:** Release.sh whitelist (authoritative — do not add without user approval):
  - `.claude-plugin/` (plugin.json + marketplace.json)
  - `skills/` (all shipped skills)
  - `agents/` (chapter-writer, chapter-editor)
  - `references/` (voice profiles, craft rules, captivation rubric, calibration, spec docs)
  - `scripts/craft-check.js` + `scripts/test-craft-check.js` + `scripts/test-rubric-regression.js`
  - `fixtures/tiny-book/brief.md` + `fixtures/tiny-book/expected-captivation-score.txt`
  - `README.md`, `LICENSE`, `CHANGELOG.md`
  - **Excluded:** `.planning/`, `.git/`, `.DS_Store`, `books/`, `evidence/`, `fixtures/phase10/`, `fixtures/tiny-book/run/`, `dist/`, `DEV-NOTES.md`

### Claude's Discretion
- Exact topic/title of tiny-book fixture brief (must satisfy D-04)
- Exact integer threshold in `expected-captivation-score.txt` (start D-07, calibrate on first run)
- CHANGELOG v1.0.0 entry (synthesise from phases 1–9)
- CHANGELOG v1.1.0 entry (synthesise from phases 10 + 11)
- Exact wording of README install block, headers, section order (subject to D-14..D-18)
- Whether to split release.sh into sub-functions or keep flat (flat fine for ~9 gates)
- `.gitignore` additions for `dist/`, `fixtures/tiny-book/run/`, `DEV-NOTES.md`
- Whether to add `release.sh --dry-run` (nice-to-have, not required)

### Deferred Ideas (OUT OF SCOPE)
- Seven-gap comparison file → Phase 12 GATE-03
- Fresh-install smoke test → Phase 12 GATE-06
- README capability language referencing evidence → Phase 12 GATE-07
- `git tag v1.1.0` → Phase 12 GATE-09 (HARD GATE on David's ship decision GATE-08)
- External fresh-Claude blind review → Phase 12 GATE-04
- Sermon-adapter regression byte-diff → Phase 12 GATE-05
- Secular voice fixture → v1.2
- Per-component minima in `expected-captivation-score.txt` → v1.2
- Full CRAFT-01..08 matrix gate in sample skill → Phase 12
- `release.sh --dry-run` mode → nice-to-have
- Official Anthropic marketplace submission → deferred
- Windows-host smoke test → deferred
- Pre-flight doctor skill (PKG-DIFF-01) → deferred

</user_constraints>

## Phase Requirements

<phase_requirements>

| ID | Description | Research Support |
|----|-------------|------------------|
| PKG-01 | `.claude-plugin/marketplace.json` with `source: "./"`, `strict: true`, no version field | §Marketplace.json Schema (verified live); relative-path source resolves to marketplace root |
| PKG-02 | `plugin.json` bumped to 1.1.0 + homepage/license/author/repository | §Plugin.json Schema — all four fields documented as optional metadata; repository is a string URL; license is SPDX id |
| PKG-03 | README with 3-line copy-paste install + Node ≥18 callout | §Install Flow verified: `/plugin marketplace add`, `/plugin install <name>@<market>`, `/reload-plugins` |
| PKG-04 | LICENSE (MIT) | Standard MIT text, SPDX `MIT` |
| PKG-05 | CHANGELOG.md Keep-a-Changelog format, v1.0.0 + v1.1.0 entries | Keep-a-Changelog spec; required for release.sh gate D-26 step 2 |
| PKG-06 | `fixtures/tiny-book/` with brief.md + expected-captivation-score.txt, ≤5 min pipeline | §Sample Skill Invocation; Phase 10 `--fresh` mode contract; craft-check.js reuse |
| PKG-07 | `scripts/release.sh` — whitelist, version/CHANGELOG gates, size check, personal-path grep | §Release Script Hygiene; D-26 gate order resolved fully |
| PKG-08 | `claude plugin validate .` passes cleanly | §Validate Command verified; CLI invocation `claude plugin validate <path>`; warnings vs errors documented |
| PKG-09 | `/book-crafter:sample` skill | §Sample Skill Pattern; namespace `book-crafter:sample` collision-free; orchestrator programmatic invocation via Mode 6 trigger phrase |
| PKG-10 | Marketplace schema re-verified at phase start | THIS DOCUMENT — doc re-fetch completed 2026-04-15, schemas current |

</phase_requirements>

## Standard Stack

### Core (all verified 2026-04-15 against official docs)

| Technology | Version | Purpose | Why Standard |
|------------|---------|---------|--------------|
| Claude Code plugin system | current (live spec) | Plugin packaging, marketplace install, namespace resolution | No alternative. **Confidence: HIGH** (re-fetched `code.claude.com/docs/en/plugins` and `plugin-marketplaces` 2026-04-15) |
| `.claude-plugin/plugin.json` | schema 2026-04 | Plugin manifest, v1.1.0 bump target | Required format. All metadata fields documented in plugins-reference. **Confidence: HIGH** |
| `.claude-plugin/marketplace.json` | schema 2026-04 | Single-plugin marketplace entry, `source: "./"` repo-as-marketplace pattern | Required for `/plugin marketplace add` flow. Single-plugin pattern explicit in docs. **Confidence: HIGH** |
| `claude plugin validate` CLI | current | Manifest + frontmatter + hooks.json syntax/schema validation | Official validator. Checks plugin.json, SKILL/agent frontmatter, hooks/hooks.json. **Confidence: HIGH** |
| Bash 3.2+ | macOS default | `scripts/release.sh` shell | No new runtime. Uses only coreutils + `grep`, `sed`, `zip`, `unzip`. **Confidence: HIGH** |
| `zip` / `unzip` | system | Release artefact build + manifest inspection | Standard on macOS/Linux. **Confidence: HIGH** |
| Keep-a-Changelog 1.1.0 | spec | CHANGELOG.md format | Industry convention. `## [VERSION]` header shape is what `release.sh` grep gate parses (D-26 step 2). **Confidence: HIGH** |
| SPDX `MIT` | 2024 | LICENSE file identifier | Standard open-source license; matches `plugin.json.license` field. **Confidence: HIGH** |

**No new runtime dependencies.** Phase 11 ships zero new `node_modules`, zero new npm packages, zero binaries. Release.sh is pure bash + system utilities. `craft-check.js` (already in repo from Phase 10) is the only Node script, and it runs via plain `node` — no packages.

### Plugin.json Schema (verified 2026-04-15)

Source: https://code.claude.com/docs/en/plugins-reference (re-fetched Phase 11 kickoff, PKG-10).

**Required field:** `name` (string, kebab-case, no spaces).

**Optional metadata fields** (all used by Phase 11 bump):

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `version` | string (semver) | `"1.1.0"` | Authority if also set in marketplace entry — plugin.json silently wins. Keep version in plugin.json ONLY (D-23). |
| `description` | string | `"Write complete books…"` | Shown in plugin manager. Keep existing v1.0 text or refresh. |
| `author` | object | `{"name": "David", "email": "…", "url": "…"}` | `name` required, `email` and `url` optional. |
| `homepage` | string (URL) | `"https://github.com/gygundo/book-crafter-plugin"` | Free-form URL. |
| `repository` | **string (URL)** | `"https://github.com/gygundo/book-crafter-plugin"` | **String, not object.** Plugins-reference documents it as `string` type. (npm-style `{type, url}` objects are NOT the Claude Code shape.) |
| `license` | string (SPDX id) | `"MIT"` | Free-form SPDX identifier, e.g. `"MIT"`, `"Apache-2.0"`. |
| `keywords` | array of strings | `["book", "writing", "docx", …]` | Discovery tags. Existing v1.0 keywords preserved. |

**Component path fields** (NOT needed for Phase 11 — default locations work): `skills`, `commands`, `agents`, `hooks`, `mcpServers`, `outputStyles`, `lspServers`, `monitors`, `userConfig`, `channels`. Default layout (`skills/` at plugin root) is auto-discovered, so the manifest stays terse.

**Canonical Phase 11 plugin.json (template):**

```json
{
  "name": "book-crafter-dev",
  "version": "1.1.0",
  "description": "Write complete books from topic brief to professional .docx. Enforced craft rules, theological voice profile, custom voice support.",
  "author": {
    "name": "David",
    "email": "david@encounterchurch.co.za"
  },
  "homepage": "https://github.com/gygundo/book-crafter-plugin",
  "repository": "https://github.com/gygundo/book-crafter-plugin",
  "license": "MIT",
  "keywords": ["book", "writing", "publishing", "theology", "docx", "multi-agent"]
}
```

Note: `name: "book-crafter-dev"` is the on-disk value per D-19. `release.sh` rewrites it to `"book-crafter"` in staging per D-20.

### Marketplace.json Schema (verified 2026-04-15)

Source: https://code.claude.com/docs/en/plugin-marketplaces (re-fetched Phase 11 kickoff, PKG-10).

**Required fields:**
- `name` (string, kebab-case) — marketplace identifier. Users reference it as `<plugin>@<name>` when installing. **This is NOT the plugin name.** Recommend `name: "book-crafter-plugin"` (matches repo name) so the install command reads `/plugin install book-crafter@book-crafter-plugin`.
- `owner` (object) — required `name`, optional `email`.
- `plugins` (array) — at least one plugin entry.

**Plugin entry required fields:**
- `name` (string) — plugin identifier. Must match the installed plugin's `plugin.json.name` when `strict: true`. Use `"book-crafter"` here (the release name, not the dev name — this file ships as-is in the release zip and the staging copy of `plugin.json` will have the matching `"book-crafter"` name post-D-20 rewrite).
- `source` — for repo-as-marketplace: the string `"./"`.

**Optional plugin entry fields used:**
- `description`, `strict` (default `true`), plus any of the `plugin.json` metadata fields (docs explicitly allow supplementing).

**No `version` field anywhere in marketplace.json.** D-23 is verified correct. The docs include an explicit warning: *"When possible, avoid setting the version in both places. The plugin manifest always wins silently, which can cause the marketplace version to be ignored."*

**Strict mode semantics** (verified):
- `strict: true` (default) — `plugin.json` is authority. Marketplace entry *supplements* by adding optional metadata. Both sources merged.
- `strict: false` — Marketplace entry is the entire definition. Requires the plugin repo to NOT have a `plugin.json` declaring conflicting components.

**Use `strict: true`** because D-23 requires plugin.json to be the version authority and we want the simplest possible configuration.

**Canonical Phase 11 marketplace.json (template):**

```json
{
  "name": "book-crafter-plugin",
  "owner": {
    "name": "David",
    "email": "david@encounterchurch.co.za"
  },
  "plugins": [
    {
      "name": "book-crafter",
      "source": "./",
      "description": "Write complete books from topic brief to professional .docx with enforced craft rules.",
      "strict": true
    }
  ]
}
```

### Install Flow (verified 2026-04-15)

The three-command README install block, verified verbatim against official docs:

```
/plugin marketplace add gygundo/book-crafter-plugin
/plugin install book-crafter@book-crafter-plugin
/reload-plugins
```

**Verified facts:**

1. **GitHub shorthand resolution:** `owner/repo` shorthand IS accepted by `/plugin marketplace add` (and by the CLI `claude plugin marketplace add`). Docs show: `claude plugin marketplace add acme-corp/claude-plugins` as a canonical example. Public repo (D-03) is required for unauthenticated resolution.

2. **Install syntax:** `/plugin install <plugin-name>@<marketplace-name>`. Here:
   - `<plugin-name>` = `book-crafter` (from `plugin.json.name` after release.sh name rewrite, which matches `marketplace.json.plugins[0].name`)
   - `<marketplace-name>` = `book-crafter-plugin` (from `marketplace.json.name`)
   - The `@` separator is required. The naming choice makes the command a mild tongue-twister (`book-crafter@book-crafter-plugin`) but is consistent with all docs examples (e.g. `quality-review-plugin@my-plugins`).

3. **Reload command:** `/reload-plugins` is the correct name (verified in plugin quickstart: *"Run `/reload-plugins` to pick up the changes"*). **Not** `/plugin reload`. This matters — CONTEXT.md and the existing research draft both already use `/reload-plugins`, so no change needed.

4. **Alternative install paths** (NOT in README — reference only):
   - Interactive TUI: `/plugin` opens the plugin manager for browse/install.
   - CLI out-of-session: `claude plugin marketplace add gygundo/book-crafter-plugin` then `claude plugin install book-crafter@book-crafter-plugin`.

### Dev Plugin Loading Semantics (D-19..D-22 verified)

Verified from plugins docs:

> *"When a `--plugin-dir` plugin has the same name as an installed marketplace plugin, the local copy takes precedence for that session. This lets you test changes to a plugin you already have installed without uninstalling it first."*

**Implication for D-19..D-22:** Because we rename the dev copy to `book-crafter-dev`, there is **no name collision** at all. Dev (`book-crafter-dev`) and release (`book-crafter`) are distinct plugins from Claude Code's perspective. Both can be enabled simultaneously. Phase 12 fresh-install smoke test (GATE-06) will:

1. `/plugin disable book-crafter-dev` (or leave enabled — no collision)
2. `/plugin marketplace add gygundo/book-crafter-plugin` → installs `book-crafter`
3. Both plugins now coexist. Skill namespacing resolves correctly: `/book-crafter:sample` runs the release copy; `/book-crafter-dev:sample` would run the dev copy.

David's skill invocations in day-to-day development currently run against `book-crafter-dev` (not `book-crafter`). D-22 forbids writing `book-crafter-dev:*` in shipped docs so the README and CHANGELOG always reference the release-name form.

**Release.sh name rewrite sequence** (D-20, D-21 verified):
1. Whitelist copy `.claude-plugin/plugin.json` into `staging/.claude-plugin/plugin.json`
2. In staging file only, replace `"name": "book-crafter-dev"` with `"name": "book-crafter"` via `sed -i.bak '...' staging/.claude-plugin/plugin.json && rm staging/.claude-plugin/plugin.json.bak`
3. Verify with `grep '"name": "book-crafter"' staging/.claude-plugin/plugin.json` (fail if missing)
4. Verify repo-on-disk copy is untouched: `grep '"name": "book-crafter-dev"' .claude-plugin/plugin.json` (fail if missing)

### Validate Command Contract

Verified invocations:

**Out-of-session (used by release.sh D-26 gate 5):**
```bash
claude plugin validate /path/to/staging
```

**In-session:**
```
/plugin validate .
```

**What it checks** (from plugin-marketplaces docs):
- `plugin.json` — required fields, JSON syntax, schema conformance
- Skill/agent/command frontmatter — YAML parse, schema
- `hooks/hooks.json` — JSON syntax, schema
- Marketplace file (if present) — schema, duplicate plugin names, path traversal in `source`

**Error vs warning semantics:**

| Level | Blocks load? | Examples |
|-------|-------------|----------|
| Error | YES | Missing `name` field; invalid JSON; path with `..`; duplicate plugin names; malformed `hooks.json` |
| Warning | NO | Missing `metadata.description`; plugin name not kebab-case; empty `plugins` array; missing author in marketplace |

**Exit codes:** 0 on pass (possibly with warnings), non-zero on any error. Release.sh can rely on `claude plugin validate staging/ || exit 1` per D-26 gate 5. The gate is "if command available; otherwise flag but don't block" — implementation pattern:

```bash
if command -v claude >/dev/null 2>&1; then
  claude plugin validate "$STAGING" || { echo "FAIL: validate"; exit 1; }
else
  echo "WARN: claude CLI not found — skipping validate gate"
fi
```

## Architecture Patterns

### Recommended Plugin Structure (for Phase 11 delta)

```
book-crafter-plugin/                    # Repo = marketplace root
├── .claude-plugin/
│   ├── plugin.json                     # MODIFIED: v1.1.0 + metadata, name=book-crafter-dev
│   └── marketplace.json                # NEW: single-plugin marketplace, source="./"
├── skills/
│   ├── orchestrator/                   # unchanged
│   ├── outliner/                       # unchanged
│   ├── researcher/                     # unchanged
│   ├── writer/                         # unchanged
│   ├── editor/                         # unchanged
│   ├── formatter/                      # unchanged
│   ├── enricher/                       # unchanged
│   ├── sermon-adapter/                 # unchanged
│   ├── voice-builder/                  # unchanged
│   └── sample/                         # NEW: /book-crafter:sample (PKG-09)
│       └── SKILL.md
├── agents/                             # unchanged
├── references/                         # unchanged
├── scripts/
│   ├── craft-check.js                  # unchanged (Phase 10)
│   ├── test-craft-check.js             # unchanged (Phase 10)
│   ├── test-rubric-regression.js       # unchanged (Phase 10)
│   └── release.sh                      # NEW (PKG-07)
├── fixtures/
│   ├── phase10/                        # excluded from release
│   └── tiny-book/                      # NEW (PKG-06)
│       ├── brief.md
│       ├── expected-captivation-score.txt
│       └── run/                        # gitignored AND excluded from release
├── dist/                               # gitignored, release.sh output
├── README.md                           # NEW (PKG-03)
├── LICENSE                             # NEW (PKG-04, MIT)
├── CHANGELOG.md                        # NEW (PKG-05, Keep-a-Changelog)
├── CLAUDE.md                           # unchanged
└── DEV-NOTES.md                        # gitignored, excluded from release
```

### Pattern 1: Repo-as-Marketplace Single-Plugin

**What:** One repo, one plugin, one marketplace. The marketplace catalog lives at `.claude-plugin/marketplace.json` and references the same repo via relative-path `source: "./"`.

**When to use:** Distributing a single plugin from a single GitHub repo. Simpler than a separate marketplace repo. Matches the pattern used by most public single-plugin marketplaces per docs examples.

**Path resolution rule** (verified): *"Paths resolve relative to the marketplace root, which is the directory containing `.claude-plugin/`."* So `source: "./"` = repo root. Do NOT use `../` — docs explicitly reject paths traversing outside the marketplace root (validation error).

**Example** (the canonical one above).

### Pattern 2: Dev-Name / Release-Name Isolation

**What:** Dev plugin ships with a suffixed name (`-dev`) on disk. Release script rewrites the name in a staging directory only. Two plugin identities, one codebase, zero collision.

**When to use:** When the developer loads the plugin via `--plugin-dir` on the same machine where they test marketplace installs.

**Sequence** (see §Dev Plugin Loading Semantics above for step detail).

### Pattern 3: Bash Release Gate Pipeline

**What:** A pure-bash script that treats the build as a pipeline of fail-hard gates. Each gate is a simple command; any failure aborts. No external tools beyond coreutils + `grep`/`sed`/`zip`/`unzip`.

**When to use:** Any plugin release where the team wants reproducible, inspectable build gates without a Node/Python toolchain.

**Canonical skeleton** (following D-26):

```bash
#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# Gate 1: extract version from plugin.json
VERSION=$(grep '"version"' .claude-plugin/plugin.json | head -1 | sed -E 's/.*"version": *"([^"]+)".*/\1/')
if [[ -z "$VERSION" ]]; then
  echo "FAIL: could not parse version from plugin.json"; exit 1
fi
echo "Version: $VERSION"

# Gate 2: CHANGELOG has matching entry
if ! grep -q "^## \[${VERSION}\]" CHANGELOG.md; then
  echo "FAIL: CHANGELOG.md missing '## [${VERSION}]' header"; exit 1
fi

# Gate 3: whitelist copy into staging
STAGING=$(mktemp -d -t book-crafter-release-XXXXXX)
trap 'rm -rf "$STAGING"' EXIT

cp -R .claude-plugin "$STAGING/"
cp -R skills "$STAGING/"
cp -R agents "$STAGING/"
cp -R references "$STAGING/"
mkdir -p "$STAGING/scripts" "$STAGING/fixtures/tiny-book"
cp scripts/craft-check.js scripts/test-craft-check.js scripts/test-rubric-regression.js "$STAGING/scripts/"
cp fixtures/tiny-book/brief.md fixtures/tiny-book/expected-captivation-score.txt "$STAGING/fixtures/tiny-book/"
cp README.md LICENSE CHANGELOG.md "$STAGING/"

# Gate 4: dev → release name rewrite in staging ONLY
sed -i.bak 's/"name": "book-crafter-dev"/"name": "book-crafter"/' "$STAGING/.claude-plugin/plugin.json"
rm "$STAGING/.claude-plugin/plugin.json.bak"
grep -q '"name": "book-crafter"' "$STAGING/.claude-plugin/plugin.json" || { echo "FAIL: name rewrite failed"; exit 1; }
grep -q '"name": "book-crafter-dev"' .claude-plugin/plugin.json || { echo "FAIL: repo plugin.json accidentally mutated"; exit 1; }

# Gate 5: claude plugin validate (if available)
if command -v claude >/dev/null 2>&1; then
  claude plugin validate "$STAGING" || { echo "FAIL: validate"; exit 1; }
else
  echo "WARN: claude CLI not found — skipping validate gate"
fi

# Gate 6: zip
mkdir -p dist
ZIP_PATH="dist/book-crafter-v${VERSION}.zip"
(cd "$STAGING" && zip -r -X "$REPO_ROOT/$ZIP_PATH" . -x '*.DS_Store' '*/.DS_Store' '__MACOSX*')

# Gate 7: size check
SIZE_BYTES=$(stat -f%z "$ZIP_PATH" 2>/dev/null || stat -c%s "$ZIP_PATH")
if (( SIZE_BYTES > 5242880 )); then
  echo "FAIL: zip size ${SIZE_BYTES} > 5MB"; exit 1
fi

# Gate 8: personal path grep
if unzip -p "$ZIP_PATH" | grep -l '/Users/David' >/dev/null 2>&1; then
  echo "FAIL: personal path /Users/David found in zip"; exit 1
fi

# Gate 9: manifest
echo "=== Release manifest ==="
unzip -l "$ZIP_PATH"
echo "=== PASS: $ZIP_PATH ==="
```

**Notes on the skeleton:**
- `set -euo pipefail` = fail on any error, undefined variable, or broken pipe
- `trap 'rm -rf "$STAGING"' EXIT` = always clean up staging (D-21)
- `zip -X` strips macOS extended attributes (resource forks) — macOS-specific hygiene
- `-x '*.DS_Store'` excludes any stray .DS_Store (belt-and-braces on top of whitelist)
- Gate 8 uses `unzip -p` (stream-to-stdout) + `grep -l` for a fast path scan

### Anti-Patterns to Avoid

- **`zip -r .`** — ships `.git`, `.planning/`, `evidence/`, `books/`, `.DS_Store`, editor swap files, stale `node_modules`. Always whitelist. (Pitfall 12)
- **Version in both plugin.json and marketplace.json** — plugin.json silently wins. D-23 locks plugin.json as authority. (Docs explicit warning.)
- **`repository` as an object `{type, url}`** — that's npm convention, NOT Claude Code. Use a bare URL string. (Verified plugins-reference.)
- **`/plugin reload`** — does not exist. Use `/reload-plugins`. (Verified quickstart.)
- **In-place dev→release name rewrite on the real `plugin.json`** — would break David's dev environment mid-build. Staging only (D-21).
- **Setting `source: "../"` or any `..`-containing source** — marketplace validation rejects path traversal.
- **Skipping `claude plugin validate`** — cheap last-mile check. Only skip if the CLI isn't available.
- **Hardcoded `book-crafter-dev:*` in README/CHANGELOG** — D-22 forbids. Release docs reference the release name only.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Plugin manifest validation | Custom schema checker | `claude plugin validate` | Official, tracks schema evolution, catches frontmatter issues, free |
| JSON parsing in release.sh | `jq`, Node script | `grep '"version"' \| sed -E` (D-25) | No extra dependency; `jq` not guaranteed on recipient machines (and release.sh runs on David's box where bash is enough). D-25 is explicit. |
| Marketplace indexing/hosting | Custom static site | GitHub repo with `.claude-plugin/marketplace.json` | Built-in GitHub shorthand resolution. Zero infra. |
| Plugin install/reload flow | Custom installer | `/plugin marketplace add` + `/plugin install` + `/reload-plugins` | Built in; three commands; works across CLI, desktop, IDE |
| CHANGELOG parsing | `conventional-changelog`, `standard-version`, npm tooling | Hand-written Keep-a-Changelog + `grep '^## \[$VERSION\]'` | Keep-a-Changelog is the simplest line format; grep suffices for D-26 gate 2 |
| LICENSE text | Custom legal wording | Standard MIT text | SPDX identifier + canonical MIT boilerplate. Plugin-agnostic. |
| Skill invocation plumbing from one skill to another | Fancy IPC | Orchestrator skill's existing file-based state machine | See §Sample Skill Invocation Pattern below |

**Key insight:** Every packaging concern in Phase 11 has an off-the-shelf answer. The only custom code is `release.sh` (30 lines of bash) and `skills/sample/SKILL.md` (markdown instructions, no code). Zero runtime dependencies, zero tools the recipient needs to install beyond Node + Claude Code.

## Runtime State Inventory

Phase 11 is primarily greenfield file authoring (new files only, one manifest bump), but the dev→release rename and fresh-install semantics mean a few categories still need explicit answers:

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None. The plugin has no external datastores — all state is filesystem artefacts under `~/Documents/Books/<title>/`. The rename `book-crafter` → `book-crafter-dev` does NOT appear in any per-book state (verified: book-dna.md, chapter-outline.md, drafts, edits, etc. never embed the plugin name). | None |
| Live service config | None. No external services. `n8n`, `Datadog`, `Tailscale`, `Cloudflare Tunnel` — all unrelated to this plugin. | None |
| OS-registered state | None. Plugin has no launchd agents, no Task Scheduler entries, no pm2 processes, no systemd units. Install path is `~/.claude/plugins/cache/...` and is managed by Claude Code itself. | None |
| Secrets / env vars | None. No secrets, no env vars. `plugin.json.author.email` is public (`david@encounterchurch.co.za`). No CI/CD env vars reference the plugin name. | None |
| Build artefacts / installed packages | **On David's machine only:** after rename from `book-crafter` → `book-crafter-dev`, Claude Code may have cached state under `~/.claude/plugins/cache/book-crafter*` from prior `--plugin-dir` sessions. Also, David's local `/plugin` list may still show a stale `book-crafter` entry if he ever installed the plugin as a marketplace copy during testing. | **Action:** Phase 11 plan should include a dev-side cleanup step: after bumping `plugin.json.name` to `book-crafter-dev`, run `/plugin` to inspect installed plugins; if a stale `book-crafter` shows, `/plugin disable book-crafter` or uninstall it; then re-load dev via `claude --plugin-dir .` and verify `/book-crafter-dev:sample` resolves. Document in `DEV-NOTES.md` (gitignored). |

**The canonical question:** *After every file in the repo is updated, what runtime systems still have the old string cached, stored, or registered?* → The only one is Claude Code's own plugin cache on David's machine. Handled by the disable/reinstall step above.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `claude` CLI | `release.sh` gate 5 (validate), sample skill invocation | ✓ (David's machine) | current | Skip validate gate with warning (D-26 step 5 "if available") |
| `node` ≥18 | sample skill (formatter uses docx-js via `node -e`), release.sh indirectly via craft-check.js | ✓ (David's machine) | ≥18 | None — sample fails without Node. Documented in README callout (D-15). |
| `bash` 3.2+ | `release.sh` | ✓ (macOS default) | system | None — bash is universal. |
| `zip` / `unzip` | `release.sh` gate 6 + gate 8 | ✓ (macOS default) | system | None — universal on Unix. |
| `grep`, `sed`, `stat` | `release.sh` | ✓ (macOS default) | BSD variants | Script uses BSD-compatible flags (`stat -f%z 2>/dev/null || stat -c%s`) |
| `git` | D-02 repo creation, Phase 12 tagging | ✓ (David's machine) | current | None |
| GitHub account `gygundo` | D-01, D-02, D-03 | ✓ (David) | n/a | None — this is David's personal account |
| `claude plugin validate` subcommand | gate 5 | ✓ (verified 2026-04-15, ships with current Claude Code) | current | Warn-and-skip if missing (D-26) |

**Missing dependencies with no fallback:** None — Phase 11 executes on David's dev machine where everything is available.

**Missing dependencies with fallback:** None.

**Recipient-side requirements** (for README prerequisites callout D-15):
- Claude Code installed and authenticated
- Node.js ≥18 (LTS)
- macOS, Linux, or Windows (plugin does not hard-depend on OS-specific tools; formatter uses cross-platform `node -e`)

## Common Pitfalls

### Pitfall 1: `zip -r .` ships the entire repo

**What goes wrong:** Release zip balloons from ~2MB to 200MB+. Ships `.git/` history, `.planning/` strategy docs, `evidence/` folder with unreleased book drafts, `books/` with personal test content, `.DS_Store` droppings, editor swap files.
**Why it happens:** `zip`/`tar` defaults are "include everything". No safety net. Build script written in a hurry.
**How to avoid:** Explicit whitelist (D-27). Never `cp -r .` or `zip -r .`. Build from a temp staging directory. Size gate fails at >5MB (D-26 gate 7). (Pitfalls 12.)
**Warning signs:** Zip > 5MB. `unzip -l` shows any dotfile at the root. `unzip -l` shows `.planning/` or `evidence/`.

### Pitfall 2: Version in both plugin.json and marketplace.json

**What goes wrong:** User edits marketplace.json to bump to 1.2.0, forgets plugin.json. Claude Code reads plugin.json, silently reports v1.1.0, never updates from cache.
**Why it happens:** The two files look related; it's natural to assume they both need the version. Docs have an explicit warning for exactly this case.
**How to avoid:** Version lives in plugin.json ONLY (D-23). Marketplace.json has zero version field. (Verified: marketplace.json schema accepts version in plugin entries but plugin.json silently wins — hence docs' "avoid setting the version in both places".)
**Warning signs:** Recipient reports stale version. `grep version .claude-plugin/marketplace.json` returns a match.

### Pitfall 3: Dev/release name collision on David's machine

**What goes wrong:** Both versions of the plugin load. Skills fire twice. David can't tell which version his tests are hitting.
**Why it happens:** Dev plugin loaded via `--plugin-dir` and marketplace-installed plugin share a name.
**How to avoid:** Dev renamed to `book-crafter-dev` (D-19). Release.sh rewrites to `book-crafter` in staging only (D-20, D-21). Both versions coexist as distinct plugin identities. (Pitfall 14.)
**Warning signs:** `/plugin` list shows two book-crafter entries. `/book-crafter:sample` runs David's dev code.

### Pitfall 4: README overclaims before Phase 12 evidence

**What goes wrong:** README says "bestseller quality" based on planning optimism, not re-run evidence. First reviewer reads the actual tiny-book output and calls it out. Trust damage.
**Why it happens:** Marketing copy written during planning becomes the README at packaging time.
**How to avoid:** D-16 locks the Phase 11 capability sentence: *"Writes structured non-fiction books with enforced craft rules."* — verbatim, only capability sentence allowed. Phase 12 GATE-07 rewrites it with evidence. Placeholder paragraph (D-17) uses `<!-- TODO(phase-12) -->` comment, never fabricated. (Pitfall 22.)
**Warning signs:** README contains "bestseller", "captivating", "page-turner", "professional quality", or other superlatives at Phase 11 close.

### Pitfall 5: Personal paths leak in shipped files

**What goes wrong:** A skill file or reference contains `/Users/David/Development/book-crafter-plugin/...` baked in as an example. Shipped. Recipient sees David's home directory.
**Why it happens:** Developer wrote a path in a docstring or example and forgot.
**How to avoid:** Gate 8 in release.sh: `unzip -p "$ZIP_PATH" | grep -l '/Users/David'` — fail if any match. (Pitfall 19.)
**Warning signs:** Any shipped file mentions `/Users/`, `~/Development`, `/Volumes/`.

### Pitfall 6: `.DS_Store` droppings on macOS

**What goes wrong:** macOS auto-creates `.DS_Store` in every directory visited via Finder. Release zip ships them.
**Why it happens:** macOS default behaviour. Devs don't notice because Finder hides them.
**How to avoid:** Explicit whitelist (never copies hidden files). Belt-and-braces `-x '*.DS_Store' '*/.DS_Store' '__MACOSX*'` on the `zip` command. Global `.gitignore` entry for `.DS_Store` recommended.
**Warning signs:** `unzip -l release.zip | grep DS_Store`.

### Pitfall 7: macOS extended attributes / resource forks in zip

**What goes wrong:** `zip` on macOS, without `-X`, embeds extended attributes and resource forks. Unzipping on Windows/Linux produces `__MACOSX/` directories with `._filename` stubs. Plugin looks corrupt.
**Why it happens:** macOS default. `ditto` and `zip` both have flags to strip.
**How to avoid:** Use `zip -X` to strip extras. Exclude `__MACOSX*` pattern explicitly.
**Warning signs:** Release zip unpacks with a `__MACOSX` directory.

### Pitfall 8: Skill namespace collision

**What goes wrong:** A new skill collides with an existing skill name, breaking invocation.
**Why it happens:** Careless naming in a plugin with many skills.
**How to avoid:** Confirm `/book-crafter:sample` is unique. Current skills (verified via `glob skills/*/SKILL.md`): `orchestrator`, `outliner`, `researcher`, `writer`, `editor`, `enricher`, `formatter`, `sermon-adapter`, `voice-builder`. None are `sample`. Adding `skills/sample/SKILL.md` is safe. (Pitfall 15.)
**Warning signs:** `/plugin` list shows two skills with the same namespaced name.

### Pitfall 9: CHANGELOG / version drift

**What goes wrong:** plugin.json says 1.1.0, CHANGELOG top entry is still 1.0.0. Release.sh passes if the gate is naïve; users get confused.
**Why it happens:** Forgetting to add the CHANGELOG entry before running release.sh.
**How to avoid:** D-26 gate 2: `grep -q "^## \[${VERSION}\]" CHANGELOG.md` fail-hard. This catches the drift at build time. (Pitfall 18.)
**Warning signs:** Gate 2 fails with clear message.

### Pitfall 10: Sample skill runs the wrong plugin version

**What goes wrong:** On David's machine, `/book-crafter:sample` from the release install runs, but the dev copy of the skill file has different behaviour. Test results don't match production.
**Why it happens:** Dev and release both enabled; dev-precedence rule only kicks in when names match. With D-19 rename, both coexist as distinct plugins.
**How to avoid:** Use `/book-crafter-dev:sample` during dev iteration and `/book-crafter:sample` to test the release copy. Document in `DEV-NOTES.md`.
**Warning signs:** Test output differs between `/book-crafter:sample` and `/book-crafter-dev:sample`.

### Pitfall 11: Fixture brief doesn't exercise all CRAFT rules

**What goes wrong:** D-04 requires the fixture brief to exercise CRAFT-01..08 deterministically. A brief too generic produces output that passes captivation rubric by accident, masking regressions.
**Why it happens:** Planner wrote the brief as a generic topic, not as an exam.
**How to avoid:** D-04 is explicit — topic chosen so pipeline naturally produces scene openers with sensory detail, ≥1 vulnerability beat anchor, ≥2 reader-moment opportunities, tension-release beats, central-image candidate. The plan task must record the topic BEFORE writing the brief.
**Warning signs:** First fixture run's consistency-report.md shows CRAFT-XX pass with no citation (= not exercised, trivially passed).

### Pitfall 12: `/reload-plugins` confused with `/plugin reload`

**What goes wrong:** README says `/plugin reload`. User runs it, Claude Code says "unknown command". Support flood.
**Why it happens:** Similar-looking commands; easy to misremember.
**How to avoid:** Verified verbatim from docs: `/reload-plugins` is the correct form. README must match exactly.
**Warning signs:** README lint catches `/plugin reload` string.

## Code Examples

### Canonical plugin.json v1.1.0

```json
{
  "name": "book-crafter-dev",
  "version": "1.1.0",
  "description": "Write complete books from topic brief to professional .docx. Enforced craft rules, theological voice profile, custom voice support.",
  "author": {
    "name": "David",
    "email": "david@encounterchurch.co.za"
  },
  "homepage": "https://github.com/gygundo/book-crafter-plugin",
  "repository": "https://github.com/gygundo/book-crafter-plugin",
  "license": "MIT",
  "keywords": ["book", "writing", "publishing", "theology", "docx", "multi-agent"]
}
```

Source pattern: [Claude Code plugins-reference](https://code.claude.com/docs/en/plugins-reference#plugin-manifest-schema) (fetched 2026-04-15).

### Canonical marketplace.json (single-plugin, repo-as-marketplace)

```json
{
  "name": "book-crafter-plugin",
  "owner": {
    "name": "David",
    "email": "david@encounterchurch.co.za"
  },
  "plugins": [
    {
      "name": "book-crafter",
      "source": "./",
      "description": "Write complete books from topic brief to professional .docx with enforced craft rules.",
      "strict": true
    }
  ]
}
```

Source pattern: [Claude Code plugin-marketplaces](https://code.claude.com/docs/en/plugin-marketplaces#marketplace-schema) (fetched 2026-04-15).

### README install block (verbatim)

```markdown
> **Requires:** Claude Code + Node ≥18. Check with `node -v`.

## Install

Run these three commands in Claude Code:

    /plugin marketplace add gygundo/book-crafter-plugin
    /plugin install book-crafter@book-crafter-plugin
    /reload-plugins

That's it. You're ready to write a book.
```

### Sample skill SKILL.md (template)

```markdown
---
name: sample
description: "Run a full book pipeline end-to-end on the built-in tiny-book fixture and report pass/fail. Use when the user says 'run sample', 'try book crafter', 'demo', 'sample book', or wants a quick smoke-test of the plugin."
allowed-tools: Read, Write, Bash, Grep, Glob, Agent
---

# Book Crafter Sample

One-command end-to-end demo. Runs the full pipeline on the built-in tiny-book fixture and prints PASS/FAIL with captivation score.

## 1. Locate the fixture

The fixture ships with the plugin at `${CLAUDE_PLUGIN_ROOT}/fixtures/tiny-book/`. Required files:

- `brief.md` — the pre-written topic brief
- `expected-captivation-score.txt` — the integer threshold the final book must meet or exceed

## 2. Detect re-invocation

Check whether `${CLAUDE_PLUGIN_ROOT}/fixtures/tiny-book/run/` already exists.

- If it does NOT exist: this is a first run. Invoke the orchestrator in **normal mode** pointing at `brief.md` and voice profile `spiritual-default`.
- If it DOES exist: this is a re-invocation. Invoke the orchestrator in **Mode 6 (Fresh Run)** so the prior run is wiped before the new one starts. (Mode 6 is triggered by including the phrase "start fresh" in the orchestrator invocation.)

## 3. Invoke the orchestrator

Invoke the `book-crafter:orchestrator` skill programmatically with:

- Project path: `${CLAUDE_PLUGIN_ROOT}/fixtures/tiny-book/run/`
- Brief: `${CLAUDE_PLUGIN_ROOT}/fixtures/tiny-book/brief.md`
- Voice profile: `spiritual-default`
- Execution mode: Full Pipeline (no review gates)
- Size tier: booklet (3 chapters)

Wait for the pipeline to complete.

## 4. Compute captivation score

Read `${CLAUDE_PLUGIN_ROOT}/fixtures/tiny-book/run/reports/consistency-report.md`. Extract the "Captivation Score" total (N/14 format). If craft-check.js wasn't run as part of the editor pass, invoke it manually:

    node ${CLAUDE_PLUGIN_ROOT}/scripts/craft-check.js ${CLAUDE_PLUGIN_ROOT}/fixtures/tiny-book/run/edited/ch01-final.md

## 5. Compare to threshold and emit pass/fail

Read `${CLAUDE_PLUGIN_ROOT}/fixtures/tiny-book/expected-captivation-score.txt` (single integer M).

Final `.docx` path: `${CLAUDE_PLUGIN_ROOT}/fixtures/tiny-book/run/output/<name>.docx`

**PASS condition:** `.docx` exists AND captivation total N ≥ M.

Output one line to stdout:

- PASS: `SAMPLE PASS — .docx at fixtures/tiny-book/run/output/<name>.docx, captivation N/14 (threshold M)`
- FAIL: `SAMPLE FAIL — <specific reason> (see fixtures/tiny-book/run/reports/consistency-report.md)`

Exit code 0 on PASS, 1 on FAIL (for release.sh gating in later phases).
```

**Note on orchestrator invocation:** The orchestrator is itself a skill (`book-crafter:orchestrator`), not a function. Programmatic invocation from another skill is simply "invoke the orchestrator skill with these inputs as context". The orchestrator's Mode 6 trigger is the **phrase** "fresh" / "start fresh" / "--fresh" in the invocation text — not a CLI flag (verified at `skills/orchestrator/SKILL.md:778`). Sample skill passes "start fresh" in the invocation text on re-runs to enter Mode 6, and omits it on first runs.

### LICENSE template

Standard MIT text with `Copyright (c) 2026 David <david@encounterchurch.co.za>` — use SPDX canonical MIT boilerplate. Matches `plugin.json.license: "MIT"`.

### CHANGELOG.md skeleton (Keep-a-Changelog 1.1.0)

```markdown
# Changelog

All notable changes to Book Crafter will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-04-XX

### Added
- Seven procedural craft rules (CRAFT-01..08) enforced by writer and editor
- `references/bestseller-craft-rules.md` — voice-agnostic craft reference
- `references/bestseller-calibration.md` — before/after exemplars at score levels 3, 6, 9
- Extended captivation rubric (7 components, 0–14 scale)
- Orchestrator Mode 6 (Fresh Run) for clean re-runs
- Version stamps (`<!-- generated-by: book-crafter v1.1.0 -->`) on all generated artefacts
- Per-chapter bestseller diagnostic report in consistency-report.md
- 2-revision cap per chapter with divergent-improvement detection
- `/book-crafter:sample` skill — one-command end-to-end demo
- `fixtures/tiny-book/` — 3-chapter smoke-test fixture
- `.claude-plugin/marketplace.json` — single-plugin marketplace for one-click install
- Plugin manifest metadata: homepage, repository, license
- `scripts/release.sh` — whitelist-based release builder
- Voice profile subtractive audit (spiritual-default.md capped at 150 lines, kill list committed)

### Changed
- Voice profile rewritten with Reader Moments section and v2 craft additions
- Writer skill: scene-first openers with provenance comments
- Editor skill: Pass 1 craft-check, Pass 2 scene-first strictness
- Orchestrator: Fresh Run mode added alongside existing modes

## [1.0.0] - 2026-03-27

### Added
- Initial release
- Plugin foundation: orchestrator, skills, subagents
- Voice system with theological default profile
- Book outliner with two-mode generation
- Researcher with scripture + word studies
- Parallel chapter writer (wave batching)
- Editor with three-pass pipeline (voice, flow, cross-chapter)
- Formatter with front matter, back matter, TOC, page numbers
- Sermon adapter for sermon-to-book conversion
- Enricher (discussion questions, summaries, prayer points, foreword)
- Voice builder skill for custom voice profile generation
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Zip side-load as primary install | `/plugin marketplace add` + `/plugin install` flow | Claude Code plugin system launch | No side-load exists; zip is secondary artefact only |
| "Claude Desktop plugins" | "Claude Code plugins" | Plugin system is part of Claude Code, NOT claude.ai | All v1.1 artefacts must say "Claude Code" — claude.ai has no plugin installer |
| `plugin.json` with minimal fields | Full metadata (homepage, repository, license, author) | Plugin marketplace submission requirements 2026-Q1 | Phase 11 bump to v1.1.0 adds required metadata |
| Version in marketplace.json entry | Version in plugin.json only (plugin.json silently wins) | Docs explicit warning, 2026-04 | D-23 locks plugin.json as single source of truth |
| `cp -r .` / `zip -r .` for releases | Whitelist-based staging directory build | Always (industry norm) | D-27 whitelist + D-26 gates prevent secrets/PII leaks |
| `/plugin reload` | `/reload-plugins` | Quickstart docs 2026-04 | README must use exact form |

**Deprecated/outdated:**
- Hypothetical plugin manifest fields like `entry_point`, `permissions` — never existed or removed. Current schema is the one documented above (verified 2026-04-15).
- Using `{type: "git", url: "..."}` for `repository` — that's npm convention. Claude Code uses bare string URL.
- Any assumption that plugins install via file-drop to `~/.claude/plugins/` manually — the install cache at `~/.claude/plugins/cache/` is managed by Claude Code; users never touch it.

## Open Questions

1. **Exact integer threshold for `expected-captivation-score.txt`**
   - What we know: D-07 recommends `>= 8` as starting point on 0–14 scale. Phase 10 extended the rubric to 14 points across 7 components.
   - What's unclear: Empirical floor for the tiny-book fixture. Requires first run to calibrate.
   - Recommendation: Ship `8` in Phase 11. Re-calibrate at end of Phase 11 after the first sample run produces a real score. If the real score is 11, bump the threshold to 9 or 10 to leave regression room. If the real score is 6, the fixture or the pipeline is broken and must be debugged before Phase 12.

2. **Sample skill: does it count `.docx` existence in the fixtures directory or elsewhere?**
   - What we know: D-10 locks output to `fixtures/tiny-book/run/`.
   - What's unclear: The orchestrator's default project directory is `~/Documents/Books/<title>/`. Sample skill must override this.
   - Recommendation: Sample skill passes an explicit project path to the orchestrator invocation: `${CLAUDE_PLUGIN_ROOT}/fixtures/tiny-book/run/`. Verify the orchestrator accepts an override path (confirmed in SKILL.md §2 — user can specify project name/path).

3. **First run vs re-invocation detection in sample skill (D-11)**
   - What we know: First run = normal mode; re-invocation = Mode 6 fresh.
   - What's unclear: How the sample skill detects "re-invocation" reliably.
   - Recommendation: Check for existence of `${CLAUDE_PLUGIN_ROOT}/fixtures/tiny-book/run/` directory. If present → Mode 6; if absent → normal. This is filesystem-as-state, matching the rest of the plugin's patterns.

4. **CLI availability for `claude plugin validate` in release.sh**
   - What we know: Command exists (verified), D-26 step 5 says "if available; otherwise flag but don't block".
   - What's unclear: Whether David's `claude` CLI is on PATH when release.sh runs.
   - Recommendation: Use `command -v claude` guard as shown in the skeleton. Document in DEV-NOTES that the gate warns-and-skips if missing.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Node built-in `node:test` (Phase 10 inherited — used by `scripts/test-craft-check.js` and `scripts/test-rubric-regression.js`); bash for `release.sh` gate tests |
| Config file | None — `node --test` discovers `scripts/test-*.js` |
| Quick run command | `node --test scripts/test-craft-check.js scripts/test-rubric-regression.js` |
| Full suite command | `node --test scripts/test-*.js && bash scripts/release.sh` (full release gate as end-to-end test) |
| Phase gate | `claude plugin validate .` must pass + `scripts/release.sh` must produce a zip under 5MB with zero personal-path matches |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PKG-01 | marketplace.json with correct schema | schema validation | `claude plugin validate .` | ❌ Wave 0 (needs marketplace.json creation) |
| PKG-02 | plugin.json bumped to 1.1.0 with metadata | schema validation + grep | `claude plugin validate . && grep '"version": "1.1.0"' .claude-plugin/plugin.json` | ❌ Wave 0 |
| PKG-03 | README has 3-line install block, Node ≥18 callout, no "Claude Desktop" | grep asserts | `grep -q '/plugin marketplace add gygundo/book-crafter-plugin' README.md && grep -q '/plugin install book-crafter@book-crafter-plugin' README.md && grep -q '/reload-plugins' README.md && grep -q 'Node ≥18\|Node >= 18' README.md && ! grep -q 'Claude Desktop' README.md` | ❌ Wave 0 |
| PKG-04 | LICENSE is MIT | grep assert | `grep -q 'MIT License' LICENSE && grep -q 'Copyright' LICENSE` | ❌ Wave 0 |
| PKG-05 | CHANGELOG.md Keep-a-Changelog format with v1.0.0 + v1.1.0 | grep asserts | `grep -q '^## \[1.1.0\]' CHANGELOG.md && grep -q '^## \[1.0.0\]' CHANGELOG.md` | ❌ Wave 0 |
| PKG-06 | tiny-book fixture exists with brief.md + expected-captivation-score.txt | file existence + integer parse | `test -f fixtures/tiny-book/brief.md && test -f fixtures/tiny-book/expected-captivation-score.txt && grep -qE '^[0-9]+$' fixtures/tiny-book/expected-captivation-score.txt` | ❌ Wave 0 |
| PKG-06 | tiny-book smoke test completes ≤5 min | manual timed run | `time /book-crafter:sample` (manual, recorded in commit message) | Manual-only — pipeline timing requires full orchestrator run |
| PKG-07 | release.sh produces valid zip, gates fail hard | bash integration test | `bash scripts/release.sh && test -f dist/book-crafter-v1.1.0.zip && test $(stat -f%z dist/book-crafter-v1.1.0.zip 2>/dev/null || stat -c%s dist/book-crafter-v1.1.0.zip) -lt 5242880` | ❌ Wave 0 |
| PKG-07 | release.sh rejects zip containing /Users/David | bash negative test | `bash scripts/release.sh && ! (unzip -p dist/book-crafter-v1.1.0.zip \| grep -q '/Users/David')` | ❌ Wave 0 |
| PKG-07 | release.sh rejects version mismatch between plugin.json and CHANGELOG | bash negative test | Inject mismatched version, expect non-zero exit. Manual or scripted via temp git stash. | ❌ Wave 0 |
| PKG-08 | `claude plugin validate .` passes cleanly | CLI | `claude plugin validate .` | ❌ Wave 0 (requires PKG-01..07 complete) |
| PKG-09 | `/book-crafter:sample` skill exists and invokes orchestrator | skill file existence + smoke run | `test -f skills/sample/SKILL.md && /book-crafter:sample` (manual verify PASS line) | ❌ Wave 0 |
| PKG-09 | Sample prints machine-greppable pass line on success | grep on output | `/book-crafter:sample 2>&1 \| grep -qE '^SAMPLE (PASS\|FAIL) —'` | Manual-only — interactive skill invocation |
| PKG-10 | Schema re-fetch completed at phase kickoff | doc fetch evidence | THIS RESEARCH DOCUMENT (complete) | ✅ (this file) |

### Sampling Rate

- **Per task commit:** `claude plugin validate .` (for manifest-touching commits) OR `node --test scripts/test-craft-check.js scripts/test-rubric-regression.js` (for other commits)
- **Per wave merge:** `bash scripts/release.sh` (full release gate — only runnable once gates 1..9 are all satisfied, i.e. after PKG-01..PKG-07 complete)
- **Phase gate:** `bash scripts/release.sh` green AND `/book-crafter:sample` PASS AND `claude plugin validate .` clean, before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `.claude-plugin/marketplace.json` — covers PKG-01
- [ ] `.claude-plugin/plugin.json` v1.1.0 bump — covers PKG-02
- [ ] `README.md` — covers PKG-03
- [ ] `LICENSE` — covers PKG-04
- [ ] `CHANGELOG.md` — covers PKG-05
- [ ] `fixtures/tiny-book/brief.md` — covers PKG-06
- [ ] `fixtures/tiny-book/expected-captivation-score.txt` — covers PKG-06
- [ ] `scripts/release.sh` — covers PKG-07
- [ ] `skills/sample/SKILL.md` — covers PKG-09
- [ ] `.gitignore` entries for `dist/`, `fixtures/tiny-book/run/`, `DEV-NOTES.md` — supporting hygiene
- [ ] Framework install: none required — `node` and `bash` already available
- [ ] No new test harness — Phase 10's `node:test` covers script-level tests; release.sh is the bash-level integration test

**Observation:** Phase 11 is primarily file-authoring, not logic. The "test" for most requirements is schema/grep assertion on the created file, runnable directly in the verification phase. The only integration tests are (a) `claude plugin validate .`, (b) `bash scripts/release.sh`, and (c) manual `/book-crafter:sample` invocation on the fixture. No new test framework needed.

## Sources

### Primary (HIGH confidence)

- **[Claude Code: Create plugins](https://code.claude.com/docs/en/plugins)** — re-fetched 2026-04-15 per PKG-10. Plugin manifest essentials, `--plugin-dir` dev loading, `/reload-plugins`, skill namespacing, debugging. Covers dev-vs-marketplace precedence (same-name → dev wins).
- **[Claude Code: Create and distribute a plugin marketplace](https://code.claude.com/docs/en/plugin-marketplaces)** — re-fetched 2026-04-15 per PKG-10. Complete marketplace.json schema, owner fields, plugins[] required/optional fields, all source types, strict mode, GitHub shorthand resolution, version-resolution warning (plugin.json silently wins), CLI commands, troubleshooting. **This is the authoritative source for the schema.**
- **[Claude Code: Plugins reference](https://code.claude.com/docs/en/plugins-reference)** — fetched 2026-04-15. Complete plugin.json schema with required/optional field types, author object shape, repository as **string URL**, license as SPDX id, component path fields, `${CLAUDE_PLUGIN_ROOT}` / `${CLAUDE_PLUGIN_DATA}`, plugin caching/file resolution, CLI commands (`claude plugin install/uninstall/enable/disable/update/validate`), manifest validation errors/warnings.
- **`.planning/research/SUMMARY.md`** (local, 2026-04-15) — three-phase rationale, Phase 11 build order, stack confirmation, zero new runtime deps.
- **`.planning/research/PITFALLS.md`** (local, 2026-04-15) — Pitfalls 12 (zip hygiene), 13 (schema drift), 14 (dev/release collision), 15 (namespace collision), 16 (non-technical README), 18 (LICENSE/CHANGELOG/version drift), 19 (personal paths), 20 (cross-platform), 22 (README overclaiming).
- **`.claude-plugin/plugin.json`** (live repo) — current v1.0.0 manifest, confirms minimal starting state.
- **`skills/orchestrator/SKILL.md`** (live repo) — Mode 6 Fresh Run contract (line 778+), phrase-based trigger, Mode 3 Resume fallback, preserve list (`sources/`, `sources-adapted/`, `brief.md`, `voice-profile.md`), revision log persistence.
- **`scripts/craft-check.js`** (live repo) — CRAFT-01/02/05/07/15 deterministic checker; sample skill and craft-check-integrated editor both consume it.

### Secondary (MEDIUM confidence)

- **Keep a Changelog 1.1.0 spec** — format convention for CHANGELOG.md `## [VERSION]` headers; enables bash/grep gate in release.sh D-26 step 2.
- **SPDX license list** — `MIT` identifier is canonical and matches plugin.json.license format.

### Tertiary (LOW confidence)

- None. All Phase 11 questions resolved from primary sources.

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** — all schemas verified live from official docs 2026-04-15
- Architecture: **HIGH** — all patterns extracted directly from official docs examples; no speculation
- Pitfalls: **HIGH** — drawn from PITFALLS.md local research + live docs' explicit warnings
- Validation: **HIGH** — validate command verified present, semantics documented
- Sample skill invocation: **MEDIUM-HIGH** — orchestrator Mode 6 contract verified (phrase-triggered, not flag), but programmatic skill-to-skill invocation pattern is inherited from Phase 8 voice-builder precedent, not formally specified anywhere

**Research date:** 2026-04-15
**Valid until:** 2026-05-15 (plugin spec is actively evolving per SUMMARY.md Pitfall 13 — re-verify if Phase 11 extends beyond 30 days)

---

*Research completed: 2026-04-15*
*Ready for planning: yes*
*Key schemas re-fetched live per PKG-10 gate*
