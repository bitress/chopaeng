import { useMemo, useState, useEffect } from "react";

// --- TYPES ---
type Category = "public" | "member";
type FilterKey = "ALL" | Category;

type IslandStatus = "ONLINE" | "SUB ONLY" | "REFRESHING" | "OFFLINE";
type Theme = "pink" | "teal" | "purple" | "gold";

// Search Modes
type SearchMode = "FILTER" | "ITEM" | "VILLAGER";

// Internal App State
interface Island {
    name: string;
    status: IslandStatus;
    dodoCode?: string;
    type: string;
    seasonal: string;
    items: string[];
    visitors: number;
    cat: Category;
    theme: Theme;
}

// Finder API Response
interface FinderResponse {
    found: boolean;
    query: string;
    results?: {
        free: string[];
        sub: string[];
    };
}

// Live Status API Response
interface ApiIsland {
    dodo: string;
    name: string;
    status: string;
    type: string;
    visitors: string;
}

interface FilterTab {
    key: FilterKey;
    label: string;
}

interface StatusMeta {
    dotClass: string;
    btn: {
        className: string;
        text: string;
        icon: string | null;
        disabled: boolean;
    };
    cardClass: string;
    aria: string;
}

// --- CONFIGURATION ---
const FILTERS: FilterTab[] = [
    { key: "ALL", label: "All" },
    { key: "public", label: "Free" },
    { key: "member", label: "VIP" },
];

const STATUS_CONFIG: Record<IslandStatus, StatusMeta> = {
    ONLINE: {
        dotClass: "bg-success",
        btn: { className: "btn btn-nook-primary", text: "VIEW CODE", icon: null, disabled: false },
        cardClass: "",
        aria: "Online",
    },
    "SUB ONLY": {
        dotClass: "bg-warning",
        btn: { className: "btn btn-warning text-dark", text: "SUB ONLY", icon: "fa-lock", disabled: false },
        cardClass: "",
        aria: "Subscriber only",
    },
    REFRESHING: {
        dotClass: "bg-secondary",
        btn: { className: "btn btn-light border text-muted", text: "REFRESHING...", icon: "fa-arrows-rotate", disabled: true },
        cardClass: "opacity-75",
        aria: "Refreshing",
    },
    OFFLINE: {
        dotClass: "bg-danger",
        btn: { className: "btn btn-light border text-danger", text: "OFFLINE", icon: "fa-power-off", disabled: true },
        cardClass: "opacity-50 grayscale",
        aria: "Offline",
    },
};

// --- HELPER FUNCTIONS ---
const parseVisitors = (raw: string): number => {
    if (!raw) return 0;
    const clean = raw.toUpperCase();
    if (clean.includes("FULL")) return 7;
    const match = clean.match(/(\d+)/);
    if (match) {
        const num = parseInt(match[0], 10);
        return Math.max(0, Math.min(7, num));
    }
    return 0;
};

