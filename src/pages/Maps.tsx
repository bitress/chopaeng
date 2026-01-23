import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PUBLIC_ISLANDS } from "../data/islands.tsx";

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
        const interval = setInterval(fetchStatus, 15000); // Poll every 15s
        return () => clearInterval(interval);
    }, []);

    const filteredIslands = useMemo(() => {
        return PUBLIC_ISLANDS.filter(island =>
            island.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            island.items.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [searchQuery]);

    // Helper for status colors
    const getStatusColor = (status: IslandStatus) => {
        switch (status) {
            case "ONLINE": return "#7dd181";
            case "SUB ONLY": return "#ffc107";
            case "REFRESHING": return "#adb5bd";
            case "OFFLINE": return "#dc3545";
            default: return "#adb5bd";
        }
    };

    return (
        <div className="nook-bg min-vh-100 py-5 font-nunito islandmaps-root">
            <div className="container px-md-4">

                {/* --- NAVIGATION HUB --- */}
                <nav className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-5 gap-4">
                    <button onClick={() => navigate("/")} className="btn-nook-back shadow-sm">
                        <i className="fa-solid fa-house-chimney me-2"></i> Dashboard
                    </button>

                    <div className="search-pill-container shadow-sm">
                        <i className="fa-solid fa-magnifying-glass ms-3 text-success"></i>
                        <input
                            type="text"
                            placeholder="Search items or islands..."
                            className="search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </nav>

                <header className="text-center mb-5">
                    <h1 className="ac-font display-3 text-dark mb-2">Island Catalog</h1>
                    <p className="text-muted fw-bold text-uppercase tracking-widest">Live Status & Map Directory</p>
                </header>

                {/* --- MAP GRID --- */}
                <div className="row g-4">
                    {filteredIslands.map((island) => {
                        const live = liveData[island.name.toUpperCase()] || { status: "OFFLINE", dodo: "---", visitors: "0" };
                        const isOnline = live.status === "ONLINE";

                        return (
                            <div key={island.id} className="col-xl-4 col-md-6 animate-up">
                                <div className={`scrapbook-card theme-${island.theme}`}>
                                    {/* Category/Type Sticker */}
                                    <div className="card-sticker">
                                        <i className={`fa-solid ${live.status === 'SUB ONLY' ? 'fa-crown' : 'fa-stamp'} me-1`}></i>
                                        {live.status === 'SUB ONLY' ? 'VIP ONLY' : island.type}
                                    </div>

                                    <div className="card-inner shadow-sm bg-white" onClick={() => navigate(`/islands/${island.id}`)}>
                                        <div className="card-media">
                                            <img
                                                src={`/maps/${island.name.toLowerCase()}.png`}
                                                alt={island.name}
                                                className={live.status === 'OFFLINE' ? 'grayscale' : ''}
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = 'https://www.chopaeng.com/banner.png';
                                                }}
                                            />
                                            <div className="media-overlay">
                                                <div className="view-btn">VIEW DETAILS</div>
                                            </div>

                                            {/* Dodo Badge Overlay */}
                                            {isOnline && (
                                                <div className="dodo-badge">
                                                    <i className="fa-solid fa-plane-departure me-1"></i> {live.dodo}
                                                </div>
                                            )}
                                        </div>

                                        <div className="card-body p-4">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <div>
                                                    <h3 className="ac-font h4 text-dark mb-0">{island.name}</h3>
                                                    <span className="x-small fw-bold text-uppercase text-muted" style={{ fontSize: '0.65rem' }}>
                                                        {live.status} • {live.visitors} Visitors
                                                    </span>
                                                </div>
                                                <div
                                                    className="status-dot-pulse"
                                                    style={{
                                                        backgroundColor: getStatusColor(live.status),
                                                        animation: live.status === 'ONLINE' ? 'pulse 2s infinite' : 'none'
                                                    }}
                                                ></div>
                                            </div>

                                            <div className="loot-tags">
                                                {island.items.map((item, idx) => (
                                                    <span key={idx} className="loot-tag">{item}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;700;900&display=swap');

                .nook-bg {
                    background-color: #f2f4e6;
                    background-image: radial-gradient(#dce2c8 15%, transparent 16%);
                    background-size: 30px 30px;
                }

                .grayscale { filter: grayscale(1); opacity: 0.7; }

                /* Nav Styles */
                .btn-nook-back {
                    background: white; border: 2px solid #eeebe5; color: #5faf63;
                    padding: 10px 25px; border-radius: 50px; font-weight: 800;
                    box-shadow: 0 4px 0 #eeebe5; transition: 0.2s;
                }
                .btn-nook-back:hover { transform: translateY(-2px); box-shadow: 0 6px 0 #eeebe5; }

                .search-pill-container {
                    background: white; border-radius: 50px; display: flex;
                    align-items: center; width: 100%; max-width: 400px;
                    border: 2px solid #eeebe5;
                }
                .search-input { border: none; padding: 12px 15px; border-radius: 50px; outline: none; width: 100%; font-weight: 700; color: #5a524a; }

                /* Card Styles */
                .scrapbook-card { position: relative; padding-top: 15px; transition: 0.3s; }
                .scrapbook-card:hover { transform: translateY(-8px) rotate(1deg); }
                
                .card-sticker {
                    position: absolute; top: 0; left: 25px; z-index: 2;
                    padding: 5px 15px; border-radius: 10px; color: white;
                    font-weight: 900; font-size: 0.7rem; text-transform: uppercase;
                    box-shadow: 0 4px 0 rgba(0,0,0,0.1);
                }
                .theme-teal .card-sticker { background: #88e0d0; }
                .theme-purple .card-sticker { background: #d0bfff; }
                .theme-pink .card-sticker { background: #ffb7ce; }
                .theme-gold .card-sticker { background: #ffc107; }

                .card-inner { border-radius: 30px; overflow: hidden; border: 2px solid #eeebe5; cursor: pointer; }
                .card-media { height: 200px; position: relative; overflow: hidden; background: #eee; }
                .card-media img { width: 100%; height: 100%; object-fit: cover; transition: 0.5s; }
                .card-inner:hover img { transform: scale(1.1); }

                .dodo-badge {
                    position: absolute; bottom: 10px; right: 10px;
                    background: #5faf63; color: white; padding: 4px 12px;
                    border-radius: 50px; font-weight: 900; font-size: 0.9rem;
                    letter-spacing: 1px; box-shadow: 0 4px 10px rgba(0,0,0,0.2);
                }

                .media-overlay {
                    position: absolute; inset: 0; background: rgba(95, 175, 99, 0.4);
                    display: flex; align-items: center; justify-content: center;
                    opacity: 0; transition: 0.3s;
                }
                .card-inner:hover .media-overlay { opacity: 1; }
                .view-btn { background: white; color: #5faf63; padding: 8px 20px; border-radius: 50px; font-weight: 900; }

                .loot-tag {
                    background: #fdfbf7; padding: 5px 12px; border-radius: 12px;
                    font-size: 0.75rem; font-weight: 800; border: 1px solid #eeebe5;
                    display: inline-block; margin: 0 5px 5px 0;
                }

                .status-dot-pulse {
                    width: 12px; height: 12px; border-radius: 50%;
                    box-shadow: 0 0 0 0 rgba(125, 209, 129, 0.7);
                }
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(125, 209, 129, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(125, 209, 129, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(125, 209, 129, 0); }
                }

                .animate-up { animation: fadeInUp 0.5s ease forwards; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default IslandMaps;