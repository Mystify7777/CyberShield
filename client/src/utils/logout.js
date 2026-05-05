import API from "../services/api";
import { clearAccessToken, clearStoredUser } from "../services/authSession";

export const performLogout = (navigate, redirectPath = "/login") => {
  clearAccessToken();
  clearStoredUser();
  void API.post("/auth/logout").catch(() => {
    // Logout should remain client-side safe even if the server session is already gone.
  });
  navigate(redirectPath);
};
