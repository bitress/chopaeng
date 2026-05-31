import { useEffect, useState } from "react";
import { dashboardApi, type DashboardStatusSummary } from "../../lib/dashboardApi";

const DashboardStatus = () => {
  const [data, setData] = useState<DashboardStatusSummary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    dashboardApi.statusSummary().then(setData).catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="alert alert-danger fw-bold">{error}</div>;
  if (!data) return <div className="text-center py-5"><div className="spinner-border text-success" /></div>;

  return (
    <div className="bg-white border rounded-4 p-4 shadow-sm">
      <h2 className="h4 fw-black mb-4">Island Status</h2>
      <div className="row g-3 mb-4">
        <div className="col-md-4"><div className="alert alert-success fw-bold">Online: {data.online_count}</div></div>
        <div className="col-md-4"><div className="alert alert-warning fw-bold">Refreshing: {data.refreshing_count}</div></div>
        <div className="col-md-4"><div className="alert alert-secondary fw-bold">Offline: {data.offline_count}</div></div>
      </div>
      <div className="table-responsive">
        <table className="table align-middle">
          <thead><tr><th>Island</th><th>Status</th></tr></thead>
          <tbody>{data.islands.map((island) => <tr key={island.id}><td className="fw-bold">{island.name}</td><td>{island.status}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardStatus;
