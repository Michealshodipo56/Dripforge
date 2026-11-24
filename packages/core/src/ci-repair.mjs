import { classifyFailure } from "./repair-policy.mjs";
export function decideCiRepair({ checks, attempts = 0, maxAttempts = 2, elapsedMs = 0, maxElapsedMs = 30 * 60 * 1000 }) {
  if (!Array.isArray(checks)) throw new TypeError("Check runs required");
  if (![attempts, maxAttempts, elapsedMs, maxElapsedMs].every(v => Number.isFinite(v) && v >= 0)) throw new TypeError("Invalid repair budget");
  if (checks.length === 0) return { action: "wait", reason: "checks-not-reported", failed: [] };
  const failed = checks.filter(c => c.status === "completed" && ["failure", "timed_out", "action_required", "cancelled", "startup_failure"].includes(c.conclusion));
  const pending = checks.some(c => c.status !== "completed");
  if (pending) return { action: "wait", reason: "checks-pending", failed };
  if (failed.some(c => ["cancelled", "startup_failure", "action_required"].includes(c.conclusion))) return { action: "escalate", reason: "non-repairable-check-conclusion", failed };
  if (!failed.length) return { action: "none", reason: "no-observed-failures", failed };
  if (attempts >= maxAttempts || elapsedMs >= maxElapsedMs) return { action: "stop", reason: "repair-budget-exhausted", failed };
  const categories = failed.map(c => classifyFailure({ exitCode: 1, timedOut: c.conclusion === "timed_out", log: c.log ?? "" }));
  if (categories.some(c => ["credentials", "infrastructure", "rate-limit", "timeout"].includes(c))) return { action: "escalate", reason: "non-code-failure", failed };
  return { action: "repair", reason: "code-failure", failed };
}
