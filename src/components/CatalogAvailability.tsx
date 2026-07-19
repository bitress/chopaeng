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
    { key: "sub", label: "Member Islands", icon: "fa-crown" },
    { key: "order", label: "Order Islands", icon: "fa-box-open" },
];

const IslandAvailabilityCard = ({ island, name, group }: { island?: IslandData; name: string; group: "free" | "sub" | "order" }) => {
    const meta = island ? categoryMeta[island.cat] : categoryMeta[group === "sub" ? "sub" : group === "free" ? "public" : "order"];
    const visitors = island ? `${island.visitors}/7` : "unknown";

    const content = (
        <div className="h-100 rounded-4 border bg-white p-3 shadow-sm transition-all">
            <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
                <div className="min-w-0">
                    <div className="fw-black text-dark text-truncate">{island?.name || name}</div>
                    <div className="tiny-text text-muted text-truncate">{island?.type || "Island match"}</div>
                </div>
                <span className={`badge rounded-pill border ${meta.className}`} title={meta.label}>
                    <i className={`fa-solid ${meta.icon}`}></i>
                </span>
            </div>
            <div className="d-flex flex-wrap gap-2">
                <span className={`badge rounded-pill border ${island ? statusClass[island.status] : "bg-light text-muted border-light"}`}>
                    {island?.status || "Listed"}
                </span>
                <span className="badge rounded-pill bg-light text-dark border">
                    <i className="fa-solid fa-user-group me-1"></i>{visitors}
                </span>
            </div>
        </div>
    );

    if (!island) return content;

    return (
        <Link to={`/island/${island.id}`} className="text-decoration-none d-block h-100">
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
    const islandsPath = `/islands`;

    return (
        <section className="bg-white rounded-4 border shadow-sm p-4">
            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3">
                <div>
                    <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle rounded-pill fw-bold px-3 py-2 mb-2">
                        <i className="fa-solid fa-satellite-dish me-1"></i> Island Finder
                    </span>
                    <h2 className="h5 fw-black mb-1">You can find this at these islands</h2>
                    <p className="small text-muted mb-0">Live lookup for {mode === "item" ? "items" : "villagers"} across Chopaeng islands.</p>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                    <button type="button" className="btn btn-sm btn-outline-secondary rounded-pill fw-bold px-3" onClick={() => runLookup(lookupQuery, true)} disabled={loading}>
                        <i className={`fa-solid ${loading ? "fa-spinner fa-spin" : "fa-rotate-right"} me-1`}></i> Retry
                    </button>
                    <Link to={islandsPath} className="btn btn-sm btn-nook rounded-pill fw-bold px-3">
                        <i className="fa-solid fa-arrow-up-right-from-square me-1"></i> Open Islands
                    </Link>
                </div>
            </div>

            <div className="input-group mb-3">
                <span className="input-group-text bg-light border-0 rounded-start-pill ps-3">
                    <i className="fa-solid fa-magnifying-glass text-muted"></i>
                </span>
                <input
                    className="form-control bg-light border-0 fw-bold"
                    value={lookupQuery}
                    onChange={(e) => setLookupQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") runLookup(lookupQuery, true); }}
                    aria-label="Availability search"
                />
                <button className="btn btn-dark rounded-end-pill px-3 fw-bold" type="button" onClick={() => runLookup(lookupQuery, true)} disabled={loading || !lookupQuery.trim()}>
                    Search
                </button>
            </div>

            {(loading || islandsLoading) && (
                <div className="rounded-4 bg-light p-4 text-center text-muted fw-bold">
                    <i className="fa-solid fa-circle-notch fa-spin me-2"></i> Checking islands...
                </div>
            )}

            {!loading && state.error && (
                <div className="alert alert-warning rounded-4 border-warning-subtle mb-0">
                    <i className="fa-solid fa-triangle-exclamation me-2"></i>{state.error}
                </div>
            )}

            {!loading && !state.error && state.data && !state.data.found && (
                <div className="rounded-4 bg-light p-4 text-center">
                    <div className="fw-black mb-1">No island matches found.</div>
                    <p className="small text-muted mb-0">{state.data.message || "Try another spelling or choose a suggestion."}</p>
                </div>
            )}

            {!loading && !state.error && (state.data?.suggestions?.length ?? 0) > 0 && (
                <div className="d-flex flex-wrap gap-2 mb-3">
                    {state.data?.suggestions?.map((suggestion) => (
                        <button
                            key={suggestion}
                            type="button"
                            className="btn btn-sm btn-outline-warning rounded-pill text-dark fw-bold"
                            onClick={() => {
                                setLookupQuery(suggestion);
                                runLookup(suggestion, true);
                            }}
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            )}

            {!loading && !state.error && state.data?.found && (
                <div className="d-flex flex-column gap-3">
                    <div className="small fw-bold text-muted">
                        Found <span className="text-success">{state.data.query}</span> on {foundCount} island{foundCount === 1 ? "" : "s"}.
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
                                <div className="row g-2">
                                    {group.islands.map(({ name, island }) => (
                                        <div className="col-md-6" key={`${group.key}-${name}`}>
                                            <IslandAvailabilityCard name={name} island={island} group={group.key} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-4 bg-light border p-3 text-muted small">No current matches in this group.</div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};

export default CatalogAvailability;
