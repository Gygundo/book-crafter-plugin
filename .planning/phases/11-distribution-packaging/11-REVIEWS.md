---
phase: 11
reviewers: [codex]
gemini_status: unavailable (429 - capacity exhausted on all tried models)
reviewed_at: 2026-04-15
plans_reviewed: [11-01-PLAN.md, 11-02-PLAN.md, 11-03-PLAN.md, 11-04-PLAN.md, 11-05-PLAN.md, 11-06-PLAN.md]
focus: repetition blindspot — sample scored 14/14 but reader flagged looping lamp image and duplicated vulnerability beat across foreword and ch2
---

# Cross-AI Plan Review — Phase 11

## Gemini Review

_Unavailable._ All Gemini models (default, `gemini-2.5-pro`, `gemini-2.5-flash`) returned HTTP 429 "No capacity available" / "exhausted capacity" during this review window. Retry once quota resets with:

```bash
cat /tmp/gsd-review/prompt-11.md | gemini -m gemini-2.5-pro -p "review" >> .planning/phases/11-distribution-packaging/11-REVIEWS.md
```

---

## Codex Review

**Concerns**

- `HIGH` The project has three conflicting captivation schemas, so the green score is not trustworthy. The canonical rubric is 7 components scored `0-14` in [references/captivation-rubric.md](/Users/David/Development/book-crafter-plugin/references/captivation-rubric.md:1), the editor’s report template still shows `8/10` in [skills/editor/SKILL.md](/Users/David/Development/book-crafter-plugin/skills/editor/SKILL.md:504), and the actual sample report uses a separate 14-item checklist in [fixtures/tiny-book/run/reports/consistency-report.md](/Users/David/Development/book-crafter-plugin/fixtures/tiny-book/run/reports/consistency-report.md:65). The sample gate then trusts that free-form `N/14` string in [skills/sample/SKILL.md](/Users/David/Development/book-crafter-plugin/skills/sample/SKILL.md:77). Result: the release gate can pass on a stale or invented metric.

- `HIGH` Repetition is being injected upstream, not merely missed downstream. The fixture brief explicitly says the exact central image appears in every chapter in [fixtures/tiny-book/brief.md](/Users/David/Development/book-crafter-plugin/fixtures/tiny-book/brief.md:35), and the generated outline/Book DNA repeat the same lamp image across all three chapters in [fixtures/tiny-book/run/chapter-outline.md](/Users/David/Development/book-crafter-plugin/fixtures/tiny-book/run/chapter-outline.md:26) and [fixtures/tiny-book/run/book-dna.md](/Users/David/Development/book-crafter-plugin/fixtures/tiny-book/run/book-dna.md:54). That directly contradicts the outliner’s own distinctness rule in [skills/outliner/SKILL.md](/Users/David/Development/book-crafter-plugin/skills/outliner/SKILL.md:119).

- `HIGH` There is no cross-artefact dedup check, so the foreword can consume the same vulnerability beat later reused by a chapter with no penalty. The foreword uses the kitchen-counter beat in [front-matter/foreword.md](/Users/David/Development/book-crafter-plugin/fixtures/tiny-book/run/front-matter/foreword.md:12), and chapter 2 repeats it near-verbatim in [edited/ch02-final.md](/Users/David/Development/book-crafter-plugin/fixtures/tiny-book/run/edited/ch02-final.md:21). The rubric’s “Cross-Chapter Craft” only checks `central_image` distinctness and transliterated-term variety in [references/captivation-rubric.md](/Users/David/Development/book-crafter-plugin/references/captivation-rubric.md:102), and the editor’s CRAFT-04 audit only searches the current chapter’s middle third in [skills/editor/SKILL.md](/Users/David/Development/book-crafter-plugin/skills/editor/SKILL.md:406).

- `MED` The writer prompt rewards presence, not variation. It requires the image in three zones and “exactly one” vulnerability beat per chapter in [skills/writer/SKILL.md](/Users/David/Development/book-crafter-plugin/skills/writer/SKILL.md:64), [skills/writer/SKILL.md](/Users/David/Development/book-crafter-plugin/skills/writer/SKILL.md:174), and [skills/writer/SKILL.md](/Users/David/Development/book-crafter-plugin/skills/writer/SKILL.md:184), but never says “do not reuse the same scene, phrase, or beat already spent elsewhere.” On a 3-chapter booklet, that omission almost guarantees looping.

