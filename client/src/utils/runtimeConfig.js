const normalizeBase = (value) => String(value || "").replace(/\\/+$/, "");

export const getApiBaseUrl = () => {
  const rawBase = import.meta.env.VITE_API_URL;

  if (!rawBase) {
    return "http://localhost:5000/api";
  }

  const normalized = normalizeBase(rawBase);
  return normalized.endsWith("/api") ? normalized : `${normalized}/api`;
};
