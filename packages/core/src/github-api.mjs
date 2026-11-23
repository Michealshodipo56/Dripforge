/**
 * GitHub REST client used by the future authenticated orchestration service.
 * Tokens are injected server-side and never serialized to job payloads.
 */
export class GitHubApiError extends Error {
  constructor(status, message, retryAfter = null) {
    super(message);
    this.name = "GitHubApiError";
    this.status = status;
    this.retryAfter = retryAfter;
  }
}
export function createGitHubClient({ token, fetchImpl = fetch, baseUrl = "https://api.github.com" }) {
  if (typeof token !== "string" || !token.trim()) throw new TypeError("GitHub token required");
  if (typeof fetchImpl !== "function") throw new TypeError("fetch implementation required");
  async function request(path, { method = "GET", body, signal } = {}) {
    if (typeof path !== "string" || !path.startsWith("/") || path.startsWith("//")) throw new TypeError("Invalid API path");
    const response = await fetchImpl(baseUrl + path, {
      method,
      signal,
      headers: {
        authorization: `Bearer ${token}`,
        accept: "application/vnd.github+json",
        "x-github-api-version": "2022-11-28",
        ...(body === undefined ? {} : { "content-type": "application/json" }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    if (!response.ok) {
      throw new GitHubApiError(response.status, `GitHub request failed: HTTP ${response.status}`, response.headers.get("retry-after"));
    }
    if (response.status === 204) return null;
    return response.json();
  }
  return Object.freeze({
    request,
    getAuthenticatedUser: () => request("/user"),
    getIssue: (owner, repo, number) => request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues/${number}`),
    getAssignedIssues: ({ page = 1, perPage = 100 } = {}) => {
      if (!Number.isInteger(page) || page < 1 || !Number.isInteger(perPage) || perPage < 1 || perPage > 100) throw new TypeError("Invalid pagination");
      return request(`/issues?filter=assigned&state=open&per_page=${perPage}&page=${page}`);
    },
    getPullRequest: (owner, repo, number) => request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${number}`),
    getCommitChecks: (owner, repo, sha) => request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits/${encodeURIComponent(sha)}/check-runs`),
  });
}
