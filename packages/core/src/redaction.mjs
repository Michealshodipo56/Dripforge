const patterns = [
  /gh[pousr]_[A-Za-z0-9_]{12,}/g,
  /github_pat_[A-Za-z0-9_]{12,}/g,
  /sk-[A-Za-z0-9_-]{16,}/g,
  /Bearer\s+[^\s"']+/gi,
  /(?:api[_-]?key|token|password|secret)\s*[:=]\s*[^\s,;]+/gi,
];
export function redactSecrets(value, knownSecrets = []) {
  let result = String(value ?? "");
  for (const secret of knownSecrets) {
    if (typeof secret === "string" && secret.length >= 4) result = result.split(secret).join("[REDACTED]");
  }
  for (const pattern of patterns) result = result.replace(pattern, "[REDACTED]");
  return result;
}
