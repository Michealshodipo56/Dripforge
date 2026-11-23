export function assertSafeGitRef(ref) {
  if (typeof ref !== "string" || ref.length < 1 || ref.length > 200 ||
      ref.startsWith("-") || ref.startsWith("/") || ref.endsWith("/") ||
      ref.includes("..") || ref.includes("@{") || ref.includes("//") ||
      /[\x00-\x20~^:?*\[\\]/.test(ref) ||
      ref.split("/").some(segment => !segment || segment.startsWith(".") || segment.endsWith(".lock"))) {
    throw new TypeError("Unsafe Git reference");
  }
  return ref;
}
export function makeIssueBranch(issueNumber, jobId) {
  if (!Number.isSafeInteger(issueNumber) || issueNumber < 1 || !/^[a-f0-9-]{8,}$/.test(jobId)) throw new TypeError("Invalid issue or job ID");
  return assertSafeGitRef(`dripforge/issue-${issueNumber}-${jobId.replaceAll("-", "").slice(0, 8)}`);
}
