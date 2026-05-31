import { useEffect, useState } from "react";
import DashboardPagination from "../../components/dashboard/DashboardPagination";
import { dashboardApi, type DashboardLogs as LogsPayload } from "../../lib/dashboardApi";

const DashboardLogs = () => {
  const [type, setType] = useState("flights");
  const [data, setData] = useState<LogsPayload | null>(null);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 25;

  useEffect(() => {
    dashboardApi.logs(new URLSearchParams({ type, page: String(page), per_page: String(perPage) }).toString()).then(setData).catch((err) => setError(err.message));
  }, [type, page]);

  if (error) return <div className="alert alert-danger fw-bold">{error}</div>;

  return (
    <section className="section-card">
      <div className="section-card-header flex-wrap gap-2">
        <span><i className="fa-solid fa-clipboard-list me-2 text-success" />XLog Reports</span>
        <select
          className="db-input dashboard-select"
          value={type}
          onChange={(e) => {
            setData(null);
            setPage(1);
            setType(e.target.value);
          }}
        >
          <option value="flights">Flights</option>
          <option value="warnings">Warnings</option>
        </select>
      </div>
      {!data ? (
        <div className="p-4"><div className="spinner-border text-success" /></div>
      ) : (
        <div className="table-responsive">
          <table className="db-table">
            <thead><tr><th>User</th><th>Detail</th><th>Time</th></tr></thead>
            <tbody>
              {data.entries.map((entry, idx) => (
                <tr key={idx}>
                  <td className="fw-bold">{String(entry.ign || entry.user_name || "Unknown")}</td>
                  <td>{String(entry.destination || entry.reason || entry.event || "")}</td>
                  <td className="text-muted small">{String(entry.timestamp || "")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data && <DashboardPagination page={data.page || page} perPage={data.per_page || perPage} totalItems={data.total || data.entries.length} onPageChange={setPage} />}
    </section>
  );
};

export default DashboardLogs;
