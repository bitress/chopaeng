import {useEffect, useState} from "react";
import { Link } from "react-router-dom"; // Import Link

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

    const copyCommand = (name: string) => {
        const cmd = searchMode === 'item' ? `!order ${name}` : `!villager ${name}`;
        navigator.clipboard.writeText(cmd);
        // Optional: Add toast notification here
    };

    useEffect(() => {
        const site = window.location.origin;
        const url = `${site}/finder`;
        const img = `${site}/banner.png`;

        const title =
            searchMode === "item"
                ? "Find Items on Live Treasure Islands | Chopaeng"
                : "Find Villagers on Live Treasure Islands | Chopaeng";

        const desc =
            searchMode === "item"
                ? "Use the Chopaeng item finder to check which live Treasure Islands currently have the item you want, including free and member islands with real-time updates."
                : "Use the Chopaeng villager finder to check which live Treasure Islands currently have the villager you want, including free and member islands with real-time updates.";


        document.title = title;

        const setMeta = (attr: string, key: string, value: string) => {
            let el = document.querySelector(`meta[${attr}="${key}"]`);
            if (!el) {
                el = document.createElement("meta");
                el.setAttribute(attr, key);
                document.head.appendChild(el);
            }
            el.setAttribute("content", value);
        };

        const setLink = (rel: string, href: string) => {
            let el = document.querySelector(`link[rel="${rel}"]`);
            if (!el) {
                el = document.createElement("link");
                el.setAttribute("rel", rel);
                document.head.appendChild(el);
            }
            el.setAttribute("href", href);
        };

        // Basic SEO
        setMeta("name", "description", desc);
        setLink("canonical", url);

        // Open Graph (Facebook)
        setMeta("property", "og:type", "website");
        setMeta("property", "og:site_name", "Chopaeng");
        setMeta("property", "og:url", url);
        setMeta("property", "og:title", title);
        setMeta("property", "og:description", desc);
        setMeta("property", "og:image", img);

        // Twitter
        setMeta("name", "twitter:card", "summary_large_image");
        setMeta("name", "twitter:title", title);
        setMeta("name", "twitter:description", desc);
        setMeta("name", "twitter:image", img);
    }, [searchMode]);


    return (
        <div className="nook-catalog min-vh-100 font-nunito bg-pattern d-flex flex-column align-items-center">

            {/* 1. HEADER & SEARCH */}
            <header className="w-100 bg-nook-green pt-5 pb-5 position-relative shadow-sm rounded-bottom-5 mb-5">
                <div className="container position-relative z-1 text-center">
                    <span className="badge bg-white text-nook-green rounded-pill mb-3 px-3 py-2 fw-black text-uppercase tracking-wide shadow-sm">
                        <i className="fa-solid fa-wifi me-2"></i> Connected to ChoBot
                    </span>
                    <h1 className="display-4 fw-black text-white ac-font mb-4">
                        {searchMode === 'item' ? 'Item Finder' : 'Villager Finder'}
                    </h1>

                    {/* MODE TOGGLE */}
                    <div className="d-flex justify-content-center gap-3 mb-4">
                        <button
                            onClick={() => setSearchMode('item')}
                            className={`btn rounded-pill px-4 py-2 fw-bold transition-all ${searchMode === 'item' ? 'bg-white text-nook-green shadow' : 'bg-success-dark text-white opacity-75'}`}
                        >
                            <i className="fa-solid fa-couch me-2"></i> Items
                        </button>
                        <button
                            onClick={() => setSearchMode('villager')}
                            className={`btn rounded-pill px-4 py-2 fw-bold transition-all ${searchMode === 'villager' ? 'bg-white text-nook-green shadow' : 'bg-success-dark text-white opacity-75'}`}
                        >
                            <i className="fa-solid fa-user-tag me-2"></i> Villagers
                        </button>
                    </div>

                    {/* SEARCH INPUT */}
                    <div className="row justify-content-center">
                        <div className="col-lg-6 col-md-8">
                            <div className="input-group input-group-lg shadow-lg rounded-pill bg-white p-2">
                                <input
                                    type="text"
                                    className="form-control border-0 bg-transparent fw-bold text-dark shadow-none ps-4"
                                    placeholder={searchMode === 'item' ? "Search 'Ironwood Dresser'..." : "Search 'Raymond'..."}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                <button
                                    className="btn btn-nook-primary rounded-pill px-4 fw-bold m-1"
                                    onClick={() => handleSearch()}
                                    disabled={loading}
                                >
                                    {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-magnifying-glass"></i>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decoration */}
                <div className="position-absolute bottom-0 start-0 opacity-10 ms-n5 mb-n5 text-white">
                    <i className="fa-solid fa-leaf" style={{ fontSize: '15rem', transform: 'rotate(-20deg)' }}></i>
                </div>
            </header>

            {/* 2. RESULTS SECTION */}
            <section className="container" style={{ maxWidth: '800px' }}>

                {/* ERROR STATE */}
                {error && (
                    <div className="alert alert-danger rounded-4 border-0 shadow-sm text-center fw-bold">
                        <i className="fa-solid fa-triangle-exclamation me-2"></i> {error}
                    </div>
                )}

                {/* SUGGESTIONS STATE (Did you mean?) */}
                {data && !data.found && data.suggestions && data.suggestions.length > 0 && (
                    <div className="text-center py-4 bg-white rounded-5 shadow-sm border border-warning">
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
                        <h3 className="fw-black">No results found.</h3>
                        <p>Check your spelling or try a different term!</p>
                    </div>
                )}

                {/* SUCCESS STATE */}
                {data && data.found && data.results && (
                    <div className="card border-0 rounded-5 overflow-hidden mb-5 bg-white shadow-lg animate-up">
                        {/* Result Header */}
                        <div className="card-header bg-cream border-bottom border-light p-4 text-center">
                            <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1 mb-2 fw-bold text-uppercase x-small">
                                {searchMode === 'item' ? 'Item Found' : 'Villager Found'}
                            </span>
                            <h2 className="display-6 fw-black text-dark m-0 text-capitalize mb-3">
                                {data.query}
                            </h2>
                            <button
                                onClick={() => copyCommand(data.query)}
                                className="d-none btn btn-outline-dark rounded-pill px-4 py-2 fw-bold hover-nook"
                            >
                                <i className="fa-regular fa-copy me-2"></i> Copy {searchMode === 'item' ? 'Order' : 'Villager'} Command
                            </button>
                        </div>

                        <div className="card-body p-0">
                            <div className="row g-0">
                                {/* FREE ISLANDS COL */}
                                <div className="col-md-6 border-end border-light">
                                    <div className="p-4 h-100">
                                        <div className="d-flex align-items-center gap-2 mb-4 text-success">
                                            <div className="bg-success-subtle p-2 rounded-circle">
                                                <i className="fa-solid fa-unlock"></i>
                                            </div>
                                            <h5 className="fw-black m-0">Free Islands</h5>
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
                                                Not currently available on Free Islands.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* MEMBER ISLANDS COL */}
                                <div className="col-md-6">
                                    <div className="p-4 h-100 bg-sub-pattern">
                                        <div className="d-flex align-items-center gap-2 mb-4 text-warning-emphasis">
                                            <div className="bg-warning-subtle p-2 rounded-circle">
                                                <i className="fa-solid fa-crown"></i>
                                            </div>
                                            <h5 className="fw-black m-0">Member Islands</h5>
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
                                                Not currently available on Sub Islands.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
};

export default FindItems;