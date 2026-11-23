import test from "node:test";
import assert from "node:assert/strict";
import { createGitHubClient, GitHubApiError } from "../src/github-api.mjs";
test("fetches assigned issues with server-side bearer authentication", async () => {
  const calls = [];
  const api = createGitHubClient({ token: "test-secret", fetchImpl: async (url, options) => {
    calls.push({ url, options });
    return { ok: true, status: 200, json: async () => [{ number: 846 } ] };
  }});
  assert.deepEqual(await api.getAssignedIssues(), [{ number: 846 }]);
  assert.match(calls[0].url, /filter=assigned/);
  assert.equal(calls[0].options.headers.authorization, "Bearer test-secret");
});
test("GitHub failures expose status without leaking token", async () => {
  const api = createGitHubClient({ token: "sensitive", fetchImpl: async () => ({
    ok: false, status: 403, headers: { get: () => "60" },
  }) });
  await assert.rejects(api.getAuthenticatedUser(), error => error instanceof GitHubApiError && error.status === 403 && !error.message.includes("sensitive"));
});
test("rejects invalid pagination", () => {
  const api = createGitHubClient({ token: "test" });
  assert.throws(() => api.getAssignedIssues({ perPage: 1000 }), TypeError);
});
