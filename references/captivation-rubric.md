# Captivation Rubric

> Captivation scoring for chapter-level quality. 5 components × 0-2 points = 0-10 total. Invoked by editor Pass 1 (§2.4, §2.5, §2.5.5) and Pass 2 (§3.3, §3.4) — scoring logic lives here as the single source of truth.

## Components

### Pacing Variety

Measure paragraph length distribution across the chapter. Count the number of sentences per paragraph and categorise:
- **Short** (1-2 sentences): impact paragraphs, dramatic beats
- **Medium** (3-4 sentences): explanation, argument development
- **Long** (5-6 sentences): storytelling, scene-setting, extended illustrations

Calculate the dominant category percentage. Flag the chapter if 80% or more paragraphs fall in a single category.

**Scoring:**
- 2 points: Good mix (no category exceeds 60%)
- 1 point: Some variety (dominant category 60-80%)
- 0 points: Monotone (dominant category 80%+)

**Detection approach:** Split chapter text on blank lines to get paragraphs. Count sentences per paragraph (split on `.`, `!`, `?`). Categorise each paragraph. Calculate distribution.

### Emotional Connection

Check for the presence of personal stories, anecdotes, or vulnerability markers in the chapter. Look for indicators:
- Personal pronouns in narrative context: "I remember", "I recall", "I was", "I felt"
- Vulnerability phrases: "I didn't understand", "I failed", "I struggled", "I was wrong"
- Story markers: "there was a time", "picture this", "let me tell you about", "imagine"
- Scene-setting language: specific places, times, sensory details

Flag the chapter if NO vulnerability or personal story markers are found. Every chapter needs at least one human-experience moment per D-13.

**Scoring:**
- 2 points: Personal story/vulnerability present with specific detail
- 1 point: Some emotional connection (general references but no specific story)
- 0 points: No personal stories, anecdotes, or vulnerability markers found

**Soft threshold for teaching-heavy chapters:** A chapter in a "Building" momentum position with complex theological content may score 1 point here without triggering a rewrite. Only score 0 triggers a "significant" flag.

### Reader Engagement

Count instances of direct reader engagement language in the chapter:
- "you" / "your" / "yourself" used in direct address (not quoting scripture)
- Rhetorical questions (sentences ending in `?` that are not scripture)
- "imagine" / "picture" / "consider" as direct invitations

**Scoring:**
- 2 points: Frequent engagement (10+ instances per chapter)
- 1 point: Occasional engagement (3-9 instances)
- 0 points: Absent or rare (0-2 instances)

### Opening Engagement

For each chapter, validate that the first 200 words contain a story, anecdote, or vivid scene -- not a teaching statement, definition, or theological declaration.

**Detection approach:** Read the first 200 words. Check for:
- Story/scene indicators: past tense narrative ("I was sitting", "She walked into"), sensory details, dialogue, specific places/times
- Teaching indicators: present tense declarative statements, definitions ("Grace is..."), "In this chapter" openings, thesis statements

**Scoring:**
- 2 points: Clear story/scene in first 200 words
- 1 point: Some narrative elements but mixed with teaching
- 0 points: Opens with pure theology, definition, or declaration (no narrative)

Flag chapters that score 0 -- they open with teaching instead of story per D-01.

### Chapter-Ending Momentum

For each chapter, check that the ending has either a cliffhanger seed or a reflective landing + forward hook. Read the chapter outline's ending_style field and validate the chapter delivers it.

**Detection approach:** Read the final 150 words. Check for:
- **cliffhanger_seed indicators:** Questions ("But what if...?"), tension points ("There's something we haven't addressed"), preview language ("What comes next changes everything"), unresolved threads
- **reflective_hook indicators:** Reflective/applicational tone in penultimate paragraph, followed by forward-looking language in the final 1-2 sentences ("And that truth? It's just the beginning")

**Scoring:**
- 2 points: Clear ending momentum matching the outline's ending_style
- 1 point: Some forward momentum but doesn't match the specified style
- 0 points: Chapter just stops -- no forward hook, no reflection, no momentum

Flag chapters that score 0 -- they end without any forward momentum per D-02.

## Scoring Aggregation

Each chapter receives a `captivation_score` (1-10) based on five components (0-2 points each):

| Component | What it measures | Source |
|-----------|-----------------|--------|
| Opening engagement | Story/scene in first 200 words | Pass 2 |
| Ending momentum | Cliffhanger or reflective hook | Pass 2 |
| Pacing variety | Paragraph length distribution | Pass 1 |
| Emotional connection | Personal stories/vulnerability markers | Pass 1 |
| Reader engagement | "you", rhetorical questions, direct address | Pass 1 |

**Thresholds:**
- 8-10: Captivating -- reads like a bestseller
- 5-7: Acceptable -- some areas could improve
- 3-4: Weak -- specific areas need attention
- 1-2: Significant issues -- chapter needs substantial rework

**Momentum-aware threshold:** A chapter in a "Building" momentum position with teaching-heavy content can score 5-6 without triggering a rewrite recommendation. Only chapters scoring below 4 trigger a "significant" severity flag for captivation specifically.
