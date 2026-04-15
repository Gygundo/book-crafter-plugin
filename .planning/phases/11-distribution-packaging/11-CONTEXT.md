# Phase 11: Distribution Packaging - Context

**Gathered:** 2026-04-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Package the Book Crafter plugin so a non-technical recipient can install it into Claude Code using exactly three slash commands, with all supporting release infrastructure in place: `.claude-plugin/marketplace.json`, `plugin.json` v1.1.0 metadata, recipient-facing `README.md`, `LICENSE`, `CHANGELOG.md`, `fixtures/tiny-book/` smoke-test fixture, `scripts/release.sh` whitelist-based zip builder, `/book-crafter:sample` demo skill, and a clean `claude plugin validate .` dry-run.

Phase 11 does NOT tag `v1.1.0`, does NOT run the Eternally Secure re-run, and does NOT make bestseller-quality claims in the README — those belong to Phase 12 (GATE-01..09).

</domain>

<decisions>
## Implementation Decisions

### GitHub Repo Identity
- **D-01:** GitHub owner/repo = `gygundo/book-crafter-plugin` (David's personal account). All marketplace URLs, README install commands, and `plugin.json.repository` field use this exact path.
- **D-02:** Repo does NOT exist yet — creating it is an explicit Phase 11 task. Must be created BEFORE writing README.md (so install commands are real) and BEFORE `plugin.json` metadata bump (so `repository` field points somewhere valid).
- **D-03:** Repo visibility: public at creation. Required for `/plugin marketplace add gygundo/book-crafter-plugin` to resolve without auth.

### Fixture Content (PKG-06)
- **D-04:** Claude drafts the `fixtures/tiny-book/brief.md` topic at plan time, with the explicit design goal of exercising every CRAFT-01..08 rule deterministically. Topic must be chosen so the pipeline naturally produces scene openers with sensory detail, at least one vulnerability beat anchor, at least two reader-moment opportunities, tension-release beats, and a central-image candidate. Topic recorded in the plan before writing the brief.
- **D-05:** Fixture uses the default spiritual (`spiritual-default.md`) voice profile. Secular voice swap validation is deferred out of Phase 11 scope.
- **D-06:** Fixture is a 3-chapter booklet per PKG-06. Target total length ≤ 2,500 words so the full pipeline (outline → research → write → edit → format) completes in ≤ 5 minutes per SC-4 of the phase goal.
- **D-07:** `expected-captivation-score.txt` contains a single minimum threshold integer on the 0–14 scale from the 7-component captivation rubric (exact threshold value = Claude's discretion at plan time; starting recommendation is `>= 8`, subject to calibration against a first fixture run).
- **D-08:** Smoke-test pass condition = final `.docx` exists AND captivation rubric total `>= threshold`. Nothing else. (Per-component minima and full CRAFT matrix checks belong to Phase 12, not the fixture gate.)

### Sample Skill UX (PKG-09)
- **D-09:** `/book-crafter:sample` runs non-interactive, full pipeline end-to-end. No outline approval gate, no review gate — the fixture is pre-approved by existing in the repo. The orchestrator is invoked programmatically against the fixture brief.
- **D-10:** Sample writes output to `fixtures/tiny-book/run/`. That directory is gitignored AND explicitly excluded from `scripts/release.sh`'s whitelist so sample run artefacts never ship in the release zip.
- **D-11:** Sample does NOT automatically enable `--fresh` mode. It runs `--fresh` ONLY on re-invocation when `fixtures/tiny-book/run/` already exists. First run is a normal run; subsequent runs are fresh. Prevents surprise deletion on a user's first try.
- **D-12:** Sample prints exactly one pass/fail summary line at end:
  - PASS: `SAMPLE PASS — .docx at fixtures/tiny-book/run/final/<name>.docx, captivation N/14 (threshold M)`
  - FAIL: `SAMPLE FAIL — <specific reason> (see fixtures/tiny-book/run/consistency-report.md)`
- **D-13:** Sample exit code reflects pass/fail so `scripts/release.sh` can call `/book-crafter:sample` as a pre-release gate in a later phase if needed (not required for Phase 11 success criteria).

### README Tone + Claim Discipline (PKG-03)
- **D-14:** README voice = plain, friendly, zero-jargon. Assumes the recipient has used Claude Code at least once. No "multi-agent", no "pipeline", no "orchestrator" in the body. Install in 3 commands, one short paragraph on what the plugin does, one short paragraph on how to run it, one line on where the output lands.
- **D-15:** Node ≥18 prerequisite is a visible callout box at the very top of the README, BEFORE the install commands. Format: `> **Requires:** Claude Code + Node ≥18. Check with \`node -v\`.`
- **D-16:** Pre-Phase-12 capability line = **"Writes structured non-fiction books with enforced craft rules."** This is the ONLY capability sentence allowed in the README at Phase 11 close. No "bestseller", no "captivating", no "in your voice". Phase 12 GATE-07 replaces this line with evidence-anchored language after the seven-gap comparison exists.
- **D-17:** README includes a short example output block — a 3–4 line quoted prose paragraph — directly under the capability line. Paragraph source: the tiny-book fixture output after first successful sample run. If Phase 11 closes before the fixture is run, a `<!-- TODO(phase-12): replace with fixture paragraph -->` placeholder ships, and Phase 12 GATE-07 swaps it. Never ship a fabricated paragraph.
- **D-18:** README includes a "What this makes" section = exactly one sentence describing the .docx output (front matter, chapter-per-page, back matter). No pipeline internals exposed.

### Dev / Release Plugin Isolation (Pitfall 14 prevention)
- **D-19:** The dev-loaded plugin on David's Mac is renamed: `plugin.json.name = "book-crafter-dev"`. This prevents the marketplace-installed version (which uses `name = "book-crafter"`) from colliding with the dev copy when both live on the same machine. Phase 12 fresh-install smoke-test depends on this isolation.
- **D-20:** `scripts/release.sh` rewrites `plugin.json.name` from `book-crafter-dev` back to `book-crafter` when assembling the release build in its temp staging directory. The repo on disk stays `book-crafter-dev`. The zipped release ships `book-crafter`. Release script must verify both values before and after the rewrite.
- **D-21:** Dev name rewrite happens AFTER the whitelist copy into the staging dir, never in-place on the real `plugin.json`. Staging dir is wiped after each build.
- **D-22:** Skill identifiers in documentation (README, CHANGELOG, examples) always use `book-crafter:*` (release name), never `book-crafter-dev:*`. Dev-only operational notes live in `DEV-NOTES.md` (gitignored or uncommitted, David's discretion).

### Release Script Scope (PKG-07)
- **D-23:** `scripts/release.sh` does NOT git-tag. Tagging `v1.1.0` is owned exclusively by Phase 12 GATE-09, gated on David's explicit ship decision. Release.sh builds and validates the zip and stops. No `--tag` flag, no tag-on-success.
- **D-24:** Zip output path: `dist/book-crafter-v1.1.0.zip`. The `dist/` directory is gitignored. Filename includes the version parsed from `plugin.json` so multiple versions can coexist during development.
- **D-25:** Version / CHANGELOG gate mechanism: pure bash + grep, no `jq`, no node script.
  - Extract version from `plugin.json` via `grep '"version"' .claude-plugin/plugin.json | sed ...` or equivalent.
  - Extract matching header from `CHANGELOG.md` via `grep -n "^## \[${VERSION}\]" CHANGELOG.md`.
  - Fail hard with a clear error message if either is missing or if they disagree.
- **D-26:** Release.sh gate order (all fail-hard, any failure aborts build):
  1. `plugin.json` version present and parseable
  2. `CHANGELOG.md` has a `## [VERSION]` section
  3. Whitelist copy into staging dir (explicit file list, never `cp -r .`)
  4. Dev→release name rewrite in staging (D-20)
  5. `claude plugin validate <staging>` passes (if command is available; otherwise flag but don't block)
  6. Zip the staging dir into `dist/book-crafter-v${VERSION}.zip`
  7. Size check: fail if zip > 5MB
  8. Personal-path grep: `unzip -p ... | grep -l "/Users/David"` — fail if any match
  9. Print manifest: `unzip -l dist/book-crafter-v${VERSION}.zip`
- **D-27:** Release.sh whitelist (explicit file/dir list, authoritative — downstream planner SHOULD NOT add items without user approval):
  - `.claude-plugin/` (plugin.json + marketplace.json)
  - `skills/` (all shipped skills)
  - `agents/` (chapter-writer, chapter-editor)
  - `references/` (voice profiles, craft rules, captivation rubric, calibration, spec docs)
  - `scripts/craft-check.js` + `scripts/test-craft-check.js` + `scripts/test-rubric-regression.js` (editor depends on craft-check at runtime)
  - `fixtures/tiny-book/brief.md` + `fixtures/tiny-book/expected-captivation-score.txt` (sample skill needs them)
  - `README.md`, `LICENSE`, `CHANGELOG.md`
  - Explicitly EXCLUDED: `.planning/`, `.git/`, `.DS_Store`, `books/`, `evidence/`, `fixtures/phase10/`, `fixtures/tiny-book/run/`, `dist/`, `DEV-NOTES.md`

### Claude's Discretion
- Exact topic/title of the tiny-book fixture brief (must satisfy D-04)
- Exact integer captivation threshold for `expected-captivation-score.txt` (starting point D-07, calibrate on first run)
- CHANGELOG.md v1.0.0 entry content (best-effort synthesis from phase completions 1–9)
- CHANGELOG.md v1.1.0 entry content (synthesise from phase 10 + phase 11 work)
- Exact wording of README install-command block, headers, and section order — subject to D-14..D-18 constraints
- Whether to split release.sh into sub-functions or keep flat — flat is fine for ~9 gates
- `.gitignore` additions for `dist/`, `fixtures/tiny-book/run/`, `DEV-NOTES.md` (add if not already present)
- Whether to add a `scripts/release.sh --dry-run` option for local testing (nice-to-have, not required)

### Folded Todos
None — no pending todos were folded into this phase.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Plugin + Marketplace Schema (re-verify at phase start per PKG-10)
- `https://code.claude.com/docs/en/plugins` — plugin.json schema, manifest fields, dev plugin loading. MUST be re-fetched at Phase 11 kickoff; do NOT trust the Phase 1 manifest. (External — WebFetch required.)
- `https://code.claude.com/docs/en/plugin-marketplaces` — marketplace.json schema, `source` field, `strict` mode, single-plugin pattern. MUST be re-fetched at Phase 11 kickoff. (External — WebFetch required.)

### Phase 11 Requirements + Anti-Patterns (internal)
- `.planning/REQUIREMENTS.md` §PKG-01..PKG-10 — acceptance criteria for every deliverable in this phase
- `.planning/ROADMAP.md` §"Phase 11: Distribution Packaging" — success criteria, build order, anti-pattern reminder
- `.planning/research/SUMMARY.md` §"Must have — Distribution (Phase 11)" and §"Implications for Roadmap" — architecture rationale
- `.planning/research/PITFALLS.md` Pitfalls 12, 13, 14, 15, 22 — zip hygiene, manifest schema drift, dev/release collision, namespace collisions, README overclaiming

### Existing plugin artefacts (Phase 11 modifies or references)
- `.claude-plugin/plugin.json` — CURRENT v1.0.0 manifest; Phase 11 bumps to v1.1.0, adds metadata, renames to `book-crafter-dev` per D-19
- `skills/orchestrator/SKILL.md` — sample skill delegates to the orchestrator programmatically
- `scripts/craft-check.js` — must ship in release zip (editor depends on it at runtime)
- `fixtures/phase10/` — existing test fixtures (NOT shipped in release; explicitly excluded per D-27)

### Cross-phase dependencies
- Phase 10 `10-CONTEXT.md` — `--fresh` mode contract (D-09..D-11 of phase 10), version stamp format (CRAFT-15), craft-check.js invocation pattern — sample skill uses all three
- Phase 12 `12-CONTEXT.md` (to be created) — fresh-install smoke test contract, GATE-06, GATE-07 README finalisation, GATE-09 git tag ownership — Phase 11 must leave room for all three

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `scripts/craft-check.js` — already exists from Phase 10. Sample skill's pass/fail check reuses it by reading the consistency-report.md produced by the editor pass.
- `skills/orchestrator/SKILL.md` — Phase 10 added `--fresh` mode; sample skill invokes orchestrator with fixture brief path as input.
- `fixtures/phase10/baseline-scores.json` + `known-good/` + `known-bad/` — pattern for deterministic fixtures; tiny-book fixture follows the same shape (brief + expected output file).
- `skills/*/SKILL.md` — existing skill file conventions; `/book-crafter:sample` follows the same frontmatter + sections pattern.

### Established Patterns
- Plugin root currently has: `agents/`, `skills/`, `references/`, `scripts/`, `fixtures/`, `CLAUDE.md`, `.claude-plugin/`. Phase 11 adds: `README.md`, `LICENSE`, `CHANGELOG.md`, `.claude-plugin/marketplace.json`, `fixtures/tiny-book/`, `scripts/release.sh`, `skills/sample/` (or similar for `/book-crafter:sample`), `dist/` (gitignored).
- No npm dependencies in the plugin itself — docx-js is invoked via `node -e` per formatter skill. Phase 11 adds zero new runtime deps.
- Existing `.claude-plugin/plugin.json` uses 2-space JSON indentation and has `author`, `description`, `keywords`, `name`, `version` only. Phase 11 bump adds `homepage`, `license`, `repository` per PKG-02.

### Integration Points
- Marketplace URL resolves to `github.com/gygundo/book-crafter-plugin` once D-02 repo creation is done.
- `/book-crafter:sample` becomes the fifth user-invocable skill (orchestrator, voice-builder, plus existing book-crafter aliases). Must not collide with other skill names — check at plan time.
- Release.sh runs OUTSIDE Claude Code (bash from David's terminal). It is the only piece of Phase 11 infrastructure that the plugin itself never executes.

</code_context>

<specifics>
## Specific Ideas

- Repo name exactly: `gygundo/book-crafter-plugin` — user-specified, do not alter casing or add suffixes.
- Install commands in README must be verbatim, copy-paste-ready, and in this order:
  1. `/plugin marketplace add gygundo/book-crafter-plugin`
  2. `/plugin install book-crafter@book-crafter-plugin`
  3. `/reload-plugins`
- Pre-Phase-12 capability sentence: **"Writes structured non-fiction books with enforced craft rules."** — verbatim, no variations.
- Sample success line format: `SAMPLE PASS — .docx at <path>, captivation N/14 (threshold M)` — machine-greppable.
- Dev plugin manifest name: `book-crafter-dev`. Release zip plugin manifest name: `book-crafter`. Script handles the flip.

</specifics>

<deferred>
## Deferred Ideas

### Out of Phase 11 scope (belong in Phase 12 or v1.2)
- Seven-gap comparison file (`evidence/seven-gap-comparison.md`) — Phase 12 GATE-03
- Fresh-install smoke test (uninstall dev, clear cache, install from marketplace, run fixture) — Phase 12 GATE-06
- README capability language that references evidence — Phase 12 GATE-07 rewrites the capability line
- `git tag v1.1.0` application — Phase 12 GATE-09, HARD GATE on David's ship decision (GATE-08)
- External fresh-Claude blind review — Phase 12 GATE-04
- Sermon-adapter regression byte-diff — Phase 12 GATE-05
- Secular voice fixture (non-theological smoke test) — deferred to v1.2 if needed
- Per-component minima in `expected-captivation-score.txt` (only total threshold in v1.1) — v1.2
- Full CRAFT-01..08 matrix gate in sample skill — Phase 12 diagnostic tooling
- `scripts/release.sh --dry-run` mode — nice-to-have, not required for PKG-07
- Official Anthropic marketplace submission — SUMMARY.md deferred item
- Windows-host smoke test — SUMMARY.md deferred item
- Pre-flight doctor skill (PKG-DIFF-01) — SUMMARY.md deferred item

### Reviewed Todos (not folded)
None — no relevant pending todos surfaced.

</deferred>

---

*Phase: 11-distribution-packaging*
*Context gathered: 2026-04-15*
