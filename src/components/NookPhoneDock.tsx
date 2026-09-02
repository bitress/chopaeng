import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    THEME_OPTIONS,
    getStoredTheme,
    setStoredTheme,
    type ThemeMode,
} from '../utils/theme';
import { playChimeClick } from '../utils/kkAudioSynthesizer';
import { pollOrderStatus, type OrderStatusResponse } from '../utils/orderBotApi';
import { getAuthToken } from '../context/authToken';
import {
    notifyOrderStatusChange,
    requestNotificationPermission,
    getNotificationPermission,
    areNotificationsEnabled,
    setNotificationsEnabled,
} from '../utils/orderNotifications';

const LS_ORDER_KEY = 'chopaeng_active_order';
const POLL_INTERVAL = 15_000;

const THEME_CASE_STYLES: Record<ThemeMode, {
    caseBg: string;
    bezelBorder: string;
    screenBg: string;
    isDark: boolean;
    headerBadgeBg: string;
    headerBadgeText: string;
    accentGlow: string;
    accentColor: string;
}> = {
    nook: {
        caseBg: 'linear-gradient(150deg, #38b26e, #237b4b)',
        bezelBorder: '#1d603a',
        screenBg: '#fffdfa',
        isDark: false,
        headerBadgeBg: '#dcfce7',
        headerBadgeText: '#15803d',
        accentGlow: 'rgba(56, 178, 110, 0.4)',
        accentColor: '#16a34a',
    },
    celeste: {
        caseBg: 'linear-gradient(150deg, #3730a3, #1e1b4b)',
        bezelBorder: '#4f46e5',
        screenBg: '#0f172a',
        isDark: true,
        headerBadgeBg: '#ede9fe',
        headerBadgeText: '#6d28d9',
        accentGlow: 'rgba(139, 92, 246, 0.45)',
        accentColor: '#8b5cf6',
    },
    roost: {
        caseBg: 'linear-gradient(150deg, #5e351d, #381e11)',
        bezelBorder: '#78350f',
        screenBg: '#1c1917',
        isDark: true,
        headerBadgeBg: '#fef3c7',
        headerBadgeText: '#b45309',
        accentGlow: 'rgba(217, 119, 6, 0.4)',
        accentColor: '#b45309',
    },
    sakura: {
        caseBg: 'linear-gradient(150deg, #f472b6, #db2777)',
        bezelBorder: '#be185d',
        screenBg: '#fdf2f8',
        isDark: false,
        headerBadgeBg: '#fce7f3',
        headerBadgeText: '#be185d',
        accentGlow: 'rgba(244, 114, 182, 0.45)',
        accentColor: '#ec4899',
    },
    dal: {
        caseBg: 'linear-gradient(150deg, #0284c7, #0f172a)',
        bezelBorder: '#38bdf8',
        screenBg: '#0f172a',
        isDark: true,
        headerBadgeBg: '#e0f2fe',
        headerBadgeText: '#0369a1',
        accentGlow: 'rgba(56, 189, 248, 0.45)',
        accentColor: '#0284c7',
    },
    nooklink: {
        caseBg: 'linear-gradient(150deg, #111827, #030712)',
        bezelBorder: '#10b981',
        screenBg: '#090d16',
        isDark: true,
        headerBadgeBg: '#d1fae5',
        headerBadgeText: '#047857',
        accentGlow: 'rgba(16, 185, 129, 0.45)',
        accentColor: '#10b981',
    },
};

