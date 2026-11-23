import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const api = fileURLToPath(new URL('../apps/api/index.mjs', import.meta.url));
const web = fileURLToPath(new URL('../apps/web/index.html', import.meta.url));

test('API starts safely without worker credentials and protects private routes', async t => {
  const dir = await mkdtemp(join(tmpdir(), 'dripforge-api-'));
  const token = 'integration_test_admin_token_123456789';
  const child = spawn(process.execPath, [api], {
    env: { ...process.env, PORT: '0', DATA_FILE: join(dir, 'jobs.json'), WEB_HTML_PATH: web,
      ADMIN_TOKEN: token, GITHUB_TOKEN: 'fake-test-token',
      ENABLE_UNSAFE_WORKER: '', MODEL_API_KEY: '' },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  t.after(async () => { child.kill('SIGTERM'); await rm(dir, { recursive: true, force: true }); });
  let output = '';
  child.stdout.on('data', b => { output += b.toString(); });
  child.stderr.on('data', b => { output += b.toString(); });
  let port;
  for (let i = 0; i < 80; i++) {
    const match = output.match(/port (\d+)/);
    if (match) { port = Number(match[1]); break; }
    if (child.exitCode !== null) throw Error('API exited: ' + output);
    await delay(50);
  }
  assert.ok(port > 0, 'API must report listening port: ' + output);
  const root = 'http://127.0.0.1:' + port;
  const health = await fetch(root + '/health');
  assert.equal(health.status, 200);
  assert.equal((await health.json()).status, 'ok');
  const unauthorized = await fetch(root + '/api/jobs');
  assert.equal(unauthorized.status, 401);
  const jobs = await fetch(root + '/api/jobs', { headers: { authorization: 'Bearer ' + token } });
  assert.equal(jobs.status, 200);
  assert.deepEqual(await jobs.json(), []);
  const disabled = await fetch(root + '/api/jobs', {
    method: 'POST', headers: { authorization: 'Bearer ' + token, 'content-type': 'application/json' },
    body: JSON.stringify({ repo: 'example/repo', issue: 1 })
  });
  assert.equal(disabled.status, 503);
});
