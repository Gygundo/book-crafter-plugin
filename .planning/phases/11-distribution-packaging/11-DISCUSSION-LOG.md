# Phase 11: Distribution Packaging - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `11-CONTEXT.md` — this log preserves the alternatives considered.

**Date:** 2026-04-15
**Phase:** 11-distribution-packaging
**Areas discussed:** Repo + fixture content, Sample skill UX, README tone + claim discipline, Dev isolation + release.sh scope

---

## Gray Area Selection

| Option | Description | Selected |
|--------|-------------|----------|
| Repo + fixture content | GitHub owner/repo name AND fixture brief topic/voice/expected-score format | ✓ |
| Sample skill UX | How /book-crafter:sample behaves, output location, pass/fail signalling | ✓ |
| README tone + claim discipline | Voice for non-technical recipient, prereq explanation, safe capability language | ✓ |
| Dev isolation + release.sh scope | Pitfall 14 prevention, tagging ownership, zip destination, version gate | ✓ |

---

## Repo + Fixture Content

### Q1: Who is the GitHub owner and repo name for the marketplace URL?

| Option | Description | Selected |
|--------|-------------|----------|
| encounter-church/book-crafter-plugin | Org-owned under the church. Matches SUMMARY.md sample command. | |
| davidencounter/book-crafter-plugin | Personal account. Matches REQUIREMENTS.md placeholder. | |
| Confirm later, use placeholder | Leave a clearly-marked TODO the release.sh checks for. | |
| **Other (user-provided)** | **gygundo/book-crafter-plugin — personal account** | ✓ |

**User's choice:** `gygundo/book-crafter-plugin` (personal account).
**Notes:** User typed the name directly; the placeholder and alternative org names were rejected. Override of REQUIREMENTS.md placeholder.

### Q2: Does the repo already exist on GitHub?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, public already | Marketplace add command will resolve immediately. | |
| Yes, private — flip public at release | Phase 11 can still reference it; Phase 12 smoke-test runs after flipping public. | |
| No, needs to be created in Phase 11 | Add repo creation as an explicit Phase 11 task. | ✓ |

**User's choice:** Create the repo in Phase 11.
**Notes:** Repo creation is now a Phase 11 task prerequisite for README + plugin.json repository field.

### Q3: What topic should the tiny-book fixture cover?

| Option | Description | Selected |
|--------|-------------|----------|
| Short theological booklet (e.g. 'Three Promises') | Uses default spiritual voice. Most production-representative. | |
| Secular self-help booklet (e.g. 'Morning Habits') | Tests non-theological voice hitting craft rules. | |
| You decide — Claude picks a theme that exercises all craft rules | Claude drafts a brief deliberately covering scene-first, vulnerability, reader moments. | ✓ |

**User's choice:** Claude's discretion — pick a theme that exercises CRAFT-01..08 deterministically.
**Notes:** Final topic recorded in the phase plan, not here.

### Q4: What does expected-captivation-score.txt contain?

| Option | Description | Selected |
|--------|-------------|----------|
| Minimum threshold (single number, e.g. >=8) | Simplest gate. | ✓ |
| Range (e.g. 7–11) + per-component minima | More diagnostic, tighter. | |
| Pass/fail per CRAFT-01..08 only (no rubric score) | Relies on craft-check.js output. | |

**User's choice:** Single minimum threshold integer.
**Notes:** Starting recommendation >= 8, calibrate after first fixture run. Per-component minima deferred to v1.2.

---

## Sample Skill UX

### Q1: How should /book-crafter:sample run the fixture?

| Option | Description | Selected |
|--------|-------------|----------|
| Non-interactive, full pipeline end-to-end | No prompts. Runs outline→research→write→edit→format. | ✓ |
| Interactive with approval gate at outline | Mirrors real user flow but slower. | |
| Non-interactive with --fresh mode auto-enabled | Always wipes prior fixture artefacts first. | |

**User's choice:** Non-interactive, full pipeline, no forced --fresh.
**Notes:** Phase 11 CONTEXT D-11 refines this: --fresh only on re-invocation when prior output exists.

### Q2: Where does the sample write its output?

| Option | Description | Selected |
|--------|-------------|----------|
| fixtures/tiny-book/run/ (gitignored) | Lives next to the brief. Excluded from release whitelist. | ✓ |
| books/tiny-book-sample/ (same as normal books) | Consistent with normal workflow. | |
| A temp dir (mktemp), cleaned on success | No residue. Harder to debug. | |

**User's choice:** `fixtures/tiny-book/run/`, gitignored AND release-whitelist-excluded.

### Q3: How does /book-crafter:sample signal pass/fail?

