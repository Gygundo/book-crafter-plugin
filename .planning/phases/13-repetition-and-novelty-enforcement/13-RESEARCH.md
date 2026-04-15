# Phase 13: Repetition and Novelty Enforcement - Research

**Researched:** 2026-04-15
**Domain:** Text dedup / n-gram shingling in Node stdlib, YAML frontmatter in bash+node, editor pipeline extension, fixture authoring
**Confidence:** HIGH (internal-only — all integration points are in-repo, no external library decisions)

## Summary

Phase 13 is structurally small but semantically load-bearing: it closes a blindspot where the captivation rubric scored 14/14 while a human reader felt the output as a loop. The 30 locked decisions in `13-CONTEXT.md` already pin every architectural choice (hybrid deterministic+LLM engine, YAML frontmatter on canonical rubric, refrain whitelist in Book DNA, hard-fail gate, scoped re-run via `--rewrite-targets`, schema v2). Research therefore adds no new choices — it specifies the **exact shapes** the planner needs so tasks can be written without second-guessing integration points.

Ten focus areas matter:
1. A zero-dependency n-gram shingler in Node stdlib (~40 lines).
2. A hand-written YAML frontmatter parser for the flat rubric schema (~30 lines) plus a bash-only `captivation_total:`/`novelty_dedup:` reader for `release.sh` and `sample/SKILL.md §4`.
3. Editor Pass 3 §4.4.5 that follows the existing §2.0 → §2.9-§2.12 layering pattern verbatim (deterministic script → LLM judgment).
4. Orchestrator `--rewrite-targets` built as a sibling to existing Mode 6 (Fresh Run) phrase-triggered mode.
5. Refrain-candidate author gate at the outliner handoff, bypassed by fixture's pre-populated Book DNA (mirrors Phase 11 D-09).
6. The enricher IS already exercised by the sample run today (run/enrichments/ exists in the repo), so Tier 2 validation costs nothing extra in the sample skill — it only needs to be preserved, not added.
7. Adversarial fixture following the existing `fixtures/phase10/known-bad/` pattern plus an `expected-flags.json` assertion shape extending `test-craft-check.js`'s current per-check assertions.
8. Central-image vehicle distinctness deterministically: compare the `central_image` field strings from Book DNA's Chapter Map (they're structured) before falling back to LLM semantic judgment for prose-level vehicle collision.
9. Sample output format update (D-05) replaces Phase 11 D-12 in exactly two code sites: `skills/sample/SKILL.md §4-§5` and the matching PASS/FAIL strings in release.sh if it ever calls sample (it doesn't yet, but the contract must match).
10. Validation architecture: Phase 13 is test-heavy — SC-6 is the pass path (end-to-end sample), `test-craft-check.js` against the adversarial fixture is the fail path, and `test-rubric-regression.js` extends to 0-16 ceiling with schema v2 assertions.

**Primary recommendation:** Keep `craft-check.js --novelty` inside `scripts/craft-check.js` as a new mode branch (not a new file). Add a tiny `scripts/read-rubric.js` helper only if `release.sh`'s grep reader gets ugly; the planner's default should be inline bash `grep -E '^captivation_total:' | cut -d: -f2 | tr -d ' '` per Codex's proposed diff. Every other decision is locked.

## User Constraints (from CONTEXT.md)

### Locked Decisions

**Detection Engine (D-01..D-03):**
- **D-01:** Hybrid detection. `craft-check.js --novelty` (deterministic n-gram + vehicle comparison + scripture/refrain skip) + Editor Pass 3 §4.4.5 LLM judgment layer. Combined verdict: script-fail OR LLM-fail → `novelty_dedup: fail`.
- **D-02:** `craft-check.js` gains `--novelty`, `--tier 1|2|both`, `--dna <path>` flags. Emits JSON matching existing shape: `{repeated_spans, cross_artefact_hits, central_image_reuse, flag}`.
- **D-03:** Editor Pass 3 §4.4.5 "Novelty and Dedup Audit" reads the script JSON AND runs its own LLM judgment on the same scope. Writes YAML `novelty_dedup: pass|fail` + `novelty_dedup_flags:` array into consistency-report.md. Follows CRAFT-02/05/07 layering pattern.

**Scoring Shape (D-04..D-05):**
- **D-04:** `novelty_dedup: pass|fail` is a BINARY gate INDEPENDENT of `captivation_total` (now 0-16). Sample gate requires BOTH `captivation_total >= threshold` AND `novelty_dedup == pass`.
- **D-05:** Sample output line format (replaces Phase 11 D-12):
  - PASS: `SAMPLE PASS — .docx at <path>, captivation N/16 (threshold M), novelty_dedup pass`
  - FAIL (captivation): `SAMPLE FAIL — captivation N/16 below threshold M (see consistency-report.md)`
  - FAIL (novelty): `SAMPLE FAIL — novelty_dedup fail: <K> flags (see consistency-report.md §novelty_dedup_flags)`
  - FAIL (both): `SAMPLE FAIL — captivation N/16 below threshold M AND novelty_dedup fail: <K> flags`

**Refrain Whitelist (D-06..D-09):**
- **D-06:** Refrains live in Book DNA as a structured YAML block. No new file, no new skill contract.
- **D-07:** Refrain schema: `phrase`, `max_uses` (integer or "unlimited"), `scope` (whole_book | chapter_endings | front_matter_only | body_only). Without `max_uses`, "refrain" becomes a loophole.
- **D-08:** MANDATORY author interaction gate at outline → Book DNA handoff. Outliner proposes candidates; author confirms `max_uses` per phrase or demotes to normal prose. Lives alongside existing outline-approval gate.
- **D-09:** Fixture bypass — tiny-book ships pre-approved Book DNA with refrain block filled in (mirrors Phase 11 D-09).

**Failure Handling (D-10..D-12):**
- **D-10:** HARD fail on `novelty_dedup: fail`. No auto-remediation. Editor flags and reports; does not rewrite.
- **D-11:** Scoped re-run via `/book-crafter:orchestrator --rewrite-targets <path>`. Reuses Phase 10 `--fresh` mode pattern — re-runs writer + editor for flagged chapters only.
- **D-12:** `rewrite_targets` schema with MANDATORY `reason:` field per target: `file`, `span`, `reason` (specific directional hint), `flagged_by` (craft-check | editor-pass3). Editor Pass 3 §4.4.5 emits this block on `novelty_dedup: fail`.

**Audit Scope (D-13..D-18):**
- **D-13:** Tiered audit. Both tiers feed same `novelty_dedup` verdict.
- **D-14:** Tier 1 (strict) — `front-matter/*.md` + `edited/ch*-final.md`. Rules: repeated 6+ word spans outside scripture/refrains; vulnerability-beat cross-check; central-image vehicle distinctness; reader-moment reuse in adjacent chapters.
- **D-15:** Tier 2 (structural) — `back-matter/*.md` + `enriched/*.md` (discussion questions, chapter summaries, prayer points). Rules: discussion-question stem repetition ≥8 words; prayer-point phrasing ≥6 words (theological only); vulnerability-beat bleed into another chapter's summary; image vehicle reuse in back matter.
- **D-16:** Tier 2 ships with REAL rules AND tests in Phase 13 (not scaffold-only).
- **D-17:** Tiny-book fixture MUST exercise enricher end-to-end so Tier 2 is validated during SC-6.
- **D-18:** Second micro-fixture `fixtures/tiny-book/adversarial-enricher/` with deliberately duplicated discussion questions / vulnerability reuse / reused vehicles. Tests each Tier 2 rule fires.

**Fixture Motif (D-19..D-23):**
- **D-19:** Motif family "light in the night" (verbatim).
- **D-20:** Three distinct vehicles: Ch1 phone glow/unlit bedside lamp; Ch2 yellow pool over kitchen counter; Ch3 grey seam of dawn overtaking artificial light. Directional arc (night → dawn). Ordering matters.
- **D-21:** Refrain "one small lamp refusing the whole dark", `max_uses: 1, scope: whole_book`.
- **D-22:** Static adversarial fixture at `fixtures/tiny-book/adversarial/` — hand-authored, no LLM. Contains deliberate verbatim spans, reused vulnerability beat, three too-similar vehicles (bedside lamp / desk lamp / reading lamp). Ships with `expected-flags.json`.
- **D-23:** `test-craft-check.js` asserts the adversarial fixture — runs `craft-check.js --novelty --tier both`, parses JSON, asserts flags match `expected-flags.json` exactly. Highest-value test in the phase.

**Schema Reconciliation (D-24..D-29):**
- **D-24:** `references/captivation-rubric.md` is CANONICAL. Editor `SKILL.md:504` template and fixture consistency-report.md are rewritten to match.
- **D-25:** YAML frontmatter block at top of rubric (schema in CONTEXT.md) — `schema_version: 2`, `total_range: [0,16]`, 8 components with `key` / `label` / `range`, `dimensions` (binary novelty_dedup), `thresholds.sample_gate`, `output_fields`.
- **D-26:** 8th rubric component `novelty_variation` (0-2 pts). Scoring: 2 vehicle fully distinct + no 6+ word cross-artefact spans + single-location vulnerability; 1 motif shared, vehicles mostly distinct, minor echoes under refrain whitelist; 0 vehicle repetition or Tier 1/2 caught.
- **D-27:** Total becomes **[0, 16]** (was [0, 14]). All three schemas update simultaneously.
- **D-28:** Threshold proportional bump — starting recommendation `>= 10/16` (Claude's discretion at plan time).
- **D-29:** `schema_version: 2` — hard break from v1. Downstream v1 pins fail loudly.

**Writer Anti-Loop (D-30):**
- **D-30:** Writer SKILL.md gains anti-loop section with five contract rules: no 6+ word reuse across chapters/foreword unless whitelisted; spent vulnerability seeds forbidden; motif family shared but vehicle differs; echo and recontextualise not repeat; writer reads Book DNA refrains block as ONLY permitted verbatim reuse.

### Claude's Discretion
- Exact integer captivation threshold in D-28 (start at 10/16)
- Exact JSON shape emitted by `craft-check.js --novelty` (must match the YAML output-field contract in D-25)
- Whether release.sh uses inline bash grep or a `scripts/read-rubric.js` helper for frontmatter (start with bash)
- Exact prose of adversarial fixture (must produce expected-flags.json flags)
- Exact outliner prompt wording for refrain-candidate gate (must satisfy D-08)
- Whether to split `craft-check.js --novelty` into a separate file (keep in one for Phase 13)
- Whether to add generated `captivation-schema.json` (fallback only)
- Tier 2 rule tuning after first real enricher run

### Deferred Ideas (OUT OF SCOPE)
- Editor auto-revision on dedup flag (crosses judge-not-author contract)
- Soft-warn / `--strict` override modes (REJECTED — whole Phase 13 premise)
- Fiction-specific repetition rules
- Refrain UI beyond YAML
- Per-component minima in `expected-captivation-score.txt`
- Secular voice fixture for dedup validation
- Embeddings-based semantic similarity (LLM judgment pass is the only semantic layer)
- Rubric schema v3
- Separate `scripts/novelty-check.js` file
- Generated `captivation-schema.json`
- Fully data-driven craft-check rules
- Multi-book dedup
- Refrain "graduation" (per-chapter whitelisting)

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SC-1 | ONE canonical captivation score surface (YAML emit, YAML read, 3 schemas reconciled) | Areas 2, 3, 9 (YAML parser, bash reader, sample skill rewrite) |
| SC-2 | Editor Pass 3 §4.4.5 Novelty/Dedup Audit (Tier 1) | Areas 1, 4 (n-gram shingler, Pass 3 layering pattern) |
| SC-3 | Rubric `novelty_variation` component + vehicle-phrasing distinctness + zone-cap rule | Area 9 (central-image vehicle signal) |
| SC-4 | Writer anti-loop clause | D-30 (no research needed — contract text lives in plan) |
| SC-5 | Fixture brief rewrite to motif-family + 3 distinct vehicles | Areas 6, 8 (fixture enricher preservation, adversarial fixture pattern) |
| SC-6 | Fresh sample passes new canonical gate, zero dedup flags, Tier 1 AND Tier 2 | Area 6 + Validation Architecture |

## Standard Stack

### Core
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| Node.js | >= 18 | All scripts (craft-check.js, test harnesses, read-rubric.js if needed) | Already the runtime contract (Phase 10/11). Zero new deps. |
| Node stdlib (`fs`, `path`, `crypto`, `node:test`) | built-in | File I/O, regex, sha256, test runner | Existing pattern in `craft-check.js` + `test-craft-check.js` + `test-rubric-regression.js`. |
| bash + grep + sed + cut | POSIX | release.sh gates, sample skill YAML reads | Phase 11 D-25 forbids jq/node-side YAML dep in release.sh. |

### Supporting
None. Phase 13 adds zero new runtime or build dependencies (inherited from Phase 10 D-05, Phase 11 D-25, and every prior phase).

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hand-written YAML parser | `js-yaml` or `yaml` npm package | Violates no-new-deps rule. The rubric frontmatter is flat enough (lists, scalars, one level of nesting for `components`/`dimensions`/`thresholds`) that ~30 lines of Node handle it. |
| Bash grep for YAML reads | `yq` | yq is not guaranteed on recipient machines. Phase 11 D-25 is explicit. |
| Separate `scripts/novelty-check.js` | Keep in `craft-check.js` | Splitting is cleaner but adds a second whitelist entry in release.sh. D-02 keeps it inline; planner may split. |
| npm `string-similarity` / `natural` | Hand-rolled n-gram shingling | Violates no-new-deps. N-gram shingling for 6-word spans is ~15 lines. |
| Embeddings for semantic similarity | LLM judgment in Editor Pass 3 | Embeddings deferred to v1.2 (CONTEXT Deferred). LLM pass is the semantic layer. |

**Installation:** None. Phase 13 adds zero runtime packages.

**Version verification:** Not applicable — no packages added.

## Architecture Patterns

### Recommended File Touchpoints
```
references/
└── captivation-rubric.md             # D-24/25: YAML frontmatter prepended, body rewritten for schema v2

scripts/
├── craft-check.js                    # D-02: grows --novelty/--tier/--dna flag branches
├── test-craft-check.js               # D-23: adversarial fixture assertions
├── test-rubric-regression.js         # D-27: ceiling 14→16, schema_version: 2 assertions, 8-component check
└── (optional) read-rubric.js         # fallback if bash grep gets ugly

skills/
├── editor/SKILL.md                   # D-03: Pass 3 §4.4.5 insertion; §504 report template rewrite
├── writer/SKILL.md                   # D-30: §5.x anti-loop clause
├── outliner/SKILL.md                 # D-08: refrain-candidate extraction + author prompt
├── orchestrator/SKILL.md             # D-11: Mode 7 (--rewrite-targets); D-08: refrain confirmation gate
└── sample/SKILL.md                   # D-05: YAML reader replaces §77 prose grep; PASS/FAIL line format

fixtures/
├── tiny-book/
│   ├── brief.md                      # D-19/20: rewrite to motif family + 3 vehicles
│   └── run/                          # (gitignored; regenerated by SC-6 proof run)
│       └── book-dna.md               # pre-populated refrains block for D-09 fixture bypass
├── tiny-book/adversarial/            # D-22: hand-authored fail-path fixture (NOT shipped in release.sh)
│   ├── front-matter/foreword.md
│   ├── edited/ch0{1,2}-final.md
│   ├── book-dna.md                   # with/without refrains to test whitelist
│   └── expected-flags.json
└── tiny-book/adversarial-enricher/   # D-18: Tier 2 fail-path fixture
    ├── enriched/ch0{1,2,3}-enrichments.md
    └── expected-flags.json
```

### Pattern 1: Layered Deterministic + LLM Judgment (CRAFT-02/05/07 precedent)

**What:** A craft-check.js deterministic pass emits JSON with pass/fail + citations. Editor Pass reads the JSON, then runs an LLM judgment layer that can (a) override the script's fail with a whitelist case (like §2.10 pulpit-seam permitted usage) or (b) augment the script's pass with paraphrase-level flags the regex can't catch.

**When to use:** Every new craft rule where both anchoring and judgment matter. This IS the shape Phase 13 §4.4.5 must take.

**Example (existing §2.0 → §2.9-§2.12, verbatim shape to clone):**
```
### 2.0 Craft Check Invocation (deterministic)
Run: `node ${CLAUDE_PLUGIN_ROOT}/scripts/craft-check.js <chapter>`
Parse JSON. Merge into VOICE AUDIT.craft_check.

### 2.9 Craft Density (LLM judgment on top of §2.0's CRAFT-02 deterministic)
Re-read citation lines, judge unpacking quality, flag only.

### 2.10 Pulpit Seam (LLM override of §2.0's CRAFT-05 regex)
Check permitted-usage whitelist. Override fail → pass or confirm fail.
```

Phase 13's §4.4.5 must follow the same two-step shape:

```
### 4.4.5 Novelty and Dedup Audit (hybrid deterministic + LLM)

Step A — Deterministic invocation:
  node ${CLAUDE_PLUGIN_ROOT}/scripts/craft-check.js \
    --novelty \
    --tier both \
    --dna [project_directory]/book-dna.md \
    [project_directory]

Parse JSON: {repeated_spans, cross_artefact_hits, central_image_reuse, tier2_hits, flag}

Step B — LLM judgment layer:
  Read front-matter/*.md + edited/ch*-final.md directly.
  For each pair (foreword, chapter) and each chapter pair:
    - Identify vulnerability-beat passages (not just 6-word spans).
    - Judge whether a scene is substantively reused (same named person,
      same remembered moment, same emotional beat) even if the exact
      words differ.
    - Judge whether a central-image vehicle dominates two chapters
      (paraphrase-level, not just string match).
  Emit LLM-judgment flags as a parallel array.

Step C — Combined verdict:
  novelty_dedup: pass if (script.flag == false AND llm.flags == []) else fail
  Write combined flags list into consistency-report.md YAML section.
  If fail, emit rewrite_targets block per D-12.
```

### Pattern 2: Phrase-Triggered Orchestrator Mode (Mode 6 precedent for D-11)

Phase 10 added Mode 6 Fresh Run via phrase match ("start fresh", "--fresh", etc.) in `skills/orchestrator/SKILL.md §6 Mode 6`. The mode intercepts BEFORE state detection, runs preprocessing, falls through to normal flow.

Phase 13's `--rewrite-targets` becomes **Mode 7** with the same shape:

```
Triggered by phrases:
  - "--rewrite-targets"
  - "rewrite the flagged chapters"
  - "apply rewrite targets from <path>"

Preprocessing:
  1. Locate project directory.
  2. Read rewrite_targets.yaml file from supplied path or default
     [project]/reports/rewrite_targets.yaml (editor Pass 3 §4.4.5 writes it here).
  3. Parse YAML targets. For each target: {file, span, reason, flagged_by}.
  4. Delete the listed edited/ch*-final.md files AND their drafts/ch*-draft.md
     (so writer regenerates them). Preserve all other chapters.
  5. Inject the `reason` field into the writer's invocation prompt for each
     flagged chapter so the rewrite has directional guidance.
  6. Re-enter state detection — writer + editor will run only for the
     deleted chapters (filesystem-as-state).
  7. After editor Pass 3 re-runs, re-check novelty_dedup. If still fail,
     emit a NEW rewrite_targets block and halt (do not auto-loop —
     respect D-10 hard-fail contract).

Safety:
  - MANDATORY confirmation prompt showing the file list to be re-run.
  - Never touches sources/, brief.md, voice-profile.md, book-dna.md,
    chapter-outline.md (same preserve list as Mode 6 minus chapter-outline).
  - Chapters NOT in rewrite_targets stay byte-identical.
```

### Pattern 3: YAML Frontmatter in References (Skill frontmatter precedent for D-25)

Every `skills/*/SKILL.md` already uses YAML frontmatter delimited by `---` at top-of-file. The canonical rubric adopts the same shape:

```yaml
---
schema_version: 2
total_range: [0, 16]
components:
  - key: pacing_variety
    label: "Pacing Variety"
    range: [0, 2]
  - key: emotional_connection
    label: "Emotional Connection"
    range: [0, 2]
  # ... 5 more existing ...
  - key: novelty_variation
    label: "Novelty / Variation"
    range: [0, 2]
dimensions:
  - key: novelty_dedup
    type: binary
    values: [pass, fail]
thresholds:
  sample_gate:
    captivation_total_min: 10
    novelty_dedup: pass
output_fields:
  - captivation_total
  - components.*
  - novelty_dedup
  - novelty_dedup_flags
  - rewrite_targets
---

# Captivation Rubric
...existing prose body, updated for 0-16 and 8 components...
```

### Pattern 4: Handwritten Node YAML Frontmatter Parser (~30 lines)

The rubric frontmatter uses only: flat scalars, flat arrays (`[0, 16]`), and YAML lists of objects. No anchors, no merges, no multi-line strings, no block scalars. A handwritten parser stays under 30 lines:

```javascript
// scripts/read-rubric.js (only create if bash path gets ugly; otherwise inline this in craft-check.js)
function readRubricFrontmatter(filepath) {
  const text = fs.readFileSync(filepath, 'utf8');
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) throw new Error('no frontmatter');
  return parseYaml(m[1]);
}

function parseYaml(body) {
  // Line-oriented. Track indent. Stack: [currentObject, currentArray].
  const lines = body.split('\n');
  const root = {};
  const stack = [{ indent: -1, value: root }];
  for (const raw of lines) {
    if (!raw.trim() || raw.trim().startsWith('#')) continue;
    const indent = raw.match(/^ */)[0].length;
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
    const parent = stack[stack.length - 1].value;
    const line = raw.trim();
    if (line.startsWith('- ')) {
      // list item; ensure parent is array
      const kv = line.slice(2).match(/^(\w+):\s*(.*)$/);
      if (kv) {
        const obj = { [kv[1]]: coerce(kv[2]) };
        if (Array.isArray(parent)) parent.push(obj);
        stack.push({ indent: indent + 2, value: obj });
      } else {
        if (Array.isArray(parent)) parent.push(coerce(line.slice(2)));
      }
    } else {
      const kv = line.match(/^(\w+):\s*(.*)$/);
      if (!kv) continue;
      const [, key, val] = kv;
      if (val === '') {
        // nested object or list coming next
        parent[key] = null; // decided on next line
        const holder = {};
        parent[key] = holder;
        stack.push({ indent: indent + 2, value: holder });
      } else if (val.startsWith('[')) {
        parent[key] = val.slice(1, -1).split(',').map(s => coerce(s.trim()));
      } else {
        parent[key] = coerce(val);
      }
    }
  }
  return root;
}

function coerce(v) {
  if (/^-?\d+$/.test(v)) return parseInt(v, 10);
  if (/^-?\d+\.\d+$/.test(v)) return parseFloat(v);
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (v === 'null' || v === '~') return null;
  return v.replace(/^["']|["']$/g, '');
}
```

**Gotchas (from hand-writing this kind of parser before):**
- Lists of objects: the `- key: val` form starts a new object whose first key is on the dash line. Indent tracking must push a new frame with indent+2, not indent.
- Inline arrays (`[0, 16]`): detect the `[` prefix and split. Don't try to handle nested inline arrays — the rubric doesn't need them.
- Empty values that introduce a nested block (e.g. `thresholds:` followed by indented children): peek-ahead is easier if you use the indent-stack pattern above.
- Quoted values in `label: "Novelty / Variation"` — strip outer quotes via `coerce`.
- **Blank lines and comments:** skip before indent tracking, or blank lines corrupt the stack.

**Confidence:** HIGH that a flat-schema parser fits in ~40 lines. MEDIUM that the handwritten approach will survive future rubric growth — if someone adds nested lists-of-lists, split this into `scripts/read-rubric.js` and cover it with its own test.

### Pattern 5: Pure-bash YAML Field Read for release.sh / sample gate (D-25, Codex diff)

The sample skill and any future release.sh gate need `captivation_total:` and `novelty_dedup:` from consistency-report.md (NOT from the rubric file — the rubric is the schema, the report is the instance).

The editor emits these fields in a YAML block inside `consistency-report.md`. Codex's proposed diff:

```bash
REPORT="${CLAUDE_PLUGIN_ROOT}/fixtures/tiny-book/run/reports/consistency-report.md"
N=$(grep -E '^captivation_total:' "$REPORT" | head -1 | cut -d: -f2 | tr -d ' ')
DEDUP=$(grep -E '^novelty_dedup:' "$REPORT" | head -1 | cut -d: -f2 | tr -d ' ')
FLAG_COUNT=$(grep -c '^  - file:' "$REPORT" 2>/dev/null || echo 0)
```

**Contract the editor must honour:** the YAML fields MUST appear at column 0 (no leading indent) at any point in consistency-report.md, and each field appears at most once. A reasonable location is a fenced YAML block under a `## Captivation Score` heading:

```markdown
## Captivation Score

```yaml
schema_version: 2
captivation_total: 14
novelty_dedup: pass
components:
  pacing_variety: 2
  emotional_connection: 2
  reader_engagement: 2
  opening_engagement: 2
  chapter_ending_momentum: 2
  craft_density: 2
  cross_chapter_craft: 2
  novelty_variation: 0
novelty_dedup_flags: []
```
```

The bash grep reads survive because `^captivation_total:` is unique to column-0 YAML inside the fenced block — markdown renderers don't alter line positions, and `grep -E '^...'` anchors to line start. This pattern is safe.

**Pitfall:** if a future editor version indents the YAML block or moves `captivation_total:` inside a nested key, the bash reader silently returns empty and the sample gate sees N=0 → FAIL. **Prevention:** `test-rubric-regression.js` MUST include a grep assertion that `grep -E '^captivation_total:'` matches exactly once in a fixture consistency-report.md sample. Alternative: add this assertion to the new adversarial fixture test harness.

### Pattern 6: N-gram Shingling in Node stdlib (6-word span detection)

A 6-word span shingle is a sliding window over tokens. For cross-file dedup the algorithm is:

```javascript
function normalise(text) {
  // Strip markdown syntax, scripture blockquotes, HTML comments.
  return text
    .replace(/<!--[\s\S]*?-->/g, ' ')         // strip HTML comments
    .replace(/^>.*$/gm, ' ')                   // strip blockquotes (scripture)
    .replace(/[*_`#>\[\]()]/g, ' ')            // strip markdown punctuation
    .toLowerCase()
    .replace(/[^\w\s'-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function shingles(tokens, n = 6) {
  const out = [];
  for (let i = 0; i + n <= tokens.length; i++) {
    out.push({ phrase: tokens.slice(i, i + n).join(' '), start: i });
  }
  return out;
}

function findCrossFileRepeats(files, refrainWhitelist, n = 6) {
  // files: [{path, text}]; refrainWhitelist: Set of normalised phrases
  const index = new Map(); // phrase -> [{file, start}]
  for (const f of files) {
    const tokens = normalise(f.text).split(' ').filter(Boolean);
    for (const { phrase, start } of shingles(tokens, n)) {
      if (refrainWhitelist.has(phrase)) continue;
      if (!index.has(phrase)) index.set(phrase, []);
      index.get(phrase).push({ file: f.path, start });
    }
  }
  const hits = [];
  for (const [phrase, locs] of index) {
    // only flag if spans are in DIFFERENT files (cross-artefact dedup)
    const distinctFiles = new Set(locs.map(l => l.file));
    if (distinctFiles.size >= 2) {
      hits.push({ phrase, occurrences: locs });
    }
  }
  return hits;
}
```

**Performance:** on a 3-chapter booklet (~2500 words total) this is well under 10ms. Even a 60k-word standard book (~100k shingles) stays under 1 second.

**Scripture skip:** stripping `^>` blockquote lines handles the default `>` pattern used by the writer (per `skills/writer/SKILL.md §3`). Scripture inline-quoted (e.g. `"For by grace..."`) is harder — add a second pass that strips known scripture citation syntax (`"\S+" — \S+ \d+:\d+` pattern) OR rely on LLM judgment layer to not flag scripture. Recommend: HYBRID — strip blockquotes deterministically (the only form the writer SHOULD use per CRAFT rules), and let inline scripture leak to LLM judgment.

**Refrain whitelist skip:** before indexing, normalise each whitelisted phrase and put in a `Set`. During shingling, `continue` if the current shingle exactly matches. **Subtlety:** if `max_uses > 1`, count occurrences across ALL files; allow the first `max_uses` and flag every occurrence beyond. Easiest implementation: run shingling first as-if-no-whitelist, then post-process — for each whitelisted phrase, drop the first `max_uses` occurrences from the hits list before returning.

**Confidence:** HIGH. This is a textbook stdlib implementation. Planner should budget 60 lines for shingling + normalisation + whitelist handling.

### Pattern 7: Central-image Vehicle Distinctness (D-14 rule 3)

Two levels:

**Level A (deterministic — cheap):** Read every chapter's `central_image` field from `book-dna.md` or `chapter-outline.md`. These are STRUCTURED strings the outliner writes:
```
- **central_image:** yellow pool over the kitchen counter
```
Normalise each and compare pairwise:
- Exact match → fail (same image).
- Token overlap ≥ 60% (Jaccard on tokens after stopword removal) → fail (same vehicle, trivial wording variation).
- Below 60% → pass the deterministic check.

**Level B (LLM judgment in Pass 3 §4.4.5):** For each chapter pair, read the opening/middle/closing zones (already computed in Pass 2 §3.7) and judge whether the DOMINANT vehicle matches — even if the `central_image` field values differ. This catches the case where the outliner declared distinct images but the writer actually described a lamp in every zone of every chapter.

**Signal the writer emits:** already exists — per Phase 10, the writer's VOICE AUDIT metadata block records which zones contain the image. Editor Pass 2 §3.7 extracts this. Phase 13 §4.4.5 reads `craft_pass2.central_image` for each chapter AND does a cross-chapter diff on the actual zone text.

**Confidence:** MEDIUM. The deterministic check is easy; the LLM judgment layer is where rules bed in. Start strict — if the LLM flags too many false positives, raise the token-overlap threshold or add prose pattern matching.

### Anti-Patterns to Avoid
- **Do NOT propose a new YAML lib.** CONTEXT.md is explicit.
- **Do NOT propose a separate novelty-check.js file** unless strong reason emerges. Keep it as a mode branch in craft-check.js.
- **Do NOT propose soft-warn / override modes.** D-10 is explicit.
- **Do NOT propose auto-revision.** D-10 keeps editor as judge-not-author.
- **Do NOT use embeddings.** Deferred; LLM judgment is the semantic layer.
- **Do NOT rewrite tasks that only modify scripts to create new files.** Modify craft-check.js in place.
- **Do NOT duplicate the rubric schema in Pass 3.** Pass 3 reads the rubric frontmatter as canonical; any duplication is a drift surface.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Parallel-safe file I/O | Custom locking | Sequential invocation (Pass 3 is single-threaded manuscript-level) | Editor Pass 3 is explicitly whole-manuscript and single-threaded per `skills/editor/SKILL.md §4`. No concurrency to manage. |
| Sophisticated tokenisation | POS tagger / lemmatiser | Naive `split(/\s+/)` + lowercasing | 6-word spans are a coarse signal; linguistic precision adds no value and breaks determinism. |
| Git-diff-style span highlighting | Custom colourer | Line ranges (`L12-L18`) in rewrite_targets | The editor report is markdown; rich diff is out of scope. |
| Semantic similarity | Embedding service / cosine sim | LLM judgment layer (§4.4.5 Step B) | Deferred to v1.2 per CONTEXT. |
| Full YAML support | yaml / js-yaml npm package | Flat-schema handwritten parser (~40 lines) | Phase 11 D-25 + Phase 13 locked no-new-deps. |
| Test runner | Vitest / Jest | `node:test` (already used in test-craft-check.js) | Established pattern. |

**Key insight:** Every "don't hand-roll" here is the INVERSE of what a typical Node project would do. The plugin runs on a recipient's machine with ZERO `npm install` step — any dep is a deal-breaker. All complexity lives in the test and fixture infrastructure, not in runtime code.

## Runtime State Inventory

Phase 13 is a code/config/fixture change phase — no databases, no external services, no OS-level registrations. The only runtime state that matters is filesystem artefacts in `fixtures/tiny-book/run/` (the regenerated sample output).

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None — verified by scanning the repo for databases, Redis, vector stores, SQLite. The plugin writes only to filesystem (`~/Documents/Books/` or the fixture run dir). | None |
| Live service config | None — no external services. Sample skill invokes orchestrator in-process via Agent tool. | None |
| OS-registered state | None — no launchd, cron, task scheduler, systemd units. | None |
| Secrets/env vars | None — zero API keys in Phase 13 scope. `CLAUDE_PLUGIN_ROOT` is the only env var, unchanged. | None |
| Build artifacts | `fixtures/tiny-book/run/` is the regenerated output of the sample skill. Must be deleted (Mode 6 Fresh) before SC-6 proof run so stale artefacts from the pre-D-19/D-20 brief don't mask a new failure. `dist/book-crafter-v*.zip` outputs from release.sh are stale if release.sh whitelist changes (Phase 11 D-27 whitelist already excludes `fixtures/tiny-book/run/` and `fixtures/tiny-book/adversarial/` should be explicitly added). | Mode 6 Fresh before SC-6. Extend release.sh whitelist exclusions to cover `fixtures/tiny-book/adversarial/` and `fixtures/tiny-book/adversarial-enricher/` explicitly. |

**The canonical question asked and answered:** after every file in the repo is updated for Phase 13, what runtime systems still have old state? **Answer:** only `fixtures/tiny-book/run/` — and Mode 6 Fresh handles it. The fail-path adversarial fixtures have no runtime state at all; they are static hand-authored manuscripts used only by `test-craft-check.js`.

## Common Pitfalls

### Pitfall 1: Scripture Inclusion in 6-Word Span Check
**What goes wrong:** Scripture quotations appear in multiple chapters by design ("For by grace you have been saved" may legitimately appear in Ch1 and Ch3). If the shingler flags them as cross-artefact repetition, the editor fails every theological book.
**Why it happens:** Naive tokenisation doesn't know `>` blockquotes are scripture.
**How to avoid:** Strip `^>` blockquote lines during normalisation. As a backup, maintain a `scriptures` whitelist populated from the Book DNA's scripture index. The writer's CRAFT rules already require scripture to be in blockquote form, so the blockquote strip should be ~100% effective in Phase 13 fixtures.
**Warning signs:** Adversarial fixture should include a scripture quote reused across two files WITHOUT triggering a flag — include this as a test case in `expected-flags.json`.

### Pitfall 2: Refrain Whitelist Off-By-One
**What goes wrong:** A refrain declared with `max_uses: 1` appears twice. The shingler must flag the SECOND occurrence, not the first. A naive implementation either skips all occurrences (loophole) or flags the first (too strict).
**How to avoid:** Post-process the hits list. After shingling, for each whitelisted phrase sort its occurrences by (file, start position) and drop the first `max_uses`; return the remainder as flags. If `max_uses: unlimited`, drop all.
**Warning signs:** Adversarial fixture for Tier 1 MUST include a refrain appearing exactly twice (D-21: "one small lamp refusing the whole dark" `max_uses: 1`) and assert ONE flag in `expected-flags.json`.

### Pitfall 3: Indent Drift in Handwritten YAML Parser
**What goes wrong:** If someone reindents the rubric frontmatter from 2 spaces to 4 spaces, the handwritten parser silently misplaces fields in the nested tree.
**How to avoid:** `test-rubric-regression.js` asserts the parsed structure matches a known-shape object. If indent changes, the test fails loudly with "components is not an array" instead of silently returning empty data.
**Warning signs:** A rubric edit that "doesn't change the data" causes sample gate to fail.

### Pitfall 4: Bash Grep False Positives on Consistency Report
**What goes wrong:** `grep -E '^captivation_total:'` matches any line starting with that prefix — including a prose line like `captivation_total: this is a problem area`. If the editor wraps the YAML fields in prose instead of a fenced YAML block, the grep returns unintended values.
**How to avoid:** Enforce that the editor ALWAYS emits the YAML fields inside a code fence (```` ```yaml ```` ) AND that the fields appear at column 0. Add a test in `test-craft-check.js` (or a new `test-sample-gate.js`) that runs the bash grep against a fixture consistency-report.md and asserts the parsed integer matches the expected total. Harder failure modes show up earlier.
**Warning signs:** Sample gate emits a weird N value that doesn't match what's visible in the report.

### Pitfall 5: Three Schemas Drifting Again (the Phase 13 premise)
**What goes wrong:** The planner updates the rubric and the editor template but forgets the fixture consistency-report.md, or vice versa. Phase 13's whole reason for existing was Codex finding three schemas saying different things.
**How to avoid:** Every plan that touches scoring MUST also touch `test-rubric-regression.js` to assert the schema version and component count. The regression script becomes the drift-detector. Additionally, Pass 3 §4.4.5 output shape must be asserted by a fixture test that reads a known-good consistency-report.md and parses the YAML block with the same parser used in production.
**Warning signs:** A "small rubric tweak" that passes all tests but breaks the sample gate on first real run.

### Pitfall 6: Orchestrator Mode 7 Deletes More Than Planned
**What goes wrong:** `--rewrite-targets` is supposed to delete only flagged chapters, but a bug in the YAML parser or path resolution deletes more (or the whole `edited/` directory). Mode 6 already has safety invariants; Mode 7 must inherit them.
**How to avoid:** Explicit confirmation prompt listing EVERY chapter to be re-run. Path resolution uses `path.resolve(projectDir, targetFile)` and asserts the result is UNDER projectDir (guards against `../` escapes in the YAML file). Preserve list explicit: never touch `sources/`, `brief.md`, `voice-profile.md`, `book-dna.md`, `chapter-outline.md`, or chapters NOT in rewrite_targets.
**Warning signs:** A `rewrite_targets.yaml` with a malformed `file:` path causing unexpected deletions.

### Pitfall 7: Adversarial Fixture Failing Its Own Assertions
**What goes wrong:** The hand-authored manuscript for `fixtures/tiny-book/adversarial/` is supposed to trigger specific flags. If the author writes prose that happens to NOT contain the expected 6-word span (e.g. uses contractions that split differently), `expected-flags.json` disagrees with runtime output and the test fails for the wrong reason.
**How to avoid:** Author the adversarial fixture by starting from the `expected-flags.json` and working backwards: decide what flags should fire, then write prose that deterministically triggers each one. Run `craft-check.js --novelty` against the fixture locally and iterate until the output matches `expected-flags.json` exactly before committing.
**Warning signs:** Test failures on the adversarial fixture that say "expected 3 flags, got 2" with no code change.

### Pitfall 8: Tier 2 Rules Firing on Legitimate Enricher Patterns
**What goes wrong:** Discussion questions across chapters legitimately share stem phrases ("What does this reveal about..."). If the Tier 2 rule is too strict, every enricher output fails.
**How to avoid:** D-15 specifies ≥8 words for discussion-question stems (more permissive than Tier 1's 6 words). The rule specifically targets stem REPETITION across chapters, not within a chapter. Same-chapter echo is legitimate (summary naturally echoes chapter content) and must be skipped. Start with the rules in D-15 verbatim; tune after first real run.
**Warning signs:** Tier 2 rule fails on the pass-path tiny-book fixture during SC-6.

## Code Examples

### Example 1: Craft-check --novelty JSON output shape
```json
{
  "mode": "novelty",
  "tier": "both",
  "project_dir": "fixtures/tiny-book/run",
  "repeated_spans": [
    {
      "phrase": "i stood at the kitchen counter",
      "tier": 1,
      "occurrences": [
        { "file": "front-matter/foreword.md", "line": 12 },
        { "file": "edited/ch02-final.md", "line": 21 }
      ]
    }
  ],
  "cross_artefact_hits": [
    {
      "type": "vulnerability_beat_reuse",
      "tier": 1,
      "source": "front-matter/foreword.md:L10-L18",
      "duplicate": "edited/ch02-final.md:L21-L28",
      "note": "substantial overlap with front-matter vulnerability beat"
    }
  ],
  "central_image_reuse": [],
  "tier2_hits": [
    {
      "type": "discussion_question_stem",
      "stem": "what does this reveal about the character of god",
      "files": [
        "enrichments/ch01-enrichments.md",
        "enrichments/ch03-enrichments.md"
      ]
    }
  ],
  "flag": true
}
```

### Example 2: Rewrite targets block emitted by Pass 3 §4.4.5
```yaml
rewrite_targets:
  - file: edited/ch02-final.md
    span: "L21-L28"
    reason: "verbatim overlap with front-matter/foreword.md:L12-L18 — rewrite the vulnerability beat using a different sourced detail from the author notes at voice-profile.md:45"
    flagged_by: craft-check
  - file: edited/ch03-final.md
    span: "L40-L47"
    reason: "same central-image vehicle ('reading lamp') dominates ch01 and ch03 — substitute with a distinct vehicle from the motif family (grey seam of dawn per brief.md:37)"
    flagged_by: editor-pass3
```

### Example 3: expected-flags.json shape for adversarial fixture
```json
{
  "tier1": {
    "repeated_spans": [
      { "phrase": "i stood at the kitchen counter", "min_occurrences": 2 },
      { "phrase": "the weight of it on my chest", "min_occurrences": 2 }
    ],
    "vulnerability_beat_reuse": [
      { "source_file": "front-matter/foreword.md", "duplicate_file": "edited/ch02-final.md" }
    ],
    "central_image_reuse": [
      { "vehicle": "lamp", "files": ["edited/ch01-final.md", "edited/ch02-final.md", "edited/ch03-final.md"] }
    ]
  },
  "tier2": {
    "discussion_question_stems": [],
    "prayer_point_repetition": [],
    "vulnerability_bleed_to_summary": [],
    "vehicle_reuse_in_backmatter": []
  },
  "flag": true,
  "novelty_dedup": "fail"
}
```

### Example 4: Test harness assertion pattern (extend test-craft-check.js)
```javascript
test('novelty: adversarial fixture produces expected flags', () => {
  const fixtureDir = path.join(__dirname, '..', 'fixtures', 'tiny-book', 'adversarial');
  const expected = JSON.parse(fs.readFileSync(path.join(fixtureDir, 'expected-flags.json'), 'utf8'));
  const out = execSync(
    `node "${CHECKER}" --novelty --tier both --dna "${fixtureDir}/book-dna.md" "${fixtureDir}"`,
    { encoding: 'utf8' }
  );
  const result = JSON.parse(out);
  assert.equal(result.flag, expected.flag);
  // Each expected repeated span must appear in result.repeated_spans
  for (const exp of expected.tier1.repeated_spans) {
    const match = result.repeated_spans.find(s => s.phrase === exp.phrase);
    assert.ok(match, `missing expected span: ${exp.phrase}`);
    assert.ok(match.occurrences.length >= exp.min_occurrences);
  }
  // ... similar for cross_artefact_hits, central_image_reuse, tier2_hits ...
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Captivation rubric 7 components × 0-14 | 8 components × 0-16 + binary `novelty_dedup` | Phase 13 (D-27, D-29) | Schema v2. All three schemas update atomically. Downstream v1 pins fail loudly. |
| Sample gate reads prose `N/14` via grep | Sample gate reads YAML fields `captivation_total:` + `novelty_dedup:` | Phase 13 (D-05, Codex diff) | No more stale-score pass. The release gate trusts one canonical surface. |
| Editor Pass 3 = cross-chapter consistency only | Pass 3 gains §4.4.5 manuscript-level novelty audit (hybrid script+LLM) | Phase 13 (D-01, D-03) | Cross-artefact dedup for the first time. |
| Refrains were an implicit hope | Refrains are explicit YAML block in Book DNA with `max_uses` and `scope` | Phase 13 (D-06, D-07) | Hard whitelist. Refrains cannot become loopholes. |
| Full re-run required for any dedup failure | `--rewrite-targets` scoped re-run via Mode 7 | Phase 13 (D-11) | 20-chapter books stay affordable when one chapter fails dedup. |
| Fixture "same central image every chapter" | "One motif family, three distinct vehicles" | Phase 13 (D-19, D-20) | The fixture stops being an anti-example. |

**Deprecated / outdated:**
- The `N/14` prose grep in `skills/sample/SKILL.md:77` is replaced by YAML reads. The `N/14` substring in any shipped doc must be eliminated — audit the release.sh whitelist contents for stragglers.
- The legacy 5-component sha256 hash lock in `test-rubric-regression.js` was Phase 10's guardrail. In Phase 13 it becomes an 8-component assertion with schema_version: 2 check. The sha256 hash can be regenerated OR the lock can relax to structural assertions (heading count, range presence). RECOMMEND: relax to structural; sha256 over a schema-frontmatter-prepended file is too brittle.

## Open Questions

1. **Should `test-rubric-regression.js` keep the sha256 lock on the legacy 5 components?**
   - What we know: Phase 10 Plan 10-06 appended Craft Density + Cross-Chapter Craft without changing the legacy 5 bodies. The sha256 hash has held stable.
   - What's unclear: After prepending YAML frontmatter and rewriting body prose for 0-16 scoring, do the legacy component bodies stay byte-identical? Almost certainly NOT — the 0-14 references get updated to 0-16, and the scoring tables need updating.
   - Recommendation: **Regenerate the baseline hash** as part of Phase 13 (document the regeneration in the plan). Add schema_version: 2 as a structural assertion. Keep the hash for drift detection post-v1.1.

2. **Does Pass 3 §4.4.5 emit `rewrite_targets.yaml` as a separate file or embedded in consistency-report.md?**
   - What we know: D-12 says "Editor Pass 3 §4.4.5 emits this block as part of the consistency report". Codex's example shows it inline.
   - What's unclear: Whether Mode 7 reads from the report file (parsing YAML-in-markdown) or from a dedicated `reports/rewrite_targets.yaml`.
   - Recommendation: **Emit in BOTH places.** Inline in consistency-report.md for human review (appears at Stage 4 review gate); separate `reports/rewrite_targets.yaml` for machine consumption by Mode 7. The separate file is a simple write-out of the parsed structure; no drift risk if the editor writes both from the same source object.

3. **Does the LLM judgment pass in §4.4.5 use the chapter-editor subagent or the main editor?**
   - What we know: `skills/editor/SKILL.md §4 Pass 3` runs on the main editor context (manuscript-level), not subagents. Pass 1 uses chapter-editor subagents for 16+ chapter books.
   - What's unclear: On a 20-chapter book, reading all `edited/ch*-final.md` + `front-matter/*.md` at once may blow the main editor's context.
   - Recommendation: **Main editor for Phase 13 scope** (booklets to ~20 chapters). For standard books (12-20 chapters), implement a rolling-window pattern that reads chapter pairs + foreword. Add this as a TODO for Phase 14 / v1.2 — Phase 13's fixture is only 3 chapters so the problem doesn't surface.

4. **Tier 2 rule "theological books only" gating — how is this detected?**
   - What we know: D-15 rule 2 says prayer-point phrasing repetition fires only for theological profiles.
   - What's unclear: The detection signal. Does the editor read `voice-profile.md` for a `Theological Framework` section (Phase 10 convention)?
   - Recommendation: **Yes — same detection as Phase 10 §2.7** (presence of `## Theological Framework` heading in voice-profile.md gates theological-specific checks). Plan's writer instructions should reference §2.7 precedent.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js >=18 | craft-check.js, test harnesses, optional read-rubric.js | ✓ | >= 18 (established contract) | — |
| bash | release.sh, sample skill YAML reads | ✓ | POSIX | — |
| grep / sed / cut | release.sh, sample skill | ✓ | POSIX | — |
| node:test | test-craft-check.js, test-rubric-regression.js | ✓ | Node built-in | — |
| claude plugin validate | release.sh Gate 5 (guarded, skipped if absent) | ✓ (optional) | — | release.sh already guards |

**Missing dependencies with no fallback:** None.
**Missing dependencies with fallback:** None.

Phase 13 is entirely contained in Node stdlib + POSIX bash. Zero new tools.

## Validation Architecture

> nyquist_validation is `true` in `.planning/config.json`. Include this section.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | `node:test` (Node built-in, no deps) |
| Config file | none — Node's built-in test runner is zero-config |
| Quick run command | `node --test scripts/test-craft-check.js scripts/test-rubric-regression.js` |
| Full suite command | `node --test scripts/test-craft-check.js scripts/test-rubric-regression.js && node scripts/test-rubric-regression.js --extended` |
| Phase gate | Full suite green + `/book-crafter:sample` PASS on rewritten fixture + `/book-crafter:sample` PASS produces `captivation ≥ threshold` AND `novelty_dedup pass` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SC-1 | Rubric emits YAML frontmatter with schema_version: 2, 8 components, 0-16 range | unit | `node scripts/test-rubric-regression.js --extended` | ✅ (extend existing) |
| SC-1 | Sample gate reads YAML fields not prose grep | unit | new: `node --test scripts/test-sample-gate.js` (bash grep asserted against a fixture consistency-report.md) | ❌ Wave 0 |
| SC-1 | Three schemas reconciled — editor template + fixture report + rubric all match | integration | `node scripts/test-rubric-regression.js --extended` with new fixture-report assertion | ❌ Wave 0 (extend existing) |
| SC-2 | craft-check.js `--novelty` detects 6+ word cross-artefact spans | unit | `node --test scripts/test-craft-check.js` (new test: `novelty: adversarial fixture flags expected spans`) | ❌ Wave 0 (extend existing) |
| SC-2 | craft-check.js `--novelty` respects refrain whitelist with max_uses | unit | `node --test scripts/test-craft-check.js` (new test: `novelty: refrain at max_uses=1 flags second occurrence only`) | ❌ Wave 0 |
| SC-2 | craft-check.js `--novelty` skips scripture blockquotes | unit | `node --test scripts/test-craft-check.js` (new test: `novelty: scripture blockquote cross-file does not flag`) | ❌ Wave 0 |
| SC-2 | Editor Pass 3 §4.4.5 emits novelty_dedup field and rewrite_targets block | integration | manual verification via sample run (LLM output); static assertion via fixture consistency-report.md shape test | ❌ Wave 0 |
| SC-3 | Rubric has 8 level-3 component headings | unit | `test-rubric-regression.js --extended` (update count 7→8) | ✅ (modify existing) |
| SC-3 | Rubric documents 0-16 range | unit | `test-rubric-regression.js --extended` (update 0-14→0-16) | ✅ (modify existing) |
| SC-3 | novelty_variation component body present and non-empty | unit | `test-rubric-regression.js --extended` (new assertion) | ✅ (modify existing) |
| SC-4 | Writer SKILL.md contains anti-loop section with five contract rules | unit | `node --test scripts/test-writer-contract.js` (new: grep-based existence check) OR simpler: a shell assertion in release.sh / sample pre-flight | ❌ Wave 0 |
| SC-5 | Tiny-book brief.md rewritten — motif family + 3 distinct vehicles + refrain at max_uses 1 | unit | static file assertion (`grep` for each vehicle string) | can live in test-craft-check.js or sample skill pre-flight |
| SC-6 | Fresh sample run against rewritten fixture passes canonical gate | integration | manual: `/book-crafter:sample` → read PASS line with `captivation N/16` + `novelty_dedup pass` | manual-only — end-to-end LLM pipeline |
| SC-6 | SC-6 run covers Tier 1 AND Tier 2 (enricher exercised end-to-end) | integration | manual: verify `fixtures/tiny-book/run/enrichments/` populated AFTER sample run | manual-only |
| Fail-path | Adversarial fixture triggers expected flags deterministically | unit | `node --test scripts/test-craft-check.js` (new: assert `expected-flags.json` matches actual output) | ❌ Wave 0 |
| Fail-path | Adversarial enricher fixture triggers Tier 2 rules | unit | `node --test scripts/test-craft-check.js` (new: Tier 2 specific adversarial fixture) | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `node --test scripts/test-craft-check.js scripts/test-rubric-regression.js` (fast — under 2 seconds)
- **Per wave merge:** Full unit suite + `node scripts/test-rubric-regression.js --extended`
- **Phase gate:** Full unit suite green + manual `/book-crafter:sample` run against rewritten fixture producing PASS line + Tier 2 validated by enricher artefacts present in run dir + `test-craft-check.js` adversarial fixture green (fail-path proof)

### Wave 0 Gaps
- [ ] `scripts/test-craft-check.js` — extend with novelty tests (adversarial fixture, refrain whitelist, scripture skip, Tier 2 adversarial)
- [ ] `scripts/test-rubric-regression.js` — extend ceiling 14→16, 7→8 components, schema_version: 2 structural assertion, regenerate or relax sha256 lock
- [ ] `scripts/test-sample-gate.js` — NEW: assert bash grep reads return correct integer/string from a fixture consistency-report.md (can alternatively be a test file inside test-craft-check.js)
- [ ] `fixtures/tiny-book/adversarial/` — NEW: hand-authored manuscript with known duplications + `expected-flags.json` + pre-populated `book-dna.md` refrain block
- [ ] `fixtures/tiny-book/adversarial-enricher/` — NEW: fake enricher outputs with known Tier 2 duplications + `expected-flags.json`
- [ ] Framework install — none (`node:test` is built-in)
- [ ] `scripts/release.sh` — extend whitelist EXCLUSIONS to cover both adversarial fixture directories (they must NEVER ship in the release zip)

**Manual-only checks (no automation possible):**
- SC-6 end-to-end sample run is inherently LLM-driven and therefore not deterministic. The automated portion is: (a) bash grep finds `SAMPLE PASS` in output, (b) grep finds `novelty_dedup pass` in the report, (c) grep confirms zero entries under `novelty_dedup_flags:`. Whether the PROSE actually reads as non-repetitive is a human judgment check, captured in the phase's 12-style verification gate.

## Project Constraints (from CLAUDE.md)

- **Plugin format:** `.claude-plugin/plugin.json`, `skills/*/SKILL.md`, `references/*.md` — all Phase 13 additions must live under these directory patterns.
- **No CLI-only deps:** Phase 13 runtime logic must work inside the plugin sandbox (Node stdlib + POSIX bash).
- **No npm runtime deps:** Explicit constraint. No YAML libs, no similarity libs, no `jq`.
- **GSD workflow enforcement:** All edits must go through a GSD command (phase execution). This research phase is itself `/gsd:research-phase`.
- **Cross-surface compatibility:** All code must work under CLI, Desktop, Web, IDE — relevant because `${CLAUDE_PLUGIN_ROOT}` is the only resolvable plugin root variable across surfaces. All file references in new code MUST use `${CLAUDE_PLUGIN_ROOT}` not hardcoded paths.
- **Voice consistency is the hardest technical challenge:** Phase 13 reinforces this by making dedup enforceable. Anti-loop clause (D-30) sits inside the writer that every chapter-writer subagent reads.
- **Theological accuracy:** Refrain whitelist must not accidentally whitelist scripture quotes — scripture skipping is a separate mechanism per Pitfall 1.

## Sources

### Primary (HIGH confidence)
- `.planning/phases/13-repetition-and-novelty-enforcement/13-CONTEXT.md` — 30 locked decisions, verbatim
- `.planning/phases/11-distribution-packaging/11-REVIEWS.md` — Codex + Gemini cross-AI consensus (the fix list)
- `.planning/phases/11-distribution-packaging/11-CONTEXT.md` — inherited constraints (D-05 spiritual, D-06 booklet, D-25 bash-only YAML read, D-27 whitelist)
- `.planning/phases/10-writing-quality-v2/10-CONTEXT.md` — `--fresh` Mode 6 precedent, layering pattern
- `.planning/ROADMAP.md §"Phase 13"` — 6 success criteria verbatim
- `.planning/REQUIREMENTS.md` — v1.1 CRAFT rules, existing traceability
- `.planning/STATE.md` — Phase 11 in-progress state, decision history
- `references/captivation-rubric.md` — current 0-14 shape (to be extended)
- `skills/editor/SKILL.md §2.0, §2.9-§2.12, §3.7-§3.9, §4 Pass 3, §4.5, §4.6` — layering pattern precedent
- `skills/writer/SKILL.md §64, §174, §184` — anti-loop landing site
- `skills/outliner/SKILL.md §103, §119, §125` — refrain gate insertion point
- `skills/orchestrator/SKILL.md §6 Mode 6, §7` — phrase-triggered mode pattern for Mode 7
- `skills/sample/SKILL.md §77` (prose grep to be replaced)
- `scripts/craft-check.js` — existing shape, JSON output contract
- `scripts/test-craft-check.js` — existing assertion harness pattern
- `scripts/test-rubric-regression.js` — existing hash-lock pattern + `--extended` precedent
- `scripts/release.sh` — existing whitelist + grep pattern (D-25 bash-only)
- `fixtures/tiny-book/brief.md` — the specific file to rewrite per D-19/D-20
- `fixtures/tiny-book/run/` directory listing (confirms enricher is already exercised)
- `.planning/config.json` — `workflow.nyquist_validation: true`

### Secondary (MEDIUM confidence)
- None required — every claim above verifies against an in-repo file.

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new deps, all existing patterns.
- Architecture: HIGH — every integration point is an extension of an existing pattern (layering, phrase-triggered mode, frontmatter, bash grep).
- Pitfalls: HIGH — all derived from concrete repo state; nothing speculative.
- Handwritten YAML parser: MEDIUM — works for the flat schema but brittle if schema grows.
- LLM judgment layer effectiveness in Pass 3 §4.4.5: MEDIUM — depends on prompt quality. Deterministic layer is HIGH; LLM layer is the MEDIUM component.

**Research date:** 2026-04-15
**Valid until:** Phase 13 plan completion (no external deps to age-out)
