import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ISLANDS_DATA, type IslandData, type IslandCategory, type IslandStatus } from "../data/islands";

type SearchMode = "FILTER" | "ITEM" | "VILLAGER";
type FilterKey = "ALL" | IslandCategory;

interface ApiIsland {
    dodo: string;
    name: string;
    status: string;
    type: string;
    visitors: string;
}

interface FinderResponse {
    found: boolean;
    query: string;
    results?: {
        free: string[];
        sub: string[];
    };
}

interface FilterTab {
    key: FilterKey;
    label: string;
    icon: string;
}

interface StatusMeta {
    dotClass: string;
    textClass: string;
    btn: {
        className: string;
        text: string;
        icon: string | null;
        disabled: boolean;
    };
    cardClass: string;
    aria: string;
}

const getIslandMap = (islandName: string) => `/maps/${islandName.toLowerCase()}.png`;

const parseVisitors = (raw: string): number => {
    if (!raw) return 0;
    const clean = raw.toUpperCase();
    if (clean.includes("FULL")) return 7;
    const match = clean.match(/(\d+)/);
    return match ? Math.max(0, Math.min(7, parseInt(match[0], 10))) : 0;
};

const FILTERS: FilterTab[] = [
    { key: "ALL", label: "All Islands", icon: "fa-globe" },
    { key: "public", label: "Free Access", icon: "fa-lock-open" },
    { key: "member", label: "VIP Only", icon: "fa-crown" },
];

const STATUS_CONFIG: Record<IslandStatus, StatusMeta> = {
    ONLINE: {
        dotClass: "bg-success pulse-ring",
        textClass: "text-success",
        btn: { className: "btn-nook", text: "REVEAL CODE", icon: "fa-eye", disabled: false },
        cardClass: "border-success-subtle",
        aria: "Online",
    },
    "SUB ONLY": {
        dotClass: "bg-warning",
        textClass: "text-warning",
        btn: { className: "btn-sub", text: "SUB ONLY", icon: "fa-lock", disabled: false },
        cardClass: "border-warning-subtle",
        aria: "Subscriber only",
    },
    REFRESHING: {
        dotClass: "bg-secondary",
        textClass: "text-muted",
        btn: { className: "btn-disabled", text: "REFRESHING...", icon: "fa-arrows-rotate", disabled: true },
        cardClass: "opacity-75 grayscale-sm",
        aria: "Refreshing",
    },
    OFFLINE: {
        dotClass: "bg-danger",
        textClass: "text-danger",
        btn: { className: "btn-disabled", text: "OFFLINE", icon: "fa-power-off", disabled: true },
        cardClass: "opacity-60 grayscale",
        aria: "Offline",
    },
};

