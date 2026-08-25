import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FINDER_API_BASE } from "../config/api";
import { useIslandData } from "../context/useIslandData";
import type { IslandData, IslandCategory, IslandStatus } from "../data/islands";
import { playChimeClick } from "../utils/kkAudioSynthesizer";

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
    public: { label: "Public", icon: "fa-lock-open", className: "border-success-subtle bg-success-subtle text-success" },
    member: { label: "Sub", icon: "fa-crown", className: "border-warning-subtle bg-warning-subtle text-warning-emphasis" },
    order: { label: "Order", icon: "fa-box-open", className: "border-info-subtle bg-info-subtle text-info-emphasis" },
    sub: { label: "Sub", icon: "fa-crown", className: "border-warning-subtle bg-warning-subtle text-warning-emphasis" },
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

const IslandAvailabilityCard: React.FC<{ island?: IslandData; name: string; group: "free" | "sub" }> = ({
    island,
    name,
    group,
}) => {
    const meta = island
        ? categoryMeta[island.cat]
        : categoryMeta[group === "sub" ? "sub" : "public"];
    const visitors = island ? `${island.visitors}/7` : "0/7";

    const cardContent = (
        <div className="h-100 rounded-4 border bg-white p-3 shadow-2xs hover-shadow-sm transition-all hover-translate-y d-flex flex-column justify-content-between overflow-hidden">
            <div>
                <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
                    <div className="min-w-0 flex-grow-1 pe-1">
                        <div className="fw-black text-dark text-truncate" title={island?.name || name} style={{ fontSize: '0.92rem', letterSpacing: '-0.01em' }}>
                            {island?.name || name}
                        </div>
                        <div className="tiny-text text-muted text-truncate">
                            {island?.type || (group === "sub" ? "Sub Island" : "Public Island")}
                        </div>
                    </div>
                    <span className={`badge rounded-pill border flex-shrink-0 px-2 py-1 ${meta.className}`} title={meta.label}>
                        <i className={`fa-solid ${meta.icon} me-1`} aria-hidden="true"></i>
                        <span className="x-small fw-bold">{meta.label}</span>
                    </span>
                </div>
            </div>

            <div className="d-flex align-items-center justify-content-between gap-2 mt-2 pt-2 border-top">
                <div className="d-flex align-items-center gap-1">
                    <span className={`badge rounded-pill border x-small ${island ? statusClass[island.status] : "bg-light text-muted border-light"}`}>
                        {island?.status || "ONLINE"}
                    </span>
                    <span className="badge rounded-pill bg-light text-dark border x-small">
                        <i className="fa-solid fa-users me-1 text-muted" aria-hidden="true"></i>
                        {visitors}
                    </span>
                </div>

                <span className="tiny-text text-success fw-bold d-inline-flex align-items-center gap-1 text-nowrap">
                    <span>Fly</span>
                    <i className="fa-solid fa-arrow-right small" aria-hidden="true"></i>
                </span>
            </div>
        </div>
    );

    if (island) {
        return (
            <Link
                to={`/island/${island.id}`}
                className="text-decoration-none d-block h-100"
                onClick={() => playChimeClick()}
                aria-label={`View island details for ${island.name}`}
            >
                {cardContent}
            </Link>
        );
    }

    return cardContent;
};

