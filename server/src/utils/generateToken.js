import jwt from "jsonwebtoken";

const getAccessTokenExpiresIn = () => process.env.JWT_EXPIRES_IN || "15m";
const getRefreshTokenExpiresIn = () => process.env.JWT_REFRESH_EXPIRES_IN || "7d";

export const generateToken = (id, expiresIn = getAccessTokenExpiresIn()) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn
  });
};

export const generateRefreshToken = (id, refreshTokenVersion, expiresIn = getRefreshTokenExpiresIn()) => {
  return jwt.sign({ id, version: refreshTokenVersion }, process.env.JWT_REFRESH_SECRET, {
    expiresIn
  });
};
