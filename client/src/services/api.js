import axios from "axios";
import { saveErrorContext } from "../utils/errorReporter";
import { getApiBaseUrl } from "../utils/runtimeConfig";
import {
  clearAccessToken,
  clearStoredUser,
  getAccessToken,
  setAccessToken,
  storeUserProfile
} from "./authSession";

const API = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true
});

// Attach token automatically
API.interceptors.request.use((req) => {
  const accessToken = getAccessToken();

  if (accessToken) {
    req.headers.Authorization = `Bearer ${accessToken}`;
  }

  req.withCredentials = true;
  return req;
});

const authEndpoints = [
  "/auth/login",
  "/auth/register",
  "/auth/verify-otp",
  "/auth/resend-otp",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/refresh",
  "/auth/logout"
];

const isAuthEndpoint = (requestUrl = "") => authEndpoints.some((endpoint) => requestUrl.includes(endpoint));

let refreshAuthPromise = null;

const refreshAuthSession = async () => {
  if (!refreshAuthPromise) {
    refreshAuthPromise = API.post("/auth/refresh", {}, { skipAuthRefresh: true })
      .then((response) => {
        const payload = response.data;

        if (payload?.accessToken) {
          setAccessToken(payload.accessToken);
        }

        if (payload?.user) {
          storeUserProfile(payload.user);
        }

        return payload;
      })
      .catch((error) => {
        clearAccessToken();
        clearStoredUser();
        throw error;
      })
      .finally(() => {
        refreshAuthPromise = null;
      });
  }

  return refreshAuthPromise;
};

API.interceptors.response.use(
  (response) => {
    const payload = response.data;

    if (payload && typeof payload === "object" && "success" in payload) {
      response.data = payload.data;

      if (response.data?.accessToken) {
        setAccessToken(response.data.accessToken);
      }

      if (response.data?.user) {
        storeUserProfile(response.data.user);
      }
    }

    return response;
  },
  async (error) => {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url || "";
    const isReportingCall = requestUrl.includes("/system/client-errors");
    const isServerError = Number.isInteger(status) && status >= 500 && status <= 599;
    const shouldAttemptRefresh =
      status === 401 &&
      !error?.config?.skipAuthRefresh &&
      !error?.config?._retry &&
      !isAuthEndpoint(requestUrl);

    saveErrorContext({
      source: "API",
      message: error?.response?.data?.message || error?.message || "API request failed",
      stack: error?.stack,
      path: window.location.pathname,
      method: error?.config?.method?.toUpperCase(),
      statusCode: status
    });


    if (shouldAttemptRefresh) {
      error.config._retry = true;

      try {
        await refreshAuthSession();
        return API(error.config);
      } catch {
        clearAccessToken();
        clearStoredUser();
      }
    }
    if (
      !isReportingCall &&
      isServerError &&
      typeof window !== "undefined" &&
      window.location.pathname !== "/500"
    ) {
      window.location.assign("/500");
    }

    return Promise.reject(error);
  }
);

export default API;
