import {useState} from "react";

const Home = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const posts = [
        {
            id: 1,
            date: "Nov 04, 2025",
            title: "ACNH Switch 2 Edition is coming!",
            category: "News",
            img: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&q=80&w=1000",
            excerpt: "Nintendo officially sails into the next generation. Jan 15, 2026."
        },
        {
            id: 2,
            date: "Jul 09, 2025",
            title: "Crocs x Animal Crossing Collaboration",
            category: "Collab",
            img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=1000",
            excerpt: "Step into the relaxing world of island life with official footwear."
        }
    ];

    const islands = [
        { name: "Marahuyo", icon: "✨", status: "Members Only", type: "Full Catalog" },
        { name: "Bahaghari", icon: "🌈", status: "Members Only", type: "Max Bells & Mats" },
        { name: "Paradise", icon: "🌴", status: "Public Access", type: "Variety Items" },
    ];

    return (
        <div className="bg-white min-vh-100 font-sans text-dark">

            {/* 1. HERO SECTION: Split Layout */}
            <section className="container-fluid px-lg-5 pt-5 pb-5 bg-light border-bottom">
                <div className="row align-items-center min-vh-75 py-5">
                    <div className="col-lg-7 mb-5 mb-lg-0">
                        <div className="d-inline-flex align-items-center gap-2 mb-4">
                            <span className="live-dot"></span>
                            <span className="text-success fw-bold small text-uppercase tracking-wider">24/7 Live Treasure Islands</span>
                        </div>
                        <h1 className="display-1 fw-bold lh-1 mb-4">
                            Your <span className="text-success">Island</span> <br />
                            Starts Here.
                        </h1>
                        <p className="lead text-muted mb-5 fs-4 fw-light" style={{ maxWidth: '500px' }}>
                            Access 130,000+ items, request villagers via ChoBot, and join the ultimate ACNH community.
                        </p>

                        {/* SEARCH HUB: Pange-influenced but functional */}
                        <div className="bg-white p-2 rounded-4 shadow-sm d-flex align-items-center border" style={{ maxWidth: '550px' }}>
                            <i className="bi bi-search ms-3 text-muted"></i>
                            <input
                                type="text"
                                className="form-control border-0 shadow-none px-3 py-3"
                                placeholder="Find an item (e.g. Ironwood Dresser)..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button className="btn btn-success rounded-3 px-4 fw-bold">Search</button>
                        </div>
                    </div>

                    <div className="col-lg-5 d-none d-lg-block position-relative">
                        <div className="hero-visual-container">
                            <img src="logo.webp" alt="Chopaeng" className="img-fluid rounded-5 shadow-lg main-hero-img" />
                            <div className="floating-card p-3 rounded-4 bg-white shadow-sm">
                                <span className="text-success fw-bold">999,999,999</span>
                                <p className="small text-muted mb-0">Max Bells Available</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. ISLAND DIRECTORY: Shereigna-influenced Clean Grid */}
            <section className="container-fluid px-lg-5 py-5 border-bottom">
                <div className="d-flex justify-content-between align-items-end mb-5">
                    <div>
                        <h2 className="fw-bold mb-1">Active Islands</h2>
                        <p className="text-muted small mb-0 text-uppercase tracking-widest">Global Live Directory</p>
                    </div>
                    <button className="btn btn-outline-dark rounded-pill px-4 btn-sm fw-bold">View Status</button>
                </div>

                <div className="row g-4">
                    {islands.map((island, i) => (
                        <div key={i} className="col-lg-4">
                            <div className="island-card p-5 rounded-5 border bg-white h-100 transition-all">
                                <div className="display-5 mb-4">{island.icon}</div>
                                <h3 className="fw-bold mb-1">{island.name}</h3>
                                <p className="text-success small fw-bold text-uppercase mb-4 tracking-wide">{island.status}</p>
                                <p className="text-muted small mb-5">Specialized in {island.type}. 24/7 uptime guaranteed with automated recovery bots.</p>
                                <button className="btn btn-link text-dark p-0 fw-bold text-decoration-none">Explore Island <i className="bi bi-arrow-right ms-2"></i></button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 3. JOURNAL: Editorial Post Feed */}
            <section className="container-fluid px-lg-5 py-5 bg-light">
                <div className="row g-5">
                    <div className="col-lg-8">
                        <h2 className="fw-bold mb-5">Recent Journal</h2>
                        {posts.map((post) => (
                            <article key={post.id} className="row g-0 mb-5 post-hover pb-5 border-bottom border-dark border-opacity-10 align-items-center">
                                <div className="col-md-4 mb-4 mb-md-0">
                                    <div className="overflow-hidden rounded-4 shadow-sm" style={{ height: '240px' }}>
                                        <img src={post.img} className="img-fluid h-100 w-100 object-fit-cover transition-img" alt="post" />
                                    </div>
                                </div>
                                <div className="col-md-8 ps-md-5">
                                    <div className="d-flex gap-3 mb-3 text-uppercase x-small tracking-widest fw-bold text-success">
                                        <span>{post.date}</span>
                                        <span>/</span>
                                        <span>{post.category}</span>
                                    </div>
                                    <h3 className="fw-bold h2 mb-3">{post.title}</h3>
                                    <p className="text-muted mb-4 fs-5">{post.excerpt}</p>
                                    <button className="btn btn-link text-dark p-0 fw-bold text-decoration-none border-bottom border-dark">Read Full Post</button>
                                </div>
                            </article>
                        ))}
                    </div>

                    {/* Sidebar: Clean Widgets */}
                    <div className="col-lg-4">
                        <div className="sticky-top" style={{ top: '100px' }}>
                            <div className="p-5 rounded-5 bg-dark text-white mb-4">
                                <h4 className="fw-bold mb-4">Support the Dream.</h4>
                                <p className="opacity-75 small mb-5">Unlock priority access to all 9 private islands and our custom ChoBot delivery service.</p>
                                <button className="btn btn-success w-100 rounded-pill py-3 fw-bold shadow-sm">View Membership Tiers</button>
                            </div>

                            <div className="p-5 rounded-5 border bg-white shadow-sm">
                                <h5 className="fw-bold mb-4">Community Support</h5>
                                <p className="small text-muted mb-4">Our Discord is active 24/7. Get help from our staff team and connect with other Beshies.</p>
                                <a href="#" className="btn btn-outline-dark w-100 rounded-pill py-3 fw-bold">Join the Discord</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700;800&display=swap');
        
        body { font-family: 'Inter', sans-serif; letter-spacing: -0.01em; }
        
        .tracking-wider { letter-spacing: 0.1em; }
        .tracking-widest { letter-spacing: 0.2em; }
        .x-small { font-size: 0.75rem; }

        /* HERO ELEMENTS */
        .main-hero-img { transform: rotate(-2deg); }
        .hero-visual-container { position: relative; padding: 20px; }
        .floating-card {
            position: absolute;
            bottom: 20px;
            right: -20px;
            animation: float 4s ease-in-out infinite;
        }

        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
            100% { transform: translateY(0px); }
        }

        /* ISLAND CARDS */
        .island-card {
            transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
        }
        .island-card:hover {
            background-color: #f8fbf9;
            transform: translateY(-8px);
            border-color: #198754 !important;
        }

        /* POST HOVER */
        .transition-img { transition: transform 0.8s ease; }
        .post-hover:hover .transition-img { transform: scale(1.08); }

        .live-dot {
            width: 10px; height: 10px; background: #198754; border-radius: 50%;
            display: inline-block; animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(25, 135, 84, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(25, 135, 84, 0); }
            100% { box-shadow: 0 0 0 0 rgba(25, 135, 84, 0); }
        }

        .shadow-sm { box-shadow: 0 10px 30px rgba(0,0,0,0.05) !important; }
        .bg-light { background-color: #f9fbf9 !important; }
      `}</style>
        </div>
    );
};

export default Home;