import { useEffect, useMemo, useState } from "react";
import DashboardPagination from "../../components/dashboard/DashboardPagination";
import { dashboardApi, type MigrationStatus } from "../../lib/dashboardApi";

type Row = Record<string, unknown>;

const asRecord = (value: unknown): Row => value && typeof value === "object" && !Array.isArray(value) ? value as Row : {};
const asNumber = (value: unknown, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};
const fmt = (value: unknown) => typeof value === "number" ? value.toLocaleString() : String(value ?? "n/a");

const DashboardDatabase = () => {
  const [data, setData] = useState<MigrationStatus | null>(null);
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);
  const [truncate, setTruncate] = useState(false);
  const [tablePage, setTablePage] = useState(1);
  const tablePerPage = 15;

  const load = () => dashboardApi.migrationStatus().then((payload) => {
    setData(payload);
    const mariadb = asRecord(payload.mariadb);
    setTruncate(Boolean(mariadb.default_truncate_before_import));
  }).catch((err) => setError(err.message));

  useEffect(() => { load(); }, []);

  const run = async (dryRun: boolean) => {
    if (!dryRun && !window.confirm("Run the SQLite to MariaDB/MySQL migration now?")) return;
    setRunning(true);
    setError("");
    try {
      setData(await dashboardApi.runMigration(dryRun, truncate));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Migration failed");
    } finally {
      setRunning(false);
    }
  };

  const mariadb = asRecord(data?.mariadb);
  const lastResult = asRecord(data?.last_result);
  const sourceTables = asRecord(data?.source_tables);
  const tableNames = Object.keys(sourceTables).sort();
  const totalTablePages = Math.max(1, Math.ceil(tableNames.length / tablePerPage));
  const safeTablePage = Math.min(tablePage, totalTablePages);
  const pagedTableNames = useMemo(() => tableNames.slice((safeTablePage - 1) * tablePerPage, safeTablePage * tablePerPage), [tableNames, safeTablePage]);
  const configured = Boolean(mariadb.configured);
  const totalRows = asNumber(data?.source_total_rows);
  const messageType = !configured ? "warning" : lastResult.ok === false ? "danger" : lastResult.ok ? "success" : "info";
  const message = !configured
    ? `MySQL settings are incomplete: ${Array.isArray(mariadb.missing) ? mariadb.missing.join(", ") : "missing config"}`
    : lastResult.ok === false
      ? `Last migration failed: ${String(lastResult.error || "Unknown error")}`
      : lastResult.ok
        ? `Last migration completed. Rows copied: ${fmt(lastResult.total_rows_copied ?? lastResult.source_total_rows ?? 0)}`
        : "Ready. Use Dry Run first to verify the source tables before running the copy.";

  return (
    <div className="container-fluid px-0">
      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-4">
          <div className="stat-card h-100">
            <div className="stat-label">Runtime Backend</div>
            <div className="stat-value text-nook-green">{fmt(data?.runtime_database || "unknown")}</div>
            <div className="x-small fw-bold mt-2 text-muted">Current process database target</div>
          </div>
        </div>
        <div className="col-12 col-lg-4">
          <div className="stat-card h-100">
            <div className="stat-label">SQLite Rows</div>
            <div className="stat-value dashboard-blue">{fmt(totalRows)}</div>
            <div className="x-small fw-bold mt-2 text-muted">Rows found in source tables</div>
          </div>
        </div>
        <div className="col-12 col-lg-4">
          <div className="stat-card h-100">
            <div className="stat-label">MySQL Config</div>
            <div className={`stat-value ${configured ? "text-nook-green" : "dashboard-yellow"}`}>{configured ? "Ready" : "Missing"}</div>
            <div className="x-small fw-bold mt-2 text-muted">Connection settings readiness</div>
          </div>
        </div>
      </div>

      <section className="section-card mb-4">
        <div className="section-card-header flex-wrap gap-2">
          <span><i className="fa-solid fa-database me-2 text-success" />MariaDB / MySQL Migration</span>
          <span className={`badge rounded-pill ${running ? "text-bg-warning" : "bg-light text-muted border"}`}>{running ? "Running" : "Idle"}</span>
        </div>
        <div className="p-4">
          {error && <div className="alert alert-danger fw-bold">{error}</div>}
          {!data ? (
            <div className="spinner-border text-success" />
          ) : (
            <div className="row g-4 align-items-stretch">
              <div className="col-12 col-xl-7">
                <div className="dashboard-panel h-100">
                  <div className="db-label mb-2">Target</div>
                  <div className="row g-3">
                    <div className="col-12 col-md-6"><div className="x-small fw-bold text-muted">Host</div><div className="fw-bold">{fmt(mariadb.host || "Not set")}</div></div>
                    <div className="col-6 col-md-3"><div className="x-small fw-bold text-muted">Port</div><div className="fw-bold">{fmt(mariadb.port || "3306")}</div></div>
                    <div className="col-6 col-md-3"><div className="x-small fw-bold text-muted">Database</div><div className="fw-bold">{fmt(mariadb.database || "Not set")}</div></div>
                  </div>
                  <div className="divider-dashed my-3" />
                  <label className="d-flex align-items-start gap-3 cursor-pointer mb-3">
                    <input type="checkbox" className="form-check-input mt-1" checked={truncate} onChange={(e) => setTruncate(e.target.checked)} />
                    <span>
                      <span className="fw-bold">Replace existing target data before import</span>
                      <span className="d-block x-small fw-bold mt-1 text-muted">When enabled, target tables are truncated before copied SQLite rows are inserted.</span>
                    </span>
                  </label>
                  <div className="d-flex flex-wrap gap-2">
                    <button type="button" className="btn btn-sm btn-light border fw-bold rounded-pill px-3" disabled={running} onClick={load}>
                      <i className="fa-solid fa-arrows-rotate me-1" />Refresh Status
                    </button>
                    <button type="button" className="btn btn-sm btn-outline-primary fw-bold rounded-pill px-3" disabled={running} onClick={() => run(true)}>
                      <i className="fa-solid fa-clipboard-check me-1" />Dry Run
                    </button>
                    <button type="button" className="btn btn-sm btn-success fw-bold rounded-pill px-3" disabled={running} onClick={() => run(false)}>
                      <i className="fa-solid fa-database me-1" />Run Migration
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-12 col-xl-5">
                <div className={`dashboard-message dashboard-message-${messageType}`}>{message}</div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="section-card">
        <div className="section-card-header">
          <span><i className="fa-solid fa-table me-2 text-success" />Source Tables</span>
          <span className="x-small fw-bold text-muted">{tableNames.length} tables</span>
        </div>
        <div className="table-responsive">
          <table className="db-table">
            <thead><tr><th>Table</th><th className="text-end">Rows</th></tr></thead>
            <tbody>
              {tableNames.length === 0 && <tr><td colSpan={2} className="text-center py-4 fw-bold text-muted">No source tables found.</td></tr>}
              {pagedTableNames.map((name) => (
                <tr key={name}>
                  <td className="fw-bold">{name}</td>
                  <td className="text-end fw-bold">{fmt(asNumber(sourceTables[name]))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <DashboardPagination page={safeTablePage} perPage={tablePerPage} totalItems={tableNames.length} onPageChange={setTablePage} />
      </section>
    </div>
  );
};

export default DashboardDatabase;