export const NookPhoneDock: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentTheme, setCurrentTheme] = useState<ThemeMode>(getStoredTheme);
    const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
    const [dodoCopied, setDodoCopied] = useState(false);

    // Order Tracking State inside NookPhone
    const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
    const [orderStatus, setOrderStatus] = useState<OrderStatusResponse | null>(null);
    const [notificationsOn, setNotificationsOn] = useState<boolean>(() => areNotificationsEnabled() && getNotificationPermission() === 'granted');

    const previousStatusRef = useRef<string | null>(null);
    const previousDodoRef = useRef<string | null>(null);
    const phoneRef = useRef<HTMLDivElement | null>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const token = getAuthToken();

    // Keep live clock updated
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTimeStr(
                now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            );
        };
        updateTime();
        const timer = setInterval(updateTime, 10000);
        return () => clearInterval(timer);
    }, []);

    // Sync theme updates
    useEffect(() => {
        const handleThemeUpdate = (e: any) => {
            if (e.detail?.theme) {
                setCurrentTheme(e.detail.theme);
            }
        };
        window.addEventListener('chopaeng_theme_updated', handleThemeUpdate);
        return () => window.removeEventListener('chopaeng_theme_updated', handleThemeUpdate);
    }, []);

    // Read active order from localStorage
    const checkActiveOrder = useCallback(() => {
        try {
            const raw = localStorage.getItem(LS_ORDER_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed?.orderId && typeof parsed.orderId === 'string' && parsed.orderId.trim()) {
                    setActiveOrderId(parsed.orderId.trim());
                    return parsed.orderId.trim();
                }
            }
        } catch {
            // ignore
        }
        localStorage.removeItem(LS_ORDER_KEY);
        setActiveOrderId(null);
        setOrderStatus(null);
        return null;
    }, []);

    const pollStatus = useCallback(async (orderId: string) => {
        try {
            const status = await pollOrderStatus(orderId, token);

            // If order is completed, cancelled, error, or not found, clean up immediately
            if (!status || ['completed', 'cancelled', 'error'].includes(status.status)) {
                localStorage.removeItem(LS_ORDER_KEY);
                setActiveOrderId(null);
                setOrderStatus(null);
                return;
            }

            setOrderStatus(status);

            // Check for state transitions and alert the user
            const prev = previousStatusRef.current;
            const current = status.status;
            const currentDodo = status.dodoCode;

            if (prev && prev !== current) {
                if (current === 'preparing' && prev === 'queued') {
                    notifyOrderStatusChange(
                        'Order Preparing!',
                        'Your items are now being spawned on the island...',
                        'preparing'
                    );
                } else if (current === 'ready' || (currentDodo && currentDodo !== previousDodoRef.current)) {
                    notifyOrderStatusChange(
                        'Dodo Flight Pass Ready!',
                        `Dodo Code: ${currentDodo || 'ACTIVE'}. Click to view your boarding pass!`,
                        'ready'
                    );
                }
            } else if (!prev && (current === 'ready' || currentDodo)) {
                if (currentDodo && currentDodo !== previousDodoRef.current) {
                    notifyOrderStatusChange(
                        'Dodo Flight Pass Ready!',
                        `Dodo Code: ${currentDodo}. Click to view your boarding pass!`,
                        'ready'
                    );
                }
            }

            previousStatusRef.current = current;
            if (currentDodo) previousDodoRef.current = currentDodo;
        } catch {
            // On network error or 404, don't invent a false active queue
            setOrderStatus(null);
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

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (phoneRef.current && !phoneRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const togglePhone = () => {
        playChimeClick();
        setIsOpen(!isOpen);
    };

    const handleAppClick = (action: () => void) => {
        playChimeClick();
        action();
        setIsOpen(false);
    };

    const handleCopyDodo = (dodo: string) => {
        playChimeClick();
        navigator.clipboard.writeText(dodo);
        setDodoCopied(true);
        setTimeout(() => setDodoCopied(false), 2000);
    };

    const handleToggleNotifications = async () => {
        playChimeClick();
        if (!notificationsOn) {
            const granted = await requestNotificationPermission();
            setNotificationsOn(granted);
            if (granted) {
                notifyOrderStatusChange('ChoPaeng Flight Alerts', 'You will be notified when your Dodo flight is ready!', 'preparing');
            }
        } else {
            setNotificationsEnabled(false);
            setNotificationsOn(false);
        }
    };

    const currentStyle = THEME_CASE_STYLES[currentTheme] || THEME_CASE_STYLES.nook;

    const orderStateStatus = orderStatus?.status;
    const isOrderReady = orderStateStatus === 'ready' || Boolean(orderStatus?.dodoCode);
    const isOrderPreparing = orderStateStatus === 'preparing';
    const queuePos = typeof orderStatus?.queuePosition === 'number' && orderStatus.queuePosition > 0 ? orderStatus.queuePosition : undefined;
    const dodoCode = orderStatus?.dodoCode;

    const hasActiveOrder = Boolean(
        activeOrderId &&
        orderStatus &&
        ['queued', 'preparing', 'ready'].includes(orderStateStatus || '') &&
        (isOrderReady || isOrderPreparing || queuePos !== undefined)
    );

    const apps = [
        {
            name: 'Order Bot',
            icon: 'fa-paper-plane',
            bg: 'linear-gradient(135deg, #0284c7, #0369a1)',
            action: () => navigate('/order'),
        },
        {
            name: 'Passport',
            icon: 'fa-id-card',
            bg: 'linear-gradient(135deg, #16a34a, #15803d)',
            action: () => navigate('/profile'),
        },
        {
            name: 'Pockets',
            icon: 'fa-box-archive',
            bg: 'linear-gradient(135deg, #f59e0b, #d97706)',
            action: () => navigate('/pockets'),
        },
        {
            name: 'Island Radio',
            icon: 'fa-radio',
            bg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            action: () => {
                window.dispatchEvent(new CustomEvent('chopaeng_open_jukebox'));
            },
        },
        {
            name: 'Voice Studio',
            icon: 'fa-comment-dots',
            bg: 'linear-gradient(135deg, #ec4899, #db2777)',
            action: () => {
                window.dispatchEvent(new CustomEvent('chopaeng_open_animalese_modal'));
            },
        },
        {
            name: 'Catalogue',
            icon: 'fa-boxes-stacked',
            bg: 'linear-gradient(135deg, #10b981, #059669)',
            action: () => navigate('/catalog'),
        },
        {
            name: 'Wishlist',
            icon: 'fa-heart',
            bg: 'linear-gradient(135deg, #ef4444, #dc2626)',
            action: () => navigate('/wishlist'),
        },
        {
            name: 'Destinations',
            icon: 'fa-map-location-dot',
            bg: 'linear-gradient(135deg, #06b6d4, #0891b2)',
            action: () => navigate('/islands'),
        },
        {
            name: 'Trip Planner',
            icon: 'fa-route',
            bg: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            action: () => navigate('/trip-planner'),
        },
    ];

    return (
        <div ref={phoneRef}>
            <style>{`
                .nookphone-screen-body {
                    -webkit-overflow-scrolling: touch;
                    overscroll-behavior: contain;
                    scrollbar-width: thin;
                }
            `}</style>

            {/* Floating NookPhone Button with Live Order Notification Badge */}
            <div
                className="position-fixed"
                style={{
                    bottom: '24px',
                    right: '24px',
                    zIndex: 1050,
                }}
            >
                <button
                    type="button"
                    onClick={togglePhone}
                    className="btn rounded-circle shadow-lg d-flex align-items-center justify-content-center p-0 transition-all position-relative"
                    style={{
                        width: '56px',
                        height: '56px',
                        backgroundColor: '#fffdfa',
                        border: `3px solid ${currentStyle.bezelBorder}`,
                        boxShadow: `0 10px 28px ${currentStyle.accentGlow}, 0 2px 8px rgba(0,0,0,0.12)`,
                        transform: isOpen ? 'scale(0.92)' : 'scale(1)',
                    }}
                    title={isOpen ? 'Close NookPhone' : 'Open NookPhone Apps'}
                    aria-label="Toggle NookPhone"
                >
                    <div
                        className="rounded-circle d-flex align-items-center justify-content-center text-white"
                        style={{
                            width: '44px',
                            height: '44px',
                            background: currentStyle.caseBg,
                        }}
                    >
                        <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-mobile-screen'}`} style={{ fontSize: '1.25rem' }} />
                    </div>

                    {/* Active Order Radar Beacon / Badge */}
                    {hasActiveOrder && location.pathname !== '/order' && (
                        <span
                            className="position-absolute top-0 start-100 translate-middle badge rounded-pill border border-white shadow-sm"
                            style={{
                                backgroundColor: isOrderReady ? '#22c55e' : isOrderPreparing ? '#f59e0b' : '#3b82f6',
                                fontSize: '0.68rem',
                                padding: '0.35rem 0.5rem',
                                animation: isOrderReady ? 'pulse 1.5s infinite' : 'none',
                            }}
                        >
                            {isOrderReady ? '✈️ DODO' : isOrderPreparing ? '⚡ PREP' : `#${queuePos || 1}`}
                        </span>
                    )}
                </button>
            </div>

            {/* NookPhone Modal / Slide-out UI — header (grill + status + title) stays put,
                only the body (tracker/apps/theme) scrolls. maxHeight is bounded to the
                viewport so there's always a scrollable region instead of the panel
                silently growing past the top of the screen. */}
            {isOpen && (
                <div
                    className="nookphone-container position-fixed shadow-2xl animate-up d-flex flex-column"
                    style={{
                        bottom: '90px',
                        right: '24px',
                        zIndex: 1055,
                        width: '340px',
                        maxWidth: 'calc(100vw - 32px)',
                        maxHeight: 'min(600px, calc(100dvh - 130px))',
                        background: currentStyle.caseBg,
                        borderRadius: '42px',
                        padding: '14px 12px 18px 12px',
                        border: `4px solid ${currentStyle.bezelBorder}`,
                        boxShadow: `0 24px 50px rgba(0,0,0,0.4), 0 0 24px ${currentStyle.accentGlow}`,
                    }}
                >
                    {/* Top Speaker Grill */}
                    <div className="d-flex align-items-center justify-content-center gap-2 mb-2 flex-shrink-0">
                        <div className="rounded-circle bg-dark opacity-40" style={{ width: '6px', height: '6px' }} />
                        <div className="rounded-pill bg-dark opacity-40" style={{ width: '42px', height: '4px' }} />
                    </div>

                    {/* Phone Bezel Inner Screen — flex column so the header can stay fixed
                        and only the body scrolls */}
                    <div
                        className="rounded-4 overflow-hidden position-relative d-flex flex-column flex-grow-1"
                        style={{
                            backgroundColor: currentStyle.screenBg,
                            color: currentStyle.isDark ? '#f8fafc' : '#1e293b',
                            minHeight: 0,
                            border: `1.5px solid ${currentStyle.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.06)',
                        }}
                    >
                        {/* Fixed header: clock, notification toggle, title */}
                        <div className="flex-shrink-0 p-3 pb-2">
                            <div
                                className="d-flex align-items-center justify-content-between pb-2 mb-2 border-bottom"
                                style={{ borderColor: currentStyle.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }}
                            >
                                <span className="d-flex align-items-center gap-2 fw-black" style={{ fontSize: '0.82rem' }}>
                                    <i className="fa-solid fa-leaf" style={{ color: currentStyle.accentColor }} />
                                    ChoPaeng Apps
                                </span>
                                <div className="d-flex align-items-center gap-2">
                                    <span className="fw-bold opacity-75" style={{ fontSize: '0.78rem' }}>
                                        {currentTimeStr || '12:00 PM'}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleToggleNotifications}
                                        className="btn btn-link p-0 border-0 text-decoration-none lh-1"
                                        style={{ color: notificationsOn ? '#22c55e' : (currentStyle.isDark ? '#94a3b8' : '#64748b') }}
                                        title={notificationsOn ? 'Flight Alerts Active' : 'Enable Flight Alerts'}
                                    >
                                        <i className={`fa-solid ${notificationsOn ? 'fa-bell' : 'fa-bell-slash'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Scrollable body */}
                        <div className="nookphone-screen-body flex-grow-1 overflow-y-auto px-3 pb-3" style={{ minHeight: 0 }}>
                            {/* ── LIVE ORDER TRACKER PILL ── */}
                            {hasActiveOrder && (
                                <div
                                    className="p-2.5 rounded-3 mb-3 border shadow-xs animate-up"
                                    style={{
                                        backgroundColor: isOrderReady
                                            ? (currentStyle.isDark ? 'rgba(34, 197, 94, 0.15)' : '#f0fdf4')
                                            : isOrderPreparing
                                                ? (currentStyle.isDark ? 'rgba(245, 158, 11, 0.15)' : '#fffbeb')
                                                : (currentStyle.isDark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff'),
                                        borderColor: isOrderReady
                                            ? '#86efac'
                                            : isOrderPreparing
                                                ? '#fcd34d'
                                                : '#93c5fd',
                                    }}
                                >
                                    <div className="d-flex align-items-center justify-content-between mb-1.5">
                                        <div className="d-flex align-items-center gap-1.5">
                                            <span
                                                className={`spinner-grow spinner-grow-sm ${isOrderReady ? 'text-success' : isOrderPreparing ? 'text-warning' : 'text-primary'
                                                    }`}
                                                role="status"
                                                style={{ width: '10px', height: '10px' }}
                                            />
                                            <span className="fw-black x-small text-uppercase tracking-wider">
                                                {isOrderReady ? '✈️ Flight Ready' : isOrderPreparing ? '🔨 Preparing Items' : `⏳ Queue #${queuePos || 1}`}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleAppClick(() => navigate('/order'))}
                                            className="btn btn-xs btn-outline-secondary py-0 px-2 rounded-pill x-small fw-bold"
                                            style={{ fontSize: '0.68rem' }}
                                        >
                                            View Radar <i className="fa-solid fa-arrow-right ms-1" />
                                        </button>
                                    </div>

                                    {dodoCode ? (
                                        <div className="d-flex align-items-center justify-content-between bg-white bg-opacity-75 p-1.5 px-2 rounded-2 border">
                                            <span className="fw-black text-success font-monospace" style={{ fontSize: '0.95rem', letterSpacing: '1px' }}>
                                                DODO: {dodoCode}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleCopyDodo(dodoCode)}
                                                className="btn btn-xs btn-success rounded-pill px-2 py-0.5 fw-bold"
                                                style={{ fontSize: '0.7rem' }}
                                            >
                                                <i className={`fa-solid ${dodoCopied ? 'fa-check' : 'fa-copy'} me-1`} />
                                                {dodoCopied ? 'Copied' : 'Copy'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="x-small text-muted fw-bold">
                                            {isOrderPreparing
                                                ? 'Generating Dodo flight code now...'
                                                : `Estimated flight wait: ~${(queuePos || 1) * 2} mins`}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Apps Grid (3x3) */}
                            <div className="row g-2 mb-3">
                                {apps.map((app, idx) => (
                                    <div className="col-4 text-center" key={idx}>
                                        <button
                                            type="button"
                                            onClick={() => handleAppClick(app.action)}
                                            className="btn p-0 border-0 d-flex flex-column align-items-center gap-1 w-100 transition-all hover-scale"
                                        >
                                            <div
                                                className="rounded-4 d-flex align-items-center justify-content-center text-white shadow-sm"
                                                style={{
                                                    width: '50px',
                                                    height: '50px',
                                                    background: app.bg,
                                                    fontSize: '1.2rem',
                                                }}
                                            >
                                                <i className={`fa-solid ${app.icon}`} />
                                            </div>
                                            <span
                                                className="fw-bold text-truncate"
                                                style={{
                                                    fontSize: '0.68rem',
                                                    maxWidth: '68px',
                                                    color: currentStyle.isDark ? '#e2e8f0' : '#334155',
                                                }}
                                            >
                                                {app.name}
                                            </span>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Case Skin — flattened to a plain row under a divider instead of
                                another nested card, so it reads as a footer strip rather than
                                competing with the apps grid for attention */}
                            <div
                                className="pt-2.5 border-top"
                                style={{ borderColor: currentStyle.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}
                            >
                                <div className="d-flex align-items-center justify-content-between mb-1.5">
                                    <span className="fw-black text-uppercase opacity-60" style={{ fontSize: '0.62rem' }}>
                                        Case Skin
                                    </span>
                                    <span className="fw-bold opacity-75" style={{ fontSize: '0.68rem' }}>
                                        {THEME_OPTIONS.find((t) => t.id === currentTheme)?.name || 'Classic'}
                                    </span>
                                </div>
                                <div className="d-flex gap-1.5">
                                    {THEME_OPTIONS.map((opt) => {
                                        const isSelected = currentTheme === opt.id;
                                        return (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => {
                                                    playChimeClick();
                                                    setStoredTheme(opt.id);
                                                    setCurrentTheme(opt.id);
                                                }}
                                                className={`btn btn-xs rounded-circle p-0 d-flex align-items-center justify-content-center transition-all ${isSelected ? 'shadow-sm scale-110' : 'opacity-60'
                                                    }`}
                                                style={{
                                                    width: '26px',
                                                    height: '26px',
                                                    backgroundColor: opt.accentColor,
                                                    color: '#ffffff',
                                                    border: isSelected ? '2.5px solid #ffffff' : 'none',
                                                    boxShadow: isSelected ? `0 0 0 2px ${opt.accentColor}` : 'none',
                                                }}
                                                title={opt.name}
                                            >
                                                <i className={`fa-solid ${opt.icon}`} style={{ fontSize: '0.6rem' }} />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NookPhoneDock;   