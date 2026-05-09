const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");

export const getAssetUrl = (path) => {
  if (!path || typeof path !== "string") return "";

  if (!path.startsWith("/")) return "";

  if (path.includes("://") || path.startsWith("//")) return "";

  return `${API_BASE}${path}`;
};