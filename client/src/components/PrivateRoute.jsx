import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { bootstrapAuthSession } from "../utils/authBootstrap";
import { getStoredUser, storeUserProfile, clearStoredUser } from "../services/authSession";

export default function PrivateRoute({ children, adminOnly = false }) {
  const user = getStoredUser();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(user));
  const [sessionUser, setSessionUser] = useState(user);

  useEffect(() => {
    let mounted = true;

    const runValidation = async () => {
      const validatedUser = await bootstrapAuthSession();

      if (!mounted) return;

      if (validatedUser) {
        storeUserProfile(validatedUser);
        setSessionUser(validatedUser);
        setIsAuthenticated(true);
      } else {
        clearStoredUser();
        setSessionUser(null);
        setIsAuthenticated(false);
      }

      setIsChecking(false);
    };

    runValidation();

    return () => {
      mounted = false;
    };
  }, []);

  if (isChecking) {
    return <div className="p-4 text-sm text-gray-500">Validating session...</div>;
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (adminOnly && !["ADMIN", "SUPER_ADMIN"].includes(sessionUser?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
