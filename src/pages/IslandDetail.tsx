import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ISLANDS_DATA, type IslandData } from "../data/islands.ts";

// --- Types & Helpers ---
type ApiIsland = {
    dodo: string;
    name: string;
    status: string;
    type: string;
    visitors: string;
};

const slugify = (s: string) => s.toLowerCase().trim().replace(/['"]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

const mergeIslands = (publicIslands: IslandData[], apiIslands: ApiIsland[]) => {
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
            } catch {
                if (!cancelled) console.log("error fetching islands");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchIslands();
        const interval = setInterval(fetchIslands, 30000);
        return () => { cancelled = true; clearInterval(interval); };
    }, []);

    const MERGED_ISLANDS = useMemo(() => mergeIslands(ISLANDS_DATA, apiIslands), [apiIslands]);
    const island = MERGED_ISLANDS.find((i) => i.id === id);

    if (!island) return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: '#f0f4e4', color: '#7ba592' }}>
            <div className="text-center">
                <i className="fa-solid fa-plane-slash fa-3x mb-3 opacity-50"></i>
                <h2 className="fw-black">Destination Not Found</h2>
                <button onClick={() => navigate("/maps")} className="btn btn-link text-success fw-bold">Return Home</button>
            </div>
        </div>
    );

    const live = island.live;
    const canShowDodo = live?.isOnline && !live?.isSubOnly && live?.dodo && !["GETTIN'", "FULL"].includes(live.dodo);
    const mapImageSrc = `/maps/${island.name.toLowerCase()}.png`;

    return (
        <div className="nook-bg min-vh-100 py-4 py-md-5">
            <div className="container" style={{ maxWidth: "1050px" }}>

                {/* Navigation Breadcrumb */}
                <div className="d-flex align-items-center mb-4 px-2">
                    <button onClick={() => navigate(-1)} className="btn-nook-back me-3">
                        <i className="fa-solid fa-arrow-left"></i>
                    </button>
                    <span className="text-muted fw-bold text-uppercase small tracking-wide">Dodo Airlines Travel Guide</span>
                </div>

                <div className="row g-4">
                    {/* LEFT COLUMN: Map & Status */}
                    <div className="col-lg-5">

                        {/* Map Polaroid */}
                        <div className="polaroid-stack mb-4">
                            <div
                                className="map-polaroid cursor-pointer"
                                onClick={() => setShowImageModal(true)}
                            >
                                <div className="tape-strip"></div>
                                <div className="img-wrapper">
                                    <img
                                        src={mapImageSrc}
                                        alt={island.name}
                                        className="img-fluid"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            if (target.src.includes('.png')) target.src = target.src.replace('.png', '.jpg');
                                            else if (target.src.endsWith('.jpg')) target.src = target.src.replace('.jpg', '.jpeg');
                                            else target.src = 'https://www.chopaeng.com/banner.png';
                                        }}
                                    />
                                    <div className="zoom-indicator">
                                        <i className="fa-solid fa-expand"></i>
                                    </div>
                                </div>
                                <div className="polaroid-caption">
                                    <i className="fa-solid fa-map-location-dot me-2 text-warning"></i>
                                    {island.name} Map
                                </div>
                            </div>
                        </div>

                        {/* DAL Flight Board */}
                        <div className="dal-card shadow-sm">
                            <div className="dal-header">
                                <i className="fa-solid fa-plane-up me-2"></i> DAL Flight Info
                            </div>
                            <div className="dal-body">
                                <div className="flight-row">
                                    <span className="flight-label">STATUS</span>
                                    <span className={`flight-value ${live?.isOnline ? 'text-dal-blue' : 'text-danger'}`}>
                                        {loading ? <span className="pulse">SCANNING...</span> : (live?.status || 'OFFLINE')}
                                    </span>
                                </div>
                                <div className="flight-divider"></div>
                                <div className="flight-row">
                                    <span className="flight-label">PASSENGERS</span>
                                    <span className="flight-value">{live?.visitors || '0/7'}</span>
                                </div>
                                <div className="flight-divider"></div>
                                <div className="flight-row">
                                    <span className="flight-label">GATE TYPE</span>
                                    <span className="flight-value text-warning">{live?.access || 'PUBLIC'}</span>
                                </div>
                            </div>
                            <div className="dal-footer">
                                <small>Dodo Airlines • We make travel a breeze!</small>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Passport Info */}
                    <div className="col-lg-7">
                        <div className="passport-booklet shadow-lg">
                            {/* Passport Header with Tear-off effect */}
                            <div className="passport-header">
                                <div className="d-flex justify-content-between align-items-start position-relative z-2">
                                    <div>
                                        <div className="passport-stamp mb-2">VERIFIED</div>
                                        <h1 className="island-title">{island.name}</h1>
                                        <span className="island-badge">{island.type}</span>
                                    </div>
                                    <i className="fa-solid fa-passport fa-4x opacity-25 text-white rotate-12"></i>
                                </div>
                                <div className="wave-pattern"></div>
                            </div>

                            <div className="passport-body">
                                <div className="mb-4">
                                    <h5 className="notebook-heading">
                                        <i className="fa-solid fa-bullhorn me-2 text-nook"></i>
                                        Island Bulletin
                                    </h5>
                                    <div className="notebook-lines p-3">
                                        {island.description}
                                    </div>
                                </div>

                                <div className="mb-5">
                                    <h5 className="notebook-heading">
                                        <i className="fa-solid fa-gem me-2 text-nook"></i>
                                        Available Loot
                                    </h5>
                                    <div className="d-flex flex-wrap gap-2">
                                        {(island.items ?? []).map((item) => (
                                            <div key={item} className="item-pill">
                                                <span className="dot"></span> {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Call to Action Area */}
                                <div className="action-area">
                                    <button
                                        disabled={!canShowDodo}
                                        className={`btn-dodo-3d ${canShowDodo ? '' : 'disabled'}`}
                                        onClick={() => {
                                            if (canShowDodo && live?.dodo) navigator.clipboard.writeText(live.dodo);
                                        }}
                                    >
                                        <div className="content">
                                            <div className="icon-box">
                                                <i className={`fa-solid ${canShowDodo ? 'fa-plane-departure' : 'fa-lock'}`}></i>
                                            </div>
                                            <div className="text-group">
                                                <span className="action-label">
                                                    {canShowDodo ? 'Copy Dodo Code™' : live?.isSubOnly ? 'VIP Access Only' : 'Gate Closed'}
                                                </span>
                                                <span className="action-code">
                                                    {canShowDodo ? live?.dodo : live?.isSubOnly ? 'Subscribers' : 'Offline'}
                                                </span>
                                            </div>
                                        </div>
                                    </button>

                                    {live?.isSubOnly && (
                                        <a
                                            href="https://www.patreon.com/cw/chopaeng/membership"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="patreon-link"
                                        >
                                            <i className="fa-brands fa-patreon me-2"></i>
                                            Subscribe to Join Queue
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showImageModal && (
                <div className="modal-backdrop-custom" onClick={() => setShowImageModal(false)}>
                    <div className="modal-content-custom" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={mapImageSrc}
                            alt="Zoomed Map"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                if (target.src.includes('.png')) target.src = target.src.replace('.png', '.jpg');
                                else if (target.src.endsWith('.jpg')) target.src = target.src.replace('.jpg', '.jpeg');
                                else target.src = 'https://www.chopaeng.com/banner.png';
                            }}
                        />
                        <button className="close-fab" onClick={() => setShowImageModal(false)}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;800;900&display=swap');

                :root {
                    --nook-green: #7ec9b1;
                    --nook-dark: #3b8c73;
                    --dal-blue: #4090bd;
                    --dal-yellow: #f5c452;
                    --paper: #fdfbf7;
                    --text: #5e564d;
                }

                .nook-bg {
                    background-color: #f0f4e4;
                    background-image: 
                        linear-gradient(45deg, #e6ebd6 25%, transparent 25%, transparent 75%, #e6ebd6 75%, #e6ebd6),
                        linear-gradient(45deg, #e6ebd6 25%, transparent 25%, transparent 75%, #e6ebd6 75%, #e6ebd6);
                    background-size: 40px 40px;
                    background-position: 0 0, 20px 20px;
                    font-family: 'Nunito', sans-serif;
                    color: var(--text);
                }

                .fw-black { font-weight: 900; }
                .text-nook { color: var(--nook-green); }
                .text-dal-blue { color: var(--dal-blue); }

                /* Back Button */
                .btn-nook-back {
                    width: 45px; height: 45px;
                    border-radius: 50%;
                    background: white;
                    border: 3px solid #e1e6d3;
                    color: #9bac85;
                    display: flex; align-items: center; justify-content: center;
                    transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .btn-nook-back:hover {
                    transform: scale(1.1) rotate(-10deg);
                    border-color: var(--nook-green);
                    color: var(--nook-green);
                }

                /* Polaroid Styling */
                .polaroid-stack { position: relative; perspective: 1000px; }
                .map-polaroid {
                    background: white;
                    padding: 15px 15px 50px 15px;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
                    transform: rotate(-2deg);
                    transition: transform 0.3s ease;
                    position: relative;
                }
                .map-polaroid:hover { transform: rotate(0deg) scale(1.02); z-index: 10; }
                
                .img-wrapper { 
                    position: relative; 
                    background: #eee; 
                    overflow: hidden;
                    border: 1px solid #ddd;
                }
                .zoom-indicator {
                    position: absolute; bottom: 10px; right: 10px;
                    background: rgba(0,0,0,0.6); color: white;
                    width: 32px; height: 32px; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 0.8rem; pointer-events: none;
                }

                .tape-strip {
                    position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
                    width: 120px; height: 35px;
                    background: rgba(255,255,255,0.6);
                    border-left: 2px dotted rgba(0,0,0,0.1);
                    border-right: 2px dotted rgba(0,0,0,0.1);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    z-index: 5;
                }
                .polaroid-caption {
                    position: absolute; bottom: 15px; left: 0; right: 0;
                    text-align: center; font-family: 'Fredoka One', cursive;
                    color: #aaa; letter-spacing: 1px;
                }

                /* DAL Card */
                .dal-card {
                    background: white; border-radius: 20px; overflow: hidden;
                    border: 3px solid white;
                    margin-top: 2rem;
                }
                .dal-header {
                    background: var(--dal-blue); color: white;
                    padding: 12px 20px; font-weight: 900; letter-spacing: 1px;
                    font-size: 0.9rem;
                    border-bottom: 4px solid var(--dal-yellow);
                }
                .dal-body { padding: 20px; background: #f4f8fb; }
                .flight-row { display: flex; justify-content: space-between; align-items: center; }
                .flight-label { font-size: 0.75rem; font-weight: 800; color: #8faab8; letter-spacing: 0.5px; }
                .flight-value { font-family: 'Fredoka One', cursive; font-size: 1.2rem; color: #555; }
                .flight-divider { height: 2px; background: #e1e9ef; margin: 12px 0; border-radius: 2px; }
                .dal-footer {
                    background: var(--dal-blue); color: rgba(255,255,255,0.8);
                    font-size: 0.7rem; text-align: center; padding: 6px; font-weight: 700;
                }
                .pulse { animation: pulse 1.5s infinite; }
                @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }

                /* Passport Booklet */
                .passport-booklet {
                    background: var(--paper);
                    border-radius: 25px 5px 5px 25px;
                    overflow: hidden;
                    position: relative;
                }
                .passport-booklet::before {
                    content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 25px;
                    background: linear-gradient(to right, rgba(0,0,0,0.05), transparent);
                    border-right: 1px solid rgba(0,0,0,0.05);
                    z-index: 5;
                }
                
                .passport-header {
                    background: var(--nook-green);
                    padding: 40px 40px 60px 50px; /* Extra left padding for binding */
                    color: white;
                    position: relative;
                    clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
                }
                .passport-stamp {
                    display: inline-block;
                    border: 2px solid rgba(255,255,255,0.6);
                    padding: 4px 10px; border-radius: 8px;
                    font-size: 0.7rem; font-weight: 800; letter-spacing: 2px;
                }
                .island-title { font-family: 'Fredoka One', cursive; font-size: 3.5rem; line-height: 1; margin-bottom: 5px; text-shadow: 2px 2px 0 rgba(0,0,0,0.1); }
                .island-badge { background: rgba(0,0,0,0.2); padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 0.9rem; }
                .passport-body { padding: 30px 40px 40px 50px; }

                .notebook-heading {
                    font-family: 'Fredoka One', cursive; color: #5e564d;
                    margin-bottom: 15px; display: flex; align-items: center;
                }
                .notebook-lines {
                    background-image: repeating-linear-gradient(transparent, transparent 31px, #e3dfd3 31px, #e3dfd3 32px);
                    line-height: 32px;
                    padding-top: 8px !important;
                    color: #6c6358;
                }

                /* Items Pills */
                .item-pill {
                    background: white; border: 2px solid #eaddcf;
                    border-radius: 20px; padding: 6px 14px;
                    font-weight: 700; font-size: 0.85rem; color: #8c7e6e;
                    display: inline-flex; align-items: center;
                }
                .item-pill .dot { width: 8px; height: 8px; background: #eaddcf; border-radius: 50%; margin-right: 8px; }

                /* 3D Button */
                .action-area { margin-top: 40px; }
                .btn-dodo-3d {
                    width: 100%; border: none; background: transparent; padding: 0;
                    position: relative; transition: all 0.1s;
                }
                .btn-dodo-3d .content {
                    background: var(--nook-green);
                    border-radius: 20px;
                    padding: 15px;
                    display: flex; align-items: center; gap: 20px;
                    color: white;
                    transform: translateY(-6px);
                    transition: transform 0.1s, background 0.2s;
                    border: 3px solid var(--nook-dark);
                    box-shadow: 0 6px 0 var(--nook-dark);
                }
                .btn-dodo-3d:active:not(.disabled) .content {
                    transform: translateY(0);
                    box-shadow: 0 0 0 var(--nook-dark);
                }
                .btn-dodo-3d.disabled .content {
                    background: #ccc; border-color: #999; box-shadow: 0 6px 0 #999;
                    cursor: not-allowed;
                }
                .icon-box {
                    width: 50px; height: 50px; background: rgba(0,0,0,0.15);
                    border-radius: 12px; display: flex; align-items: center; justify-content: center;
                    font-size: 1.5rem;
                }
                .text-group { display: flex; flex-direction: column; align-items: flex-start; }
                .action-label { font-size: 0.75rem; text-transform: uppercase; font-weight: 800; opacity: 0.9; }
                .action-code { font-family: 'Fredoka One', cursive; font-size: 1.8rem; line-height: 1; }

                .patreon-link {
                    display: block; text-align: center; margin-top: 15px;
                    color: #d1b080; font-weight: 800; font-size: 0.9rem; text-decoration: none;
                }
                .patreon-link:hover { text-decoration: underline; color: #b89768; }

                /* --- UPDATED MODAL CSS FOR LARGE SCALE IMAGE --- */
                .modal-backdrop-custom {
                    position: fixed; inset: 0; 
                    background: rgba(45, 42, 38, 0.9);
                    z-index: 9999; 
                    display: flex; align-items: center; justify-content: center;
                    padding: 25px; /* Add padding so image doesn't touch screen edge */
                    backdrop-filter: blur(5px); animation: fadeIn 0.2s;
                }
                
                .modal-content-custom { 
                    position: relative;
                    /* Let image define size, up to viewport limits minus padding */
                    width: auto;
                    height: auto; 
                    max-width: 100%;
                    max-height: 100%;
                    display: flex;
                }

                .modal-content-custom img { 
                    /* Max dimensions calculated based on padding */
                    max-width: calc(100vw - 50px);
                    max-height: calc(100vh - 50px);
                    width: auto;
                    height: auto;
                    object-fit: contain; /* Ensure aspect ratio is kept */
                    border-radius: 12px;
                    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.6);
                }

                .close-fab {
                    position: absolute; 
                    top: -20px; right: -20px;
                    width: 50px; height: 50px; border-radius: 50%;
                    background: white; border: none; color: #333;
                    font-size: 1.5rem; box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                    transition: transform 0.2s;
                    cursor: pointer;
                }
                .close-fab:hover { transform: scale(1.1) rotate(90deg); }

                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div>
    );
};

export default IslandDetail;