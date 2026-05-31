import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const links = [
  { to: "/dashboard", label: "Overview", icon: "fa-gauge-high" },
  { to: "/dashboard/islands", label: "Islands", icon: "fa-map" },
  { to: "/dashboard/logs", label: "Logs", icon: "fa-list" },
  { to: "/dashboard/status", label: "Status", icon: "fa-signal" },
  { to: "/dashboard/analytics", label: "Analytics", icon: "fa-chart-line" },
  { to: "/dashboard/database", label: "Database", icon: "fa-database" },
];

const DashboardLayout = () => {
  const { user } = useAuth();

  return (
    <main className="min-vh-100 bg-light">
      <div className="container-fluid py-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div>
            <p className="text-success fw-black text-uppercase x-small mb-1">ChoBot Console</p>
            <h1 className="h3 fw-black text-dark mb-0">Moderator Dashboard</h1>
          </div>
          <div className="d-flex align-items-center gap-2 bg-white border rounded-pill px-3 py-2 shadow-sm">
            {user?.avatar && <img src={user.avatar} alt="" width={28} height={28} className="rounded-circle" />}
            <span className="fw-bold small">{user?.username}</span>
          </div>
        </div>

        <div className="row g-4">
          <aside className="col-lg-2">
            <nav className="bg-white border rounded-4 p-2 shadow-sm d-grid gap-1 position-sticky" style={{ top: 16 }}>
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/dashboard"}
                  className={({ isActive }) => `btn text-start fw-bold rounded-3 ${isActive ? "btn-success" : "btn-light text-muted"}`}
                >
                  <i className={`fa-solid ${link.icon} me-2`} />
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </aside>
          <section className="col-lg-10">
            <Outlet />
          </section>
        </div>
      </div>
    </main>
  );
};

export default DashboardLayout;
