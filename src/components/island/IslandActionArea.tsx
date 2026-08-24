import React from "react";
import { Link } from "react-router-dom";
import { useCommandBuilderPockets } from "../../hooks/useCommandBuilderPockets";
import type { BotStatusResponse } from "../../utils/orderBotApi";
import { ORDER_MAX } from "../../constants/limits";

interface IslandActionAreaProps {
    islandName?: string;
    isOrderIsland: boolean;
    canShowDodo: boolean;
    needsAuth: boolean;
    onRevealCode: () => void;
    dodoUiConfig: any;
    isRevealableState: boolean;
    user: any;
    login: () => void;
    botStatus?: BotStatusResponse | null;
    botLoading?: boolean;
}

const FALLBACK_IMG =
    "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0fdf4'/%3E%3Ctext x='50' y='62' text-anchor='middle' font-size='40'%3E📦%3C/text%3E%3C/svg%3E";

export const IslandActionArea: React.FC<IslandActionAreaProps> = ({
    islandName,
    isOrderIsland,
    canShowDodo,
    needsAuth,
    onRevealCode,
    dodoUiConfig,
    isRevealableState,
    user,
    login,
    botStatus,
    botLoading,
}) => {
    const { totalOrderCount, orderItems } = useCommandBuilderPockets();

    if (isOrderIsland) {
        const isOnline = botStatus?.success && botStatus.accepting_commands !== false;
        const capacityPct = Math.min(100, Math.round((totalOrderCount / ORDER_MAX) * 100));

        return (
            <div className="rounded-4 p-4 order-bot-island-card shadow-sm border">
                {/* Header */}
                <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                    <div className="d-flex align-items-center gap-3">
                        <span className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 order-bot-icon">
                            <i className="fa-solid fa-box-open"></i>
                        </span>
                        <div>
                            <div className="fw-black order-bot-title">ORDER BOT ISLAND</div>
                            <div className="text-muted small lh-sm">
                                {islandName ? `Custom delivery for ${islandName}` : "Custom item & villager delivery"}
                            </div>
                        </div>
                    </div>

                    {/* Live Status Badge */}
                    <div>
                        {botLoading ? (
                            <span className="badge rounded-pill bg-light text-muted border px-3 py-2">
                                <span className="spinner-border spinner-border-sm me-1" style={{ width: 10, height: 10 }} />
                                Connecting…
                            </span>
                        ) : isOnline ? (
                            <span className="badge rounded-pill bg-success text-white px-3 py-2 fw-bold d-inline-flex align-items-center gap-1">
                                <span className="p-1 rounded-circle bg-white" style={{ width: 6, height: 6 }} />
                                Online
                                {typeof botStatus?.queue_count === "number" && (
                                    <span className="ms-1 opacity-75">· Queue: {botStatus.queue_count}</span>
                                )}
                            </span>
                        ) : (
                            <span className="badge rounded-pill bg-danger text-white px-3 py-2 fw-bold">
                                Offline
                            </span>
                        )}
                    </div>
                </div>

                {/* Pocket Status Preview */}
                <div className="bg-white rounded-4 border p-3 mb-3 shadow-2xs">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                        <div className="d-flex align-items-center gap-2">
                            <i className="fa-solid fa-bag-shopping text-success"></i>
                            <span className="fw-bold small text-dark">Your Loaded Pocket</span>
                        </div>
                        <span className="badge bg-success bg-opacity-10 text-success rounded-pill fw-bold x-small">
                            {totalOrderCount} / {ORDER_MAX} Slots ({capacityPct}%)
                        </span>
                    </div>

                    {/* Progress bar */}
                    <div className="progress mb-2" style={{ height: "6px", borderRadius: "10px" }}>
                        <div
                            className="progress-bar bg-success transition-all"
                            role="progressbar"
                            style={{ width: `${capacityPct}%` }}
                            aria-valuenow={totalOrderCount}
                            aria-valuemin={0}
                            aria-valuemax={ORDER_MAX}
                        />
                    </div>

                    {/* Pocket items sprite row */}
                    {orderItems.length > 0 ? (
                        <div className="d-flex align-items-center gap-1 overflow-x-auto py-1">
                            {orderItems.slice(0, 10).map((entry, idx) => (
                                <div
                                    key={`${entry.item.id}-${idx}`}
                                    className="p-1 border rounded-3 bg-light d-flex align-items-center justify-content-center flex-shrink-0"
                                    style={{ width: 34, height: 34 }}
                                    title={`${entry.item.name}${entry.quantity > 1 ? ` ×${entry.quantity}` : ""}`}
                                >
                                    <img
                                        src={entry.item.image || FALLBACK_IMG}
                                        alt={entry.item.name}
                                        style={{ width: 24, height: 24, objectFit: "contain" }}
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG;
                                        }}
                                    />
                                </div>
                            ))}
                            {orderItems.length > 10 && (
                                <span className="tiny-text text-muted fw-bold ms-1">
                                    +{orderItems.length - 10} more
                                </span>
                            )}
                        </div>
                    ) : (
                        <p className="tiny-text text-muted mb-0">
                            Your pocket is currently empty. Build items in Command Builder or open Order Bot to order.
                        </p>
                    )}
                </div>

                {/* Primary Actions */}
                <div className="d-flex flex-column gap-2 mb-3">
                    <Link
                        to="/order"
                        className="btn btn-nook text-white fw-bold d-flex align-items-center justify-content-center gap-2 rounded-pill py-2 shadow-sm"
                    >
                        <i className="fa-solid fa-paper-plane"></i>
                        <span>{totalOrderCount > 0 ? `Send Order (${totalOrderCount} items) →` : "Open Order Bot →"}</span>
                    </Link>

                    <div className="d-flex gap-2">
                        <Link
                            to="/command-builder"
                            className="btn btn-outline-success fw-bold d-flex align-items-center justify-content-center gap-2 rounded-pill py-2 flex-grow-1 btn-sm"
                        >
                            <i className="fa-solid fa-cubes-stacked"></i>
                            <span>Command Builder</span>
                        </Link>
                        <Link
                            to="/pockets"
                            className="btn btn-outline-secondary fw-bold d-flex align-items-center justify-content-center gap-2 rounded-pill py-2 btn-sm px-3"
                        >
                            <i className="fa-solid fa-grip"></i>
                            <span>Pocket Grid</span>
                        </Link>
                    </div>
                </div>

                {/* Secondary Discord / Twitch Community Links */}
                <div className="pt-2 border-top d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <span className="tiny-text text-muted">Also available in chat:</span>
                    <div className="d-flex gap-2">
                        <a
                            href="https://discord.gg/chopaeng"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-xs btn-light text-muted border rounded-pill px-2 py-1 tiny-text fw-bold d-inline-flex align-items-center gap-1"
                        >
                            <i className="fa-brands fa-discord text-primary"></i>
                            <span>Discord</span>
                        </a>
                        <a
                            href="https://www.twitch.tv/chopaeng"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-xs btn-light text-muted border rounded-pill px-2 py-1 tiny-text fw-bold d-inline-flex align-items-center gap-1"
                        >
                            <i className="fa-brands fa-twitch text-danger"></i>
                            <span>Twitch</span>
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
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
                            {dodoUiConfig.code({ freeLiveCode: null, revealedCode: null })}
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
                    <div className="icon-wrap">
                        <i className="fa-brands fa-patreon"></i>
                    </div>
                    <span className="text-wrap">
                        <span className="fw-bold">Patreon Subscriber Exclusive</span>
                        <span className="small opacity-75 d-block">Join our Patreon to unlock access</span>
                    </span>
                    <i className="fa-solid fa-chevron-right ms-auto opacity-50"></i>
                </a>
            )}
        </>
    );
};
