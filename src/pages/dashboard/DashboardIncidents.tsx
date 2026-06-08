import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  dashboardApi,
  type DashboardDodoQueueEntry,
  type DashboardIncidentEvent,
  type DashboardIncidentsPayload,
} from "../../lib/dashboardApi";

const severityClass = (severity: string) => {
  if (severity === "critical") return "bg-danger";
  if (severity === "warning") return "bg-warning text-dark";
  if (severity === "attention") return "bg-warning text-dark";
  return "bg-info";
};

const fmtDate = (value: unknown) => {
  if (typeof value === "number") return new Date(value * 1000).toLocaleString();
  return String(value || "-");
};

const DashboardIncidents = () => {
  const [data, setData] = useState<DashboardIncidentsPayload | null>(null);
  const [queue, setQueue] = useState<DashboardDodoQueueEntry[]>([]);
  const [error, setError] = useState("");
  const [busyKey, setBusyKey] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const [incidentPayload, queuePayload] = await Promise.all([
        dashboardApi.incidents(75),
        dashboardApi.dodoQueue(),
      ]);
      setData(incidentPayload);
      setQueue(queuePayload.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load incidents");
    }
  }, []);

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 60000);
    return () => window.clearInterval(timer);
  }, [load]);

  const updateIncident = async (event: DashboardIncidentEvent, status: string) => {
    const key = `${event.kind}:${event.source_id}:${status}`;
    setBusyKey(key);
    try {
      await dashboardApi.updateIncident({
        kind: event.kind,
        source_id: event.source_id,
        title: event.title,
        status,
        severity: event.severity,
        assigned_to: status === "investigating" ? "current mod" : event.assigned_to || "",
        note: event.note || "",
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update incident");
    } finally {
      setBusyKey("");
    }
  };

  const updateQueue = async (entry: DashboardDodoQueueEntry, status: string) => {
    const key = `queue:${entry.id}:${status}`;
    setBusyKey(key);
    try {
      await dashboardApi.updateDodoQueue(entry.id, status, entry.note || "");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update queue");
    } finally {
      setBusyKey("");
    }
  };

  const summary = data?.summary || {};
  const events = data?.events || [];
  const summaryCards = [
    ["Unknown", summary.unknown_travelers, "fa-user-secret", "text-danger"],
    ["Warnings", summary.active_warnings, "fa-triangle-exclamation", "dashboard-yellow"],
    ["Dodo Reveals", summary.recent_dodo_reveals, "fa-key", "dashboard-blue"],
    ["Identity", summary.recent_identity_events, "fa-id-card", "dashboard-purple"],
    ["Queue", summary.open_queue_entries, "fa-hourglass-half", "text-nook-green"],
    ["Workflow", summary.workflow_open, "fa-list-check", "dashboard-blue"],
  ];

  if (error && !data) return <div className="alert alert-danger fw-bold">{error}</div>;

  return (
    <div className="container-fluid px-0">
      {error && <div className="alert alert-danger dashboard-alert">{error}</div>}

      <div className="row g-3 mb-4">
        {summaryCards.map(([label, value, icon, color]) => (
          <div className="col-6 col-lg-2" key={String(label)}>
            <div className="stat-card h-100">
              <div className="stat-label"><i className={`fa-solid ${icon} me-1`} />{String(label)}</div>
              <div className={`stat-value ${color}`}>{Number(value || 0).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-8">
          <section className="section-card h-100">
            <div className="section-card-header">
              <span><i className="fa-solid fa-triangle-exclamation me-2 text-warning" />Incident Center</span>
              <button className="btn btn-sm rounded-pill fw-bold btn-sub" onClick={load}>
                <i className="fa-solid fa-arrows-rotate me-1" />Refresh
              </button>
            </div>
            <div className="table-responsive">
              <table className="db-table">
                <thead><tr><th>Severity</th><th>Type</th><th>Event</th><th>Status</th><th>When</th><th>User</th><th className="text-end">Actions</th></tr></thead>
                <tbody>
                  {!data ? (
                    <tr><td colSpan={7} className="text-center py-4"><div className="spinner-border spinner-border-sm text-warning" /></td></tr>
                  ) : events.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-4 text-muted fw-bold">No active incidents.</td></tr>
                  ) : events.map((event) => {
                    const key = `${event.kind}:${event.source_id}`;
                    return (
                      <tr key={key}>
                        <td><span className={`badge rounded-pill ${severityClass(event.severity)}`}>{event.severity}</span></td>
                        <td className="small fw-bold">{event.kind}</td>
                        <td className="fw-bold">{event.title}</td>
                        <td>{event.status || "new"}</td>
                        <td className="small">{event.timestamp}</td>
                        <td>
                          {event.user_id ? (
                            <Link className="fw-bold" to={`/dashboard/trust?user_id=${encodeURIComponent(String(event.user_id))}`}>
                              {String(event.user_id)}
                            </Link>
                          ) : "-"}
                        </td>
                        <td className="text-end text-nowrap">
                          {["investigating", "resolved", "dismissed"].map((status) => (
                            <button
                              key={status}
                              className="btn btn-sm btn-sub rounded-pill fw-bold me-1"
                              disabled={busyKey === `${key}:${status}`}
                              onClick={() => updateIncident(event, status)}
                            >
                              {status === "investigating" ? "Investigate" : status === "resolved" ? "Resolve" : "Dismiss"}
                            </button>
                          ))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="col-12 col-xl-4">
          <section className="section-card h-100">
            <div className="section-card-header"><span><i className="fa-solid fa-plane me-2 dashboard-blue" />Dodo Queue</span></div>
            <div className="table-responsive">
              <table className="db-table">
                <thead><tr><th>Island</th><th>User</th><th>Status</th><th className="text-end">Actions</th></tr></thead>
                <tbody>
                  {queue.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-4 text-muted fw-bold">Queue is clear.</td></tr>
                  ) : queue.map((entry) => (
                    <tr key={entry.id}>
                      <td className="fw-bold">{entry.island_name}</td>
                      <td>
                        <Link to={`/dashboard/trust?user_id=${encodeURIComponent(entry.user_id)}`}>{entry.username || entry.user_id}</Link>
                        <div className="x-small text-muted">{fmtDate(entry.created_at)}</div>
                      </td>
                      <td>{entry.status}</td>
                      <td className="text-end text-nowrap">
                        {["called", "done", "cancelled"].map((status) => (
                          <button
                            key={status}
                            className="btn btn-sm btn-sub rounded-pill fw-bold me-1"
                            disabled={busyKey === `queue:${entry.id}:${status}`}
                            onClick={() => updateQueue(entry, status)}
                          >
                            {status === "called" ? "Call" : status === "done" ? "Done" : "Cancel"}
                          </button>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DashboardIncidents;
