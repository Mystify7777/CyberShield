const USER_STORAGE_KEY = "user";

let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token || null;
};

export const getAccessToken = () => accessToken;

export const clearAccessToken = () => {
  accessToken = null;
};

export const getStoredUser = () => {
  try {
    const rawUser = localStorage.getItem(USER_STORAGE_KEY);
    if (!rawUser) return null;

    const parsedUser = JSON.parse(rawUser);
    if (!parsedUser || typeof parsedUser !== "object") {
      return null;
    }

    delete parsedUser.token;
    delete parsedUser.accessToken;
    return parsedUser;
  } catch {
    return null;
  }
};

export const storeUserProfile = (user) => {
  if (!user) {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }

  const nextUser = { ...user };
  delete nextUser.token;
  delete nextUser.accessToken;

  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
  return nextUser;
};

export const clearStoredUser = () => {
  localStorage.removeItem(USER_STORAGE_KEY);
};