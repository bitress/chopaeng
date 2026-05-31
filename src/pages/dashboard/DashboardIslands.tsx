import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dashboardApi, type DashboardIsland } from "../../lib/dashboardApi";

const DashboardIslands = () => {
  const [islands, setIslands] = useState<DashboardIsland[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    dashboardApi.islands().then(setIslands).catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="alert alert-danger fw-bold">{error}</div>;

  return (
    <div className="bg-white border rounded-4 p-4 shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h4 fw-black mb-0">Islands</h2>
        <span className="badge text-bg-success rounded-pill">{islands.length} total</span>
      </div>
      <div className="table-responsive">
        <table className="table align-middle">
          <thead><tr><th>Name</th><th>Category</th><th>Status</th><th>Visitors</th><th></th></tr></thead>
          <tbody>
            {islands.map((island) => (
              <tr key={island.id}>
                <td className="fw-bold">{island.name}</td><td>{island.cat}</td><td>{island.status}</td><td>{island.visitors}/7</td>
                <td className="text-end"><Link className="btn btn-sm btn-outline-success fw-bold" to={`/dashboard/islands/${island.id}`}>Edit</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardIslands;
