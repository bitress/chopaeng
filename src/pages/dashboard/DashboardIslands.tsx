import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardPagination from "../../components/dashboard/DashboardPagination";
import { dashboardApi, type DashboardIsland } from "../../lib/dashboardApi";

const statusClass = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized.includes("online")) return "online";
  if (normalized.includes("sub")) return "sub-only";
  if (normalized.includes("refresh")) return "refreshing";
  return "offline";
};

const DashboardIslands = () => {
  const [islands, setIslands] = useState<DashboardIsland[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 15;

  const load = useCallback(() => {
    dashboardApi.islands().then(setIslands).catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      dashboardApi.statusSummary().then((summary) => {
        const statusMap = new Map(summary.islands.map((island) => [island.id, island.status]));
        setIslands((prev) => prev.map((island) => ({ ...island, status: statusMap.get(island.id) || island.status })));
      }).catch(() => undefined);
    }, 15000);
    return () => window.clearInterval(timer);
  }, []);

  const counts = useMemo(() => ({
    public: islands.filter((island) => island.cat === "public").length,
    member: islands.filter((island) => island.cat === "member").length,
  }), [islands]);
  const totalPages = Math.max(1, Math.ceil(islands.length / perPage));
  const safePage = Math.min(page, totalPages);
  const pagedIslands = useMemo(() => islands.slice((safePage - 1) * perPage, safePage * perPage), [islands, safePage]);

  const syncMaps = async () => {
    setSyncing(true);
    setError("");
    setNotice("");
    try {
      const result = await dashboardApi.syncMaps();
      setNotice(`Synced ${result.synced} map(s), skipped ${result.skipped}${result.errors?.length ? `, ${result.errors.length} error(s)` : ""}.`);
      if (result.synced > 0) load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Map sync failed");
    } finally {
      setSyncing(false);
    }
  };

  if (error && islands.length === 0) return <div className="alert alert-danger fw-bold">{error}</div>;

  return (
    <div className="container-fluid px-0">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <span className="fw-black dashboard-table-count">{islands.length} islands</span>
          <span className="badge rounded-pill badge-auth">{counts.public} public</span>
          <span className="badge rounded-pill dashboard-member-badge">{counts.member} member</span>
        </div>
        <button type="button" className="btn btn-sm dashboard-sync-btn" disabled={syncing} onClick={syncMaps}>
          {syncing ? <span className="spinner-border spinner-border-sm me-1" /> : <i className="fa-solid fa-cloud-arrow-down me-1" />}
          {syncing ? "Syncing" : "Sync Maps"}
        </button>
      </div>

      {notice && <div className="alert alert-success dashboard-alert">{notice}</div>}
      {error && <div className="alert alert-danger dashboard-alert">{error}</div>}

      <section className="section-card">
        {islands.length === 0 ? (
          <div className="dashboard-empty">
            <i className="fa-solid fa-location-dot d-block mb-2" />
            No islands found.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="db-table">
              <thead>
                <tr>
                  <th className="dashboard-map-col">Map</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th className="text-center">Visitors</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {pagedIslands.map((island) => (
                  <tr key={island.id}>
                    <td>
                      {island.map_url ? (
                        <img src={island.map_url} alt={island.name} className="dashboard-island-thumb" />
                      ) : (
                        <div className="dashboard-island-thumb-empty"><i className="fa-solid fa-umbrella-beach" /></div>
                      )}
                    </td>
                    <td>
                      <Link to={`/dashboard/islands/${island.id}`} className="fw-bold text-decoration-none ac-font text-nook-green">
                        {island.name}
                      </Link>
                    </td>
                    <td className="dashboard-muted-cell">{island.type || "-"}</td>
                    <td><span className={`badge rounded-pill ${island.cat === "member" ? "dashboard-member-badge" : "badge-auth"}`}>{island.cat}</span></td>
                    <td><span className={`status-pill ${statusClass(island.status)} dashboard-static-pill`}>{island.status}</span></td>
                    <td className="text-center dashboard-muted-cell">{island.visitors || "-"}</td>
                    <td className="text-end">
                      <Link className="btn btn-sm dashboard-edit-btn" to={`/dashboard/islands/${island.id}`}>
                        <i className="fa-solid fa-pen me-1" />Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <DashboardPagination page={safePage} perPage={perPage} totalItems={islands.length} onPageChange={setPage} />
      </section>
    </div>
  );
};

export default DashboardIslands;
