import { Link } from "react-router-dom";

const DashboardForbidden = () => (
  <main className="login-wrap p-3">
    <section className="login-card text-center dashboard-forbidden-card">
      <div className="logo-box mx-auto mb-3">
        <img src="https://cdn.chopaeng.com/logo.webp" alt="ChoBot" className="dashboard-logo" />
      </div>
      <div className="dashboard-lock-icon mb-3"><i className="fa-solid fa-lock" /></div>
      <h1 className="h3 fw-black text-nook-green mb-2">Moderator Access Required</h1>
      <p className="text-muted fw-bold mb-4">Your Discord account is logged in, but it does not have dashboard access.</p>
      <Link to="/" className="btn btn-success rounded-pill fw-bold px-4">Back Home</Link>
    </section>
  </main>
);

export default DashboardForbidden;
