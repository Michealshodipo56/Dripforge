/**
 * Required checks are supplied from trusted repository branch protection rules.
 * Never infer requiredness from the set of check runs that happened to finish.
 */
export function evaluateRequiredChecks(requiredNames, checkRuns, headSha) {
  if (!Array.isArray(requiredNames) || !requiredNames.length) return { passed: false, reason: "required-check-policy-unavailable" };
  if (!Array.isArray(checkRuns) || !headSha) return { passed: false, reason: "check-evidence-unavailable" };
  const required = [...new Set(requiredNames)];
  for (const name of required) {
    const matching = checkRuns.filter(run => run.name === name && run.head_sha === headSha);
    if (!matching.length) return { passed: false, reason: "required-check-missing", check: name };
    const latest = [...matching].sort((a, b) => String(b.completed_at ?? b.started_at ?? "").localeCompare(String(a.completed_at ?? a.started_at ?? "")))[0];
    if (latest.status !== "completed") return { passed: false, reason: "required-check-pending", check: name };
    if (latest.conclusion !== "success") return { passed: false, reason: "required-check-failed", check: name };
  }
  return { passed: true, reason: null };
}
