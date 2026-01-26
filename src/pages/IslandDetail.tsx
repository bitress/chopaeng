import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ISLANDS_DATA, type IslandData } from "../data/islands.ts";

type ApiIsland = {
    dodo: string;
    name: string;
    status: string;
    type: string;
    visitors: string;
};

type VillagerApiResponse = {
    timestamp: string;
    total_islands: number;
    islands: Record<string, string[]>;
};

const slugify = (s: string) => s.toLowerCase().trim().replace(/['"]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

const mergeIslands = (publicIslands: IslandData[], apiIslands: ApiIsland[]) => {
    const apiById = new Map<string, ApiIsland>();
    const apiByName = new Map<string, ApiIsland>();
    for (const a of apiIslands) {
        const id = slugify(a.name);
        apiById.set(id, a);
        apiByName.set(a.name.toUpperCase(), a);
    }
    return publicIslands.map((p) => {
        const api = apiById.get(p.id) || apiByName.get(String(p.name).toUpperCase());
        return {
            ...p,
            live: api ? {
                dodo: api.dodo,
                status: api.status,
                access: api.type,
                visitors: api.visitors,
                isSubOnly: api.dodo?.toUpperCase() === "SUB ONLY" || api.status?.toUpperCase() === "SUB ONLY",
                isOnline: api.status?.toUpperCase() === "ONLINE",
            } : null,
        };
    });
};

const IslandDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // --- STATE ---
    const [apiIslands, setApiIslands] = useState<ApiIsland[]>([]);
    const [villagersMap, setVillagersMap] = useState<Record<string, string[]>>({});
    const [loading, setLoading] = useState(true);
    const [showImageModal, setShowImageModal] = useState(false);

    // --- EFFECTS ---
    useEffect(() => {
        let cancelled = false;

        const fetchData = async () => {
            try {
                if (!cancelled) setLoading(true);

                // 1. Fetch Island Status (Dodo codes, etc)
                const islandRes = await fetch("https://dodo.chopaeng.com/api/islands");
                const islandData = islandRes.ok ? await islandRes.json() : [];

                // 2. Fetch Villagers List
                const villagerRes = await fetch("https://acnh-finder.chopaeng.com/api/villagers/list");
                const villagerData: VillagerApiResponse = villagerRes.ok ? await villagerRes.json() : { islands: {} };

                if (!cancelled) {
                    setApiIslands(islandData);
                    setVillagersMap(villagerData.islands);
                }
            } catch (error) {
                if (!cancelled) console.log("Error fetching data:", error);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 30000); // Refresh every 30s
        return () => { cancelled = true; clearInterval(interval); };
    }, []);

    const MERGED_ISLANDS = useMemo(() => mergeIslands(ISLANDS_DATA, apiIslands), [apiIslands]);
    const island = MERGED_ISLANDS.find((i) => i.id === id);

    if (!island) return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: '#f0f4e4', color: '#7ba592' }}>
            <div className="text-center">
                <i className="fa-solid fa-plane-slash fa-3x mb-3 opacity-50"></i>
                <h2 className="fw-black">Destination Not Found</h2>
                <button onClick={() => navigate("/maps")} className="btn btn-link text-success fw-bold">Return Home</button>
            </div>
        </div>
    );

    const live = island.live;
    const canShowDodo = live?.isOnline && !live?.isSubOnly && live?.dodo && !["GETTIN'", "FULL"].includes(live.dodo);
    const mapImageSrc = `/maps/${island.name.toLowerCase()}.png`;

    // Try to find villagers by exact name, or fallback to case-insensitive match
    const currentVillagers = villagersMap[island.name] ||
    Object.keys(villagersMap).find(key => key.toLowerCase() === island.name.toLowerCase())
        ? villagersMap[Object.keys(villagersMap).find(key => key.toLowerCase() === island.name.toLowerCase()) as string]
        : [];

    const siteUrl = window.location.origin;
    const currentUrl = `${siteUrl}${location.pathname}`;
    const seoImage = `${siteUrl}${mapImageSrc}`;
    const pageTitle = `${island.name} | ChoPaeng`;
    const pageDesc = `Visit ${island.name}, a ${island.seasonal} ${island.type}! Status: ${live?.status || 'Offline'}. Villagers: ${currentVillagers.slice(0,5).join(', ')}...`;

    return (
        <div className="nook-bg min-vh-100 py-4 py-md-5">

            <title>{pageTitle}</title>
            <meta name="description" content={pageDesc} />
            <meta name="theme-color" content="#7ec9b1" />
            <link rel="canonical" href={currentUrl} />

            {/* Open Graph */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:title" content={pageTitle} />
            <meta property="og:description" content={pageDesc} />
            <meta property="og:image" content={seoImage} />
            <meta property="og:site_name" content="Chopaeng Dodo Codes" />

            {/* Twitter Cards */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={pageTitle} />
            <meta name="twitter:description" content={pageDesc} />
            <meta name="twitter:image" content={seoImage} />

            <div className="container" style={{ maxWidth: "1050px" }}>

                {/* Navigation Breadcrumb */}
                <div className="d-flex align-items-center mb-4 px-2">
                    <button onClick={() => navigate(-1)} className="btn-nook-back me-3">
                        <i className="fa-solid fa-arrow-left"></i>
                    </button>
                    <span className="text-muted fw-bold text-uppercase small tracking-wide">Islands</span>
                </div>

                <div className="row g-4">
                    {/* LEFT COLUMN: Map & Status */}
                    <div className="col-lg-5">

                        {/* Map Polaroid */}
                        <div className="polaroid-stack mb-4">
                            <div
                                className="map-polaroid cursor-pointer"
                                onClick={() => setShowImageModal(true)}
                            >
                                <div className="tape-strip"></div>
                                <div className="img-wrapper">
                                    <img
                                        src={mapImageSrc}
                                        alt={island.name}
                                        className="img-fluid"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            if (target.src.includes('.png')) target.src = target.src.replace('.png', '.jpg');
                                            else if (target.src.endsWith('.jpg')) target.src = target.src.replace('.jpg', '.jpeg');
                                            else target.src = 'https://www.chopaeng.com/banner.png';
                                        }}
                                    />
                                    <div className="zoom-indicator">
                                        <i className="fa-solid fa-expand"></i>
                                    </div>
                                </div>
                                <div className="polaroid-caption">
                                    <i className="fa-solid fa-map-location-dot me-2 text-warning"></i>
                                    {island.name} Map
                                </div>
                            </div>
                        </div>

                        {/* DAL Flight Board */}
                        <div className="dal-card shadow-sm">
                            <div className="dal-header">
                                <i className="fa-solid fa-plane-up me-2"></i> DAL Flight Info
                            </div>
                            <div className="dal-body">
                                <div className="flight-row">
                                    <span className="flight-label">STATUS</span>
                                    <span className={`flight-value ${live?.isOnline ? 'text-dal-blue' : 'text-danger'}`}>
                                        {loading ? <span className="pulse">SCANNING...</span> : (live?.status || 'OFFLINE')}
                                    </span>
                                </div>
                                <div className="flight-divider"></div>
                                <div className="flight-row">
                                    <span className="flight-label">PASSENGERS</span>
                                    <span className="flight-value">{live?.visitors || '0/7'}</span>
                                </div>
                                <div className="flight-divider"></div>
                                <div className="flight-row">
                                    <span className="flight-label">GATE TYPE</span>
                                    <span className="flight-value text-warning">{live?.access || 'PUBLIC'}</span>
                                </div>
                            </div>
                            <div className="dal-footer">
                                <small>Dodo Airlines • We make travel a breeze!</small>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Passport Info */}
                    <div className="col-lg-7">
                        <div className="passport-booklet shadow-lg">
                            {/* Passport Header with Tear-off effect */}
                            <div className="passport-header">
                                <div className="d-flex justify-content-between align-items-start position-relative z-2">
                                    <div>
                                        <div className="passport-stamp mb-2">VERIFIED</div>
                                        <h1 className="island-title">{island.name}</h1>
                                        <span className="island-badge">{island.type}</span>
                                    </div>
                                    <i className="fa-solid fa-passport fa-4x opacity-25 text-white rotate-12"></i>
                                </div>
                                <div className="wave-pattern"></div>
                            </div>

                            <div className="passport-body">
                                <div className="mb-4">
                                    <h5 className="notebook-heading">
                                        <i className="fa-solid fa-bullhorn me-2 text-nook"></i>
                                        Island Bulletin
                                    </h5>
                                    <div className="notebook-lines p-3">
                                        {island.description}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h5 className="notebook-heading">
                                        <i className="fa-solid fa-gem me-2 text-nook"></i>
                                        Available Loot
                                    </h5>
                                    <div className="d-flex flex-wrap gap-2">
                                        {(island.items ?? []).map((item) => (
                                            <div key={item} className="item-pill">
                                                <span className="dot"></span> {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-5">
                                    <h5 className="notebook-heading">
                                        <i className="fa-solid fa-house-user me-2 text-nook"></i>
                                        Current Residents
                                    </h5>
                                    {currentVillagers.length > 0 ? (
                                        <div className="d-flex flex-wrap gap-2">
                                            {currentVillagers.map((villager, index) => (
                                                <div key={`${villager}-${index}`} className="villager-pill">
                                                    <i className="fa-solid fa-paw me-1 text-secondary opacity-50"></i> {villager}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="notebook-lines p-2 text-muted fst-italic">
                                            Unknown or loading...
                                        </div>
                                    )}
                                </div>

                                {/* Call to Action Area */}
                                <div className="action-area">
                                    <button
                                        disabled={!canShowDodo}
                                        className={`btn-dodo-3d ${canShowDodo ? '' : 'disabled'}`}
                                        onClick={() => {
                                            if (canShowDodo && live?.dodo) navigator.clipboard.writeText(live.dodo);
                                        }}
                                    >
                                        <div className="content">
                                            <div className="icon-box">
                                                <i className={`fa-solid ${canShowDodo ? 'fa-plane-departure' : 'fa-lock'}`}></i>
                                            </div>
                                            <div className="text-group">
                                                <span className="action-label">
                                                    {canShowDodo ? 'Copy Dodo Code™' : live?.isSubOnly ? 'VIP Access Only' : 'Gate Closed'}
                                                </span>
                                                <span className="action-code">
                                                    {canShowDodo ? live?.dodo : live?.isSubOnly ? 'Subscribers' : 'Offline'}
                                                </span>
                                            </div>
                                        </div>
                                    </button>

                                    {live?.isSubOnly && (
                                        <a
                                            href="https://www.patreon.com/cw/chopaeng/membership"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="patreon-link"
                                        >
                                            <i className="fa-brands fa-patreon me-2"></i>
                                            Subscribe to Join Queue
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showImageModal && (
                <div className="modal-backdrop-custom" onClick={() => setShowImageModal(false)}>
                    <div className="modal-content-custom" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={mapImageSrc}
                            alt="Zoomed Map"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                if (target.src.includes('.png')) target.src = target.src.replace('.png', '.jpg');
                                else if (target.src.endsWith('.jpg')) target.src = target.src.replace('.jpg', '.jpeg');
                                else target.src = 'https://www.chopaeng.com/banner.png';
                            }}
                        />
                        <button className="close-fab" onClick={() => setShowImageModal(false)}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IslandDetail;