import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DODO_API_BASE } from "../config/api";
import { getAuthToken } from "../context/authToken";
import { useAuth } from "../context/useAuth";
import { useIslandData } from "../context/useIslandData";
import { useCatalogData } from "../hooks/useCatalogData";
import { useFavoriteIslands, getStoredFavoriteIslands, saveStoredFavoriteIslands } from "../hooks/useFavoriteIslands";
import { useSavedCharacters } from "../hooks/useSavedCharacters";
import { getUserActivityStats } from "../utils/userStats";
import { getUserPreferences, saveUserPreferences } from "../utils/userPreferences";
import { parseItemCodes } from "../utils/itemCodeParser";
import { playChimeClick } from "../utils/kkAudioSynthesizer";
import { fetchUserOrderHistory, type OrderHistoryItem } from "../utils/orderBotApi";

interface ProfileUser {
    id: string;
    discord_name: string;
    global_name: string;
    account_name: string;
    display_name: string;
    nickname: string;
    avatar: string;
    joined_at: string;
    joined_timestamp?: number | null;
    is_admin: boolean;
    is_mod: boolean;
}

interface ProfileRole {
    id: string;
    name: string;
}

interface ProfileIslandAccess {
    id?: string;
    name?: string;
    type?: string;
    channel_id?: string;
    access_source?: string;
    required_roles?: Array<string | ProfileRole>;
    matched_roles?: Array<string | ProfileRole>;
}

interface ProfileSubscriptions {
    role_ids?: string[];
    role_names?: string[];
    roles?: ProfileRole[];
    matched_subscription_role_ids?: string[];
    matched_subscription_role_names?: string[];
    matched_subscription_roles?: ProfileRole[];
    subscription_role_ids?: string[];
    accessible_islands?: ProfileIslandAccess[];
    accessible_member_islands?: ProfileIslandAccess[];
}

interface VisitIsland {
    island_id?: string;
    island_name?: string;
    name?: string;
    type?: string;
    visits?: number;
    count?: number;
    last_visit?: string;
    visited_at?: string;
    authorized?: boolean;
}

interface ProfileVisits {
    total?: number;
    authorized?: number;
    unauthorized?: number;
    by_island_type?: Record<string, number>;
    visits_by_island_type?: Record<string, number>;
    most_visited_islands?: VisitIsland[];
    recent_visits?: VisitIsland[];
    warning_summary?: Record<string, number> | string[] | null;
}

interface ProfileResponse {
    user: ProfileUser;
    subscriptions: ProfileSubscriptions;
    visits: ProfileVisits;
    favorite_islands?: string[];
}

const asArray = <T,>(value: T[] | undefined): T[] => (Array.isArray(value) ? value : []);
const uniqueValues = (items: string[]) => Array.from(new Set(items.filter(Boolean)));
const roleNamesFrom = (roles?: ProfileRole[]) => asArray(roles).map((role) => role.name || role.id);

const MS_TIMESTAMP_THRESHOLD = 1e12;

const formatDate = (value?: string | number | null) => {
    if (!value) return "Not available";
    const date =
        typeof value === "number"
            ? new Date(value < MS_TIMESTAMP_THRESHOLD ? value * 1000 : value)
            : new Date(value);
    if (Number.isNaN(date.getTime())) return "Not available";
    return new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(date);
};

const formatDateTime = (value?: string | number | null) => {
    if (!value) return "Not available";
    const date =
        typeof value === "number"
            ? new Date(value < MS_TIMESTAMP_THRESHOLD ? value * 1000 : value)
            : new Date(value);
    if (Number.isNaN(date.getTime())) return "Not available";
    return new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(date);
};

const formatNumber = (value?: number) => new Intl.NumberFormat().format(value ?? 0);

