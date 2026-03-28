# Phase 8: Voice Builder Skill - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

A new skill (`book-crafter:voice-builder`) that analyses a body of existing writing and generates a custom voice profile (.md file) conforming to the voice-profile-spec. The skill is both standalone (user-invocable directly) and integrated into the orchestrator's voice selection flow as a fifth option ("Build from source material"). It does NOT create genre-specific profile templates or modify the existing spiritual-default profile.

</domain>

<decisions>
## Implementation Decisions

### Source Input Handling
- **D-01:** Accept markdown files only (.md). Users convert other formats before running. Obsidian vaults are already .md, which is the primary use case.
- **D-02:** User provides a directory path. Builder recursively scans for .md files. Works with Obsidian vaults and flat folders alike.
- **D-03:** Soft minimum corpus size — recommend 5+ files / 10,000+ words. Warn if below threshold but proceed, marking less-confident profile sections with INFERRED markers (consistent with Phase 2 inline voice handling).
- **D-04:** Analyse everything in the directory. No auto-filtering of short files, outlines, or rough notes. The builder treats all .md files as representative of the author's voice.

### Analysis Approach
- **D-05:** Two-pass analysis. Pass 1: Read all files, extract statistical patterns (sentence lengths, vocabulary frequency, paragraph structure, rhetorical patterns). Pass 2: Synthesise findings into voice profile sections using the patterns as evidence.
- **D-06:** Extract all four linguistic feature categories: sentence patterns & rhythm, vocabulary & word choice, tone & emotional register, and structural patterns (argument building, transitions, story usage, paragraph lengths, emphasis techniques).
- **D-07:** Auto-detect domain framework (theological, leadership, self-help, etc.) from source content, then present detection to user for confirmation or override. Uses the same pattern as research mode auto-detection from Phase 3.
- **D-08:** Calibration examples extracted from source material as CORRECT examples (actual passages). WRONG examples generated synthetically to demonstrate common drift patterns (academic, casual, generic) — consistent with Phase 7 decision that calibration examples are original prose.

### Profile Output & Refinement
- **D-09:** Draft with review gate. Builder generates a complete profile, presents a summary of what was detected (key voice characteristics, detected domain, confidence levels), and lets the user approve or request adjustments before saving. Mirrors the outline approval gate pattern.
- **D-10:** Auto-name the profile from detected content characteristics (e.g. 'pastoral-teaching.md', 'leadership-conversational.md'). User can rename during review.
- **D-11:** New profile only — builder always creates a fresh profile. No merge/update mode. Users re-run with more/different source material for a new profile.

### Integration Model
- **D-12:** Both standalone and orchestrator-integrated. User can invoke `book-crafter:voice-builder` directly outside the pipeline, AND the orchestrator offers it during voice selection.
- **D-13:** Generated profiles saved to `references/voice-profiles/` alongside spiritual-default.md. Immediately available for use by the orchestrator without copying.
- **D-14:** Orchestrator integration point: during voice selection, add "Build from source material" as a fifth option alongside the existing four (default, custom .md, inline description, project voice). When selected, orchestrator invokes the voice builder, then resumes pipeline with the generated profile.

### Claude's Discretion
- How to structure the two-pass analysis internally (chunking strategy, statistical extraction methods)
- What constitutes a "confident" vs "INFERRED" section when corpus is below recommended size
- How to handle contradictory voice signals across source files (e.g. some formal, some casual)
- How to present the review summary — level of detail, formatting
- The specific auto-naming algorithm (which content signals map to which profile names)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Voice System
- `references/voice-profiles/voice-profile-spec.md` — Defines the 5 required + 2 optional sections the builder must output. Validation rules for each section.
- `references/voice-profiles/spiritual-default.md` — Reference implementation of a complete voice profile. Builder output should match this structure and quality level.
- `references/book-dna-template.md` — Shows how voice profiles map into Book DNA (Section Mapping table in spec)

### Orchestrator Integration
- `skills/orchestrator/SKILL.md` — Voice selection logic that needs a fifth option added ("Build from source material")
- `references/pipeline-stages.md` — Pipeline stage documentation for understanding where voice selection occurs

### Existing Patterns
- `skills/outliner/SKILL.md` — Approval gate pattern (outline approval) to reference for the voice profile review gate
- Phase 2 context: inline voice description handling with INFERRED markers

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Voice profile spec (`voice-profile-spec.md`): Defines exact output structure — builder generates a file matching this spec
- Validation rules already defined: builder can self-validate its output against the spec before presenting to user
- INFERRED marker pattern from Phase 2: reuse for low-confidence sections when corpus is small
- Approval gate pattern from outliner: reuse for the review gate flow

### Established Patterns
- Voice profiles are plain .md files — no code needed for the profile itself
- Orchestrator uses filesystem detection (artefact existence = stage completion)
- Skills at plugin root, user-invocable flag controls whether user or orchestrator calls them
- Voice selection in orchestrator already supports 4 modes — extending to 5

### Integration Points
- New skill file: `skills/voice-builder/SKILL.md`
- Orchestrator voice selection: add "Build from source material" option
- Profile output: `references/voice-profiles/{auto-name}.md`
- No new subagents needed — builder runs in the main thread (analysis is sequential)

</code_context>

<specifics>
## Specific Ideas

- Primary use case is Obsidian vaults — David's team stores sermons, notes, and content in Obsidian
- The builder should produce a profile that captures the ACTUAL voice of the source material, not an idealised version — authenticity over polish
- Memory note: "The spiritual-default voice profile is generic and produces sermon-like output. A voice built FROM the author's actual writing would be more authentic and produce better books."

</specifics>

<deferred>
## Deferred Ideas

- Genre-specific voice profile templates (leadership, memoir, teaching) — separate effort after builder exists
- Profile merge/update mode (combine existing profile with new source material) — future enhancement if needed
- Non-markdown input support (.docx, .txt, .pdf) — users can convert before running
- Voice comparison tool (compare two profiles side by side) — not in scope

None beyond existing backlog — discussion stayed within phase scope.

</deferred>

---

*Phase: 08-voice-builder-skill-analyse-source-content-to-generate-custom-voice-profiles*
*Context gathered: 2026-03-28*
