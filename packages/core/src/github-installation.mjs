import { createSign } from "node:crypto";
function b64url(value) { return Buffer.from(value).toString("base64url"); }
export function createGitHubAppJwt({ appId, privateKey, now = Math.floor(Date.now() / 1000) }) {
  if (!/^\d+$/.test(String(appId)) || !privateKey) throw new TypeError("GitHub App ID and private key required");
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = b64url(JSON.stringify({ iat: now - 60, exp: now + 540, iss: String(appId) }));
  const unsigned = header + "." + payload;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  return unsigned + "." + signer.sign(privateKey).toString("base64url");
}
export async function createInstallationToken({ appJwt, installationId, fetchImpl = fetch }) {
  if (!/^\d+$/.test(String(installationId)) || !appJwt) throw new TypeError("Installation credentials required");
  const response = await fetchImpl(`https://api.github.com/app/installations/${installationId}/access_tokens`, {
    method: "POST",
    headers: { authorization: `Bearer ${appJwt}`, accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28" },
  });
  if (!response.ok) throw new Error(`GitHub installation token request failed: HTTP ${response.status}`);
  const result = await response.json();
  if (!result.token || !result.expires_at) throw new Error("Incomplete installation token response");
  return { token: result.token, expiresAt: result.expires_at, permissions: result.permissions ?? {} };
}
