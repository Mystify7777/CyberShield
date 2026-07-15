import jwt from "jsonwebtoken";

export const generateToken = (id) => {
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "24h";

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: jwtExpiresIn
  });
};
