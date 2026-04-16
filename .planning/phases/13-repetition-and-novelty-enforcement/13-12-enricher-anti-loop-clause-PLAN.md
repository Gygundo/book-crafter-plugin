---
phase: 13-repetition-and-novelty-enforcement
plan: 12
type: execute
wave: 5
depends_on: [13-06, 13-07]
files_modified:
  - skills/enricher/SKILL.md
autonomous: true
requirements: [SC-2, SC-4]
gap_closure: true
must_haves:
  truths:
    - "The enricher skill foreword generation branch has an Anti-Loop Clause that prohibits copying 6+ word verbatim spans from any chapter it reads for context"
    - "The enricher's Anti-Loop Clause mirrors the writer's Anti-Loop Clause constraints: no verbatim phrase reuse, spent vulnerability seeds unused, distinct image vehicles"
  artifacts:
    - path: "skills/enricher/SKILL.md"
      provides: "Anti-Loop Clause in foreword generation section"
      contains: "Anti-Loop Clause"
  key_links:
    - from: "skills/enricher/SKILL.md §6 Foreword"
      to: "skills/writer/SKILL.md Anti-Loop Clause"
      via: "mirrored contract"
      pattern: "No 6.* word.*reuse"
---

<objective>
Add an Anti-Loop Clause to the enricher skill's foreword generation branch (Section 6). The SC-6 proof run revealed that the enricher copies verbatim sentences from ch01 into the foreword — three 6+ word spans bled through. The writer has an Anti-Loop Clause (Plan 13-07, D-30) but the enricher was never given one. This plan closes that gap.

Purpose: The enricher reads all edited chapters to generate the foreword. Without an explicit anti-copy clause, it treats chapter prose as quotable material and copies sentences verbatim. This produces the exact foreword-to-ch01 duplication that craft-check.js --novelty detects.

