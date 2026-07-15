const normalizeBase = (value) => String(value || "").replace(/\/+$/, "");

export const getApiBaseUrl = () => {
  const rawBase = import.meta.env.VITE_API_URL;

  if (!rawBase) {
    return "http://localhost:5000/api";
  }

  const normalized = normalizeBase(rawBase);
  return normalized.endsWith("/api") ? normalized : `${normalized}/api`;
};

export const getAiServiceBaseUrl = () => {
  const rawBase = import.meta.env.VITE_AI_SERVICE_URL;

  if (!rawBase) {
    return "http://localhost:8000";
  }

  return normalizeBase(rawBase);
};
