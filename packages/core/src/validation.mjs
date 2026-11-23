export function summarizeCommandResult(result) {
  if (!result || !Number.isInteger(result.exitCode) || result.exitCode < 0) throw new TypeError("Missing actual command exit code");
  return Object.freeze({
    command: String(result.command ?? ""),
    exitCode: result.exitCode,
    passed: result.exitCode === 0 && result.timedOut !== true,
    timedOut: result.timedOut === true,
    durationMs: result.durationMs ?? null,
  });
}
export function localValidationPassed(results) {
  return Array.isArray(results) && results.length > 0 && results.every(result => summarizeCommandResult(result).passed);
}
