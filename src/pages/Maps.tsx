import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ISLANDS_DATA } from "../data/islands.ts";

// --- Types ---
type IslandStatus = "ONLINE" | "SUB ONLY" | "REFRESHING" | "OFFLINE";

interface ApiIsland {
    dodo: string;
    name: string;
    status: string;
    visitors: string;
}

interface LiveIslandData {
    status: IslandStatus;
    dodo: string;
    visitors: string;
}

const IslandMaps = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [liveData, setLiveData] = useState<Record<string, LiveIslandData>>({});

    // --- 1. Data Fetching (Safe & Typed) ---
    useEffect(() => {
        let isMounted = true;

        const fetchStatus = async () => {
            try {
                const response = await fetch("https://dodo.chopaeng.com/api/islands");
                if (!response.ok) throw new Error("Network response was not ok");

                const apiData: ApiIsland[] = await response.json();

                if (isMounted) {
                    const statusMap: Record<string, LiveIslandData> = {};

                    apiData.forEach((api) => {
                        let computedStatus: IslandStatus = "OFFLINE";
                        const rawStatus = api.status ? api.status.toUpperCase() : "";

                        if (["SUB ONLY", "PATREON"].some(k => rawStatus.includes(k))) {
                            computedStatus = "SUB ONLY";
                        } else if (api.dodo === "GETTIN'" || rawStatus === "REFRESHING") {
                            computedStatus = "REFRESHING";
                        } else if (rawStatus === "ONLINE") {
                            computedStatus = "ONLINE";
                        }

                        statusMap[api.name.toUpperCase()] = {
                            status: computedStatus,
                            dodo: api.dodo || "---",
                            visitors: api.visitors || "0"
                        };
                    });
                    setLiveData(statusMap);
                }
            } catch (error) {
                console.error("Failed to fetch island status:", error);
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 15000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    // --- 2. Memoized Filtering & Sorting ---
    // Fix: Sort strictly inside useMemo to avoid mutation during render
    const filteredIslands = useMemo(() => {
        const lowerQuery = searchQuery.toLowerCase().trim();

        return ISLANDS_DATA
            .filter(island =>
                island.name.toLowerCase().includes(lowerQuery) ||
                island.items.some(i => i.toLowerCase().includes(lowerQuery))
            )
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [searchQuery]);

    // --- 3. SEO / Meta Tags ---
    useEffect(() => {
        const site = window.location.origin;
        const img = `${site}/banner.png`;
        const q = searchQuery.trim();

        const title = q
            ? `Island Maps – "${q}" | Chopaeng`
            : "Island Maps | Chopaeng";

        const desc = q
            ? `Browse Chopaeng island maps and inventory. Results for: ${q}.`
            : "Browse Chopaeng island maps with live status, Dodo codes, and inventory preview.";

        document.title = title;

        // Helper to safely set meta tags
        const updateMeta = (selector: string, content: string) => {
            let el = document.querySelector(selector);
            if (!el) {
                el = document.createElement("meta");
                if (selector.startsWith('meta[name=')) el.setAttribute("name", selector.split('"')[1]);
                if (selector.startsWith('meta[property=')) el.setAttribute("property", selector.split('"')[1]);
                document.head.appendChild(el);
            }
            el.setAttribute("content", content);
        };

        updateMeta('meta[name="description"]', desc);
        updateMeta('meta[property="og:title"]', title);
        updateMeta('meta[property="og:description"]', desc);
        updateMeta('meta[property="og:url"]', `${site}/maps`);
        updateMeta('meta[property="og:image"]', img);
        updateMeta('meta[name="twitter:title"]', title);
        updateMeta('meta[name="twitter:description"]', desc);

    }, [searchQuery]);

    // --- 4. Robust Image Error Handler ---
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const target = e.currentTarget;
        if (target.src.includes('.png')) {
            target.src = target.src.replace('.png', '.jpg');
        } else if (!target.src.includes('banner.png')) {
            // Only set fallback if we aren't ALREADY on the fallback to prevent infinite loops
            target.src = 'https://www.chopaeng.com/banner.png';
        }
    };

    return (
        <div className="dal-bg min-vh-100 font-nunito">

            {/* --- HERO HEADER --- */}
            <div className="dal-hero">
                <div className="container position-relative z-2">
                    <div className="d-flex justify-content-between align-items-center pt-4 mb-4">
                        <button onClick={() => navigate("/")} className="btn-dal-back">
                            <i className="fa-solid fa-chevron-left me-2"></i> Return
                        </button>
                        <div className="dal-badge">
                            <i className="fa-solid fa-plane-up me-2"></i> FLIGHTS
                        </div>
                    </div>

                    <div className="text-center text-white pb-5">
                        <h1 className="display-4 fw-black mb-1 title-shadow">Where to next?</h1>
                        <p className="opacity-75 fw-bold letter-spacing-1">Select a destination to view map & inventory</p>
                    </div>
                </div>
                <div className="wave-divider"></div>
            </div>

            {/* --- CONTENT --- */}
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

                            // FIX: Only animate if NOT searching.
                            // If searching, show instantly (opacity: 1, no animation) to prevent "flashing".
                            const isSearching = searchQuery.length > 0;
                            const animationStyle = isSearching
                                ? { opacity: 1 }
                                : {
                                    animation: `fadeInUp 0.5s ease forwards`,
                                    animationDelay: `${Math.min(index * 50, 500)}ms`,
                                    opacity: 0
                                };

                            return (
                                <div
                                    key={island.id}
                                    className="col-xl-4 col-md-6"
                                    style={animationStyle} // <--- APPLIED HERE
                                >
                                    <div
                                        className="ticket-card"
                                        onClick={() => navigate(`/island/${island.id}`)}
                                        style={{ cursor: "pointer" }}
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
                                                src={`https://cdn.chopaeng.com/maps/${island.name.toLowerCase()}.png`}
                                                alt={island.name}
                                                className={`map-img ${live.status === 'OFFLINE' ? 'sepia' : ''}`}
                                                loading="lazy"
                                                onError={handleImageError}
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
        </div>
    );
};

export default IslandMaps;