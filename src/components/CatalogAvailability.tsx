import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FINDER_API_BASE } from "../config/api";
import { useIslandData } from "../context/useIslandData";
import type { IslandData, IslandCategory, IslandStatus } from "../data/islands";

type FinderMode = "item" | "villager";

type FinderResponse = {
    found: boolean;
    query: string;
    results?: {
        free?: string[];
        sub?: string[];
        order?: string[];
    };
    suggestions?: string[];
    message?: string;
};

type CatalogAvailabilityProps = {
    mode: FinderMode;
    query: string;
};

type AvailabilityState = {
    data: FinderResponse | null;
    error: string | null;
};

const CACHE_TTL_MS = 5 * 60 * 1000;
const finderCache = new Map<string, { expiresAt: number; value: AvailabilityState }>();

const statusClass: Record<IslandStatus, string> = {
    ONLINE: "bg-success-subtle text-success border-success-subtle",
    "SUB ONLY": "bg-warning-subtle text-warning-emphasis border-warning-subtle",
    REFRESHING: "bg-secondary-subtle text-secondary border-secondary-subtle",
    OFFLINE: "bg-danger-subtle text-danger border-danger-subtle",
};

const categoryMeta: Record<IslandCategory | "sub", { label: string; icon: string; className: string }> = {
    public: { label: "Free", icon: "fa-lock-open", className: "border-success-subtle bg-success-subtle text-success" },
    member: { label: "Member", icon: "fa-crown", className: "border-warning-subtle bg-warning-subtle text-warning-emphasis" },
    order: { label: "Order", icon: "fa-box-open", className: "border-info-subtle bg-info-subtle text-info-emphasis" },
    sub: { label: "Member", icon: "fa-crown", className: "border-warning-subtle bg-warning-subtle text-warning-emphasis" },
};

const normalizeName = (value: string) => value.trim().toLowerCase();

const findIsland = (islands: IslandData[], name: string) => {
    const normalized = normalizeName(name);
    return islands.find((island) =>
        normalizeName(island.name) === normalized ||
        normalizeName(island.canonicalName || "") === normalized ||
        normalizeName(island.id) === normalized
    );
};

const groupLabels: Array<{ key: "free" | "sub" | "order"; label: string; icon: string }> = [
    { key: "free", label: "Free Islands", icon: "fa-lock-open" },
    { key: "sub", label: "Sub Islands", icon: "fa-crown" },
];

const IslandAvailabilityCard = ({ island, name, group }: { island?: IslandData; name: string; group: "free" | "sub" | "order" }) => {
    const meta = island ? categoryMeta[island.cat] : categoryMeta[group === "sub" ? "sub" : group === "free" ? "public" : "order"];
    const visitors = island ? `${island.visitors}/7` : "unknown";

    const content = (
        <div className="h-100 rounded-4 border bg-white p-3 shadow-sm transition-all hover-scale">
            <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
                <div className="min-w-0">
                    <div className="fw-black text-dark text-truncate">{island?.name || name}</div>
                    <div className="tiny-text text-muted text-truncate">{island?.type || "Island match"}</div>
                </div>
                <span className={`badge rounded-pill border ${meta.className}`} title={meta.label}>
                    <i className={`fa-solid ${meta.icon}`}></i>
                    <span className="visually-hidden">{meta.label}</span>
                </span>
            </div>
            <div className="d-flex flex-wrap align-items-center gap-2">
                <span className={`badge rounded-pill border ${island ? statusClass[island.status] : "bg-light text-muted border-light"}`}>
                    {island?.status || "Listed"}
                </span>
                <span className="badge rounded-pill bg-light text-dark border">
                    <i className="fa-solid fa-user-group me-1"></i>{visitors}
                </span>
                {island && (
                    <span className="ms-auto tiny-text text-muted fw-bold d-none d-sm-inline">
                        View <i className="fa-solid fa-chevron-right ms-1 small"></i>
                    </span>
                )}
            </div>
        </div>
    );

    if (!island) return content;

    return (
        <Link to={`/island/${island.id}`} className="text-decoration-none d-block h-100" aria-label={`View details for ${island.name}`}>
            {content}
        </Link>
    );
};

