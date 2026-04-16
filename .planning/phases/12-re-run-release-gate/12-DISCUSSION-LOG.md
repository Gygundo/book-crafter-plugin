# Phase 12: Re-run + Release Gate - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-16
**Phase:** 12-re-run-release-gate
**Areas discussed:** Baseline source, Re-run scope vs Phase 13, External blind review protocol, Fresh-install smoke-test logistics

---

## Baseline Source

### Question 1: Where is the original Eternally Secure book project?

| Option | Description | Selected |
|--------|-------------|----------|
| It was never run | The Eternally Secure book was referenced in research/requirements but never actually generated through the pipeline. | |
| It exists elsewhere | The Eternally Secure output exists outside this repo (another directory, a .docx file, an earlier project). | |
| Use the tiny-book fixture instead | Skip the Eternally Secure re-run entirely. Use the tiny-book fixture as the before/after comparison target. | |

**User's choice:** Other — provided the exact path: `/Users/David/Documents/Books/Eternally Secure/output/Eternally Secure.docx`
**Notes:** Full project exists with edited chapters (ch01 through ch04+), front-matter, enrichments, reports, sources, sources-adapted (3 files), and final .docx.

### Question 2: Should the baseline freeze just Ch1 or the full book?

| Option | Description | Selected |
|--------|-------------|----------|
| Ch1 only | Freeze edited/ch01-final.md as the baseline. Matches GATE-01/02/03 naming. | ✓ |
| Full book | Freeze all chapters. More comprehensive but re-run takes longer. | |
| Ch1 + one other chapter | Two data points for the comparison. | |

**User's choice:** Ch1 only (Recommended)

### Question 3: Re-run in place or copy into repo?

| Option | Description | Selected |
|--------|-------------|----------|
| Re-run in place | Run pipeline with --fresh against the external location. Only evidence files land in the repo. | ✓ |
| Copy into repo first | Copy the Eternally Secure project into the repo before re-running. | |

**User's choice:** Re-run in place (Recommended)

---

## Re-run Scope vs Phase 13

### Question 1: Should the seven-gap comparison expand beyond the original 7 gaps?

| Option | Description | Selected |
|--------|-------------|----------|
| Keep 7 gaps, note novelty | Comparison stays focused on 7 CRAFT gaps. Brief novelty section if relevant. | |
| Expand to 8 gaps | Add an 8th gap row for Repetition / Novelty. | |
| You decide | Claude's discretion based on what the evidence shows. | ✓ |

**User's choice:** You decide
**Notes:** Claude will assess after re-run and include an 8th gap row if the novelty enforcement shows meaningful before/after difference.

---

## External Blind Review Protocol

### Question 1: How should the third-party fresh-Claude blind review work?

| Option | Description | Selected |
|--------|-------------|----------|
| New Claude Code session | Fresh Claude Code session, paste both versions as A/B, ask for ranking. | ✓ |
| claude.ai chat | Fresh claude.ai conversation, paste both versions, ask for ranking. | |
| Both + a human reviewer | Run both surfaces AND ask a human for a blind ranking. | |

**User's choice:** New Claude Code session

### Question 2: General quality ranking or targeted dimensions?

| Option | Description | Selected |
|--------|-------------|----------|
| General quality ranking | Simple "which is better writing?" prompt. Unbiased. | |
| Targeted dimensions | Rank on specific dimensions without naming CRAFT rules. | |
| You decide | Claude's discretion on prompt design. | ✓ |

**User's choice:** You decide

---

## Fresh-Install Smoke-Test Logistics

### Question 1: Is the GitHub repo already created?

| Option | Description | Selected |
|--------|-------------|----------|
| Not created yet | Repo doesn't exist on GitHub. Phase 12 includes creation. | ✓ |
| Created but not pushed | Repo exists but code hasn't been pushed. | |
| Already live | Repo exists with current code pushed. | |

**User's choice:** Not created yet

### Question 2: Where to run the smoke test?

| Option | Description | Selected |
|--------|-------------|----------|
| Same Mac, clean state | Remove dev plugin, clear cache, install from marketplace, test, reinstall dev. | ✓ |
| Mac Mini server | Use the Mac Mini as a clean install target. | |
| You decide | Claude's discretion. | |

**User's choice:** Same Mac, clean state

### Question 3: When should repo creation + push happen?

| Option | Description | Selected |
|--------|-------------|----------|
| Late, after evidence | Gather all evidence first, push, then smoke-test. One push, one test. | ✓ |
| Early, before re-run | Create repo and push current code first. Verify install path works early. | |

**User's choice:** Late, after evidence (Recommended)

---

## Claude's Discretion

- Seven-gap comparison may expand to 8 gaps based on evidence (D-07)
- External review prompt design (D-10)
- Smoke-test evidence format (D-17)
- README capability language wording (D-19)

## Deferred Ideas

None — discussion stayed within phase scope.
