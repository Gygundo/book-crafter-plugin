# Phase 13: Repetition and Novelty Enforcement - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents. See `13-CONTEXT.md` for the decisions that downstream agents consume.

**Date:** 2026-04-15
**Phase:** 13 — Repetition and novelty enforcement
**Mode:** Interactive discuss-phase, all gray areas discussed (`lets discuss all so that we are thorough`)

---

## Scope of discussion

User opted to discuss ALL identified gray areas rather than cherry-picking. Seven areas surfaced after prior-decision filtering (Phase 10 layering pattern, Phase 11 fixture discipline, ROADMAP SC-1..6, and `11-REVIEWS.md` consensus fix list all carried forward automatically).

---

## Area 1 — Dedup detection engine

**Question:** Which engine catches cross-artefact repetition?

**Options presented:**
- A — Pure deterministic `craft-check.js` extension (fast, misses paraphrase)
- B — Pure LLM judgment in editor Pass 3 (catches paraphrase, non-deterministic)
- C — Hybrid: deterministic script + LLM judgment layered on top (recommended)

**User selected:** C — hybrid
**Captured as:** D-01, D-02, D-03

---

## Area 2 — Novelty scoring shape

**Question:** How does novelty interact with the 0-14 captivation total?

**Options presented:**
- A — New 8th rubric component (total → 0-16, soft signal)
- B — Score cap on existing components (no schema bump, confusing math)
- C — Separate binary gate alongside captivation total (recommended — structurally prevents "14/14 with duplicates ships")

**User selected:** C — separate binary gate
**Captured as:** D-04, D-05

**Follow-up during Area 7:** Note that SC-3 also mandates a Novelty/Variation rubric component, so the final shape is BOTH a new 8th component (D-26, gradient scoring) AND the binary gate (D-04, hard gate). Total range becomes 0-16. Flagged to user before writing CONTEXT.md.

---

## Area 3 — Refrain whitelist mechanism

**Question:** Where does the refrain list live and how is it declared?

**Options presented:**
- A — `refrains:` block in Book DNA (recommended — single source of truth)
- B — Dedicated `refrains.yaml` file per book
- C — Inline `<!-- refrain -->` markers in the manuscript
- D — Brief-only declaration (collapses into A or B)

**User selected:** A — with the explicit caveat: **"this will have to be very interactive with the author."**

**User caveat captured as:** D-08 (mandatory author interaction gate at outline → Book DNA handoff), D-09 (fixture bypass via pre-approved Book DNA)
**Schema captured as:** D-06, D-07 (`phrase` + `max_uses` + `scope`)

**Rationale for the caveat:** Refrains are an authorial intent decision, not something the outliner can infer from the brief alone. The outliner proposes candidates; the author confirms, demotes, or adds.

---

## Area 4 — Failure handling on dedup flag

**Question:** What happens when the hybrid detector says `novelty_dedup: fail`?

**Options presented:**
- A — Hard fail, manual re-run of the whole pipeline
- B — Editor auto-revises the offending chapter inline
- C — Hard fail + scoped `--rewrite-targets` re-run with reason hints (recommended)
- D — Soft warn with `--strict` opt-in (rejected by both reviewers)

**User selected:** C — with the caveat carried forward: mandatory `reason:` field on each target.

**Captured as:** D-10, D-11, D-12

**Explicitly rejected:** Option B (editor auto-revision) — crosses the editor's judge-not-author contract. Option D (soft-warn) — the whole Phase 13 premise rejects soft gates.

---

## Area 5 — Back-matter and enricher scope

**Question:** Does the dedup audit extend beyond SC-2's literal front-matter + chapters scope?

**Options presented:**
- A — Strict SC-2 scope (front-matter + chapters only)
- B — Uniform scope across all artefacts (false-positive risk on summaries)
- C — Tiered scope with differentiated rules (recommended)

**User selected:** C — tiered scope
**Captured as:** D-13, D-14, D-15