- `MED` Pass 3 validates consistency, not novelty. The editor checks term consistency, references, scripture, and themes in [skills/editor/SKILL.md](/Users/David/Development/book-crafter-plugin/skills/editor/SKILL.md:521), but there is no manuscript-level scan for repeated 6+ word spans, repeated scene beats, repeated reader-moments, or “same metaphor vehicle, different phrasing.” That is the missing quality gate the human reviewer is feeling.

- `MED` Phase 11’s shipped proof is incomplete in-repo. The plan requires Gate 3 sample evidence and a final summary in [11-06-PLAN.md](/Users/David/Development/book-crafter-plugin/.planning/phases/11-distribution-packaging/11-06-PLAN.md:217), but [11-SMOKE-TEST.md](/Users/David/Development/book-crafter-plugin/.planning/phases/11-distribution-packaging/11-SMOKE-TEST.md:1) only records Gates 1 and 2, and `11-06-SUMMARY.md` is missing. That weakens the “whole-progress sanity check” even before prose quality.

**Summary**

The architecture is close, but the current system is optimising for recurrence and rule presence, not felt freshness. The human complaint is consistent with the repo state: the lamp repetition was planned, the vulnerability duplication was unguarded, and the release gate trusted a score that is not anchored to one canonical rubric implementation.

**Strengths**

- The outliner already contains the right instinct: distinct central images and sourced vulnerability seeds in [skills/outliner/SKILL.md](/Users/David/Development/book-crafter-plugin/skills/outliner/SKILL.md:103) and [skills/outliner/SKILL.md](/Users/David/Development/book-crafter-plugin/skills/outliner/SKILL.md:119).
- The editor cleanly separates deterministic and judgment checks, which makes a novelty pass easy to add in [skills/editor/SKILL.md](/Users/David/Development/book-crafter-plugin/skills/editor/SKILL.md:74).
- The packaging/release work is disciplined enough that stronger prose gates can be added without redesigning the phase.

**Suggestions**

- Make one score canonical. The editor should emit a structured `captivation_score: { total, components..., novelty_dedup }`, and the sample gate should read that, not grep prose.

```diff
--- a/skills/sample/SKILL.md
+++ b/skills/sample/SKILL.md
@@
- N=$(grep -Eo 'Captivation[^0-9]*([0-9]+)/14' "$REPORT" | ...)
+ N=$(grep -E '^captivation_total:' "$REPORT" | cut -d: -f2 | tr -d ' ')
+ DEDUP=$(grep -E '^novelty_dedup:' "$REPORT" | cut -d: -f2 | tr -d ' ')
@@
- 2. Captivation total `N >= M`
+ 2. Captivation total `N >= M`
+ 3. `novelty_dedup` is `pass`
```

- Add a manuscript-level repetition audit in editor Pass 3.