Output: Updated skills/enricher/SKILL.md with an Anti-Loop Clause in the foreword section.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/13-repetition-and-novelty-enforcement/13-CONTEXT.md
@.planning/phases/13-repetition-and-novelty-enforcement/13-11-proof-run-log.md
@skills/enricher/SKILL.md
@skills/writer/SKILL.md (Anti-Loop Clause section — the template to mirror)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add Anti-Loop Clause to enricher foreword generation</name>
  <files>skills/enricher/SKILL.md</files>
  <read_first>
    - skills/enricher/SKILL.md (current full content — heavily modified in Phase 13 plans 13-06 through 13-09)
    - skills/writer/SKILL.md (read the "## Anti-Loop Clause (Phase 13, D-30)" section — lines ~196-226 — as the template to mirror)
    - .planning/phases/13-repetition-and-novelty-enforcement/13-11-proof-run-log.md (the proof run failure — specifically the 3 foreword-to-ch01 repeated spans)
  </read_first>
  <action>
    Insert a new section "## 6.1 Anti-Loop Clause (Foreword)" immediately AFTER Section 6's quality rules (after the line "- Match the book's voice profile for tone and vocabulary") and BEFORE the "Output format for foreword" subsection.

    The section must contain these exact constraints (adapted from the writer's Anti-Loop Clause for the enricher's foreword context):

    ---

    ## 6.1 Anti-Loop Clause (Foreword)

    > The SC-6 proof run revealed that the enricher copies verbatim sentences from edited chapters into the foreword. Three 6+ word spans from ch01 bled into front-matter/foreword.md, causing craft-check.js --novelty to flag 4 repeated_spans. This clause is the structural fix on the enricher side — mirroring the writer's Anti-Loop Clause (Phase 13, D-30).

    When generating the foreword, you read all edited chapters for context. You MUST NOT copy from them. Honour these rules:

    1. **No 6+ word phrase reuse from any chapter or enrichment file.** Before committing any sentence in the foreword, check whether a 6-or-more-word span appears in any `edited/ch*-final.md` file or any `enrichments/ch*-enrichments.md` file. If yes, REWRITE the sentence using different words. The foreword frames PURPOSE — it does not quote chapters.

    2. **No vulnerability beat reproduction.** If an edited chapter contains a first-person vulnerability beat (a named confession, doubt, fear, or struggle in the middle third), the foreword MUST NOT reproduce that scene — even paraphrased. The foreword may reference the THEME of vulnerability (e.g., "this book doesn't hide from the hard moments") but must not retell the specific scene. Vulnerability beats are single-use per Phase 13 D-30 rule 2.

    3. **Central image vehicle distinctness.** If the foreword uses imagery from the book's motif family, it must use a DIFFERENT vehicle from any chapter's central_image. Read the Book DNA Chapter Map to see which vehicles are already assigned. The foreword's imagery should complement, not duplicate.

    4. **Refrains are the ONLY permitted verbatim reuse.** Read the refrains YAML block from `[project_directory]/book-dna.md`. Each entry has phrase, max_uses, and scope. You may use each refrain phrase up to its max_uses budget in the declared scope. Every other verbatim span copied from a chapter is a violation.

    ### Consequence of violation

    The orchestrator's post-enricher novelty gate (Stage 4.6) runs `craft-check.js --novelty --tier both` against the full corpus including the foreword. Any 6+ word span shared between the foreword and a chapter triggers `novelty_dedup: fail`, which hard-fails the sample gate. There is no override.

    ---

    IMPORTANT: Do NOT modify any other section of the enricher skill. Preserve all existing content exactly. Only INSERT the new section at the specified location.
  </action>
  <verify>
    <automated>grep -c 'Anti-Loop Clause' skills/enricher/SKILL.md | grep -q '[1-9]' && grep -q 'No 6.*word.*reuse' skills/enricher/SKILL.md && grep -q 'vulnerability beat reproduction' skills/enricher/SKILL.md && grep -q 'Central image vehicle distinctness' skills/enricher/SKILL.md && grep -q 'Refrains are the ONLY permitted' skills/enricher/SKILL.md</automated>
  </verify>
  <acceptance_criteria>
    - skills/enricher/SKILL.md contains a section titled "## 6.1 Anti-Loop Clause (Foreword)" (grep -q '## 6.1 Anti-Loop Clause')
    - The section contains "No 6+ word phrase reuse from any chapter" (grep -q 'No 6.*word.*phrase reuse')
    - The section contains "No vulnerability beat reproduction" (grep -q 'vulnerability beat reproduction')
    - The section contains "Central image vehicle distinctness" (grep -q 'Central image vehicle distinctness')
    - The section contains "Refrains are the ONLY permitted verbatim reuse" (grep -q 'Refrains are the ONLY permitted')
    - The section contains "post-enricher novelty gate" referencing Stage 4.6 (grep -q 'Stage 4.6')
    - The existing Section 6 quality rules are preserved above the new section (grep -q 'The foreword does NOT summarise the book chapter by chapter')
    - The existing output format section is preserved below the new section (grep -q 'front-matter/foreword.md')
    - No other sections of the enricher skill are modified (diff shows only the insertion block)
  </acceptance_criteria>
  <done>
    The enricher skill has an Anti-Loop Clause for foreword generation that prohibits copying 6+ word spans from any chapter, reproducing vulnerability beats, reusing central image vehicles, and using any verbatim reuse outside the refrains whitelist. The clause mirrors the writer's Anti-Loop Clause and references the post-enricher novelty gate as the enforcement mechanism.
  </done>
</task>

</tasks>

<verification>
After Task 1: grep confirms all four Anti-Loop Clause rules are present in the enricher skill. The existing enricher sections (1-9) remain intact with only the new 6.1 section inserted.
</verification>

<success_criteria>
- skills/enricher/SKILL.md contains a foreword-specific Anti-Loop Clause with 4 numbered rules
- The clause mirrors the writer's D-30 constraints adapted for the enricher's context (reading chapters for foreword generation)
- No existing enricher sections are modified
- The clause references the post-enricher novelty gate (Stage 4.6) as the enforcement mechanism
</success_criteria>

<output>
After completion, create `.planning/phases/13-repetition-and-novelty-enforcement/13-12-SUMMARY.md`
</output>
