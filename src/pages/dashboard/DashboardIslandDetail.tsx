import { useEffect, useMemo, useState, type FormEvent, type KeyboardEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { dashboardApi, type DashboardIsland } from "../../lib/dashboardApi";

const fallbackCategories = ["public", "member"];
const fallbackThemes = ["pink", "teal", "purple", "gold"];
const fallbackStatuses = ["ONLINE", "SUB ONLY", "REFRESHING", "OFFLINE"];

const statusClass = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized.includes("online")) return "online";
  if (normalized.includes("sub")) return "sub-only";
  if (normalized.includes("refresh")) return "refreshing";
  return "offline";
};

const splitItems = (value: string) => value.split(/[,\n]/).map((item) => item.trim()).filter(Boolean);

const DashboardIslandDetail = () => {
  const { id = "" } = useParams();
  const [island, setIsland] = useState<DashboardIsland | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [itemsText, setItemsText] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [mapFile, setMapFile] = useState<File | null>(null);
  const [mapPreview, setMapPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Copy");

  useEffect(() => {
    dashboardApi.island(id).then((data) => {
      setIsland(data);
      setTags(data.items || []);
      setItemsText("");
    }).catch((err) => setError(err.message));
  }, [id]);

  useEffect(() => {
    if (!mapFile) {
      setMapPreview("");
      return;
    }
    const url = URL.createObjectURL(mapFile);
    setMapPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [mapFile]);

  const itemPayload = useMemo(() => [...new Set([...tags, ...splitItems(itemsText)])], [itemsText, tags]);
  const maxSparkline = useMemo(() => Math.max(...(island?.sparkline_7d || []).map((row) => row.count), 1), [island]);

  const updateField = (key: keyof DashboardIsland, value: string | number) => {
    setIsland((prev) => prev ? { ...prev, [key]: value } : prev);
  };

  const addItems = () => {
    const next = splitItems(itemsText);
    if (next.length === 0) return;
    setTags((prev) => [...new Set([...prev, ...next])]);
    setItemsText("");
  };

  const handleItemsKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addItems();
    }
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!island) return;
    setMessage("");
    setError("");
    try {
      await dashboardApi.updateIsland(id, { ...island, items: itemPayload });
      setTags(itemPayload);
      setItemsText("");
      setMessage("Island saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  };

  const uploadMap = async () => {
    if (!mapFile || !island) {
      setError("Please choose a map image first.");
      return;
    }
    setMessage("");
    setError("");
    setUploading(true);
    try {
      const result = await dashboardApi.uploadMap(id, mapFile);
      setIsland({ ...island, map_url: result.map_url });
      setMapFile(null);
      setMessage("Map uploaded.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const copyCdnLink = async () => {
    if (!island?.map_url) return;
    try {
      await navigator.clipboard.writeText(island.map_url);
      setCopyLabel("Copied");
      window.setTimeout(() => setCopyLabel("Copy"), 1600);
    } catch {
      setCopyLabel("Copy failed");
      window.setTimeout(() => setCopyLabel("Copy"), 1600);
    }
  };

  if (error && !island) return <div className="alert alert-danger fw-bold">{error}</div>;
  if (!island) return <div className="text-center py-5"><div className="spinner-border text-success" /></div>;

  const categories = island.allowed_categories?.length ? island.allowed_categories : fallbackCategories;
  const themes = island.allowed_themes?.length ? island.allowed_themes : fallbackThemes;
  const statuses = island.allowed_statuses?.length ? island.allowed_statuses : fallbackStatuses;
  const sparkline = island.sparkline_7d || [];
  const sparklineTotal = sparkline.reduce((total, row) => total + row.count, 0);

  return (
    <div className="container px-0 dashboard-island-editor">
      <Link to="/dashboard/islands" className="btn-nook-back d-inline-flex text-decoration-none mb-4" title="Back to Islands">
        <i className="fa-solid fa-arrow-left" />
      </Link>

      <div className="row g-4">
        <div className="col-md-6">
          <section className="section-card mb-4">
            <div className="section-card-header">
              <div>
                <span className="ac-font dashboard-island-title">{island.name}</span>
                <span className="x-small ms-2 fw-bold text-muted">
                  {island.fs_type === "VIP" && <span className="dashboard-purple"><i className="fa-solid fa-star me-1" />VIP Island</span>}
                  {island.fs_type === "Free" && <span className="text-success"><i className="fa-solid fa-leaf me-1" />Free Island</span>}
                  {!island.fs_type && <span>No folder</span>}
                  {island.updated_at && <span>&nbsp; Saved {String(island.updated_at).slice(0, 19).replace("T", " ")}</span>}
                </span>
              </div>
              <span className={`status-pill ${statusClass(island.status)} dashboard-static-pill`}>{island.status}</span>
            </div>

            <form className="p-4" onSubmit={save}>
              {message && <div className="alert alert-success fw-bold">{message}</div>}
              {error && <div className="alert alert-danger fw-bold">{error}</div>}

              <div className="row g-3 mb-3">
                <div className="col-sm-6">
                  <label className="db-label">Island Type</label>
                  <input className="db-input" placeholder="e.g. Treasure Island" value={island.type || ""} onChange={(e) => updateField("type", e.target.value)} />
                </div>
                <div className="col-sm-6">
                  <label className="db-label">Seasonal</label>
                  <input className="db-input" placeholder="e.g. Year-Round, Festive" value={island.seasonal || ""} onChange={(e) => updateField("seasonal", e.target.value)} />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-sm-4">
                  <label className="db-label">Category</label>
                  <select className="db-input" value={island.cat || ""} onChange={(e) => updateField("cat", e.target.value)}>
                    {categories.map((cat) => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
                  </select>
                </div>
                <div className="col-sm-4">
                  <label className="db-label">Theme</label>
                  <select className="db-input" value={island.theme || ""} onChange={(e) => updateField("theme", e.target.value)}>
                    {themes.map((theme) => <option key={theme} value={theme}>{theme.charAt(0).toUpperCase() + theme.slice(1)}</option>)}
                  </select>
                </div>
                <div className="col-sm-4">
                  <label className="db-label">Status</label>
                  <select className="db-input" value={island.status || ""} onChange={(e) => updateField("status", e.target.value)}>
                    {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="db-label">Description</label>
                <textarea className="db-input" rows={3} placeholder="Short description visible on the island page..." value={island.description || ""} onChange={(e) => updateField("description", e.target.value)} />
              </div>

              <div className="mb-4">
                <label className="db-label">Items <span className="text-lowercase dashboard-label-note">(one per line or comma-separated)</span></label>
                <div className="dashboard-tags-display" onClick={() => document.getElementById("itemsTextarea")?.focus()}>
                  {tags.length === 0 && <span className="dashboard-tag-empty">No items added yet.</span>}
                  {tags.map((item) => (
                    <span className="dashboard-item-tag" key={item}>
                      {item}
                      <button type="button" onClick={(event) => {
                        event.stopPropagation();
                        setTags((prev) => prev.filter((tag) => tag !== item));
                      }}>x</button>
                    </span>
                  ))}
                </div>
                <textarea
                  id="itemsTextarea"
                  rows={3}
                  placeholder="Add items, one per line or comma-separated..."
                  className="db-input font-monospace dashboard-tags-textarea"
                  value={itemsText}
                  onChange={(e) => setItemsText(e.target.value)}
                  onBlur={addItems}
                  onKeyDown={handleItemsKeyDown}
                />
              </div>

              <div className="mb-4">
                <label className="db-label">Required Subscription Roles <span className="text-lowercase dashboard-label-note">(managed automatically via Discord channel overwrites)</span></label>
                <div className="dashboard-roles-box">
                  {island.required_roles?.length
                    ? `${island.required_roles.length} role(s) configured via Discord channel permissions.`
                    : "No roles configured or channel overwrites not synced yet."}
                </div>
              </div>

              <div className="d-flex align-items-center gap-3 flex-wrap">
                <button type="submit" className="btn btn-nook-primary px-4 py-2 rounded-3 fw-bold">
                  <i className="fa-solid fa-circle-check me-2" />Save Changes
                </button>
                <Link to="/dashboard/islands" className="btn dashboard-cancel-btn fw-bold px-4 py-2 rounded-3">Cancel</Link>
              </div>
            </form>
          </section>
        </div>

        <div className="col-md-6">
          <section className="section-card mb-4">
            <div className="section-card-header">
              <span><i className="fa-solid fa-map me-2 text-success" />Island Map</span>
            </div>
            <div className="p-4">
              {island.map_url ? (
                <div className="polaroid-stack mb-4">
                  <div className="tape-strip" />
                  <div className="map-polaroid">
                    <div className="img-wrapper dashboard-map-wrapper">
                      <img src={island.map_url} alt={`${island.name} map`} className="map-img dashboard-map-img" />
                      <div className="zoom-indicator"><i className="fa-solid fa-magnifying-glass-plus" /></div>
                    </div>
                    <div className="polaroid-caption">{island.name}</div>
                  </div>
                </div>
              ) : (
                <p className="x-small fw-bold mb-3 text-muted"><i className="fa-solid fa-image me-1" />No map uploaded yet.</p>
              )}

              {island.map_url && (
                <div className="mb-3">
                  <label className="db-label mb-1"><i className="fa-solid fa-link me-1" />CDN Link</label>
                  <div className="input-group input-group-sm">
                    <input type="text" value={island.map_url} readOnly className="form-control font-monospace dashboard-cdn-input" />
                    <button type="button" className="btn btn-nook-primary fw-bold px-3 dashboard-cdn-button" onClick={copyCdnLink}>
                      {copyLabel}
                    </button>
                  </div>
                </div>
              )}

              {!island.r2_configured && (
                <div className="alert border-0 rounded-3 py-2 px-3 mt-2 dashboard-r2-warning">
                  <i className="fa-solid fa-triangle-exclamation me-2" />
                  R2 is not configured on the backend. Set the R2 env vars before using map uploads in production.
                </div>
              )}

              <div className="d-flex align-items-center gap-3">
                <label className="flex-grow-1 cursor-pointer mb-0">
                  <span className="visually-hidden">Choose map image</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="form-control form-control-sm dashboard-file-input" disabled={!island.r2_configured} onChange={(e) => setMapFile(e.target.files?.[0] || null)} />
                </label>
                <button type="button" className="btn btn-nook-primary px-3 py-2 rounded-3 fw-bold flex-shrink-0 dashboard-upload-btn" disabled={uploading || !island.r2_configured} onClick={uploadMap}>
                  <i className="fa-solid fa-cloud-arrow-up me-1" />{uploading ? "Uploading" : "Upload"}
                </button>
              </div>

              {mapPreview && <img src={mapPreview} alt="Preview" className="mt-3 rounded-3 w-100 dashboard-map-preview" />}
            </div>
          </section>

          <section className="section-card">
            <div className="section-card-header">
              <span><i className="fa-solid fa-chart-line me-2 dashboard-blue" />Visits - Last 7 Days</span>
            </div>
            <div className="p-4">
              {sparkline.length > 0 ? (
                <>
                  <div className="dashboard-spark-bars dashboard-island-sparkline">
                    {sparkline.map((row) => (
                      <div className="dashboard-spark-item" key={row.day}>
                        <div className="dashboard-spark-track"><span style={{ height: `${Math.max(4, Math.round((row.count / maxSparkline) * 100))}%` }} /></div>
                        <small>{row.day.slice(5)}</small>
                      </div>
                    ))}
                  </div>
                  <div className="x-small fw-bold text-center mt-2 text-muted">{sparklineTotal} total visit(s) in the last 7 days</div>
                </>
              ) : (
                <div className="dashboard-empty py-3">
                  <i className="fa-solid fa-chart-line d-block mb-2" />
                  No visits recorded in the last 7 days.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DashboardIslandDetail;
