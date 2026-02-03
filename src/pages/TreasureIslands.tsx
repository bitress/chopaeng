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
    badgeClass: string; // Added for layout
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
        badgeClass: "bg-success-subtle text-success border-success-subtle",
        btn: { className: "btn-nook", text: "REVEAL CODE", icon: "fa-eye", disabled: false },
        cardClass: "border-success-subtle shadow-sm",
        aria: "Online",
    },
    "SUB ONLY": {
        dotClass: "bg-warning",
        textClass: "text-warning",
        badgeClass: "bg-warning-subtle text-warning-emphasis border-warning-subtle",
        btn: { className: "btn-sub", text: "SUB ONLY", icon: "fa-lock", disabled: false },
        cardClass: "border-warning-subtle shadow-sm",
        aria: "Subscriber only",
    },
    REFRESHING: {
        dotClass: "bg-secondary",
        textClass: "text-muted",
        badgeClass: "bg-secondary-subtle text-secondary border-secondary-subtle",
        btn: { className: "btn-disabled", text: "REFRESHING...", icon: "fa-arrows-rotate", disabled: true },
        cardClass: "opacity-75 grayscale-sm border-light",
        aria: "Refreshing",
    },
    OFFLINE: {
        dotClass: "bg-danger",
        textClass: "text-danger",
        badgeClass: "bg-danger-subtle text-danger border-danger-subtle",
        btn: { className: "btn-disabled", text: "OFFLINE", icon: "fa-power-off", disabled: true },
        cardClass: "opacity-60 grayscale border-light",
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
                    return currentData.map((staticIsland, index) => {
                        const liveData = apiData.find((api) =>
                            api.name.toUpperCase() === staticIsland.name.toUpperCase()
                        );

                        const uniqueId = staticIsland.id || `island-${index}`;

                        if (liveData) {
                            let computedStatus: IslandStatus = "OFFLINE";
                            if (["SUB ONLY", "PATREON"].some(k => liveData.status.includes(k))) computedStatus = "SUB ONLY";
                            else if (liveData.dodo === "GETTIN'") computedStatus = "REFRESHING";
                            else if (liveData.status === "ONLINE") computedStatus = "ONLINE";
                            else if (liveData.status === "REFRESHING") computedStatus = "REFRESHING";

                            return {
                                ...staticIsland,
                                id: uniqueId,
                                status: computedStatus,
                                dodoCode: liveData.dodo,
                                visitors: parseVisitors(liveData.visitors),
                            };
                        }
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

    const handleModeSwitch = (mode: SearchMode) => {
        setSearchMode(mode);
        setSearch("");
        setFinderResults(null);
        setLastQuery("");
    };

    useEffect(() => {
        if (search === "" && searchMode !== "FILTER") {
            setFinderResults(null);
        }
    }, [search, searchMode]);

    useEffect(() => {
        const site = window.location.origin;
        const url = `${site}/treasure-islands`;

        const title =
            filter === "ALL"
                ? "Live Animal Crossing Treasure Islands Dashboard | Chopaeng"
                : filter === "public"
                    ? "Free Animal Crossing Treasure Islands Dashboard | Chopaeng"
                    : "VIP Animal Crossing Treasure Islands Dashboard | Chopaeng";

        const desc = "Track live Animal Crossing Treasure Islands with real-time Dodo codes...";
        document.title = title;

        let meta = document.querySelector('meta[name="description"]');
        if (!meta) {
            meta = document.createElement("meta");
            meta.setAttribute("name", "description");
            document.head.appendChild(meta);
        }
        meta.setAttribute("content", desc);

        let link = document.querySelector('link[rel="canonical"]');
        if (!link) {
            link = document.createElement("link");
            link.setAttribute("rel", "canonical");
            document.head.appendChild(link);
        }
        link.setAttribute("href", url);
    }, [filter]);

    return (
        <div className="nook-bg min-vh-100 font-nunito pb-5">
            {/* --- DASHBOARD HEADER --- */}
            <div className="bg-white shadow-sm border-bottom position-relative z-3">
                <div className="container py-4">
                    <div className="row align-items-center gy-4">
                        {/* Title Section */}
                        <div className="col-lg-4 text-center text-lg-start">
                            <h1 className="ac-font h3 text-dark mb-1">
                                <i className="fa-solid fa-plane-departure text-success me-2"></i>
                                Island Monitor
                            </h1>
                            <p className="text-muted small fw-bold mb-0">Live Dodo Codes & Item Finder</p>
                        </div>

                        {/* Search & Mode Section */}
                        <div className="col-lg-8">
                            <div className="d-flex flex-column flex-md-row gap-3 justify-content-lg-end">

                                {/* Search Mode Switcher (Segmented) */}
                                <div className="bg-light rounded-pill p-1 d-flex border" style={{ minWidth: '280px' }}>
                                    {(['FILTER', 'ITEM', 'VILLAGER'] as SearchMode[]).map((m) => (
                                        <button
                                            key={m}
                                            onClick={() => handleModeSwitch(m)}
                                            className={`flex-fill btn btn-sm rounded-pill fw-bold transition-all ${
                                                searchMode === m
                                                    ? "bg-white text-dark shadow-sm"
                                                    : "text-muted border-0"
                                            }`}
                                        >
                                            {m === 'FILTER' ? 'Filter' : m === 'ITEM' ? 'Item' : 'Villager'}
                                        </button>
                                    ))}
                                </div>

                                {/* Search Input */}
                                <div className="input-group rounded-pill overflow-hidden border focus-within-green" style={{ maxWidth: '400px', width: '100%' }}>
                                    <span className="input-group-text bg-white border-0 ps-3">
                                        {isFinderLoading ? (
                                            <i className="fa-solid fa-circle-notch fa-spin text-success" />
                                        ) : (
                                            <i className={`fa-solid ${searchMode === 'VILLAGER' ? 'fa-user-tag text-info' : searchMode === 'ITEM' ? 'fa-leaf text-success' : 'fa-magnifying-glass text-muted'}`} />
                                        )}
                                    </span>
                                    <input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter' && searchMode !== 'FILTER') executeFinderSearch(); }}
                                        className="form-control border-0 shadow-none fw-bold"
                                        placeholder={searchMode === "FILTER" ? "Search islands..." : searchMode === "ITEM" ? "Find items..." : "Find villagers..."}
                                    />
                                    {(searchMode !== "FILTER" && search) && (
                                        <button className="btn btn-nook fw-bold px-3 border-start" onClick={executeFinderSearch}>
                                            GO
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="container py-4">

                {/* Filter Tabs (Pills Layout) */}
                <div className="d-flex justify-content-center justify-content-lg-start gap-2 mb-4 overflow-x-auto pb-2">
                    {FILTERS.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setFilter(t.key)}
                            className={`btn rounded-pill px-4 fw-bold d-flex align-items-center gap-2 border transition-all ${
                                filter === t.key
                                    ? "btn-dark border-dark"
                                    : "bg-white text-muted border-white hover-shadow"
                            }`}
                        >
                            <i className={`fa-solid ${t.icon}`}></i> {t.label}
                        </button>
                    ))}
                </div>

                {/* Feedback Messages */}
                {searchMode !== "FILTER" && finderResults !== null && (
                    <div className="mb-4 animate-up">
                        {finderResults.length > 0 ? (
                            <div className="alert alert-success border-success d-flex align-items-center gap-3 shadow-sm rounded-4" role="alert">
                                <i className="fa-solid fa-circle-check fs-4"></i>
                                <div>Found <strong>{lastQuery}</strong> on {finderResults.length} islands! Look for the highlighted cards.</div>
                            </div>
                        ) : (
                            <div className="alert alert-danger border-danger d-flex align-items-center gap-3 shadow-sm rounded-4" role="alert">
                                <i className="fa-solid fa-circle-xmark fs-4"></i>
                                <div>Sorry, <strong>{lastQuery}</strong> is not available on any island right now.</div>
                            </div>
                        )}
                    </div>
                )}

                {/* Empty State */}
                {!loading && filteredData.length === 0 && (
                    <div className="text-center py-5 opacity-75">
                        <i className="fa-solid fa-map-location-dot display-1 text-secondary mb-3"></i>
                        <h3 className="h5 text-muted fw-bold">No islands found</h3>
                        <p className="small">Try adjusting your filters or search terms.</p>
                    </div>
                )}

                {/* --- ISLANDS GRID --- */}
                <div className="row g-4">
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
                                    className={`card h-100 border transition-all hover-lift overflow-hidden ${statusMeta.cardClass} ${isMatch ? "ring-2 ring-warning" : ""}`}
                                    style={{ borderRadius: '1.25rem' }}
                                    onClick={(e) => {
                                        if ((e.target as HTMLElement).closest("button, a")) return;
                                        navigate(`/island/${island.id}`);
                                    }}
                                >
                                    {isMatch && (
                                        <div className="bg-warning text-dark text-center fw-bold small py-1">
                                            <i className="fa-solid fa-star me-1"></i> MATCH FOUND
                                        </div>
                                    )}

                                    <div className="card-body p-3 d-flex flex-column h-100">

                                        {/* Top Row: Status & Theme */}
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <div className={`badge rounded-pill border px-3 py-2 d-flex align-items-center gap-2 ${statusMeta.badgeClass}`}>
                                                <span className={`status-dot ${statusMeta.dotClass}`}></span>
                                                <span className="fw-bold x-small tracking-wide">{island.status}</span>
                                            </div>

                                            <div className="d-flex gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setSelectedMap(island); }}
                                                    className="btn btn-sm btn-light border rounded-circle shadow-sm"
                                                    title="View Map"
                                                    style={{ width: 32, height: 32 }}
                                                >
                                                    <i className="fa-regular fa-map text-muted small"></i>
                                                </button>
                                                <div
                                                    className={`theme-badge rounded-circle d-flex align-items-center justify-content-center theme-${island.theme} border shadow-sm`}
                                                    style={{ width: 32, height: 32, fontSize: '0.8rem' }}
                                                    title={`${island.seasonal} Season`}
                                                >
                                                    <i className="fa-solid fa-leaf"></i>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Island Info */}
                                        <div className="mb-4">
                                            <h3 className="ac-font h4 text-dark mb-1 text-truncate" title={island.name}>{island.name}</h3>
                                            <div className="d-flex align-items-center gap-2">
                                                <span className="badge bg-light text-secondary border fw-bold x-small text-uppercase tracking-wide">{island.type}</span>
                                            </div>
                                        </div>

                                        {/* Spacer to push content down */}
                                        <div className="mt-auto">

                                            {/* Item Tags (Limited) */}
                                            <div className="d-flex flex-wrap gap-1 mb-4">
                                                {island.items
                                                    .slice(0, 3)
                                                    .map((item) => (
                                                        <span
                                                            key={item}
                                                            className="badge bg-light text-dark fw-bold border border-light-subtle rounded-pill px-2 py-1 x-small"
                                                        >{item}</span>
                                                    ))}

                                                {island.items.length > 3 && (
                                                    <span className="loot-pill more badge bg-light text-dark fw-bold border border-light-subtle rounded-pill px-2 py-1 x-small">+{island.items.length - 4}</span>
                                                )}
                                            </div>

                                            {/* Visitor Progress */}
                                            <div className="mb-3">
                                                <div className="d-flex justify-content-between align-items-end mb-1">
                                                    <span className="x-small fw-bold text-muted text-uppercase">Visitors</span>
                                                    <span className={`x-small fw-black ${isFull ? 'text-danger' : 'text-success'}`}>
                                                        {isFull ? 'FULL' : `${island.visitors}/7`}
                                                    </span>
                                                </div>
                                                <div className="progress rounded-pill bg-secondary-subtle" style={{ height: '8px' }}>
                                                    <div
                                                        className={`progress-bar rounded-pill ${isFull ? 'bg-danger' : 'bg-success'}`}
                                                        style={{ width: `${pct}%`, transition: 'width 0.5s ease' }}
                                                    ></div>
                                                </div>
                                            </div>

                                            {/* Action Button */}
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
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* --- MAP MODAL (Unchanged Logic / Minor Style Tweak) --- */}
            {selectedMap && (
                <div className="modal-overlay d-flex align-items-center justify-content-center p-3" onClick={() => setSelectedMap(null)} style={{ backdropFilter: 'blur(5px)' }}>
                    <div
                        className="modal-content bg-white rounded-5 shadow-lg overflow-hidden border-0 animate-up"
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxWidth: '700px', width: '100%' }}
                    >
                        <div className="p-3 bg-light border-bottom d-flex justify-content-between align-items-center">
                            <h5 className="ac-font m-0 text-dark ps-2">{selectedMap.name} Map</h5>
                            <button className="btn btn-sm btn-white border shadow-sm rounded-circle" onClick={() => setSelectedMap(null)}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        <div className="p-0 bg-dark position-relative d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                            <img
                                src={selectedMap.mapUrl}
                                alt={`${selectedMap.name} Map`}
                                className="img-fluid"
                                style={{ maxHeight: '70vh', objectFit: 'contain' }}
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    if (target.src.includes('.png')) target.src = target.src.replace('.png', '.jpg');
                                    else if (target.src.endsWith('.jpg')) target.src = target.src.replace('.jpg', '.jpeg');
                                    else target.src = 'https://www.chopaeng.com/banner.png';
                                }}
                            />
                        </div>
                        <div className="p-3 bg-white d-flex justify-content-between align-items-center">
                            <span className="badge bg-light text-dark border">{selectedMap.seasonal}</span>
                            <span className="badge bg-success-subtle text-success border-success-subtle">{selectedMap.type}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TreasureIslands;