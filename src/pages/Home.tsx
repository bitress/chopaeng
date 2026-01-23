import { useState } from "react";
import {Link} from "react-router-dom";

interface SearchResult {
    found: boolean;
    query: string;
    results?: {
        free: string[];
        sub: string[];
    };
    suggestions?: string[];
    message: string;
}
const Home = () => {

    const [searchTerm, setSearchTerm] = useState('');
    const [searchMode, setSearchMode] = useState<'item' | 'villager'>('item');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<SearchResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (term: string = searchTerm) => {
        if (!term.trim()) return;

        setLoading(true);
        setData(null);
        setError(null);
        setSearchTerm(term); // Update input if triggered by suggestion

        try {
            const endpoint = searchMode === 'item' ? 'find' : 'villager';
            // Assuming localhost:8100 based on previous context
            const response = await fetch(`https://acnh-finder.chopaeng.com/api/${endpoint}?q=${encodeURIComponent(term)}`);

            if (!response.ok) throw new Error("Server error");

            const result: SearchResult = await response.json();
            setData(result);
        } catch (err) {
            console.error(err);
            setError("Could not reach NookNet services. Is the bot online?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
        <div className="nook-os min-vh-100 d-flex align-items-center font-nunito overflow-hidden position-relative">

            {/* Background Decoration (Leaf Pattern) */}
            <div className="position-absolute top-0 end-0 opacity-10 p-5 d-none d-lg-block pointer-events-none">
                <i className="fa-solid fa-leaf text-success" style={{fontSize: '30rem', transform: 'rotate(45deg)'}}></i>
            </div>

            <section className="container-fluid px-lg-5 position-relative z-1">
                <div className="row align-items-center py-5">

                    {/* LEFT: TEXT CONTENT */}
                    <div className="col-lg-6 order-2 order-lg-1 ps-lg-5">

                        {/* Status Badge */}
                        <div className="d-inline-flex align-items-center gap-2 mb-4 px-3 py-2 rounded-pill bg-white border border-success border-opacity-25 shadow-sm">
                            <span className="live-dot"></span>
                            <span className="text-success fw-bold x-small text-uppercase tracking-wider">
                                Stream Online Now
                            </span>
                        </div>

                        {/* Headline */}
                        <h1 className="display-3 fw-black ac-font lh-1 mb-4 text-dark">
                            Your Ticket to <br />
                            <span className="text-nook">Island Paradise.</span>
                        </h1>

                        {/* Subtext */}
                        <p className="lead text-muted mb-5 fw-bold opacity-75" style={{ maxWidth: '480px', fontSize: '1.1rem' }}>
                            Skip the grind. Join the Chopaeng community to access 24/7 Treasure Islands, Max Bells, and order any villager via ChoBot.
                        </p>

                        {/* CTA Buttons */}
                        <div className="d-flex flex-column flex-sm-row gap-3 mb-5">
                            <Link to="/islands" className="btn btn-nook-primary rounded-pill px-5 py-3 fw-black shadow-sm d-flex align-items-center justify-content-center gap-2 transform-active">
                                <i className="fa-solid fa-plane-departure"></i>
                                Start Looting
                            </Link>
                            <Link to="/maps" className="btn btn-white rounded-pill px-5 py-3 fw-bold border shadow-sm text-muted transform-active">
                                <i className="fa-solid fa-map me-2"></i>
                                View Maps
                            </Link>
                        </div>

                        {/* Social Proof */}
                        <div className="d-flex align-items-center gap-4 text-muted small fw-bold">
                            <div className="d-flex align-items-center gap-2">
                                <i className="fa-brands fa-discord fs-4 text-primary opacity-75"></i>
                                <span>29k Potatoes</span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <i className="fa-solid fa-box-open fs-4 text-success opacity-75"></i>
                                <span>Auto-Restock</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: HERO IMAGE (Snapshot Style) */}
                    <div className="col-lg-6 order-1 order-lg-2 mb-5 mb-lg-0 text-center position-relative">

                        {/* Main Image */}
                        <div className="snapshot-frame mx-auto position-relative">
                            <div className="tape-strip"></div>
                            <img
                                src="https://images.unsplash.com/photo-1599939571322-792a326991f2?q=80&w=1000&auto=format&fit=crop"
                                alt="ACNH Setup"
                                className="img-fluid rounded-3 border border-light"
                            />
                            {/* Floating Floating Elements */}
                            <div className="floating-badge bg-white p-3 rounded-circle shadow-sm position-absolute bottom-0 start-0 translate-middle-x mb-4 ms-4">
                                <i className="fa-solid fa-sack-dollar text-warning fs-2"></i>
                            </div>
                            <div className="floating-badge-2 bg-white p-3 rounded-circle shadow-sm position-absolute top-0 end-0 translate-middle-x mt-4 me-n4">
                                <i className="fa-solid fa-gift text-danger fs-2"></i>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>

            <section id="search-hub" className="container py-5 mt-n5 position-relative z-2">
                <div className="bg-white rounded-5 shadow-lg p-4 p-lg-5 border border-success border-opacity-10 position-relative overflow-hidden">

                    {/* Header (Unchanged) */}
                    <div className="text-center mb-5">
            <span className="badge bg-light-green text-nook rounded-pill px-3 py-1 mb-2 fw-bold text-uppercase x-small">
                 <i className="fa-solid fa-database me-1"></i> Database
            </span>
                        <h2 className="display-5 fw-black ac-font text-dark mb-3">Island Catalog</h2>
                        <p className="text-muted fw-bold">Find which island has your items or villagers instantly.</p>

                        {/* Toggles */}
                        <div className="d-inline-flex p-1 bg-light rounded-pill mb-4 border">
                            <button
                                onClick={() => setSearchMode('item')}
                                className={`btn rounded-pill px-4 py-2 fw-black transition-all ${searchMode === 'item' ? 'bg-nook-green text-white shadow' : 'text-muted'}`}
                            >
                                <i className="fa-solid fa-couch me-2"></i> Items
                            </button>
                            <button
                                onClick={() => setSearchMode('villager')}
                                className={`btn rounded-pill px-4 py-2 fw-black transition-all ${searchMode === 'villager' ? 'bg-nook-green text-white shadow' : 'text-muted'}`}
                            >
                                <i className="fa-solid fa-user-tag me-2"></i> Villagers
                            </button>
                        </div>

                        {/* Input */}
                        <div className="row justify-content-center">
                            <div className="col-lg-8">
                                <div className="input-group input-group-lg shadow-sm rounded-pill bg-light p-2 border focus-ring-success">
                                    <input
                                        type="text"
                                        className="form-control border-0 bg-transparent fw-bold text-dark shadow-none ps-4"
                                        placeholder={searchMode === 'item' ? "Try 'Ironwood Dresser'..." : "Try 'Raymond'..."}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                    <button
                                        className="btn btn-nook-primary rounded-pill px-4 fw-black m-1 shadow-sm"
                                        onClick={() => handleSearch()}
                                        disabled={loading}
                                    >
                                        {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : "Search"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Area */}
                    <div className="results-container" style={{ minHeight: data ? 'auto' : '0' }}>

                        {/* 1. Network/API Error */}
                        {error && (
                            <div className="alert alert-danger rounded-4 text-center fw-bold border-0 bg-danger-subtle text-danger">
                                <i className="fa-solid fa-triangle-exclamation me-2"></i> {error}
                            </div>
                        )}

                        {/* 2. NOT FOUND STATE */}
                        {data && !data.found && (
                            <div className="text-center py-5 animate-up bg-white rounded-4 border border-light shadow-sm">
                                <div className="mb-3">
                                    <i className="fa-solid fa-circle-question text-muted opacity-25" style={{ fontSize: '4rem' }}></i>
                                </div>
                                <h4 className="fw-black text-dark mb-2">
                                    Oops! No {searchMode} found.
                                </h4>
                                <p className="text-muted fw-bold mb-4">
                                    We couldn't find <span className="text-success">"{data.query}"</span>. Check the spelling?
                                </p>

                                {/* Suggestions */}
                                {data.suggestions && data.suggestions.length > 0 && (
                                    <div className="d-flex flex-column align-items-center">
                                        <p className="small text-uppercase fw-bold text-muted mb-2">Did you mean:</p>
                                        <div className="d-flex justify-content-center flex-wrap gap-2">
                                            {data.suggestions.map((sugg, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleSearch(sugg)}
                                                    className="btn btn-outline-warning text-dark border-2 rounded-pill px-4 fw-bold"
                                                >
                                                    {sugg}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 3. FOUND CARD - WITH LINKS */}
                        {data && data.found && data.results && (
                            <div className="card border-0 rounded-4 shadow-sm bg-light animate-up overflow-hidden">
                                <div className="card-body p-0">
                                    <div className="row g-0">
                                        {/* Left: Info */}
                                        <div className="col-lg-4 bg-cream p-4 text-center text-lg-start border-end-lg d-flex flex-column justify-content-center">
                                            <div className="mb-3">
                                    <span className="badge bg-success text-white rounded-pill px-3 py-1 mb-2 fw-bold text-uppercase x-small">
                                        Found {searchMode}
                                    </span>
                                                <h3 className="ac-font display-6 text-dark text-capitalize lh-1">{data.query}</h3>
                                            </div>
                                        </div>

                                        {/* Right: Locations */}
                                        <div className="col-lg-8 p-4 bg-white">
                                            <div className="row g-4">
                                                {/* Free Islands */}
                                                <div className="col-sm-6">
                                                    <h6 className="fw-black text-success x-small text-uppercase mb-3">
                                                        <i className="fa-solid fa-unlock me-2"></i> Free Access
                                                    </h6>
                                                    <div className="d-flex flex-wrap gap-2">
                                                        {data.results.free.length > 0 ? data.results.free.map((island, i) => (
                                                            <Link
                                                                key={i}
                                                                to={`/island/${island.toLowerCase()}`}
                                                                className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-2 fw-bold text-decoration-none island-link"
                                                            >
                                                                <i className="fa-solid fa-plane me-1 opacity-50"></i> {island}
                                                            </Link>
                                                        )) : <span className="text-muted small fst-italic py-2 px-3 bg-light rounded-pill">Not on free islands</span>}
                                                    </div>
                                                </div>

                                                {/* Sub Islands */}
                                                <div className="col-sm-6">
                                                    <h6 className="fw-black text-warning-emphasis x-small text-uppercase mb-3">
                                                        <i className="fa-solid fa-crown me-2"></i> Sub Only
                                                    </h6>
                                                    <div className="d-flex flex-wrap gap-2">
                                                        {data.results.sub.length > 0 ? data.results.sub.map((island, i) => (
                                                            <Link
                                                                key={i}
                                                                to={`/island/${island.toLowerCase()}`}
                                                                className="badge bg-warning text-dark border border-white rounded-pill px-3 py-2 fw-bold shadow-sm text-decoration-none island-link"
                                                            >
                                                                <i className="fa-solid fa-star me-1 opacity-50"></i> {island}
                                                            </Link>
                                                        )) : <span className="text-muted small fst-italic py-2 px-3 bg-light rounded-pill">Not on sub islands</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Optional CSS for hover effect */}
                    <style>{`
                        .island-link {
                            transition: transform 0.2s ease, box-shadow 0.2s ease;
                        }
                        .island-link:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 4px 8px rgba(0,0,0,0.1) !important;
                            filter: brightness(0.95);
                        }
                    `}</style>
                </div>
            </section>

            {/* SECTION 2: NOOK SERVICES (Features) */}
            <section className="container py-5">
                <div className="row g-4">
                    {/* Feature 1 */}
                    <div className="col-md-4">
                        <div className="app-card h-100 text-center p-4 rounded-4 bg-white position-relative overflow-hidden">
                            <div className="app-icon mb-3 mx-auto bg-light-green text-nook d-flex align-items-center justify-content-center rounded-circle">
                                <i className="fa-solid fa-robot fs-2"></i>
                            </div>
                            <h3 className="h4 fw-black text-dark mb-2">ChoBot Orders</h3>
                            <p className="text-muted small fw-bold mb-0">
                                Don't wait for drops. Type a command, receive a Dodo code, and fly to an island generated just for you.
                            </p>
                        </div>
                    </div>

                    {/* Feature 2 */}
                    <div className="col-md-4">
                        <div className="app-card h-100 text-center p-4 rounded-4 bg-white position-relative overflow-hidden">
                            <div className="app-icon mb-3 mx-auto bg-light-yellow text-warning d-flex align-items-center justify-content-center rounded-circle">
                                <i className="fa-solid fa-coins fs-2"></i>
                            </div>
                            <h3 className="h4 fw-black text-dark mb-2">Max Bells</h3>
                            <p className="text-muted small fw-bold mb-0">
                                Pay off that raccoon today. Hit max bells (999,999,999) in a single trip with the Turnip glitch.
                            </p>
                        </div>
                    </div>

                    {/* Feature 3 */}
                    <div className="col-md-4">
                        <div className="app-card h-100 text-center p-4 rounded-4 bg-white position-relative overflow-hidden">
                            <div className="app-icon mb-3 mx-auto bg-light-blue text-info d-flex align-items-center justify-content-center rounded-circle">
                                <i className="fa-solid fa-ticket fs-2"></i>
                            </div>
                            <h3 className="h4 fw-black text-dark mb-2">Villager Injection</h3>
                            <p className="text-muted small fw-bold mb-0">
                                Need Raymond? Sasha? Any villager in boxes ready to move to your island instantly.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 3: PASSPORT (Pricing/Access) */}
            <section className="container py-5 mb-5">
                <div className="passport-card mx-auto bg-nook-green rounded-5 p-4 p-lg-5 shadow-lg" style={{maxWidth: '900px'}}>
                    <div className="row align-items-center">
                        <div className="col-lg-5 text-center text-lg-start mb-4 mb-lg-0">
                            <h2 className="display-5 fw-black text-white ac-font mb-3">
                                Get Your <br/> Passport
                            </h2>
                            <p className="text-white opacity-75 fw-bold mb-4">
                                Join the sub squad on Twitch or Discord to unlock the premium Dodo codes.
                            </p>
                            <a href="https://www.patreon.com/cw/chopaeng/membership" target="_blank" className="btn btn-light rounded-pill px-4 py-2 fw-black text-nook shadow-sm">
                                <i className="fa-brands fa-patreon me-2"></i>
                                Subscribe Now
                            </a>
                        </div>

                        {/* Passport Visual */}
                        <div className="col-lg-7">
                            <div className="bg-cream rounded-4 p-4 shadow-sm rotate-n2 position-relative">
                                {/* Stamp decoration */}
                                <div className="position-absolute top-0 end-0 m-3 opacity-25">
                                    <i className="fa-solid fa-stamp fa-4x text-nook"></i>
                                </div>

                                <div className="d-flex align-items-center gap-3 mb-4">
                                    <div className="bg-secondary bg-opacity-25 rounded rounded-3" style={{width: '80px', height: '80px'}}></div>
                                    <div>
                                        <h4 className="fw-black text-dark m-0">PASSPORT</h4>
                                        <span className="text-muted small text-uppercase fw-bold">Nook Inc. Membership</span>
                                    </div>
                                </div>
                                <div className="border-top border-2 border-dashed my-3 opacity-25"></div>
                                <div className="row fw-bold text-dark small">
                                    <div className="col-6 mb-2 text-muted text-uppercase x-small">Benefits</div>
                                    <div className="col-6 mb-2 text-end text-nook">Active</div>
                                    <div className="col-12 mb-2">
                                        <i className="fa-solid fa-check text-success me-2"></i> 24/7 Access
                                    </div>
                                    <div className="col-12 mb-2">
                                        <i className="fa-solid fa-check text-success me-2"></i> Priority Queue
                                    </div>
                                    <div className="col-12">
                                        <i className="fa-solid fa-check text-success me-2"></i> Exclusive Discord Role
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>





            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap');
                
                :root {
                    --nook-bg: #f2f4e6;
                    --nook-green: #28a745;
                    --nook-cream: #fffdf0;
                    --nook-blue: #5bc0de;
                    --nook-yellow: #f0ad4e;
                    
                }
                
                .app-card {
                    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease;
                    border: 2px solid transparent;
                }
                .app-card:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 15px 30px rgba(40, 167, 69, 0.15);
                    border-color: rgba(40, 167, 69, 0.2);
                }
                .app-icon {
                    width: 80px; height: 80px;
                }
                .bg-light-green { background-color: #e8f5e9; }
                .bg-light-yellow { background-color: #fff3cd; }
                .bg-light-blue { background-color: #e0f7fa; }
                
                /* PASSPORT SECTION */
                .bg-nook-green { background-color: #28a745; }
                .bg-cream { background-color: #fffdf0; }
                .rotate-n2 { transform: rotate(-2deg); }
                .rotate-n2:hover { transform: rotate(0deg); transition: 0.3s ease; }

                .nook-os {
                    background-color: var(--nook-bg);
                    background-image: radial-gradient(#dce2c8 15%, transparent 16%);
                    background-size: 30px 30px;
                }
                
                .font-nunito { font-family: 'Nunito', sans-serif; }
                .ac-font { font-family: 'Fredoka One', cursive; letter-spacing: 0.5px; }
                .fw-black { font-weight: 900; }
                .text-nook { color: var(--nook-green); }
                .pointer-events-none { pointer-events: none; }

                /* ANIMATIONS */
                .live-dot {
                    width: 10px; height: 10px; background: #28a745; border-radius: 50%;
                    display: inline-block; animation: pulse 2s infinite; margin-right: 8px;
                }
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7); }
                    70% { box-shadow: 0 0 0 8px rgba(40, 167, 69, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0); }
                }

                /* BUTTONS */
                .btn-nook-primary {
                    background-color: #88e0a0;
                    color: white;
                    border: 2px solid #fff;
                    transition: all 0.2s;
                }
                .btn-nook-primary:hover {
                    background-color: #6fd18b;
                    transform: translateY(-3px);
                    box-shadow: 0 10px 20px rgba(136, 224, 160, 0.4) !important;
                }
                .btn-white:hover { transform: translateY(-3px); background-color: #f8f9fa; }
                .transform-active:active { transform: scale(0.95) !important; }

                /* SNAPSHOT FRAME */
                .snapshot-frame {
                    background: #fff;
                    padding: 15px;
                    padding-bottom: 50px; /* Polaroid style bottom */
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    transform: rotate(-3deg);
                    max-width: 550px;
                    transition: transform 0.3s ease;
                }
                .snapshot-frame:hover { transform: rotate(0deg) scale(1.02); }

                /* TAPE STRIP */
                .tape-strip {
                    position: absolute; top: -15px; left: 50%; transform: translateX(-50%);
                    width: 120px; height: 35px;
                    background-color: rgba(255, 255, 255, 0.4);
                    border-left: 2px dashed rgba(0,0,0,0.1);
                    border-right: 2px dashed rgba(0,0,0,0.1);
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                    z-index: 10;
                    backdrop-filter: blur(2px);
                }

                /* FLOATING ICONS */
                .floating-badge { animation: float 3s ease-in-out infinite; }
                .floating-badge-2 { animation: float 4s ease-in-out infinite reverse; }

                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }
            `}</style>
        </>
    );
};

export default Home;