export function eligibleAssignedIssues(issues, { includeDraft = false } = {}) {
  if (!Array.isArray(issues)) throw new TypeError("Issues must be an array");
  return issues.filter(issue => issue && !issue.pull_request && issue.state === "open" &&
    typeof issue.number === "number" && issue.repository?.full_name &&
    (includeDraft || !issue.draft));
}
export function groupIssuesByRepository(issues) {
  const grouped = new Map();
  for (const issue of eligibleAssignedIssues(issues)) {
    const repo = issue.repository.full_name;
    if (!grouped.has(repo)) grouped.set(repo, []);
    grouped.get(repo).push(issue);
  }
  return grouped;
}
