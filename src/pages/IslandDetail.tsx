import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useIslandData } from "../context/useIslandData";
import { useAuth } from "../context/useAuth";
import { getAuthToken } from "../context/authToken";
import { DODO_API_BASE } from "../config/api";

const IslandDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { islands, villagersMap, loading } = useIslandData();
    const { user, login, canAccessIsland } = useAuth();

    const [showImageModal, setShowImageModal] = useState(false);
    const [revealedCode, setRevealedCode] = useState<string | null>(null);
    const [isRevealing, setIsRevealing] = useState(false);
    const [copied, setCopied] = useState(false);
    const [revealError, setRevealError] = useState<string | null>(null);

    const island = useMemo(() => {
        const found = islands.find((i) => i.id === id);
        if (!found) return null;

        return {
            ...found,
            live: {
                dodo: found.dodoCode,
                status: found.status,
                access: found.cat === "member" ? "SUB ONLY" : "PUBLIC",
                visitors: found.visitors?.toString() || "0",
                isSubOnly: found.cat === "member",
                isOnline: found.discordBotOnline === true,
            }
        };
    }, [islands, id]);

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
    const isSubIsland = island.cat === "member" || live?.access === "SUB ONLY";
    const isFreeIsland = !isSubIsland;
    const isRevealableState = live?.status !== "OFFLINE" && live?.dodo !== "GETTIN'";
    const freeLiveCode = isFreeIsland && live?.dodo && !["GETTIN'", "FULL", "SUB ONLY"].includes(live.dodo)
        ? live.dodo
        : null;
    const needsAuth = !isFreeIsland && island.requiredRoles.length > 0 && !canAccessIsland(island.requiredRoles);
    const canShowDodo = isFreeIsland ? !!freeLiveCode : !!(isRevealableState && !needsAuth);
    const mapImageSrc = island.mapUrl || `https://cdn.chopaeng.com/maps/${island.name.toLowerCase()}.png`;

    const onRevealCode = async () => {
        setRevealError(null);
        // Free islands do not require reveal/auth; copy the live code directly.
        if (isFreeIsland) {
            if (freeLiveCode) {
                navigator.clipboard.writeText(freeLiveCode);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } else {
                setRevealError("No live dodo code available right now.");
            }
            return;
        }
        if (revealedCode) {
            navigator.clipboard.writeText(revealedCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            return;
        }
        if (!user) { login(); return; }
        if (needsAuth) { navigate("/membership"); return; }
        setIsRevealing(true);
        try {
            const token = getAuthToken();
            const resp = await fetch(`${DODO_API_BASE}/api/islands/${encodeURIComponent(island.name)}/dodo`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                credentials: "include",
            });
            if (!resp.ok) {
                const err = await resp.json().catch(() => ({}));
                if (resp.status === 401) {
                    setRevealError("Your login expired. Please login again.");
                    return;
                }
                if (resp.status === 403) {
                    setRevealError(err.error || "You do not have access to this island's dodo code.");
                    return;
                }
                if (resp.status === 404) {
                    setRevealError("Dodo code is not available right now. Please try again shortly.");
                    return;
                }
                setRevealError(err.error || "Unable to reveal dodo code right now.");
                return;
            }
            const data = await resp.json();
            setRevealedCode(data.dodo_code);
            navigator.clipboard.writeText(data.dodo_code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            setRevealError(null);
        } catch (e) {
            console.error(e);
            setRevealError("Network error while revealing dodo code. Please try again.");
        } finally {
            setIsRevealing(false);
        }
    };

    // Try exact key first, then case-insensitive key fallback.
    const villagerKey = villagersMap[island.name]
        ? island.name
        : Object.keys(villagersMap).find(
            key => key.toLowerCase() === island.name.toLowerCase()
        );
    const currentVillagers = villagerKey ? (villagersMap[villagerKey] ?? []) : [];

    const capitalizeFirstLetter = (string: string) => {
        if (!string) return string;
        return string.charAt(0).toUpperCase() + string.slice(1);
    };


    const siteUrl = window.location.origin;
    const currentUrl = `${siteUrl}${location.pathname}`;
    const seoImage = mapImageSrc;
    const pageTitle = `${capitalizeFirstLetter(island.name)} ACNH Treasure Island – Map, Items & Villagers | Chopaeng`;

    const pageDesc = `${island.description ? island.description + '. ' : ''}View the full map, available items, DIYs, Bells, villagers, and live Dodo code status for the ${capitalizeFirstLetter(island.name)} ACNH treasure island on Chopaeng.`;

    return (
        <div className="nook-bg min-vh-100 py-4 py-md-5">

            <title>{pageTitle}</title>
            <meta name="description" content={pageDesc} />
            <meta name="keywords" content={`${capitalizeFirstLetter(island.name)} ACNH treasure island, ACNH treasure islands, Animal Crossing New Horizons treasure island, ${capitalizeFirstLetter(island.name)} island dodo code, ACNH free items, Animal Crossing treasure island`} />
            <link rel="canonical" href={currentUrl} />

            {/* Open Graph */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:title" content={pageTitle} />
            <meta property="og:description" content={pageDesc} />
            <meta property="og:image" content={seoImage} />
            <meta property="og:site_name" content="Chopaeng" />

            {/* Twitter Cards */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={pageTitle} />
            <meta name="twitter:description" content={pageDesc} />
            <meta name="twitter:image" content={seoImage} />

            {/* Breadcrumb + Island structured data */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.chopaeng.com/" },
                    { "@type": "ListItem", "position": 2, "name": "Islands", "item": "https://www.chopaeng.com/islands" },
                    { "@type": "ListItem", "position": 3, "name": `${capitalizeFirstLetter(island.name)} Island` }
                ]
            }) }} />

            <div className="container" style={{ maxWidth: "1050px" }}>

                {/* Navigation Breadcrumb */}
                <div className="d-flex align-items-center mb-4 px-2">
                    <button onClick={() => navigate('/islands')} className="btn-nook-back me-3">
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
                                    <span
                                        className={`flight-value ${live?.isOnline && live?.dodo !== "GETTIN'"
                                            ? 'text-dal-blue'
                                            : 'text-danger'
                                            }`}
                                    >
                                        {loading ? (
                                            <span className="pulse">SCANNING...</span>
                                        ) : live?.dodo === "GETTIN'" ? (
                                            "GETTIN'"
                                        ) : live?.isOnline ? (
                                            "ONLINE"
                                        ) : (
                                            "OFFLINE"
                                        )}
                                    </span>

                                </div>
                                <div className="flight-divider"></div>
                                <div className="flight-row">
                                    <span className="flight-label">PASSENGERS</span>
                                    <span className="flight-value">
                                        {(() => {
                                            if (!live?.visitors) return '0/7';
                                            const count = live.visitors.match(/\d+/)?.[0];
                                            return `${count ?? 7}/7`;
                                        })()}
                                    </span>
                                </div>
                                <div className="flight-divider"></div>
                                <div className="flight-row">
                                    <span className="flight-label">GATE TYPE</span>
                                    <span className="flight-value text-warning">{live?.access || 'PUBLIC'}</span>
                                </div>
                            </div>
                            <div className="dal-footer">
                                <small>Dodo Airlines • We make travel a breeze!</small>
                                {island.updatedAt && (
                                    <small className="d-block mt-1 text-muted opacity-75">
                                        Updated {new Date(island.updatedAt).toLocaleString()}
                                    </small>
                                )}
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
                                    {loading ? (
                                        <div className="notebook-lines p-2 text-muted fst-italic">
                                            <i className="fa-solid fa-circle-notch fa-spin me-2"></i> Scanning resident list...
                                        </div>
                                    ) : currentVillagers.length > 0 ? (
                                        <div className="d-flex flex-wrap gap-2">
                                            {currentVillagers.map((villager, index) => (
                                                <div
                                                    key={`${villager}-${index}`}
                                                    className="villager-pill"
                                                    title={`Ask ChoBot to order ${villager}!`}
                                                    style={{ cursor: 'help' }}
                                                >
                                                    <i className="fa-solid fa-paw me-1 text-nook opacity-50"></i>
                                                    {villager}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="notebook-lines p-2 text-muted fst-italic">
                                            No residents currently tracked on this island.
                                        </div>
                                    )}
                                </div>

                                <div className="action-area">
                                    <button
                                        disabled={!canShowDodo && !needsAuth}
                                        className={`btn-dodo-3d ${(canShowDodo || needsAuth) ? '' : 'disabled'}`}
                                        onClick={onRevealCode}
                                    >
                                        <div className="content">
                                            <div className="icon-box">
                                                <i className={`fa-solid ${
                                                    copied ? 'fa-check' :
                                                    (isFreeIsland && freeLiveCode) ? 'fa-copy' :
                                                    revealedCode ? 'fa-copy' :
                                                    isRevealing ? 'fa-spinner fa-spin' :
                                                    isRevealableState && !needsAuth ? 'fa-eye' :
                                                    needsAuth ? 'fa-lock' :
                                                    'fa-power-off'
                                                }`}></i>
                                            </div>
                                            <div className="text-group">
                                                <span className="action-label">
                                                    {copied ? 'Copied!' :
                                                     (isFreeIsland && freeLiveCode) ? 'Copy Dodo Code™' :
                                                     revealedCode ? 'Copy Code' :
                                                     isRevealing ? 'Loading...' :
                                                     isRevealableState && !needsAuth ? 'Reveal Code' :
                                                     !user ? 'Login to Access' :
                                                     needsAuth ? 'Subscribers Only' :
                                                     'Gate Closed'}
                                                </span>
                                                <span className="action-code">
                                                    {copied ? '✓ Copied' :
                                                     (isFreeIsland && freeLiveCode) ? freeLiveCode :
                                                     revealedCode ? revealedCode :
                                                     isRevealing ? '...' :
                                                     isRevealableState && !needsAuth ? 'Tap to Reveal' :
                                                     !user ? 'Login' :
                                                     needsAuth ? 'Join Discord' :
                                                     'Offline'}
                                                </span>
                                            </div>
                                        </div>
                                    </button>

                                    {(needsAuth && isRevealableState) && (
                                        <a
                                            href={user ? "https://www.patreon.com/cw/chopaeng/membership" : "#"}
                                            onClick={(e) => !user && (e.preventDefault(), login())}
                                            target={user ? "_blank" : undefined}
                                            rel={user ? "noopener noreferrer" : undefined}
                                            className="patreon-link"
                                        >
                                            <i className={`fa-solid ${user ? 'fa-crown' : 'fa-right-to-bracket'} me-2`}></i>
                                            {user ? "Subscribe to Join Queue" : "Login"}
                                        </a>
                                    )}

                                    {revealError && (
                                        <div className="alert alert-danger mt-3 py-2 px-3 small mb-0" role="alert">
                                            <i className="fa-solid fa-triangle-exclamation me-2"></i>
                                            {revealError}
                                        </div>
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