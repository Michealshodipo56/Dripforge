import { evaluateRequiredChecks } from "./ci-policy.mjs";
/**
 * Check GitHub's latest commit check runs and commit statuses.
 * Branch protection policy must be supplied by an authorized repository administrator.
 */
export async function inspectPullRequestChecks({ github, owner, repo, pullNumber, requiredNames }) {
  if (!github || typeof github.request !== "function") throw new TypeError("GitHub client required");
  if (!Number.isSafeInteger(pullNumber) || pullNumber < 1) throw new TypeError("Invalid pull number");
  const pr = await github.request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${pullNumber}`);
  if (!pr?.head?.sha) throw new Error("Pull request head SHA unavailable");
  const sha = pr.head.sha;
  const response = await github.request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits/${encodeURIComponent(sha)}/check-runs?per_page=100`);
  const runs = (response?.check_runs ?? []).map(run => ({
    name: run.name, head_sha: run.head_sha, status: run.status, conclusion: run.conclusion,
    started_at: run.started_at, completed_at: run.completed_at, url: run.html_url,
  }));
  const evaluation = evaluateRequiredChecks(requiredNames, runs, sha);
  return { pullNumber, sha, checks: runs, ...evaluation };
}
