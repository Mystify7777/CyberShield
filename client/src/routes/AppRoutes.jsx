import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/public/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import VerifyOTP from "../pages/auth/VerifyOTP";
import ForgotPassword from "../pages/auth/ForgotPassword";
import Dashboard from "../pages/dashboard/Dashboard";
import Profile from "../pages/profile/Profile";
import Settings from "../pages/account/Settings";
import CreateReport from "../pages/reports/CreateReport";
import ViewReports from "../pages/reports/ViewReports";
import ScamDetector from "../pages/ai/ScamDetector";
import TrustScanLanding from "../pages/trustscan/TrustScanLanding";
import TrustScanProgress from "../pages/trustscan/TrustScanProgress";
import TrustScanReport from "../pages/trustscan/TrustScanReport";
import PublicTrustScanReport from "../pages/trustscan/PublicTrustScanReport";
import TrustScanHistory from "../pages/trustscan/TrustScanHistory";
import Articles from "../pages/knowledge/Articles";
import ArticleDetail from "../pages/knowledge/ArticleDetail";
import Forum from "../pages/forum/Forum";
import CreatePost from "../pages/forum/CreatePost";
import VideoHub from "../pages/video/VideoHub";
import SubmitVideo from "../pages/video/SubmitVideo";
import MemeHub from "../pages/fun/MemeHub";
import SubmitMeme from "../pages/fun/SubmitMeme";
import PhishingGame from "../pages/games/PhishingGame";
import ManageReports from "../pages/admin/ManageReports";
import ManageUsers from "../pages/admin/ManageUsers";
import ManageArticles from "../pages/admin/ManageArticles";
import VideoModeration from "../pages/admin/VideoModeration";
import MemeModeration from "../pages/admin/MemeModeration";
import Notifications from "../pages/admin/Notifications";
import ErrorLogs from "../pages/admin/ErrorLogs";
import NotFound from "../pages/errors/NotFound";
import ServerError from "../pages/errors/ServerError";
import PrivateRoute from "../components/PrivateRoute";
import { PATHS } from "./routes.config";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={PATHS.HOME} element={<Home />} />
        <Route path={PATHS.LOGIN} element={<Login />} />
        <Route path={PATHS.REGISTER} element={<Register />} />
        <Route path={PATHS.VERIFY_OTP} element={<VerifyOTP />} />
        <Route path={PATHS.FORGOT_PASSWORD} element={<ForgotPassword />} />
        <Route
          path={PATHS.DASHBOARD}
          element={<PrivateRoute><Dashboard /></PrivateRoute>}
        />
        <Route
          path={PATHS.PROFILE}
          element={<PrivateRoute><Profile /></PrivateRoute>}
        />
        <Route
          path={PATHS.SETTINGS}
          element={<PrivateRoute><Settings /></PrivateRoute>}
        />
        <Route
          path={PATHS.CREATE_REPORT}
          element={<PrivateRoute><CreateReport /></PrivateRoute>}
        />
        <Route
          path={PATHS.REPORTS}
          element={<ViewReports />}
        />
        <Route
          path={PATHS.AI}
          element={<ScamDetector />}
        />
        <Route
          path={PATHS.TRUSTSCAN}
          element={<PrivateRoute><TrustScanLanding /></PrivateRoute>}
        />
        <Route
          path={PATHS.TRUSTSCAN_PROGRESS}
          element={<PrivateRoute><TrustScanProgress /></PrivateRoute>}
        />
        <Route
          path={PATHS.TRUSTSCAN_REPORT}
          element={<PrivateRoute><TrustScanReport /></PrivateRoute>}
        />
        <Route
          path={PATHS.TRUSTSCAN_PUBLIC_REPORT}
          element={<PublicTrustScanReport />}
        />
        <Route
          path={PATHS.TRUSTSCAN_HISTORY}
          element={<PrivateRoute><TrustScanHistory /></PrivateRoute>}
        />
        <Route
          path={PATHS.ARTICLES}
          element={<Articles />}
        />
        <Route
          path={PATHS.ARTICLE_DETAIL}
          element={<ArticleDetail />}
        />
        <Route
          path={PATHS.FORUM}
          element={<Forum />}
        />
        <Route
          path={PATHS.VIDEOS}
          element={<VideoHub />}
        />
        <Route
          path={PATHS.MEMES}
          element={<MemeHub />}
        />
        <Route
          path={PATHS.SUBMIT_VIDEO}
          element={<PrivateRoute><SubmitVideo /></PrivateRoute>}
        />
        <Route
          path={PATHS.UPLOAD_MEME}
          element={<PrivateRoute><SubmitMeme /></PrivateRoute>}
        />
        <Route
          path={PATHS.GAMES}
          element={<PrivateRoute><PhishingGame /></PrivateRoute>}
        />
        <Route
          path={PATHS.CREATE_FORUM_POST}
          element={<PrivateRoute><CreatePost /></PrivateRoute>}
        />
        <Route
          path={PATHS.ADMIN}
          element={<PrivateRoute adminOnly={true}><Dashboard /></PrivateRoute>}
        />
        <Route
          path={PATHS.ADMIN_REPORTS}
          element={<PrivateRoute adminOnly={true}><ManageReports /></PrivateRoute>}
        />
        <Route
          path={PATHS.ADMIN_USERS}
          element={<PrivateRoute adminOnly={true}><ManageUsers /></PrivateRoute>}
        />
        <Route
          path={PATHS.ADMIN_ARTICLES}
          element={<PrivateRoute adminOnly={true}><ManageArticles /></PrivateRoute>}
        />
        <Route
          path={PATHS.ADMIN_VIDEOS}
          element={<PrivateRoute adminOnly={true}><VideoModeration /></PrivateRoute>}
        />
        <Route
          path={PATHS.ADMIN_MEMES}
          element={<PrivateRoute adminOnly={true}><MemeModeration /></PrivateRoute>}
        />
        <Route
          path={PATHS.ADMIN_NOTIFICATIONS}
          element={<PrivateRoute adminOnly={true}><Notifications /></PrivateRoute>}
        />
        <Route
          path={PATHS.ADMIN_ERROR_LOGS}
          element={<PrivateRoute adminOnly={true}><ErrorLogs /></PrivateRoute>}
        />
        <Route path={PATHS.SERVER_ERROR} element={<ServerError />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
