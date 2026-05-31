import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { API_BASE } from "../config/api";
import { getAuthToken } from "../context/authToken";
import { useAuth } from "../context/useAuth";

const links = [
  { to: "/dashboard", label: "Overview", icon: "fa-house", end: true },
  { to: "/dashboard/islands", label: "Islands", icon: "fa-location-dot" },
  { to: "/dashboard/status", label: "Island Status", icon: "fa-signal" },
  { to: "/dashboard/logs", label: "XLog Reports", icon: "fa-clipboard-list" },
  { to: "/dashboard/analytics", label: "Analytics", icon: "fa-chart-line" },
  { to: "/dashboard/database", label: "Database", icon: "fa-database" },
];

const apiLinks = [
  { href: `${API_BASE}/dashboard/api/islands`, label: "/api/islands" },
  { href: `${API_BASE}/dashboard/api/analytics`, label: "/api/analytics" },
  { href: `${API_BASE}/dashboard/api/logs`, label: "/api/logs" },
];

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("sb-collapsed") === "1");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState("");

  const pageTitle = useMemo(() => {
    const match = [...links].reverse().find((link) => {
      if (link.end) return location.pathname === link.to;
      return location.pathname.startsWith(link.to);
    });
    return match?.label || "Dashboard";
  }, [location.pathname]);

  useEffect(() => {
    localStorage.setItem("sb-collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => {
    if (window.innerWidth <= 767) {
      setMobileOpen((open) => !open);
      return;
    }
    setCollapsed((value) => !value);
  };

  const refreshCache = async () => {
    const token = getAuthToken();
    setRefreshing(true);
    setNotice("");
    try {
      const response = await fetch(`${API_BASE}/api/refresh`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(String(payload?.error || "Refresh failed"));
      setNotice("API cache refresh started.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Refresh failed");
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      <div className={`sidebar-overlay ${mobileOpen ? "active" : ""}`} onClick={() => setMobileOpen(false)} />
      <div className="d-flex dashboard-shell">
        <aside className={`db-sidebar ${collapsed ? "sb-collapsed" : ""} ${mobileOpen ? "sb-open" : ""}`}>
          <div className="sidebar-brand">
            <div className="logo-box flex-shrink-0">
              <img src="https://cdn.chopaeng.com/logo.webp" alt="ChoBot" className="dashboard-logo" />
            </div>
            <div className="brand-text">
              <div className="ac-font fw-bold text-nook-green dashboard-brand-title">ChoBot</div>
              <div className="x-small text-muted fw-bold">Mod Dashboard</div>
            </div>
          </div>

          <nav className="flex-grow-1 p-3">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => `nav-pill-link ${isActive ? "active" : ""}`}
                title={link.label}
              >
                <i className={`fa-solid ${link.icon}`} />
                <span className="link-text">{link.label}</span>
              </NavLink>
            ))}

            <div className="sidebar-section-label mt-3">API</div>
            {apiLinks.map((link) => (
              <a key={link.href} href={link.href} className="nav-pill-link small" target="_blank" rel="noreferrer" title={link.label}>
                <i className="fa-solid fa-link" />
                <span className="link-text">{link.label}</span>
              </a>
            ))}
          </nav>

          <div className="p-3 border-top dashboard-sidebar-footer">
            <button type="button" className="nav-pill-link dashboard-logout" onClick={handleLogout} title="Logout">
              <i className="fa-solid fa-right-from-bracket" />
              <span className="link-text">Logout</span>
            </button>
          </div>
        </aside>

        <div className="db-main flex-grow-1">
          <div className="db-topbar">
            <div className="d-flex align-items-center gap-2">
              <button type="button" className="sb-toggle-btn" onClick={toggleSidebar} aria-label="Toggle sidebar">
                <i className="fa-solid fa-bars" />
              </button>
              <span className="fw-black ac-font text-nook-green dashboard-page-title">{pageTitle}</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="sb-toggle-btn"
                onClick={refreshCache}
                disabled={refreshing}
                title="Refresh API cache"
                aria-label="Refresh API cache"
              >
                <i className={`fa-solid fa-arrows-rotate ${refreshing ? "fa-spin" : ""}`} />
              </button>
              <div className="dashboard-user-chip">
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="dashboard-avatar" />
                ) : (
                  <div className="dashboard-avatar-fallback">{user?.username?.[0]?.toUpperCase() || "M"}</div>
                )}
                <div className="dashboard-user-meta">
                  <span className="dashboard-username">{user?.username || "Moderator"}</span>
                  <span className="dashboard-role"><i className="fa-solid fa-shield-halved me-1" />{user?.is_admin ? "Admin" : "Mod"}</span>
                </div>
              </div>
            </div>
          </div>

          {notice && (
            <div className="px-4 pt-3">
              <div className={`alert ${notice.toLowerCase().includes("failed") ? "alert-danger" : "alert-success"} dashboard-alert mb-0`}>
                {notice}
              </div>
            </div>
          )}

          <main className="db-body">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;
