
const TreasureIslands = () => {
    // Categorized data based on the stream screenshot
    const islandData = [
        { name: "MATAHOM", code: "25LKD", type: "Clothing", visitors: 3, cat: "clothing" },
        { name: "PARALUMAN", code: "N5J2P", type: "Clothing", visitors: 4, cat: "clothing" },
        { name: "KAKANGGATA", code: "HM9SN", type: "1.0 Items", visitors: 4, cat: "v1" },
        { name: "KALAWAKAN", code: "GETTIN'", type: "1.0 Items", visitors: 0, cat: "v1" },
        { name: "KUNDIMAN", code: "J1BLN", type: "1.0 Items", visitors: "FULL", cat: "v1" },
        { name: "KILIG", code: "5NMJ3", type: "1.0 Items", visitors: 5, cat: "v1" },
        { name: "BATHALA", code: "GETTIN'", type: "2.0 Items", visitors: 0, cat: "v2" },
        { name: "TADHANA", code: "CHWGB", type: "Furniture", visitors: 6, cat: "v2" },
        { name: "DALANGIN", code: "LV21L", type: "2.0 Items", visitors: "FULL", cat: "v2" },
        { name: "MAHARLIKA", code: "1RQ7G", type: "Furniture", visitors: "FULL", cat: "v2" },
        { name: "LAKAN", code: "!SUB", type: "Member", visitors: 1, cat: "member" },
        { name: "GALAK", code: "!SUB", type: "Member", visitors: 0, cat: "member" },
        { name: "MARAHUYO", code: "!SUB", type: "Member", visitors: 3, cat: "member" },
        { name: "BONITA", code: "!SUB", type: "Member", visitors: 0, cat: "member" },
        { name: "SILAKBO", code: "4RCBL", type: "Seasonal", visitors: 4, cat: "seasonal" },
        { name: "TALA", code: "3B7WL", type: "Materials", visitors: 6, cat: "seasonal" },
        { name: "HIRAYA", code: "!PATREON", type: "Member", visitors: 0, cat: "member" },
        { name: "DALISAY", code: "!PATREON", type: "Member", visitors: 0, cat: "member" },
    ];

    return (
        <div className="bg-light min-vh-100 font-sans pb-5">

            {/* 1. TICKER / ANNOUNCEMENT BAR */}
            <div className="bg-dark text-white py-2 overflow-hidden shadow-sm">
                <div className="container-fluid marquee-text fw-bold small text-uppercase tracking-wider">
                    Commands: !find !villager !rules !subperks !discord || Join our Discord to link your Patreon account || Subscribe for FREE using Amazon Prime
                </div>
            </div>

            {/* 2. HERO / STATUS HEADER */}
            <section className="py-5 bg-white border-bottom">
                <div className="container text-center">
                    <div className="d-inline-flex align-items-center gap-2 bg-success bg-opacity-10 text-success px-3 py-1 rounded-pill mb-3 fw-bold small">
                        <span className="live-pulse"></span> LIVE STREAM ONLINE
                    </div>
                    <h1 className="fw-bold display-4 mb-2">Treasure <span className="text-success">Islands</span></h1>
                    <p className="text-muted mb-0">Codes are updated in real-time. Please exit via the airport only.</p>
                </div>
            </section>

            {/* 3. THE DASHBOARD GRID */}
            <section className="container-fluid px-lg-5 py-5">
                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-6 g-3">
                    {islandData.map((island, i) => (
                        <div key={i} className="col">
                            <div className={`card h-100 border-0 shadow-sm rounded-4 island-node transition-all border-top border-4 border-${getTheme(island.cat)}`}>
                                <div className="card-body p-3 text-center d-flex flex-column justify-content-between">
                                    <div className="mb-2">
                                        <span className={`text-uppercase fw-bold x-small tracking-widest text-${getTheme(island.cat)}`}>
                                            {island.name}
                                        </span>
                                        <p className="text-muted x-small mb-0 mt-1">{island.type}</p>
                                    </div>

                                    <div className="py-3">
                                        <h2 className={`fw-bold mb-0 tracking-tighter ${island.visitors === 'FULL' ? 'text-danger opacity-50' : 'text-dark'}`} style={{ fontSize: '1.8rem' }}>
                                            {island.code}
                                        </h2>
                                    </div>

                                    <div className="mt-auto">
                                        <div className="d-flex justify-content-between align-items-center bg-light rounded-pill px-3 py-1">
                                            <span className="x-small fw-bold text-muted">VISITORS</span>
                                            <span className={`x-small fw-bold ${island.visitors === 'FULL' ? 'text-danger' : 'text-success'}`}>
                                                {island.visitors}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. FOOTER INFO */}
            <section className="container py-4">
                <div className="bg-white border rounded-5 p-4 d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 shadow-sm">
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                            <i className="bi bi-info-circle-fill fs-4"></i>
                        </div>
                        <div>
                            <h6 className="fw-bold mb-0">Can't see a code?</h6>
                            <p className="small text-muted mb-0">Islands labeled <strong>"GETTIN'"</strong> are currently refreshing. Please wait a few minutes.</p>
                        </div>
                    </div>
                    <a href="https://twitch.tv/chopaeng" className="btn btn-success rounded-pill px-5 fw-bold shadow-sm">Watch Live on Twitch</a>
                </div>
            </section>

            <style>{`
                
                
                .x-small { font-size: 0.65rem; }
                .tracking-widest { letter-spacing: 0.15em; }
                .tracking-tighter { letter-spacing: -0.05em; }

                /* Theme Helper Classes */
                .border-clothing { border-top-color: #ff00ff !important; }
                .text-clothing { color: #ff00ff !important; }
                
                .border-v1 { border-top-color: #0dcaf0 !important; }
                .text-v1 { color: #0dcaf0 !important; }

                .border-v2 { border-top-color: #6f42c1 !important; }
                .text-v2 { color: #6f42c1 !important; }

                .border-member { border-top-color: #ffc107 !important; }
                .text-member { color: #ffc107 !important; }

                .border-seasonal { border-top-color: #0d6efd !important; }
                .text-seasonal { color: #0d6efd !important; }

                .island-node {
                    transition: all 0.2s ease-in-out;
                    background: white;
                }
                .island-node:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.08) !important;
                }

                .live-pulse {
                    width: 8px; height: 8px; background: #198754; border-radius: 50%;
                    display: inline-block; animation: pulse 2s infinite; margin-right: 5px;
                }

                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(25, 135, 84, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(25, 135, 84, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(25, 135, 84, 0); }
                }

                .marquee-text {
                    white-space: nowrap;
                    display: inline-block;
                    animation: marquee 30s linear infinite;
                }

                @keyframes marquee {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
            `}</style>
        </div>
    );
};

// Simple helper to match category to Bootstrap colors or custom ones
const getTheme = (cat: string) => {
    switch(cat) {
        case 'clothing': return 'clothing';
        case 'v1': return 'v1';
        case 'v2': return 'v2';
        case 'member': return 'member';
        case 'seasonal': return 'seasonal';
        default: return 'success';
    }
}

export default TreasureIslands;