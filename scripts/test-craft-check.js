// scripts/test-craft-check.js — unit tests for craft-check.js
// Usage: node --test scripts/test-craft-check.js

const test = require('node:test');
const assert = require('node:assert/strict');
const { execSync } = require('node:child_process');
const path = require('node:path');

const CHECKER = path.join(__dirname, 'craft-check.js');
const FIXTURES = path.join(__dirname, '..', 'fixtures', 'phase10');

function runChecker(fixturePath) {
  try {
    const out = execSync(`node "${CHECKER}" "${fixturePath}"`, { encoding: 'utf8' });
    return { exitCode: 0, result: JSON.parse(out) };
  } catch (err) {
    return { exitCode: err.status, result: JSON.parse(err.stdout) };
  }
}

test('CRAFT-01: known-good chapter has valid provenance', () => {
  const { result } = runChecker(path.join(FIXTURES, 'known-good', 'ch01-draft.md'));
  assert.equal(result.checks['CRAFT-01'].pass, true);
});

test('known-good: all checks pass and exit code is 0', () => {
  const { exitCode, result } = runChecker(path.join(FIXTURES, 'known-good', 'ch01-draft.md'));
  assert.equal(exitCode, 0);
  for (const [id, check] of Object.entries(result.checks)) {
    assert.equal(check.pass, true, `${id} should pass on known-good but failed: ${check.evidence}`);
  }
});

test('CRAFT-01: missing provenance fails', () => {
  const { exitCode, result } = runChecker(path.join(FIXTURES, 'known-bad', 'ch03-no-provenance.md'));
  assert.equal(result.checks['CRAFT-01'].pass, false);
  assert.equal(exitCode, 1);
});

test('CRAFT-01: ch03-no-provenance fails ONLY CRAFT-01', () => {
  const { result } = runChecker(path.join(FIXTURES, 'known-bad', 'ch03-no-provenance.md'));
  assert.equal(result.checks['CRAFT-01'].pass, false);
  assert.equal(result.checks['CRAFT-02'].pass, true);
  assert.equal(result.checks['CRAFT-05'].pass, true);
  assert.equal(result.checks['CRAFT-07'].pass, true);
  assert.equal(result.checks['CRAFT-15'].pass, true);
});

test('CRAFT-02: 4 distinct Greek terms fails cap of 3', () => {
  const { result } = runChecker(path.join(FIXTURES, 'known-bad', 'ch02-greek-overflow.md'));
  assert.equal(result.checks['CRAFT-02'].pass, false);
});

test('CRAFT-02: ch02-greek-overflow fails ONLY CRAFT-02', () => {
  const { result } = runChecker(path.join(FIXTURES, 'known-bad', 'ch02-greek-overflow.md'));
  assert.equal(result.checks['CRAFT-01'].pass, true);
  assert.equal(result.checks['CRAFT-02'].pass, false);
  assert.equal(result.checks['CRAFT-05'].pass, true);
  assert.equal(result.checks['CRAFT-07'].pass, true);
  assert.equal(result.checks['CRAFT-15'].pass, true);
});

test('CRAFT-05: "So let us..." at paragraph start fails', () => {
  const { result } = runChecker(path.join(FIXTURES, 'known-bad', 'ch01-pulpit.md'));
  assert.equal(result.checks['CRAFT-05'].pass, false);
});

test('CRAFT-05: ch01-pulpit fails ONLY CRAFT-05', () => {
  const { result } = runChecker(path.join(FIXTURES, 'known-bad', 'ch01-pulpit.md'));
  assert.equal(result.checks['CRAFT-01'].pass, true);
  assert.equal(result.checks['CRAFT-02'].pass, true);
  assert.equal(result.checks['CRAFT-05'].pass, false);
  assert.equal(result.checks['CRAFT-07'].pass, true);
  assert.equal(result.checks['CRAFT-15'].pass, true);
});

test('CRAFT-05: mid-paragraph "So" does not trigger', () => {
  const { result } = runChecker(path.join(FIXTURES, 'known-good', 'ch01-draft.md'));
  assert.equal(result.checks['CRAFT-05'].pass, true);
});

test('CRAFT-07: <2 reader-thought lines fails', () => {
  const { result } = runChecker(path.join(FIXTURES, 'known-bad', 'ch05-no-reader-thought.md'));
  assert.equal(result.checks['CRAFT-07'].pass, false);
});

test('CRAFT-07: ch05-no-reader-thought fails ONLY CRAFT-07', () => {
  const { result } = runChecker(path.join(FIXTURES, 'known-bad', 'ch05-no-reader-thought.md'));
  assert.equal(result.checks['CRAFT-01'].pass, true);
  assert.equal(result.checks['CRAFT-02'].pass, true);
  assert.equal(result.checks['CRAFT-05'].pass, true);
  assert.equal(result.checks['CRAFT-07'].pass, false);
  assert.equal(result.checks['CRAFT-15'].pass, true);
});

test('CRAFT-15: missing version stamp fails', () => {
  const { result } = runChecker(path.join(FIXTURES, 'known-bad', 'ch04-no-version-stamp.md'));
  assert.equal(result.checks['CRAFT-15'].pass, false);
});

test('CRAFT-15: ch04-no-version-stamp fails ONLY CRAFT-15', () => {
  const { result } = runChecker(path.join(FIXTURES, 'known-bad', 'ch04-no-version-stamp.md'));
  assert.equal(result.checks['CRAFT-01'].pass, true);
  assert.equal(result.checks['CRAFT-02'].pass, true);
  assert.equal(result.checks['CRAFT-05'].pass, true);
  assert.equal(result.checks['CRAFT-07'].pass, true);
  assert.equal(result.checks['CRAFT-15'].pass, false);
});
