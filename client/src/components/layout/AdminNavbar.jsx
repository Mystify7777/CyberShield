import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../../services/api";
import { performLogout } from "../../utils/logout";

export default function AdminNavbar() {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();

    const intervalId = setInterval(fetchUnreadCount, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const { data } = await API.get("/notifications");
      const unread = data.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      // Keep navbar resilient even if notifications API fails.
      setUnreadCount(0);
    }
  };

  return (
    <div className="bg-white/95 dark:bg-neutral-900/95 border-b border-neutral-200 dark:border-neutral-700 shadow-xs px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 transition-colors">
      <h1 className="text-xl font-semibold text-primary-700 dark:text-primary-100 text-center sm:text-left">Admin Panel</h1>

      <div className="w-full sm:w-auto flex flex-wrap items-center justify-center sm:justify-end gap-3 text-sm text-neutral-700 dark:text-neutral-200">
        <button className="hover:text-primary-600 dark:hover:text-primary-100 transition-colors" onClick={() => navigate("/admin")}>Dashboard</button>
        <button className="hover:text-primary-600 dark:hover:text-primary-100 transition-colors" onClick={() => navigate("/admin/reports")}>Reports</button>
        <button className="hover:text-primary-600 dark:hover:text-primary-100 transition-colors" onClick={() => navigate("/admin/users")}>Users</button>
        <button className="hover:text-primary-600 dark:hover:text-primary-100 transition-colors" onClick={() => navigate("/admin/articles")}>Articles</button>
        <button className="hover:text-primary-600 dark:hover:text-primary-100 transition-colors" onClick={() => navigate("/admin/videos")}>Videos</button>
        <button className="hover:text-primary-600 dark:hover:text-primary-100 transition-colors" onClick={() => navigate("/admin/memes")}>Memes</button>
        <button className="hover:text-primary-600 dark:hover:text-primary-100 transition-colors" onClick={() => navigate("/admin/error-logs")}>Error Logs</button>
        <button className="hover:text-primary-600 dark:hover:text-primary-100 transition-colors relative" onClick={() => navigate("/admin/notifications")}>
          🔔
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 leading-none">
              {unreadCount}
            </span>
          )}
        </button>
        <button className="hover:text-red-500 transition-colors" onClick={() => performLogout(navigate)}>Logout</button>
      </div>
    </div>
  );
}
