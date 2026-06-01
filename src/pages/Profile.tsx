import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { DataTable } from "simple-datatables";
import "simple-datatables/dist/style.css";
import { DODO_API_BASE } from "../config/api";
import { getAuthToken } from "../context/authToken";
import { useAuth } from "../context/useAuth";

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
    alert_subscriptions?: ProfileIslandAlert[];
    island_alert_subscriptions?: ProfileIslandAlert[];
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

interface ProfileIslandAlert {
    island_id?: string;
    island_name?: string;
    name?: string;
    type?: string;
    created_at?: string;
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

const roleLabel = (role: string | ProfileRole) => typeof role === "string" ? role : role.name || role.id;

const compactRoleList = (roles?: Array<string | ProfileRole>) => {
    const values = asArray(roles);
    if (values.length === 0) return "Any subscription role";
    const labels = values.map(roleLabel);
    if (labels.length <= 2) return labels.join(", ");
    return `${labels.slice(0, 2).join(", ")} +${labels.length - 2}`;
};

const formatDate = (value?: string | number | null) => {
    if (!value) return "Not available";
    const date = typeof value === "number" ? new Date(value * 1000) : new Date(value);
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

    useEffect(() => {
        document.title = "My Chopaeng Profile";
    }, []);

    useEffect(() => {
        if (authLoading) return;

        const token = getAuthToken();
        if (!token) {
            setLoading(false);
            return;
        }

        let active = true;
        setLoading(true);
        setError("");

        fetch(`${DODO_API_BASE}/api/profile`, {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
        })
            .then(async (resp) => {
                if (!resp.ok) {
                    const body = await resp.json().catch(() => ({}));
                    throw new Error(body.error || "Unable to load your profile.");
                }
                return resp.json() as Promise<ProfileResponse>;
            })
            .then((data) => {
                if (active) setProfile(data);
            })
            .catch((err: Error) => {
                if (active) setError(err.message || "Unable to load your profile.");
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [authLoading]);

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

    const islandTypeVisits = profile?.visits.by_island_type ?? profile?.visits.visits_by_island_type ?? {};
    const accessibleIslands = asArray(
        profile?.subscriptions.accessible_member_islands ?? profile?.subscriptions.accessible_islands
    );
    const alertSubscriptions = asArray(
        profile?.subscriptions.island_alert_subscriptions ?? profile?.subscriptions.alert_subscriptions
    );
    const mostVisited = asArray(profile?.visits.most_visited_islands);
    const recentVisits = asArray(profile?.visits.recent_visits);
    const warningSummary = profile?.visits.warning_summary;
    const profileUser = profile?.user;
    const displayName = profileUser?.display_name || authUser?.username || "Chopaeng member";

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
            <div className="nook-bg min-vh-100 d-flex align-items-center justify-content-center p-4">
                <div className="bg-white rounded-4 shadow-sm border p-4 p-md-5 text-center" style={{ maxWidth: 520 }}>
                    <div className="d-inline-flex align-items-center justify-content-center rounded-circle text-white mb-4" style={{ width: 76, height: 76, backgroundColor: "#5865F2" }}>
                        <i className="fa-brands fa-discord fa-2x"></i>
                    </div>
                    <h1 className="ac-font h2 text-dark mb-3">Member Profile</h1>
                    <p className="text-muted fw-bold mb-4">Login with Discord to see your island access, visit history, alerts, and server profile.</p>
                    <button type="button" onClick={login} className="btn btn-success rounded-pill fw-black px-4 py-3">
                        <i className="fa-solid fa-right-to-bracket me-2"></i>
                        Login with Discord
                    </button>
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
                        Refresh Discord login
                    </button>
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
                                    <img src={profileUser.avatar} alt="" className="w-100 h-100 object-fit-cover" />
                                ) : (
                                    <div className="w-100 h-100 d-flex align-items-center justify-content-center text-success">
                                        <i className="fa-brands fa-discord fa-3x"></i>
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-success fw-black text-uppercase tiny-text mb-2">Discord Passport</p>
                                <h1 className="ac-font display-6 text-dark mb-2">{displayName}</h1>
                                <div className="d-flex flex-wrap gap-2">
                                    {profileUser?.is_admin && <span className="badge rounded-pill bg-dark px-3 py-2">Admin</span>}
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
                                <ProfileStat label="Denied" value={formatNumber(profile?.visits.unauthorized)} icon="fa-ban" color="danger" />
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

                            <h3 className="h6 fw-black text-uppercase text-muted mb-3">Accessible member islands</h3>
                            {accessibleIslands.length > 0 ? (
                                <PaginatedTable
                                    columns={["Island", "Type", "Required Roles"]}
                                    rows={accessibleIslands.map((island) => [
                                        island.name ?? island.id ?? "Member island",
                                        island.type ?? "Member",
                                        compactRoleList(island.required_roles),
                                    ])}
                                />
                            ) : (
                                <EmptyLine text="No member islands unlocked yet." />
                            )}

                            <h3 className="h6 fw-black text-uppercase text-muted mb-3">Island alerts</h3>
                            {alertSubscriptions.length > 0 ? (
                                <PaginatedTable
                                    columns={["Island", "Type", "Subscribed"]}
                                    rows={alertSubscriptions.map((alert) => [
                                        alert.island_name ?? alert.name ?? alert.island_id ?? "Island alert",
                                        alert.type ?? "Alert",
                                        formatDate(alert.created_at),
                                    ])}
                                />
                            ) : (
                                <EmptyLine text="No island alerts subscribed." />
                            )}
                        </ProfileCard>
                    </div>

                    <div className="col-lg-5">
                        <ProfileCard title="Visits By Island Type" icon="fa-chart-pie">
                            {Object.entries(islandTypeVisits).length > 0 ? (
                                <div className="d-flex flex-column gap-3">
                                    {Object.entries(islandTypeVisits).map(([type, count]) => (
                                        <div key={type}>
                                            <div className="d-flex justify-content-between fw-bold small mb-1">
                                                <span className="text-capitalize">{type}</span>
                                                <span>{formatNumber(count)}</span>
                                            </div>
                                            <div className="progress rounded-pill bg-secondary-subtle" style={{ height: 10 }}>
                                                <div className="progress-bar bg-success rounded-pill" style={{ width: `${Math.min(100, (count / Math.max(1, profile?.visits.total ?? count)) * 100)}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyLine text="No visit type data yet." />
                            )}
                        </ProfileCard>
                    </div>

                    <div className="col-lg-7">
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
                                    <i className="fa-solid fa-circle-check text-success display-6 mb-3"></i>
                                    <p className="fw-bold text-muted mb-0">No warnings on your account.</p>
                                </div>
                            )}
                        </ProfileCard>
                    </div>
                </div>

                <div className="text-center mt-5">
                    <Link to="/islands" className="btn btn-nook rounded-pill fw-black px-4 py-3">
                        <i className="fa-solid fa-plane-departure me-2"></i>
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
            <i className={`fa-solid ${icon} text-${color} mb-2`}></i>
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
                <i className={`fa-solid ${icon}`}></i>
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
    const tableKey = useMemo(() => JSON.stringify({ columns, rows }), [columns, rows]);

    useEffect(() => {
        if (!tableRef.current || rows.length === 0) return;

        const dataTable = new DataTable(tableRef.current, {
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

        return () => dataTable.destroy();
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
    if (visits.length === 0) return <EmptyLine text={emptyText} />;

    const columns = showDate ? ["Island", "Type", "Status", "Visited", "Visits"] : ["Island", "Type", "Status", "Visits"];
    const rows = visits.map((visit) => {
        const base = [
            visit.island_name ?? visit.name ?? visit.island_id ?? "Island",
            visit.type ?? "Treasure island",
            visit.authorized === false ? "Denied" : "Authorized",
        ];

        return showDate
            ? [...base, formatDate(visit.visited_at ?? visit.last_visit), formatNumber(visit.visits ?? visit.count ?? 1)]
            : [...base, formatNumber(visit.visits ?? visit.count ?? 1)];
    });

    return <PaginatedTable columns={columns} rows={rows} />;
};

const EmptyLine = ({ text }: { text: string }) => (
    <div className="bg-light border rounded-3 p-3 text-muted fw-bold small">{text}</div>
);

export default Profile;
