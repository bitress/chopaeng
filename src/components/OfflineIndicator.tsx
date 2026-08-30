import React, { useState, useEffect } from 'react';

export const OfflineIndicator: React.FC = () => {
    const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setDismissed(false);
        };
        const handleOffline = () => {
            setIsOnline(false);
            setDismissed(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (isOnline || dismissed) return null;

    return (
        <aside
            aria-live="polite"
            role="status"
            className="position-fixed top-0 start-50 translate-middle-x mt-3 px-3 py-2 rounded-pill shadow-lg d-flex align-items-center gap-2 animate-bounce-in"
            style={{
                zIndex: 9999,
                backgroundColor: 'rgba(30, 41, 59, 0.95)',
                backdropFilter: 'blur(8px)',
                color: '#f8fafc',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                fontSize: '0.85rem',
            }}
        >
            <span className="badge rounded-circle bg-warning text-dark p-1" style={{ width: 10, height: 10 }}> </span>
            <span className="fw-bold">
                <i className="fa-solid fa-plane-slash me-1 text-warning" /> Offline Mode
            </span>
            <span className="text-white-50 d-none d-sm-inline">
                • Browsing cached catalog data
            </span>
            <button
                type="button"
                className="btn btn-sm btn-link text-white-50 hover-text-white p-0 ms-2"
                onClick={() => setDismissed(true)}
                title="Dismiss"
                aria-label="Dismiss offline banner"
            >
                <i className="fa-solid fa-xmark" />
            </button>
        </aside>
    );
};

export default OfflineIndicator;
