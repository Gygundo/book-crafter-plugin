---
name: sample
description: "Run a full Book Crafter pipeline end-to-end on the built-in tiny-book fixture and print a one-line PASS/FAIL summary with captivation score. Use when the user says 'run sample', 'try book crafter', 'demo', 'sample book', 'smoke test', or wants a quick end-to-end verification after install."
allowed-tools: Read, Write, Bash, Grep, Glob, Agent
---

# Book Crafter Sample

One-command end-to-end smoke-test on the built-in tiny-book fixture. This skill is the single command a fresh recipient (or future `release.sh` gate) runs to prove that the `book-crafter` plugin is installed correctly and that the full pipeline still produces a captivating chapter.

The sample skill is intentionally non-interactive: the fixture is pre-approved by virtue of shipping in the repo, so every approval gate is bypassed and the run either succeeds or fails without prompting.

## §1. Locate the Fixture

The tiny-book fixture ships inside the plugin directory. Resolve its paths via `${CLAUDE_PLUGIN_ROOT}`:

- Brief: `${CLAUDE_PLUGIN_ROOT}/fixtures/tiny-book/brief.md`
- Threshold: `${CLAUDE_PLUGIN_ROOT}/fixtures/tiny-book/expected-captivation-score.txt`
- Run directory (orchestrator project root): `${CLAUDE_PLUGIN_ROOT}/fixtures/tiny-book/run/`

Both fixture files MUST exist before continuing:

```bash
test -f "${CLAUDE_PLUGIN_ROOT}/fixtures/tiny-book/brief.md" || {
  echo "SAMPLE FAIL — fixture brief missing (see ${CLAUDE_PLUGIN_ROOT}/fixtures/tiny-book/brief.md)"
  exit 1
}
test -f "${CLAUDE_PLUGIN_ROOT}/fixtures/tiny-book/expected-captivation-score.txt" || {
  echo "SAMPLE FAIL — fixture threshold missing (see ${CLAUDE_PLUGIN_ROOT}/fixtures/tiny-book/expected-captivation-score.txt)"
  exit 1
}
```

If either file is absent, emit the corresponding `SAMPLE FAIL — fixture ... missing at <path>` line and exit `1`. Do not attempt recovery — a missing fixture means the plugin install is broken.

## §2. Detect Re-Invocation (Filesystem-as-State)

Check whether the run directory already exists:

```bash
if [ -d "${CLAUDE_PLUGIN_ROOT}/fixtures/tiny-book/run" ]; then
  RERUN=1
else
  RERUN=0
fi
```

- **`RERUN=0` (first run, directory absent).** Invoke the orchestrator in normal mode. Do **NOT** include the phrase "start fresh" anywhere in the invocation prompt. The orchestrator will create `fixtures/tiny-book/run/` and proceed normally.
- **`RERUN=1` (re-invocation, directory present).** Invoke the orchestrator with the phrase **"start fresh"** included **literally** in the invocation prompt. The orchestrator detects Mode 6 (Fresh Run) by phrase match — there is no CLI flag — and will wipe prior artefacts under `fixtures/tiny-book/run/` before re-running.

This contract is non-negotiable. First run = normal invocation. Re-run = phrase-triggered Fresh Run. The sample skill never auto-enables fresh on first run.

## §3. Invoke the Orchestrator Programmatically

Use the `Agent` tool to spawn the `book-crafter:orchestrator` skill. The invocation prompt MUST include all of the following parameters in plain language so the orchestrator can parse them without follow-up questions:

