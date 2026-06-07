import { useEffect, useState } from "react";
import { dashboardApi, type DashboardOpsStatus } from "../../lib/dashboardApi";

const DashboardOps = () => {
  const [status, setStatus] = useState<DashboardOpsStatus | null>(null);
  const [backups, setBackups] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    dashboardApi.runtimeStatus().then(setStatus).catch(err => setError(err.message));
    dashboardApi.backups().then(setBackups).catch(err => console.error(err));
  }, []);

  if (error) return <div className="alert alert-danger fw-bold">{error}</div>;
  if (!status) return <div className="text-center py-5"><div className="spinner-border text-success" /></div>;

  return (
    <div className="container-fluid px-0">
      <section className="section-card">
        <div className="section-card-header">
          <span><i className="fa-solid fa-server me-2 text-success" />Runtime Status</span>
        </div>
        <div className="p-4">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="db-label">Database Type</label>
              <div className="fw-bold fs-5">{status.db_type}</div>
            </div>
            {status.db_type === 'sqlite' && (
              <div className="col-md-12">
                <label className="db-label">SQLite Table Counts</label>
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {Object.entries(status.sqlite_counts || {}).map(([table, count]) => (
                    <span key={table} className="badge rounded-pill bg-light text-dark border">
                      {table}: {count as number}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section-card mt-4">
        <div className="section-card-header">
          <span><i className="fa-solid fa-hard-drive me-2 text-success" />Backups</span>
        </div>
        <div className="p-4">
          {backups ? (
            <pre className="bg-light p-3 rounded">{JSON.stringify(backups, null, 2)}</pre>
          ) : (
            <div className="text-muted small">Loading backups...</div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardOps;
