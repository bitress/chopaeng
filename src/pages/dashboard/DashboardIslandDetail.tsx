import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { dashboardApi, type DashboardIsland } from "../../lib/dashboardApi";

const DashboardIslandDetail = () => {
  const { id = "" } = useParams();
  const [island, setIsland] = useState<DashboardIsland | null>(null);
  const [itemsText, setItemsText] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    dashboardApi.island(id).then((data) => {
      setIsland(data);
      setItemsText((data.items || []).join(", "));
    }).catch((err) => setError(err.message));
  }, [id]);

  const updateField = (key: keyof DashboardIsland, value: string | number) => {
    setIsland((prev) => prev ? { ...prev, [key]: value } : prev);
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!island) return;
    setMessage("");
    setError("");
    try {
      await dashboardApi.updateIsland(id, {
        ...island,
        items: itemsText.split(",").map((item) => item.trim()).filter(Boolean),
      });
      setMessage("Island saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  };

  const uploadMap = async (file: File | undefined) => {
    if (!file || !island) return;
    setMessage("");
    setError("");
    try {
      const result = await dashboardApi.uploadMap(id, file);
      setIsland({ ...island, map_url: result.map_url });
      setMessage("Map uploaded.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  };

  if (error && !island) return <div className="alert alert-danger fw-bold">{error}</div>;
  if (!island) return <div className="text-center py-5"><div className="spinner-border text-success" /></div>;

  return (
    <form className="bg-white border rounded-4 p-4 shadow-sm" onSubmit={save}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <Link to="/dashboard/islands" className="small fw-bold text-success text-decoration-none">Back to islands</Link>
          <h2 className="h4 fw-black mb-0">{island.name}</h2>
        </div>
        <button className="btn btn-success fw-bold rounded-pill px-4" type="submit">Save</button>
      </div>
      {message && <div className="alert alert-success fw-bold">{message}</div>}
      {error && <div className="alert alert-danger fw-bold">{error}</div>}
      <div className="row g-3">
        <div className="col-md-6"><label className="form-label fw-bold">Name</label><input className="form-control" value={island.name} onChange={(e) => updateField("name", e.target.value)} /></div>
        <div className="col-md-6"><label className="form-label fw-bold">Type</label><input className="form-control" value={island.type || ""} onChange={(e) => updateField("type", e.target.value)} /></div>
        <div className="col-md-4"><label className="form-label fw-bold">Category</label><select className="form-select" value={island.cat} onChange={(e) => updateField("cat", e.target.value)}><option value="public">public</option><option value="member">member</option></select></div>
        <div className="col-md-4"><label className="form-label fw-bold">Theme</label><select className="form-select" value={island.theme} onChange={(e) => updateField("theme", e.target.value)}><option>teal</option><option>pink</option><option>purple</option><option>gold</option></select></div>
        <div className="col-md-4"><label className="form-label fw-bold">Status</label><select className="form-select" value={island.status} onChange={(e) => updateField("status", e.target.value)}><option>ONLINE</option><option>SUB ONLY</option><option>REFRESHING</option><option>OFFLINE</option></select></div>
        <div className="col-md-4"><label className="form-label fw-bold">Visitors</label><input type="number" min="0" max="7" className="form-control" value={island.visitors} onChange={(e) => updateField("visitors", Number(e.target.value))} /></div>
        <div className="col-md-8"><label className="form-label fw-bold">Seasonal</label><input className="form-control" value={island.seasonal || ""} onChange={(e) => updateField("seasonal", e.target.value)} /></div>
        <div className="col-12"><label className="form-label fw-bold">Description</label><textarea className="form-control" rows={3} value={island.description || ""} onChange={(e) => updateField("description", e.target.value)} /></div>
        <div className="col-12"><label className="form-label fw-bold">Items</label><textarea className="form-control" rows={3} value={itemsText} onChange={(e) => setItemsText(e.target.value)} /></div>
        <div className="col-md-8"><label className="form-label fw-bold">Map URL</label><input className="form-control" value={island.map_url || ""} disabled /></div>
        <div className="col-md-4"><label className="form-label fw-bold">Upload Map</label><input type="file" accept="image/*" className="form-control" onChange={(e) => uploadMap(e.target.files?.[0])} /></div>
      </div>
    </form>
  );
};

export default DashboardIslandDetail;

