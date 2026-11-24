import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCiObservations } from '../src/ci-observation.mjs';
test('preserves check run results', () => {
  const checks = normalizeCiObservations([{name:'test',status:'completed',conclusion:'success',head_sha:'abc'}]);
  assert.equal(checks[0].source,'check-run');
  assert.equal(checks[0].conclusion,'success');
});
test('legacy commit statuses map to failed and pending observations', () => {
  const checks = normalizeCiObservations([], [{context:'build',state:'failure'},{context:'lint',state:'pending'}]);
  assert.equal(checks[0].conclusion,'failure');
  assert.equal(checks[1].status,'in_progress');
});
test('keeps newest status per context', () => {
  const checks = normalizeCiObservations([], [{context:'build',state:'success'},{context:'build',state:'failure'}]);
  assert.equal(checks.length,1);
  assert.equal(checks[0].conclusion,'success');
});
