import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardPagination from "../../components/dashboard/DashboardPagination";
import { dashboardApi, type DashboardOverview } from "../../lib/dashboardApi";

const fmt = (value: number | string | null | undefined) => {
  if (typeof value === "number") return value.toLocaleString();
  return String(value ?? 0);
};

const pct = (value: number, max: number) => `${max > 0 ? Math.max(4, Math.round((value / max) * 100)) : 0}%`;

const DashboardHome = () => {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [error, setError] = useState("");
  const [recentPage, setRecentPage] = useState(1);
  const recentPerPage = 10;

  useEffect(() => {
    dashboardApi.overview().then(setData).catch((err) => setError(err.message));
  }, []);

  const maxTrend = useMemo(() => Math.max(...(data?.trend_counts || [0]), 1), [data]);
  const recentTotalPages = Math.max(1, Math.ceil((data?.recent.length || 0) / recentPerPage));
  const safeRecentPage = Math.min(recentPage, recentTotalPages);
  const pagedRecent = useMemo(() => (data?.recent || []).slice((safeRecentPage - 1) * recentPerPage, safeRecentPage * recentPerPage), [data?.recent, safeRecentPage]);

  if (error) return <div className="alert alert-danger fw-bold">{error}</div>;
  if (!data) return <div className="text-center py-5"><div className="spinner-border text-success" /></div>;

  const statusOnline = data.status_map.ONLINE || 0;
  const statusRefreshing = data.status_map.REFRESHING || 0;
  const statusOffline = data.status_map.OFFLINE || 0;
  const maxIsland = Math.max(...data.top_islands.map((row) => row.count), 1);
  const maxTraveler = Math.max(...data.top_travelers.map((row) => row.count), 1);

  const cards = [
    ["Total Visits", data.total_visits, "fa-plane", "text-nook-green"],
    ["Visits Today", data.visits_today, "fa-calendar-day", "dashboard-blue"],
    ["This Week", data.visits_week, "fa-calendar-week", "dashboard-purple"],
    ["Warnings", data.total_warnings, "fa-triangle-exclamation", "dashboard-yellow"],
    ["Total Islands", data.island_count, "fa-location-dot", "text-nook-green"],
    ["Bots Online", data.online_count, "fa-wifi", "text-nook-green"],
    ["Warn Rate", `${data.warn_rate_7d}%`, "fa-shield-halved", data.warn_rate_7d >= 10 ? "dashboard-red" : "text-nook-green"],
    ["Analytics", "View", "fa-chart-line", "dashboard-purple"],
  ];

  return (
    <div className="container-fluid px-0">
      <div className="row g-3 mb-4">
        {cards.map(([label, value, icon, color], index) => {
          const content = (
            <div className="stat-card h-100">
              <div className="stat-label"><i className={`fa-solid ${icon} me-1`} />{label}</div>
              <div className={`stat-value ${color}`}>{fmt(value)}</div>
              {label === "Bots Online" && <div className="x-small fw-bold mt-1 text-muted">of {fmt(data.island_count)} total</div>}
              {label === "Warn Rate" && <div className="x-small fw-bold mt-1 text-muted">{fmt(data.warnings_week)} warnings this week</div>}
            </div>
          );

          return (
            <div className="col-6 col-lg-3" key={String(label)}>
              {index === cards.length - 1 ? <Link to="/dashboard/analytics" className="text-decoration-none d-block h-100">{content}</Link> : content}
            </div>
          );
        })}
      </div>

      <section className="section-card mb-4">
        <div className="section-card-header">
          <span><i className="fa-solid fa-location-dot me-2 text-success" />Island Status Breakdown</span>
          <Link to="/dashboard/status" className="text-decoration-none fw-bold x-small text-success">View all</Link>
        </div>
        <div className="p-4">
          <div className="row g-3 mb-4">
            <div className="col-4"><div className="dashboard-mini-metric dashboard-mini-green"><div>{fmt(statusOnline)}</div><span>Online</span></div></div>
            <div className="col-4"><div className="dashboard-mini-metric dashboard-mini-blue"><div>{fmt(statusRefreshing)}</div><span>Refreshing</span></div></div>
            <div className="col-4"><div className="dashboard-mini-metric dashboard-mini-muted"><div>{fmt(statusOffline)}</div><span>Offline</span></div></div>
          </div>
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="x-small fw-bold text-muted">{fmt(data.online_count)} of {fmt(data.island_count)} islands currently online</span>
            <span className="x-small fw-bold text-muted">{fmt(data.online_pct)}%</span>
          </div>
          <div className="dashboard-progress"><div style={{ width: `${data.online_pct}%` }} /></div>
        </div>
      </section>

      <section className="section-card mb-4">
        <div className="section-card-header">
          <span><i className="fa-solid fa-chart-simple me-2 dashboard-blue" />Visit Trend</span>
          <Link to="/dashboard/analytics" className="text-decoration-none fw-bold x-small text-success">Full analytics</Link>
        </div>
        <div className="dashboard-spark-bars">
          {data.trend_counts.map((count, index) => (
            <div className="dashboard-spark-item" key={`${data.trend_labels[index]}-${index}`}>
              <div className="dashboard-spark-track"><span style={{ height: pct(count, maxTrend) }} /></div>
              <small>{data.trend_labels[index] || index + 1}</small>
            </div>
          ))}
        </div>
      </section>

      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-6">
          <section className="section-card h-100">
            <div className="section-card-header">
              <span><i className="fa-solid fa-trophy me-2 dashboard-yellow" />Top Islands</span>
              <Link to="/dashboard/analytics" className="text-decoration-none fw-bold x-small text-success">View all</Link>
            </div>
            <div className="p-3">
              {data.top_islands.length === 0 && <div className="dashboard-empty">No visit data yet.</div>}
              {data.top_islands.slice(0, 5).map((row, index) => (
                <div className="dashboard-bar-row" key={row.name}>
                  <div className="dashboard-row-title"><span>#{index + 1}</span>{row.name}</div>
                  <div className="dashboard-row-bar"><span style={{ width: pct(row.count, maxIsland) }} /></div>
                  <strong>{fmt(row.count)}</strong>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="col-12 col-lg-6">
          <section className="section-card h-100">
            <div className="section-card-header">
              <span><i className="fa-solid fa-user-check me-2 dashboard-blue" />Top Travelers</span>
              <Link to="/dashboard/analytics" className="text-decoration-none fw-bold x-small text-success">View all</Link>
            </div>
            <div className="p-3">
              {data.top_travelers.length === 0 && <div className="dashboard-empty">No traveler data yet.</div>}
              {data.top_travelers.slice(0, 5).map((row, index) => (
                <div className="dashboard-bar-row dashboard-blue-bars" key={row.ign}>
                  <div className="dashboard-row-title"><span>#{index + 1}</span>{row.ign}</div>
                  <div className="dashboard-row-bar"><span style={{ width: pct(row.count, maxTraveler) }} /></div>
                  <strong>{fmt(row.count)}</strong>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <section className="section-card">
        <div className="section-card-header">
          <span><i className="fa-solid fa-clock-rotate-left me-2 text-success" />Recent Flight Activity</span>
          <Link to="/dashboard/logs" className="text-decoration-none fw-bold x-small text-success">View all</Link>
        </div>
        <div className="table-responsive">
          <table className="db-table">
            <thead><tr><th>IGN</th><th>Destination</th><th>Time</th><th>Auth</th></tr></thead>
            <tbody>
              {pagedRecent.map((row, idx) => (
                <tr key={idx}>
                  <td className="fw-bold">{String(row.ign || "Unknown")}</td>
                  <td>{String(row.destination || "Unknown")}</td>
                  <td className="text-muted small">{String(row.timestamp || "")}</td>
                  <td>{row.auth_status ? <span className="badge badge-auth">{String(row.auth_status)}</span> : <span className="badge badge-unkn">unknown</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <DashboardPagination page={safeRecentPage} perPage={recentPerPage} totalItems={data.recent.length} onPageChange={setRecentPage} />
      </section>
    </div>
  );
};

export default DashboardHome;
