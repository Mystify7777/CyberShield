export const performLogout = (navigate, redirectPath = "/login") => {
  localStorage.clear();
  navigate(redirectPath);
};
