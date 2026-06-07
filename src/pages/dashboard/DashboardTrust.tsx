import { useState } from "react";
import { dashboardApi } from "../../lib/dashboardApi";

const DashboardTrust = () => {
  const [userId, setUserId] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const search = async () => {
    if (!userId.trim()) return;
    setLoading(true);
    setError("");
    setProfile(null);
    try {
      const data = await dashboardApi.userTrustProfile(userId.trim());
      setProfile(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch trust profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid px-0">
      <section className="section-card">
        <div className="section-card-header">
          <span><i className="fa-solid fa-user-shield me-2 text-success" />User Trust Profile</span>
        </div>
        <div className="p-4">
          <div className="row g-3 align-items-end mb-4">
            <div className="col-md-5">
              <label className="db-label">Discord User ID</label>
              <input 
                className="db-input" 
                value={userId} 
                onChange={(e) => setUserId(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && search()}
                placeholder="1234567890" 
              />
            </div>
            <div className="col-md-2">
              <button className="btn btn-nook-primary w-100 fw-bold" disabled={loading} onClick={search}>
                {loading ? <span className="spinner-border spinner-border-sm" /> : "Search"}
              </button>
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {profile && (
            <div className="mt-4">
              <pre className="bg-light p-3 rounded">{JSON.stringify(profile, null, 2)}</pre>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardTrust;
