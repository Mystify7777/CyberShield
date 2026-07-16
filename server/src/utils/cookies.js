const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";
const isProduction = process.env.NODE_ENV === "production";

// Keep this in sync with JWT_REFRESH_EXPIRES_IN in utils/generateToken.js (default "7d").
const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const getRefreshTokenCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction,
  // "none" is required for cross-site cookies (e.g. Vercel frontend -> Render backend)
  // but browsers require secure:true whenever sameSite is "none".
  sameSite: isProduction ? "none" : "lax",
  // Scope the cookie to auth endpoints only, so it isn't sent on every request.
  path: "/api/auth"
});

export const setRefreshTokenCookie = (res, token) => {
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, token, {
    ...getRefreshTokenCookieOptions(),
    maxAge: REFRESH_TOKEN_MAX_AGE_MS
  });
};

export const clearRefreshTokenCookie = (res) => {
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, getRefreshTokenCookieOptions());
};

export const getRefreshTokenFromRequest = (req) => {
  return req.cookies?.[REFRESH_TOKEN_COOKIE_NAME] || null;
};
