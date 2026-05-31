import { useEffect, useState } from "react";
import { dashboardApi, type MigrationStatus } from "../../lib/dashboardApi";

const DashboardDatabase = () => {
  const [data, setData] = useState<MigrationStatus | null>(null);
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);

  const load = () => dashboardApi.migrationStatus().then(setData).catch((err) => setError(err.message));

  useEffect(() => { load(); }, []);

  const dryRun = async () => {
    setRunning(true); setError("");
    try { setData(await dashboardApi.runMigration(true)); } catch (err) { setError(err instanceof Error ? err.message : "Migration check failed"); }
    setRunning(false);
  };

  return (
    <div className="bg-white border rounded-4 p-4 shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h4 fw-black mb-0">Database</h2>
        <button className="btn btn-outline-success fw-bold rounded-pill" disabled={running} onClick={dryRun}>Run Dry Check</button>
      </div>
      {error && <div className="alert alert-danger fw-bold">{error}</div>}
      {!data ? <div className="spinner-border text-success" /> : <pre className="bg-light rounded-3 p-3 small mb-0 overflow-auto">{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
};

export default DashboardDatabase;
