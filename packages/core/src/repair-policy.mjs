import { checkBudget } from "./budget.mjs";
export function classifyFailure({ exitCode, timedOut, log = "" }) {
  const text = String(log).toLowerCase();
  if (timedOut) return "timeout";
  if (/rate limit|http 429|too many requests/.test(text)) return "rate-limit";
  if (/permission denied|missing secret|not authorized|authentication failed/.test(text)) return "credentials";
  if (/network unreachable|connection refused|dns|temporary failure/.test(text)) return "infrastructure";
  if (/flaky|intermittent/.test(text)) return "possible-flaky-test";
  if (Number.isInteger(exitCode) && exitCode !== 0) return "code-failure";
  return "unknown";
}
export function shouldAttemptRepair({ category, usedAttempts, maxAttempts, elapsedMs, maxElapsedMs }) {
  checkBudget({ repairAttempts: maxAttempts, elapsedMs: maxElapsedMs }, { repairAttempts: usedAttempts, elapsedMs }, { repairAttempts: 1 });
  return category === "code-failure";
}
