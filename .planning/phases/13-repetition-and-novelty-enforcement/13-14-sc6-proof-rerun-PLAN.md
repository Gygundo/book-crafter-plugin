---
phase: 13-repetition-and-novelty-enforcement
plan: 14
type: execute
wave: 6
depends_on: [13-12, 13-13]
files_modified:
  - .planning/phases/13-repetition-and-novelty-enforcement/13-11-proof-run-log.md
autonomous: false
requirements: [SC-6]
gap_closure: true
must_haves:
  truths:
    - "A fresh /book-crafter:sample run against the rewritten fixture emits SAMPLE PASS with captivation N/16 (threshold 10) and novelty_dedup pass"
    - "craft-check.js --novelty --tier both against the regenerated run directory reports zero flags across Tier 1 AND Tier 2"
    - "The phrase 'one small lamp refusing the whole dark' appears at most ONCE across all files under fixtures/tiny-book/run/front-matter/ and fixtures/tiny-book/run/edited/"
    - "The enricher stage was exercised end-to-end (fixtures/tiny-book/run/enrichments/ is populated) so Tier 2 is validated on the pass path"
    - "The post-enricher novelty gate (Stage 4.6) ran and passed — the foreword was checked against all chapters"
    - "A human read of the regenerated foreword + ch01 + ch02 + ch03 confirms no loop feeling"
    - "Proof run output is captured in 13-11-proof-run-log.md (overwriting the failed run log)"
  artifacts:
    - path: ".planning/phases/13-repetition-and-novelty-enforcement/13-11-proof-run-log.md"
      provides: "Log of the successful SC-6 proof run"
  key_links:
    - from: "/book-crafter:sample invocation"
      to: "fixtures/tiny-book/run/reports/consistency-report.md ## Captivation Score block"
      via: "sample gate reads schema v2 YAML"
      pattern: "captivation_total|novelty_dedup"
---

<objective>
Re-run the SC-6 proof after gap closure plans 13-12 (enricher Anti-Loop Clause) and 13-13 (post-enricher novelty gate) have landed. This re-executes the exact same test as Plan 13-11 but with the two fixes in place. The enricher should now generate a foreword with distinct phrasing (no verbatim copies from chapters), and the post-enricher novelty gate (Stage 4.6) should catch any remaining overlaps before the .docx is emitted.

Purpose: SC-6 is the phase gate. The first run (Plan 13-11) surfaced 4 repeated_spans. This re-run must produce zero. Without a clean proof run, Phase 13 is not complete.