```diff
--- a/skills/editor/SKILL.md
+++ b/skills/editor/SKILL.md
@@
 ### 4.4 Theme Tracking
 ...
+### 4.4.5 Novelty and Dedup Audit
+Read `front-matter/*.md` and all `edited/ch*-final.md`.
+Flag:
+- repeated 6+ word spans outside scripture and declared refrains
+- reuse of the same vulnerability scene across foreword and chapters
+- reuse of the same reader-moment in adjacent chapters
+- reuse of the same metaphor vehicle as dominant image across chapters
+Write `novelty_dedup: pass|fail` to `reports/consistency-report.md`.
```

- Change the fixture from “same exact image every chapter” to “one motif family, three distinct vehicles.”

```diff
--- a/fixtures/tiny-book/brief.md
+++ b/fixtures/tiny-book/brief.md
@@
-- Central image: one small lamp refusing the whole dark — appears in opening 200 words, middle third, and closing 200 words of every chapter.
+- Motif family: light in the night, expressed differently per chapter.
+- Ch 1: phone glow / unlit bedside lamp.
+- Ch 2: yellow pool over the kitchen counter.
+- Ch 3: grey seam of dawn overtaking artificial light.
+- The exact phrase "one small lamp refusing the whole dark" may appear once in the booklet, not once per chapter.
```

- Add writer-side anti-loop instructions.

```diff
--- a/skills/writer/SKILL.md
+++ b/skills/writer/SKILL.md
@@
 - `central_image` MUST be threaded through the opening 200 words, middle third, and closing 200 words
+- Do NOT reuse a phrase of 6+ consecutive words from the foreword or another chapter unless whitelisted as a refrain.
+- If a vulnerability seed has already been spent in foreword/front matter, choose a different sourced detail or skip the beat.
+- Across chapters, keep motif family related but image vehicle distinct.
```

- Tighten Phase 11 evidence. Finish Gate 3 logging, add `11-06-SUMMARY.md`, and stop treating `SAMPLE PASS` alone as sufficient proof of prose quality.

**Risk Level**

`HIGH` for any “bestseller quality” or even “captivating prose” claim. Installability looks solid; quality gating does not. Until score canonicalisation and manuscript-level dedup are in place, the system will keep producing outputs that satisfy the rubric while tiring the reader.

---

## Consensus Summary

Only one reviewer (Codex) responded, so "consensus" is single-voice. The findings below are what Codex raised; they align directly with the human reader's complaint and should be treated as high-signal even without a second reviewer.

### Top concerns (HIGH)

1. **Three conflicting captivation schemas.** Canonical rubric in `references/captivation-rubric.md` is 7 components scored 0-14. Editor report template in `skills/editor/SKILL.md:504` shows `8/10`. The actual sample consistency report uses a third, 14-item checklist. The sample gate greps a free-form `N/14` string. Result: the release gate can pass on a stale or invented metric.

2. **Repetition is injected upstream, not missed downstream.** The fixture brief itself mandates the same central image in every chapter (`fixtures/tiny-book/brief.md:35`). The outline and Book DNA propagate it. This contradicts the outliner's own distinctness rule in `skills/outliner/SKILL.md:119`. The loop is baked into the spec before any skill runs.

3. **No cross-artefact dedup check.** The rubric's "Cross-Chapter Craft" only checks `central_image` distinctness and transliterated-term variety. The editor's CRAFT-04 audit only searches the current chapter's middle third. Nothing scans foreword vs chapters, or chapter N vs chapter M, for repeated 6+ word spans or reused vulnerability scenes.

### Medium concerns

- **Writer prompt rewards presence, not variation.** It requires the image in three zones and "exactly one" vulnerability beat per chapter, but never says "do not reuse a scene, phrase, or beat already spent elsewhere."
- **Pass 3 validates consistency, not novelty.** Term, reference, scripture, theme — yes. Repeated spans, repeated scene beats, repeated reader-moments — no.
- **Phase 11 evidence is incomplete in-repo.** `11-SMOKE-TEST.md` records Gates 1 and 2 only; `11-06-SUMMARY.md` is missing. The "SAMPLE PASS" line alone is not sufficient proof of prose quality.

### Concrete fixes proposed by Codex (diffs)

1. **Make one score canonical.** Editor emits structured `captivation_total:` and `novelty_dedup:` fields. Sample gate reads those fields, not prose grep. PASS requires both `N >= M` AND `novelty_dedup == pass`.

2. **Add a manuscript-level repetition audit to editor Pass 3** (new section 4.4.5 "Novelty and Dedup Audit"). Scope: `front-matter/*.md` + all `edited/ch*-final.md`. Flags: repeated 6+ word spans outside scripture/refrains, reuse of vulnerability scene across foreword and chapters, reuse of reader-moment in adjacent chapters, reuse of metaphor vehicle as dominant image across chapters.

3. **Change the fixture from "same exact image every chapter" to "one motif family, three distinct vehicles."** Ch 1: phone glow / unlit bedside lamp. Ch 2: yellow pool over the kitchen counter. Ch 3: grey seam of dawn overtaking artificial light. The phrase "one small lamp refusing the whole dark" may appear once in the booklet, not once per chapter.

4. **Writer-side anti-loop instructions.** "Do NOT reuse a phrase of 6+ consecutive words from the foreword or another chapter unless whitelisted as a refrain. If a vulnerability seed has already been spent in foreword/front matter, choose a different sourced detail or skip the beat. Motif family related, image vehicle distinct."

5. **Tighten Phase 11 evidence.** Finish Gate 3 logging, add `11-06-SUMMARY.md`.

### Risk level

**HIGH** for any "bestseller quality" or even "captivating prose" claim. Installability looks solid; quality gating does not. Until score canonicalisation and manuscript-level dedup are in place, the system will keep producing outputs that satisfy the rubric while tiring the reader.
