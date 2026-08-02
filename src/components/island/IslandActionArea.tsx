import React from "react";

interface IslandActionAreaProps {
    isOrderIsland: boolean;
    canShowDodo: boolean;
    needsAuth: boolean;
    onRevealCode: () => void;
    dodoUiConfig: any;
    isRevealableState: boolean;
    user: any;
    login: () => void;
}

export const IslandActionArea: React.FC<IslandActionAreaProps> = ({
    isOrderIsland,
    canShowDodo,
    needsAuth,
    onRevealCode,
    dodoUiConfig,
    isRevealableState,
    user,
    login,
}) => {
    if (isOrderIsland) {
        return (
            <div
                className="rounded-4 p-4 order-bot-card"
            >
                <div className="d-flex align-items-center gap-3 mb-3">
                    <span
                        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 order-bot-icon"
                    >
                        <i className="fa-solid fa-box-open"></i>
                    </span>
                    <div>
                        <div
                            className="fw-black order-bot-title"
                        >
                            ORDER BOT ISLAND
                        </div>
                        <div className="text-muted small lh-sm">
                            Dodo codes are issued after ordering
                        </div>
                    </div>
                </div>

                <p className="text-muted mb-3 order-bot-desc">
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
                        className="btn fw-bold d-flex align-items-center justify-content-center gap-2 rounded-pill py-2 btn-discord"
                    >
                        <i className="fa-brands fa-discord fs-5"></i>
                        <span>Order on Discord</span>
                        <i className="fa-solid fa-arrow-up-right-from-square small opacity-75 ms-1"></i>
                    </a>
                    <a
                        href="https://www.twitch.tv/chopaeng"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn fw-bold d-flex align-items-center justify-content-center gap-2 rounded-pill py-2 btn-twitch"
                    >
                        <i className="fa-brands fa-twitch fs-5"></i>
                        <span>Order on Twitch</span>
                        <i className="fa-solid fa-arrow-up-right-from-square small opacity-75 ms-1"></i>
                    </a>
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
