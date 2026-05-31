import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const RequireMod = () => {
  const { user, loading, login } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) login();
  }, [loading, user, login]);

  if (loading || !user) {
    return (
      <main className="login-wrap p-3">
        <section className="login-card text-center dashboard-auth-card">
          <div className="logo-box mx-auto mb-3">
            <img src="https://cdn.chopaeng.com/logo.webp" alt="ChoBot" className="dashboard-logo" />
          </div>
          <div className="spinner-border text-success mb-3" role="status" />
          <h1 className="h4 fw-black text-nook-green mb-2">Checking Access</h1>
          <p className="fw-bold text-muted mb-0">Connecting your Discord account to the moderator dashboard.</p>
        </section>
      </main>
    );
  }

  if (!user.is_mod && !user.is_admin) {
    return <Navigate to="/dashboard/forbidden" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default RequireMod;
