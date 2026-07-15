// server/src/utils/encryption.js

import crypto from "crypto";
import CryptoJS from "crypto-js";

const ALGO = "aes-256-gcm";
const IV_LENGTH = 12;



const getKey = () => {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    throw new Error("ENCRYPTION_KEY missing");
  }

  return crypto
    .createHash("sha256")
    .update(key)
    .digest();
};


export const encrypt = (text) => {
  if (typeof text !== "string") {
    throw new Error("encrypt() expects a string");
  }

  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(
    ALGO,
    getKey(),
    iv
  );

  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return Buffer.concat([
    iv,
    tag,
    encrypted,
  ]).toString("base64");
};


const decryptLegacy = (payload) => {
  const normalized = payload.startsWith("v2:")
    ? payload.slice(3)
    : payload;

  const bytes = CryptoJS.AES.decrypt(
    normalized,
    process.env.ENCRYPTION_KEY
  );

  const value = bytes.toString(
    CryptoJS.enc.Utf8
  );

  if (!value) {
    throw new Error(
      "Legacy decrypt failed"
    );
  }

  return value;
};



export const decrypt = (payload, options = {}) => {
  if (!payload || typeof payload !== "string") {
    throw new Error("decrypt() expects a base64 string");
  }

  const data = Buffer.from(payload, "base64");

  const iv = data.slice(0, IV_LENGTH);

  const tag = data.slice(
    IV_LENGTH,
    IV_LENGTH + 16
  );

  const encrypted = data.slice(
    IV_LENGTH + 16
  );

  const decipher = crypto.createDecipheriv(
    ALGO,
    getKey(),
    iv
  );

  decipher.setAuthTag(tag);

  let decrypted;

  try {
    decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);
 } catch {
  try {
    const legacyData = decryptLegacy(payload);

    return {
      data: legacyData,
      usedLegacy: true,
    };
  } catch {
    throw new Error(
      "Invalid or tampered encrypted payload"
    );
  }
}

  return {
  data: decrypted.toString("utf8"),
  usedLegacy: false,
};
};