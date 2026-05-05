const requiredEnvVars = [
  "MONGO_URI",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "OTP_HASH_SECRET",
  "ENCRYPTION_KEY",
  "AI_SERVICE_URL",
  "ALLOWED_ORIGINS"
];

const missingEnvVars = requiredEnvVars.filter((name) => !String(process.env[name] || "").trim());

if (missingEnvVars.length > 0) {
  console.error("Missing required environment variables:");
  for (const envVar of missingEnvVars) {
    console.error(`- ${envVar}`);
  }
  process.exit(1);
}

console.log("Environment validation passed.");