import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useIslandData } from "../context/useIslandData";
import { useAuth } from "../context/useAuth";
import { getAuthToken } from "../context/authToken";
import { DODO_API_BASE, FINDER_API_BASE } from "../config/api";
import RevealErrorPopup from "../components/RevealErrorPopup";
import DisclaimerBanner from "../components/DisclaimerBanner";
import { loadVillagers } from "../data/villagerDataLoader";
import type { CatalogEntity } from "../data/commandBuilderData";

const DODO_PLACEHOLDER = {
    GETTING: "GETTIN'",
    FULL: "FULL",
    SUB_ONLY: "SUB ONLY",
} as const;

const ISLAND_STATUS = {
    OFFLINE: "OFFLINE",
} as const;

const ISLAND_CATEGORY = {
    MEMBER: "member",
    ORDER: "order",
} as const;

// Villagers are loaded asynchronously inside components that need them

const PERSONALITY_COLORS: Record<string, { ring: string; bg: string; text: string }> = {
    lazy: { ring: "#E8A33D", bg: "#FBF0DD", text: "#8A5A17" },
    jock: { ring: "#4F8FE8", bg: "#E7F0FD", text: "#1F508C" },
    cranky: { ring: "#8B6F9E", bg: "#F0EAF4", text: "#5B4470" },
    smug: { ring: "#4FAE99", bg: "#E5F5F1", text: "#2C6E5F" },
    normal: { ring: "#7BAE6F", bg: "#EDF5EA", text: "#4A6E40" },
    peppy: { ring: "#F07FA6", bg: "#FDEBF1", text: "#A03D63" },
    snooty: { ring: "#A15FD9", bg: "#F2E9FB", text: "#6B3A94" },
    sisterly: { ring: "#E8574F", bg: "#FBE7E5", text: "#A5342C" },
    "big sister": { ring: "#E8574F", bg: "#FBE7E5", text: "#A5342C" },
};

const FALLBACK_PALETTE = [
    { ring: "#4F8FE8", bg: "#E7F0FD", text: "#1F508C" },
    { ring: "#4FAE99", bg: "#E5F5F1", text: "#2C6E5F" },
    { ring: "#E8A33D", bg: "#FBF0DD", text: "#8A5A17" },
    { ring: "#A15FD9", bg: "#F2E9FB", text: "#6B3A94" },
    { ring: "#F07FA6", bg: "#FDEBF1", text: "#A03D63" },
    { ring: "#7BAE6F", bg: "#EDF5EA", text: "#4A6E40" },
];

function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

function getPersonalityStyle(personality: string | undefined, seed: string) {
    const key = personality?.toLowerCase().trim();
    if (key && PERSONALITY_COLORS[key]) return PERSONALITY_COLORS[key];
    return FALLBACK_PALETTE[hashString(seed) % FALLBACK_PALETTE.length];
}



