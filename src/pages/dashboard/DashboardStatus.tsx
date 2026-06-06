import { useEffect, useMemo, useState } from "react";
import DashboardPagination from "../../components/dashboard/DashboardPagination";
import { dashboardApi, type DashboardAccessTestResult, type DashboardStatusSummary } from "../../lib/dashboardApi";

const DashboardStatus = () => {
  const [data, setData] = useState<DashboardStatusSummary | null>(null);
  const [testResult, setTestResult] = useState<DashboardAccessTestResult | null>(null);
  const [testUserId, setTestUserId] = useState("");
  const [testRoles, setTestRoles] = useState("");
  const [testingAccess, setTestingAccess] = useState(false);
  const [error, setError] = useState("");
  const [testError, setTestError] = useState("");
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
    ["Access Warnings", data.access_problem_count || 0, "role sync", "fa-shield-halved"],
  ];

  const runAccessTest = async () => {
    setTestingAccess(true);
    setTestError("");
    setTestResult(null);
    try {
      const roles = testRoles.split(/[,\s]+/).map((role) => role.trim()).filter(Boolean);
      setTestResult(await dashboardApi.testAccess({ user_id: testUserId.trim() || undefined, roles }));
    } catch (err) {
      setTestError(err instanceof Error ? err.message : "Access test failed");
    } finally {
      setTestingAccess(false);
    }
  };

  return (
    <div className="container-fluid px-0">
      <div className="row g-3 mb-4">
        {cards.map(([label, value, pct, icon]) => (
          <div className="col-md-3" key={label}>
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
            <thead><tr><th>Island</th><th>Status</th><th>Access</th></tr></thead>
            <tbody>
              {pagedIslands.map((island) => (
                <tr key={island.id}>
                  <td className="fw-bold">{island.name}</td>
                  <td>{island.status}</td>
                  <td>
                    <div className="d-flex flex-wrap gap-1">
                      <span className={`badge rounded-pill ${(island.access_warnings?.length || 0) > 0 ? "bg-warning-subtle text-warning-emphasis border border-warning-subtle" : "badge-auth"}`}>
                        {island.role_count ?? 0} role{(island.role_count ?? 0) === 1 ? "" : "s"}
                      </span>
                      <span className="badge rounded-pill bg-light text-muted border">
                        {island.access_source || "database"}
                      </span>
                    </div>
                    {(island.access_warnings?.length || 0) > 0 && (
                      <div className="x-small fw-bold text-warning mt-1">
                        {island.access_warnings?.map((warning) => warning.replaceAll("_", " ")).join(", ")}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <DashboardPagination page={safePage} perPage={perPage} totalItems={data.islands.length} onPageChange={setPage} />
      </section>

      <section className="section-card mt-4">
        <div className="section-card-header">
          <span><i className="fa-solid fa-user-shield me-2 text-success" />Test User Access</span>
          <span className="text-muted small fw-bold">Discord user ID or role IDs</span>
        </div>
        <div className="p-4">
          <div className="row g-3 align-items-end">
            <div className="col-md-5">
              <label className="db-label">Discord User ID</label>
              <input className="db-input" value={testUserId} onChange={(event) => setTestUserId(event.target.value)} placeholder="1234567890" />
            </div>
            <div className="col-md-5">
              <label className="db-label">Role IDs</label>
              <input className="db-input" value={testRoles} onChange={(event) => setTestRoles(event.target.value)} placeholder="comma or space separated" />
            </div>
            <div className="col-md-2">
              <button className="btn btn-nook-primary w-100 fw-bold" type="button" disabled={testingAccess} onClick={runAccessTest}>
                {testingAccess ? <span className="spinner-border spinner-border-sm" /> : "Test"}
              </button>
            </div>
          </div>
          {testError && <div className="alert alert-danger dashboard-alert mt-3">{testError}</div>}
          {testResult && (
            <div className="mt-4">
              <div className="d-flex flex-wrap gap-2 mb-3">
                <span className="badge rounded-pill badge-auth">{testResult.accessible_count} accessible</span>
                {testResult.is_mod && <span className="badge rounded-pill bg-dark">Mod/Admin bypass</span>}
                {testResult.roles.map((role) => (
                  <span key={role.id} className="badge rounded-pill bg-light text-dark border">{role.name}</span>
                ))}
              </div>
              <div className="d-flex flex-wrap gap-2">
                {testResult.items.filter((item) => item.accessible).map((item) => (
                  <span key={item.id} className="badge rounded-pill dashboard-member-badge px-3 py-2">
                    {item.name}
                  </span>
                ))}
                {testResult.accessible_count === 0 && <span className="dashboard-empty py-2">No accessible member islands matched.</span>}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardStatus;
