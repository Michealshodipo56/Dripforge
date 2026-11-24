export function normalizeCiObservations(checkRuns, statuses = []) {
  if (!Array.isArray(checkRuns) || !Array.isArray(statuses)) throw new TypeError('CI arrays required');
  const checks = checkRuns.map(run => ({
    source: 'check-run', name: run.name, status: run.status,
    conclusion: run.conclusion, headSha: run.head_sha, url: run.html_url
  }));
  const latest = new Map();
  for (const status of statuses) {
    if (!status || typeof status.context !== 'string' || latest.has(status.context)) continue;
    latest.set(status.context, status);
  }
  for (const status of latest.values()) {
    const state = status.state;
    checks.push({
      source: 'commit-status', name: status.context,
      status: state === 'pending' ? 'in_progress' : 'completed',
      conclusion: state === 'success' ? 'success' : state === 'failure' || state === 'error' ? 'failure' : null,
      headSha: status.sha || null, url: status.target_url || null
    });
  }
  return checks;
}
