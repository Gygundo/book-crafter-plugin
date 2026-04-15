#!/usr/bin/env node
// scripts/craft-check.js — deterministic craft rule checker for CRAFT-01/02/05/07/15
// Zero dependencies. Usage: node scripts/craft-check.js <chapter-path>

const fs = require('node:fs');
const path = require('node:path');

const TRANSLITERATED_TERMS = [
  'charis', 'agape', 'phileo', 'eros', 'storge',
  'dunamis', 'exousia', 'logos', 'rhema', 'pneuma',
  'sarx', 'kairos', 'chronos', 'sunergeo', 'pas',
  'shalom', 'hesed', 'chesed', 'ruach', 'yada',
  'ahavah', 'nephesh', 'echad', 'koinonia', 'metanoia'
];

const PULPIT_SEAM_REGEX = /^(So|Now|And so|Let us|Let me|Here'?s where|Here'?s the thing|You see|Listen|Church|Friend)[\s,.!?]/i;
const PROVENANCE_REGEX = /^<!-- provenance: (.+):(\d+) -->$/;
const VERSION_STAMP_REGEX = /^<!-- generated-by: book-crafter v\d+\.\d+\.\d+ -->$/m;
const READER_THOUGHT_REGEX = /(?:^>\s*\*"|^\*")[^"*]{5,200}\?["*]/gm;

function checkCraft01(content, chapterPath) {
  const firstLine = content.split('\n')[0];
  const match = firstLine.match(PROVENANCE_REGEX);
  if (!match) {
    return { pass: false, evidence: 'missing or malformed provenance comment', citations: ['line 1'] };
  }
  const refPath = match[1];
  const refLine = match[2];
  const projectRoot = path.dirname(path.dirname(path.resolve(chapterPath)));
  const resolved = path.resolve(projectRoot, refPath);
  if (!fs.existsSync(resolved)) {
    return { pass: false, evidence: `provenance path does not exist: ${refPath}`, citations: ['line 1'] };
  }
  const lines = fs.readFileSync(resolved, 'utf8').split('\n');
  if (lines.length < parseInt(refLine, 10)) {
    return { pass: false, evidence: `provenance line ${refLine} beyond end of ${refPath} (${lines.length} lines)`, citations: ['line 1'] };
  }
  return { pass: true, evidence: `provenance resolves to ${refPath}:${refLine}`, citations: ['line 1'] };
}

function checkCraft02(content) {
  const regex = new RegExp(`\\b(?:\\*)?(${TRANSLITERATED_TERMS.join('|')})(?:\\*)?\\b`, 'gi');
  const matches = [...content.matchAll(regex)];
  const distinct = new Set(matches.map(m => m[1].toLowerCase()));
  const citations = matches.slice(0, 5).map(m => `offset ${m.index}`);
  if (distinct.size > 3) {
    return { pass: false, evidence: `${distinct.size} distinct terms (cap 3): ${[...distinct].join(', ')}`, citations };
  }
  return { pass: true, evidence: `${distinct.size} distinct terms: ${[...distinct].join(', ') || 'none'}`, citations };
}

function checkCraft05(content) {
  const paragraphs = content.split(/\n\n+/);
  const hits = [];
  paragraphs.forEach((p, i) => {
    const trimmed = p.trim();
    if (!trimmed) return;
    if (trimmed.startsWith('#') || trimmed.startsWith('<!--')) return;
    if (PULPIT_SEAM_REGEX.test(trimmed)) {
      hits.push({ paragraph: i, phrase: trimmed.split(/\s+/).slice(0, 2).join(' ') });
    }
  });
  if (hits.length) {
    return {
      pass: false,
      evidence: `${hits.length} pulpit-seam starts detected`,
      citations: hits.map(h => `para ${h.paragraph}: "${h.phrase}"`)
    };
  }
  return { pass: true, evidence: '0 pulpit-seam starts detected', citations: [] };
}

function checkCraft07(content) {
  const matches = [...content.matchAll(READER_THOUGHT_REGEX)];
  if (matches.length < 2) {
    return {
      pass: false,
      evidence: `${matches.length} reader-thought lines (need >=2)`,
      citations: matches.map(m => `offset ${m.index}`)
    };
  }
  return {
    pass: true,
    evidence: `${matches.length} reader-thought lines`,
    citations: matches.map(m => `offset ${m.index}`)
  };
}

function checkCraft15(content) {
  // Version stamp must appear within first 3 lines.
  const firstThree = content.split('\n').slice(0, 3).join('\n');
  if (VERSION_STAMP_REGEX.test(firstThree)) {
    return { pass: true, evidence: 'version stamp present in first 3 lines', citations: [] };
  }
  return { pass: false, evidence: 'version stamp missing from first 3 lines', citations: [] };
}

function main() {
  const chapterPath = process.argv[2];
  if (!chapterPath) {
    console.error('Usage: node craft-check.js <chapter-path>');
    process.exit(2);
  }
  let content;
  try {
    content = fs.readFileSync(chapterPath, 'utf8');
  } catch (err) {
    console.error(`Error reading ${chapterPath}: ${err.message}`);
    process.exit(2);
  }
  const chapterId = path.basename(chapterPath, path.extname(chapterPath));
  const result = {
    chapter_id: chapterId,
    checks: {
      'CRAFT-01': checkCraft01(content, chapterPath),
      'CRAFT-02': checkCraft02(content),
      'CRAFT-05': checkCraft05(content),
      'CRAFT-07': checkCraft07(content),
      'CRAFT-15': checkCraft15(content)
    }
  };
  console.log(JSON.stringify(result, null, 2));
  const anyFail = Object.values(result.checks).some(c => !c.pass);
  process.exit(anyFail ? 1 : 0);
}

main();
