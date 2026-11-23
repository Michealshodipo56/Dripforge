export function summarizeChecks(checks) {
  if (!Array.isArray(checks)) throw new TypeError("checks must be an array");
  const failed = checks.filter(x => x.status === "completed" && ["failure", "timed_out", "action_required"].includes(x.conclusion));
  const pending = checks.filter(x => x.status !== "completed");
  const passed = checks.filter(x => x.status === "completed" && ["success", "neutral", "skipped"].includes(x.conclusion));
  return { total: checks.length, failed: failed.length, pending: pending.length, passed: passed.length,
    status: checks.length === 0 ? "unknown" : pending.length ? "pending" : failed.length ? "failed" : "completed",
    requiredChecksVerified: false };
}