export const ResidentVillagerPill = ({ villagerName }: { villagerName: string }) => {
    const navigate = useNavigate();

    const [matched, setMatched] = useState<CatalogEntity | null>(null);

    useEffect(() => {
        let mounted = true;
        loadVillagers().then(villagers => {
            if (mounted) {
                setMatched(villagers.find((v) => v.name.toLowerCase() === villagerName.toLowerCase()) || null);
            }
        });
        return () => { mounted = false; };
    }, [villagerName]);

    const fallbackImg =
        matched?.image ||
        `https://www.pange.ca/itemsearch/villagers/${matched?.id || villagerName.toLowerCase()}.png`;

    const [iconUrl, setIconUrl] = useState<string | null>(matched?.image || null);
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        setIconUrl(matched?.image || null);
        setImgError(false);

        let isMounted = true;
        const fetchIcon = async () => {
            try {
                const res = await fetch(`${FINDER_API_BASE}/api/v1/villager/${encodeURIComponent(villagerName)}`);
                if (!res.ok) return;

                const data = await res.json();
                const fetchedIcon =
                    data.villager?.nh_details?.icon_url ||
                    data.villager?.image_url ||
                    data.icon_url ||
                    data.image_url;

                if (fetchedIcon && isMounted) {
                    setIconUrl(fetchedIcon);
                }
            } catch {
                // Let the fallback handle the apocalypse
            }
        };

        fetchIcon();

        return () => {
            isMounted = false;
        };
    }, [villagerName, matched?.image]);

    const displayImg = iconUrl || fallbackImg;
    const style = getPersonalityStyle(matched?.personality, villagerName.toLowerCase());
    const personalityLabel = matched?.personality
        ? matched.personality.charAt(0).toUpperCase() + matched.personality.slice(1)
        : null;

    const handleClick = () => {
        const pathId = matched ? matched.id : encodeURIComponent(villagerName.toLowerCase());
        navigate(`/command-builder/villager/${pathId}`);
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className="villager-pill border-0 d-inline-flex align-items-center gap-2"
            title={personalityLabel ? `${villagerName} · ${personalityLabel}` : `View ${villagerName} details`}
            style={{
                background: style.bg,
                borderRadius: "999px",
                padding: "6px 14px 6px 6px",
                transition: "transform 120ms ease, box-shadow 120ms ease",
            }}
        >
            <div
                className="rounded-circle overflow-hidden bg-white d-flex align-items-center justify-content-center flex-shrink-0 position-relative"
                style={{
                    width: "36px",
                    height: "36px",
                    border: `2px solid ${style.ring}`,
                    boxShadow: `0 0 0 2px ${style.bg}`,
                }}
            >
                {!imgError && displayImg ? (
                    <img
                        src={displayImg}
                        alt={villagerName}
                        className="w-100 h-100 object-fit-contain"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <i className="fa-solid fa-paw small" style={{ color: style.ring }} role="img" aria-label={villagerName}></i>
                )}
            </div>
            <span className="d-flex flex-column align-items-start lh-sm">
                <span className="fw-bold small" style={{ color: style.text }}>
                    {villagerName}
                </span>
                {personalityLabel && (
                    <span className="text-uppercase" style={{ fontSize: "9px", letterSpacing: "0.04em", color: style.text, opacity: 0.75 }}>
                        {personalityLabel}
                    </span>
                )}
            </span>
        </button>
    );
};
// ─────────────────────────────────────────────────────────────
// Dodo-code button: derived UI state + lookup table
// (replaces three duplicated nested-ternary chains)
// ─────────────────────────────────────────────────────────────
type DodoUiState =
    | "copied"
    | "free-available"
    | "revealed"
    | "revealing"
    | "revealable"
    | "needs-login"
    | "needs-membership"
    | "gate-closed";

function getDodoUiState(params: {
    copied: boolean;
    isFreeIsland: boolean;
    freeLiveCode: string | null;
    revealedCode: string | null;
    isRevealing: boolean;
    isRevealableState: boolean;
    needsAuth: boolean;
    user: unknown;
}): DodoUiState {
    const { copied, isFreeIsland, freeLiveCode, revealedCode, isRevealing, isRevealableState, needsAuth, user } =
        params;

    if (copied) return "copied";
    if (isFreeIsland && freeLiveCode) return "free-available";
    if (revealedCode) return "revealed";
    if (isRevealing) return "revealing";
    if (isRevealableState && !needsAuth) return "revealable";
    if (!user) return "needs-login";
    if (needsAuth) return "needs-membership";
    return "gate-closed";
}

const DODO_UI_CONFIG: Record<
    DodoUiState,
    {
        icon: string;
        label: string;
        code: (ctx: { freeLiveCode: string | null; revealedCode: string | null }) => string;
    }
> = {
    copied: { icon: "fa-check", label: "Copied!", code: () => "✓ Copied" },
    "free-available": {
        icon: "fa-copy",
        label: "Copy Dodo Code™",
        code: ({ freeLiveCode }) => freeLiveCode ?? "",
    },
    revealed: {
        icon: "fa-copy",
        label: "Copy Code",
        code: ({ revealedCode }) => revealedCode ?? "",
    },
    revealing: { icon: "fa-spinner fa-spin", label: "Loading...", code: () => "..." },
    revealable: { icon: "fa-eye", label: "Reveal Code", code: () => "Tap to Reveal" },
    "needs-login": { icon: "fa-lock", label: "Subscribers Only", code: () => "Login to Access" },
    "needs-membership": { icon: "fa-lock", label: "Subscribers Only", code: () => "Join Discord" },
    "gate-closed": { icon: "fa-power-off", label: "Gate Closed", code: () => "Offline" },
};

