import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "Not authorized" });
      }

      if (req.user.isSuspended) {
        return res.status(403).json({ message: "Account suspended" });
      }

      return next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
};

export const optionalProtect = async (req, res, next) => {
  if (!req.headers.authorization?.startsWith("Bearer")) {
    return next();
  }

  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (user && !user.isSuspended) {
      req.user = user;
    }
  } catch (error) {
    // Keep endpoint public even if token is invalid.
  }

  return next();
};
