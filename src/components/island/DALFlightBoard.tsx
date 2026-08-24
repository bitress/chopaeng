import React from "react";
import { DODO_PLACEHOLDER } from "../../config/constants";
import type { BotStatusResponse } from "../../utils/orderBotApi";

interface DALFlightBoardProps {
    island: any;
    live: any;
    loading: boolean;
    isOrderIsland: boolean;
    botStatus?: BotStatusResponse | null;
    botLoading?: boolean;
}

function formatPassengerCount(visitors: string | undefined): string {
    if (!visitors) return "0/7";
    const match = visitors.match(/\d+/)?.[0];
    return `${match ?? "0"}/7`;
}

export const DALFlightBoard: React.FC<DALFlightBoardProps> = ({
    island,
    live,
    loading,
    isOrderIsland,
    botStatus,
    botLoading,
}) => {
    return (
        <div className="dal-card shadow-sm">
            <div className="dal-header">
                <i className="fa-solid fa-plane-up me-2"></i> DAL Flight Info
            </div>
            <div className="dal-body">
                {/* Status Row */}
                <div className="flight-row">
                    <span className="flight-label">STATUS</span>
                    {isOrderIsland ? (
                        <span
                            className={`flight-value ${
                                botLoading
                                    ? "text-muted"
                                    : botStatus?.success && botStatus.accepting_commands !== false
                                    ? "text-dal-blue"
                                    : "text-danger"
                            }`}
                        >
                            {botLoading ? (
                                <span className="pulse">SCANNING BOT...</span>
                            ) : botStatus?.success && botStatus.accepting_commands !== false ? (
                                "ACCEPTING ORDERS"
                            ) : (
                                "OFFLINE"
                            )}
                        </span>
                    ) : (
                        <span
                            className={`flight-value ${
                                live?.isOnline && live?.dodo !== DODO_PLACEHOLDER.GETTING
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
                    )}
                </div>

                {/* Second Row: Passengers or Order Queue */}
                <div className="flight-divider"></div>
                {isOrderIsland ? (
                    <div className="flight-row">
                        <span className="flight-label">QUEUE</span>
                        <span className="flight-value text-dal-blue">
                            {botLoading ? "--" : `${botStatus?.queue_count ?? 0} in queue`}
                        </span>
                    </div>
                ) : (
                    <div className="flight-row">
                        <span className="flight-label">PASSENGERS</span>
                        <span className="flight-value">{formatPassengerCount(live?.visitors)}</span>
                    </div>
                )}

                {/* Third Row: Gate Type */}
                <div className="flight-divider"></div>
                <div className="flight-row">
                    <span className="flight-label">GATE TYPE</span>
                    <span className="flight-value text-warning">
                        {isOrderIsland ? "ORDER BOT (PRIVATE DODO)" : live?.access || "PUBLIC"}
                    </span>
                </div>

                {/* Optional Battery Row for Order Island */}
                {isOrderIsland && typeof botStatus?.battery_charge === "number" && (
                    <>
                        <div className="flight-divider"></div>
                        <div className="flight-row">
                            <span className="flight-label">SWITCH BATTERY</span>
                            <span className="flight-value text-muted">{botStatus.battery_charge}%</span>
                        </div>
                    </>
                )}
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
    );
};