// Source of Truth
const STATIC_ISLAND_METADATA: Island[] = [
    // ROW 1
    { name: "ALAPAAP", status: "SUB ONLY", type: "Treasure Island", seasonal: "Year-Round", items: ["General", "DIYs", "Materials"], visitors: 7, cat: "member", theme: "gold" },
    { name: "ARUGA", status: "SUB ONLY", type: "Patreon Exclusive", seasonal: "Year-Round", items: ["Exclusive Sets", "Materials"], visitors: 1, cat: "member", theme: "gold" },
    { name: "BAHAGHARI", status: "SUB ONLY", type: "Treasure Island", seasonal: "Year-Round", items: ["General", "DIYs"], visitors: 7, cat: "member", theme: "gold" },
    { name: "BITUIN", status: "SUB ONLY", type: "Treasure Island", seasonal: "Year-Round", items: ["General", "DIYs"], visitors: 7, cat: "member", theme: "gold" },
    { name: "BONITA", status: "SUB ONLY", type: "Treasure Island", seasonal: "Year-Round", items: ["General", "DIYs"], visitors: 3, cat: "member", theme: "gold" },
    { name: "DALISAY", status: "SUB ONLY", type: "Patreon Exclusive", seasonal: "Year-Round", items: ["Exclusive Sets"], visitors: 2, cat: "member", theme: "gold" },
    // ROW 2
    { name: "GALAK", status: "SUB ONLY", type: "Treasure Island", seasonal: "Year-Round", items: ["General", "DIYs"], visitors: 4, cat: "member", theme: "gold" },
    { name: "HIRAYA", status: "SUB ONLY", type: "Patreon Exclusive", seasonal: "Year-Round", items: ["Exclusive Sets"], visitors: 5, cat: "member", theme: "gold" },
    { name: "LAKAN", status: "SUB ONLY", type: "Treasure Island", seasonal: "Year-Round", items: ["General", "DIYs"], visitors: 4, cat: "member", theme: "gold" },
    { name: "LIKHA", status: "SUB ONLY", type: "Treasure Island", seasonal: "Year-Round", items: ["General", "DIYs"], visitors: 7, cat: "member", theme: "gold" },
    { name: "MARAHUYO", status: "SUB ONLY", type: "Patreon Exclusive", seasonal: "Year-Round", items: ["Max Bells", "Turnips"], visitors: 4, cat: "member", theme: "gold" },
    { name: "TAGUMPAY", status: "SUB ONLY", type: "Patreon Exclusive", seasonal: "Year-Round", items: ["Exclusive Sets"], visitors: 5, cat: "member", theme: "gold" },
    // ROW 3
    { name: "KILIG", status: "ONLINE", type: "1.0 Treasure Island", seasonal: "Year-Round", items: ["1.0 Furniture", "DIYs"], visitors: 7, cat: "public", theme: "teal" },
    { name: "MAHARLIKA", status: "ONLINE", type: "Furniture Island", seasonal: "Year-Round", items: ["Furniture Sets", "Housewares"], visitors: 7, cat: "public", theme: "purple" },
    { name: "HARANA", status: "ONLINE", type: "Critters & DIY", seasonal: "Year-Round", items: ["Models", "Golden Tools", "DIYs"], visitors: 7, cat: "public", theme: "teal" },
    { name: "KAKANGGATA", status: "ONLINE", type: "1.0 Treasure Island", seasonal: "Summer", items: ["Shell DIYs", "Surfboards"], visitors: 7, cat: "public", theme: "teal" },
    { name: "BATHALA", status: "ONLINE", type: "2.0 Treasure Island", seasonal: "Year-Round", items: ["2.0 Items", "Vehicles"], visitors: 7, cat: "public", theme: "teal" },
    // ROW 4
    { name: "KAULAYAW", status: "ONLINE", type: "2.0 Treasure Island", seasonal: "Year-Round", items: ["2.0 Furniture", "Food"], visitors: 7, cat: "public", theme: "teal" },
    { name: "TADHANA", status: "ONLINE", type: "Furniture Island", seasonal: "Year-Round", items: ["Antique", "Imperial", "Cute"], visitors: 7, cat: "public", theme: "purple" },
    { name: "RAGSUYO", status: "ONLINE", type: "Critters & DIY", seasonal: "Year-Round", items: ["Fish Models", "Bug Models"], visitors: 7, cat: "public", theme: "teal" },
    { name: "KALAWAKAN", status: "ONLINE", type: "1.0 Treasure Island", seasonal: "Year-Round", items: ["Rattan", "Diner", "Throwback"], visitors: 7, cat: "public", theme: "teal" },
    { name: "DALANGIN", status: "REFRESHING", type: "2.0 Treasure Island", seasonal: "Year-Round", items: ["Refreshing..."], visitors: 0, cat: "public", theme: "teal" },
    // ROW 5
    { name: "PAGSAMO", status: "ONLINE", type: "Furniture Island", seasonal: "Year-Round", items: ["Elegant", "Nordic", "Ranch"], visitors: 7, cat: "public", theme: "purple" },
    { name: "TALA", status: "ONLINE", type: "Materials and DIY", seasonal: "Year-Round", items: ["Wood", "Iron", "Gold"], visitors: 7, cat: "public", theme: "teal" },
    { name: "MATAHOM", status: "ONLINE", type: "Clothing Island", seasonal: "Spring", items: ["Kimonos", "Bags", "Shoes"], visitors: 7, cat: "public", theme: "pink" },
    { name: "KUNDIMAN", status: "ONLINE", type: "1.0 Treasure Island", seasonal: "Year-Round", items: ["1.0 Sets", "Walls/Floors"], visitors: 7, cat: "public", theme: "teal" },
    { name: "GUNITA", status: "ONLINE", type: "2.0 Treasure Island", seasonal: "Year-Round", items: ["Castle Sets", "Plaza Items"], visitors: 7, cat: "public", theme: "teal" },
    // ROW 6
    { name: "SILAKBO", status: "ONLINE", type: "Seasonal Items", seasonal: "Halloween", items: ["Spooky Set", "Candy", "Pumpkins"], visitors: 7, cat: "public", theme: "teal" },
    { name: "SINAGTALA", status: "ONLINE", type: "Materials and DIY", seasonal: "Year-Round", items: ["Star Frags", "Seasonal Mats"], visitors: 7, cat: "public", theme: "teal" },
    { name: "PARALUMAN", status: "ONLINE", type: "Clothing Island", seasonal: "Winter", items: ["Coats", "Boots", "Hats"], visitors: 7, cat: "public", theme: "pink" },
    { name: "AMIHAN", status: "ONLINE", type: "Seasonal Items", seasonal: "Festive", items: ["Ornaments", "Toy Day"], visitors: 7, cat: "public", theme: "teal" },
    { name: "BABAYLAN", status: "ONLINE", type: "Seasonal Items", seasonal: "Cherry Blossom", items: ["Petals", "Bonsai", "Branches"], visitors: 7, cat: "public", theme: "teal" },
    { name: "PAGSUYO", status: "ONLINE", type: "Seasonal Items", seasonal: "Autumn", items: ["Mushrooms", "Maple"], visitors: 7, cat: "public", theme: "teal" },
    { name: "SINTA", status: "ONLINE", type: "Seasonal Items", seasonal: "Wedding", items: ["Wedding Set", "Hearts"], visitors: 7, cat: "public", theme: "teal" },
];

