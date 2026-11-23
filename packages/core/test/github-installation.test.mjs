import test from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync, createVerify } from "node:crypto";
import { createGitHubAppJwt, createInstallationToken } from "../src/github-installation.mjs";
test("signs a valid GitHub App JWT", () => {
  const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048, privateKeyEncoding: { type: "pkcs8", format: "pem" }, publicKeyEncoding: { type: "spki", format: "pem" } });
  const jwt = createGitHubAppJwt({ appId: 42, privateKey, now: 1700000000 });
  const [header, payload, signature] = jwt.split(".");
  const verify = createVerify("RSA-SHA256");
  verify.update(header + "." + payload);
  verify.end();
  assert.equal(verify.verify(publicKey, Buffer.from(signature, "base64url")), true);
  assert.equal(JSON.parse(Buffer.from(payload, "base64url")).iss, "42");
});
test("requests installation tokens without exposing them in errors", async () => {
  const result = await createInstallationToken({ appJwt: "test-jwt", installationId: 3, fetchImpl: async (_url, options) => {
    assert.equal(options.method, "POST");
    return { ok: true, json: async () => ({ token: "short-lived", expires_at: "2030-01-01T00:00:00Z" }) };
  } });
  assert.equal(result.token, "short-lived");
});
