const HTTP_URL_PATTERN = /^https?:\\/\\//i;
const SCHEME_PATTERN = /^[a-z][a-z0-9+.-]*:/i;

/**
 * Resolve backend-served asset paths without coupling them to the API route.
 *
 * Relative asset paths are served from the frontend origin so production
 * routing can handle them through /uploads/* without producing /api/uploads/*.
 */
export const getAssetUrl = (path) => {
  if (!path) return "";

  const value = String(path).trim();
  if (!value) return "";

  if (HTTP_URL_PATTERN.test(value)) {
    return value;
  }

  // Reject protocol-relative and non-HTTP schemes. Asset paths must not turn
  // into arbitrary external or executable URLs.
  if (value.startsWith("//") || SCHEME_PATTERN.test(value)) {
    return "";
  }

  return value.startsWith("/") ? value : `/${value}`;
};
