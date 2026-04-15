#!/usr/bin/env node
// scripts/test-rubric-regression.js — Regression test for CRAFT-09 pure-move extraction.
//
// Reads fixtures/phase10/baseline-scores.json, reads references/captivation-rubric.md,
// re-computes sha256 over the extracted rubric body in the same order as baseline,
// compares to baseline.scoring_logic_hash. Exit 0 if identical, 1 if drifted or
// the rubric file does not yet exist.
//
// Usage: node scripts/test-rubric-regression.js

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const BASELINE_PATH = path.join(ROOT, 'fixtures', 'phase10', 'baseline-scores.json');
const RUBRIC_PATH = path.join(ROOT, 'references', 'captivation-rubric.md');

function extractBody(lines, headingText) {
  // Find the first line that is exactly `### {headingText}` (level-3 heading in the rubric)
  const headingRegex = new RegExp(`^###\\s+${headingText.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\s*$`);
  const startIdx = lines.findIndex(l => headingRegex.test(l));
  if (startIdx === -1) {
    return null;
  }
  const startLevel = (lines[startIdx].match(/^#+/) || [''])[0].length;
  let endIdx = lines.length;
  for (let i = startIdx + 1; i < lines.length; i++) {
    const m = lines[i].match(/^(#+)\s/);
    if (m && m[1].length <= startLevel) {
      endIdx = i;
      break;
    }
  }
  return lines.slice(startIdx + 1, endIdx).join('\n').trim();
}

function main() {
  if (!fs.existsSync(BASELINE_PATH)) {
    console.error(`FAIL: baseline file missing at ${BASELINE_PATH}`);
    process.exit(1);
  }
  const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));

  if (!fs.existsSync(RUBRIC_PATH)) {
    console.error(`FAIL: ${RUBRIC_PATH} does not yet exist (Task 4 has not run).`);
    console.error('This test becomes green after the rubric is extracted.');
    process.exit(1);
  }

  const rubricText = fs.readFileSync(RUBRIC_PATH, 'utf8').replace(/\r\n/g, '\n');
  const lines = rubricText.split('\n');

  const bodies = [];
  for (const component of baseline.rubric_components) {
    const heading = component.rubric_heading;
    const body = extractBody(lines, heading);
    if (body === null) {
      console.error(`FAIL: heading "### ${heading}" not found in ${RUBRIC_PATH}`);
      process.exit(1);
    }
    bodies.push(body);
  }

  const concat = bodies.join('\n');
  const hash = crypto.createHash('sha256').update(concat).digest('hex');

  if (hash === baseline.scoring_logic_hash) {
    console.log(`PASS: rubric hash matches baseline (${hash})`);
    process.exit(0);
  }

  console.error('FAIL: rubric hash drifted from baseline.');
  console.error(`  baseline: ${baseline.scoring_logic_hash}`);
  console.error(`  current:  ${hash}`);
  console.error('  This means the extraction is no longer a pure move. Revert and re-copy.');
  process.exit(1);
}

main();
