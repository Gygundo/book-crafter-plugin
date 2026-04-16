# Phase 12: Re-run + Release Gate - Context

**Gathered:** 2026-04-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Prove the v1.1 rules actually improve output by re-running Eternally Secure Ch1 in `--fresh` mode, producing a seven-gap before/after comparison with quoted paragraphs, verifying the fresh-install path, and recording David's explicit ship decision — all blocking on the v1.1.0 git tag.

Phase 12 does NOT add new pipeline capabilities. It is a pure evidence-gathering and release-gating phase. The pipeline is feature-complete after Phase 13.

</domain>

<decisions>
## Implementation Decisions

### Baseline Source (GATE-01)
- **D-01:** The original Eternally Secure project lives at `/Users/David/Documents/Books/Eternally Secure/`. It has a full pipeline output: edited chapters (ch01-final.md through ch04+), front-matter, enrichments, reports, sources, sources-adapted, and a final .docx.
- **D-02:** Freeze **Ch1 only** — copy `edited/ch01-final.md` from the existing project to `evidence/eternally-secure-ch1-before.md` in the repo. This matches GATE-01/02/03 naming convention and keeps the evidence compact.
- **D-03:** The baseline is immutable once committed. No modifications, no re-formatting — raw copy of the Phase 7 pipeline output.

### Re-run Procedure (GATE-02)
- **D-04:** Re-run the Eternally Secure project **in place** at `/Users/David/Documents/Books/Eternally Secure/` using `--fresh` mode. The pipeline uses the existing `brief.md`, `sources/`, and `voice-profile.md` at that location.
- **D-05:** After the re-run completes, copy the new `edited/ch01-final.md` to `evidence/eternally-secure-ch1-after.md` in the repo. Only evidence files land in the repo — the full book project stays external.
- **D-06:** The re-run uses ALL current pipeline rules — Phase 10 CRAFT-01..17, Phase 13 novelty enforcement, and all prior phase capabilities. This is the shipping pipeline.

### Seven-Gap Comparison Scope (GATE-03)
- **D-07:** **Claude's Discretion** — the comparison stays focused on the 7 original CRAFT gaps (scene opener, Greek density, vulnerability, central image, tension-release, reader anchor, pulpit seams) as the primary structure. If the re-run shows meaningful before/after difference in novelty/dedup, an 8th gap row is added. The document is named `evidence/seven-gap-comparison.md` regardless of whether it contains 7 or 8 rows.
- **D-08:** Each gap row must include before/after **quoted paragraphs** — not summaries, not scores. Direct textual evidence that the improvement is visible in the prose.

### External Blind Review (GATE-04)
- **D-09:** Open a **fresh Claude Code session** (no project context loaded, no CLAUDE.md, clean conversation). Paste both Ch1 versions as "Version A" and "Version B" with randomised assignment (before/after mapping randomised, logged in the evidence file). Ask for a quality ranking with reasoning.
- **D-10:** **Claude's Discretion** on prompt design — general quality ranking vs targeted dimensions, based on what produces the most useful evidence. The reviewer must not be told which version is before/after.
- **D-11:** Log the full exchange (prompt + response) to `evidence/external-review.md`. Include which version mapped to before/after at the bottom (reveal after the ranking).

### Sermon-Adapter Regression (GATE-05)
- **D-12:** The sermon-adapter regression check compares `sources-adapted/` output from the re-run against the pre-change baseline. The pre-change baseline is the `sources-adapted/` directory at `/Users/David/Documents/Books/Eternally Secure/sources-adapted/` BEFORE the `--fresh` re-run.
- **D-13:** Since `--fresh` mode preserves `sources-adapted/` (per Phase 10 CRAFT-14), the regression check verifies that the re-run did NOT modify those files. A byte-diff (`diff -r` or `shasum`) confirms zero changes.

