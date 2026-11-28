const normalizeBase = (value) => String(value || "").trim().replace(/\\/+$/, "");

export const resolveApiBaseUrl = (rawBase, { isProduction, isDevelopment }) => {
  const normalized = normalizeBase(rawBase);

  if (!normalized) {
    if (isProduction) {
      throw new Error("VITE_API_URL is required in production");
    }

    if (isDevelopment) {
      return "http://localhost:5000/api";
    }

    throw new Error("VITE_API_URL is required");
  }

  return normalized.endsWith("/api") ? normalized : `${normalized}/api`;
};

export const getApiBaseUrl = () => {
  return resolveApiBaseUrl(import.meta.env.VITE_API_URL, {
    isProduction: import.meta.env.PROD,
    isDevelopment: import.meta.env.DEV
  });
};
