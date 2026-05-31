import { Link } from "react-router-dom";

const DashboardForbidden = () => (
  <main className="min-vh-100 d-flex align-items-center justify-content-center nook-bg p-3">
    <div className="bg-white border rounded-5 shadow-lg p-5 text-center" style={{ maxWidth: 480 }}>
      <i className="fa-solid fa-lock fa-3x text-danger mb-3" />
      <h1 className="h3 fw-black">Moderator Access Required</h1>
      <p className="text-muted fw-bold">Your Discord account is logged in, but it does not have dashboard access.</p>
      <Link to="/" className="btn btn-success rounded-pill fw-bold px-4">Back Home</Link>
    </div>
  </main>
);

export default DashboardForbidden;