const CatalogAvailability = ({ mode, query }: CatalogAvailabilityProps) => {
    const { islands, loading: islandsLoading } = useIslandData();
    const [lookupQuery, setLookupQuery] = useState(query);
    const [state, setState] = useState<AvailabilityState>({ data: null, error: null });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLookupQuery(query);
    }, [query]);

    const endpoint = mode === "item" ? "find" : "villager";

    const runLookup = useCallback(async (nextQuery: string, force = false) => {
        const trimmed = nextQuery.trim();
        if (!trimmed) return;

        const nextCacheKey = `${mode}:${trimmed.toLowerCase()}`;
        const cached = finderCache.get(nextCacheKey);
        if (!force && cached && cached.expiresAt > Date.now()) {
            setState(cached.value);
            return;
        }

        setLoading(true);
        setState({ data: null, error: null });

        try {
            const response = await fetch(`${FINDER_API_BASE}/api/${endpoint}?q=${encodeURIComponent(trimmed)}`);
            if (!response.ok) throw new Error("Finder request failed");
            const data: FinderResponse = await response.json();
            const nextState = { data, error: null };
            finderCache.set(nextCacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, value: nextState });
            setState(nextState);
        } catch (error) {
            console.error(error);
            const nextState = { data: null, error: "Could not check island availability right now." };
            finderCache.set(nextCacheKey, { expiresAt: Date.now() + 30_000, value: nextState });
            setState(nextState);
        } finally {
            setLoading(false);
        }
    }, [endpoint, mode]);

    useEffect(() => {
        runLookup(query);
    }, [query, runLookup]);

    const groupedResults = useMemo(() => {
        const results = state.data?.results || {};
        return groupLabels.map((group) => ({
            ...group,
            islands: (results[group.key] || []).map((name) => ({
                name,
                island: findIsland(islands, name),
            })),
        }));
    }, [islands, state.data]);

    const foundCount = groupedResults.reduce((sum, group) => sum + group.islands.length, 0);

    return (
        <section className="bg-white rounded-4 border shadow-sm p-4">

            <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4">
                <div>
                    <div className="d-inline-flex align-items-center bg-nook-green text-white rounded-pill px-3 py-1 mb-3 fw-black small shadow-sm">
                        <i className="fa-solid fa-satellite-dish me-2"></i> Live Island Finder
                    </div>
                    <h2 className="ac-font mb-1 text-dark" style={{ fontSize: '1.8rem' }}>Availability Check</h2>
                    <p className="text-muted fw-bold mb-0">Searching for <span className="text-nook">{mode === "item" ? "items" : "villagers"}</span> across the network.</p>
                </div>
                <div className="d-flex flex-wrap gap-2">
                    <button type="button" className="btn btn-white border rounded-pill fw-black px-4 shadow-sm hover-nook" onClick={() => runLookup(lookupQuery, true)} disabled={loading}>
                        <i className={`fa-solid ${loading ? "fa-spinner fa-spin" : "fa-rotate-right"} me-2`}></i> Retry
                    </button>
                    <Link to="/islands" className="btn btn-nook rounded-pill fw-black px-4">
                        View Network <i className="fa-solid fa-arrow-up-right-from-square ms-2 small"></i>
                    </Link>
                </div>
            </div>

            <div className="search-wrapper mb-5 w-100 justify-content-start">
                <div className="search-box w-100 max-w-100 shadow-sm focus-within-green transition-all m-0" style={{ maxWidth: '100%' }}>
                    <i className="fa-solid fa-magnifying-glass search-icon"></i>
                    <input
                        className="font-nunito fw-bold"
                        value={lookupQuery}
                        onChange={(e) => setLookupQuery(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") runLookup(lookupQuery, true); }}
                        placeholder={`Search for a ${mode}...`}
                        aria-label="Availability search"
                    />
                    <button
                        className="btn btn-nook-primary rounded-pill px-4 fw-black border-0 py-2"
                        type="button"
                        onClick={() => runLookup(lookupQuery, true)}
                        disabled={loading || !lookupQuery.trim()}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Searching
                            </>
                        ) : (
                            "Search"
                        )}
                    </button>
                </div>
            </div>

            <div aria-live="polite" aria-busy={loading || islandsLoading}>

                {(loading || islandsLoading) && (
                    <div className="rounded-4 bg-cream p-5 text-center border shadow-sm animate-fade-in" role="status">
                        <i className="fa-solid fa-plane-departure fa-bounce fa-2x mb-3 text-nook-green"></i>
                        <div className="ac-font fs-5 text-dark">Contacting Orville...</div>
                        <div className="small text-muted fw-bold mt-1">Scanning the skies for {lookupQuery || "matches"}</div>
                        <div className="progress mt-3 mx-auto rounded-pill" style={{ maxWidth: '220px', height: '6px' }}>
                            <div
                                className="progress-bar progress-bar-striped progress-bar-animated bg-nook-green rounded-pill"
                                role="progressbar"
                                style={{ width: '100%' }}
                                aria-valuenow={100}
                                aria-valuemin={0}
                                aria-valuemax={100}
                            ></div>
                        </div>
                    </div>
                )}

                {!loading && state.error && (
                    <div className="alert bg-danger-subtle border-danger rounded-4 d-flex align-items-center shadow-sm animate-fade-in mb-0" role="alert">
                        <div className="icon-circle bg-white text-danger me-3 shadow-sm flex-shrink-0">
                            <i className="fa-solid fa-triangle-exclamation fs-4"></i>
                        </div>
                        <div className="flex-grow-1">
                            <strong className="d-block text-danger fw-black fs-6">Communication Error</strong>
                            <span className="small text-danger fw-bold">{state.error}</span>
                        </div>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-danger rounded-pill fw-black px-3 ms-3 flex-shrink-0"
                            onClick={() => runLookup(lookupQuery, true)}
                        >
                            <i className="fa-solid fa-rotate-right me-1"></i> Retry
                        </button>
                    </div>
                )}

                {!loading && !state.error && state.data && !state.data.found && (
                    <div className="map-polaroid mx-auto mt-4 max-w-100" style={{ maxWidth: '400px' }}>
                        <div className="tape-strip"></div>
                        <div className="bg-light p-4 rounded-3 text-center border-2 border-dashed border-secondary-subtle">
                            <i className="fa-regular fa-face-frown-open fa-3x text-muted mb-3 opacity-50"></i>
                            <div className="ac-font mb-1 fs-5 text-dark">No exact matches found</div>
                            <p className="small text-muted mb-0 fw-bold">{state.data.message || "Double-check your spelling or click a suggestion below."}</p>
                        </div>
                    </div>
                )}

                {!loading && !state.error && (state.data?.suggestions?.length ?? 0) > 0 && (
                    <div className="mt-4 p-4 bg-cream rounded-4 border shadow-sm animate-fade-in">
                        <div className="small fw-black text-uppercase tracking-wide text-muted mb-3">
                            <i className="fa-solid fa-lightbulb text-warning me-2"></i> Did you mean?
                        </div>
                        <div className="d-flex flex-wrap gap-2">
                            {state.data?.suggestions?.map((suggestion) => (
                                <button
                                    key={suggestion}
                                    type="button"
                                    className="item-pill hover-scale cursor-pointer"
                                    onClick={() => {
                                        setLookupQuery(suggestion);
                                        runLookup(suggestion, true);
                                    }}
                                >
                                    <span className="dot bg-nook-green"></span>
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {!loading && !state.error && state.data?.found && (
                    <div className="d-flex flex-column gap-4">
                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                            <div className="small fw-bold text-muted">
                                Found <span className="text-success">{state.data.query}</span> on {foundCount} island{foundCount === 1 ? "" : "s"}.
                            </div>
                            <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-3 py-2">
                                <i className="fa-solid fa-check me-1"></i> Match found
                            </span>
                        </div>
                        {groupedResults.map((group) => (
                            <div key={group.key}>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <span className="badge bg-light text-dark border rounded-pill px-3 py-2">
                                        <i className={`fa-solid ${group.icon} me-1`}></i>{group.label}
                                    </span>
                                    <span className="tiny-text text-muted fw-bold">{group.islands.length}</span>
                                </div>
                                {group.islands.length > 0 ? (
                                    <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-3 g-3">
                                        {group.islands.map(({ name, island }) => (
                                            <div className="col" key={`${group.key}-${name}`}>
                                                <IslandAvailabilityCard name={name} island={island} group={group.key} />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-4 bg-light border p-3 text-muted small text-center">
                                        <i className="fa-solid fa-circle-info me-2 opacity-50"></i>
                                        No current matches in this group.
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default CatalogAvailability;