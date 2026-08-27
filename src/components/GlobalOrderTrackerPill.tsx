import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { pollOrderStatus, type OrderStatusResponse } from '../utils/orderBotApi';
import { getAuthToken } from '../context/authToken';
import { playChimeClick } from '../utils/kkAudioSynthesizer';

const LS_ORDER_KEY = 'chopaeng_active_order';
const POLL_INTERVAL = 15_000;

export const GlobalOrderTrackerPill: React.FC = () => {
    const location = useLocation();
    const token = getAuthToken();

    const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
    const [orderStatus, setOrderStatus] = useState<OrderStatusResponse | null>(null);
    const [isDismissed, setIsDismissed] = useState(false);

    // Read active order from localStorage
    const checkActiveOrder = useCallback(() => {
        try {
            const raw = localStorage.getItem(LS_ORDER_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed?.orderId) {
                    setActiveOrderId(parsed.orderId);
                    return parsed.orderId;
                }
            }
        } catch {
            // ignore
        }
        setActiveOrderId(null);
        setOrderStatus(null);
        return null;
    }, []);

    const pollStatus = useCallback(async (orderId: string) => {
        const status = await pollOrderStatus(orderId, token);
        setOrderStatus(status);
        if (['completed', 'cancelled', 'error'].includes(status.status)) {
            try {
                localStorage.removeItem(LS_ORDER_KEY);
            } catch {
                // ignore
            }
        }
    }, [token]);

    useEffect(() => {
        const id = checkActiveOrder();
        if (id) {
            pollStatus(id);
        }

        const handleStorage = () => {
            const currentId = checkActiveOrder();
            if (currentId) pollStatus(currentId);
        };

        window.addEventListener('storage', handleStorage);
        const timer = setInterval(() => {
            const currentId = checkActiveOrder();
            if (currentId) pollStatus(currentId);
        }, POLL_INTERVAL);

        return () => {
            window.removeEventListener('storage', handleStorage);
            clearInterval(timer);
        };
    }, [checkActiveOrder, pollStatus]);

    // Don't display the floating pill on the /order page itself (it has full flight radar) or if no active order
    if (location.pathname === '/order' || !activeOrderId || isDismissed) {
        return null;
    }

    const status = orderStatus?.status || 'queued';
    const isReady = status === 'ready' || Boolean(orderStatus?.dodoCode);
    const isPreparing = status === 'preparing';
    const queuePos = orderStatus?.queuePosition;

    return (
        <aside aria-label="Live Order Tracker" style={{ zIndex: 1040 }} className="position-fixed bottom-0 end-0 m-3 animate-up">
            <div
                className="card rounded-pill shadow-lg border-2 p-1 pe-3 d-flex flex-row align-items-center gap-2 bg-white"
                style={{
                    borderColor: isReady ? '#37b06d' : isPreparing ? '#f59e0b' : '#3b82f6',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                }}
            >
                <Link
                    to="/order"
                    onClick={() => playChimeClick()}
                    className="d-flex align-items-center gap-2 text-decoration-none text-dark"
                >
                    <div
                        className="rounded-circle d-flex align-items-center justify-content-center text-white"
                        style={{
                            width: 36,
                            height: 36,
                            backgroundColor: isReady ? '#37b06d' : isPreparing ? '#f59e0b' : '#3b82f6',
                        }}
                    >
                        {isReady ? (
                            <i className="fa-solid fa-plane-arrival" />
                        ) : isPreparing ? (
                            <i className="fa-solid fa-gears fa-spin" />
                        ) : (
                            <i className="fa-solid fa-plane-departure" />
                        )}
                    </div>
                    <div className="lh-1">
                        <div className="fw-black small text-dark d-flex align-items-center gap-1">
                            {isReady ? (
                                <span className="text-success fw-black">Dodo: {orderStatus?.dodoCode}</span>
                            ) : isPreparing ? (
                                <span className="text-warning-emphasis">Preparing on Island...</span>
                            ) : (
                                <span>
                                    Queue Position:{' '}
                                    <strong className="text-primary font-monospace">
                                        {typeof queuePos === 'number' && queuePos > 0 ? `#${queuePos}` : 'Next Up'}
                                    </strong>
                                </span>
                            )}
                        </div>
                        <span className="tiny-text text-muted">
                            {isReady ? 'Click to view boarding pass' : 'Click to track live flight radar'}
                        </span>
                    </div>
                </Link>
                <button
                    type="button"
                    className="btn btn-sm btn-link text-muted hover-text-dark p-0 ms-1"
                    onClick={() => setIsDismissed(true)}
                    title="Dismiss notification"
                    aria-label="Dismiss active order tracker"
                >
                    <i className="fa-solid fa-xmark x-small" />
                </button>
            </div>
        </aside>
    );
};

export default GlobalOrderTrackerPill;
