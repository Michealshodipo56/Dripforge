import { randomBytes, createCipheriv, createDecipheriv } from "node:crypto";
const VERSION = 1;
function keyFromHex(hex) {
  if (typeof hex !== "string" || !/^[a-fA-F0-9]{64}$/.test(hex)) throw new TypeError("Encryption key must be 32 bytes of hex");
  return Buffer.from(hex, "hex");
}
export function encryptCredential(plaintext, keyHex, associatedData) {
  if (typeof plaintext !== "string" || !plaintext || typeof associatedData !== "string" || !associatedData) throw new TypeError("Credential and associated data required");
  const nonce = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyFromHex(keyHex), nonce);
  cipher.setAAD(Buffer.from(associatedData));
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return Buffer.concat([Buffer.from([VERSION]), nonce, cipher.getAuthTag(), encrypted]);
}
export function decryptCredential(payload, keyHex, associatedData) {
  if (!Buffer.isBuffer(payload) || payload.length < 30 || payload[0] !== VERSION || !associatedData) throw new TypeError("Invalid credential payload");
  const decipher = createDecipheriv("aes-256-gcm", keyFromHex(keyHex), payload.subarray(1, 13));
  decipher.setAAD(Buffer.from(associatedData));
  decipher.setAuthTag(payload.subarray(13, 29));
  return Buffer.concat([decipher.update(payload.subarray(29)), decipher.final()]).toString("utf8");
}
