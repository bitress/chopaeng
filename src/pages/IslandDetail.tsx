import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PUBLIC_ISLANDS, type Islands } from "../data/islands.tsx";

type ApiIsland = {
    dodo: string;
    name: string;
    status: string;
    type: string;
    visitors: string;
};

const slugify = (s: string) => s.toLowerCase().trim().replace(/['"]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

const mergeIslands = (publicIslands: Islands[], apiIslands: ApiIsland[]) => {
    const apiById = new Map<string, ApiIsland>();
    const apiByName = new Map<string, ApiIsland>();
    for (const a of apiIslands) {
        const id = slugify(a.name);
        apiById.set(id, a);
        apiByName.set(a.name.toUpperCase(), a);
    }
    return publicIslands.map((p) => {
        const api = apiById.get(p.id) || apiByName.get(String(p.name).toUpperCase());
        return {
            ...p,
            live: api ? {
                dodo: api.dodo,
                status: api.status,
                access: api.type,
                visitors: api.visitors,
                isSubOnly: api.dodo?.toUpperCase() === "SUB ONLY" || api.status?.toUpperCase() === "SUB ONLY",
                isOnline: api.status?.toUpperCase() === "ONLINE",
            } : null,
        };
    });
};

const IslandDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [apiIslands, setApiIslands] = useState<ApiIsland[]>([]);
    const [loading, setLoading] = useState(true);
    const [showImageModal, setShowImageModal] = useState(false);


    useEffect(() => {
        let cancelled = false;
        const fetchIslands = async () => {
            try {
                setLoading(true);
                const res = await fetch("https://dodo.chopaeng.com/api/islands");
                if (!res.ok) throw new Error(`API error: ${res.status}`);
                const data = await res.json();
                if (!cancelled) setApiIslands(data);
            } catch  {
                if (!cancelled) console.log("error")
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchIslands();
        const interval = setInterval(fetchIslands, 30000); // Refresh every 30s
        return () => { cancelled = true; clearInterval(interval); };
    }, []);

    const MERGED_ISLANDS = useMemo(() => mergeIslands(PUBLIC_ISLANDS, apiIslands), [apiIslands]);
    const island = MERGED_ISLANDS.find((i) => i.id === id);

    if (!island) return <div className="text-center p-5 fw-bold">Island not found!</div>;

    const themeColor =
        island.theme === "teal"
            ? "#7ec9b1"
            : island.theme === "purple"
                ? "#d0bfff"
                : island.theme === "gold"
                    ? "#f2c94c"
                    : "#ffb7ce";
    const live = island.live;
    const canShowDodo = live?.isOnline && !live?.isSubOnly && live?.dodo && !["GETTIN'", "FULL"].includes(live.dodo);
    const mapImageSrc = `/maps/${island.name.toLowerCase()}.png`;
    return (
        <div className="nook-detail-root min-vh-100 py-4 py-md-5">
            <div className="container" style={{ maxWidth: "1000px" }}>

                {/* Header Navigation */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <button onClick={() => navigate("/maps")} className="btn-passport-back">
                        <i className="fa-solid fa-chevron-left me-2"></i> Gallery
                    </button>
                    <div className="badge-stamp shadow-sm">Verified Destination</div>
                </div>

                <div className="passport-frame shadow-lg">
                    {/* Top Section: Postcard Title */}
                    <div className="postcard-header" style={{ borderBottom: `8px solid ${themeColor}` }}>
                        <div className="row align-items-center">
                            <div className="col-md-8">
                                <span className="text-uppercase x-small fw-black text-muted tracking-widest mb-1 d-block">Official Entry Passport</span>
                                <h1 className="ac-display display-3 mb-0">{island.name}</h1>
                                <p className="text-muted fw-bold mb-0">{island.type}</p>
                            </div>
                            <div className="col-md-4 text-md-end d-none d-md-block">
                                <div className="airmail-strip"></div>
                                <i className="fa-solid fa-plane-departure fa-4x opacity-10"></i>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 p-lg-5 bg-white">
                        <div className="row g-4 g-lg-5">
                            {/* Left: Map & Live Display */}
                            <div className="col-lg-5">
                                <div className="map-tape-container">
                                    <div className="tape-deco top-left"></div>
                                    <div className="tape-deco top-right"></div>
                                    <div
                                        className="cursor-pointer position-relative"
                                        onClick={() => setShowImageModal(true)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => e.key === "Enter" && setShowImageModal(true)}
                                    >
                                        <img
                                            src={mapImageSrc}
                                            alt={`${island.name} map`}
                                            className="img-fluid rounded-2 border shadow-sm hover-zoom"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                if (target.src.includes('.png')) {
                                                    target.src = target.src.replace('.png', '.jpg');
                                                } else if (target.src.endsWith('.jpg')) {
                                                    target.src = target.src.replace('.jpg', '.jpeg');
                                                } else {
                                                    target.src = 'https://www.chopaeng.com/banner.png';
                                                }
                                            }}
                                        />
                                        <div className="zoom-hint">
                                            <i className="fa-solid fa-magnifying-glass-plus"></i> Click to zoom
                                        </div>
                                    </div>
                                </div>

                                {/* Live Terminal Card */}
                                <div className="live-terminal mt-4">
                                    <div className="terminal-header">
                                        <i className="fa-solid fa-satellite-dish fa-spin-slow me-2"></i>
                                        Live Flight Data
                                    </div>
                                    <div className="terminal-body">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="label">STATUS:</span>
                                            <span className={`value ${live?.isOnline ? 'text-success' : 'text-danger'}`}>
                                                {loading ? 'SYNCING...' : live?.status || 'OFFLINE'}
                                            </span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="label">CAPACITY:</span>
                                            <span className="value">{live?.visitors || '0/7'}</span>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <span className="label">ACCESS:</span>
                                            <span className="value text-warning">{live?.access || 'PUBLIC'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Details & Action */}
                            <div className="col-lg-7">
                                <div className="details-scroll pe-lg-3">
                                    <section className="mb-4">
                                        <h4 className="section-title"><i className="fa-solid fa-quote-left me-2"></i>Briefing</h4>
                                        <p className="text-muted lh-base">{island.description}</p>
                                    </section>

                                    <section className="mb-4">
                                        <h4 className="section-title"><i className="fa-solid fa-box-open me-2"></i>Inventory Highlights</h4>
                                        <div className="d-flex flex-wrap gap-2">
                                            {( island.items ?? []).map((set: string) => (
                                                <span key={set} className="inventory-chip" style={{ borderLeft: `4px solid ${themeColor}` }}>
                                                    {set}
                                                </span>
                                            ))}
                                        </div>
                                    </section>


                                    {/* Final CTA */}
                                    <div className="mt-5">
                                        <button
                                            className={`btn-dodo-action w-100 ${canShowDodo ? "active" : "disabled"}`}
                                            disabled={!canShowDodo}
                                        >
                                            <div className="d-flex align-items-center justify-content-center gap-3 py-2">
                                                <i
                                                    className={`fa-solid ${
                                                        canShowDodo ? "fa-plane-arrival" : live?.isSubOnly ? "fa-lock" : "fa-ban"
                                                    }`}
                                                ></i>

                                                <div className="text-start">
                                                    <div className="fw-black h5 mb-0">
                                                        {canShowDodo
                                                            ? `Dodo Code: ${live?.dodo}`
                                                            : live?.isSubOnly
                                                                ? "Subscribers Only"
                                                                : "Gate Closed"}
                                                    </div>

                                                    <div className="x-small opacity-75 fw-bold">
                                                        {canShowDodo
                                                            ? "Use this code at the airport ✈️"
                                                            : live?.isSubOnly
                                                                ? "Subscribe on Patreon to unlock"
                                                                : "Island is currently unavailable"}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>

                                        {live?.isSubOnly && (
                                            <a
                                                href="https://www.patreon.com/cw/chopaeng/membership"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-link w-100 mt-2 text-warning fw-bold text-decoration-none small"
                                            >
                                                Unlock VIP Access <i className="fa-solid fa-arrow-up-right-from-square ms-1"></i>
                                            </a>
                                        )}
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showImageModal && (
                <div
                    className="image-modal-overlay"
                    onClick={() => setShowImageModal(false)}
                >
                    <div
                        className="image-modal-content"
                        onClick={(e) => e.stopPropagation()} // prevent closing when clicking image
                    >
                        <button
                            className="modal-close-btn"
                            onClick={() => setShowImageModal(false)}
                            aria-label="Close"
                        >
                            <i className="fa-solid fa-times"></i>
                        </button>

                        <img
                            src={mapImageSrc}
                            alt={`${island.name} map - zoomed`}
                            className="modal-image"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                if (target.src.includes('.png')) {
                                    target.src = target.src.replace('.png', '.jpg');
                                } else if (target.src.endsWith('.jpg')) {
                                    target.src = target.src.replace('.jpg', '.jpeg');
                                } else {
                                    target.src = 'https://www.chopaeng.com/banner.png';
                                }
                            }}
                        />
                    </div>
                </div>
            )}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;700;900&display=swap');

                .nook-detail-root {
                    background-color: #f2f4e6;
                    background-image: radial-gradient(#dce2c8 15%, transparent 16%);
                    background-size: 30px 30px;
                    font-family: 'Nunito', sans-serif;
                }

                .ac-display { font-family: 'Fredoka One', cursive; color: #5a524a; }
                .fw-black { font-weight: 900; }
                .x-small { font-size: 0.75rem; }

                /* Passport Frame */
                .passport-frame {
                    background: #fff;
                    border-radius: 40px;
                    overflow: hidden;
                    border: 2px solid #eeebe5;
                }

                .postcard-header {
                    background: #fffdf5;
                    padding: 40px;
                    position: relative;
                }

                .btn-passport-back {
                    background: white; border: 2px solid #eeebe5; color: #8c8378;
                    padding: 10px 25px; border-radius: 50px; font-weight: 800;
                    box-shadow: 0 4px 0 #eeebe5; transition: 0.2s;
                }
                .btn-passport-back:hover { transform: translateY(-2px); box-shadow: 0 6px 0 #eeebe5; }

                .badge-stamp {
                    background: #fff; border: 2px dashed #7ec9b1; color: #7ec9b1;
                    padding: 5px 20px; border-radius: 10px; font-weight: 900;
                    text-transform: uppercase; transform: rotate(2deg); font-size: 0.8rem;
                }

                /* Map Tape Deco */
                .map-tape-container { position: relative; padding: 15px; background: #fdfbf7; border: 1px solid #eeebe5; }
                .tape-deco {
                    position: absolute; width: 100px; height: 35px;
                    background: rgba(255, 255, 255, 0.4); backdrop-filter: blur(2px);
                    border-left: 2px dashed rgba(0,0,0,0.05); border-right: 2px dashed rgba(0,0,0,0.05);
                    z-index: 2;
                }
                .tape-deco.top-left { top: -10px; left: -10px; transform: rotate(-45deg); }
                .tape-deco.top-right { top: -10px; right: -10px; transform: rotate(45deg); }

                /* Live Terminal */
                .live-terminal {
                    background: #2d2a26; border-radius: 20px; overflow: hidden;
                    color: #fff; border: 4px solid #3d3a36;
                }
                .terminal-header {
                    background: #3d3a36; padding: 10px 20px; font-size: 0.75rem;
                    font-weight: 900; text-transform: uppercase; color: #7ec9b1;
                }
                .terminal-body { padding: 15px 20px; font-family: 'Courier New', monospace; }
                .terminal-body .label { color: #888; font-size: 0.8rem; }
                .terminal-body .value { font-weight: bold; }

                /* Details */
                .section-title { font-family: 'Fredoka One', cursive; font-size: 1.25rem; color: #5a524a; margin-bottom: 1rem; }
                .inventory-chip {
                    background: #fdfbf7; padding: 8px 16px; border-radius: 10px;
                    font-weight: 800; color: #5a524a; border: 1px solid #eeebe5;
                    font-size: 0.9rem;
                }

                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .info-item { background: #fdfbf7; padding: 15px; border-radius: 15px; border: 1px solid #eeebe5; }
                .info-item .label { display: block; font-size: 0.7rem; font-weight: 900; color: #b8ac97; }
                .info-item .value { font-weight: 900; font-size: 1.1rem; color: #5a524a; }
                .dodo-reveal { color: #7ec9b1 !important; letter-spacing: 2px; }

                /* Action Button */
                .btn-dodo-action {
                    border: none; border-radius: 25px; padding: 15px;
                    transition: all 0.3s; color: white;
                }
                .btn-dodo-action.active {
                    background: #7ec9b1; box-shadow: 0 8px 0 #5faf93;
                }
                .btn-dodo-action.active:hover {
                    transform: translateY(-4px); box-shadow: 0 12px 0 #5faf93;
                }
                .btn-dodo-action.disabled {
                    background: #b8ac97; cursor: not-allowed; opacity: 0.7;
                }

                @keyframes float { 0% { transform: translateY(0); } 50% { transform: translateY(-5px); } 100% { transform: translateY(0); } }
                .fa-spin-slow { animation: fa-spin 5s infinite linear; }

                @media (max-width: 768px) {
                    .postcard-header { padding: 25px; }
                    .info-grid { grid-template-columns: 1fr; }
                }
                
                /* Hover zoom hint on map */
        .cursor-pointer {
          cursor: pointer;
        }
        .hover-zoom {
          transition: transform 0.25s ease;
        }
        .hover-zoom:hover {
          transform: scale(1.04);
        }
        .zoom-hint {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: rgba(0,0,0,0.65);
          color: white;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 6px;
          opacity: 0.9;
          pointer-events: none;
        }

        /* Modal */
        .image-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.92);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .image-modal-content {
          position: relative;
          max-width: 95vw;
          max-height: 95vh;
        }
        .modal-image {
          max-width: 100%;
          max-height: 90vh;
          object-fit: contain;
          border-radius: 12px;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.6);
        }
        .modal-close-btn {
          position: absolute;
          top: -18px;
          right: -18px;
          background: #fff;
          border: 3px solid #fff;
          border-radius: 50%;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: #333;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          cursor: pointer;
          transition: all 0.2s;
        }
        .modal-close-btn:hover {
          transform: scale(1.15);
        }

        @media (max-width: 576px) {
          .modal-close-btn {
            top: -10px;
            right: -10px;
            width: 40px;
            height: 40px;
            font-size: 1.3rem;
          }
        }
            `}</style>
        </div>
    );
};

export default IslandDetail;