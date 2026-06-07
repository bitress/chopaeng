import { useEffect, useState } from "react";
import { dashboardApi } from "../../lib/dashboardApi";

const DashboardIncidents = () => {
  const [incidents, setIncidents] = useState<any[] | null>(null);
  const [dodoQueue, setDodoQueue] = useState<any[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    dashboardApi.incidents().then(res => setIncidents(res.incidents || [])).catch(err => setError(err.message));
    dashboardApi.dodoQueue().then(res => setDodoQueue(res.queue || [])).catch(err => console.error(err));
  }, []);

  if (error) return <div className="alert alert-danger fw-bold">{error}</div>;

  return (
    <div className="container-fluid px-0">
      <section className="section-card">
        <div className="section-card-header">
          <span><i className="fa-solid fa-exclamation-triangle me-2 text-warning" />Recent Incidents</span>
        </div>
        <div className="p-4">
          {incidents === null ? (
            <div className="spinner-border text-warning spinner-border-sm" />
          ) : incidents.length === 0 ? (
            <div className="text-muted small">No recent incidents.</div>
          ) : (
            <div className="table-responsive">
              <table className="db-table">
                <thead><tr><th>Time</th><th>Type</th><th>Target</th><th>Details</th></tr></thead>
                <tbody>
                  {incidents.map((inc, i) => (
                    <tr key={i}>
                      <td>{inc.timestamp as string}</td>
                      <td><span className="badge bg-danger">{inc.type as string}</span></td>
                      <td className="fw-bold">{inc.target as string}</td>
                      <td className="small text-muted">{JSON.stringify(inc.details || {})}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="section-card mt-4">
        <div className="section-card-header">
          <span><i className="fa-solid fa-plane me-2 text-info" />Dodo Queue</span>
        </div>
        <div className="p-4">
          {dodoQueue === null ? (
             <div className="spinner-border text-info spinner-border-sm" />
          ) : (
             <pre className="bg-light p-3 rounded">{JSON.stringify(dodoQueue, null, 2)}</pre>
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardIncidents;