const TreasureIslands = () => {
    // State
    const [islands, setIslands] = useState<Island[]>(STATIC_ISLAND_METADATA);
    const [filter, setFilter] = useState<FilterKey>("ALL");
    const [loading, setLoading] = useState<boolean>(true);

    // Search Logic
    const [search, setSearch] = useState<string>("");
    const [searchMode, setSearchMode] = useState<SearchMode>("FILTER");
    const [isFinderLoading, setIsFinderLoading] = useState(false);
    const [finderResults, setFinderResults] = useState<string[] | null>(null); // Null = No search yet, [] = Not found, [...] = Found
    const [lastQuery, setLastQuery] = useState("");

    // --- 1. Fetch Live Status (Dodo/Visitors) ---
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await fetch("https://dodo.chopaeng.com/api/islands");
                if (!response.ok) throw new Error("Network response was not ok");
                const apiData: ApiIsland[] = await response.json();

                const mergedData = STATIC_ISLAND_METADATA.map((staticIsland) => {
                    const liveData = apiData.find((api) => api.name.toUpperCase() === staticIsland.name.toUpperCase());
                    if (liveData) {
                        let computedStatus: IslandStatus = "OFFLINE";
                        if (["SUB ONLY", "PATREON"].some(k => liveData.status.includes(k))) computedStatus = "SUB ONLY";
                        else if (liveData.dodo === "GETTIN'") computedStatus = "REFRESHING";
                        else if (liveData.status === "ONLINE") computedStatus = "ONLINE";
                        else if (liveData.status === "REFRESHING") computedStatus = "REFRESHING";

                        return {
                            ...staticIsland,
                            status: computedStatus,
                            dodoCode: liveData.dodo,
                            visitors: parseVisitors(liveData.visitors),
                        };
                    }
                    return { ...staticIsland, status: "OFFLINE" as IslandStatus, visitors: 0 };
                });

                setIslands(mergedData);
            } catch (error) {
                console.error("Failed to fetch island status:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 15000);
        return () => clearInterval(interval);
    }, []);

    // --- 2. Handle Item/Villager Finder Search ---
    const executeFinderSearch = async () => {
        if (!search.trim()) return;

        setIsFinderLoading(true);
        setLastQuery(search);
        setFinderResults(null); // Reset

        try {
            const endpoint = searchMode === 'ITEM' ? 'find' : 'villager';
            const response = await fetch(`https://acnh-finder.chopaeng.com/api/${endpoint}?q=${encodeURIComponent(search)}`);
            if (!response.ok) throw new Error("Search failed");

            const data: FinderResponse = await response.json();

            if (data.found && data.results) {
                // Combine free and sub lists into one uppercase array of island names
                const allFound = [...data.results.free, ...data.results.sub].map(n => n.toUpperCase());
                setFinderResults(allFound);
            } else {
                setFinderResults([]); // Empty array = Not Found
            }
        } catch (error) {
            console.error(error);
            setFinderResults([]);
        } finally {
            setIsFinderLoading(false);
        }
    };

    // --- 3. Compute Filtered Grid ---
    const filteredData = useMemo(() => {
        // 1. Base Filter (Category)
        let data = islands.filter((island) => (filter === "ALL" ? true : island.cat === filter));

        // 2. Search Mode Logic
        if (searchMode === "FILTER") {
            // Standard Text Filter
            const q = search.trim().toLowerCase();
            if (q) {
                data = data.filter((island) => {
                    const haystack = [island.name, island.type, island.seasonal, ...island.items]
                        .join(" ")
                        .toLowerCase();
                    return haystack.includes(q);
                });
            }
        } else {
            // Finder Logic (Item/Villager)
            // If we have results, only show islands in that list
            if (finderResults !== null) {
                data = data.filter(island => finderResults.includes(island.name.toUpperCase()));
            }
            // If finderResults is null (user hasn't pressed enter yet), show all (or could show none)
        }

        return data;
    }, [filter, search, islands, searchMode, finderResults]);

    const onCardClick = (island: Island) => {
        if (island.status === "ONLINE" && island.dodoCode && island.dodoCode !== "GETTIN'") {
            navigator.clipboard.writeText(island.dodoCode);
            alert(`Copied code for ${island.name}: ${island.dodoCode}`);
        }
    };

    // Reset finder results when switching modes
    const handleModeSwitch = (mode: SearchMode) => {
        setSearchMode(mode);
        setSearch("");
        setFinderResults(null);
    };

    return (
        <div className="nook-bg min-vh-100 py-5">
            <div className="container-fluid px-lg-5">

                {/* --- CONTROLS SECTION --- */}
                <div className="d-flex flex-column align-items-center gap-3 mb-4">

                    {/* Category Filter Tabs */}
                    <div className="d-flex justify-content-center gap-2 flex-wrap">
                        {FILTERS.map((t) => (
                            <button
                                key={t.key}
                                type="button"
                                onClick={() => setFilter(t.key)}
                                className={`btn btn-ac fw-bold text-uppercase rounded-pill px-4 ${filter === t.key ? "active" : ""}`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Search Bar Container */}
                    <div className="search-wrap w-100 position-relative" style={{ maxWidth: 600 }}>

                        {/* Search Mode Toggles */}
                        <div className="d-flex gap-2 justify-content-center mb-2">
                            <button
                                onClick={() => handleModeSwitch("FILTER")}
                                className={`btn btn-sm rounded-pill px-3 fw-bold ${searchMode === "FILTER" ? "btn-dark" : "btn-light border"}`}
                            >
                                Filter List
                            </button>
                            <button
                                onClick={() => handleModeSwitch("ITEM")}
                                className={`btn btn-sm rounded-pill px-3 fw-bold ${searchMode === "ITEM" ? "btn-success" : "btn-light border"}`}
                            >
                                Find Item
                            </button>
                            <button
                                onClick={() => handleModeSwitch("VILLAGER")}
                                className={`btn btn-sm rounded-pill px-3 fw-bold ${searchMode === "VILLAGER" ? "btn-info text-white" : "btn-light border"}`}
                            >
                                Find Villager
                            </button>
                        </div>

                        {/* Input Group */}
                        <div className="input-group shadow-sm rounded-pill overflow-hidden border border-2 border-success-subtle">
                            <span className="input-group-text bg-white border-0 ps-3">
                                {isFinderLoading ? (
                                    <i className="fa-solid fa-circle-notch fa-spin text-success" />
                                ) : (
                                    <i className={`fa-solid ${searchMode === 'VILLAGER' ? 'fa-user-tag' : searchMode === 'ITEM' ? 'fa-box-open' : 'fa-magnifying-glass'} text-muted`} />
                                )}
                            </span>

                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && searchMode !== 'FILTER' && executeFinderSearch()}
                                className="form-control border-0 shadow-none py-3 fw-bold"
                                placeholder={
                                    searchMode === "FILTER" ? "Filter by name, season, or theme..." :
                                        searchMode === "ITEM" ? "Type item name (e.g. Ironwood Dresser) & Hit Enter" :
                                            "Type villager name (e.g. Raymond) & Hit Enter"
                                }
                            />

                            {/* Action Buttons */}
                            {search.length > 0 && (
                                <button
                                    type="button"
                                    className="btn btn-white border-0 text-muted"
                                    onClick={() => { setSearch(""); setFinderResults(null); }}
                                >
                                    <i className="fa-solid fa-xmark" />
                                </button>
                            )}

                            {searchMode !== "FILTER" && (
                                <button
                                    className="btn btn-nook-primary px-4 fw-black border-0 rounded-0"
                                    onClick={executeFinderSearch}
                                >
                                    SEARCH
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- FEEDBACK MESSAGES --- */}

                {/* 1. Loading State */}
                {loading && (
                    <div className="text-center mb-4">
                        <span className="badge bg-light text-muted border px-3 py-2 rounded-pill">
                            <i className="fa-solid fa-circle-notch fa-spin me-2"></i> Connecting to NookNet...
                        </span>
                    </div>
                )}

                {/* 2. Finder Results Feedback */}
                {searchMode !== "FILTER" && finderResults !== null && (
                    <div className="text-center mb-4 animate-up">
                        {finderResults.length > 0 ? (
                            <div className="d-inline-block bg-white border border-success text-success px-4 py-2 rounded-4 shadow-sm fw-bold">
                                <i className="fa-solid fa-check-circle me-2"></i>
                                Found <span className="text-dark text-uppercase">{lastQuery}</span> on {finderResults.length} islands!
                            </div>
                        ) : (
                            <div className="d-inline-block bg-white border border-danger text-danger px-4 py-2 rounded-4 shadow-sm fw-bold">
                                <i className="fa-solid fa-circle-exclamation me-2"></i>
                                Sorry, we couldn't find <span className="text-dark text-uppercase">{lastQuery}</span> anywhere.
                            </div>
                        )}
                    </div>
                )}

                {/* 3. Empty Grid Feedback */}
                {!loading && filteredData.length === 0 && (
                    <div className="text-center text-muted fw-bold py-5">
                        <i className="fa-regular fa-face-sad-tear fs-1 mb-3 d-block" />
                        No islands match your current filters.
                    </div>
                )}

                {/* --- MAIN GRID --- */}
                <div className="row g-4 justify-content-center">
                    {filteredData.map((island) => {
                        const statusMeta = STATUS_CONFIG[island.status] || STATUS_CONFIG["OFFLINE"];

                        const btnText = (island.status === "ONLINE" && island.dodoCode && island.dodoCode !== "00000" && island.dodoCode !== "GETTIN'")
                            ? island.dodoCode
                            : statusMeta.btn.text;

                        const pct = (island.visitors / 7) * 100;
                        const isMatch = finderResults && finderResults.includes(island.name.toUpperCase());

                        return (
                            <div key={island.name} className="col-xl-3 col-lg-4 col-md-6">
                                <button
                                    type="button"
                                    className={`card h-100 ac-card shadow-sm border-0 overflow-hidden text-start w-100 ${statusMeta.cardClass} ${isMatch ? 'ring-2 ring-success' : ''}`}
                                    onClick={() => onCardClick(island)}
                                >
                                    {/* Found Badge */}
                                    {isMatch && (
                                        <div className="bg-success text-white text-center fw-bold x-small py-1">
                                            <i className="fa-solid fa-star me-1"></i> ITEM FOUND HERE
                                        </div>
                                    )}

                                    {/* SEASONAL BANNER */}
                                    <div className={`seasonal-tag text-center py-1 fw-black x-small theme-${island.theme}`}>
                                        <i className="fa-solid fa-calendar-day me-1"></i> {island.seasonal}
                                    </div>

                                    <div className="card-body p-4">
                                        {/* Island Header */}
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <div>
                                                <h3 className="ac-font mb-0 text-dark h4">{island.name}</h3>
                                                <span className="text-muted fw-bold small">{island.type}</span>
                                            </div>
                                            <div className={`status-dot ${statusMeta.dotClass}`} title={statusMeta.aria} />
                                        </div>

                                        {/* Status Button */}
                                        <div className="d-grid gap-2 mb-3">
                                            <div className={`${statusMeta.btn.className} rounded-pill fw-black py-2 d-flex align-items-center justify-content-center`}>
                                                {statusMeta.btn.icon && <i className={`fa-solid ${statusMeta.btn.icon} me-2`} />}
                                                {island.status === "ONLINE" && island.dodoCode && island.dodoCode.length === 5 ? (
                                                    <>
                                                        <i className="fa-regular fa-copy me-2 opacity-50"></i>
                                                        <span className="tracking-widest">{btnText}</span>
                                                    </>
                                                ) : (
                                                    btnText
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Visitor Footer */}
                                    <div className="card-footer bg-white border-0 pb-3 text-center">
                                        <div className="progress mx-auto" style={{ height: 8, width: "80%", borderRadius: 10 }}>
                                            <div className={`progress-bar ${island.visitors >= 6 ? "bg-danger" : "bg-success"}`} style={{ width: `${pct}%` }} />
                                        </div>
                                        <span className={`x-small fw-bold mt-2 d-block ${island.visitors >= 7 ? 'text-danger' : 'text-muted'}`}>
                                            {island.visitors >= 7 ? "FULL" : `${island.visitors} / 7 Villagers`}
                                        </span>
                                    </div>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;700;800;900&display=swap');

                .nook-bg {
                    background-color: #f2f4e6;
                    background-image: radial-gradient(#dce2c8 15%, transparent 16%);
                    background-size: 30px 30px;
                }
                .ac-font { font-family: 'Fredoka One', cursive; letter-spacing: 0.5px; }
                .fw-black { font-weight: 900; }
                .x-small { font-size: 0.7rem; letter-spacing: 0.5px; }
                .tracking-widest { letter-spacing: 2px; }

                .btn-ac { background-color: #fff; border: 2px solid #e0e0e0; color: #aaa; transition: all 0.2s; }
                .btn-ac.active { background-color: #7dd181; border-color: #5faf63; color: #fff; box-shadow: 0 4px 0 #4ca350; transform: translateY(-2px); }

                .btn-nook-primary { background-color: #88e0a0; color: white; border: 2px solid white; box-shadow: 0 4px 0 #6dbd83; }
                .btn-nook-primary:hover { background-color: #76d490; color: white; }

                .ac-card { border-radius: 24px; transition: transform 0.2s ease; cursor: pointer; }
                .ac-card:hover { transform: scale(1.02); }
                .ring-2 { border: 4px solid #28a745 !important; }

                .grayscale { filter: grayscale(100%); }
                .status-dot { width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.1); }
                
                .theme-pink { background-color: #ffd6e5; color: #ff69b4; }
                .theme-teal { background-color: #cafff5; color: #008080; }
                .theme-purple { background-color: #e5d6ff; color: #6a5acd; }
                .theme-gold { background-color: #fff5c2; color: #b8860b; }

                .animate-up { animation: fadeInUp 0.5s ease forwards; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default TreasureIslands;