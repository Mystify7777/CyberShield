import API from "../services/api";
import { storeUserProfile } from "../services/authSession";

export const bootstrapAuthSession = async () => {
  try {
    const { data } = await API.get("/auth/validate");

    if (data?.user) {
      storeUserProfile(data.user);
      return data.user;
    }
  } catch {
    // Silent bootstrap: public pages should still render if session restoration fails.
  }

  return null;
};