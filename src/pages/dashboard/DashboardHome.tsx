import { useEffect, useState } from "react";
import { dashboardApi, type DashboardOverview } from "../../lib/dashboardApi";

const statCards = (data: DashboardOverview) => [
  ["Total Visits", data.total_visits, "fa-plane"],
  ["Today", data.visits_today, "fa-calendar-day"],
  ["Warnings", data.total_warnings, "fa-triangle-exclamation"],
  ["Online Islands", `${data.online_count}/${data.island_count}`, "fa-signal"],
];

const DashboardHome = () => {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    dashboardApi.overview().then(setData).catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="alert alert-danger fw-bold">{error}</div>;
  if (!data) return <div className="text-center py-5"><div className="spinner-border text-success" /></div>;

  return (
    <div className="d-grid gap-4">
      <div className="row g-3">
        {statCards(data).map(([label, value, icon]) => (
          <div className="col-sm-6 col-xl-3" key={label}>
            <div className="bg-white border rounded-4 p-4 shadow-sm h-100">
              <i className={`fa-solid ${icon} text-success mb-3`} />
              <p className="text-muted fw-bold small mb-1">{label}</p>
              <h2 className="fw-black mb-0">{value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="bg-white border rounded-4 p-4 shadow-sm h-100">
            <h2 className="h5 fw-black mb-3">Top Islands</h2>
            {data.top_islands.map((row) => (
              <div className="d-flex justify-content-between border-bottom py-2" key={row.name}>
                <span className="fw-bold">{row.name}</span><span>{row.count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="col-lg-6">
          <div className="bg-white border rounded-4 p-4 shadow-sm h-100">
            <h2 className="h5 fw-black mb-3">Recent Flights</h2>
            {data.recent.map((row, idx) => (
              <div className="border-bottom py-2" key={idx}>
                <div className="fw-bold">{String(row.ign || "Unknown")} to {String(row.destination || "Unknown")}</div>
                <small className="text-muted">{String(row.timestamp || "")}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