function formatPassengerCount(visitors: string | undefined): string {
    if (!visitors) return "0/7";
    const match = visitors.match(/\d+/)?.[0];
    return `${match ?? "0"}/7`; // was `?? 7`, which silently showed "full" on parse failure
}

async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (e) {
        console.error("Clipboard write failed:", e);
        return false;
    }
}

// ─────────────────────────────────────────────────────────────
// IslandDetail
// ─────────────────────────────────────────────────────────────
const IslandDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { islands, villagersMap, loading } = useIslandData();
    const { user, login, canAccessIsland } = useAuth();

    const [showImageModal, setShowImageModal] = useState(false);
    const [revealedCode, setRevealedCode] = useState<string | null>(null);
    const [isRevealing, setIsRevealing] = useState(false);
    const [copied, setCopied] = useState(false);
    const [revealError, setRevealError] = useState<string | null>(null);
    const revealInFlightRef = useRef(false);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Close the image modal on Escape for keyboard accessibility
    useEffect(() => {
        if (!showImageModal) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setShowImageModal(false);
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [showImageModal]);

    const island = useMemo(() => {
        const found = islands.find((i) => i.id === id);
        if (!found) return null;

        return {
            ...found,
            live: {
                dodo: found.dodoCode,
                status: found.status,
                access:
                    found.cat === ISLAND_CATEGORY.MEMBER
                        ? "SUB ONLY"
                        : found.cat === ISLAND_CATEGORY.ORDER
                            ? "ORDER BOT"
                            : "PUBLIC",
                visitors: found.visitors?.toString() || "0",
                isSubOnly: found.cat === ISLAND_CATEGORY.MEMBER,
                isOnline: found.discordBotOnline === true,
            },
        };
    }, [islands, id]);

    if (!island) {
        return (
            <div
                className="min-vh-100 d-flex align-items-center justify-content-center"
                style={{ background: "#f0f4e4", color: "#7ba592" }}
            >
                <div className="text-center">
                    <i className="fa-solid fa-plane-slash fa-3x mb-3 opacity-50"></i>
                    <h2 className="fw-black">Destination Not Found</h2>
                    <button onClick={() => navigate("/maps")} className="btn btn-link text-success fw-bold">
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    const live = island.live;
    const isOrderIsland = island.cat === ISLAND_CATEGORY.ORDER;
    const isSubIsland = island.cat === ISLAND_CATEGORY.MEMBER || live?.access === "SUB ONLY";
    const isFreeIsland = !isSubIsland && !isOrderIsland;
    const isRevealableState = live?.status !== ISLAND_STATUS.OFFLINE && live?.dodo !== DODO_PLACEHOLDER.GETTING;
    const freeLiveCode =
        isFreeIsland &&
            live?.dodo &&
            !Object.values(DODO_PLACEHOLDER).includes(live.dodo as (typeof DODO_PLACEHOLDER)[keyof typeof DODO_PLACEHOLDER])
            ? live.dodo
            : null;
    const requiredRoles = island.requiredRoles ?? [];
    const hasMemberAccess = isFreeIsland
        ? true
        : island.accessible ?? island.viewerHasAccess ?? (requiredRoles.length > 0 && canAccessIsland(requiredRoles));
    const needsAuth = !isFreeIsland && !hasMemberAccess;
    const canShowDodo = isOrderIsland ? false : isFreeIsland ? !!freeLiveCode : !!(isRevealableState && !needsAuth);
    const mapImageSrc = island.mapUrl || `https://cdn.chopaeng.com/maps/${island.name.toLowerCase()}.png`;

    const flashCopied = () => {
        setCopied(true);
        setTimeout(() => {
            if (isMountedRef.current) setCopied(false);
        }, 2000);
    };

    const onRevealCode = async () => {
        setRevealError(null);
        if (isOrderIsland) {
            setRevealError(
                "This is an order-bot island. Use the Discord or Twitch order channel to place your order and receive a Dodo Code."
            );
            return;
        }
        // Free islands do not require reveal/auth; copy the live code directly.
        if (isFreeIsland) {
            if (freeLiveCode) {
                const ok = await copyToClipboard(freeLiveCode);
                if (ok) flashCopied();
                else setRevealError("Couldn't copy to clipboard. Please copy the code manually.");
            } else {
                setRevealError("No live dodo code available right now.");
            }
            return;
        }
        if (revealedCode) {
            const ok = await copyToClipboard(revealedCode);
            if (ok) flashCopied();
            else setRevealError("Couldn't copy to clipboard. Please copy the code manually.");
            return;
        }
        if (!user) {
            login();
            return;
        }
        if (needsAuth) {
            navigate("/membership");
            return;
        }
        if (revealInFlightRef.current) return;

        revealInFlightRef.current = true;
        setIsRevealing(true);
        try {
            const token = getAuthToken();
            const resp = await fetch(`${DODO_API_BASE}/api/islands/${encodeURIComponent(island.name)}/dodo`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                credentials: "include",
            });
            if (!isMountedRef.current) return;

            if (!resp.ok) {
                const err = await resp.json().catch(() => ({}));
                if (!isMountedRef.current) return;

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
            if (!isMountedRef.current) return;

            const rawCode = String(data.dodo_code || "");
            const code = rawCode.includes(": ") ? rawCode.split(": ").pop() || rawCode : rawCode;
            setRevealedCode(code);

            const ok = await copyToClipboard(code);
            if (!isMountedRef.current) return;

            if (ok) {
                flashCopied();
                setRevealError(null);
            } else {
                setRevealError("Code revealed, but couldn't copy automatically. Please copy it manually.");
            }
        } catch (e) {
            console.error(e);
            if (isMountedRef.current) {
                setRevealError("Network error while revealing dodo code. Please try again.");
            }
        } finally {
            revealInFlightRef.current = false;
            if (isMountedRef.current) setIsRevealing(false);
        }
    };

    // Try exact key first, then case-insensitive key fallback.
    const villagerKey = villagersMap[island.name]
        ? island.name
        : Object.keys(villagersMap).find((key) => key.toLowerCase() === island.name.toLowerCase());
    const currentVillagers = villagerKey ? villagersMap[villagerKey] ?? [] : [];

    const capitalizeFirstLetter = (string: string) => {
        if (!string) return string;
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    const siteUrl = window.location.origin;
    const currentUrl = `${siteUrl}${location.pathname}`;
    const seoImage = mapImageSrc;
    const pageTitle = `${capitalizeFirstLetter(island.name)} ACNH Treasure Island – Map, Items & Villagers | Chopaeng`;
    const pageDesc = `${island.description ? island.description + ". " : ""
        }View the full map, available items, DIYs, Bells, villagers, and live Dodo code status for the ${capitalizeFirstLetter(
            island.name
        )} ACNH treasure island on Chopaeng.`;

    const dodoUiState = getDodoUiState({
        copied,
        isFreeIsland,
        freeLiveCode,
        revealedCode,
        isRevealing,
        isRevealableState,
        needsAuth,
        user,
    });
    const dodoUiConfig = DODO_UI_CONFIG[dodoUiState];

    return (
        <div className="nook-bg min-vh-100 py-4 py-md-5">
            <title>{pageTitle}</title>
            <meta name="description" content={pageDesc} />
            <meta
                name="keywords"
                content={`${capitalizeFirstLetter(
                    island.name
                )} ACNH treasure island, ACNH treasure islands, Animal Crossing New Horizons treasure island, ${capitalizeFirstLetter(
                    island.name
                )} island dodo code, ACNH free items, Animal Crossing treasure island`}
            />
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
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        itemListElement: [
                            { "@type": "ListItem", position: 1, name: "Home", item: "https://www.chopaeng.com/" },
                            {
                                "@type": "ListItem",
                                position: 2,
                                name: "Islands",
                                item: "https://www.chopaeng.com/islands",
                            },
                            { "@type": "ListItem", position: 3, name: `${capitalizeFirstLetter(island.name)} Island` },
                        ],
                    }),
                }}
            />

            <div className="container" style={{ maxWidth: "1050px" }}>
                {/* Navigation Breadcrumb */}
                <div className="d-flex align-items-center mb-4 px-2">
                    <button
                        onClick={() => navigate("/islands")}
                        className="btn-nook-back me-3"
                        aria-label="Back to Islands"
                    >
                        <i className="fa-solid fa-arrow-left"></i>
                    </button>
                    <span className="text-muted fw-bold text-uppercase small tracking-wide">Islands</span>
                </div>

                <div className="row g-4">
                    {/* LEFT COLUMN: Map & Status */}
                    <div className="col-lg-5">
                        {/* Map Polaroid */}
                        <div className="polaroid-stack mb-4">
                            <div className="map-polaroid cursor-pointer" onClick={() => setShowImageModal(true)}>
                                <div className="tape-strip"></div>
                                <div className="img-wrapper">
                                    <img
                                        src={mapImageSrc}
                                        alt={island.name}
                                        className="img-fluid"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            if (target.src.includes(".png")) target.src = target.src.replace(".png", ".jpg");
                                            else if (target.src.endsWith(".jpg")) target.src = target.src.replace(".jpg", ".jpeg");
                                            else target.src = "https://www.chopaeng.com/banner.png";
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
                                        className={`flight-value ${live?.isOnline && live?.dodo !== DODO_PLACEHOLDER.GETTING
                                            ? "text-dal-blue"
                                            : "text-danger"
                                            }`}
                                    >
                                        {loading ? (
                                            <span className="pulse">SCANNING...</span>
                                        ) : live?.dodo === DODO_PLACEHOLDER.GETTING ? (
                                            DODO_PLACEHOLDER.GETTING
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
                                    <span className="flight-value">{formatPassengerCount(live?.visitors)}</span>
                                </div>
                                <div className="flight-divider"></div>
                                <div className="flight-row">
                                    <span className="flight-label">GATE TYPE</span>
                                    <span className="flight-value text-warning">{live?.access || "PUBLIC"}</span>
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
                                    <div className="notebook-lines p-3">{island.description}</div>
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
                                            {currentVillagers.map((villager) => (
                                                <ResidentVillagerPill key={villager} villagerName={villager} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="notebook-lines p-2 text-muted fst-italic">
                                            No residents currently tracked on this island.
                                        </div>
                                    )}
                                </div>

                                <div className="action-area">
                                    {isOrderIsland ? (
                                        /* ── Order Bot Island: no live Dodo Code yet ── */
                                        <div
                                            className="rounded-4 p-4"
                                            style={{
                                                background: "linear-gradient(135deg, #f0f4ff 0%, #ede8ff 100%)",
                                                border: "2px solid #c7bfff",
                                            }}
                                        >
                                            <div className="d-flex align-items-center gap-3 mb-3">
                                                <span
                                                    className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                                    style={{
                                                        width: 44,
                                                        height: 44,
                                                        background: "linear-gradient(135deg,#7c6fff,#a78bfa)",
                                                        color: "#fff",
                                                        fontSize: "1.1rem",
                                                        boxShadow: "0 4px 14px rgba(124,111,255,0.35)",
                                                    }}
                                                >
                                                    <i className="fa-solid fa-box-open"></i>
                                                </span>
                                                <div>
                                                    <div
                                                        className="fw-black"
                                                        style={{ color: "#4c3db5", fontSize: "0.9rem", letterSpacing: "0.04em" }}
                                                    >
                                                        ORDER BOT ISLAND
                                                    </div>
                                                    <div className="text-muted small lh-sm">
                                                        Dodo codes are issued after ordering
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-muted mb-3" style={{ fontSize: "0.82rem", lineHeight: 1.55 }}>
                                                <i className="fa-solid fa-circle-info me-1 text-primary opacity-75"></i>
                                                There is no live Dodo code displayed here. Place your order on{" "}
                                                <strong>Discord</strong> or <strong>Twitch</strong> first — you'll receive
                                                your personal Dodo code in the order channel once it's ready.
                                            </p>

                                            <div className="d-flex flex-column gap-2">
                                                <a
                                                    href="https://discord.gg/chopaeng"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn fw-bold d-flex align-items-center justify-content-center gap-2 rounded-pill py-2"
                                                    style={{
                                                        background: "#5865f2",
                                                        color: "#fff",
                                                        border: "none",
                                                        boxShadow: "0 4px 12px rgba(88,101,242,0.35)",
                                                    }}
                                                >
                                                    <i className="fa-brands fa-discord fs-5"></i>
                                                    <span>Order on Discord</span>
                                                    <i className="fa-solid fa-arrow-up-right-from-square small opacity-75 ms-1"></i>
                                                </a>
                                                <a
                                                    href="https://www.twitch.tv/chopaeng"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn fw-bold d-flex align-items-center justify-content-center gap-2 rounded-pill py-2"
                                                    style={{
                                                        background: "#9146ff",
                                                        color: "#fff",
                                                        border: "none",
                                                        boxShadow: "0 4px 12px rgba(145,70,255,0.35)",
                                                    }}
                                                >
                                                    <i className="fa-brands fa-twitch fs-5"></i>
                                                    <span>Order on Twitch</span>
                                                    <i className="fa-solid fa-arrow-up-right-from-square small opacity-75 ms-1"></i>
                                                </a>
                                            </div>
                                        </div>
                                    ) : (
                                        /* ── Regular / Sub Island: Dodo reveal button ── */
                                        <>
                                            <button
                                                disabled={!canShowDodo && !needsAuth}
                                                className={`btn-dodo-3d ${canShowDodo || needsAuth ? "" : "disabled"}`}
                                                onClick={onRevealCode}
                                            >
                                                <div className="content">
                                                    <div className="icon-box">
                                                        <i className={`fa-solid ${dodoUiConfig.icon}`}></i>
                                                    </div>
                                                    <div className="text-group">
                                                        <span className="action-label">{dodoUiConfig.label}</span>
                                                        <span className="action-code">
                                                            {dodoUiConfig.code({ freeLiveCode, revealedCode })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </button>

                                            {needsAuth && isRevealableState && (
                                                <a
                                                    href={user ? "https://www.patreon.com/cw/chopaeng/membership" : "#"}
                                                    onClick={(e) => {
                                                        if (!user) {
                                                            e.preventDefault();
                                                            login();
                                                        }
                                                    }}
                                                    target={user ? "_blank" : undefined}
                                                    rel={user ? "noopener noreferrer" : undefined}
                                                    className="patreon-link"
                                                >
                                                    <i className={`fa-solid ${user ? "fa-crown" : "fa-right-to-bracket"} me-2`}></i>
                                                    {user ? "Subscribe to Join Queue" : "Login"}
                                                </a>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showImageModal && (
                <div
                    className="modal-backdrop-custom"
                    onClick={() => setShowImageModal(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-label={`${island.name} map, enlarged`}
                >
                    <div className="modal-content-custom" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={mapImageSrc}
                            alt="Zoomed Map"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                if (target.src.includes(".png")) target.src = target.src.replace(".png", ".jpg");
                                else if (target.src.endsWith(".jpg")) target.src = target.src.replace(".jpg", ".jpeg");
                                else target.src = "https://www.chopaeng.com/banner.png";
                            }}
                        />
                        <button className="close-fab" onClick={() => setShowImageModal(false)} aria-label="Close map view">
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>
            )}

            {revealError && <RevealErrorPopup message={revealError} onClose={() => setRevealError(null)} />}

            {/* VISIBLE UNOFFICIAL FAN-SITE DISCLAIMER */}
            <DisclaimerBanner variant="footer" style={{ maxWidth: "1050px" }} />
        </div>
    );
};

export default IslandDetail;