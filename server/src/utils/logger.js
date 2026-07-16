const DEBUG_REQUEST_LOGS = String(process.env.DEBUG_REQUEST_LOGS || "false").toLowerCase() === "true";

export const isDebugLogsEnabled = () => DEBUG_REQUEST_LOGS;

export const maskEmail = (email) => {
  const value = String(email || "").trim();
  const [localPart, domain] = value.split("@");

  if (!localPart || !domain) {
    return "unknown";
  }

  if (localPart.length <= 2) {
    return `${localPart[0] || "*"}*@${domain}`;
  }

  return `${localPart[0]}***${localPart[localPart.length - 1]}@${domain}`;
};

export const logInfo = (scope, message, meta = undefined) => {
  if (!DEBUG_REQUEST_LOGS) {
    return;
  }

  if (meta) {
    console.log(`[${scope}] ${message}`, meta);
    return;
  }

  console.log(`[${scope}] ${message}`);
};

export const logWarn = (scope, message, meta = undefined) => {
  if (meta) {
    console.warn(`[${scope}] ${message}`, meta);
    return;
  }

  console.warn(`[${scope}] ${message}`);
};

export const logError = (scope, message, meta = undefined) => {
  if (meta) {
    console.error(`[${scope}] ${message}`, meta);
    return;
  }

  console.error(`[${scope}] ${message}`);
};