- **Project path:** `${CLAUDE_PLUGIN_ROOT}/fixtures/tiny-book/run/` (this overrides the orchestrator's default `~/Documents/Books/` location — D-10)
- **Brief:** the full contents of `${CLAUDE_PLUGIN_ROOT}/fixtures/tiny-book/brief.md` (read it first, then paste into the prompt)
- **Voice profile:** `spiritual-default`
- **Size tier:** `booklet`
- **Execution mode:** **Full Pipeline, no review gates.** State this verbatim. The fixture is pre-approved (D-09) so every approval gate (outline approval, edit review, etc.) must be bypassed.
- **Final .docx output path:** Instruct the formatter to write the final `.docx` to `${CLAUDE_PLUGIN_ROOT}/fixtures/tiny-book/run/final/` explicitly. Use plain language such as: *"Write the final .docx to `${CLAUDE_PLUGIN_ROOT}/fixtures/tiny-book/run/final/` — do not use the default `~/Documents/Books/` location."* The PASS line path in §5 is locked to `fixtures/tiny-book/run/final/<name>.docx` per D-12, so the sample skill owns this override.
- **Fresh-run trigger:** include the phrase **"start fresh"** in the prompt **only if** §2 set `RERUN=1`.

Wait for the pipeline to complete (outline → research → write → edit → enrich → format). Do not return control until the orchestrator has either finished or errored.

After completion, verify the final `.docx` landed where expected:

```bash
DOCX=$(ls -1 "${CLAUDE_PLUGIN_ROOT}/fixtures/tiny-book/run/final/"*.docx 2>/dev/null | head -1)
if [ -z "$DOCX" ]; then
  echo "SAMPLE FAIL — .docx missing at fixtures/tiny-book/run/final/ (see fixtures/tiny-book/run/reports/consistency-report.md)"
  exit 1
fi
```

## §4. Compute the Captivation Score

The editor emits `reports/consistency-report.md` during Phase 4 with the captivation total in `N/14` format. Read it first:

```bash
REPORT="${CLAUDE_PLUGIN_ROOT}/fixtures/tiny-book/run/reports/consistency-report.md"
if [ ! -f "$REPORT" ]; then
  echo "SAMPLE FAIL — consistency-report.md missing (see ${REPORT})"
  exit 1
fi
N=$(grep -Eo 'Captivation[^0-9]*([0-9]+)/14' "$REPORT" | grep -Eo '[0-9]+/14' | head -1 | cut -d/ -f1)
```

If the report exists but the total line cannot be parsed, **fall back** to running `craft-check.js` against the first edited chapter:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/craft-check.js" "${CLAUDE_PLUGIN_ROOT}/fixtures/tiny-book/run/edited/ch01-final.md"
```

`craft-check.js` emits JSON. Note that craft-check only covers CRAFT-01/02/05/07/15 — it is **not** a substitute for the full 14-point captivation rubric. The primary source of truth is the consistency-report total; craft-check is only a degraded fallback so the sample skill can still emit a meaningful PASS/FAIL line if the report is malformed.

## §5. Compare to Threshold and Emit PASS/FAIL

Read the threshold integer from the fixture:

```bash
M=$(cat "${CLAUDE_PLUGIN_ROOT}/fixtures/tiny-book/expected-captivation-score.txt" | tr -d '[:space:]')
```

**PASS condition (both MUST hold):**

1. The final `.docx` exists in `fixtures/tiny-book/run/final/`
2. Captivation total `N >= M`

**PASS output (exact format — machine-greppable per D-12):**

```
SAMPLE PASS — .docx at fixtures/tiny-book/run/final/<name>.docx, captivation N/14 (threshold M)
```

Substitute `<name>` with the actual filename, and `N`/`M` with the real integers.

**FAIL output (exact format):**

```
SAMPLE FAIL — <specific reason> (see fixtures/tiny-book/run/reports/consistency-report.md)
```

Pick the **first** matching failure reason from this ordered list:

1. `fixture brief missing`
2. `fixture threshold missing`
3. `orchestrator did not complete (no .docx produced)`
4. `.docx missing at fixtures/tiny-book/run/final/`
5. `consistency-report.md missing`
6. `captivation N below threshold M` (substitute the real integers for `N` and `M`)

Emit exactly **one** PASS or FAIL line per invocation (D-12). No additional summary lines, no decoration, no banners.

## §6. Exit Code (D-13)

- **PASS → `exit 0`**
- **FAIL → `exit 1`**

This contract enables future `release.sh` integration as a release gate (out of scope for Phase 11, but the contract must be in place now so Phase 12 can wire it).

## Non-Negotiables

- **No interactive gates.** The fixture is pre-approved (D-09). Every approval gate the orchestrator would normally surface MUST be bypassed via the "Full Pipeline, no review gates" directive in §3.
- **No auto-fresh on first run.** First run = normal invocation. Re-run = phrase-triggered Fresh Run (D-11). Never inject "start fresh" on the first run.
- **No output outside the run directory.** All artefacts MUST land under `${CLAUDE_PLUGIN_ROOT}/fixtures/tiny-book/run/`. The orchestrator's default `~/Documents/Books/` path is overridden by the explicit project path passed in §3 (D-10).
- **Release identity.** All internal references use `book-crafter:sample` and `book-crafter:orchestrator`. The dev-time on-disk identifier must never appear anywhere in this skill — recipients only ever see the release name `book-crafter` (D-22).
- **Single PASS/FAIL line.** Emit exactly one summary line per invocation. The format is locked for grep-based release gating.
