const DEBUG_REQUEST_LOGS = String(process.env.DEBUG_REQUEST_LOGS || "false").toLowerCase() === "true";

export const isDebugLogsEnabled = () => DEBUG_REQUEST_LOGS;

const formatMeta = (meta) => {
  if (meta instanceof Error) {
    return {
      name: meta.name,
      message: meta.message,
      stack: DEBUG_REQUEST_LOGS ? meta.stack : undefined,
    };
  }

  return meta;
};

const emitLog = (method, scope, message, meta = undefined) => {
  if (meta !== undefined) {
    console[method](`[${scope}] ${message}`, formatMeta(meta));
    return;
  }

  console[method](`[${scope}] ${message}`);
};

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

  emitLog("log", scope, message, meta);
};

export const logStatus = (scope, message, meta = undefined) => {
  emitLog("log", scope, message, meta);
};

export const logWarn = (scope, message, meta = undefined) => {
  emitLog("warn", scope, message, meta);
};

export const logError = (scope, message, meta = undefined) => {
  emitLog("error", scope, message, meta);
};