**Sub-question:** Ship real Tier 2 rules, or scaffold-only?
- Recommended: scaffold only (less scope, closes contract, defers rule work to v1.2)
- **User selected:** Ship real Tier 2

**Sub-question captured as:** D-16, D-17, D-18

**Implications of shipping real Tier 2:** Fixture must exercise enricher stage (D-17), second micro-fixture needed for regression (D-18), SC-6 proof run must achieve zero flags across both tiers. User accepted the scope growth.

---

## Area 6 — Tiny-book motif vehicles

**Question:** Which vehicles for the motif family?

**Options presented:**
- A — Accept Codex's proposal verbatim (phone glow / kitchen counter / grey dawn)
- B — Pick different vehicles or motif family
- C — Motif family only, outliner picks vehicles (rejected as non-deterministic)
- D — Codex's proposal + static adversarial fixture for fail-path regression (recommended)

**User selected:** D — Codex's vehicles primary + static adversarial fixture
**Captured as:** D-19 (motif family), D-20 (vehicles), D-21 (refrain), D-22 (adversarial fixture), D-23 (test assertion)

**Rationale the user accepted:** The SC-6 proof run only tests the pass path. The adversarial fixture tests the fail path — which is what was never tested before Phase 13 and is how 14/14 shipped with duplicates in the first place.

---

## Area 7 — Schema reconciliation target

**Question:** Which of the three conflicting captivation schemas becomes canonical?

**Options presented:**
- A — `references/captivation-rubric.md` canonical (markdown parsing at runtime)
- B — New `references/captivation-schema.yaml` (two files, drift risk)
- C — Rubric file with YAML frontmatter block (recommended — single canonical file, structured header, human-readable prose below)

**User selected:** C — "i think c..." (slight hesitation noted; fallback to companion JSON flagged as a deferred safety valve)
**Captured as:** D-24, D-25, D-26, D-27, D-29

**Implication flagged to user before writing CONTEXT.md:** Adding the `novelty_variation` 8th component (SC-3) pushes the total range to 0-16. Threshold needs proportional bump — Claude's discretion at plan time per Phase 11 D-07 precedent, starting recommendation 10/16. User acknowledged by moving to write_context.

**Captured as:** D-28

---

## Summary of locked decisions

| Area | Decision | ID |
|---|---|---|
| 1. Detection engine | Hybrid (deterministic + LLM) | D-01..D-03 |
| 2. Scoring shape | Separate binary gate + new 8th component | D-04, D-05, D-26 |
| 3. Refrain whitelist | Book DNA YAML block, mandatory author gate | D-06..D-09 |
| 4. Failure handling | Hard fail + scoped `--rewrite-targets` with reason | D-10..D-12 |
| 5. Audit scope | Tiered, both tiers ship real rules | D-13..D-18 |
| 6. Fixture motif | Codex vehicles + static adversarial fixture | D-19..D-23 |
| 7. Schema reconciliation | Rubric file with YAML frontmatter, v2, 0-16 | D-24..D-29 |
| SC-4 | Writer anti-loop clause | D-30 |

## Scope growth acknowledged during discussion

1. **Tier 2 real rules (D-16)** — fixture must exercise enricher stage, second adversarial fixture needed. User explicitly chose this over scaffold-only after understanding the implications.
2. **Author interaction gate for refrains (D-08)** — new orchestrator gate alongside outline approval. User flagged this explicitly rather than accepting auto-inferred refrains.

## Items explicitly rejected (not deferred)

- Editor auto-revision on dedup flag (Area 4 Option B)
- Soft-warn / `--strict` override modes (Area 4 Option D)
- Non-deterministic fixtures (Area 6 Option C)

## Deferred ideas surfaced during discussion

Full list in `13-CONTEXT.md` `<deferred>` block. Notable:
- Semantic similarity via embeddings (v1.2+)
- Fiction-specific repetition rules
- Multi-book dedup (across a series)
- Rubric-driven craft-check (fully data-driven rules)
- Per-chapter refrain graduation
- Companion `captivation-schema.json` as fallback for frontmatter parsing

---

*End of discussion log.*
