const REFRESH_COOKIE_NAME = "cybershield_refresh_token";
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const isProduction = process.env.NODE_ENV === "production";

const refreshCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/api/auth",
  maxAge: REFRESH_COOKIE_MAX_AGE_MS
};

export const getRefreshTokenFromRequest = (req) => {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;

  const cookiePair = cookieHeader
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${REFRESH_COOKIE_NAME}=`));

  if (!cookiePair) return null;

  return decodeURIComponent(cookiePair.slice(REFRESH_COOKIE_NAME.length + 1));
};

export const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);
};

export const clearRefreshTokenCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions);
};

export const refreshCookieName = REFRESH_COOKIE_NAME;