const Profile = () => {
    const navigate = useNavigate();
    const { user: authUser, loading: authLoading, login, canAccessIsland } = useAuth();
    const { islands: allIslands } = useIslandData();
    const { data: catalogData } = useCatalogData();
    const { favoriteIslands, toggleFavoriteIsland, isFavoriteIsland } = useFavoriteIslands();

    const [profile, setProfile] = useState<ProfileResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [preferences, setPreferences] = useState(getUserPreferences);
    const [prefNotice, setPrefNotice] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"passport" | "access" | "favorites" | "orders" | "history">("passport");
    const [accessFilter, setAccessFilter] = useState<"all" | "public" | "member" | "order">("all");

    // Orders History & Reorder State
    const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

    const loadOrders = useCallback(async () => {
        setOrdersLoading(true);
        const token = getAuthToken();
        const res = await fetchUserOrderHistory(token);
        if (res.success && res.orders) {
            setOrders(res.orders);
        }
        setOrdersLoading(false);
    }, []);

    useEffect(() => {
        loadOrders();
    }, [loadOrders, authUser?.user_id]);

    const handleReorder = (order: OrderHistoryItem, targetRoute: "/order" | "/command-builder" = "/order") => {
        const bundle = parseItemCodes(order.command, catalogData?.all || []);
        if (bundle.items.length > 0) {
            const mappedEntries = bundle.items.map((item) => ({
                item: {
                    id: item.itemId,
                    name: item.name,
                    category: item.category || "General",
                    image: item.image,
                    baseId: item.itemId,
                    variantId: item.variantId ?? null,
                    variantLabel: item.variantLabel ?? null,
                },
                quantity: item.quantity,
            }));
            localStorage.setItem("command_builder_order_items", JSON.stringify(mappedEntries));
            playChimeClick();
            setPrefNotice(`Loaded ${bundle.items.length} item types (${bundle.totalSlots} slots) from order #${order.id}! Opening...`);
            setTimeout(() => setPrefNotice(null), 4000);
            navigate(targetRoute);
        } else {
            playChimeClick();
            navigate(targetRoute);
        }
    };

    const handleCopyOrderCommand = (order: OrderHistoryItem) => {
        const cmd = order.command.startsWith("!") ? order.command : `!order ${order.command}`;
        navigator.clipboard.writeText(cmd).catch(() => {});
        setCopiedOrderId(order.id);
        playChimeClick();
        setTimeout(() => setCopiedOrderId(null), 2500);
    };


    const subscriptionRoleNames = useMemo(() => {
        const subscriptions = profile?.subscriptions;
        const preferredNames = uniqueValues([
            ...asArray(subscriptions?.matched_subscription_role_names),
            ...roleNamesFrom(subscriptions?.matched_subscription_roles),
        ]);
        if (preferredNames.length > 0) return preferredNames;

        const roleNames = uniqueValues([
            ...asArray(subscriptions?.role_names),
            ...roleNamesFrom(subscriptions?.roles),
        ]);
        if (roleNames.length > 0) return roleNames;

        return uniqueValues([
            ...asArray(subscriptions?.role_ids),
            ...asArray(subscriptions?.matched_subscription_role_ids),
            ...asArray(subscriptions?.subscription_role_ids),
        ]);
    }, [profile]);

    const rawDiscordName =
        profile?.user.nickname ||
        profile?.user.display_name ||
        profile?.user.global_name ||
        authUser?.username ||
        "";

    // Multi-slot saved characters (auto-synced from Discord nickname e.g. "bitress/cheurnice | bitress")
    const {
        characters,
        activeCharacter,
        maxSlots,
        setDefaultCharacter,
        syncFromDiscordNickname,
    } = useSavedCharacters(rawDiscordName);

    // User activity statistics
    const stats = getUserActivityStats(
        profile?.visits.total || 0,
        profile?.visits.authorized || 0
    );

    const handleToggleSilentOrder = (checked: boolean) => {
        const updated = saveUserPreferences({ enableSilentOrder: checked });
        setPreferences(updated);
        setPrefNotice(
            checked
                ? "1-Click Silent Order & Drop enabled!"
                : "1-Click Silent Order & Drop disabled (Manual Copy Mode active)."
        );
        setTimeout(() => setPrefNotice(null), 3500);
    };

    useEffect(() => {
        document.title = "Resident Passport & Dashboard • Chopaeng";
    }, []);

    useEffect(() => {
        if (authLoading) return;

        const token = getAuthToken();
        if (!token) {
            setLoading(false);
            return;
        }

        const controller = new AbortController();
        setLoading(true);
        setError("");

        fetch(`${DODO_API_BASE}/api/profile`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
        })
            .then(async (resp) => {
                if (!resp.ok) {
                    const body = await resp.json().catch(() => ({}));
                    throw new Error(body.error || "Unable to load your profile.");
                }
                return resp.json() as Promise<ProfileResponse>;
            })
            .then((data) => {
                setProfile(data);
                if (Array.isArray(data.favorite_islands) && data.favorite_islands.length > 0) {
                    const local = getStoredFavoriteIslands();
                    const merged = Array.from(
                        new Set([...local, ...data.favorite_islands.map((id) => id.trim().toLowerCase())])
                    );
                    saveStoredFavoriteIslands(merged);
                }
            })
            .catch((err: unknown) => {
                if (err instanceof DOMException && err.name === "AbortError") return;
                const message = err instanceof Error ? err.message : "Unable to load your profile.";
                setError(message);
            })
            .finally(() => {
                setLoading(false);
            });

        return () => {
            controller.abort();
        };
    }, [authLoading, authUser?.user_id]);

    const accessibleIslands = asArray(
        profile?.subscriptions.accessible_member_islands ?? profile?.subscriptions.accessible_islands
    );
    const mostVisited = asArray(profile?.visits.most_visited_islands);
    const recentVisits = asArray(profile?.visits.recent_visits);
    const warningSummary = profile?.visits.warning_summary;
    const profileUser = profile?.user;
    const displayName = profileUser?.display_name || authUser?.username || "Resident Member";

    // Matching Favorite Islands with live Island data
    const favoritedIslandObjects = useMemo(() => {
        if (favoriteIslands.length === 0) return [];
        return allIslands.filter((isl) =>
            favoriteIslands.some(
                (fav) =>
                    fav.trim().toLowerCase() === isl.name.trim().toLowerCase() ||
                    fav.trim().toLowerCase() === isl.id.trim().toLowerCase()
            )
        );
    }, [allIslands, favoriteIslands]);

    // Compute total unlocked islands based on public tier + subscription/role matches
    const userUnlockedIslands = useMemo(() => {
        return allIslands.filter((island) => {
            const isFree = island.cat === "public" && (island.requiredRoles?.length ?? 0) === 0;
            if (isFree) return true;
            if (island.accessible || island.viewerHasAccess) return true;
            if (island.requiredRoles && island.requiredRoles.length > 0 && canAccessIsland(island.requiredRoles)) {
                return true;
            }
            return accessibleIslands.some(
                (acc) =>
                    (acc.id && acc.id.toLowerCase() === island.id.toLowerCase()) ||
                    (acc.name && acc.name.toLowerCase() === island.name.toLowerCase())
            );
        });
    }, [allIslands, accessibleIslands, canAccessIsland]);

    const lockedIslands = useMemo(() => {
        return allIslands.filter(
            (island) => !userUnlockedIslands.some((u) => u.id === island.id)
        );
    }, [allIslands, userUnlockedIslands]);

    const filteredAccessIslands = useMemo(() => {
        if (accessFilter === "all") return userUnlockedIslands;
        return userUnlockedIslands.filter((island) => island.cat === accessFilter);
    }, [userUnlockedIslands, accessFilter]);

    if (authLoading || loading) {
        return (
            <div className="nook-bg min-vh-100 d-flex align-items-center justify-content-center p-4">
                <div className="text-center bg-white rounded-4 shadow-sm border p-5">
                    <div className="spinner-border text-success mb-3" role="status" />
                    <p className="fw-bold text-muted mb-0">Loading Resident Passport...</p>
                </div>
            </div>
        );
    }

    if (!authUser && !profile) {
        return (
            <div className="nook-bg min-vh-100 py-5 px-3">
                <div className="container" style={{ maxWidth: 680 }}>
                    <div className="bg-white rounded-4 shadow-sm border p-4 p-md-5 text-center mb-4">
                        <div
                            className="d-inline-flex align-items-center justify-content-center rounded-circle text-white mb-4"
                            style={{ width: 76, height: 76, backgroundColor: "#5865F2" }}
                        >
                            <i className="fa-brands fa-discord fa-2x"></i>
                        </div>
                        <h1 className="ac-font h2 text-dark mb-3">Resident Passport & Profile</h1>
                        <p className="text-muted fw-bold mb-4">
                            Login with Discord to view your verified Island Passport, track your Order Bot & Drop orders, manage multi-character slots, and check accessible treasure islands.
                        </p>
                        <button type="button" onClick={login} className="btn btn-success rounded-pill fw-black px-4 py-3 shadow-sm">
                            <i className="fa-solid fa-right-to-bracket me-2"></i>
                            Login with Discord
                        </button>
                    </div>

                    {/* Preferences for logged out users */}
                    <div className="bg-white rounded-4 shadow-sm border p-4">
                        <div className="d-flex align-items-center gap-3 mb-3">
                            <div className="icon-bubble bg-success bg-opacity-10 text-success">
                                <i className="fa-solid fa-sliders" aria-hidden="true"></i>
                            </div>
                            <h2 className="h5 ac-font text-dark mb-0">Order & Command Builder Preferences</h2>
                        </div>

                        <div className="bg-light rounded-4 p-3 border">
                            <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3">
                                <div className="me-sm-3">
                                    <div className="d-flex align-items-center gap-2 mb-1">
                                        <i className="fa-solid fa-paper-plane text-success"></i>
                                        <strong className="text-dark small">
                                            Direct "Send to Bot Queue / Drop to Island" (1-Click Silent Order)
                                        </strong>
                                    </div>
                                    <p className="tiny-text text-muted mb-0">
                                        Enable direct 1-click silent queuing in Command Builder.
                                    </p>
                                </div>

                                <div className="form-check form-switch ms-sm-auto">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        role="switch"
                                        id="silentOrderToggleLoggedOut"
                                        style={{ width: "48px", height: "26px", cursor: "pointer" }}
                                        checked={preferences.enableSilentOrder}
                                        onChange={(e) => handleToggleSilentOrder(e.target.checked)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="nook-bg min-vh-100 d-flex align-items-center justify-content-center p-4">
                <div className="bg-white rounded-4 shadow-sm border p-4 p-md-5 text-center" style={{ maxWidth: 520 }}>
                    <i className="fa-solid fa-triangle-exclamation text-warning display-4 mb-3"></i>
                    <h1 className="ac-font h3 text-dark mb-3">Profile unavailable</h1>
                    <p className="text-muted fw-bold mb-4">{error}</p>
                    <button type="button" onClick={login} className="btn btn-success rounded-pill fw-black px-4 py-3">
                        Refresh Discord Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="nook-bg min-vh-100 font-nunito pb-5">
            {/* ── 1. PASSPORT HERO HEADER ────────────────────────────────────────── */}
            <div className="bg-white border-bottom shadow-sm">
                <div className="container py-4 py-lg-5">
                    {/* Animal Crossing Passport Card Container */}
                    <div className="card rounded-4 border-2 border-success border-opacity-25 bg-light p-4 p-md-4 shadow-sm position-relative overflow-hidden mb-4">
                        {/* Passport Watermark Stamp */}
                        <div
                            className="position-absolute top-0 end-0 m-3 d-none d-md-flex flex-column align-items-center justify-content-center border border-success border-opacity-50 text-success rounded-circle p-2 opacity-50 pointer-events-none"
                            style={{ width: "90px", height: "90px", transform: "rotate(12deg)" }}
                        >
                            <i className="fa-solid fa-passport fs-4 mb-1"></i>
                            <span className="tiny-text fw-black text-uppercase font-monospace">Verified</span>
                        </div>

                        <div className="row align-items-center gy-4">
                            {/* Passport Photo & Main Info */}
                            <div className="col-lg-7 d-flex flex-column flex-sm-row align-items-center align-items-sm-start gap-4 text-center text-sm-start">
                                <div className="position-relative">
                                    <div
                                        className="rounded-4 border border-3 border-white shadow-sm overflow-hidden bg-white flex-shrink-0"
                                        style={{ width: 104, height: 104 }}
                                    >
                                        {profileUser?.avatar ? (
                                            <img
                                                src={profileUser.avatar}
                                                alt={`${displayName}'s avatar`}
                                                className="w-100 h-100 object-fit-cover"
                                            />
                                        ) : (
                                            <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success">
                                                <i className="fa-solid fa-user-astronaut fa-3x"></i>
                                            </div>
                                        )}
                                    </div>
                                    <span
                                        className="position-absolute bottom-0 end-0 p-1 bg-success border border-white rounded-circle"
                                        title="Discord Connected"
                                        style={{ width: "16px", height: "16px" }}
                                    ></span>
                                </div>

                                <div className="flex-grow-1">
                                    <div className="d-flex align-items-center justify-content-center justify-content-sm-start gap-2 mb-1">
                                        <span className="badge bg-success text-white rounded-pill px-3 py-1 tiny-text fw-black text-uppercase letter-spacing-1">
                                            Island Passport
                                        </span>
                                        <span className="tiny-text text-muted font-monospace">
                                            ID: {profileUser?.id || "Resident"}
                                        </span>
                                    </div>

                                    <h1 className="ac-font display-6 text-dark mb-1 fw-black">
                                        {activeCharacter.ign || displayName}
                                    </h1>

                                    <div className="d-flex align-items-center justify-content-center justify-content-sm-start gap-2 text-muted fw-bold small mb-2">
                                        <span>
                                            <i className="fa-solid fa-umbrella-beach text-success me-1"></i>
                                            Island: <strong className="text-dark">{activeCharacter.islandName || "Island"}</strong>
                                        </span>
                                        <span>•</span>
                                        <span>
                                            <i className="fa-solid fa-tag text-warning me-1"></i>
                                            {activeCharacter.title || "Resident"}
                                        </span>
                                    </div>

                                    {/* Role Badges & Member Since */}
                                    <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-sm-start gap-2">
                                        {profileUser?.is_admin && <span className="badge rounded-pill bg-danger px-3 py-1">Admin</span>}
                                        {profileUser?.is_mod && <span className="badge rounded-pill bg-success px-3 py-1">Moderator</span>}
                                        {subscriptionRoleNames.length > 0 ? (
                                            subscriptionRoleNames.map((role) => (
                                                <span key={role} className="badge rounded-pill bg-warning text-dark px-3 py-1 fw-bold">
                                                    <i className="fa-solid fa-crown me-1"></i>
                                                    {role}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="badge rounded-pill bg-light text-muted border px-3 py-1">
                                                Free Member
                                            </span>
                                        )}
                                        <span className="badge rounded-pill bg-white text-dark border px-3 py-1 shadow-2xs">
                                            <i className="fa-solid fa-calendar-check text-primary me-1"></i>
                                            Member since {formatDate(profileUser?.joined_at ?? profileUser?.joined_timestamp)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Stat Stamps (Key Metrics) */}
                            <div className="col-lg-5">
                                <div className="row g-2 text-center">
                                    <div className="col-6">
                                        <div className="bg-white rounded-3 border p-3 shadow-2xs h-100">
                                            <i className="fa-solid fa-box-open text-primary mb-1 fs-5"></i>
                                            <div className="h4 ac-font text-dark mb-0 fw-black">
                                                {formatNumber(stats.ordersPlaced)}
                                            </div>
                                            <div className="tiny-text text-muted fw-black text-uppercase">Orders Placed</div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="bg-white rounded-3 border p-3 shadow-2xs h-100">
                                            <i className="fa-solid fa-parachute-box text-success mb-1 fs-5"></i>
                                            <div className="h4 ac-font text-dark mb-0 fw-black">
                                                {formatNumber(stats.dropsPlaced)}
                                            </div>
                                            <div className="tiny-text text-muted fw-black text-uppercase">Drops Placed</div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="bg-white rounded-3 border p-3 shadow-2xs h-100">
                                            <i className="fa-solid fa-plane-arrival text-warning mb-1 fs-5"></i>
                                            <div className="h4 ac-font text-dark mb-0 fw-black">
                                                {formatNumber(profile?.visits.total)}
                                            </div>
                                            <div className="tiny-text text-muted fw-black text-uppercase">Island Visits</div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="bg-white rounded-3 border p-3 shadow-2xs h-100">
                                            <i className="fa-solid fa-circle-check text-success mb-1 fs-5"></i>
                                            <div className="h4 ac-font text-dark mb-0 fw-black">
                                                {formatNumber(profile?.visits.authorized)}
                                            </div>
                                            <div className="tiny-text text-muted fw-black text-uppercase">Authorized Flights</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="d-flex align-items-center gap-2 border-bottom pb-2 overflow-x-auto">
                        <button
                            type="button"
                            className={`btn btn-sm rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-2 transition-all ${
                                activeTab === "passport"
                                    ? "btn-success text-white shadow-sm"
                                    : "btn-light bg-light text-muted border"
                            }`}
                            onClick={() => setActiveTab("passport")}
                        >
                            <i className="fa-solid fa-address-card"></i>
                            <span>Saved Characters ({characters.length}/{maxSlots})</span>
                        </button>

                        <button
                            type="button"
                            className={`btn btn-sm rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-2 transition-all ${
                                activeTab === "access"
                                    ? "btn-success text-white shadow-sm"
                                    : "btn-light bg-light text-muted border"
                            }`}
                            onClick={() => setActiveTab("access")}
                        >
                            <i className="fa-solid fa-key"></i>
                            <span>Your Access & Islands ({userUnlockedIslands.length})</span>
                        </button>

                        <button
                            type="button"
                            className={`btn btn-sm rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-2 transition-all ${
                                activeTab === "favorites"
                                    ? "btn-success text-white shadow-sm"
                                    : "btn-light bg-light text-muted border"
                            }`}
                            onClick={() => setActiveTab("favorites")}
                        >
                            <i className="fa-solid fa-star text-warning"></i>
                            <span>Favorite Islands ({favoriteIslands.length})</span>
                        </button>

                        <button
                            type="button"
                            className={`btn btn-sm rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-2 transition-all ${
                                activeTab === "orders"
                                    ? "btn-success text-white shadow-sm"
                                    : "btn-light bg-light text-muted border"
                            }`}
                            onClick={() => setActiveTab("orders")}
                        >
                            <i className="fa-solid fa-box-open text-success"></i>
                            <span>Order History {orders.length > 0 ? `(${orders.length})` : ""}</span>
                        </button>

                        <button
                            type="button"
                            className={`btn btn-sm rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-2 transition-all ${
                                activeTab === "history"
                                    ? "btn-success text-white shadow-sm"
                                    : "btn-light bg-light text-muted border"
                            }`}
                            onClick={() => setActiveTab("history")}
                        >
                            <i className="fa-solid fa-clock-rotate-left"></i>
                            <span>Flight History & Logs</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ── 2. TAB CONTENT ─────────────────────────────────────────────────── */}
            <div className="container py-4">
                {/* ── TAB 1: SAVED CHARACTERS (MULTI-SLOT PASSPORTS) ──────────────── */}
                {activeTab === "passport" && (
                    <div className="row g-4 animate-fade">
                        <div className="col-lg-8">
                            <div className="bg-white rounded-4 shadow-sm border p-4">
                                <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-3 pb-3 border-bottom">
                                    <div>
                                        <div className="d-flex align-items-center gap-2">
                                            <h2 className="h5 ac-font text-dark mb-0">Saved In-Game Characters</h2>
                                            <span className="badge bg-success bg-opacity-10 text-success rounded-pill x-small fw-black">
                                                {characters.length} / {maxSlots} Slots
                                            </span>
                                        </div>
                                        <p className="tiny-text text-muted mb-0">
                                            Active character will auto-fill your IGN & Island Name across Command Builder, Silent Order, and Drop Selector.
                                        </p>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="d-flex align-items-center gap-2 flex-wrap">
                                        {rawDiscordName && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const count = syncFromDiscordNickname(rawDiscordName);
                                                    setPrefNotice(
                                                        count > 0
                                                            ? `Synced ${count} character slot${count > 1 ? "s" : ""} from Discord ("${rawDiscordName}")!`
                                                            : `No IGN/Island pattern detected in "${rawDiscordName}".`
                                                    );
                                                    setTimeout(() => setPrefNotice(null), 3500);
                                                }}
                                                className="btn btn-sm btn-outline-success rounded-pill fw-bold px-3 d-flex align-items-center gap-1 shadow-2xs"
                                                title={`Parse IGN & Island from Discord: "${rawDiscordName}"`}
                                            >
                                                <i className="fa-brands fa-discord text-primary"></i>
                                                <span>Sync from Discord Nickname</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Characters Grid */}
                                <div className="row g-3 mb-4">
                                    {characters.map((char) => {
                                        const isSelected = char.isDefault;

                                        return (
                                            <div key={char.id} className="col-md-6">
                                                <div
                                                    className={`card rounded-4 p-3 transition-all position-relative h-100 ${
                                                        isSelected
                                                            ? "border-2 border-success bg-success bg-opacity-10 shadow-sm"
                                                            : "bg-light border-light-subtle shadow-2xs"
                                                    }`}
                                                >
                                                    <div className="d-flex align-items-start justify-content-between mb-2">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <div
                                                                className={`rounded-circle d-flex align-items-center justify-content-center ${
                                                                    isSelected ? "bg-success text-white" : "bg-white text-muted border"
                                                                }`}
                                                                style={{ width: "36px", height: "36px" }}
                                                            >
                                                                <i className={`fa-solid ${char.icon || "fa-leaf"}`}></i>
                                                            </div>
                                                            <div>
                                                                <div className="fw-black text-dark" style={{ fontSize: "1rem" }}>
                                                                    {char.ign}
                                                                </div>
                                                                <div className="tiny-text text-muted fw-bold">
                                                                    {char.title || "Island Resident"}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {isSelected ? (
                                                            <span className="badge bg-success text-white rounded-pill x-small fw-black">
                                                                <i className="fa-solid fa-check me-1"></i>Active Primary
                                                            </span>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                className="btn btn-xs btn-light rounded-pill border fw-bold tiny-text"
                                                                onClick={() => setDefaultCharacter(char.id)}
                                                            >
                                                                Set Active
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="bg-white rounded-3 p-2 border mb-3">
                                                        <div className="d-flex align-items-center justify-content-between tiny-text">
                                                            <span className="text-muted fw-bold">Island Name:</span>
                                                            <span className="fw-black text-dark">
                                                                🏝️ {char.islandName}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="d-flex align-items-center justify-content-between pt-2 border-top mt-auto">
                                                        <span className="tiny-text text-muted font-monospace d-flex align-items-center gap-1">
                                                            <i className="fa-brands fa-discord text-primary"></i>
                                                            <span>Discord Synced</span>
                                                        </span>
                                                        {characters.length > 1 && !isSelected && (
                                                            <button
                                                                type="button"
                                                                className="btn btn-xs btn-outline-success rounded-pill fw-bold"
                                                                onClick={() => setDefaultCharacter(char.id)}
                                                            >
                                                                Set Primary
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                            </div>
                        </div>

                        {/* Preferences Column */}
                        <div className="col-lg-4">
                            <div className="bg-white rounded-4 shadow-sm border p-4 h-100">
                                <div className="d-flex align-items-center gap-3 mb-3">
                                    <div className="icon-bubble bg-success bg-opacity-10 text-success">
                                        <i className="fa-solid fa-sliders"></i>
                                    </div>
                                    <h2 className="h5 ac-font text-dark mb-0">Delivery Preferences</h2>
                                </div>

                                {prefNotice && (
                                    <div className="alert alert-success rounded-3 py-2 px-3 small fw-bold mb-3 animate-fade">
                                        <i className="fa-solid fa-circle-check me-2"></i>
                                        {prefNotice}
                                    </div>
                                )}

                                <div className="bg-light rounded-3 p-3 border mb-3">
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <strong className="text-dark small">1-Click Silent Order</strong>
                                        <div className="form-check form-switch m-0">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                role="switch"
                                                id="silentOrderToggleDash"
                                                checked={preferences.enableSilentOrder}
                                                onChange={(e) => handleToggleSilentOrder(e.target.checked)}
                                            />
                                        </div>
                                    </div>
                                    <p className="tiny-text text-muted mb-0">
                                        Directly queues orders and drop requests to Bot without manual copy-paste commands.
                                    </p>
                                </div>

                                <div className="passport-field mb-3">
                                    <div className="tiny-text text-muted fw-black text-uppercase mb-1">Active Discord Account</div>
                                    <div className="fw-bold text-dark font-monospace small">{profileUser?.discord_name || authUser?.username}</div>
                                </div>

                                <div className="passport-field mb-0">
                                    <div className="tiny-text text-muted fw-black text-uppercase mb-1">Account Standing</div>
                                    <div className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-2 fw-bold">
                                        <i className="fa-solid fa-shield-check me-1"></i>Good Standing • Verified
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TAB 2: YOUR ACCESS & SUBSCRIPTION ISLANDS ────────────────────── */}
                {activeTab === "access" && (
                    <div className="row g-4 animate-fade">
                        <div className="col-lg-12">
                            <div className="bg-white rounded-4 shadow-sm border p-4">
                                {/* Header Row */}
                                <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-4 pb-3 border-bottom">
                                    <div>
                                        <div className="d-flex align-items-center gap-2 mb-1">
                                            <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1 fw-bold">
                                                <i className="fa-solid fa-passport me-1"></i>Tier Passport
                                            </span>
                                            <h2 className="h5 ac-font text-dark mb-0">Your Subscription & Island Access</h2>
                                        </div>
                                        <p className="tiny-text text-muted mb-0">
                                            Real-time overview of your membership status, Discord tier roles, and unlocked Animal Crossing treasure islands.
                                        </p>
                                    </div>

                                    <div className="d-flex align-items-center gap-2">
                                        <Link to="/islands" className="btn btn-sm btn-nook rounded-pill px-3 fw-bold shadow-xs">
                                            <i className="fa-solid fa-plane-departure me-1"></i>Live Flight Board
                                        </Link>
                                        <Link to="/membership" className="btn btn-sm btn-outline-warning text-dark border-warning rounded-pill px-3 fw-bold">
                                            <i className="fa-solid fa-crown text-warning me-1"></i>Perks & Tiers
                                        </Link>
                                    </div>
                                </div>

                                {/* Subscription Tier Status Overview Banner */}
                                <div className="bg-light bg-opacity-75 rounded-4 p-4 border mb-4">
                                    <div className="row g-3 align-items-center">
                                        <div className="col-lg-6">
                                            <div className="d-flex align-items-center gap-3">
                                                <div
                                                    className="rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                                                    style={{
                                                        width: 54,
                                                        height: 54,
                                                        background: subscriptionRoleNames.length > 0 ? "#fff3cd" : "#d1e7dd",
                                                        color: subscriptionRoleNames.length > 0 ? "#997404" : "#0f5132",
                                                    }}
                                                >
                                                    <i className={`fa-solid ${subscriptionRoleNames.length > 0 ? "fa-crown fa-lg" : "fa-leaf fa-lg"}`}></i>
                                                </div>
                                                <div>
                                                    <div className="d-flex align-items-center gap-2 mb-1">
                                                        <h3 className="h6 fw-black text-dark mb-0">
                                                            {subscriptionRoleNames.length > 0 ? "Active Subscription Tier" : "Free Resident Access"}
                                                        </h3>
                                                        <span className={`badge rounded-pill px-2 py-1 x-small fw-bold ${
                                                            subscriptionRoleNames.length > 0 ? "bg-warning text-dark" : "bg-secondary text-white"
                                                        }`}>
                                                            {subscriptionRoleNames.length > 0 ? "VIP PASS" : "STANDARD PASS"}
                                                        </span>
                                                    </div>
                                                    <div className="d-flex flex-wrap gap-1 align-items-center">
                                                        {subscriptionRoleNames.length > 0 ? (
                                                            subscriptionRoleNames.map((role) => (
                                                                <span key={role} className="badge bg-white text-dark border rounded-pill px-2 py-1 x-small fw-bold shadow-xs">
                                                                    <i className="fa-solid fa-check text-success me-1"></i>{role}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="tiny-text text-muted fw-bold">
                                                                Access to all public islands ({allIslands.filter(i => i.cat === "public").length} free islands)
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-lg-6">
                                            <div className="row g-2 text-center">
                                                <div className="col-4">
                                                    <div className="bg-white rounded-3 p-2 border shadow-2xs">
                                                        <div className="x-small text-muted fw-bold text-uppercase">Unlocked</div>
                                                        <div className="h5 fw-black text-success mb-0 font-monospace">{userUnlockedIslands.length}</div>
                                                    </div>
                                                </div>
                                                <div className="col-4">
                                                    <div className="bg-white rounded-3 p-2 border shadow-2xs">
                                                        <div className="x-small text-muted fw-bold text-uppercase">Public Free</div>
                                                        <div className="h5 fw-black text-dark mb-0 font-monospace">
                                                            {userUnlockedIslands.filter(i => i.cat === "public").length}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-4">
                                                    <div className="bg-white rounded-3 p-2 border shadow-2xs">
                                                        <div className="x-small text-muted fw-bold text-uppercase">VIP / Premium</div>
                                                        <div className="h5 fw-black text-warning mb-0 font-monospace">
                                                            {userUnlockedIslands.filter(i => i.cat === "member").length}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Filter Pills for Unlocked Islands */}
                                <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-3">
                                    <div className="d-flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setAccessFilter("all")}
                                            className={`btn btn-sm rounded-pill px-3 fw-bold transition-all ${
                                                accessFilter === "all" ? "btn-dark shadow-sm" : "btn-light border text-muted"
                                            }`}
                                        >
                                            All Unlocked ({userUnlockedIslands.length})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setAccessFilter("public")}
                                            className={`btn btn-sm rounded-pill px-3 fw-bold transition-all ${
                                                accessFilter === "public" ? "btn-success text-white shadow-sm" : "btn-light border text-muted"
                                            }`}
                                        >
                                            <i className="fa-solid fa-lock-open me-1"></i>Free Public ({userUnlockedIslands.filter(i => i.cat === "public").length})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setAccessFilter("member")}
                                            className={`btn btn-sm rounded-pill px-3 fw-bold transition-all ${
                                                accessFilter === "member" ? "btn-warning text-dark shadow-sm" : "btn-light border text-muted"
                                            }`}
                                        >
                                            <i className="fa-solid fa-crown me-1"></i>VIP / Sub ({userUnlockedIslands.filter(i => i.cat === "member").length})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setAccessFilter("order")}
                                            className={`btn btn-sm rounded-pill px-3 fw-bold transition-all ${
                                                accessFilter === "order" ? "btn-info text-dark shadow-sm" : "btn-light border text-muted"
                                            }`}
                                        >
                                            <i className="fa-solid fa-box-open me-1"></i>Order Bot ({userUnlockedIslands.filter(i => i.cat === "order").length})
                                        </button>
                                    </div>

                                    <span className="tiny-text text-muted fw-bold">
                                        Showing {filteredAccessIslands.length} accessible destinations
                                    </span>
                                </div>

                                {/* Unlocked Island Cards */}
                                {filteredAccessIslands.length > 0 ? (
                                    <div className="row g-3 mb-4">
                                        {filteredAccessIslands.map((island) => {
                                            const isOnline = island.discordBotOnline === true;
                                            const isFav = isFavoriteIsland(island.id);

                                            return (
                                                <div key={island.id} className="col-12 col-md-6 col-lg-4">
                                                    <div className="card rounded-4 p-3 bg-white border border-light-subtle shadow-xs hover-shadow-sm transition-all h-100 d-flex flex-column">
                                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                                            <div className="d-flex align-items-center gap-2">
                                                                <span className={`badge rounded-pill x-small fw-bold ${
                                                                    island.cat === "member"
                                                                        ? "bg-warning-subtle text-warning-emphasis border border-warning-subtle"
                                                                        : island.cat === "order"
                                                                            ? "bg-info-subtle text-info-emphasis border border-info-subtle"
                                                                            : "bg-success-subtle text-success border border-success-subtle"
                                                                }`}>
                                                                    {island.cat === "member" ? (
                                                                        <><i className="fa-solid fa-crown me-1"></i>VIP Unlocked</>
                                                                    ) : island.cat === "order" ? (
                                                                        <><i className="fa-solid fa-box me-1"></i>Order Bot</>
                                                                    ) : (
                                                                        <><i className="fa-solid fa-lock-open me-1"></i>Public Free</>
                                                                    )}
                                                                </span>

                                                                <div className="d-flex align-items-center gap-1 x-small fw-bold">
                                                                    <span className={`status-dot ${isOnline ? "bg-success pulse-ring" : "bg-danger"}`} style={{ width: 8, height: 8 }}></span>
                                                                    <span className={isOnline ? "text-success" : "text-muted"}>
                                                                        {isOnline ? "ONLINE" : "OFFLINE"}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={(e) => toggleFavoriteIsland(island.id, e)}
                                                                className={`btn btn-sm border rounded-circle shadow-2xs d-flex align-items-center justify-content-center transition-all ${
                                                                    isFav ? "btn-warning text-dark border-warning" : "btn-light text-muted"
                                                                }`}
                                                                style={{ width: 28, height: 28 }}
                                                                title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                                                            >
                                                                <i className={`${isFav ? "fa-solid text-dark" : "fa-regular text-muted"} fa-star x-small`}></i>
                                                            </button>
                                                        </div>

                                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                                            <div>
                                                                <h4 className="ac-font h5 text-dark mb-0">{island.name}</h4>
                                                                <span className="tiny-text text-muted fw-bold text-uppercase">{island.type}</span>
                                                            </div>
                                                            <div
                                                                className={`theme-badge rounded-circle d-flex align-items-center justify-content-center theme-${island.theme} border shadow-2xs`}
                                                                style={{ width: 30, height: 30, fontSize: "0.75rem" }}
                                                                title={`${island.seasonal} Season`}
                                                            >
                                                                <i className="fa-solid fa-leaf"></i>
                                                            </div>
                                                        </div>

                                                        {island.items && island.items.length > 0 && (
                                                            <div className="d-flex flex-wrap gap-1 mb-3">
                                                                {island.items.slice(0, 3).map((item, i) => (
                                                                    <span key={i} className="badge bg-light text-secondary border rounded-pill x-small fw-bold">
                                                                        {item}
                                                                    </span>
                                                                ))}
                                                                {island.items.length > 3 && (
                                                                    <span className="badge bg-light text-muted border rounded-pill x-small fw-bold">
                                                                        +{island.items.length - 3}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}

                                                        <div className="mt-auto pt-2 border-top d-flex align-items-center justify-content-between">
                                                            <span className="tiny-text text-muted font-monospace fw-bold">
                                                                <i className="fa-solid fa-users me-1"></i>
                                                                {island.visitors ?? 0}/7 Visitors
                                                            </span>
                                                            <Link
                                                                to={`/island/${encodeURIComponent(island.id)}`}
                                                                className="btn btn-sm btn-nook rounded-pill px-3 py-1 fw-bold d-flex align-items-center gap-1 shadow-2xs"
                                                            >
                                                                <span>Fly to Island</span>
                                                                <i className="fa-solid fa-plane-departure x-small"></i>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="bg-light border rounded-4 p-4 text-center mb-4">
                                        <i className="fa-solid fa-magnifying-glass text-muted fs-3 mb-2"></i>
                                        <div className="fw-bold text-dark mb-1">No islands found for this category</div>
                                        <p className="tiny-text text-muted mb-0">Try selecting "All Unlocked" to view all your destinations.</p>
                                    </div>
                                )}

                                {/* Locked Islands Preview Card (for subscribers & free members) */}
                                {lockedIslands.length > 0 && (
                                    <div className="bg-light border rounded-4 p-4">
                                        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-3">
                                            <div>
                                                <div className="d-flex align-items-center gap-2 mb-1">
                                                    <span className="badge bg-secondary text-white rounded-pill px-2 py-1 x-small fw-bold">
                                                        <i className="fa-solid fa-lock me-1"></i>VIP EXCLUSIVE
                                                    </span>
                                                    <h3 className="h6 fw-black text-dark mb-0">Locked Treasure Islands ({lockedIslands.length})</h3>
                                                </div>
                                                <p className="tiny-text text-muted mb-0">
                                                    Upgrade your subscription tier on Discord to unlock priority 24/7 Dodo codes, 2.0 DIYs, custom order bots, and all private islands.
                                                </p>
                                            </div>

                                            <Link to="/membership" className="btn btn-sm btn-warning text-dark border-warning rounded-pill px-4 fw-bold shadow-xs text-nowrap">
                                                <i className="fa-solid fa-crown me-1"></i>Unlock All Islands
                                            </Link>
                                        </div>

                                        <div className="d-flex flex-wrap gap-2">
                                            {lockedIslands.map((locked) => (
                                                <div
                                                    key={locked.id}
                                                    className="badge bg-white text-muted border rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-2 shadow-2xs"
                                                    title="Subscribe to unlock this island"
                                                >
                                                    <i className="fa-solid fa-lock text-warning x-small"></i>
                                                    <span className="text-dark">{locked.name}</span>
                                                    <span className="x-small text-muted">({locked.type})</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TAB 3: FAVOURITE TREASURE ISLANDS ────────────────────────────── */}
                {activeTab === "favorites" && (
                    <div className="row g-4 animate-fade">
                        <div className="col-lg-12">
                            <div className="bg-white rounded-4 shadow-sm border p-4">
                                <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-4 pb-3 border-bottom">
                                    <div>
                                        <div className="d-flex align-items-center gap-2">
                                            <h2 className="h5 ac-font text-dark mb-0">Favorite Treasure Islands</h2>
                                            <span className="badge bg-warning bg-opacity-25 text-dark rounded-pill x-small fw-black">
                                                {favoriteIslands.length} Starred
                                            </span>
                                        </div>
                                        <p className="tiny-text text-muted mb-0">
                                            Your starred treasure islands for quick access and live status monitoring.
                                        </p>
                                    </div>

                                    <Link to="/islands" className="btn btn-sm btn-outline-success rounded-pill px-3 fw-bold">
                                        <i className="fa-solid fa-plus me-1"></i>Find More Islands
                                    </Link>
                                </div>

                                {favoritedIslandObjects.length > 0 ? (
                                    <div className="row g-3">
                                        {favoritedIslandObjects.map((island) => {
                                            const isOnline = island.status === "ONLINE";

                                            return (
                                                <div key={island.id} className="col-md-6 col-lg-4">
                                                    <div className="card rounded-4 p-3 bg-light border border-light-subtle shadow-2xs h-100 d-flex flex-column">
                                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                                            <div className="d-flex align-items-center gap-1">
                                                                <span
                                                                    className={`p-1 rounded-circle ${isOnline ? "bg-success" : "bg-secondary"}`}
                                                                    style={{ width: "8px", height: "8px" }}
                                                                ></span>
                                                                <span className={`tiny-text fw-black ${isOnline ? "text-success" : "text-muted"}`}>
                                                                    {island.status}
                                                                </span>
                                                            </div>

                                                            <button
                                                                type="button"
                                                                className="btn btn-sm p-1 text-warning border-0"
                                                                onClick={(e) => toggleFavoriteIsland(island.id, e)}
                                                                title="Remove from Favorites"
                                                            >
                                                                <i className="fa-solid fa-star fs-5"></i>
                                                            </button>
                                                        </div>

                                                        <div className="fw-black text-dark h5 mb-1 ac-font">
                                                            🏝️ {island.name}
                                                        </div>

                                                        <p className="tiny-text text-muted mb-3 flex-grow-1 line-clamp-2">
                                                            {island.description || "Treasure island with loaded DIYs, materials, and catalog items."}
                                                        </p>

                                                        <div className="d-flex align-items-center justify-content-between pt-2 border-top mt-auto">
                                                            <span className="badge bg-white text-muted border rounded-pill x-small fw-bold">
                                                                {island.cat || island.type || "Treasure Island"}
                                                            </span>
                                                            <Link
                                                                to={`/island/${encodeURIComponent(island.id)}`}
                                                                className="btn btn-xs btn-success text-white rounded-pill px-3 fw-bold"
                                                            >
                                                                Travel Now
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="bg-light border rounded-4 p-5 text-center">
                                        <i className="fa-solid fa-star text-muted display-5 mb-3 opacity-25"></i>
                                        <h3 className="h6 fw-black text-dark mb-1">No Favorite Islands Starred Yet</h3>
                                        <p className="tiny-text text-muted mb-4" style={{ maxWidth: "420px", margin: "0 auto" }}>
                                            Star your favorite free or subscriber treasure islands to keep track of their live dodo status and fast travel anytime!
                                        </p>
                                        <div className="d-flex justify-content-center">
                                            <Link to="/islands" className="btn btn-sm btn-success text-white rounded-pill px-4 fw-bold shadow-2xs">
                                                <i className="fa-solid fa-compass me-1"></i>Browse Treasure Islands
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TAB: ORDER HISTORY & REORDER ─────────────────────────────────────── */}
                {activeTab === "orders" && (
                    <div className="row g-4 animate-fade">
                        <div className="col-12">
                            <div className="bg-white rounded-4 shadow-sm border p-4">
                                <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-4 pb-3 border-bottom">
                                    <div>
                                        <div className="d-flex align-items-center gap-2">
                                            <h2 className="h5 ac-font text-dark mb-0">Your Order History</h2>
                                            <span className="badge bg-success bg-opacity-10 text-success rounded-pill x-small fw-black">
                                                {orders.length} Order{orders.length === 1 ? "" : "s"}
                                            </span>
                                        </div>
                                        <p className="tiny-text text-muted mb-0">
                                            Saved Order Bot requests. Reorder any previous pocket with 1-click or export items to Command Builder.
                                        </p>
                                    </div>

                                    <div className="d-flex gap-2">
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-secondary rounded-pill fw-bold px-3 d-flex align-items-center gap-1 shadow-2xs"
                                            onClick={loadOrders}
                                            disabled={ordersLoading}
                                            title="Refresh order history"
                                        >
                                            <i className={`fa-solid fa-arrows-rotate ${ordersLoading ? "fa-spin" : ""}`}></i>
                                            <span>Refresh</span>
                                        </button>
                                        <Link
                                            to="/order"
                                            className="btn btn-sm btn-success text-white rounded-pill fw-bold px-3 d-flex align-items-center gap-1 shadow-sm"
                                        >
                                            <i className="fa-solid fa-paper-plane"></i>
                                            <span>Order Bot</span>
                                        </Link>
                                    </div>
                                </div>

                                {ordersLoading && orders.length === 0 ? (
                                    <div className="text-center py-5 text-muted">
                                        <span className="spinner-border spinner-border-sm text-success me-2" role="status" aria-hidden="true" />
                                        <span className="small fw-bold">Loading order history…</span>
                                    </div>
                                ) : orders.length > 0 ? (
                                    <div className="row g-3">
                                        {orders.map((order) => {
                                            const parsed = parseItemCodes(order.command, catalogData?.all || []);
                                            const isCopied = copiedOrderId === order.id;
                                            const statusColor =
                                                order.status === "ready" || order.status === "completed"
                                                    ? "bg-success text-white"
                                                    : order.status === "preparing"
                                                    ? "bg-warning text-dark"
                                                    : order.status === "cancelled" || order.status === "error"
                                                    ? "bg-danger text-white"
                                                    : "bg-info text-dark";

                                            return (
                                                <div key={order.id} className="col-12 col-xl-6">
                                                    <div className="card rounded-4 p-3 bg-light border border-light-subtle shadow-2xs h-100 d-flex flex-column">
                                                        {/* Card Top: Order ID + Status + Date */}
                                                        <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
                                                            <div className="d-flex align-items-center gap-2">
                                                                <span className="badge bg-dark text-white rounded-pill font-monospace x-small px-2 py-1">
                                                                    #{order.id.slice(0, 16)}
                                                                </span>
                                                                <span className={`badge rounded-pill x-small fw-black text-uppercase ${statusColor}`}>
                                                                    {order.status}
                                                                </span>
                                                            </div>
                                                            <span className="tiny-text text-muted">
                                                                <i className="fa-regular fa-clock me-1"></i>
                                                                {formatDateTime(order.created_at)}
                                                            </span>
                                                        </div>

                                                        {/* Island info & Dodo code if ready */}
                                                        {order.island_name && (
                                                            <div className="d-flex align-items-center gap-2 mb-2 tiny-text">
                                                                <span className="fw-bold text-dark">
                                                                    🏝️ Island: <strong>{order.island_name}</strong>
                                                                </span>
                                                                {order.dodo_code && (
                                                                    <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill font-monospace">
                                                                        Dodo: {order.dodo_code}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Parsed Items Preview */}
                                                        <div className="bg-white rounded-3 p-2 border mb-3 flex-grow-1">
                                                            <div className="d-flex align-items-center justify-content-between mb-2 tiny-text">
                                                                <span className="text-muted fw-bold">
                                                                    {parsed.items.length > 0
                                                                        ? `${parsed.items.length} item types (${parsed.totalSlots} slots)`
                                                                        : "Order Command"}
                                                                </span>
                                                            </div>

                                                            {parsed.items.length > 0 ? (
                                                                <div className="d-flex flex-wrap gap-1" style={{ maxHeight: "100px", overflowY: "auto" }}>
                                                                    {parsed.items.map((item, idx) => (
                                                                        <span
                                                                            key={`${item.itemId}-${idx}`}
                                                                            className="badge bg-light text-dark border rounded-pill px-2 py-1 tiny-text fw-normal d-inline-flex align-items-center gap-1"
                                                                        >
                                                                            {item.image && (
                                                                                <img
                                                                                    src={item.image}
                                                                                    alt=""
                                                                                    style={{ width: 14, height: 14, objectFit: "contain" }}
                                                                                />
                                                                            )}
                                                                            <span>{item.name}</span>
                                                                            <span className="text-success fw-bold">×{item.quantity}</span>
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div className="font-monospace text-muted tiny-text text-break select-all" style={{ maxHeight: "60px", overflowY: "auto" }}>
                                                                    {order.command}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Action Buttons */}
                                                        <div className="d-flex align-items-center justify-content-between pt-2 border-top mt-auto gap-2 flex-wrap">
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-nook text-white rounded-pill px-3 fw-bold d-inline-flex align-items-center gap-1 shadow-2xs"
                                                                onClick={() => handleReorder(order, "/order")}
                                                                title="Load this pocket and open Order Bot"
                                                            >
                                                                <i className="fa-solid fa-rotate-left"></i>
                                                                <span>Reorder</span>
                                                            </button>

                                                            <div className="d-flex gap-2">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-success rounded-pill px-3 fw-bold d-inline-flex align-items-center gap-1 shadow-2xs"
                                                                    onClick={() => handleReorder(order, "/command-builder")}
                                                                    title="Load into Command Builder to edit"
                                                                >
                                                                    <i className="fa-solid fa-pencil"></i>
                                                                    <span className="d-none d-sm-inline">Builder</span>
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    className={`btn btn-sm rounded-pill px-3 fw-bold d-inline-flex align-items-center gap-1 ${
                                                                        isCopied ? "btn-success text-white" : "btn-light border text-dark"
                                                                    }`}
                                                                    onClick={() => handleCopyOrderCommand(order)}
                                                                    title="Copy !order command to clipboard"
                                                                >
                                                                    <i className={`fa-solid ${isCopied ? "fa-check" : "fa-copy"}`}></i>
                                                                    <span>{isCopied ? "Copied" : "Copy"}</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="bg-light border rounded-4 p-5 text-center">
                                        <div className="mb-3" style={{ fontSize: "3rem" }}>📦</div>
                                        <h3 className="h6 fw-black text-dark mb-1">No Orders Placed Yet</h3>
                                        <p className="tiny-text text-muted mb-4" style={{ maxWidth: "420px", margin: "0 auto" }}>
                                            Build your 40-slot pocket loadout in the Command Builder and place an order to get automatic tracking and 1-click reordering here.
                                        </p>
                                        <div className="d-flex justify-content-center gap-2">
                                            <Link to="/command-builder" className="btn btn-sm btn-success text-white rounded-pill px-4 fw-bold shadow-2xs">
                                                <i className="fa-solid fa-cubes-stacked me-1"></i>Build Pocket
                                            </Link>
                                            <Link to="/order" className="btn btn-sm btn-outline-success rounded-pill px-4 fw-bold shadow-2xs">
                                                <i className="fa-solid fa-box-open me-1"></i>Order Bot
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TAB 4: FLIGHT HISTORY & VISIT LOGS ────────────────────────────── */}
                {activeTab === "history" && (
                    <div className="row g-4 animate-fade">
                        <div className="col-lg-12">
                            <div className="bg-white rounded-4 shadow-sm border p-4 mb-4">
                                <h2 className="h5 ac-font text-dark mb-3">Recent Flights & Visits</h2>
                                <IslandVisitTable visits={recentVisits} emptyText="No recent flights recorded." showDate />
                            </div>

                            <div className="bg-white rounded-4 shadow-sm border p-4">
                                <h2 className="h5 ac-font text-dark mb-3">Top Visited Destinations</h2>
                                <IslandVisitTable visits={mostVisited} emptyText="No favorite destinations yet." />
                            </div>

                            {/* Warnings Summary if any */}
                            {warningSummary && (
                                <div className="bg-white rounded-4 shadow-sm border p-4 mt-4">
                                    <h2 className="h5 ac-font text-dark mb-3">Account Warnings Log</h2>
                                    {Array.isArray(warningSummary) && warningSummary.length > 0 ? (
                                        <PaginatedTable
                                            columns={["Warning Note"]}
                                            rows={warningSummary.map((w) => [String(w)])}
                                            searchable={false}
                                        />
                                    ) : !Array.isArray(warningSummary) && Object.keys(warningSummary).length > 0 ? (
                                        <PaginatedTable
                                            columns={["Warning Type", "Count"]}
                                            rows={Object.entries(warningSummary).map(([k, v]) => [k.replaceAll("_", " "), formatNumber(Number(v))])}
                                            searchable={false}
                                        />
                                    ) : (
                                        <p className="text-muted tiny-text mb-0">No warnings recorded on your account.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};

interface PaginatedTableProps {
    columns: string[];
    rows: string[][];
    searchable?: boolean;
    perPage?: number;
}

const PaginatedTable = ({ columns, rows, searchable = true, perPage = 5 }: PaginatedTableProps) => {
    const tableRef = useRef<HTMLTableElement | null>(null);

    const tableKey = useMemo(
        () => `${columns.join("|")}::${rows.length}::${rows.map((row) => row.join(",")).join(";")}`,
        [columns, rows]
    );

    useEffect(() => {
        if (!tableRef.current || rows.length === 0) return;

        let dataTable: import("simple-datatables").DataTable | undefined;

        Promise.all([
            import("simple-datatables"),
            import("simple-datatables/dist/style.css"),
        ]).then(([{ DataTable }]) => {
            if (!tableRef.current) return;
            dataTable = new DataTable(tableRef.current, {
                searchable,
                perPage,
                perPageSelect: [5, 10, 25],
                fixedHeight: false,
                labels: {
                    placeholder: "Search flights...",
                    perPage: "rows per page",
                    noRows: "No flight logs found",
                    info: "Showing {start} to {end} of {rows} logs",
                },
            });
        });

        return () => dataTable?.destroy();
    }, [tableKey, searchable, perPage, rows.length]);

    return (
        <div className="profile-table-wrap mb-2">
            <table ref={tableRef} className="table table-hover align-middle mb-0 profile-table">
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th key={column} scope="col">
                                {column}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, rowIndex) => (
                        <tr key={`${row.join("-")}-${rowIndex}`}>
                            {row.map((cell, cellIndex) => (
                                <td key={`${cell}-${cellIndex}`}>{cell || "Not available"}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

interface IslandVisitTableProps {
    visits: VisitIsland[];
    emptyText: string;
    showDate?: boolean;
}

const IslandVisitTable = ({ visits, emptyText, showDate = false }: IslandVisitTableProps) => {
    const columns = useMemo(
        () => (showDate ? ["Island", "Type", "Status", "Visited", "Visits"] : ["Island", "Type", "Status", "Visits"]),
        [showDate]
    );

    const rows = useMemo(
        () =>
            visits.map((visit) => {
                const base = [
                    visit.island_name ?? visit.name ?? visit.island_id ?? "Island",
                    visit.type ?? "Treasure island",
                    visit.authorized === false ? "Denied" : "Authorized",
                ];

                return showDate
                    ? [
                          ...base,
                          formatDate(visit.visited_at ?? visit.last_visit),
                          formatNumber(visit.visits ?? visit.count ?? 1),
                      ]
                    : [...base, formatNumber(visit.visits ?? visit.count ?? 1)];
            }),
        [visits, showDate]
    );

    if (visits.length === 0) {
        return <div className="bg-light border rounded-3 p-3 text-muted fw-bold small">{emptyText}</div>;
    }

    return <PaginatedTable columns={columns} rows={rows} />;
};

export default Profile;