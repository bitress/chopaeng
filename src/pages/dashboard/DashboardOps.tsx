import { useCallback, useEffect, useState } from "react";
import { dashboardApi, type DashboardBackupList, type DashboardOpsStatus } from "../../lib/dashboardApi";

const statusColor = (status = "") => {
  if (["ok", "running"].includes(status)) return "text-nook-green";
  if (["degraded", "starting", "not_selected"].includes(status)) return "dashboard-yellow";
  return "text-danger";
};

const seconds = (value: unknown) => {
  const total = Number(value || 0);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const mins = Math.floor((total % 3600) / 60);
  if (days) return `${days}d ${hours}h`;
  if (hours) return `${hours}h ${mins}m`;
  return `${mins}m`;
};

const bytes = (value: unknown) => {
  const n = Number(value || 0);
  if (n >= 1048576) return `${(n / 1048576).toFixed(1)} MB`;
  if (n >= 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${n} B`;
};

const DashboardOps = () => {
  const [status, setStatus] = useState<DashboardOpsStatus | null>(null);
  const [backups, setBackups] = useState<DashboardBackupList | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const [runtime, backupList] = await Promise.all([
        dashboardApi.runtimeStatus(),
        dashboardApi.backups(),
      ]);
      setStatus(runtime);
      setBackups(backupList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load ops status");
    }
  }, []);

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 60000);
    return () => window.clearInterval(timer);
  }, [load]);

  const maintenance = status?.maintenance || {};
  const saveMaintenance = async (patch: Record<string, unknown>) => {
    setSaving(true);
    setError("");
    try {
      await dashboardApi.maintenanceMode({ ...maintenance, ...patch });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update maintenance mode");
    } finally {
      setSaving(false);
    }
  };

  if (error && !status) return <div className="alert alert-danger fw-bold">{error}</div>;
  if (!status) return <div className="text-center py-5"><div className="spinner-border text-success" /></div>;

  const services = Object.entries(status.services || {});
  const integrations = Object.entries(status.integrations || {});
  const backupEntries = backups?.entries || [];

  return (
    <div className="container-fluid px-0">
      {error && <div className="alert alert-danger dashboard-alert">{error}</div>}

      <div className="row g-3 mb-4">
        <div className="col-6 col-xl-3"><div className="stat-card h-100"><div className="stat-label">System</div><div className={`stat-value ${statusColor(status.status)}`}>{status.status?.toUpperCase()}</div><div className="x-small text-muted fw-bold mt-1">{status.reasons?.join(", ") || "No active warnings."}</div></div></div>
        <div className="col-6 col-xl-3"><div className="stat-card h-100"><div className="stat-label">Database</div><div className={`stat-value ${statusColor(status.database?.status)}`}>{status.database?.status?.toUpperCase() || "-"}</div><div className="x-small text-muted fw-bold mt-1">{status.database?.backend || status.db_type || "-"} · {status.database?.latency_ms || 0} ms</div></div></div>
        <div className="col-6 col-xl-3"><div className="stat-card h-100"><div className="stat-label">Item Cache</div><div className="stat-value dashboard-blue">{Number(status.cache?.items || 0).toLocaleString()}</div><div className="x-small text-muted fw-bold mt-1">Age {seconds(status.cache?.age_seconds)} · {status.cache?.last_refresh_status || "-"}</div></div></div>
        <div className="col-6 col-xl-3"><div className="stat-card h-100"><div className="stat-label">Uptime</div><div className="stat-value dashboard-yellow">{seconds(status.uptime_seconds)}</div><div className="x-small text-muted fw-bold mt-1">{status.timestamp ? new Date(status.timestamp).toLocaleString() : "-"}</div></div></div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-xl-7">
          <section className="section-card h-100">
            <div className="section-card-header">
              <span><i className="fa-solid fa-heart-pulse me-2 text-success" />Services</span>
              <button className="btn btn-sm rounded-pill fw-bold btn-sub" onClick={load}><i className="fa-solid fa-arrows-rotate me-1" />Refresh</button>
            </div>
            <div className="table-responsive">
              <table className="db-table">
                <thead><tr><th>Service</th><th>Status</th><th>Mode</th><th>Heartbeat</th><th>Last Error</th></tr></thead>
                <tbody>
                  {services.length ? services.map(([name, svc]) => (
                    <tr key={name}>
                      <td className="fw-bold">{name}</td>
                      <td className={statusColor(svc.status)}>{svc.status || "-"}</td>
                      <td>{svc.mode || "-"}</td>
                      <td>{svc.last_heartbeat || "-"}</td>
                      <td className="small text-muted">{svc.last_error || ""}</td>
                    </tr>
                  )) : <tr><td colSpan={5} className="text-center py-4 text-muted fw-bold">No service heartbeats yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="col-12 col-xl-5">
          <section className="section-card h-100">
            <div className="section-card-header"><span><i className="fa-solid fa-toggle-on me-2 text-success" />Maintenance Mode</span></div>
            <div className="p-4">
              {[
                ["maintenance_mode", "Global maintenance mode"],
                ["disable_dodo_reveals", "Disable Dodo reveals"],
                ["disable_refresh", "Disable manual refresh"],
                ["disable_commands", "Disable bot commands"],
              ].map(([key, label]) => (
                <label className="d-flex align-items-center gap-2 mb-3 fw-bold" key={key}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={Boolean(maintenance[key])}
                    disabled={saving}
                    onChange={(event) => saveMaintenance({ [key]: event.target.checked })}
                  />
                  {label}
                </label>
              ))}
              <label className="db-label">Public Message</label>
              <textarea
                className="db-input"
                rows={3}
                value={String(maintenance.message || "")}
                disabled={saving}
                onChange={(event) => setStatus((current) => current ? { ...current, maintenance: { ...(current.maintenance || {}), message: event.target.value } } : current)}
                onBlur={(event) => saveMaintenance({ message: event.target.value })}
              />
            </div>
          </section>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-5">
          <section className="section-card h-100">
            <div className="section-card-header"><span><i className="fa-solid fa-plug me-2 dashboard-blue" />Integrations</span></div>
            <div className="table-responsive">
              <table className="db-table">
                <tbody>
                  {integrations.map(([name, ok]) => (
                    <tr key={name}><td className="fw-bold">{name.replace(/_/g, " ")}</td><td className={`text-end fw-bold ${ok ? "text-nook-green" : "text-muted"}`}>{ok ? "Configured" : "Off"}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
        <div className="col-12 col-xl-7">
          <section className="section-card h-100">
            <div className="section-card-header"><span><i className="fa-solid fa-hard-drive me-2 text-success" />Recent Backups</span><span className="x-small text-muted fw-bold">{backups?.backend || "-"}</span></div>
            <div className="table-responsive">
              <table className="db-table">
                <thead><tr><th>File</th><th>Created</th><th className="text-end">Size</th></tr></thead>
                <tbody>
                  {backupEntries.length ? backupEntries.map((entry) => (
                    <tr key={entry.file}>
                      <td className="fw-bold">{entry.file}</td>
                      <td>{entry.created_at || "-"}</td>
                      <td className="text-end">{bytes(entry.size_bytes)}</td>
                    </tr>
                  )) : <tr><td colSpan={3} className="text-center py-4 text-muted fw-bold">No backups found.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DashboardOps;
