# Phase 13: Repetition and Novelty Enforcement - Context

**Gathered:** 2026-04-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Close the repetition blindspot surfaced by the first real sample run. The system scored 14/14 on its own captivation rubric while a human reader experienced the output as a loop (the central image "one small lamp refusing the whole dark" hit every zone of every chapter; the author's kitchen-counter vulnerability beat appeared near-verbatim in both foreword and Ch 2).

Phase 13 delivers structural fixes so outputs are judged on **variation**, not just **presence**, and the release gate trusts a **single canonical** captivation score.

**In scope:**
- Hybrid dedup detection engine (deterministic n-gram + LLM semantic judgment)
- Tiered audit scope (front-matter/chapters AND back-matter/enricher outputs)
- Separate binary `novelty_dedup` gate alongside a new 8th rubric component
- Rubric reconciliation into one canonical file with YAML frontmatter
- Book DNA refrains-whitelist mechanism with mandatory author interaction gate
- Scoped re-run orchestrator mode (`--rewrite-targets`) with reason hints
- Writer anti-loop clause
- Tiny-book fixture rewrite + static adversarial fixture for fail-path regression
- Fresh sample run proof gate

**Out of scope (see Deferred Ideas):**
- Auto-revision by the editor (editor stays judge, not author)
- Soft-warn override modes (hard gates only)
- Fiction-specific repetition rules
- Refrain UI beyond a YAML block in Book DNA
- Secular voice fixture validation

</domain>

<decisions>
## Implementation Decisions

### Detection Engine (Area 1)

- **D-01:** **Hybrid detection engine.** Deterministic `craft-check.js --novelty` mode handles exact and near-exact repetition (n-gram shingling for 6+ word spans, cross-artefact overlap detection, central-image vehicle comparison). Editor Pass 3 §4.4.5 performs LLM judgment on top for paraphrase and semantic scene reuse the script can't catch. Combined verdict: script-fail OR LLM-fail → `novelty_dedup: fail`. The script result is the appeal-proof deterministic anchor; the LLM catches what the script can't.

- **D-02:** **`craft-check.js` grows a `--novelty` flag.** Emits structured JSON: `{repeated_spans: [...], cross_artefact_hits: [...], central_image_reuse: [...], flag: true|false}`. Matches existing craft-check output shape. Takes a `--dna <path>` flag to read the refrains whitelist from Book DNA and skip whitelisted spans during shingling. Takes a `--tier 1|2|both` flag (see D-15).

- **D-03:** **Editor Pass 3 gains §4.4.5 "Novelty and Dedup Audit".** Reads `craft-check.js --novelty` JSON output AND performs its own LLM judgment pass on the same manuscript scope. Writes combined verdict into the consistency report's YAML section as `novelty_dedup: pass|fail` plus a structured `novelty_dedup_flags:` array. Follows the existing CRAFT-02/05/07 layering pattern (deterministic script result + LLM override/augmentation in the editor pass).

### Scoring Shape (Area 2)

- **D-04:** **Separate binary `novelty_dedup` gate.** The captivation total (now 0-16 per D-29) and the `novelty_dedup: pass|fail` verdict are INDEPENDENT output fields. The sample release gate requires BOTH `captivation_total >= threshold` AND `novelty_dedup == pass` to emit SAMPLE PASS. Either failing → SAMPLE FAIL. This structurally prevents the "14/14 with duplicates ships" failure mode that triggered Phase 13.

- **D-05:** **Sample output line format (updated):**
  - PASS: `SAMPLE PASS — .docx at <path>, captivation N/16 (threshold M), novelty_dedup pass`
  - FAIL (captivation): `SAMPLE FAIL — captivation N/16 below threshold M (see consistency-report.md)`
  - FAIL (novelty): `SAMPLE FAIL — novelty_dedup fail: <K> flags (see consistency-report.md §novelty_dedup_flags)`
  - FAIL (both): `SAMPLE FAIL — captivation N/16 below threshold M AND novelty_dedup fail: <K> flags`
  - Replaces the D-12 format from Phase 11's CONTEXT.md. The sample gate reads structured YAML, never greps prose.

### Refrain Whitelist Mechanism (Area 3)

- **D-06:** **Refrains live in Book DNA as a structured YAML block.** Single source of truth, no new file, no new skill contract, no new orchestrator wiring. Every skill that already reads Book DNA (writer, editor, enricher, formatter) gains refrain awareness for free.

- **D-07:** **Refrain schema (minimum):**
  ```yaml
  refrains:
    - phrase: "one small lamp refusing the whole dark"
      max_uses: 1              # integer or "unlimited"
      scope: whole_book        # whole_book | chapter_endings | front_matter_only | body_only
  ```
  Without `max_uses`, "refrain" becomes a loophole. `craft-check.js --novelty` reads this block and skips whitelisted spans during shingling up to `max_uses`; the `max_uses + 1` occurrence flags normally.

- **D-08:** **MANDATORY author interaction gate during outline → Book DNA handoff.** Refrains cannot be auto-inferred from the brief alone. The outliner proposes candidate refrains (extracted from the brief + any phrases flagged as "signature" or recurring across outline beats) and MUST surface them to the author for confirmation before the orchestrator writes the Book DNA. The author prompt is plain-text and asks, for each candidate: keep as refrain (and specify `max_uses`), demote to normal prose (dedup will flag repeats), or add one the outliner missed. This gate lives alongside the existing outline-approval gate in the orchestrator.

- **D-09:** **Fixture bypass.** The tiny-book fixture ships with a pre-approved Book DNA containing the refrain block already filled in, so `/book-crafter:sample` runs non-interactively. Non-fixture runs hit the interactive gate. This mirrors D-09 from Phase 11 (sample skill is non-interactive, fixture is pre-approved by existing in the repo).

### Failure Handling (Area 4)

- **D-10:** **Hard fail on `novelty_dedup: fail`, no auto-remediation.** The editor flags and reports; it does not rewrite. `novelty_dedup: fail` causes the sample gate to hard-fail with a non-zero exit code. Soft-warn/override modes are explicitly rejected — the whole Phase 13 premise is that soft gates become invisible.

- **D-11:** **Scoped re-run via `--rewrite-targets`.** The orchestrator gains a new mode: `/book-crafter:orchestrator --rewrite-targets <path-to-targets.yaml>` that re-runs writer + editor for ONLY the flagged chapters (not the whole pipeline). Reuses the Phase 10 `--fresh` mode pattern precedent for scoped re-runs. Keeps dedup failures affordable on 20-chapter books. On the 3-chapter fixture, it's functionally identical to a full re-run.

- **D-12:** **`rewrite_targets` structured contract with MANDATORY `reason:` field.** Each target must include a specific reason hint so the writer has something actionable; without it, the re-drive is a dice roll and produces the same text.
  ```yaml
  rewrite_targets:
    - file: edited/ch02-final.md
      span: "L21-L28"
      reason: "verbatim overlap with front-matter/foreword.md:L12-L18 — rewrite the vulnerability beat using a different sourced detail from the author notes"
      flagged_by: craft-check   # or: editor-pass3
  ```
  Editor Pass 3 §4.4.5 emits this block as part of the consistency report when `novelty_dedup: fail`. The orchestrator reads it when invoked with `--rewrite-targets`.

### Audit Scope (Area 5)

- **D-13:** **Tiered audit scope with differentiated rule sets.** Two tiers feed into the same `novelty_dedup` verdict. Both ship with real rules in Phase 13 (not scaffold-only).

- **D-14:** **Tier 1 — strict (SC-2 literal scope).** Covers `front-matter/*.md` + `edited/ch*-final.md`. Full rule set:
  1. Repeated 6+ word spans across any pair of files (outside scripture and declared refrains)
  2. Vulnerability-beat cross-check: flag when a chapter's vulnerability passage substantially overlaps with the foreword or another chapter's vulnerability passage
  3. Central-image vehicle distinctness: flag when the same descriptive vehicle (not just concept) dominates multiple chapters
  4. Reader-moment reuse in adjacent chapters

- **D-15:** **Tier 2 — structural (back-matter + enricher outputs).** Covers `back-matter/*.md` + `enriched/*.md` (discussion questions, chapter summaries, prayer points). Different rules because summaries legitimately echo their own chapter's prose — a naive span check would flood false positives.
  1. Discussion-question stem repetition: flag if the same question stem (≥8 words) appears across 2+ chapters
  2. Prayer-point phrasing repetition: flag if the same ≥6-word span appears in prayer points of 2+ chapters (theological books only; gated on profile)
  3. Vulnerability-beat reuse in summaries: flag if a span from a chapter's vulnerability beat appears in ANOTHER chapter's summary (same-chapter echo is legitimate, skipped)
  4. Central-image vehicle reuse in back matter: flag if a chapter's image vehicle appears in another chapter's enricher output

- **D-16:** **Tier 2 ships with real rules AND test coverage in Phase 13.** Not scaffold-only. This grows the phase scope (see D-17, D-18) but closes the loophole that would force v1.2 to reopen the phase.

- **D-17:** **Tiny-book fixture MUST exercise the enricher stage end-to-end** so Tier 2 is actually validated during SC-6's proof run. Sample skill's orchestrator invocation may need an `--enricher` flag, OR the fixture declares enricher as default-on. SC-6's "zero dedup flags" now means zero across BOTH tiers on the rewritten fixture.

- **D-18:** **Second micro-fixture for Tier 2 regression.** `test-craft-check.js` gets a known-bad enricher fixture under `fixtures/tiny-book/adversarial-enricher/` with three fake discussion-question sets containing deliberate duplication, a vulnerability beat reused across a chapter summary, and a reused image vehicle. Asserts each Tier 2 rule fires with specific expected flags.

### Fixture Motif (Area 6)

- **D-19:** **Motif family: "light in the night."** Accepted verbatim from Codex's proposal in `11-REVIEWS.md`. Spiritual default voice (inherits D-05 from Phase 11 — fixture stays spiritual, secular validation deferred).

- **D-20:** **Three distinct vehicles, one per chapter:**
  - **Ch 1:** phone glow / unlit bedside lamp
  - **Ch 2:** yellow pool over the kitchen counter
  - **Ch 3:** grey seam of dawn overtaking artificial light
  - Directional arc (night → dawn). Ordering matters; a future swap test catches out-of-sequence pipeline bugs.

- **D-21:** **Refrain: "one small lamp refusing the whole dark", `max_uses: 1, scope: whole_book`.** Pre-declared in the fixture's Book DNA refrain block (D-09). Enforces SC-5 literally — appears at most once in the entire booklet. Provides a concrete test case for the refrain whitelist mechanism (Area 3).

- **D-22:** **Static adversarial fixture for fail-path regression.** Lives at `fixtures/tiny-book/adversarial/` as a hand-authored known-bad manuscript — no LLM involvement in generation. Contents:
  - `front-matter/foreword.md` + `edited/ch01-final.md` + `edited/ch02-final.md` with deliberate 6+ word verbatim spans across foreword↔ch01
  - A vulnerability beat reused near-verbatim in ch02 from foreword
  - Three image vehicles deliberately too similar ("bedside lamp / desk lamp / reading lamp")
  - `expected-flags.json` enumerating which flags each tier should fire

- **D-23:** **`test-craft-check.js` asserts the adversarial fixture.** Runs `craft-check.js --novelty --tier both` against `fixtures/tiny-book/adversarial/`, parses JSON output, asserts actual flags match `expected-flags.json` exactly. This is the highest-value test in the phase — it exercises the FAIL path, which is what was never tested before Phase 13.

### Schema Reconciliation (Area 7)

- **D-24:** **`references/captivation-rubric.md` is canonical.** The other two schemas (`skills/editor/SKILL.md:504` report template showing stale `N/10`, and `fixtures/tiny-book/run/reports/consistency-report.md:65` flat 14-item checklist) get rewritten to match the rubric file. One chain of truth: rubric declares → editor emits → sample gate reads.

- **D-25:** **YAML frontmatter block at the top of `references/captivation-rubric.md`.** Structured machine-readable header, human-readable prose below. Pattern already used in `skills/*/SKILL.md` — known-good shape, no new file format, no new drift surface. Sketch:
  ```yaml
  ---
  schema_version: 2
  total_range: [0, 16]
  components:
    - key: hooks
      label: "Hook quality"
      range: [0, 2]
    # ... 6 more existing components
    - key: novelty_variation
      label: "Novelty / Variation"
      range: [0, 2]
  dimensions:
    - key: novelty_dedup
      type: binary
      values: [pass, fail]
  thresholds:
    sample_gate:
      captivation_total_min: 10    # exact integer at planner discretion
      novelty_dedup: pass
  output_fields:
    - captivation_total
    - components.*
    - novelty_dedup
    - novelty_dedup_flags
    - rewrite_targets
  ---
  ```

- **D-26:** **New 8th rubric component: `novelty_variation` (0-2 points).** Required by SC-3. Independent from D-04's binary gate — the component scores HOW VARIED the prose is on a gradient, the binary gate says WHETHER a hard flag was found. Both exist. Both read by the sample gate. No conflict.
  - **2 pts:** Central-image vehicle fully distinct per chapter; no 6+ word span repetition across artefacts; vulnerability beats single-location.
  - **1 pt:** Motif family consistent, vehicles mostly distinct, minor phrase echoes under the refrain whitelist.
  - **0 pts:** Vehicle repetition or verbatim cross-artefact span caught by Tier 1 or Tier 2.

- **D-27:** **Total captivation range becomes `[0, 16]`** (was `[0, 14]`). All three schemas update simultaneously in one atomic change. The rubric regression tests (`scripts/test-rubric-regression.js`) must be updated to the new ceiling.

- **D-28:** **Sample gate threshold proportional bump.** Phase 11's starting point was `>= 8/14` (~57%). Proportional equivalent on 0-16 is `>= 9/16` or `>= 10/16` — exact integer is Claude's discretion at plan time per D-07 precedent from Phase 11. Starting recommendation: `>= 10/16`, subject to calibration against the first run of the rewritten fixture.

- **D-29:** **Schema version 2.** The frontmatter's `schema_version: 2` signals the break from the v1 (0-14, 7 components) shape. Any downstream consumer that pinned v1 will fail loudly rather than silently — intentional, since silent agreement was the root cause of the blindspot.

### Writer Anti-Loop Clause (SC-4)

- **D-30:** **Writer SKILL.md gains an anti-loop section.** Verbatim text lives in the plan, but the contract is:
  1. No 6+ word phrase reuse across chapters or foreword unless whitelisted as a refrain in Book DNA
  2. Spent vulnerability seeds (already used in foreword or another chapter) cannot be reused — the writer must choose a different sourced detail or skip the beat
  3. Motif family may be shared across chapters but image VEHICLE must differ per chapter
  4. Echo and recontextualise, not repeat — if a concept must recur, rephrase with different words, metaphors, or contextual details
  5. Writer reads Book DNA refrains block and treats whitelisted phrases as the ONLY permitted verbatim reuse

### Claude's Discretion

- Exact integer captivation threshold in D-28 (starting recommendation: 10/16)
- Exact JSON shape emitted by `craft-check.js --novelty` (as long as it matches the YAML output-field contract in D-25)
- Exact bash/sed or Node helper used by `scripts/release.sh` and the sample gate to parse rubric frontmatter (falls back to a `scripts/read-rubric.js` helper if bash parsing gets ugly)
- Exact prose of the adversarial fixture's hand-authored manuscript (must produce the flags enumerated in `expected-flags.json`)
- Exact outliner prompt wording for the refrain-candidate author interaction gate (must satisfy D-08's requirements)
- Whether to split `craft-check.js --novelty` into a separate `scripts/novelty-check.js` file or keep it inside `craft-check.js` (one file is simpler; split is cleaner — planner decides)
- Whether to add a companion generated `references/captivation-schema.json` at build time if frontmatter parsing gets painful (fallback per the Area 7 discussion)
- Exact Tier 2 rule tuning after first run against a real enricher fixture (starting rules in D-15 are a first cut)

### Folded Todos

None — no pending todos were folded into this phase.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 13 Source Material (the fix list)
- `.planning/phases/11-distribution-packaging/11-REVIEWS.md` — Cross-AI consensus between Codex and Gemini 2.5 Flash. Contains the verbatim diffs for writer anti-loop clause, editor Pass 3 §4.4.5, fixture rewrite, and sample-gate YAML read. Phase 13 implements this fix list.
- `.planning/ROADMAP.md` §"Phase 13: Repetition and novelty enforcement" — six numbered success criteria, scope boundary, dependency on Phase 11
- `.planning/REQUIREMENTS.md` — any REQ-level acceptance criteria that reference craft, rubric, or dedup (planner re-reads at kickoff)

### Existing Schemas Being Reconciled (Area 7)
- `references/captivation-rubric.md` — 7 components × 0-2 points = 0-14. BECOMES CANONICAL. Gains YAML frontmatter (D-25), becomes 0-16 with `novelty_variation` (D-26), gains `novelty_dedup` dimension (D-04). `schema_version: 2`.
- `skills/editor/SKILL.md` §504 (approx) — stale `Captivation Score: N/10` report template. Gets rewritten to emit the full YAML block matching the new rubric frontmatter.
- `fixtures/tiny-book/run/reports/consistency-report.md` §65 (approx) — flat 14-item checklist. Gets regenerated to match the rubric's 7+1 component structure plus the binary `novelty_dedup` field.
- `skills/sample/SKILL.md` §77 (approx) — current prose grep `grep -Eo 'Captivation[^0-9]*([0-9]+)/14'`. Gets replaced with structured YAML read of `captivation_total:` and `novelty_dedup:` fields.

### Existing Editor Pipeline (Phase 13 extends)
- `skills/editor/SKILL.md` §2.0 (craft-check integration), §2.9-§2.12 (LLM judgment layering on deterministic results), §4.4 (Theme Tracking) — the new §4.4.5 "Novelty and Dedup Audit" slots in here and follows the same layering pattern
- `scripts/craft-check.js` — gains `--novelty`, `--tier`, and `--dna` flags. First cut may keep everything in one file; planner can split.
- `scripts/test-craft-check.js` — gains adversarial-fixture assertions (D-23) and Tier 2 rule regression
- `scripts/test-rubric-regression.js` — updates the ceiling from 14 to 16 and adds novelty_dedup assertions

### Existing Writer + Outliner (Phase 13 modifies)
- `skills/writer/SKILL.md` §CRAFT-03 (central image threading), §CRAFT-04 (vulnerability beat sourcing), §64/§174/§184 (presence rules) — the anti-loop clause (D-30) lands here
- `skills/outliner/SKILL.md` §103 (distinct central images), §119 (distinctness rule — Codex flagged this as correctly-instinctful-but-currently-contradicted) — the refrain-candidate author gate (D-08) lands here
- `skills/orchestrator/SKILL.md` — gains `--rewrite-targets` mode (D-11), gains refrain-confirmation interactive gate in outline → Book DNA handoff (D-08)

### Existing Fixture (Phase 13 rewrites + extends)
- `fixtures/tiny-book/brief.md` §35 — currently mandates the loop. Gets rewritten per D-19/D-20.
- `fixtures/tiny-book/run/chapter-outline.md` §26, `fixtures/tiny-book/run/book-dna.md` §54 — current artefacts propagating the same image to every chapter. Regenerated from the new brief.
- `fixtures/tiny-book/run/front-matter/foreword.md` §12, `fixtures/tiny-book/run/edited/ch02-final.md` §21 — the specific verbatim duplication case that triggered this phase. Regenerated clean from the new brief.

### Phase 11 Cross-Phase Dependencies (honour these)
- `.planning/phases/11-distribution-packaging/11-CONTEXT.md` — D-05 (fixture stays spiritual-default), D-06 (3-chapter booklet, ≤ 2,500 words), D-07 (threshold starting recommendation pattern), D-09 (sample skill non-interactive), D-12 (sample output line format — superseded by D-05 of Phase 13), D-27 (release.sh whitelist — any new script/fixture must be added)

### Phase 10 Pattern Precedents
- `.planning/phases/10-writing-quality-v2/10-CONTEXT.md` — `--fresh` mode contract (precedent for the new `--rewrite-targets` orchestrator mode in D-11), craft-check.js invocation pattern (precedent for D-02's `--novelty` flag shape), layered deterministic + LLM judgment pattern (precedent for D-01)

### Anti-Patterns and Pitfalls
- `.planning/research/PITFALLS.md` — re-scan for any pitfalls that relate to craft rules, rubric drift, or fixture-gate integrity
- `references/bestseller-craft-rules.md` — existing CRAFT-01..08 rule documentation; the Novelty / Variation component (D-26) needs a corresponding rule entry here OR the rules file is updated to reference the rubric frontmatter as canonical

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`scripts/craft-check.js`** — proven deterministic script. Follows the `node scripts/craft-check.js <chapter-path>` invocation pattern. Emits JSON. Phase 13 extends it rather than replacing it.
- **`scripts/test-craft-check.js`** — existing regression test harness. The Phase 13 adversarial fixture (D-22) plugs into the same pattern.
- **`scripts/test-rubric-regression.js`** — existing rubric regression suite. Gets its ceiling updated to 16 and gains `novelty_dedup` assertions.
- **`skills/editor/SKILL.md` §2.0 layering pattern** — deterministic craft-check result + LLM judgment override/augmentation in the editor pass. CRAFT-02, CRAFT-05, and CRAFT-07 all follow this shape. D-01's hybrid dedup engine follows it too — no new mental model.
- **Phase 10 `--fresh` mode on the orchestrator** — precedent for adding a new orchestrator mode that scopes a re-run. D-11's `--rewrite-targets` is the sibling of `--fresh`.
- **Book DNA as cross-skill shared context** — already the one place every skill reads. Adding a `refrains:` block (D-06) costs zero new skill contract.
- **Skill frontmatter + prose pattern** — already used in every `skills/*/SKILL.md`. D-25's rubric frontmatter follows the same pattern.
- **Existing consistency-report.md YAML sections** — editor already emits some structured YAML. Phase 13 formalises and extends.

### Established Patterns
- No new npm dependencies (inherited from Phase 11 D-05 and every prior phase). YAML frontmatter parsing uses Node stdlib or a minimal handwritten parser (~20 lines).
- Plain bash + grep for release.sh gates (Phase 11 D-25). New sample gate YAML read follows the same discipline — no `jq`, no node-side YAML dep.
- Hard gates, not soft warnings (Phase 11 philosophy, reinforced by Phase 13 premise).
- Deterministic fixtures (Phase 10/11 pattern). D-19/D-20 fixture and D-22 adversarial fixture both respect this.

### Integration Points
- **Release script whitelist (Phase 11 D-27):** `scripts/craft-check.js` and `scripts/test-craft-check.js` are already whitelisted. Phase 13 adds nothing new to ship unless a second helper script is created. `fixtures/tiny-book/brief.md` is whitelisted; `fixtures/tiny-book/adversarial/` is NOT (test-only, never ships in the release zip — must be explicitly excluded alongside `fixtures/tiny-book/run/`).
- **Sample skill (`skills/sample/SKILL.md`):** reads structured YAML from the consistency report; updates the pass/fail line format per D-05. This is the critical consumer — its current behaviour (prose grep, Phase 11 D-12) is the thing Phase 13 structurally replaces.
- **Orchestrator (`skills/orchestrator/SKILL.md`):** two new touches — `--rewrite-targets` mode (D-11) and the refrain-confirmation interactive gate at outline → Book DNA handoff (D-08). Both preserve existing flows; neither rewrites existing orchestrator paths.
- **Editor Pass 3 §4.4 → §4.4.5:** clean insertion point; the existing §4.4 Theme Tracking subsection gives the exact template to clone.

</code_context>

<specifics>
## Specific Ideas

- **Motif family verbatim:** "light in the night" — not "light in darkness," not "lamps," not "illumination." Source: Codex review, locked in D-19.
- **Three vehicles verbatim:**
  - Ch 1: phone glow / unlit bedside lamp
  - Ch 2: yellow pool over the kitchen counter
  - Ch 3: grey seam of dawn overtaking artificial light
- **Refrain phrase verbatim:** "one small lamp refusing the whole dark" — `max_uses: 1`, `scope: whole_book`. The phrase appearing twice in the fixture output is a hard fail.
- **Sample output line format (machine-greppable):**
  - `SAMPLE PASS — .docx at <path>, captivation N/16 (threshold M), novelty_dedup pass`
  - `SAMPLE FAIL — <specific reason>`
- **Reason hint format (mandatory in `rewrite_targets`):** must include a specific cross-reference to the duplicated location AND a directional instruction ("rewrite … using a different sourced detail"). Generic reasons like "too similar" are rejected.
- **Schema version 2** is a hard break from v1 — downstream consumers that silently trusted v1 shape will fail loudly. Intentional, not a bug.
- **Tier 1 is non-negotiable** (SC-2 literal scope). **Tier 2 ships real rules in Phase 13** (D-16) and MUST be validated by the SC-6 proof run on a fixture that exercises enricher.
- **The adversarial fixture's whole purpose is testing the FAIL path.** This was never tested before Phase 13. SC-6 tests the pass path; `test-craft-check.js` against `fixtures/tiny-book/adversarial/` tests the fail path.

</specifics>

<deferred>
## Deferred Ideas

### Out of Phase 13 scope (belong in later phases or v1.2)
- **Editor auto-revision on dedup flag** (Area 4 Option B). Crosses the editor's judge-not-author contract; significant new capability surface. Revisit in v1.2 if the scoped re-run loop in D-11 proves too slow on real books.
- **Soft-warn / `--strict` override modes** (Area 4 Option D). Explicitly rejected — Phase 13's whole premise is that soft gates become invisible. Not deferred, REJECTED.
- **Fiction-specific repetition rules** — current rule set is non-fiction-calibrated (vulnerability beats, central images as teaching anchors). Fiction needs different rules (character voice consistency, dialogue attribution patterns). Fiction is out of scope per the project's non-fiction focus.
- **Refrain UI beyond YAML** — no GUI for declaring refrains. Authors edit Book DNA directly during the interactive gate (D-08). v1.2 could add a dedicated `/book-crafter:refrains` management skill if usage shows it's needed.
- **Per-component minima in `expected-captivation-score.txt`** — Phase 11 D-07 deferred this to v1.2. Phase 13 does NOT add per-component minima despite restructuring the rubric — total + `novelty_dedup` binary is the full gate.
- **Secular voice fixture for dedup validation** — Phase 11 D-05 deferred secular fixture to v1.2. Phase 13 inherits that — the adversarial fixture is spiritual-default.
- **Semantic similarity via embeddings** — Phase 13's LLM judgment pass (D-01 half 2) uses editor agent reading manuscript directly, not vector embeddings. An embeddings-based similarity engine is deferred to v1.2 and would only be justified if the LLM-judgment pass proves too expensive or slow on long books.
- **Rubric schema v3** — no plan. v2 is the Phase 13 target. Future schema changes get their own phase.
- **`scripts/novelty-check.js` as a separate file** — D-02 keeps the novelty logic inside `craft-check.js`. If planner/executor find that painful, splitting is a clean refactor in a follow-up phase.
- **Companion generated `references/captivation-schema.json`** — fallback if D-25's frontmatter parsing gets ugly. Phase 13's first pass uses frontmatter directly; generated JSON is a deferred fallback, not a planned artefact.
- **Rubric-file-driven craft-check rules (fully data-driven)** — Phase 13 puts the rubric frontmatter in place but craft-check rules remain code-defined. A future phase could make craft-check read the rubric JSON to decide which rules to run — deferred as v1.2+.
- **Multi-book dedup** — Phase 13 audits within a single book's artefact set. Detecting repetition across a series (the same author writing book 2 that reuses book 1's signature images) is out of scope.
- **Refrain "graduation"** — declaring a phrase as a refrain for this chapter only but not the next. The `scope` field in D-07 covers some of this (`chapter_endings`, `front_matter_only`) but per-chapter whitelisting is deferred.

### Reviewed Todos (not folded)
None — no relevant pending todos surfaced during `cross_reference_todos`.

</deferred>

---

*Phase: 13-repetition-and-novelty-enforcement*
*Context gathered: 2026-04-15*