const TreasureIslands = () => {
    const navigate = useNavigate();

    const [islands, setIslands] = useState<IslandData[]>(() =>
        ISLANDS_DATA.map(i => ({ ...i, mapUrl: i.mapUrl || getIslandMap(i.name) }))
    );

    const [loading, setLoading] = useState<boolean>(true);
    const [filter, setFilter] = useState<FilterKey>("ALL");

    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [selectedMap, setSelectedMap] = useState<IslandData | null>(null);

    const [search, setSearch] = useState<string>("");
    const [searchMode, setSearchMode] = useState<SearchMode>("FILTER");
    const [isFinderLoading, setIsFinderLoading] = useState(false);
    const [finderResults, setFinderResults] = useState<string[] | null>(null);
    const [lastQuery, setLastQuery] = useState("");

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await fetch("https://dodo.chopaeng.com/api/islands");
                if (!response.ok) throw new Error("Network response was not ok");
                const apiData: ApiIsland[] = await response.json();

                setIslands(currentData => {
                    // Create a NEW array. Do not mutate.
                    return currentData.map((staticIsland, index) => {
                        const liveData = apiData.find((api) =>
                            api.name.toUpperCase() === staticIsland.name.toUpperCase()
                        );

                        // Force a unique ID if it doesn't exist
                        const uniqueId = staticIsland.id || `island-${index}`;

                        if (liveData) {
                            let computedStatus: IslandStatus = "OFFLINE";
                            if (["SUB ONLY", "PATREON"].some(k => liveData.status.includes(k))) computedStatus = "SUB ONLY";
                            else if (liveData.dodo === "GETTIN'") computedStatus = "REFRESHING";
                            else if (liveData.status === "ONLINE") computedStatus = "ONLINE";
                            else if (liveData.status === "REFRESHING") computedStatus = "REFRESHING";

                            return {
                                ...staticIsland,
                                id: uniqueId, // Ensure ID is set
                                status: computedStatus,
                                dodoCode: liveData.dodo,
                                visitors: parseVisitors(liveData.visitors),
                            };
                        }

                        // Return a fresh object even if offline
                        return { ...staticIsland, id: uniqueId, status: "OFFLINE", visitors: 0 };
                    });
                });
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

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") setSelectedMap(null);
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);

    const executeFinderSearch = async () => {
        if (!search.trim()) return;

        setIsFinderLoading(true);
        setLastQuery(search);
        setFinderResults(null);

        try {
            const endpoint = searchMode === 'ITEM' ? 'find' : 'villager';
            const response = await fetch(`https://acnh-finder.chopaeng.com/api/${endpoint}?q=${encodeURIComponent(search)}`);
            if (!response.ok) throw new Error("Search failed");

            const data: FinderResponse = await response.json();

            if (data.found && data.results) {
                const allFound = [...(data.results.free || []), ...(data.results.sub || [])].map(n => n.toUpperCase());
                setFinderResults(allFound);
            } else {
                setFinderResults([]);
            }
        } catch (error) {
            console.error(error);
            setFinderResults([]);
        } finally {
            setIsFinderLoading(false);
        }
    };

    const filteredData = useMemo(() => {
        let data = [...islands];

        if (filter !== "ALL") {
            data = data.filter((island) => island.cat === filter.toLowerCase());
        }

        if (searchMode === "FILTER") {
            const q = search.trim().toLowerCase();
            if (q) {
                data = data.filter((island) =>
                    island.name.toLowerCase().includes(q) ||
                    island.type.toLowerCase().includes(q) ||
                    island.items.some(item => item.toLowerCase().includes(q))
                );
            }
        } else if (finderResults !== null) {
            data = data.filter(island => finderResults.includes(island.name.toUpperCase()));
        }

        const seen = new Set();
        return data.filter(island => {
            const duplicate = seen.has(island.id);
            seen.add(island.id);
            return !duplicate;
        });
    }, [filter, search, islands, searchMode, finderResults]);

    const onCopyCode = (island: IslandData, code: string) => {
        if (code === "GETTIN'" || code === "....." || code === "SUB ONLY") return;

        navigator.clipboard.writeText(code);
        setCopiedId(island.name);
        setTimeout(() => setCopiedId(null), 2000);
    };

// Update this function
    const handleModeSwitch = (mode: SearchMode) => {
        setSearchMode(mode);
        setSearch("");
        setFinderResults(null); // Clear the API results immediately
        setLastQuery("");
    };

