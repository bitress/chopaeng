import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PUBLIC_ISLANDS } from "../data/islands.tsx";


const IslandMaps = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");

    const filteredIslands = useMemo(() => {
        return PUBLIC_ISLANDS.filter(island =>
            island.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            island.items.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [searchQuery]);

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
                    <p className="text-muted fw-bold text-uppercase tracking-widest">Global Restock Every 24 Hours</p>
                </header>

                {/* --- MAP GRID --- */}
                <div className="row g-4">
                    {filteredIslands.map((island) => (
                        <div key={island.id} className="col-xl-4 col-md-6 animate-up">
                            <div className={`scrapbook-card theme-${island.theme}`}>
                                <div className="card-sticker">
                                    <i className="fa-solid fa-stamp me-1"></i> {island.type}
                                </div>

                                <div className="card-inner shadow-sm bg-white" onClick={() => navigate(`/islands/${island.id}`)}>
                                    <div className="card-media">
                                        <img
                                            src={`/maps/${island.name.toLowerCase()}.png`}
                                            alt={island.name}
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
                                        <div className="media-overlay">
                                            <div className="view-btn">VIEW DETAILS</div>
                                        </div>
                                    </div>

                                    <div className="card-body p-4">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h3 className="ac-font h4 text-dark mb-0">{island.name}</h3>
                                            <div className="status-dot-pulse"></div>
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
                    ))}
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;700;900&display=swap');

                .nook-bg {
                    background-color: #f2f4e6;
                    background-image: radial-gradient(#dce2c8 15%, transparent 16%);
                    background-size: 30px 30px;
                }

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
                }
                .theme-teal .card-sticker { background: #88e0d0; }
                .theme-purple .card-sticker { background: #d0bfff; }
                .theme-pink .card-sticker { background: #ffb7ce; }
                .theme-gold .card-sticker { background: #ffc107; }

                .card-inner { border-radius: 30px; overflow: hidden; border: 2px solid #eeebe5; cursor: pointer; }
                .card-media { height: 200px; position: relative; overflow: hidden; background: #eee; }
                .card-media img { width: 100%; height: 100%; object-fit: cover; transition: 0.5s; }
                .card-inner:hover img { transform: scale(1.1); }

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
                    width: 10px; height: 10px; background: #7dd181; border-radius: 50%;
                    box-shadow: 0 0 0 0 rgba(125, 209, 129, 0.7);
                    animation: pulse 2s infinite;
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