const CatalogAvailability: React.FC<CatalogAvailabilityProps> = ({ mode, query }) => {
    const { islands, loading: islandsLoading } = useIslandData();
    const [state, setState] = useState<AvailabilityState>({ data: null, error: null });
    const [loading, setLoading] = useState(false);

    const endpoint = mode === "item" ? "find" : "villager";

    const runLookup = useCallback(async (targetQuery: string, force = false) => {
        const trimmed = targetQuery.trim();
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
            console.error("Island Finder Error:", error);
            const nextState = { data: null, error: "Could not check live island layout right now." };
            finderCache.set(nextCacheKey, { expiresAt: Date.now() + 30_000, value: nextState });
            setState(nextState);
        } finally {
            setLoading(false);
        }
    }, [endpoint, mode]);

    useEffect(() => {
        runLookup(query);
    }, [query, runLookup]);

    const freeMatches = useMemo(() => {
        const list = state.data?.results?.free || [];
        return list.map((name) => ({
            name,
            island: findIsland(islands, name),
        }));
    }, [islands, state.data]);

    const subMatches = useMemo(() => {
        const list = state.data?.results?.sub || [];
        return list.map((name) => ({
            name,
            island: findIsland(islands, name),
        }));
    }, [islands, state.data]);

    const totalMatches = freeMatches.length + subMatches.length;

    return (
        <section className="bg-white rounded-4 border shadow-sm p-3 p-sm-4 animate-up">
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 pb-2 border-bottom">
                <div className="d-flex align-items-center gap-2">
                    <div
                        className="rounded-circle bg-success-subtle text-success d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: 36, height: 36 }}
                        aria-hidden="true"
                    >
                        <i className="fa-solid fa-satellite-dish small" />
                    </div>
                    <div>
                        <h2 className="h6 fw-black text-dark mb-0 ac-font d-flex align-items-center gap-2">
                            <span>Island Availability</span>
                            {loading && (
                                <span className="spinner-border spinner-border-sm text-success" role="status" aria-hidden="true" />
                            )}
                        </h2>
                        <p className="tiny-text text-muted mb-0 fw-bold">
                            Live on-ground spawn locations for <span className="text-dark">"{query}"</span>
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    className="btn btn-xs btn-light border rounded-pill fw-bold text-muted d-inline-flex align-items-center gap-1 px-3"
                    onClick={() => {
                        playChimeClick();
                        runLookup(query, true);
                    }}
                    disabled={loading}
                    title="Refresh live island availability"
                    aria-label="Refresh availability"
                >
                    <i className={`fa-solid ${loading ? "fa-spinner fa-spin" : "fa-rotate-right"}`} aria-hidden="true" />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Content Area */}
            <div aria-live="polite" aria-busy={loading || islandsLoading}>
                {/* Loading State */}
                {(loading || islandsLoading) && (
                    <div className="rounded-4 bg-light p-4 text-center border">
                        <div className="spinner-border text-success mb-2" role="status" aria-hidden="true" />
                        <div className="small fw-bold text-dark">Scanning Island Radars…</div>
                        <p className="tiny-text text-muted mb-0">Checking live island spawns for {query}</p>
                    </div>
                )}

                {/* Error State */}
                {!loading && state.error && (
                    <div className="alert bg-danger-subtle border-danger rounded-4 d-flex align-items-center justify-content-between gap-3 mb-0" role="alert">
                        <div className="d-flex align-items-center gap-2">
                            <i className="fa-solid fa-triangle-exclamation text-danger" aria-hidden="true" />
                            <span className="small text-danger fw-bold">{state.error}</span>
                        </div>
                        <button
                            type="button"
                            className="btn btn-xs btn-outline-danger rounded-pill fw-bold"
                            onClick={() => runLookup(query, true)}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Matches Found */}
                {!loading && !state.error && state.data?.found && totalMatches > 0 && (
                    <div className="d-flex flex-column gap-3">
                        <div className="d-flex align-items-center justify-content-between gap-2">
                            <span className="tiny-text fw-bold text-muted">
                                Available on <strong className="text-dark">{totalMatches}</strong> island{totalMatches === 1 ? "" : "s"}
                            </span>
                            <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill x-small px-2 py-1">
                                <i className="fa-solid fa-check me-1" aria-hidden="true" /> Spawning Live
                            </span>
                        </div>

                        {/* Free Public Islands Group */}
                        {freeMatches.length > 0 && (
                            <div>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2 py-1 x-small fw-bold">
                                        <i className="fa-solid fa-lock-open me-1" aria-hidden="true" /> Public Free Islands ({freeMatches.length})
                                    </span>
                                </div>
                                <div className="row g-2">
                                    {freeMatches.map(({ name, island }) => (
                                        <div className="col-12 col-sm-6" key={`free-${name}`}>
                                            <IslandAvailabilityCard name={name} island={island} group="free" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Sub Member Islands Group */}
                        {subMatches.length > 0 && (
                            <div>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill px-2 py-1 x-small fw-bold">
                                        <i className="fa-solid fa-crown me-1" aria-hidden="true" /> Sub Member Islands ({subMatches.length})
                                    </span>
                                </div>
                                <div className="row g-2">
                                    {subMatches.map(({ name, island }) => (
                                        <div className="col-12 col-sm-6" key={`sub-${name}`}>
                                            <IslandAvailabilityCard name={name} island={island} group="sub" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Not Found on Island Ground State */}
                {!loading && !state.error && (!state.data?.found || totalMatches === 0) && (
                    <div className="rounded-4 bg-light p-3 p-sm-4 text-center border">
                        <div
                            className="rounded-circle bg-white border d-inline-flex align-items-center justify-content-center text-muted mb-2 shadow-2xs"
                            style={{ width: 44, height: 44 }}
                            aria-hidden="true"
                        >
                            <i className="fa-solid fa-boxes-packing fs-5 text-warning" />
                        </div>
                        <h3 className="h6 fw-black text-dark mb-1 ac-font">Not currently on ground layout</h3>
                        <p className="tiny-text text-muted mb-3 fw-bold mx-auto" style={{ maxWidth: '420px' }}>
                            "{query}" is not placed on public ground grids right now, but you can spawn it instantly via Order Bot or Drop Bot!
                        </p>
                        <div className="d-flex flex-wrap justify-content-center gap-2">
                            <Link
                                to="/order"
                                className="btn btn-xs btn-nook text-white rounded-pill fw-bold px-3 py-1 shadow-2xs d-inline-flex align-items-center gap-1"
                                onClick={() => playChimeClick()}
                            >
                                <i className="fa-solid fa-paper-plane" aria-hidden="true" />
                                <span>Order Bot (40 Slots)</span>
                            </Link>
                            <Link
                                to="/command-builder"
                                className="btn btn-xs btn-outline-success rounded-pill fw-bold px-3 py-1 shadow-2xs d-inline-flex align-items-center gap-1"
                                onClick={() => playChimeClick()}
                            >
                                <i className="fa-solid fa-cubes-stacked" aria-hidden="true" />
                                <span>Command Builder</span>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default CatalogAvailability;