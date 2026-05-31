import { useEffect, useMemo, useState } from "react";
import DashboardPagination from "../../components/dashboard/DashboardPagination";
import { dashboardApi, type DashboardStatusSummary } from "../../lib/dashboardApi";

const DashboardStatus = () => {
  const [data, setData] = useState<DashboardStatusSummary | null>(null);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 20;

  useEffect(() => {
    dashboardApi.statusSummary().then(setData).catch((err) => setError(err.message));
  }, []);

  const totalPages = Math.max(1, Math.ceil((data?.islands.length || 0) / perPage));
  const safePage = Math.min(page, totalPages);
  const pagedIslands = useMemo(() => (data?.islands || []).slice((safePage - 1) * perPage, safePage * perPage), [data?.islands, safePage]);

  if (error) return <div className="alert alert-danger fw-bold">{error}</div>;
  if (!data) return <div className="text-center py-5"><div className="spinner-border text-success" /></div>;

  const cards = [
    ["Online", data.online_count, `${data.online_pct}%`, "fa-circle-check"],
    ["Refreshing", data.refreshing_count, `${data.refreshing_pct}%`, "fa-arrows-rotate"],
    ["Offline", data.offline_count, `${data.off_pct}%`, "fa-circle-xmark"],
  ];

  return (
    <div className="container-fluid px-0">
      <div className="row g-3 mb-4">
        {cards.map(([label, value, pct, icon]) => (
          <div className="col-md-4" key={label}>
            <div className="stat-card h-100">
              <div className="stat-label">{label}</div>
              <div className="d-flex align-items-end justify-content-between">
                <div className="stat-value">{value}</div>
                <span className="badge rounded-pill bg-light text-dark border">{pct}</span>
              </div>
              <i className={`fa-solid ${icon} dashboard-card-watermark`} />
            </div>
          </div>
        ))}
      </div>

      <section className="section-card">
        <div className="section-card-header">
          <span><i className="fa-solid fa-signal me-2 text-success" />Island Status</span>
          <span className="text-muted small fw-bold">{data.island_count} tracked</span>
        </div>
        <div className="table-responsive">
          <table className="db-table">
            <thead><tr><th>Island</th><th>Status</th></tr></thead>
            <tbody>
              {pagedIslands.map((island) => (
                <tr key={island.id}>
                  <td className="fw-bold">{island.name}</td>
                  <td>{island.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <DashboardPagination page={safePage} perPage={perPage} totalItems={data.islands.length} onPageChange={setPage} />
      </section>
    </div>
  );
};

export default DashboardStatus;
