import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { performLogout } from "../../utils/logout";
import { NAV_SECTIONS, PATHS } from "../../routes/routes.config";
import NavGroup from "./navbar/NavGroup";
import NavDropdown from "./navbar/NavDropdown";
import AccountMenu from "./navbar/AccountMenu";
import AdminMenu from "./navbar/AdminMenu";
import MobileMenu from "./navbar/MobileMenu";

export default function Navbar() {
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const navRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(user?.role);

  const toggleDropdown = (name) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
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

  const closeDropdownAndGo = (path) => {
    setActiveDropdown(null);
    navigate(path);
  };

  const GuestNav = ({ mobile = false }) => (
    <NavGroup className={mobile ? "pb-1" : ""}>
      <NavDropdown
        label="Core"
        dropdownKey="guest-core"
        activeDropdown={activeDropdown}
        onToggle={toggleDropdown}
        onNavigate={closeDropdownAndGo}
        widthClass="w-48"
        items={NAV_SECTIONS.guestCore}
      />

      <button onClick={() => navigate(PATHS.ARTICLES)} className="text-neutral-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-primary-100 transition-colors">Learn</button>

      <NavDropdown
        label="Community"
        dropdownKey="guest-community"
        activeDropdown={activeDropdown}
        onToggle={toggleDropdown}
        onNavigate={closeDropdownAndGo}
        widthClass="w-44"
        items={NAV_SECTIONS.guestCommunity}
      />

      <button onClick={() => navigate(PATHS.LOGIN)} className="text-neutral-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-primary-100 transition-colors">Login</button>
      <button onClick={() => navigate(PATHS.REGISTER)} className="btn btn-primary text-sm">Get Started</button>
    </NavGroup>
  );

  const UserNav = ({ mobile = false }) => (
    <NavGroup className={mobile ? "pb-1" : ""}>
      <NavDropdown
        label="Core"
        dropdownKey="core"
        activeDropdown={activeDropdown}
        onToggle={toggleDropdown}
        onNavigate={closeDropdownAndGo}
        widthClass="w-48"
        items={NAV_SECTIONS.core}
      />

      <NavDropdown
        label="Learn"
        dropdownKey="learn"
        activeDropdown={activeDropdown}
        onToggle={toggleDropdown}
        onNavigate={closeDropdownAndGo}
        widthClass="w-44"
        items={NAV_SECTIONS.learn}
      />

      <NavDropdown
        label="Community"
        dropdownKey="community"
        activeDropdown={activeDropdown}
        onToggle={toggleDropdown}
        onNavigate={closeDropdownAndGo}
        widthClass="w-44"
        items={NAV_SECTIONS.community}
      />

      <AccountMenu
        activeDropdown={activeDropdown}
        onToggle={toggleDropdown}
        onNavigate={closeDropdownAndGo}
        onLogout={() => performLogout(navigate)}
        items={NAV_SECTIONS.account}
      />

      {isAdmin && (
        <AdminMenu
          activeDropdown={activeDropdown}
          onToggle={toggleDropdown}
          onNavigate={closeDropdownAndGo}
          items={NAV_SECTIONS.admin}
        />
      )}
    </NavGroup>
  );

  return (
    <header ref={navRef} className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 dark:border-neutral-700 dark:bg-neutral-900/95 backdrop-blur-sm transition-colors">
      <div className="container-page py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <button onClick={() => navigate(PATHS.HOME)} className="text-xl font-bold text-primary-700 dark:text-primary-100 text-center sm:text-left">
          CyberShield
        </button>

        <div className="hidden sm:block">{!user ? <GuestNav /> : <UserNav />}</div>

        <MobileMenu>
          {!user ? <GuestNav mobile /> : <UserNav mobile />}
        </MobileMenu>
      </div>
    </header>
  );
}
