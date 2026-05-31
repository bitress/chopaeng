import { useEffect, useState } from "react";
import { dashboardApi, type DashboardAnalytics as AnalyticsPayload } from "../../lib/dashboardApi";

const DashboardAnalytics = () => {
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    dashboardApi.analytics().then(setData).catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="alert alert-danger fw-bold">{error}</div>;
  if (!data) return <div className="text-center py-5"><div className="spinner-border text-success" /></div>;

  const cards = [
    ["Visits Today", data.visits_today],
    ["Visits This Week", data.visits_week],
    ["Warnings This Week", data.warnings_week],
    ["Auth Rate", data.auth_rate_pct == null ? "n/a" : `${data.auth_rate_pct}%`],
  ];

  return (
    <div className="d-grid gap-4">
      <div className="row g-3">{cards.map(([label, value]) => <div className="col-md-3" key={String(label)}><div className="bg-white border rounded-4 p-4 shadow-sm"><p className="text-muted fw-bold small mb-1">{String(label)}</p><h2 className="fw-black mb-0">{String(value ?? 0)}</h2></div></div>)}</div>
      <div className="bg-white border rounded-4 p-4 shadow-sm"><h2 className="h5 fw-black">Top Islands</h2><pre className="small bg-light rounded-3 p-3 mb-0">{JSON.stringify(data.top_islands || [], null, 2)}</pre></div>
    </div>
  );
};

export default DashboardAnalytics;
