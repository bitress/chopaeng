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
      <main className="min-vh-100 d-flex align-items-center justify-content-center nook-bg">
        <div className="text-center">
          <div className="spinner-border text-success mb-3" role="status" />
          <p className="fw-bold text-muted">Checking moderator access...</p>
        </div>
      </main>
    );
  }

  if (!user.is_mod && !user.is_admin) {
    return <Navigate to="/dashboard/forbidden" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default RequireMod;
