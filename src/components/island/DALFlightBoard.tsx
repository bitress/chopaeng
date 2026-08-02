import React from "react";
import { DODO_PLACEHOLDER } from "../../config/constants";

interface DALFlightBoardProps {
    island: any;
    live: any;
    loading: boolean;
    isOrderIsland: boolean;
}

function formatPassengerCount(visitors: string | undefined): string {
    if (!visitors) return "0/7";
    const match = visitors.match(/\d+/)?.[0];
    return `${match ?? "0"}/7`;
}

export const DALFlightBoard: React.FC<DALFlightBoardProps> = ({ island, live, loading, isOrderIsland }) => {
    return (
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
                {!isOrderIsland && (
                <>
                <div className="flight-divider"></div>
                <div className="flight-row">
                    <span className="flight-label">PASSENGERS</span>
                    <span className="flight-value">{formatPassengerCount(live?.visitors)}</span>
                </div>
                </>
                )}
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
    );
};
