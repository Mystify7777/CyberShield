import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { performLogout } from "../../utils/logout";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const dailyCoins = Number(user?.dailyCoins || 0);
  const dailyCap = 100;
  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(user?.role);

  const isActivePath = (path) => location.pathname === path;
  const isSectionActive = (paths) => paths.some((path) => location.pathname === path);

  const linkClass = (active = false) =>
    [
      "relative rounded-xl px-3 py-2 font-medium transition-all duration-200 hover:-translate-y-px hover:bg-neutral-100 hover:text-primary-600 dark:hover:bg-neutral-800 dark:hover:text-primary-100",
      active
        ? "bg-primary-50 text-primary-700 ring-1 ring-primary-200 dark:bg-primary-900/30 dark:text-primary-100 dark:ring-primary-700/40"
        : "text-neutral-700 dark:text-neutral-200"
    ].join(" ");

  const dropdownButtonClass = (active = false) =>
    [
      "relative rounded-xl px-3 py-2 pr-8 font-medium transition-all duration-200 hover:-translate-y-px hover:bg-neutral-100 hover:text-primary-600 dark:hover:bg-neutral-800 dark:hover:text-primary-100",
      active
        ? "bg-primary-50 text-primary-700 ring-1 ring-primary-200 dark:bg-primary-900/30 dark:text-primary-100 dark:ring-primary-700/40"
        : "text-neutral-700 dark:text-neutral-200"
    ].join(" ");

  const dropdownPanelClass = "absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg ring-1 ring-black/5 dark:border-neutral-700 dark:bg-neutral-800 animate-dropdown-in z-20";
  const dropdownItemClass = "block w-full text-left px-3 py-2 text-sm transition-colors duration-200 hover:bg-neutral-50 hover:text-primary-600 dark:hover:bg-neutral-700 dark:hover:text-primary-100";

  const toggleDropdown = (name) => {
    setActiveDropdown((current) => (current === name ? null : name));
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!navRef.current?.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const publicLinks = [
    { label: "Core", path: "/ai" },
    { label: "Learn", path: "/articles" },
    { label: "Community", path: "/forum" },
    { label: "Account", path: "/login" },
    { label: "Admin", path: "/login" }
  ];

  const signedInLinks = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Scam Detector", path: "/ai" }
  ];

  return (
    <header ref={navRef} className="sticky top-0 z-40 bg-white/95 shadow-sm dark:bg-neutral-900/95 backdrop-blur-xl transition-colors ring-1 ring-neutral-200/70 dark:ring-neutral-700/70">
      <div className="container-page py-2 flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
        <button
          onClick={() => navigate("/")}
          className="text-3xl font-bold text-primary-700 dark:text-primary-100 text-center sm:text-left transition-all duration-200 hover:opacity-90 hover:-translate-y-px"
        >
          CyberShield
        </button>

        {!user ? (
          <div className="w-full sm:w-auto flex flex-wrap items-center justify-center sm:justify-end gap-4 text-sm">
            {publicLinks.map((item) => (
              <button
                key={`${item.label}-${item.path}`}
                onClick={() => navigate(item.path)}
                className="text-slate-600 transition-colors duration-200 hover:text-blue-600"
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="w-full sm:w-auto flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3 text-sm">
            {signedInLinks.map((item) => (
              <button key={item.path} onClick={() => navigate(item.path)} className={linkClass(isActivePath(item.path))}>
                <span className="inline-flex items-center gap-2">
                  {item.label}
                  {isActivePath(item.path) && <span className="h-2 w-2 rounded-full bg-primary-500" aria-hidden="true" />}
                </span>
              </button>
            ))}

            <span className="font-semibold text-amber-600 rounded-xl px-3 py-2 transition-all duration-200 hover:bg-amber-50 dark:hover:bg-amber-500/10">
              🪙 {Number(user.coins || 0)}
              <span className="ml-2 text-xs text-slate-500">Today: {dailyCoins}/{dailyCap}</span>
            </span>

            <div className="relative">
              <button
                type="button"
                className={dropdownButtonClass(activeDropdown === "activity" || isSectionActive(["/create-report", "/reports", "/forum"]))}
                onClick={() => toggleDropdown("activity")}
                aria-expanded={activeDropdown === "activity"}
              >
                Activity
                <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs transition-transform duration-200 ${activeDropdown === "activity" ? "rotate-180" : ""}`}>
                  ▾
                </span>
              </button>
              {activeDropdown === "activity" && (
                <div className={dropdownPanelClass}>
                  <button className={dropdownItemClass} onClick={() => { setActiveDropdown(null); navigate("/create-report"); }}>Create Report</button>
                  <button className={dropdownItemClass} onClick={() => { setActiveDropdown(null); navigate("/reports"); }}>Reports</button>
                  <button className={dropdownItemClass} onClick={() => { setActiveDropdown(null); navigate("/forum"); }}>Forum</button>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                className={dropdownButtonClass(activeDropdown === "learn" || isSectionActive(["/articles", "/videos", "/memes", "/videos/submit", "/memes/upload", "/games"]))}
                onClick={() => toggleDropdown("learn")}
                aria-expanded={activeDropdown === "learn"}
              >
                Learn
                <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs transition-transform duration-200 ${activeDropdown === "learn" ? "rotate-180" : ""}`}>
                  ▾
                </span>
              </button>
              {activeDropdown === "learn" && (
                <div className={`${dropdownPanelClass} w-52`}>
                  <button className={dropdownItemClass} onClick={() => { setActiveDropdown(null); navigate("/articles"); }}>Knowledge Hub</button>
                  <button className={dropdownItemClass} onClick={() => { setActiveDropdown(null); navigate("/videos"); }}>Video Hub</button>
                  <button className={dropdownItemClass} onClick={() => { setActiveDropdown(null); navigate("/memes"); }}>Meme Hub</button>
                  <button className={dropdownItemClass} onClick={() => { setActiveDropdown(null); navigate("/videos/submit"); }}>Submit Video</button>
                  <button className={dropdownItemClass} onClick={() => { setActiveDropdown(null); navigate("/memes/upload"); }}>Upload Meme</button>
                  <button className={dropdownItemClass} onClick={() => { setActiveDropdown(null); navigate("/games"); }}>Phishing Detector Game</button>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                className={dropdownButtonClass(activeDropdown === "account" || isSectionActive(["/profile", "/settings"]))}
                onClick={() => toggleDropdown("account")}
                aria-expanded={activeDropdown === "account"}
              >
                Account
                <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs transition-transform duration-200 ${activeDropdown === "account" ? "rotate-180" : ""}`}>
                  ▾
                </span>
              </button>
              {activeDropdown === "account" && (
                <div className={`${dropdownPanelClass} w-36`}>
                  <button className={dropdownItemClass} onClick={() => { setActiveDropdown(null); navigate("/profile"); }}>Profile</button>
                  <button className={dropdownItemClass} onClick={() => { setActiveDropdown(null); navigate("/settings"); }}>Settings</button>
                </div>
              )}
            </div>

            {isAdmin && (
              <div className="relative">
                <button
                  type="button"
                  className={dropdownButtonClass(activeDropdown === "admin" || isSectionActive(["/admin", "/admin/users", "/admin/reports", "/admin/videos"]))}
                  onClick={() => toggleDropdown("admin")}
                  aria-expanded={activeDropdown === "admin"}
                >
                  Admin
                  <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs transition-transform duration-200 ${activeDropdown === "admin" ? "rotate-180" : ""}`}>
                    ▾
                  </span>
                </button>
                {activeDropdown === "admin" && (
                  <div className={`${dropdownPanelClass} w-44`}>
                    <button className={dropdownItemClass} onClick={() => { setActiveDropdown(null); navigate("/admin"); }}>Admin Dashboard</button>
                    <button className={dropdownItemClass} onClick={() => { setActiveDropdown(null); navigate("/admin/users"); }}>Manage Users</button>
                    <button className={dropdownItemClass} onClick={() => { setActiveDropdown(null); navigate("/admin/reports"); }}>Moderation</button>
                    <button className={dropdownItemClass} onClick={() => { setActiveDropdown(null); navigate("/admin/videos"); }}>Video Moderation</button>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => performLogout(navigate)}
              className="rounded-xl px-3 py-2 font-medium text-red-500 transition-all duration-200 hover:-translate-y-px hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
            >
              Logout
            </button>
          </div>
        )}

        {user && Number(user.coins || 0) < 3 && (
          <p className="text-red-500 text-xs text-center sm:text-right w-full sm:w-auto">
            Low coins! Earn more by engaging.
          </p>
        )}

        {user && dailyCoins >= dailyCap && (
          <p className="text-amber-600 text-xs text-center sm:text-right w-full sm:w-auto">
            Daily earn cap reached. More rewards unlock tomorrow.
          </p>
        )}
      </div>
    </header>
  );
}
