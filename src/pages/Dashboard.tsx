import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth, getAvatarUrl } from "../context/AuthContext";
import { useIslandData } from "../context/IslandContext";

const Dashboard = () => {
    const { user, loading: authLoading, login, logout } = useAuth();
    const { islands, loading: islandLoading, lastUpdated, refreshData } = useIslandData();

    useEffect(() => {
        document.title = "Dashboard | Chopaeng Treasure Islands";
    }, []);

    const stats = useMemo(() => {
        const online = islands.filter((i) => i.status === "ONLINE").length;
        const subOnly = islands.filter((i) => i.status === "SUB ONLY").length;
        const offline = islands.filter((i) => i.status === "OFFLINE").length;
        const refreshing = islands.filter((i) => i.status === "REFRESHING").length;
        const totalVisitors = islands.reduce((acc, i) => acc + (i.visitors ?? 0), 0);
        const publicOnline = islands.filter((i) => i.status === "ONLINE" && i.cat === "public").length;
        const memberOnline = islands.filter((i) => i.cat === "member" && i.status === "ONLINE").length;
        return { online, subOnly, offline, refreshing, totalVisitors, publicOnline, memberOnline, total: islands.length };
    }, [islands]);

    const quickActions = [
        { icon: "fa-map", label: "Treasure Islands", desc: "Browse all live islands", path: "/islands", color: "text-success" },
        { icon: "fa-magnifying-glass", label: "Find Items", desc: "Search for specific loot", path: "/find", color: "text-primary" },
        { icon: "fa-book-open", label: "Guides", desc: "Tips & island rules", path: "/guides", color: "text-warning" },
        { icon: "fa-key", label: "Dodo Translator", desc: "Decrypt encoded hashes", path: "/dodo", color: "text-danger" },
    ];

    const lastUpdatedStr = lastUpdated
        ? new Date(lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        : "—";

    return (
        <div className="nook-bg min-vh-100 py-4 py-md-5">
        <div className="container" style={{ maxWidth: "1050px" }}>

                {/* Header */}
                <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
                    <div>
                        <h1 className="fw-black ac-font text-dark mb-1 display-6">
                            <i className="fa-solid fa-gauge-high me-2 text-success"></i> Dashboard
                        </h1>
                        <p className="text-muted fw-bold mb-0 small text-uppercase tracking-wide">
                            Resident Services HQ
                        </p>
                    </div>
                    {!authLoading && !user && (
                        <button
                            onClick={login}
                            className="btn btn-primary rounded-pill px-4 py-2 fw-black shadow-sm d-flex align-items-center gap-2"
                            style={{ backgroundColor: "#5865F2", borderColor: "#5865F2" }}
                        >
                            <i className="fa-brands fa-discord"></i> Login with Discord
                        </button>
                    )}
                </div>

                {/* ── DISCORD LOGIN CARD ── */}
                {!user && !authLoading && (
                    <div className="bg-white rounded-5 shadow-sm border border-light p-4 p-md-5 mb-4 text-center position-relative overflow-hidden">
                        <div className="position-absolute top-0 start-0 w-100 h-100 opacity-5" style={{ background: "linear-gradient(135deg, #5865F2, #7289DA)" }}></div>
                        <div className="position-relative z-1">
                            <div
                                className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle shadow-sm"
                                style={{ width: 72, height: 72, backgroundColor: "#5865F2" }}
                            >
                                <i className="fa-brands fa-discord fa-2x text-white"></i>
                            </div>
                            <h2 className="fw-black ac-font text-dark mb-2">Connect Your Discord</h2>
                            <p className="text-muted fw-bold mb-4" style={{ maxWidth: 480, margin: "0 auto 1.5rem" }}>
                                Log in with your Discord account to verify your membership, access member-only islands, and manage your Chopaeng experience.
                            </p>
                            <button
                                onClick={login}
                                className="btn rounded-pill px-5 py-3 fw-black shadow-sm text-white"
                                style={{ backgroundColor: "#5865F2", borderColor: "#5865F2" }}
                            >
                                <i className="fa-brands fa-discord me-2"></i> Login with Discord
                            </button>
                            <p className="text-muted small fw-bold mt-3 mb-0">
                                We only request your username and avatar — no DM access or server permissions.
                            </p>
                        </div>
                    </div>
                )}

                {/* ── LOADING STATE ── */}
                {authLoading && (
                    <div className="bg-white rounded-5 shadow-sm border border-light p-4 mb-4 text-center">
                        <i className="fa-solid fa-circle-notch fa-spin fa-2x text-success mb-3"></i>
                        <p className="fw-bold text-muted mb-0">Connecting to Discord...</p>
                    </div>
                )}

                {/* ── USER WELCOME CARD ── */}
                {user && (
                    <div className="bg-white rounded-5 shadow-sm border border-light p-4 mb-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
                        <div className="d-flex align-items-center gap-3">
                            <img
                                src={getAvatarUrl(user)}
                                alt={user.username}
                                className="rounded-circle shadow-sm"
                                style={{ width: 64, height: 64, objectFit: "cover" }}
                            />
                            <div>
                                <h2 className="fw-black text-dark mb-0 h4">
                                    {user.global_name ?? user.username}
                                </h2>
                                <span className="text-muted fw-bold small">@{user.username}</span>
                                <div className="mt-1">
                                    <span
                                        className="badge rounded-pill px-3 py-1 text-white small fw-black"
                                        style={{ backgroundColor: "#5865F2" }}
                                    >
                                        <i className="fa-brands fa-discord me-1"></i> Connected
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="btn btn-outline-secondary rounded-pill px-4 py-2 fw-bold small"
                        >
                            <i className="fa-solid fa-right-from-bracket me-2"></i> Logout
                        </button>
                    </div>
                )}

                {/* ── ISLAND STATS GRID ── */}
                <div className="row g-3 mb-4">
                    <div className="col-6 col-md-3">
                        <div className="bg-white rounded-4 shadow-sm border border-light p-3 h-100 text-center">
                            <div className="text-success fw-black display-6 ac-font">{islandLoading ? "…" : stats.online}</div>
                            <div className="text-muted small fw-bold text-uppercase">Online Now</div>
                            <span className="live-dot bg-success d-inline-block mt-1"></span>
                        </div>
                    </div>
                    <div className="col-6 col-md-3">
                        <div className="bg-white rounded-4 shadow-sm border border-light p-3 h-100 text-center">
                            <div className="text-warning fw-black display-6 ac-font">{islandLoading ? "…" : stats.subOnly}</div>
                            <div className="text-muted small fw-bold text-uppercase">VIP Islands</div>
                            <i className="fa-solid fa-crown text-warning small mt-1"></i>
                        </div>
                    </div>
                    <div className="col-6 col-md-3">
                        <div className="bg-white rounded-4 shadow-sm border border-light p-3 h-100 text-center">
                            <div className="text-primary fw-black display-6 ac-font">{islandLoading ? "…" : stats.totalVisitors}</div>
                            <div className="text-muted small fw-bold text-uppercase">Visitors Live</div>
                            <i className="fa-solid fa-users text-primary small mt-1"></i>
                        </div>
                    </div>
                    <div className="col-6 col-md-3">
                        <div className="bg-white rounded-4 shadow-sm border border-light p-3 h-100 text-center">
                            <div className="text-dark fw-black display-6 ac-font">{islandLoading ? "…" : stats.total}</div>
                            <div className="text-muted small fw-bold text-uppercase">Total Islands</div>
                            <i className="fa-solid fa-map text-dark small mt-1"></i>
                        </div>
                    </div>
                </div>

                {/* ── ISLAND STATUS SUMMARY ── */}
                <div className="bg-white rounded-5 shadow-sm border border-light p-4 mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                        <h5 className="fw-black text-dark mb-0">
                            <i className="fa-solid fa-satellite-dish me-2 text-success"></i> Live Island Status
                        </h5>
                        <div className="d-flex align-items-center gap-2">
                            {lastUpdated && (
                                <span className="text-muted small fw-bold">Updated {lastUpdatedStr}</span>
                            )}
                            <button
                                onClick={refreshData}
                                disabled={islandLoading}
                                className="btn btn-outline-success rounded-pill px-3 py-1 fw-bold small"
                            >
                                <i className={`fa-solid fa-arrows-rotate me-1 ${islandLoading ? "fa-spin" : ""}`}></i>
                                Refresh
                            </button>
                        </div>
                    </div>

                    {islandLoading ? (
                        <div className="text-center py-4 text-muted fw-bold">
                            <i className="fa-solid fa-circle-notch fa-spin me-2"></i> Loading island data...
                        </div>
                    ) : (
                        <div className="row g-2">
                            {islands.slice(0, 6).map((island) => (
                                <div key={island.id} className="col-md-6">
                                    <Link
                                        to={`/island/${island.id}`}
                                        className="text-decoration-none d-flex align-items-center justify-content-between p-3 rounded-4 border hover-lift transition-all"
                                        style={{ backgroundColor: "#f8f9fa" }}
                                    >
                                        <div className="d-flex align-items-center gap-2">
                                            <span
                                                className={`live-dot ${
                                                    island.status === "ONLINE"
                                                        ? "bg-success pulse-ring"
                                                        : island.status === "SUB ONLY"
                                                        ? "bg-warning"
                                                        : island.status === "REFRESHING"
                                                        ? "bg-secondary"
                                                        : "bg-danger"
                                                }`}
                                            ></span>
                                            <span className="fw-black text-dark small text-capitalize">{island.name}</span>
                                            {island.cat === "member" && (
                                                <i className="fa-solid fa-crown text-warning small"></i>
                                            )}
                                        </div>
                                        <div className="d-flex align-items-center gap-2">
                                            <span
                                                className={`badge rounded-pill small ${
                                                    island.status === "ONLINE"
                                                        ? "bg-success-subtle text-success border border-success-subtle"
                                                        : island.status === "SUB ONLY"
                                                        ? "bg-warning-subtle text-warning-emphasis border border-warning-subtle"
                                                        : island.status === "REFRESHING"
                                                        ? "bg-secondary-subtle text-secondary border border-secondary-subtle"
                                                        : "bg-danger-subtle text-danger border border-danger-subtle"
                                                }`}
                                            >
                                                {island.status}
                                            </span>
                                            <span className="text-muted small fw-bold">{island.visitors}/7</span>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}

                    {islands.length > 6 && (
                        <div className="text-center mt-3">
                            <Link to="/islands" className="btn btn-outline-success rounded-pill px-4 py-2 fw-black small">
                                <i className="fa-solid fa-map me-2"></i> View All {islands.length} Islands
                            </Link>
                        </div>
                    )}
                </div>

                {/* ── QUICK ACTIONS ── */}
                <div className="mb-4">
                    <h5 className="fw-black text-dark mb-3">
                        <i className="fa-solid fa-bolt me-2 text-warning"></i> Quick Actions
                    </h5>
                    <div className="row g-3">
                        {quickActions.map((action) => (
                            <div key={action.path} className="col-6 col-md-3">
                                <Link
                                    to={action.path}
                                    className="bg-white rounded-4 shadow-sm border border-light p-3 d-flex flex-column align-items-center text-center text-decoration-none hover-lift transition-all h-100"
                                >
                                    <div
                                        className="rounded-circle d-flex align-items-center justify-content-center mb-2 shadow-sm"
                                        style={{ width: 48, height: 48, backgroundColor: "#f0f4e4" }}
                                    >
                                        <i className={`fa-solid ${action.icon} ${action.color}`}></i>
                                    </div>
                                    <span className="fw-black text-dark small">{action.label}</span>
                                    <span className="text-muted x-small fw-bold mt-1">{action.desc}</span>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── MEMBER PERKS / CTA ── */}
                {!user ? (
                    <div className="rounded-5 p-4 p-md-5 text-center" style={{ background: "linear-gradient(135deg, #7ba592 0%, #4d8a75 100%)" }}>
                        <i className="fa-solid fa-crown fa-2x text-warning mb-3"></i>
                        <h3 className="fw-black text-white ac-font mb-2">Unlock VIP Islands</h3>
                        <p className="text-white opacity-75 fw-bold mb-4">
                            Subscribe on Patreon or Twitch, link your Discord, and get instant access to private treasure islands with exclusive loot.
                        </p>
                        <div className="d-flex justify-content-center gap-3 flex-wrap">
                            <a
                                href="https://www.patreon.com/cw/chopaeng/membership"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-light rounded-pill px-4 py-2 fw-black text-dark shadow-sm"
                            >
                                <i className="fa-brands fa-patreon me-2"></i> Subscribe on Patreon
                            </a>
                            <button
                                onClick={login}
                                className="btn rounded-pill px-4 py-2 fw-black text-white shadow-sm"
                                style={{ backgroundColor: "#5865F2", borderColor: "#5865F2" }}
                            >
                                <i className="fa-brands fa-discord me-2"></i> Connect Discord
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-5 shadow-sm border border-light p-4">
                        <h5 className="fw-black text-dark mb-3">
                            <i className="fa-solid fa-star me-2 text-warning"></i> Membership Perks
                        </h5>
                        <div className="row g-3">
                            {[
                                { icon: "fa-map-location-dot", label: "Private Islands", desc: "Access VIP-only treasure islands", color: "text-warning" },
                                { icon: "fa-robot", label: "ChoBot Access", desc: "Order items via Discord bot", color: "text-primary" },
                                { icon: "fa-bell", label: "Drop Alerts", desc: "Get notified on new island drops", color: "text-success" },
                                { icon: "fa-users-line", label: "Priority Queue", desc: "Skip the line on busy islands", color: "text-danger" },
                            ].map((perk) => (
                                <div key={perk.label} className="col-md-6">
                                    <div className="d-flex align-items-center gap-3 p-3 rounded-4 border" style={{ backgroundColor: "#f8f9fa" }}>
                                        <div
                                            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                            style={{ width: 40, height: 40, backgroundColor: "#f0f4e4" }}
                                        >
                                            <i className={`fa-solid ${perk.icon} ${perk.color}`}></i>
                                        </div>
                                        <div>
                                            <div className="fw-black text-dark small">{perk.label}</div>
                                            <div className="text-muted x-small fw-bold">{perk.desc}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-3 text-center">
                            <a
                                href="https://www.patreon.com/cw/chopaeng/membership"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline-warning rounded-pill px-4 py-2 fw-black small"
                            >
                                <i className="fa-brands fa-patreon me-2"></i> Upgrade Membership
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