### Fresh-Install Smoke-Test (GATE-06)
- **D-14:** GitHub repo `gygundo/book-crafter-plugin` does **not exist yet**. Repo creation + push is a Phase 12 task.
- **D-15:** Repo creation and push happen **late** — after all evidence is gathered (GATE-01 through GATE-05 complete, GATE-07 README finalised). One push with everything included, then one smoke test.
- **D-16:** Smoke test runs on **this Mac** (David's dev machine). Procedure: remove the `book-crafter-dev` dev plugin, clear Claude Code plugin cache, install from marketplace using README's 3-command block, run `/book-crafter:sample`, verify .docx output exists and sample reports PASS. Then reinstall the dev plugin after.
- **D-17:** The smoke test evidence is recorded but the format is Claude's discretion — a brief pass/fail log in a section of the ship-decision file or a separate evidence file.

### README Capability Language (GATE-07)
- **D-18:** Phase 11 shipped the placeholder capability line: "Writes structured non-fiction books with enforced craft rules." GATE-07 replaces this with evidence-anchored language based on what the seven-gap comparison actually shows.
- **D-19:** No "bestseller quality" claim unless the comparison evidence substantiates it (Pitfall 22). The capability line must be defensible against the evidence rows.

### Ship Decision (GATE-08)
- **D-20:** After all other gates pass (GATE-01 through GATE-07), the full evidence set is presented to David. David records an explicit "ship" or "don't ship" call in `evidence/ship-decision.md`.
- **D-21:** This is a **hard gate** — `git tag v1.1.0` (GATE-09) is blocked on a "ship" decision. There is no auto-ship, no implicit approval from all-green gates.

### Git Tag (GATE-09)
- **D-22:** `git tag v1.1.0` is applied and pushed ONLY after GATE-08 records "ship". Blocked on GATE-03 (comparison exists) AND GATE-08 (ship decision).
- **D-23:** The tag is applied to the commit that includes all evidence files and the finalised README.

### Claude's Discretion
- Exact prompt text for the external blind review (D-10)
- Whether the seven-gap comparison includes a novelty gap row (D-07)
- Smoke-test evidence format (D-17)
- README capability language wording (D-19) — subject to evidence constraint
- Whether to capture sources-adapted/ baseline checksums before the re-run or rely on --fresh preservation guarantee (D-13)
- Build order optimisation within the GATE dependency chain

### Folded Todos
None — no pending todos were folded into this phase.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 12 Requirements & Roadmap
- `.planning/REQUIREMENTS.md` §GATE-01..GATE-09 — full acceptance criteria for every gate
- `.planning/ROADMAP.md` §"Phase 12: Re-run + Release Gate" — goal, success criteria, build order, anti-pattern reminder
- `.planning/research/SUMMARY.md` — executive summary including Phase 12 build order
- `.planning/research/PITFALLS.md` — Pitfall 22 (README overclaiming), Phase 7 post-mortem (don't skip re-run)

### Eternally Secure Project (external — baseline source)
- `/Users/David/Documents/Books/Eternally Secure/edited/ch01-final.md` — the Phase 7 Ch1 output to freeze as baseline
- `/Users/David/Documents/Books/Eternally Secure/brief.md` — the brief used for re-run
- `/Users/David/Documents/Books/Eternally Secure/sources/` — sermon source material
- `/Users/David/Documents/Books/Eternally Secure/sources-adapted/` — adapted sources (GATE-05 regression target, 3 files)
- `/Users/David/Documents/Books/Eternally Secure/voice-profile.md` — voice profile for re-run

### Pipeline Rules Being Tested (the v1.1 delta)
- `references/bestseller-craft-rules.md` — CRAFT-01..08 procedural rules (Phase 10)
- `references/captivation-rubric.md` — 8-component rubric, schema_version 2, 0-16 scale + binary novelty_dedup (Phase 13)
- `scripts/craft-check.js` — deterministic checker including `--novelty` mode (Phase 10 + Phase 13)
- `skills/writer/SKILL.md` — scene-first, Greek density, vulnerability, anti-loop clause
- `skills/editor/SKILL.md` — Pass 1/2/3 with craft density, novelty audit, dedup gates

### Distribution Infrastructure (Phase 11, used by GATE-06/07)
- `README.md` — current capability line to be updated by GATE-07
- `scripts/release.sh` — whitelist zip builder (evidence/ must NOT be in zip)
- `.claude-plugin/plugin.json` — v1.1.0 metadata, `book-crafter-dev` name
- `.claude-plugin/marketplace.json` — marketplace manifest
- `fixtures/tiny-book/` — sample skill fixture (used in GATE-06 smoke test)

### Prior Phase Context (honour these)
- `.planning/phases/10-writing-quality-v2/10-CONTEXT.md` — `--fresh` mode contract (D-04 here uses it), CRAFT-01..17 definitions
- `.planning/phases/11-distribution-packaging/11-CONTEXT.md` — D-19 dev/release name split, D-16 README capability placeholder, D-27 release.sh whitelist
- `.planning/phases/13-repetition-and-novelty-enforcement/13-CONTEXT.md` — novelty_dedup binary gate, 0-16 rubric scale, schema_version 2, sample output line format

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`--fresh` mode on orchestrator**: Already implemented in Phase 10. Re-run (GATE-02) invokes it directly — no new pipeline code needed.
- **`scripts/craft-check.js`**: Deterministic checker with `--novelty` mode. The re-run's consistency-report.md will contain the full CRAFT matrix and novelty verdict automatically.
- **`scripts/release.sh`**: Whitelist zip builder from Phase 11. GATE-06 smoke test validates the zip/install path.
- **`fixtures/tiny-book/`**: Sample skill and fixture from Phase 11. GATE-06 uses `/book-crafter:sample` as the install verification step.
- **`skills/sample/SKILL.md`**: Runs the full pipeline non-interactively and reports PASS/FAIL with captivation score + novelty_dedup verdict.

### Established Patterns
- Evidence as committed markdown files in `evidence/` — new directory for this phase, gitignored from release.sh whitelist.
- External project path references (the Eternally Secure project lives outside the repo — only evidence artifacts are committed).
- Hard gates with explicit human approval (GATE-08 mirrors the outline approval gate pattern from Phase 2).

### Integration Points
- **README.md**: GATE-07 edits the capability line in-place. Must preserve the rest of the README structure from Phase 11.
- **release.sh whitelist**: Must NOT include `evidence/` — Phase 12 evidence is development-only, never shipped in the release zip.
- **GitHub repo creation**: Prerequisite for GATE-06. Uses `gh repo create gygundo/book-crafter-plugin --public --source=.` or equivalent.
- **Git tag**: `git tag v1.1.0` applied to final commit, pushed with `git push origin v1.1.0`.

</code_context>

<specifics>
## Specific Ideas

- Eternally Secure project path verbatim: `/Users/David/Documents/Books/Eternally Secure/`
- Sources-adapted directory has 3 files: `source-01-20-reasons.md`, `source-02-4-signs.md`, `source-03-can-you-lose.md` — these must be byte-identical after the `--fresh` re-run.
- GitHub repo: `gygundo/book-crafter-plugin`, public, created late (after evidence gathered).
- Smoke test on this Mac: remove dev plugin → clear cache → marketplace install → `/book-crafter:sample` → verify → reinstall dev plugin.
- Blind review in a fresh Claude Code session with randomised A/B labeling — the before/after mapping revealed only after ranking.
- The `evidence/` directory is excluded from the release zip (add to release.sh exclusion list if not already there).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope. All GATE-01..09 requirements are addressed in the decisions above.

</deferred>

---

*Phase: 12-re-run-release-gate*
*Context gathered: 2026-04-16*
