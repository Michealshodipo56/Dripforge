import { createHmac, timingSafeEqual } from "node:crypto";
/** Verify the raw request bytes before parsing untrusted webhook JSON. */
export function verifyGitHubWebhook(rawBody, signatureHeader, secret) {
  if (!Buffer.isBuffer(rawBody) || typeof secret !== "string" || !secret) return false;
  if (typeof signatureHeader !== "string" || !/^sha256=[a-f0-9]{64}$/.test(signatureHeader)) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest();
  const received = Buffer.from(signatureHeader.slice(7), "hex");
  return received.length === expected.length && timingSafeEqual(received, expected);
}
