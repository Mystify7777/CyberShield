import CryptoJS from "crypto-js";

const PRIMARY_KEY = process.env.ENCRYPTION_KEY;
const LEGACY_KEYS = process.env.ENCRYPTION_LEGACY_KEYS
  ? process.env.ENCRYPTION_LEGACY_KEYS.split(",").map((key) => key.trim()).filter(Boolean)
  : [];

if (!PRIMARY_KEY || PRIMARY_KEY.length < 32) {
  throw new Error("Strong ENCRYPTION_KEY required (min 32 characters)");
}

const V2_PREFIX = "v2:";

const encryptWithKey = (text, key) => {
  return CryptoJS.AES.encrypt(String(text), key).toString();
};

const attemptDecrypt = (cipher, key) => {
  const bytes = CryptoJS.AES.decrypt(cipher, key);
  const value = bytes.toString(CryptoJS.enc.Utf8);

  if (!value) {
    throw new Error("Invalid cipher for provided key");
  }

  return value;
};

export const encrypt = (text) => {
  return `${V2_PREFIX}${encryptWithKey(text, PRIMARY_KEY)}`;
};

export const decrypt = (cipher, context = {}) => {
  if (!cipher || typeof cipher !== "string") {
    throw new Error("Decryption failed: cipher is missing or invalid");
  }

  const isV2 = cipher.startsWith(V2_PREFIX);
  const normalizedCipher = isV2 ? cipher.slice(V2_PREFIX.length) : cipher;
  const keys = [PRIMARY_KEY, ...LEGACY_KEYS];
  let lastError;

  for (const key of keys) {
    try {
      const data = attemptDecrypt(normalizedCipher, key);
      const usedLegacy = key !== PRIMARY_KEY;

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

  throw new Error(`Decryption failed for all keys${lastError ? `: ${lastError.message}` : ""}`);
};
