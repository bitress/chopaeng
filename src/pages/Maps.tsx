import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ISLANDS_DATA } from "../data/islands.ts";

type IslandStatus = "ONLINE" | "SUB ONLY" | "REFRESHING" | "OFFLINE";

interface ApiIsland {
    dodo: string;
    name: string;
    status: string;
    visitors: string;
}

const IslandMaps = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [liveData, setLiveData] = useState<Record<string, any>>({});

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await fetch("https://dodo.chopaeng.com/api/islands");
                if (!response.ok) throw new Error("Network response was not ok");
                const apiData: ApiIsland[] = await response.json();

                const statusMap: Record<string, any> = {};
                apiData.forEach((api) => {
                    let computedStatus: IslandStatus = "OFFLINE";
                    if (["SUB ONLY", "PATREON"].some(k => api.status.toUpperCase().includes(k))) computedStatus = "SUB ONLY";
                    else if (api.dodo === "GETTIN'") computedStatus = "REFRESHING";
                    else if (api.status === "ONLINE") computedStatus = "ONLINE";
                    else if (api.status === "REFRESHING") computedStatus = "REFRESHING";

                    statusMap[api.name.toUpperCase()] = {
                        status: computedStatus,
                        dodo: api.dodo,
                        visitors: api.visitors
                    };
                });
                setLiveData(statusMap);
            } catch (error) {
                console.error("Failed to fetch island status:", error);
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 15000);
        return () => clearInterval(interval);
    }, []);

    const filteredIslands = useMemo(() => {
        return ISLANDS_DATA.filter(island =>
            island.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            island.items.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [searchQuery]);

    return (
        <div className="dal-bg min-vh-100 font-nunito">

            {/* --- HERO HEADER (DAL THEME) --- */}
            <div className="dal-hero">
                <div className="container position-relative z-2">
                    <div className="d-flex justify-content-between align-items-center pt-4 mb-4">
                        <button onClick={() => navigate("/")} className="btn-dal-back">
                            <i className="fa-solid fa-chevron-left me-2"></i> Return
                        </button>
                        <div className="dal-badge">
                            <i className="fa-solid fa-plane-up me-2"></i> FLIGHT SCHEDULE
                        </div>
                    </div>

                    <div className="text-center text-white pb-5">
                        <h1 className="display-4 fw-black mb-1 title-shadow">Where to next?</h1>
                        <p className="opacity-75 fw-bold letter-spacing-1">Select a destination to view map & inventory</p>
                    </div>
                </div>
                <div className="wave-divider"></div>
            </div>

            {/* --- SEARCH & CONTENT --- */}
            <div className="container content-offset">

                {/* Search Bar */}
                <div className="search-wrapper mb-5 animate-up">
                    <div className="search-box shadow-lg">
                        <i className="fa-solid fa-magnifying-glass search-icon"></i>
                        <input
                            type="text"
                            placeholder="Search destination or items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button className="clear-btn" onClick={() => setSearchQuery("")}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        )}
                    </div>
                </div>

                {/* --- GRID --- */}
                {filteredIslands.length === 0 ? (
                    <div className="text-center py-5 opacity-50 animate-up">
                        <i className="fa-solid fa-map-location-dot fa-4x mb-3 text-secondary"></i>
                        <h3 className="fw-bold text-muted">No destinations found.</h3>
                        <p>Try searching for a different item or island name.</p>
                    </div>
                ) : (
                    <div className="row g-4 pb-5">
                        {filteredIslands.map((island, index) => {
                            const live = liveData[island.name.toUpperCase()] || { status: "OFFLINE", dodo: "---", visitors: "0" };
                            const isOnline = live.status === "ONLINE";
                            const delay = index * 50; // Staggered animation

                            return (
                                <div
                                    key={island.id}
                                    className="col-xl-4 col-md-6"
                                    style={{ animation: `fadeInUp 0.5s ease forwards ${delay}ms`, opacity: 0 }}
                                >
                                    <div
                                        className="ticket-card"
                                        onClick={() => navigate(`/island/${island.id}`)}
                                    >
                                        <div className="tape-strip"></div>

                                        {/* Top Half: Image & Status */}
                                        <div className="card-image-container">
                                            <div className={`status-pill ${live.status.toLowerCase().replace(" ", "-")}`}>
                                                {live.status === 'ONLINE' && <i className="fa-solid fa-circle-check me-1"></i>}
                                                {live.status === 'OFFLINE' && <i className="fa-solid fa-circle-xmark me-1"></i>}
                                                {live.status === 'SUB ONLY' && <i className="fa-solid fa-lock me-1"></i>}
                                                {live.status === 'REFRESHING' && <i className="fa-solid fa-arrows-rotate fa-spin me-1"></i>}
                                                {live.status === 'ONLINE' ? 'BOARDING NOW' : live.status}
                                            </div>

                                            <img
                                                src={`/maps/${island.name.toLowerCase()}.png`}
                                                alt={island.name}
                                                className={`map-img ${live.status === 'OFFLINE' ? 'sepia' : ''}`}
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    if (target.src.includes('.png')) {
                                                        target.src = target.src.replace('.png', '.jpg');
                                                    } else {
                                                        target.src = 'https://www.chopaeng.com/banner.png';
                                                    }
                                                }}
                                            />

                                            {isOnline && (
                                                <div className="visitor-badge">
                                                    <i className="fa-solid fa-users me-1"></i> {live.visitors}
                                                </div>
                                            )}
                                        </div>

                                        {/* Bottom Half: Info */}
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <div>
                                                    <h3 className="card-title">{island.name}</h3>
                                                    <span className="card-subtitle">{island.type} Island</span>
                                                </div>
                                                {isOnline && (
                                                    <div className="dodo-ticket">
                                                        <span className="label">CODE</span>
                                                        <span className="code">{live.dodo}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="divider-dashed"></div>

                                            <div className="loot-container">
                                                {island.items.slice(0, 4).map((item, idx) => (
                                                    <span key={idx} className="loot-pill">{item}</span>
                                                ))}
                                                {island.items.length > 4 && (
                                                    <span className="loot-pill more">+{island.items.length - 4}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;800;900&display=swap');

                :root {
                    --dal-blue: #4090bd;
                    --dal-yellow: #f5c452;
                    --dal-text: #2d4d5c;
                    --paper: #fdfbf7;
                    --nook-green: #7ec9b1;
                }

                .font-nunito { font-family: 'Nunito', sans-serif; }
                .fw-black { font-weight: 900; }
                
                .dal-bg {
                    background-color: #f0f4e4;
                    background-image: linear-gradient(30deg, #e6ebd6 12%, transparent 12.5%, transparent 87%, #e6ebd6 87.5%, #e6ebd6),
                    linear-gradient(150deg, #e6ebd6 12%, transparent 12.5%, transparent 87%, #e6ebd6 87.5%, #e6ebd6),
                    linear-gradient(30deg, #e6ebd6 12%, transparent 12.5%, transparent 87%, #e6ebd6 87.5%, #e6ebd6),
                    linear-gradient(150deg, #e6ebd6 12%, transparent 12.5%, transparent 87%, #e6ebd6 87.5%, #e6ebd6),
                    radial-gradient(#e6ebd6 20%, transparent 20%);
                    background-size: 80px 140px;
                }

                /* Hero Section */
                .dal-hero {
                    background: var(--dal-blue);
                    min-height: 280px;
                    position: relative;
                }
                .wave-divider {
                    position: absolute; bottom: -1px; left: 0; width: 100%;
                    height: 50px;
                    background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg"><path fill="%23f0f4e4" fill-opacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>');
                    background-size: cover;
                    background-repeat: no-repeat;
                }

                .btn-dal-back {
                    background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.4);
                    color: white; padding: 8px 20px; border-radius: 50px;
                    font-weight: 800; transition: 0.2s; backdrop-filter: blur(5px);
                }
                .btn-dal-back:hover { background: white; color: var(--dal-blue); }

                .dal-badge {
                    background: var(--dal-yellow); color: #5a4a1b;
                    padding: 6px 15px; border-radius: 8px; font-weight: 900;
                    box-shadow: 0 4px 0 rgba(0,0,0,0.1); letter-spacing: 1px;
                }
                
                .title-shadow { text-shadow: 0 4px 0 rgba(0,0,0,0.1); font-family: 'Fredoka One', cursive; }
                .content-offset { margin-top: -60px; position: relative; z-index: 10; }

                /* Search Bar */
                .search-wrapper { display: flex; justify-content: center; }
                .search-box {
                    background: white; width: 100%; max-width: 500px;
                    padding: 10px; border-radius: 50px; display: flex; align-items: center;
                    border: 4px solid var(--dal-yellow);
                }
                .search-icon { color: #ccc; margin-left: 15px; font-size: 1.2rem; }
                .search-box input {
                    border: none; outline: none; flex-grow: 1; padding: 10px 15px;
                    font-size: 1.1rem; font-weight: 700; color: #555;
                }
                .clear-btn { background: #eee; border: none; width: 30px; height: 30px; border-radius: 50%; color: #888; margin-right: 5px; }

                /* Ticket Card */
                .ticket-card {
                    background: var(--paper); border-radius: 20px;
                    overflow: hidden; position: relative;
                    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                    border: 1px solid rgba(0,0,0,0.05);
                    box-shadow: 0 10px 20px rgba(64, 144, 189, 0.15);
                    cursor: pointer;
                    height: 100%;
                }
                .ticket-card:hover { transform: translateY(-10px) rotate(1deg); box-shadow: 0 20px 30px rgba(64, 144, 189, 0.25); z-index: 5; }

                .card-image-container { position: relative; height: 180px; background: #eee; overflow: hidden; }
                .map-img { width: 100%; height: 100%; object-fit: cover; transition: 0.5s; }
                .ticket-card:hover .map-img { transform: scale(1.05); }
                .sepia { filter: sepia(0.5) contrast(0.8); opacity: 0.8; }

                /* Tape Strip */
                .tape-strip {
                    position: absolute; top: -10px; left: 50%; transform: translateX(-50%) rotate(-2deg);
                    width: 80px; height: 30px; background: rgba(255,255,255,0.4);
                    z-index: 10; border-left: 2px dashed rgba(0,0,0,0.05); border-right: 2px dashed rgba(0,0,0,0.05);
                }

                /* Status Pills */
                .status-pill {
                    position: absolute; top: 12px; left: 12px;
                    padding: 5px 12px; border-radius: 8px;
                    font-size: 0.7rem; font-weight: 900; letter-spacing: 0.5px;
                    z-index: 2; box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                }
                .status-pill.online { background: #7dd181; color: #1a4d1d; }
                .status-pill.sub-only { background: var(--dal-yellow); color: #5a4a1b; }
                .status-pill.refreshing { background: #fff; color: #888; }
                .status-pill.offline { background: #e06c75; color: white; }

                .visitor-badge {
                    position: absolute; bottom: 10px; right: 10px;
                    background: rgba(0,0,0,0.6); color: white;
                    padding: 2px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: bold;
                }

                /* Card Body */
                .card-body { padding: 20px; }
                .card-title { font-family: 'Fredoka One', cursive; color: #444; margin-bottom: 2px; font-size: 1.4rem; }
                .card-subtitle { color: #999; font-weight: 800; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; }

                .dodo-ticket {
                    background: var(--dal-blue); color: white;
                    border-radius: 6px; padding: 4px 8px;
                    text-align: center; border: 2px dashed rgba(255,255,255,0.3);
                }
                .dodo-ticket .label { display: block; font-size: 0.5rem; opacity: 0.8; font-weight: 800; }
                .dodo-ticket .code { display: block; font-family: 'Courier New', monospace; font-weight: bold; line-height: 1; font-size: 1rem; }

                .divider-dashed { border-top: 2px dashed #eee; margin: 15px 0; }

                .loot-container { display: flex; flex-wrap: wrap; gap: 6px; }
                .loot-pill {
                    background: #f0f2f5; color: #666;
                    padding: 4px 10px; border-radius: 8px;
                    font-size: 0.75rem; font-weight: 700;
                }
                .loot-pill.more { background: var(--dal-yellow); color: #5a4a1b; }

                /* Animation */
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-up { animation: fadeInUp 0.6s ease forwards; }
            `}</style>
        </div>
    );
};

export default IslandMaps;