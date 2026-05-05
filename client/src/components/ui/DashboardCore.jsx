import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const LazyCharts = React.lazy(() => import("../dashboard/Charts"));

const tabLabel = {
  overview: "Overview",
  analytics: "Analytics",
  reports: "Reports",
  moderation: "Moderation"
};

const statusColor = {
  SUBMITTED: "bg-blue-100 text-blue-700",
  PENDING: "bg-blue-100 text-blue-700",
  UNDER_REVIEW: "bg-indigo-100 text-indigo-700",
  REVIEWED: "bg-indigo-100 text-indigo-700",
  INVESTIGATING: "bg-orange-100 text-orange-700",
  NEED_MORE_INFO: "bg-amber-100 text-amber-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-slate-200 text-slate-700",
  DUPLICATE: "bg-gray-100 text-gray-700",
  FALSE_POSITIVE: "bg-gray-100 text-gray-700",
  ESCALATED: "bg-red-100 text-red-700",
  SENSITIVE_HOLD: "bg-pink-100 text-pink-700",
  ARCHIVED: "bg-zinc-100 text-zinc-700"
};

const formatLabel = (value) =>
  value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());

export default function DashboardCore({ type, data }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [chartsLoaded, setChartsLoaded] = useState(false);

  const tabs = useMemo(
    () => (type === "admin" ? ["overview", "analytics", "moderation"] : ["overview", "analytics", "reports"]),
    [type]
  );

  useEffect(() => {
    if (activeTab === "analytics") {
      setChartsLoaded(true);
    }
  }, [activeTab]);

  const stats = data?.stats || {};
  const gamification = data?.gamification || {
    xp: 0,
    level: 1,
    streak: 0,
    badges: []
  };
  const dailyCap = 100;
  const dailyCoins = Number(gamification.dailyCoins || 0);
  const remainingDailyBudget = Math.max(0, dailyCap - dailyCoins);
  const nextUtcReset = new Date(
    Date.UTC(
      new Date().getUTCFullYear(),
      new Date().getUTCMonth(),
      new Date().getUTCDate() + 1,
      0,
      0,
      0
    )
  );
  const resetInMs = Math.max(0, nextUtcReset.getTime() - Date.now());
  const resetHours = Math.floor(resetInMs / (1000 * 60 * 60));
  const resetMinutes = Math.floor((resetInMs % (1000 * 60 * 60)) / (1000 * 60));
  const progressPercent = Math.min(100, Number(gamification.xp || 0) % 100);

  return (
    <div className="min-h-screen p-4 sm:p-6 text-neutral-900 dark:text-neutral-100 transition-colors">
      <div className="container-page">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1>
              {type === "admin" ? "Admin Dashboard" : "User Dashboard"}
            </h1>
            <p className="text-neutral-500 dark:text-neutral-300 text-sm">
              {type === "admin" ? "System overview and moderation" : "Your activity and insights"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {type === "user" && (
              <button
                type="button"
                onClick={() => navigate("/create-report")}
                className="btn btn-primary"
              >
                Create Report
              </button>
            )}
            <button
              type="button"
              onClick={() => toast("UI implementation pending")}
              className="btn btn-primary"
              title="Global dark mode implementation pending"
            >
              Dark Mode (Soon)
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6 border-b border-neutral-200 dark:border-neutral-700">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 text-sm ${
                activeTab === tab
                  ? "border-b-2 border-primary-600 text-primary-600 dark:text-primary-100"
                  : "text-neutral-500 dark:text-neutral-300"
              }`}
            >
              {tabLabel[tab]}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats).map(([key, value]) => (
              <div key={key} className="card text-center">
                <p className="text-sm text-neutral-500 dark:text-neutral-300 capitalize">{formatLabel(key)}</p>
                <h2 className="text-2xl sm:text-3xl font-bold">{value}</h2>
              </div>
            ))}

            {type === "user" && (
              <>
                <div className="card col-span-2">
                  <h3 className="text-xl font-semibold mb-2">Your Progress</h3>

                  <p>Level {gamification.level}</p>
                  <p>XP: {gamification.xp}</p>
                  <p>🪙 Coins: {Number(gamification.coins || 0)}</p>
                  <p>Daily Coins: {dailyCoins}/{dailyCap}</p>
                  <p>🔥 Streak: {gamification.streak} day{gamification.streak === 1 ? "" : "s"}</p>
                  <p>Your best meme got {Number(stats.topMemeLikes || 0)} likes</p>
                  <div className="mt-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 py-2 text-sm">
                    <p className="font-medium text-neutral-700 dark:text-neutral-200">Wallet Snapshot</p>
                    <p>Remaining daily earn budget: {remainingDailyBudget}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Next reset in ~{resetHours}h {resetMinutes}m (UTC)</p>
                  </div>
                  {Number(gamification.coins || 0) < 3 && (
                    <p className="text-red-500 text-xs mt-1">Low coins! Earn more by engaging.</p>
                  )}
                  {dailyCoins >= dailyCap && (
                    <p className="text-amber-600 text-xs mt-1">Daily coin cap reached. Rewards reset tomorrow.</p>
                  )}

                  <div className="w-full bg-neutral-200 dark:bg-neutral-700 h-2 rounded-xl mt-2">
                    <div
                      className="bg-primary-600 h-2 rounded-xl"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="card col-span-2">
                  <h3 className="text-xl font-semibold mb-2">Badges</h3>

                  {Array.isArray(gamification.badges) && gamification.badges.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {gamification.badges.map((badge, index) => (
                        <span
                          key={`${badge.name}-${index}`}
                          className="px-3 py-1 bg-yellow-400 rounded-xl text-sm"
                        >
                          {badge.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-500 dark:text-neutral-300">No badges earned yet.</p>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "analytics" && (
          <div>
            {!chartsLoaded ? (
              <p className="text-neutral-500 dark:text-neutral-300">Loading analytics...</p>
            ) : (
              <Suspense fallback={<p className="text-neutral-500 dark:text-neutral-300">Loading charts...</p>}>
                <LazyCharts data={data} type={type} />
              </Suspense>
            )}
          </div>
        )}

        {activeTab === "reports" && (
          <div className="space-y-3">
            {(data?.recentReports || []).length === 0 ? (
              <div className="card text-sm text-neutral-500 dark:text-neutral-300">No recent reports available.</div>
            ) : (
              data.recentReports.map((report) => (
                <div key={report._id} className="card">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-xl font-semibold wrap-break-word">{report.title}</h3>
                    <span className={`px-2 py-1 rounded-xl text-xs font-semibold ${statusColor[report.status] || "bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-100"}`}>
                      {report.status}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-300 mt-1">{report.category}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "moderation" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="text-xl font-semibold mb-3">Pending Reports</h3>
              {(data?.moderation?.pendingReports || []).length === 0 ? (
                <p className="text-sm text-neutral-500 dark:text-neutral-300">No pending reports.</p>
              ) : (
                <div className="space-y-2">
                  {data.moderation.pendingReports.map((report) => (
                    <div key={report._id} className="rounded-xl border border-neutral-200 dark:border-neutral-700 px-3 py-2">
                      <p className="font-medium text-sm wrap-break-word">{report.title}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-300">{report.category}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold mb-3">Pending Articles</h3>
              {(data?.moderation?.pendingArticles || []).length === 0 ? (
                <p className="text-sm text-neutral-500 dark:text-neutral-300">No pending articles.</p>
              ) : (
                <div className="space-y-2">
                  {data.moderation.pendingArticles.map((article) => (
                    <div key={article._id} className="rounded-xl border border-neutral-200 dark:border-neutral-700 px-3 py-2">
                      <p className="font-medium text-sm wrap-break-word">{article.title}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-300">{article.category}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
