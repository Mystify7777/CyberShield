export const PATHS = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  VERIFY_OTP: "/verify",
  FORGOT_PASSWORD: "/forgot-password",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  SETTINGS: "/settings",
  CREATE_REPORT: "/create-report",
  REPORTS: "/reports",
  AI: "/ai",
  TRUSTSCAN: "/trustscan",
  TRUSTSCAN_PROGRESS: "/trustscan/:id",
  TRUSTSCAN_REPORT: "/trustscan/:id/report",
  TRUSTSCAN_PUBLIC_REPORT: "/trustscan/report/:id/public",
  TRUSTSCAN_HISTORY: "/trustscan/history",
  ARTICLES: "/articles",
  ARTICLE_DETAIL: "/articles/:id",
  FORUM: "/forum",
  CREATE_FORUM_POST: "/forum/create",
  VIDEOS: "/videos",
  SUBMIT_VIDEO: "/videos/submit",
  MEMES: "/memes",
  UPLOAD_MEME: "/memes/upload",
  GAMES: "/games",
  ADMIN: "/admin",
  ADMIN_REPORTS: "/admin/reports",
  ADMIN_USERS: "/admin/users",
  ADMIN_ARTICLES: "/admin/articles",
  ADMIN_VIDEOS: "/admin/videos",
  ADMIN_MEMES: "/admin/memes",
  ADMIN_NOTIFICATIONS: "/admin/notifications",
  ADMIN_ERROR_LOGS: "/admin/error-logs",
  SERVER_ERROR: "/500"
};

export const NAV_SECTIONS = {
  guestCore: [
    { label: "AI Detector", path: PATHS.AI },
    { label: "TrustScan", path: PATHS.TRUSTSCAN },
    { label: "Report Incident", path: PATHS.CREATE_REPORT }
  ],
  guestCommunity: [
    { label: "Forum", path: PATHS.FORUM },
    { label: "Video Hub", path: PATHS.VIDEOS },
    { label: "Meme Hub", path: PATHS.MEMES },
    { label: "Phishing Game", path: PATHS.GAMES }
  ],
  core: [
    { label: "AI Detector", path: PATHS.AI },
    { label: "TrustScan", path: PATHS.TRUSTSCAN },
    { label: "Reports", path: PATHS.REPORTS }
  ],
  learn: [{ label: "Knowledge Hub", path: PATHS.ARTICLES }],
  community: [
    { label: "Forum", path: PATHS.FORUM },
    { label: "Video Hub", path: PATHS.VIDEOS },
    { label: "Meme Hub", path: PATHS.MEMES },
    { label: "Phishing Game", path: PATHS.GAMES }
  ],
  account: [
    { label: "Dashboard", path: PATHS.DASHBOARD },
    { label: "Profile", path: PATHS.PROFILE },
    { label: "Settings", path: PATHS.SETTINGS }
  ],
  admin: [
    { label: "Admin Dashboard", path: PATHS.ADMIN },
    { label: "Manage Users", path: PATHS.ADMIN_USERS },
    { label: "Moderation", path: PATHS.ADMIN_REPORTS },
    { label: "Video Moderation", path: PATHS.ADMIN_VIDEOS }
  ]
};
