const MAX = 12000;
export function summarizeCiLog(log) {
  if (typeof log !== "string") throw new TypeError("CI log must be text");
  return log.replace(/\x1b\[[0-9;]*m/g, "")
    .replace(/(authorization:\s*bearer\s+)[^\s]+/gi, "$1[REDACTED]")
    .replace(/(gh[pousr]_[a-zA-Z0-9_]+)/g, "[REDACTED]")
    .replace(/(sk-[a-zA-Z0-9_-]{12,})/g, "[REDACTED]")
    .slice(-MAX);
}