// Add this useEffect to handle manual clearing of the search bar
    useEffect(() => {
        if (search === "" && searchMode !== "FILTER") {
            setFinderResults(null);
        }
    }, [search, searchMode]);
    return (
        <div className="nook-bg min-vh-100 py-5 font-nunito">
            <div className="container px-md-4">

                {/* --- HEADER / CONTROL CENTER --- */}
                <div className="control-center card border-0 shadow-lg rounded-5 mb-5 overflow-hidden position-relative z-2">
                    <div className="card-body p-4 p-lg-5">

                        <div className="text-center mb-4">
                            <h2 className="ac-font display-6 text-dark mb-1">Island Monitor</h2>
                            <p className="text-muted fw-bold small">Live Status • Dodo Codes • Item Finder</p>
                        </div>

                        {/* Category Tabs */}
                        <div className="d-flex justify-content-center gap-3 mb-4">
                            {FILTERS.map((t) => (
                                <button
                                    key={t.key}
                                    onClick={() => setFilter(t.key)}
                                    className={`filter-tab d-flex align-items-center gap-2 ${filter === t.key ? "active" : ""}`}
                                >
                                    <i className={`fa-solid ${t.icon}`}></i>
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        {/* Search Area */}
                        <div className="search-container mx-auto" style={{ maxWidth: '650px' }}>
                            {/* Mode Toggle */}
                            <div className="mode-toggle p-1 bg-light rounded-pill d-flex mb-3 border">
                                <button
                                    onClick={() => handleModeSwitch("FILTER")}
                                    className={`flex-fill btn rounded-pill fw-bold small py-2 transition-all ${searchMode === "FILTER" ? "bg-white shadow-sm text-dark" : "text-muted"}`}
                                >
                                    Filter
                                </button>
                                <button
                                    onClick={() => handleModeSwitch("ITEM")}
                                    className={`flex-fill btn rounded-pill fw-bold small py-2 transition-all ${searchMode === "ITEM" ? "bg-success text-white shadow-sm" : "text-muted"}`}
                                >
                                    Find Item
                                </button>
                                <button
                                    onClick={() => handleModeSwitch("VILLAGER")}
                                    className={`flex-fill btn rounded-pill fw-bold small py-2 transition-all ${searchMode === "VILLAGER" ? "bg-info text-white shadow-sm" : "text-muted"}`}
                                >
                                    Find Villager
                                </button>
                            </div>

                            {/* Search Input */}
                            <div className="input-group input-group-lg shadow-sm rounded-pill overflow-hidden border border-2 border-light focus-within-green">
                                <span className="input-group-text bg-white border-0 ps-4">
                                    {isFinderLoading ? (
                                        <i className="fa-solid fa-circle-notch fa-spin text-success" />
                                    ) : (
                                        <i className={`fa-solid ${searchMode === 'VILLAGER' ? 'fa-user-tag text-info' : searchMode === 'ITEM' ? 'fa-leaf text-success' : 'fa-magnifying-glass text-muted'}`} />
                                    )}
                                </span>

                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            if (searchMode !== 'FILTER') {
                                                executeFinderSearch();
                                            }
                                        }
                                    }}
                                    className="form-control border-0 shadow-none fw-bold text-dark"
                                    placeholder={
                                        searchMode === "FILTER" ? "Filter list by name, theme..." :
                                            searchMode === "ITEM" ? "Type item name (e.g. Royal Crown)..." :
                                                "Type villager name (e.g. Raymond)..."
                                    }
                                />

                                {search.length > 0 && (
                                    <button className="btn btn-white border-0 text-muted pe-3" onClick={() => { setSearch(""); setFinderResults(null); }}>
                                        <i className="fa-solid fa-xmark" />
                                    </button>
                                )}

                                {searchMode !== "FILTER" && (
                                    <button className="btn btn-nook px-4 fw-black border-0 rounded-0" onClick={executeFinderSearch}>
                                        GO
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- FEEDBACK AREA --- */}
                {searchMode !== "FILTER" && finderResults !== null && (
                    <div className="text-center mb-5 animate-up">
                        {finderResults.length > 0 ? (
                            <div className="d-inline-flex align-items-center bg-white border border-success border-2 text-success px-5 py-3 rounded-pill shadow fw-bold">
                                <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: 30, height: 30}}>
                                    <i className="fa-solid fa-check"></i>
                                </div>
                                <span>Found <span className="text-dark text-uppercase mx-1">{lastQuery}</span> on {finderResults.length} islands!</span>
                            </div>
                        ) : (
                            <div className="d-inline-flex align-items-center bg-white border border-danger border-2 text-danger px-5 py-3 rounded-pill shadow fw-bold">
                                <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: 30, height: 30}}>
                                    <i className="fa-solid fa-xmark"></i>
                                </div>
                                <span>Sorry, <span className="text-dark text-uppercase mx-1">{lastQuery}</span> is not available right now.</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Empty State */}
                {!loading && filteredData.length === 0 && (
                    <div className="empty-state text-center py-5">
                        <div className="mb-3 opacity-50">
                            <i className="fa-solid fa-map-location-dot display-1 text-muted"></i>
                        </div>
                        <h4 className="fw-bold text-muted">No islands found</h4>
                        <p className="text-muted opacity-75">Try adjusting your filters or search query.</p>
                    </div>
                )}

                {/* --- ISLAND GRID --- */}
                <div className="row g-4 justify-content-center">
                    {filteredData.map((island) => {
                        const statusMeta = STATUS_CONFIG[island.status] || STATUS_CONFIG["OFFLINE"];

                        const isMatch = finderResults && finderResults.includes(island.name.toUpperCase());

                        const hasCode = island.status === "ONLINE" && island.dodoCode && island.dodoCode.length === 5;
                        const btnText = hasCode ? island.dodoCode : statusMeta.btn.text;
                        const isCopied = copiedId === island.name;

                        const pct = (island.visitors / 7) * 100;
                        const isFull = island.visitors >= 7;

                        return (
                            <div key={`${island.id}-${island.cat}`} className="col-xl-3 col-lg-4 col-md-6">
                                <div
                                    className={`island-card card h-100 border-0 shadow-sm overflow-hidden position-relative 
                                 ${statusMeta.cardClass} ${isMatch ? "match-highlight" : ""}`}
                                    role="button"
                                    tabIndex={0}
                                    onClick={(e) => {
                                        if ((e.target as HTMLElement).closest("button, a")) return;
                                        navigate(`/island/${island.id}`);
                                    }}
                                >

                                    {isMatch && (
                                        <div className="position-absolute top-0 start-0 w-100 bg-warning text-dark text-center fw-black x-small py-1 z-2 shadow-sm">
                                            <i className="fa-solid fa-star me-1"></i> ITEM FOUND HERE
                                        </div>
                                    )}

                                    {/* Card Header */}
                                    <div className={`card-header bg-white border-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-start ${isMatch ? 'mt-4' : ''}`}>
                                        <div>
                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                <span className={`status-dot ${statusMeta.dotClass}`}></span>
                                                <span className={`x-small fw-bold ${statusMeta.textClass}`}>{island.status}</span>
                                            </div>
                                            <h3 className="ac-font mb-0 text-dark h4">{island.name}</h3>
                                            <span className="text-muted fw-bold x-small text-uppercase">{island.type}</span>
                                        </div>

                                        <div className="d-flex gap-2">
                                            <button
                                                className="btn btn-light rounded-circle border d-flex align-items-center justify-content-center shadow-sm"
                                                style={{width: 40, height: 40}}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedMap(island);
                                                }}
                                                title="View Map"
                                            >
                                                <i className="fa-regular fa-map text-muted"></i>
                                            </button>

                                            <div className={`theme-badge rounded-circle d-flex align-items-center justify-content-center theme-${island.theme}`} title={`${island.seasonal} Season`}>
                                                <i className="fa-solid fa-leaf"></i>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Body */}
                                    <div className="card-body p-4 pt-3">

                                        <div className="d-flex flex-wrap gap-1 mb-4">
                                            {island.items.slice(0, 4).map((item) => (
                                                <span key={item} className="badge bg-light text-dark fw-bold border border-light-subtle rounded-pill px-2 py-1 x-small">
                                                    {item}
                                                </span>

                                            ))}

                                            {island.items.length > 4 && (
                                                <span className="loot-pill more badge bg-light text-dark fw-bold border border-light-subtle rounded-pill px-2 py-1 x-small">+{island.items.length - 4}</span>
                                            )}
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                hasCode && onCopyCode(island, island.dodoCode!);
                                            }}
                                            disabled={statusMeta.btn.disabled}
                                            className={`btn w-100 rounded-pill fw-black py-2 mb-3 position-relative overflow-hidden transition-all ${isCopied ? 'btn-success' : statusMeta.btn.className}`}
                                        >
                                            <div className="d-flex align-items-center justify-content-center gap-2">
                                                {isCopied ? (
                                                    <>
                                                        <i className="fa-solid fa-check"></i> COPIED!
                                                    </>
                                                ) : (
                                                    <>
                                                        {hasCode && <i className="fa-regular fa-copy opacity-50"></i>}
                                                        {!hasCode && statusMeta.btn.icon && <i className={`fa-solid ${statusMeta.btn.icon}`}></i>}
                                                        <span className={hasCode ? "dodo-text" : ""}>{btnText}</span>
                                                    </>
                                                )}
                                            </div>
                                        </button>

                                        <div className="visitor-meter">
                                            <div className="d-flex justify-content-between align-items-end mb-1">
                                                <span className="x-small fw-bold text-muted">Capacity</span>
                                                <span className={`x-small fw-black ${isFull ? 'text-danger' : 'text-success'}`}>
                                                    {isFull ? 'FULL' : `${island.visitors}/7`}
                                                </span>
                                            </div>
                                            <div className="progress rounded-pill bg-light" style={{height: '6px'}}>
                                                <div
                                                    className={`progress-bar rounded-pill ${isFull ? 'bg-danger' : 'bg-success'}`}
                                                    style={{width: `${pct}%`, transition: 'width 0.5s ease'}}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* --- MAP MODAL --- */}
            {selectedMap && (
                <div className="modal-overlay d-flex align-items-center justify-content-center" onClick={() => setSelectedMap(null)}>
                    <div
                        className="modal-content-card bg-white rounded-5 shadow-lg overflow-hidden position-relative p-0"
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxWidth: '800px', width: '90%' }}
                    >
                        <div className="p-3 d-flex justify-content-between align-items-center bg-light border-bottom">
                            <div className="d-flex align-items-center gap-2">
                                <div className={`theme-badge rounded-circle d-flex align-items-center justify-content-center theme-${selectedMap.theme}`} style={{width: 32, height: 32, fontSize: '0.9rem'}}>
                                    <i className="fa-solid fa-leaf"></i>
                                </div>
                                <h4 className="ac-font m-0 text-dark">{selectedMap.name} Map</h4>
                            </div>
                            <button className="btn btn-sm btn-light border rounded-circle" onClick={() => setSelectedMap(null)}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <div className="map-container bg-dark text-center">
                            <img
                                src={selectedMap.mapUrl}
                                alt={`${selectedMap.name} Map`}
                                className="img-fluid"
                                style={{ maxHeight: '70vh', objectFit: 'contain' }}
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
                        </div>

                        <div className="p-3 bg-white d-flex justify-content-between align-items-center">
                            <span className="fw-bold text-muted small">{selectedMap.seasonal} Season</span>
                            <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill">
                                {selectedMap.type}
                             </span>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap');

                :root {
                    --nook-green: #7dd181;
                    --nook-dark: #5faf63;
                    --nook-bg: #f2f4e6;
                }
                .font-nunito { font-family: 'Nunito', sans-serif; }
                .ac-font { font-family: 'Fredoka One', cursive; letter-spacing: 0.5px; }
                .fw-black { font-weight: 900; }
                .x-small { font-size: 0.75rem; }

                .nook-bg {
                    background-color: var(--nook-bg);
                    background-image: radial-gradient(#dce2c8 15%, transparent 16%);
                    background-size: 30px 30px;
                }

                /* --- MODAL --- */
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.6);
                    backdrop-filter: blur(8px);
                    z-index: 1050;
                    animation: fadeIn 0.3s ease;
                }
                .modal-content-card {
                    animation: slideUpFade 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUpFade { 
                    from { opacity: 0; transform: translateY(50px) scale(0.9); } 
                    to { opacity: 1; transform: translateY(0) scale(1); } 
                }

                /* --- CONTROL CENTER --- */
                .control-center {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.5);
                }

                .filter-tab {
                    background: transparent;
                    border: 2px solid transparent;
                    border-radius: 50px;
                    padding: 8px 20px;
                    font-weight: 800;
                    color: #aaa;
                    transition: all 0.2s;
                }
                .filter-tab:hover { background: rgba(0,0,0,0.03); color: #888; }
                .filter-tab.active {
                    background: white;
                    color: var(--nook-dark);
                    border-color: var(--nook-green);
                    box-shadow: 0 4px 15px rgba(125, 209, 129, 0.2);
                    transform: translateY(-2px);
                }

                .focus-within-green:focus-within {
                    border-color: var(--nook-green) !important;
                    box-shadow: 0 0 0 4px rgba(125, 209, 129, 0.2) !important;
                }

                /* --- CARDS --- */
                .island-card {
                    border-radius: 28px;
                    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease;
                    background: #fff;
                }
                .island-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 15px 30px rgba(0,0,0,0.08) !important;
                    z-index: 10;
                }

                .match-highlight {
                    border: 3px solid #ffc107 !important;
                    box-shadow: 0 0 30px rgba(255, 193, 7, 0.3) !important;
                }

                /* --- BUTTONS --- */
                .btn-nook {
                    background-color: #88e0a0;
                    color: white;
                    border: 2px solid #88e0a0;
                    box-shadow: 0 4px 0 #6dbd83;
                }
                .btn-nook:hover {
                    background-color: #76d490;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 0 #6dbd83;
                    color: white;
                }
                .btn-nook:active {
                    transform: translateY(2px);
                    box-shadow: 0 0 0 #6dbd83;
                }

                .btn-sub {
                    background-color: #fff3cd;
                    color: #856404;
                    border: 2px solid #ffeeba;
                }
                
                .btn-disabled {
                    background-color: #f8f9fa;
                    color: #adb5bd;
                    border: 2px solid #e9ecef;
                    cursor: not-allowed;
                }

                .dodo-text { letter-spacing: 2px; font-size: 1.1rem; }

                /* --- MISC --- */
                .status-dot {
                    width: 10px; height: 10px; border-radius: 50%; display: inline-block;
                }
                .pulse-ring {
                    box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7);
                    animation: pulse-green 2s infinite;
                }
                @keyframes pulse-green {
                    0% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.4); }
                    70% { box-shadow: 0 0 0 6px rgba(40, 167, 69, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0); }
                }

                .theme-badge { width: 40px; height: 40px; color: white; font-size: 1.2rem; }
                .theme-pink { background: #ffb7ce; }
                .theme-teal { background: #88e0d0; }
                .theme-purple { background: #d0bfff; }
                .theme-gold { background: #f0c040; }

                .grayscale { filter: grayscale(100%); }
                .grayscale-sm { filter: grayscale(80%); }

                .animate-up { animation: fadeInUp 0.5s ease forwards; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                
                .transition-all { transition: all 0.2s ease; }
                  .loot-pill {
                    background: #f0f2f5; color: #666;
                    padding: 4px 10px; border-radius: 8px;
                    font-size: 0.75rem; font-weight: 700;
                }
                .loot-pill.more { background: var(--dal-yellow); color: #5a4a1b; }
            `}</style>
        </div>
    );
};

export default TreasureIslands;