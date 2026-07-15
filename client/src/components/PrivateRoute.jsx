import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import API from "../services/api";

const SESSION_VALIDATION_TTL_MS = 60 * 1000;
let lastValidationAt = 0;
let activeValidationPromise = null;

const validateSession = async () => {
  const now = Date.now();

  if (now - lastValidationAt < SESSION_VALIDATION_TTL_MS) {
    return true;
  }

  if (!activeValidationPromise) {
    activeValidationPromise = API.get("/auth/validate")
      .then(() => {
        lastValidationAt = Date.now();
        return true;
      })
      .catch(() => false)
      .finally(() => {
        activeValidationPromise = null;
      });
  }

  return activeValidationPromise;
};

export default function PrivateRoute({ children, adminOnly = false }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(user));

  useEffect(() => {
    let mounted = true;

    const runValidation = async () => {
      if (!user?.token) {
        if (mounted) {
          setIsAuthenticated(false);
          setIsChecking(false);
        }
        return;
      }

      const isValid = await validateSession();

      if (!mounted) return;

      if (!isValid) {
        localStorage.removeItem("user");
      }

      setIsAuthenticated(isValid);
      setIsChecking(false);
    };

    runValidation();

    return () => {
      mounted = false;
    };
  }, [user?.token]);

  if (isChecking) {
    return <div className="p-4 text-sm text-gray-500">Validating session...</div>;
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (adminOnly && !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
