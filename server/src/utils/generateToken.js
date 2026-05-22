import jwt from "jsonwebtoken";

const getAccessTokenExpiresIn = () => process.env.JWT_EXPIRES_IN || "15m";
const getRefreshTokenExpiresIn = () => process.env.JWT_REFRESH_EXPIRES_IN || "7d";
const JWT_ISSUER = process.env.JWT_ISSUER || "cybershield";

const assertJwtSecrets = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET missing");
  }

  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET missing");
  }
};

// ─────────────────────────────────────────────
// INPUT VALIDATION
// ─────────────────────────────────────────────
const assertValidUserId = (id) => {
  if (
    id === undefined ||
    id === null
  ) {
    throw new Error(
      "Valid user id required"
    );
  }

  const normalized =
    String(id).trim();

  if (
    !normalized ||
    normalized === "undefined" ||
    normalized === "null"
  ) {
    throw new Error(
      "Valid user id required"
    );
  }
};

// ─────────────────────────────────────────────
// GENERATORS
// ─────────────────────────────────────────────
export const generateToken = (id, expiresIn = getAccessTokenExpiresIn()) => {
  assertJwtSecrets();

  // Validate raw input BEFORE coercion
  assertValidUserId(id);

  const normalizedId =
    String(id);

  return jwt.sign(
    {
      id: normalizedId,
      tokenType: "access"
    },
    process.env.JWT_SECRET,
    {
      expiresIn,
      algorithm: "HS256",
      issuer: JWT_ISSUER
    }
  );
};

export const generateRefreshToken = (
  id,
  refreshTokenVersion,
  expiresIn = getRefreshTokenExpiresIn()
) => {
  assertJwtSecrets();

  // Validate raw input BEFORE coercion
  assertValidUserId(id);

  const normalizedId =
    String(id);

  const version = Number(refreshTokenVersion);
  if (!Number.isInteger(version) || version < 0) {
    throw new Error("Valid refresh token version required");
  }

  return jwt.sign(
    {
      id: normalizedId,
      version,
      tokenType: "refresh"
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn,
      algorithm: "HS256",
      issuer: JWT_ISSUER
    }
  );
};
