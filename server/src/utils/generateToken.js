import jwt from "jsonwebtoken";

// ─────────────────────────────────────────────
// FAIL FAST
// ─────────────────────────────────────────────
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET missing");
}

if (!process.env.JWT_REFRESH_SECRET) {
  throw new Error("JWT_REFRESH_SECRET missing");
}

const getAccessTokenExpiresIn = () => process.env.JWT_EXPIRES_IN || "15m";
const getRefreshTokenExpiresIn = () => process.env.JWT_REFRESH_EXPIRES_IN || "7d";

// ─────────────────────────────────────────────
// INPUT VALIDATION
// ─────────────────────────────────────────────
const assertValidUserId = (id) => {
  if (typeof id !== "string" || !id.trim()) {
    throw new Error("Valid user id required");
  }
};

// ─────────────────────────────────────────────
// GENERATORS
// ─────────────────────────────────────────────
export const generateToken = (id, expiresIn = getAccessTokenExpiresIn()) => {
  // Validate raw input BEFORE coercion
  assertValidUserId(id);

  return jwt.sign(
    {
      id: String(id)
    },
    process.env.JWT_SECRET,
    {
      expiresIn,
      algorithm: "HS256",
      issuer: "cybershield"
    }
  );
};

export const generateRefreshToken = (
  id,
  refreshTokenVersion,
  expiresIn = getRefreshTokenExpiresIn()
) => {
  // Validate raw input BEFORE coercion
  assertValidUserId(id);

  const version = Number(refreshTokenVersion);
  if (!Number.isInteger(version) || version < 0) {
    throw new Error("Valid refresh token version required");
  }

  return jwt.sign(
    {
      id: String(id),
      version
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn,
      algorithm: "HS256",
      issuer: "cybershield"
    }
  );
};
