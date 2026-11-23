export class BudgetExceededError extends Error {
  constructor(reason) {
    super(reason);
    this.name = "BudgetExceededError";
  }
}
function finiteNonnegative(value, name) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new TypeError(`${name} must be a finite nonnegative number`);
  }
}
export function checkBudget(limits, used, next = {}) {
  for (const [field, max] of Object.entries({
    inputTokens: limits.inputTokens,
    outputTokens: limits.outputTokens,
    costUsd: limits.costUsd,
    elapsedMs: limits.elapsedMs,
    repairAttempts: limits.repairAttempts,
  })) {
    if (max === undefined || max === null) continue;
    finiteNonnegative(max, `limit.${field}`);
    const current = used[field] ?? 0;
    const pending = next[field] ?? 0;
    finiteNonnegative(current, `used.${field}`);
    finiteNonnegative(pending, `next.${field}`);
    if (current + pending > max) throw new BudgetExceededError(`${field} budget exceeded`);
  }
  return true;
}
