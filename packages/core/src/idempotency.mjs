/** Stable issue-job identity across webhook redeliveries and retries. */
export function issueJobKey({ installationId, repositoryId, issueNumber, targetBranch }) {
  if (!Number.isSafeInteger(installationId) || installationId <= 0) throw new TypeError("Invalid installationId");
  if (!Number.isSafeInteger(repositoryId) || repositoryId <= 0) throw new TypeError("Invalid repositoryId");
  if (!Number.isSafeInteger(issueNumber) || issueNumber <= 0) throw new TypeError("Invalid issueNumber");
  if (typeof targetBranch !== "string" || !/^[a-zA-Z0-9._/-]{1,200}$/.test(targetBranch) || targetBranch.includes("..")) {
    throw new TypeError("Invalid targetBranch");
  }
  return `issue:${installationId}:${repositoryId}:${issueNumber}:${targetBranch}`;
}
