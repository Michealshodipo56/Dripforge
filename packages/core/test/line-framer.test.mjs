import test from 'node:test';
import assert from 'node:assert/strict';
import { createLineFramer } from '../src/line-framer.mjs';
test('reassembles split result markers', () => {
  const lines = [], f = createLineFramer(line => lines.push(line));
  f.push('DRIPFORGE_'); f.push('RESULT={"prUrl":"https://github.com/a/b/pull/1"}\n');
  assert.deepEqual(lines, ['DRIPFORGE_RESULT={"prUrl":"https://github.com/a/b/pull/1"}']);
});
test('flushes incomplete final line', () => {
  const lines = [], f = createLineFramer(line => lines.push(line));
  f.push('last line'); f.flush(); assert.deepEqual(lines, ['last line']);
});
test('limits unterminated lines', () => {
  const lines = [], f = createLineFramer(line => lines.push(line), 1024);
  f.push('a'.repeat(1025)); assert.equal(lines.length, 1);
  assert.match(lines[0], /TRUNCATED/);
});
