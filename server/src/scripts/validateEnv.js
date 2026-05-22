import dotenv from "dotenv";
dotenv.config();
const requiredEnvVars = [
  "MONGO_URI",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "JWT_ISSUER",
  "OTP_HASH_SECRET",
  "ENCRYPTION_KEY",
  "AI_SERVICE_URL",
  "ALLOWED_ORIGINS"
];

const missingEnvVars = requiredEnvVars.filter((name) => !String(process.env[name] || "").trim());
const encryptionKey = String(process.env.ENCRYPTION_KEY || "").trim();

if (encryptionKey) {
  // If it's a hex string, a 64-char string equals a 32-byte key
  const byteLength = /^[0-9a-fA-F]+$/.test(encryptionKey) 
    ? encryptionKey.length / 2 
    : encryptionKey.length;

  if (byteLength !== 32) {
    console.error(`ENCRYPTION_KEY must resolve to exactly 32 bytes. (Current string length: ${encryptionKey.length} chars, detected: ${byteLength} bytes).`);
    process.exit(1);
  }
}

if (missingEnvVars.length > 0) {
  console.error("Missing required environment variables:");
  for (const envVar of missingEnvVars) {
    console.error(`- ${envVar}`);
  }
  process.exit(1);
}

console.log("Environment validation passed.");