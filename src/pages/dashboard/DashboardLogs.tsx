import { useEffect, useState } from "react";
import { dashboardApi, type DashboardLogs as LogsPayload } from "../../lib/dashboardApi";

const DashboardLogs = () => {
  const [type, setType] = useState("flights");
  const [data, setData] = useState<LogsPayload | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    dashboardApi.logs(new URLSearchParams({ type, per_page: "25" }).toString()).then(setData).catch((err) => setError(err.message));
  }, [type]);

  if (error) return <div className="alert alert-danger fw-bold">{error}</div>;

  return (
    <div className="bg-white border rounded-4 p-4 shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h4 fw-black mb-0">Logs</h2>
        <select className="form-select w-auto" value={type} onChange={(e) => setType(e.target.value)}><option value="flights">Flights</option><option value="warnings">Warnings</option></select>
      </div>
      {!data ? <div className="spinner-border text-success" /> : (
        <div className="table-responsive"><table className="table align-middle"><tbody>{data.entries.map((entry, idx) => <tr key={idx}><td className="fw-bold">{String(entry.ign || entry.user_name || "Unknown")}</td><td>{String(entry.destination || entry.reason || "")}</td><td className="text-muted small">{String(entry.timestamp || "")}</td></tr>)}</tbody></table></div>
      )}
    </div>
  );
};

export default DashboardLogs;
