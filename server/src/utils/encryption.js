import crypto from "crypto";
import CryptoJS from "crypto-js";

const ALGO = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const V3_PREFIX = "v3:";
const V2_PREFIX = "v2:";

const LEGACY_KEYS = process.env.ENCRYPTION_LEGACY_KEYS
  ? process.env.ENCRYPTION_LEGACY_KEYS.split(",").map((key) => key.trim()).filter(Boolean)
  : [];

const getKey = () => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length !== 32) {
    throw new Error("ENCRYPTION_KEY must be 32 chars");
  }

  return Buffer.from(key);
};

const encryptLegacy = (text, key) => {
  return CryptoJS.AES.encrypt(String(text), key).toString();
};

const decryptLegacy = (cipher, key) => {
  const bytes = CryptoJS.AES.decrypt(cipher, key);
  const value = bytes.toString(CryptoJS.enc.Utf8);

  if (!value) {
    throw new Error("Invalid cipher for provided key");
  }

  return value;
};

const encryptV3 = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);

  const encrypted = Buffer.concat([
    cipher.update(String(text), "utf8"),
    cipher.final()
  ]);

  const tag = cipher.getAuthTag();
  return `${V3_PREFIX}${Buffer.concat([iv, tag, encrypted]).toString("base64")}`;
};

const decryptV3 = (payload) => {
  const data = Buffer.from(payload, "base64");

  if (data.length <= IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new Error("Invalid cipher payload");
  }

  const iv = data.slice(0, IV_LENGTH);
  const tag = data.slice(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = data.slice(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGO, getKey(), iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]);

  return decrypted.toString("utf8");
};

export const encrypt = (text) => {
  return encryptV3(text);
};

export const decrypt = (cipher, context = {}) => {
  if (!cipher || typeof cipher !== "string") {
    throw new Error("Decryption failed: cipher is missing or invalid");
  }

  const isV3 = cipher.startsWith(V3_PREFIX);
  const isV2 = cipher.startsWith(V2_PREFIX);
  const normalizedCipher = isV3 || isV2 ? cipher.slice(3) : cipher;

  if (isV3) {
    return {
      data: decryptV3(normalizedCipher),
      usedLegacy: false
    };
  }

  const keys = [process.env.ENCRYPTION_KEY, ...LEGACY_KEYS].filter(Boolean);
  let lastError;

  for (const key of keys) {
    try {
      const data = decryptLegacy(normalizedCipher, key);
      const usedLegacy = key !== process.env.ENCRYPTION_KEY;

      if (usedLegacy) {
        const suffix = context.recordId ? ` record=${context.recordId}` : "";
        const source = context.source ? ` source=${context.source}` : "";
        console.warn(`[ENCRYPTION] Decrypted using legacy key${suffix}${source}`);
      }

      return { data, usedLegacy };
    } catch (error) {
      lastError = error;
    }
  }

  try {
    return {
      data: decryptV3(normalizedCipher),
      usedLegacy: false
    };
  } catch (error) {
    lastError = error;
  }

  throw new Error(`Decryption failed for all keys${lastError ? `: ${lastError.message}` : ""}`);
};