Output: Updated 13-11-proof-run-log.md with the successful re-run results.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/13-repetition-and-novelty-enforcement/13-CONTEXT.md
@.planning/phases/13-repetition-and-novelty-enforcement/13-VALIDATION.md
@.planning/phases/13-repetition-and-novelty-enforcement/13-11-proof-run-log.md
@fixtures/tiny-book/brief.md
@fixtures/tiny-book/run/book-dna.md
@skills/sample/SKILL.md
@skills/orchestrator/SKILL.md (post gap closure — verify Stage 4.6 exists)
@skills/enricher/SKILL.md (post gap closure — verify Anti-Loop Clause exists)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Execute fresh /book-crafter:sample and capture proof run log</name>
  <files>.planning/phases/13-repetition-and-novelty-enforcement/13-11-proof-run-log.md</files>
  <read_first>
    - skills/orchestrator/SKILL.md (verify Stage 4.6 post-enricher novelty gate is present — grep for "Stage 4.6")
    - skills/enricher/SKILL.md (verify Anti-Loop Clause is present — grep for "Anti-Loop Clause")
    - skills/sample/SKILL.md (the skill that runs the pipeline)
    - fixtures/tiny-book/brief.md (the rewritten fixture from Plan 13-10)
    - fixtures/tiny-book/run/book-dna.md (confirm refrains block and distinct vehicles)
    - .planning/phases/13-repetition-and-novelty-enforcement/13-11-proof-run-log.md (the FAILED run log — will be overwritten)
    - .planning/phases/13-repetition-and-novelty-enforcement/13-VALIDATION.md (SC-6 gate criteria)
    - .planning/phases/13-repetition-and-novelty-enforcement/13-CONTEXT.md (D-05 expected PASS line format)
  </read_first>
  <action>
    This task is IDENTICAL to Plan 13-11 Task 1, re-executed after gap closure. Follow the exact same 8-step procedure from Plan 13-11 Task 1:

    **Step 0 (NEW — gap closure pre-check).** Before anything else, verify the two gap closure fixes are in place:

    a) `grep -q 'Anti-Loop Clause' skills/enricher/SKILL.md` — must return 0. If not, HALT: Plan 13-12 has not been executed.

    b) `grep -q 'Stage 4.6' skills/orchestrator/SKILL.md` — must return 0. If not, HALT: Plan 13-13 has not been executed.

    **Step 1. Pre-flight check.** Run all Wave 0 tests:

    ```bash
    node scripts/test-craft-check.js
    node scripts/test-rubric-regression.js
    node scripts/test-rubric-regression.js --extended
    ```

    All three must exit 0.

    **Step 2. Invoke the pipeline.** Use `/book-crafter:orchestrator` with a "start fresh on fixtures/tiny-book" instruction (or `/book-crafter:sample` if available). Mode 6 Fresh Run wipes artefacts under run/ except preserved files (brief.md, voice-profile.md, book-dna.md with refrains block).

    The orchestrator runs Stages 1 through 5, including the NEW Stage 4.6 post-enricher novelty gate. Watch for the Stage 4.6 output line:
    - "Stage 4.6 post-enricher novelty gate: PASS" — continue
    - "Stage 4.6 post-enricher novelty gate: FAIL" — the gap closure did not fully resolve the issue; halt and report

    **Step 3. Capture the PASS/FAIL line.** Expected: `SAMPLE PASS -- .docx at fixtures/tiny-book/run/final/<name>.docx, captivation N/16 (threshold 10), novelty_dedup pass`

    **Step 4. Run craft-check.js --novelty independently:**

    ```bash
    node scripts/craft-check.js --novelty --tier both --dna fixtures/tiny-book/run/book-dna.md fixtures/tiny-book/run/
    ```

    Expected: exit 0, flag:false, novelty_dedup:"pass", all arrays empty.

    **Step 5. SC-5 refrain cap assertion:**

    ```bash
    count=$(grep -r -c 'one small lamp refusing the whole dark' fixtures/tiny-book/run/front-matter/ fixtures/tiny-book/run/edited/ 2>/dev/null | awk -F: '{s+=$NF} END{print s+0}')
    test "$count" -le 1
    ```

    **Step 6. Enricher stage verification:**

    ```bash
    test -d fixtures/tiny-book/run/enrichments/ && test "$(ls fixtures/tiny-book/run/enrichments/*.md 2>/dev/null | wc -l)" -ge 1
    ```

    **Step 7. Write the proof run log.** OVERWRITE `.planning/phases/13-repetition-and-novelty-enforcement/13-11-proof-run-log.md` with the new results. Use the same section structure as the original log but with updated data. Add a header note:

    ```
    # Phase 13 SC-6 Proof Run Log (Re-run after Gap Closure)

    Run date: [iso date]
    Plan: 13-14 (re-run after gap closure plans 13-12 and 13-13)
    Previous run: 13-11 (FAILED — 4 repeated_spans, foreword-to-ch01 bleed)
    Gap closure: 13-12 (enricher Anti-Loop Clause) + 13-13 (post-enricher novelty gate Stage 4.6)
    ```

    Include all sections: pre-flight tests, gap closure pre-check, sample invocation, craft-check verification, SC-5 refrain cap, Tier 2 proof, inspected artefacts, status.

    **Step 8. If any assertion failed, halt.** Do NOT proceed to Task 2. Report the failure for further gap analysis. If all assertions pass, commit the log and proceed.
  </action>
  <verify>
    <automated>test -f .planning/phases/13-repetition-and-novelty-enforcement/13-11-proof-run-log.md && grep -q 'SAMPLE PASS' .planning/phases/13-repetition-and-novelty-enforcement/13-11-proof-run-log.md && grep -q 'novelty_dedup.*pass' .planning/phases/13-repetition-and-novelty-enforcement/13-11-proof-run-log.md && grep -q 'Gap Closure' .planning/phases/13-repetition-and-novelty-enforcement/13-11-proof-run-log.md</automated>
  </verify>
  <acceptance_criteria>
    - Gap closure pre-check passes: enricher has Anti-Loop Clause AND orchestrator has Stage 4.6
    - All three pre-flight test commands exit 0
    - The pipeline completes end-to-end including Stage 4.6 (grep -q 'Stage 4.6' in proof run log)
    - /book-crafter:sample or orchestrator emits SAMPLE PASS line matching `SAMPLE PASS.*captivation [0-9]+/16.*novelty_dedup pass`
    - craft-check.js --novelty --tier both exits 0 with flag:false (ZERO repeated_spans, not 4)
    - Refrain count is <= 1
    - Enrichments directory has >= 1 .md file
    - 13-11-proof-run-log.md is overwritten with the successful re-run data
    - The log contains "Re-run after Gap Closure" header (grep -q 'Gap Closure')
  </acceptance_criteria>
  <done>
    All 7 automated SC-6 assertions pass on the re-run. The enricher Anti-Loop Clause prevented foreword-to-chapter verbatim bleed. The post-enricher novelty gate (Stage 4.6) ran and passed. Proof run log committed. Ready for human verification.
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 2: Human verification — read the regenerated output and confirm no loop feeling</name>
  <read_first>
    - .planning/phases/13-repetition-and-novelty-enforcement/13-11-proof-run-log.md (from Task 1 — the re-run log)
    - fixtures/tiny-book/run/front-matter/foreword.md (the regenerated foreword — should have ZERO verbatim copies from chapters)
    - fixtures/tiny-book/run/edited/ch01-final.md
    - fixtures/tiny-book/run/edited/ch02-final.md
    - fixtures/tiny-book/run/edited/ch03-final.md
    - fixtures/tiny-book/run/reports/consistency-report.md (editor verdict)
    - .planning/phases/13-repetition-and-novelty-enforcement/13-VALIDATION.md (Manual-Only Verifications row 1)
  </read_first>
  <what-built>
    The full Phase 13 rule set has been applied end-to-end, now with two additional fixes:

    1. **Enricher Anti-Loop Clause (Plan 13-12):** The enricher's foreword generation branch now has explicit rules prohibiting verbatim copying from chapters. The original proof run had 3 foreword-to-ch01 bleed spans; this fix prevents them at the source.

    2. **Post-enricher novelty gate (Plan 13-13):** Stage 4.6 in the orchestrator runs craft-check.js --novelty against the full corpus AFTER the enricher generates the foreword. This catches any remaining overlaps that the enricher's self-policing missed.

    The rewritten fixture (motif family "light in the night", 3 distinct vehicles, refrain at max_uses:1) produced a fresh 3-chapter booklet. All automated gates pass: captivation_total >= 10, novelty_dedup: pass, zero script flags, enricher stage exercised, refrain phrase occurs at most once, Stage 4.6 passed.

    The remaining question is whether the output READS as non-repetitive to a human.
  </what-built>
  <how-to-verify>
    1. Read .planning/phases/13-repetition-and-novelty-enforcement/13-11-proof-run-log.md to confirm all automated gates passed (especially the NEW Stage 4.6 gate and the ZERO repeated_spans).

    2. Read fixtures/tiny-book/run/front-matter/foreword.md in full. Specifically check:
       - Does the foreword contain ANY sentences that feel like they were copied from ch01?
       - Compare with the FAILED run where "he has been on the wall since the day you closed your eyes" appeared in both foreword and ch01 — is this kind of bleed gone?

    3. Read ch01, ch02, ch03 in full. For each chapter, note:
       - The central image vehicle (ch1: phone glow/bedside lamp, ch2: yellow pool/kitchen counter, ch3: grey seam of dawn)
       - The vulnerability beat (should be unique per chapter, not shared with foreword)
       - No verbatim overlap with any other artefact

    4. Confirm by direct reading:
       (a) The foreword frames the book's PURPOSE without quoting chapter prose.
       (b) The three chapters thread the motif family but NONE feels like it describes the same scene.
       (c) No two artefacts contain the same vulnerability scene even paraphrased.
       (d) The refrain phrase appears at most once across all four artefacts.
       (e) The book does NOT feel like a loop.

    5. If (a)-(e) all hold, type `approved` to close Phase 13.

    6. If the output still feels repetitive despite zero automated flags, type `revise: <reason>` for further gap analysis.
  </how-to-verify>
  <resume-signal>Type "approved" to mark Phase 13 complete, or "revise: [reason]" to file further gap closure.</resume-signal>
</task>

</tasks>

<verification>
After Task 1 passes all automated assertions AND Task 2's human checkpoint returns "approved", Phase 13 is complete. All six success criteria SC-1..SC-6 are verified end-to-end.
</verification>

<success_criteria>
- Gap closure pre-checks confirm Plans 13-12 and 13-13 are in place
- All pre-flight tests green
- Pipeline completes including Stage 4.6 post-enricher novelty gate
- /book-crafter:sample emits SAMPLE PASS with novelty_dedup pass
- craft-check.js --novelty direct run returns flag:false with ZERO repeated_spans (down from 4 in the failed run)
- Refrain phrase appears at most once
- Enricher stage exercised (Tier 2 validated)
- Human read confirms no loop feeling
- Proof run log committed
- Phase 13 closed
</success_criteria>

<output>
After completion, create `.planning/phases/13-repetition-and-novelty-enforcement/13-14-SUMMARY.md` and `.planning/phases/13-repetition-and-novelty-enforcement/13-SUMMARY.md` (the phase-level summary). The phase summary should roll up all 14 plan summaries and state explicitly: all 6 SCs covered, gap closure plans 13-12/13-13 landed, proof re-run green, human verification passed, Phase 13 closed.
</output>
