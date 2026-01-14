import React, { useState } from 'react';

const FindItems = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('All');
    const [accessFilter, setAccessFilter] = useState('All'); // 'All', 'Free', 'Member'

    // Refined Database with Island and Access Info
    const database = [
        { name: "Ironwood Dresser", category: "Furniture", island: "Marahuyo", access: "Member", icon: "🗄️" },
        { name: "Raymond", category: "Villagers", island: "Villager Hub", access: "Member", icon: "🐱" },
        { name: "Shino", category: "Villagers", island: "Villager Hub", access: "Member", icon: "🦌" },
        { name: "Froggy Chair", category: "Furniture", island: "Public Paradise", access: "Free", icon: "🐸" },
        { name: "Gold Nuggets", category: "Materials", island: "Bahaghari", access: "Member", icon: "✨" },
        { name: "Royal Crown", category: "Clothing", island: "Marahuyo", access: "Member", icon: "👑" },
        { name: "Nook Inc. Tee", category: "Clothing", island: "Public Paradise", access: "Free", icon: "👕" },
        { name: "Crescent-Moon Chair", category: "DIY Recipes", island: "Marahuyo", access: "Member", icon: "🌙" },
        { name: "Wood Stack", category: "Materials", island: "Public Paradise", access: "Free", icon: "🪵" },
        { name: "Sasha", category: "Villagers", island: "Villager Hub", access: "Member", icon: "🐰" },
    ];

    const categories = ["All", "Furniture", "Villagers", "DIY Recipes", "Clothing", "Materials"];

    const filteredItems = database.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab = activeTab === "All" || item.category === activeTab;
        const matchesAccess = accessFilter === "All" || item.access === accessFilter;
        return matchesSearch && matchesTab && matchesAccess;
    });

    const copyToClipboard = (itemName) => {
        const command = `!order ${itemName}`;
        navigator.clipboard.writeText(command);
        // Visual feedback could be a toast notification
    };

    return (
        <div className="bg-light min-vh-100 pb-5">

            {/* 1. SEARCH HEADER */}
            <section className="bg-dark py-5 text-white position-relative overflow-hidden">
                <div className="container text-center py-4 position-relative z-1">
                    <h1 className="fw-bold font-heading mb-2">Island <span className="text-success">Catalog</span></h1>
                    <p className="opacity-75 mb-4">Find which island your items are located on and generate bot commands.</p>

                    <div className="row justify-content-center">
                        <div className="col-lg-6">
                            <div className="input-group input-group-lg shadow-lg">
                                <input
                                    type="text"
                                    className="form-control border-0 shadow-none px-4 rounded-pill-start"
                                    placeholder="Search item or villager..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <button className="btn btn-success px-4 rounded-pill-end">
                                    <i className="bi bi-search"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="position-absolute top-50 start-50 translate-middle opacity-10 fs-1 shadow-lg" style={{fontSize: '15rem'}}>🔎</div>
            </section>

            {/* 2. ADVANCED FILTERS */}
            <section className="container mt-n4">
                <div className="bg-white rounded-5 shadow-sm p-4 border mb-4">
                    <div className="row align-items-center">
                        <div className="col-lg-8">
                            <h6 className="fw-bold text-uppercase small text-muted mb-3">Categories</h6>
                            <div className="d-flex flex-wrap gap-2">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveTab(cat)}
                                        className={`btn rounded-pill px-3 py-1 fw-bold btn-sm transition ${activeTab === cat ? 'btn-success' : 'btn-light border'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="col-lg-4 mt-4 mt-lg-0">
                            <h6 className="fw-bold text-uppercase small text-muted mb-3">Access Level</h6>
                            <div className="btn-group w-100 p-1 bg-light rounded-pill">
                                {['All', 'Free', 'Member'].map(acc => (
                                    <button
                                        key={acc}
                                        className={`btn btn-sm rounded-pill fw-bold border-0 ${accessFilter === acc ? 'bg-white shadow-sm text-success' : 'text-muted'}`}
                                        onClick={() => setAccessFilter(acc)}
                                    >
                                        {acc}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. RESULTS GRID */}
                <div className="row g-3">
                    {filteredItems.map((item, i) => (
                        <div key={i} className="col-xl-4 col-md-6">
                            <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden item-card">
                                <div className="card-body d-flex gap-3 p-3">
                                    <div className="bg-light rounded-4 d-flex align-items-center justify-content-center" style={{ width: '70px', height: '70px', fontSize: '2rem' }}>
                                        {item.icon}
                                    </div>
                                    <div className="flex-grow-1">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <h6 className="fw-bold mb-1">{item.name}</h6>
                                            <span className={`badge rounded-pill x-small ${item.access === 'Free' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning-emphasis'}`}>
                        {item.access}
                      </span>
                                        </div>

                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            <i className="bi bi-geo-alt-fill text-muted x-small"></i>
                                            <span className="small text-muted fw-bold">Island: <span className="text-dark">{item.island}</span></span>
                                        </div>

                                        <div className="d-flex gap-2">
                                            <button
                                                className="btn btn-outline-success btn-sm rounded-pill fw-bold py-1 px-3 flex-grow-1"
                                                onClick={() => copyToClipboard(item.name)}
                                            >
                                                <i className="bi bi-clipboard-plus me-1"></i> Copy Bot Cmd
                                            </button>
                                            {item.access === 'Member' && (
                                                <a href="#membership" className="btn btn-light btn-sm rounded-circle shadow-sm">
                                                    <i className="bi bi-gem text-warning"></i>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <style>{`
        .font-heading { font-family: 'Inter', sans-serif; }
        .mt-n4 { margin-top: -3rem !important; position: relative; z-index: 5; }
        .x-small { font-size: 0.7rem; padding: 0.35em 0.8em; }
        
        .item-card {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .item-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.08) !important;
        }

        .bg-success-subtle { background-color: rgba(25, 135, 84, 0.1); }
        .bg-warning-subtle { background-color: rgba(255, 193, 7, 0.1); }
        
        .rounded-pill-start { border-top-left-radius: 50rem !important; border-bottom-left-radius: 50rem !important; }
        .rounded-pill-end { border-top-right-radius: 50rem !important; border-bottom-right-radius: 50rem !important; }
      `}</style>
        </div>
    );
};

export default FindItems;