| Option | Description | Selected |
|--------|-------------|----------|
| Final .docx exists + captivation >= threshold → PASS | Two-check gate with explicit summary line. | ✓ |
| Only .docx existence check | Wouldn't catch rubric drift. | |
| Full CRAFT-01..08 matrix + .docx + score | Overlaps Phase 12 work. | |

**User's choice:** Two-gate check (docx exists + score threshold met).
**Notes:** Exit code mirrors pass/fail for future release.sh integration.

---

## README Tone + Claim Discipline

### Q1: What voice/tone for the recipient README?

| Option | Description | Selected |
|--------|-------------|----------|
| Plain, friendly, zero-jargon | Assumes basic Claude Code familiarity. No 'multi-agent' talk. | ✓ |
| Technical but approachable | Explains pipeline stages briefly. | |
| Minimalist (install + one-line usage only) | Fastest but may feel underwhelming. | |

**User's choice:** Plain, friendly, zero-jargon.

### Q2: How explicit about the Node ≥18 prerequisite?

| Option | Description | Selected |
|--------|-------------|----------|
| Top-of-README callout box | Visible before install commands. | ✓ |
| In-line under install commands | Less prominent. | |
| Separate Requirements section | More formal. | |

**User's choice:** Top-of-README callout.

### Q3: What capability language is safe in the README pre-Phase 12?

| Option | Description | Selected |
|--------|-------------|----------|
| 'Writes structured non-fiction books with enforced craft rules' | Factual, procedural. Safe pre-Phase 12. | ✓ |
| 'Writes captivating books in your voice' | Aspirational. Violates Pitfall 22. | |
| Ship README without the capability line | Safest but incomplete-looking. | |

**User's choice:** Factual procedural line. Verbatim; no variations allowed until Phase 12 GATE-07.

### Q4: Visuals?

| Option | Description | Selected |
|--------|-------------|----------|
| Short example output block (quoted prose paragraph) | 3–4 lines from fixture output. TODO if fixture not yet run. | ✓ |
| No visuals — text only | Simpler. | |
| ASCII pipeline diagram | Shows stage flow. | |

**User's choice:** Example output paragraph, sourced from fixture (placeholder comment until fixture run).

---

## Dev Isolation + Release.sh Scope

### Q1: How should we avoid the dev/release plugin collision (Pitfall 14)?

| Option | Description | Selected |
|--------|-------------|----------|
| Rename dev manifest to book-crafter-dev, release.sh rewrites to book-crafter | Zero collision risk. | ✓ |
| Same name both, document uninstall-dev step in DEV-NOTES.md | Relies on process discipline. | |
| Same name both, automate dev uninstall inside /book-crafter:sample | Clever but risky. | |

**User's choice:** Rename dev to `book-crafter-dev`; release.sh rewrites to `book-crafter` in staging.

### Q2: Does release.sh also git-tag v1.1.0?

| Option | Description | Selected |
|--------|-------------|----------|
| No — tagging is Phase 12 GATE-09 only | Respects the hard gate. | ✓ |
| Yes, but only with --tag flag | Risks accidental tagging. | |
| Yes, unconditionally | Violates gate design. | |

**User's choice:** No tagging in Phase 11. GATE-09 owns it.

### Q3: Where does release.sh output the zip?

| Option | Description | Selected |
|--------|-------------|----------|
| dist/book-crafter-v1.1.0.zip (gitignored) | Versioned filename, easy to find. | ✓ |
| build/ (ephemeral, cleaned each run) | Cleaner but easy to lose. | |
| /tmp + prints path | Zero repo pollution. | |

**User's choice:** `dist/book-crafter-v${VERSION}.zip`, gitignored.

### Q4: How does release.sh gate version/CHANGELOG match?

| Option | Description | Selected |
|--------|-------------|----------|
| grep plugin.json version, grep CHANGELOG for matching header, fail if mismatch | Simple bash, no new deps. | ✓ |
| Full semver parse via jq | Adds jq dep. | |
| No gate — assume David updates both | Violates PKG-07. | |

**User's choice:** Pure bash + grep; no jq dependency.

---

## Claude's Discretion

- Fixture topic (Claude picks at plan time, constrained by D-04)
- Captivation threshold integer (starting >= 8, calibrate on first run)
- CHANGELOG v1.0.0 + v1.1.0 entry wording (synthesis from phase history)
- README install-block exact wording within D-14..D-18 constraints
- release.sh internal structure (flat vs sub-functions)
- `.gitignore` additions for `dist/`, `fixtures/tiny-book/run/`, `DEV-NOTES.md`
- Whether to add `--dry-run` mode to release.sh (nice-to-have)

## Deferred Ideas

See `11-CONTEXT.md` <deferred> section. All deferred items belong to Phase 12, v1.2, or documented SUMMARY.md deferrals.
