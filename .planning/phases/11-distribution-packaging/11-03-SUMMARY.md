---
phase: 11-distribution-packaging
plan: 03
subsystem: distribution
tags: [manifest, marketplace, packaging, plugin-schema]
requirements: [PKG-01, PKG-02, PKG-10]
dependency-graph:
  requires: [11-01]
  provides: ["v1.1.0 plugin manifest", "repo-as-marketplace entry"]
  affects: ["scripts/release.sh (Plan 04)", "claude plugin validate (Plan 06)"]
tech-stack:
  added: []
  patterns: ["repo-as-marketplace single-plugin", "dev/release name separation"]
key-files:
  created:
    - .claude-plugin/marketplace.json
  modified:
    - .claude-plugin/plugin.json
decisions:
  - "plugin.json name is book-crafter-dev on disk (D-19); release.sh rewrites to book-crafter in staging only"
  - "marketplace.json carries release identity book-crafter to match post-sed plugin.json"
  - "repository field is a string URL (Claude Code shape), not {type,url} (npm shape)"
  - "no version field anywhere in marketplace.json (plugin.json silently wins per docs)"
metrics:
  duration: "~2min"
  tasks: 2
  files: 2
  completed: 2026-04-15
---

# Phase 11 Plan 03: Plugin and Marketplace Manifests Summary

Bumped `.claude-plugin/plugin.json` to v1.1.0 with full metadata under the `book-crafter-dev` on-disk identity, and created `.claude-plugin/marketplace.json` for the single-plugin repo-as-marketplace pattern.

## What Was Built

### Task 1: plugin.json v1.1.0 bump

- **File:** `.claude-plugin/plugin.json`
- **Commit:** `a961ee5`
- Renamed `name` from `book-crafter` → `book-crafter-dev` (D-19 dev/release isolation)
- Bumped `version` from `1.0.0` → `1.1.0` (matches CHANGELOG `## [1.1.0]` header)
- Refreshed `description` to the D-16 capability line: "Writes structured non-fiction books with enforced craft rules. Theological voice profile default, custom voice support, professional .docx output."
- Added `homepage: "https://github.com/gygundo/book-crafter-plugin"`
- Added `repository: "https://github.com/gygundo/book-crafter-plugin"` (string URL, not `{type,url}` object)
- Added `license: "MIT"` (matches LICENSE file from Plan 11-02)
- Updated keywords: dropped `multi-agent`, added `non-fiction`
- Preserved existing `author {name, email}` shape
- No component path fields (`skills`, `commands`, `agents`) — relies on auto-discovery

### Task 2: marketplace.json (new file)

- **File:** `.claude-plugin/marketplace.json`
- **Commit:** `2bf7295`
- Top-level `name: "book-crafter-plugin"` (marketplace id, matches repo name)
- `owner` mirrors plugin.json author (`David`, email)
- Single plugin entry:
  - `name: "book-crafter"` (release identity — matches post-sed staging plugin.json)
  - `source: "./"` (repo-as-marketplace: resolves to directory containing `.claude-plugin/`)
  - `description`: D-16 capability line
  - `strict: true` (explicit for D-23 traceability)
- Zero `version` field occurrences
- Zero `book-crafter-dev` occurrences (dev identity never ships in release zip)

## Verification

Both files passed the automated Node.js JSON schema checks embedded in the plan:

- `plugin.json`: name, version, repository-is-string, license, homepage, author — all green
- `marketplace.json`: name, owner, plugins length 1, plugin name, source `./`, strict, no version field, no dev name leak — all green

Install command `/plugin install book-crafter@book-crafter-plugin` will resolve correctly against the release zip.

## Deviations from Plan

None — plan executed exactly as written.

## Authentication Gates

None.

## Known Stubs

None.

## Decisions Made

- **repository as string URL:** Used the Claude Code plugin-reference shape (`"repository": "https://..."`), not the npm `{type: "git", url: "..."}` shape. Matches live-verified schema from 11-RESEARCH.md.
- **book-crafter-dev on disk:** Preserves the D-19 dev/release isolation so Phase 12 can smoke-test a marketplace-installed copy alongside the local dev checkout without name collision. Release.sh Plan 04 will sed-rewrite the name in its staging copy.
- **strict: true explicit:** Docs default this to true, but making it explicit locks D-23 (plugin.json is authoritative; marketplace entry is supplementary) as a readable contract.

## Self-Check: PASSED

- FOUND: .claude-plugin/plugin.json
- FOUND: .claude-plugin/marketplace.json
- FOUND commit: a961ee5 (plugin.json bump)
- FOUND commit: 2bf7295 (marketplace.json create)
