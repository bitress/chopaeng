import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ACNH_FINDER_API_BASE } from "../config/api";
import DisclaimerBanner from "../components/DisclaimerBanner";
import { HowItWorksExplainer, FIND_ITEMS_EXPLAINER_CONFIG } from "../components/HowItWorksExplainer";

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

const FindItems = () => {
    // State
    const [searchTerm, setSearchTerm] = useState('');
    const [searchMode, setSearchMode] = useState<'item' | 'villager'>('item'); // Toggle state
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<SearchResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (term: string = searchTerm) => {
        if (!term.trim()) return;

        setLoading(true);
        setData(null);
        setError(null);
        setSearchTerm(term);

        try {
            const endpoint = searchMode === 'item' ? 'find' : 'villager';
            const response = await fetch(`${ACNH_FINDER_API_BASE}/api/${endpoint}?q=${encodeURIComponent(term)}`);

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

    const title =
        searchMode === "item"
            ? "Find Items on ACNH Fan Islands | Chopaeng Community"
            : "Find Villager Matching on ACNH Fan Islands | Chopaeng Community";

    const desc =
        searchMode === "item"
            ? "Search which live community-hosted ACNH islands on Chopaeng currently feature the item you want. Real-time item lookup across free and supporter islands."
            : "Search which live community-hosted ACNH islands on Chopaeng currently offer villager matching for your favorite villager. Real-time villager request lookup across free and supporter islands.";

    return (
        <div className="nook-catalog min-vh-100 font-nunito bg-pattern d-flex flex-column align-items-center">
            <Helmet>
                <title>{title}</title>
                <meta name="description" content={desc} />
                <link rel="canonical" href="https://www.chopaeng.com/find" />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="Chopaeng" />
                <meta property="og:url" content="https://www.chopaeng.com/find" />
                <meta property="og:title" content={title} />
                <meta property="og:description" content={desc} />
                <meta property="og:image" content="https://www.chopaeng.com/banner.png" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={title} />
                <meta name="twitter:description" content={desc} />
                <meta name="twitter:image" content="https://www.chopaeng.com/banner.png" />
            </Helmet>

            {/* 1. HEADER & SEARCH */}
            <header
                className="w-100 pt-4 pb-4 py-sm-5 position-relative shadow-sm rounded-bottom-5 mb-5 overflow-hidden"
                style={{ background: 'var(--nook-green, #37b06d)' }}
            >
                <div className="container position-relative z-1 text-center">
                    <span className="badge bg-white text-nook-green rounded-pill mb-3 px-3 py-2 fw-black text-uppercase tracking-wide shadow-sm">
                        <i className="fa-solid fa-wifi me-2"></i> Connected to ChoBot Community Assistant
                    </span>
                    <h1 className="display-4 fw-black text-white ac-font mb-4">
                        {searchMode === 'item' ? 'Item Directory Search' : 'Villager Matching Finder'}
                    </h1>

                    {/* MODE TOGGLE */}
                    <div className="d-flex flex-wrap justify-content-center gap-2 gap-sm-3 mb-4">
                        <button
                            onClick={() => setSearchMode('item')}
                            className={`btn rounded-pill px-3 px-sm-4 py-2 fw-bold transition-all ${searchMode === 'item' ? 'bg-white text-nook-green shadow' : 'bg-dark bg-opacity-25 text-white'}`}
                            aria-pressed={searchMode === 'item'}
                        >
                            <i className="fa-solid fa-couch me-2"></i> Items
                        </button>
                        <button
                            onClick={() => setSearchMode('villager')}
                            className={`btn rounded-pill px-3 px-sm-4 py-2 fw-bold transition-all ${searchMode === 'villager' ? 'bg-white text-nook-green shadow' : 'bg-dark bg-opacity-25 text-white'}`}
                            aria-pressed={searchMode === 'villager'}
                        >
                            <i className="fa-solid fa-user-tag me-2"></i> Villagers
                        </button>
                    </div>

                    {/* SEARCH INPUT */}
                    <div className="row justify-content-center">
                        <div className="col-12 col-lg-6 col-md-8">
                            <div className="input-group input-group-lg shadow-lg rounded-pill bg-white p-2">
                                <input
                                    type="text"
                                    className="form-control border-0 bg-transparent fw-bold shadow-none ps-4"
                                    placeholder={searchMode === 'item' ? "Search 'Ironwood Dresser'..." : "Search 'Raymond'..."}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    aria-label={searchMode === 'item' ? 'Search for an item' : 'Search for a villager'}
                                />
                                <button
                                    className="btn btn-nook-primary rounded-pill px-4 fw-bold m-1"
                                    onClick={() => handleSearch()}
                                    disabled={loading}
                                    aria-label="Search"
                                >
                                    {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-magnifying-glass"></i>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decoration */}
                <div className="position-absolute bottom-0 start-0 opacity-10 ms-n5 mb-n5 text-white d-none d-sm-block" aria-hidden="true">
                    <i className="fa-solid fa-leaf" style={{ fontSize: '15rem', transform: 'rotate(-20deg)' }}></i>
                </div>
            </header>

            {/* 2. RESULTS SECTION */}
            <section className="container px-3 mb-5" style={{ maxWidth: '800px' }}>
                {/* ── REUSABLE HOW IT WORKS EXPLAINER ── */}
                <HowItWorksExplainer {...FIND_ITEMS_EXPLAINER_CONFIG} className="mb-4" defaultExpanded={false} />

                {/* ERROR STATE */}
                {error && (
                    <div className="alert alert-danger rounded-4 border-0 shadow-sm text-center fw-bold" role="alert">
                        <i className="fa-solid fa-triangle-exclamation me-2"></i> {error}
                    </div>
                )}

                {/* SUGGESTIONS STATE (Did you mean?) */}
                {data && !data.found && data.suggestions && data.suggestions.length > 0 && (
                    <div className="text-center py-4 px-3 bg-white rounded-5 shadow-sm border border-warning">
                        <h3 className="h5 fw-bold text-muted mb-3">
                            <i className="fa-solid fa-circle-question text-warning me-2"></i>
                            Not found. Did you mean?
                        </h3>
                        <div className="d-flex justify-content-center flex-wrap gap-2">
                            {data.suggestions.map((sugg, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSearch(sugg)}
                                    className="btn btn-outline-warning text-dark fw-bold rounded-pill px-4"
                                >
                                    {sugg}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* NOT FOUND (No suggestions) */}
                {data && !data.found && (!data.suggestions || data.suggestions.length === 0) && (
                    <div className="text-center py-5 opacity-50">
                        <i className="fa-solid fa-box-open fs-1 mb-3"></i>
                        <h3 className="fw-black">No matching items or villagers found.</h3>
                        <p>Check your spelling or try searching for another term!</p>
                    </div>
                )}

                {/* SUCCESS STATE */}
                {data && data.found && data.results && (
                    <div className="card border-0 rounded-5 overflow-hidden mb-5 bg-white shadow-lg animate-up">
                        {/* Result Header */}
                        <div className="card-header bg-cream border-bottom border-light p-3 p-sm-4 text-center">
                            <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1 mb-2 fw-bold text-uppercase x-small">
                                {searchMode === 'item' ? 'Item Listed' : 'Villager Matching Available'}
                            </span>
                            <h2 className="display-6 fw-black text-dark m-0 text-capitalize text-break">
                                {data.query}
                            </h2>
                            <p className="text-muted small fw-bold mt-2 mb-0">
                                Listed across {data.results.free.length + data.results.sub.length} community island{(data.results.free.length + data.results.sub.length) === 1 ? '' : 's'} below.
                            </p>
                        </div>

                        <div className="card-body p-0">
                            <div className="row g-0">
                                {/* FREE ISLANDS COL */}
                                <div className="col-12 col-md-6 border-bottom border-md-bottom-0 border-end-0 border-md-end border-light">
                                    <div className="p-3 p-sm-4 h-100">
                                        <div className="d-flex align-items-center gap-2 mb-4 text-success">
                                            <div className="bg-success-subtle p-2 rounded-circle">
                                                <i className="fa-solid fa-unlock"></i>
                                            </div>
                                            <h5 className="fw-black m-0">Public Islands</h5>
                                        </div>

                                        {data.results.free.length > 0 ? (
                                            <div className="d-flex flex-wrap gap-2">
                                                {data.results.free.map((island, i) => (
                                                    <Link
                                                        key={i}
                                                        to={`/island/${island.toLowerCase()}`}
                                                        className="badge bg-success text-white rounded-pill px-3 py-2 fw-bold shadow-sm text-decoration-none hover-scale"
                                                    >
                                                        <i className="fa-solid fa-plane me-1"></i> {island}
                                                    </Link>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-muted small fst-italic border rounded-3 p-3 bg-light text-center">
                                                Not currently available on Public Islands.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* MEMBER ISLANDS COL */}
                                <div className="col-12 col-md-6">
                                    <div className="p-3 p-sm-4 h-100 bg-sub-pattern">
                                        <div className="d-flex align-items-center gap-2 mb-4 text-warning-emphasis">
                                            <div className="bg-warning-subtle p-2 rounded-circle">
                                                <i className="fa-solid fa-crown"></i>
                                            </div>
                                            <h5 className="fw-black m-0">Supporter Islands</h5>
                                        </div>

                                        {data.results.sub.length > 0 ? (
                                            <div className="d-flex flex-wrap gap-2">
                                                {data.results.sub.map((island, i) => (
                                                    <Link
                                                        key={i}
                                                        to={`/island/${island.toLowerCase()}`}
                                                        className="badge bg-warning text-dark rounded-pill px-3 py-2 fw-bold shadow-sm border border-white text-decoration-none hover-scale"
                                                    >
                                                        <i className="fa-solid fa-star me-1"></i> {island}
                                                    </Link>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-muted small fst-italic border rounded-3 p-3 bg-white text-center">
                                                Not currently available on Supporter Islands.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="card-footer bg-white border-top border-light p-3 p-sm-4 text-center">
                            <Link
                                to="/command-builder"
                                className="btn btn-nook-primary rounded-pill px-4 py-2 fw-bold hover-nook"
                            >
                                <i className="fa-solid fa-list-check me-2"></i>
                                Build a Custom Item Request in Command Builder
                            </Link>
                        </div>
                    </div>
                )}

                {/* FAN SITE DISCLAIMER */}
                <DisclaimerBanner variant="alert" className="mt-4 mb-2" />
            </section>
        </div>
    );
};

export default FindItems;