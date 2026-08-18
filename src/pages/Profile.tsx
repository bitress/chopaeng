import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { DODO_API_BASE } from "../config/api";
import { getAuthToken } from "../context/authToken";
import { useAuth } from "../context/useAuth";
import { getUserPreferences, saveUserPreferences } from "../utils/userPreferences";

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
}

const asArray = <T,>(value: T[] | undefined): T[] => Array.isArray(value) ? value : [];

const uniqueValues = (items: string[]) => Array.from(new Set(items.filter(Boolean)));

const roleNamesFrom = (roles?: ProfileRole[]) => asArray(roles).map((role) => role.name || role.id);

// Threshold used to distinguish unix seconds from unix milliseconds.
// Any numeric timestamp below this is assumed to be seconds (multiplied by 1000);
// anything at or above it is assumed to already be milliseconds.
// (Sept 2001 in ms == ~1e12, so seconds-since-epoch values stay well under 1e12
// for the foreseeable future while ms values are always well above it.)
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

const formatNumber = (value?: number) => new Intl.NumberFormat().format(value ?? 0);

const Profile = () => {
    const { user: authUser, loading: authLoading, login } = useAuth();
    const [profile, setProfile] = useState<ProfileResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [preferences, setPreferences] = useState(getUserPreferences);
    const [prefNotice, setPrefNotice] = useState<string | null>(null);

    const handleToggleSilentOrder = (checked: boolean) => {
        const updated = saveUserPreferences({ enableSilentOrder: checked });
        setPreferences(updated);
        setPrefNotice(checked ? "1-Click Silent Order & Drop enabled!" : "1-Click Silent Order & Drop disabled (Manual Copy Mode active).");
        setTimeout(() => setPrefNotice(null), 3500);
    };

    useEffect(() => {
        document.title = "Profile";
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
        // Re-run once auth finishes loading AND whenever the logged-in user changes
        // (e.g. right after a successful login), not just when authLoading flips.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading, authUser?.user_id]);

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

    const accessibleIslands = asArray(
        profile?.subscriptions.accessible_member_islands ?? profile?.subscriptions.accessible_islands
    );
    const mostVisited = asArray(profile?.visits.most_visited_islands);
    const recentVisits = asArray(profile?.visits.recent_visits);
    const warningSummary = profile?.visits.warning_summary;
    const profileUser = profile?.user;
    const displayName = profileUser?.display_name || authUser?.username || "Chopaeng member";

    // Whether the current error looks like an auth problem (so we only offer
    // the "Refresh Discord login" recovery action when it's actually relevant).
    const isAuthError = /auth|login|token|unauthorized|401|403/i.test(error);

    if (authLoading || loading) {
        return (
            <div className="nook-bg min-vh-100 d-flex align-items-center justify-content-center p-4">
                <div className="text-center bg-white rounded-4 shadow-sm border p-5">
                    <div className="spinner-border text-success mb-3" role="status" />
                    <p className="fw-bold text-muted mb-0">Loading your profile...</p>
                </div>
            </div>
        );
    }

    if (!authUser && !profile) {
        return (
            <div className="nook-bg min-vh-100 py-5 px-3">
                <div className="container" style={{ maxWidth: 680 }}>
                    <div className="bg-white rounded-4 shadow-sm border p-4 p-md-5 text-center mb-4">
                        <div className="d-inline-flex align-items-center justify-content-center rounded-circle text-white mb-4" style={{ width: 76, height: 76, backgroundColor: "#5865F2" }}>
                            <i className="fa-brands fa-discord fa-2x"></i>
                        </div>
                        <h1 className="ac-font h2 text-dark mb-3">Member Profile</h1>
                        <p className="text-muted fw-bold mb-4">Login with Discord to see your island access, visit history, and server profile.</p>
                        <button type="button" onClick={login} className="btn btn-success rounded-pill fw-black px-4 py-3">
                            <i className="fa-solid fa-right-to-bracket me-2"></i>
                            Login with Discord
                        </button>
                    </div>

                    {/* Order & Command Builder Preferences (available for all users) */}
                    <div className="bg-white rounded-4 shadow-sm border p-4">
                        <div className="d-flex align-items-center gap-3 mb-3">
                            <div className="icon-bubble bg-success bg-opacity-10 text-success">
                                <i className="fa-solid fa-sliders" aria-hidden="true"></i>
                            </div>
                            <h2 className="h5 ac-font text-dark mb-0">Order & Command Builder Preferences</h2>
                        </div>

                        {prefNotice && (
                            <div className="alert alert-success rounded-4 py-2 px-3 small fw-bold mb-3 animate-fade">
                                <i className="fa-solid fa-circle-check me-2"></i>
                                {prefNotice}
                            </div>
                        )}

                        <div className="bg-light rounded-4 p-3 border">
                            <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3">
                                <div className="me-sm-3">
                                    <div className="d-flex align-items-center gap-2 mb-1">
                                        <i className="fa-solid fa-paper-plane text-success"></i>
                                        <strong className="text-dark small">
                                            Direct "Send to Bot Queue / Drop to Island" (1-Click Silent Order)
                                        </strong>
                                        <span className={`badge rounded-pill x-small ${preferences.enableSilentOrder ? 'bg-success text-white' : 'bg-secondary text-white'}`}>
                                            {preferences.enableSilentOrder ? 'Enabled' : 'Disabled'}
                                        </span>
                                    </div>
                                    <p className="tiny-text text-muted mb-0">
                                        {preferences.enableSilentOrder ? (
                                            <>
                                                <span className="d-block text-dark fw-bold mb-1">
                                                    • <strong>Order Bot:</strong> Directly queues order silently via API.
                                                </span>
                                                <span className="d-block text-dark fw-bold">
                                                    • <strong>Drop / Villager Inject:</strong> Lets you select target Sub Island (and house plot for villagers) with automatic Subscriber/VIP verification.
                                                </span>
                                            </>
                                        ) : (
                                            <span>
                                                Silent order and drop buttons are hidden in Command Builder. Standard manual <strong>Copy Command</strong> mode is active.
                                            </span>
                                        )}
                                    </p>
                                </div>

                                <div className="form-check form-switch ms-sm-auto">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        role="switch"
                                        id="silentOrderToggleLoggedOut"
                                        style={{ width: '48px', height: '26px', cursor: 'pointer' }}
                                        checked={preferences.enableSilentOrder}
                                        onChange={(e) => handleToggleSilentOrder(e.target.checked)}
                                    />
                                    <label className="form-check-label visually-hidden" htmlFor="silentOrderToggleLoggedOut">
                                        Toggle 1-Click Silent Order & Drop
                                    </label>
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
                    {isAuthError ? (
                        <button type="button" onClick={login} className="btn btn-success rounded-pill fw-black px-4 py-3">
                            Refresh Discord login
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="btn btn-success rounded-pill fw-black px-4 py-3"
                        >
                            Try again
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="nook-bg min-vh-100 font-nunito pb-5">
            <div className="bg-white border-bottom shadow-sm">
                <div className="container py-4 py-lg-5">
                    <div className="row align-items-center gy-4">
                        <div className="col-lg-7 d-flex align-items-center gap-4">
                            <div className="rounded-4 border border-3 border-white shadow-sm overflow-hidden bg-light flex-shrink-0" style={{ width: 96, height: 96 }}>
                                {profileUser?.avatar ? (
                                    <img
                                        src={profileUser.avatar}
                                        alt={`${displayName}'s avatar`}
                                        className="w-100 h-100 object-fit-cover"
                                    />
                                ) : (
                                    <div className="w-100 h-100 d-flex align-items-center justify-content-center text-success">
                                        <i className="fa-brands fa-discord fa-3x" aria-hidden="true"></i>
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-success fw-black text-uppercase tiny-text mb-2">Discord Passport</p>
                                <h1 className="ac-font display-6 text-dark mb-2">{displayName}</h1>
                                <div className="d-flex flex-wrap gap-2">
                                    {profileUser?.is_admin && <span className="badge rounded-pill bg-warning px-3 py-2">Admin</span>}
                                    {profileUser?.is_mod && <span className="badge rounded-pill bg-success px-3 py-2">Moderator</span>}
                                    <span className="badge rounded-pill bg-light text-dark border px-3 py-2">
                                        Joined {formatDate(profileUser?.joined_at ?? profileUser?.joined_timestamp)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-5">
                            <div className="row g-3">
                                <ProfileStat label="Total visits" value={formatNumber(profile?.visits.total)} icon="fa-plane-arrival" />
                                <ProfileStat label="Authorized" value={formatNumber(profile?.visits.authorized)} icon="fa-circle-check" color="success" />
                                <ProfileStat label="Unauthorized" value={formatNumber(profile?.visits.unauthorized)} icon="fa-ban" color="danger" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container py-4">
                <div className="row g-4">
                    <div className="col-lg-4">
                        <ProfileCard title="Discord Profile" icon="fa-id-card">
                            <ProfileField label="Discord ID" value={profileUser?.id} />
                            <ProfileField label="Discord name" value={profileUser?.discord_name} />
                            <ProfileField label="Global name" value={profileUser?.global_name} />
                            <ProfileField label="Account name" value={profileUser?.account_name} />
                            <ProfileField label="Guild nickname" value={profileUser?.nickname} />
                        </ProfileCard>
                    </div>

                    <div className="col-lg-8">
                        <ProfileCard title="Subscriptions & Access" icon="fa-crown">
                            <div className="row g-3 mb-4">
                                <PillList title="Subscription roles" items={subscriptionRoleNames} emptyText="No subscription roles matched yet." tone="warning" />
                            </div>

                            <h3 className="h6 fw-black text-uppercase text-muted mb-3">Sub Islands</h3>
                            {accessibleIslands.length > 0 ? (
                                <div className="d-flex flex-wrap gap-2 mb-4">
                                    {accessibleIslands.map((island, index) => {
                                        const label = island.name ?? island.id ?? "Sub Island";
                                        const islandPath = island.id ?? island.name ?? "";

                                        return (
                                            <Link
                                                key={`${islandPath || label}-${index}`}
                                                to={`/island/${encodeURIComponent(islandPath)}`}
                                                className="badge bg-success-subtle text-success-emphasis border border-success-subtle rounded-pill px-3 py-2 d-inline-flex align-items-center gap-2 text-decoration-none fw-bold"
                                            >
                                                <span>{label}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            ) : (
                                <EmptyLine text="No sub islands yet." />
                            )}
                        </ProfileCard>
                    </div>

                    {/* Order & Command Builder Preferences */}
                    <div className="col-lg-12">
                        <ProfileCard title="Order & Command Builder Preferences" icon="fa-sliders">
                            {prefNotice && (
                                <div className="alert alert-success rounded-4 py-2 px-3 small fw-bold mb-3 animate-fade">
                                    <i className="fa-solid fa-circle-check me-2"></i>
                                    {prefNotice}
                                </div>
                            )}

                            <div className="bg-light rounded-4 p-3 border mb-3">
                                <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3">
                                    <div className="me-sm-3">
                                        <div className="d-flex align-items-center gap-2 mb-1">
                                            <i className="fa-solid fa-paper-plane text-success"></i>
                                            <strong className="text-dark small">
                                                Direct "Send to Bot Queue / Drop to Island" (1-Click Silent Order)
                                            </strong>
                                            <span className={`badge rounded-pill x-small ${preferences.enableSilentOrder ? 'bg-success text-white' : 'bg-secondary text-white'}`}>
                                                {preferences.enableSilentOrder ? 'Enabled' : 'Disabled'}
                                            </span>
                                        </div>
                                        <p className="tiny-text text-muted mb-0">
                                            {preferences.enableSilentOrder ? (
                                                <>
                                                    <span className="d-block text-dark fw-bold mb-1">
                                                        • <strong>Order Bot:</strong> Directly queues order silently via API.
                                                    </span>
                                                    <span className="d-block text-dark fw-bold">
                                                        • <strong>Drop / Villager Inject:</strong> Lets you select target Sub Island (and house plot for villagers) with automatic Subscriber/VIP verification.
                                                    </span>
                                                </>
                                            ) : (
                                                <span>
                                                    Silent order and drop buttons are hidden in Command Builder. Standard manual <strong>Copy Command</strong> mode is active.
                                                </span>
                                            )}
                                        </p>
                                    </div>

                                    <div className="form-check form-switch ms-sm-auto">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            role="switch"
                                            id="silentOrderToggle"
                                            style={{ width: '48px', height: '26px', cursor: 'pointer' }}
                                            checked={preferences.enableSilentOrder}
                                            onChange={(e) => handleToggleSilentOrder(e.target.checked)}
                                        />
                                        <label className="form-check-label visually-hidden" htmlFor="silentOrderToggle">
                                            Toggle 1-Click Silent Order & Drop
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </ProfileCard>
                    </div>

                    <div className="col-lg-12">
                        <ProfileCard title="Most Visited Islands" icon="fa-location-dot">
                            <IslandVisitTable visits={mostVisited} emptyText="No favorite islands yet." />
                        </ProfileCard>
                    </div>

                    <div className="col-lg-8">
                        <ProfileCard title="Recent Visits" icon="fa-clock-rotate-left">
                            <IslandVisitTable visits={recentVisits} emptyText="No recent visits recorded." showDate />
                        </ProfileCard>
                    </div>

                    <div className="col-lg-4">
                        <ProfileCard title="Warnings" icon="fa-shield-heart">
                            {Array.isArray(warningSummary) && warningSummary.length > 0 ? (
                                <PaginatedTable
                                    columns={["Warning"]}
                                    rows={warningSummary.map((warning) => [warning])}
                                    searchable={false}
                                />
                            ) : warningSummary && !Array.isArray(warningSummary) && Object.keys(warningSummary).length > 0 ? (
                                <PaginatedTable
                                    columns={["Warning", "Count"]}
                                    rows={Object.entries(warningSummary).map(([label, count]) => [
                                        label.replaceAll("_", " "),
                                        formatNumber(count),
                                    ])}
                                    searchable={false}
                                />
                            ) : (
                                <div className="text-center py-4">
                                    <i className="fa-solid fa-circle-check text-success display-6 mb-3" aria-hidden="true"></i>
                                    <p className="fw-bold text-muted mb-0">No warnings on your account.</p>
                                </div>
                            )}
                        </ProfileCard>
                    </div>
                </div>

                <div className="text-center mt-5">
                    <Link to="/islands" className="btn btn-nook rounded-pill fw-black px-4 py-3">
                        <i className="fa-solid fa-plane-departure me-2" aria-hidden="true"></i>
                        Browse Islands
                    </Link>
                </div>
            </div>
        </div>
    );
};

interface ProfileStatProps {
    label: string;
    value: string;
    icon: string;
    color?: "success" | "danger";
}

const ProfileStat = ({ label, value, icon, color = "success" }: ProfileStatProps) => (
    <div className="col-4">
        <div className="bg-light rounded-4 border p-3 text-center h-100">
            <i className={`fa-solid ${icon} text-${color} mb-2`} aria-hidden="true"></i>
            <div className="h4 ac-font text-dark mb-0">{value}</div>
            <div className="tiny-text text-muted fw-black text-uppercase">{label}</div>
        </div>
    </div>
);

interface ProfileCardProps {
    title: string;
    icon: string;
    children: React.ReactNode;
}

const ProfileCard = ({ title, icon, children }: ProfileCardProps) => (
    <section className="bg-white rounded-4 shadow-sm border h-100 p-4">
        <div className="d-flex align-items-center gap-3 mb-4">
            <div className="icon-bubble bg-success bg-opacity-10 text-success">
                <i className={`fa-solid ${icon}`} aria-hidden="true"></i>
            </div>
            <h2 className="h5 ac-font text-dark mb-0">{title}</h2>
        </div>
        {children}
    </section>
);

interface ProfileFieldProps {
    label: string;
    value?: string;
}

const ProfileField = ({ label, value }: ProfileFieldProps) => (
    <div className="passport-field mb-3">
        <div className="tiny-text text-muted fw-black text-uppercase mb-1">{label}</div>
        <div className="fw-bold text-dark text-break">{value || "Not available"}</div>
    </div>
);

interface PillListProps {
    title: string;
    items: string[];
    emptyText: string;
    tone?: "success" | "warning";
}

const PillList = ({ title, items, emptyText, tone = "success" }: PillListProps) => (
    <div className="col-12">
        <h3 className="h6 fw-black text-uppercase text-muted mb-3">{title}</h3>
        {items.length > 0 ? (
            <div className="d-flex flex-wrap gap-2">
                {items.map((item) => (
                    <span className={`badge rounded-pill bg-${tone}-subtle text-${tone} border border-${tone}-subtle px-3 py-2`} key={item}>
                        {item}
                    </span>
                ))}
            </div>
        ) : (
            <EmptyLine text={emptyText} />
        )}
    </div>
);

interface PaginatedTableProps {
    columns: string[];
    rows: string[][];
    searchable?: boolean;
    perPage?: number;
}

const PaginatedTable = ({ columns, rows, searchable = true, perPage = 5 }: PaginatedTableProps) => {
    const tableRef = useRef<HTMLTableElement | null>(null);

    // Content-based key so the datatable only rebuilds when the actual
    // displayed data changes, not on every render. Kept lightweight
    // (length + values) rather than a full JSON.stringify of both arrays.
    const tableKey = useMemo(
        () => `${columns.join("|")}::${rows.length}::${rows.map((row) => row.join(",")).join(";")}`,
        [columns, rows]
    );

    useEffect(() => {
        if (!tableRef.current || rows.length === 0) return;

        let dataTable: import('simple-datatables').DataTable | undefined;

        // Lazy-load simple-datatables and its CSS only when a table is actually rendered
        Promise.all([
            import('simple-datatables'),
            import('simple-datatables/dist/style.css'),
        ]).then(([{ DataTable }]) => {
            if (!tableRef.current) return;
            dataTable = new DataTable(tableRef.current, {
                searchable,
                perPage,
                perPageSelect: [5, 10, 25],
                fixedHeight: false,
                labels: {
                    placeholder: "Search...",
                    perPage: "rows per page",
                    noRows: "No rows found",
                    info: "Showing {start} to {end} of {rows} rows",
                },
            });
        });

        return () => dataTable?.destroy();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableKey, searchable, perPage, rows.length]);

    return (
        <div className="profile-table-wrap mb-4">
            <table ref={tableRef} className="table table-hover align-middle mb-0 profile-table">
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th key={column} scope="col">{column}</th>
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
    // Memoize the derived columns/rows so PaginatedTable receives stable-content
    // arrays and its tableKey comparison stays cheap and meaningful.
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
                    ? [...base, formatDate(visit.visited_at ?? visit.last_visit), formatNumber(visit.visits ?? visit.count ?? 1)]
                    : [...base, formatNumber(visit.visits ?? visit.count ?? 1)];
            }),
        [visits, showDate]
    );

    if (visits.length === 0) return <EmptyLine text={emptyText} />;

    return <PaginatedTable columns={columns} rows={rows} />;
};

const EmptyLine = ({ text }: { text: string }) => (
    <div className="bg-light border rounded-3 p-3 text-muted fw-bold small">{text}</div>
);

export default Profile;